// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   allowedDevOrigins: ['192.168.8.129'],
// };

// export default nextConfig;

import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.8.131'],
  turbopack: {
    root: __dirname,
  },
};
export default nextConfig;