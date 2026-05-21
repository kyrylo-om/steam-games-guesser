import styles from "./steam-store-panel.module.css";
import SteamStoreCarousel from "./components/steam-store-carousel";

const SteamStorePanel = ({ game }) => {
  const name = game.name;
  const description = game.short_description;
  const headerImage = game.header_image;
  const formattedReviewCount = game.review_count.toLocaleString();
  const reviewScoreDesc = game.review_score_desc;
  const achievementCount = game.achievements?.total;
  const achievementIcons = Array.isArray(game?.achievements?.highlighted)
    ? game.achievements.highlighted
    : [];

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
        <img className={styles.thumbnail} src={headerImage} alt={name} />
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
            <li className={styles.developers}>{game.developers.join(", ")}</li>
            <li className={styles.publishers}>{game.publishers.join(", ")}</li>
            <li>{game.release_date}</li>
          </ul>
        </div>

        <p className={styles.description}>{description}</p>

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

        <div className={styles.carouselWrapper}>
          <SteamStoreCarousel game={game} headerImage={headerImage} />
        </div>

        <div className={styles.purchaseContainer}>
          <span className={styles.purchaseText}>Buy {name}</span>
          <div className={styles.priceContainer}>
            <span className={styles.priceButton}>Price:</span>
            <span className={styles.price}>{game.price}</span>
          </div>
        </div>

        <div className={styles.achievementsContainer}>
          <div className={styles.achievementsTextContainer}>
            <span className={styles.achievementsText}>Achievements</span>
            <span className={styles.achievementCountText}>{achievementCount ? achievementCount : "0"}</span>
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
        </div>
      </div>
    </section>
  );
};

export default SteamStorePanel;
