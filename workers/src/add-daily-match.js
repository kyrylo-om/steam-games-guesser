import { getAppInfo } from "./get-app.js";
import { buildDailyQuestions } from "./get-questions.js";

const getDateKey = (date) => date.toISOString().slice(0, 10);

const pickRandomAppIds = async (db) => {
	const { results } = await db
		.prepare("SELECT app_id FROM games ORDER BY RANDOM() LIMIT 2")
		.all();

	return results.map((row) => row.app_id);
};

export const addDailyMatch = async (db, date = new Date()) => {
	if (!db) {
		throw new Error('D1 binding "steam_apps_db" is not configured.');
	}

	const [game1Id, game2Id] = await pickRandomAppIds(db);
	if (!game1Id || !game2Id) {
		throw new Error("Not enough games to create a daily match.");
	}

	const [game1, game2] = await Promise.all([
		getAppInfo(db, game1Id),
		getAppInfo(db, game2Id),
	]);

	const matchDate = getDateKey(date);
	const questions = buildDailyQuestions(game1, game2);

	await db
		.prepare(
			"INSERT INTO daily_matches (date, game1_id, game2_id, questions) VALUES (?, ?, ?, ?)",
		)
		.bind(matchDate, game1Id, game2Id, JSON.stringify(questions))
		.run();

	return {
		date: matchDate,
		game1_id: game1Id,
		game2_id: game2Id,
		game1,
		game2,
	};
};
