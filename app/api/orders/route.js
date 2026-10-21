import { db, init, rows, fail } from "@/lib/db";

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return fail("ভুল অনুরোধ"); }
  const name = String(b.name || "").trim(), phone = String(b.phone || "").replace(/[\s-]/g, ""), address = String(b.address || "").trim(), note = String(b.note || "").trim();
  const items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];
  if (!name || !address || !/^(\+?88)?01\d{9}$/.test(phone)) return fail("নাম, সঠিক মোবাইল নম্বর ও ঠিকানা দিন");
  if (!items.length) return fail("কার্ট খালি");

  await init();
  const ids = items.map((i) => Number(i.id));
  const found = rows(await db.execute({ sql: `SELECT * FROM products WHERE active=1 AND id IN (${ids.map(() => "?").join(",")})`, args: ids }));

  const lines = [], stmts = [];
  let total = 0;
  for (const it of items) {
    const p = found.find((x) => x.id === Number(it.id));
    const qty = Math.floor(Number(it.qty));
    if (!p || !(qty >= 1 && qty <= 20)) return fail("অবৈধ প্রোডাক্ট");
    if (p.stock < qty) return fail(`"${p.name}" পর্যাপ্ত স্টকে নেই`);
    lines.push({ name: p.name, qty, price: p.price });
    total += p.price * qty; // দাম সার্ভার থেকেই হিসাব হয়
    stmts.push({ sql: "UPDATE products SET stock = stock - ? WHERE id=? AND stock >= ?", args: [qty, p.id, qty] });
  }
  stmts.push({ sql: "INSERT INTO orders (name,phone,address,note,items,total) VALUES (?,?,?,?,?,?)", args: [name, phone, address, note, JSON.stringify(lines), total] });
  const res = await db.batch(stmts, "write");
  return Response.json({ id: Number(res[res.length - 1].lastInsertRowid), total, items: lines });
}
