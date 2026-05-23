import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16 — top-level config
  turbopack: {
    resolveAlias: {},
  },
  // Allow external images if needed later
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
