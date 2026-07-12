const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

console.log("API Base URL:", apiBaseUrl);

if (!apiBaseUrl) {
  throw new Error(
    "環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。",
  );
}

export const env = {
  apiBaseUrl,
};