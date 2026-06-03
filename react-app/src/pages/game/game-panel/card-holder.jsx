import QuestionCard from "./question-card";
import styles from "./card-holder.module.css";

const CardHolder = () => {
  return (
    <section className={styles.panel}>
      <QuestionCard question="Which game costs more?" />
    </section>
  );
};

export default CardHolder;
