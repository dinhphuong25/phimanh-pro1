"use client";

import { useEffect, useState, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/ui/loading-context";
import { Play, X } from "lucide-react";

interface ContinueWatchingProps {
  limit?: number;
}

export default memo(function ContinueWatching({ limit = 6 }: ContinueWatchingProps) {
  const [movies, setMovies] = useState<any[]>([]);
  const router = useRouter();
  const { showLoading } = useLoading();

  const loadHistory = useCallback(() => {
    const Cookies = require('js-cookie');
    let recentlyWatched = [];
    try {
      recentlyWatched = JSON.parse(localStorage.getItem('recentlyWatched') || '[]');
    } catch (e) {
      try {
        recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
      } catch (err) {}
    }

    if (!recentlyWatched || recentlyWatched.length === 0) {
      try {
        recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
      } catch (err) {}
    }

    if (Array.isArray(recentlyWatched)) {
      // Filter out items that have watch history info
      // Keep only those that have lastEpisodeName or lastEpisodeIndex
      const continueList = recentlyWatched.filter(
        (m: any) => m.slug && (m.lastEpisodeName || m.lastEpisodeIndex)
      );
      setMovies(limit ? continueList.slice(0, limit) : continueList);
    }
  }, [limit]);

  useEffect(() => {
    loadHistory();

    // Listen for storage changes to update live
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recentlyWatched') {
        loadHistory();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadHistory]);

  const handleResume = useCallback((slug: string) => {
    showLoading();
    router.push(`/watch?slug=${slug}`);
  }, [router, showLoading]);

  const handleDelete = useCallback((slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const Cookies = require('js-cookie');
    let recentlyWatched = [];
    try {
      recentlyWatched = JSON.parse(localStorage.getItem('recentlyWatched') || '[]');
    } catch (err) {}
    
    if (Array.isArray(recentlyWatched)) {
      const updated = recentlyWatched.filter((m: any) => m.slug !== slug);
      try {
        localStorage.setItem('recentlyWatched', JSON.stringify(updated));
      } catch (err) {}
      try {
        Cookies.set('recentlyWatched', JSON.stringify(updated), { expires: 30 });
      } catch (err) {}
      
      // Update state
      setMovies(prev => prev.filter(m => m.slug !== slug));
      
      // Dispatch custom event to notify other components (e.g. RecentlyWatchedPage)
      window.dispatchEvent(new Event('storage'));
    }
  }, []);

  if (movies.length === 0) return null;

  return (
    <section className="continue-watching-section relative animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between mb-5 px-0.5">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_12px_rgba(229,9,20,0.6)]" />
          <h2 className="text-lg sm:text-xl font-black text-white font-vietnam tracking-wide">
            Tiếp Tục Xem
          </h2>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {movies.map((movie: any) => {
          const progress = movie.progress || 0;
          const posterSrc = movie.poster_url?.startsWith("http")
            ? movie.poster_url
            : `https://phimimg.com/${movie.poster_url}`;

          return (
            <div
              key={movie.slug}
              onClick={() => handleResume(movie.slug)}
              className="group relative aspect-[2/3] rounded-[10px] bg-[#1A1A24] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border border-white/5"
            >
              {/* Poster Image */}
              <img
                src={posterSrc}
                alt={movie.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Black Gradient Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-300" />

              {/* Top Row: Quality & Remove button */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="badge-hd text-[10px] px-1.5 py-0.5">{movie.quality || "HD"}</span>
                <button
                  onClick={(e) => handleDelete(movie.slug, e)}
                  className="w-6 h-6 rounded-md bg-black/60 hover:bg-red-600/90 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  title="Xóa khỏi danh sách"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Play Overlay (Hover) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <div className="bg-primary/90 w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>

              {/* Movie Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                <h3 className="font-bold text-white text-xs sm:text-[13px] line-clamp-1 leading-snug font-vietnam mb-1 group-hover:text-primary transition-colors">
                  {movie.name}
                </h3>
                <div className="flex items-center justify-between text-[11px] font-vietnam font-medium text-white/40">
                  <span>{movie.lastEpisodeName || "Tập 1"}</span>
                  {progress > 0 && (
                    <span className="text-primary font-semibold">{progress}%</span>
                  )}
                </div>
              </div>

              {/* Progress Bar (Bottom) */}
              {progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
                  <div
                    className="bg-primary h-full shadow-[0_0_8px_rgba(229,9,20,0.8)]"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});
