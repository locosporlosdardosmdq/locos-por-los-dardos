/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true, // Compresión Gzip/Brotli automática para respuestas serverless y APIs
  images: {
    unoptimized: true, // Servir imágenes estáticas 100% por CDN sin gastar cómputo serverless de origen
  },
};

export default nextConfig;
