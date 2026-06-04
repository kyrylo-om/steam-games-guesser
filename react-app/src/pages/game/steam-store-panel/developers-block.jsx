import RevealWrapper from "./reveal-wrapper";
import styles from "./developers-block.module.css";

const DevelopersBlock = ({ developers, publishers, isRevealed = false, isPending = false }) => {
  const developerText = Array.isArray(developers) ? developers.join(", ") : "";
  const publisherText = Array.isArray(publishers) ? publishers.join(", ") : "";

  return (
    <div className={styles.developersBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Developers & Publishers"} isPending={isPending}>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.label}>Developer</span>
            <span className={styles.value}>{developerText}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Publisher</span>
            <span className={styles.value}>{publisherText}</span>
          </div>
        </div>
      </RevealWrapper>
    </div>
  );
};

export default DevelopersBlock;
