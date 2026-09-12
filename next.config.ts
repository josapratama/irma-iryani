import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (default Next.js 16) — alias canvas ke false agar pdfjs-dist tidak error
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./empty.js" },
    },
  },
  // Webpack fallback (dipakai saat `next dev --webpack` atau `next build --webpack`)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
