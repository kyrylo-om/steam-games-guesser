import styles from "./pick-button.module.css";

const PickButton = ({ gameName, onPick, disabled }) => {
  return (
    <button
      className={styles.button}
      onClick={onPick}
      disabled={disabled}
      type="button"
    >
      {gameName}
    </button>
  );
};

export default PickButton;