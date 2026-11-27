import { connection } from "next/server";
import { Suspense } from "react";
import { bakuToday } from "@/lib/today";
import { TaxCalendar } from "./TaxCalendar";

async function Inner({ limit }: { limit?: number }) {
  await connection();
  return <TaxCalendar today={bakuToday()} limit={limit} />;
}

/** Tax calendar starting from today's date in Baku, resolved per request. */
export function TodayCalendar({ limit }: { limit?: number }) {
  return (
    <Suspense fallback={<p className="cap">Yüklənir…</p>}>
      <Inner limit={limit} />
    </Suspense>
  );
}
