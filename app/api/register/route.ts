import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

function normalize(s: string): string {
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "İsim gerekli" }, { status: 400 });
    }

    const trimmed = name.trim();
    const normalizedInput = normalize(trimmed);

    const { data: tumKatilimcilar } = await supabase
      .from("katilimcilar")
      .select("id, ad_soyad, kullanici_id");

    const katilimci = (tumKatilimcilar ?? []).find(
      (k) => normalize(k.ad_soyad) === normalizedInput
    );

    if (!katilimci) {
      return NextResponse.json(
        { error: "Adınız katılımcı listesinde bulunamadı. Lütfen kimliğinizdeki gibi yazın." },
        { status: 403 }
      );
    }

    if (katilimci.kullanici_id) {
      return NextResponse.json(
        { error: "Bu isim zaten başka bir cihazda kullanılıyor." },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    await registerUser(id, katilimci.ad_soyad);

    await supabase
      .from("katilimcilar")
      .update({ kullanici_id: id, claimed_at: new Date().toISOString() })
      .eq("id", katilimci.id);

    return NextResponse.json({ id, name: katilimci.ad_soyad });
  } catch {
    return NextResponse.json({ error: "Kayıt başarısız" }, { status: 500 });
  }
}
