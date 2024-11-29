const withPWA = require('next-pwa')({
  disable: 'prod' ? false : true,
  dest: 'public', // Destination for service worker and assets
  register: true, // Automatically register the service worker
  skipWaiting: true, // Activate new service worker immediately
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Use SWC for faster builds and minification
};

module.exports = withPWA(nextConfig);
