import type { ItemCategory } from "@/types/item-category";
import type { ItemResponse } from "@/types/item";
import styles from "./itemsCard.module.scss";
import Link from "next/link";

const categoryLabels: Record<ItemCategory, string> = {
  FOOD: "食品",
  DRINK: "飲み物",
  DAILY_GOODS: "日用品",
  SEASONING: "調味料",
  MEDICINE: "医薬品",
  OTHER: "その他",
};

function BoxIcon() {
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

export default function ItemCard({ item }: { item: ItemResponse }) {
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
        <Link href={`/items/${item.id}/edit`} className={styles.cardLink}>
          編集する
          <span aria-hidden="true">→</span>
        </Link>
      </article>
  );
}
