/* ============================================================
   Page: OFFICE /office — top-down avec murs, portes, pathfinding
   ============================================================ */

const OFFICE_W = 32;
const OFFICE_H = 22;

// Zones avec doors (porte = ouverture dans le mur, en coords absolues tile)
const ZONES = [
  { id: 'iris',     label: 'SERVERS · Iris',         color: 'violet', x: 1,  y: 1,  w: 7,  h: 6, doors: [{ x: 7, y: 4 }] },
  { id: 'research', label: 'RESEARCH · Sam',         color: 'green',  x: 9,  y: 1,  w: 9,  h: 6, doors: [{ x: 13, y: 6 }] },
  { id: 'content',  label: 'CONTENT · Elena',        color: 'pink',   x: 19, y: 1,  w: 12, h: 8, doors: [{ x: 24, y: 8 }] },
  { id: 'ceo',      label: 'C-SUITE · Victor',       color: 'red',    x: 12, y: 8,  w: 6,  h: 5, doors: [{ x: 14, y: 12 }, { x: 17, y: 10 }] },
  { id: 'growth',   label: 'GROWTH · Ravi',          color: 'orange', x: 1,  y: 8,  w: 10, h: 5, doors: [{ x: 9, y: 12 }] },
  { id: 'cfo',      label: 'CFO · Théo',             color: 'gold',   x: 19, y: 9,  w: 7,  h: 4, doors: [{ x: 22, y: 12 }] },
  { id: 'cto',      label: 'CTO + KITCHEN · Nora',   color: 'gray',   x: 26, y: 9,  w: 5,  h: 4, doors: [{ x: 28, y: 12 }] },
  { id: 'ops',      label: 'OPS · Marc',             color: 'teal',   x: 1,  y: 14, w: 18, h: 7, doors: [{ x: 17, y: 14 }] },
  { id: 'lounge',   label: 'COFFEE LOUNGE',          color: 'paper',  x: 20, y: 14, w: 11, h: 7, doors: [{ x: 20, y: 16 }] },
];

const DESKS = {
  victor: { x: 14, y: 10, dir: 'down' },
  iris:   { x: 3,  y: 3,  dir: 'down' },

  sam:    { x: 10, y: 2,  dir: 'down' },
  mia:    { x: 13, y: 2,  dir: 'down' },
  diego:  { x: 16, y: 2,  dir: 'down' },
  yuki:   { x: 11, y: 4,  dir: 'down' },

  elena:  { x: 20, y: 2,  dir: 'down' },
  maya:   { x: 23, y: 2,  dir: 'down' },
  lea:    { x: 26, y: 2,  dir: 'down' },
  kai:    { x: 29, y: 2,  dir: 'down' },
  tom:    { x: 21, y: 6,  dir: 'down' },
  zoe:    { x: 24, y: 6,  dir: 'down' },
  noor:   { x: 27, y: 6,  dir: 'down' },
  bea:    { x: 29, y: 6,  dir: 'down' },

  ravi:   { x: 2,  y: 9,  dir: 'down' },
  jay:    { x: 5,  y: 9,  dir: 'down' },
  anna:   { x: 8,  y: 9,  dir: 'down' },
  hana:   { x: 5,  y: 11, dir: 'down' },

  theo:   { x: 21, y: 11, dir: 'down' },
  nora:   { x: 28, y: 11, dir: 'down' },

  marc:   { x: 3,  y: 15, dir: 'down' },
  hugo:   { x: 6,  y: 15, dir: 'down' },
  sofia:  { x: 9,  y: 15, dir: 'down' },
  chen:   { x: 12, y: 15, dir: 'down' },
  ines:   { x: 15, y: 15, dir: 'down' },
};

// Points d'intérêt (dans le lounge ou hallway)
const POIS = [
  { x: 24, y: 17, name: 'Coffee', icon: '☕' },
  { x: 27, y: 17, name: 'Snack',  icon: '🥐' },
  { x: 22, y: 19, name: 'Couch1', icon: '🛋️' },
  { x: 26, y: 19, name: 'Couch2', icon: '🛋️' },
  { x: 14, y: 13, name: 'CEOhall' },
  { x: 19, y: 13, name: 'Junction' },
];

