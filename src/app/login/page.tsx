"use client";

import { login } from "@/lib/api/auth/auth";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const response = await login({
      email,
      password,
    });
    console.log(response)
  }

  return (
    <main>
      <h1>Login</h1>
      <input
        type="email"
        value={email}
        placeholder="メールアドレス"
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        value={password}
        placeholder="パスワード"
        onChange={(event) => setPassword(event.target.value)}
      />

      <button onClick={handleLogin}>Loginボタン</button>
    </main>
  );
}
