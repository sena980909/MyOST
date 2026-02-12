import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDailyUsageCount,
  getUserProfile,
  getJournalEntryCount,
} from "@/lib/db";

const FREE_DAILY_LIMIT = 2;
const FREE_SAVE_LIMIT = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [used, profile, savedCount] = await Promise.all([
    getDailyUsageCount(session.user.id),
    getUserProfile(session.user.id),
    getJournalEntryCount(session.user.id),
  ]);

  const { tier, points } = profile;
  const isPremium = tier === "premium";

  return NextResponse.json({
    used,
    limit: isPremium ? null : FREE_DAILY_LIMIT,
    tier,
    points,
    savedCount,
    saveLimit: isPremium ? null : FREE_SAVE_LIMIT,
  });
}
