import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev server access from local network IPs
  allowedDevOrigins: ['192.168.8.131', 'localhost', '127.0.0.1'],

  // Turbopack performance settings
  turbopack: {
    root: __dirname,
  },

  // Reduce image optimization overhead in development
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Disable source maps in dev for faster builds (optional — comment out if you need stack traces)
  // productionBrowserSourceMaps: false,
};

export default nextConfig;
