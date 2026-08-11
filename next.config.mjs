/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js dev resources are protected by origin checks. Keep the list to
  // hostnames only; Next.js handles the active dev-server port separately.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "192.168.1.4",
    "192.168.1.5",
  ],
};

export default nextConfig;
