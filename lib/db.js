import { createClient } from "@libsql/client";
import { products as seed } from "@/data/products";

const g = globalThis;
export const db = g.__lgdb || (g.__lgdb = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
}));

let ready;
export function init() {
  if (!ready) {
    ready = (async () => {
      await db.batch([
        `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price INTEGER NOT NULL, category TEXT DEFAULT '', tag TEXT DEFAULT '', color TEXT DEFAULT '#6b1a26', description TEXT DEFAULT '', image TEXT DEFAULT '', stock INTEGER DEFAULT 10, active INTEGER DEFAULT 1)`,
        `CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, address TEXT, note TEXT, items TEXT, total INTEGER, status TEXT DEFAULT 'নতুন', created_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
      ], "write");
      const c = await db.execute("SELECT COUNT(*) AS n FROM products");
      if (Number(c.rows[0].n) === 0) {
        await db.batch(seed.map((p) => ({
          sql: "INSERT INTO products (name,price,category,tag,color,description,image,stock) VALUES (?,?,?,?,?,?,?,?)",
          args: [p.name, p.price, p.category, p.tag || "", p.color, p.desc, p.image || "", 10],
        })), "write");
      }
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

export const rows = (r) => r.rows.map((x) => ({ ...x }));
export const isAdmin = (req) => req.headers.get("x-admin-key") === (process.env.ADMIN_PASSWORD || "admin123");
export const fail = (msg, status = 400) => Response.json({ error: msg }, { status });
