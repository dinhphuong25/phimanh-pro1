import PhimApi from "@/libs/phimapi.com";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import Header from "@/components/header";
import Pagination from "@/components/pagination";
import Footer from "@/components/footer";
import { ScrollToTopFAB } from "@/components/ui/material-fab";

type SearchPageProps = {
  searchParams: Promise<{
    index: number | 1;
    query: string;
  }>;
};
export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { index, query } = await searchParams;
  const postTitle = `Kết quả cho "${query}"`;

  const titleText =
    `${postTitle} | Rạp Phim Chill` + (index > 1 ? " - Trang " + index : "");
  return {
    title: titleText,
    description:
      "Khám phá kho tàng phim ảnh chất lượng cao với hình ảnh và âm thanh hoàn hảo. Trải nghiệm những tác phẩm điện ảnh kinh điển với chất lượng tuyệt đỉnh.",
    keywords: `${query}, phim ảnh, phim chất lượng cao, phim, phim hd, phim kinh điển, phim viễn tưởng, phim kinh dị, phim bộ, anime`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { index, query } = await searchParams;
  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  const countries = await api.listCountries();
  const [movies, pageInfo] = await api.search(query, index);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header
        topics={topics}
        categories={categories}
        countries={countries}
      />

      <div className="container mx-auto px-4 pt-28 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Kết quả tìm kiếm
            </h1>
          </div>
          <p className="text-gray-400 ml-4">
            Từ khóa: <span className="text-primary font-medium">"{query}"</span>
            {movies?.length > 0 && (
              <span className="ml-2">• Tìm thấy {movies.length} kết quả</span>
            )}
          </p>
        </div>

        {/* Movie Grid */}
        {movies && movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {movies.map((movie: any, idx: number) => (
              <div
                key={movie.slug}
                className="aspect-[2/3]"
                style={{ animationDelay: `${idx * 0.02}s` }}
              >
                <MovieMinimalCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Không tìm thấy kết quả</h3>
              <p className="text-gray-400">Thử tìm kiếm với từ khóa khác.</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {movies && movies.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/5">
              <Pagination />
            </div>
          </div>
        )}
      </div>

      <Footer />
      <ScrollToTopFAB />
    </main>
  );
}

