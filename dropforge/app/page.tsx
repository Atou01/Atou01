import Link from "next/link";
import { AGENTS } from "@/lib/types/agents";

export default function Home() {
  const csuite = AGENTS.filter((a) => a.level === "C-suite");
  const managers = AGENTS.filter((a) => a.level === "manager");
  const specialists = AGENTS.filter((a) => a.level === "specialist");

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <p className="text-shark text-sm font-mono mb-2">DROPFORGE INC. 🦈</p>
        <h1 className="text-5xl font-bold mb-3">Virtual Office</h1>
        <p className="text-paper/70 max-w-xl">
          25 agents IA. 1 CEO. 0 employé humain. Une entreprise qui tourne pendant que tu dors.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4 mb-16">
        <Link
          href="/chat"
          className="group rounded-lg border border-paper/20 hover:border-shark p-6 transition"
        >
          <p className="text-2xl font-bold mb-2 group-hover:text-shark">→ Parler à Victor</p>
          <p className="text-paper/60 text-sm">
            Le seul humain de l'équipe, c'est toi. Tout passe par le CEO.
          </p>
        </Link>
        <Link
          href="/office"
          className="group rounded-lg border border-paper/20 hover:border-shark p-6 transition"
        >
          <p className="text-2xl font-bold mb-2 group-hover:text-shark">→ Voir le bureau</p>
          <p className="text-paper/60 text-sm">
            Vue temps réel des 25 agents en activité.
          </p>
        </Link>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-paper/50 mb-3">C-Suite ({csuite.length})</h2>
        <ul className="grid md:grid-cols-3 gap-2 mb-8">
          {csuite.map((a) => (
            <li key={a.id} className="text-sm">
              <span className="mr-1">{a.emoji}</span>
              <span className="font-bold">{a.name}</span>
              <span className="text-paper/50"> — {a.role}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-xs uppercase tracking-widest text-paper/50 mb-3">Managers ({managers.length})</h2>
        <ul className="grid md:grid-cols-3 gap-2 mb-8">
          {managers.map((a) => (
            <li key={a.id} className="text-sm">
              <span className="mr-1">{a.emoji}</span>
              <span className="font-bold">{a.name}</span>
              <span className="text-paper/50"> — {a.role}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-xs uppercase tracking-widest text-paper/50 mb-3">Specialists ({specialists.length})</h2>
        <ul className="grid md:grid-cols-3 gap-2">
          {specialists.map((a) => (
            <li key={a.id} className="text-sm">
              <span className="mr-1">{a.emoji}</span>
              <span className="font-bold">{a.name}</span>
              <span className="text-paper/50"> — {a.role}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
