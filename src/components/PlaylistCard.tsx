"use client";

import { motion } from "framer-motion";
import { Track } from "@/types";

interface PlaylistCardProps {
  track: Track;
  index: number;
}

export default function PlaylistCard({ track, index }: PlaylistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4
                 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex gap-4 items-start">
        {/* Track number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 text-sm font-mono">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{track.name}</h3>
          <p className="text-white/50 text-sm truncate">{track.artist}</p>
          <p className="text-white/40 text-xs mt-2 leading-relaxed">
            {track.commentary}
          </p>
        </div>

        {/* YouTube Music link */}
        <a
          href={track.youtubeMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 self-center p-2.5 rounded-full bg-red-500/10
                     text-red-400 hover:bg-red-500/20 hover:text-red-300
                     opacity-60 group-hover:opacity-100 transition-all duration-200"
          title="YouTube Music에서 듣기"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228 18.228 15.432 18.228 12 15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
