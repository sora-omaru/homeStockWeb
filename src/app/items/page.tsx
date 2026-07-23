"use client";

import { getItems } from "@/lib/api/item";
import { ItemResponse } from "@/types/item";
import Link from "next/link";
import { useEffect, useState } from "react";
import ItemCard from "./itemsCard";
import styles from "./page.module.scss";

function BoxIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 8-9 5-9-5m9 5v9m8-13.5v7a2 2 0 0 1-1 1.73l-6 3.5a2 2 0 0 1-2 0l-6-3.5A2 2 0 0 1 4 15.5v-7a2 2 0 0 1 1-1.73l6-3.5a2 2 0 0 1 2 0l6 3.5a2 2 0 0 1 1 1.73Z"
      />
    </svg>
  );
}

export default function ItemsPage() {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function retryItems() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getItems();
      setItems(response);
    } catch (error) {
      console.error(error);
      setErrorMessage("Item一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    getItems()
      .then((response) => {
        if (isActive) setItems(response);
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isActive) setErrorMessage("Item一覧の取得に失敗しました");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

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
            <span className={styles.brandName}>Banana Stock</span>
          </Link>
          <span className={styles.navBadge}>STOCK MANAGER</span>
        </nav>

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>MY PANTRY</p>
            <h1 className={styles.title}>Item一覧</h1>
            <p className={styles.intro}>
              おうちにあるものを、すっきり見やすく。今の在庫をひと目で確認できます。
            </p>
          </div>
          {!isLoading && !errorMessage && (
            <div className={styles.count}>
              <span className={styles.countNumber}>{items.length}</span>
              <span>アイテム</span>
            </div>
          )}
        </header>

        {isLoading ? (
          <section
            className={styles.grid}
            aria-label="読み込み中"
            aria-busy="true"
          >
            {[0, 1, 2].map((item) => (
              <div key={item} className={styles.skeleton}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonPanel} />
                <div className={styles.skeletonLine} />
              </div>
            ))}
          </section>
        ) : errorMessage ? (
          <section className={styles.state}>
            <span className={styles.errorIcon}>!</span>
            <h2 className={styles.stateTitle}>読み込めませんでした</h2>
            <p className={styles.stateText}>{errorMessage}</p>
            <button onClick={() => void retryItems()} className={styles.retry}>
              もう一度試す
            </button>
          </section>
        ) : items.length === 0 ? (
          <section className={`${styles.state} ${styles.stateEmpty}`}>
            <BoxIcon className={styles.emptyIcon} />
            <h2 className={styles.stateTitle}>Itemはまだありません</h2>
            <p className={styles.stateText}>
              登録すると、ここにカードで表示されます。
            </p>
          </section>
        ) : (
          <section className={styles.grid} aria-label="Item一覧">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
