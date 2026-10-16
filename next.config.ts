import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: pages prerender a static shell; anything that reads
  // cookies (the Supabase session) must render inside <Suspense> / loading.tsx.
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
