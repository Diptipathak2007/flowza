import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "uploadthing.com" },
      { hostname: "utfs.io" },
      { hostname: "img.clerk.com" },
      { hostname: "files.stripe.com" },
      { hostname: "*.ufs.sh" },
      { hostname: "ufs.sh" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },

  reactStrictMode: false,
};

export default nextConfig;
