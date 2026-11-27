import { TodayCalendar } from "@/components/TodayCalendar";

export const metadata = { title: "Vergi təqvimi · Mühasibat və vergi" };
export default function Page() {
  return (
    <>
      <h1>Vergi təqvimi</h1>
      <p className="sub">Növbəti 12 ayın bəyannamə və ödəniş son tarixləri. Yaxın 14 gün işarələnib.</p>
      <TodayCalendar />
    </>
  );
}
