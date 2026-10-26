// Formulaire de devis : validation, envoi en arrière-plan, états, brouillon de session.
// Contrat serveur : server/devis.js (POST /api/devis, réponses JSON).
// Règle absolue : le message de succès ne s'affiche qu'après une réponse 200 {"ok":true}.
// En cas d'erreur, rien n'est effacé : le formulaire n'est jamais réinitialisé.
import { CONTACT_EMAIL, NOTICE, type Notice } from '../components/devis/messages';
import { FIELD_NAMES, isFieldName, validateAll, validateField, type Errors, type FieldName, type Values } from '../components/devis/validation';

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string | null | undefined;
  reset: (id?: string) => void;
  getResponse: (id?: string) => string | undefined;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    atousyTurnstileReady?: () => void;
  }
}

const DRAFT_KEY = 'atousy-devis-draft';
const TIMEOUT_MS = 15_000;
// Le serveur refuse un envoi moins de 3 s après le chargement (anti-robot) : on attend au besoin.
const MIN_FILL_MS = 3_300;
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=atousyTurnstileReady';

type Outcome =
  | { kind: 'success' }
  | { kind: 'validation'; fields: Errors }
  | { kind: 'captcha' | 'spam' | 'tooLarge' | 'notConfigured' | 'technical' | 'offline' | 'timeout' };

const root = document.querySelector<HTMLElement>('[data-devis]');
const form = root?.querySelector<HTMLFormElement>('[data-devis-form]');
if (root && form) setup(root, form);

