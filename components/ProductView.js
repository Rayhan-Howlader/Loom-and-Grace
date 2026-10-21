"use client";
import { useState } from "react";
import Link from "next/link";
import { useShop } from "@/components/Shop";
import { WHATSAPP } from "@/data/products";
import { bn, bg } from "@/lib/util";

export default function ProductView({ p, related }) {
  const { add, openCart, wish, toggleWish } = useShop();
  const [qty, setQty] = useState(1);
  const max = Math.min(p.stock, 20);
  const out = p.stock <= 0;
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`আমি "${p.name}" সম্পর্কে জানতে চাই`)}`;

  return (
    <main className="wrap">
      <div className="crumb"><Link href="/">হোম</Link> › {p.category && <>{p.category} › </>}{p.name}</div>

      <div className="pd">
        <div className="pimg" style={bg(p)} role="img" aria-label={p.name}>
          {!p.image && <span style={{ color: "#fff8", fontSize: 22 }}>Loom &amp; Grace</span>}
          {p.tag && <span className="tag">{p.tag}</span>}
        </div>

        <div className="pt">
          <h1>{p.name}</h1>
          <div className="big">{bn(p.price)}</div>
          <div className={out ? "no" : "ok"}>{out ? "স্টক শেষ" : p.stock <= 5 ? `মাত্র ${p.stock}টি বাকি আছে` : "স্টকে আছে"}</div>
          <p>{p.desc}</p>
          {p.category && <p><b>ক্যাটাগরি:</b> {p.category}</p>}

          {!out && (
            <div className="qrow">
              <b>পরিমাণ:</b>
              <div className="q"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>{qty}<button onClick={() => setQty(Math.min(max, qty + 1))}>+</button></div>
            </div>
          )}
          <button className="add" disabled={out} onClick={() => add(p, qty)}>{out ? "স্টক শেষ" : "কার্টে যোগ করুন"}</button>
          <button className="go" style={{ background: "var(--maroon)" }} disabled={out} onClick={() => { add(p, qty); openCart(); }}>এখনই কিনুন</button>
          <a className="go" href={wa} target="_blank" rel="noreferrer">WhatsApp-এ জিজ্ঞাসা করুন</a>
          <button className="add" style={{ background: "var(--line)", color: "var(--ink)" }} onClick={() => toggleWish(p.id)}>{wish.includes(p.id) ? "♥ পছন্দের তালিকায় আছে" : "♡ পছন্দের তালিকায় রাখুন"}</button>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <h2 className="sec">আরও দেখুন</h2>
          <div className="grid">
            {related.map((r) => (
              <div className="card" key={r.id}>
                <Link href={`/product/${r.id}`} className="img" style={bg(r)}>{!r.image && "Loom & Grace"}</Link>
                <div className="info">
                  <h3><Link href={`/product/${r.id}`}>{r.name}</Link></h3>
                  <div className="price">{bn(r.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
