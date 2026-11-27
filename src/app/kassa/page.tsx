import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { ActionForm } from "@/components/ActionForm";
import { saveCashOrder } from "@/lib/data/actions";
import { cashBalance, listCash } from "@/lib/data/queries";
import { formatAzn } from "@/lib/engine";
import { fmtDate } from "@/lib/dates";
import { bakuToday } from "@/lib/today";

export const metadata = { title: "Kassa · Mühasibat" };

export default function Page() {
  return (
    <>
      <Head title="Kassa" sub="Mədaxil (MO) və məxaric (XO) orderləri. Kassa qalığından çox məxaric yazmaq olmur." />
      <Live render={() => {
        const list = listCash();
        const bal = cashBalance();
        const inSum = list.filter((c) => c.kind === "in").reduce((s, c) => s + c.amount, 0);
        return (
          <div className="grid">
            <div className="panel">
              <h2>Yeni order</h2>
              <ActionForm action={saveCashOrder} submit="Yadda saxla">
                <div className="f"><label htmlFor="kind">Növ</label><select id="kind" name="kind"><option value="in">Mədaxil orderi</option><option value="out">Məxaric orderi</option></select></div>
                <div className="f"><label htmlFor="date">Tarix</label><input id="date" name="date" type="date" required defaultValue={bakuToday()} /></div>
                <div className="f"><label htmlFor="party">Kimdən / kimə</label><input id="party" name="party" required /></div>
                <div className="f"><label htmlFor="purpose">Təyinat</label><input id="purpose" name="purpose" required /></div>
                <div className="f"><label htmlFor="amount">Məbləğ, AZN</label><input id="amount" name="amount" type="number" min={0.01} step="0.01" required /></div>
              </ActionForm>
            </div>
            <div>
              <div className="kpis">
                <div className="kpi"><span className="cap">Kassa qalığı</span><b>{formatAzn(bal)} ₼</b></div>
                <div className="kpi"><span className="cap">Mədaxil cəmi</span><b>{formatAzn(inSum)} ₼</b></div>
                <div className="kpi"><span className="cap">Məxaric cəmi</span><b>{formatAzn(inSum - bal)} ₼</b></div>
              </div>
              {list.length ? (
                <div className="scroll"><table>
                  <thead><tr><th>Nömrə</th><th>Tarix</th><th>Kimdən / kimə</th><th>Təyinat</th><th className="n">Məbləğ</th></tr></thead>
                  <tbody>{list.map((c) => (
                    <tr key={c.id}><td>{c.number}</td><td>{fmtDate(c.date)}</td><td>{c.party}</td><td>{c.purpose}</td>
                      <td className={`n${c.kind === "out" ? " neg" : ""}`}>{formatAzn(c.kind === "out" ? -c.amount : c.amount)}</td></tr>
                  ))}</tbody>
                </table></div>
              ) : <p className="empty">Hələ order yoxdur.</p>}
            </div>
          </div>
        );
      }} />
    </>
  );
}
