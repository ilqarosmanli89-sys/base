import Link from "next/link";
import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { listEmployees } from "@/lib/data/queries";
import { formatAzn } from "@/lib/engine";
import { fmtDate } from "@/lib/dates";

export const metadata = { title: "İşçilər · Mühasibat" };

function years(from: string) {
  const ms = Date.now() - Date.parse(from);
  return Math.max(0, Math.floor(ms / (365.25 * 864e5)));
}

export default function Page() {
  return (
    <>
      <Head title="İşçilər" sub="Ştatdakı bütün işçilər. Əmək haqqı cədvəli bu siyahıdan hesablanır." action="İşə qəbul" href="/hr/yeni" />
      <Live render={() => {
        const list = listEmployees();
        if (!list.length) return <p className="empty">Hələ işçi yoxdur.</p>;
        return (
          <div className="scroll"><table>
            <thead><tr><th>Ad</th><th>Vəzifə</th><th>Şöbə</th><th>İşə qəbul</th><th className="n">Staj</th><th className="n">Əmək haqqı</th><th>Status</th></tr></thead>
            <tbody>{list.map((e) => (
              <tr key={e.id}>
                <td><Link href={`/hr/${e.id}`}>{e.full_name}</Link></td>
                <td>{e.position}</td><td>{e.department}</td><td>{fmtDate(e.hire_date)}</td>
                <td className="n">{years(e.hire_date)} il</td>
                <td className="n">{formatAzn(e.salary)}</td>
                <td>{e.status === "active" ? <span className="badge ok">İşləyir</span> : <span className="badge">Çıxıb</span>}</td>
              </tr>))}</tbody>
          </table></div>
        );
      }} />
    </>
  );
}
