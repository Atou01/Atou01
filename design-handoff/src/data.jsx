/* ============================================================
   DropForge Inc. — mock data
   ============================================================ */

const AGENTS = [
  // C-SUITE
  { id: 'victor',  name: 'Victor Hale',     emoji: '🎩', role: 'CEO',                          tier: 'C-Suite',  team: 'C-Suite',  llm: 'Opus 4.7', mantra: 'Je décide en 5min, on exécute en 24h', status: 'active',  task: 'Synthèse daily à 18:00', skin: 'red'    },
  { id: 'nora',    name: 'Nora Chen',       emoji: '💻', role: 'CTO',                          tier: 'C-Suite',  team: 'C-Suite',  llm: 'Sonnet',   mantra: 'PageSpeed 95+ ou je refactor',          status: 'active',  task: 'Audit Core Web Vitals',  skin: 'blue'   },
  { id: 'lina',    name: 'Lina Costa',      emoji: '📢', role: 'CMO',                          tier: 'C-Suite',  team: 'C-Suite',  llm: 'Opus 4.7', mantra: 'Le brief tient sur un post-it ou il tient pas', status: 'active', task: 'Brief Q3 campagne',     skin: 'pink'   },
  { id: 'marc',    name: 'Marc Devlin',     emoji: '⚙️', role: 'COO',                          tier: 'C-Suite',  team: 'C-Suite',  llm: 'Sonnet',   mantra: 'Process > Héros',                       status: 'active',  task: 'Revue SOP fulfillment',  skin: 'gray'   },
  { id: 'theo',    name: 'Théo Roux',       emoji: '💰', role: 'CFO + Budget Gatekeeper',      tier: 'C-Suite',  team: 'C-Suite',  llm: 'Sonnet',   mantra: 'Je freeze avant que ça saigne',         status: 'active',  task: 'Revue burn IA mensuel',  skin: 'gold'   },
  { id: 'iris',    name: 'Iris Vega',       emoji: '🧠', role: 'Chief AI Officer (Router)',    tier: 'C-Suite',  team: 'C-Suite',  llm: 'Haiku',    mantra: 'Le bon modèle au bon prix au bon moment', status: 'active',  task: 'Routing 1.2K req/h',     skin: 'violet' },

  // MANAGERS
  { id: 'sam',     name: 'Sam Kovacs',      emoji: '🔍', role: 'Head of Product Research',     tier: 'Manager', team: 'Research', llm: 'Sonnet',  mantra: 'Trouve, valide, scale ou tue',          status: 'active',  task: 'Sprint produit #14',     skin: 'green'  },
  { id: 'elena',   name: 'Elena Park',      emoji: '🎨', role: 'Head of Content & Brand',      tier: 'Manager', team: 'Content',  llm: 'Sonnet',  mantra: 'La cohérence brand bat la créativité solo', status: 'active', task: 'Calendar éditorial',     skin: 'pink'   },
  { id: 'ravi',    name: 'Ravi Mehta',      emoji: '📈', role: 'Head of Growth & Ads',         tier: 'Manager', team: 'Growth',   llm: 'Sonnet',  mantra: 'Scale ce qui marche, kill le reste',    status: 'active',  task: 'Allocation budget ads',  skin: 'orange' },

  // STRATEGIC
  { id: 'aria',    name: 'Aria Volkov',     emoji: '🌍', role: 'Strategic Niche Analyst',      tier: 'Specialist', team: 'Strategic', llm: 'Opus 4.7', mantra: 'Je vois les marchés avant qu\'ils existent', status: 'idle',   task: 'Cartographie niches Q3', skin: 'teal'   },
  { id: 'maya',    name: 'Maya Lindgren',   emoji: '🎨', role: 'Brand Architect',              tier: 'Specialist', team: 'Strategic', llm: 'Opus 4.7', mantra: 'Une marque mémorable se décide en 2h, pas 2 mois', status: 'active', task: 'Naming brand #07',  skin: 'pink'   },

  // RESEARCH
  { id: 'mia',     name: 'Mia Tanaka',      emoji: '🕵️', role: 'Trend Scout TikTok/IG',       tier: 'Specialist', team: 'Research', llm: 'Haiku',     mantra: 'Je trouve les virals 48h avant tout le monde', status: 'active', task: 'Scan #ttshop hashtags', skin: 'violet' },
  { id: 'diego',   name: 'Diego Silva',     emoji: '📦', role: 'Supplier Hunter',              tier: 'Specialist', team: 'Research', llm: 'Sonnet',    mantra: 'Je connais 1688 mieux qu\'AliExpress',  status: 'active',  task: 'Sourcing 1688 — 12 lots', skin: 'green'  },
  { id: 'yuki',    name: 'Yuki Brand',      emoji: '✅', role: 'Product Validator',            tier: 'Specialist', team: 'Research', llm: 'Sonnet',    mantra: 'Je tue 90% des produits. Les 10% impriment.', status: 'active', task: 'Test produit #142',    skin: 'red'    },

  // CONTENT
  { id: 'lea',     name: 'Léa Moreau',      emoji: '✍️', role: 'SEO Copywriter',               tier: 'Specialist', team: 'Content', llm: 'Sonnet',    mantra: 'Chaque mot rank ou il dégage',          status: 'active',  task: 'Fiche produit "Halo Lamp"', skin: 'blue'   },
  { id: 'kai',     name: 'Kai Foster',      emoji: '📸', role: 'Visual Designer',              tier: 'Specialist', team: 'Content', llm: 'Sonnet',    mantra: '5 angles, 3 vibes, 1 winner',           status: 'idle',    task: 'Pack visuels SKU-018',  skin: 'orange' },
  { id: 'tom',     name: 'Tom Nakamura',    emoji: '🎬', role: 'Video Producer (UGC)',         tier: 'Specialist', team: 'Content', llm: 'Sonnet',    mantra: 'Hook en 1.5 sec ou scroll',             status: 'active',  task: 'Edit UGC v3 (45s)',     skin: 'gray'   },
  { id: 'zoe',     name: 'Zoé Adler',       emoji: '📱', role: 'Social Media Manager',         tier: 'Specialist', team: 'Content', llm: 'Haiku',     mantra: '3 posts/jour minimum, jamais en pause', status: 'active',  task: 'Programmation 14h–22h', skin: 'pink'   },
  { id: 'noor',    name: 'Noor Hassan',     emoji: '✉️', role: 'Lifecycle & Email Marketer',   tier: 'Specialist', team: 'Content', llm: 'Sonnet',    mantra: 'L\'email est mort, sauf que non. ROI 36×.', status: 'idle',    task: 'Flow welcome v2',       skin: 'gold'   },
  { id: 'bea',     name: 'Bea Ricci',       emoji: '🌟', role: 'Reviews, UGC & Community',     tier: 'Specialist', team: 'Content', llm: 'Haiku',     mantra: 'Réponse à chaque comment en <2h',       status: 'active',  task: '47 commentaires en file', skin: 'gold'  },

  // GROWTH
  { id: 'jay',     name: 'Jay Okafor',      emoji: '🎯', role: 'Paid Ads (Meta/TikTok)',       tier: 'Specialist', team: 'Growth', llm: 'Sonnet',    mantra: 'ROAS or die',                            status: 'active',  task: 'Test 8 creatives Meta',  skin: 'red'    },
  { id: 'anna',    name: 'Anna Reis',       emoji: '📊', role: 'Data Analyst',                 tier: 'Specialist', team: 'Growth', llm: 'Sonnet',    mantra: 'Les chiffres ne mentent que si tu les lis mal', status: 'active', task: 'Cohorte semaine 18',   skin: 'blue'   },
  { id: 'hana',    name: 'Hana Kim',        emoji: '🔬', role: 'CRO Specialist',               tier: 'Specialist', team: 'Growth', llm: 'Sonnet',    mantra: 'Si c\'est pas mesuré, ça existe pas',  status: 'idle',    task: 'A/B test PDP — variante C', skin: 'teal'  },

  // OPS
  { id: 'hugo',    name: 'Hugo Bernal',     emoji: '🛒', role: 'Order Ops',                    tier: 'Specialist', team: 'Ops', llm: 'Haiku',     mantra: 'Livré <24h ou prévention SAV proactive', status: 'active',  task: '218 commandes en flux', skin: 'green'  },
  { id: 'sofia',   name: 'Sofia Ahmed',     emoji: '💬', role: 'Customer Support',             tier: 'Specialist', team: 'Ops', llm: 'Haiku',     mantra: 'NPS 70+ ou je change quelque chose',    status: 'active',  task: '12 tickets ouverts',     skin: 'pink'   },
  { id: 'chen',    name: 'Chen Wu',         emoji: '🐉', role: 'Procurement Officer',          tier: 'Specialist', team: 'Ops', llm: 'Sonnet',    mantra: '-25% sur la 1ère cotation. Toujours.',  status: 'idle',    task: 'Négo 3 fournisseurs',    skin: 'red'    },
  { id: 'ines',    name: 'Ines Larsen',     emoji: '📦', role: 'Packaging & Unboxing Designer',tier: 'Specialist', team: 'Ops', llm: 'Sonnet',    mantra: 'Le packaging fait 30% des reviews 5★', status: 'idle',    task: 'Maquette unboxing v4',   skin: 'gold'   },
];

