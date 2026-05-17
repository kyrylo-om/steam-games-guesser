import { Link } from "react-router-dom";
import styles from "./Home.module.css";

const Home = () => {
	return (
		<main className={styles.page}>
			<div className={styles.card}>
				<p className={styles.kicker}>Steam Showdown</p>
				<h1 className={styles.title}>Fast, blind Steam comparisons.</h1>
				<p className={styles.copy}>
					Pick the side you believe is correct. Reveal data as you go.
				</p>
				<Link className={styles.cta} to="/play">
					Start the daily challenge
				</Link>
			</div>
		</main>
	);
};

export default Home;
