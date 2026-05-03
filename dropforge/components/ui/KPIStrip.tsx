"use client";

import { useEffect, useRef, useState } from "react";
import { LIVE_STATS } from "@/lib/data/mock";

function useAnimated(target: number, duration = 800) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(start + (target - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function KPIStrip() {
  const rev = useAnimated(LIVE_STATS.revenue);
  const orders = useAnimated(LIVE_STATS.ordersToday);
  const roas = useAnimated(LIVE_STATS.roas);
  const burn = useAnimated(LIVE_STATS.iaSpendMonth);
  const burnPct = (LIVE_STATS.iaSpendMonth / LIVE_STATS.iaSpendCap) * 100;
  const fmtEur = (n: number) => "€" + Math.round(n).toLocaleString("fr-FR");

  return (
    <div className="kpi-grid" role="group" aria-label="KPIs live">
      <div className="kpi">
        <span className="kpi-label">CA · jour</span>
        <span className="kpi-value">{fmtEur(rev)}</span>
        <span className="kpi-delta up">▲ +18.4%</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Commandes · 24h</span>
        <span className="kpi-value">{Math.round(orders)}</span>
        <span className="kpi-delta up">▲ +9 vs hier</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">ROAS courant</span>
        <span className="kpi-value">{roas.toFixed(2)}x</span>
        <span className="kpi-delta up">▲ +0.21</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">IA spend · mois</span>
        <span className="kpi-value">${burn.toFixed(1)}</span>
        <div style={{ height: 4, background: "var(--bg-3)", marginTop: 4, position: "relative" }}>
          <div style={{ width: `${burnPct}%`, height: "100%", background: "var(--accent)" }} />
          <span style={{ position: "absolute", right: -6, top: -2, fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--fg-dim)" }}>
            ${LIVE_STATS.iaSpendCap}
          </span>
        </div>
      </div>
      <div className="kpi">
        <span className="kpi-label">Agents actifs</span>
        <span className="kpi-value">
          {LIVE_STATS.agentsActive}
          <span style={{ color: "var(--fg-dim)", fontSize: 16 }}>/{LIVE_STATS.agentsTotal}</span>
        </span>
        <span className="kpi-delta" style={{ color: "var(--jade)" }}>● live</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Phase courante</span>
        <span className="kpi-value">
          {LIVE_STATS.phase}
          <span style={{ color: "var(--fg-dim)", fontSize: 16 }}>/3</span>
        </span>
        <span className="kpi-delta" style={{ color: "var(--gold)" }}>scale</span>
      </div>
    </div>
  );
}
