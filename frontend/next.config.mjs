const configuredMediaUrl =
  process.env.MEDIA_BASE_URL ||
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const resolveMediaUrl = () => {
  try {
    return new URL(configuredMediaUrl);
  } catch {
    return new URL("http://localhost:5000");
  }
};

const mediaUrl = resolveMediaUrl();
const mediaHostname = mediaUrl.hostname.toLowerCase();
const allowLocalIpOptimization =
  LOCAL_HOSTNAMES.has(mediaHostname) ||
  mediaHostname.startsWith("10.") ||
  mediaHostname.startsWith("192.168.") ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(mediaHostname);

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: mediaUrl.protocol.replace(":", ""),
        hostname: mediaUrl.hostname,
        port: mediaUrl.port,
        pathname: "/uploads/**",
      },
    ],
    dangerouslyAllowLocalIP: allowLocalIpOptimization,
  },
};

export default nextConfig;
