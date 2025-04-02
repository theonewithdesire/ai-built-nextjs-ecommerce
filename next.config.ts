import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverComponents: {
    externalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;
