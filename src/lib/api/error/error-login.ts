import { ApiError } from "@/lib/api/error/api-error";
import { ErrorCode } from "@/lib/api/error/errocode";

const defaultLoginErrorMessage =
  "ログインに失敗しました。時間をおいて再度お試しください。";

export function getLoginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    const detail =
      error instanceof Error ? error.message : "ApiError以外の不明なエラー";

    return `${defaultLoginErrorMessage} [一時デバッグ: ${detail}]`;
  }

  const debugDetails = `status=${error.status}, code=${error.code}, message=${error.message || "なし"}`;

  if (
    error.code === ErrorCode.LOGIN_FAILED ||
    error.code === ErrorCode.USER_NOT_FOUND
  ) {
    const message =
      error.message || "メールアドレスまたはパスワードが違います。";

    return `${message} [一時デバッグ: ${debugDetails}]`;
  }

  const message = error.message || defaultLoginErrorMessage;
  return `${message} [一時デバッグ: ${debugDetails}]`;
}
