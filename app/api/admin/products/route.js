import { db, init, rows, isAdmin, fail } from "@/lib/db";
export const dynamic = "force-dynamic";

const vals = (b) => [String(b.name || "").trim(), Math.max(0, parseInt(b.price) || 0), b.category || "", b.tag || "", b.color || "#6b1a26", b.description || "", b.image || "", Math.max(0, parseInt(b.stock) || 0), b.active ? 1 : 0];

export async function GET(req) {
  if (!isAdmin(req)) return fail("পাসওয়ার্ড ভুল", 401);
  await init();
  return Response.json(rows(await db.execute("SELECT * FROM products ORDER BY id DESC")));
}
export async function POST(req) {
  if (!isAdmin(req)) return fail("পাসওয়ার্ড ভুল", 401);
  const b = await req.json();
  if (!String(b.name || "").trim()) return fail("নাম দিন");
  await init();
  await db.execute({ sql: "INSERT INTO products (name,price,category,tag,color,description,image,stock,active) VALUES (?,?,?,?,?,?,?,?,?)", args: vals(b) });
  return Response.json({ ok: true });
}
export async function PUT(req) {
  if (!isAdmin(req)) return fail("পাসওয়ার্ড ভুল", 401);
  const b = await req.json();
  await init();
  await db.execute({ sql: "UPDATE products SET name=?,price=?,category=?,tag=?,color=?,description=?,image=?,stock=?,active=? WHERE id=?", args: [...vals(b), Number(b.id)] });
  return Response.json({ ok: true });
}
export async function DELETE(req) {
  if (!isAdmin(req)) return fail("পাসওয়ার্ড ভুল", 401);
  await init();
  await db.execute({ sql: "DELETE FROM products WHERE id=?", args: [Number(new URL(req.url).searchParams.get("id"))] });
  return Response.json({ ok: true });
}
