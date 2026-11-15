import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@electric-sql/pglite/dist/**/*"],
  },
};

export default nextConfig;
