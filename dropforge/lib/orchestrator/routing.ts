import { classify } from "@/lib/ai/anthropic";
import { findAgent } from "@/lib/types/agents";

export const ROUTING_LABELS = [
  "research",
  "content",
  "growth",
  "tech",
  "ops",
  "finance",
  "strategy",
  "clarify",
] as const;

export type RoutingLabel = (typeof ROUTING_LABELS)[number];

const LABEL_TO_MANAGER: Record<RoutingLabel, string | null> = {
  research: "sam",
  content: "elena",
  growth: "ravi",
  tech: "nora",
  ops: "marc",
  finance: "theo",
  strategy: null,
  clarify: null,
};

export async function classifyRequest(userMessage: string): Promise<RoutingLabel> {
  return classify<RoutingLabel>({
    text: userMessage,
    labels: ROUTING_LABELS,
    context:
      "DropForge est une boîte de dropshipping autonome avec 25 agents IA. " +
      "Classifie la demande utilisateur dans la bonne catégorie de delegation. " +
      "research = produit/niche/fournisseurs ; content = SEO/social/email/visuels ; " +
      "growth = ads/CRO/data ; tech = site/bug/déploiement ; ops = commande/support/packaging ; " +
      "finance = budget/marges/Stripe ; strategy = vision/lancement/pivot (CEO garde) ; " +
      "clarify = demande trop floue, il faut une question.",
  });
}

export function targetAgentFor(label: RoutingLabel): {
  agentId: string | null;
  rationale: string;
} {
  if (label === "strategy") return { agentId: "victor", rationale: "Stratégie : Victor garde la main." };
  if (label === "clarify") return { agentId: null, rationale: "Demande ambiguë, Victor pose 1 question." };
  const managerId = LABEL_TO_MANAGER[label];
  if (!managerId) return { agentId: null, rationale: "Pas de manager défini." };
  const agent = findAgent(managerId);
  return {
    agentId: managerId,
    rationale: `Délégué à ${agent?.name ?? managerId} (${agent?.role ?? "manager"}).`,
  };
}
