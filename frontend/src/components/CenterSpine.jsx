import styles from "./CenterSpine.module.css";

const CenterSpine = ({ prompt }) => {
  return (
    <aside className={styles.spine}>
      <div className={styles.prompt}>{prompt}</div>
    </aside>
  );
};

export default CenterSpine;
