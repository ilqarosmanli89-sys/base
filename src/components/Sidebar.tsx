"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

export const MENU: { group: string; items: { href: string; label: string; soon?: boolean }[] }[] = [
  { group: "", items: [{ href: "/", label: "İdarə paneli" }] },
  { group: "HR", items: [{ href: "/hr", label: "İşçilər" }, { href: "/hr/yeni", label: "İşə qəbul" }] },
  { group: "Əmək haqqı", items: [
    { href: "/emek-haqqi", label: "Aylıq cədvəl" },
    { href: "/emek-haqqi/kalkulyator", label: "Kalkulyator" },
    { href: "/mezuniyyet", label: "Məzuniyyət" },
    { href: "/isden-cixma", label: "İşdən çıxma" },
  ] },
  { group: "Satış", items: [{ href: "/satis", label: "Satış qaimələri" }, { href: "/satis/musteriler", label: "Müştərilər" }] },
  { group: "Alış", items: [{ href: "/alis", label: "Alış qaimələri" }, { href: "/alis/techizatcilar", label: "Təchizatçılar" }] },
  { group: "Anbar", items: [{ href: "/anbar", label: "Mallar və qalıqlar" }] },
  { group: "Kassa", items: [{ href: "/kassa", label: "Mədaxil və məxaric" }] },
  { group: "Vergilər", items: [{ href: "/vergiler/edv", label: "ƏDV hesabı" }, { href: "/teqvim", label: "Vergi təqvimi" }] },
  { group: "Mühasibat", items: [
    { href: "/tezlikle/hesablar-plani", label: "Hesablar planı", soon: true },
    { href: "/tezlikle/esas-vesaitler", label: "Əsas vəsaitlər", soon: true },
    { href: "/tezlikle/bank", label: "Bank", soon: true },
    { href: "/tezlikle/hesabatlar", label: "Maliyyə hesabatları", soon: true },
  ] },
  { group: "Sistem", items: [{ href: "/tezlikle/tenzimlemeler", label: "Tənzimləmələr", soon: true }] },
];

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  if (href === "/hr" || href === "/satis" || href === "/alis" || href === "/emek-haqqi")
    return path === href || (/^\/(hr|satis|alis)\/\d+$/.test(path) && path.startsWith(href + "/"));
  return path === href || path.startsWith(href + "/");
}

function SidebarView({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="side">
      <div className="side-top">
        <Link href="/" className="brand">Mühasibat</Link>
        <button className="menu-btn" aria-expanded={open} aria-controls="side-nav" onClick={() => setOpen(!open)}>Menyu</button>
      </div>
      <nav id="side-nav" className={open ? "open" : undefined} aria-label="Bölmələr">
        {MENU.map((g) => (
          <div key={g.group || "main"} className="grp">
            {g.group && <div className="grp-h">{g.group}</div>}
            {g.items.map((i) => (
              <Link key={i.href} href={i.href} onClick={() => setOpen(false)} aria-current={isActive(path, i.href) ? "page" : undefined} className={i.soon ? "soon" : undefined}>
                {i.label}{i.soon && <small> tezliklə</small>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function ActiveSidebar() {
  return <SidebarView path={usePathname()} />;
}

/** Left navigation. The active link needs the URL, which on dynamic routes is only known at request time. */
export function Sidebar() {
  return (
    <Suspense fallback={<SidebarView path="" />}>
      <ActiveSidebar />
    </Suspense>
  );
}
