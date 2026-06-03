import RevealWrapper from "./reveal-wrapper";
import styles from "./release-date-block.module.css";

const ReleaseDateBlock = ({ releaseDate, isRevealed = false }) => {
  return (
    <div className={styles.releaseDateBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Release date"}>
        <div className={styles.row}>
          <span className={styles.label}>Released</span>
          <span className={styles.value}>{releaseDate}</span>
        </div>
      </RevealWrapper>
    </div>
  );
};

export default ReleaseDateBlock;
