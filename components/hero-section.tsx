"use client";

import { Play, Info, Star } from "lucide-react";
import { useLoading } from "@/components/ui/loading-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  movie: any;
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const router = useRouter();
  const { showLoading } = useLoading();
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!movie) return null;

  const backdropUrl = movie.poster_url?.startsWith("http")
    ? movie.poster_url
    : `https://phimimg.com/${movie.poster_url}`;

  const thumbUrl = movie.thumb_url?.startsWith("http")
    ? movie.thumb_url
    : movie.thumb_url ? `https://phimimg.com/${movie.thumb_url}` : backdropUrl;

  const imdbScore = movie.imdb?.rating || "8.2";
  const categories = movie.category?.slice(0, 4) || [];
  const description = movie.content?.replace(/<[^>]*>/g, "") || "";

  return (
    <div className="relative w-full min-h-[100vh] overflow-hidden bg-[#0A0A0F]">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={movie.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: "brightness(0.45) saturate(1.1)" }}
        />
        {/* Dark skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}

        {/* Cinematic gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0A0A0F] to-transparent" />

        {/* Subtle vignette */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.6) 100%)"
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[100vh] flex items-end">
        <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 pb-24 pt-32 lg:pt-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end">

            {/* Left: Movie Info */}
            <div className="space-y-5">
              {/* Featured Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border animate-fadeIn"
                style={{
                  background: "rgba(229,9,20,0.12)",
                  borderColor: "rgba(229,9,20,0.35)",
                  animationDelay: "0ms",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulseDot" />
                <Star className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest font-vietnam">
                  Phim Nổi Bật
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight animate-fadeInUp font-vietnam drop-shadow-2xl"
                style={{ animationDelay: "100ms" }}
              >
                {movie.name}
              </h1>

              {/* Origin name */}
              {movie.origin_name && movie.origin_name !== movie.name && (
                <p
                  className="text-base text-white/50 font-medium animate-fadeInUp"
                  style={{ animationDelay: "150ms" }}
                >
                  {movie.origin_name}
                </p>
              )}

              {/* Meta badges */}
              <div
                className="flex flex-wrap items-center gap-2 animate-fadeInUp"
                style={{ animationDelay: "200ms" }}
              >
                {/* Rating */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">{imdbScore}</span>
                </span>

                {movie.year && (
                  <span className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/12 text-sm font-semibold text-white/80">
                    {movie.year}
                  </span>
                )}

                <span className="badge-hd py-1.5">HD</span>

                <span className="px-3 py-1.5 rounded-lg bg-white/8 border border-white/12 text-sm font-semibold text-white/80 font-vietnam">
                  {movie.type === "series" ? "Phim Bộ" : "Phim Lẻ"}
                </span>

                {movie.episode_current && (
                  <span className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-sm font-bold text-primary font-vietnam">
                    {movie.episode_current}
                  </span>
                )}
              </div>

              {/* Genres */}
              {categories.length > 0 && (
                <div
                  className="flex flex-wrap gap-2 animate-fadeInUp"
                  style={{ animationDelay: "250ms" }}
                >
                  {categories.map((cat: any) => (
                    <span
                      key={cat.slug}
                      className="text-sm text-white/55 hover:text-primary transition-colors duration-200 cursor-pointer font-vietnam"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {description && (
                <p
                  className="text-sm sm:text-base text-white/65 leading-relaxed line-clamp-3 max-w-xl animate-fadeInUp font-vietnam"
                  style={{ animationDelay: "300ms" }}
                >
                  {description}
                </p>
              )}

              {/* CTA Buttons */}
              <div
                className="flex flex-wrap gap-3 animate-fadeInUp"
                style={{ animationDelay: "380ms" }}
              >
                <button
                  onClick={() => {
                    showLoading();
                    router.push(`/watch?slug=${movie.slug}`);
                  }}
                  className="group flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white px-7 py-3.5 rounded-xl font-bold text-base transition-all duration-250 shadow-lg font-vietnam"
                  style={{ boxShadow: "0 4px 20px rgba(229,9,20,0.4)" }}
                >
                  <Play className="w-5 h-5 fill-current transition-transform duration-200 group-hover:scale-110" />
                  Xem Ngay
                </button>

                <button
                  onClick={() => {
                    document.querySelector(".new-updates-section")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className="flex items-center gap-2.5 glass hover:bg-white/12 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-all duration-250 font-vietnam"
                >
                  <Info className="w-5 h-5" />
                  Thông Tin
                </button>
              </div>
            </div>

            {/* Right: Movie Poster (Desktop only) */}
            <div className="hidden lg:flex justify-center lg:justify-end items-end pb-4 animate-fadeIn" style={{ animationDelay: "200ms" }}>
              <div
                className="relative w-56 xl:w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-float"
                style={{
                  boxShadow: "0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(229,9,20,0.15)",
                  transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
                }}
              >
                <div className="aspect-[2/3]">
                  <img
                    src={thumbUrl}
                    alt={movie.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Poster shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-amber-400 font-bold text-sm">{imdbScore}</span>
                    <span className="text-white/40 text-xs ml-auto">{movie.year}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none z-20" />
    </div>
  );
}
