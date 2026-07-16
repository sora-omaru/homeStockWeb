"use client";

import { getItem, updateItem } from "@/lib/api/item";
import type { ItemResponse } from "@/types/item";
import type { ItemCategory } from "@/types/item-category";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState, type ReactNode } from "react";
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

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ItemPageLayout({ children }: { children: ReactNode }) {
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
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [minQuantity, setMinQuantity] = useState(0);
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [locationId, setLocationId] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [memo, setMemo] = useState("");

  const params = useParams<{ id: string }>();
  const itemId = Number(params.id);
  const isInvalidId = !Number.isInteger(itemId) || itemId <= 0;

  const applyItemForm = useCallback((response: ItemResponse) => {
    setItem(response);

    setName(response.name);
    setQuantity(response.quantity);
    setMinQuantity(response.minQuantity);
    setCategory(response.category);
    setLocationId(response.locationId);
    setLocationName(response.locationName ?? "");
    setExpirationDate(response.expirationDate?.split("T")[0] ?? "");
    setMemo(response.memo ?? "");
  }, []);

  useEffect(() => {
    if (isInvalidId) {
      return;
    }
    const controller = new AbortController();

    async function loadItem() {
      try {
        const response = await getItem(itemId, controller.signal);
        applyItemForm(response);
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
  }, [applyItemForm, itemId, isInvalidId]);

  async function retryItem() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getItem(itemId);
      applyItemForm(response);
    } catch (error) {
      console.error(error);
      setErrorMessage("Itemの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!category) {
      setErrorMessage("カテゴリーを選択してください");
      return;
    }

    try {
      const response = await updateItem(itemId, {
        name,
        quantity,
        minQuantity,
        category,
        locationId: null,
        expirationDate: expirationDate || null,
        memo: memo || null,
      });
      applyItemForm(response);
    } catch (error) {
      console.error(error);
      setErrorMessage("Itemの更新に失敗しました");
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
        <section
          className={styles.skeleton}
          aria-label="読み込み中"
          aria-busy="true"
        >
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
          <button
            type="button"
            onClick={() => void retryItem()}
            className={styles.retry}
          >
            もう一度試す
          </button>
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
      <form className={styles.card} onSubmit={handleSubmit}>
        <header className={styles.cardHeader}>
          <div className={styles.identity}>
            <span className={styles.itemIcon}>
              <BoxIcon />
            </span>
            <div>
              <p className={styles.eyebrow}>{item.category}</p>
              <label htmlFor="item-name">Itemの名前</label>
              <input
                id="item-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>
          <span className={`${styles.status} ${stockStatus.className}`}>
            {stockStatus.label}
          </span>
        </header>

        <section className={styles.stockPanel} aria-label="在庫数">
          <div>
            <label htmlFor="quantity" className={styles.stockLabel}>
              現在の在庫
            </label>
            <input
              id="quantity"
              className={styles.quantity}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <label htmlFor="minQuantity" className={styles.minimum}>
            最低在庫数 <strong>{item.minQuantity}個</strong>
          </label>
          <input
            id="minQuantity"
            className={styles.minQuantity}
            type="number"
            value={minQuantity}
            onChange={(e) => setMinQuantity(Number(e.target.value))}
          ></input>
        </section>

        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt>
              <label htmlFor="item-category">カテゴリ</label>
            </dt>
            <dd>
              <select
                id="item-category"
                className={styles.formControl}
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
              >
                <option value="">--1つ選択してください--</option>
                <option value="FOOD">食品</option>
                <option value="DRINK">飲み物</option>
                <option value="DAILY_GOODS">日用品</option>
                <option value="SEASONING">調味料</option>
                <option value="MEDICINE">医薬品</option>
                <option value="OTHER">その他</option>
              </select>
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt>
              <label htmlFor="item-location">保管場所</label>
            </dt>
            <dd>
              <input
                id="item-location"
                className={styles.formControl}
                type="text"
                value={locationName}
                placeholder="例: キッチンの棚"
                onChange={(event) => setLocationName(event.target.value)}
                readOnly
              />
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt>
              <label htmlFor="item-expiration-date">賞味期限</label>
            </dt>
            <dd>
              <input
                id="item-expiration-date"
                className={styles.formControl}
                type="date"
                value={expirationDate}
                onChange={(event) => setExpirationDate(event.target.value)}
              />
            </dd>
          </div>
          <div className={`${styles.detailRow} ${styles.memoRow}`}>
            <dt>
              <label htmlFor="item-memo">メモ</label>
            </dt>
            <dd>
              <textarea
                id="item-memo"
                className={`${styles.formControl} ${styles.memoInput}`}
                value={memo}
                placeholder="Itemについてのメモ"
                rows={4}
                onChange={(event) => setMemo(event.target.value)}
              />
            </dd>
          </div>
        </dl>
        <button type="submit">更新する</button>
      </form>
    </ItemPageLayout>
  );
}
