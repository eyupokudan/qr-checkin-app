import { supabase } from "./supabase";

export interface User {
  name: string;
  createdAt: number;
  lastCheckin?: number;
  completedAt?: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  count: number;
  baslangicZamani?: string;
  bitisZamani?: number;
  lastCheckin?: number;
  createdAt: number;
}

export async function registerUser(id: string, name: string): Promise<void> {
  await supabase.from("users").insert({
    id,
    name,
    created_at: Date.now(),
    baslangic_zamani: new Date().toISOString(),
  });
}

export async function getUser(id: string): Promise<User | null> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) return null;
  return {
    name: data.name,
    createdAt: data.created_at,
    lastCheckin: data.last_checkin ?? undefined,
    completedAt: data.completed_at ?? undefined,
  };
}

export async function checkIn(
  userId: string,
  noktaId: string
): Promise<{ success: boolean; alreadyChecked: boolean }> {
  const { error } = await supabase.from("ziyaretler").insert({
    kullanici_id: userId,
    nokta_id: noktaId,
  });

  if (error) {
    if (error.code === "23505") return { success: false, alreadyChecked: true };
    return { success: false, alreadyChecked: false };
  }

  const { count } = await supabase
    .from("ziyaretler")
    .select("*", { count: "exact", head: true })
    .eq("kullanici_id", userId);

  const updates: Record<string, number> = { last_checkin: Date.now() };
  if (count === 7) updates.completed_at = Date.now();

  await supabase.from("users").update(updates).eq("id", userId);

  return { success: true, alreadyChecked: false };
}

export async function getUserCheckins(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("ziyaretler")
    .select("nokta_id")
    .eq("kullanici_id", userId);
  return (data ?? []).map((r) => r.nokta_id);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [{ data: users }, { data: ziyaretler }] = await Promise.all([
    supabase.from("users").select("id, name, created_at, last_checkin, completed_at, baslangic_zamani"),
    supabase.from("ziyaretler").select("kullanici_id"),
  ]);

  if (!users) return [];

  const countMap = new Map<string, number>();
  for (const z of ziyaretler ?? []) {
    countMap.set(z.kullanici_id, (countMap.get(z.kullanici_id) ?? 0) + 1);
  }

  const entries: LeaderboardEntry[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    createdAt: u.created_at,
    baslangicZamani: u.baslangic_zamani ?? undefined,
    bitisZamani: u.completed_at ?? undefined,
    lastCheckin: u.last_checkin ?? undefined,
    count: countMap.get(u.id) ?? 0,
  }));

  return entries.sort((a, b) => {
    // 1. En çok nokta olan üstte
    if (b.count !== a.count) return b.count - a.count;

    // 2. Eşit noktada: son noktaya kim önce ulaştıysa üstte
    return (a.lastCheckin ?? Infinity) - (b.lastCheckin ?? Infinity);
  });
}

