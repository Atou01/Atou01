"use client";

import { useState } from "react";
import { AGENTS, findAgent, TEAM_META, type Agent, type Team } from "@/lib/types/agents";
import { AgentAvatar } from "@/components/ui/PixelSprite";
import Drawer from "@/components/ui/Drawer";
import AgentDetail from "@/components/ui/AgentDetail";
import KPIStrip from "@/components/ui/KPIStrip";

const ZONES: Array<{ team: Team; label: string; x: number; y: number; w: number; h: number }> = [
  { team: "C-Suite",   label: "C-SUITE",    x: 1,  y: 1,  w: 16, h: 5 },
  { team: "Research",  label: "RESEARCH",   x: 5,  y: 7,  w: 5,  h: 9 },
  { team: "Content",   label: "CONTENT",    x: 1,  y: 9,  w: 8,  h: 9 },
  { team: "Growth",    label: "GROWTH",     x: 9,  y: 11, w: 5,  h: 5 },
  { team: "Ops",       label: "OPS",        x: 11, y: 13, w: 5,  h: 5 },
  { team: "Strategic", label: "STRATEGIC",  x: 1,  y: 11, w: 5,  h: 3 },
];

const COLS = 18;
const ROWS = 20;
const CELL = 40;

export default function Office() {
  const [selected, setSelected] = useState<Agent | null>(null);
  const [hover, setHover] = useState<Agent | null>(null);

  return (
    <main className="page" style={{ paddingTop: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12 }}>
        <h2>Office <span aria-hidden>🏢</span></h2>
        <span className="mono" style={{ color: "var(--fg-dim)", fontSize: 12 }}>
          25 agents · vue top-down · click pour les détails
        </span>
      </div>

      <div style={{ marginBottom: 18 }}><KPIStrip /></div>

      <div className="card" style={{ padding: 0, overflow: "auto" }}>
        <svg
          width={COLS * CELL}
          height={ROWS * CELL}
          viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
          role="img"
          aria-label="Plan du bureau DropForge"
          style={{ display: "block", background: "var(--bg-2)" }}
        >
          {/* floor checker */}
          {Array.from({ length: COLS }).map((_, x) =>
            Array.from({ length: ROWS }).map((_, y) => (
              <rect
                key={`${x}-${y}`}
                x={x * CELL}
                y={y * CELL}
                width={CELL}
                height={CELL}
                fill={(x + y) % 2 === 0 ? "var(--bg-2)" : "var(--bg-3)"}
                opacity={0.6}
              />
            ))
          )}

          {/* zones */}
          {ZONES.map((z) => {
            const meta = TEAM_META[z.team];
            return (
              <g key={z.team}>
                <rect
                  x={z.x * CELL}
                  y={z.y * CELL}
                  width={z.w * CELL}
                  height={z.h * CELL}
                  fill="transparent"
                  stroke={`var(--${meta.color === "red" ? "shark" : meta.color === "gold" ? "gold" : meta.color === "violet" ? "violet" : meta.color === "green" || meta.color === "teal" ? "jade" : "border-2"})`}
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
                <text
                  x={z.x * CELL + 8}
                  y={z.y * CELL + 14}
                  fontSize={10}
                  fill="var(--fg-dim)"
                  fontFamily="var(--font-mono)"
                  letterSpacing={2}
                >
                  {z.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* HTML overlay for agents (more interactive than SVG) */}
        <div style={{ position: "relative", marginTop: -ROWS * CELL, height: ROWS * CELL, pointerEvents: "none" }}>
          {AGENTS.map((a) => {
            const cx = a.desk.x * CELL + CELL / 2 - 24;
            const cy = a.desk.y * CELL + CELL / 2 - 24;
            return (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                onMouseEnter={() => setHover(a)}
                onMouseLeave={() => setHover(null)}
                aria-label={`${a.name} — ${a.role}`}
                style={{
                  position: "absolute",
                  left: cx, top: cy,
                  pointerEvents: "auto",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <AgentAvatar agentId={a.id} skin={a.skin} size={32} idle ring={hover?.id === a.id} />
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
        {Object.entries(TEAM_META).map(([team, m]) => (
          <span key={team} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 10, height: 10, background: `var(--${m.color === "red" ? "shark" : m.color === "gold" ? "gold" : m.color === "violet" ? "violet" : m.color === "green" || m.color === "teal" ? "jade" : "border-2"})` }} />
            {m.label}
          </span>
        ))}
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.name}` : ""}
        width={520}
      >
        {selected && <AgentDetail agent={selected} />}
      </Drawer>
    </main>
  );
}
