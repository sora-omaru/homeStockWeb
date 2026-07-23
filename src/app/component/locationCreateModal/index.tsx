"use client";

import { SubmitEvent, useEffect, useState } from "react";

type LocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function LocationCreateModal({
  isOpen,
  onClose,
  onCreate,
}: LocationModalProps) {
  const [name, setName] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    onCreate(trimmedName);
    setName("");
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
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="location-name">保管場所名</label>
        </div>
        <input
          id="location-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="例：冷蔵庫"
          autoFocus
        />
        <div>
          <button type="button" onClick={handleClose}>
            キャンセル
          </button>

          <button type="submit" disabled={!name.trim()}>
            追加
          </button>
        </div>
      </form>
    </div>
  );
}
