import { useState } from "react";
import styles from "./GameCard.module.css";

interface GameData {
  name: string;
  header_image: string;
  review_count: number;
  review_sentiment: string;
  release_date: string;
  price: string | number;
  current_online: number;
}

interface GameCardProps {
  game: GameData;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({
    reviewCount: false,
    reviewSentiment: false,
    releaseDate: false,
    price: false,
    currentOnline: false,
  });

  const toggleReveal = (key: string) => {
    setRevealed((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatPrice = (price: string | number): string => {
    if (price === "Free" || price === "N/A") {
      return String(price);
    }
    return String(price);
  };

  const formatOnline = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  const Spoiler: React.FC<{
    label: string;
    value: string;
    revealKey: string;
  }> = ({ label, value, revealKey }) => (
    <div className={styles.statRow}>
      <span className={styles.label}>{label}:</span>
      <button
        className={`${styles.spoiler} ${revealed[revealKey] ? styles.revealed : ""}`}
        onClick={() => toggleReveal(revealKey)}
        type="button"
      >
        {revealed[revealKey] ? value : "???"}
      </button>
    </div>
  );

  return (
    <div className={styles.card}>
      <h2 className={styles.gameName}>{game.name}</h2>

      <div className={styles.imageContainer}>
        <img
          src={game.header_image}
          alt={game.name}
          className={styles.gameImage}
        />
      </div>

      <div className={styles.stats}>
        <Spoiler
          label="Review Count"
          value={game.review_count.toLocaleString()}
          revealKey="reviewCount"
        />
        <Spoiler
          label="Review Sentiment"
          value={game.review_sentiment}
          revealKey="reviewSentiment"
        />
        <Spoiler
          label="Release Date"
          value={game.release_date}
          revealKey="releaseDate"
        />
        <Spoiler
          label="Price"
          value={formatPrice(game.price)}
          revealKey="price"
        />
        <Spoiler
          label="Current Online"
          value={formatOnline(game.current_online)}
          revealKey="currentOnline"
        />
      </div>
    </div>
  );
};

export default GameCard;
