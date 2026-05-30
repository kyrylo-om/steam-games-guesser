const API_URL = "https://games-popularity.com/swagger/api/top-sellers";

const fetchTopSellersPayload = async () => {
  const response = await fetch(API_URL, {
    headers: {
      Accept: "application/json"
    },
  });

  if (!response.ok) {
    throw new Error(
      `Top sellers request failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
    throw new Error("Unexpected top sellers response format.");
  }

  return payload;
};

const extractAppIds = (payload) =>
  payload.data
    .map((entry) => String(entry?.steamId ?? "").trim())
    .filter((steamId) => /^\d+$/.test(steamId))
    .map((steamId) => Number(steamId))
    .filter((steamId) => Number.isFinite(steamId));

const normalizeLimit = (limit) => {
  if (limit === null || limit === undefined || limit === "") return null;
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.trunc(parsed);
};

const insertPendingIds = async (db, appIds) => {
  if (!appIds.length) return 0;

  const { meta } = await db
    .prepare(
      "INSERT OR IGNORE INTO pending_ids (app_id) " +
        "SELECT value FROM json_each(?) " +
        "WHERE value NOT IN (SELECT app_id FROM games)",
    )
    .bind(JSON.stringify(appIds))
    .run();

  return meta?.changes ?? 0;
};

export const fetchTopGames = async ({ db, limit } = {}) => {
  if (!db) {
    throw new Error('D1 binding "steam_apps_db" is not configured.');
  }

  const payload = await fetchTopSellersPayload();
  const dedupedIds = Array.from(new Set(extractAppIds(payload)));
  const safeLimit = normalizeLimit(limit);
  const appIds = safeLimit ? dedupedIds.slice(0, safeLimit) : dedupedIds;
  const inserted = await insertPendingIds(db, appIds);

  return {
    appIdCount: appIds.length,
    inserted,
  };
};