function setup(root: HTMLElement, form: HTMLFormElement) {
  form.noValidate = true; // nos messages remplacent les bulles natives
  const startedAt = Date.now();
  const startedInput = form.querySelector<HTMLInputElement>('[data-started]');
  if (startedInput) startedInput.value = String(startedAt);

  const summaryRegion = root.querySelector<HTMLElement>('[data-summary]');
  const alertRegion = root.querySelector<HTMLElement>('[data-form-alert]');
  const status = root.querySelector<HTMLElement>('[data-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const submitLabel = submit?.querySelector<HTMLElement>('[data-submit-label]');
  const defaultLabel = submitLabel?.textContent ?? '';
  const success = root.querySelector<HTMLElement>('[data-success]');
  const successTitle = root.querySelector<HTMLElement>('[data-success-title]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const errors: Errors = {};
  let sending = false;
  let done = false;
  let alertKind = '';

  // ---------------------------------------------------------------------------
  // Champs
  // ---------------------------------------------------------------------------

  const radios = () => Array.from(form.querySelectorAll<HTMLInputElement>('input[name="type"]'));
  const control = (name: Exclude<FieldName, 'type'>) =>
    form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);
  const controlsOf = (name: FieldName): HTMLElement[] => {
    if (name === 'type') return radios();
    const el = control(name);
    return el ? [el] : [];
  };
  const wrapOf = (name: FieldName) => form.querySelector<HTMLElement>(`[data-field="${name}"]`);
  const focusTargetOf = (name: FieldName): HTMLElement | null => {
    if (name === 'type') return radios().find((r) => r.checked) ?? radios()[0] ?? null;
    return control(name);
  };

  function readValues(): Values {
    const values = {} as Values;
    for (const name of FIELD_NAMES) {
      if (name === 'type') values.type = radios().find((r) => r.checked)?.value ?? '';
      else values[name] = control(name)?.value ?? '';
    }
    return values;
  }

  function setError(name: FieldName, message: string | null) {
    const el = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (el) el.textContent = message ?? '';
    for (const c of controlsOf(name)) {
      if (message) c.setAttribute('aria-invalid', 'true');
      else c.removeAttribute('aria-invalid');
    }
    wrapOf(name)?.classList.toggle('is-invalid', Boolean(message));
    if (message) errors[name] = message;
    else {
      delete errors[name];
      removeSummaryItem(name);
    }
  }

  function focusField(name: FieldName) {
    const target = focusTargetOf(name);
    if (!target) return;
    target.focus({ preventScroll: true });
    // On fait défiler le bloc entier pour garder le libellé et le message visibles.
    (wrapOf(name) ?? target).scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // Résumé des erreurs (en haut) et message d'envoi (près du bouton)
  // ---------------------------------------------------------------------------

  function showSummary() {
    if (!summaryRegion) return;
    const names = FIELD_NAMES.filter((n) => errors[n]);
    if (!names.length) {
      summaryRegion.replaceChildren();
      return;
    }
    const box = document.createElement('div');
    box.className = 'dv-summary';
    box.tabIndex = -1;
    const title = document.createElement('p');
    title.className = 'dv-summary__title';
    title.textContent = NOTICE.summary;
    const list = document.createElement('ul');
    list.className = 'dv-summary__list';
    for (const name of names) {
      const li = document.createElement('li');
      li.dataset.summaryFor = name;
      const a = document.createElement('a');
      const target = focusTargetOf(name);
      a.href = `#${target?.id ?? ''}`;
      a.textContent = `${wrapOf(name)?.dataset.label ?? name} : ${errors[name]}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        focusField(name);
      });
      li.append(a);
      list.append(li);
    }
    box.append(title, list);
    summaryRegion.replaceChildren(box);
  }

  // Un champ corrigé disparaît du résumé ; plus rien à corriger : le résumé s'efface.
  function removeSummaryItem(name: FieldName) {
    if (!summaryRegion) return;
    summaryRegion.querySelector(`[data-summary-for="${name}"]`)?.remove();
    if (!summaryRegion.querySelector('[data-summary-for]')) summaryRegion.replaceChildren();
  }

  function showAlert(kind: string, notice: Notice, tone: 'error' | 'info' = 'error') {
    if (!alertRegion) return;
    alertKind = kind;
    const box = document.createElement('div');
    box.className = `dv-alert dv-alert--${tone}`;
    box.dataset.alert = kind;
    if (notice.title) {
      const t = document.createElement('p');
      t.className = 'dv-alert__title';
      t.textContent = notice.title;
      box.append(t);
    }
    const p = document.createElement('p');
    p.textContent = notice.text;
    box.append(p);
    if (notice.contact && CONTACT_EMAIL) {
      const [before, after = ''] = notice.contact.split('{email}');
      const c = document.createElement('p');
      const a = document.createElement('a');
      a.href = `mailto:${CONTACT_EMAIL}`;
      a.textContent = CONTACT_EMAIL;
      c.append(before, a, after);
      box.append(c);
    }
    alertRegion.replaceChildren(box);
    box.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  function clearAlert() {
    alertKind = '';
    alertRegion?.replaceChildren();
  }

  // ---------------------------------------------------------------------------
  // État d'envoi. Le bouton est désactivé via aria-disabled (et non `disabled`)
  // pour garder le focus clavier dessus : après une erreur, on peut réessayer tout de suite.
  // ---------------------------------------------------------------------------

  function setSending(on: boolean) {
    sending = on;
    form.toggleAttribute('data-sending', on);
    form.setAttribute('aria-busy', String(on));
    if (submit) {
      if (on) submit.setAttribute('aria-disabled', 'true');
      else submit.removeAttribute('aria-disabled');
    }
    if (submitLabel) submitLabel.textContent = on ? NOTICE.sendingButton : defaultLabel;
    if (status) status.textContent = on ? NOTICE.sending : '';
  }

  // ---------------------------------------------------------------------------
  // Brouillon (sessionStorage) : survit à un rechargement, effacé après un succès.
  // ---------------------------------------------------------------------------

  let saveTimer = 0;
  function saveDraft() {
    window.clearTimeout(saveTimer);
    if (done) return;
    try {
      const values = readValues();
      if (Object.values(values).some((v) => v.trim() !== '')) {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, values }));
      } else {
        sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      /* stockage indisponible : pas de brouillon, le formulaire fonctionne quand même */
    }
  }
  const scheduleSave = () => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveDraft, 250);
  };

  function restoreDraft() {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const values = (JSON.parse(raw) as { values?: Record<string, unknown> })?.values;
      if (!values || typeof values !== 'object') return;
      for (const name of FIELD_NAMES) {
        const value = values[name];
        if (typeof value !== 'string') continue;
        if (name === 'type') radios().forEach((r) => (r.checked = r.value === value));
        else {
          const el = control(name);
          if (el) el.value = value;
        }
      }
    } catch {
      /* brouillon illisible ou stockage indisponible : on l'ignore */
    }
  }

  function clearDraft() {
    window.clearTimeout(saveTimer);
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* rien à faire */
    }
  }

  // ---------------------------------------------------------------------------
  // Type de projet : la refonte met en avant l'adresse du site actuel.
  // ---------------------------------------------------------------------------

  function syncType() {
    const type = readValues().type;
    if (type) form.dataset.type = type;
    else delete form.dataset.type;
  }

  function updateCounters() {
    form.querySelectorAll<HTMLElement>('[data-counter-for]').forEach((el) => {
      const name = el.dataset.counterFor ?? '';
      if (isFieldName(name) && name !== 'type') el.textContent = String(control(name)?.value.length ?? 0);
    });
  }

  restoreDraft();
  const preset = new URLSearchParams(window.location.search).get('type');
  if ((preset === 'creation' || preset === 'refonte') && !readValues().type) {
    radios().forEach((r) => (r.checked = r.value === preset));
  }
  syncType();
  updateCounters();

  // ---------------------------------------------------------------------------
  // Turnstile (rendu explicite, script chargé uniquement sur cette page)
  // ---------------------------------------------------------------------------

  const slot = form.querySelector<HTMLElement>('[data-turnstile]');
  const siteKey = slot?.dataset.sitekey ?? '';
  let widgetId: string | undefined;
  let turnstileFailed = false;

  function renderTurnstile() {
    if (!slot || !window.turnstile || widgetId !== undefined) return;
    try {
      widgetId =
        window.turnstile.render(slot, {
          sitekey: siteKey,
          action: 'devis',
          language: 'fr',
          theme: 'light',
          size: 'flexible',
          callback: () => {
            if (alertKind === 'captchaPending' || alertKind === 'captchaUnavailable') clearAlert();
          },
        }) ?? undefined;
    } catch {
      turnstileFailed = true;
    }
  }

  if (siteKey && slot) {
    if (window.turnstile) renderTurnstile();
    else {
      window.atousyTurnstileReady = renderTurnstile;
      const script = document.createElement('script');
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener('error', () => {
        turnstileFailed = true;
      });
      document.head.append(script);
    }
  }

  const turnstileToken = () => {
    try {
      return (widgetId !== undefined && window.turnstile?.getResponse(widgetId)) || '';
    } catch {
      return '';
    }
  };
  const resetTurnstile = () => {
    try {
      if (widgetId !== undefined) window.turnstile?.reset(widgetId);
    } catch {
      /* widget déjà retiré */
    }
  };

  // ---------------------------------------------------------------------------
  // Envoi
  // ---------------------------------------------------------------------------

  async function send(body: FormData): Promise<Outcome> {
    if (navigator.onLine === false) return { kind: 'offline' };
    const controller = new AbortController();
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);
    try {
      const res = await fetch(form.getAttribute('action') || '/api/devis', {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      });
      let data: { ok?: unknown; error?: unknown; fields?: unknown } | null = null;
      try {
        data = JSON.parse(await res.text());
      } catch {
        data = null; // corps illisible : jamais considéré comme un succès
      }
      return classify(res.status, data);
    } catch {
      return { kind: timedOut ? 'timeout' : 'offline' };
    } finally {
      window.clearTimeout(timer);
    }
  }

  function classify(status: number, data: { ok?: unknown; error?: unknown; fields?: unknown } | null): Outcome {
    // Seul cas de succès : statut 200 ET corps {"ok":true}.
    if (status === 200 && data?.ok === true) return { kind: 'success' };
    const error = typeof data?.error === 'string' ? data.error : '';
    if (error === 'validation' && data?.fields && typeof data.fields === 'object') {
      const fields: Errors = {};
      for (const [name, message] of Object.entries(data.fields as Record<string, unknown>)) {
        if (isFieldName(name) && typeof message === 'string' && message) fields[name] = message;
      }
      if (Object.keys(fields).length) return { kind: 'validation', fields };
      return { kind: 'technical' };
    }
    if (error === 'captcha') return { kind: 'captcha' };
    if (error === 'spam' || status === 422) return { kind: 'spam' };
    if (error === 'too_large' || status === 413) return { kind: 'tooLarge' };
    if (error === 'not_configured' || status === 503) return { kind: 'notConfigured' };
    return { kind: 'technical' };
  }

  function showFieldErrors(found: Errors) {
    for (const name of FIELD_NAMES) setError(name, found[name] ?? null);
    showSummary();
    const first = FIELD_NAMES.find((n) => found[n]);
    if (first) focusField(first);
  }

  function showSuccess() {
    done = true;
    clearDraft();
    summaryRegion?.replaceChildren();
    clearAlert();
    form.hidden = true;
    form.reset();
    if (success) {
      success.hidden = false;
      (successTitle ?? success).focus({ preventScroll: true });
      success.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || done) return;
    saveDraft();
    clearAlert();

    const found = validateAll(readValues());
    if (Object.keys(found).length) {
      showFieldErrors(found);
      return;
    }
    showFieldErrors({});

    if (siteKey) {
      if (turnstileFailed || !window.turnstile) {
        showAlert(turnstileFailed ? 'captchaUnavailable' : 'captchaPending', turnstileFailed ? NOTICE.captchaUnavailable : NOTICE.captchaPending);
        return;
      }
      if (!turnstileToken()) {
        showAlert('captchaPending', NOTICE.captchaPending);
        return;
      }
    }

    setSending(true);
    let outcome: Outcome;
    try {
      const wait = startedAt + MIN_FILL_MS - Date.now();
      if (wait > 0) await new Promise((r) => window.setTimeout(r, wait));
      const body = new FormData(form);
      const market = document.documentElement.dataset.market;
      body.set('market', market === 'ch' ? 'ch' : 'fr');
      body.set('started', String(startedAt));
      if (siteKey) body.set('cf-turnstile-response', turnstileToken());
      outcome = await send(body);
    } catch {
      outcome = { kind: 'technical' };
    }
    setSending(false);

    switch (outcome.kind) {
      case 'success':
        showSuccess();
        return;
      case 'validation':
        // Le jeton Turnstile n'a pas été consommé : pas de réinitialisation.
        showFieldErrors(outcome.fields);
        return;
      case 'spam':
        showAlert('spam', NOTICE.spam);
        return;
      case 'tooLarge':
        showAlert('tooLarge', NOTICE.tooLarge);
        return;
      case 'captcha':
        resetTurnstile();
        showAlert('captcha', NOTICE.captcha);
        return;
      case 'notConfigured':
        resetTurnstile();
        showAlert('notConfigured', NOTICE.notConfigured, 'info');
        return;
      case 'offline':
        resetTurnstile();
        showAlert('offline', NOTICE.offline);
        return;
      case 'timeout':
        resetTurnstile();
        showAlert('timeout', NOTICE.timeout);
        return;
      default:
        resetTurnstile();
        showAlert('technical', NOTICE.technical);
    }
  });

  // Validation au fil de la saisie : à la sortie d'un champ rempli, et pendant la
  // correction d'un champ signalé (le message disparaît dès que la valeur est bonne).
  form.addEventListener('focusout', (event) => {
    const name = (event.target as HTMLInputElement | null)?.name ?? '';
    if (!isFieldName(name) || name === 'type') return;
    const values = readValues();
    if (values[name].trim() || errors[name]) setError(name, validateField(name, values));
  });

  form.addEventListener('input', (event) => {
    const name = (event.target as HTMLInputElement | null)?.name ?? '';
    if (isFieldName(name) && errors[name]) setError(name, validateField(name, readValues()));
    updateCounters();
    scheduleSave();
  });

  form.addEventListener('change', (event) => {
    const name = (event.target as HTMLInputElement | null)?.name ?? '';
    if (name === 'type') {
      syncType();
      if (errors.type) setError('type', validateField('type', readValues()));
    }
    scheduleSave();
  });

  window.addEventListener('pagehide', saveDraft);
}
