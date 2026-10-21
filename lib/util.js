export const bn = (n) => "৳" + Number(n).toLocaleString("bn-BD");
export const bg = (p) =>
  p.image ? { backgroundImage: `url(${p.image})` } : { background: `linear-gradient(135deg, ${p.color || "#6b1a26"}, ${(p.color || "#6b1a26")}bb)` };
