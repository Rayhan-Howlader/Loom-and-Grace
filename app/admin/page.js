"use client";
import { useEffect, useState } from "react";

const bn = (n) => "৳" + Number(n).toLocaleString("bn-BD");
const STATUS = ["নতুন", "কনফার্মড", "পাঠানো হয়েছে", "ডেলিভারড", "বাতিল"];
const BLANK = { name: "", price: 0, category: "", tag: "", color: "#6b1a26", description: "", image: "", stock: 10, active: 1 };
const key = () => sessionStorage.getItem("lg_key") || "";

async function api(url, opt = {}) {
  const r = await fetch(url, { ...opt, headers: { "Content-Type": "application/json", "x-admin-key": key() } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "ত্রুটি হয়েছে");
  return d;
}

export default function Admin() {
  const [pw, setPw] = useState("");
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [prods, setProds] = useState([]);
  const [np, setNp] = useState(BLANK);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const [o, p] = await Promise.all([api("/api/admin/orders"), api("/api/admin/products")]);
      setOrders(o); setProds(p); setOk(true); setMsg("");
    } catch (e) { setOk(false); setMsg(e.message); }
  };
  useEffect(() => { if (key()) load(); }, []);
  const login = () => { sessionStorage.setItem("lg_key", pw); load(); };
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2000); };
  const edit = (id, k, v) => setProds((l) => l.map((p) => (p.id === id ? { ...p, [k]: v } : p)));

  const setStatus = async (id, status) => { await api("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ id, status }) }); load(); };
  const save = async (p) => { try { await api("/api/admin/products", { method: "PUT", body: JSON.stringify(p) }); flash("সেভ হয়েছে ✓"); } catch (e) { flash(e.message); } };
  const del = async (p) => { if (confirm(`"${p.name}" মুছে ফেলবেন?`)) { await api(`/api/admin/products?id=${p.id}`, { method: "DELETE" }); load(); } };
  const create = async () => { try { await api("/api/admin/products", { method: "POST", body: JSON.stringify(np) }); setNp(BLANK); load(); flash("যোগ হয়েছে ✓"); } catch (e) { flash(e.message); } };

  if (!ok) return (
    <div className="wrap adm" style={{ maxWidth: 380, paddingTop: 80 }}>
      <h2>অ্যাডমিন লগইন</h2>
      <input type="password" placeholder="পাসওয়ার্ড" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
      <button className="add" onClick={login}>প্রবেশ করুন</button>
      {msg && <p style={{ color: "var(--maroon)" }}>{msg}</p>}
    </div>
  );

  const F = ({ p, set }) => (
    <div className="fg">
      <input placeholder="নাম" value={p.name} onChange={(e) => set("name", e.target.value)} />
      <input placeholder="দাম" type="number" value={p.price} onChange={(e) => set("price", e.target.value)} />
      <input placeholder="ক্যাটাগরি (যেমন: সিল্ক, কটন)" value={p.category} onChange={(e) => set("category", e.target.value)} />
      <input placeholder="স্টক" type="number" value={p.stock} onChange={(e) => set("stock", e.target.value)} />
      <input placeholder="ট্যাগ (নতুন/বেস্ট সেলার)" value={p.tag} onChange={(e) => set("tag", e.target.value)} />
      <input placeholder="ছবির পথ (/saree1.jpg)" value={p.image} onChange={(e) => set("image", e.target.value)} />
      <input type="color" value={p.color} onChange={(e) => set("color", e.target.value)} />
      <label><input type="checkbox" style={{ width: "auto" }} checked={!!p.active} onChange={(e) => set("active", e.target.checked ? 1 : 0)} /> দোকানে দেখান</label>
      <textarea rows={2} style={{ gridColumn: "1/-1" }} placeholder="বিবরণ" value={p.description} onChange={(e) => set("description", e.target.value)} />
    </div>
  );

  return (
    <div className="wrap adm" style={{ paddingTop: 20, paddingBottom: 60 }}>
      <div className="top"><h2>Loom &amp; Grace — অ্যাডমিন</h2><a href="/">← দোকান</a></div>
      <div className="tools">
        <button className={"chip" + (tab === "orders" ? " on" : "")} onClick={() => setTab("orders")}>অর্ডার ({orders.length})</button>
        <button className={"chip" + (tab === "products" ? " on" : "")} onClick={() => setTab("products")}>প্রোডাক্ট ({prods.length})</button>
        <button className="chip" onClick={load}>↻ রিফ্রেশ</button>
        <button className="chip" onClick={() => { sessionStorage.removeItem("lg_key"); setOk(false); }}>লগআউট</button>
      </div>
      {msg && <div className="toast">{msg}</div>}

      {tab === "orders" && (orders.length === 0 ? <p className="empty">এখনো কোনো অর্ডার নেই</p> : orders.map((o) => (
        <div className="box" key={o.id}>
          <div className="top"><b>অর্ডার #{o.id}</b><small>{o.created_at} (UTC)</small></div>
          <p>{o.name} — <a href={`tel:${o.phone}`}>{o.phone}</a></p>
          <p>{o.address}{o.note ? ` (নোট: ${o.note})` : ""}</p>
          <ul>{JSON.parse(o.items || "[]").map((i, k) => <li key={k}>{i.name} × {i.qty} = {bn(i.price * i.qty)}</li>)}</ul>
          <div className="top"><b>মোট: {bn(o.total)}</b>
            <select style={{ width: "auto" }} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
        </div>
      )))}

      {tab === "products" && (
        <>
          <div className="box"><b>নতুন প্রোডাক্ট</b><F p={np} set={(k, v) => setNp({ ...np, [k]: v })} /><button className="add" onClick={create}>যোগ করুন</button></div>
          {prods.map((p) => (
            <div className="box" key={p.id}>
              <F p={p} set={(k, v) => edit(p.id, k, v)} />
              <div className="top"><button className="add" style={{ width: "auto", padding: "8px 22px" }} onClick={() => save(p)}>সেভ</button><button className="x" onClick={() => del(p)}>🗑 মুছুন</button></div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
