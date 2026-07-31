"use client";

import { LocationResponseDto } from "@/types/location/location";
import { createPortal } from "react-dom";
import styles from "./itemQuickCreateModal.module.scss";
import { useState } from "react";
import { ItemCategory } from "@/types/item-category";
import CategorySelect from "../categorySelect";
import { createItem } from "@/lib/api/item";
import { getItemCreateErrorMessage } from "@/lib/api/error/error-item";
import { ItemResponse } from "@/types/item";

type ItemQuickModalProps = {
  isOpen: boolean;
  location: LocationResponseDto | null;
  onClose: () => void;
  onCreated: (item: ItemResponse) => void;
};

export default function ItemQuickModal({
  isOpen,
  location,
  onClose,
  onCreated,
}: ItemQuickModalProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (!isOpen) return null;

  //フォームで受け取った情報で登録する。
  // item名、category,現在のlocationを受け取る
  async function handleCreateItem(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!itemName.trim()) {
      setCreateError("商品を入力してください");
      return;
    }

    if (!category) {
      setCreateError("カテゴリーを選択してください");
      return;
    }

    try {
      setIsSubmitting(true);
      setCreateError(null);
      const createdItem = await createItem({
        name: itemName.trim(),
        quantity,
        minQuantity: 0,
        category,
        locationId: location?.id ?? null,
        expirationDate: null,
        memo: null,
      });

      setItemName("");
      setQuantity(1);
      setCategory("");
      onCreated(createdItem);
    } catch (error) {
      console.error(error);
      setCreateError(getItemCreateErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-create-title"
      >
        <header className={styles.header}>
          <div className={styles.heading}>
            <span className={styles.icon} aria-hidden="true">
              ＋
            </span>
            <div>
              <p className={styles.eyebrow}>QUICK ADD</p>
              <h2 id="quick-create-title">Itemを追加</h2>
            </div>
          </div>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="閉じる"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className={styles.location}>
          <span className={styles.locationLabel}>保管場所</span>
          <strong>{location?.name ?? "未設定"}</strong>
        </div>

        <div className={styles.content}>
          <div className={styles.formHeading}>
            <span className={styles.contentIcon} aria-hidden="true">
              📦
            </span>
            <div>
              <p className={styles.contentTitle}>簡易登録フォーム</p>
              <p className={styles.contentText}>
                よく使う情報だけで、すばやく在庫を登録できます。
              </p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleCreateItem}>
            <div className={styles.field}>
              <label htmlFor="quick-item-name">
                Item名 <span className={styles.required}>必須</span>
              </label>
              <input
                className={styles.input}
                id="quick-item-name"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="例：ティッシュ"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="quick-item-quantity">数量</label>
              <input
                className={`${styles.input} ${styles.quantityInput}`}
                id="quick-item-quantity"
                type="number"
                min={0}
                step={1}
                value={quantity}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => {
                  const normalizedValue = event.target.value.replace(
                    /^0+(?=\d)/,
                    "",
                  );
                  setQuantity(Math.max(0, Number(normalizedValue)));
                }}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.categoryField}>
              <CategorySelect
                value={category}
                onChange={(value) => setCategory(value)}
                required
              />
            </div>

            {createError && (
              <p className={styles.error} role="alert">
                {createError}
              </p>
            )}

            <div className={styles.actions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                className={styles.submitButton}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "登録中..." : "登録する"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>,
    document.body,
  );
}
