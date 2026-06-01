"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieMinimalCard from "@/components/movie/movie-minimal";

export default function RecentlyWatchedPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories and countries for header
    const fetchData = async () => {
      const PhimApi = (await import("@/libs/phimapi.com")).default;
      const api = new PhimApi();
      const [cats, cnts] = await Promise.all([
        api.listCategories(),
        api.listCountries(),
      ]);
      setCategories(cats);
      setCountries(cnts);
    };
    fetchData();

    // Load recently watched from localStorage & cookies
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
    
    setMovies(recentlyWatched);
  }, []);

  const handleDeleteMovie = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedMovies = movies.filter((m) => m.slug !== slug);
    setMovies(updatedMovies);
    
    const Cookies = require('js-cookie');
    try {
      localStorage.setItem('recentlyWatched', JSON.stringify(updatedMovies));
    } catch (err) {}
    try {
      Cookies.set('recentlyWatched', JSON.stringify(updatedMovies), { expires: 30 });
    } catch (err) {}
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem phim?")) {
      setMovies([]);
      const Cookies = require('js-cookie');
      try {
        localStorage.removeItem('recentlyWatched');
      } catch (err) {}
      try {
        Cookies.remove('recentlyWatched');
      } catch (err) {}
    }
  };

  return (
    <div className="dark">
      {/* Background glow */}
      <div
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(229,9,20,0.08) 0%, transparent 70%)`,
        }}
      />

      <main className="min-h-screen bg-[#0A0A0F] relative z-10 flex flex-col">
        <Header categories={categories} countries={countries} />
        
        <div className="flex-1 mx-auto max-w-screen-2xl w-full px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <section className="space-y-8">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_12px_rgba(229,9,20,0.6)]"></span>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-vietnam tracking-tight">
                  Phim Đã Xem Gần Đây
                </h1>
                {movies.length > 0 && (
                  <span className="text-xs font-semibold text-white/40 font-vietnam bg-white/5 border border-white/8 px-3 py-1.5 rounded-full">
                    {movies.length} phim
                  </span>
                )}
              </div>
              
              {movies.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-600 hover:border-red-500 text-red-400 hover:text-white text-xs sm:text-sm font-semibold transition-all duration-200 font-vietnam shadow-lg hover:shadow-red-600/10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa Lịch Sử
                </button>
              )}
            </div>

            {/* List */}
            {movies.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-white/[0.04] border border-white/8 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white/30">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-white font-bold text-lg mb-1 font-vietnam">Lịch sử trống</h2>
                <p className="text-sm text-white/40 font-vietnam mb-6">
                  Bạn chưa xem phim nào gần đây. Hãy bắt đầu khám phá kho phim của chúng tôi!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-200 font-vietnam"
                >
                  Khám phá ngay
                </Link>
              </div>
            ) : (
              <div
                className="grid gap-6 auto-rows-[280px]"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                }}
              >
                {movies.map((movie: any) => (
                  <div key={movie.slug}>
                    <MovieMinimalCard movie={movie} onDelete={handleDeleteMovie} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <Footer />
      </main>
    </div>
  );
}