/* ============================================================
   Pixel sprites — richer 8x8 layouts with hair variants
   ============================================================ */

// Multiple body layouts. Code legend:
//  ' '=empty, 'H'=hair, 'F'=face, 'E'=eye, 'M'=mouth/nose,
//  'S'=shirt, 'A'=accent, 'B'=belt/legs
const SPRITE_LAYOUTS = {
  // short hair
  short: [
    '  HHHH  ',
    ' HHHHHH ',
    ' HFFFFH ',
    ' FEFFEF ',
    ' FFMMFF ',
    ' SSAASS ',
    ' SSSSSS ',
    ' BB  BB ',
  ],
  // long hair
  long: [
    ' HHHHHH ',
    'HHHHHHHH',
    'HHFFFFHH',
    'HFEFFEFH',
    ' FFMMFF ',
    ' SSAASS ',
    ' SSSSSS ',
    ' BB  BB ',
  ],
  // bun / tied
  bun: [
    '   HH   ',
    '  HHHH  ',
    ' HFFFFH ',
    ' FEFFEF ',
    ' FFMMFF ',
    ' SSAASS ',
    ' SSSSSS ',
    ' BB  BB ',
  ],
  // cap / hat (Victor)
  hat: [
    ' HHHHHH ',
    'HHHHHHHH',
    '  FFFF  ',
    ' FEFFEF ',
    ' FFMMFF ',
    ' SSAASS ',
    ' SSSSSS ',
    ' BB  BB ',
  ],
  // headphones (CTO)
  phones: [
    ' AHHHHA ',
    ' AHHHHA ',
    ' HFFFFH ',
    ' FEFFEF ',
    ' FFMMFF ',
    ' SSSSSS ',
    ' SSAASS ',
    ' BB  BB ',
  ],
  // back-turned (server room Iris)
  glasses: [
    '  HHHH  ',
    ' HHHHHH ',
    ' HFFFFH ',
    ' AEEEEA ',
    ' FFMMFF ',
    ' SSAASS ',
    ' SSSSSS ',
    ' BB  BB ',
  ],
  // walking frame A (legs apart)
  walkA: [
    '  HHHH  ',
    ' HHHHHH ',
    ' HFFFFH ',
    ' FEFFEF ',
    ' FFMMFF ',
    ' SSAASS ',
    ' SSSSSS ',
    'B    B  ',
  ],
  walkB: [
    '  HHHH  ',
    ' HHHHHH ',
    ' HFFFFH ',
    ' FEFFEF ',
    ' FFMMFF ',
    ' SSAASS ',
    ' SSSSSS ',
    '  B    B',
  ],
};

const SKIN_PALETTES = {
  red:    { H: '#1a1a1a', F: '#f1c89a', E: '#0f1115', M: '#c97a6a', S: '#e63946', A: '#ffffff', B: '#1a1a1a' },
  blue:   { H: '#0a1f3d', F: '#f1c89a', E: '#0f1115', M: '#c97a6a', S: '#3a6ea5', A: '#e9c46a', B: '#1a1a1a' },
  green:  { H: '#3b2718', F: '#f1c89a', E: '#0f1115', M: '#c97a6a', S: '#5cb89a', A: '#0f1115', B: '#1a1a1a' },
  pink:   { H: '#3b1f2b', F: '#f5d4b8', E: '#0f1115', M: '#a85a78', S: '#d96a8c', A: '#f5f1e8', B: '#1a1a1a' },
  gold:   { H: '#2a1f0a', F: '#f1c89a', E: '#0f1115', M: '#c97a6a', S: '#e9c46a', A: '#0f1115', B: '#1a1a1a' },
  violet: { H: '#1a0f24', F: '#e6c8d8', E: '#0f1115', M: '#a85a78', S: '#b794d4', A: '#f5f1e8', B: '#1a1a1a' },
  orange: { H: '#2a1610', F: '#f1c89a', E: '#0f1115', M: '#c97a6a', S: '#e07a3a', A: '#0f1115', B: '#1a1a1a' },
  gray:   { H: '#0f1115', F: '#f1c89a', E: '#0f1115', M: '#c97a6a', S: '#7a8090', A: '#e63946', B: '#1a1a1a' },
  teal:   { H: '#0a1a1f', F: '#f1c89a', E: '#0f1115', M: '#c97a6a', S: '#3aa6a6', A: '#f5f1e8', B: '#1a1a1a' },
};

// Map agent id → preferred hair/style
const AGENT_HAIR = {
  victor: 'hat',
  iris: 'glasses',
  nora: 'phones',
  lina: 'long', theo: 'short', marc: 'short',
  sam: 'short', elena: 'long', ravi: 'short',
  aria: 'long', maya: 'bun',
  mia: 'long', diego: 'short', yuki: 'bun',
  lea: 'long', kai: 'short', tom: 'short', zoe: 'long', noor: 'bun', bea: 'long',
  jay: 'short', anna: 'bun', hana: 'long',
  hugo: 'short', sofia: 'long', chen: 'short', ines: 'long',
};

function PixelSprite({ skin = 'red', size = 32, idle = false, halo = false, layout, walking = false, walkFrame = 0 }) {
  const palette = SKIN_PALETTES[skin] || SKIN_PALETTES.red;
  let chosen = SPRITE_LAYOUTS[layout] || SPRITE_LAYOUTS.short;
  if (walking) chosen = walkFrame % 2 === 0 ? SPRITE_LAYOUTS.walkA : SPRITE_LAYOUTS.walkB;
  const cells = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const c = chosen[y][x];
      const bg = c === ' ' ? 'transparent' : (palette[c] || 'transparent');
      cells.push(<i key={`${x}-${y}`} style={{ background: bg }} aria-hidden="true" />);
    }
  }
  return (
    <div
      className={`sprite ${idle ? 'sprite-idle' : ''}`}
      style={{ width: size, height: size, position: 'relative' }}
      aria-hidden="true"
    >
      {halo && (
        <span style={{
          position: 'absolute', inset: -3,
          border: '2px solid var(--accent)',
          boxShadow: '0 0 8px color-mix(in srgb, var(--accent) 60%, transparent)',
          pointerEvents: 'none',
        }} />
      )}
      {cells}
    </div>
  );
}

function AgentAvatar({ agent, size = 40, idle = true, halo = false, ring = false }) {
  return (
    <div
      style={{
        width: size + 8, height: size + 8,
        background: 'var(--bg-3)',
        border: `1px solid ${ring ? 'var(--accent)' : 'var(--border-2)'}`,
        display: 'grid', placeItems: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <PixelSprite skin={agent.skin} size={size} idle={idle} halo={halo} layout={AGENT_HAIR[agent.id] || 'short'} />
    </div>
  );
}

Object.assign(window, { PixelSprite, AgentAvatar, AGENT_HAIR, SPRITE_LAYOUTS });
