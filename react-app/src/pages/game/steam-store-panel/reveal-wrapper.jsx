import Placeholder from "./placeholder";
import styles from "./reveal-wrapper.module.css";

const RevealWrapper = ({ isRevealed, placeholderText, children }) => {
  const isVisible = Boolean(isRevealed);

  return (
    <div
      className={styles.revealWrapper}
      data-revealed={isVisible ? "true" : "false"}
    >
      <div
        className={styles.revealLayer}
        data-layer="placeholder"
        aria-hidden={isVisible}
      >
        <Placeholder text={placeholderText} />
      </div>
      <div
        className={styles.revealLayer}
        data-layer="content"
        aria-hidden={!isVisible}
      >
        {children}
      </div>
    </div>
  );
};

export default RevealWrapper;
