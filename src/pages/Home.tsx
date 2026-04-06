import styles from "./Home.module.css";

const Home: React.FC = () => {
  return (
    <>
      <main className={styles.page}>
        <h1>Home</h1>
        <p>
          This page will host the hero/center content that App.tsx currently
          renders inline.
        </p>
      </main>
    </>
  );
};

export default Home;
