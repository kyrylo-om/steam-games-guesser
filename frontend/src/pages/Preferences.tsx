import styles from "./Preferences.module.css";

const Preferences: React.FC = () => {
  return (
    <section className={styles.page}>
      <h1>Preferences</h1>
      <p>Adjust difficulty, notifications, and accessibility settings here.</p>
    </section>
  );
};

export default Preferences;
