import { db, init, rows, isAdmin, fail } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(req) {
  if (!isAdmin(req)) return fail("পাসওয়ার্ড ভুল", 401);
  await init();
  return Response.json(rows(await db.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 300")));
}
export async function PATCH(req) {
  if (!isAdmin(req)) return fail("পাসওয়ার্ড ভুল", 401);
  const { id, status } = await req.json();
  await init();
  await db.execute({ sql: "UPDATE orders SET status=? WHERE id=?", args: [String(status), Number(id)] });
  return Response.json({ ok: true });
}
