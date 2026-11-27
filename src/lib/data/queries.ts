import "server-only";
import { getDb } from "./db";

export interface Employee {
  id: number; full_name: string; fin: string | null; position: string; department: string;
  hire_date: string; salary: number; status: "active" | "left"; leave_date: string | null;
}
export interface Counterparty { id: number; name: string; voen: string | null; kind: "customer" | "supplier"; phone: string | null }
export interface Product { id: number; name: string; unit: string; sale_price: number }
export interface StockRow extends Product { bought: number; sold: number; stock: number; avg_cost: number }
export interface DocRow { id: number; kind: "sale" | "purchase"; number: string; date: string; counterparty: string; net: number; vat: number; total: number }
export interface DocLine { product: string; unit: string; qty: number; price: number }
export interface CashOrder { id: number; kind: "in" | "out"; number: string; date: string; party: string; purpose: string; amount: number }

// node:sqlite returns null-prototype rows; copy them into plain objects so they can be passed to Client Components.
const all = <T>(sql: string, ...p: (string | number)[]) => getDb().prepare(sql).all(...p).map((r) => ({ ...r })) as unknown as T[];
const one = <T>(sql: string, ...p: (string | number)[]) => {
  const r = getDb().prepare(sql).get(...p);
  return (r ? { ...r } : undefined) as unknown as T | undefined;
};

// SQLite sorts by code point, which puts Ə, Ç, Ş, Ü after Z; sort names with the Azerbaijani collation instead.
const az = new Intl.Collator("az");
const byName = <T>(key: keyof T) => (a: T, b: T) => az.compare(String(a[key]), String(b[key]));

export const listEmployees = () =>
  all<Employee>("SELECT * FROM employees").sort((a, b) => a.status.localeCompare(b.status) || byName<Employee>("full_name")(a, b));
export const getEmployee = (id: number) => one<Employee>("SELECT * FROM employees WHERE id = ?", id);

export const listCounterparties = (kind?: "customer" | "supplier") =>
  (kind ? all<Counterparty>("SELECT * FROM counterparties WHERE kind = ?", kind) : all<Counterparty>("SELECT * FROM counterparties")).sort(byName("name"));

export const listProducts = () => all<Product>("SELECT * FROM products").sort(byName("name"));

export const listStock = () =>
  all<StockRow>(`
    SELECT p.*,
      COALESCE(SUM(CASE WHEN d.kind='purchase' THEN l.qty END),0) AS bought,
      COALESCE(SUM(CASE WHEN d.kind='sale' THEN l.qty END),0) AS sold,
      COALESCE(SUM(CASE WHEN d.kind='purchase' THEN l.qty END),0) - COALESCE(SUM(CASE WHEN d.kind='sale' THEN l.qty END),0) AS stock,
      COALESCE(SUM(CASE WHEN d.kind='purchase' THEN l.qty*l.price END) / NULLIF(SUM(CASE WHEN d.kind='purchase' THEN l.qty END),0), 0) AS avg_cost
    FROM products p
    LEFT JOIN document_lines l ON l.product_id = p.id
    LEFT JOIN documents d ON d.id = l.document_id
    GROUP BY p.id`).sort(byName("name"));

export const listDocuments = (kind: "sale" | "purchase") =>
  all<DocRow>(`SELECT d.id, d.kind, d.number, d.date, c.name AS counterparty, d.net, d.vat, d.total
    FROM documents d JOIN counterparties c ON c.id = d.counterparty_id WHERE d.kind = ? ORDER BY d.date DESC, d.id DESC`, kind);

export const getDocument = (id: number) => {
  const doc = one<DocRow & { voen: string | null; vat_rate: number }>(`SELECT d.*, c.name AS counterparty, c.voen FROM documents d
    JOIN counterparties c ON c.id = d.counterparty_id WHERE d.id = ?`, id);
  if (!doc) return undefined;
  const lines = all<DocLine>(`SELECT p.name AS product, p.unit, l.qty, l.price FROM document_lines l
    JOIN products p ON p.id = l.product_id WHERE l.document_id = ? ORDER BY l.id`, id);
  return { ...doc, lines };
};

export const nextNumber = (table: "documents" | "cash_orders", prefix: string) => {
  const r = one<{ n: number }>(`SELECT COUNT(*) + 1 AS n FROM ${table} WHERE number LIKE ?`, `${prefix}-%`)!;
  return `${prefix}-${String(r.n).padStart(4, "0")}`;
};

export const listCash = () => all<CashOrder>("SELECT * FROM cash_orders ORDER BY date DESC, id DESC");
export const cashBalance = () =>
  one<{ b: number }>("SELECT COALESCE(SUM(CASE kind WHEN 'in' THEN amount ELSE -amount END),0) AS b FROM cash_orders")!.b;

/** Totals for documents dated within [from, to). */
export const docTotals = (kind: "sale" | "purchase", from: string, to: string) =>
  one<{ net: number; vat: number; total: number; n: number }>(
    "SELECT COALESCE(SUM(net),0) AS net, COALESCE(SUM(vat),0) AS vat, COALESCE(SUM(total),0) AS total, COUNT(*) AS n FROM documents WHERE kind = ? AND date >= ? AND date < ?",
    kind, from, to)!;
