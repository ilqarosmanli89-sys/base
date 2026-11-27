"use client";

import { useState } from "react";
import { calcSeverance, formatAzn, type TerminationReason } from "@/lib/engine";
import { Money } from "./Money";

export function SeveranceCalculator() {
  const [avg, setAvg] = useState("3200");
  const [years, setYears] = useState("3");
  const [reason, setReason] = useState<TerminationReason>("redundancy");
  const [inLieu, setInLieu] = useState(false);
  const [unused, setUnused] = useState("10");

  const a = Number(avg) || 0;
  const r = calcSeverance({ avgMonthly: a, years: Number(years) || 0, reason, payInLieuOfNotice: inLieu, unusedLeaveDays: Number(unused) || 0 });

  return (
    <div className="grid">
      <form className="panel" onSubmit={(e) => e.preventDefault()}>
        <div className="f"><label htmlFor="avg">Orta aylıq əmək haqqı, AZN</label>
          <input id="avg" type="number" min={0} step={10} value={avg} onChange={(e) => setAvg(e.target.value)} /></div>
        <div className="f"><label htmlFor="yrs">Bu işəgötürəndə staj, il</label>
          <input id="yrs" type="number" min={0} step={0.5} value={years} onChange={(e) => setYears(e.target.value)} /></div>
        <div className="f"><label htmlFor="reason">Xitam əsası</label>
          <select id="reason" value={reason} onChange={(e) => setReason(e.target.value as TerminationReason)}>
            <option value="redundancy">Ştat ixtisarı və ya ləğv (ƏM 70 a, b)</option>
            <option value="employee">İşçinin öz təşəbbüsü (ƏM 69)</option>
          </select></div>
        <div className="f"><label htmlFor="lieu">Xəbərdarlıq əvəzinə pul</label>
          <select id="lieu" value={inLieu ? "1" : "0"} onChange={(e) => setInLieu(e.target.value === "1")}>
            <option value="0">Xeyr, xəbərdarlıq edilir</option>
            <option value="1">Bəli, işçinin razılığı ilə (ƏM 77.4)</option>
          </select></div>
        <div className="f"><label htmlFor="unused">İstifadə edilməmiş əsas məzuniyyət, gün</label>
          <input id="unused" type="number" min={0} value={unused} onChange={(e) => setUnused(e.target.value)} /></div>
      </form>
      <div className="out">
        <div className="cap">İşdən çıxan gün ödənilməli olan cəmi (ƏM 172.4)</div>
        <div className="big"><Money value={r.total} /></div>
        <div className="scroll"><table><tbody>
          {reason === "redundancy" && <tr><td>İşdənçıxarma müavinəti: {r.severanceMultiplier} aylıq <span className="ref">ƏM 77.3</span></td><td className="n">{formatAzn(r.severance)}</td></tr>}
          {r.inLieu > 0 && <tr><td>{r.noticeWeeks} həftəlik xəbərdarlıq əvəzinə: {r.inLieuMultiplier} aylıq <span className="ref">ƏM 77.4</span></td><td className="n">{formatAzn(r.inLieu)}</td></tr>}
          <tr><td>İstifadə edilməmiş məzuniyyət: {Number(unused) || 0} gün <span className="ref">ƏM 144, 140</span></td><td className="n">{formatAzn(r.leaveCompensation)}</td></tr>
          <tr className="tot"><td>Cəmi (vergilərdən əvvəl)</td><td className="n">{formatAzn(r.total)}</td></tr>
        </tbody></table></div>
        <p className="cap">
          {reason === "employee"
            ? "İşçinin öz təşəbbüsü ilə çıxışda müavinət ödənilmir, yalnız istifadə edilməmiş məzuniyyətə görə kompensasiya."
            : inLieu
              ? "Xəbərdarlıq edilmədən, pul əvəzi ilə."
              : `İşçiyə azı ${r.noticeWeeks} həftə əvvəl xəbərdarlıq edilməlidir; bu müddətdə həftədə 1 iş günü iş axtarmaq üçün azad edilir (ƏM 77.1, 77.2).`}
        </p>
      </div>
    </div>
  );
}
