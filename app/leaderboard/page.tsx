"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TOTAL } from "@/lib/checkpoints";

interface Entry {
  id: string;
  name: string;
  count: number;
  baslangicZamani?: string;
  bitisZamani?: number;
  lastCheckin?: number;
  createdAt: number;
}

function formatSure(entry: Entry): string | null {
  const baslangic = entry.baslangicZamani
    ? new Date(entry.baslangicZamani).getTime()
    : entry.createdAt;
  const bitis = entry.bitisZamani ?? entry.lastCheckin;
  if (!bitis) return null;
  const ms = bitis - baslangic;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}dk ${s}sn` : `${s}sn`;
}

function ProgressDots({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
            i < count
              ? "bg-green-500 shadow-sm"
              : "bg-gray-200"
          }`}
        >
          {i < count && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-md flex-shrink-0">
      <span className="text-white font-black text-lg">1</span>
    </div>
  );
  if (rank === 2) return (
    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center shadow-md flex-shrink-0">
      <span className="text-white font-black text-lg">2</span>
    </div>
  );
  if (rank === 3) return (
    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center shadow-md flex-shrink-0">
      <span className="text-white font-black text-lg">3</span>
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
      <span className="text-white font-bold text-base">{rank}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [pulse, setPulse] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    setMyId(localStorage.getItem("qr_userId"));
    if (sessionStorage.getItem("lb_auth") === "1") setAuthed(true);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setEntries(data);
      setLastUpdate(new Date().toLocaleTimeString("tr-TR"));
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, [fetchData]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/leaderboard-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      sessionStorage.setItem("lb_auth", "1");
      setAuthed(true);
    } else {
      setPwError("Şifre yanlış.");
    }
  }

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold text-white mb-1">Liderlik Tablosu</h2>
        <p className="text-gray-400 text-sm mb-6">Erişmek için şifre gerekiyor.</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Şifre"
            className="w-full bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:border-gray-400 focus:outline-none"
            autoFocus
          />
          {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
          <button
            type="submit"
            disabled={!pw}
            className="w-full bg-white text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-100 disabled:opacity-40 transition-all"
          >
            Giriş
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200 shadow-sm px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mb-0.5">MTA Eğitim Haftası Etkinlikleri</p>
            <h1 className="text-2xl font-black tracking-tight text-gray-800">Gebze Yerleşkesi<br />Oryantiring</h1>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 bg-gray-200 px-3 py-1.5 rounded-full transition-all ${pulse ? "bg-gray-300" : ""}`}>
              <div className={`w-2 h-2 rounded-full bg-green-500 ${pulse ? "scale-125" : ""} transition-transform`} />
              <span className="text-xs text-gray-600 font-medium">Canlı</span>
            </div>
            {lastUpdate && (
              <p className="text-gray-400 text-xs mt-1">{lastUpdate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Yükleniyor...</p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-5xl mb-4">🏁</div>
            <p className="text-gray-400 text-lg">Henüz katılımcı yok</p>
            <p className="text-gray-300 text-sm mt-1">İlk QR kodunu okutmayı bekliyor...</p>
          </div>
        ) : (
          <>
            {/* Kolon başlıkları */}
            <div className="flex items-center gap-4 px-4 mb-2">
              <div className="w-10 flex-shrink-0" />
              <div className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Yarışmacı</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">İlerleme</div>
            </div>

            <div className="space-y-2">
              {entries.map((entry, i) => {
                const isMe = entry.id === myId;
                const done = entry.count === TOTAL;
                const sure = formatSure(entry);

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all ${
                      isMe
                        ? "border-white bg-gray-700 shadow-md"
                        : done
                        ? "border-green-600 bg-gray-800 shadow-sm"
                        : "border-gray-700 bg-gray-800 shadow-sm"
                    }`}
                  >
                    <RankBadge rank={i + 1} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="font-bold text-base text-white break-words min-w-0">
                          {entry.name}
                        </span>
                        <div className="flex gap-1 flex-shrink-0">
                          {isMe && (
                            <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full font-medium">Sen</span>
                          )}
                          {done && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Tamamladı</span>
                          )}
                        </div>
                      </div>
                      {done && sure && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Süre: <span className="font-semibold text-gray-500">{sure}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-sm font-black text-white">
                        {entry.count}/{TOTAL}
                      </span>
                      <ProgressDots count={entry.count} />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-gray-300 mt-6">
              Her 5 saniyede otomatik güncellenir
            </p>
          </>
        )}

        <Link
          href="/dashboard"
          className="block w-full mt-6 bg-gray-700 text-gray-200 py-3 rounded-xl text-center font-medium hover:bg-gray-600 transition-colors"
        >
          ← Panele Dön
        </Link>
      </div>
    </div>
  );
}
