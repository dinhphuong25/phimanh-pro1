export default function robots() {
  const baseUrl = process.env.BASE_URL || "https://rapphimchill.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/private/",
          "/*.json$",
          "/*.xml$",
        ],
      },
      // Block AI/ML Bots
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "Claude-Web", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "Cohere-AI", disallow: "/" },
      // Block Scrapers
      { userAgent: "HTTrack", disallow: "/" },
      { userAgent: "WebCopier", disallow: "/" },
      { userAgent: "Offline Explorer", disallow: "/" },
      { userAgent: "SiteSnagger", disallow: "/" },
      { userAgent: "TeleportPro", disallow: "/" },
      { userAgent: "WebZIP", disallow: "/" },
      { userAgent: "Teleport", disallow: "/" },
      { userAgent: "WebStripper", disallow: "/" },
      { userAgent: "WebCapture", disallow: "/" },
      { userAgent: "Wget", disallow: "/" },
      { userAgent: "curl", disallow: "/" },
      // Block SEO Crawlers
      { userAgent: "AhrefsBot", disallow: "/" },
      { userAgent: "SemrushBot", disallow: "/" },
      { userAgent: "MJ12bot", disallow: "/" },
      { userAgent: "DotBot", disallow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
