import RevealWrapper from "./reveal-wrapper";
import styles from "./achievements-block.module.css";

const AchievementsBlock = ({
  achievementCount,
  achievementIcons,
  gameName,
  isRevealed = false,
}) => {
  const count = Number.isFinite(achievementCount)
    ? achievementCount
    : achievementCount || 0;
  const icons = Array.isArray(achievementIcons) ? achievementIcons : [];

  return (
    <div className={styles.achievementsBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Achievements"}>
        <div className={styles.achievementsContainer}>
          <div className={styles.achievementsTextContainer}>
            <span className={styles.achievementsText}>Achievements</span>
            <span className={styles.achievementCountText}>{count}</span>
          </div>
          <div className={styles.achievementIconsContainer}>
            {icons.map((achievement, index) => {
              const icon =
                achievement?.path ||
                (typeof achievement === "string" ? achievement : null);

              if (!icon) return null;

              return (
                <img
                  key={achievement?.name || `${gameName}-achievement-${index}`}
                  className={styles.achievementIcon}
                  src={icon}
                  alt={achievement?.name || `Achievement ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
      </RevealWrapper>
    </div>
  );
};

export default AchievementsBlock;
