"use client";

import { getItems } from "@/lib/api/item";
import { ItemCategory } from "@/types/item-category";
import { ItemResponse } from "@/types/item";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";

const categoryLabels: Record<ItemCategory, string> = {
  FOOD: "食品",
  DRINK: "飲料",
  DAILY_GOODS: "日用品",
  SEASONING: "調味料",
  MEDICINE: "医薬品",
  OTHER: "その他",
};

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

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
      />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v4m8-4v4M3 10h18" />
    </svg>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function ItemCard({ item }: { item: ItemResponse }) {
  const isOutOfStock = item.quantity === 0;
  const isLowStock = item.quantity > 0 && item.quantity <= item.minQuantity;
  const targetQuantity = Math.max(item.minQuantity * 2, item.quantity, 1);
  const stockPercentage = Math.min((item.quantity / targetQuantity) * 100, 100);

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.itemIdentity}>
          <span className={styles.itemIcon}>
            <BoxIcon className={styles.itemIconSvg} />
          </span>
          <div className={styles.itemText}>
            <p className={styles.category}>{categoryLabels[item.category]}</p>
            <h2 className={styles.itemName} title={item.name}>
              {item.name}
            </h2>
          </div>
        </div>
        <span
          className={`${styles.status} ${
            isLowStock ? styles.statusLow : styles.statusGood
          }`}
        >
          {isOutOfStock ? "在庫なし" : isLowStock ? "残りわずか" : "在庫あり"}
        </span>
      </div>

      <div className={styles.stockPanel}>
        <div className={styles.stockTop}>
          <div>
            <p className={styles.stockLabel}>現在の在庫</p>
            <p className={styles.quantity}>
              {item.quantity}
              <span className={styles.unit}>個</span>
            </p>
          </div>
          <p className={styles.minimum}>
            最低在庫 <strong>{item.minQuantity}個</strong>
          </p>
        </div>
        <div className={styles.progress}>
          <div
            className={`${styles.progressBar} ${isLowStock ? styles.progressBarLow : styles.progressBarGood}`}
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
      </div>

      <div className={styles.meta}>
        <p className={styles.metaRow}>
          <span className={styles.metaIcon}>
            <LocationIcon />
          </span>
          <span>{item.locationName ?? "保管場所 未設定"}</span>
        </p>
        <p className={styles.metaRow}>
          <span className={styles.metaIcon}>
            <CalendarIcon />
          </span>
          <span>
            {item.expirationDate
              ? `期限 ${formatDate(item.expirationDate)}`
              : "期限 未設定"}
          </span>
        </p>
      </div>
    </article>
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
            <span className={styles.brandName}>Home Stock</span>
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
