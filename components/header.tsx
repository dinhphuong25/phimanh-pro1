"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLoading } from "@/components/ui/loading-context";
import Sidebar from "@/components/sidebar";
import { Search, Menu, X, Zap, Tag, Globe, ArrowRight, Heart } from "lucide-react";

interface HeaderProps {
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

export default function Header({
  categories = [],
  countries = [],
  topics = [],
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showLoading, hideLoading } = useLoading();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navigateTo = (path: string) => {
    showLoading();
    router.push(path);
    hideLoading();
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    };
    if (showSearch) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [showSearch]);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    showLoading();
    try {
      await router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } finally {
      hideLoading();
      closeSearch();
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data?.data?.items || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { closeSearch(); return; }
    if (!showSuggestions || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const s = suggestions[highlightedIndex];
      if (s) {
        showLoading();
        router.push(`/watch?slug=${s.slug}`);
        hideLoading();
        closeSearch();
      }
    }
  };

  return (
    <>
      {/* ─── Navbar ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center transition-all duration-500 ${
          isScrolled
            ? "bg-[#0A0A0F]/96 backdrop-blur-xl border-b border-white/5 shadow-2xl"
            : "bg-gradient-to-b from-black/70 to-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full flex items-center justify-between px-3 sm:px-5">
          {/* Left: Hamburger */}
          <button
            onClick={() => setShowSidebar(true)}
            aria-label="Mở menu"
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Center: Logo */}
          <Link
            href="/"
            onClick={() => showLoading()}
            className="flex items-center gap-2.5 group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300" style={{ boxShadow: "0 0 14px rgba(229,9,20,0.4)" }}>
              <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {/* Text */}
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-black text-white tracking-wide font-vietnam">
                Rạp Phim
              </span>
              <span
                className="text-[11px] font-bold tracking-widest font-vietnam"
                style={{
                  background: "linear-gradient(90deg, #E50914, #FF6B35)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                CHILL
              </span>
            </div>
          </Link>

          {/* Right: Search */}
          <button
            onClick={() => setShowSearch(true)}
            aria-label="Tìm kiếm"
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>

        {/* ─── Inline Expanding Search Bar (cobephim.net Style) ─── */}
        <div
          className={`absolute inset-0 bg-[#1a191f] flex items-center px-4 sm:px-6 transition-all duration-300 ${
            showSearch ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <form onSubmit={handleSearch} className="w-full flex items-center gap-3">
            <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setHighlightedIndex(-1); }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              placeholder="Tìm kiếm phim, diễn viên"
              className="flex-grow bg-transparent text-white border-0 outline-none focus:outline-none focus:ring-0 text-sm sm:text-base py-2 font-vietnam placeholder-white/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                className="text-white/40 hover:text-white p-1 hover:bg-white/8 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closeSearch}
              className="p-1.5 rounded-full hover:bg-white/5 transition-colors flex-shrink-0"
              aria-label="Đóng tìm kiếm"
            >
              <X className="w-5 h-5 text-primary hover:scale-105 transition-transform" />
            </button>
          </form>
        </div>
      </nav>

      {/* ─── Search Suggestions Dropdown Panel ─── */}
      <div
        className={`fixed top-14 left-0 right-0 z-40 bg-[#1a191f]/98 border-b border-white/5 shadow-2xl transition-all duration-300 origin-top scrollbar-thin ${
          showSearch && searchQuery.trim() ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        style={{
          maxHeight: "calc(100vh - 56px)",
          overflowY: "auto",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="w-full max-w-4xl mx-auto px-4.5 py-7 md:py-9 space-y-6">

          {/* Suggestions List */}
          {searchQuery.trim() && showSuggestions && suggestions.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="pb-1.5 border-b border-white/6">
                <h3 className="text-white/30 text-[10px] uppercase font-bold tracking-wider font-vietnam">Kết quả tìm kiếm ({suggestions.length})</h3>
              </div>
              <div className="space-y-1">
                {suggestions.map((item: any, idx: number) => (
                  <div
                    key={item.slug}
                    onMouseDown={() => {
                      showLoading();
                      router.push(`/watch?slug=${item.slug}`);
                      hideLoading();
                      closeSearch();
                    }}
                    className={`flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent font-vietnam ${
                      highlightedIndex === idx
                        ? "bg-primary/10 border-primary/25 text-white shadow-md"
                        : "text-white/70 hover:bg-[#14141B] hover:border-white/5 hover:text-white"
                    }`}
                  >
                    {/* Poster Thumbnail */}
                    <div className="aspect-[2/3] w-10 rounded-lg overflow-hidden bg-[#1A1A24] flex-shrink-0 border border-white/6">
                      <img
                        src={item.poster_url?.startsWith("http") ? item.poster_url : `https://phimimg.com/${item.poster_url}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Movie Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold truncate leading-snug">{item.name}</p>
                      <p className="text-xs text-white/40 mt-1 flex items-center gap-1.5 font-normal">
                        <span>{item.year}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="truncate">{item.origin_name}</span>
                      </p>
                    </div>

                    {/* Badge / Quality */}
                    <div className="flex-shrink-0 flex items-center gap-2 select-none">
                      {item.quality && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold">
                          {item.quality}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[10px] text-white/45">
                        {item.type === "series" ? "Phim Bộ" : "Phim Lẻ"}
                      </span>
                      
                      {/* Slide-in Action Indicator */}
                      <div className={`hidden sm:flex items-center gap-1 pl-1 transition-all duration-300 ${
                        highlightedIndex === idx ? "w-18 opacity-100" : "w-0 opacity-0 overflow-hidden"
                      }`}>
                        <span className="text-primary font-bold text-[11px] whitespace-nowrap">Xem ngay</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty suggestions */}
          {searchQuery.trim() && showSuggestions && suggestions.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4 font-vietnam">
              <p className="text-white/40 text-sm">Không tìm thấy phim nào với từ khóa "{searchQuery}"</p>
              <p className="text-white/25 text-xs mt-1.5">Hãy thử tìm kiếm với từ khóa khác như tên phim bằng tiếng Anh hoặc tiếng Việt</p>
            </div>
          )}
        </div>

        {/* Bottom Keyboard Shortcuts Legend (Inside dropdown panel) */}
        <div className="w-full max-w-4xl mx-auto px-4.5 py-3 border-t border-white/6 flex items-center justify-between text-[10px] text-white/30 font-vietnam select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-white/12 bg-white/5 text-[9px] font-sans">↑↓</kbd> Di chuyển
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-white/12 bg-white/5 text-[9px] font-sans">Enter</kbd> Chọn phim
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-white/12 bg-white/5 text-[9px] font-sans">Esc</kbd> Đóng
          </div>
        </div>
      </div>

      {/* ─── Search Backdrop ─── */}
      <div
        className={`fixed inset-0 z-30 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          showSearch ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSearch}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        categories={categories}
        countries={countries}
        topics={topics}
      />
    </>
  );
}
