// next.config.js
/** @type {import('next/config').NextConfig} */
const nextConfig = {
  images: {

    deviceSizes: [96, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a7aqvftwvejxynuo.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    minimumCacheTTL: 60, 
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  transpilePackages: ['react-image-crop']
}

module.exports = nextConfig