import QuestionCard from "./QuestionCard";
import styles from "./CardHolder.module.css";

const CardHolder = ({ question, clue, questionKey }) => {
  return (
    <section className={styles.panel}>
      <QuestionCard key={questionKey} question={question} clue={clue} />
    </section>
  );
};

export default CardHolder;
