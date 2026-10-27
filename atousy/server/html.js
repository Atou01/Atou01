// Réponse lisible pour un envoi du formulaire SANS JavaScript (navigation classique).
// Le script de la page Devis demande du JSON (Accept: application/json) ; un navigateur
// qui poste le formulaire directement attend une page. Le contenu dépend uniquement du
// résultat réel du traitement : la confirmation n'apparaît qu'après un envoi accepté.

/**
 * Le client attend-il une page HTML plutôt que du JSON ?
 * @param {Request} request
 */
export function wantsHtml(request) {
  if (request.headers.get('sec-fetch-mode') === 'navigate') return true;
  const accept = (request.headers.get('accept') ?? '').toLowerCase();
  return accept.includes('text/html') && !accept.includes('application/json');
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const BACK = 'Revenez au formulaire avec le bouton « Retour » de votre navigateur : vos réponses y sont normalement conservées.';

/** @type {Record<string, { title: string, text: string }>} */
const MESSAGES = {
  validation: { title: 'Quelques informations sont à compléter.', text: BACK },
  captcha: {
    title: "La vérification anti-spam n’a pas pu se faire.",
    text: `Elle a besoin de JavaScript : activez-le, puis renvoyez le formulaire. ${BACK}`,
  },
  spam: {
    title: "L’envoi a été bloqué par la protection anti-spam.",
    text: `Patientez quelques secondes avant d’envoyer, puis réessayez. ${BACK}`,
  },
  not_configured: {
    title: "Le formulaire n’est pas encore raccordé.",
    text: "Votre demande n’a pas été envoyée. Merci de réessayer plus tard.",
  },
  delivery_failed: {
    title: "Votre demande n’a pas pu être envoyée.",
    text: `Un problème technique a empêché l’envoi. Réessayez dans quelques minutes. ${BACK}`,
  },
};
const GENERIC = { title: "Votre demande n’a pas pu être envoyée.", text: BACK };

// Les règles de public/_headers ne s'appliquent pas aux réponses construites par une
// fonction : cette page porte donc ses propres en-têtes. Elle n'a ni script, ni image,
// ni police externe : tout le reste est interdit.
const PAGE_HEADERS = {
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Transforme la réponse JSON du traitement en page HTML, même code HTTP.
 * @param {Response} jsonResponse
 */
export async function toHtmlResponse(jsonResponse) {
  let body = {};
  try {
    body = await jsonResponse.clone().json();
  } catch {
    /* corps illisible : message générique */
  }

  let title;
  let text;
  let list = '';
  if (body.ok === true) {
    title = 'Demande envoyée. Merci !';
    // Même texte que la confirmation avec JavaScript (src/components/devis/messages.ts) : aucun délai promis.
    text =
      'Votre demande de devis a bien été transmise. Nous revenons vers vous par e-mail. Pensez à vérifier vos courriers indésirables si vous ne voyez rien arriver.';
  } else {
    ({ title, text } = MESSAGES[body.error] ?? GENERIC);
    if (body.error === 'validation' && body.fields && typeof body.fields === 'object') {
      list = `<ul>${Object.values(body.fields)
        .map((m) => `<li>${escapeHtml(m)}</li>`)
        .join('')}</ul>`;
    }
  }

  const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)} | Atousy</title>
<style>
body{margin:0;background:#f8f4ee;color:#0f2329;font:17px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:40rem;margin:0 auto;padding:4rem 1.25rem}
.logo{font-weight:800;font-size:1.6rem;letter-spacing:-.04em;text-decoration:none;color:#0f2329}
h1{margin:2.5rem 0 1rem;font-size:2rem;line-height:1.1;letter-spacing:-.03em}
p,li{color:#46555c}
ul{padding-left:1.2rem}
.actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}
.btn{display:inline-block;padding:.8rem 1.3rem;border:1.5px solid #0f2329;border-radius:3px;color:#0f2329;font-weight:600;text-decoration:none}
.btn--main{background:#0f2329;color:#fffdfa}
</style>
</head>
<body>
<main>
<a class="logo" href="/">atousy</a>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(text)}</p>
${list}
<div class="actions">
${body.ok === true ? '<a class="btn btn--main" href="/">Retour à l\'accueil</a>' : '<a class="btn btn--main" href="/devis/">Revenir au formulaire</a><a class="btn" href="/">Accueil</a>'}
</div>
</main>
</body>
</html>`;

  const headers = new Headers(jsonResponse.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  for (const [name, value] of Object.entries(PAGE_HEADERS)) headers.set(name, value);
  return new Response(page, { status: jsonResponse.status, headers });
}
