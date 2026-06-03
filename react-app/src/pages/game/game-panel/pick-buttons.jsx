import PickButton from "./pick-button";
import styles from "./pick-buttons.module.css";

const PickButtons = ({ leftName, rightName, onPickLeft, onPickRight, disabled }) => {
  return (
    <div className={styles.row}>
      <PickButton gameName={leftName} onPick={onPickLeft} disabled={disabled} />
      <PickButton gameName={rightName} onPick={onPickRight} disabled={disabled} />
    </div>
  );
};

export default PickButtons;