"use client";

import { getMe, login } from "@/lib/api/auth/auth";
import { getLoginErrorMessage } from "@/lib/api/error/error-login";
import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitError(null);
      setIsSubmitting(true);

      await login({ email: email.trim(), password });
      await getMe();

      router.push("/items");
    } catch (error) {
      setSubmitError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <Link href="/" className={styles.backLink}>
          ← Banana Stock
        </Link>
        <p className={styles.eyebrow}>WELCOME BACK</p>
        <h1 className={styles.title}>ログイン</h1>
        <p className={styles.description}>おうちのストックを確認しましょう。</p>

        <form
          className={styles.form}
          onSubmit={handleLogin}
          aria-busy={isSubmitting}
        >
          <label className={styles.field}>
            メールアドレス
            <input
              className={styles.input}
              type="email"
              value={email}
              placeholder="name@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting}
              aria-invalid={Boolean(submitError)}
              aria-describedby={submitError ? "login-error" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                setSubmitError(null);
              }}
            />
          </label>
          <label className={styles.field}>
            パスワード
            <input
              className={styles.input}
              type="password"
              value={password}
              placeholder="パスワードを入力"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              aria-invalid={Boolean(submitError)}
              aria-describedby={submitError ? "login-error" : undefined}
              onChange={(event) => {
                setPassword(event.target.value);
                setSubmitError(null);
              }}
            />
          </label>

          {submitError && (
            <div id="login-error" className={styles.submitError} role="alert">
              <span aria-hidden="true">!</span>
              <p>{submitError}</p>
            </div>
          )}

          <button
            className={styles.submit}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "ログイン中…" : "ログイン"}
          </button>
        </form>
        <p className={styles.registerPrompt}>
          はじめてご利用ですか？
          <Link href="/register">アカウントを作成</Link>
        </p>
      </section>
    </main>
  );
}
