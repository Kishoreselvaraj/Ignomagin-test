import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Export as static files
  distDir: "out", // Store files in /out directory
  images: {
    unoptimized: true, // Avoids Next.js image optimization issues
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // Allow build even with TypeScript errors
  },
};

export default nextConfig;
