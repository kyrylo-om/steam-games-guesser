import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <section className={styles.page}>
      <h1>404</h1>
      <p>We couldn't find that page. Try going back home?</p>
    </section>
  );
};

export default NotFound;
