import Link from "next/link";
import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { listEmployees } from "@/lib/data/queries";
import { calcPayroll, formatAzn, type Sector } from "@/lib/engine";
import { fmtMonth, monthRange, MONTHS } from "@/lib/dates";
import { bakuToday } from "@/lib/today";

export const metadata = { title: "Əmək haqqı cədvəli · Mühasibat" };

export default function Page({ searchParams }: PageProps<"/emek-haqqi">) {
  return (
    <>
      <Head title="Əmək haqqı cədvəli" sub="Ay üzrə bütün işçilərin hesablanması. Vergi şkalası seçilən aya görə avtomatik tətbiq olunur." />
      <Live render={async () => {
        const sp = await searchParams;
        const ym = typeof sp.ay === "string" && /^\d{4}-\d{2}$/.test(sp.ay) ? sp.ay : bakuToday().slice(0, 7);
        const sector: Sector = sp.sektor === "state" ? "state" : "private";
        const [from, to] = monthRange(ym);
        if (from < "2026-01-01") return <p className="error">Vergi şkalaları 2026-cı ildən başlayır.</p>;
        const emps = listEmployees().filter((e) => e.hire_date < to && (e.status === "active" || (e.leave_date ?? "") >= from));
        const rows = emps.map((e) => ({ e, r: calcPayroll({ gross: e.salary, sector, date: from }) }));
        const sum = (k: "gross" | "incomeTax" | "dsmfEmployee" | "medicalEmployee" | "unemploymentEmployee" | "net" | "employerCost") => rows.reduce((s, x) => s + x.r[k], 0);
        const y = Number(ym.slice(0, 4));
        const months = [y - 1, y, y + 1].flatMap((yy) => MONTHS.map((_, i) => `${yy}-${String(i + 1).padStart(2, "0")}`)).filter((m) => m >= "2026-01");
        return (
          <>
            <form className="form2" style={{ marginBottom: 16 }}>
              <div className="f"><label htmlFor="ay">Ay</label>
                <select id="ay" name="ay" defaultValue={ym}>{months.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}</select></div>
              <div className="f"><label htmlFor="sektor">Sektor</label>
                <select id="sektor" name="sektor" defaultValue={sector}><option value="private">Qeyri-neft özəl sektor</option><option value="state">Dövlət və ya neft-qaz</option></select></div>
              <div className="f" style={{ alignSelf: "end" }}><button className="btn ghost">Göstər</button></div>
            </form>
            <div className="kpis">
              <div className="kpi"><span className="cap">Hesablanıb (gross)</span><b>{formatAzn(sum("gross"))} ₼</b></div>
              <div className="kpi"><span className="cap">İşçilərə ödəniləcək</span><b>{formatAzn(sum("net"))} ₼</b></div>
              <div className="kpi"><span className="cap">Gəlir vergisi</span><b>{formatAzn(sum("incomeTax"))} ₼</b></div>
              <div className="kpi"><span className="cap">İşəgötürənin xərci</span><b>{formatAzn(sum("employerCost"))} ₼</b></div>
            </div>
            {rows.length ? (
              <div className="scroll"><table>
                <thead><tr><th>İşçi</th><th className="n">Gross</th><th className="n">Gəlir v.</th><th className="n">DSMF</th><th className="n">Tibbi</th><th className="n">İşsizlik</th><th className="n">Net</th></tr></thead>
                <tbody>
                  {rows.map(({ e, r }) => (
                    <tr key={e.id}><td><Link href={`/hr/${e.id}`}>{e.full_name}</Link><div className="ref">{e.position}</div></td>
                      <td className="n">{formatAzn(r.gross)}</td><td className="n">{formatAzn(r.incomeTax)}</td><td className="n">{formatAzn(r.dsmfEmployee)}</td>
                      <td className="n">{formatAzn(r.medicalEmployee)}</td><td className="n">{formatAzn(r.unemploymentEmployee)}</td><td className="n"><b>{formatAzn(r.net)}</b></td></tr>
                  ))}
                  <tr className="tot"><td>Cəmi, {fmtMonth(ym)}</td><td className="n">{formatAzn(sum("gross"))}</td><td className="n">{formatAzn(sum("incomeTax"))}</td><td className="n">{formatAzn(sum("dsmfEmployee"))}</td>
                    <td className="n">{formatAzn(sum("medicalEmployee"))}</td><td className="n">{formatAzn(sum("unemploymentEmployee"))}</td><td className="n">{formatAzn(sum("net"))}</td></tr>
                </tbody>
              </table></div>
            ) : <p className="empty">Bu ayda işləyən işçi yoxdur.</p>}
            <p className="note">Ay ərzində işə qəbul və çıxış zamanı işlənmiş günlərə görə proporsional hesablama, tabel və güzəştlər (VM 102) hələ tətbiq edilmir. Sosial ödəniş dərəcələri rəsmi mənbə ilə yoxlanmalıdır.</p>
          </>
        );
      }} />
    </>
  );
}
