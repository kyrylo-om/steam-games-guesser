import styles from "./power-up-container.module.css";

const PowerUpContainer = () => {
  return (
    <section className={styles.panel}>
      <p className={styles.title}>Power-ups</p>
      <div className={styles.slot}>Empty</div>
    </section>
  );
};

export default PowerUpContainer;
