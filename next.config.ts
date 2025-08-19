import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ 
  transpilePackages: ['three'],
  
  // Prevent trailing slash redirects that can cause CORS issues
  trailingSlash: false,
  
  // CORS is now handled dynamically in the API routes
  // Removed static headers to prevent conflicts
};

export default nextConfig;
