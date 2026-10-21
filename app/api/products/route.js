import { db, init, rows } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  await init();
  const r = rows(await db.execute("SELECT * FROM products WHERE active=1 ORDER BY id"));
  return Response.json(r.map(({ description, ...p }) => ({ ...p, desc: description })));
}
