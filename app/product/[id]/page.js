import { notFound } from "next/navigation";
import { db, init, rows } from "@/lib/db";
import ProductView from "@/components/ProductView";

export const dynamic = "force-dynamic";

const shape = ({ description, ...p }) => ({ ...p, desc: description });

async function getProduct(id) {
  await init();
  const r = rows(await db.execute({ sql: "SELECT * FROM products WHERE id=? AND active=1", args: [Number(id)] }));
  return r[0] ? shape(r[0]) : null;
}

export async function generateMetadata({ params }) {
  const p = await getProduct(params.id);
  return { title: p ? `${p.name} | Loom & Grace` : "প্রোডাক্ট পাওয়া যায়নি" };
}

export default async function ProductPage({ params }) {
  const p = await getProduct(params.id);
  if (!p) notFound();
  const rel = rows(await db.execute({ sql: "SELECT * FROM products WHERE active=1 AND id!=? ORDER BY (category=?) DESC, id LIMIT 4", args: [p.id, p.category] })).map(shape);
  return <ProductView p={p} related={rel} />;
}
