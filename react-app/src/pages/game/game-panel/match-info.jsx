import { useEffect, useRef, useState } from "react";
import styles from "./match-info.module.css";

const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

const animateNumber = (target, duration = 500) => {
  const [displayed, setDisplayed] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    const startValue = prevTarget.current;
    if (startValue === target) return;

    const startTime = performance.now();
    let rafId;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(startValue + (target - startValue) * easeOutQuad(progress));
      setDisplayed(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    prevTarget.current = target;

    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return displayed;
};

const MatchInfo = ({ revealPercent, score, leftGame, rightGame, round }) => {
  const animatedReveal = animateNumber(revealPercent, 500);
  const animatedScore = animateNumber(score, 500);

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
              style={{ width: `${animatedReveal}%` }}
            />
          </div>
          <span className={styles.progressValue}>{animatedReveal}%</span>
        </div>
      </div>
      <div className={styles.scoreBlock}>
        <span className={styles.label}>Score:</span>
        <span className={styles.scoreValue}>{animatedScore}</span>
      </div>
    </div>
    </div>
  );
};

export default MatchInfo;