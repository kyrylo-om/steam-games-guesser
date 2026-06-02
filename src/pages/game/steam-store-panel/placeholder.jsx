import styles from "./placeholder.module.css";

const Placeholder = ({ text }) => {
  return (
    <div className={styles.placeholder} aria-hidden="true">
      <span className={styles.placeholderText}>[{text}]</span>
    </div>
  );
};

export default Placeholder;
