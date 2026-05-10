"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";
type Density = "compact" | "cosy";

const ACCENTS = [
  { c: "#e63946", n: "Shark" },
  { c: "#e9c46a", n: "Gold" },
  { c: "#5cb89a", n: "Jade" },
  { c: "#b794d4", n: "Violet" },
  { c: "#3a6ea5", n: "Steel" },
];

export default function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [density, setDensity] = useState<Density>("cosy");
  const [accent, setAccent] = useState<string>("#e63946");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("dropforge-tweaks") : null;
    if (saved) {
      try {
        const t = JSON.parse(saved);
        if (t.theme) setTheme(t.theme);
        if (t.density) setDensity(t.density);
        if (t.accent) setAccent(t.accent);
      } catch {}
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-density", density);
    document.documentElement.style.setProperty("--accent", accent);
    const lightAccents = ["#e9c46a", "#5cb89a", "#f5f1e8"];
    document.documentElement.style.setProperty("--accent-fg", lightAccents.includes(accent.toLowerCase()) ? "#0f1115" : "#fff");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dropforge-tweaks", JSON.stringify({ theme, density, accent }));
    }
  }, [theme, density, accent]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ouvrir les tweaks"
        className="btn"
        style={{
          position: "fixed", bottom: 16, right: 16, zIndex: 60,
          padding: "8px 12px", fontSize: 12,
        }}
      >
        ⚙ Tweaks
      </button>
      {open && (
        <aside
          role="dialog"
          aria-label="Tweaks"
          style={{
            position: "fixed", bottom: 60, right: 16, zIndex: 60,
            width: 260, padding: 16,
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            display: "grid", gap: 14,
          }}
        >
          <div className="eyebrow">Apparence</div>
          <Field label="Thème">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                className={`chip ${theme === t ? "chip-accent" : ""}`}
                onClick={() => setTheme(t)}
                style={{ cursor: "pointer", textTransform: "lowercase" }}
              >
                {t}
              </button>
            ))}
          </Field>
          <Field label="Densité">
            {(["compact", "cosy"] as const).map((d) => (
              <button
                key={d}
                className={`chip ${density === d ? "chip-accent" : ""}`}
                onClick={() => setDensity(d)}
                style={{ cursor: "pointer", textTransform: "lowercase" }}
              >
                {d}
              </button>
            ))}
          </Field>
          <div className="eyebrow">Accent</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {ACCENTS.map((a) => (
              <button
                key={a.c}
                onClick={() => setAccent(a.c)}
                aria-label={a.n}
                title={a.n}
                style={{
                  height: 32, background: a.c,
                  border: accent === a.c ? "2px solid var(--fg)" : "1px solid var(--border-2)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </aside>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}
