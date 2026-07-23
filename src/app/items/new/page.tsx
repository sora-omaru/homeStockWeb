"use client";

import { ApiError } from "@/lib/api/error/api-error";
import { ErrorCode } from "@/lib/api/error/errocode";
import { createItem } from "@/lib/api/item";
import { ItemCategory } from "@/types/item-category";
import Link from "next/link";
import { SubmitEvent, useEffect, useState } from "react";
import styles from "./page.module.scss";
import { LocationResponseDto } from "@/types/location/location";
import { createLocation, getLocations } from "@/lib/api/location/location";
import { getLocationCreateErrorMessage } from "@/lib/api/error/error-location";
import LocationSelect from "@/app/component/locationSelect";
import CategorySelect from "@/app/component/categorySelect";

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
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m15 18-6-6 6-6"
      />
    </svg>
  );
}

export default function NewItem() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(0);
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [expirationDate, setExpirationDate] = useState("");
  const [memo, setMemo] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [isLocationsLoading, setIsLocationsLoading] = useState<boolean>(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [isLocationCreating, setIsLocationCreating] = useState(false);
  const [locationCreateError, setLocationCreateError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getLocations();

        setLocations(response);
      } catch (e) {
        console.error(e);
        setLocationsError("場所が取得できませんでした、再度お試しください");
      } finally {
        setIsLocationsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  async function handleCreateLocation(locationName: string): Promise<boolean> {
    setLocationCreateError(null);
    setIsLocationCreating(true);

    try {
      const createdLocation = await createLocation({ name: locationName });
      setLocations((currentLocations) => [
        ...currentLocations,
        createdLocation,
      ]);
      setLocationId(createdLocation.id);
      return true;
    } catch (error) {
      console.error(error);
      setLocationCreateError(getLocationCreateErrorMessage(error));
      return false;
    } finally {
      setIsLocationCreating(false);
    }
  }
  function clearCreateLocationError() {
    setLocationCreateError(null);
  }

  async function submit() {
    setSubmitError(null);
    setNameError(null);
    setSuccessMessage(null);

    if (category === "") {
      setSubmitError("カテゴリーを選択してください");
      return;
    }

    setIsLoading(true);

    try {
      await createItem({
        name,
        quantity,
        minQuantity,
        category,
        locationId: locationId,
        expirationDate: expirationDate || null,
        memo: memo || null,
      });
      setName("");
      setQuantity(1);
      setMinQuantity(0);
      setCategory("");
      setExpirationDate("");
      setMemo("");
      setSuccessMessage("Itemを登録しました！");
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setSubmitError("Itemの作成に失敗しました。再度お試しください");
        return;
      }

      if (error.code === ErrorCode.ITEM_ALREADY_EXISTS) {
        setNameError(error.message || "同じ名前のItemがすでに存在します。");
        return;
      }

      setSubmitError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={`${styles.glow} ${styles.glowLeft}`} />
      <div
        aria-hidden="true"
        className={`${styles.glow} ${styles.glowRight}`}
      />
      <div aria-hidden="true" className={styles.sprinkles}>
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} />
        ))}
      </div>

      <div className={styles.container}>
        <nav className={styles.nav} aria-label="メインナビゲーション">
          <Link href="/" className={styles.brand}>
            <span className={styles.logo}>
              <BoxIcon className={styles.logoIcon} />
            </span>
            <span className={styles.brandName}>Banana Stock</span>
          </Link>
          <span className={styles.navBadge}>NEW ITEM</span>
        </nav>

        <Link href="/items" className={styles.backLink}>
          <ArrowLeftIcon />
          Item一覧へ戻る
        </Link>

        <header className={styles.header}>
          <p className={styles.eyebrow}>ADD TO PANTRY</p>
          <h1 className={styles.title}>新しいItemを登録</h1>
          <p className={styles.intro}>
            おうちにあるものを登録して、在庫の管理をはじめましょう。
          </p>
        </header>

        <form
          className={styles.card}
          onSubmit={handleSubmit}
          aria-busy={isLoading}
        >
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>01</span>
              <div>
                <h2>基本情報</h2>
                <p>Itemの名前とカテゴリを入力してください。</p>
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label htmlFor="item-name">
                  Itemの名前 <span className={styles.required}>必須</span>
                </label>
                <input
                  id="item-name"
                  className={`${styles.control} ${nameError ? styles.invalid : ""}`}
                  type="text"
                  value={name}
                  placeholder="例：ティッシュペーパー"
                  required
                  autoComplete="off"
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? "item-name-error" : undefined}
                  onChange={(event) => setName(event.target.value)}
                />
                {nameError && (
                  <p
                    id="item-name-error"
                    className={styles.fieldError}
                    role="alert"
                  >
                    {nameError}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <CategorySelect
                  value={category}
                  required
                  onChange={setCategory}
                />
              </div>
            </div>
          </section>

          <LocationSelect
            locations={locations}
            value={locationId}
            isLoading={isLocationsLoading}
            error={locationsError}
            onChange={setLocationId}
            onCreate={handleCreateLocation}
            isCreating={isLocationCreating}
            createError={locationCreateError}
            onCreateErrorClear={clearCreateLocationError}
          />
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>02</span>
              <div>
                <h2>在庫数</h2>
                <p>現在の数と、買い足す目安を設定できます。</p>
              </div>
            </div>

            <div className={styles.stockPanel}>
              <div className={styles.stockField}>
                <label htmlFor="quantity">現在の在庫</label>
                <div className={styles.numberControl}>
                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    min={1}
                    required
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                  />
                  <span>個</span>
                </div>
              </div>
              <div className={styles.stockField}>
                <label htmlFor="min-quantity">最低在庫数</label>
                <div className={styles.numberControl}>
                  <input
                    id="min-quantity"
                    type="number"
                    value={minQuantity}
                    min={0}
                    required
                    onChange={(event) =>
                      setMinQuantity(Number(event.target.value))
                    }
                  />
                  <span>個</span>
                </div>
                <p className={styles.hint}>この数になる前に買い足す目安です</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>03</span>
              <div>
                <h2>追加情報</h2>
                <p>必要な場合だけ入力してください。</p>
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="expiration-date">賞味期限・使用期限</label>
                <input
                  id="expiration-date"
                  className={styles.control}
                  type="date"
                  value={expirationDate}
                  onChange={(event) => setExpirationDate(event.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label htmlFor="item-memo">メモ</label>
                <textarea
                  id="item-memo"
                  className={`${styles.control} ${styles.textarea}`}
                  value={memo}
                  rows={4}
                  placeholder="保管場所や購入時のメモなど"
                  onChange={(event) => setMemo(event.target.value)}
                />
              </div>
            </div>
          </section>

          <footer className={styles.footer}>
            <div className={styles.message} aria-live="polite">
              {submitError && (
                <p className={styles.submitError}>{submitError}</p>
              )}
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
                disabled={isLoading}
              >
                {isLoading ? "登録中..." : "Itemを登録"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </main>
  );
}
