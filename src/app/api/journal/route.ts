import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getJournalEntries,
  getJournalEntryCount,
  saveJournalEntry,
  deleteJournalEntry,
  migrateLocalEntries,
  getUserProfile,
} from "@/lib/db";

const FREE_SAVE_LIMIT = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const entries = await getJournalEntries(session.user.id);
  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Migration mode
  if (body.migrate && Array.isArray(body.entries)) {
    const migrated = await migrateLocalEntries(session.user.id, body.entries);
    return NextResponse.json({ migrated });
  }

  // Normal save - check save limit for free tier
  const { text, emotions, context, playlist } = body;

  if (!text || !emotions || !context || !playlist) {
    return NextResponse.json(
      { error: "missing_fields", message: "필수 필드가 누락되었습니다." },
      { status: 400 }
    );
  }

  const [profile, savedCount] = await Promise.all([
    getUserProfile(session.user.id),
    getJournalEntryCount(session.user.id),
  ]);

  if (profile.tier !== "premium" && savedCount >= FREE_SAVE_LIMIT) {
    return NextResponse.json(
      {
        error: "save_limit_exceeded",
        message: `무료 플랜은 최대 ${FREE_SAVE_LIMIT}개까지 저장할 수 있어요. 이전 기록을 삭제하거나 프리미엄으로 업그레이드해주세요.`,
      },
      { status: 403 }
    );
  }

  const entry = await saveJournalEntry(
    session.user.id,
    text,
    emotions,
    context,
    playlist
  );

  if (!entry) {
    return NextResponse.json(
      { error: "save_failed", message: "저장에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ entry });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: "missing_id", message: "ID가 필요합니다." },
      { status: 400 }
    );
  }

  const success = await deleteJournalEntry(session.user.id, id);

  if (!success) {
    return NextResponse.json(
      { error: "delete_failed", message: "삭제에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
