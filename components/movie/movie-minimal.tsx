"use client";

import { useLoading } from "@/components/ui/loading-context";
import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";

interface MovieMinimalProps {
  movie: any;
  onDelete?: (slug: string, e: React.MouseEvent) => void;
}

// Unified Movie Card - matches MovieCardDefault design for consistency
export default memo(function MovieMinimalCard({ movie, onDelete }: MovieMinimalProps) {
  const router = useRouter();
  const { showLoading } = useLoading();

  const handleClick = useCallback(() => {
    showLoading();
    router.push(`/watch?slug=${movie.slug}`);
  }, [movie.slug, router, showLoading]);

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="block h-full w-full text-left group cursor-pointer focus:outline-none"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-black shadow-md hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
        {/* Image */}
        <img
          src={
            movie.poster_url?.startsWith("http")
              ? movie.poster_url
              : `https://phimimg.com/${movie.poster_url}`
          }
          alt={movie.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-300" />

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/10 to-transparent" />

        {/* Quality badge - glassmorphism */}
        <div className="absolute top-2 left-2 z-20">
          <span className="inline-flex bg-primary/30 backdrop-blur-md border border-primary/50 px-2.5 py-1 text-xs font-bold text-primary rounded-lg shadow-lg shadow-primary/20">
            {movie.quality || "HD"}
          </span>
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(movie.slug, e);
            }}
            className="absolute top-2 right-2 z-30 bg-black/60 hover:bg-red-600 border border-white/10 hover:border-red-500 p-1.5 rounded-lg text-white/70 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-md"
            title="Xóa khỏi lịch sử"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Play icon - glass effect */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="bg-white/10 backdrop-blur-md w-16 h-16 rounded-full flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/30">
            <svg className="w-6 h-6 text-primary ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-20 bg-white/5 backdrop-blur-xl border-t border-white/10">
          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-tight mb-1.5">
            {movie.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {movie.year}
            </span>
            {movie.episode_current && (
              <span className="text-primary font-semibold">
                Tập {movie.episode_current}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
