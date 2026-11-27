"use client";

import { useState } from "react";
import { ActionForm } from "./ActionForm";
import { saveDocument } from "@/lib/data/actions";
import { formatAzn, round2 } from "@/lib/engine";

interface Opt { id: number; name: string }
interface Prod extends Opt { unit: string; price: number; stock?: number }
interface Line { product_id: number; qty: number; price: number }

export function DocumentForm({ kind, parties, products, today }: { kind: "sale" | "purchase"; parties: Opt[]; products: Prod[]; today: string }) {
  const sale = kind === "sale";
  const first = products[0];
  const [lines, setLines] = useState<Line[]>([{ product_id: first?.id ?? 0, qty: 1, price: sale ? first?.price ?? 0 : 0 }]);
  const [vat, setVat] = useState("18");
  const set = (i: number, patch: Partial<Line>) => setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const net = round2(lines.reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0));
  const tax = round2(vat === "0" ? 0 : net * 0.18);
  const byId = new Map(products.map((p) => [p.id, p]));

  return (
    <ActionForm action={saveDocument} cancel={sale ? "/satis" : "/alis"} submit={sale ? "Satışı yadda saxla" : "Alışı yadda saxla"}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <div className="form2">
        <div className="f"><label htmlFor="cp">{sale ? "Müştəri" : "Təchizatçı"}</label>
          <select id="cp" name="counterparty_id" required defaultValue="">
            <option value="" disabled>Seçin</option>
            {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select></div>
        <div className="f"><label htmlFor="date">Tarix</label><input id="date" name="date" type="date" required defaultValue={today} /></div>
        <div className="f"><label htmlFor="vat">ƏDV</label>
          <select id="vat" name="vat" value={vat} onChange={(e) => setVat(e.target.value)}>
            <option value="18">18% (VM 173.1)</option><option value="0">ƏDV-siz / azad</option>
          </select></div>
      </div>
      <div className="scroll"><table className="lines">
        <thead><tr><th>Mal</th><th className="n">Miqdar</th><th className="n">Qiymət</th><th className="n">Məbləğ</th><th></th></tr></thead>
        <tbody>
          {lines.map((l, i) => {
            const p = byId.get(l.product_id);
            return (
              <tr key={i}>
                <td style={{ minWidth: 180 }}>
                  <select aria-label="Mal" value={l.product_id} onChange={(e) => { const np = byId.get(Number(e.target.value)); set(i, { product_id: Number(e.target.value), price: sale ? np?.price ?? 0 : l.price }); }}>
                    {products.map((x) => <option key={x.id} value={x.id}>{x.name}{sale && x.stock !== undefined ? ` (qalıq ${x.stock})` : ""}</option>)}
                  </select>
                </td>
                <td className="n" style={{ width: 110 }}><input aria-label="Miqdar" type="number" min={0} step="any" value={l.qty} onChange={(e) => set(i, { qty: Number(e.target.value) })} /></td>
                <td className="n" style={{ width: 130 }}><input aria-label="Qiymət" type="number" min={0} step="0.01" value={l.price} onChange={(e) => set(i, { price: Number(e.target.value) })} /></td>
                <td className="n">{formatAzn((l.qty || 0) * (l.price || 0))} <span className="ref">{p?.unit}</span></td>
                <td><button type="button" className="x" aria-label="Sətri sil" onClick={() => setLines(lines.filter((_, j) => j !== i))}>×</button></td>
              </tr>
            );
          })}
          <tr><td colSpan={5}><button type="button" className="btn ghost" onClick={() => setLines([...lines, { product_id: first?.id ?? 0, qty: 1, price: sale ? first?.price ?? 0 : 0 }])}>+ Sətir əlavə et</button></td></tr>
          <tr><td colSpan={3}>Cəmi ƏDV-siz</td><td className="n">{formatAzn(net)}</td><td></td></tr>
          <tr><td colSpan={3}>ƏDV</td><td className="n">{formatAzn(tax)}</td><td></td></tr>
          <tr className="tot"><td colSpan={3}>Yekun</td><td className="n">{formatAzn(net + tax)}</td><td></td></tr>
        </tbody>
      </table></div>
    </ActionForm>
  );
}
