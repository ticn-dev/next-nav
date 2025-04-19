import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  experimental: {
    nodeMiddleware: true,
  }
};

export default nextConfig;
