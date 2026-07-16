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

function getStockStatus(quantity: number, minQuantity: number) {
  if (quantity === 0) {
    return { label: "在庫なし", className: styles.statusNone };
  }

  if (quantity <= minQuantity) {
    return { label: "残りわずか", className: styles.statusLow };
  }

  return { label: "在庫あり", className: styles.statusGood };
}

export default function ItemPage() {
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    setSubmitError(null);
    setSuccessMessage(null);

    if (!category) {
      setSubmitError("カテゴリーを選択してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateItem(itemId, {
        name,
        quantity,
        minQuantity,
        category,
        locationId,
        expirationDate: expirationDate || null,
        memo: memo || null,
      });
      applyItemForm(response);
      setSuccessMessage("Itemを更新しました");
    } catch (error) {
      console.error(error);
      setSubmitError(
        "Itemの更新に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
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

  const stockStatus = getStockStatus(quantity, minQuantity);

  return (
    <ItemPageLayout>
      <form className={styles.card} onSubmit={handleSubmit}>
        <header className={styles.cardHeader}>
          <div className={styles.identity}>
            <span className={styles.itemIcon}>
              <BoxIcon />
            </span>
            <div className={styles.identityText}>
              <p className={styles.eyebrow}>ITEM EDIT</p>
              <label className={styles.fieldLabel} htmlFor="item-name">
                Itemの名前
              </label>
              <input
                id="item-name"
                className={styles.nameInput}
                type="text"
                value={name}
                required
                autoComplete="off"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>
          <span className={`${styles.status} ${stockStatus.className}`}>
            {stockStatus.label}
          </span>
        </header>

        <section className={styles.stockPanel} aria-label="在庫数">
          <div className={styles.stockField}>
            <label htmlFor="quantity" className={styles.stockLabel}>
              現在の在庫
            </label>
            <div className={styles.numberControl}>
              <input
                id="quantity"
                className={styles.quantity}
                type="number"
                min="0"
                value={quantity}
                required
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <span>個</span>
            </div>
          </div>
          <div className={styles.stockField}>
            <label htmlFor="minQuantity" className={styles.stockLabel}>
              最低在庫数
            </label>
            <div className={styles.numberControl}>
              <input
                id="minQuantity"
                className={`${styles.quantity} ${styles.minimumQuantity}`}
                type="number"
                min="0"
                value={minQuantity}
                required
                onChange={(e) => setMinQuantity(Number(e.target.value))}
              />
              <span>個</span>
            </div>
          </div>
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
              <span className={styles.fieldHint}>
                保管場所の変更は場所設定から行えます
              </span>
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

        <div className={styles.formFooter}>
          <div className={styles.formMessage} aria-live="polite">
            {submitError && <p className={styles.submitError}>{submitError}</p>}
            {successMessage && (
              <p className={styles.submitSuccess}>{successMessage}</p>
            )}
          </div>
          <div className={styles.actions}>
            <Link href="/items" className={styles.cancelButton}>
              キャンセル
            </Link>
            <button
              className={styles.submitButton}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "更新中..." : "変更を保存"}
            </button>
          </div>
        </div>
      </form>
    </ItemPageLayout>
  );
}
