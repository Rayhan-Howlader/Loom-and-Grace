"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useShop } from "@/components/Shop";
import { WHATSAPP } from "@/data/products";
import { SITE } from "@/data/site";
import { bn, bg } from "@/lib/util";

const wa = (t) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`;

export default function Home() {
  const { products, loaded, wish, toggleWish, add } = useShop();
  const [cat, setCat] = useState("সব");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");

  const catNames = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const cats = ["সব", ...catNames, "❤ পছন্দ"];
  const withImg = products.filter((p) => p.image);
  const list = useMemo(() => {
    let l = products.filter((p) =>
      (cat === "সব" || (cat === "❤ পছন্দ" ? wish.includes(p.id) : p.category === cat)) &&
      (p.name + p.desc + p.category).toLowerCase().includes(q.trim().toLowerCase()));
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [products, cat, q, sort, wish]);

  const goShop = (c) => { setCat(c); setTimeout(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }), 50); };

  return (
    <main>
      <div className="herobg">
        <section className="wrap hero2">
          <div className="ht">
            <span className="eyebrow">তাঁতকথা কালেকশন</span>
            <h1>Inspired by Heritage,<br />Made for Grace</h1>
            <p>ঐতিহ্য থেকে অনুপ্রাণিত, আভিজাত্যের জন্য নির্মিত। বাংলার ঐতিহ্যবাহী শাড়ির বাছাই করা সংগ্রহ।</p>
            <div className="cta">
              <a className="btn gold" href="#shop">কালেকশন দেখুন</a>
              <a className="btn line" href={wa("আসসালামু আলাইকুম, শাড়ি সম্পর্কে জানতে চাই")} target="_blank" rel="noreferrer">WhatsApp-এ কথা বলুন</a>
            </div>
          </div>
          {withImg.length > 0 && (
            <div className="hc">
              <Link href={`/product/${withImg[0].id}`} className="h1i" style={bg(withImg[0])} aria-label={withImg[0].name} />
              {withImg[1] && <Link href={`/product/${withImg[Math.min(4, withImg.length - 1)].id}`} className="h2i" style={bg(withImg[Math.min(4, withImg.length - 1)])} aria-label="featured" />}
            </div>
          )}
        </section>
      </div>

      <section className="wrap feat">
        {SITE.features.map((x) => (
          <div key={x.title}><span>{x.icon}</span><b>{x.title}</b><small>{x.text}</small></div>
        ))}
      </section>

      {catNames.length > 0 && (
        <section className="wrap">
          <h2 className="stitle">ক্যাটাগরি অনুযায়ী কিনুন</h2>
          <p className="ssub">আপনার পছন্দের ধরন বেছে নিন</p>
          <div className="cats">
            {catNames.map((c) => {
              const p = products.find((x) => x.category === c);
              return (
                <button key={c} className="catc" style={bg(p)} onClick={() => goShop(c)}>
                  <span>{c}<small>{products.filter((x) => x.category === c).length}টি শাড়ি</small></span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="wrap" id="shop">
        <h2 className="stitle">আমাদের কালেকশন</h2>
        <p className="ssub">সব শাড়ি এক জায়গায়</p>
        <input placeholder="🔍 শাড়ি খুঁজুন…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
        <div className="tools">
          {cats.map((c) => (
            <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}{c === "❤ পছন্দ" && wish.length ? ` (${wish.length})` : ""}</button>
          ))}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">ডিফল্ট</option>
            <option value="low">দাম: কম থেকে বেশি</option>
            <option value="high">দাম: বেশি থেকে কম</option>
          </select>
        </div>
        <div className="grid">
          {!loaded && <div className="empty">লোড হচ্ছে…</div>}
          {loaded && list.length === 0 && <div className="empty">কোনো প্রোডাক্ট পাওয়া যায়নি</div>}
          {list.map((p) => (
            <div className="card" key={p.id}>
              <Link href={`/product/${p.id}`} className="img" style={bg(p)}>
                {!p.image && "Loom & Grace"}
                {p.tag && <span className="tag">{p.tag}</span>}
              </Link>
              <button className="heart" onClick={() => toggleWish(p.id)}>{wish.includes(p.id) ? "♥" : "♡"}</button>
              <div className="info">
                <h3><Link href={`/product/${p.id}`}>{p.name}</Link></h3>
                <div className="price">{bn(p.price)}</div>
                <button className="add" disabled={p.stock <= 0} onClick={() => add(p)}>{p.stock <= 0 ? "স্টক শেষ" : "কার্টে যোগ করুন"}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="giftbg" id="gift">
        <div className="wrap gift">
          <div>
            <span className="eyebrow" style={{ color: "#e7c872" }}>🎁 গিফট প্যাকেজ</span>
            <h2>{SITE.gift.title}</h2>
            <p>{SITE.gift.text}</p>
          </div>
          <a className="btn gold" href={wa("আমি শাড়ির গিফট প্যাকেজ সম্পর্কে জানতে চাই")} target="_blank" rel="noreferrer">গিফট প্যাকেজ জানুন</a>
        </div>
      </section>

      <section className="wrap" id="story">
        <h2 className="stitle">{SITE.story.title}</h2>
        <p className="story">{SITE.story.text}</p>
        <div className="vals">
          {SITE.values.map((v) => (<div key={v.t}><b>{v.t}</b><small>{v.b}</small></div>))}
        </div>
      </section>

      <section className="wrap" id="faq" style={{ maxWidth: 760 }}>
        <h2 className="stitle">সাধারণ জিজ্ঞাসা</h2>
        <p className="ssub">আপনার মনের প্রশ্নের উত্তর</p>
        <div className="faq">
          {SITE.faq.map((x) => (<details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>))}
        </div>
      </section>

      <section className="wrap ctab">
        <h2>পছন্দের শাড়ি খুঁজে পাচ্ছেন না?</h2>
        <p>আমাদের জানান, আমরা আপনার জন্য খুঁজে দেব।</p>
        <a className="btn gold" href={wa("আসসালামু আলাইকুম, আমি একটি শাড়ি খুঁজছি")} target="_blank" rel="noreferrer">WhatsApp-এ মেসেজ করুন</a>
      </section>
    </main>
  );
}
