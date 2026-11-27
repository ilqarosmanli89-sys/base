"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Əsas" },
  { href: "/emek-haqqi", label: "Əmək haqqı" },
  { href: "/mezuniyyet", label: "Məzuniyyət" },
  { href: "/isden-cixma", label: "İşdən çıxma" },
  { href: "/teqvim", label: "Vergi təqvimi" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Bölmələr">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
