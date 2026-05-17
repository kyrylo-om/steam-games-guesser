import EmptySlot from "./EmptySlot";
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
  const showInfoSection =
    showDeveloper && showPublisher && showReleaseDate;
  const showReviewsSection = showReviews && showReviewSentiment;

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
      <div className={styles.thumbnailWrapper}>
        {showMedia ? (
          <img className={styles.thumbnail} src={headerImage} alt={name} />
        ) : (
          <EmptySlot />
        )}
      </div>

      <div className={styles.content}>
        <h1 className={styles.gameName}>{name}</h1>

        {showInfoSection ? (
          <div className={styles.info}>
            <ul className={styles.infoKeys}>
              <li>Developer</li>
              <li>Publisher</li>
              <li>Released</li>
            </ul>

            <ul className={styles.infoValues}>
              <li className={styles.infoValue}>
                {game.developers?.join(", ")}
              </li>
              <li className={styles.infoValue}>
                {game.publishers?.join(", ")}
              </li>
              <li className={styles.infoValue}>{game.release_date}</li>
            </ul>
          </div>
        ) : (
          <EmptySlot />
        )}

        <p className={styles.description}>{description}</p>

        <div className={styles.reviews}>
          {showReviewsSection ? (
            <>
              Reviews:{" "}
              <span
                className={`${styles.reviewScoreDesc} ${_reviewColorClass(reviewScoreDesc)}`}
              >
                {reviewScoreDesc}
              </span>
              {" ("}
              <span className={styles.reviewSentiment}>
                {game.review_sentiment}
              </span>
              {" of "}
              <span className={styles.reviewCount}>{formattedReviewCount}</span>
              {")"}
            </>
          ) : (
            <EmptySlot />
          )}
        </div>

        <div className={styles.carouselWrapper}>
          {showMedia ? (
            <SteamStoreCarousel game={game} headerImage={headerImage} />
          ) : (
            <EmptySlot />
          )}
        </div>

        <div className={styles.purchaseContainer}>
          {showPrice ? (
            <>
              <span className={styles.purchaseText}>Buy {name}</span>
              <div className={styles.priceContainer}>
                <span className={styles.priceButton}>Price:</span>
                <span className={styles.price}>{game.price}</span>
              </div>
            </>
          ) : (
            <EmptySlot />
          )}
        </div>

        <div className={styles.achievementsContainer}>
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
            <EmptySlot />
          )}
        </div>
      </div>
    </section>
  );
};

export default SteamStorePanel;
