import styles from "./SteamStorePanel.module.css";

const SteamStorePanel = ({ game }) => {
  const name = game?.name ?? "Unknown title";
  const description = game?.short_description ?? "Description unavailable.";
  const headerImage = game?.header_image ?? "";

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.thumbWrap}>
          {headerImage ? (
            <img className={styles.thumb} src={headerImage} alt={name} />
          ) : (
            <div className={styles.thumbPlaceholder} />
          )}
        </div>
        <div className={styles.textBlock}>
          <h2 className={styles.title}>{name}</h2>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Price</span>
          <span className={styles.slot} />
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Reviews</span>
          <span className={styles.slot} />
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Release</span>
          <span className={styles.slot} />
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Players</span>
          <span className={styles.slot} />
        </div>
      </div>
    </section>
  );
};

export default SteamStorePanel;
