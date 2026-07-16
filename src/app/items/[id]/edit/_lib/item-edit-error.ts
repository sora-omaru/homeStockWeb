import { ApiError } from "@/lib/api/error/api-error";
import { ErrorCode } from "@/lib/api/error/errocode";

const defaultUpdateErrorMessage =
  "Itemの更新に失敗しました。時間をおいて再度お試しください。";

export function getItemUpdateErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return defaultUpdateErrorMessage;

  if (error.code === ErrorCode.ITEM_ALREADY_EXISTS) {
    return error.message || "同じ名前のItemがすでに存在します。";
  }

  return error.message || defaultUpdateErrorMessage;
}
