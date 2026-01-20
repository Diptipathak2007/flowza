import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "uploadthing.com" },
      { hostname: "utfs.io" },
      { hostname: "img.clerk.com" },
      { hostname: "files.stripe.com" },
    ],
  },
  reactStrictMode: false,
  transpilePackages: [
    "uploadthing",
    "@uploadthing/react",
    "@uploadthing/mime-types",
    "@uploadthing/shared",
  ],
};

export default nextConfig;
