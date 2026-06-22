"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkpoints, TOTAL } from "@/lib/checkpoints";

interface Progress {
  user: { name: string; completedAt?: number };
  checkins: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchProgress = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/progress?userId=${id}`);
      if (!res.ok) throw new Error();
      setProgress(await res.json());
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const id = localStorage.getItem("qr_userId");
    if (!id) { router.push("/"); return; }
    setUserId(id);
    fetchProgress(id);
  }, [router, fetchProgress]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400">Yükleniyor...</p>
      </div>
    </div>
  );

  if (!progress) return null;

  const checked = new Set(progress.checkins);
  const count = checked.size;
  const done = count === TOTAL;

  return (
    <div>
      <div className={`rounded-xl p-4 mb-5 border-2 ${done ? "bg-green-900/40 border-green-500" : "bg-gray-800 border-gray-700"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Merhaba,</p>
            <p className="text-xl font-bold text-white">{progress.user.name}</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${done ? "text-green-400" : "text-white"}`}>
              {count}/{TOTAL}
            </p>
            <p className="text-xs text-gray-400">konum</p>
          </div>
        </div>
        {done && (
          <p className="mt-2 text-center text-green-400 font-semibold text-sm">
            Tebrikler! Tüm konumları tamamladın!
          </p>
        )}
      </div>

      <div className="space-y-2 mb-5">
        {checkpoints.map((cp) => {
          const isChecked = checked.has(cp.id);
          return (
            <div
              key={cp.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                isChecked ? "bg-green-900/30 border-green-600" : "bg-gray-800 border-gray-700"
              }`}
            >
              <div className="flex-1">
                <p className={`font-semibold text-sm ${isChecked ? "text-green-300" : "text-gray-200"}`}>
                  {cp.name}
                </p>
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                isChecked ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400"
              }`}>
                {isChecked ? "✓" : checkpoints.indexOf(cp) + 1}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <Link
          href="/leaderboard"
          className="block w-full bg-white text-gray-900 py-3 rounded-xl text-center font-semibold hover:bg-gray-100 transition-colors"
        >
          🏆 Liderlik Tablosu
        </Link>
        <button
          onClick={() => userId && fetchProgress(userId)}
          className="w-full bg-gray-700 text-gray-200 py-3 rounded-xl text-center font-medium hover:bg-gray-600 transition-colors"
        >
          ↻ Yenile
        </button>
      </div>
    </div>
  );
}
