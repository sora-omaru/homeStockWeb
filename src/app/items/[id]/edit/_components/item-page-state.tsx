import styles from "../page.module.scss";

export function InvalidItemState() {
  return (
    <section className={styles.state}>
      <span className={styles.errorIcon}>!</span>
      <h1 className={styles.stateTitle}>Item IDが正しくありません</h1>
      <p className={styles.stateText}>一覧からItemを選び直してください。</p>
    </section>
  );
}

export function ItemLoadingState() {
  return (
    <section
      className={styles.skeleton}
      aria-label="読み込み中"
      aria-busy="true"
    >
      <div className={styles.skeletonHeading} />
      <div className={styles.skeletonStock} />
      <div className={styles.skeletonGrid} />
    </section>
  );
}

export function ItemLoadErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className={styles.state}>
      <span className={styles.errorIcon}>!</span>
      <h1 className={styles.stateTitle}>読み込めませんでした</h1>
      <p className={styles.stateText}>{message}</p>
      <button type="button" onClick={onRetry} className={styles.retry}>
        もう一度試す
      </button>
    </section>
  );
}
