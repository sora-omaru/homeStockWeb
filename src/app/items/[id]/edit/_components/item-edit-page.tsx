"use client";

import { useItemEdit } from "../_hooks/use-item-edit";
import { ItemEditForm } from "./item-edit-form";
import {
  InvalidItemState,
  ItemLoadErrorState,
  ItemLoadingState,
} from "./item-page-state";

export function ItemEditPage({ itemId }: { itemId: number }) {
  const editor = useItemEdit(itemId);

  if (editor.isInvalidId) return <InvalidItemState />;
  if (editor.isLoading) return <ItemLoadingState />;

  if (editor.loadError) {
    return (
      <ItemLoadErrorState
        message={editor.loadError}
        onRetry={() => void editor.retry()}
      />
    );
  }

  if (!editor.hasItem) return null;

  return (
    <ItemEditForm
      values={editor.formValues}
      isSubmitting={editor.isSubmitting}
      submitError={editor.submitError}
      successMessage={editor.successMessage}
      onChange={editor.changeField}
      onSubmit={editor.submit}
      locations={editor.locations}
      isLocationsRoading={editor.isLocationLoading}
      onLocationCreate={editor.createLocation}
      isLocationCreating={editor.isLocationCreating}
      locationCreateError={editor.createLocationError}
      locationsError={editor.locationError} //locationコンポーネント用
    />
  );
}
