// POST /api/devis : réception du formulaire de demande de devis.
// Route volontairement mince : toute la logique (validation, Turnstile,
// envoi de l'e-mail) vit dans server/devis.js, hors de functions/.

import { handleDevis } from '../../server/devis.js';

/** @param {{ request: Request, env: Record<string, string | undefined> }} context */
export function onRequest(context) {
  return handleDevis(context.request, context.env);
}
