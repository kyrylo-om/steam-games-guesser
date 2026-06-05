import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GamePanel from "./game-panel/game-panel";
import SteamStorePanel from "./steam-store-panel/steam-store-panel";
import styles from "./game.module.css";

const Game = ({ mode }) => {
  const { date } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedSide, setSelectedSide] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [subquestionAnswered, setSubquestionAnswered] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [revealedFields, setRevealedFields] = useState(new Set());
  const [scrollTo, setScrollTo] = useState(null);
  const [hoveredSide, setHoveredSide] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);


  useEffect(() => {
    const controller = new AbortController();

    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const baseEndpoint =
          mode === "daily"
            ? "https://steam-db-updater.kyrylo-omelianchuk.workers.dev/get-daily-match"
            : "https://steam-db-updater.kyrylo-omelianchuk.workers.dev/get-match";

        const url = date
          ? `${baseEndpoint}?date=${encodeURIComponent(date)}`
          : baseEndpoint;

        const response = await fetch(url, { signal: controller.signal });

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
  const questions = useMemo(() => data?.questions ?? [], [data]);
  const totalRevealFields = useMemo(() => data?.questions?.length);
  const revealPercent = useMemo(() => Math.round((revealedFields.size / totalRevealFields) * 100,));

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex] ?? null,
    [questions, currentQuestionIndex],
  );

  const pendingReveal = currentQuestion?.reveal_field ?? null;

  const hasSubquestions =
    currentQuestion?.correct &&
    Array.isArray(currentQuestion.correct) &&
    currentQuestion.correct.length > 1;

  const advanceSubquestion = () => {
    setSubIndex((prev) => prev + 1);
  };

  const advanceToNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePick = (side) => {
    if (!currentQuestion || isLocked) return;

    const correct = currentQuestion.correct;
    const expected = hasSubquestions ? correct[subIndex] : correct;
    const isCorrect = side === expected;

    const isNotLastSubquestion =
      hasSubquestions && subIndex < correct.length - 1;

    if (isNotLastSubquestion) {
      setFeedback(isCorrect ? "correct" : "incorrect");
      setSubquestionAnswered(true);
      setSelectedSide(side);
      advanceSubquestion();
      setTimeout(() => {
        setFeedback(null);
        setSelectedSide(null);
      }, 1000);
      if (isCorrect) {
        if (subIndex === 0) {
          setScore((prev) => prev + 100);
        }
        else {
          setScore((prev) => prev + 50);
        }
      }
      return;
    }

    // Final answer — advance immediately so CardHolder exit animation starts
    const revealField = currentQuestion?.reveal_field;
    if (revealField) {
      setRevealedFields((prev) => new Set(prev).add(revealField));
      setScrollTo(revealField);
    }

    if (isCorrect) {
      if (subIndex === 0) {
        setScore((prev) => prev + 200);
      }
      else {
        setScore((prev) => prev + 50);
      }
    }

    setFeedback(isCorrect ? "correct" : "incorrect");
    setSubquestionAnswered(false);
    setSelectedSide(side);
    setIsLocked(true);
    advanceToNextQuestion();

    setTimeout(() => {
      setFeedback(null);
      setSelectedSide(null);
      setIsLocked(false);
      setSubIndex(0);
    }, 1500);

    if (currentQuestionIndex >= questions.length - 1) {
      setTimeout(() => {
        setShowResults(true);
      }, 900);
    }
  };

  const handleNextMatch = () => {
    window.location.reload();
  };

  if (isLoading || !leftGame || !rightGame) {
    return <main className={styles.state}>Loading match...</main>;
  }

  if (isError) {
    return (
      <main className={styles.state}>Unable to load match. Please try again.</main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.side} data-accent={hoveredSide === 0}>
        <SteamStorePanel
          gamePayload={leftGame}
          revealedFields={revealedFields}
          pendingReveal={pendingReveal}
          scrollTo={scrollTo}
          feedback={selectedSide === 0 ? feedback : null}
          animDuration={subquestionAnswered ? 300 : 800}
        />
      </section>

      <section className={styles.center}>
        <GamePanel
          question={currentQuestion}
          leftGame={leftGame}
          rightGame={rightGame}
          subIndex={subIndex}
          onPickLeft={() => handlePick(0)}
          onPickRight={() => handlePick(1)}
          disabled={isLocked}
          feedback={feedback}
          onHoverLeft={() => setHoveredSide(0)}
          onHoverRight={() => setHoveredSide(1)}
          onHoverEnd={() => setHoveredSide(null)}
          revealPercent={revealPercent}
          score={score}
          round={currentQuestionIndex + 1}
          showResults={showResults}
          leftGame={leftGame}
          rightGame={rightGame}
          onNextMatch={handleNextMatch}
          mode={mode}
        />
      </section>

      <section className={styles.side} data-accent={hoveredSide === 1}>
        <SteamStorePanel
          gamePayload={rightGame}
          revealedFields={revealedFields}
          pendingReveal={pendingReveal}
          scrollTo={scrollTo}
          feedback={selectedSide === 1 ? feedback : null}
          animDuration={subquestionAnswered ? 300 : 800}
        />
      </section>
    </main>
  );
};

export default Game;
