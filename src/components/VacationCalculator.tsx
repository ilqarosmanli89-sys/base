"use client";

import { useState } from "react";
import { calcVacationPay, formatAzn } from "@/lib/engine";
import { Money } from "./Money";

export function VacationCalculator() {
  const [earnings, setEarnings] = useState("38400");
  const [months, setMonths] = useState("12");
  const [baseDays, setBaseDays] = useState("21");
  const [years, setYears] = useState("7");
  const [other, setOther] = useState("0");

  const r = calcVacationPay({
    earnings: Number(earnings) || 0,
    months: Number(months) || 1,
    baseDays: Number(baseDays),
    seniorityYears: Number(years) || 0,
    otherDays: Number(other) || 0,
  });

  return (
    <div className="grid">
      <form className="panel" onSubmit={(e) => e.preventDefault()}>
        <div className="f"><label htmlFor="earn">Son 12 ayın əmək haqqı cəmi, AZN</label>
          <input id="earn" type="number" min={0} step={100} value={earnings} onChange={(e) => setEarnings(e.target.value)} /></div>
        <div className="f"><label htmlFor="months">Tam işlənmiş aylar</label>
          <input id="months" type="number" min={1} max={12} value={months} onChange={(e) => setMonths(e.target.value)} />
          <div className="hint">12 aydan az işləyibsə, faktiki tam aylar (ƏM 140.2).</div></div>
        <div className="f"><label htmlFor="base">Əsas məzuniyyət</label>
          <select id="base" value={baseDays} onChange={(e) => setBaseDays(e.target.value)}>
            <option value="21">21 gün (ümumi)</option>
            <option value="30">30 gün (rəhbər, mütəxəssis, həkim və s.)</option>
          </select></div>
        <div className="f"><label htmlFor="years">İş stajı, il</label>
          <input id="years" type="number" min={0} value={years} onChange={(e) => setYears(e.target.value)} /></div>
        <div className="f"><label htmlFor="other">Digər əlavə günlər</label>
          <input id="other" type="number" min={0} value={other} onChange={(e) => setOther(e.target.value)} />
          <div className="hint">Ağır şərait, uşaqlı qadınlar və s. (ƏM 115, 117).</div></div>
      </form>
      <div className="out">
        <div className="cap">Məzuniyyət haqqı</div>
        <div className="big"><Money value={r.pay} /></div>
        <div className="kpis">
          <div className="kpi"><span className="cap">Orta aylıq</span><b><Money value={r.avgMonthly} /></b></div>
          <div className="kpi"><span className="cap">Bir günlük</span><b><Money value={r.daily} /></b></div>
          <div className="kpi"><span className="cap">Məzuniyyət günləri</span><b>{r.days}</b></div>
        </div>
        <div className="scroll"><table><tbody>
          <tr><td>{formatAzn(Number(earnings) || 0)} ÷ {months} ay <span className="ref">ƏM 140.3</span></td><td className="n">{formatAzn(r.avgMonthly)}</td></tr>
          <tr><td>÷ 30,4 (ayın orta təqvim günləri)</td><td className="n">{formatAzn(r.daily)}</td></tr>
          <tr><td>Əsas {baseDays} + staja görə {r.seniorityDays} + digər {Number(other) || 0} gün <span className="ref">ƏM 114, 116</span></td><td className="n">{r.days} gün</td></tr>
          <tr className="tot"><td>Məzuniyyət haqqı</td><td className="n">{formatAzn(r.pay)}</td></tr>
        </tbody></table></div>
        <p className="cap">Ən geci məzuniyyətin başlanmasına 3 gün qalmış ödənilir (ƏM 140.5). Məzuniyyətə düşən bayram günləri məzuniyyəti uzadır (ƏM 114.6).</p>
      </div>
    </div>
  );
}
