/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve resized AVIF/WebP per screen size instead of the full-size originals
    formats: ['image/avif', 'image/webp'],
    // Our photos are fixed assets, so let the optimised copies stay cached for a month
    minimumCacheTTL: 2678400,
  },
}

export default nextConfig
