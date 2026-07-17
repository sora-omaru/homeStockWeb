"use client";
import { createItem } from "@/lib/api/item";
import { ItemCategory } from "@/types/item-category";
import { SubmitEvent, useState } from "react";

export default function NewItem() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(0);
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [locationId, setLicationId] = useState();
  const [expirationDate, setExpiretionDate] = useState();
  const [memo, setMemo] = useState();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit() {
    setSubmitError(null);

    if (category === "") {
      setSubmitError("カテゴリーを選択してください");
      return;
    }

    const item = await createItem({
      name: name,
      quantity: 0,
      minQuantity: 0,
      category: category,
      locationId: null,
      expirationDate: null,
      memo: null,
    });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <button type="submit">登録</button>
    </form>
  );
}
