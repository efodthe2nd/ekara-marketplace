// next.config.js
/** @type {import('next/config').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['react-image-crop']
}

module.exports = nextConfig