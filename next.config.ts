import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variable handling
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Enable compression in production
    compress: true,
    
    // Optimize bundle size
    swcMinify: true,
    
    // Production-specific headers
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
          ],
        },
      ];
    },
  }),
  
  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: true,
  },
};

export default nextConfig;
