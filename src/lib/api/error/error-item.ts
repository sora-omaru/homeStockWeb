import { ApiError } from "@/lib/api/error/api-error";
import { ErrorCode } from "@/lib/api/error/errocode";

const defaultCreateErrorMessage =
  "商品の作成に失敗しました。時間をおいて再度お試しください。";

export function getItemCreateErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return defaultCreateErrorMessage;

  if (error.code === ErrorCode.ITEM_ALREADY_EXISTS) {
    return error.message || "同じ商品がすでに存在します。";
  }

  return error.message || defaultCreateErrorMessage;
}
