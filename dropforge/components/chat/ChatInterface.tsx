"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS, findAgent } from "@/lib/types/agents";
import { ACTIVE_NOW, QUICK_PROMPTS } from "@/lib/data/mock";
import { AgentAvatar } from "@/components/ui/PixelSprite";
import Drawer from "@/components/ui/Drawer";
import AgentDetail from "@/components/ui/AgentDetail";

interface Message {
  role: "user" | "assistant";
  content: string;
  routing?: { label: string; targetAgentId: string | null };
  time: string;
}

const VICTOR = AGENTS.find((a) => a.id === "victor")!;

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerAgent, setDrawerAgent] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || pending) return;
    setError(null);
    setInput("");
    const userMsg: Message = { role: "user", content: t, time: nowHM() };
    const next = [...messages, userMsg];
    setMessages(next);
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: t,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur.");
      setMessages([...next, {
        role: "assistant",
        content: data.reply,
        routing: data.routing,
        time: nowHM(),
      }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setPending(false);
    }
  }

  const drawerAgentObj = drawerAgent ? findAgent(drawerAgent) : null;

  return (
    <main style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", height: "calc(100vh - 62px)" }}>
      <section style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", minWidth: 0 }}>
        <header style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex", gap: 12, alignItems: "center",
          background: "var(--bg-2)",
        }}>
          <AgentAvatar agentId={VICTOR.id} skin={VICTOR.skin} size={36} idle halo />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <strong>Victor Hale</strong>
              <span aria-hidden>🎩</span>
              <span className="chip chip-jade" style={{ fontSize: 10 }}>● online</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>
              CEO · {VICTOR.llmLabel} · délègue à {AGENTS.length - 1} agents
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => setMessages([])} aria-label="Effacer la conversation">↺</button>
        </header>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 24px 12px", display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.length === 0 && (
            <div className="mono" style={{ color: "var(--fg-dim)", fontSize: 12 }}>
              Tape ton premier message à Victor. Il classifie et délègue dans la chaîne.
            </div>
          )}
          {messages.map((m, i) => (
            <Bubble key={i} msg={m} onAgentClick={setDrawerAgent} />
          ))}
          {pending && <Typing />}
          {error && (
            <div className="card" style={{ padding: 12, borderColor: "var(--shark)", color: "var(--shark)" }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ padding: "8px 24px", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {QUICK_PROMPTS.map((p) => (
            <button key={p} className="chip" onClick={() => setInput(p)} style={{ cursor: "pointer" }}>
              + {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          style={{ padding: "12px 24px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, background: "var(--bg-2)" }}
        >
          <input
            type="text"
            placeholder="Écris à Victor…"
            aria-label="Message à Victor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={pending}
            style={{
              flex: 1,
              background: "var(--bg-3)",
              border: "1px solid var(--border-2)",
              padding: "10px 14px",
              outline: "none",
              fontSize: 14,
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || pending}>
            Envoyer →
          </button>
        </form>
      </section>

      <aside style={{ background: "var(--bg-2)", overflowY: "auto" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Active right now</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>
            {ACTIVE_NOW.length} agents en train de bosser
          </div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {ACTIVE_NOW.map((it, i) => {
            const a = findAgent(it.id);
            if (!a) return null;
            return (
              <li key={i} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <AgentAvatar agentId={a.id} skin={a.skin} size={32} idle />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <strong style={{ fontSize: 13 }}>{a.name}</strong>
                    <span aria-hidden style={{ fontSize: 11 }}>{a.emoji}</span>
                  </div>
                  <div className="mono" style={{
                    fontSize: 11, color: "var(--fg-dim)",
                    background: "var(--bg-3)", padding: "4px 8px",
                    marginTop: 4,
                    border: "1px solid var(--border)",
                  }}>
                    {it.text}<span style={{ color: "var(--accent)", animation: "dropforge-blink-dots 1.4s infinite" }}>…</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>IA Router · Iris</div>
          <RouterMini />
        </div>
      </aside>

      <Drawer
        open={!!drawerAgent}
        onClose={() => setDrawerAgent(null)}
        title={drawerAgentObj ? `Délégation → ${drawerAgentObj.name}` : ""}
      >
        {drawerAgentObj && <AgentDetail agent={drawerAgentObj} />}
      </Drawer>
    </main>
  );
}

function Bubble({ msg, onAgentClick }: { msg: Message; onAgentClick: (id: string) => void }) {
  const isUser = msg.role === "user";
  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ maxWidth: "70%" }}>
          <div className="card" style={{
            padding: "10px 14px",
            background: "var(--accent)", color: "var(--accent-fg)",
            borderColor: "var(--accent)",
          }}>
            {msg.content}
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-dim)", textAlign: "right", marginTop: 4 }}>
            {msg.time} · vous
          </div>
        </div>
      </div>
    );
  }

  const target = msg.routing?.targetAgentId ? findAgent(msg.routing.targetAgentId) : null;

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <AgentAvatar agentId={VICTOR.id} skin={VICTOR.skin} size={36} idle />
      <div style={{ maxWidth: "72%" }}>
        <div className="card" style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginBottom: 6 }}>
            <strong style={{ fontSize: 13 }}>Victor</strong>
            <span aria-hidden>🎩</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)" }}>· {msg.time}</span>
          </div>
          <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{msg.content}</div>
          {msg.routing && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)" }}>routing:</span>
              <span className="chip mono" style={{ fontSize: 10 }}>{msg.routing.label}</span>
              {target && (
                <button
                  onClick={() => onAgentClick(target.id)}
                  className="chip"
                  style={{ cursor: "pointer", background: "var(--bg-3)", border: "1px solid var(--border-2)" }}
                  title={`Voir ${target.name}`}
                >
                  → délégué à <strong style={{ marginLeft: 2 }}>{target.name.split(" ")[0]}</strong> {target.emoji}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <AgentAvatar agentId={VICTOR.id} skin={VICTOR.skin} size={36} idle />
      <div className="card" style={{ padding: "12px 16px", display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 6, height: 6, background: "var(--fg-dim)",
            animation: `dropforge-bounce 1s ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function RouterMini() {
  const lanes = [
    { name: "Haiku", pct: 71, color: "var(--jade)" },
    { name: "Sonnet", pct: 24, color: "var(--gold)" },
    { name: "Opus 4.7", pct: 5, color: "var(--accent)" },
  ];
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {lanes.map((l) => (
        <div key={l.name}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <span>{l.name}</span><span style={{ color: "var(--fg-dim)" }}>{l.pct}%</span>
          </div>
          <div style={{ height: 4, background: "var(--bg-3)", marginTop: 2 }}>
            <div style={{ width: `${l.pct}%`, height: "100%", background: l.color }} />
          </div>
        </div>
      ))}
      <div className="mono" style={{ fontSize: 10, color: "var(--fg-dim)", marginTop: 4 }}>
        1,247 req/h · burn $0.31/h
      </div>
    </div>
  );
}
