export default function Loading() {
  return (
    <div className="dark">
      {/* Background glow */}
      <div
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(229,9,20,0.08) 0%, transparent 70%)`,
        }}
      />

      <main className="min-h-screen bg-[#0A0A0F] relative z-10 flex flex-col items-center justify-center">
        <div className="text-center relative">
          {/* Spinner container */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            {/* Outer static ring */}
            <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
            {/* Outer spinning ring - brand red */}
            <div className="absolute inset-0 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
            {/* Inner spinning ring - brand orange (reversed, smaller) */}
            <div
              className="absolute inset-2.5 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            ></div>
          </div>

          {/* Brand-aligned text */}
          <h2 className="text-2xl font-black tracking-wide bg-gradient-to-r from-[#E50914] to-[#FF6B35] bg-clip-text text-transparent font-vietnam mb-2">
            Đang tải phim...
          </h2>
          
          <p className="text-sm font-medium text-white/40 font-vietnam">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </main>
    </div>
  );
}