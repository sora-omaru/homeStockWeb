import { updateItemPercentage } from "@/lib/api/item";
import { ItemResponse } from "@/types/item";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type UseItemPercentageUpdateProps = {
  setItems: Dispatch<SetStateAction<ItemResponse[]>>;
};

type PercentageUpdateError = {
  itemId: number;
  message: string;
};

export function useItemPercentageUpdate({
  setItems,
}: UseItemPercentageUpdateProps) {
  const [updatingPercentageItemIds, setUpdatingPercentageItemIds] = useState<
    Set<number>
  >(new Set());

  const [percentageUpdateError, setPercentageUpdateError] =
    useState<PercentageUpdateError | null>(null);

  //Itemごとのデバウンスタイマー
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  //API更新に失敗したときに画面をもとに戻すために使用する
  const confirmedPercentagesRef = useRef<Map<number, number>>(new Map());

  const initializePercentages = useCallback((items: ItemResponse[]) => {
    items.forEach((item) => {
      if (item.stockType === "PERCENTAGE" && item.stockPercentage !== null) {
        confirmedPercentagesRef.current.set(item.id, item.stockPercentage);
      }
    });
  }, []);

  function handlePercentageChange(itemId: number, newPercentage: number) {
    if (
      !Number.isInteger(newPercentage) ||
      newPercentage < 0 ||
      newPercentage > 100
    ) {
      return;
    }

    setPercentageUpdateError(null);
    //画面はすぐに更新
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, stockPercentage: newPercentage } : item,
      ),
    );
    const currentTimer = timersRef.current.get(itemId);

    if (currentTimer) {
      clearTimeout(currentTimer);
    }
    const newTimer = setTimeout(() => {
      timersRef.current.delete(itemId);
      savePercentage(itemId, newPercentage);
    }, 400);

    timersRef.current.set(itemId, newTimer);
  }

  async function savePercentage(itemId: number, newPercentage: number) {
    const confirmedPercentage = confirmedPercentagesRef.current.get(itemId);

    setUpdatingPercentageItemIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });

    try {
      await updateItemPercentage(itemId, {
        percentage: newPercentage,
      });

      confirmedPercentagesRef.current.set(itemId, newPercentage);
    } catch {
      //最後に保存できていた値へ戻す
      if (confirmedPercentage !== undefined) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  stockPercentage: confirmedPercentage,
                }
              : item,
          ),
        );
      }
    } finally {
      setUpdatingPercentageItemIds((prev) => {
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
    handlePercentageChange,
    initializePercentages,
    updatingPercentageItemIds,
    percentageUpdateError,
  };
}
