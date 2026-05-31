import { getAppInfo } from "./get-app.js";
import { buildQuestions } from "./get-questions.js";

const getDateKey = (date) => date.toISOString().slice(0, 10);

export const getDailyMatch = async (db, date) => {
  if (!db) {
    throw new Error('D1 binding "steam_apps_db" is not configured.');
  }

  let row;
  if (typeof date === "undefined" || date === null) {
    row = await db.prepare("SELECT * FROM daily_matches ORDER BY date DESC LIMIT 1").first();
  } else {
    const matchDate = getDateKey(date);
    row = await db
      .prepare("SELECT * FROM daily_matches WHERE date = ?")
      .bind(matchDate)
      .first();
  }

  if (!row) {
    return null;
  }

  const { game1_id: id1, game2_id: id2, questions: questionsText } = row;

  const [g1, g2] = await Promise.all([getAppInfo(db, id1), getAppInfo(db, id2)]);

  if (!g1 || !g2) {
    throw new Error("Failed to load game data for daily match.");
  }

  let questions = null;
  try {
    questions = JSON.parse(questionsText);
  } catch (err) {
    questions = buildDailyQuestions(g1, g2);
  }

  return {
    games: [g1, g2],
    questions,
  };
};

export default getDailyMatch;
