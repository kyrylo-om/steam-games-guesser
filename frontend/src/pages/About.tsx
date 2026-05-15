import styles from "./About.module.css";

const About: React.FC = () => {
  return (
    <section className={styles.page}>
      <h1>About</h1>
      <p>Share the story of the game and the patch notes or roadmap.</p>
    </section>
  );
};

export default About;
