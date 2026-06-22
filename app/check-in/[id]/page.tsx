"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { checkpoints } from "@/lib/checkpoints";

type Status = "loading" | "success" | "already" | "error" | "noUser" | "invalid";

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const cp = checkpoints.find((c) => c.id === id);

  const [status, setStatus] = useState<Status>("loading");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!cp) { setStatus("invalid"); return; }

    const userId = localStorage.getItem("qr_userId");
    const name = localStorage.getItem("qr_userName") ?? "";

    if (!userId) { setStatus("noUser"); return; }
    setUserName(name);

    fetch("/api/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, checkpointId: id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.alreadyChecked) setStatus("already");
        else if (data.success) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [id, cp, router]);

  if (status === "invalid") return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">❌</div>
      <p className="text-gray-600 mb-4">Geçersiz kontrol noktası!</p>
      <Link href="/" className="text-blue-600 underline">Ana Sayfaya Dön</Link>
    </div>
  );

  if (status === "noUser") return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">👤</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Önce kayıt ol!</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Bu istasyonu kaydetmek için önce yarışmaya kaydolman gerekiyor.
      </p>
      <Link
        href="/"
        className="block w-full bg-blue-600 text-white py-4 rounded-xl text-center font-semibold"
      >
        Kayıt Ol ve Başla 🚀
      </Link>
    </div>
  );

  if (status === "loading") return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="text-4xl animate-spin mb-2">⚙️</div>
        <p className="text-gray-400">Kaydediliyor...</p>
      </div>
    </div>
  );

  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-3">{cp!.emoji}</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{cp!.name}</h2>
      <p className="text-gray-400 text-sm mb-6">{cp!.description}</p>

      {status === "success" && (
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 mb-6">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-xl font-bold text-green-700">Tebrikler!</h3>
          <p className="text-green-600 text-sm">Bu istasyon başarıyla kaydedildi.</p>
          {userName && <p className="text-xs text-green-500 mt-1">Harika iş, {userName}!</p>}
        </div>
      )}

      {status === "already" && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
          <div className="text-4xl mb-2">☑️</div>
          <h3 className="text-xl font-bold text-blue-700">Zaten Kaydedildi</h3>
          <p className="text-blue-600 text-sm">Bu istasyonu daha önce ziyaret ettin.</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-xl font-bold text-red-700">Hata Oluştu</h3>
          <p className="text-red-600 text-sm">İnternet bağlantını kontrol et ve tekrar dene.</p>
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm text-white mb-2 text-left font-semibold uppercase tracking-wide">Yerleşke Haritası</p>
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          <Image
            src="/map.jpeg"
            alt="Yerleşke Haritası"
            width={800}
            height={600}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      <Link
        href="/dashboard"
        className="block w-full bg-blue-600 text-white py-4 rounded-xl text-center font-semibold hover:bg-blue-700 transition-colors"
      >
        Panele Dön →
      </Link>
    </div>
  );
}
