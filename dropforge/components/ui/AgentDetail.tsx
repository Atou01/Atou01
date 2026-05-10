import type { Agent } from "@/lib/types/agents";
import { TEAM_META } from "@/lib/types/agents";
import { AgentAvatar } from "./PixelSprite";

const SKILLS_BY_TEAM: Record<string, string[]> = {
  "Research":  ["scrape_tiktok", "sourcing_1688", "product_score", "trend_radar", "niche_map"],
  "Content":   ["copy_seo", "render_visual", "edit_video", "schedule_social", "flow_email"],
  "Growth":    ["campaign_meta", "campaign_tiktok", "cohort_analysis", "ab_test", "cro_audit"],
  "Ops":       ["fulfillment", "supplier_negociation", "support_ticket", "packaging_design"],
  "Strategic": ["niche_radar", "brand_naming", "positioning"],
  "C-Suite":   ["delegate", "arbitrage", "budget_freeze", "router_llm"],
};

const RECENT: Array<{ date: string; text: string; status: "done" | "en cours" }> = [
  { date: "aujourd'hui · 14:38", text: "Itération en cours", status: "en cours" },
  { date: "aujourd'hui · 11:12", text: "Revue brief CMO + alignement vibe", status: "done" },
  { date: "hier · 19:04", text: "Itération v2 sur output Q3", status: "done" },
  { date: "hier · 15:30", text: "Sync avec manager", status: "done" },
  { date: "02 mai · 09:12", text: "Bootstrap sprint hebdo", status: "done" },
];

interface Props {
  agent: Agent;
}

export default function AgentDetail({ agent }: Props) {
  const meta = TEAM_META[agent.team];
  const skills = SKILLS_BY_TEAM[agent.team] ?? ["ping", "report", "delegate"];
  const chipClass = meta.color === "red" ? "chip-accent"
                  : meta.color === "gold" ? "chip-gold"
                  : meta.color === "violet" ? "chip-violet"
                  : "chip-jade";

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <header style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <AgentAvatar agentId={agent.id} skin={agent.skin} size={56} idle halo />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <h2 style={{ fontSize: 20 }}>{agent.name}</h2>
            <span aria-hidden>{agent.emoji}</span>
          </div>
          <div className="mono" style={{ color: "var(--fg-dim)", fontSize: 12, marginBottom: 6 }}>{agent.role}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span className={`chip ${chipClass}`}>{meta.label}</span>
            <span className="chip">LLM · {agent.llmLabel}</span>
            <span className="chip chip-jade">● actif</span>
          </div>
        </div>
      </header>

      <blockquote className="card" style={{
        margin: 0, padding: "12px 14px",
        borderLeft: "3px solid var(--accent)",
        fontFamily: "var(--font-mono)", fontSize: 13, fontStyle: "italic",
      }}>
        « {agent.mantra} »
      </blockquote>

      <section>
        <div className="eyebrow" style={{ marginBottom: 10 }}>5 dernières tâches</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {RECENT.map((t, i) => (
            <li key={i} className="card" style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span aria-hidden style={{
                width: 6, height: 6, marginTop: 7,
                background: t.status === "done" ? "var(--jade)" : "var(--accent)",
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{t.text}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>{t.date} · {t.status}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Skill library</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {skills.map((s) => <span key={s} className="chip mono">{s}()</span>)}
        </div>
      </section>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btn btn-primary">→ Déléguer une tâche</button>
        <button className="btn">Voir logs</button>
      </div>
    </div>
  );
}
