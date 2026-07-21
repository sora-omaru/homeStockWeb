import type { ItemCategory } from "@/types/item-category";
import Link from "next/link";
import type { SubmitEvent } from "react";
import { getStockStatus, type ItemFormValues } from "../_lib/item-form";
import styles from "../page.module.scss";
import { BoxIcon } from "./icons";
import LocationSelect from "@/app/component/locationSelect";
import { LocationResponseDto } from "@/types/location/location";

type ItemEditFormProps = {
  values: ItemFormValues;
  isSubmitting: boolean;
  submitError: string | null;
  successMessage: string | null;
  onChange: <Field extends keyof ItemFormValues>(
    field: Field,
    value: ItemFormValues[Field],
  ) => void;
  onSubmit: () => Promise<void>;
  locations: LocationResponseDto[];
  isLocationsRoading: boolean;
  locationsError: string | null;
};

const stockStatusLabels = {
  none: "在庫なし",
  low: "残りわずか",
  good: "在庫あり",
} as const;

const stockStatusClasses = {
  none: styles.statusNone,
  low: styles.statusLow,
  good: styles.statusGood,
} as const;

export function ItemEditForm({
  values,
  isSubmitting,
  submitError,
  successMessage,
  onChange,
  onSubmit,
  locations,
  isLocationsRoading,
  locationsError,
}: ItemEditFormProps) {
  const stockStatus = getStockStatus(values.quantity, values.minQuantity);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <form
      className={styles.card}
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
    >
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
              value={values.name}
              required
              autoComplete="off"
              onChange={(event) => onChange("name", event.target.value)}
            />
          </div>
        </div>
        <span className={`${styles.status} ${stockStatusClasses[stockStatus]}`}>
          {stockStatusLabels[stockStatus]}
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
              value={values.quantity}
              required
              onChange={(event) =>
                onChange("quantity", Number(event.target.value))
              }
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
              value={values.minQuantity}
              required
              onChange={(event) =>
                onChange("minQuantity", Number(event.target.value))
              }
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
              value={values.category}
              onChange={(event) =>
                onChange("category", event.target.value as ItemCategory)
              }
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
        <LocationSelect
          locations={locations}
          value={values.locationId}
          isLoading={isLocationsRoading}
          error={locationsError}
          onChange={(locationId)=>onChange("locationId",locationId)}
        />
        <div className={styles.detailRow}>
          <dt>
            <label htmlFor="item-location">保管場所</label>
          </dt>
          <dd>
            <input
              id="item-location"
              className={styles.formControl}
              type="text"
              value={values.locationName}
              placeholder="例: キッチンの棚"
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
              value={values.expirationDate}
              onChange={(event) =>
                onChange("expirationDate", event.target.value)
              }
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
              value={values.memo}
              placeholder="Itemについてのメモ"
              rows={4}
              onChange={(event) => onChange("memo", event.target.value)}
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
  );
}
