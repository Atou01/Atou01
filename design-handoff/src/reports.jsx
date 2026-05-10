/* ============================================================
   Page: REPORTS /reports
   ============================================================ */

const REPORT_TYPES = ['Tous', 'Daily', 'Product', 'Growth', 'Content', 'Ops', 'Finance'];

function ReportsPage() {
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [agentFilter, setAgentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);

  const filtered = REPORTS.filter(r => {
    if (typeFilter !== 'Tous' && r.type !== typeFilter) return false;
    if (agentFilter !== 'all' && !r.agents.includes(agentFilter)) return false;
    if (search && !(r.title.toLowerCase().includes(search.toLowerCase()) || r.tldr.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const open = REPORTS.find(r => r.id === openId);

  return (
    <main role="main">
      <section className="page" style={{ paddingTop: 18, paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 16 }}>
          <h2>Reports <span style={{ color: 'var(--fg-dim)' }}>// timeline</span></h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{filtered.length}/{REPORTS.length} rapports</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 8 }} />
        </div>

        {/* Filter bar */}
        <div className="card" style={{ padding: 14, marginBottom: 18, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {REPORT_TYPES.map(t => (
              <button key={t}
                onClick={() => setTypeFilter(t)}
                className="chip"
                style={{
                  cursor: 'pointer',
                  background: typeFilter === t ? 'var(--accent)' : 'var(--bg-3)',
                  color: typeFilter === t ? 'var(--accent-fg)' : 'var(--fg-2)',
                  borderColor: typeFilter === t ? 'var(--accent)' : 'var(--border)',
                }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="search"
              placeholder="Rechercher dans titres + TL;DR…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: '1 1 280px',
                background: 'var(--bg-3)',
                border: '1px solid var(--border-2)',
                padding: '8px 12px',
                outline: 'none',
                fontSize: 13,
              }}
              aria-label="Rechercher un rapport"
            />
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              aria-label="Filtrer par agent"
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border-2)',
                padding: '8px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--fg)',
              }}
            >
              <option value="all">— tous les agents —</option>
              {AGENTS.map(a => (
                <option key={a.id} value={a.id}>{a.name} · {a.role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline */}
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: 8, bottom: 8, width: 1,
            background: 'var(--border)',
          }} aria-hidden />
          {filtered.length === 0 && (
            <li className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--fg-dim)' }}>
              <span className="mono">// aucun rapport ne match les filtres</span>
            </li>
          )}
          {filtered.map(r => (
            <li key={r.id} style={{ position: 'relative', paddingLeft: 38, marginBottom: 12 }}>
              <span style={{
                position: 'absolute', left: 8, top: 16,
                width: 14, height: 14, borderRadius: 0,
                background: tagColor(r.tag), border: '2px solid var(--bg)',
                boxShadow: '0 0 0 1px var(--border)',
              }} aria-hidden />
              <ReportCard report={r} onOpen={() => setOpenId(r.id)} />
            </li>
          ))}
        </ol>
      </section>

      <Drawer open={!!openId} onClose={() => setOpenId(null)} title={open ? open.type + ' · détails' : ''} width={540}>
        {open && <ReportDetail report={open} />}
      </Drawer>
    </main>
  );
}

function tagColor(t) {
  return { win: 'var(--jade)', go: 'var(--gold)', kill: 'var(--accent)', flag: 'var(--violet)', note: 'var(--fg-dim)' }[t] || 'var(--fg-dim)';
}

function ReportCard({ report, onOpen }) {
  return (
    <article className="card card-hover" style={{ padding: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>{report.date}</span>
            <span className="chip mono" style={{ fontSize: 9 }}>{report.type.toUpperCase()}</span>
            <TagChip tag={report.tag} />
          </div>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>{report.title}</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)' }}>{report.tldr}</p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>par</span>
            {report.agents.map(id => {
              const a = AGENTS.find(ag => ag.id === id);
              if (!a) return null;
              return (
                <span key={id} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                  <PixelSprite skin={a.skin} size={18} idle />
                  <span className="mono" style={{ fontSize: 11 }}>{a.name.split(' ')[0]}</span>
                </span>
              );
            })}
          </div>
        </div>
        <button className="btn" onClick={onOpen} style={{ flexShrink: 0 }}>
          voir détails →
        </button>
      </div>
    </article>
  );
}

function TagChip({ tag }) {
  const map = {
    win:  { label: '★ WIN',   cls: 'chip-jade' },
    go:   { label: '▶ GO',    cls: 'chip-gold' },
    kill: { label: '✕ KILL',  cls: 'chip-accent' },
    flag: { label: '⚑ FLAG',  cls: 'chip-violet' },
    note: { label: '· NOTE',  cls: '' },
  };
  const m = map[tag] || map.note;
  return <span className={`chip ${m.cls}`} style={{ fontSize: 9 }}>{m.label}</span>;
}

function ReportDetail({ report }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 4 }}>{report.date}</div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>{report.title}</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="chip mono">{report.type.toUpperCase()}</span>
          <TagChip tag={report.tag} />
        </div>
      </header>

      <section className="card" style={{ padding: 14, borderLeft: '3px solid var(--accent)' }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>TL;DR</div>
        <p style={{ margin: 0, fontSize: 14 }}>{report.tldr}</p>
      </section>

      <section>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Métriques clés</div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="kpi"><span className="kpi-label">CA contribué</span><span className="kpi-value">€2,140</span><span className="kpi-delta up">▲ +12%</span></div>
          <div className="kpi"><span className="kpi-label">Coût IA</span><span className="kpi-value">$1.84</span><span className="kpi-delta">42 req</span></div>
          <div className="kpi"><span className="kpi-label">Durée tâche</span><span className="kpi-value">12m 04s</span><span className="kpi-delta">3 agents</span></div>
          <div className="kpi"><span className="kpi-label">Confiance</span><span className="kpi-value">94%</span><span className="kpi-delta up">val. statistique</span></div>
        </div>
      </section>

      <section>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Agents impliqués</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {report.agents.map(id => {
            const a = AGENTS.find(ag => ag.id === id);
            if (!a) return null;
            return (
              <div key={id} className="card" style={{ padding: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                <AgentAvatar agent={a} size={28} idle />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 13 }}>{a.name}</strong>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{a.role}</div>
                </div>
                <span className="chip mono" style={{ fontSize: 9 }}>{a.llm}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Décision suivante</div>
        <div className="card" style={{ padding: 12, fontSize: 13 }}>
          <span className="mono" style={{ color: 'var(--accent)' }}>▶</span> {report.tag === 'kill' ? 'Sortir du catalogue à minuit, log niche dans Aria.' : report.tag === 'go' ? 'Scale validé. Cap journalier débloqué.' : 'Aucune action requise — monitoring continu.'}
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary">📥 Exporter PDF</button>
        <button className="btn">↗ Partager</button>
      </div>
    </div>
  );
}

Object.assign(window, { ReportsPage });
