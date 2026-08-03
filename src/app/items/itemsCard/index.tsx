import { BoxIcon } from "@/app/component/icons";
import type { ItemCategory } from "@/types/item-category";
import type { ItemResponse } from "@/types/item";
import Link from "next/link";
import styles from "./itemsCard.module.scss";

const categoryLabels: Record<ItemCategory, string> = {
  FOOD: "食品",
  DRINK: "飲み物",
  DAILY_GOODS: "日用品",
  SEASONING: "調味料",
  MEDICINE: "医薬品",
  OTHER: "その他",
};

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
type ItemCardProps = {
  item: ItemResponse;
  onDelete: (item: number) => void;
  isDeleting: boolean;
  onQuantityChange: (itemId: number, quantity: number) => void;
  isQuantityUpdating: boolean;
  isQuantityUpdateDisabled: boolean;
  quantityUpdateError: string | null;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function ItemCard({
  item,
  onDelete,
  isDeleting,
  onQuantityChange,
  isQuantityUpdating,
  isQuantityUpdateDisabled,
  quantityUpdateError,
}: ItemCardProps) {
  const isOutOfStock = item.quantity === 0;
  const isLowStock = item.quantity > 0 && item.quantity <= item.minQuantity;
  const targetQuantity = Math.max(item.minQuantity * 2, item.quantity, 1);
  const stockPercentage = Math.min((item.quantity / targetQuantity) * 100, 100);

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.itemIdentity}>
          <span className={styles.itemIcon}>
            <BoxIcon />
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
            isOutOfStock
              ? styles.statusNone
              : isLowStock
                ? styles.statusLow
                : styles.statusGood
          }`}
        >
          {isOutOfStock ? "在庫なし" : isLowStock ? "残りわずか" : "在庫あり"}
        </span>
      </div>

      <div className={styles.stockPanel}>
        <div className={styles.stockTop}>
          <div>
            <p className={styles.stockLabel}>現在の在庫</p>
            <div className={styles.quantityControl}>
              <button
                type="button"
                className={styles.quantityButton}
                onClick={() =>
                  void onQuantityChange(item.id, item.quantity - 1)
                }
                disabled={
                  item.quantity === 0 ||
                  isQuantityUpdateDisabled ||
                  isDeleting
                }
                aria-label={`${item.name}の在庫を1個減らす`}
              >
                <span aria-hidden="true">−</span>
              </button>
              <p className={styles.quantity} aria-live="polite">
                {item.quantity}
                <span className={styles.unit}>個</span>
              </p>
              <button
                type="button"
                className={styles.quantityButton}
                onClick={() =>
                  void onQuantityChange(item.id, item.quantity + 1)
                }
                disabled={isQuantityUpdateDisabled || isDeleting}
                aria-label={`${item.name}の在庫を1個増やす`}
              >
                <span aria-hidden="true">＋</span>
              </button>
            </div>
          </div>
          <p className={styles.minimum}>
            最低在庫 <strong>{item.minQuantity}個</strong>
          </p>
        </div>
        <div className={styles.quantityMessage} aria-live="polite">
          {isQuantityUpdating && <span>数量を更新中…</span>}
          {quantityUpdateError && (
            <span className={styles.quantityError} role="alert">
              {quantityUpdateError}
            </span>
          )}
        </div>
        <div className={styles.progress}>
          <div
            className={`${styles.progressBar} ${
              isLowStock ? styles.progressBarLow : styles.progressBarGood
            }`}
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
      <div className={styles.cardActions}>
        <Link href={`/items/${item.id}/edit`} className={styles.cardLink}>
          編集する
          <span aria-hidden="true">→</span>
        </Link>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onDelete(item.id)}
          disabled={isDeleting}
          aria-label={`${item.name}を削除`}
        >
          {isDeleting ? "処理中" : "削除"}
        </button>
      </div>
    </article>
  );
}
