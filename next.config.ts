import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

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

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzer(nextConfig);
