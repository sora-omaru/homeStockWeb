"use client";

import { getItems } from "@/lib/api/item";
import { getLocations } from "@/lib/api/location/location";
import { ItemResponse } from "@/types/item";
import { LocationResponseDto } from "@/types/location/location";
import Link from "next/link";
import { useEffect, useState } from "react";
import ItemCard from "./itemsCard";
import styles from "./page.module.scss";

function BoxIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 8-9 5-9-5m9 5v9m8-13.5v7a2 2 0 0 1-1 1.73l-6 3.5a2 2 0 0 1-2 0l-6-3.5A2 2 0 0 1 4 15.5v-7a2 2 0 0 1 1-1.73l6-3.5a2 2 0 0 1 2 0l6 3.5a2 2 0 0 1 1 1.73Z"
      />
    </svg>
  );
}

export default function ItemsPage() {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);

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
    id: String(location.id),
    name: location.name,
    items: items.filter((item) => item.locationId === location.id),
  }));
  const unassignedItems = items.filter(
    (item) =>
      item.locationId === null || !knownLocationIds.has(item.locationId),
  );

  if (unassignedItems.length > 0) {
    locationGroups.push({
      id: "unassigned",
      name: "保管場所 未設定",
      items: unassignedItems,
    });
  }

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
        ) : items.length === 0 ? (
          <section className={`${styles.state} ${styles.stateEmpty}`}>
            <BoxIcon className={styles.emptyIcon} />
            <h2 className={styles.stateTitle}>Itemはまだありません</h2>
            <p className={styles.stateText}>
              登録すると、ここにカードで表示されます。
            </p>
            <Link href="/items/new" className={styles.emptyAddButton}>
              最初のItemを登録
            </Link>
          </section>
        ) : (
          <section
            className={styles.locationList}
            aria-label="LocationごとのItem一覧"
          >
            {locationGroups.map((group) => (
                <section className={styles.locationSection} key={group.id}>
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
                        <h2 className={styles.locationTitle}>{group.name}</h2>
                      </div>
                      <span className={styles.locationCount}>
                        {group.items.length}
                      </span>
                    </div>

                    <Link href="/items/new" className={styles.groupAddButton}>
                      <span aria-hidden="true">＋</span>
                      Itemを追加
                    </Link>
                  </header>

                  {group.items.length === 0 ? (
                    <div className={styles.groupEmpty}>
                      <BoxIcon className={styles.groupEmptyIcon} />
                      <p>この保管場所にはItemがありません。</p>
                    </div>
                  ) : (
                    <div className={styles.grid}>
                      {group.items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </section>
              ))}
          </section>
        )}
      </div>
    </main>
  );
}
