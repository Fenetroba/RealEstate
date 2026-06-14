import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev server access from local network IPs
  allowedDevOrigins: ['192.168.8.131', '192.168.8.132', 'localhost', '127.0.0.1'],

  // Turbopack settings (only supported keys)
  turbopack: {
    root: __dirname,
  },

  // Skip image optimization in dev (faster builds)
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
