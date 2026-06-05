import { useEffect, useState } from "react";
import styles from "./feedback-overlay.module.css";

const FeedbackOverlay = ({ feedback, duration = 1000 }) => {
  const [phase, setPhase] = useState("hidden");
  const animationDuration = 200;

  useEffect(() => {
    if (feedback) {
      setPhase("visible");
      const fadeTimer = setTimeout(() => setPhase("fading"), duration);
      const hideTimer = setTimeout(() => setPhase("hidden"), duration + 250);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setPhase("hidden");
    }
  }, [feedback, duration]);

  if (phase === "hidden") return null;

  const delay = animationDuration / 2;

  return (
    <div className={`${styles.overlay} ${styles[phase]}`}>
      <div className={styles.iconBox}>
        <svg className={styles.icon} viewBox="0 0 100 100" aria-hidden>
          {feedback === "correct" ? (
            <path
              className={styles.checkmark}
              d="M 17 59 L 42 78 L 80 28"
              fill="none"
              strokeWidth="20"
              style={{ animationDuration: `${animationDuration}ms` }}
            />
          ) : (
            <>
              <line
                className={styles.crossLine1}
                x1="22" y1="22"
                x2="78" y2="78"
                fill="none"
                strokeWidth="20"
                style={{ animationDuration: `${animationDuration}ms` }}
              />
              <line
                className={styles.crossLine2}
                x1="22" y1="78"
                x2="78" y2="22"
                fill="none"
                strokeWidth="20"
                style={{ animationDuration: `${animationDuration}ms`, animationDelay: `${delay}ms` }}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default FeedbackOverlay;