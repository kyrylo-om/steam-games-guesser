import { daily_templates } from "./question_templates/daily.js";
import { question_templates } from "./question_templates/all.js";

const getCompareValue = (game, criteria) => game[criteria] ?? 0;

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

const evaluateSelect = (question, game1, game2) => {
	const handler = question.condition;
	if (!handler) return null;

	const g1Ok = handler(game1);
	const g2Ok = handler(game2);

	if (!g1Ok && !g2Ok) return null;
	if (g1Ok && !g2Ok) return { correct: 0 };
	if (!g1Ok && g2Ok) return { correct: 1 };
	return { correct: Math.random() < 0.5 ? 0 : 1 };
};

// ── Belongs-type helpers ────────────────────────────────────

const hasProperty = (game, property) => {
	const value = game[property];
	if (Array.isArray(value)) return value.length > 0;
	return value != null && value !== "" && value !== 0;
};

const getPropertyValue = (game, property) => {
	const value = game[property];
	if (Array.isArray(value) && value.length > 0) {
		return value[getRandomInt(value.length)];
	}
	return value;
};

const evaluateBelongs = (question, game1, game2) => {
	const g1Has = hasProperty(game1, question.property);
	const g2Has = hasProperty(game2, question.property);

	if (!g1Has && !g2Has) return null;

	const correct = g1Has && !g2Has ? 0 : !g1Has && g2Has ? 1 : Math.random() < 0.5 ? 0 : 1;
	const winningGame = correct === 0 ? game1 : game2;
	const propValue = getPropertyValue(winningGame, question.property);

	const questionText =
		typeof question.question === "function"
			? question.question(propValue)
			: question.question;

	return {
		correct,
		data: { [question.property]: propValue },
		question: questionText,
	};
};

// ── Build a single question ─────────────────────────────────

const buildQuestion = (question, game1Data, game2Data) => {
	const base = {
		question: question.question,
		type: question.type,
		reveal_field: question.reveal_field,
	};

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

			return { ...base, correct };
		}
		case "screenshots": {
			const choices = buildChoiceList({
				count: 3,
				items: [game1Data.game.screenshots, game2Data.game.screenshots],
				allowed: [true, true],
			});

			return { ...base, correct: choices.correct, data: choices.data };
		}
		case "reviews": {
			const choices = buildChoiceList({
				count: 3,
				items: [game1Data.reviews, game2Data.reviews],
				allowed: [true, true],
			});

			return { ...base, correct: choices.correct, data: choices.data };
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

			return { ...base, correct: choices.correct, data: choices.data };
		}
		case "devlishers": {
			const correct = Math.random() < 0.5 ? 0 : 1;
			const winner = correct === 0 ? game1Data : game2Data;

			return {
				...base,
				correct,
				data: {
					developer: winner.game.developers.join(", "),
					publisher: winner.game.publishers.join(", "),
				},
			};
		}
		case "select": {
			const result = evaluateSelect(question, game1Data.game, game2Data.game);
			if (!result) return null;
			return { ...base, ...result };
		}
		case "belongs": {
			const result = evaluateBelongs(question, game1Data.game, game2Data.game);
			if (!result) return null;
			return { ...base, correct: result.correct, data: result.data, question: result.question };
		}
		default:
			console.error(`Unknown question type: ${question.type}`);
			return null;
	}
};

// ── Per-category builder ────────────────────────────────────

const buildOnePerCategory = (templateGroups, game1Data, game2Data) => {
	const results = [];

	for (const [revealField, groupQuestions] of Object.entries(templateGroups)) {
		const shuffled = [...groupQuestions];
		for (let i = shuffled.length - 1; i > 0; i -= 1) {
			const j = getRandomInt(i + 1);
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		let built = null;
		for (const q of shuffled) {
			const question = buildQuestion(
				{ ...q, reveal_field: revealField },
				game1Data,
				game2Data,
			);
			if (question !== null) {
				built = question;
				break;
			}
		}

		if (built !== null) {
			results.push(built);
		}
	}

	return results;
};

export const buildDailyQuestions = (game1Data, game2Data) =>
	buildOnePerCategory(daily_templates, game1Data, game2Data);

export const buildQuestions = (game1Data, game2Data) =>
	buildOnePerCategory(question_templates, game1Data, game2Data);
