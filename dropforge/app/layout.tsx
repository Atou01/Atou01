import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/ui/TopBar";
import TweaksPanel from "@/components/ui/TweaksPanel";

export const metadata: Metadata = {
  title: "DropForge Inc. — Virtual Office",
  description: "Dropshipping autonome opéré par 25 agents IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TopBar />
        {children}
        <TweaksPanel />
      </body>
    </html>
  );
}
