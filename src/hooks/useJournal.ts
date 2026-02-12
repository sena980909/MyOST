"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { JournalEntry, PlaylistResult } from "@/types";
import {
  getJournalEntries as getLocalEntries,
  saveJournalEntry as saveLocalEntry,
  deleteJournalEntry as deleteLocalEntry,
} from "@/lib/journal-local";

export function useJournal() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    if (!isLoggedIn) {
      setEntries(getLocalEntries());
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch (err) {
      console.error("Failed to load entries:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const saveEntry = useCallback(
    async (
      text: string,
      emotions: string[],
      context: string,
      playlist: PlaylistResult
    ): Promise<boolean> => {
      if (!isLoggedIn) {
        saveLocalEntry(text, emotions, context, playlist);
        setEntries(getLocalEntries());
        return true;
      }

      try {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, emotions, context, playlist }),
        });

        if (res.ok) {
          await loadEntries();
          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    [isLoggedIn, loadEntries]
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isLoggedIn) {
        deleteLocalEntry(id);
        setEntries(getLocalEntries());
        return true;
      }

      try {
        const res = await fetch("/api/journal", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          await loadEntries();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [isLoggedIn, loadEntries]
  );

  const getLocalEntriesForMigration = useCallback((): JournalEntry[] => {
    return getLocalEntries();
  }, []);

  const migrateEntries = useCallback(
    async (localEntries: JournalEntry[]): Promise<number> => {
      if (!isLoggedIn) return 0;

      try {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ migrate: true, entries: localEntries }),
        });

        if (res.ok) {
          const data = await res.json();
          await loadEntries();
          return data.migrated ?? 0;
        }
        return 0;
      } catch {
        return 0;
      }
    },
    [isLoggedIn, loadEntries]
  );

  return {
    entries,
    loading,
    isLoggedIn,
    saveEntry,
    deleteEntry,
    loadEntries,
    getLocalEntriesForMigration,
    migrateEntries,
  };
}
