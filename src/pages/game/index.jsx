import { useMemo, useState } from "react";
import GamePanel from "./game-panel/game-panel";
import SteamStorePanel from "./steam-store-panel/steam-store-panel";
import { useDailyChallenge } from "../../hooks/use-daily-challenge";
import styles from "./game.module.css";

const Game = () => {
  const { data, isLoading, isError } = useDailyChallenge();
  const [hoveredSide, setHoveredSide] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);

  const pair = useMemo(() => data?.pairs?.[0] ?? null, [data]);
  const leftGame = pair?.game1 ?? null;
  const rightGame = pair?.game2 ?? null;


  if (isLoading) {
    return <main className={styles.state}>Loading daily challenge...</main>;
  }

  if (isError || !pair) {
    return (
      <main className={styles.state}>Unable to load daily challenge.</main>
    );
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.side}
        data-active={hoveredSide === "left" || selectedSide === "left"}
        data-selected={selectedSide === "left"}
        onMouseEnter={() => setHoveredSide("left")}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => setSelectedSide("left")}
      >
        <SteamStorePanel game={leftGame} />
      </section>

      <section className={styles.center}>
        <GamePanel />
      </section>

      <section
        className={styles.side}
        data-active={hoveredSide === "right" || selectedSide === "right"}
        data-selected={selectedSide === "right"}
        onMouseEnter={() => setHoveredSide("right")}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => setSelectedSide("right")}
      >
        <SteamStorePanel game={rightGame} />
      </section>
    </main>
  );
};

export default Game;
