import AppHeader from "./AppHeader";
import CardHolder from "./CardHolder";
import styles from "./CenterSpine.module.css";

const CenterSpine = ({
  clue,
  correctSide,
  currentRound,
  isComplete,
  isAnswered,
  questionIndex,
  questionStepIndex,
  questionStepCount,
  prompt,
  score,
  selectedSide,
  totalRounds,
}) => {
  const progressPercent = totalRounds
    ? Math.round((currentRound / totalRounds) * 100)
    : 0;
  const isCorrectAnswer = correctSide ? correctSide === selectedSide : null;

  const cardQuestion = isComplete ? "Daily challenge complete" : prompt;
  const cardClue = isComplete ? null : clue;

  return (
    <aside className={styles.spine}>
      <AppHeader />
      <section className={styles.stack}>
        <section className={styles.matchup}>
          <div className={styles.matchupTitle}>Game A vs. Game B</div>
          <div className={styles.round}>Round {currentRound}</div>
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
        <CardHolder
          question={cardQuestion}
          clue={cardClue}
          questionKey={`${questionIndex}-${questionStepIndex}`}
          stepIndex={questionStepIndex}
          stepCount={questionStepCount}
        />
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
          </section>
        ) : (
          <section className={styles.answerState}>
            <div className={styles.answerLabel}>Pick a side to answer</div>
          </section>
        )}
      </section>
    </aside>
  );
};

export default CenterSpine;
