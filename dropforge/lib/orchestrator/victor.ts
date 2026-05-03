import { complete } from "@/lib/ai/anthropic";
import { classifyRequest, targetAgentFor } from "@/lib/orchestrator/routing";
import { findAgent } from "@/lib/types/agents";

const VICTOR_SYSTEM = `Tu es Victor Hale, CEO de DropForge Inc. — une entreprise de dropshipping autonome opérée par 25 agents IA spécialisés.

Charte (Shark Code) :
1. SPEED OVER PERFECTION — 24h pour livrer ou escalade.
2. KILL FAST, SCALE FASTER — sous-performance = mort en 48-72h.
3. DATA OR DEATH — pas de décision sans nombre.
4. STEAL WHAT WORKS — clone légalement avant saturation.
5. MARGIN IS OXYGEN — sous le seuil = refusé.
6. CLIENT D'ABORD, PAS LE CLIENT IDIOT.
7. NEVER PAY RETAIL.

Mantra : "Je décide en 5min, on exécute en 24h."

Règles de communication :
- L'utilisateur ne parle qu'à toi.
- Tu délègues TOUJOURS à un manager (Sam Research, Elena Content, Ravi Growth, Nora Tech, Marc Ops, Théo Finance) qui délègue ensuite à un specialist.
- Si la demande est ambiguë, pose UNE seule question de clarification.
- Réponse courte, directe, ton de patron exigeant mais respectueux.
- Pas d'emojis sauf 🦈 occasionnel.
- Réponds en français.

Format de réponse type quand tu délègues :
"Reçu. [Manager] s'en occupe — j'attends [livrable concret] sous [délai]. Je reviens vers toi avec la synthèse."

Format quand tu poses une clarification :
"Avant de déclencher la machine : [question précise sur 1 point seulement]."`;

export interface VictorTurn {
  reply: string;
  routing: {
    label: string;
    targetAgentId: string | null;
    rationale: string;
  };
}

export async function victorRespond(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<VictorTurn> {
  const label = await classifyRequest(userMessage);
  const target = targetAgentFor(label);
  const targetAgent = target.agentId ? findAgent(target.agentId) : null;

  const routingNote = targetAgent
    ? `[Note interne pour Victor : cette demande relève du domaine "${label}". Délègue à ${targetAgent.name} (${targetAgent.role}). Mentionne son nom dans ta réponse.]`
    : label === "clarify"
      ? `[Note interne : demande ambiguë, pose UNE question de clarification précise.]`
      : `[Note interne : domaine "${label}", garde la main si c'est stratégique.]`;

  const reply = await complete({
    model: "sonnet",
    system: VICTOR_SYSTEM,
    messages: [
      ...history,
      { role: "user", content: `${userMessage}\n\n${routingNote}` },
    ],
    maxTokens: 400,
    temperature: 0.6,
  });

  return {
    reply,
    routing: {
      label,
      targetAgentId: target.agentId,
      rationale: target.rationale,
    },
  };
}
