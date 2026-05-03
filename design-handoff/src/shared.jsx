/* ============================================================
   Shared UI — TopBar, Ticker, KPI strip, Drawer, etc.
   ============================================================ */

const { useState, useEffect, useRef, useMemo } = React;

/* Animated counter hook */
function useAnimatedNumber(target, duration = 800) {
  const [val, setVal] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const start = prevRef.current;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(start + (target - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ------- TOPBAR ------- */
function TopBar({ route, onNavigate }) {
  const links = [
    { id: 'landing', label: 'Home',    path: '/' },
    { id: 'chat',    label: 'Chat',    path: '/chat' },
    { id: 'office',  label: 'Office',  path: '/office' },
    { id: 'reports', label: 'Reports', path: '/reports' },
  ];
  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        <a href="#/" onClick={(e)=>{e.preventDefault(); onNavigate('landing');}} className="brand" aria-label="DropForge home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>DROPFORGE</span>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-pixel)', fontSize: 22 }}>🦈</span>
        </a>
        <nav className="nav" aria-label="Navigation principale">
          {links.map(l => (
            <a key={l.id}
               href={`#${l.path}`}
               onClick={(e)=>{e.preventDefault(); onNavigate(l.id);}}
               className={route === l.id ? 'active' : ''}
               aria-current={route === l.id ? 'page' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="topbar-right">
          <span className="chip" style={{ gap: 6 }}>
            <span className="live-dot" aria-hidden="true" />
            PHASE {LIVE_STATS.phase} · LIVE
          </span>
          <span className="chip mono" style={{ background: 'transparent' }}>
            {LIVE_STATS.agentsActive}/{LIVE_STATS.agentsTotal} agents
          </span>
        </div>
      </div>
    </header>
  );
}

/* ------- TICKER ------- */
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker scanlines" role="marquee" aria-label="Indicateurs live">
      <div className="ticker-track">
        {items.map((it, i) => (
          <span key={i} className="ticker-item">
            <span style={{ color: 'var(--fg-dim)' }}>{it.sym}</span>
            <strong>{it.val}</strong>
            <span className={it.dir}>{it.delta}</span>
            <span style={{ color: 'var(--border-2)' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------- KPI STRIP ------- */
function KPIStrip({ compact = false }) {
  const rev = useAnimatedNumber(LIVE_STATS.revenue);
  const orders = useAnimatedNumber(LIVE_STATS.ordersToday);
  const roas = useAnimatedNumber(LIVE_STATS.roas);
  const burn = useAnimatedNumber(LIVE_STATS.iaSpendMonth);

  const formatEuro = (n) => '€' + Math.round(n).toLocaleString('fr-FR');
  const burnPct = (LIVE_STATS.iaSpendMonth / LIVE_STATS.iaSpendCap) * 100;

  return (
    <div className="kpi-grid" role="group" aria-label="KPIs live">
      <div className="kpi">
        <span className="kpi-label">CA · jour</span>
        <span className="kpi-value">{formatEuro(rev)}</span>
        <span className="kpi-delta up">▲ +18.4%</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Commandes · 24h</span>
        <span className="kpi-value">{Math.round(orders)}</span>
        <span className="kpi-delta up">▲ +9 vs hier</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">ROAS courant</span>
        <span className="kpi-value">{roas.toFixed(2)}x</span>
        <span className="kpi-delta up">▲ +0.21</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">IA spend · mois</span>
        <span className="kpi-value">${burn.toFixed(1)}</span>
        <div style={{ height: 4, background: 'var(--bg-3)', marginTop: 4, position: 'relative' }} aria-label={`Cap IA $${LIVE_STATS.iaSpendCap}`}>
          <div style={{ width: `${burnPct}%`, height: '100%', background: 'var(--accent)' }} />
          <span style={{ position: 'absolute', right: -6, top: -2, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--fg-dim)' }}>${LIVE_STATS.iaSpendCap}</span>
        </div>
      </div>
      <div className="kpi">
        <span className="kpi-label">Agents actifs</span>
        <span className="kpi-value">{LIVE_STATS.agentsActive}<span style={{ color: 'var(--fg-dim)', fontSize: 16 }}>/{LIVE_STATS.agentsTotal}</span></span>
        <span className="kpi-delta" style={{ color: 'var(--jade)' }}>● live</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Phase courante</span>
        <span className="kpi-value">{LIVE_STATS.phase}<span style={{ color: 'var(--fg-dim)', fontSize: 16 }}>/3</span></span>
        <span className="kpi-delta" style={{ color: 'var(--gold)' }}>scale</span>
      </div>
    </div>
  );
}

/* ------- DRAWER ------- */
function Drawer({ open, onClose, title, children, side = 'right', width = 460 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
         style={{
           position: 'fixed', inset: 0, zIndex: 100,
         }}>
      <div onClick={onClose}
           style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
           aria-hidden="true" />
      <aside
        style={{
          position: 'absolute', top: 0, bottom: 0,
          [side]: 0,
          width: Math.min(width, window.innerWidth - 24),
          background: 'var(--bg-2)',
          borderLeft: side === 'right' ? '1px solid var(--border)' : 'none',
          borderRight: side === 'left'  ? '1px solid var(--border)' : 'none',
          display: 'flex', flexDirection: 'column',
          animation: 'slidein 200ms ease-out',
        }}
      >
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <h3 style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-dim)' }}>{title}</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px' }}>
          {children}
        </div>
      </aside>
      <style>{`
        @keyframes slidein {
          from { transform: translateX(${side === 'right' ? '100%' : '-100%'}); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

/* ------- AGENT DETAILS DRAWER (shared by chat & office) ------- */
function AgentDetail({ agent, recentTasks }) {
  if (!agent) return null;
  const meta = TEAM_META[agent.team] || {};
  const tasks = recentTasks || [
    { date: 'aujourd\'hui · 14:38', text: agent.task, status: 'en cours' },
    { date: 'aujourd\'hui · 11:12', text: 'Revue brief CMO + alignement vibe', status: 'done' },
    { date: 'hier · 19:04',         text: 'Itération v2 sur output Q3', status: 'done' },
    { date: 'hier · 15:30',         text: 'Sync avec ' + (agent.team === 'C-Suite' ? 'CEO' : 'manager'), status: 'done' },
    { date: '02 mai · 09:12',       text: 'Bootstrap sprint hebdo', status: 'done' },
  ];
  const skills = {
    'Research': ['scrape_tiktok', 'sourcing_1688', 'product_score', 'trend_radar', 'niche_map'],
    'Content':  ['copy_seo', 'render_visual', 'edit_video', 'schedule_social', 'flow_email'],
    'Growth':   ['campaign_meta', 'campaign_tiktok', 'cohort_analysis', 'ab_test', 'cro_audit'],
    'Ops':      ['fulfillment', 'supplier_negociation', 'support_ticket', 'packaging_design'],
    'Strategic':['niche_radar', 'brand_naming', 'positioning'],
    'C-Suite':  ['delegate', 'arbitrage', 'budget_freeze', 'router_llm'],
  }[agent.team] || ['ping', 'report', 'delegate'];

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <header style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <AgentAvatar agent={agent} size={56} idle halo />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ fontSize: 20 }}>{agent.name}</h2>
            <span aria-hidden="true">{agent.emoji}</span>
          </div>
          <div className="mono" style={{ color: 'var(--fg-dim)', fontSize: 12, marginBottom: 6 }}>{agent.role}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`chip chip-${meta.color === 'red' ? 'accent' : (meta.color === 'gold' ? 'gold' : (meta.color === 'violet' ? 'violet' : 'jade'))}`}>{meta.label}</span>
            <span className="chip">LLM · {agent.llm}</span>
            <span className={`chip ${agent.status === 'active' ? 'chip-jade' : ''}`}>{agent.status === 'active' ? '● actif' : '○ idle'}</span>
          </div>
        </div>
      </header>

      <blockquote className="card" style={{
        margin: 0, padding: '12px 14px',
        borderLeft: '3px solid var(--accent)',
        fontFamily: 'var(--font-mono)', fontSize: 13, fontStyle: 'italic',
      }}>
        « {agent.mantra} »
      </blockquote>

      <section>
        <div className="eyebrow" style={{ marginBottom: 10 }}>5 dernières tâches</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {tasks.slice(0, 5).map((t, i) => (
            <li key={i} className="card" style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                width: 6, height: 6, marginTop: 7,
                background: t.status === 'done' ? 'var(--jade)' : 'var(--accent)',
              }} aria-hidden="true" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{t.text}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{t.date} · {t.status}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Skill library</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {skills.map(s => <span key={s} className="chip mono">{s}()</span>)}
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="btn btn-primary">→ Déléguer une tâche</button>
        <button className="btn">Voir logs</button>
      </div>
    </div>
  );
}

Object.assign(window, {
  TopBar, Ticker, KPIStrip, Drawer, AgentDetail, useAnimatedNumber,
});
