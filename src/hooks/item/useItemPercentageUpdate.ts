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
  // Item単位でAPI更新中かを管理し、対象の操作UIと更新表示を制御する
  const [updatingPercentageItemIds, setUpdatingPercentageItemIds] = useState<
    Set<number>
  >(new Set());

  const [percentageUpdateError, setPercentageUpdateError] =
    useState<PercentageUpdateError | null>(null);

  // Itemごとに独立したデバウンスタイマーを保持する
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // API更新に失敗したときに画面を最後の保存成功値へ戻すために使用する
  const confirmedPercentagesRef = useRef<Map<number, number>>(new Map());

  // 一覧取得時の割合を、API保存済みの初期値として記録する
  const initializePercentages = useCallback((items: ItemResponse[]) => {
    items.forEach((item) => {
      if (item.stockType === "PERCENTAGE" && item.stockPercentage !== null) {
        confirmedPercentagesRef.current.set(item.id, item.stockPercentage);
      }
    });
  }, []);

  // 入力値を即座に画面へ反映し、操作が止まってからAPI保存を実行する
  function handlePercentageChange(itemId: number, newPercentage: number) {
    // APIへ不正な割合を送らないよう、0〜100の整数だけを受け付ける
    if (
      !Number.isInteger(newPercentage) ||
      newPercentage < 0 ||
      newPercentage > 100
    ) {
      return;
    }

    setPercentageUpdateError(null);
    // APIの完了を待たずに画面を更新する（楽観的更新）
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, stockPercentage: newPercentage } : item,
      ),
    );
    // 同じItemの操作が続いた場合は、直前の保存予約を取り消す
    const currentTimer = timersRef.current.get(itemId);

    if (currentTimer) {
      clearTimeout(currentTimer);
    }
    // 最後の操作から400ms経過した値だけをAPIへ保存する
    const newTimer = setTimeout(() => {
      timersRef.current.delete(itemId);
      savePercentage(itemId, newPercentage);
    }, 400);

    timersRef.current.set(itemId, newTimer);
  }

  // 割合をAPIへ保存し、失敗した場合は最後の保存成功値へ戻す
  async function savePercentage(itemId: number, newPercentage: number) {
    const confirmedPercentage = confirmedPercentagesRef.current.get(itemId);

    setUpdatingPercentageItemIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });

    try {
      await updateItemPercentage(itemId, {
        stockPercentage: newPercentage,
      });

      // 次回失敗時の復元元として、今回保存できた値を記録する
      confirmedPercentagesRef.current.set(itemId, newPercentage);
    } catch {
      // 最後に保存できていた値へ戻す
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

  // 画面遷移後に保存予約が実行されないよう、未実行タイマーを破棄する
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