/* ----- WALL & WALKABLE GRID ----- */
function buildGrid() {
  // 0 = walkable, 1 = wall, 2 = desk (occupied by owner)
  const g = Array.from({ length: OFFICE_H }, () => Array(OFFICE_W).fill(0));

  // Walls around each zone
  for (const z of ZONES) {
    for (let x = z.x; x < z.x + z.w; x++) {
      g[z.y][x] = 1;
      g[z.y + z.h - 1][x] = 1;
    }
    for (let y = z.y; y < z.y + z.h; y++) {
      g[y][z.x] = 1;
      g[y][z.x + z.w - 1] = 1;
    }
    // Doors → walkable
    for (const d of z.doors || []) {
      if (g[d.y] && g[d.y][d.x] !== undefined) g[d.y][d.x] = 0;
    }
  }

  // Desks block movement (chair tile is reachable, desk tile in front isn't)
  for (const id in DESKS) {
    const d = DESKS[id];
    // The desk tile is in front (dy=+1 if dir=down)
    const dx = d.x;
    const dy = d.y + (d.dir === 'down' ? 1 : -1);
    if (g[dy] && g[dy][dx] !== undefined) g[dy][dx] = 2;
  }

  // Server rack & coffee/couch as obstacles
  const obstacles = [
    { x: 5, y: 4, w: 2, h: 1 },   // server rack
    { x: 24, y: 17, w: 1, h: 1 }, // coffee
    { x: 27, y: 17, w: 1, h: 1 }, // snack
    { x: 21, y: 19, w: 3, h: 1 }, // couch
    { x: 25, y: 19, w: 3, h: 1 }, // couch
    { x: 23, y: 11, w: 1, h: 1 }, // CFO monitors stand
  ];
  for (const o of obstacles) {
    for (let dx = 0; dx < o.w; dx++)
      for (let dy = 0; dy < o.h; dy++)
        if (g[o.y + dy] && g[o.y + dy][o.x + dx] !== undefined) g[o.y + dy][o.x + dx] = 2;
  }
  return g;
}

const STATIC_GRID = buildGrid();

/* ----- A* PATHFINDING ----- */
function findPath(sx, sy, tx, ty, grid) {
  const inB = (x, y) => x >= 0 && y >= 0 && x < OFFICE_W && y < OFFICE_H;
  const walkable = (x, y) => inB(x, y) && grid[y][x] !== 1; // walls block; desks pass through start/end
  if (!walkable(tx, ty)) return [];

  const key = (x, y) => `${x},${y}`;
  const open = new Map();
  const closed = new Set();
  const h = (x, y) => Math.abs(x - tx) + Math.abs(y - ty);
  open.set(key(sx, sy), { x: sx, y: sy, g: 0, f: h(sx, sy), parent: null });

  while (open.size) {
    let cur = null;
    for (const node of open.values()) if (!cur || node.f < cur.f) cur = node;
    if (!cur) break;
    if (cur.x === tx && cur.y === ty) {
      const path = [];
      let n = cur;
      while (n) { path.push({ x: n.x, y: n.y }); n = n.parent; }
      return path.reverse();
    }
    open.delete(key(cur.x, cur.y));
    closed.add(key(cur.x, cur.y));

    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (!walkable(nx, ny)) continue;
      // allow stepping on desks only if it IS the start or target
      if (grid[ny][nx] === 2 && !(nx === tx && ny === ty) && !(nx === sx && ny === sy)) continue;
      const k = key(nx, ny);
      if (closed.has(k)) continue;
      const ng = cur.g + 1;
      const ex = open.get(k);
      if (!ex || ng < ex.g) {
        open.set(k, { x: nx, y: ny, g: ng, f: ng + h(nx, ny), parent: cur });
      }
    }
  }
  return [];
}

