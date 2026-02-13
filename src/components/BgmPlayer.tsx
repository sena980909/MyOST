"use client";

import { useRef, useEffect } from "react";

interface BgmPlayerProps {
  isPlaying: boolean;
}

export default function BgmPlayer({ isPlaying }: BgmPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        // Browser autoplay policy blocked - user interaction required
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      src="/MyChu.mp3"
      loop
      preload="auto"
    />
  );
}
