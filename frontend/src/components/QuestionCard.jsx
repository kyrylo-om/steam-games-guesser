import styles from "./QuestionCard.module.css";

const QuestionCard = ({ question = "Which game costs more?", clue }) => {
  const hasClue = Boolean(clue);
  const cardClassName = hasClue
    ? `${styles.card} ${styles.cardWithClue}`
    : styles.card;

  const renderClue = () => {
    if (!clue) {
      return null;
    }

    if (clue.type === "screenshot") {
      if (!clue.screenshot?.path_full) {
        return <div className={styles.clueEmpty}>Screenshot missing.</div>;
      }

      return (
        <div className={styles.clueMedia}>
          <img
            className={styles.clueImage}
            src={clue.screenshot.path_full}
            alt="Screenshot clue"
          />
        </div>
      );
    }

    if (clue.type === "developer") {
      return <div className={styles.clueTag}>{clue.developer}</div>;
    }

    if (clue.type === "review") {
      return (
        <div className={styles.clueReviewCard}>
          <div className={styles.clueReviewMeta}>
            <span>
              {clue.review?.author?.personaname ?? "Unknown reviewer"}
            </span>
            <span>{clue.review?.author?.playtime_forever ?? 0} min played</span>
          </div>
          <p className={styles.clueReviewText}>
            {clue.review?.review ?? "Review missing."}
          </p>
        </div>
      );
    }

    if (clue.type === "achievement") {
      return (
        <div className={styles.clueAchievementCard}>
          {clue.achievement?.path ? (
            <img
              className={styles.clueAchievementImage}
              src={clue.achievement.path}
              alt={clue.achievement.localized_name ?? "Achievement clue"}
            />
          ) : null}
          <span className={styles.clueAchievementName}>
            {clue.achievement?.localized_name ?? "Achievement missing"}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cardClassName}>
      <div className={styles.question}>{question}</div>
      {renderClue()}
    </div>
  );
};

export default QuestionCard;
