import { BoxIcon } from "@/app/component/icons";
import Link from "next/link";
import type { SubmitEvent } from "react";
import { getStockStatus, type ItemFormValues } from "../_lib/item-form";
import styles from "../page.module.scss";
import LocationSelect from "@/app/component/locationSelect";
import { LocationResponseDto } from "@/types/location/location";
import CategorySelect from "@/app/component/categorySelect";
import { parseQuantityInput } from "@/lib/quantity-input";

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
  isLocationCreating: boolean;
  locationCreateError: string | null;
  onLocationCreate: (name: string) => Promise<boolean>;
  onLocationCreateErrorClear: () => void;
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
  isLocationCreating,
  locationCreateError,
  onLocationCreate,
  onLocationCreateErrorClear
}: ItemEditFormProps) {
  const currentStock = values.stockType === "QUANTITY" ? values.quantity : values.stockPercentage;
  const minimumStock = values.stockType === "QUANTITY" ? values.minQuantity : values.minPercentage;
  const stockStatus = getStockStatus(currentStock, minimumStock);

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

      <fieldset className={styles.stockTypeSelector}>
        <legend>管理方法</legend>
        <label><input type="radio" name="stock-type" checked={values.stockType === "QUANTITY"} onChange={() => onChange("stockType", "QUANTITY")} />個数で管理</label>
        <label><input type="radio" name="stock-type" checked={values.stockType === "PERCENTAGE"} onChange={() => onChange("stockType", "PERCENTAGE")} />割合で管理</label>
      </fieldset>
      <section className={styles.stockPanel} aria-label="在庫">
        {values.stockType === "QUANTITY" ? <>
        <div className={styles.stockField}>
          <label htmlFor="quantity" className={styles.stockLabel}>
            現在の在庫
          </label>
          <div className={styles.numberControl}>
            <input
              id="quantity"
              className={styles.quantity}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={values.quantity}
              required
              onChange={(event) =>
                onChange("quantity", parseQuantityInput(event.target.value))
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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={values.minQuantity}
              required
              onChange={(event) =>
                onChange(
                  "minQuantity",
                  parseQuantityInput(event.target.value),
                )
              }
            />
            <span>個</span>
          </div>
        </div>
        </> : <>
        <div className={styles.stockField}>
          <label htmlFor="stockPercentage" className={styles.stockLabel}>現在の残量</label>
          <div className={styles.numberControl}>
            <input id="stockPercentage" className={styles.quantity} type="number" min="0" max="100" value={values.stockPercentage} required onChange={(event) => onChange("stockPercentage", Math.min(parseQuantityInput(event.target.value), 100))} />
            <span>%</span>
          </div>
        </div>
        <div className={styles.stockField}>
          <label htmlFor="minPercentage" className={styles.stockLabel}>最低残量</label>
          <div className={styles.numberControl}>
            <input id="minPercentage" className={`${styles.quantity} ${styles.minimumQuantity}`} type="number" min="0" max="100" value={values.minPercentage} required onChange={(event) => onChange("minPercentage", Math.min(parseQuantityInput(event.target.value), 100))} />
            <span>%</span>
          </div>
        </div>
        </>}
      </section>

      <dl className={styles.details}>
        <div className={styles.detailRow}>
          <CategorySelect
            value={values.category}
            required
            onChange={(category) => onChange("category", category)}
          />
        </div>
        <div className={styles.detailRow}>
          <LocationSelect
            locations={locations}
            value={values.locationId}
            isLoading={isLocationsRoading}
            error={locationsError}
            onChange={(locationId) => onChange("locationId", locationId)}
            onCreate={onLocationCreate}
            isCreating={isLocationCreating}
            createError={locationCreateError}
            variant="compact"
            onCreateErrorClear={onLocationCreateErrorClear}
          />
        </div>
        <div className={`${styles.detailRow} ${styles.expirationRow}`}>
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
