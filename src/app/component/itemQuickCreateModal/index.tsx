"use client";

import { LocationResponseDto } from "@/types/location/location";
import { createPortal } from "react-dom";
import styles from "./itemQuickCreateModal.module.scss";

type ItemQuickModalProps = {
  isOpen: boolean;
  location: LocationResponseDto | null;
  onClose: () => void;
};

export default function ItemQuickModal({
  isOpen,
  location,
  onClose,
}: ItemQuickModalProps) {
  if (!isOpen) return null;

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
          <span className={styles.contentIcon} aria-hidden="true">
            📦
          </span>
          <div>
            <p className={styles.contentTitle}>簡易登録フォーム</p>
            <p className={styles.contentText}>
              ここにItemの簡易登録フォームを作成します。
            </p>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
