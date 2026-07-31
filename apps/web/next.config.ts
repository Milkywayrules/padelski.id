import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@padelski/ui", "@padelski/domain", "@padelski/env"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