function OfficePage() {
  const [hoverId, setHoverId] = useState(null);
  const [tip, setTip] = useState(null);
  const [drawerAgentId, setDrawerAgentId] = useState(null);
  const [agentState, setAgentState] = useState(() => {
    const s = {};
    for (const a of AGENTS) {
      const d = DESKS[a.id];
      if (d) s[a.id] = { x: d.x, y: d.y, fx: d.x, fy: d.y, path: [], frame: 0, walking: false, idleTicks: Math.floor(Math.random() * 80) };
    }
    return s;
  });

  const drawerAgent = AGENTS.find(a => a.id === drawerAgentId);

  useEffect(() => {
    const tick = setInterval(() => {
      setAgentState(prev => {
        const next = {};
        for (const a of AGENTS) {
          const cur = prev[a.id];
          if (!cur) continue;
          const c = { ...cur };

          if (c.path.length > 0) {
            // smoothly move toward next path tile
            const nextTile = c.path[0];
            const dx = nextTile.x - c.fx;
            const dy = nextTile.y - c.fy;
            const speed = 0.25;
            if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
              c.fx = nextTile.x; c.fy = nextTile.y;
              c.x = nextTile.x;  c.y = nextTile.y;
              c.path = c.path.slice(1);
              if (c.path.length === 0) {
                c.walking = false;
                c.idleTicks = 60 + Math.floor(Math.random() * 200);
              }
            } else {
              c.fx += Math.sign(dx) * Math.min(Math.abs(dx), speed);
              c.fy += Math.sign(dy) * Math.min(Math.abs(dy), speed);
              c.frame = (c.frame + 1) % 4;
              c.walking = true;
            }
          } else {
            c.idleTicks = Math.max(0, c.idleTicks - 1);
            // 1.5% chance par tick de partir, mais seulement si idle terminé
            if (c.idleTicks === 0 && Math.random() < 0.018 && a.status === 'active') {
              const desk = DESKS[a.id];
              const atDesk = c.x === desk.x && c.y === desk.y;
              let target;
              if (atDesk) {
                // go wander to a POI
                target = POIS[Math.floor(Math.random() * POIS.length)];
              } else {
                // go back to desk
                target = { x: desk.x, y: desk.y };
              }
              const path = findPath(c.x, c.y, target.x, target.y, STATIC_GRID);
              if (path.length > 1) {
                c.path = path.slice(1); // drop start
                c.walking = true;
              } else {
                c.idleTicks = 30;
              }
            }
          }
          next[a.id] = c;
        }
        return next;
      });
    }, 140);
    return () => clearInterval(tick);
  }, []);

  return (
    <main role="main">
      <section className="page" style={{ paddingTop: 18, paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
          <h2>Office <span style={{ color: 'var(--fg-dim)' }}>// top-down · live</span></h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-dim)' }}>
            25 sprites · 9 zones · murs + portes + pathfinding A*
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 8 }} />
        </div>
        <KPIStrip />
      </section>

      <section className="page" style={{ paddingTop: 18 }}>
        <div className="card" style={{ padding: 12, position: 'relative', overflow: 'hidden' }}>
          <OfficeFloor
            agentState={agentState}
            hoverId={hoverId}
            setHoverId={setHoverId}
            setTip={setTip}
            onClickAgent={(id) => setDrawerAgentId(id)}
          />
          {tip && <Tooltip tip={tip} />}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            {ZONES.filter(z => z.id !== 'lounge').map(z => (
              <span key={z.id} className="chip mono" style={{ fontSize: 10 }}>
                <span style={{ width: 8, height: 8, background: zoneColor(z.color), display: 'inline-block', border: '1px solid var(--border-2)' }} />
                {z.label}
              </span>
            ))}
            <span className="chip mono" style={{ fontSize: 10, marginLeft: 'auto' }}>
              ● actif · ○ idle · ▢ desk · ▭ porte
            </span>
          </div>
        </div>
      </section>

      <Drawer open={!!drawerAgentId} onClose={() => setDrawerAgentId(null)}
              title={drawerAgent ? `Agent · ${drawerAgent.name}` : ''}>
        {drawerAgent && <AgentDetail agent={drawerAgent} />}
      </Drawer>
    </main>
  );
}

function zoneColor(c) {
  return {
    red:    'color-mix(in srgb, var(--shark) 22%, transparent)',
    violet: 'color-mix(in srgb, var(--violet) 24%, transparent)',
    green:  'color-mix(in srgb, var(--jade) 24%, transparent)',
    pink:   'color-mix(in srgb, #d96a8c 22%, transparent)',
    orange: 'color-mix(in srgb, #e07a3a 24%, transparent)',
    teal:   'color-mix(in srgb, #3aa6a6 22%, transparent)',
    gold:   'color-mix(in srgb, var(--gold) 24%, transparent)',
    gray:   'color-mix(in srgb, #7a8090 28%, transparent)',
    paper:  'color-mix(in srgb, var(--gold) 12%, transparent)',
  }[c];
}

