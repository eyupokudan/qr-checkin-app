"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { checkpoints } from "@/lib/checkpoints";

type Status = "idle" | "loading" | "success" | "already" | "error" | "invalid";

export default function NoktaPage() {
  const params = useParams();
  const noktaId = String(params.id);
  const cp = checkpoints.find((c) => c.id === noktaId);

  const [status, setStatus] = useState<Status>("idle");
  const [userName, setUserName] = useState("");
  const [formName, setFormName] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [toplamNokta, setToplamNokta] = useState(0);
  const [hasUser, setHasUser] = useState<boolean | null>(null);
  const [katilimcilar, setKatilimcilar] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!cp) { setStatus("invalid"); return; }
    const userId = localStorage.getItem("qr_userId");
    const name = localStorage.getItem("qr_userName") ?? "";
    setHasUser(!!userId);
    if (userId) {
      setUserName(name);
      doCheckIn(userId);
    } else {
      fetch("/api/katilimcilar-list").then(r => r.json()).then(setKatilimcilar);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function normalizeName(s: string): string {
    return s.replace(/İ/g, "i").replace(/I/g, "i").toLowerCase()
      .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ş/g, "s")
      .replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u")
      .replace(/\s+/g, " ").trim();
  }

  function handleNameInput(value: string) {
    setFormName(value);
    if (!value.trim()) { setSuggestions([]); return; }
    const norm = normalizeName(value);
    setSuggestions(
      katilimcilar.filter(k => normalizeName(k).includes(norm)).slice(0, 5)
    );
  }

  function selectSuggestion(name: string) {
    setFormName(name);
    setSuggestions([]);
  }

  async function doCheckIn(userId: string) {
    setStatus("loading");
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, checkpointId: noktaId }),
      });
      const data = await res.json();
      if (res.status === 404) {
        localStorage.removeItem("qr_userId");
        localStorage.removeItem("qr_userName");
        setHasUser(false);
        fetch("/api/katilimcilar-list").then(r => r.json()).then(setKatilimcilar);
        return;
      }
      if (data.alreadyChecked) { setStatus("already"); return; }
      if (!data.success) { setStatus("error"); return; }
      const prog = await fetch(`/api/progress?userId=${userId}`);
      const progData = await prog.json();
      setToplamNokta(progData.checkins?.length ?? 0);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Kayıt sırasında bir hata oluştu. Tekrar dene.");
        setFormLoading(false);
        return;
      }
      const { id, name } = data;
      localStorage.setItem("qr_userId", id);
      localStorage.setItem("qr_userName", name);
      setUserName(name);
      setHasUser(true);
      await doCheckIn(id);
    } catch {
      setFormError("Bağlantı hatası. İnternet bağlantınızı kontrol edin.");
    } finally {
      setFormLoading(false);
    }
  }

  if (status === "invalid") return (
    <div className="text-center py-16">
      <p className="text-gray-300 mb-4">Geçersiz kontrol noktası.</p>
      <Link href="/" className="text-white underline">Ana Sayfaya Dön</Link>
    </div>
  );

  if (hasUser === false) return (
    <div className="py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image src="/mta-logo.png" alt="MTA" width={130} height={130} className="object-contain" />
        </div>
        <h2 className="text-xl font-bold text-white">{cp!.name}</h2>
      </div>
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Yarışmaya Katıl</h3>
        <p className="text-sm text-gray-400 mb-5">Bu konumu kaydetmek için adınızı girin.</p>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Adınız Soyadınız
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => handleNameInput(e.target.value)}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
              placeholder="Örn: Ayşe Demir"
              className="w-full bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 rounded-xl px-4 py-3 text-base focus:border-gray-400 focus:outline-none transition-colors"
              maxLength={50}
              autoFocus
              disabled={formLoading}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-xl overflow-hidden shadow-xl">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 active:bg-gray-500 transition-colors text-sm border-b border-gray-600 last:border-0"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          <button
            type="submit"
            disabled={formLoading || !formName.trim()}
            className="w-full bg-white text-gray-900 py-4 rounded-xl font-semibold text-base hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {formLoading ? "Kaydediliyor..." : "Yarışmaya Başla"}
          </button>
        </form>
      </div>
    </div>
  );

  if (status === "loading") return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Kaydediliyor...</p>
      </div>
    </div>
  );

  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold text-white mb-6">{cp!.name}</h2>

      {status === "success" && (
        <div className={`rounded-2xl p-6 mb-6 border-2 ${toplamNokta === 7 ? "bg-yellow-900/40 border-yellow-500" : "bg-green-900/40 border-green-500"}`}>
          {toplamNokta === 7 ? (
            <>
              <h3 className="text-xl font-bold text-yellow-300 mb-1">Tüm Konumlar Tamamlandı!</h3>
              <p className="text-yellow-400 text-sm">Tebrikler {userName}, 7/7 noktayı bitirdin!</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-green-300 mb-1">Başarıyla Kaydedildi!</h3>
              <p className="text-green-400 text-sm">
                {userName && <><strong>{userName}</strong>, </>}
                <strong>{cp!.name}</strong> başarıyla ziyaret edildi.
              </p>
              <p className="text-green-500 text-xs mt-2">{toplamNokta}/7 konum tamamlandı</p>
            </>
          )}
        </div>
      )}

      {status === "already" && (
        <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-200 mb-1">Zaten Kaydedildi</h3>
          <p className="text-gray-400 text-sm">Bu konumu daha önce ziyaret ettiniz.</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-900/40 border-2 border-red-500 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold text-red-300 mb-1">Hata Oluştu</h3>
          <p className="text-red-400 text-sm">İnternet bağlantınızı kontrol edin ve tekrar deneyin.</p>
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm text-white mb-2 text-left font-semibold uppercase tracking-wide">Yerleşke Haritası</p>
        <div className="rounded-2xl overflow-hidden border border-gray-700">
          <Image
            src="/map.jpeg"
            alt="Yerleşke Haritası"
            width={800}
            height={600}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="block w-full bg-white text-gray-900 py-4 rounded-xl text-center font-semibold hover:bg-gray-100 transition-colors"
        >
          Panele Dön →
        </Link>
        <Link
          href="/leaderboard"
          className="block w-full bg-gray-700 text-gray-200 py-3 rounded-xl text-center font-medium hover:bg-gray-600 transition-colors"
        >
          Liderlik Tablosu
        </Link>
      </div>
    </div>
  );
}
