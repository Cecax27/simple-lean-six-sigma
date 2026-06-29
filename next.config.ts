import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/editor",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
