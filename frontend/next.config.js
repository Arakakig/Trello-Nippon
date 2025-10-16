/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Gera build estático
  images: {
    unoptimized: true, // Necessário para export estático
  },
  // Remove trailing slash para compatibilidade
  trailingSlash: true,
}

module.exports = nextConfig

