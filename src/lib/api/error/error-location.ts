import { ApiError } from "@/lib/api/error/api-error";
import { ErrorCode } from "@/lib/api/error/errocode";

const defaultCreateErrorMessage =
  "保管場所の作成に失敗しました。時間をおいて再度お試しください。";

export function getLocationCreateErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return defaultCreateErrorMessage;

  if (error.code === ErrorCode.LOCATION_ALREADY_EXISTS) {
    return error.message || "同じ保管場所がすでに存在します。";
  }

  return error.message || defaultCreateErrorMessage;
}

const defaultDeleteErrorMessage =
  "保存場所の削除に失敗しました。時間をおいて再度お試しください。";

export function getLocationDeleteErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return defaultDeleteErrorMessage;

  // if (error.code === ErrorCode.ITEM_NOT_FOUND) {
  //   // return error.message || "商品無し。";
  // }

  return error.message || defaultDeleteErrorMessage;
}
