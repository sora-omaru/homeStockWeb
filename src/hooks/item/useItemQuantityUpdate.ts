import { updateItemQuantity } from "@/lib/api/item";
import { getItemQuantityUpdateErrorMessage } from "@/lib/api/error/error-item";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ItemResponse } from "@/types/item";

type QuantityUpdateError = {
  itemId: number;
  message: string;
};

type UseItemQuantityUpdateProps = {
  setItems: Dispatch<SetStateAction<ItemResponse[]>>;
};

export function useItemQuantityUpdate({
  setItems,
}: UseItemQuantityUpdateProps) {
  const [updatingQuantityItemIds, setUpdatingQuantityItemIds] = useState<
    Set<number>
  >(new Set());

  const [quantityUpdateError, setQuantityUpdateError] =
    useState<QuantityUpdateError | null>(null);

  // Itemごとのデバウンスタイマー
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // 最後にAPI保存できた数量
  const confirmedQuantitiesRef = useRef<Map<number, number>>(new Map());

  const initializeQuantities = useCallback((items: ItemResponse[]) => {
    items.forEach((item) => {
      if (item.stockType === "QUANTITY" && item.quantity !== null) {
        confirmedQuantitiesRef.current.set(item.id, item.quantity);
      }
    });
  }, []);

  function handleQuantityChange(itemId: number, newQuantity: number) {
    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      return;
    }

    setQuantityUpdateError(null);

    // 画面はすぐ更新
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    );

    const currentTimer = timersRef.current.get(itemId);

    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    const newTimer = setTimeout(() => {
      timersRef.current.delete(itemId);
      saveQuantity(itemId, newQuantity);
    }, 400);

    timersRef.current.set(itemId, newTimer);
  }

  async function saveQuantity(itemId: number, newQuantity: number) {
    const confirmedQuantity = confirmedQuantitiesRef.current.get(itemId);

    setUpdatingQuantityItemIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });

    try {
      await updateItemQuantity(itemId, {
        quantity: newQuantity,
      });

      confirmedQuantitiesRef.current.set(itemId, newQuantity);
    } catch (error) {
      // 最後に保存できていた値へ戻す
      if (confirmedQuantity !== undefined) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: confirmedQuantity,
                }
              : item,
          ),
        );
      }

      setQuantityUpdateError({
        itemId,
        message: getItemQuantityUpdateErrorMessage(error),
      });
    } finally {
      setUpdatingQuantityItemIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => {
        clearTimeout(timer);
      });

      timers.clear();
    };
  }, []);

  return {
    handleQuantityChange,
    initializeQuantities,
    updatingQuantityItemIds,
    quantityUpdateError,
  };
}
