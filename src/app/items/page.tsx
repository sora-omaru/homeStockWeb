"use client";

import { deleteItem, getItems } from "@/lib/api/item";
import { getItemDeleteErrorMessage } from "@/lib/api/error/error-item";
import { getLocations } from "@/lib/api/location/location";
import { ItemResponse } from "@/types/item";
import { LocationResponseDto } from "@/types/location/location";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BoxIcon } from "../component/icons";
import ItemQuickModal from "../component/itemQuickCreateModal";
import ItemCard from "./itemsCard";
import styles from "./page.module.scss";

type AddedItemNotice = {
  id: number;
  itemName: string;
  locationName: string;
};

export default function ItemsPage() {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResponseDto | null>(null);
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
  const [addedItemNotice, setAddedItemNotice] =
    useState<AddedItemNotice | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteErrorRef = useRef<HTMLDivElement>(null);

  const [isDeleting, setIsDeleteing] = useState<boolean>(false);
  function openQuickCreateModal(location: LocationResponseDto | null) {
    setSelectedLocation(location);
    setIsQuickCreateModalOpen(true);
  }

  function closeQuickCreateModal() {
    setIsQuickCreateModalOpen(false);
  }

  function handleItemCreated(item: ItemResponse) {
    setItems((currentItems) => [...currentItems, item]);
    setAddedItemNotice({
      id: Date.now(),
      itemName: item.name,
      locationName: selectedLocation?.name ?? "保管場所 未設定",
    });
    setIsQuickCreateModalOpen(false);
  }
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

  async function retryPageData() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [itemsResponse, locationsResponse] = await Promise.all([
        getItems(),
        getLocations(),
      ]);

      setItems(itemsResponse);
      setLocations(locationsResponse);
    } catch (error) {
      console.error(error);
      setErrorMessage("一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }
  //TODO 後でコンポーネントにする
  useEffect(() => {
    if (!addedItemNotice) return;

    const timeoutId = window.setTimeout(() => {
      setAddedItemNotice(null);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [addedItemNotice]);

  useEffect(() => {
    if (!deleteError) return;

    deleteErrorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    deleteErrorRef.current?.focus({ preventScroll: true });
  }, [deleteError]);

  useEffect(() => {
    let isActive = true;

    Promise.all([getItems(), getLocations()])
      .then(([itemsResponse, locationResponse]) => {
        if (!isActive) return;

        setItems(itemsResponse);
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
  }, []);

  const knownLocationIds = new Set(locations.map((location) => location.id));
  const locationGroups = locations.map((location) => ({
    location,
    items: items.filter((item) => item.locationId === location.id),
  }));
  const unassignedItems = items.filter(
    (item) =>
      item.locationId === null || !knownLocationIds.has(item.locationId),
  );

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
          <section className={`${styles.state} ${styles.stateEmpty}`}>
            <BoxIcon className={styles.emptyIcon} />
            <h2 className={styles.stateTitle}>保管場所がまだありません</h2>
            <p className={styles.stateText}>
              Itemを整理する保管場所を登録してください。
            </p>
          </section>
        ) : (
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
                    <div>
                      <p className={styles.locationLabel}>STORAGE</p>
                      <h2 className={styles.locationTitle}>
                        {group.location.name}
                      </h2>
                    </div>
                    <span className={styles.locationCount}>
                      {group.items.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={styles.groupAddButton}
                    onClick={() => openQuickCreateModal(group.location)}
                  >
                    ＋追加
                  </button>
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
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}

            {unassignedItems.length > 0 && (
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
