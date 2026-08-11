/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the dashboard to be opened from localhost and the Raspberry Pi/LAN
  // during development without Next.js blocking its dev resources.
  allowedDevOrigins: [
    "localhost",
    "localhost:3000",
    "localhost:3001",
    "127.0.0.1",
    "127.0.0.1:3000",
    "127.0.0.1:3001",
    "192.168.1.4",
    "192.168.1.4:3000",
    "192.168.1.4:3001",
    "192.168.1.5",
    "192.168.1.5:3000",
    "192.168.1.5:3001",
  ],
};

export default nextConfig;
