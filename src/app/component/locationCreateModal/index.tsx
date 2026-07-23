"use client";

import { SubmitEvent, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import styles from "./locationCreateModal.module.scss";

const emptySubscribe = () => () => {};

type LocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  error: string | null;
  isSubmitting: boolean;
};

export function LocationCreateModal({
  isOpen,
  onClose,
  onCreate,
  error,
  isSubmitting,
}: LocationModalProps) {
  const [name, setName] = useState("");

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onCreate(trimmedName);
  }

  function handleClose() {
    setName("");
    onClose();
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setName("");
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        <div className={styles.heading}>
          <span className={styles.icon} aria-hidden="true">
            ＋
          </span>
          <div>
            <p className={styles.eyebrow}>NEW LOCATION</p>
            <h2 id="location-modal-title">保管場所を追加</h2>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="location-name">保管場所名</label>
          <input
            className={styles.input}
            id="location-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例：冷蔵庫"
            disabled={isSubmitting}
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              キャンセル
            </button>

            <button
              className={styles.submitButton}
              type="submit"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "追加中..." : "追加"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
