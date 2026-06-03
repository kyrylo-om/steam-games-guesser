import styles from "./steam-store-panel.module.css";
import AchievementsBlock from "./achievements-block";
import DevelopersBlock from "./developers-block";
import PriceBlock from "./price-block";
import ReleaseDateBlock from "./release-date-block";
import ReviewsBlock from "./reviews-block";
import ScreenshotsBlock from "./screenshots-block";
import ThumbnailBlock from "./thumbnail-block";

const SteamStorePanel = ({ gamePayload }) => {
  const game = gamePayload.game;
  const reviewScoreDesc = "yes";

  return (
    <section className={styles.panel}>

      <div className={styles.content}>
        <ThumbnailBlock title={game.name} imageSrc={game.thumbnail} />

        <div className={styles.mainInfo}>
          <h1 className={styles.gameName}>{game.name}</h1>
          <p className={styles.description}>{game.description}</p>
        </div>

        <DevelopersBlock
          developers={game.developers}
          publishers={game.publishers}
        />
        <ReleaseDateBlock releaseDate={game.release_timestamp} />
        <ReviewsBlock
          reviewScoreDesc={reviewScoreDesc}
          reviewSentiment={game.num_reviews / 100 * game.num_positive_reviews}
          reviewCount={game.num_reviews}
        />
        <ScreenshotsBlock game={game} />

        <PriceBlock gameName={game.name} price={game.price} />

        <AchievementsBlock
          achievementCount={game.num_achievements}
          achievementIcons={gamePayload.achievements}
          gameName={game.name}
        />
      </div>
    </section>
  );
};

export default SteamStorePanel;
