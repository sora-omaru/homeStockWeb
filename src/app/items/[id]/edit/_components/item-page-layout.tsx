import Link from "next/link";
import type { ReactNode } from "react";
import styles from "../page.module.scss";
import { ArrowLeftIcon, BoxIcon } from "./icons";

export function ItemPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={`${styles.glow} ${styles.glowLeft}`} />
      <div
        aria-hidden="true"
        className={`${styles.glow} ${styles.glowRight}`}
      />

      <div className={styles.container}>
        <nav className={styles.nav} aria-label="メインナビゲーション">
          <Link href="/" className={styles.brand}>
            <span className={styles.logo}>
              <BoxIcon className={styles.logoIcon} />
            </span>
            <span className={styles.brandName}>Home Stock</span>
          </Link>
          <span className={styles.navBadge}>ITEM DETAIL</span>
        </nav>

        <Link href="/items" className={styles.backLink}>
          <ArrowLeftIcon />
          Item一覧へ戻る
        </Link>

        {children}
      </div>
    </main>
  );
}
