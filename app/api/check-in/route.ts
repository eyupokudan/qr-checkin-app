import { NextRequest, NextResponse } from "next/server";
import { checkIn, getUser } from "@/lib/storage";
import { checkpoints } from "@/lib/checkpoints";

export async function POST(request: NextRequest) {
  try {
    const { userId, checkpointId } = await request.json();
    if (!userId || !checkpointId) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }
    const cpId = String(checkpointId);
    if (!checkpoints.some((c) => String(c.id) === cpId)) {
      return NextResponse.json({ error: "Geçersiz kontrol noktası" }, { status: 400 });
    }
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    const result = await checkIn(userId, cpId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
