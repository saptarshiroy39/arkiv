import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["*.devtunnels.ms", "*.ngrok-free.app"],
};

export default nextConfig;
