import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Presigned R2 thumbnail URLs — use unoptimized on <Image> (URLs expire).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
