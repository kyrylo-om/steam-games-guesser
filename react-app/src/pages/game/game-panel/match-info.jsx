import styles from "./match-info.module.css";

const MatchInfo = ({ revealPercent, score, leftGame, rightGame, round }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.matchupTitle}>
          {leftGame?.game?.name ?? "?"} vs {rightGame?.game?.name ?? "?"}
        </span>
        <span className={styles.round}>Round {round}</span>
      </div>
      <div className={styles.container}>
      <div className={styles.revealBlock}>
        <span className={styles.label}>Revealed:</span>
        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${revealPercent}%` }}
            />
          </div>
          <span className={styles.progressValue}>{revealPercent}%</span>
        </div>
      </div>
      <div className={styles.scoreBlock}>
        <span className={styles.label}>Score:</span>
        <span className={styles.scoreValue}>{score}</span>
      </div>
    </div>
    </div>
  );
};

export default MatchInfo;