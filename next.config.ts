import type { NextConfig } from "next";

const configuredApiServerUrl =
  process.env.API_SERVER_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

if (!configuredApiServerUrl) {
  throw new Error(
    "環境変数 API_SERVER_URL にバックエンドAPIのURLを設定してください。",
  );
}

const apiServerUrl = configuredApiServerUrl.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiServerUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
