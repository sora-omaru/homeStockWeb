import { ApiError } from "@/lib/api/error/api-error";
import { ErrorCode } from "@/lib/api/error/errocode";

const defaultRegisterErrorMessage =
  "アカウント登録に失敗しました。時間をおいて再度お試しください。";

export type RegisterErrorDetails = {
  field: "email" | "passwordConfirm" | null;
  message: string;
};

//APIエラーを登録画面で表示する入力欄とメッセージへ変換する
export function getRegisterErrorDetails(error: unknown): RegisterErrorDetails {
  if (!(error instanceof ApiError)) {
    return {
      field: null,
      message: defaultRegisterErrorMessage,
    };
  }

  if (error.code === ErrorCode.EMAIL_ALREADY_EXISTS) {
    return {
      field: "email",
      message:
        error.message || "このメールアドレスは既に登録されています。",
    };
  }

  if (error.code === ErrorCode.PASSWORD_MISMATCH) {
    return {
      field: "passwordConfirm",
      message: error.message || "確認用パスワードが一致しません。",
    };
  }

  return {
    field: null,
    message: error.message || defaultRegisterErrorMessage,
  };
}
