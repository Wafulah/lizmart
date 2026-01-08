/** @type {import('next').NextConfig} */

const nextConfig = {
     experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true
  },
    images: {
        unoptimized: true, // External CDNs handle optimization (Cloudinary, Unsplash, etc.)
        domains : [
            "res.cloudinary.com",
            "source.unsplash.com",
            "images.unsplash.com",
            "images.pexels.com",
            "lh3.googleusercontent.com"
        ]
    }
}

module.exports = nextConfig

