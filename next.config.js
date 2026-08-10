/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the Next.js dev server to serve HMR/static resources when
  // the app is opened from another device on the local network.
  allowedDevOrigins: ["192.168.1.4", "localhost"],
};

module.exports = nextConfig;
