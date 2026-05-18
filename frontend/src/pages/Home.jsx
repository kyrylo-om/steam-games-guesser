import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import styles from "./Home.module.css";

const Home = () => {
	return (
		<main className={styles.page}>
			<div className={styles.frame}>
				<header className={styles.topBar}>
					<AppHeader />
				</header>

				<section className={styles.hero}>
					<div className={styles.heroCopy}>
						<h1 className={styles.title}>Steam Showdown</h1>
						<p className={styles.subhead}>
							Minimal, fast Steam comparisons. Pick a side and unlock more store
							data as you go.
						</p>
						<div className={styles.heroActions}>
							<Link className={styles.primaryCta} to="/play">
								Start the daily challenge
							</Link>
							<Link className={styles.secondaryCta} to="/freeplay">
								Freeplay
							</Link>
							<p className={styles.meta}>6 rounds - 2 games - 1 score</p>
						</div>
					</div>

				</section>

				<section className={styles.steps}>
					<div className={styles.stepCard}>
						<p className={styles.stepTitle}>Read the clue</p>
						<p className={styles.stepCopy}>
							Screens, reviews, and achievements rotate each round.
						</p>
					</div>
					<div className={styles.stepCard}>
						<p className={styles.stepTitle}>Pick a side</p>
						<p className={styles.stepCopy}>
							Guess the match or compare the stats.
						</p>
					</div>
					<div className={styles.stepCard}>
						<p className={styles.stepTitle}>Unlock the store</p>
						<p className={styles.stepCopy}>
							Correct picks reveal more Steam data.
						</p>
					</div>
				</section>
			</div>
		</main>
	);
};

export default Home;
