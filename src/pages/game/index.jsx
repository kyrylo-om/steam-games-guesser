import { useEffect, useMemo, useState } from "react";
import GamePanel from "./game-panel/game-panel";
import SteamStorePanel from "./steam-store-panel/steam-store-panel";
import styles from "./game.module.css";

const Game = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [hoveredSide, setHoveredSide] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await fetch(
          "https://steam-db-updater.kyrylo-omelianchuk.workers.dev/get-match",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Failed to load match: ${response.status}`);
        }

        const payload = await response.json();
        setData(payload);
      } catch (error) {
        if (error.name === "AbortError") return;
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();

    return () => controller.abort();
  }, []);

  const leftGame = useMemo(() => data?.games?.[0] ?? null, [data]);
  const rightGame = useMemo(() => data?.games?.[1] ?? null, [data]);


  if (isLoading) {
    return <main className={styles.state}>Loading daily challenge...</main>;
  }

  if (isError || !leftGame || !rightGame) {
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
        <SteamStorePanel gamePayload={leftGame} />
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
        <SteamStorePanel gamePayload={rightGame} />
      </section>
    </main>
  );
};

export default Game;
