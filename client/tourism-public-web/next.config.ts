import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5266",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "7110",
      },
    ],
  },
};

export default nextConfig;
