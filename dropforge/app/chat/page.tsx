import Link from "next/link";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs font-mono text-paper/40 hover:text-paper">
            ← retour
          </Link>
          <h1 className="text-2xl font-bold mt-1">Chat — toi & Victor (CEO)</h1>
          <p className="text-paper/50 text-sm">
            Le CEO classifie, délègue, synthétise. Tu n'as qu'un seul interlocuteur.
          </p>
        </div>
        <Link
          href="/office"
          className="text-xs font-mono text-paper/60 hover:text-shark border border-paper/20 px-3 py-1 rounded"
        >
          🏢 office
        </Link>
      </header>
      <ChatInterface />
    </main>
  );
}