const TEAM_META = {
  'C-Suite':   { color: 'red',    label: 'C-SUITE'    },
  'Research':  { color: 'green',  label: 'RESEARCH'   },
  'Content':   { color: 'pink',   label: 'CONTENT'    },
  'Growth':    { color: 'orange', label: 'GROWTH'     },
  'Ops':       { color: 'teal',   label: 'OPS'        },
  'Strategic': { color: 'violet', label: 'STRATEGIC'  },
};

/* ----- LIVE STATS ----- */
const LIVE_STATS = {
  revenue: 12847,         // €
  ordersToday: 218,
  roas: 3.42,
  iaSpendMonth: 31.4,     // $
  iaSpendCap: 50,
  agentsActive: 21,
  agentsTotal: 25,
  phase: 2,
  nps: 72,
  refundRate: 1.8,
};

/* ----- TICKER ----- */
const TICKER_ITEMS = [
  { sym: 'CA·D',     val: '€12,847',  delta: '+18.4%', dir: 'up'   },
  { sym: 'ORDERS',   val: '218',      delta: '+9',     dir: 'up'   },
  { sym: 'ROAS',     val: '3.42x',    delta: '+0.21',  dir: 'up'   },
  { sym: 'AOV',      val: '€58.93',   delta: '−€1.20', dir: 'down' },
  { sym: 'CVR',      val: '2.81%',    delta: '+0.14',  dir: 'up'   },
  { sym: 'CPC·META', val: '€0.34',    delta: '−€0.02', dir: 'up'   },
  { sym: 'IA·BURN',  val: '$31.4',    delta: '63% cap', dir: 'up'  },
  { sym: 'NPS',      val: '72',       delta: '+3',     dir: 'up'   },
  { sym: 'REFUND',   val: '1.8%',     delta: '−0.4',   dir: 'up'   },
  { sym: 'AGENTS',   val: '21/25',    delta: 'live',   dir: 'up'   },
];

