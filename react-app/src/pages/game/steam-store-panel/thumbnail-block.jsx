import RevealWrapper from "./reveal-wrapper";
import styles from "./thumbnail-block.module.css";

const ThumbnailBlock = ({ imageSrc, title, isRevealed = false }) => {
  return (
    <div className={styles.thumbnailBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Thumbnail"}>
        <img className={styles.thumbnail} src={imageSrc} alt={title} />
      </RevealWrapper>
    </div>
  );
};

export default ThumbnailBlock;
