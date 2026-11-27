"use server";

import { redirect } from "next/navigation";
import { getDb, tx } from "./db";
import { nextNumber } from "./queries";
import { round2 } from "@/lib/engine";

export type FormState = { error?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => Number(str(f, k).replace(",", "."));
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export async function saveEmployee(_: FormState, f: FormData): Promise<FormState> {
  const id = Number(str(f, "id")) || 0;
  const full_name = str(f, "full_name"), position = str(f, "position"), hire_date = str(f, "hire_date");
  const salary = num(f, "salary");
  if (!full_name || !position) return { error: "Ad və vəzifə mütləqdir." };
  if (!isDate(hire_date)) return { error: "İşə qəbul tarixi düzgün deyil." };
  if (!(salary >= 0)) return { error: "Əmək haqqı düzgün deyil." };
  const status = str(f, "status") === "left" ? "left" : "active";
  const leave_date = status === "left" ? str(f, "leave_date") || null : null;
  if (leave_date && !isDate(leave_date)) return { error: "Çıxış tarixi düzgün deyil." };
  const vals = [full_name, str(f, "fin") || null, position, str(f, "department"), hire_date, salary, status, leave_date] as const;
  const db = getDb();
  if (id) db.prepare("UPDATE employees SET full_name=?, fin=?, position=?, department=?, hire_date=?, salary=?, status=?, leave_date=? WHERE id=?").run(...vals, id);
  else db.prepare("INSERT INTO employees (full_name, fin, position, department, hire_date, salary, status, leave_date) VALUES (?,?,?,?,?,?,?,?)").run(...vals);
  redirect("/hr");
}

export async function saveCounterparty(_: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name"), kind = str(f, "kind") === "supplier" ? "supplier" : "customer";
  const voen = str(f, "voen");
  if (!name) return { error: "Ad mütləqdir." };
  if (voen && !/^\d{10}$/.test(voen)) return { error: "VÖEN 10 rəqəmdən ibarət olmalıdır." };
  getDb().prepare("INSERT INTO counterparties (name, voen, kind, phone) VALUES (?,?,?,?)").run(name, voen || null, kind, str(f, "phone") || null);
  redirect(kind === "supplier" ? "/alis/techizatcilar" : "/satis/musteriler");
}

export async function saveProduct(_: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name"), price = num(f, "sale_price");
  if (!name) return { error: "Malın adı mütləqdir." };
  if (!(price >= 0)) return { error: "Qiymət düzgün deyil." };
  getDb().prepare("INSERT INTO products (name, unit, sale_price) VALUES (?,?,?)").run(name, str(f, "unit") || "ədəd", price);
  redirect("/anbar");
}

interface LineInput { product_id: number; qty: number; price: number }

export async function saveDocument(_: FormState, f: FormData): Promise<FormState> {
  const kind = str(f, "kind") === "purchase" ? "purchase" : "sale";
  const date = str(f, "date"), cpId = Number(str(f, "counterparty_id"));
  const vatRate = str(f, "vat") === "0" ? 0 : 0.18;
  let lines: LineInput[];
  try { lines = JSON.parse(str(f, "lines")); } catch { return { error: "Sətirlər oxunmadı." }; }
  lines = lines.filter((l) => l.product_id && l.qty > 0);
  if (!isDate(date)) return { error: "Tarix düzgün deyil." };
  if (!cpId) return { error: kind === "sale" ? "Müştəri seçin." : "Təchizatçı seçin." };
  if (!lines.length) return { error: "Ən azı bir mal sətri əlavə edin." };
  if (lines.some((l) => !(l.price >= 0))) return { error: "Qiymət düzgün deyil." };

  const id = tx((db) => {
    if (kind === "sale") {
      const stock = db.prepare(`SELECT COALESCE(SUM(CASE WHEN d.kind='purchase' THEN l.qty ELSE -l.qty END),0) AS s
        FROM document_lines l JOIN documents d ON d.id = l.document_id WHERE l.product_id = ?`);
      const need = new Map<number, number>();
      lines.forEach((l) => need.set(l.product_id, (need.get(l.product_id) ?? 0) + l.qty));
      for (const [pid, q] of need) {
        const { s } = stock.get(pid) as { s: number };
        if (q > s) {
          const { name } = db.prepare("SELECT name FROM products WHERE id = ?").get(pid) as { name: string };
          throw new StockError(name, s);
        }
      }
    }
    const net = round2(lines.reduce((s, l) => s + l.qty * l.price, 0));
    const vat = round2(net * vatRate);
    const number = nextNumber("documents", kind === "sale" ? "SA" : "AL");
    const { lastInsertRowid } = db.prepare("INSERT INTO documents (kind, number, date, counterparty_id, vat_rate, net, vat, total) VALUES (?,?,?,?,?,?,?,?)")
      .run(kind, number, date, cpId, vatRate, net, vat, round2(net + vat));
    const ins = db.prepare("INSERT INTO document_lines (document_id, product_id, qty, price) VALUES (?,?,?,?)");
    lines.forEach((l) => ins.run(lastInsertRowid, l.product_id, l.qty, l.price));
    return Number(lastInsertRowid);
  }, StockError);
  if (typeof id !== "number") return { error: id };
  redirect(`/${kind === "sale" ? "satis" : "alis"}/${id}`);
}

class StockError extends Error {
  constructor(product: string, available: number) {
    super(`Anbarda kifayət qədər "${product}" yoxdur: qalıq ${available}.`);
  }
}

export async function saveCashOrder(_: FormState, f: FormData): Promise<FormState> {
  const kind = str(f, "kind") === "out" ? "out" : "in";
  const date = str(f, "date"), party = str(f, "party"), purpose = str(f, "purpose"), amount = num(f, "amount");
  if (!isDate(date)) return { error: "Tarix düzgün deyil." };
  if (!party || !purpose) return { error: "Kimdən/kimə və təyinat mütləqdir." };
  if (!(amount > 0)) return { error: "Məbləğ sıfırdan böyük olmalıdır." };
  if (kind === "out") {
    const { b } = getDb().prepare("SELECT COALESCE(SUM(CASE kind WHEN 'in' THEN amount ELSE -amount END),0) AS b FROM cash_orders").get() as { b: number };
    if (amount > b + 1e-9) return { error: `Kassada kifayət qədər pul yoxdur (qalıq ${round2(b)} AZN).` };
  }
  const number = nextNumber("cash_orders", kind === "in" ? "MO" : "XO");
  getDb().prepare("INSERT INTO cash_orders (kind, number, date, party, purpose, amount) VALUES (?,?,?,?,?,?)").run(kind, number, date, party, purpose, round2(amount));
  redirect("/kassa");
}
