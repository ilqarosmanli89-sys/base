import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { TaxCalendar } from "@/components/TaxCalendar";
import { bakuToday } from "@/lib/today";

export const metadata = { title: "Vergi təqvimi · Mühasibat" };

export default function Page() {
  return (
    <>
      <Head title="Vergi təqvimi" sub="Növbəti 12 ayın bəyannamə və ödəniş son tarixləri. Yaxın 14 gün işarələnib." />
      <Live render={() => <TaxCalendar today={bakuToday()} />} />
    </>
  );
}
