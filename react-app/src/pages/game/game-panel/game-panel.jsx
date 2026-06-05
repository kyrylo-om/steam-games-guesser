import AppHeader from "../../../components/app-header";
import CardHolder from "./card-holder";
import MatchInfo from "./match-info";
import MatchResults from "./match-results";
import PowerUpContainer from "./power-up-container";
import styles from "./game-panel.module.css";

const GamePanel = ({ question, leftGame, rightGame, subIndex, onPickLeft, onPickRight, disabled, feedback, onHoverLeft, onHoverRight, onHoverEnd, revealPercent, score, round, showResults, onNextMatch, mode }) => {
  return (
    <aside className={styles.spine}>
      <MatchInfo revealPercent={revealPercent} score={score} leftGame={leftGame} rightGame={rightGame} round={round} />

      {showResults ? (
        <MatchResults leftGame={leftGame} rightGame={rightGame} score={score} onNextMatch={onNextMatch} mode={mode} />
      ) : (
        <>
        <CardHolder
          question={question}
          leftGame={leftGame}
          rightGame={rightGame}
          subIndex={subIndex}
          onPickLeft={onPickLeft}
          onPickRight={onPickRight}
          onHoverLeft={onHoverLeft}
          onHoverRight={onHoverRight}
          onHoverEnd={onHoverEnd}
          disabled={disabled}
          feedback={feedback}
        />
        <p className={styles.round}>Question {round}</p>
        </>
      )}
    </aside>
  );
};

export default GamePanel;
