import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      tap: false,
      tape: false,
      "why-is-node-running": false,
    };
    return config;
  },
};

export default nextConfig;
