import type { DatabaseSync } from "node:sqlite";

/** Sample data so a fresh install opens with something to look at. */
export function seed(db: DatabaseSync) {
  const emp = db.prepare("INSERT INTO employees (full_name, fin, position, department, hire_date, salary) VALUES (?,?,?,?,?,?)");
  [
    ["Əliyev Rəşad Kamal oğlu", "5HJK2L9", "Direktor", "Rəhbərlik", "2019-03-01", 4500],
    ["Hüseynova Leyla Arif qızı", "7PQR3M1", "Baş mühasib", "Mühasibatlıq", "2020-06-15", 3200],
    ["Məmmədov Elvin Tofiq oğlu", "2ABC8D4", "Satış meneceri", "Satış", "2022-01-10", 1800],
    ["Quliyeva Nərmin Vüqar qızı", "9XYZ1K6", "Anbardar", "Anbar", "2024-09-02", 1100],
  ].forEach((r) => emp.run(...r));

  const cp = db.prepare("INSERT INTO counterparties (name, voen, kind, phone) VALUES (?,?,?,?)");
  [
    ["Kaspi Market MMC", "1402345671", "customer", "012 555 10 20"],
    ["Gəncə Ticarət MMC", "2003456782", "customer", "022 555 30 40"],
    ["Bakı Toptan MMC", "1504567893", "supplier", "012 555 50 60"],
  ].forEach((r) => cp.run(...r));

  const pr = db.prepare("INSERT INTO products (name, unit, sale_price) VALUES (?,?,?)");
  [
    ["Kağız A4 (500 vərəq)", "paçka", 12],
    ["Printer kartrici", "ədəd", 85],
    ["Ofis stulu", "ədəd", 240],
  ].forEach((r) => pr.run(...r));

  const doc = db.prepare("INSERT INTO documents (kind, number, date, counterparty_id, vat_rate, net, vat, total) VALUES (?,?,?,?,?,?,?,?)");
  const line = db.prepare("INSERT INTO document_lines (document_id, product_id, qty, price) VALUES (?,?,?,?)");
  const add = (kind: string, number: string, date: string, cpId: number, lines: [number, number, number][]) => {
    const net = lines.reduce((s, [, q, p]) => s + q * p, 0);
    const vat = Math.round(net * 0.18 * 100) / 100;
    const { lastInsertRowid } = doc.run(kind, number, date, cpId, 0.18, net, vat, net + vat);
    lines.forEach(([pid, q, p]) => line.run(lastInsertRowid, pid, q, p));
  };
  add("purchase", "AL-0001", "2026-11-03", 3, [[1, 200, 8], [2, 20, 60], [3, 10, 170]]);
  add("sale", "SA-0001", "2026-11-12", 1, [[1, 80, 12], [2, 6, 85]]);
  add("sale", "SA-0002", "2026-11-20", 2, [[3, 4, 240]]);

  const cash = db.prepare("INSERT INTO cash_orders (kind, number, date, party, purpose, amount) VALUES (?,?,?,?,?,?)");
  cash.run("in", "MO-0001", "2026-11-01", "Əliyev Rəşad", "Nizamnamə kapitalı", 5000);
  cash.run("in", "MO-0002", "2026-11-14", "Kaspi Market MMC", "SA-0001 üzrə ödəniş", 1734.6);
  cash.run("out", "XO-0001", "2026-11-05", "Bakı Toptan MMC", "AL-0001 üzrə ödəniş", 1000);
}
