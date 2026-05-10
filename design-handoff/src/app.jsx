/* ============================================================
   App entry — router + Tweaks panel
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "density": "cosy",
  "accent": "#e63946"
}/*EDITMODE-END*/;

function App() {
  const [route, setRoute] = useState('landing');
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-density', tweaks.density);
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    // Derive accent-fg
    const c = tweaks.accent.toLowerCase();
    const isLight = c === '#e9c46a' || c === '#5cb89a' || c === '#f5f1e8';
    document.documentElement.style.setProperty('--accent-fg', isLight ? '#0f1115' : '#fff');
  }, [tweaks]);

  // Hash routing (optional, supports /#/chat etc.)
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (['chat','office','reports','landing'].includes(h)) setRoute(h || 'landing');
      else if (h === '') setRoute('landing');
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const navigate = (id) => {
    setRoute(id);
    window.location.hash = id === 'landing' ? '/' : `/${id}`;
    window.scrollTo(0, 0);
  };

  let Page;
  if (route === 'chat')    Page = <ChatPage onNavigate={navigate} />;
  else if (route === 'office')  Page = <OfficePage />;
  else if (route === 'reports') Page = <ReportsPage />;
  else                          Page = <LandingPage onNavigate={navigate} />;

  return (
    <>
      <TopBar route={route} onNavigate={navigate} />
      {Page}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Apparence">
          <TweakRadio label="Thème" value={tweaks.theme} onChange={v => setTweak('theme', v)}
            options={['dark','light']} />
          <TweakRadio label="Densité" value={tweaks.density} onChange={v => setTweak('density', v)}
            options={['compact','cosy']} />
        </TweakSection>
        <TweakSection label="Couleur d'accent">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {[
              { c: '#e63946', n: 'Shark' },
              { c: '#e9c46a', n: 'Gold' },
              { c: '#5cb89a', n: 'Jade' },
              { c: '#b794d4', n: 'Violet' },
              { c: '#3a6ea5', n: 'Steel' },
            ].map(o => (
              <button key={o.c}
                onClick={() => setTweak('accent', o.c)}
                aria-label={o.n}
                title={o.n}
                style={{
                  height: 32, background: o.c,
                  border: tweaks.accent === o.c ? '2px solid var(--fg)' : '1px solid var(--border-2)',
                  cursor: 'pointer',
                }} />
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