/* ----- CHAT MESSAGES ----- */
const CHAT_MESSAGES = [
  { id: 1, from: 'user',   text: 'Yo Victor, on en est où sur le test du Halo Lamp ?', time: '14:02' },
  { id: 2, from: 'victor', text: "Halo Lamp passe le filtre Yuki. Marge nette estimée 38%, demande 1688 confirmée par Diego. Je lance le sprint content + ads dès demain matin si tu valides le budget.", time: '14:02', delegated: [{ to: 'yuki', label: 'Validation finale produit' }, { to: 'diego', label: 'Cotation 1688 — 3 fournisseurs' }] },
  { id: 3, from: 'user',   text: 'Validé. Quel budget ad initial ?', time: '14:04' },
  { id: 4, from: 'victor', text: "Théo recommande €280 sur 48h pour le test, capé à ROAS minimum 1.8x. Jay a déjà 8 créatives en pré-prod côté Kai. Si on dépasse 2.5x sur 24h, on monte à €600/jour.", time: '14:04', delegated: [{ to: 'theo', label: 'Cap budget €280 / 48h' }, { to: 'jay', label: 'Setup campagne Meta + TikTok' }, { to: 'kai', label: '8 créatives — 3 vibes' }] },
  { id: 5, from: 'user',   text: 'Statut budget IA ce mois ?', time: '14:11' },
  { id: 6, from: 'victor', text: "$31.40 sur $50 de cap. Iris a basculé 60% du trafic non-critique vers Haiku, économies $4.20/jour estimées. On finit le mois à $42–44, marge confortable.", time: '14:12', delegated: [{ to: 'iris', label: 'Routing optimisé Haiku' }] },
];

