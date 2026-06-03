import RevealWrapper from "./reveal-wrapper";
import styles from "./reviews-block.module.css";

const ReviewsBlock = ({ reviewCount, reviewScoreDesc, reviewSentiment, isRevealed = false }) => {
  const formattedReviewCount = Number.isFinite(reviewCount)
    ? reviewCount.toLocaleString()
    : "0";

  const reviewColorClass = (desc) => {
    if (!desc) return styles.reviewMixed;
    const normalized = String(desc).toLowerCase();
    if (normalized.includes("positive")) return styles.reviewPositive;
    if (normalized.includes("mixed")) return styles.reviewMixed;
    if (normalized.includes("negative")) return styles.reviewNegative;
    return styles.reviewMixed;
  };

  return (
    <div className={styles.reviewsBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Reviews"}>
        <div className={styles.reviews}>
          Reviews:
          <span
            className={`${styles.reviewScoreDesc} ${reviewColorClass(reviewScoreDesc)}`}
          >
            {" "}
            {reviewScoreDesc}
          </span>
          {" ("}
          <span className={styles.reviewSentiment}>{reviewSentiment}%</span>
          {" of "}
          <span className={styles.reviewCount}>{reviewCount}</span>
          {")"}
        </div>
      </RevealWrapper>
    </div>
  );
};

export default ReviewsBlock;
