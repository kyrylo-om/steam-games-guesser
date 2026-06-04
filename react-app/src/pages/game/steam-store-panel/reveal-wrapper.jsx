import Placeholder from "./placeholder";
import styles from "./reveal-wrapper.module.css";

const RevealWrapper = ({ isRevealed, placeholderText, isPending = false, children }) => {
  const isVisible = Boolean(isRevealed);
  const isPulsing = isPending && !isVisible;

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
        <Placeholder text={placeholderText} isPulsing={isPulsing} />
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
