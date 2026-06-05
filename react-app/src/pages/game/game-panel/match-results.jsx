import styles from "./match-results.module.css";

const MatchResults = ({ leftGame, rightGame, score, onNextMatch, mode }) => {
  return (
    <div className={styles.wrapper}>

      <div className={styles.steamLinks}>
        <div className={styles.header}>
          <span className={styles.title}>Match complete!</span>
        </div>
        <p>View on Steam:</p>
        <div className={styles.buttons}>
          <a
            className={styles.steamButton}
            href={`https://store.steampowered.com/app/${leftGame?.game?.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {leftGame?.game?.name ?? "?"}
          </a>
          <a
            className={styles.steamButton}
            href={`https://store.steampowered.com/app/${rightGame?.game?.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {rightGame?.game?.name ?? "?"}
          </a>
        </div>
      </div>

      <button className={styles.nextButton} onClick={onNextMatch}>
        {mode === "daily" ? "Back" : "Next match"}
      </button>
    </div>
  );
};

export default MatchResults;