import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mühasibat və vergi",
  description: "Azərbaycan Vergi və Əmək Məcəllələrinə əsaslanan mühasibat proqramı",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="az">
      <body>
        <header className="band top">
          <div className="wrap">
            <Link href="/" className="brand">Mühasibat və vergi</Link>
            <Nav />
          </div>
        </header>
        <main className="band">
          <div className="wrap">{children}</div>
        </main>
      </body>
    </html>
  );
}
