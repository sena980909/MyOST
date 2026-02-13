export interface EmotionAnalysis {
  emotions: string[];
  intensity: number;
  context: string;
  recommendations: SongRecommendation[];
}

export interface SongRecommendation {
  title: string;
  artist: string;
  reason: string;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  youtubeUrl: string;
  youtubeMusicUrl: string;
  commentary: string;
}

export interface PlaylistResult {
  djComment: string;
  tracks: Track[];
  emotionSummary: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  diary?: string;
  emotions: string[];
  context: string;
  playlist: PlaylistResult;
}

export interface AnalyzeResponse {
  analysis: EmotionAnalysis;
}

export interface PlaylistResponse {
  result: PlaylistResult;
}

export interface ApiError {
  error: string;
  message: string;
}

