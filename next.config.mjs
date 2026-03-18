/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['playwright-core'],
  },
  async headers() {
    return [
      {
        source: '/skill.md',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
        ],
      },
    ]
  },
}

export default nextConfig
