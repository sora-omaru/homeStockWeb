"use client";

import { ItemCategory } from "@/types/item-category";
import { useEffect, useRef, useState } from "react";
import styles from "./categorySelect.module.scss";

type CategorySelectProps = {
  value: ItemCategory | "";
  onChange: (category: ItemCategory | "") => void;
  required?: boolean;
};

const categoryOptions: { value: ItemCategory; label: string }[] = [
  { value: "FOOD", label: "食品" },
  { value: "DRINK", label: "飲み物" },
  { value: "DAILY_GOODS", label: "日用品" },
  { value: "SEASONING", label: "調味料" },
  { value: "MEDICINE", label: "医薬品" },
  { value: "OTHER", label: "その他" },
];

export default function CategorySelect({
  value,
  onChange,
  required = false,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCategory = categoryOptions.find(
    (category) => category.value === value,
  );

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function selectCategory(category: ItemCategory) {
    onChange(category);
    setIsOpen(false);
  }

  return (
    <div className={styles.field} ref={dropdownRef}>
      <label className={styles.label} id="item-category-label">
        カテゴリ
        {required && <span className={styles.required}>必須</span>}
      </label>
      <button
        className={styles.trigger}
        type="button"
        id="item-category"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="category-options"
        aria-labelledby="item-category-label item-category"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
        }}
      >
        <span className={selectedCategory ? "" : styles.placeholder}>
          {selectedCategory?.label ?? "選択してください"}
        </span>
        <svg
          aria-hidden="true"
          className={isOpen ? styles.chevronOpen : ""}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.menu} id="category-options" role="listbox">
          {categoryOptions.map((category) => (
            <button
              key={category.value}
              type="button"
              role="option"
              aria-selected={value === category.value}
              className={
                value === category.value
                  ? styles.optionSelected
                  : styles.option
              }
              onClick={() => selectCategory(category.value)}
            >
              <span>{category.label}</span>
              {value === category.value && (
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
