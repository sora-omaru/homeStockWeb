"use client";
import { ApiError } from "@/lib/api/error/api-error";
import { ErrorCode } from "@/lib/api/error/errocode";
import { createItem } from "@/lib/api/item";
import { ItemCategory } from "@/types/item-category";
import { SubmitEvent, useState } from "react";

export default function NewItem() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(0);
  const [category, setCategory] = useState<ItemCategory | "">("");
//   const [locationId, setLicationId] = useState();
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  async function submit() {
    setSubmitError(null);
    setNameError(null);
    setSuccessMessage(null);
    if (category === "") {
      setSubmitError("カテゴリーを選択してください");
      return;
    }
    setIsLoading(true);

    try {
      await createItem({
        name: name,
        quantity: quantity,
        minQuantity: minQuantity,
        category: category,
        locationId: null,
        expirationDate: expirationDate || null,
        memo: memo || null,
      });
      //入力後初期化する
      setName("");
      setQuantity(1);
      setMinQuantity(0);
      setCategory("");
      setExpirationDate("");
      setMemo("");
      setSuccessMessage("登録できました！");
    } catch (error) {
      // 1. ApiErrorではない予期しないエラー
      if (!(error instanceof ApiError)) {
        setSubmitError("Itemの作成に失敗しました。再度お試しください");
        return;
      }

      // 2. Item名が重複しているエラー
      if (error.code === ErrorCode.ITEM_ALREADY_EXISTS) {
        setNameError(error.message || "同じ名前のItemがすでに存在します。");
        return;
      }

      // 3. それ以外のApiError
      setSubmitError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }
  return (
    <>
      {submitError && <p>{submitError}</p>}
      {successMessage && <p>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameError && <p>{nameError}</p>}
        <input
          type="number"
          value={quantity}
          min={1}
          placeholder="量を入力してください"
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <input
          type="number"
          value={minQuantity}
          min={0}
          placeholder="最低量を入力してください"
          onChange={(e) => setMinQuantity(Number(e.target.value))}
        />

        <select
          id="item-category"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as ItemCategory | "")
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "送信中..." : "作成"}
        </button>

        <input
          type="date"
          value={expirationDate}
          onChange={(event) => setExpirationDate(event.target.value)}
        />
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
      </form>
    </>
  );
}
