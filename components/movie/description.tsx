"use client";

import { useState, useEffect, useCallback } from "react";
import Episode from "./episode";
import VideoPlayer from "../player/video-player";
import EmbedPlayer from "../player/embed-player";
import BackButton from "@/components/back-button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Play, Info, Star, Clock, Globe, Tag, ChevronDown, ChevronUp, Tv, Heart } from "lucide-react";

export default function Description({ movie, serverData }: any) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<{
    server: number;
    episode: number;
  } | null>(null);
  const [playerMode, setPlayerMode] = useState<'m3u8' | 'embed'>('m3u8');
  const [showFullDesc, setShowFullDesc] = useState(false);

  const [initialTime, setInitialTime] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load watchlist & initialTime on slug change
  useEffect(() => {
    if (!movie.slug) return;
    try {
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      setIsFavorite(Array.isArray(watchlist) && watchlist.some((m: any) => m.slug === movie.slug));
    } catch (e) {
      setIsFavorite(false);
    }

    try {
      const savedTime = localStorage.getItem(`lastEpisodeTime_${movie.slug}`);
      setInitialTime(savedTime ? parseFloat(savedTime) : 0);
    } catch (e) {
      setInitialTime(0);
    }
  }, [movie.slug]);

  // Update watch history & progress helper
  const updateWatchProgress = useCallback((time: number, duration: number) => {
    if (!movie.slug) return;

    try {
      localStorage.setItem(`lastEpisodeTime_${movie.slug}`, time.toString());
    } catch (e) {}

    const progress = duration > 0 ? Math.round((time / duration) * 100) : 0;
    const Cookies = require('js-cookie');
    let recentlyWatched: any[] = [];
    try {
      recentlyWatched = JSON.parse(localStorage.getItem('recentlyWatched') || '[]');
    } catch (e) {
      try {
        recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
      } catch (err) {}
    }
    if (!Array.isArray(recentlyWatched)) recentlyWatched = [];

    // Find current episode name
    const epName = currentEpisodeIndex != null
      ? serverData?.[currentEpisodeIndex.server]?.server_data?.[currentEpisodeIndex.episode]?.name
      : "Tập 1";

    const entry = {
      slug: movie.slug,
      name: movie.name,
      poster_url: movie.poster_url,
      year: movie.year,
      quality: movie.quality,
      lastEpisodeName: epName || "Tập 1",
      lastEpisodeUrl: currentEpisodeUrl || "",
      lastEpisodeIndex: currentEpisodeIndex || { server: 0, episode: 0 },
      currentTime: time,
      duration: duration,
      progress: progress,
      timestamp: Date.now(),
    };

    const filtered = recentlyWatched.filter((m: any) => m.slug !== movie.slug);
    filtered.unshift(entry);
    const sliced = filtered.slice(0, 12); // Keep up to 12 items

    try {
      localStorage.setItem('recentlyWatched', JSON.stringify(sliced));
    } catch (e) {}
    try {
      Cookies.set('recentlyWatched', JSON.stringify(sliced), { expires: 30 });
    } catch (e) {}
  }, [movie, currentEpisodeUrl, currentEpisodeIndex, serverData]);

  // Handle live updates from video player
  const handleProgressUpdate = useCallback((time: number, duration: number) => {
    updateWatchProgress(time, duration);
  }, [updateWatchProgress]);

  // Auto-load last episode or first episode on mount / slug change
  useEffect(() => {
    const savedEpisode = localStorage.getItem(`lastEpisode_${movie.slug}`);
    const savedIndex = localStorage.getItem(`lastEpisodeIndex_${movie.slug}`);
    
    if (savedEpisode && savedIndex) {
      setCurrentEpisodeUrl(savedEpisode);
      setCurrentEpisodeIndex(JSON.parse(savedIndex));
    } else if (serverData?.length > 0) {
      let defaultServerIndex = 0;
      for (let i = 0; i < serverData.length; i++) {
        if (serverData[i].server_name.toLowerCase().includes("vietsub")) {
          defaultServerIndex = i;
          break;
        }
      }
      const defaultServer = serverData[defaultServerIndex];
      if (defaultServer?.server_data?.length > 0) {
        const ep = defaultServer.server_data[0];
        if (playerMode === 'm3u8' && ep?.link_m3u8) {
          setCurrentEpisodeUrl(ep.link_m3u8);
          setCurrentEpisodeIndex({ server: defaultServerIndex, episode: 0 });
        } else if (playerMode === 'embed' && ep?.link_embed) {
          setCurrentEpisodeUrl(ep.link_embed);
          setCurrentEpisodeIndex({ server: defaultServerIndex, episode: 0 });
        }
      }
    }
  }, [serverData, movie.slug]);

  // Save current episode choice (and update history entry on episode change)
  useEffect(() => {
    if (currentEpisodeUrl && currentEpisodeIndex && movie.slug) {
      try {
        localStorage.setItem(`lastEpisode_${movie.slug}`, currentEpisodeUrl);
        localStorage.setItem(`lastEpisodeIndex_${movie.slug}`, JSON.stringify(currentEpisodeIndex));
      } catch (e) {}

      // Get saved time to avoid resetting to 0 when reloading or switching episode
      const savedTime = localStorage.getItem(`lastEpisodeTime_${movie.slug}`);
      const time = savedTime ? parseFloat(savedTime) : 0;
      updateWatchProgress(time, 0);
    }
  }, [currentEpisodeUrl, currentEpisodeIndex, movie.slug, updateWatchProgress]);

  const handleServerChange = (serverIndex: number) => {
    setCurrentEpisodeIndex({ server: serverIndex, episode: 0 });
    if (serverData?.[serverIndex]?.server_data?.length > 0) {
      const ep = serverData[serverIndex].server_data[0];
      setCurrentEpisodeUrl(
        playerMode === 'm3u8' ? ep.link_m3u8 : ep.link_embed
      );
    }
  };

  const handleSelectEpisode = (link: string, serverIndex: number, episodeIndex: number) => {
    // Clear playback time when switching episode
    try {
      localStorage.removeItem(`lastEpisodeTime_${movie.slug}`);
    } catch(e) {}
    setInitialTime(0);
    
    setCurrentEpisodeUrl(link);
    setCurrentEpisodeIndex({ server: serverIndex, episode: episodeIndex });
  };

  // Toggle watchlist/favorite
  const toggleFavorite = () => {
    const Cookies = require('js-cookie');
    let watchlist = [];
    try {
      watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    } catch (e) {
      try {
        watchlist = JSON.parse(Cookies.get('watchlist') || '[]');
      } catch (err) {}
    }
    if (!Array.isArray(watchlist)) watchlist = [];

    let updated = [];
    if (isFavorite) {
      updated = watchlist.filter((m: any) => m.slug !== movie.slug);
      setIsFavorite(false);
    } else {
      const entry = {
        slug: movie.slug,
        name: movie.name,
        poster_url: movie.poster_url,
        year: movie.year,
        quality: movie.quality,
        timestamp: Date.now(),
      };
      updated = [entry, ...watchlist];
      setIsFavorite(true);
    }

    try {
      localStorage.setItem('watchlist', JSON.stringify(updated));
    } catch (e) {}
    try {
      Cookies.set('watchlist', JSON.stringify(updated), { expires: 30 });
    } catch (e) {}
  };

  const description = movie.content?.replace(/<[^>]*>/g, '') || '';
  const currentEpisodeName = currentEpisodeIndex != null
    ? serverData?.[currentEpisodeIndex.server]?.server_data?.[currentEpisodeIndex.episode]?.name
    : null;

  return (
    <div className="w-full pt-8 pb-16 min-h-screen">
      {/* Back button */}
      <div className="mb-4">
        <BackButton />
      </div>

      {/* ─── 2-Column Layout ─── */}
      <div className="watch-layout">

        {/* ════════════════════════════════════
            LEFT COLUMN — Player + Movie Info
            ════════════════════════════════════ */}
        <div className="min-w-0 space-y-4">

          {/* Video Player */}
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              background: "#0A0A0F",
              boxShadow: "0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {playerMode === 'm3u8' ? (
              <VideoPlayer
                videoUrl={currentEpisodeUrl}
                autoplay={true}
                poster={movie.thumb_url || movie.poster_url}
                initialTime={initialTime}
                onProgress={handleProgressUpdate}
                onSwitchToEmbed={() => {
                  setPlayerMode('embed');
                  if (currentEpisodeIndex && serverData) {
                    const ep = serverData[currentEpisodeIndex.server]?.server_data[currentEpisodeIndex.episode];
                    if (ep?.link_embed) setCurrentEpisodeUrl(ep.link_embed);
                  }
                }}
                onEnded={() => {
                  if (!serverData || !currentEpisodeIndex) return;
                  const { server, episode } = currentEpisodeIndex;
                  const currentServer = serverData[server];
                  if (!currentServer) return;
                  let nextEp = episode + 1;
                  let nextSrv = server;
                  if (nextEp >= currentServer.server_data.length) {
                    nextSrv = server + 1;
                    nextEp = 0;
                    if (nextSrv >= serverData.length) return;
                  }
                  const nextServer = serverData[nextSrv];
                  if (!nextServer || nextEp >= nextServer.server_data.length) return;
                  const nextEpisode = nextServer.server_data[nextEp];
                  if (nextEpisode?.link_m3u8) {
                    setCurrentEpisodeUrl(nextEpisode.link_m3u8);
                    setCurrentEpisodeIndex({ server: nextSrv, episode: nextEp });
                  }
                }}
              />
            ) : (
              <EmbedPlayer videoUrl={currentEpisodeUrl} />
            )}
          </div>

          {/* Movie Info Card */}
          <div
            className="rounded-2xl p-5 sm:p-6 space-y-5"
            style={{
              background: "rgba(17,17,24,0.95)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Poster thumbnail */}
              <div
                className="hidden sm:block w-20 h-28 rounded-xl overflow-hidden flex-shrink-0"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}
              >
                <img
                  src={movie.poster_url?.startsWith("http") ? movie.poster_url : `https://phimimg.com/${movie.poster_url}`}
                  alt={movie.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-tight font-vietnam flex-1">
                    {movie.name}
                    {currentEpisodeName && (
                      <span className="ml-2 text-base font-semibold text-white/50">
                        — {currentEpisodeName}
                      </span>
                    )}
                  </h1>
                  {movie.quality && (
                    <span className="badge-hd text-sm px-2.5 py-1 flex-shrink-0">
                      {movie.quality}
                    </span>
                  )}
                </div>

                {movie.origin_name && movie.origin_name !== movie.name && (
                  <p className="text-white/45 text-sm mt-1 font-vietnam">{movie.origin_name}</p>
                )}

                {/* Quick Meta Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {movie.lang && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/12 border border-emerald-500/25 text-xs font-semibold text-emerald-400 font-vietnam">
                      <Globe className="w-3.5 h-3.5" />
                      {movie.lang}
                    </span>
                  )}
                  {movie.time && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/6 border border-white/10 text-xs font-semibold text-white/70 font-vietnam">
                      <Clock className="w-3.5 h-3.5" />
                      {movie.time}
                    </span>
                  )}
                  {movie.year && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/6 border border-white/10 text-xs font-semibold text-white/70 font-vietnam">
                      {movie.year}
                    </span>
                  )}
                  {movie.imdb?.rating && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/12 border border-amber-500/25 text-xs font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {movie.imdb.rating}
                    </span>
                  )}
                  {/* Bookmark Button */}
                  <button
                    onClick={toggleFavorite}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-xs font-semibold font-vietnam ${
                      isFavorite
                        ? "bg-primary/20 border-primary/45 text-primary shadow-[0_0_12px_rgba(229,9,20,0.2)]"
                        : "bg-white/6 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-primary text-primary animate-pulse" : ""}`} />
                    {isFavorite ? "Đã Thích" : "Yêu thích"}
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="cinema-divider" />

            {/* Genre Tags */}
            {movie.category?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.category.map((cat: any) => (
                  <span
                    key={cat.slug}
                    className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary/80 font-vietnam cursor-pointer hover:bg-primary/20 transition-colors"
                  >
                    {cat.name}
                  </span>
                ))}
                {movie.country?.map((c: any) => (
                  <span
                    key={c.slug}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/50 font-vietnam"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <div>
                <p className={`text-sm text-white/60 leading-relaxed font-vietnam ${showFullDesc ? '' : 'line-clamp-3'}`}>
                  {description}
                </p>
                {description.length > 200 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-vietnam font-medium"
                  >
                    {showFullDesc ? (
                      <><ChevronUp className="w-3.5 h-3.5" /> Thu gọn</>
                    ) : (
                      <><ChevronDown className="w-3.5 h-3.5" /> Xem thêm</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Extra Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {movie.director?.length > 0 && movie.director[0] && (
                <div>
                  <p className="text-white/35 text-xs uppercase tracking-wider mb-1 font-vietnam">Đạo diễn</p>
                  <p className="text-white/75 text-sm font-vietnam">{movie.director.join(", ")}</p>
                </div>
              )}
              {movie.actor?.length > 0 && movie.actor[0] && (
                <div>
                  <p className="text-white/35 text-xs uppercase tracking-wider mb-1 font-vietnam">Diễn viên</p>
                  <p className="text-white/75 text-sm line-clamp-2 font-vietnam">{movie.actor.join(", ")}</p>
                </div>
              )}
            </div>

            {/* Trailer Button */}
            {movie.trailer_url && (
              <button
                onClick={() => setShowTrailer(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all duration-200 font-vietnam"
              >
                <Play className="w-4 h-4 fill-current" />
                Xem Trailer
              </button>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════
            RIGHT COLUMN — Episode List
            ════════════════════════════════════ */}
        <div className="watch-episode-panel flex flex-col gap-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(17,17,24,0.95)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Right column header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6">
              <Tv className="w-4 h-4 text-primary" />
              <span className="text-white font-bold text-sm font-vietnam">Danh Sách Tập</span>
              <span className="ml-auto text-white/30 text-xs font-vietnam">
                {serverData?.[currentEpisodeIndex?.server ?? 0]?.server_data?.length || 0} tập
              </span>
            </div>

            {/* Episode component inside right column */}
            <div className="p-4">
              <Episode
                serverData={serverData}
                currentServerIndex={currentEpisodeIndex?.server || 0}
                currentEpisodeIndex={currentEpisodeIndex?.episode || 0}
                onSelectEpisode={handleSelectEpisode}
                onServerChange={handleServerChange}
                thumb_url={movie.thumb_url}
                playerMode={playerMode}
                onPlayerModeChange={(mode) => {
                  setPlayerMode(mode);
                  if (currentEpisodeIndex && serverData) {
                    const ep = serverData[currentEpisodeIndex.server]?.server_data[currentEpisodeIndex.episode];
                    if (ep) {
                      if (mode === 'm3u8' && ep.link_m3u8) setCurrentEpisodeUrl(ep.link_m3u8);
                      else if (mode === 'embed' && ep.link_embed) setCurrentEpisodeUrl(ep.link_embed);
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Favorite Toggle Button in Right Column */}
          <button
            onClick={toggleFavorite}
            className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl border font-bold text-sm font-vietnam transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer`}
            style={{
              background: isFavorite ? "rgba(229,9,20,0.15)" : "rgba(17,17,24,0.95)",
              borderColor: isFavorite ? "rgba(229,9,20,0.4)" : "rgba(255,255,255,0.07)",
              color: isFavorite ? "#E50914" : "#A8B0BE",
              boxShadow: isFavorite ? "0 0 15px rgba(229,9,20,0.2)" : "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <Heart className={`w-4 h-4 transition-transform duration-200 ${isFavorite ? "fill-primary text-primary animate-pulse" : "text-white/60"}`} />
            {isFavorite ? "Đã Thêm Yêu Thích" : "Thêm Vào Yêu Thích"}
          </button>
        </div>
      </div>

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="sm:max-w-4xl bg-[#0A0A0F] border-white/10">
          <DialogTitle className="text-white text-xl font-bold font-vietnam mb-3">
            Trailer — {movie.name}
          </DialogTitle>
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_url?.split("v=")[1]}`}
              className="w-full h-full"
              allowFullScreen
              title="Movie Trailer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
