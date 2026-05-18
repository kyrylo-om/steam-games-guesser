import QuestionCard from "./QuestionCard";
import styles from "./CardHolder.module.css";

const CardHolder = ({ question, clue, questionKey, stepIndex, stepCount }) => {
  return (
    <section className={styles.panel}>
      <QuestionCard
        key={questionKey}
        question={question}
        clue={clue}
        stepIndex={stepIndex}
        stepCount={stepCount}
      />
    </section>
  );
};

export default CardHolder;
