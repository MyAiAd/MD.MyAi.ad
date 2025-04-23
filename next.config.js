/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Allow image optimization from certain domains if needed
  images: {
    domains: ['cdn.example.com'],
  },
  // API routes that don't require additional configuration can be handled by Next.js automatically
  // For complex API routes with larger payloads, we can increase the body parser size
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Enable trailing slashes for consistent URLs
  trailingSlash: true,
  // Environment variables that should be available in the browser
  // (only needed if you want to expose some env vars to the browser)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Custom webpack configuration if needed
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
