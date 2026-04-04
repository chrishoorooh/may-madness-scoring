import os from "node:os";

/** Extra dev origins (comma-separated hostnames/IPs), e.g. ALLOWED_DEV_ORIGINS=192.168.1.5 */
const fromEnv = process.env.ALLOWED_DEV_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean) ?? [];

/** Allow phone/LAN testing without manual config when running `next dev` */
function lanIPv4Hosts() {
  if (process.env.NODE_ENV === "production") return [];
  const hosts = [];
  const nets = os.networkInterfaces();
  for (const infos of Object.values(nets)) {
    if (!infos) continue;
    for (const net of infos) {
      const v4 = net.family === "IPv4" || net.family === 4;
      if (!v4 || net.internal) continue;
      hosts.push(net.address);
    }
  }
  return hosts;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [...fromEnv, ...lanIPv4Hosts()],
};

export default nextConfig;
