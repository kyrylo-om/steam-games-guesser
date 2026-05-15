import { useEffect, useMemo, useState } from "react";
import { DailyChallengeGame, useDailyChallenge } from "../api";
import styles from "./Home.module.css";

type GuessResult = {
  guess: "game1" | "game2";
  correct: boolean;
  correctGame: "game1" | "game2" | "tie";
};

type ChallengeState = {
  currentIndex: number;
  guessesByPair: Record<number, Record<string, GuessResult>>;
  scoresByPair: Record<number, number>;
  completed: boolean;
};

const Home: React.FC = () => {
  const { data, isLoading, error } = useDailyChallenge();
  const [state, setState] = useState<ChallengeState>({
    currentIndex: 0,
    guessesByPair: {},
    scoresByPair: {},
    completed: false,
  });

  const scoreColors = [
    "#d32f2f",
    "#e53935",
    "#fb8c00",
    "#fdd835",
    "#9ccc65",
    "#4caf50",
  ];

  const stats = useMemo(
    () => [
      {
        key: "review_count",
        label: "Review Count",
        display: (value: number) => value.toLocaleString(),
        getValue: (game: DailyChallengeGame) => game.review_count,
      },
      {
        key: "review_sentiment",
        label: "Review Sentiment",
        display: (value: string) => value,
        getValue: (game: DailyChallengeGame) => {
          const raw = String(game.review_sentiment || "0").replace("%", "");
          return Number(raw) || 0;
        },
      },
      {
        key: "release_date",
        label: "Release Date",
        display: (value: string) => value,
        getValue: (game: DailyChallengeGame) => {
          const timestamp = new Date(game.release_date).getTime();
          return Number.isNaN(timestamp) ? 0 : timestamp;
        },
      },
      {
        key: "price",
        label: "Price",
        display: (value: string | number) => String(value),
        getValue: (game: DailyChallengeGame) => {
          const value = game.price;
          if (typeof value === "number") return value;
          if (value === "Free") return 0;
          if (value === "N/A") return 0;
          const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
          return Number.isNaN(parsed) ? 0 : parsed;
        },
      },
      {
        key: "current_online",
        label: "Current Online",
        display: (value: number) => {
          if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
          if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
          return value.toString();
        },
        getValue: (game: DailyChallengeGame) => game.current_online,
      },
    ],
    []
  );

  useEffect(() => {
    if (!data?.date) return;
    const key = `dailyChallenge:${data.date}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChallengeState;
        setState({
          ...parsed,
          currentIndex: Math.min(parsed.currentIndex, data.pairs.length - 1),
        });
      } catch {
        localStorage.removeItem(key);
      }
    } else {
      setState({
        currentIndex: 0,
        guessesByPair: {},
        scoresByPair: {},
        completed: false,
      });
    }
  }, [data?.date, data?.pairs.length]);

  useEffect(() => {
    if (!data?.date) return;
    const key = `dailyChallenge:${data.date}`;
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, data?.date]);

  const currentPair = data?.pairs[state.currentIndex];

  const handleGuess = (statKey: string, guess: "game1" | "game2") => {
    if (!currentPair) return;
    const existing = state.guessesByPair[state.currentIndex]?.[statKey];
    if (existing) return;

    const stat = stats.find((item) => item.key === statKey);
    if (!stat) return;

    const value1 = stat.getValue(currentPair.game1);
    const value2 = stat.getValue(currentPair.game2);

    let correctGame: "game1" | "game2" | "tie" = "tie";
    if (value1 > value2) correctGame = "game1";
    if (value2 > value1) correctGame = "game2";

    const correct = correctGame === "tie" ? true : guess === correctGame;

    setState((prev) => {
      const pairGuesses = {
        ...(prev.guessesByPair[prev.currentIndex] || {}),
        [statKey]: { guess, correct, correctGame },
      };
      const guessesByPair = {
        ...prev.guessesByPair,
        [prev.currentIndex]: pairGuesses,
      };
      const score = Object.values(pairGuesses).filter((g) => g.correct).length;
      const scoresByPair = { ...prev.scoresByPair, [prev.currentIndex]: score };
      const completed = data?.pairs.every(
        (_, idx) =>
          Object.keys(guessesByPair[idx] || {}).length === stats.length
      );
      return {
        ...prev,
        guessesByPair,
        scoresByPair,
        completed: Boolean(completed),
      };
    });
  };

  const handleNext = () => {
    if (!data) return;
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, data.pairs.length - 1),
    }));
  };

  const totalCorrect = Object.values(state.scoresByPair).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Daily Challenge</h1>
        {data?.date && <p>Challenge Date: {data.date}</p>}
      </header>

      {error && <div className={styles.error}>Error: {error.message}</div>}

      {isLoading && <div className={styles.placeholder}>Loading...</div>}

      {data && (
        <>
          <div className={styles.progressBar}>
            {data.pairs.map((pair, idx) => {
              const score = state.scoresByPair[idx];
              const isCompleted = score !== undefined;
              const color =
                score !== undefined ? scoreColors[score] : "#333";
              return (
                <div
                  key={pair.id}
                  className={`${styles.progressItem} ${
                    idx === state.currentIndex ? styles.active : ""
                  }`}
                  style={{ backgroundColor: isCompleted ? color : "#333" }}
                />
              );
            })}
          </div>

          {!state.completed && currentPair && (
            <section className={styles.challengeSection}>
              <div className={styles.pairHeader}>
                <span className={styles.pairNumber}>
                  Game {state.currentIndex + 1} / {data.pairs.length}
                </span>
                <span className={styles.scorePreview}>
                  Score: {state.scoresByPair[state.currentIndex] || 0} /{" "}
                  {stats.length}
                </span>
              </div>

              <div className={styles.gameCards}>
                <div className={styles.gameCard}>
                  <h2>{currentPair.game1.name}</h2>
                  <img
                    src={currentPair.game1.header_image}
                    alt={currentPair.game1.name}
                  />
                </div>
                <div className={styles.gameCard}>
                  <h2>{currentPair.game2.name}</h2>
                  <img
                    src={currentPair.game2.header_image}
                    alt={currentPair.game2.name}
                  />
                </div>
              </div>

              <div className={styles.stats}>
                {stats.map((stat) => {
                  const guess =
                    state.guessesByPair[state.currentIndex]?.[stat.key];
                  const value1 = stat.display(
                    (currentPair.game1 as any)[stat.key]
                  );
                  const value2 = stat.display(
                    (currentPair.game2 as any)[stat.key]
                  );
                  const winner =
                    guess?.correctGame === "tie"
                      ? "Tie"
                      : guess?.correctGame === "game1"
                      ? currentPair.game1.name
                      : guess?.correctGame === "game2"
                      ? currentPair.game2.name
                      : "";
                  return (
                    <div key={stat.key} className={styles.statRow}>
                      <div className={styles.statLabel}>{stat.label}</div>
                      <div className={styles.statChoices}>
                        <button
                          className={styles.choiceButton}
                          onClick={() => handleGuess(stat.key, "game1")}
                          disabled={!!guess}
                          type="button"
                        >
                          {currentPair.game1.name}
                        </button>
                        <button
                          className={styles.choiceButton}
                          onClick={() => handleGuess(stat.key, "game2")}
                          disabled={!!guess}
                          type="button"
                        >
                          {currentPair.game2.name}
                        </button>
                      </div>
                      {guess && (
                        <div className={styles.statResult}>
                          <span>{value1}</span>
                          <span>{value2}</span>
                          <span
                            className={
                              guess.correct
                                ? styles.correct
                                : styles.incorrect
                            }
                          >
                            {guess.correct ? "Correct" : "Wrong"}
                            {winner ? ` • Winner: ${winner}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {Object.keys(
                state.guessesByPair[state.currentIndex] || {}
              ).length === stats.length && (
                <button className={styles.nextButton} onClick={handleNext}>
                  Next Game
                </button>
              )}
            </section>
          )}

          {state.completed && (
            <section className={styles.summary}>
              <h2>Daily Summary</h2>
              <p>
                Total Score: {totalCorrect} /{" "}
                {data.pairs.length * stats.length}
              </p>
              <div className={styles.summaryGrid}>
                {data.pairs.map((pair, idx) => (
                  <div key={pair.id} className={styles.summaryCard}>
                    <div className={styles.summaryTitle}>
                      {pair.game1.name} vs {pair.game2.name}
                    </div>
                    <div
                      className={styles.summaryScore}
                      style={{
                        backgroundColor:
                          scoreColors[state.scoresByPair[idx] || 0],
                      }}
                    >
                      {state.scoresByPair[idx] || 0} / {stats.length}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default Home;
