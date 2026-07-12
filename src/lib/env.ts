
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if(!apiBaseUrl){
    throw new Error("環境変数NEXT_PUBLIC_API_URLが設定されていません")

}
export const env = {
    apiBaseUrl,
};