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

  //初回やレンダリング時
  useEffect(() => {
    if (isInvalidId) {
      return;
    }
    //画面遷移時にアンマウント後の画面のstateに干渉しないように定義する
    // let isCancelled = false;
    //こちらでも同じことができるためこちらに置き換え
    const controller = new AbortController();

    async function loadItem() {
      try {
        const response = await getItem(itemId, controller.signal);
        // if (!isCancelled) {
        setItem(response);
        // }
      } catch (error) {
        console.error(error);
        // if (!isCancelled) {
        setErrorMessage("Itemの読み込みに失敗しました");
        // }
      } finally {
        // if (!isCancelled) {
        setIsLoading(false);
        // }
      }
    }
    loadItem();
    return () => {
      controller.abort(); //クリーンアップ時にキャンセル
    };
    // return () => {
    //   isCancelled = true;
    // };
  }, [itemId, isInvalidId]);

  async function retryItem() {
    setIsLoading(true);
    setErrorMessage(null);
    const controller = new AbortController();
    try {
      const response = await getItem(itemId, controller.signal);
      setItem(response);
    } catch (error) {
      console.error(error);
      setErrorMessage("Itemの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

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
        <button type="button" onClick={retryItem}>
          再取得
        </button>
      </section>
    );
  }

  return <p>{item?.name}</p>;
}
