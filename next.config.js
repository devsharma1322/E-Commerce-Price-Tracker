/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['mongoose'],
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'm.media-amazon.com',
        },
      ],
      qualities: [75, 100],
    }
  }
  
  module.exports = nextConfig