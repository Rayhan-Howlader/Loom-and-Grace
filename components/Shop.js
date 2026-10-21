"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WHATSAPP, SHOP } from "@/data/products";
import { SITE } from "@/data/site";
import { bn, bg } from "@/lib/util";

const Ctx = createContext(null);
export const useShop = () => useContext(Ctx);
const EMPTY = { name: "", phone: "", address: "", note: "" };

export default function Shop({ children }) {
  const path = usePathname();
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [cart, setCart] = useState({});
  const [wish, setWish] = useState([]);
  const [f, setF] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("lg_cart") || "{}"));
      setWish(JSON.parse(localStorage.getItem("lg_wish") || "[]"));
      setF({ ...EMPTY, ...JSON.parse(localStorage.getItem("lg_form") || "{}") });
    } catch {}
    setReady(true);
    fetch("/api/products").then((r) => r.json()).then((d) => { setProducts(d); setLoaded(true); }).catch(() => { setLoaded(true); say("প্রোডাক্ট লোড করা যায়নি"); });
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("lg_cart", JSON.stringify(cart)); }, [cart, ready]);
  useEffect(() => { if (ready) localStorage.setItem("lg_wish", JSON.stringify(wish)); }, [wish, ready]);
  useEffect(() => { if (ready) localStorage.setItem("lg_form", JSON.stringify(f)); }, [f, ready]);

  const add = (p, qty = 1) => {
    setCart((c) => ({ ...c, [p.id]: Math.min((c[p.id] || 0) + qty, Math.min(p.stock ?? 20, 20)) }));
    say(`${p.name} কার্টে যোগ হয়েছে`);
  };
  const setQty = (id, d) => setCart((c) => {
    const p = products.find((x) => x.id === id);
    const n = Math.min((c[id] || 0) + d, Math.min(p?.stock ?? 20, 20));
    const x = { ...c }; if (n <= 0) delete x[id]; else x[id] = n; return x;
  });
  const toggleWish = (id) => setWish((w) => (w.includes(id) ? w.filter((i) => i !== id) : [...w, id]));

  const items = products.filter((p) => cart[p.id]);
  const count = items.reduce((s, p) => s + cart[p.id], 0);
  const total = items.reduce((s, p) => s + cart[p.id] * p.price, 0);

  const order = async () => {
    if (!f.name.trim() || !f.phone.trim() || !f.address.trim()) return say("নাম, ফোন ও ঠিকানা দিন");
    if (!/^(\+?88)?01\d{9}$/.test(f.phone.replace(/[\s-]/g, ""))) return say("সঠিক মোবাইল নম্বর দিন");
    setBusy(true);
    try {
      const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, items: items.map((p) => ({ id: p.id, qty: cart[p.id] })) }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "অর্ডার করা যায়নি");
      setDone({ ...d, ...f }); setCart({}); setCartOpen(false);
      fetch("/api/products").then((x) => x.json()).then(setProducts).catch(() => {});
    } catch (e) { say(e.message); }
    setBusy(false);
  };
  const waLink = (d) => {
    const lines = d.items.map((i) => `• ${i.name} × ${i.qty} = ${bn(i.price * i.qty)}`).join("\n");
    const msg = `*${SHOP} - অর্ডার #${d.id}*\n\n${lines}\n\n*মোট: ${bn(d.total)}*\n\nনাম: ${d.name}\nফোন: ${d.phone}\nঠিকানা: ${d.address}${d.note ? "\nনোট: " + d.note : ""}`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  };

  if (path.startsWith("/admin")) return children;

  return (
    <Ctx.Provider value={{ products, loaded, cart, wish, add, toggleWish, say, openCart: () => setCartOpen(true) }}>
      {SITE.announcement && <div className="ann">{SITE.announcement}</div>}
      <header className={scrolled ? "sc" : ""}>
        <div className="wrap bar">
          <button className="burger" aria-label="মেনু" onClick={() => setMenu(!menu)}>{menu ? "✕" : "☰"}</button>
          <Link href="/" className="brand" onClick={() => setMenu(false)}>
            <img src="/logo-circle.png" alt="Loom & Grace" className="clogo" />
            <span className="logo">Loom &amp; Grace<small>তাঁতকথা</small></span>
          </Link>
          <nav className={"nav" + (menu ? " open" : "")}>
            <Link href="/" onClick={() => setMenu(false)}>হোম</Link>
            <Link href="/#shop" onClick={() => setMenu(false)}>কালেকশন</Link>
            <Link href="/#gift" onClick={() => setMenu(false)}>গিফট প্যাকেজ</Link>
            <Link href="/#story" onClick={() => setMenu(false)}>আমাদের গল্প</Link>
            <Link href="/#faq" onClick={() => setMenu(false)}>জিজ্ঞাসা</Link>
          </nav>
          <button className="ibtn" onClick={() => setCartOpen(true)}>🛍 কার্ট<span className="badge">{count}</span></button>
        </div>
      </header>

      {children}

      <footer>
        <div className="wrap fgrid">
          <div><img src="/logo-circle.png" alt="Loom & Grace" className="clogo big" /><p>Inspired by Heritage, Made for Grace</p></div>
          <div><b>যোগাযোগ</b><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp: +{WHATSAPP}</a>{SITE.facebook && <a href={SITE.facebook} target="_blank" rel="noreferrer">Facebook</a>}{SITE.instagram && <a href={SITE.instagram} target="_blank" rel="noreferrer">Instagram</a>}</div>
          <div><b>লিংক</b><Link href="/">হোম</Link><Link href="/#shop">কালেকশন</Link></div>
        </div>
        <div className="copy">© {new Date().getFullYear()} {SHOP} | তাঁতকথা</div>
      </footer>

      {cartOpen && (
        <div className="ov" onClick={() => setCartOpen(false)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="top"><h3>আপনার কার্ট</h3><button className="x" onClick={() => setCartOpen(false)}>✕</button></div>
            {items.length === 0 && <p className="empty">কার্ট খালি</p>}
            {items.map((p) => (
              <div className="row" key={p.id}>
                <div className="sw" style={bg(p)} />
                <div className="n">{p.name}<br /><small>{bn(p.price)}</small></div>
                <div className="q"><button onClick={() => setQty(p.id, -1)}>−</button>{cart[p.id]}<button onClick={() => setQty(p.id, 1)}>+</button></div>
                <button className="x" onClick={() => setQty(p.id, -cart[p.id])}>🗑</button>
              </div>
            ))}
            {items.length > 0 && (
              <>
                <div className="tot"><span>মোট</span><span>{bn(total)}</span></div>
                <input placeholder="আপনার নাম" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <input placeholder="মোবাইল নম্বর (01XXXXXXXXX)" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                <textarea rows={2} placeholder="সম্পূর্ণ ঠিকানা" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
                <input placeholder="অতিরিক্ত নোট (ঐচ্ছিক)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
                <button className="go" disabled={busy} onClick={order}>{busy ? "অর্ডার হচ্ছে…" : "অর্ডার কনফার্ম করুন"}</button>
                <button className="add" style={{ background: "var(--line)", color: "var(--ink)" }} onClick={() => setCart({})}>কার্ট খালি করুন</button>
              </>
            )}
          </div>
        </div>
      )}

      {done && (
        <div className="ov c" onClick={() => setDone(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="info" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10, padding: 24 }}>
              <div style={{ fontSize: 44 }}>✅</div>
              <h3>আপনার অর্ডার গৃহীত হয়েছে!</h3>
              <p>অর্ডার নম্বর: <b>#{done.id}</b> | মোট: <b>{bn(done.total)}</b></p>
              <p>আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
              <a className="go" href={waLink(done)} target="_blank" rel="noreferrer">WhatsApp-এ কনফার্ম করুন</a>
              <button className="add" style={{ background: "var(--line)", color: "var(--ink)" }} onClick={() => setDone(null)}>বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  );
}
