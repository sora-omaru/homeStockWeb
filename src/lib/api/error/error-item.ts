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

const defaultDeleteErrorMessage =
  "商品の削除に失敗しました。時間をおいて再度お試しください。";

export function getItemDeleteErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return defaultDeleteErrorMessage;

  // if (error.code === ErrorCode.ITEM_NOT_FOUND) {
  //   // return error.message || "商品無し。";
  // }

  return error.message || defaultDeleteErrorMessage;
}
