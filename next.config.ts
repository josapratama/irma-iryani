import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

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

  // ── API rewrites — proxy /api/* ke backend (berguna di production) ────────
  // Dengan ini frontend bisa fetch ke /api/certificates langsung
  // tanpa hardcode URL backend di setiap komponen
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },

  // ── Images — izinkan semua hostname untuk public folder ──────────────────
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
