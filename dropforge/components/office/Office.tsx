"use client";

import { useState } from "react";
import { AGENTS, Agent } from "@/lib/types/agents";

const COLS = 20;
const ROWS = 18;
const CELL = 36;

const DEPT_COLOR: Record<string, string> = {
  executive: "#e63946",
  research: "#52796f",
  content: "#f4a261",
  growth: "#2a9d8f",
  ops: "#8d99ae",
  finance: "#e9c46a",
  tech: "#457b9d",
  ai: "#9d4edd",
};

export default function Office() {
  const [hovered, setHovered] = useState<Agent | null>(null);

  return (
    <div className="space-y-4">
      <div className="relative bg-ink border border-paper/20 rounded-lg overflow-x-auto">
        <svg
          width={COLS * CELL}
          height={ROWS * CELL}
          viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
          className="block"
        >
          {/* Floor grid */}
          {Array.from({ length: COLS }).map((_, x) =>
            Array.from({ length: ROWS }).map((_, y) => (
              <rect
                key={`${x}-${y}`}
                x={x * CELL}
                y={y * CELL}
                width={CELL}
                height={CELL}
                fill={(x + y) % 2 === 0 ? "#0e0e14" : "#11111a"}
              />
            ))
          )}

          {/* Zone labels */}
          <ZoneLabel x={1} y={0.4} label="C-SUITE" />
          <ZoneLabel x={5} y={7.4} label="RESEARCH" />
          <ZoneLabel x={1} y={9.4} label="CONTENT" />
          <ZoneLabel x={9} y={9.4} label="GROWTH" />
          <ZoneLabel x={11} y={13.4} label="OPS" />
          <ZoneLabel x={15} y={3.4} label="SERVERS" />

          {/* Agents */}
          {AGENTS.map((a) => {
            const cx = a.desk.x * CELL + CELL / 2;
            const cy = a.desk.y * CELL + CELL / 2;
            const color = DEPT_COLOR[a.department] ?? "#888";
            return (
              <g
                key={a.id}
                onMouseEnter={() => setHovered(a)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                <rect
                  x={cx - 14}
                  y={cy - 10}
                  width={28}
                  height={20}
                  rx={2}
                  fill="#1a1a24"
                  stroke={color}
                  strokeWidth={1}
                />
                <circle cx={cx} cy={cy - 16} r={8} fill={color} />
                <text
                  x={cx}
                  y={cy - 13}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#0b0b0f"
                  fontWeight={700}
                >
                  {a.name[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className="absolute top-2 right-2 bg-ink/95 border border-shark/60 rounded p-3 text-xs max-w-[260px] shadow-xl">
            <div className="font-bold text-paper">
              {hovered.emoji} {hovered.name}
            </div>
            <div className="text-paper/70 text-[11px] mb-2">{hovered.role}</div>
            <div className="font-mono text-paper/60 text-[11px] mb-1">
              ↳ LLM : {hovered.defaultLLM}
            </div>
            <div className="italic text-moss text-[11px]">"{hovered.mantra}"</div>
          </div>
        )}
      </div>

      <Legend />
    </div>
  );
}

function ZoneLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text
      x={x * CELL}
      y={y * CELL}
      fontSize={9}
      fill="#f5f1e8"
      opacity={0.25}
      fontFamily="monospace"
      letterSpacing={2}
    >
      {label}
    </text>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] font-mono text-paper/60">
      {Object.entries(DEPT_COLOR).map(([dept, color]) => (
        <span key={dept} className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: color }}
          />
          {dept}
        </span>
      ))}
    </div>
  );
}
