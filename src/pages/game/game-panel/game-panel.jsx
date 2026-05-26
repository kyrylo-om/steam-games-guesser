import AppHeader from "../../../components/app-header";
import CardHolder from "./card-holder";
import PowerUpContainer from "./power-up-container";
import styles from "./game-panel.module.css";

const GamePanel = () => {
  return (
    <aside className={styles.spine}>
      <AppHeader />
      <section className={styles.stack}>
        <section className={styles.matchup}>
          <div className={styles.matchupTitle}>Game A vs. Game B</div>
          <div className={styles.round}>Round 1</div>
        </section>
        <section className={styles.stats}>
          <div className={styles.progressBlock}>
            <span className={styles.label}>Revealed:</span>
            <div className={styles.progressRow}>
              <span className={styles.progressValue}>30%</span>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: "30%" }} />
              </div>
            </div>
          </div>
          <div className={styles.scoreBlock}>
            <span className={styles.label}>Score:</span>
            <span className={styles.scoreValue}>9800</span>
          </div>
        </section>
      </section>
      <CardHolder />
    </aside>
  );
};

export default GamePanel;
