import RevealWrapper from "./reveal-wrapper";
import styles from "./release-date-block.module.css";


const ReleaseDateBlock = ({ releaseDate, isRevealed = false, isPending = false }) => {
  const date = new Date(releaseDate);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };

  return (
    <div className={styles.releaseDateBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Release date"} isPending={isPending}>
        <div className={styles.row}>
          <span className={styles.label}>Released</span>
          <span className={styles.value}>{date.toLocaleDateString('en-US', options)}</span>
        </div>
      </RevealWrapper>
    </div>
  );
};

export default ReleaseDateBlock;
