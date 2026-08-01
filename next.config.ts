import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita el bucle de pánico/OOM de Turbopack con caché persistente corrupta
  // ("Every task must have a task type"). Ver next.js#96092.
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
