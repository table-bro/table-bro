import type {NextConfig} from 'next';

// A static export: the build renders the page with its prerendered table. The server entry of the skin renders the
// components of MUI by react-dom/server, so Node takes it and its libraries as they are, not the bundle of Next.js
const config: NextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: process.env.BASE_PATH ?? '',
  trailingSlash: true,
  serverExternalPackages: ['@table-bro/core', '@table-bro/react-mui', 'linkedom']
};

export default config;
