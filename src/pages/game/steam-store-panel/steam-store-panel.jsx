import styles from "./steam-store-panel.module.css";
import AchievementsBlock from "./achievements-block";
import DevelopersBlock from "./developers-block";
import PriceBlock from "./price-block";
import ReleaseDateBlock from "./release-date-block";
import ReviewsBlock from "./reviews-block";
import ScreenshotsBlock from "./screenshots-block";
import ThumbnailBlock from "./thumbnail-block";

const SteamStorePanel = ({ game }) => {
  const name = game.name;
  const headerImage = game.header_image;
  const description = game.short_description;
  const reviewScoreDesc = game.review_score_desc;

  return (
    <section className={styles.panel}>

      <div className={styles.content}>
        <ThumbnailBlock title={name} imageSrc={headerImage} />

        <div className={styles.mainInfo}>
          <h1 className={styles.gameName}>{name}</h1>
          <p className={styles.description}>{description}</p>
        </div>

        <DevelopersBlock
          developers={game.developers}
          publishers={game.publishers}
        />
        <ReleaseDateBlock releaseDate={game.release_date} />
        <ReviewsBlock
          reviewScoreDesc={reviewScoreDesc}
          reviewSentiment={game.review_sentiment}
          reviewCount={game.review_count}
        />
        <ScreenshotsBlock game={game} headerImage={headerImage} />

        <PriceBlock gameName={name} price={game.price} />

        <AchievementsBlock
          achievementCount={game.achievements?.total}
          achievementIcons={game.achievements?.highlighted}
          gameName={name}
        />
      </div>
    </section>
  );
};

export default SteamStorePanel;
