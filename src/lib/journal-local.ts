import { JournalEntry, PlaylistResult } from "@/types";

const STORAGE_KEY = "myost-journal";

export function getJournalEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JournalEntry[];
  } catch {
    return [];
  }
}

export function saveJournalEntry(
  text: string,
  emotions: string[],
  context: string,
  playlist: PlaylistResult
): JournalEntry {
  const entries = getJournalEntries();
  const entry: JournalEntry = {
    id: `entry-${Date.now()}`,
    date: new Date().toISOString(),
    text,
    emotions,
    context,
    playlist,
  };
  entries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entry;
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getRecentEmotions(days: number = 7): string[] {
  const entries = getJournalEntries();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = entries.filter((e) => new Date(e.date).getTime() > cutoff);
  const allEmotions = recent.flatMap((e) => e.emotions);
  return Array.from(new Set(allEmotions));
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

export function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "오전" : "오후";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${period} ${displayHours}:${minutes}`;
}
