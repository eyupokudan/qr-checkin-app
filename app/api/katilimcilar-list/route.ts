import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("katilimcilar")
    .select("ad_soyad")
    .order("ad_soyad");
  return NextResponse.json((data ?? []).map((r) => r.ad_soyad));
}
