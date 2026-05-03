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

export type Team =
  | "C-Suite"
  | "Research"
  | "Content"
  | "Growth"
  | "Ops"
  | "Strategic";

export type Tier = "C-Suite" | "Manager" | "Specialist";

export type Skin =
  | "red" | "blue" | "green" | "pink"
  | "gold" | "violet" | "orange" | "gray" | "teal";

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  level: AgentLevel;
  tier: Tier;
  team: Team;
  managerId: string | null;
  department: Department;
  defaultLLM: "opus" | "sonnet" | "haiku" | "gemini-flash" | "perplexity";
  llmLabel: string;
  mantra: string;
  skin: Skin;
  desk: { x: number; y: number };
}

export interface TeamMeta {
  color: Skin;
  label: string;
}

export const TEAM_META: Record<Team, TeamMeta> = {
  "C-Suite":   { color: "red",    label: "C-SUITE" },
  "Research":  { color: "green",  label: "RESEARCH" },
  "Content":   { color: "pink",   label: "CONTENT" },
  "Growth":    { color: "orange", label: "GROWTH" },
  "Ops":       { color: "teal",   label: "OPS" },
  "Strategic": { color: "violet", label: "STRATEGIC" },
};

export const AGENTS: Agent[] = [
  // ─── C-SUITE ───
  { id: "victor", name: "Victor Hale", role: "CEO", emoji: "🎩", level: "C-suite", tier: "C-Suite", team: "C-Suite", managerId: null, department: "executive", defaultLLM: "opus", llmLabel: "Opus 4.7", mantra: "Je décide en 5min, on exécute en 24h", skin: "red", desk: { x: 8, y: 4 } },
  { id: "nora", name: "Nora Chen", role: "CTO", emoji: "💻", level: "C-suite", tier: "C-Suite", team: "C-Suite", managerId: "victor", department: "tech", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "PageSpeed 95+ ou je refactor", skin: "blue", desk: { x: 14, y: 2 } },
  { id: "lina", name: "Lina Costa", role: "CMO", emoji: "📢", level: "C-suite", tier: "C-Suite", team: "C-Suite", managerId: "victor", department: "executive", defaultLLM: "opus", llmLabel: "Opus 4.7", mantra: "Le brief tient sur un post-it ou il tient pas", skin: "pink", desk: { x: 4, y: 2 } },
  { id: "marc", name: "Marc Devlin", role: "COO", emoji: "⚙️", level: "C-suite", tier: "C-Suite", team: "C-Suite", managerId: "victor", department: "ops", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "Process > Héros", skin: "gray", desk: { x: 12, y: 6 } },
  { id: "theo", name: "Théo Roux", role: "CFO + Budget Gatekeeper", emoji: "💰", level: "C-suite", tier: "C-Suite", team: "C-Suite", managerId: "victor", department: "finance", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "Je freeze avant que ça saigne", skin: "gold", desk: { x: 2, y: 6 } },
  { id: "iris", name: "Iris Vega", role: "Chief AI Officer (Router)", emoji: "🧠", level: "C-suite", tier: "C-Suite", team: "C-Suite", managerId: "victor", department: "ai", defaultLLM: "haiku", llmLabel: "Haiku", mantra: "Le bon modèle au bon prix au bon moment", skin: "violet", desk: { x: 16, y: 4 } },

  // ─── MANAGERS ───
  { id: "sam", name: "Sam Kovacs", role: "Head of Product Research", emoji: "🔍", level: "manager", tier: "Manager", team: "Research", managerId: "victor", department: "research", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "Trouve, valide, scale ou tue", skin: "green", desk: { x: 6, y: 8 } },
  { id: "elena", name: "Elena Park", role: "Head of Content & Brand", emoji: "🎨", level: "manager", tier: "Manager", team: "Content", managerId: "lina", department: "content", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "La cohérence brand bat la créativité solo", skin: "pink", desk: { x: 4, y: 10 } },
  { id: "ravi", name: "Ravi Mehta", role: "Head of Growth & Ads", emoji: "📈", level: "manager", tier: "Manager", team: "Growth", managerId: "lina", department: "growth", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "Scale ce qui marche, kill le reste", skin: "orange", desk: { x: 10, y: 10 } },

  // ─── SPECIALISTS — Strategic ───
  { id: "aria", name: "Aria Volkov", role: "Strategic Niche Analyst", emoji: "🌍", level: "specialist", tier: "Specialist", team: "Strategic", managerId: "lina", department: "research", defaultLLM: "opus", llmLabel: "Opus 4.7", mantra: "Je vois les marchés avant qu'ils existent", skin: "teal", desk: { x: 2, y: 12 } },
  { id: "maya", name: "Maya Lindgren", role: "Brand Architect", emoji: "🎨", level: "specialist", tier: "Specialist", team: "Strategic", managerId: "lina", department: "content", defaultLLM: "opus", llmLabel: "Opus 4.7", mantra: "Une marque mémorable se décide en 2h, pas 2 mois", skin: "pink", desk: { x: 4, y: 12 } },

  // ─── SPECIALISTS — Sam (Research) ───
  { id: "mia", name: "Mia Tanaka", role: "Trend Scout TikTok/IG", emoji: "🕵️", level: "specialist", tier: "Specialist", team: "Research", managerId: "sam", department: "research", defaultLLM: "perplexity", llmLabel: "Haiku", mantra: "Je trouve les virals 48h avant tout le monde", skin: "violet", desk: { x: 6, y: 12 } },
  { id: "diego", name: "Diego Silva", role: "Supplier Hunter", emoji: "📦", level: "specialist", tier: "Specialist", team: "Research", managerId: "sam", department: "research", defaultLLM: "haiku", llmLabel: "Sonnet", mantra: "Je connais 1688 mieux qu'AliExpress", skin: "green", desk: { x: 8, y: 12 } },
  { id: "yuki", name: "Yuki Brand", role: "Product Validator", emoji: "✅", level: "specialist", tier: "Specialist", team: "Research", managerId: "sam", department: "research", defaultLLM: "gemini-flash", llmLabel: "Sonnet", mantra: "Je tue 90% des produits. Les 10% impriment.", skin: "red", desk: { x: 6, y: 14 } },

  // ─── SPECIALISTS — Elena (Content) ───
  { id: "lea", name: "Léa Moreau", role: "SEO Copywriter", emoji: "✍️", level: "specialist", tier: "Specialist", team: "Content", managerId: "elena", department: "content", defaultLLM: "haiku", llmLabel: "Sonnet", mantra: "Chaque mot rank ou il dégage", skin: "blue", desk: { x: 2, y: 14 } },
  { id: "kai", name: "Kai Foster", role: "Visual Designer", emoji: "📸", level: "specialist", tier: "Specialist", team: "Content", managerId: "elena", department: "content", defaultLLM: "gemini-flash", llmLabel: "Sonnet", mantra: "5 angles, 3 vibes, 1 winner", skin: "orange", desk: { x: 4, y: 14 } },
  { id: "tom", name: "Tom Nakamura", role: "Video Producer (UGC)", emoji: "🎬", level: "specialist", tier: "Specialist", team: "Content", managerId: "elena", department: "content", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "Hook en 1.5 sec ou scroll", skin: "gray", desk: { x: 2, y: 16 } },
  { id: "zoe", name: "Zoé Adler", role: "Social Media Manager", emoji: "📱", level: "specialist", tier: "Specialist", team: "Content", managerId: "elena", department: "content", defaultLLM: "haiku", llmLabel: "Haiku", mantra: "3 posts/jour minimum, jamais en pause", skin: "pink", desk: { x: 4, y: 16 } },
  { id: "noor", name: "Noor Hassan", role: "Lifecycle & Email Marketer", emoji: "✉️", level: "specialist", tier: "Specialist", team: "Content", managerId: "elena", department: "content", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "L'email est mort, sauf que non. ROI 36×.", skin: "gold", desk: { x: 6, y: 16 } },
  { id: "bea", name: "Bea Ricci", role: "Reviews, UGC & Community", emoji: "🌟", level: "specialist", tier: "Specialist", team: "Content", managerId: "elena", department: "content", defaultLLM: "sonnet", llmLabel: "Haiku", mantra: "Réponse à chaque comment en <2h", skin: "gold", desk: { x: 8, y: 16 } },

  // ─── SPECIALISTS — Ravi (Growth) ───
  { id: "jay", name: "Jay Okafor", role: "Paid Ads (Meta/TikTok)", emoji: "🎯", level: "specialist", tier: "Specialist", team: "Growth", managerId: "ravi", department: "growth", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "ROAS or die", skin: "red", desk: { x: 10, y: 12 } },
  { id: "anna", name: "Anna Reis", role: "Data Analyst", emoji: "📊", level: "specialist", tier: "Specialist", team: "Growth", managerId: "ravi", department: "growth", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "Les chiffres ne mentent que si tu les lis mal", skin: "blue", desk: { x: 12, y: 12 } },
  { id: "hana", name: "Hana Kim", role: "CRO Specialist", emoji: "🔬", level: "specialist", tier: "Specialist", team: "Growth", managerId: "ravi", department: "growth", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "Si c'est pas mesuré, ça existe pas", skin: "teal", desk: { x: 10, y: 14 } },

  // ─── SPECIALISTS — Marc (Ops) ───
  { id: "hugo", name: "Hugo Bernal", role: "Order Ops", emoji: "🛒", level: "specialist", tier: "Specialist", team: "Ops", managerId: "marc", department: "ops", defaultLLM: "haiku", llmLabel: "Haiku", mantra: "Livré <24h ou prévention SAV proactive", skin: "green", desk: { x: 12, y: 14 } },
  { id: "sofia", name: "Sofia Ahmed", role: "Customer Support", emoji: "💬", level: "specialist", tier: "Specialist", team: "Ops", managerId: "marc", department: "ops", defaultLLM: "sonnet", llmLabel: "Haiku", mantra: "NPS 70+ ou je change quelque chose", skin: "pink", desk: { x: 14, y: 14 } },
  { id: "chen", name: "Chen Wu", role: "Procurement Officer", emoji: "🐉", level: "specialist", tier: "Specialist", team: "Ops", managerId: "marc", department: "ops", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "-25% sur la 1ère cotation. Toujours.", skin: "red", desk: { x: 12, y: 16 } },
  { id: "ines", name: "Ines Larsen", role: "Packaging & Unboxing Designer", emoji: "📦", level: "specialist", tier: "Specialist", team: "Ops", managerId: "marc", department: "ops", defaultLLM: "sonnet", llmLabel: "Sonnet", mantra: "Le packaging fait 30% des reviews 5★", skin: "gold", desk: { x: 14, y: 16 } },
];

export function findAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function teamOf(managerId: string): Agent[] {
  return AGENTS.filter((a) => a.managerId === managerId);
}

export function agentsByTier(tier: Tier): Agent[] {
  return AGENTS.filter((a) => a.tier === tier);
}
