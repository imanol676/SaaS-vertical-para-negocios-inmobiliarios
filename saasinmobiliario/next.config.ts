import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // Security: hide Next.js powered-by header
  reactStrictMode: true, // Help catch bugs
  compress: true, // Enable gzip compression
};

export default nextConfig;
