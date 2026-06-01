import type { Metadata } from "next";
import { Inter, Poppins, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import GTM from "@/components/ui/GTM";
import PageTransition from "@/components/ui/page-transition";
import { LoadingProvider } from "@/components/ui/loading-context";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/seo/structured-data";
import EnhancedGTMTracking from "@/components/seo/enhanced-gtm";
import MaterialThemeProvider from "@/components/providers/material-theme-provider";
import HydrationFix from "@/components/ui/hydration-fix";
import DevBanner from "@/components/ui/dev-banner";
import { PWAInstaller, PerformanceMonitor } from "@/components/pwa-init";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-poppins",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rạp Phim Chill - Xem phim HD chất lượng cao miễn phí 2024",
    template: "%s | Rạp Phim Chill"
  },
  description: "Kho phim ảnh HD chất lượng cao với hơn 50,000+ bộ phim thuộc mọi thể loại. Xem phim online miễn phí, cập nhật phim mới nhất 2024 hàng ngày.",
  keywords: [
    "phim ảnh", "xem phim HD", "phim chất lượng cao", "phim miễn phí 2024", "phim mới nhất",
    "phim bộ Trung Quốc", "phim Hàn Quốc", "phim Thái Lan", "anime vietsub",
    "phim lẻ chiếu rạp", "phim hành động", "phim tình cảm", "phim kinh dị",
    "xem phim online", "phim hay 2024", "phimanhd"
  ],
  metadataBase: new URL("https://rapphimchill.app"),

  // Enhanced Open Graph
  openGraph: {
    title: "Rạp Phim Chill - Kho phim HD chất lượng cao miễn phí",
    description: "Khám phá hơn 50,000+ bộ phim HD chất lượng cao thuộc mọi thể loại. Cập nhật phim mới 2024 hàng ngày, xem miễn phí không quảng cáo.",
    url: "https://rapphimchill.app",
    siteName: "Rạp Phim Chill",
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rạp Phim Chill - Xem phim HD chất lượng cao miễn phí",
      },
    ],
  },

  // Enhanced Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@phimanh",
    title: "Rạp Phim Chill - Xem phim HD chất lượng cao miễn phí",
    description: "Kho phim HD chất lượng cao với hơn 50,000+ bộ phim thuộc mọi thể loại.",
    images: ["/twitter-image.png"],
  },

  // Additional metadata
  applicationName: "Rạp Phim Chill",
  referrer: "origin-when-cross-origin",
  creator: "Rạp Phim Chill Team",
  publisher: "Rạp Phim Chill",
  category: "Entertainment",
  classification: "Movie Streaming Website",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },

  // Additional SEO
  alternates: {
    canonical: "https://rapphimchill.app",
  },

  // Favicon configuration for search engines
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://rapphimchill.app" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              /* Aggressive hydration mismatch prevention */
              *[bis_skin_checked],
              *[__codelineno],
              *[__codelineno_highlight],
              *[data-adblock],
              *[data-adblockkey],
              *[cz-shortcut-listen],
              *[data-gramm_editor],
              *[data-new-gr-c-s-check-loaded],
              *[data-gr-ext-installed],
              *[data-testid],
              *[data-darkreader-inline-bgcolor],
              *[data-darkreader-inline-color],
              *[data-darkreader-inline-border],
              *[data-bitwarden-watching],
              *[data-lastpass-watched] {
                /* Extension attributes - ignore completely */
              }
              
              /* Force consistent rendering regardless of extensions */
              body {
                min-height: 100vh;
                opacity: 0;
                transition: opacity 0.2s ease;
              }
              
              body.hydrated, body.fallback-show {
                opacity: 1;
              }
              
              /* Prevent MUI CssBaseline hydration issues */
              *, *::before, *::after {
                box-sizing: border-box;
              }
              
              /* Force normalize extension interference */
              html {
                line-height: 1.15;
                -webkit-text-size-adjust: 100%;
              }
              
              /* Block extension style injection on critical elements */
              div[data-mui-internal],
              div[class*="MuiCssBaseline"],
              div[style*="display: contents"],
              div[style*="display:contents"] {
                display: contents !important;
              }
            `,
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Initialize theme consistently for SSR/CSR
                  var savedTheme = null;
                  var systemTheme = 'dark';
                  var finalTheme = 'dark'; // Default to dark for cinematic theme
                  
                  // Safely access localStorage
                  if (typeof Storage !== 'undefined' && typeof localStorage !== 'undefined') {
                    try {
                      savedTheme = localStorage.getItem('theme');
                    } catch (e) {
                      // localStorage blocked or not available
                      console.debug('localStorage not accessible:', e);
                    }
                  }
                  
                  // Safely check system preference (but default to dark)
                  if (typeof window !== 'undefined' && window.matchMedia) {
                    try {
                      systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                    } catch (e) {
                      // matchMedia not available
                      console.debug('matchMedia not accessible:', e);
                    }
                  }
                  
                  // Determine final theme with priority: saved > dark (default)
                  finalTheme = savedTheme || 'dark';
                  
                  // Apply dark class (default for cinematic theme)
                  if (finalTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Store the theme decision for React to pick up
                  window.__INITIAL_THEME__ = finalTheme;
                  
                  // Progressive hydration visibility
                  function showContent() {
                    document.body.classList.add('hydrated');
                  }
                  
                  // Show content after DOM is ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      setTimeout(showContent, 50);
                    });
                  } else {
                    setTimeout(showContent, 50);
                  }
                  
                  // Emergency fallback to prevent invisible page
                  setTimeout(function() {
                    if (!document.body.classList.contains('hydrated')) {
                      document.body.classList.add('fallback-show');
                      console.warn('Fallback content display activated');
                    }
                  }, 1500);
                  
                } catch (e) {
                  // Emergency fallback
                  console.error('Theme initialization error:', e);
                  document.body.classList.add('fallback-show');
                  window.__INITIAL_THEME__ = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${beVietnam.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <GTM />
        <EnhancedGTMTracking />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WP2MWVB8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Structured Data */}
        <WebsiteStructuredData url="https://rapphimchill.app" />
        <OrganizationStructuredData url="https://rapphimchill.app" />

        <HydrationFix />
        <MaterialThemeProvider>
          <LoadingProvider>
            <PageTransition>
              {children}
            </PageTransition>
          </LoadingProvider>
        </MaterialThemeProvider>
        {/* Global Sidebar - may be modified by browser extensions */}
        <div id="sidebar-root" suppressHydrationWarning></div>

        {/* PWA & Performance Monitoring */}
        <PWAInstaller />
        <PerformanceMonitor />

        {/* Development Notice Banner */}
        <DevBanner />
      </body>
    </html>
  );
}
