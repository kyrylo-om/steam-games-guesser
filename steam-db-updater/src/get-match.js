import { getAppInfo } from "./get-app.js";
import { buildQuestions } from "./get-questions.js";

const pickRandomAppIds = async (db) => {
  const { results } = await db
    .prepare("SELECT app_id FROM games ORDER BY RANDOM() LIMIT 2")
    .all();

  return results.map((r) => r.app_id);
};

export const getMatch = async (db) => {
  if (!db) {
    throw new Error('D1 binding "steam_apps_db" is not configured.');
  }

  const [id1, id2] = await pickRandomAppIds(db);
  if (!id1 || !id2) {
    throw new Error("Not enough games available to build a match.");
  }

  const [g1, g2] = await Promise.all([getAppInfo(db, id1), getAppInfo(db, id2)]);

  if (!g1 || !g2) {
    throw new Error("Failed to load game data for selected match.");
  }

  const questions = buildQuestions(g1, g2);

  return {
    games: [g1, g2],
    questions,
  };
};

export default getMatch;
