import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import MapButton from "./components/MapButton";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gebze Yerleşkesi Oryantiring",
  description: "7 konumu keşfet, en hızlı tamamlayan kazanır!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${geist.className} min-h-screen`}>
        <header className="bg-gray-100 text-gray-800 shadow-sm border-b border-gray-200">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Image src="/tubitak-logo.png" alt="TÜBİTAK" width={48} height={48} className="object-contain" />
              <div className="w-px h-8 bg-gray-300" />
              <Image src="/milliteknolojihamlesi.png" alt="Milli Teknoloji Hamlesi" width={48} height={48} className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase leading-none mb-1">
                MTA Eğitim Haftası Etkinlikleri
              </p>
              <h1 className="text-base font-black leading-tight text-gray-800">
                Gebze Yerleşkesi<br />Oryantiring
              </h1>
            </div>
            <MapButton />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
