import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { getDb } from "@/lib/data/db";
import { formatAzn } from "@/lib/engine";
import { fmtMonth } from "@/lib/dates";

export const metadata = { title: "ƏDV hesabı · Mühasibat" };

interface Row { ym: string; out_vat: number; in_vat: number; sales: number }

export default function Page() {
  return (
    <>
      <Head title="ƏDV hesabı" sub="Hər ay üçün: satışdan hesablanan ƏDV çıxılsın alışda ödənilən (əvəzləşdirilən) ƏDV. Bəyannamə növbəti ayın 20-dək verilir (VM 174, 175, 177.2)." />
      <Live render={() => {
        const rows = getDb().prepare(`SELECT substr(date,1,7) AS ym,
            SUM(CASE WHEN kind='sale' THEN vat ELSE 0 END) AS out_vat,
            SUM(CASE WHEN kind='purchase' THEN vat ELSE 0 END) AS in_vat,
            SUM(CASE WHEN kind='sale' THEN net ELSE 0 END) AS sales
          FROM documents GROUP BY ym ORDER BY ym DESC`).all() as unknown as Row[];
        if (!rows.length) return <p className="empty">Hələ satış və ya alış yoxdur.</p>;
        return (
          <div className="scroll"><table>
            <thead><tr><th>Ay</th><th className="n">Vergi tutulan dövriyyə</th><th className="n">Hesablanan ƏDV</th><th className="n">Əvəzləşdirilən ƏDV</th><th className="n">Büdcəyə</th></tr></thead>
            <tbody>{rows.map((r) => {
              const due = r.out_vat - r.in_vat;
              return (
                <tr key={r.ym}><td>{fmtMonth(r.ym)}</td><td className="n">{formatAzn(r.sales)}</td><td className="n">{formatAzn(r.out_vat)}</td><td className="n">{formatAzn(r.in_vat)}</td>
                  <td className={`n${due < 0 ? " neg" : ""}`}>{formatAzn(due)}</td></tr>
              );
            })}</tbody>
          </table>
          <p className="cap">Mənfi məbləğ əvəzləşdirilən ƏDV-nin hesablanandan çox olduğunu göstərir (VM 179).</p></div>
        );
      }} />
    </>
  );
}
