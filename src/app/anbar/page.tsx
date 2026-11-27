import { Head } from "@/components/Head";
import { Live } from "@/components/Live";
import { ActionForm } from "@/components/ActionForm";
import { saveProduct } from "@/lib/data/actions";
import { listStock } from "@/lib/data/queries";
import { formatAzn } from "@/lib/engine";

export const metadata = { title: "Anbar · Mühasibat" };

export default function Page() {
  return (
    <>
      <Head title="Mallar və qalıqlar" sub="Qalıq alış qaimələrindən mədaxil, satış qaimələrindən məxaric kimi hesablanır. Maya dəyəri orta çəkili alış qiymətidir." />
      <div className="grid">
        <div className="panel">
          <h2>Yeni mal</h2>
          <ActionForm action={saveProduct} submit="Əlavə et">
            <div className="f"><label htmlFor="name">Adı</label><input id="name" name="name" required /></div>
            <div className="f"><label htmlFor="unit">Ölçü vahidi</label><input id="unit" name="unit" defaultValue="ədəd" /></div>
            <div className="f"><label htmlFor="sale_price">Satış qiyməti, AZN</label><input id="sale_price" name="sale_price" type="number" min={0} step="0.01" defaultValue={0} /></div>
          </ActionForm>
        </div>
        <Live render={() => {
          const list = listStock();
          if (!list.length) return <p className="empty">Hələ mal yoxdur.</p>;
          const value = list.reduce((s, p) => s + p.stock * p.avg_cost, 0);
          return (
            <div>
              <div className="kpis"><div className="kpi"><span className="cap">Anbarın maya dəyəri</span><b>{formatAzn(value)} ₼</b></div><div className="kpi"><span className="cap">Mal növü</span><b>{list.length}</b></div></div>
              <div className="scroll"><table>
                <thead><tr><th>Mal</th><th className="n">Mədaxil</th><th className="n">Məxaric</th><th className="n">Qalıq</th><th className="n">Maya</th><th className="n">Satış qiyməti</th></tr></thead>
                <tbody>{list.map((p) => (
                  <tr key={p.id}><td>{p.name}</td><td className="n">{p.bought}</td><td className="n">{p.sold}</td>
                    <td className={`n${p.stock <= 0 ? " neg" : ""}`}>{p.stock} {p.unit}</td>
                    <td className="n">{formatAzn(p.avg_cost)}</td><td className="n">{formatAzn(p.sale_price)}</td></tr>
                ))}</tbody>
              </table></div>
            </div>
          );
        }} />
      </div>
    </>
  );
}
