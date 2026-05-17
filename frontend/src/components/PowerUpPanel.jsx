import styles from "./PowerUpPanel.module.css";

const PowerUpPanel = () => {
  return (
    <section className={styles.panel}>
      <p className={styles.title}>Power-ups</p>
      <div className={styles.slot}>Empty</div>
    </section>
  );
};

export default PowerUpPanel;
