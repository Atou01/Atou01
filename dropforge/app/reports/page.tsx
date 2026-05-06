"use client";

import { useEffect, useMemo, useState } from "react";
import { REPORTS as MOCK_REPORTS, type Report, type ReportTag } from "@/lib/data/mock";
import { findAgent } from "@/lib/types/agents";
import { AgentAvatar } from "@/components/ui/PixelSprite";
import Drawer from "@/components/ui/Drawer";

interface LiveReport extends Report {
  contentMd: string;
  sources: string[];
  costUsd: number;
  durationMs: number;
  createdAt: number;
}

const TAG_LABEL: Record<ReportTag, { label: string; cls: string }> = {
  win:  { label: "WIN",  cls: "chip-jade" },
  go:   { label: "GO",   cls: "chip-jade" },
  kill: { label: "KILL", cls: "chip-accent" },
  flag: { label: "FLAG", cls: "chip-gold" },
  note: { label: "NOTE", cls: "" },
};

const TYPES = ["all", "Strategic", "Daily", "Product", "Growth", "Ops", "Finance", "Content"];

export default function ReportsPage() {
  const [type, setType] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [live, setLive] = useState<LiveReport[]>([]);
  const [running, setRunning] = useState<null | "aria" | "maya">(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setLive(data.reports ?? []);
    } catch {
      // ignore — store may be empty
    }
  }

  useEffect(() => { refresh(); }, []);

  async function runAgent(agent: "aria" | "maya") {
    setRunning(agent);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${agent}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `${agent} a crashé.`);
      await refresh();
      if (data.reportId) setOpen(data.reportId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setRunning(null);
    }
  }

  const all = useMemo(() => {
    return [...live, ...MOCK_REPORTS];
  }, [live]);

  const agentOptions = useMemo(() => {
    const s = new Set<string>();
    all.forEach((r) => r.agents.forEach((a) => s.add(a)));
    return Array.from(s);
  }, [all]);

  const filtered = useMemo(() => {
    return all.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (agentFilter !== "all" && !r.agents.includes(agentFilter)) return false;
      return true;
    });
  }, [all, type, agentFilter]);

  const openReport = open ? (live.find((r) => r.id === open) ?? null) : null;

  return (
    <main className="page" style={{ paddingTop: 24 }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <h2>Reports <span aria-hidden>📑</span></h2>
        <span className="mono" style={{ color: "var(--fg-dim)", fontSize: 12 }}>
          {filtered.length} / {all.length} rapports · {live.length} live
        </span>
        <div style={{ flex: 1 }} />
        <button
          className="btn"
          disabled={running !== null}
          onClick={() => runAgent("aria")}
        >
          {running === "aria" ? "🌍 Aria scanne…" : "🌍 Aria → Niche"}
        </button>
        <button
          className="btn btn-primary"
          disabled={running !== null}
          onClick={() => runAgent("maya")}
        >
          {running === "maya" ? "🎨 Maya brand…" : "🎨 Maya → Brand kit"}
        </button>
      </header>

      {error && (
        <div className="card" style={{ padding: 14, marginBottom: 16, borderColor: "var(--shark)", color: "var(--shark)" }}>
          ⚠ {error}
        </div>
      )}

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
        {filtered.map((r) => {
          const isLive = "contentMd" in r;
          return (
            <ReportCard
              key={r.id}
              report={r}
              isLive={isLive}
              onView={isLive ? () => setOpen(r.id) : undefined}
            />
          );
        })}
        {filtered.length === 0 && (
          <li className="card" style={{ padding: 24, textAlign: "center", color: "var(--fg-dim)" }}>
            Aucun rapport pour ces filtres.
          </li>
        )}
      </ol>

      <Drawer open={!!openReport} onClose={() => setOpen(null)} title={openReport?.title ?? ""} width={680}>
        {openReport && <ReportDetail report={openReport} />}
      </Drawer>
    </main>
  );
}

function ReportCard({ report, isLive, onView }: { report: Report; isLive: boolean; onView?: () => void }) {
  const tag = TAG_LABEL[report.tag];
  return (
    <li className="card card-hover" style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span className={`chip ${tag.cls}`}>{tag.label}</span>
            <span className="chip mono">{report.type}</span>
            {isLive && <span className="chip chip-jade" style={{ fontSize: 9 }}>● LIVE</span>}
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
        {onView && (
          <button className="btn" onClick={onView}>
            Lire →
          </button>
        )}
      </div>
    </li>
  );
}

function ReportDetail({ report }: { report: LiveReport }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>
        Durée : {(report.durationMs / 1000).toFixed(1)}s · Coût IA : ${report.costUsd.toFixed(3)} · Sources : {report.sources.length}
      </div>
      <article
        className="card"
        style={{
          padding: 18,
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          fontFamily: "var(--font-sans)",
        }}
      >
        {report.contentMd}
      </article>
      {report.sources.length > 0 && (
        <section>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Sources</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 4 }}>
            {report.sources.slice(0, 12).map((s, i) => (
              <li key={i} className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <a href={s} target="_blank" rel="noreferrer" style={{ color: "var(--fg-2)" }}>{s}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
