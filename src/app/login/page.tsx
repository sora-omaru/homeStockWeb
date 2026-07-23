"use client";

import { getMe, login } from "@/lib/api/auth/auth";
import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await login({ email, password });
    await getMe();

    router.push("/items");
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

        <form className={styles.form} onSubmit={handleLogin}>
          <label className={styles.field}>
            メールアドレス
            <input
              className={styles.input}
              type="email"
              value={email}
              placeholder="name@example.com"
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className={styles.submit} type="submit">
            ログイン
          </button>
        </form>
      </section>
    </main>
  );
}
