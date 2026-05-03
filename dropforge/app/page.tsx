import Link from "next/link";
import Ticker from "@/components/ui/Ticker";
import KPIStrip from "@/components/ui/KPIStrip";
import { AgentAvatar } from "@/components/ui/PixelSprite";
import { AGENTS, agentsByTier } from "@/lib/types/agents";
import { LIVE_STATS } from "@/lib/data/mock";

export default function Landing() {
  const csuite = agentsByTier("C-Suite");
  const managers = agentsByTier("Manager");
  const specialists = agentsByTier("Specialist");

  return (
    <main role="main">
      <Ticker />

      <section className="page" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "flex-end" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>EST. 2026 · 25 AGENTS · 1 CEO · 0 SLEEP</div>
            <h1 style={{ marginBottom: 14 }}>
              DropForge Inc. <span aria-hidden>🦈</span><br />
              <span style={{ color: "var(--fg-dim)" }}>L&apos;usine à</span> cash<br />
              <span style={{ color: "var(--fg-dim)" }}>opérée par 25 IA.</span>
            </h1>
            <p style={{ fontSize: 17, color: "var(--fg-2)", maxWidth: 560, marginBottom: 24 }}>
              Tu parles à <strong>Victor</strong>. Victor délègue. La machine trouve le produit, l&apos;écrit, le shoot, le test, le scale, le livre.
              Tu lis le rapport. Tu signes. <span style={{ color: "var(--accent)" }}>On recommence.</span>
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/chat" className="btn btn-primary">→ Parler à Victor</Link>
              <Link href="/office" className="btn">◉ Visiter l&apos;office</Link>
              <Link href="/reports" className="btn btn-ghost">📑 Voir les rapports</Link>
            </div>
          </div>

          <div className="card scanlines" style={{ padding: 0, fontFamily: "var(--font-mono)" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}>
              <span style={{ width: 8, height: 8, background: "var(--shark)" }} />
              <span style={{ width: 8, height: 8, background: "var(--gold)" }} />
              <span style={{ width: 8, height: 8, background: "var(--jade)" }} />
              <span style={{ marginLeft: 8, color: "var(--fg-dim)" }}>iris@dropforge:~/router$</span>
            </div>
            <div style={{ padding: 14, fontSize: 12, lineHeight: 1.7 }}>
              <ConsoleLine sym="›" sym_color="var(--jade)" time="14:38:04">mia → &quot;viral scout: 142 vidéos / 4 candidates&quot;</ConsoleLine>
              <ConsoleLine sym="›" sym_color="var(--jade)" time="14:38:11">yuki → score(halo_lamp) = <strong style={{ color: "var(--gold)" }}>87/100</strong></ConsoleLine>
              <ConsoleLine sym="›" sym_color="var(--jade)" time="14:38:22">diego → cotation_1688(3 fournisseurs) ok</ConsoleLine>
              <ConsoleLine sym="!" sym_color="var(--shark)" time="14:38:29">theo → cap budget = <strong>€280 / 48h</strong></ConsoleLine>
              <ConsoleLine sym="›" sym_color="var(--jade)" time="14:38:30">iris → route(jay) = sonnet (latence 240ms)</ConsoleLine>
              <ConsoleLine sym="›" sym_color="var(--jade)" time="14:38:31">kai → render(8 visuals) ETA 12min</ConsoleLine>
              <ConsoleLine sym="★" sym_color="var(--gold)" time="14:39:02">victor → <strong>&quot;Sprint 014 lancé&quot;</strong> ▮</ConsoleLine>
            </div>
          </div>
        </div>
      </section>

      <section className="page" style={{ paddingTop: 0 }}>
        <KPIStrip />
      </section>

      <section className="page" style={{ paddingTop: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>POINTS D&apos;ENTRÉE</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <ActionCard tag="01" href="/chat" accent title="Chat avec Victor"
            desc="Brief le CEO. Il fait ses 5 minutes de réflexion, puis délègue aux bons agents. Tu reçois la synthèse."
            cta="→ Ouvrir le chat" />
          <ActionCard tag="02" href="/office" title="Office"
            desc="Vue top-down du bureau. 25 sprites pixel à leur poste. Hover pour le rôle, click pour la skill library."
            cta="◉ Entrer au bureau" />
          <ActionCard tag="03" href="/reports" title="Reports"
            desc="Tous les rapports livrés par Victor. Filtre par agent, date, type. TL;DR + détails à la demande."
            cta="📑 Voir les rapports" />
        </div>
      </section>

      <section className="page" style={{ paddingTop: 48 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16 }}>
          <h2>La roster</h2>
          <span className="mono" style={{ color: "var(--fg-dim)", fontSize: 13 }}>
            {AGENTS.length} agents · 6 LLM tiers · 0 humain
          </span>
        </div>

        {[
          { label: "C-SUITE", sub: "décide, arbitre, route", list: csuite },
          { label: "MANAGERS", sub: "orchestrent les pôles", list: managers },
          { label: "SPECIALISTS", sub: "exécutent, mesurent, livrent", list: specialists },
        ].map((g) => (
          <div key={g.label} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
              <span className="chip chip-accent">{g.label}</span>
              <span className="mono" style={{ color: "var(--fg-dim)", fontSize: 11 }}>
                {g.list.length} · {g.sub}
              </span>
              <span style={{ flex: 1, height: 1, background: "var(--border)", marginLeft: 8 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
              {g.list.map((a) => (
                <div key={a.id} className="card card-hover" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <AgentAvatar agentId={a.id} skin={a.skin} size={36} idle />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                      <span aria-hidden style={{ fontSize: 12 }}>{a.emoji}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.role}
                    </div>
                  </div>
                  <span className="chip mono" style={{ fontSize: 9, padding: "2px 6px" }}>{a.llmLabel}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className="page-tight" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <div className="card" style={{
          padding: "40px 28px",
          textAlign: "center",
          borderColor: "var(--accent)",
          background: "linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent) 6%, transparent))",
        }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>// MANTRA</div>
          <p className="pixel-font" style={{ fontSize: 38, lineHeight: 1.15, letterSpacing: "1px", margin: 0 }}>
            We don&apos;t build sites.<br />
            <span style={{ color: "var(--accent)" }}>We build cash machines.</span>
          </p>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>© 2026 DROPFORGE INC.</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>v0.4.7 · phase {LIVE_STATS.phase}/3</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>built with rage 🦈</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ConsoleLine({ sym, sym_color, time, children }: { sym: string; sym_color: string; time: string; children: React.ReactNode }) {
  return (
    <div>
      <span style={{ color: sym_color }}>{sym}</span> [{time}] {children}
    </div>
  );
}

function ActionCard({ tag, href, title, desc, cta, accent }: { tag: string; href: string; title: string; desc: string; cta: string; accent?: boolean }) {
  return (
    <Link href={href} className="card card-hover" style={{
      display: "flex", flexDirection: "column", gap: 10,
      padding: 20, textAlign: "left",
      borderColor: accent ? "var(--accent)" : "var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>{tag}.</span>
        <h3 style={{ flex: 1 }}>{title}</h3>
        <span style={{ color: "var(--accent)" }} aria-hidden>→</span>
      </div>
      <p style={{ margin: 0, color: "var(--fg-2)", fontSize: 14 }}>{desc}</p>
      <span className="mono" style={{ fontSize: 11, color: "var(--accent)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {cta}
      </span>
    </Link>
  );
}
