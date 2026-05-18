import AppHeader from "../components/AppHeader";
import styles from "./Freeplay.module.css";

const Freeplay = () => {
  return (
    <main className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <h1 className={styles.title}>Not yet</h1>
        <p className={styles.copy}>Under construction.</p>
      </div>
    </main>
  );
};

export default Freeplay;
