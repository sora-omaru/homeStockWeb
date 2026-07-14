"use client";

import { getItem } from "@/lib/api/item";
import { ItemResponse } from "@/types/item";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ItemPage() {
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const params = useParams<{ id: string }>();
  const itemId = Number(params.id);
  const isInvalidId = !Number.isInteger(itemId) || itemId <= 0;

  useEffect(() => {
    if (isInvalidId) {
      return;
    }

    async function fetchItem() {
      setIsLoading(true);

      try {
        const response = await getItem(itemId);
        setItem(response);
      } catch (error) {
        console.error(error);
        setErrorMessage("Itemの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    }

    fetchItem();
  }, [itemId, isInvalidId]);

  if (isInvalidId) {
    return <p>こちらは不正なItemIdです</p>;
  }

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (errorMessage) {
    return (
      <section>
        <p>{errorMessage}</p>
        <p>再読み込みしてください。</p>
      </section>
    );
  }

  return <p>{item?.name}</p>;
}
