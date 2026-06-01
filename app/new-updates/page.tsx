import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";

type NewUpdatesProps = {
  searchParams: Promise<{
    index?: string;
  }>;
};

export async function generateMetadata({ searchParams }: NewUpdatesProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;

  return {
    title: `Phim Mới Cập Nhật | Rạp Phim Chill${index > 1 ? " - Trang " + index : ""}`,
    description: "Khám phá những bộ phim mới nhất được cập nhật trên Rạp Phim Chill. Xem phim HD miễn phí.",
    keywords: "phim mới, phim cập nhật, phim HD, xem phim online",
  };
}

export default async function NewUpdatesPage({ searchParams }: NewUpdatesProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;

  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  const countries = await api.listCountries();

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8 pt-20 pb-16">
        <MovieListClient index={index} />
      </div>
      <Footer />
    </main>
  );
}