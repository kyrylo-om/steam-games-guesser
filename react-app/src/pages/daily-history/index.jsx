import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./daily-history.module.css";

const API_BASE = "https://steam-db-updater.kyrylo-omelianchuk.workers.dev";

const DailyHistory = () => {
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await fetch(`${API_BASE}/daily-history`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load history: ${response.status}`);
        }

        const payload = await response.json();
        setDates(payload.dates ?? []);
      } catch (error) {
        if (error.name === "AbortError") return;
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    return () => controller.abort();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <main className={styles.page}>Loading history...</main>;
  }

  if (isError) {
    return <main className={styles.page}>Unable to load match history.</main>;
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Daily Match History</h1>

      {dates.length === 0 ? (
        <p className={styles.empty}>No matches yet.</p>
      ) : (
        <ul className={styles.list}>
          {dates.map((dateStr) => (
            <li key={dateStr}>
              <button
                className={styles.item}
                onClick={() => navigate(`/daily/${dateStr}`)}
              >
                <span className={styles.dateLabel}>{formatDate(dateStr)}</span>
                <span className={styles.dateValue}>{dateStr}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default DailyHistory;