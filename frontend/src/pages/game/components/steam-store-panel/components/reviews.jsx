const Reviews = ({ reviewCount, reviewDescription, reviewSentiment }) => {
    <div className={styles.reviews}>
        Reviews:
        <span
        className={`${styles.reviewScoreDesc} ${_reviewColorClass(reviewScoreDesc)}`}
        >
        {" "}
        {reviewScoreDesc}
        </span>
        {" ("}
        <span className={styles.reviewSentiment}>
        {game.review_sentiment}
        </span>
        {" of "}
        <span className={styles.reviewCount}>{formattedReviewCount}</span>
        {")"}
    </div>
}