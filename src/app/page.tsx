import Link from "next/link";
import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { TaxCalendar } from "@/components/TaxCalendar";
import { cashBalance, docTotals, listDocuments, listEmployees, listStock } from "@/lib/data/queries";
import { calcPayroll, formatAzn } from "@/lib/engine";
import { fmtDate, fmtMonth, monthRange } from "@/lib/dates";
import { bakuToday } from "@/lib/today";

export default function Home() {
  return (
    <>
      <Head title="İdarə paneli" sub="Müəssisənin cari ay üzrə əsas göstəriciləri." />
      <Live render={() => {
        const today = bakuToday();
        const ym = today.slice(0, 7);
        const [from, to] = monthRange(ym);
        const sales = docTotals("sale", from, to);
        const buys = docTotals("purchase", from, to);
        const staff = listEmployees().filter((e) => e.status === "active");
        const fund = staff.reduce((s, e) => s + calcPayroll({ gross: e.salary, sector: "private", date: from }).employerCost, 0);
        const stockValue = listStock().reduce((s, p) => s + p.stock * p.avg_cost, 0);
        const recent = [...listDocuments("sale"), ...listDocuments("purchase")].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
        const kpis: [string, string, string][] = [
          [`Satış, ${fmtMonth(ym)}`, `${formatAzn(sales.total)} ₼`, "/satis"],
          [`Alış, ${fmtMonth(ym)}`, `${formatAzn(buys.total)} ₼`, "/alis"],
          ["Ödənilməli ƏDV", `${formatAzn(sales.vat - buys.vat)} ₼`, "/vergiler/edv"],
          ["Kassa qalığı", `${formatAzn(cashBalance())} ₼`, "/kassa"],
          ["Anbar (maya dəyəri)", `${formatAzn(stockValue)} ₼`, "/anbar"],
          [`İşçilər: ${staff.length}`, `${formatAzn(fund)} ₼`, "/emek-haqqi"],
        ];
        return (
          <>
            <div className="kpis wide">{kpis.map(([l, v, h]) => (
              <Link key={l} href={h} className="kpi" style={{ textDecoration: "none" }}><span className="cap">{l}</span><b>{v}</b></Link>
            ))}</div>
            <p className="cap" style={{ marginTop: -4 }}>İşçilər üzrə məbləğ: aylıq əmək haqqı fondu, işəgötürənin ödənişləri ilə.</p>
            <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", marginTop: 24 }}>
              <div>
                <h2>Son sənədlər</h2>
                {recent.length ? (
                  <div className="scroll"><table><tbody>{recent.map((d) => (
                    <tr key={d.kind + d.id}><td><Link href={`/${d.kind === "sale" ? "satis" : "alis"}/${d.id}`}>{d.number}</Link><div className="ref">{fmtDate(d.date)}</div></td>
                      <td>{d.counterparty}</td><td className="n">{formatAzn(d.total)}</td></tr>
                  ))}</tbody></table></div>
                ) : <p className="empty">Hələ sənəd yoxdur.</p>}
              </div>
              <div>
                <h2>Yaxınlaşan son tarixlər</h2>
                <TaxCalendar today={today} limit={4} compact />
              </div>
            </div>
          </>
        );
      }} />
    </>
  );
}
