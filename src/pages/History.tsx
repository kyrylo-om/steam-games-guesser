import styles from "./History.module.css";

const History: React.FC = () => {
  return (
    <section className={styles.page}>
      <h1>History</h1>
      <p>
        Past guesses, performance, and walkthroughs will be summarized here.
      </p>
    </section>
  );
};

export default History;
