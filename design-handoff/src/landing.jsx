/* ============================================================
   Page: LANDING /
   ============================================================ */

function LandingPage({ onNavigate }) {
  const grouped = useMemo(() => {
    const g = { 'C-Suite': [], 'Manager': [], 'Specialist': [] };
    AGENTS.forEach(a => g[a.tier].push(a));
    return g;
  }, []);

  return (
    <main role="main">
      <Ticker />

      {/* HERO */}
      <section className="page" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'flex-end' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>EST. 2026 · 25 AGENTS · 1 CEO · 0 SLEEP</div>
            <h1 style={{ marginBottom: 14 }}>
              DropForge Inc. <span aria-hidden="true">🦈</span><br />
              <span style={{ color: 'var(--fg-dim)' }}>L'usine à</span> cash<br />
              <span style={{ color: 'var(--fg-dim)' }}>opérée par 25 IA.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'var(--fg-2)', maxWidth: 560, marginBottom: 24 }}>
              Tu parles à <strong>Victor</strong>. Victor délègue. La machine trouve le produit, l'écrit, le shoot, le test, le scale, le livre.
              Tu lis le rapport. Tu signes. <span style={{ color: 'var(--accent)' }}>On recommence.</span>
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => onNavigate('chat')}>
                → Parler à Victor
              </button>
              <button className="btn" onClick={() => onNavigate('office')}>
                ◉ Visiter l'office
              </button>
              <button className="btn btn-ghost" onClick={() => onNavigate('reports')}>
                📑 Voir les rapports
              </button>
            </div>
          </div>

          {/* Live console */}
          <div className="card scanlines" style={{ padding: 0, fontFamily: 'var(--font-mono)' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
              <span style={{ width: 8, height: 8, background: 'var(--shark)' }} />
              <span style={{ width: 8, height: 8, background: 'var(--gold)' }} />
              <span style={{ width: 8, height: 8, background: 'var(--jade)' }} />
              <span style={{ marginLeft: 8, color: 'var(--fg-dim)' }}>iris@dropforge:~/router$</span>
            </div>
            <div style={{ padding: 14, fontSize: 12, lineHeight: 1.7 }}>
              <div><span style={{ color: 'var(--jade)' }}>›</span> [14:38:04] mia → "viral scout: 142 vidéos / 4 candidates"</div>
              <div><span style={{ color: 'var(--jade)' }}>›</span> [14:38:11] yuki → score(halo_lamp) = <strong style={{ color: 'var(--gold)' }}>87/100</strong></div>
              <div><span style={{ color: 'var(--jade)' }}>›</span> [14:38:22] diego → cotation_1688(3 fournisseurs) ok</div>
              <div><span style={{ color: 'var(--shark)' }}>!</span> [14:38:29] theo → cap budget = <strong>€280 / 48h</strong></div>
              <div><span style={{ color: 'var(--jade)' }}>›</span> [14:38:30] iris → route(jay) = sonnet (latence 240ms)</div>
              <div><span style={{ color: 'var(--jade)' }}>›</span> [14:38:31] kai → render(8 visuals) ETA 12min</div>
              <div><span style={{ color: 'var(--gold)' }}>★</span> [14:39:02] victor → <strong>"Sprint 014 lancé"</strong> ▮</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="page" style={{ paddingTop: 0 }}>
        <KPIStrip />
      </section>

      {/* Action cards */}
      <section className="page" style={{ paddingTop: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>POINTS D'ENTRÉE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <ActionCard
            tag="01" title="Chat avec Victor"
            desc="Brief le CEO. Il fait ses 5 minutes de réflexion, puis délègue aux bons agents. Tu reçois la synthèse."
            cta="→ Ouvrir le chat" onClick={() => onNavigate('chat')} accent
          />
          <ActionCard
            tag="02" title="Office"
            desc="Vue top-down du bureau. 25 sprites pixel à leur poste. Hover pour le rôle, click pour la skill library."
            cta="◉ Entrer au bureau" onClick={() => onNavigate('office')}
          />
          <ActionCard
            tag="03" title="Reports"
            desc="Tous les rapports livrés par Victor. Filtre par agent, date, type. TL;DR + détails à la demande."
            cta="📑 Voir les rapports" onClick={() => onNavigate('reports')}
          />
        </div>
      </section>

      {/* Roster */}
      <section className="page" style={{ paddingTop: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
          <h2>La roster</h2>
          <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>25 agents · 6 LLM tiers · 0 humain</span>
        </div>

        {[
          { key: 'C-Suite',    label: 'C-SUITE',     sub: 'décide, arbitre, route' },
          { key: 'Manager',    label: 'MANAGERS',    sub: 'orchestrent les pôles' },
          { key: 'Specialist', label: 'SPECIALISTS', sub: 'exécutent, mesurent, livrent' },
        ].map(group => (
          <div key={group.key} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
              <span className="chip chip-accent">{group.label}</span>
              <span className="mono" style={{ color: 'var(--fg-dim)', fontSize: 11 }}>{grouped[group.key].length} · {group.sub}</span>
              <span style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 8 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {grouped[group.key].map(a => <RosterCard key={a.id} agent={a} />)}
            </div>
          </div>
        ))}
      </section>

      {/* Footer / mantra */}
      <footer className="page-tight" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <div className="card" style={{
          padding: '40px 28px',
          textAlign: 'center',
          borderColor: 'var(--accent)',
          background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent) 6%, transparent))',
        }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>// MANTRA</div>
          <p className="pixel-font" style={{
            fontSize: 38, lineHeight: 1.15, letterSpacing: '1px', margin: 0,
          }}>
            We don't build sites.<br />
            <span style={{ color: 'var(--accent)' }}>We build cash machines.</span>
          </p>
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>© 2026 DROPFORGE INC.</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>v0.4.7 · phase {LIVE_STATS.phase}/3</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>built with rage 🦈</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ActionCard({ tag, title, desc, cta, onClick, accent }) {
  return (
    <button className="card card-hover" onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: 20, textAlign: 'left',
        borderColor: accent ? 'var(--accent)' : 'var(--border)',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{tag}.</span>
        <h3 style={{ flex: 1 }}>{title}</h3>
        <span style={{ color: 'var(--accent)' }} aria-hidden="true">→</span>
      </div>
      <p style={{ margin: 0, color: 'var(--fg-2)', fontSize: 14 }}>{desc}</p>
      <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cta}</span>
    </button>
  );
}

function RosterCard({ agent }) {
  const meta = TEAM_META[agent.team] || {};
  return (
    <div className="card card-hover" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
      <AgentAvatar agent={agent} size={36} idle />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{agent.name}</span>
          <span aria-hidden="true" style={{ fontSize: 12 }}>{agent.emoji}</span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {agent.role}
        </div>
      </div>
      <span className="chip mono" style={{ fontSize: 9, padding: '2px 6px' }}>{agent.llm}</span>
    </div>
  );
}

Object.assign(window, { LandingPage });
