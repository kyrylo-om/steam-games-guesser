import { useMemo, useRef, useState } from "react";
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
  const [questionStepIndex, setQuestionStepIndex] = useState(0);
  const [revealedFields, setRevealedFields] = useState([]);
  const [flashResult, setFlashResult] = useState(null);
  const flashTimeoutRef = useRef(null);

  const pair = useMemo(() => data?.pairs?.[1] ?? null, [data]);
  const totalQuestions = QUESTION_DEFS.length;
  const viewQuestionIndex = Math.min(activeQuestionIndex, totalQuestions - 1);
  const roundModel = useMemo(
    () => getRoundModel(pair, viewQuestionIndex, questionStepIndex),
    [pair, viewQuestionIndex, questionStepIndex],
  );
  const resultsForQuestion = questionResults[viewQuestionIndex] ?? [];
  const activeResult = resultsForQuestion[questionStepIndex] ?? null;
  const answered = !!activeResult;
  const isComplete = activeQuestionIndex >= totalQuestions;
  const leftGame = pair?.game1 ?? null;
  const rightGame = pair?.game2 ?? null;
  const visibleFields = isComplete ? GAME_REVEAL_FIELDS : revealedFields;
  const hasUnlockedContent = visibleFields.length > 0 || isComplete;
  const clueCount = roundModel.clueCount ?? 1;
  const leftPickLabel = leftGame?.name ? `Pick ${leftGame.name}` : "Pick game";
  const rightPickLabel = rightGame?.name
    ? `Pick ${rightGame.name}`
    : "Pick game";
  const leftFlash =
    flashResult?.side === "left"
      ? flashResult.isCorrect
        ? "correct"
        : "wrong"
      : "";
  const rightFlash =
    flashResult?.side === "right"
      ? flashResult.isCorrect
        ? "correct"
        : "wrong"
      : "";

  const score = Object.values(questionResults).reduce((total, results) => {
    if (!Array.isArray(results) || results.length === 0) {
      return total;
    }

    const lastResult = results[results.length - 1];
    return total + (lastResult?.isCorrect ? 1 : 0);
  }, 0);

  const handleSideSelect = (side) => {
    if (!pair || answered || isComplete) {
      return;
    }

    const isLastQuestion = viewQuestionIndex === totalQuestions - 1;
    const isLastStep = questionStepIndex >= clueCount - 1;

    const isCorrect = roundModel.correctSide
      ? side === roundModel.correctSide
      : false;

    setQuestionResults((previousResults) => {
      const nextResults = [...(previousResults[activeQuestionIndex] ?? [])];
      nextResults[questionStepIndex] = {
        selectedSide: side,
        isCorrect,
        correctSide: roundModel.correctSide,
      };

      return {
        ...previousResults,
        [activeQuestionIndex]: nextResults,
      };
    });

    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    setFlashResult({ side, isCorrect });
    flashTimeoutRef.current = window.setTimeout(() => {
      setFlashResult(null);
    }, 600);

    setRevealedFields((previousFields) => {
      const nextFields = new Set(previousFields);
      const isScreenshotQuestion =
        roundModel.definition?.clueType === "screenshot";
      const shouldRevealNow =
        !isScreenshotQuestion || (isScreenshotQuestion && isLastStep);

      if (shouldRevealNow) {
        for (const field of roundModel.revealFields ?? []) {
          nextFields.add(field);
        }
      }

      if (viewQuestionIndex === totalQuestions - 1) {
        for (const field of GAME_REVEAL_FIELDS) {
          nextFields.add(field);
        }
      }

      return Array.from(nextFields);
    });

    if (isLastStep) {
      setQuestionStepIndex(0);
      setActiveQuestionIndex((currentIndex) =>
        isLastQuestion
          ? totalQuestions
          : Math.min(currentIndex + 1, totalQuestions),
      );
    } else {
      setQuestionStepIndex((currentStep) =>
        Math.min(currentStep + 1, clueCount - 1),
      );
    }
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
        data-hovered={hoveredSide === "left"}
        data-selected={activeResult?.selectedSide === "left"}
        data-flash={leftFlash}
        onMouseEnter={() => setHoveredSide("left")}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => handleSideSelect("left")}
      >
        <div className={styles.pickOverlay} aria-hidden="true">
          <span className={styles.pickLabel}>{leftPickLabel}</span>
        </div>
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
        questionIndex={viewQuestionIndex}
        questionStepIndex={isComplete ? 0 : questionStepIndex}
        questionStepCount={isComplete ? 1 : clueCount}
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
        data-hovered={hoveredSide === "right"}
        data-selected={activeResult?.selectedSide === "right"}
        data-flash={rightFlash}
        onMouseEnter={() => setHoveredSide("right")}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => handleSideSelect("right")}
      >
        <div className={styles.pickOverlay} aria-hidden="true">
          <span className={styles.pickLabel}>{rightPickLabel}</span>
        </div>
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
