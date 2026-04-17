import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // 2 MB file uploads need extra room for multipart form overhead.
      bodySizeLimit: "3mb",
    },
    optimizePackageImports: [
      "date-fns",
      "react-day-picker",
      "@dnd-kit/core",
      "@dnd-kit/utilities",
    ],
  },
};

export default nextConfig;
