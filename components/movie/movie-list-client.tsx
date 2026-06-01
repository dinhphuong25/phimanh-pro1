"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import Pagination from "@/components/pagination";
import LiveStatus from "@/components/live-status";
import { filterHiddenMovies } from "@/lib/hidden-movies";
import { ChevronRight } from "lucide-react";

interface MovieListClientProps {
  index?: number;
  category?: string;
  topic?: string;
}

const TOPIC_NAMES: Record<string, string> = {
  "phim-bo": "Phim Bộ",
  "phim-le": "Phim Lẻ",
  "hoat-hinh": "Anime / Hoạt Hình",
  "tv-shows": "TV Shows",
  "phim-vietsub": "Phim Vietsub",
  "phim-thuyet-minh": "Phim Thuyết Minh",
  "phim-long-tieng": "Phim Lồng Tiếng",
  "phim-chieu-rap": "Phim Chiếu Rạp",
};

export default function MovieListClient({
  index = 1,
  category,
  topic,
}: MovieListClientProps) {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMovies = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const filterCountry = searchParams.get("country");
      const filterCategory = searchParams.get("category");
      const filterYear = searchParams.get("year");
      const typeList = searchParams.get("typeList");
      const sortField = searchParams.get("sortField");
      const sortType = searchParams.get("sortType") || "desc";
      const sortLang = searchParams.get("sortLang") || "vietsub";
      const limit = searchParams.get("limit") || "20";

      let url: string;
      let usesV1Api = true;

      const hasAdvancedFilters = typeList || sortField || filterCategory || filterYear;

      if (hasAdvancedFilters || (filterCountry && (typeList || filterCategory || filterYear))) {
        const baseType = typeList || "phim-bo";
        const urlObj = new URL(`https://phimapi.com/v1/api/danh-sach/${baseType}`);
        urlObj.searchParams.set("page", String(index));
        urlObj.searchParams.set("sort_field", sortField || "modified.time");
        urlObj.searchParams.set("sort_type", sortType);
        urlObj.searchParams.set("limit", limit);
        if (sortLang) urlObj.searchParams.set("sort_lang", sortLang);
        if (filterCategory) urlObj.searchParams.set("category", filterCategory);
        if (filterCountry) urlObj.searchParams.set("country", filterCountry);
        if (filterYear) urlObj.searchParams.set("year", filterYear);
        url = urlObj.toString();
      } else if (filterCountry) {
        url = `https://phimapi.com/v1/api/quoc-gia/${filterCountry}?page=${index}&limit=${limit}`;
      } else if (category) {
        url = `https://phimapi.com/v1/api/the-loai/${category}?page=${index}&limit=${limit}`;
      } else if (topic) {
        url = `https://phimapi.com/v1/api/danh-sach/${topic}?page=${index}&limit=${limit}`;
      } else {
        url = `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${index}`;
        usesV1Api = false;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (usesV1Api) {
        setMovies(filterHiddenMovies(data.data?.items || []));
        setPageInfo(data.data?.params?.pagination || null);
      } else {
        setMovies(filterHiddenMovies(data.items || []));
        setPageInfo(data.pagination || null);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setMovies([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchMovies(true);
    }, 180000);
    return () => clearInterval(interval);
  }, [index, category, topic, searchParams]);

  const getPageTitle = () => {
    const typeList = searchParams.get("typeList");
    const filterCategory = searchParams.get("category");
    const filterCountry = searchParams.get("country");
    const filterYear = searchParams.get("year");
    if (typeList) return TOPIC_NAMES[typeList] || "Kết quả lọc";
    if (topic) return TOPIC_NAMES[topic] || topic;
    if (category) return category;
    if (filterCategory) return filterCategory;
    if (filterCountry) return `Phim ${filterCountry}`;
    if (filterYear) return `Phim năm ${filterYear}`;
    return "Danh Sách Phim";
  };

  // Loading state — skeleton grid
  if (loading) {
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-6 px-0.5">
          <span className="section-bar" />
          <div className="shimmer-box h-7 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] shimmer-box" />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white/60 font-vietnam">Không tìm thấy phim</h3>
          <p className="text-white/30 text-sm font-vietnam">Vui lòng thử lại với tùy chọn khác.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2">
      {/* Section Header — đồng nhất với trang chủ */}
      <div className="flex items-center justify-between mb-6 px-0.5">
        <div className="flex items-center gap-3">
          <span className="section-bar" />
          <h1 className="text-lg sm:text-xl font-black text-white font-vietnam tracking-wide">
            {getPageTitle()}
          </h1>
          {pageInfo && (
            <span className="text-white/30 text-sm font-vietnam hidden sm:inline">
              ({pageInfo.totalItems?.toLocaleString() || movies.length} phim)
            </span>
          )}
          {isRefreshing && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </div>

        <LiveStatus
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={() => fetchMovies(true)}
        />
      </div>

      {/* Movie Grid — đồng nhất với trang chủ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {movies.map((movie: any) => (
          <div key={movie.slug || movie._id} className="aspect-[2/3]">
            <MovieCardDefault movie={movie} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "rgba(17,17,24,0.95)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Pagination />
          </div>
        </div>
      )}
    </div>
  );
}
