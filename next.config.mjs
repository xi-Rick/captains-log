import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pwa: {
    dest: 'public', // Make sure to include the correct PWA configuration
    register: true,  // Optional: Registers the service worker
    skipWaiting: true, // Optional: Forces the service worker to take control of the page immediately
  },
};

export default withPWA(nextConfig);
