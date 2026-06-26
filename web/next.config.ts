import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const internalApiUrl =
  process.env.INTERNAL_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8003";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: rootDir,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${internalApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
