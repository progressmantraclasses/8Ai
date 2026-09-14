import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allow importing from workspace packages outside of apps/web */
  transpilePackages: ["@portfolio/shared", "@tanstack/react-table", "@tanstack/table-core"],

  /* Disable x-powered-by header for security */
  poweredByHeader: false,

  /* Enable React strict mode for catching common bugs early */
  reactStrictMode: true,
};

export default nextConfig;
