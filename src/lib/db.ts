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

export async function getDailyUsageCount(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase()
    .from("usage_tracking")
    .select("generation_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .single();

  if (error || !data) return 0;
  return data.generation_count;
}

export async function incrementDailyUsage(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase().rpc("increment_usage", {
    p_user_id: userId,
    p_date: today,
  });

  if (error) {
    console.error("Failed to increment usage:", error);
    return -1;
  }
  return data;
}

export async function getUserProfile(userId: string): Promise<{ tier: string; points: number }> {
  const { data, error } = await supabase()
    .from("users")
    .select("tier, points")
    .eq("id", userId)
    .single();

  if (error || !data) return { tier: "free", points: 0 };
  return { tier: data.tier, points: data.points ?? 0 };
}

export async function getUserTier(userId: string): Promise<string> {
  const profile = await getUserProfile(userId);
  return profile.tier;
}

export async function getUserPoints(userId: string): Promise<number> {
  const profile = await getUserProfile(userId);
  return profile.points;
}

export async function deductPoint(userId: string): Promise<boolean> {
  // Try atomic RPC first
  const { error: rpcError } = await supabase().rpc("deduct_point", {
    p_user_id: userId,
  });

  if (!rpcError) return true;

  // Fallback: manual decrement
  console.error("RPC deduct_point failed, using fallback:", rpcError);
  const currentPoints = await getUserPoints(userId);
  if (currentPoints <= 0) return false;

  const { error: updateError } = await supabase()
    .from("users")
    .update({ points: currentPoints - 1 })
    .eq("id", userId);

  return !updateError;
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
