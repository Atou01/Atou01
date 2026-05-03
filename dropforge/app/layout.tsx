import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropForge Inc. — Virtual Office",
  description: "AI dropshipping company orchestrated by 25 specialized agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
