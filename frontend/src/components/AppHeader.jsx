import styles from "./AppHeader.module.css";

const AppHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>SS</div>
      <div className={styles.title}>Steam Showdown</div>
    </header>
  );
};

export default AppHeader;
