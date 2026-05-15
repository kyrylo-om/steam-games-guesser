import styles from "./Feedback.module.css";

const Feedback: React.FC = () => {
  return (
    <section className={styles.page}>
      <h1>Feedback</h1>
      <p>Players can submit bug reports or feature ideas from here.</p>
    </section>
  );
};

export default Feedback;
