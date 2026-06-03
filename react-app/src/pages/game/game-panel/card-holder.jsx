import QuestionCard from "./question-card";
import ExtendedQuestionCard from "./extended-question-card";
import styles from "./card-holder.module.css";

const CardHolder = ({ question, leftGame, rightGame, subIndex }) => {
  const hasSubquestions =
    question?.data &&
    Array.isArray(question.data) &&
    ["screenshots", "achievements", "reviews"].includes(question.type);

  return (
    <section className={styles.panel}>
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
    </section>
  );
};

export default CardHolder;
