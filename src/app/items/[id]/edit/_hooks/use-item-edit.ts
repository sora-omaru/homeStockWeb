"use client";

import { getItem, updateItem } from "@/lib/api/item";
import type { ItemResponse } from "@/types/item";
import { useCallback, useEffect, useState } from "react";
import { getItemUpdateErrorMessage } from "../_lib/item-edit-error";
import {
  initialItemFormValues,
  toItemFormValues,
  type ItemFormValues,
} from "../_lib/item-form";
import { LocationResponseDto } from "@/types/location/location";

export function useItemEdit(itemId: number) {
  const [formValues, setFormValues] = useState<ItemFormValues>(
    initialItemFormValues,
  );
  const [hasItem, setHasItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(true);
  const isInvalidId = !Number.isInteger(itemId) || itemId <= 0;

  const applyItem = useCallback((item: ItemResponse) => {
    setFormValues(toItemFormValues(item));
    setHasItem(true);
  }, []);

  useEffect(() => {
    if (isInvalidId) return;

    const controller = new AbortController();

    async function load() {
      try {
        const item = await getItem(itemId, controller.signal);
        applyItem(item);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setLoadError("Itemの読み込みに失敗しました");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [applyItem, isInvalidId, itemId]);

  const changeField = useCallback(
    <Field extends keyof ItemFormValues>(
      field: Field,
      value: ItemFormValues[Field],
    ) => {
      setFormValues((current) => ({ ...current, [field]: value }));
      setSubmitError(null);
      setSuccessMessage(null);
    },
    [],
  );

  async function retry() {
    setIsLoading(true);
    setLoadError(null);

    try {
      applyItem(await getItem(itemId));
    } catch (error) {
      console.error(error);
      setLoadError("Itemの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  async function submit() {
    setSubmitError(null);
    setSuccessMessage(null);

    if (!formValues.category) {
      setSubmitError("カテゴリーを選択してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const item = await updateItem(itemId, {
        name: formValues.name,
        quantity: formValues.quantity,
        minQuantity: formValues.minQuantity,
        category: formValues.category,
        locationId: formValues.locationId,
        expirationDate: formValues.expirationDate || null,
        memo: formValues.memo || null,
      });
      applyItem(item);
      setSuccessMessage("Itemを更新しました");
    } catch (error) {
      console.error(error);
      setSubmitError(getItemUpdateErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    formValues,
    locations,
    isLocationLoading,
    locationError,
    hasItem,
    isInvalidId,
    isLoading,
    loadError,
    isSubmitting,
    submitError,
    successMessage,
    changeField,
    retry,
    submit,
  };
}
