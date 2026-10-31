/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve resized AVIF/WebP per screen size instead of the full-size originals
    formats: ['image/avif', 'image/webp'],
    // Our photos are fixed assets, so let the optimised copies stay cached for a month
    minimumCacheTTL: 2678400,
  },
  // Hero videos, posters and photos in public/ are otherwise served with max-age=0, so every visit re-checks them.
  // A week is safe for assets that rarely change; replace a file under a new name if it must update at once
  async headers() {
    const week = { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }
    return [
      { source: '/videos/:path*', headers: [week] },
      { source: '/images/:path*', headers: [week] },
    ]
  },
  // The section was renamed from Experiences to Activities; keep old links and search results working
  async redirects() {
    return [
      { source: '/experiences', destination: '/activities', permanent: true },
      { source: '/experiences/:slug', destination: '/activities/:slug', permanent: true },
      // Parasports no longer has its own page: its activities are on /activities, the mermaid courses on /courses
      { source: '/programmes/parasports', destination: '/activities', permanent: true },
    ]
  },
}

export default nextConfig
