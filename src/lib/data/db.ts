import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { seed } from "./seed";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  fin TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  hire_date TEXT NOT NULL,
  salary REAL NOT NULL CHECK (salary >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','left')),
  leave_date TEXT
);
CREATE TABLE IF NOT EXISTS counterparties (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  voen TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('customer','supplier')),
  phone TEXT
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ədəd',
  sale_price REAL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('sale','purchase')),
  number TEXT NOT NULL,
  date TEXT NOT NULL,
  counterparty_id INTEGER NOT NULL REFERENCES counterparties(id),
  vat_rate REAL NOT NULL DEFAULT 0.18,
  net REAL NOT NULL,
  vat REAL NOT NULL,
  total REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS document_lines (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  qty REAL NOT NULL CHECK (qty > 0),
  price REAL NOT NULL CHECK (price >= 0)
);
CREATE TABLE IF NOT EXISTS cash_orders (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('in','out')),
  number TEXT NOT NULL,
  date TEXT NOT NULL,
  party TEXT NOT NULL,
  purpose TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0)
);
`;

let db: DatabaseSync | undefined;

/** Opens (and on first use creates and seeds) the SQLite database. Path: DB_PATH or ./data/app.db. */
export function getDb(): DatabaseSync {
  if (db) return db;
  const path = process.env.DB_PATH || join(process.cwd(), "data", "app.db");
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM employees").get() as { n: number };
  if (n === 0 && process.env.SEED !== "0") seed(db);
  return db;
}

/**
 * Runs `fn` inside a transaction. If it throws an instance of `expected`, the transaction is
 * rolled back and the error message is returned instead; any other error is rethrown.
 */
export function tx<T>(fn: (d: DatabaseSync) => T, expected?: new (...a: never[]) => Error): T | string {
  const d = getDb();
  d.exec("BEGIN");
  try {
    const r = fn(d);
    d.exec("COMMIT");
    return r;
  } catch (e) {
    d.exec("ROLLBACK");
    if (expected && e instanceof expected) return e.message;
    throw e;
  }
}
