import type { NextConfig } from "next";

/**
 * Dua variabel berbeda untuk dua keperluan berbeda:
 *
 * NEXT_PUBLIC_API_URL      → dipakai di browser (lib/api.ts)
 *                            Contoh: "http://localhost:3001/api"
 *
 * BACKEND_INTERNAL_URL     → dipakai Next.js server untuk rewrites
 *                            Contoh: "http://localhost:3001" (tanpa /api)
 *                            Kalau tidak diset, rewrites tidak aktif.
 *
 * Dengan pemisahan ini fetch di lib/api.ts tidak loop ke dirinya sendiri.
 */
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL;

const nextConfig: NextConfig = {
  // ── Turbopack — alias canvas untuk pdfjs-dist ────────────────────────────
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./empty.js" },
    },
  },

  // ── Webpack fallback ─────────────────────────────────────────────────────
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },

  // ── API rewrites — hanya aktif jika BACKEND_INTERNAL_URL dikonfigurasi ──
  // Berguna di production/staging agar frontend dan backend bisa beda port
  // tanpa CORS issue. Di development biasanya tidak perlu karena browser
  // fetch langsung ke NEXT_PUBLIC_API_URL.
  ...(BACKEND_INTERNAL_URL
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${BACKEND_INTERNAL_URL}/api/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
