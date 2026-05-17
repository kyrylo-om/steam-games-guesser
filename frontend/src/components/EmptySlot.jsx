import styles from "./EmptySlot.module.css";

const EmptySlot = ({ as: Component = "div", className }) => {
  const slotClassName = className
    ? `${styles.slot} ${className}`
    : styles.slot;

  return <Component className={slotClassName}>???</Component>;
};

export default EmptySlot;
