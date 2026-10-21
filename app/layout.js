import "./globals.css";
import { Hind_Siliguri, Playfair_Display } from "next/font/google";
import Shop from "@/components/Shop";

const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600"], display: "swap" });
const play = Playfair_Display({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Loom & Grace | তাঁতকথা",
  description: "Inspired by Heritage, Made for Grace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={hind.className}>
        <style>{`.logo,.mono,.hero2 h1,.stitle,.gift h2,.ctab h2,.vals b,.pt h1,.sec,.img{font-family:${play.style.fontFamily},${hind.style.fontFamily},serif}`}</style>
        <Shop>{children}</Shop>
      </body>
    </html>
  );
}
