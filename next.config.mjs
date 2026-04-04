import os from "node:os";

/**
 * Extra dev hostnames for Next.js cross-site dev checks (RSC / _next chunks on a phone).
 * Comma-separated: bare host or full URL, e.g. `192.168.7.29` or `http://192.168.7.29:3000`
 */
const fromEnv =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((s) => {
      const t = s.trim();
      if (!t) return null;
      try {
        if (t.includes("://")) return new URL(t).hostname;
      } catch {
        /* ignore */
      }
      return t.replace(/^https?:\/\//i, "").split("/")[0]?.split(":")[0] || t;
    })
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
  async headers() {
    return [
      {
        source: "/login",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
