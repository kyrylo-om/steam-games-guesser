import { useMemo } from "react";
import styles from "./extended-question-card.module.css";

const DevlishersSlot = ({ data }) => {
  if (!data) return null;
  return (
    <div className={styles.devlishersSlot}>
      <div className={styles.devlisherRow}>
        <span className={styles.devlisherLabel}>Developer</span>
        <span className={styles.devlisherValue}>{data.developer}</span>
      </div>
      <div className={styles.devlisherRow}>
        <span className={styles.devlisherLabel}>Publisher</span>
        <span className={styles.devlisherValue}>{data.publisher}</span>
      </div>
    </div>
  );
};

const ScreenshotSlot = ({ src }) => {
  if (!src) return null;
  return (
    <div className={styles.screenshotSlot}>
      <img className={styles.screenshotImage} src={src} alt="Screenshot" />
    </div>
  );
};

const AchievementSlot = ({ achievement, gameName }) => {
  if (!achievement) return null;
  return (
    <div className={styles.achievementSlot}>
      <img
        className={styles.achievementIcon}
        src={achievement.icon}
        alt={achievement.name || "Achievement"}
      />
      <div className={styles.achievementInfo}>
        <span className={styles.achievementLabel}>Achievement</span>
        <span className={styles.achievementName}>
          {achievement.name || gameName}
        </span>
      </div>
    </div>
  );
};

const ReviewSlot = ({ review }) => {
  if (!review) return null;
  return (
    <div className={styles.reviewSlot}>
      <div className={styles.reviewHeader}>
        <img
          className={styles.reviewAuthorIcon}
          src={review.author_icon}
          alt={review.author_name}
        />
        <div className={styles.reviewAuthorInfo}>
          <span className={styles.reviewAuthorName}>
            {review.author_name}
          </span>
          <span className={styles.reviewPlaytime}>
            {review.playtime.toLocaleString()} hrs on record
          </span>
        </div>
        <span
          className={`${styles.reviewRecommended} ${review.recommended ? styles.reviewRecommendedYes : styles.reviewRecommendedNo}`}
        >
          {review.recommended ? "Recommended" : "Not Recommended"}
        </span>
      </div>
      <p className={styles.reviewText}>{review.review}</p>
      <div className={styles.reviewFooter}>
        <span className={styles.reviewVotes}>
          {review.votes_up.toLocaleString()} people found this review helpful
        </span>
      </div>
    </div>
  );
};

const ExtendedQuestionCard = ({ question, data, correct, type, leftGame, rightGame, subIndex }) => {
  if (type === "devlishers") {
    return (
      <div className={styles.card}>
        <div className="grow content-center">
          <div className={styles.question}>{question}</div>
          <DevlishersSlot data={data} />
        </div>
      </div>
    );
  }

  const subQuestions = useMemo(() => {
    if (!data || !correct) return [];
    return data.map((itemIndex, i) => {
      const gameSide = correct[i];
      const gamePayload = gameSide === 0 ? leftGame : rightGame;
      return { gameSide, itemIndex, gamePayload };
    });
  }, [data, correct, leftGame, rightGame]);

  const currentSub = subQuestions[subIndex];
  if (!currentSub) return null;

  const getItem = () => {
    if (!currentSub) return null;
    const { itemIndex, gamePayload } = currentSub;
    if (type === "screenshots") {
      return gamePayload?.game?.screenshots?.[itemIndex] ?? null;
    }
    if (type === "achievements") {
      return gamePayload?.achievements?.[itemIndex] ?? null;
    }
    if (type === "reviews") {
      return gamePayload?.reviews?.[itemIndex] ?? null;
    }
    return null;
  };

  const item = getItem();

  return (
    <div className={styles.card}>
      <div className="grow content-center">
        <div className={styles.question}>{question}</div>

        <div className={styles.slideArea}>
          <div className={styles.slideWrapper} key={subIndex}>
            {type === "screenshots" && <ScreenshotSlot src={item} />}
            {type === "achievements" && (
              <AchievementSlot
                achievement={item}
                gameName={currentSub.gamePayload?.game?.name}
              />
            )}
            {type === "reviews" && <ReviewSlot review={item} />}
          </div>
        </div>
      </div>

      <div className={styles.dotsRow}>
        {subQuestions.map((_, idx) => (
          <span
            key={idx}
            className={`${styles.dot} ${idx === subIndex ? styles.dotActive : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ExtendedQuestionCard;