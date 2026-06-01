"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/components/ui/loading-context";
import {
  X, Home, Zap, Film, Tv, Clapperboard, Clock,
  ChevronDown, Globe, Calendar, Tag, Heart,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

const currentYear = 2026;
const YEAR_OPTIONS = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

const MAIN_LINKS = [
  { href: "/", label: "Trang Chủ", icon: <Home className="w-5 h-5" /> },
  { href: "/new-updates", label: "Mới Cập Nhật", icon: <Zap className="w-5 h-5" /> },
  { href: "/?typeList=phim-le", label: "Phim Lẻ", icon: <Film className="w-5 h-5" /> },
  { href: "/?typeList=phim-bo", label: "Phim Bộ", icon: <Tv className="w-5 h-5" /> },
  { href: "/?topic=hoat-hinh", label: "Anime / Hoạt Hình", icon: <Clapperboard className="w-5 h-5" /> },
  { href: "/recently", label: "Đã Xem Gần Đây", icon: <Clock className="w-5 h-5" /> },
  { href: "/yeu-thich", label: "Phim Yêu Thích", icon: <Heart className="w-5 h-5" /> },
];

export default function Sidebar({
  isOpen,
  onClose,
  categories = [],
  countries = [],
  topics = [],
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => setMounted(true), []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const toggle = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const go = (path: string) => {
    showLoading();
    router.push(path);
    hideLoading();
    onClose();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && !searchParams.toString();
    if (href.startsWith("/?")) {
      const params = new URLSearchParams(href.slice(2));
      for (const [k, v] of params.entries()) {
        if (searchParams.get(k) !== v) return false;
      }
      return pathname === "/";
    }
    return pathname === href;
  };

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-[60] w-[300px] sm:w-[320px] overflow-y-auto scrollbar-thin transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(10,10,15,0.97)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "8px 0 40px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center" style={{ boxShadow: "0 0 12px rgba(229,9,20,0.4)" }}>
              <svg className="w-3.5 h-3.5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="font-black text-white text-[15px] font-vietnam">Rạp Phim Chill</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {/* Main Links */}
          {MAIN_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left font-vietnam ${
                isActive(link.href)
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-white/65 hover:text-white hover:bg-white/6"
              }`}
            >
              <span className={isActive(link.href) ? "text-primary" : "text-white/40"}>
                {link.icon}
              </span>
              {link.label}
            </button>
          ))}

          {/* Divider */}
          <div className="cinema-divider my-3" />

          {/* Thể Loại */}
          <div>
            <button
              onClick={() => toggle("genres")}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/6 transition-all duration-200 font-vietnam"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-white/40" />
                Thể Loại
              </div>
              <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${expanded.genres ? "rotate-180" : ""}`} />
            </button>
            {expanded.genres && (
              <div className="mt-1.5 px-2 grid grid-cols-2 gap-1.5 animate-fadeIn pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => go(`/?category=${cat.slug}`)}
                    className={`w-full px-2 py-2 rounded-lg text-xs font-medium text-center transition-all duration-200 font-vietnam truncate ${
                      pathname === "/" && searchParams.get("category") === cat.slug
                        ? "bg-primary/20 text-primary border border-primary/30 font-semibold"
                        : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white border border-white/8"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quốc Gia */}
          <div>
            <button
              onClick={() => toggle("countries")}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/6 transition-all duration-200 font-vietnam"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/40" />
                Quốc Gia
              </div>
              <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${expanded.countries ? "rotate-180" : ""}`} />
            </button>
            {expanded.countries && (
              <div className="mt-1.5 px-2 grid grid-cols-2 gap-1.5 animate-fadeIn pb-2">
                {countries.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => go(`/?country=${c.slug}`)}
                    className={`w-full px-2 py-2 rounded-lg text-xs font-medium text-center transition-all duration-200 font-vietnam truncate ${
                      pathname === "/" && searchParams.get("country") === c.slug
                        ? "bg-primary/20 text-primary border border-primary/30 font-semibold"
                        : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white border border-white/8"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Năm */}
          <div>
            <button
              onClick={() => toggle("years")}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/6 transition-all duration-200 font-vietnam"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white/40" />
                Năm Phát Hành
              </div>
              <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${expanded.years ? "rotate-180" : ""}`} />
            </button>
            {expanded.years && (
              <div className="mt-1.5 px-2 grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin animate-fadeIn pb-2">
                {YEAR_OPTIONS.map((y) => (
                  <button
                    key={y.value}
                    onClick={() => go(`/?year=${y.value}`)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-all duration-200 font-vietnam ${
                      pathname === "/" && searchParams.get("year") === y.value
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white border border-white/8"
                    }`}
                  >
                    {y.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/6 flex-shrink-0">
          <p className="text-white/20 text-xs text-center font-vietnam">
            © 2025 Rạp Phim Chill
          </p>
        </div>
      </aside>
    </>
  );

  if (!mounted) return null;
  return createPortal(content, document.getElementById("sidebar-root") || document.body);
}
