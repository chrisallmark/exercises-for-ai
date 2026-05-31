/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "live.staticflickr.com" },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ["marked"],
};

export default nextConfig;