function zoneWallColor(c) {
  return {
    red:    'var(--shark)',
    violet: 'var(--violet)',
    green:  'var(--jade)',
    pink:   '#d96a8c',
    orange: '#e07a3a',
    teal:   '#3aa6a6',
    gold:   'var(--gold)',
    gray:   '#7a8090',
    paper:  'var(--border-2)',
  }[c];
}

function OfficeFloor({ agentState, hoverId, setHoverId, setTip, onClickAgent }) {
  const TILE = 100 / OFFICE_W;
  const TILE_Y = 100 / OFFICE_H;

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: `${OFFICE_W} / ${OFFICE_H}`,
        background: 'var(--bg-3)',
        border: '2px solid var(--border-2)',
        backgroundImage: `
          repeating-linear-gradient(0deg, color-mix(in srgb, var(--ink) 6%, transparent) 0 1px, transparent 1px ${TILE_Y}%),
          repeating-linear-gradient(90deg, color-mix(in srgb, var(--ink) 5%, transparent) 0 1px, transparent 1px ${TILE}%),
          repeating-linear-gradient(90deg, color-mix(in srgb, var(--ink) 12%, transparent) 0 ${2*TILE}%, transparent ${2*TILE}% ${4*TILE}%)
        `,
      }}
      role="application"
      aria-label="Plan du bureau, top-down"
      onMouseLeave={() => setTip(null)}
    >
      {/* Zones: fond coloré */}
      {ZONES.map(z => (
        <div key={z.id + '-fill'}
          style={{
            position: 'absolute',
            left:   `${(z.x + 1) * TILE}%`,
            top:    `${(z.y + 1) * TILE_Y}%`,
            width:  `${(z.w - 2) * TILE}%`,
            height: `${(z.h - 2) * TILE_Y}%`,
            background: zoneColor(z.color),
          }}
        />
      ))}

      {/* WALLS — bordure de chaque zone, chaque tile sauf les portes */}
      {ZONES.map(z => {
        const tiles = [];
        const isDoor = (x, y) => (z.doors || []).some(d => d.x === x && d.y === y);
        // top + bottom
        for (let x = z.x; x < z.x + z.w; x++) {
          if (!isDoor(x, z.y)) tiles.push({ x, y: z.y, k: `${z.id}-${x}-${z.y}-t` });
          if (!isDoor(x, z.y + z.h - 1)) tiles.push({ x, y: z.y + z.h - 1, k: `${z.id}-${x}-${z.y + z.h - 1}-b` });
        }
        // left + right
        for (let y = z.y + 1; y < z.y + z.h - 1; y++) {
          if (!isDoor(z.x, y)) tiles.push({ x: z.x, y, k: `${z.id}-${z.x}-${y}-l` });
          if (!isDoor(z.x + z.w - 1, y)) tiles.push({ x: z.x + z.w - 1, y, k: `${z.id}-${z.x + z.w - 1}-${y}-r` });
        }
        const wallColor = zoneWallColor(z.color);
        return tiles.map(t => (
          <div key={t.k}
            style={{
              position: 'absolute',
              left: `${t.x * TILE}%`,
              top:  `${t.y * TILE_Y}%`,
              width: `${TILE}%`,
              height: `${TILE_Y}%`,
              background: `linear-gradient(180deg, color-mix(in srgb, ${wallColor} 70%, var(--bg-2)) 0%, color-mix(in srgb, ${wallColor} 30%, var(--bg)) 100%)`,
              borderTop: '1px solid color-mix(in srgb, #fff 18%, transparent)',
              borderBottom: '1px solid color-mix(in srgb, #000 30%, transparent)',
              boxShadow: '0 1px 0 0 rgba(0,0,0,0.35)',
            }}
            aria-hidden
          />
        ));
      })}

      {/* Doors — petite ouverture stylisée */}
      {ZONES.flatMap(z => (z.doors || []).map((d, i) => (
        <div key={`door-${z.id}-${i}`}
          style={{
            position: 'absolute',
            left: `${d.x * TILE}%`,
            top:  `${d.y * TILE_Y}%`,
            width: `${TILE}%`,
            height: `${TILE_Y}%`,
            background: 'var(--bg-3)',
            borderTop: '2px dashed ' + zoneWallColor(z.color),
            borderBottom: '2px dashed ' + zoneWallColor(z.color),
            display: 'grid', placeItems: 'center',
            fontSize: 8, color: 'var(--fg-dim)',
            fontFamily: 'var(--font-mono)',
          }}
          aria-hidden
        >▭</div>
      )))}

      {/* Zone labels */}
      {ZONES.map(z => (
        <div key={z.id + '-label'}
          style={{
            position: 'absolute',
            left: `${(z.x + 1) * TILE}%`,
            top:  `${(z.y + 0.15) * TILE_Y}%`,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.06em',
            color: 'var(--fg-2)',
            background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
            padding: '1px 4px',
            border: `1px solid ${zoneWallColor(z.color)}`,
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >{z.label}</div>
      ))}

      {/* Bureaux dessinés */}
      {Object.entries(DESKS).map(([id, d]) => {
        const a = AGENTS.find(x => x.id === id);
        if (!a) return null;
        return <Desk key={'desk-' + id} d={d} agent={a} TILE={TILE} TILE_Y={TILE_Y} />;
      })}

      {/* Furniture lounge */}
      <Furniture x={24} y={17} w={1} h={1} content="☕" bg="var(--ink-3)" TILE={TILE} TILE_Y={TILE_Y} />
      <Furniture x={27} y={17} w={1} h={1} content="🥐" bg="var(--ink-3)" TILE={TILE} TILE_Y={TILE_Y} />
      <Furniture x={21} y={19} w={3} h={1} content=""   bg="color-mix(in srgb, var(--gold) 40%, var(--bg-2))" TILE={TILE} TILE_Y={TILE_Y} />
      <Furniture x={25} y={19} w={3} h={1} content=""   bg="color-mix(in srgb, var(--gold) 40%, var(--bg-2))" TILE={TILE} TILE_Y={TILE_Y} />
      <Furniture x={29} y={11} w={1} h={1} content="🖨" bg="var(--ink-3)" TILE={TILE} TILE_Y={TILE_Y} />

      <ServerRackBig x={5} y={4} TILE={TILE} TILE_Y={TILE_Y} />
      <Monitors      x={23} y={11} TILE={TILE} TILE_Y={TILE_Y} />

      {/* Agents */}
      {AGENTS.map(a => {
        const s = agentState[a.id];
        if (!s) return null;
        const left = (s.fx + 0.5) * TILE;
        const top  = (s.fy + 0.5) * TILE_Y;
        const sizePx = 24;
        return (
          <button key={a.id}
            onMouseEnter={(e) => {
              setHoverId(a.id);
              const r = e.currentTarget.getBoundingClientRect();
              const parent = e.currentTarget.parentElement.getBoundingClientRect();
              setTip({ agent: a, x: r.left - parent.left + r.width / 2, y: r.top - parent.top });
            }}
            onMouseLeave={() => { setHoverId(null); setTip(null); }}
            onClick={() => onClickAgent(a.id)}
            aria-label={`${a.name}, ${a.role}`}
            style={{
              position: 'absolute',
              left: `${left}%`, top: `${top}%`,
              transform: 'translate(-50%, -75%)',
              cursor: 'pointer', padding: 0,
              filter: hoverId === a.id ? 'drop-shadow(0 0 6px var(--accent))' : 'drop-shadow(0 1px 0 rgba(0,0,0,0.4))',
              transition: 'filter 120ms',
              zIndex: hoverId === a.id ? 30 : Math.round(s.fy + 5),
            }}
          >
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '50%', bottom: -3,
                transform: 'translateX(-50%)',
                width: sizePx * 0.7, height: 4,
                background: 'rgba(0,0,0,0.4)',
                filter: 'blur(2px)', borderRadius: '50%',
              }} aria-hidden />
              <PixelSprite
                skin={a.skin}
                size={sizePx}
                idle={!s.walking}
                walking={s.walking}
                walkFrame={s.frame || 0}
                layout={s.walking ? undefined : (AGENT_HAIR[a.id] || 'short')}
              />
              <span style={{
                position: 'absolute', top: -2, right: -2,
                width: 6, height: 6,
                background: a.status === 'active' ? 'var(--jade)' : 'var(--fg-dim)',
                boxShadow: a.status === 'active' ? '0 0 6px var(--jade)' : 'none',
              }} aria-hidden />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Desk({ d, agent, TILE, TILE_Y }) {
  // desk in front of chair (1 tile down)
  const dy = d.y + (d.dir === 'down' ? 1 : -1);
  const dx = d.x;
  const accessory = {
    'Research': '🔍', 'Content': '🎨', 'Growth': '📊',
    'Ops': '📦', 'C-Suite': agent.id === 'victor' ? '🎩' : (agent.id === 'iris' ? '🧠' : (agent.id === 'theo' ? '💰' : (agent.id === 'nora' ? '💻' : '📋'))),
    'Strategic': '🌍',
  }[agent.team];
  return (
    <div style={{
      position: 'absolute',
      left: `${dx * TILE}%`,
      top:  `${dy * TILE_Y}%`,
      width: `${TILE}%`,
      height: `${TILE_Y}%`,
      background: 'linear-gradient(180deg, #4a3a2a 0%, #2d2218 100%)',
      border: '1px solid var(--ink-4)',
      borderTop: '2px solid #6a5238',
      boxShadow: '0 2px 0 0 rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 2, fontSize: 8, zIndex: 2,
    }} aria-hidden>
      <span style={{
        width: '40%', height: '55%',
        background: 'var(--ink)',
        border: '1px solid var(--ink-4)',
        boxShadow: '0 0 3px color-mix(in srgb, var(--accent) 40%, transparent) inset',
      }} />
      <span style={{ fontSize: 9 }}>{accessory}</span>
    </div>
  );
}

function Furniture({ x, y, w, h, content, bg, TILE, TILE_Y }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x * TILE}%`, top: `${y * TILE_Y}%`,
      width: `${w * TILE}%`, height: `${h * TILE_Y}%`,
      background: bg, border: '1px solid var(--border-2)',
      display: 'grid', placeItems: 'center',
      fontSize: 11, zIndex: 2,
    }} aria-hidden>{content}</div>
  );
}

function ServerRackBig({ x, y, TILE, TILE_Y }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x * TILE}%`, top: `${y * TILE_Y}%`,
      width: `${2 * TILE}%`, height: `${TILE_Y}%`,
      background: 'var(--ink-2)', border: '1px solid var(--ink-4)',
      display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
      gap: 1, padding: 2, zIndex: 2,
    }} aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} style={{
          background: ['#5cb89a', '#e9c46a', '#e63946'][i % 3],
          opacity: 0.85,
          animation: `srvblink ${1 + (i % 7) * 0.3}s ${(i % 5) * 0.1}s infinite`,
        }} />
      ))}
      <style>{`@keyframes srvblink { 0%,100% { opacity:1 } 50% { opacity: 0.15 } }`}</style>
    </div>
  );
}

