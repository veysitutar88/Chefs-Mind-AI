/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:5001/socket.io/:path*',
      },
      {
        source: '/metrics',
        destination: 'http://localhost:5001/metrics',
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:5001/auth/:path*',
      },
    ]
  },
}

module.exports = nextConfig
