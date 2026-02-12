import { SongRecommendation, Track } from "@/types";

export function buildTracks(recommendations: SongRecommendation[]): Track[] {
  return recommendations.map((rec) => {
    const searchQuery = encodeURIComponent(`${rec.title} ${rec.artist}`);
    return {
      id: `track-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: rec.title,
      artist: rec.artist,
      youtubeUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
      youtubeMusicUrl: `https://music.youtube.com/search?q=${searchQuery}`,
      commentary: rec.reason,
    };
  });
}
