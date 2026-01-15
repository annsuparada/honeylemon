/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'img.daisyui.com', 'images.unsplash.com'],
    unoptimized: true,
  },
}

export default nextConfig;
