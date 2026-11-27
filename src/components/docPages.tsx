import Link from "next/link";
import { notFound } from "next/navigation";
import { Head } from "./Head";
import { Live } from "./Live";
import { DocumentForm } from "./DocumentForm";
import { ActionForm } from "./ActionForm";
import { getDocument, listCounterparties, listDocuments, listStock } from "@/lib/data/queries";
import { saveCounterparty } from "@/lib/data/actions";
import { formatAzn } from "@/lib/engine";
import { fmtDate } from "@/lib/dates";
import { bakuToday } from "@/lib/today";

type Kind = "sale" | "purchase";
const T = {
  sale: { base: "/satis", list: "Satış qaimələri", one: "Satış", party: "Müştəri", parties: "Müştərilər", partiesHref: "/satis/musteriler", cpKind: "customer" as const },
  purchase: { base: "/alis", list: "Alış qaimələri", one: "Alış", party: "Təchizatçı", parties: "Təchizatçılar", partiesHref: "/alis/techizatcilar", cpKind: "supplier" as const },
};

export function DocList({ kind }: { kind: Kind }) {
  const t = T[kind];
  return (
    <>
      <Head title={t.list} sub={kind === "sale" ? "Satış anbardan malı silir, ƏDV hesablanır." : "Alış anbara mal mədaxil edir, ödənilən ƏDV əvəzləşdirilir."} action={`Yeni ${t.one.toLowerCase()}`} href={`${t.base}/yeni`} />
      <Live render={() => {
        const docs = listDocuments(kind);
        if (!docs.length) return <p className="empty">Hələ sənəd yoxdur.</p>;
        const sum = docs.reduce((a, d) => ({ net: a.net + d.net, vat: a.vat + d.vat, total: a.total + d.total }), { net: 0, vat: 0, total: 0 });
        return (
          <div className="scroll"><table>
            <thead><tr><th>Nömrə</th><th>Tarix</th><th>{t.party}</th><th className="n">ƏDV-siz</th><th className="n">ƏDV</th><th className="n">Yekun</th></tr></thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}><td><Link href={`${t.base}/${d.id}`}>{d.number}</Link></td><td>{fmtDate(d.date)}</td><td>{d.counterparty}</td>
                  <td className="n">{formatAzn(d.net)}</td><td className="n">{formatAzn(d.vat)}</td><td className="n">{formatAzn(d.total)}</td></tr>
              ))}
              <tr className="tot"><td colSpan={3}>Cəmi</td><td className="n">{formatAzn(sum.net)}</td><td className="n">{formatAzn(sum.vat)}</td><td className="n">{formatAzn(sum.total)}</td></tr>
            </tbody>
          </table></div>
        );
      }} />
    </>
  );
}

export function DocNew({ kind }: { kind: Kind }) {
  const t = T[kind];
  return (
    <>
      <Head title={`Yeni ${t.one.toLowerCase()}`} sub={<>{t.party} yoxdursa, əvvəlcə <Link href={t.partiesHref}>{t.parties.toLowerCase()}</Link> siyahısına əlavə edin.</>} />
      <Live render={() => {
        const parties = listCounterparties(t.cpKind);
        const products = listStock().map((p) => ({ id: p.id, name: p.name, unit: p.unit, price: kind === "sale" ? p.sale_price : Math.round(p.avg_cost * 100) / 100, stock: p.stock }));
        if (!products.length) return <p className="empty">Əvvəlcə <Link href="/anbar">anbara mal</Link> əlavə edin.</p>;
        return <DocumentForm kind={kind} parties={parties} products={products} today={bakuToday()} />;
      }} />
    </>
  );
}

export function DocView({ kind, params }: { kind: Kind; params: Promise<{ id: string }> }) {
  const t = T[kind];
  return (
    <Live render={async () => {
      const d = getDocument(Number((await params).id));
      if (!d || d.kind !== kind) notFound();
      return (
        <>
          <Head title={`${t.one} ${d.number}`} sub={`${fmtDate(d.date)} · ${t.party}: ${d.counterparty}${d.voen ? `, VÖEN ${d.voen}` : ""}`} />
          <div className="scroll"><table>
            <thead><tr><th>Mal</th><th className="n">Miqdar</th><th className="n">Qiymət</th><th className="n">Məbləğ</th></tr></thead>
            <tbody>
              {d.lines.map((l, i) => <tr key={i}><td>{l.product}</td><td className="n">{l.qty} {l.unit}</td><td className="n">{formatAzn(l.price)}</td><td className="n">{formatAzn(l.qty * l.price)}</td></tr>)}
              <tr><td colSpan={3}>Cəmi ƏDV-siz</td><td className="n">{formatAzn(d.net)}</td></tr>
              <tr><td colSpan={3}>ƏDV {d.vat_rate ? "18%" : "0%"}</td><td className="n">{formatAzn(d.vat)}</td></tr>
              <tr className="tot"><td colSpan={3}>Yekun</td><td className="n">{formatAzn(d.total)}</td></tr>
            </tbody>
          </table></div>
          <p className="cap" style={{ marginTop: 16 }}><Link href={t.base}>← {t.list}</Link></p>
        </>
      );
    }} />
  );
}

export function PartyPage({ kind }: { kind: Kind }) {
  const t = T[kind];
  return (
    <>
      <Head title={t.parties} />
      <div className="grid">
        <div className="panel">
          <h2>Yeni {t.party.toLowerCase()}</h2>
          <ActionForm action={saveCounterparty} submit="Əlavə et">
            <input type="hidden" name="kind" value={t.cpKind} />
            <div className="f"><label htmlFor="name">Ad</label><input id="name" name="name" required /></div>
            <div className="f"><label htmlFor="voen">VÖEN</label><input id="voen" name="voen" inputMode="numeric" maxLength={10} /></div>
            <div className="f"><label htmlFor="phone">Telefon</label><input id="phone" name="phone" type="tel" /></div>
          </ActionForm>
        </div>
        <Live render={() => {
          const list = listCounterparties(t.cpKind);
          if (!list.length) return <p className="empty">Siyahı boşdur.</p>;
          return (
            <div className="scroll"><table>
              <thead><tr><th>Ad</th><th>VÖEN</th><th>Telefon</th></tr></thead>
              <tbody>{list.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.voen}</td><td>{c.phone}</td></tr>)}</tbody>
            </table></div>
          );
        }} />
      </div>
    </>
  );
}
