import type { Skin } from "@/lib/types/agents";

type Layout = "short" | "long" | "bun" | "hat" | "phones" | "glasses";

const LAYOUTS: Record<Layout, string[]> = {
  short:   ["  HHHH  ", " HHHHHH ", " HFFFFH ", " FEFFEF ", " FFMMFF ", " SSAASS ", " SSSSSS ", " BB  BB "],
  long:    [" HHHHHH ", "HHHHHHHH", "HHFFFFHH", "HFEFFEFH", " FFMMFF ", " SSAASS ", " SSSSSS ", " BB  BB "],
  bun:     ["   HH   ", "  HHHH  ", " HFFFFH ", " FEFFEF ", " FFMMFF ", " SSAASS ", " SSSSSS ", " BB  BB "],
  hat:     [" HHHHHH ", "HHHHHHHH", "  FFFF  ", " FEFFEF ", " FFMMFF ", " SSAASS ", " SSSSSS ", " BB  BB "],
  phones:  [" AHHHHA ", " AHHHHA ", " HFFFFH ", " FEFFEF ", " FFMMFF ", " SSSSSS ", " SSAASS ", " BB  BB "],
  glasses: ["  HHHH  ", " HHHHHH ", " HFFFFH ", " AEEEEA ", " FFMMFF ", " SSAASS ", " SSSSSS ", " BB  BB "],
};

const PALETTES: Record<Skin, Record<string, string>> = {
  red:    { H: "#1a1a1a", F: "#f1c89a", E: "#0f1115", M: "#c97a6a", S: "#e63946", A: "#ffffff", B: "#1a1a1a" },
  blue:   { H: "#0a1f3d", F: "#f1c89a", E: "#0f1115", M: "#c97a6a", S: "#3a6ea5", A: "#e9c46a", B: "#1a1a1a" },
  green:  { H: "#3b2718", F: "#f1c89a", E: "#0f1115", M: "#c97a6a", S: "#5cb89a", A: "#0f1115", B: "#1a1a1a" },
  pink:   { H: "#3b1f2b", F: "#f5d4b8", E: "#0f1115", M: "#a85a78", S: "#d96a8c", A: "#f5f1e8", B: "#1a1a1a" },
  gold:   { H: "#2a1f0a", F: "#f1c89a", E: "#0f1115", M: "#c97a6a", S: "#e9c46a", A: "#0f1115", B: "#1a1a1a" },
  violet: { H: "#1a0f24", F: "#e6c8d8", E: "#0f1115", M: "#a85a78", S: "#b794d4", A: "#f5f1e8", B: "#1a1a1a" },
  orange: { H: "#2a1610", F: "#f1c89a", E: "#0f1115", M: "#c97a6a", S: "#e07a3a", A: "#0f1115", B: "#1a1a1a" },
  gray:   { H: "#0f1115", F: "#f1c89a", E: "#0f1115", M: "#c97a6a", S: "#7a8090", A: "#e63946", B: "#1a1a1a" },
  teal:   { H: "#0a1a1f", F: "#f1c89a", E: "#0f1115", M: "#c97a6a", S: "#3aa6a6", A: "#f5f1e8", B: "#1a1a1a" },
};

const AGENT_LAYOUT: Record<string, Layout> = {
  victor: "hat", iris: "glasses", nora: "phones",
  lina: "long", theo: "short", marc: "short",
  sam: "short", elena: "long", ravi: "short",
  aria: "long", maya: "bun",
  mia: "long", diego: "short", yuki: "bun",
  lea: "long", kai: "short", tom: "short", zoe: "long", noor: "bun", bea: "long",
  jay: "short", anna: "bun", hana: "long",
  hugo: "short", sofia: "long", chen: "short", ines: "long",
};

interface SpriteProps {
  skin?: Skin;
  size?: number;
  idle?: boolean;
  halo?: boolean;
  layout?: Layout;
}

export function PixelSprite({ skin = "red", size = 32, idle = false, halo = false, layout = "short" }: SpriteProps) {
  const palette = PALETTES[skin];
  const grid = LAYOUTS[layout];
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const c = grid[y][x];
      const bg = c === " " ? "transparent" : palette[c] ?? "transparent";
      cells.push(<i key={`${x}-${y}`} style={{ background: bg }} aria-hidden />);
    }
  }
  return (
    <div
      className={`sprite ${idle ? "sprite-idle" : ""}`}
      style={{ width: size, height: size, position: "relative" }}
      aria-hidden
    >
      {halo && (
        <span style={{
          position: "absolute", inset: -3,
          border: "2px solid var(--accent)",
          boxShadow: "0 0 8px color-mix(in srgb, var(--accent) 60%, transparent)",
          pointerEvents: "none",
        }} />
      )}
      {cells}
    </div>
  );
}

interface AvatarProps {
  agentId: string;
  skin: Skin;
  size?: number;
  idle?: boolean;
  halo?: boolean;
  ring?: boolean;
}

export function AgentAvatar({ agentId, skin, size = 40, idle = true, halo = false, ring = false }: AvatarProps) {
  return (
    <div
      style={{
        width: size + 8, height: size + 8,
        background: "var(--bg-3)",
        border: `1px solid ${ring ? "var(--accent)" : "var(--border-2)"}`,
        display: "grid", placeItems: "center",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <PixelSprite skin={skin} size={size} idle={idle} halo={halo} layout={AGENT_LAYOUT[agentId] ?? "short"} />
    </div>
  );
}
