import Link from "next/link";
import {
  MovieCardDefault,
} from "@/components/movie/movie-card-variants";
import {
  ScrollReveal,
} from "@/components/ui/material-animations";
import { filterHiddenMovies } from "@/lib/hidden-movies";

interface MovieSectionProps {
  title: string;
  movies: any[];
  viewAllLink: string;
  buttonColor?: "red" | "purple" | "green" | "orange" | "pink";
  emptyMessage?: string;
  isClientSide?: boolean;
}

export default function MovieSection({
  title,
  movies,
  viewAllLink,
  emptyMessage = "Chưa có phim nào",
  isClientSide = false,
}: MovieSectionProps) {
  const filteredMovies = filterHiddenMovies(movies || []);
  const content = (
    <section className="py-2 sm:py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-6 px-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1 h-5 sm:h-8 bg-primary rounded-full"></div>
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-wide">
            {title}
          </h2>
        </div>
        <Link
          href={viewAllLink}
          className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-primary transition-colors flex items-center gap-1 group"
        >
          <span className="hidden sm:inline">Xem Thêm</span>
          <span className="sm:hidden">Thêm</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {filteredMovies && filteredMovies.length > 0 ? (
          filteredMovies.map((movie: any, index: number) => {
            return (
              <ScrollReveal
                key={movie.slug}
                animation="grow"
                threshold={0.1}
              >
                <div
                  className="aspect-[2/3]"
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <MovieCardDefault movie={movie} />
                </div>
              </ScrollReveal>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <p className="text-muted-foreground text-sm sm:text-base">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
    </section>
  );

  if (isClientSide) {
    return content;
  }

  return (
    <ScrollReveal animation="fade" direction="up">
      {content}
    </ScrollReveal>
  );
}

