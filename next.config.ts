import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true, // This enables .wasm support correctly
    };

    return config;
  },
  reactStrictMode: false,
};

export default nextConfig;
