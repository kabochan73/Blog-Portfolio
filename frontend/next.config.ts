import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railwayの本番Dockerfile(frontend/Dockerfile.railway)がstandaloneビルド前提のため
  output: "standalone",
};

export default nextConfig;
