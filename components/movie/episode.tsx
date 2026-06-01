"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Server } from "lucide-react";

interface EpisodeData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

interface ServerData {
  server_name: string;
  server_data: EpisodeData[];
}

interface EpisodeProps {
  serverData: ServerData[];
  currentServerIndex: number;
  currentEpisodeIndex: number;
  onSelectEpisode: (link: string, serverIndex: number, episodeIndex: number) => void;
  onServerChange: (serverIndex: number) => void;
  thumb_url: string;
  playerMode: 'm3u8' | 'embed';
  onPlayerModeChange: (mode: 'm3u8' | 'embed') => void;
}

export default function Episode({
  serverData,
  currentServerIndex,
  currentEpisodeIndex,
  onSelectEpisode,
  onServerChange,
  thumb_url,
  playerMode,
  onPlayerModeChange,
}: EpisodeProps) {
  const handleServerChange = (index: number) => {
    const ep = serverData[index]?.server_data?.[0];
    if (ep) {
      const link = playerMode === 'm3u8' ? ep.link_m3u8 : ep.link_embed;
      onSelectEpisode(link, index, 0);
    }
    onServerChange(index);
  };

  const handleEpisodeChange = (link: string, serverIndex: number, episodeIndex: number) => {
    onSelectEpisode(link, serverIndex, episodeIndex);
  };

  if (!serverData || serverData.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-white/40 text-sm font-vietnam">Không có tập phim nào</p>
      </div>
    );
  }

  const currentServer = serverData[currentServerIndex];
  const totalEpisodes = currentServer?.server_data?.length || 0;

  return (
    <div className="space-y-4">
      {/* Player Mode Toggle */}
      <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={() => onPlayerModeChange('m3u8')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 font-vietnam",
            playerMode === 'm3u8'
              ? "bg-primary text-white shadow-lg"
              : "text-white/45 hover:text-white/70"
          )}
        >
          Mặc Định
        </button>
        <button
          onClick={() => onPlayerModeChange('embed')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 font-vietnam",
            playerMode === 'embed'
              ? "bg-primary text-white shadow-lg"
              : "text-white/45 hover:text-white/70"
          )}
        >
          Dự Phòng
        </button>
      </div>

      {/* Server Tabs */}
      {serverData.length > 1 && (
        <div className="space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-wider font-vietnam flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            Chọn server
          </p>
          <div className="flex flex-wrap gap-1.5">
            {serverData.map((server, index) => (
              <button
                key={index}
                onClick={() => handleServerChange(index)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 font-vietnam border",
                  currentServerIndex === index
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-white/4 text-white/50 border-white/8 hover:bg-white/8 hover:text-white/80"
                )}
              >
                {server.server_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Episode Grid */}
      <div className="space-y-2">
        <p className="text-white/40 text-xs uppercase tracking-wider font-vietnam">
          {totalEpisodes} tập
        </p>

        {totalEpisodes > 0 ? (
          <div
            className={cn(
              "grid gap-1.5",
              totalEpisodes <= 4 ? "grid-cols-2" :
              totalEpisodes <= 12 ? "grid-cols-3" :
              totalEpisodes <= 30 ? "grid-cols-4" :
              "grid-cols-5"
            )}
          >
            {currentServer.server_data.map((episode, index) => {
              const isActive = index === currentEpisodeIndex;
              return (
                <button
                  key={`${currentServerIndex}-${index}`}
                  onClick={() =>
                    handleEpisodeChange(
                      playerMode === 'm3u8' ? episode.link_m3u8 : episode.link_embed,
                      currentServerIndex,
                      index
                    )
                  }
                  title={episode.name}
                  className={cn(
                    "relative flex items-center justify-center px-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 font-vietnam border overflow-hidden group",
                    isActive
                      ? "bg-primary text-white border-primary/50 shadow-lg"
                      : "bg-white/4 text-white/55 border-white/8 hover:bg-white/10 hover:text-white hover:border-white/20"
                  )}
                >
                  {isActive && (
                    <Play className="absolute w-3 h-3 fill-white text-white opacity-30 left-1" />
                  )}
                  <span className="relative z-10 truncate">{episode.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-white/30 text-sm font-vietnam">Chưa có tập phim</p>
          </div>
        )}
      </div>
    </div>
  );
}
