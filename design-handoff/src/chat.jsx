/* ============================================================
   Page: CHAT /chat
   ============================================================ */

function ChatPage({ onNavigate }) {
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [input, setInput] = useState('');
  const [drawerAgentId, setDrawerAgentId] = useState(null);
  const [drawerSubtask, setDrawerSubtask] = useState(null);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    const userMsg = { id: Date.now(), from: 'user', text: t, time: nowHM() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = mockVictorReply(t);
      setMessages(m => [...m, reply]);
      setTyping(false);
    }, 1100);
  };

  const drawerAgent = AGENTS.find(a => a.id === drawerAgentId);

  return (
    <main role="main" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 0, height: 'calc(100vh - 62px)' }}>
      {/* CHAT COLUMN */}
      <section style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', minWidth: 0 }}>
        {/* Chat header */}
        <header style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 12, alignItems: 'center',
          background: 'var(--bg-2)',
        }}>
          <AgentAvatar agent={AGENTS[0]} size={36} idle halo />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong>Victor Hale</strong>
              <span aria-hidden="true">🎩</span>
              <span className="chip chip-jade" style={{ fontSize: 10 }}>● online</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>
              CEO · Opus 4.7 · délègue à 24 agents
            </div>
          </div>
          <button className="btn btn-ghost" aria-label="Effacer la conversation" onClick={() => setMessages(CHAT_MESSAGES)}>↺</button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {messages.map(m => (
            <Message key={m.id} msg={m}
                     onAgentClick={(id, label) => { setDrawerAgentId(id); setDrawerSubtask(label); }} />
          ))}
          {typing && <TypingBubble />}
        </div>

        {/* Quick prompts */}
        <div style={{ padding: '8px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p}
              className="chip"
              style={{ cursor: 'pointer' }}
              onClick={() => setInput(p)}>
              + {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          style={{ padding: '12px 24px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'var(--bg-2)' }}>
          <input
            type="text"
            placeholder="Écris à Victor…"
            aria-label="Message à Victor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-3)',
              border: '1px solid var(--border-2)',
              padding: '10px 14px',
              outline: 'none',
              fontSize: 14,
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
            Envoyer →
          </button>
        </form>
      </section>

      {/* SIDEBAR */}
      <aside style={{ background: 'var(--bg-2)', overflowY: 'auto' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Active right now</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>
            {ACTIVE_NOW.length} agents en train de bosser
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {ACTIVE_NOW.map((it, i) => {
            const a = AGENTS.find(ag => ag.id === it.id);
            if (!a) return null;
            return (
              <li key={i} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AgentAvatar agent={a} size={32} idle />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <strong style={{ fontSize: 13 }}>{a.name}</strong>
                    <span style={{ fontSize: 11 }} aria-hidden>{a.emoji}</span>
                  </div>
                  <div className="mono" style={{
                    fontSize: 11, color: 'var(--fg-dim)',
                    background: 'var(--bg-3)', padding: '4px 8px',
                    marginTop: 4, position: 'relative',
                    border: '1px solid var(--border)',
                  }}>
                    {it.text}<span style={{ animation: 'blink-dots 1.4s infinite', color: 'var(--accent)' }}>…</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>IA Router · Iris</div>
          <RouterMini />
        </div>

        <style>{`
          @keyframes blink-dots {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </aside>

      <Drawer
        open={!!drawerAgentId}
        onClose={() => setDrawerAgentId(null)}
        title={drawerAgent ? `Délégation → ${drawerAgent.name}` : ''}
      >
        {drawerAgent && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="card" style={{ padding: '12px 14px', borderColor: 'var(--accent)' }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Sous-tâche assignée</div>
              <div style={{ fontSize: 14 }}>{drawerSubtask}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 6 }}>
                ETA · 12 min · LLM · {drawerAgent.llm} · coût estimé · $0.03
              </div>
            </div>
            <AgentDetail agent={drawerAgent} />
          </div>
        )}
      </Drawer>
    </main>
  );
}

function Message({ msg, onAgentClick }) {
  const isUser = msg.from === 'user';
  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '70%' }}>
          <div className="card" style={{
            padding: '10px 14px',
            background: 'var(--accent)', color: 'var(--accent-fg)',
            borderColor: 'var(--accent)',
          }}>
            {msg.text}
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)', textAlign: 'right', marginTop: 4 }}>
            {msg.time} · vous
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <AgentAvatar agent={AGENTS[0]} size={36} idle />
      <div style={{ maxWidth: '72%' }}>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 6 }}>
            <strong style={{ fontSize: 13 }}>Victor</strong>
            <span aria-hidden="true">🎩</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>· {msg.time}</span>
          </div>
          <div style={{ fontSize: 14 }}>{msg.text}</div>
          {msg.delegated && msg.delegated.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {msg.delegated.map((d, i) => {
                const a = AGENTS.find(ag => ag.id === d.to);
                if (!a) return null;
                return (
                  <button key={i}
                    onClick={() => onAgentClick(d.to, d.label)}
                    className="chip"
                    style={{
                      cursor: 'pointer',
                      background: 'var(--bg-3)',
                      border: '1px solid var(--border-2)',
                    }}
                    title={d.label}>
                    → délégué à <strong style={{ marginLeft: 2 }}>{a.name.split(' ')[0]}</strong> {a.emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <AgentAvatar agent={AGENTS[0]} size={36} idle />
      <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, background: 'var(--fg-dim)',
            animation: `bounce 1s ${i * 0.15}s infinite`,
          }} />
        ))}
        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); opacity: 0.4 } 50% { transform: translateY(-3px); opacity: 1 } }`}</style>
      </div>
    </div>
  );
}

function RouterMini() {
  const lanes = [
    { name: 'Haiku',   pct: 71, color: 'var(--jade)' },
    { name: 'Sonnet',  pct: 24, color: 'var(--gold)' },
    { name: 'Opus 4.7', pct: 5, color: 'var(--accent)' },
  ];
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {lanes.map(l => (
        <div key={l.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <span>{l.name}</span><span style={{ color: 'var(--fg-dim)' }}>{l.pct}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-3)', marginTop: 2 }}>
            <div style={{ width: `${l.pct}%`, height: '100%', background: l.color }} />
          </div>
        </div>
      ))}
      <div className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 4 }}>
        1,247 req/h · burn $0.31/h
      </div>
    </div>
  );
}

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function mockVictorReply(text) {
  const t = text.toLowerCase();
  let body, delegated = [];
  if (t.includes('produit') || t.includes('trouve')) {
    body = "OK. Mia scrape les hashtags TikTok depuis 2h, j'ai 4 candidats à 8M+ vues. Yuki score les 4 d'ici 1h, Diego sort les cotations 1688 en parallèle. Je te shortlist 2 produits ce soir avec marge nette projetée.";
    delegated = [{ to: 'mia', label: 'Shortlist 4 candidats viraux' }, { to: 'yuki', label: 'Score produits sur 100' }, { to: 'diego', label: 'Cotation 1688 (3 fournisseurs)' }];
  } else if (t.includes('budget') || t.includes('spend') || t.includes('burn')) {
    body = "Burn IA $31.4 / $50 cap. Iris a basculé 60% du non-critique sur Haiku. Côté ads: €280/48h sur Halo Lamp, ROAS 2.78x à 24h, Théo a débloqué +€320/j. On finit le mois confortablement.";
    delegated = [{ to: 'theo', label: 'Mise à jour cap budget' }, { to: 'iris', label: 'Routing Haiku ratio' }];
  } else if (t.includes('test ad') || t.includes('lance')) {
    body = "Je lance. Kai sort 8 créatives en 12 minutes (5 angles × 3 vibes), Tom prépare 2 UGC, Jay setup la campagne Meta + TikTok dès que les assets sont prêts. Cap initial €280/48h, kill auto si ROAS < 1.8x à 24h.";
    delegated = [{ to: 'kai', label: '8 créatives — 5 angles' }, { to: 'tom', label: '2 UGC vidéos hook 1.5s' }, { to: 'jay', label: 'Campagne Meta + TikTok' }];
  } else if (t.includes('daily') || t.includes('summary') || t.includes('rapport')) {
    body = "Daily: CA €12,847 (+18.4%), 218 commandes, ROAS 3.42x, NPS 72. Halo Lamp en scale (+€320/j). Pet Brush V2 killed (CVR 0.6%). Burn IA dans le cap. Rapport complet poussé dans /reports.";
    delegated = [{ to: 'anna', label: 'Synthèse data jour' }, { to: 'theo', label: 'Check finance' }];
  } else if (t.includes('kill') || t.includes('produit')) {
    body = "Compris. Yuki re-score, Anna confirme la perf data 7 jours, je sors le produit du catalogue à minuit avec Hugo qui gère les commandes en cours. Aria note la niche pour ne plus y retourner.";
    delegated = [{ to: 'yuki', label: 'Re-score produit' }, { to: 'anna', label: 'Perf 7 jours' }, { to: 'hugo', label: 'Gestion fin de stock' }];
  } else if (t.includes('fournisseur') || t.includes('supplier')) {
    body = "Diego a 3 cotations en cours. Chen Wu négocie -25% sur la 1ère offre comme d'hab. Je te pousse les 3 prix + délai + qualité dans 2h.";
    delegated = [{ to: 'diego', label: 'Cotation 1688' }, { to: 'chen', label: 'Négo -25%' }];
  } else {
    body = "Reçu. Je décide en 5min, on exécute en 24h. Je délègue, je te re-pinge avec une synthèse.";
    delegated = [{ to: 'iris', label: 'Routing tâche optimal' }];
  }
  return { id: Date.now() + 1, from: 'victor', text: body, time: nowHM(), delegated };
}

Object.assign(window, { ChatPage });
