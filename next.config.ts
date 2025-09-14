import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/game',
  assetPrefix: '/game',
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
