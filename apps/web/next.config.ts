import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  eslint: {
    // Disable ESLint during builds to prevent warnings from blocking production
    ignoreDuringBuilds: true,
  },
  // Test comment to trigger hook
};

export default nextConfig;
