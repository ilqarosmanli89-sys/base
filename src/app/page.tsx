import Link from "next/link";
import { TodayCalendar } from "@/components/TodayCalendar";

const SECTIONS = [
  { href: "/emek-haqqi", title: "Əmək haqqı", text: "Gross məbləğdən net məbləğə, vergilər və işəgötürən xərci." },
  { href: "/mezuniyyet", title: "Məzuniyyət", text: "Məzuniyyət haqqı və staja görə əlavə günlər." },
  { href: "/isden-cixma", title: "İşdən çıxma", text: "Müavinət, xəbərdarlıq və istifadə edilməmiş məzuniyyət." },
  { href: "/teqvim", title: "Vergi təqvimi", text: "Bəyannamə və ödəniş son tarixləri." },
];

export default function Home() {
  return (
    <>
      <h1>Mühasibat və vergi</h1>
      <p className="sub">Hesablamalar Azərbaycan Respublikasının Vergi Məcəlləsi və Əmək Məcəlləsinin maddələrinə əsaslanır. Hər nəticənin yanında maddə nömrəsi göstərilir.</p>
      <div className="cards">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card"><b>{s.title}</b><span className="cap">{s.text}</span></Link>
        ))}
      </div>
      <h2 style={{ marginTop: 40 }}>Yaxınlaşan son tarixlər</h2>
      <TodayCalendar limit={5} />
    </>
  );
}