/* ----- ACTIVE NOW (sidebar) ----- */
const ACTIVE_NOW = [
  { id: 'mia',   text: 'Scraping #ttshop · 142 vidéos analysées' },
  { id: 'diego', text: 'Cotation 1688 — fournisseur 2/3' },
  { id: 'yuki',  text: 'Score produit "Halo Lamp" : 87/100' },
  { id: 'jay',   text: 'Setup campagne Meta — 8 créatives' },
  { id: 'kai',   text: 'Render visuels — 3/8' },
  { id: 'hugo',  text: '218 commandes en fulfillment' },
  { id: 'iris',  text: 'Routing 1,247 req/h · 71% Haiku' },
];

/* ----- QUICK PROMPTS ----- */
const QUICK_PROMPTS = [
  'Trouve-moi un produit',
  'Statut budget',
  'Lance un test ad',
  'Daily summary',
  'Kill un produit',
  'Validation fournisseur',
];

/* ----- REPORTS ----- */
const REPORTS = [
  { id: 'r1', date: '03 mai 2026 — 18:02', type: 'Daily',     title: 'Daily summary · Phase 2 · Jour 47',  agents: ['victor','anna','theo'],         tldr: 'CA €12,847 (+18.4%). ROAS 3.42x. 218 commandes. Halo Lamp dépasse 2.5x sur 24h — passé en scale.', tag: 'win' },
  { id: 'r2', date: '03 mai 2026 — 14:38', type: 'Product',   title: 'Validation Halo Lamp · Score 87/100', agents: ['yuki','diego','sam'],          tldr: 'Marge nette 38%, demande validée TikTok (12M views), 3 fournisseurs cotés (€8.40 / €9.10 / €11.20). GO.', tag: 'go' },
  { id: 'r3', date: '03 mai 2026 — 11:14', type: 'Growth',    title: 'A/B test PDP — variante C gagne (+12.4% CVR)', agents: ['hana','anna','ravi'], tldr: 'Variante C bat A de 12.4% sur 1,840 sessions. Significativité 95%. Déploiement global validé.', tag: 'go' },
  { id: 'r4', date: '03 mai 2026 — 09:00', type: 'Ops',       title: 'NPS hebdo · 72 (+3 vs S17)',          agents: ['sofia','marc','bea'],         tldr: 'NPS 72. Top driver: livraison <24h. Bottom: 4 plaintes packaging — Ines bossera v4 lundi.', tag: 'flag' },
  { id: 'r5', date: '02 mai 2026 — 21:30', type: 'Finance',   title: 'Burn IA · $31.4 / $50 cap',           agents: ['theo','iris'],                 tldr: 'Iris a basculé 60% trafic non-critique → Haiku. Trajectoire fin de mois : $42–44. Cap respecté.', tag: 'win' },
  { id: 'r6', date: '02 mai 2026 — 17:55', type: 'Product',   title: 'Kill — Pet Brush V2',                 agents: ['yuki','sam','aria'],           tldr: 'CVR 0.6%, AOV €22, marge nette 11%. Yuki le sort du catalogue. Aria a noté l\'erreur niche.', tag: 'kill' },
  { id: 'r7', date: '02 mai 2026 — 12:10', type: 'Growth',    title: 'Scale Meta · €280 → €600/j',          agents: ['jay','ravi','theo'],           tldr: 'ROAS 24h = 2.78x sur Halo Lamp. Théo débloque +€320/j. Cap journalier €600 jusqu\'à J+5.', tag: 'go' },
  { id: 'r8', date: '01 mai 2026 — 19:22', type: 'Content',   title: 'Pack visuels SKU-018 · 5 angles ×3 vibes', agents: ['kai','elena','tom'],     tldr: '15 assets livrés. Vibe "minimal nordic" performe en preview interne. Tom prépare 3 UGC vidéos.', tag: 'note' },
  { id: 'r9', date: '01 mai 2026 — 15:45', type: 'Daily',     title: 'Daily summary · Phase 2 · Jour 45',   agents: ['victor','anna','theo'],         tldr: 'CA €10,950. ROAS 3.18x. 187 commandes. 1 incident livraison (Hugo géré, refund proactif).', tag: 'note' },
];

/* expose to window */
Object.assign(window, {
  AGENTS, TEAM_META, LIVE_STATS, TICKER_ITEMS,
  CHAT_MESSAGES, ACTIVE_NOW, QUICK_PROMPTS, REPORTS,
});
