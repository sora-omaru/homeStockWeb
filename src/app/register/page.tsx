"use client";

import { getMe, register } from "@/lib/api/auth/auth";
import { getRegisterErrorDetails } from "@/lib/api/error/error-register";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./page.module.scss";

type FieldErrors = {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  displayName?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validateForm(): FieldErrors {
    const errors: FieldErrors = {};

    if (!displayName.trim()) {
      errors.displayName = "表示名を入力してください。";
    }

    if (!email.trim()) {
      errors.email = "メールアドレスを入力してください。";
    }

    if (!password) {
      errors.password = "パスワードを入力してください。";
    }

    if (!passwordConfirm) {
      errors.passwordConfirm = "確認用パスワードを入力してください。";
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = "パスワードが一致しません。";
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateForm();
    setFieldErrors(errors);
    setSubmitError(null);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      await register({
        email: email.trim(),
        password,
        passwordConfirm,
        displayName: displayName.trim(),
      });
      await getMe();

      //登録APIで認証Cookieも設定されるため、そのままItem一覧へ移動する
      router.replace("/items");
    } catch (error) {
      const registerError = getRegisterErrorDetails(error);

      if (registerError.field) {
        setFieldErrors({
          [registerError.field]: registerError.message,
        });
        return;
      }

      setSubmitError(registerError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  return (
    <main className={styles.main}>
      <div aria-hidden="true" className={`${styles.glow} ${styles.glowLeft}`} />
      <div
        aria-hidden="true"
        className={`${styles.glow} ${styles.glowRight}`}
      />

      <section className={styles.card}>
        <Link href="/" className={styles.backLink}>
          ← Banana Stock
        </Link>

        <p className={styles.eyebrow}>START YOUR PANTRY</p>
        <h1 className={styles.title}>アカウント登録</h1>
        <p className={styles.description}>
          アカウントを作成して、おうちの在庫管理をはじめましょう。
        </p>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
        >
          <label className={styles.field} htmlFor="display-name">
            表示名
            <input
              id="display-name"
              className={`${styles.input} ${
                fieldErrors.displayName ? styles.inputInvalid : ""
              }`}
              type="text"
              value={displayName}
              placeholder="例：バナナ太郎"
              autoComplete="name"
              required
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.displayName)}
              aria-describedby={
                fieldErrors.displayName ? "display-name-error" : undefined
              }
              onChange={(event) => {
                setDisplayName(event.target.value);
                clearFieldError("displayName");
              }}
            />
            {fieldErrors.displayName && (
              <span
                id="display-name-error"
                className={styles.fieldError}
                role="alert"
              >
                {fieldErrors.displayName}
              </span>
            )}
          </label>

          <label className={styles.field} htmlFor="email">
            メールアドレス
            <input
              id="email"
              className={`${styles.input} ${
                fieldErrors.email ? styles.inputInvalid : ""
              }`}
              type="email"
              value={email}
              placeholder="name@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
            />
            {fieldErrors.email && (
              <span id="email-error" className={styles.fieldError} role="alert">
                {fieldErrors.email}
              </span>
            )}
          </label>

          <div className={styles.passwordGrid}>
            <label className={styles.field} htmlFor="password">
              パスワード
              <input
                id="password"
                className={`${styles.input} ${
                  fieldErrors.password ? styles.inputInvalid : ""
                }`}
                type="password"
                value={password}
                placeholder="パスワードを入力"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                  clearFieldError("passwordConfirm");
                }}
              />
              {fieldErrors.password && (
                <span
                  id="password-error"
                  className={styles.fieldError}
                  role="alert"
                >
                  {fieldErrors.password}
                </span>
              )}
            </label>

            <label className={styles.field} htmlFor="password-confirm">
              パスワード（確認）
              <input
                id="password-confirm"
                className={`${styles.input} ${
                  fieldErrors.passwordConfirm ? styles.inputInvalid : ""
                }`}
                type="password"
                value={passwordConfirm}
                placeholder="もう一度入力"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.passwordConfirm)}
                aria-describedby={
                  fieldErrors.passwordConfirm
                    ? "password-confirm-error"
                    : undefined
                }
                onChange={(event) => {
                  setPasswordConfirm(event.target.value);
                  clearFieldError("passwordConfirm");
                }}
              />
              {fieldErrors.passwordConfirm && (
                <span
                  id="password-confirm-error"
                  className={styles.fieldError}
                  role="alert"
                >
                  {fieldErrors.passwordConfirm}
                </span>
              )}
            </label>
          </div>

          {submitError && (
            <div className={styles.submitError} role="alert">
              <span aria-hidden="true">!</span>
              <p>{submitError}</p>
            </div>
          )}

          <button
            className={styles.submit}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "登録中…" : "アカウントを作成"}
          </button>
        </form>

        <p className={styles.loginPrompt}>
          すでにアカウントをお持ちですか？
          <Link href="/login">ログイン</Link>
        </p>
      </section>
    </main>
  );
}
