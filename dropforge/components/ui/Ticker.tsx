import { TICKER_ITEMS } from "@/lib/data/mock";

export default function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker scanlines" role="marquee" aria-label="Indicateurs live">
      <div className="ticker-track">
        {items.map((it, i) => (
          <span key={i} className="ticker-item">
            <span style={{ color: "var(--fg-dim)" }}>{it.sym}</span>
            <strong>{it.val}</strong>
            <span className={it.dir}>{it.delta}</span>
            <span style={{ color: "var(--border-2)" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
