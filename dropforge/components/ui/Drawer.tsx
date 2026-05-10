"use client";

import { useEffect } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export default function Drawer({ open, onClose, title, children, width = 460 }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal aria-label={title} style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <div onClick={onClose} aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} />
      <aside style={{
        position: "absolute", top: 0, bottom: 0, right: 0,
        width: `min(${width}px, calc(100vw - 24px))`,
        background: "var(--bg-2)",
        borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        animation: "dropforge-slidein-r 200ms ease-out",
      }}>
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <h3 style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-dim)" }}>
            {title}
          </h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "18px 20px" }}>{children}</div>
      </aside>
    </div>
  );
}
