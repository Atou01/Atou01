// Plafond quotidien d'envois du formulaire de devis (facultatif).
// Actif seulement si un espace de noms KV est lié au projet Pages sous le nom DEVIS_COUNTER
// (Settings > Bindings). Le compteur est approximatif — KV n'est cohérent qu'à quelques
// dizaines de secondes près — : il borne le volume en cas d'abus, il ne compte pas au
// message près. Il n'est lu qu'après un jeton Turnstile valide, pour que des requêtes
// sans jeton ne consomment pas le quota KV.

export const DEFAULT_DAILY_LIMIT = 50;

/** DEVIS_DAILY_LIMIT (entier de 1 à 99999), sinon la valeur par défaut. */
export function dailyLimit(env) {
  const raw = String(env.DEVIS_DAILY_LIMIT ?? '').trim();
  return /^\d{1,5}$/.test(raw) && Number(raw) > 0 ? Number(raw) : DEFAULT_DAILY_LIMIT;
}

/**
 * Réserve une place dans le plafond du jour (UTC).
 * Sans KV lié : toujours accepté. KV en erreur : accepté aussi (une vraie demande ne doit
 * pas être perdue pour un compteur), l'incident est journalisé.
 * @param {{ get: (k: string) => Promise<string | null>, put: (k: string, v: string, o?: object) => Promise<void> } | undefined} kv
 * @param {Record<string, unknown>} env
 * @param {number} now horodatage en millisecondes
 * @param {Pick<Console, 'warn'>} logger
 * @returns {Promise<{ ok: true } | { ok: false, limit: number }>}
 */
export async function takeDailySlot(kv, env, now, logger) {
  if (!kv || typeof kv.get !== 'function' || typeof kv.put !== 'function') return { ok: true };
  const limit = dailyLimit(env);
  const key = `devis:${new Date(now).toISOString().slice(0, 10)}`;
  try {
    const count = Number.parseInt((await kv.get(key)) ?? '0', 10) || 0;
    if (count >= limit) return { ok: false, limit };
    // Gardé deux jours : la clé du jour précédent disparaît d'elle-même.
    await kv.put(key, String(count + 1), { expirationTtl: 2 * 86400 });
  } catch {
    logger.warn('[devis] daily cap unavailable: kv error');
  }
  return { ok: true };
}
