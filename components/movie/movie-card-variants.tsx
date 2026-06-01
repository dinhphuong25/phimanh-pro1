"use client";

import { memo, useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/ui/loading-context";
import { Play, Heart } from "lucide-react";

// Lazy image with skeleton
const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isInView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); }
      },
      { rootMargin: "120px", threshold: 0.01 }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority, isInView]);

  const imageSrc = src?.startsWith("http") ? src : `https://phimimg.com/${src}`;

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 skeleton rounded-none" />
      )}
      {isInView && (
        <img
          src={hasError ? "/images/placeholder.webp" : imageSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-400 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
});

// Movie Card — Cinematic Design
export const MovieCardDefault = memo(function MovieCardDefault({ movie }: { movie: any }) {
  const router = useRouter();
  const { showLoading } = useLoading();
  const [isFav, setIsFav] = useState(false);

  // Sync isFav state
  useEffect(() => {
    if (!movie.slug) return;
    try {
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      setIsFav(Array.isArray(watchlist) && watchlist.some((m: any) => m.slug === movie.slug));
    } catch (e) {
      setIsFav(false);
    }
  }, [movie.slug]);

  // Handle favorite click with propagation stopped
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const Cookies = require('js-cookie');
    let watchlist = [];
    try {
      watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    } catch (err) {
      try {
        watchlist = JSON.parse(Cookies.get('watchlist') || '[]');
      } catch (e2) {}
    }
    if (!Array.isArray(watchlist)) watchlist = [];

    let updated = [];
    if (isFav) {
      updated = watchlist.filter((m: any) => m.slug !== movie.slug);
      setIsFav(false);
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
      setIsFav(true);
    }

    try {
      localStorage.setItem('watchlist', updated.length > 0 ? JSON.stringify(updated) : '[]');
    } catch (err) {}
    try {
      Cookies.set('watchlist', updated.length > 0 ? JSON.stringify(updated) : '[]', { expires: 30 });
    } catch (err) {}
  }, [movie, isFav]);

  // episode_current "Full" or short episode string signals it's recently updated
  const isNew = movie.episode_current === "Full" || movie.status === "completed" ? false : Boolean(movie.episode_current);

  const handleClick = useCallback(() => {
    showLoading();
    router.push(`/watch?slug=${movie.slug}`);
  }, [movie.slug, router, showLoading]);

  return (
    <div onClick={handleClick} className="movie-card h-full w-full cursor-pointer group">
      <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-[#1A1A24]">
        {/* Poster Image */}
        <LazyImage
          src={movie.poster_url}
          alt={movie.name}
          className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-108"
        />

        {/* Gradient overlay */}
        <div className="movie-card-overlay" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-20">
          <div className="flex gap-1.5">
            <span className="badge-hd">{movie.quality || "HD"}</span>
            {isNew && <span className="badge-new">MỚI</span>}
          </div>

          <button
            onClick={handleFavoriteClick}
            className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-primary transition-all duration-200 shadow-md hover:scale-110 active:scale-95 z-30"
            title={isFav ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors duration-200 ${isFav ? "fill-primary text-primary" : "text-white/80"}`} />
          </button>
        </div>

        {/* Play button (hover) */}
        <div className="movie-card-play z-20">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: "rgba(229,9,20,0.85)",
              boxShadow: "0 0 30px rgba(229,9,20,0.5)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Info bar */}
        <div className="movie-card-info z-20">
          <h3 className="font-bold text-white text-xs sm:text-[13px] line-clamp-2 leading-snug mb-1.5 font-vietnam">
            {movie.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-white/45 text-[11px] font-medium">{movie.year}</span>
            {movie.episode_current && (
              <span className="text-primary text-[11px] font-bold font-vietnam">
                {movie.episode_current}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export const MovieCardLarge = MovieCardDefault;
export const MovieCardWide = MovieCardDefault;
export const MovieCardCompact = MovieCardDefault;
