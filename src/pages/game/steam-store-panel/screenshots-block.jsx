import RevealWrapper from "./reveal-wrapper";
import SteamStoreCarousel from "./steam-store-carousel";
import styles from "./screenshots-block.module.css";

const ScreenshotsBlock = ({ game, headerImage, isRevealed = false }) => {
  return (
    <div className={styles.screenshotsBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Media"}>
        <div className={styles.screenshotsContent}>
          <SteamStoreCarousel game={game} headerImage={headerImage} />
        </div>
      </RevealWrapper>
    </div>
  );
};

export default ScreenshotsBlock;
