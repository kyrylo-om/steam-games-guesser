import QuestionCard from "./question-card";
import ExtendedQuestionCard from "./extended-question-card";
import styles from "./card-holder.module.css";

const CardHolder = ({ question, leftGame, rightGame, subIndex, onPickLeft, onPickRight, disabled }) => {
  const hasSubquestions =
    question?.data &&
    Array.isArray(question.data) &&
    ["screenshots", "achievements", "reviews"].includes(question.type);

  return (
    <section className={styles.panel}>
      <div className={styles.content}>
        {hasSubquestions ? (
          <ExtendedQuestionCard
            question={question.question}
            data={question.data}
            correct={question.correct}
            type={question.type}
            leftGame={leftGame}
            rightGame={rightGame}
            subIndex={subIndex}
          />
        ) : (
          <QuestionCard question={question?.question} />
        )}
      </div>

      <button
        className={styles.overlayLeft}
        onClick={onPickLeft}
        disabled={disabled}
        type="button"
      >
        <span className={styles.arrow}>&lt;</span>
      </button>
      <button
        className={styles.overlayRight}
        onClick={onPickRight}
        disabled={disabled}
        type="button"
      >
        <span className={styles.arrow}>&gt;</span>
      </button>
    </section>
  );
};

export default CardHolder;
