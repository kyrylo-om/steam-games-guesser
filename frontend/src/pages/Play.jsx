import { useMemo, useState } from "react";
import CenterSpine from "../components/CenterSpine";
import SteamStorePanel from "../components/SteamStorePanel";
import { useDailyChallenge } from "../hooks/useDailyChallenge";
import {
  GAME_REVEAL_FIELDS,
  QUESTION_DEFS,
  getRoundModel,
} from "../game/questionDefs";
import styles from "./Play.module.css";

const Play = () => {
  const { data, isLoading, isError } = useDailyChallenge();
  const [hoveredSide, setHoveredSide] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [questionResults, setQuestionResults] = useState({});
  const [revealedFields, setRevealedFields] = useState([]);

  const pair = useMemo(() => data?.pairs?.[1] ?? null, [data]);
  const totalQuestions = QUESTION_DEFS.length;
  const viewQuestionIndex = Math.min(activeQuestionIndex, totalQuestions - 1);
  const roundModel = useMemo(
    () => getRoundModel(pair, viewQuestionIndex),
    [pair, viewQuestionIndex],
  );
  const activeResult = questionResults[viewQuestionIndex] ?? null;
  const answered = !!activeResult;
  const isComplete = activeQuestionIndex >= totalQuestions;
  const leftGame = pair?.game1 ?? null;
  const rightGame = pair?.game2 ?? null;
  const visibleFields = isComplete ? GAME_REVEAL_FIELDS : revealedFields;
  const hasUnlockedContent = visibleFields.length > 0 || isComplete;

  const score = Object.values(questionResults).reduce(
    (total, result) => total + (result?.isCorrect ? 1 : 0),
    0,
  );

  const handleSideSelect = (side) => {
    if (!pair || answered || isComplete) {
      return;
    }

    setQuestionResults((previousResults) => ({
      ...previousResults,
      [activeQuestionIndex]: {
        selectedSide: side,
        isCorrect: roundModel.correctSide
          ? side === roundModel.correctSide
          : null,
        correctSide: roundModel.correctSide,
      },
    }));

    setRevealedFields((previousFields) => {
      const nextFields = new Set(previousFields);
      for (const field of roundModel.revealFields ?? []) {
        nextFields.add(field);
      }
      if (viewQuestionIndex === totalQuestions - 1) {
        for (const field of GAME_REVEAL_FIELDS) {
          nextFields.add(field);
        }
      }
      return Array.from(nextFields);
    });

    if (viewQuestionIndex === totalQuestions - 1) {
      setActiveQuestionIndex(totalQuestions);
    }
  };

  const handleNextRound = () => {
    setHoveredSide(null);
    setActiveQuestionIndex((currentIndex) =>
      Math.min(currentIndex + 1, totalQuestions),
    );
  };

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
        data-active={
          hoveredSide === "left" || activeResult?.selectedSide === "left"
        }
        data-selected={activeResult?.selectedSide === "left"}
        onMouseEnter={() => setHoveredSide("left")}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => handleSideSelect("left")}
      >
        <SteamStorePanel
          game={leftGame}
          isRevealed={hasUnlockedContent}
          revealFields={visibleFields}
        />
      </section>

      <CenterSpine
        clue={roundModel.clue}
        correctSide={roundModel.correctSide}
        currentRound={isComplete ? totalQuestions : activeQuestionIndex + 1}
        isAnswered={answered}
        isComplete={isComplete}
        onNextRound={handleNextRound}
        prompt={roundModel.prompt}
        score={score}
        totalRounds={totalQuestions}
        selectedSide={activeResult?.selectedSide ?? null}
      />

      <section
        className={styles.side}
        data-active={
          hoveredSide === "right" || activeResult?.selectedSide === "right"
        }
        data-selected={activeResult?.selectedSide === "right"}
        onMouseEnter={() => setHoveredSide("right")}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => handleSideSelect("right")}
      >
        <SteamStorePanel
          game={rightGame}
          isRevealed={hasUnlockedContent}
          revealFields={visibleFields}
        />
      </section>
    </main>
  );
};

export default Play;
