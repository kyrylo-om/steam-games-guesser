import dailyQuestions from "./question_lists/daily.json" assert { type: "json" };
import allQuestions from "./question_lists/all.json" assert { type: "json" };

const compareValueByCriteria = {
	price: (game) => game.price,
	date: (game) => game.release_timestamp,
	review_count: (game) => game.num_reviews,
	review_score: (game) => game.num_positive_reviews / game.num_reviews,
};

const getCompareValue = (game, criteria) =>
	compareValueByCriteria[criteria]
		? compareValueByCriteria[criteria](game)
		: 0;

const getRandomInt = (max) => Math.floor(Math.random() * max);

const getRandomUnusedIndex = (length, used) => {
	const available = [];
	for (let i = 0; i < length; i += 1) {
		if (!used.has(i)) available.push(i);
	}
	if (!available.length) return null;
	return available[getRandomInt(available.length)];
};

const pickWinner = (allowGame1, allowGame2) => {
	let winner = Math.random() < 0.5 ? 0 : 1;
	if (winner === 0 && !allowGame1) winner = 1;
	if (winner === 1 && !allowGame2) winner = 0;
	return winner;
};

const buildChoiceList = ({ count, items, allowed }) => {
	const used = [new Set(), new Set()];
	const correct = [];
	const data = [];

	for (let i = 0; i < count; i += 1) {
		let winner = pickWinner(allowed[0], allowed[1]);
		let winnerItems = items[winner];
		let winnerUsed = used[winner];
		let winnerHasUnique = winnerUsed.size < winnerItems.length;

		const other = winner === 0 ? 1 : 0;
		const otherAllowed = allowed[other];
		const otherItems = items[other];
		const otherUsed = used[other];
		const otherHasUnique =
			otherAllowed && otherUsed.size < otherItems.length;

		if (!winnerHasUnique && otherHasUnique) {
			winner = other;
			winnerItems = otherItems;
			winnerUsed = otherUsed;
			winnerHasUnique = true;
		}

		let index;
		if (winnerHasUnique) {
			index = getRandomUnusedIndex(winnerItems.length, winnerUsed);
			if (index === null) {
				index = getRandomInt(winnerItems.length);
			} else {
				winnerUsed.add(index);
			}
		} else {
			index = getRandomInt(winnerItems.length);
		}

		correct.push(winner);
		data.push(index);
	}

	return { correct, data };
};

const buildQuestion = (question, game1Data, game2Data) => {
	switch (question.type) {
		case "compare": {
			const game1Value = getCompareValue(
				game1Data.game,
				question.criteria,
			);
			const game2Value = getCompareValue(
				game2Data.game,
				question.criteria,
			);
			const higherWins = question.higher === 1;
			const correct = higherWins
				? game1Value >= game2Value
					? 0
					: 1
				: game1Value <= game2Value
					? 0
					: 1;

			return { ...question, correct };
		}
		case "screenshots": {
			const choices = buildChoiceList({
				count: 3,
				items: [game1Data.game.screenshots, game2Data.game.screenshots],
				allowed: [true, true],
			});

			return {
				...question,
				correct: choices.correct,
				data: choices.data,
			};
		}
		case "reviews": {
			const choices = buildChoiceList({
				count: 3,
				items: [game1Data.reviews, game2Data.reviews],
				allowed: [true, true],
			});

			return {
				...question,
				correct: choices.correct,
				data: choices.data,
			};
		}
		case "achievements": {
			const game1HasAchievements = game1Data.game.num_achievements > 0;
			const game2HasAchievements = game2Data.game.num_achievements > 0;
			if (!game1HasAchievements && !game2HasAchievements) {
				return null;
			}

			const choices = buildChoiceList({
				count: 3,
				items: [game1Data.achievements, game2Data.achievements],
				allowed: [game1HasAchievements, game2HasAchievements],
			});

			return {
				...question,
				correct: choices.correct,
				data: choices.data,
			};
		}
		case "devlishers": {
			const correct = Math.random() < 0.5 ? 0 : 1;
			const winner = correct === 0 ? game1Data : game2Data;

			return {
				...question,
				correct,
				data: {
					developer: winner.game.developers.join(", "),
					publisher: winner.game.publishers.join(", "),
				},
			};
		}
		default:
			console.error(`Unknown question type: ${question.type}`);
			return null;
	}
};

const shuffleQuestions = (questions) => {
	const shuffled = [...questions];
	for (let i = shuffled.length - 1; i > 0; i -= 1) {
		const j = getRandomInt(i + 1);
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

export const buildDailyQuestions = (game1Data, game2Data) =>
	dailyQuestions
		.map((question) => buildQuestion(question, game1Data, game2Data))
		.filter(Boolean);

export const buildQuestions = (game1Data, game2Data) =>
	shuffleQuestions(allQuestions)
		.map((question) => buildQuestion(question, game1Data, game2Data))
		.filter(Boolean);
