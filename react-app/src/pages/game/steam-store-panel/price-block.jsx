import RevealWrapper from "./reveal-wrapper";
import styles from "./price-block.module.css";

const PriceBlock = ({ gameName, price, isRevealed = false, isPending = false }) => {
  return (
    <div className={styles.priceBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Price"} isPending={isPending}>
        <div className={styles.purchaseContainer}>
          <span className={styles.purchaseText}>Buy {gameName}</span>
          <div className={styles.priceContainer}>
            <span className={styles.priceButton}>Price:</span>
            <span className={styles.price}>{price / 100}$</span>
          </div>
        </div>
      </RevealWrapper>
    </div>
  );
};

export default PriceBlock;
