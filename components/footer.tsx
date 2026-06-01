"use client";

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-white/5 bg-[#08080C]/40 backdrop-blur-md">
      <div className="mx-auto max-w-screen-2xl px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/25 text-xs font-vietnam text-center sm:text-left">
          © 2025 Rạp Phim Chill. All rights reserved.
        </p>
        <p className="text-white/20 text-xs font-vietnam">
          Phát triển bởi{" "}
          <a
            href="https://www.facebook.com/dinhphuong205/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors duration-200 font-semibold"
          >
            Kim Đình Phương
          </a>
        </p>
      </div>
    </footer>
  );
}
