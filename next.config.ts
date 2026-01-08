/** @type {import('next').NextConfig} */

const nextConfig = {
     experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true
  },
    images: {
        domains : [
            "res.cloudinary.com",
            "source.unsplash.com",
            "images.unsplash.com",
            "images.pexels.com",
            "lh3.googleusercontent.com"
        ],
        minimumCacheTTL: 60 * 60 * 24 * 365, 
    }
}

module.exports = nextConfig

