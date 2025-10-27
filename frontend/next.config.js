/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_STAKING_CONTRACT: process.env.NEXT_PUBLIC_STAKING_CONTRACT,
    NEXT_PUBLIC_SWAP_ROUTER: process.env.NEXT_PUBLIC_SWAP_ROUTER,
    NEXT_PUBLIC_YLS_TOKEN: process.env.NEXT_PUBLIC_YLS_TOKEN,
    NEXT_PUBLIC_OP_MAINNET_RPC: process.env.NEXT_PUBLIC_OP_MAINNET_RPC,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // 🔧 DEPLOYMENT NOTE: Enable SWC minification for better performance
  swcMinify: true,
  // 🔧 DEPLOYMENT NOTE: Optimize images if using Next.js Image component
  images: {
    domains: ['assets.coingecko.com'],
  },
};

module.exports = nextConfig;