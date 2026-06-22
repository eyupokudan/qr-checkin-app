"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function normalizeName(s: string): string {
  return s.replace(/İ/g, "i").replace(/I/g, "i").toLowerCase()
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ş/g, "s")
    .replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/\s+/g, " ").trim();
}

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existing, setExisting] = useState<{ id: string; name: string } | null>(null);
  const [katilimcilar, setKatilimcilar] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("qr_userId");
    const n = localStorage.getItem("qr_userName");
    if (id && n) setExisting({ id, name: n });
    else fetch("/api/katilimcilar-list").then(r => r.json()).then(setKatilimcilar);
  }, []);

  function handleNameInput(value: string) {
    setName(value);
    if (!value.trim()) { setSuggestions([]); return; }
    const norm = normalizeName(value);
    setSuggestions(
      katilimcilar.filter(k => normalizeName(k).includes(norm)).slice(0, 5)
    );
  }

  function selectSuggestion(s: string) {
    setName(s);
    setSuggestions([]);
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      const { id, name: registered } = await res.json();
      localStorage.setItem("qr_userId", id);
      localStorage.setItem("qr_userName", registered);
      router.push("/dashboard");
    } catch {
      setError("Kayıt olurken bir hata oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  if (existing) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-white mb-1">Tekrar hoş geldin,</h2>
        <p className="text-2xl text-gray-200 font-bold mb-8">{existing.name}!</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-white text-gray-900 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 active:scale-95 transition-all mb-3"
        >
          Panele Git →
        </button>
        <button
          onClick={() => { localStorage.clear(); setExisting(null); }}
          className="text-sm text-gray-400 underline"
        >
          Farklı bir isimle katıl
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-5">
          <Image src="/mta-logo.png" alt="MTA" width={180} height={180} className="object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Yarışmaya Hoş Geldin!</h2>
        <p className="text-gray-300 text-sm">
          Gebze Yerleşkesi'ndeki 7 konumu keşfet,<br />
          en hızlı tamamlayan kazanır!
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-200 mb-1">
            Adın ve Soyadın
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameInput(e.target.value)}
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            placeholder="Örn: Ahmet Yılmaz"
            className="w-full bg-gray-800 border-2 border-gray-600 text-white placeholder-gray-400 rounded-xl px-4 py-3 text-lg focus:border-gray-400 focus:outline-none transition-colors"
            maxLength={50}
            autoFocus
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl overflow-hidden shadow-xl">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 active:bg-gray-600 transition-colors text-base border-b border-gray-700 last:border-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-white text-gray-900 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Kaydediliyor..." : "Yarışmaya Başla"}
        </button>
      </form>

      <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Oryantiring Nedir?</h3>
        <p className="text-sm text-gray-300 mb-3">
          Araziye yerleştirilmiş hedefleri en kısa sürede bulup parkuru tamamlama müsabakasıdır.
        </p>
        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Nasıl Oynanır?</h3>
        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
          <li>Konumlardaki QR kodları telefonunla tara</li>
          <li>Her tarama otomatik olarak kaydedilir</li>
          <li>En hızlı 7 konumu tamamlayan kazanır!</li>
        </ol>
      </div>
    </div>
  );
}
