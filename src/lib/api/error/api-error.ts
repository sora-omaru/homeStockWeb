export type ApiErrorResponse = {
  code: string;
  message: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number, //HTTPステータスコード
    public readonly code: string, //バックエンドのエラーコード
    message: string, //ユーザーに表示できるエラーメッセージ
  ) {
    super(message);
    this.name = "ApiError";
  }
}
