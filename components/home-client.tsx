"use client";

import { memo, useMemo } from "react";
import { useNewUpdates, useTopicsWithMovies } from "@/hooks/useApiHooks";
import HeroSection from "@/components/hero-section";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import LiveStatus from "@/components/live-status";
import { filterHiddenMovies } from "@/lib/hidden-movies";
import { LazyRecentlyWatched, LazyTopicSection } from "@/lib/lazy-components";
import ContinueWatching from "@/components/continue-watching";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface HomeClientProps {
  initialMovies: any[];
  initialTopicsWithMovies: any[];
  topics: any[];
  featuredMovie?: any;
}

// Section Header component
const SectionHeader = memo(function SectionHeader({
  title,
  href,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: {
  title: string;
  href?: string;
  lastUpdated?: Date | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-5 px-0.5">
      <div className="flex items-center gap-3">
        <span className="section-bar" />
        <h2 className="text-lg sm:text-xl font-black text-white font-vietnam tracking-wide">
          {title}
        </h2>
        {isRefreshing && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && lastUpdated && (
          <button
            onClick={onRefresh}
            className="hidden sm:flex items-center gap-1.5 text-xs text-white/35 hover:text-primary transition-colors duration-200 font-vietnam"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Vừa cập nhật
          </button>
        )}
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm text-white/40 hover:text-primary transition-colors duration-200 font-vietnam font-medium"
          >
            Xem tất cả
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
});

// Movie grid — responsive
const MovieGrid = memo(function MovieGrid({ movies }: { movies: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {movies.slice(0, 12).map((movie: any, index: number) => (
        <div
          key={movie._id || movie.slug}
          className="aspect-[2/3]"
        >
          <MovieCardDefault movie={movie} />
        </div>
      ))}
    </div>
  );
});

// Topics renderer
const TopicSections = memo(function TopicSections({ topics }: { topics: any[] }) {
  return (
    <>
      {topics.map((topicData: any) => (
        <LazyTopicSection
          key={topicData.slug}
          topic={topicData}
          movies={topicData.movies || []}
        />
      ))}
    </>
  );
});

function HomeClient({
  initialMovies,
  initialTopicsWithMovies,
  topics,
  featuredMovie,
}: HomeClientProps) {
  const {
    movies: newUpdates,
    heroMovie,
    isRefreshing,
    lastUpdated,
    refresh: refreshMovies,
  } = useNewUpdates();

  const { topicsData } = useTopicsWithMovies(topics);

  const displayMovies = useMemo(() =>
    filterHiddenMovies(newUpdates.length > 0 ? newUpdates : initialMovies),
    [newUpdates, initialMovies]
  );

  const displayHeroMovie = useMemo(() =>
    featuredMovie || heroMovie || initialMovies[0] || displayMovies[0],
    [featuredMovie, heroMovie, initialMovies, displayMovies]
  );

  const displayTopics = useMemo(() =>
    initialTopicsWithMovies.map((initialTopic: any) => {
      const clientTopic = topicsData.find((t: any) => t.slug === initialTopic.slug);
      const movies = (clientTopic?.movies && clientTopic.movies.length > 0)
        ? clientTopic.movies
        : initialTopic.movies || [];
      return { ...initialTopic, movies };
    }),
    [initialTopicsWithMovies, topicsData]
  );

  return (
    <>
      {/* Hero Section */}
      {displayHeroMovie && <HeroSection movie={displayHeroMovie} />}

      {/* Content Area */}
      <div className="relative bg-[#0A0A0F] z-20">
        {/* Top separator glow */}
        <div className="cinema-divider w-full" />

        <div className="mx-auto px-3 sm:px-6 lg:px-8 pb-12 sm:pb-20 pt-8 sm:pt-12 max-w-screen-2xl">
          <div className="space-y-10 sm:space-y-14">
            {/* Continue Watching Section */}
            <ContinueWatching limit={6} />

            {/* New Updates Section */}
            <section className="new-updates-section">
              <SectionHeader
                title="Mới Cập Nhật"
                href="/new-updates"
                lastUpdated={lastUpdated}
                isRefreshing={isRefreshing}
                onRefresh={refreshMovies}
              />
              <MovieGrid movies={displayMovies} />
            </section>

            {/* Recently Watched */}
            <LazyRecentlyWatched limit={6} />

            {/* Topic Sections */}
            <TopicSections topics={displayTopics} />
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(HomeClient);
