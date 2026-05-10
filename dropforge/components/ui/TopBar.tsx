"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LIVE_STATS } from "@/lib/data/mock";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/office", label: "Office" },
  { href: "/reports", label: "Reports" },
];

export default function TopBar() {
  const path = usePathname();
  const isActive = (href: string) => href === "/" ? path === "/" : path.startsWith(href);

  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="DropForge home">
          <span className="brand-mark" aria-hidden>D</span>
          <span>DROPFORGE</span>
          <span style={{ color: "var(--accent)", fontFamily: "var(--font-pixel)", fontSize: 22 }}>🦈</span>
        </Link>
        <nav className="nav" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "active" : ""}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="topbar-right">
          <span className="chip" style={{ gap: 6 }}>
            <span className="live-dot" aria-hidden />
            PHASE {LIVE_STATS.phase} · LIVE
          </span>
          <span className="chip mono" style={{ background: "transparent" }}>
            {LIVE_STATS.agentsActive}/{LIVE_STATS.agentsTotal} agents
          </span>
        </div>
      </div>
    </header>
  );
}
