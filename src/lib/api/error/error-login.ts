import { ApiError } from "@/lib/api/error/api-error";
import { ErrorCode } from "@/lib/api/error/errocode";

const defaultLoginErrorMessage =
  "ログインに失敗しました。時間をおいて再度お試しください。";

export function getLoginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return defaultLoginErrorMessage;

  if (
    error.code === ErrorCode.LOGIN_FAILED ||
    error.code === ErrorCode.USER_NOT_FOUND
  ) {
    return error.message || "メールアドレスまたはパスワードが違います。";
  }

  return error.message || defaultLoginErrorMessage;
}
