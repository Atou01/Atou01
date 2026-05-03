import Link from "next/link";
import Office from "@/components/office/Office";

export default function OfficePage() {
  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs font-mono text-paper/40 hover:text-paper">
            ← retour
          </Link>
          <h1 className="text-2xl font-bold mt-1">DropForge Office 🦈</h1>
          <p className="text-paper/50 text-sm">
            Vue isométrique. Survole un agent pour voir son rôle, son LLM et son mantra.
          </p>
        </div>
        <Link
          href="/chat"
          className="text-xs font-mono text-paper/60 hover:text-shark border border-paper/20 px-3 py-1 rounded"
        >
          💬 chat
        </Link>
      </header>
      <Office />
      <p className="text-xs text-paper/40 font-mono mt-6">
        Sprint 1 stub. Animations PixiJS + Supabase Realtime arrivent en Sprint 2.
      </p>
    </main>
  );
}
