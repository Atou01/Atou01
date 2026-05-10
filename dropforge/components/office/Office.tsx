"use client";

import { useState } from "react";
import { AGENTS, findAgent, type Agent } from "@/lib/types/agents";
import { AgentAvatar } from "@/components/ui/PixelSprite";
import Drawer from "@/components/ui/Drawer";
import AgentDetail from "@/components/ui/AgentDetail";
import KPIStrip from "@/components/ui/KPIStrip";

const OFFICE_W = 32;
const OFFICE_H = 22;
const TILE = 28;

type ZoneColor = "violet" | "green" | "pink" | "red" | "orange" | "gold" | "gray" | "teal" | "paper";

interface Zone {
  id: string;
  label: string;
  color: ZoneColor;
  x: number;
  y: number;
  w: number;
  h: number;
  doors: Array<{ x: number; y: number }>;
}

const ZONES: Zone[] = [
  { id: "iris",     label: "SERVERS · Iris",        color: "violet", x: 1,  y: 1,  w: 7,  h: 6, doors: [{ x: 7,  y: 4 }] },
  { id: "research", label: "RESEARCH · Sam",        color: "green",  x: 9,  y: 1,  w: 9,  h: 6, doors: [{ x: 13, y: 6 }] },
  { id: "content",  label: "CONTENT · Elena",       color: "pink",   x: 19, y: 1,  w: 12, h: 8, doors: [{ x: 24, y: 8 }] },
  { id: "ceo",      label: "C-SUITE · Victor",      color: "red",    x: 12, y: 8,  w: 6,  h: 5, doors: [{ x: 14, y: 12 }, { x: 17, y: 10 }] },
  { id: "growth",   label: "GROWTH · Ravi",         color: "orange", x: 1,  y: 8,  w: 10, h: 5, doors: [{ x: 9,  y: 12 }] },
  { id: "cfo",      label: "CFO · Théo",            color: "gold",   x: 19, y: 9,  w: 7,  h: 4, doors: [{ x: 22, y: 12 }] },
  { id: "cto",      label: "CTO + KITCHEN · Nora",  color: "gray",   x: 26, y: 9,  w: 5,  h: 4, doors: [{ x: 28, y: 12 }] },
  { id: "ops",      label: "OPS · Marc",            color: "teal",   x: 1,  y: 14, w: 18, h: 7, doors: [{ x: 17, y: 14 }] },
  { id: "lounge",   label: "COFFEE LOUNGE",         color: "paper",  x: 20, y: 14, w: 11, h: 7, doors: [{ x: 20, y: 16 }] },
];

const DESKS: Record<string, { x: number; y: number }> = {
  victor: { x: 14, y: 10 }, iris: { x: 3, y: 3 },
  sam: { x: 10, y: 2 }, mia: { x: 13, y: 2 }, diego: { x: 16, y: 2 }, yuki: { x: 11, y: 4 },
  elena: { x: 20, y: 2 }, maya: { x: 23, y: 2 }, lea: { x: 26, y: 2 }, kai: { x: 29, y: 2 },
  tom: { x: 21, y: 6 }, zoe: { x: 24, y: 6 }, noor: { x: 27, y: 6 }, bea: { x: 29, y: 6 },
  ravi: { x: 2, y: 9 }, jay: { x: 5, y: 9 }, anna: { x: 8, y: 9 }, hana: { x: 5, y: 11 },
  theo: { x: 21, y: 11 }, nora: { x: 28, y: 11 },
  marc: { x: 3, y: 15 }, hugo: { x: 6, y: 15 }, sofia: { x: 9, y: 15 }, chen: { x: 12, y: 15 }, ines: { x: 15, y: 15 },
};

interface POI {
  x: number;
  y: number;
  icon: string;
  label: string;
}

const POIS: POI[] = [
  { x: 5,  y: 4,  icon: "🖥️", label: "Server rack" },
  { x: 24, y: 17, icon: "☕", label: "Coffee" },
  { x: 27, y: 17, icon: "🥐", label: "Snack" },
  { x: 22, y: 19, icon: "🛋️", label: "Couch" },
  { x: 26, y: 19, icon: "🛋️", label: "Couch" },
  { x: 23, y: 11, icon: "📊", label: "CFO monitors" },
  { x: 14, y: 13, icon: "🚪", label: "" },
];

function colorVar(c: ZoneColor): string {
  return c === "red" ? "var(--shark)"
       : c === "gold" ? "var(--gold)"
       : c === "violet" ? "var(--violet)"
       : c === "green" || c === "teal" ? "var(--jade)"
       : c === "pink" ? "#d96a8c"
       : c === "orange" ? "#e07a3a"
       : c === "gray" ? "var(--border-2)"
       : "var(--paper-3)";
}

function buildWallSet(): Set<string> {
  const walls = new Set<string>();
  for (const z of ZONES) {
    for (let x = z.x; x < z.x + z.w; x++) {
      walls.add(`${x},${z.y}`);
      walls.add(`${x},${z.y + z.h - 1}`);
    }
    for (let y = z.y; y < z.y + z.h; y++) {
      walls.add(`${z.x},${y}`);
      walls.add(`${z.x + z.w - 1},${y}`);
    }
    for (const d of z.doors) walls.delete(`${d.x},${d.y}`);
  }
  return walls;
}

