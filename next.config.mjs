/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the dashboard to be opened from localhost and the Raspberry Pi/LAN
  // during development without Next.js blocking its dev resources.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.4",
    "192.168.1.5",
  ],
};

export default nextConfig;
