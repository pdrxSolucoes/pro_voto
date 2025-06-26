/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable Server Components
  experimental: {
    serverActions: true,
  },
  // Add env variables that should be accessible on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'mysql': 'commonjs mysql',
        'mysql2': 'commonjs mysql2',
        'pg-native': 'commonjs pg-native',
        'sqlite3': 'commonjs sqlite3',
        'better-sqlite3': 'commonjs better-sqlite3',
        'mssql': 'commonjs mssql',
        'oracledb': 'commonjs oracledb',
        'redis': 'commonjs redis',
        'ioredis': 'commonjs ioredis',
        'mongodb': 'commonjs mongodb',
        'hdb-pool': 'commonjs hdb-pool',
        '@sap/hana-client': 'commonjs @sap/hana-client',
        '@sap/hana-client/extension/Stream': 'commonjs @sap/hana-client/extension/Stream',
        'typeorm-aurora-data-api-driver': 'commonjs typeorm-aurora-data-api-driver',
        'react-native-sqlite-storage': 'commonjs react-native-sqlite-storage',
        'sql.js': 'commonjs sql.js',
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }

    return config;
  },
  // Configure redirects if needed
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
