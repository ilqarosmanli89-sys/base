"use client";

import { useState } from "react";
import { calcPayroll, formatAzn, type Sector } from "@/lib/engine";
import { Money } from "./Money";

const YEARS = ["2026", "2027", "2028"];

export function PayrollCalculator() {
  const [gross, setGross] = useState("3200");
  const [sector, setSector] = useState<Sector>("private");
  const [year, setYear] = useState("2026");

  const g = Math.max(Number(gross) || 0, 0);
  const r = calcPayroll({ gross: g, sector, date: `${year}-01-01` });
  const parts = [
    { v: r.net, c: "--green" },
    { v: r.incomeTax, c: "--tax" },
    { v: r.dsmfEmployee, c: "--soc" },
    { v: r.medicalEmployee, c: "--med" },
    { v: r.unemploymentEmployee, c: "--un" },
  ];
  const rows = [
    { label: "Gəlir vergisi", ref: r.incomeTaxRef, v: r.incomeTax },
    { label: "DSMF (işçi)", ref: "", v: r.dsmfEmployee },
    { label: "İcbari tibbi sığorta (işçi)", ref: "", v: r.medicalEmployee },
    { label: "İşsizlik sığortası (işçi)", ref: "", v: r.unemploymentEmployee },
  ];

  return (
    <div className="grid">
      <form className="panel" onSubmit={(e) => e.preventDefault()}>
        <div className="f">
          <label htmlFor="gross">Hesablanmış əmək haqqı (gross), AZN</label>
          <input id="gross" type="number" min={0} step={10} inputMode="decimal" value={gross} onChange={(e) => setGross(e.target.value)} />
        </div>
        <div className="f">
          <label htmlFor="sector">İşəgötürənin sektoru</label>
          <select id="sector" value={sector} onChange={(e) => setSector(e.target.value as Sector)}>
            <option value="private">Qeyri-neft özəl sektor</option>
            <option value="state">Dövlət və ya neft-qaz sektoru</option>
          </select>
          <div className="hint">Gəlir vergisi şkalası buna görə seçilir (VM 101.1, 101.1-1).</div>
        </div>
        <div className="f">
          <label htmlFor="year">Vergi ili</label>
          <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </form>

      <div className="out">
        <div className="cap">İşçiyə ödənilən (net)</div>
        <div className="big"><Money value={r.net} /></div>
        <div className="bar">
          {g > 0 && parts.map((p) => (
            <i key={p.c} style={{ width: `${(p.v / g) * 100}%`, background: `var(${p.c})` }} title={formatAzn(p.v)} />
          ))}
        </div>
        <div className="legend">
          <span style={{ "--c": "var(--green)" } as React.CSSProperties}>Net</span>
          <span style={{ "--c": "var(--tax)" } as React.CSSProperties}>Gəlir vergisi</span>
          <span style={{ "--c": "var(--soc)" } as React.CSSProperties}>DSMF</span>
          <span style={{ "--c": "var(--med)" } as React.CSSProperties}>Tibbi sığorta</span>
          <span style={{ "--c": "var(--un)" } as React.CSSProperties}>İşsizlik sığortası</span>
        </div>
        <div className="scroll">
          <table>
            <thead><tr><th>Maddə</th><th className="n">AZN</th></tr></thead>
            <tbody>
              <tr><td>Hesablanmış əmək haqqı</td><td className="n">{formatAzn(r.gross)}</td></tr>
              {rows.map((x) => (
                <tr key={x.label}><td>{x.label} <span className="ref">{x.ref}</span></td><td className="n">{formatAzn(-x.v)}</td></tr>
              ))}
              <tr className="tot"><td>Ödəniləcək</td><td className="n">{formatAzn(r.net)}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="kpis">
          <div className="kpi"><span className="cap">İşəgötürən DSMF</span><b><Money value={r.dsmfEmployer} /></b></div>
          <div className="kpi"><span className="cap">İşəgötürən tibbi + işsizlik</span><b><Money value={r.medicalEmployer + r.unemploymentEmployer} /></b></div>
          <div className="kpi"><span className="cap">İşəgötürənə ümumi xərc</span><b><Money value={r.employerCost} /></b></div>
          <div className="kpi"><span className="cap">Büdcəyə cəmi</span><b><Money value={r.toBudget} /></b></div>
        </div>
        {!r.socialRatesVerified && (
          <p className="note">
            DSMF, tibbi sığorta və işsizlik sığortası dərəcələri Vergi Məcəlləsində yoxdur və hələ rəsmi mənbə ilə
            yoxlanmayıb. Gəlir vergisi güzəştləri (VM 102) hələ tətbiq edilmir.
          </p>
        )}
      </div>
    </div>
  );
}
