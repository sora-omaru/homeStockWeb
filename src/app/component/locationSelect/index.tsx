"use client";

import { LocationResponseDto } from "@/types/location/location";
import { useEffect, useRef, useState } from "react";
import styles from "./locationSelect.module.scss";
import { LocationCreateModal } from "../locationCreateModal";

type LocationSelectProps = {
  locations: LocationResponseDto[];
  value: number | null;
  isLoading: boolean;
  error: string | null;
  onChange: (locationId: number | null) => void;
  onCreate: (name: string) => Promise<boolean>;
  isCreating: boolean;
  createError: string | null;
  variant?: "default" | "compact";
};
export default function LocationSelect({
  locations,
  value,
  isLoading,
  error,
  onChange,
  onCreate,
  isCreating,
  createError,
  variant = "default",
}: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isEmpty = !isLoading && !error && locations.length === 0;
  const selectedLocation = locations.find((location) => location.id === value);
  const isDisabled = isLoading || error !== null;

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function selectLocation(locationId: number | null) {
    onChange(locationId);
    setIsOpen(false);
  }

  async function handleCreateLocation(name: string) {
    const success = await onCreate(name);

    if (success) {
      setIsCreateModalOpen(false);
    }
  }

  return (
    <section
      className={`${styles.section} ${variant === "compact" ? styles.sectionCompact : ""}`}
    >
      <div className={styles.heading}>
        <span className={styles.icon} aria-hidden="true">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"
            />
            <circle cx="12" cy="10" r="2" />
          </svg>
        </span>
        <div>
          <h2>保管場所</h2>
          <p>どこに置いているかを設定すると、あとから探しやすくなります。</p>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field} ref={dropdownRef}>
          <label htmlFor="location">保管場所を選択</label>
          <button
            className={styles.trigger}
            type="button"
            id="location"
            disabled={isDisabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls="location-options"
            aria-describedby="location-status"
            onClick={() => setIsOpen((current) => !current)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsOpen(false);
            }}
          >
            <span>
              {isLoading
                ? "読み込み中..."
                : (selectedLocation?.name ?? "保管場所を設定しない")}
            </span>
            <svg
              aria-hidden="true"
              className={isOpen ? styles.chevronOpen : ""}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 9 6 6 6-6"
              />
            </svg>
          </button>

          {isOpen && (
            <div className={styles.menu} id="location-options" role="listbox">
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                className={
                  value === null ? styles.optionSelected : styles.option
                }
                onClick={() => selectLocation(null)}
              >
                <span>保管場所を設定しない</span>
                {value === null && <span className={styles.check}>✓</span>}
              </button>

              {locations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  role="option"
                  aria-selected={value === location.id}
                  className={
                    value === location.id
                      ? styles.optionSelected
                      : styles.option
                  }
                  onClick={() => selectLocation(location.id)}
                >
                  <span>{location.name}</span>
                  {value === location.id && (
                    <span className={styles.check}>✓</span>
                  )}
                </button>
              ))}

              {isEmpty && (
                <p className={styles.emptyMessage}>
                  登録済みの保管場所はありません。
                </p>
              )}

              <button
                type="button"
                className={styles.menuAddLink}
                onClick={() => {
                  setIsOpen(false);
                  setIsCreateModalOpen(true);
                }}
              >
                <span aria-hidden="true">＋</span>
                新しい保管場所を追加
              </button>
            </div>
          )}

          <div
            id="location-status"
            className={styles.status}
            aria-live="polite"
          >
            {isLoading && <p>保管場所を読み込んでいます...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {isEmpty && <p>登録済みの保管場所はありません。</p>}
            {!isLoading && !error && !isEmpty && (
              <p>{locations.length}件の保管場所から選べます。</p>
            )}
          </div>
        </div>
      </div>
      <LocationCreateModal
        isOpen={isCreateModalOpen}
        isSubmitting={isCreating}
        error={createError}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateLocation}
      />
    </section>
  );
}
