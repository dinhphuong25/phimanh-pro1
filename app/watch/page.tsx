import PhimApi from "@/libs/phimapi.com";
import Description from "@/components/movie/description";
import { MovieStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import Breadcrumb, { useBreadcrumb } from "@/components/seo/breadcrumb";
import { notFound } from "next/navigation";
import { HIDDEN_MOVIE_SLUGS } from "@/lib/hidden-movies";

export async function generateMetadata({ searchParams }: any) {
  const { slug } = await searchParams;
  const api = new PhimApi();
  const { movie } = await api.get(slug);
  return {
    title: `${movie.name} - Xem phim HD chất lượng cao | Rạp Phim Chill`,
    description: movie.content ? movie.content.substring(0, 160) + '...' : `Xem phim ${movie.name} ${movie.origin_name ? `(${movie.origin_name})` : ''} HD chất lượng cao miễn phí tại Rạp Phim Chill.`,
    keywords: [
      movie.name,
      movie.origin_name,
      `phim ${movie.name}`,
      `xem phim ${movie.name}`,
      `${movie.name} vietsub`,
      `${movie.name} thuyết minh`,
      'phim HD',
      'phim chất lượng cao',
      'xem phim miễn phí',
      ...movie.category?.map((cat: any) => `phim ${cat.name}`) || [],
      ...movie.country?.map((country: any) => `phim ${country.name}`) || []
    ].join(', '),
    openGraph: {
      title: `${movie.name} - Xem phim HD chất lượng cao`,
      description: movie.content ? movie.content.substring(0, 200) : `Xem phim ${movie.name} HD chất lượng cao miễn phí`,
      images: [
        {
          url: movie.poster_url,
          width: 300,
          height: 450,
          alt: `Poster phim ${movie.name}`,
        },
        ...(movie.thumb_url ? [{
          url: movie.thumb_url,
          width: 1200,
          height: 630,
          alt: `Hình ảnh phim ${movie.name}`,
        }] : [])
      ],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.name} - Xem phim HD chất lượng cao`,
      description: movie.content ? movie.content.substring(0, 200) : `Xem phim ${movie.name} HD chất lượng cao miễn phí`,
      images: [movie.thumb_url || movie.poster_url],
    },
  };
}

export default async function WatchPage({ searchParams }: any) {
  const { slug } = await searchParams;

  // Kiểm tra nếu phim bị ẩn
  if (HIDDEN_MOVIE_SLUGS.includes(slug)) {
    notFound();
  }

  const api = new PhimApi();
  const [categories, { movie, server }, countries] = await Promise.all([
    api.listCategories(),
    api.get(slug),
    api.listCountries(),
  ]);

  const { generateMovieBreadcrumb } = useBreadcrumb();
  const breadcrumbItems = generateMovieBreadcrumb(movie.name, slug);

  const structuredBreadcrumbItems = breadcrumbItems.map(item => ({
    name: item.name,
    url: `https://rapphimchill.app${item.url}`
  }));

  return (
    <div className="dark">
      {/* Structured Data */}
      <MovieStructuredData
        movie={movie}
        url={`https://rapphimchill.app/watch?slug=${slug}`}
      />
      <BreadcrumbStructuredData items={structuredBreadcrumbItems} />

      <main className="min-h-screen bg-[#0A0A0F] relative">
        {/* Subtle top gradient from poster color */}
        <div
          className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(229,9,20,0.08) 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 mx-auto max-w-screen-2xl px-3 sm:px-5 lg:px-8">
          <Description movie={movie} serverData={server} slug={slug} thumb_url={movie.thumb_url} />
        </div>
      </main>
    </div>
  );
}
