"use client";

import { useRef, useState } from "react";
import { findAgent } from "@/lib/types/agents";

interface Message {
  role: "user" | "assistant";
  content: string;
  routing?: { label: string; targetAgentId: string | null };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    setError(null);
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur.");
      setMessages([
        ...next,
        { role: "assistant", content: data.reply, routing: data.routing },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        {messages.length === 0 && (
          <div className="text-paper/40 text-sm font-mono">
            Tape ton premier message à Victor. Il classifie et délègue.
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {pending && (
          <div className="text-paper/40 text-xs font-mono animate-pulse">
            🎩 Victor réfléchit…
          </div>
        )}
        {error && (
          <div className="rounded border border-shark/40 bg-shark/10 p-3 text-shark text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-paper/20 pt-4">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Demande quelque chose au CEO… (Entrée pour envoyer)"
          className="w-full bg-ink border border-paper/20 rounded p-3 text-paper placeholder-paper/30 focus:outline-none focus:border-shark resize-none"
          disabled={pending}
        />
        <div className="flex justify-between items-center mt-2 text-xs text-paper/40 font-mono">
          <span>Tu parles uniquement à Victor. Il délègue dans la chaîne.</span>
          <button
            onClick={send}
            disabled={pending || !input.trim()}
            className="px-3 py-1 bg-shark text-ink font-bold rounded disabled:opacity-30"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg bg-paper/10 px-4 py-2 text-paper">
          {message.content}
        </div>
      </div>
    );
  }

  const target = message.routing?.targetAgentId
    ? findAgent(message.routing.targetAgentId)
    : null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="text-xs font-mono text-paper/50 mb-1">🎩 Victor Hale, CEO</div>
        <div className="rounded-lg bg-ocean/30 border border-ocean/50 px-4 py-3 text-paper whitespace-pre-wrap">
          {message.content}
        </div>
        {message.routing && (
          <div className="mt-1 text-xs font-mono text-paper/40">
            → routing: <span className="text-moss">{message.routing.label}</span>
            {target && (
              <>
                {" "}· délégué à <span className="text-paper/70">{target.emoji} {target.name}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