function Monitors({ x, y, TILE, TILE_Y }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x * TILE}%`, top: `${y * TILE_Y}%`,
      width: `${2.5 * TILE}%`, height: `${0.8 * TILE_Y}%`,
      display: 'flex', gap: 2, zIndex: 2,
    }} aria-hidden>
      {[0,1,2].map(i => (
        <div key={i} style={{
          flex: 1, background: 'var(--ink-2)',
          border: '1px solid var(--gold)',
          backgroundImage: 'repeating-linear-gradient(0deg, var(--gold) 0 1px, transparent 1px 3px)',
        }} />
      ))}
    </div>
  );
}

function Tooltip({ tip }) {
  const a = tip.agent;
  return (
    <div role="tooltip"
      style={{
        position: 'absolute',
        left: tip.x, top: tip.y - 14,
        transform: 'translate(-50%, -100%)',
        background: 'var(--bg)',
        border: '1px solid var(--accent)',
        padding: '8px 10px', minWidth: 220,
        pointerEvents: 'none', zIndex: 50,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
        <strong style={{ fontSize: 13 }}>{a.name}</strong>
        <span aria-hidden>{a.emoji}</span>
        <span className={`chip ${a.status === 'active' ? 'chip-jade' : ''}`} style={{ fontSize: 9, padding: '1px 5px', marginLeft: 'auto' }}>
          {a.status === 'active' ? '● actif' : '○ idle'}
        </span>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--fg-dim)', marginBottom: 6 }}>
        {a.role} · LLM {a.llm}
      </div>
      <div style={{ fontSize: 12, fontStyle: 'italic', borderLeft: '2px solid var(--accent)', paddingLeft: 6 }}>
        « {a.mantra} »
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--accent)', marginTop: 6 }}>
        ▶ {a.task}
      </div>
    </div>
  );
}

Object.assign(window, { OfficePage });
