export type AgentLevel = "C-suite" | "manager" | "specialist";

export type AgentState =
  | "idle"
  | "walking"
  | "working"
  | "coffee"
  | "sleeping"
  | "meeting";

export type Department =
  | "executive"
  | "research"
  | "content"
  | "growth"
  | "ops"
  | "finance"
  | "tech"
  | "ai";

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  level: AgentLevel;
  managerId: string | null;
  department: Department;
  defaultLLM: "opus" | "sonnet" | "haiku" | "gemini-flash" | "perplexity";
  mantra: string;
  desk: { x: number; y: number };
}

export const AGENTS: Agent[] = [
  // ─── C-SUITE ───
  { id: "victor", name: "Victor Hale", role: "CEO", emoji: "🎩", level: "C-suite", managerId: null, department: "executive", defaultLLM: "opus", mantra: "Je décide en 5min, on exécute en 24h", desk: { x: 8, y: 4 } },
  { id: "nora", name: "Nora Chen", role: "CTO", emoji: "💻", level: "C-suite", managerId: "victor", department: "tech", defaultLLM: "sonnet", mantra: "PageSpeed 95+ ou je refactor", desk: { x: 14, y: 2 } },
  { id: "lina", name: "Lina Costa", role: "CMO", emoji: "📢", level: "C-suite", managerId: "victor", department: "executive", defaultLLM: "opus", mantra: "La marque parle avant le produit", desk: { x: 4, y: 2 } },
  { id: "marc", name: "Marc Devlin", role: "COO", emoji: "⚙️", level: "C-suite", managerId: "victor", department: "ops", defaultLLM: "sonnet", mantra: "Process, mesure, repete", desk: { x: 12, y: 6 } },
  { id: "theo", name: "Théo Roux", role: "CFO + Budget Gatekeeper", emoji: "💰", level: "C-suite", managerId: "victor", department: "finance", defaultLLM: "sonnet", mantra: "Je freeze avant que ça saigne", desk: { x: 2, y: 6 } },
  { id: "iris", name: "Iris Vega", role: "Chief AI Officer (Router)", emoji: "🧠", level: "C-suite", managerId: "victor", department: "ai", defaultLLM: "haiku", mantra: "Le bon modèle au bon prix au bon moment", desk: { x: 16, y: 4 } },

  // ─── MANAGERS ───
  { id: "sam", name: "Sam Kovacs", role: "Head of Product Research", emoji: "🔍", level: "manager", managerId: "victor", department: "research", defaultLLM: "sonnet", mantra: "Le marché parle, j'écoute", desk: { x: 6, y: 8 } },
  { id: "elena", name: "Elena Park", role: "Head of Content & Brand", emoji: "🎨", level: "manager", managerId: "lina", department: "content", defaultLLM: "sonnet", mantra: "Stories qui collent, ventes qui suivent", desk: { x: 4, y: 10 } },
  { id: "ravi", name: "Ravi Mehta", role: "Head of Growth & Ads", emoji: "📈", level: "manager", managerId: "lina", department: "growth", defaultLLM: "sonnet", mantra: "Test, scale, kill, recommence", desk: { x: 10, y: 10 } },

  // ─── SPECIALISTS — Strategic ───
  { id: "aria", name: "Aria Volkov", role: "Strategic Niche Analyst", emoji: "🌍", level: "specialist", managerId: "lina", department: "research", defaultLLM: "sonnet", mantra: "Je vois les marchés avant qu'ils existent", desk: { x: 2, y: 12 } },
  { id: "maya", name: "Maya Lindgren", role: "Brand Architect", emoji: "🎨", level: "specialist", managerId: "lina", department: "content", defaultLLM: "sonnet", mantra: "Une marque mémorable se décide en 2h, pas 2 mois", desk: { x: 4, y: 12 } },

  // ─── SPECIALISTS — Sam (Research) ───
  { id: "mia", name: "Mia Tanaka", role: "Trend Scout (TikTok/IG)", emoji: "🕵️", level: "specialist", managerId: "sam", department: "research", defaultLLM: "perplexity", mantra: "Je trouve les virals 48h avant tout le monde", desk: { x: 6, y: 12 } },
  { id: "diego", name: "Diego Silva", role: "Supplier Hunter", emoji: "📦", level: "specialist", managerId: "sam", department: "research", defaultLLM: "haiku", mantra: "Je connais 1688 mieux qu'AliExpress", desk: { x: 8, y: 12 } },
  { id: "yuki", name: "Yuki Brand", role: "Product Validator", emoji: "✅", level: "specialist", managerId: "sam", department: "research", defaultLLM: "gemini-flash", mantra: "Je tue 90% des produits. Les 10% impriment.", desk: { x: 6, y: 14 } },

  // ─── SPECIALISTS — Elena (Content) ───
  { id: "lea", name: "Léa Moreau", role: "SEO Copywriter", emoji: "✍️", level: "specialist", managerId: "elena", department: "content", defaultLLM: "haiku", mantra: "Chaque mot rank ou il dégage", desk: { x: 2, y: 14 } },
  { id: "kai", name: "Kai Foster", role: "Visual Designer", emoji: "📸", level: "specialist", managerId: "elena", department: "content", defaultLLM: "gemini-flash", mantra: "5 angles, 3 vibes, 1 winner", desk: { x: 4, y: 14 } },
  { id: "tom", name: "Tom Nakamura", role: "Video Producer (UGC)", emoji: "🎬", level: "specialist", managerId: "elena", department: "content", defaultLLM: "sonnet", mantra: "Hook en 1.5 sec ou scroll", desk: { x: 2, y: 16 } },
  { id: "zoe", name: "Zoé Adler", role: "Social Media Manager", emoji: "📱", level: "specialist", managerId: "elena", department: "content", defaultLLM: "haiku", mantra: "3 posts/jour minimum, jamais en pause", desk: { x: 4, y: 16 } },
  { id: "noor", name: "Noor Hassan", role: "Lifecycle & Email Marketer", emoji: "✉️", level: "specialist", managerId: "elena", department: "content", defaultLLM: "sonnet", mantra: "L'email est mort, sauf que non. ROI 36×.", desk: { x: 6, y: 16 } },
  { id: "bea", name: "Bea Ricci", role: "Reviews, UGC & Community", emoji: "🌟", level: "specialist", managerId: "elena", department: "content", defaultLLM: "sonnet", mantra: "Réponse à chaque comment en <2h", desk: { x: 8, y: 16 } },

  // ─── SPECIALISTS — Ravi (Growth) ───
  { id: "jay", name: "Jay Okafor", role: "Paid Ads (Meta/TikTok)", emoji: "🎯", level: "specialist", managerId: "ravi", department: "growth", defaultLLM: "sonnet", mantra: "ROAS or die", desk: { x: 10, y: 12 } },
  { id: "anna", name: "Anna Reis", role: "Data Analyst", emoji: "📊", level: "specialist", managerId: "ravi", department: "growth", defaultLLM: "sonnet", mantra: "Les chiffres ne mentent que si tu les lis mal", desk: { x: 12, y: 12 } },
  { id: "hana", name: "Hana Kim", role: "CRO Specialist", emoji: "🔬", level: "specialist", managerId: "ravi", department: "growth", defaultLLM: "sonnet", mantra: "Si c'est pas mesuré, ça existe pas", desk: { x: 10, y: 14 } },

  // ─── SPECIALISTS — Marc (Ops) ───
  { id: "hugo", name: "Hugo Bernal", role: "Order Ops", emoji: "🛒", level: "specialist", managerId: "marc", department: "ops", defaultLLM: "haiku", mantra: "Livré <24h ou prévention SAV proactive", desk: { x: 12, y: 14 } },
  { id: "sofia", name: "Sofia Ahmed", role: "Customer Support", emoji: "💬", level: "specialist", managerId: "marc", department: "ops", defaultLLM: "sonnet", mantra: "NPS 70+ ou je change quelque chose", desk: { x: 14, y: 14 } },
  { id: "chenwu", name: "Chen Wu", role: "Procurement Officer", emoji: "🐉", level: "specialist", managerId: "marc", department: "ops", defaultLLM: "sonnet", mantra: "-25% sur la 1ère cotation. Toujours.", desk: { x: 12, y: 16 } },
  { id: "ines", name: "Ines Larsen", role: "Packaging & Unboxing Designer", emoji: "📦", level: "specialist", managerId: "marc", department: "ops", defaultLLM: "sonnet", mantra: "Le packaging fait 30% des reviews 5★", desk: { x: 14, y: 16 } },
];

export function findAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function teamOf(managerId: string): Agent[] {
  return AGENTS.filter((a) => a.managerId === managerId);
}
