import styles from "./question-card.module.css";

const QuestionCard = ({ question = "Which game costs more?" }) => {
  return (
    <div className={styles.card}>
      <div className={styles.question}>{question}</div>
    </div>
  );
};

export default QuestionCard;
