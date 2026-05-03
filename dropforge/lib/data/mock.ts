/**
 * Données mockées Sprint 1.5 — remplacées par le vrai backend en Sprint 2
 * (Supabase + Anna pour stats, Mia pour ticker, Aria pour reports).
 */

export interface LiveStats {
  revenue: number;
  ordersToday: number;
  roas: number;
  iaSpendMonth: number;
  iaSpendCap: number;
  agentsActive: number;
  agentsTotal: number;
  phase: number;
  nps: number;
  refundRate: number;
}

export const LIVE_STATS: LiveStats = {
  revenue: 12847,
  ordersToday: 218,
  roas: 3.42,
  iaSpendMonth: 31.4,
  iaSpendCap: 50,
  agentsActive: 21,
  agentsTotal: 25,
  phase: 2,
  nps: 72,
  refundRate: 1.8,
};

export interface TickerItem {
  sym: string;
  val: string;
  delta: string;
  dir: "up" | "down";
}

export const TICKER_ITEMS: TickerItem[] = [
  { sym: "CA·D", val: "€12,847", delta: "+18.4%", dir: "up" },
  { sym: "ORDERS", val: "218", delta: "+9", dir: "up" },
  { sym: "ROAS", val: "3.42x", delta: "+0.21", dir: "up" },
  { sym: "AOV", val: "€58.93", delta: "−€1.20", dir: "down" },
  { sym: "CVR", val: "2.81%", delta: "+0.14", dir: "up" },
  { sym: "CPC·META", val: "€0.34", delta: "−€0.02", dir: "up" },
  { sym: "IA·BURN", val: "$31.4", delta: "63% cap", dir: "up" },
  { sym: "NPS", val: "72", delta: "+3", dir: "up" },
  { sym: "REFUND", val: "1.8%", delta: "−0.4", dir: "up" },
  { sym: "AGENTS", val: "21/25", delta: "live", dir: "up" },
];

export interface ActiveItem {
  id: string;
  text: string;
}

export const ACTIVE_NOW: ActiveItem[] = [
  { id: "mia", text: "Scraping #ttshop · 142 vidéos analysées" },
  { id: "diego", text: "Cotation 1688 — fournisseur 2/3" },
  { id: "yuki", text: "Score produit \"Halo Lamp\" : 87/100" },
  { id: "jay", text: "Setup campagne Meta — 8 créatives" },
  { id: "kai", text: "Render visuels — 3/8" },
  { id: "hugo", text: "218 commandes en fulfillment" },
  { id: "iris", text: "Routing 1,247 req/h · 71% Haiku" },
];

export const QUICK_PROMPTS: string[] = [
  "Trouve-moi un produit",
  "Statut budget",
  "Lance un test ad",
  "Daily summary",
  "Kill un produit",
  "Validation fournisseur",
];

export type ReportTag = "win" | "go" | "kill" | "flag" | "note";

export interface Report {
  id: string;
  date: string;
  type: string;
  title: string;
  agents: string[];
  tldr: string;
  tag: ReportTag;
}

export const REPORTS: Report[] = [
  { id: "r1", date: "03 mai 2026 — 18:02", type: "Daily", title: "Daily summary · Phase 2 · Jour 47", agents: ["victor", "anna", "theo"], tldr: "CA €12,847 (+18.4%). ROAS 3.42x. 218 commandes. Halo Lamp dépasse 2.5x sur 24h — passé en scale.", tag: "win" },
  { id: "r2", date: "03 mai 2026 — 14:38", type: "Product", title: "Validation Halo Lamp · Score 87/100", agents: ["yuki", "diego", "sam"], tldr: "Marge nette 38%, demande validée TikTok (12M views), 3 fournisseurs cotés (€8.40 / €9.10 / €11.20). GO.", tag: "go" },
  { id: "r3", date: "03 mai 2026 — 11:14", type: "Growth", title: "A/B test PDP — variante C gagne (+12.4% CVR)", agents: ["hana", "anna", "ravi"], tldr: "Variante C bat A de 12.4% sur 1,840 sessions. Significativité 95%. Déploiement global validé.", tag: "go" },
  { id: "r4", date: "03 mai 2026 — 09:00", type: "Ops", title: "NPS hebdo · 72 (+3 vs S17)", agents: ["sofia", "marc", "bea"], tldr: "NPS 72. Top driver: livraison <24h. Bottom: 4 plaintes packaging — Ines bossera v4 lundi.", tag: "flag" },
  { id: "r5", date: "02 mai 2026 — 21:30", type: "Finance", title: "Burn IA · $31.4 / $50 cap", agents: ["theo", "iris"], tldr: "Iris a basculé 60% trafic non-critique → Haiku. Trajectoire fin de mois : $42–44. Cap respecté.", tag: "win" },
  { id: "r6", date: "02 mai 2026 — 17:55", type: "Product", title: "Kill — Pet Brush V2", agents: ["yuki", "sam", "aria"], tldr: "CVR 0.6%, AOV €22, marge nette 11%. Yuki le sort du catalogue. Aria a noté l'erreur niche.", tag: "kill" },
  { id: "r7", date: "02 mai 2026 — 12:10", type: "Growth", title: "Scale Meta · €280 → €600/j", agents: ["jay", "ravi", "theo"], tldr: "ROAS 24h = 2.78x sur Halo Lamp. Théo débloque +€320/j. Cap journalier €600 jusqu'à J+5.", tag: "go" },
  { id: "r8", date: "01 mai 2026 — 19:22", type: "Content", title: "Pack visuels SKU-018 · 5 angles ×3 vibes", agents: ["kai", "elena", "tom"], tldr: "15 assets livrés. Vibe \"minimal nordic\" performe en preview interne. Tom prépare 3 UGC vidéos.", tag: "note" },
  { id: "r9", date: "01 mai 2026 — 15:45", type: "Daily", title: "Daily summary · Phase 2 · Jour 45", agents: ["victor", "anna", "theo"], tldr: "CA €10,950. ROAS 3.18x. 187 commandes. 1 incident livraison (Hugo géré, refund proactif).", tag: "note" },
];
