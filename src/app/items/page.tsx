"use client";

import { useItemQuantityUpdate } from "@/hooks/item/useItemQuantityUpdate";
import { getItemDeleteErrorMessage } from "@/lib/api/error/error-item";
import { deleteItem, getItems } from "@/lib/api/item";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
} from "@/lib/api/location/location";
import { ItemResponse } from "@/types/item";
import { LocationResponseDto } from "@/types/location/location";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BoxIcon } from "../component/icons";
import ItemQuickModal from "../component/itemQuickCreateModal";
import ItemCard from "./itemsCard";
import styles from "./page.module.scss";
import {
  getLocationCreateErrorMessage,
  getLocationDeleteErrorMessage,
  getLocationUpdateErrorMessage,
} from "@/lib/api/error/error-location";
import { LocationCreateModal } from "../component/locationCreateModal";

type AddedItemNotice = {
  id: number;
  itemName: string;
  locationName: string;
};

export default function ItemsPage() {
  //一覧表示に使用するItem・Locationと、初回取得時の画面状態
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);

  const {
    handleQuantityChange,
    initializeQuantities,
    updatingQuantityItemIds,
    quantityUpdateError,
  } = useItemQuantityUpdate({ setItems });

  //一覧からItemを追加する際に、追加先のLocationをモーダルへ渡す
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResponseDto | null>(null);
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);

  //Item作成後に画面左下へ表示する完了通知
  const [addedItemNotice, setAddedItemNotice] =
    useState<AddedItemNotice | null>(null);

  //Item・Location削除時の共通エラー表示
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteErrorRef = useRef<HTMLDivElement>(null);

  //Location作成モーダルの表示状態・送信状態・エラー
  const [isLocationCreateModalOpen, setIsLocationCreateModalOpen] =
    useState(false);
  const [isLocationCreating, setIsLocationCreating] = useState(false);
  const [locationCreateError, setLocationCreateError] = useState<string | null>(
    null,
  );

  //Location名のインライン編集で使用する入力値・送信状態・エラー
  const [editingLocationId, setEditingLocationId] = useState<number | null>(
    null,
  );
  const [editingLocationName, setEditingLocationName] = useState("");
  const [isLocationUpdating, setIsLocationUpdating] = useState(false);
  const [locationUpdateError, setLocationUpdateError] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleteing] = useState<boolean>(false);

  //編集対象のLocation IDと現在の名前を入力欄へ設定する
  function startLocationEdit(location: LocationResponseDto) {
    setEditingLocationId(location.id);
    setEditingLocationName(location.name);
    setLocationUpdateError(null);
  }

  //入力値を検証してLocation名を更新し、成功後に一覧の該当データを置き換える
  async function handleLocationUpdate() {
    if (editingLocationId === null) return;

    const trimmedName = editingLocationName.trim();

    if (!trimmedName) {
      setLocationUpdateError("保管場所を入力してください");
      return;
    }

    try {
      setLocationUpdateError(null);
      setIsLocationUpdating(true);

      const updatedLocation = await updateLocation(editingLocationId, {
        name: trimmedName,
      });
      setLocations((crrentLocations) =>
        crrentLocations.map((location) =>
          location.id === updatedLocation.id ? updatedLocation : location,
        ),
      );
      setEditingLocationId(null);
      setEditingLocationName("");
    } catch (error) {
      setLocationUpdateError(getLocationUpdateErrorMessage(error));
    } finally {
      setIsLocationUpdating(false);
    }
  }
  function cancelLocationEdit() {
    setEditingLocationId(null);
    setEditingLocationName("");
    setLocationUpdateError(null);
  }

  //選択したLocationを追加先としてItem簡易作成モーダルを開く
  function openQuickCreateModal(location: LocationResponseDto | null) {
    setSelectedLocation(location);
    setIsQuickCreateModalOpen(true);
  }

  function closeQuickCreateModal() {
    setIsQuickCreateModalOpen(false);
  }

  //作成されたItemを一覧へ追加し、完了通知を表示する
  function handleItemCreated(item: ItemResponse) {
    initializeQuantities([item]);
    setItems((currentItems) => [...currentItems, item]);
    setAddedItemNotice({
      id: Date.now(),
      itemName: item.name,
      locationName: selectedLocation?.name ?? "保管場所 未設定",
    });
    setIsQuickCreateModalOpen(false);
  }

  //Item削除後、再取得せずに対象Itemだけを一覧から取り除く
  async function handleDelete(itemId: number) {
    try {
      setDeleteError(null);
      setIsDeleteing(true);
      await deleteItem(itemId);

      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (error) {
      setDeleteError(getItemDeleteErrorMessage(error));
    } finally {
      setIsDeleteing(false);
    }
  }

  //Location削除後、再取得せずに対象Locationだけを一覧から取り除く
  async function handleLocationDelete(locationId: number) {
    try {
      setDeleteError(null);
      setIsDeleteing(true);
      await deleteLocation(locationId);

      setLocations((prevLocations) =>
        prevLocations.filter((location) => location.id !== locationId),
      );
    } catch (error) {
      console.error(error);
      setDeleteError(getLocationDeleteErrorMessage(error));
    } finally {
      setIsDeleteing(false);
    }
  }

  //前回の作成エラーを残さずLocation作成モーダルを開く
  function openLocationCreateModal() {
    setLocationCreateError(null);
    setIsLocationCreateModalOpen(true);
  }

  function closeLocationCreateModal() {
    //送信中は通信結果が返るまでモーダルを閉じない
    if (isLocationCreating) return;

    setLocationCreateError(null);
    setIsLocationCreateModalOpen(false);
  }

  //Locationを作成し、成功後に一覧へ追加してモーダルを閉じる
  async function handleLocationCreate(name: string) {
    setLocationCreateError(null);
    setIsLocationCreating(true);

    try {
      const createdLocation = await createLocation({ name });
      setLocations((currentLocations) => [
        ...currentLocations,
        createdLocation,
      ]);
      setIsLocationCreateModalOpen(false);
    } catch (error) {
      console.error(error);
      setLocationCreateError(getLocationCreateErrorMessage(error));
    } finally {
      setIsLocationCreating(false);
    }
  }

  //初回取得に失敗した場合にItemとLocationをまとめて再取得する
  async function retryPageData() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [itemsResponse, locationsResponse] = await Promise.all([
        getItems(),
        getLocations(),
      ]);

      setItems(itemsResponse);
      initializeQuantities(itemsResponse);
      setLocations(locationsResponse);
    } catch (error) {
      console.error(error);
      setErrorMessage("一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  //TODO 完了通知を共通コンポーネントへ切り出す
  //通知を2秒間表示したあと自動的に閉じる
  useEffect(() => {
    if (!addedItemNotice) return;

    const timeoutId = window.setTimeout(() => {
      setAddedItemNotice(null);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [addedItemNotice]);

  //削除エラー発生時にメッセージまで移動し、読み上げ対象へフォーカスする
  useEffect(() => {
    if (!deleteError) return;

    deleteErrorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    deleteErrorRef.current?.focus({ preventScroll: true });
  }, [deleteError]);

  //画面の初回表示時にItemとLocationを並列で取得する
  useEffect(() => {
    //画面遷移後に完了した通信がStateを更新しないようにする
    let isActive = true;

    Promise.all([getItems(), getLocations()])
      .then(([itemsResponse, locationResponse]) => {
        if (!isActive) return;

        setItems(itemsResponse);
        initializeQuantities(itemsResponse);
        setLocations(locationResponse);
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isActive) setErrorMessage("一覧の取得に失敗しました");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [initializeQuantities]);

  //取得済みのLocation IDを使い、ItemをLocationごとのグループへ振り分ける
  const knownLocationIds = new Set(locations.map((location) => location.id));
  const locationGroups = locations.map((location) => ({
    location,
    items: items.filter((item) => item.locationId === location.id),
  }));

  //Location未設定、または削除済みLocationを参照しているItemを別グループにする
  const unassignedItems = items.filter(
    (item) =>
      item.locationId === null || !knownLocationIds.has(item.locationId),
  );

  //TODO 未設定ItemもlocationGroupsへ統合する場合に使用する
  // if (unassignedItems.length > 0) {
  //   locationGroups.push({
  //     id: "unassigned",
  //     name: "保管場所 未設定",
  //     items: unassignedItems,
  //   });
  // }

  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={`${styles.glow} ${styles.glowLeft}`} />
      <div
        aria-hidden="true"
        className={`${styles.glow} ${styles.glowRight}`}
      />

      <div className={styles.container}>
        <nav className={styles.nav} aria-label="メインナビゲーション">
          <Link href="/" className={styles.brand}>
            <span className={styles.logo}>
              <BoxIcon className={styles.logoIcon} />
            </span>
            <span className={styles.brandName}>Banana Stock</span>
          </Link>
          <span className={styles.navBadge}>STOCK MANAGER</span>
        </nav>

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>MY PANTRY</p>
            <h1 className={styles.title}>Item一覧</h1>
            <p className={styles.intro}>
              おうちにあるものを、すっきり見やすく。今の在庫をひと目で確認できます。
            </p>
          </div>
          <div className={styles.headerActions}>
            {!isLoading && !errorMessage && (
              <div className={styles.count}>
                <span className={styles.countNumber}>{items.length}</span>
                <span>アイテム</span>
              </div>
            )}
            <button
              type="button"
              className={styles.locationAddButton}
              onClick={openLocationCreateModal}
            >
              <span aria-hidden="true">＋</span>
              保管場所
            </button>
            <Link href="/items/new" className={styles.addButton}>
              <span aria-hidden="true">＋</span>
              Itemを追加
            </Link>
          </div>
        </header>

        {deleteError && (
          <div
            className={styles.deleteError}
            ref={deleteErrorRef}
            role="alert"
            tabIndex={-1}
          >
            <span aria-hidden="true">!</span>
            <p>{deleteError}</p>
          </div>
        )}

        {isLoading ? (
          /* データ取得中はカード型のスケルトンを表示する */
          <section
            className={styles.grid}
            aria-label="読み込み中"
            aria-busy="true"
          >
            {[0, 1, 2].map((item) => (
              <div key={item} className={styles.skeleton}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonPanel} />
                <div className={styles.skeletonLine} />
              </div>
            ))}
          </section>
        ) : errorMessage ? (
          /* 取得に失敗した場合は再取得できるエラー画面を表示する */
          <section className={styles.state}>
            <span className={styles.errorIcon}>!</span>
            <h2 className={styles.stateTitle}>読み込めませんでした</h2>
            <p className={styles.stateText}>{errorMessage}</p>
            <button
              onClick={() => void retryPageData()}
              className={styles.retry}
            >
              もう一度試す
            </button>
          </section>
        ) : locations.length === 0 && unassignedItems.length === 0 ? (
          /* LocationもItemも存在しない場合はLocation作成を案内する */
          <section className={`${styles.state} ${styles.stateEmpty}`}>
            <BoxIcon className={styles.emptyIcon} />
            <h2 className={styles.stateTitle}>保管場所がまだありません</h2>
            <p className={styles.stateText}>
              Itemを整理する保管場所を登録してください。
            </p>
            <button
              type="button"
              className={styles.emptyAddButton}
              onClick={openLocationCreateModal}
            >
              <span aria-hidden="true">＋</span>
              最初の保管場所を追加
            </button>
          </section>
        ) : (
          /* Locationごとに見出しと所属Itemのカードを表示する */
          <section
            className={styles.locationList}
            aria-label="LocationごとのItem一覧"
          >
            {locationGroups.map((group) => (
              <section
                className={styles.locationSection}
                key={group.location.id}
              >
                <header className={styles.locationHeader}>
                  <div className={styles.locationIdentity}>
                    <span className={styles.locationIcon} aria-hidden="true">
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
                        />
                        <circle cx="12" cy="9" r="2.3" />
                      </svg>
                    </span>
                    <div className={styles.locationDetails}>
                      <p className={styles.locationLabel}>STORAGE</p>
                      {editingLocationId === group.location.id ? (
                        <div className={styles.locationEdit}>
                          <label
                            className={styles.visuallyHidden}
                            htmlFor={`location-name-${group.location.id}`}
                          >
                            保管場所名
                          </label>
                          <div className={styles.locationEditControls}>
                            <input
                              id={`location-name-${group.location.id}`}
                              className={styles.locationEditInput}
                              type="text"
                              value={editingLocationName}
                              onChange={(event) =>
                                setEditingLocationName(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void handleLocationUpdate();
                                }

                                if (event.key === "Escape") {
                                  cancelLocationEdit();
                                }
                              }}
                              disabled={isLocationUpdating}
                              aria-invalid={Boolean(locationUpdateError)}
                              aria-describedby={
                                locationUpdateError
                                  ? `location-update-error-${group.location.id}`
                                  : undefined
                              }
                              autoFocus
                            />

                            <button
                              type="button"
                              className={styles.locationSaveButton}
                              onClick={() => void handleLocationUpdate()}
                              disabled={
                                isLocationUpdating ||
                                !editingLocationName.trim()
                              }
                            >
                              {isLocationUpdating ? "保存中…" : "保存"}
                            </button>

                            <button
                              type="button"
                              className={styles.locationCancelButton}
                              onClick={cancelLocationEdit}
                              disabled={isLocationUpdating}
                            >
                              キャンセル
                            </button>
                          </div>

                          {locationUpdateError && (
                            <p
                              id={`location-update-error-${group.location.id}`}
                              className={styles.locationEditError}
                              role="alert"
                            >
                              {locationUpdateError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className={styles.locationNameRow}>
                          <h2 className={styles.locationTitle}>
                            {group.location.name}
                          </h2>
                          <button
                            type="button"
                            className={styles.locationEditButton}
                            onClick={() => startLocationEdit(group.location)}
                            disabled={
                              isLocationUpdating || editingLocationId !== null
                            }
                            aria-label={`${group.location.name}の名前を編集`}
                          >
                            編集
                          </button>
                        </div>
                      )}
                    </div>
                    <span className={styles.locationCount}>
                      {group.items.length}
                    </span>
                  </div>

                  <div className={styles.locationActions}>
                    <button
                      type="button"
                      className={styles.groupAddButton}
                      onClick={() => openQuickCreateModal(group.location)}
                    >
                      <span aria-hidden="true">＋</span>
                      Itemを追加
                    </button>
                    <button
                      type="button"
                      className={styles.locationDeleteButton}
                      onClick={() =>
                        void handleLocationDelete(group.location.id)
                      }
                      disabled={isDeleting}
                    >
                      保管場所を削除
                    </button>
                  </div>
                </header>

                {group.items.length === 0 ? (
                  <div className={styles.groupEmpty}>
                    <BoxIcon className={styles.groupEmptyIcon} />
                    <p>この保管場所にはItemがありません。</p>
                  </div>
                ) : (
                  <div className={styles.grid}>
                    {group.items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                        onQuantityChange={handleQuantityChange}
                        isQuantityUpdating={updatingQuantityItemIds.has(
                          item.id,
                        )}
                        isQuantityUpdateDisabled={updatingQuantityItemIds.has(
                          item.id,
                        )}
                        quantityUpdateError={
                          quantityUpdateError?.itemId === item.id
                            ? quantityUpdateError.message
                            : null
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}

            {unassignedItems.length > 0 && (
              /* Locationに紐づいていないItemは専用のグループへ表示する */
              <section className={styles.locationSection}>
                <header className={styles.locationHeader}>
                  <div className={styles.locationIdentity}>
                    <span className={styles.locationIcon} aria-hidden="true">
                      <BoxIcon />
                    </span>

                    <div>
                      <p className={styles.locationLabel}>STORAGE</p>
                      <h2 className={styles.locationTitle}>保管場所 未設定</h2>
                    </div>

                    <span className={styles.locationCount}>
                      {unassignedItems.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={styles.groupAddButton}
                    onClick={() => openQuickCreateModal(null)}
                  >
                    <span aria-hidden="true">＋</span>
                    Itemを追加
                  </button>
                </header>

                <div className={styles.grid}>
                  {unassignedItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                      isDeleting={isDeleting}
                      onQuantityChange={handleQuantityChange}
                      isQuantityUpdating={updatingQuantityItemIds.has(item.id)}
                      isQuantityUpdateDisabled={updatingQuantityItemIds.has(
                        item.id,
                      )}
                      quantityUpdateError={
                        quantityUpdateError?.itemId === item.id
                          ? quantityUpdateError.message
                          : null
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </section>
        )}
      </div>
      <ItemQuickModal
        isOpen={isQuickCreateModalOpen}
        location={selectedLocation}
        onClose={closeQuickCreateModal}
        onCreated={handleItemCreated}
      />
      <LocationCreateModal
        isOpen={isLocationCreateModalOpen}
        onClose={closeLocationCreateModal}
        onCreate={(name) => void handleLocationCreate(name)}
        error={locationCreateError}
        isSubmitting={isLocationCreating}
      />
      {/* //TODO コンポーネントにする */}
      {addedItemNotice && (
        <div
          className={styles.addedItemNotice}
          key={addedItemNotice.id}
          role="status"
          aria-live="polite"
        >
          <span className={styles.noticeIcon} aria-hidden="true">
            ✓
          </span>
          <div className={styles.noticeBody}>
            <p className={styles.noticeTitle}>
              「{addedItemNotice.itemName}」を追加しました
            </p>
            <p className={styles.noticeLocation}>
              追加先：{addedItemNotice.locationName}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
