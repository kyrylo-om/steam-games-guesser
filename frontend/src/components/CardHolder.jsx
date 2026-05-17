import QuestionCard from "./QuestionCard";
import styles from "./CardHolder.module.css";

const CardHolder = () => {
  return (
    <section className={styles.panel}>
      <QuestionCard question="Which game costs more?" />
    </section>
  );
};

export default CardHolder;
