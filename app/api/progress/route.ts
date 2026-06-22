import { NextRequest, NextResponse } from "next/server";
import { getUser, getUserCheckins } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId gerekli" }, { status: 400 });
    }
    const [user, checkins] = await Promise.all([getUser(userId), getUserCheckins(userId)]);
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ user, checkins });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
