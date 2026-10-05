import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The homepage animations were written without StrictMode's double effects.
  reactStrictMode: false,
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) }
};

export default nextConfig;
