// Textes du formulaire de devis (source : contenus/devis.md, brouillon à valider).
// Partagés entre le rendu (DevisForm.astro) et le script client (src/scripts/devis-form.ts).

/**
 * Adresse de contact affichée dans les messages d'erreur.
 * À activer quand la boîte est testée de bout en bout (envoi et réception) :
 * tant qu'elle vaut '', aucune adresse n'est publiée.
 */
export const CONTACT_EMAIL = 'contact@atousy.com';

/** Messages d'erreur des champs : mot pour mot ceux de server/devis.js (à modifier aux deux endroits). */
export const FIELD_MSG = {
  type: 'Choisissez le type de projet : création ou refonte.',
  activiteMissing: 'Indiquez votre activité.',
  activiteLength: 'Votre activité doit faire entre 2 et 120 caractères.',
  zoneMissing: "Indiquez votre zone d'intervention (par exemple votre commune).",
  zoneLength: "La zone d'intervention doit faire entre 2 et 120 caractères.",
  siteInvalid: "L'adresse du site n'est pas valide (exemple : www.votre-site.fr).",
  siteLength: "L'adresse du site ne doit pas dépasser 300 caractères.",
  besoinMissing: 'Décrivez votre besoin en quelques mots.',
  besoinLength: 'Votre message doit faire entre 10 et 2000 caractères.',
  nomMissing: 'Indiquez votre nom.',
  nomLength: 'Votre nom doit faire entre 2 et 100 caractères.',
  nomLine: 'Votre nom doit tenir sur une seule ligne.',
  emailMissing: 'Indiquez votre adresse e-mail.',
  emailInvalid: "L'adresse e-mail n'est pas valide.",
  emailLength: "L'adresse e-mail ne doit pas dépasser 200 caractères.",
  telephone: 'Le numéro de téléphone doit comporter 6 à 25 caractères : chiffres, espaces et + . ( ) - uniquement.',
} as const;

/** `contact` : phrase ajoutée seulement si CONTACT_EMAIL est renseignée ({email} y est remplacé). */
export type Notice = { title?: string; text: string; contact?: string };

/** Messages d'état de l'envoi. */
export const NOTICE = {
  sendingButton: 'Envoi en cours…',
  sending: 'Envoi de votre demande, merci de patienter.',
  summary: 'Certains champs sont à corriger. Vos réponses ont été conservées.',
  captcha: {
    text: "La vérification anti-spam n'a pas abouti. Refaites-la, puis envoyez à nouveau votre demande.",
  },
  // À valider : textes ajoutés à l'intégration (cas non couverts par contenus/devis.md).
  captchaPending: {
    text: "La vérification anti-spam n'est pas encore terminée. Patientez un instant ou terminez-la, puis envoyez votre demande.",
  },
  captchaUnavailable: {
    text: "La vérification anti-spam n'a pas pu se charger. Vérifiez votre connexion ou votre bloqueur de contenus, puis rechargez la page : vos réponses seront conservées.",
  },
  spam: {
    text: "Votre demande n'a pas pu être envoyée. Patientez quelques secondes, puis réessayez.",
  },
  tooLarge: {
    text: 'Votre message est trop long. Raccourcissez-le, puis réessayez.',
  },
  technical: {
    title: "Votre demande n'est pas partie.",
    text: "Un problème technique a empêché l'envoi. Vos réponses sont conservées : réessayez dans un instant.",
    contact: 'Si le problème continue, écrivez-nous à {email}.',
  },
  offline: {
    title: "Votre demande n'est pas partie.",
    text: 'Connexion impossible. Vérifiez votre connexion Internet, puis réessayez.',
  },
  // À valider : délai de 15 s dépassé, l'envoi n'est ni confirmé ni infirmé.
  timeout: {
    title: "Pas de confirmation d'envoi.",
    text: "Le serveur n'a pas répondu à temps : nous ne pouvons pas confirmer que votre demande est partie. Vos réponses sont conservées, vous pouvez réessayer.",
    contact: 'Si le problème continue, écrivez-nous à {email}.',
  },
  notConfigured: {
    title: "Le formulaire n'est pas encore en service.",
    text: "Votre demande n'a pas été envoyée. Vos réponses restent sur cette page.",
    contact: 'Écrivez-nous directement à {email}.',
  },
} satisfies Record<string, string | Notice>;

export const SUCCESS = {
  title: 'Merci, votre demande est envoyée.',
  text: 'Nous revenons vers vous par e-mail. Pensez à vérifier vos courriers indésirables si vous ne voyez rien arriver.',
};

/** Sans JavaScript : la vérification anti-spam ne peut pas s'afficher. */
export const NOJS = {
  text: "Ce formulaire a besoin de JavaScript pour sa vérification anti-spam.",
  contact: 'Vous pouvez aussi nous écrire à {email}.',
};
