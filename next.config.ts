import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Expose required envs to the browser by mapping server-only names
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
