"use client";

import { useState } from "react";
import { deadlines, type Deadline, type Regime } from "@/lib/engine";

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
const WEEKDAYS = ["bazar", "bazar ertəsi", "çərşənbə axşamı", "çərşənbə", "cümə axşamı", "cümə", "şənbə"];

function groupByMonth(list: Deadline[]) {
  const months = new Map<string, Map<string, Deadline[]>>();
  for (const d of list) {
    const m = d.date.slice(0, 7);
    if (!months.has(m)) months.set(m, new Map());
    const days = months.get(m)!;
    if (!days.has(d.date)) days.set(d.date, []);
    days.get(d.date)!.push(d);
  }
  return months;
}

export function TaxCalendar({ today, limit, compact }: { today: string; limit?: number; compact?: boolean }) {
  const [regime, setRegime] = useState<Regime>("vat");
  const [excise, setExcise] = useState(false);
  let list = deadlines(today, { regime, excise });
  if (limit) {
    const dates = [...new Set(list.map((d) => d.date))].slice(0, limit);
    list = list.filter((d) => dates.includes(d.date));
  }
  const soonLimit = new Date(Date.parse(today) + 14 * 864e5).toISOString().slice(0, 10);

  const listing = (
      <div>
        {[...groupByMonth(list)].map(([month, days]) => (
          <div key={month}>
            <div className="month">{MONTHS[Number(month.slice(5)) - 1]} {month.slice(0, 4)}</div>
            <ul className="cal">
              {[...days].map(([date, items]) => {
                const d = new Date(`${date}T00:00:00`);
                return (
                  <li key={date} className={date <= soonLimit ? "soon" : undefined}>
                    <div className="d">{d.getDate()} {MONTHS[d.getMonth()]}<small>{WEEKDAYS[d.getDay()]}</small></div>
                    <div>{items.map((x) => <div key={x.title}>{x.title} <span className="ref">{x.ref}</span></div>)}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
  );
  if (compact) return listing;
  return (
    <div className="grid">
      <form className="panel" onSubmit={(e) => e.preventDefault()}>
        <div className="f"><label htmlFor="regime">Vergi rejimi</label>
          <select id="regime" value={regime} onChange={(e) => setRegime(e.target.value as Regime)}>
            <option value="vat">ƏDV və mənfəət vergisi ödəyicisi</option>
            <option value="simplified">Sadələşdirilmiş vergi ödəyicisi</option>
          </select></div>
        <div className="f"><label htmlFor="excise">Aksizli mal istehsal edir</label>
          <select id="excise" value={excise ? "1" : "0"} onChange={(e) => setExcise(e.target.value === "1")}>
            <option value="0">Xeyr</option><option value="1">Bəli</option>
          </select></div>
        <p className="hint">Tarix istirahət gününə düşəndə köçürülmə qaydası hələ tətbiq edilmir.</p>
      </form>
      {listing}
    </div>
  );
}
