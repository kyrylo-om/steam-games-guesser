import { useEffect, useRef, useState } from "react";
import QuestionCard from "./question-card";
import ExtendedQuestionCard from "./extended-question-card";
import styles from "./card-holder.module.css";

const CardHolder = ({ question, leftGame, rightGame, subIndex, onPickLeft, onPickRight, onHoverLeft, onHoverRight, onHoverEnd, disabled: disabledProp, feedback }) => {
  const [animationPhase, setAnimationPhase] = useState("idle");
  const [displayedQuestion, setDisplayedQuestion] = useState(question);
  const prevQuestionRef = useRef(question);

  const hasSubquestions =
    displayedQuestion?.data &&
    (displayedQuestion.type === "devlishers" ||
     (Array.isArray(displayedQuestion.data) &&
      ["screenshots", "achievements", "reviews"].includes(displayedQuestion.type)));

  useEffect(() => {
    if (question !== prevQuestionRef.current) {
      setAnimationPhase("exiting");

      const exitTimer = setTimeout(() => {
        setDisplayedQuestion(question);
        setAnimationPhase("entering");
      }, 900);

      const enterTimer = setTimeout(() => {
        setAnimationPhase("idle");
      }, 1500);

      prevQuestionRef.current = question;

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(enterTimer);
      };
    }
  }, [question]);

  const disabled = disabledProp;

  return (
    <section className={styles.panel} data-disabled={disabled} data-feedback={animationPhase === "exiting" ? feedback : ""}>
      <div className={`${styles.content} ${animationPhase !== "idle" ? styles[animationPhase] : ""}`}>
        {hasSubquestions ? (
          <ExtendedQuestionCard
            question={displayedQuestion.question}
            data={displayedQuestion.data}
            correct={displayedQuestion.correct}
            type={displayedQuestion.type}
            leftGame={leftGame}
            rightGame={rightGame}
            subIndex={subIndex}
          />
        ) : (
          <QuestionCard question={displayedQuestion?.question} />
        )}
      </div>

      <button
        className={styles.overlayLeft}
        onClick={onPickLeft}
        onMouseEnter={onHoverLeft}
        onMouseLeave={onHoverEnd}
        disabled={disabled}
        type="button"
      >
        <span className={styles.arrow}>❰</span>
      </button>
      <button
        className={styles.overlayRight}
        onClick={onPickRight}
        onMouseEnter={onHoverRight}
        onMouseLeave={onHoverEnd}
        disabled={disabled}
        type="button"
      >
        <span className={styles.arrow}>❱</span>
      </button>
    </section>
  );
};

export default CardHolder;
