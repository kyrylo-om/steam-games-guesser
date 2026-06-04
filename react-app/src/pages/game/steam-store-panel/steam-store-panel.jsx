import { useEffect, useRef } from "react";
import styles from "./steam-store-panel.module.css";
import AchievementsBlock from "./achievements-block";
import DevelopersBlock from "./developers-block";
import PriceBlock from "./price-block";
import ReleaseDateBlock from "./release-date-block";
import ReviewsBlock from "./reviews-block";
import ScreenshotsBlock from "./screenshots-block";
import ThumbnailBlock from "./thumbnail-block";
import FeedbackOverlay from "../game-panel/feedback-overlay";

const SteamStorePanel = ({ gamePayload, revealedFields, scrollTo, feedback, animDuration }) => {
  const game = gamePayload.game;
  const contentRef = useRef(null);

  const isRevealed = (field) => revealedFields?.has(field) ?? false;
  const isReviewRevealed =
    isRevealed("review_count") || isRevealed("review_score");

  const FIELD_MAP = {
    review_count: "reviews",
    review_score: "reviews",
  };

  useEffect(() => {
    if (!scrollTo || !contentRef.current) return;
    const field = FIELD_MAP[scrollTo] ?? scrollTo;
    const block = contentRef.current.querySelector(
      `[data-field="${field}"]`,
    );
    if (block) {
      block.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [scrollTo]);

  return (
    <section
      className={styles.panel}
    >
      <FeedbackOverlay feedback={feedback} duration={animDuration} />

      <div className={styles.content} ref={contentRef}>
        <div data-field="media">
        <ThumbnailBlock
            title={game.name}
            imageSrc={game.thumbnail}
            isRevealed={isRevealed("media")}
        />
        </div>

        <div className={styles.mainInfo}>
          <h1 className={styles.gameName}>{game.name}</h1>
          <p className={styles.description}>{game.description}</p>
        </div>

        <div data-field="devlishers">
          <DevelopersBlock
            developers={game.developers}
            publishers={game.publishers}
            isRevealed={isRevealed("devlishers")}
          />
        </div>
        <div data-field="release">
          <ReleaseDateBlock
            releaseDate={game.release_timestamp}
            isRevealed={isRevealed("release")}
          />
        </div>
        <div data-field="reviews">
          <ReviewsBlock
            reviewScoreDesc={game.review_sentiment}
            reviewSentiment={game.review_score}
            reviewCount={game.num_reviews}
            isRevealed={isReviewRevealed}
          />
        </div>
        <div data-field="screenshots">
          <ScreenshotsBlock
            game={game}
            isRevealed={isRevealed("media")}
          />
        </div>

        <div data-field="price">
          <PriceBlock
            gameName={game.name}
            price={game.price}
            isRevealed={isRevealed("price")}
          />
        </div>

        <div data-field="achievements">
          <AchievementsBlock
            achievementCount={game.num_achievements}
            achievementIcons={gamePayload.achievements}
            gameName={game.name}
            isRevealed={isRevealed("achievements")}
          />
        </div>
      </div>
    </section>
  );
};

export default SteamStorePanel;
