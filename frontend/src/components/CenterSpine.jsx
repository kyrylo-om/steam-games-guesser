import AppHeader from "./AppHeader";
import QuestionCard from "./QuestionCard";
import PowerUpPanel from "./PowerUpPanel";
import styles from "./CenterSpine.module.css";

const CenterSpine = ({
  clue,
  correctSide,
  currentRound,
  isComplete,
  isAnswered,
  onNextRound,
  prompt,
  score,
  selectedSide,
  totalRounds,
}) => {
  const progressPercent = totalRounds
    ? Math.round(((currentRound - 1) / totalRounds) * 100)
    : 0;
  const isCorrectAnswer = correctSide ? correctSide === selectedSide : null;

  const renderClue = () => {
    if (!clue) {
      return <div className={styles.clueEmpty}>No clue available.</div>;
    }

    if (clue.type === "screenshot") {
      return (
        <div className={styles.clueMediaCard}>
          {clue.screenshot?.path_full ? (
            <img
              className={styles.clueImage}
              src={clue.screenshot.path_full}
              alt="Screenshot clue"
            />
          ) : (
            <div className={styles.clueEmpty}>Screenshot missing.</div>
          )}
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

    return <div className={styles.clueEmpty}>No clue available.</div>;
  };

  return (
    <aside className={styles.spine}>
      <AppHeader />
      <section className={styles.stack}>
        <section className={styles.matchup}>
          <div className={styles.matchupTitle}>Game A vs. Game B</div>
          <div className={styles.round}>Round {currentRound}</div>
        </section>
        <QuestionCard
          question={isComplete ? "Daily challenge complete" : prompt}
        />
        <section className={styles.cluePanel}>
          <div className={styles.label}>Clue</div>
          {renderClue()}
        </section>
        <section className={styles.stats}>
          <div className={styles.progressBlock}>
            <span className={styles.label}>Revealed:</span>
            <div className={styles.progressRow}>
              <span className={styles.progressValue}>{progressPercent}%</span>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className={styles.scoreBlock}>
            <span className={styles.label}>Score:</span>
            <span className={styles.scoreValue}>{score}</span>
          </div>
        </section>
        {isComplete ? (
          <section className={styles.answerState} data-correct="true">
            <div className={styles.answerLabel}>
              All questions answered. Final score: {score}/{totalRounds}
            </div>
          </section>
        ) : isAnswered ? (
          <section
            className={styles.answerState}
            data-correct={isCorrectAnswer}
          >
            <div className={styles.answerBanner} data-correct={isCorrectAnswer}>
              {isCorrectAnswer === null
                ? "Answered"
                : isCorrectAnswer
                  ? "Correct answer"
                  : "Wrong answer"}
            </div>
            <div className={styles.answerDetails}>
              <span>
                Your pick: {selectedSide === "left" ? "Left" : "Right"}
              </span>
              <span>
                Correct side: {correctSide === "left" ? "Left" : "Right"}
              </span>
            </div>
            <button
              className={styles.nextButton}
              onClick={onNextRound}
              type="button"
            >
              {currentRound >= totalRounds ? "Finish" : "Next round"}
            </button>
          </section>
        ) : (
          <section className={styles.answerState}>
            <div className={styles.answerLabel}>Pick a side to answer</div>
          </section>
        )}
      </section>
      <PowerUpPanel />
    </aside>
  );
};

export default CenterSpine;
