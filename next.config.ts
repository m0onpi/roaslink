import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ 
  transpilePackages: ['three'],
  
  async headers() {
    return [
      {
        source: '/api/tracking/data',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};

export default nextConfig;
