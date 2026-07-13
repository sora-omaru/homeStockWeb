import Link from "next/link";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <div aria-hidden="true" className={`${styles.glow} ${styles.glowFirst}`} />
      <div aria-hidden="true" className={`${styles.glow} ${styles.glowSecond}`} />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>HOME STOCK</p>
        <h1 className={styles.title}>
          おうちの在庫を、<br />もっと心地よく。
        </h1>
        <p className={styles.description}>
          食品や日用品のストックを、やさしい一覧画面でまとめて管理。買い忘れも、買いすぎも減らせます。
        </p>
        <div className={styles.actions}>
          <Link href="/items" className={`${styles.button} ${styles.buttonPrimary}`}>
            Item一覧を見る
          </Link>
          <Link href="/login" className={`${styles.button} ${styles.buttonSecondary}`}>
            ログイン
          </Link>
        </div>
      </section>
    </main>
  );
}
