import { useNavigate } from "react-router-dom";
import styles from "./home.module.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Steam Showdown</h1>
        <p className={styles.subtitle}>
          Two Steam games, side by side. Answer related questions and reveal their store pages as you go.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={() => navigate("/play")}
        >
          Play Random
        </button>

        <button
          className={styles.primaryButton}
          onClick={() => navigate("/daily")}
        >
          Play Daily
        </button>

        <button
          className={styles.historyButton}
          onClick={() => navigate("/daily-history")}
        >
          Daily Match History
        </button>
      </div>
    </main>
  );
};

export default Home;