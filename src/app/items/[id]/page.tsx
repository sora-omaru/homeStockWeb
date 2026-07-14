"use client";

import { getItem } from "@/lib/api/item";
import type { ItemResponse } from "@/types/item";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./page.module.scss";

function BoxIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 8-9 5-9-5m9 5v9m8-13.5v7a2 2 0 0 1-1 1.73l-6 3.5a2 2 0 0 1-2 0l-6-3.5A2 2 0 0 1 4 15.5v-7a2 2 0 0 1 1-1.73l6-3.5a2 2 0 0 1 2 0l6 3.5a2 2 0 0 1 1 1.73Z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ItemPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={`${styles.glow} ${styles.glowLeft}`} />
      <div aria-hidden="true" className={`${styles.glow} ${styles.glowRight}`} />

      <div className={styles.container}>
        <nav className={styles.nav} aria-label="メインナビゲーション">
          <Link href="/" className={styles.brand}>
            <span className={styles.logo}><BoxIcon className={styles.logoIcon} /></span>
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

function getStockStatus(item: ItemResponse) {
  if (item.quantity === 0) {
    return { label: "在庫なし", className: styles.statusNone };
  }

  if (item.quantity <= item.minQuantity) {
    return { label: "残りわずか", className: styles.statusLow };
  }

  return { label: "在庫あり", className: styles.statusGood };
}

export default function ItemPage() {
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const params = useParams<{ id: string }>();
  const itemId = Number(params.id);
  const isInvalidId = !Number.isInteger(itemId) || itemId <= 0;

  useEffect(() => {
    if (isInvalidId) {
      return;
    }

    const controller = new AbortController();

    async function loadItem() {
      try {
        const response = await getItem(itemId, controller.signal);
        setItem(response);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setErrorMessage("Itemの読み込みに失敗しました");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadItem();
    return () => controller.abort();
  }, [itemId, isInvalidId]);

  async function retryItem() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setItem(await getItem(itemId));
    } catch (error) {
      console.error(error);
      setErrorMessage("Itemの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  if (isInvalidId) {
    return (
      <ItemPageLayout>
        <section className={styles.state}>
          <span className={styles.errorIcon}>!</span>
          <h1 className={styles.stateTitle}>Item IDが正しくありません</h1>
          <p className={styles.stateText}>一覧からItemを選び直してください。</p>
        </section>
      </ItemPageLayout>
    );
  }

  if (isLoading) {
    return (
      <ItemPageLayout>
        <section className={styles.skeleton} aria-label="読み込み中" aria-busy="true">
          <div className={styles.skeletonHeading} />
          <div className={styles.skeletonStock} />
          <div className={styles.skeletonGrid} />
        </section>
      </ItemPageLayout>
    );
  }

  if (errorMessage) {
    return (
      <ItemPageLayout>
        <section className={styles.state}>
          <span className={styles.errorIcon}>!</span>
          <h1 className={styles.stateTitle}>読み込めませんでした</h1>
          <p className={styles.stateText}>{errorMessage}</p>
          <button type="button" onClick={() => void retryItem()} className={styles.retry}>もう一度試す</button>
        </section>
      </ItemPageLayout>
    );
  }

  if (!item) {
    return null;
  }

  const stockStatus = getStockStatus(item);

  return (
    <ItemPageLayout>
      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.identity}>
            <span className={styles.itemIcon}><BoxIcon /></span>
            <div>
              <p className={styles.eyebrow}>{item.category}</p>
              <h1 className={styles.title}>{item.name}</h1>
            </div>
          </div>
          <span className={`${styles.status} ${stockStatus.className}`}>{stockStatus.label}</span>
        </header>

        <section className={styles.stockPanel} aria-label="在庫数">
          <div>
            <p className={styles.stockLabel}>現在の在庫</p>
            <p className={styles.quantity}>{item.quantity}<span>個</span></p>
          </div>
          <p className={styles.minimum}>最低在庫数 <strong>{item.minQuantity}個</strong></p>
        </section>

        <dl className={styles.details}>
          <div className={styles.detailRow}><dt>カテゴリ</dt><dd>{item.category}</dd></div>
          <div className={styles.detailRow}><dt>保管場所</dt><dd>{item.locationName ?? "未設定"}</dd></div>
          <div className={styles.detailRow}><dt>賞味期限</dt><dd>{item.expirationDate ?? "未設定"}</dd></div>
          <div className={`${styles.detailRow} ${styles.memoRow}`}><dt>メモ</dt><dd>{item.memo ?? "なし"}</dd></div>
        </dl>
      </article>
    </ItemPageLayout>
  );
}
