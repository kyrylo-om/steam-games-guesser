import styles from "./placeholder.module.css";

const Placeholder = ({ text, isPulsing = false }) => {
  return (
    <div
      className={`${styles.placeholder} ${isPulsing ? styles.pulsing : ""}`}
      aria-hidden="true"
    >
      <span className={styles.placeholderText}>[{text}]</span>
    </div>
  );
};

export default Placeholder;
