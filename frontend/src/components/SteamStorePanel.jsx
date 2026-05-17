import styles from "./SteamStorePanel.module.css";
import SteamStoreCarousel from "./SteamStoreCarousel";

const SteamStorePanel = ({ game, isRevealed = false, revealFields = [] }) => {
  const visibleFields = new Set(revealFields);
  const name = game.name;
  const description = game.short_description;
  const headerImage = game.header_image;
  const formattedReviewCount = Number(game.review_count ?? 0).toLocaleString();
  const reviewScoreDesc = game.review_score_desc;
  const achievementCount = game.achievements.total;
  const achievementIcons = Array.isArray(game?.achievements?.highlighted)
    ? game.achievements.highlighted
    : [];

  const showMedia = isRevealed && visibleFields.has("media");
  const showDeveloper = isRevealed && visibleFields.has("developer");
  const showPublisher =
    showDeveloper || (isRevealed && visibleFields.has("publisher"));
  const showReleaseDate = isRevealed && visibleFields.has("release_date");
  const showReviews = isRevealed && visibleFields.has("reviews");
  const showReviewSentiment =
    isRevealed && visibleFields.has("review_sentiment");
  const showPrice = isRevealed && visibleFields.has("price");
  const showAchievements = isRevealed && visibleFields.has("achievements");

  const _reviewColorClass = (desc) => {
    if (!desc) return styles.reviewMixed;
    const d = String(desc).toLowerCase();
    if (d.includes("positive")) return styles.reviewPositive;
    if (d.includes("mixed")) return styles.reviewMixed;
    if (d.includes("negative")) return styles.reviewNegative;
    return styles.reviewMixed;
  };

  return (
    <section className={styles.panel}>
      <div className={styles.thumbnailWrapper} data-visible={showMedia}>
        {showMedia ? (
          <img className={styles.thumbnail} src={headerImage} alt={name} />
        ) : (
          <div className={styles.mediaPlaceholder}>Answer to reveal media</div>
        )}
      </div>

      <div className={styles.content}>
        <h1 className={styles.gameName}>{name}</h1>

        <div className={styles.info}>
          <ul className={styles.infoKeys}>
            <li>Developer</li>
            <li>Publisher</li>
            <li>Released</li>
          </ul>

          <ul className={styles.infoValues}>
            <li className={styles.infoValue} data-visible={showDeveloper}>
              {showDeveloper
                ? game.developers?.join(", ")
                : "Hidden until answer"}
            </li>
            <li className={styles.infoValue} data-visible={showPublisher}>
              {showPublisher
                ? game.publishers?.join(", ")
                : "Hidden until answer"}
            </li>
            <li className={styles.infoValue} data-visible={showReleaseDate}>
              {showReleaseDate ? game.release_date : "Hidden until answer"}
            </li>
          </ul>
        </div>

        <p className={styles.description} data-visible={showMedia}>
          {showMedia ? description : "Answer to reveal description and media."}
        </p>

        <div
          className={styles.reviews}
          data-visible={showReviews || showReviewSentiment}
        >
          Reviews:
          <span
            className={`${styles.reviewScoreDesc} ${_reviewColorClass(reviewScoreDesc)}`}
          >
            {showReviewSentiment
              ? ` ${reviewScoreDesc}`
              : " Hidden until answer"}
          </span>
          {" ("}
          <span className={styles.reviewSentiment}>
            {showReviewSentiment ? game.review_sentiment : "Hidden"}
          </span>
          {" of "}
          <span className={styles.reviewCount}>
            {showReviews ? formattedReviewCount : "Hidden"}
          </span>
          {")"}
        </div>

        <div className={styles.carouselWrapper} data-visible={showMedia}>
          {showMedia ? (
            <SteamStoreCarousel game={game} headerImage={headerImage} />
          ) : (
            <div className={styles.carouselPlaceholder}>
              Carousel unlocks after answer
            </div>
          )}
        </div>

        <div className={styles.purchaseContainer}>
          <span className={styles.purchaseText}>Buy {name}</span>
          <div className={styles.priceContainer}>
            <span className={styles.priceButton}>Price:</span>
            <span className={styles.price} data-visible={showPrice}>
              {showPrice ? game.price : "Hidden"}
            </span>
          </div>
        </div>

        <div
          className={styles.achievementsContainer}
          data-visible={showAchievements}
        >
          {showAchievements ? (
            <>
              <div className={styles.achievementsTextContainer}>
                <span className={styles.achievementsText}>Achievements</span>
                <span className={styles.achievementCountText}>
                  {achievementCount}
                </span>
              </div>
              <div className={styles.achievementIconsContainer}>
                {achievementIcons.map((achievement, index) => {
                  const icon =
                    achievement?.path ||
                    (typeof achievement === "string" ? achievement : null);

                  if (!icon) return null;

                  return (
                    <img
                      key={achievement?.name || `${name}-achievement-${index}`}
                      className={styles.achievementIcon}
                      src={icon}
                      alt={achievement?.name || `Achievement ${index + 1}`}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.achievementsPlaceholder}>
              Answer to reveal achievements
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SteamStorePanel;
