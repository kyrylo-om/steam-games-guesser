import RevealWrapper from "./reveal-wrapper";
import styles from "./thumbnail-block.module.css";

const ThumbnailBlock = ({ imageSrc, title, isRevealed = false, isPending = false }) => {
  return (
    <div className={styles.thumbnailBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Thumbnail"} isPending={isPending}>
        <img className={styles.thumbnail} src={imageSrc} alt={title} />
      </RevealWrapper>
    </div>
  );
};

export default ThumbnailBlock;
