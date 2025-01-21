// next.config.js
/** @type {import('next/config').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  transpilePackages: ['react-image-crop']
}

module.exports = nextConfig