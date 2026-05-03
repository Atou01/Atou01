"use client";

import { useMemo, useState } from "react";
import { REPORTS, type Report, type ReportTag } from "@/lib/data/mock";
import { findAgent } from "@/lib/types/agents";
import { AgentAvatar } from "@/components/ui/PixelSprite";

const TAG_LABEL: Record<ReportTag, { label: string; cls: string }> = {
  win:  { label: "WIN",  cls: "chip-jade" },
  go:   { label: "GO",   cls: "chip-jade" },
  kill: { label: "KILL", cls: "chip-accent" },
  flag: { label: "FLAG", cls: "chip-gold" },
  note: { label: "NOTE", cls: "" },
};

const TYPES = ["all", "Daily", "Product", "Growth", "Ops", "Finance", "Content"];

export default function ReportsPage() {
  const [type, setType] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  const agentOptions = useMemo(() => {
    const all = new Set<string>();
    REPORTS.forEach((r) => r.agents.forEach((a) => all.add(a)));
    return Array.from(all);
  }, []);

  const filtered = useMemo(() => {
    return REPORTS.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (agentFilter !== "all" && !r.agents.includes(agentFilter)) return false;
      return true;
    });
  }, [type, agentFilter]);

  return (
    <main className="page" style={{ paddingTop: 24 }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 18 }}>
        <h2>Reports <span aria-hidden>📑</span></h2>
        <span className="mono" style={{ color: "var(--fg-dim)", fontSize: 12 }}>
          {filtered.length} / {REPORTS.length} rapports
        </span>
      </header>

      {/* Filters */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>TYPE :</span>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`chip ${type === t ? "chip-accent" : ""}`}
            style={{ cursor: "pointer", textTransform: "uppercase" }}
          >
            {t}
          </button>
        ))}
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", marginLeft: 16 }}>AGENT :</span>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="mono"
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--border-2)",
            color: "var(--fg)",
            padding: "4px 8px",
            fontSize: 11,
          }}
        >
          <option value="all">tous</option>
          {agentOptions.map((id) => {
            const a = findAgent(id);
            return <option key={id} value={id}>{a?.name ?? id}</option>;
          })}
        </select>
      </section>

      {/* Timeline */}
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {filtered.map((r) => (
          <ReportCard key={r.id} report={r} expanded={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} />
        ))}
        {filtered.length === 0 && (
          <li className="card" style={{ padding: 24, textAlign: "center", color: "var(--fg-dim)" }}>
            Aucun rapport pour ces filtres.
          </li>
        )}
      </ol>
    </main>
  );
}

function ReportCard({ report, expanded, onToggle }: { report: Report; expanded: boolean; onToggle: () => void }) {
  const tag = TAG_LABEL[report.tag];
  return (
    <li className="card card-hover" style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span className={`chip ${tag.cls}`}>{tag.label}</span>
            <span className="chip mono">{report.type}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>{report.date}</span>
          </div>
          <h3 style={{ marginBottom: 8 }}>{report.title}</h3>
          <p style={{ margin: 0, color: "var(--fg-2)", fontSize: 14 }}>{report.tldr}</p>

          <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)" }}>par :</span>
            {report.agents.map((id) => {
              const a = findAgent(id);
              if (!a) return null;
              return (
                <span key={id} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <AgentAvatar agentId={a.id} skin={a.skin} size={20} idle />
                  <span className="mono" style={{ fontSize: 11 }}>{a.name.split(" ")[0]}</span>
                </span>
              );
            })}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onToggle} aria-expanded={expanded}>
          {expanded ? "▲ replier" : "▼ détails"}
        </button>
      </div>
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--border)" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>// Détails complets</div>
          <p className="mono" style={{ fontSize: 12, color: "var(--fg-dim)" }}>
            Détails complets disponibles en Sprint 2 (table <code>reports</code> Supabase + génération par Aria/Anna/Théo).
          </p>
        </div>
      )}
    </li>
  );
}
