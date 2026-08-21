/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  images: {
    domains: ['localhost', 'supabase.co', 'img.youtube.com', 'i.ytimg.com', 'upload.wikimedia.org'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999',
    NEXT_PUBLIC_CLINIC_LAT: process.env.NEXT_PUBLIC_CLINIC_LAT || '28.6139',
    NEXT_PUBLIC_CLINIC_LNG: process.env.NEXT_PUBLIC_CLINIC_LNG || '77.2090',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig