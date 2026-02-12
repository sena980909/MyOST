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
      className="group relative bg-white/60 backdrop-blur-sm border border-purple-100 rounded-2xl p-4
                 hover:bg-white/80 hover:border-purple-200 hover:shadow-sm transition-all duration-300"
    >
      <div className="flex gap-4 items-start">
        {/* Track number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-400 text-sm font-mono">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[#4a4458] font-medium truncate">{track.name}</h3>
          <p className="text-[#8b7fa3] text-sm truncate">{track.artist}</p>
          <p className="text-[#a99bc4] text-xs mt-2 leading-relaxed">
            {track.commentary}
          </p>
        </div>

        {/* Links */}
        <div className="flex-shrink-0 self-center flex gap-1.5">
          <a
            href={track.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-red-50
                       text-red-400 hover:bg-red-100 hover:text-red-500
                       opacity-60 group-hover:opacity-100 transition-all duration-200"
            title="YouTube에서 검색"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          <a
            href={track.youtubeMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-rose-50
                       text-rose-400 hover:bg-rose-100 hover:text-rose-500
                       opacity-60 group-hover:opacity-100 transition-all duration-200"
            title="YouTube Music에서 듣기"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228 18.228 15.432 18.228 12 15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