const WALLS = buildWallSet();

export default function Office() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [hover, setHover] = useState<Agent | null>(null);

  return (
    <main className="page" style={{ paddingTop: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12 }}>
        <h2>Office <span aria-hidden>🏢</span></h2>
        <span className="mono" style={{ color: "var(--fg-dim)", fontSize: 12 }}>
          25 agents · top-down · murs &amp; portes · click pour les détails
        </span>
      </div>

      <div style={{ marginBottom: 18 }}><KPIStrip /></div>

      <div className="card scanlines" style={{ padding: 0, overflow: "auto" }}>
        <div
          role="img"
          aria-label="Plan top-down du bureau DropForge"
          style={{
            position: "relative",
            width: OFFICE_W * TILE,
            height: OFFICE_H * TILE,
            background: "var(--bg)",
            backgroundImage: `
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: `${TILE}px ${TILE}px`,
            imageRendering: "pixelated",
          }}
        >
          {/* Zone fills */}
          {ZONES.map((z) => (
            <div
              key={z.id}
              style={{
                position: "absolute",
                left: z.x * TILE,
                top: z.y * TILE,
                width: z.w * TILE,
                height: z.h * TILE,
                background: `color-mix(in srgb, ${colorVar(z.color)} 6%, transparent)`,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Walls */}
          {Array.from(WALLS).map((k) => {
            const [x, y] = k.split(",").map(Number);
            return (
              <div
                key={`w-${k}`}
                style={{
                  position: "absolute",
                  left: x * TILE,
                  top: y * TILE,
                  width: TILE,
                  height: TILE,
                  background: "var(--ink-3)",
                  boxShadow: "inset 0 -2px 0 var(--border-2), inset 0 2px 0 var(--ink-4)",
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* Zone labels */}
          {ZONES.map((z) => (
            <div
              key={`l-${z.id}`}
              className="mono"
              style={{
                position: "absolute",
                left: z.x * TILE + 6,
                top: z.y * TILE + 4,
                fontSize: 9,
                letterSpacing: 2,
                color: colorVar(z.color),
                opacity: 0.85,
                textTransform: "uppercase",
                pointerEvents: "none",
                textShadow: "0 1px 0 var(--ink)",
              }}
            >
              {z.label}
            </div>
          ))}

          {/* POIs (coffee, server, couches) */}
          {POIS.map((p, i) => (
            <div
              key={`p-${i}`}
              title={p.label}
              style={{
                position: "absolute",
                left: p.x * TILE + 2,
                top: p.y * TILE + 2,
                width: TILE - 4,
                height: TILE - 4,
                display: "grid",
                placeItems: "center",
                background: "var(--bg-3)",
                border: "1px solid var(--border-2)",
                fontSize: 16,
                pointerEvents: "none",
              }}
              aria-hidden
            >
              {p.icon}
            </div>
          ))}

          {/* Desks (visual rectangle below sprite) */}
          {Object.entries(DESKS).map(([id, d]) => (
            <div
              key={`d-${id}`}
              style={{
                position: "absolute",
                left: d.x * TILE + 2,
                top: (d.y + 1) * TILE + 4,
                width: TILE - 4,
                height: TILE / 2,
                background: "color-mix(in srgb, var(--gold) 15%, var(--bg-3))",
                border: "1px solid var(--border-2)",
                pointerEvents: "none",
              }}
              aria-hidden
            />
          ))}

          {/* Agent sprites */}
          {AGENTS.map((a) => {
            const d = DESKS[a.id];
            if (!d) return null;
            return (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                onMouseEnter={() => setHover(a)}
                onMouseLeave={() => setHover(null)}
                aria-label={`${a.name} — ${a.role}`}
                style={{
                  position: "absolute",
                  left: d.x * TILE + (TILE - 28) / 2,
                  top: d.y * TILE + (TILE - 28) / 2 - 4,
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  zIndex: 5,
                }}
              >
                <AgentAvatar agentId={a.id} skin={a.skin} size={24} idle ring={hover?.id === a.id || selected?.id === a.id} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Hover tooltip */}
      {hover && (
        <div
          role="tooltip"
          className="card"
          style={{
            position: "fixed", bottom: 80, right: 24,
            padding: 14, maxWidth: 280, zIndex: 40,
            borderColor: "var(--accent)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <strong>{hover.name}</strong>
            <span aria-hidden>{hover.emoji}</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", marginBottom: 6 }}>
            {hover.role} · {hover.llmLabel}
          </div>
          <div className="mono" style={{ fontSize: 11, fontStyle: "italic", color: "var(--fg-2)" }}>
            « {hover.mantra} »
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-dim)" }}>
        {ZONES.map((z) => (
          <span key={z.id} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 10, height: 10, background: colorVar(z.color) }} />
            {z.label}
          </span>
        ))}
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : ""}
        width={520}
      >
        {selected && <AgentDetail agent={selected} />}
      </Drawer>
    </main>
  );
}
