/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 dev resources are protected by origin checks. These are the
  // LAN hostnames from which JobFinder is intentionally opened in development.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "192.168.1.4",
    "192.168.1.5",
  ],
};

module.exports = nextConfig;
