import { getAdminClient } from "@/lib/supabase";
import { JournalEntry, PlaylistResult } from "@/types";

const supabase = () => getAdminClient();

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const { data: entries, error } = await supabase()
    .from("journal_entries")
    .select(`
      id,
      text,
      emotions,
      context,
      created_at,
      playlists (
        id,
        dj_comment,
        emotion_summary,
        tracks (
          id,
          position,
          name,
          artist,
          youtube_url,
          youtube_music_url,
          commentary
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch journal entries:", error);
    return [];
  }

  return (entries ?? []).map((entry) => {
    const playlist = entry.playlists?.[0];
    const tracks = (playlist?.tracks ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((t: { id: string; name: string; artist: string; youtube_url: string; youtube_music_url: string; commentary: string }) => ({
        id: t.id,
        name: t.name,
        artist: t.artist,
        youtubeUrl: t.youtube_url,
        youtubeMusicUrl: t.youtube_music_url,
        commentary: t.commentary,
      }));

    return {
      id: entry.id,
      date: entry.created_at,
      text: entry.text,
      emotions: entry.emotions,
      context: entry.context,
      playlist: {
        djComment: playlist?.dj_comment ?? "",
        emotionSummary: playlist?.emotion_summary ?? "",
        tracks,
      },
    };
  });
}

export async function getJournalEntryCount(userId: string): Promise<number> {
  const { count, error } = await supabase()
    .from("journal_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to count journal entries:", error);
    return 0;
  }
  return count ?? 0;
}

export async function saveJournalEntry(
  userId: string,
  text: string,
  emotions: string[],
  context: string,
  playlist: PlaylistResult
): Promise<JournalEntry | null> {
  const db = supabase();

  // Insert journal entry
  const { data: entry, error: entryError } = await db
    .from("journal_entries")
    .insert({ user_id: userId, text, emotions, context })
    .select("id, created_at")
    .single();

  if (entryError || !entry) {
    console.error("Failed to save journal entry:", entryError);
    return null;
  }

  // Insert playlist
  const { data: playlistRow, error: playlistError } = await db
    .from("playlists")
    .insert({
      journal_entry_id: entry.id,
      user_id: userId,
      dj_comment: playlist.djComment,
      emotion_summary: playlist.emotionSummary,
    })
    .select("id")
    .single();

  if (playlistError || !playlistRow) {
    console.error("Failed to save playlist:", playlistError);
    return null;
  }

  // Insert tracks
  const tracksToInsert = playlist.tracks.map((track, i) => ({
    playlist_id: playlistRow.id,
    position: i,
    name: track.name,
    artist: track.artist,
    youtube_url: track.youtubeUrl,
    youtube_music_url: track.youtubeMusicUrl,
    commentary: track.commentary,
  }));

  const { error: tracksError } = await db.from("tracks").insert(tracksToInsert);

  if (tracksError) {
    console.error("Failed to save tracks:", tracksError);
  }

  return {
    id: entry.id,
    date: entry.created_at,
    text,
    emotions,
    context,
    playlist,
  };
}

const RATE_LIMIT_DEFAULT = 3;
const RATE_LIMIT_TEST = 10;
const RATE_WINDOW_HOURS = 1;
const TEST_ACCOUNT_EMAIL = "test@myost.com";

async function getRateLimit(userId: string | null): Promise<number> {
  if (!userId) return RATE_LIMIT_DEFAULT;

  const { data } = await supabase()
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  return data?.email === TEST_ACCOUNT_EMAIL ? RATE_LIMIT_TEST : RATE_LIMIT_DEFAULT;
}

export async function checkRateLimit(
  userId: string | null,
  ip: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = await getRateLimit(userId);
  const oneHourAgo = new Date(Date.now() - RATE_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  let query = supabase()
    .from("generation_logs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", oneHourAgo);

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.is("user_id", null).eq("ip", ip);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true, remaining: limit, limit };
  }

  const used = count ?? 0;
  return { allowed: used < limit, remaining: Math.max(0, limit - used), limit };
}

export async function logGeneration(
  userId: string | null,
  ip: string
): Promise<void> {
  const { error } = await supabase()
    .from("generation_logs")
    .insert({ user_id: userId, ip });

  if (error) {
    console.error("Failed to log generation:", error);
  }
}

export async function deleteJournalEntry(
  userId: string,
  entryId: string
): Promise<boolean> {
  const { error } = await supabase()
    .from("journal_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to delete journal entry:", error);
    return false;
  }
  return true;
}

export async function migrateLocalEntries(
  userId: string,
  entries: JournalEntry[]
): Promise<number> {
  let migrated = 0;
  for (const entry of entries) {
    const result = await saveJournalEntry(
      userId,
      entry.text,
      entry.emotions,
      entry.context,
      entry.playlist
    );
    if (result) migrated++;
  }
  return migrated;
}
