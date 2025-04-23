/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Allow image optimization from certain domains if needed
  images: {
    domains: ['cdn.example.com'],
  },
  // Enable trailing slashes for consistent URLs
  trailingSlash: true,
  // Environment variables available in the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  // Custom webpack configuration
  webpack: (config, { isServer }) => {
    // MJML requires specific handling in webpack
    config.module.rules.push({
      test: /\.mjml$/,
      use: [
        {
          loader: 'mjml-loader',
        },
      ],
    });
    
    return config;
  },
}

module.exports = nextConfig
