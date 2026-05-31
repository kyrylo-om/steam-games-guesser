import { fetchTopGames } from "./fetch-top-games.js";
import { getAppInfo } from "./get-app.js";
import { addDailyMatch } from "./add-daily-match.js";
import { processAppId } from "./process-app-id.js";
import { getMatch } from "./get-match.js";
import { getDailyMatch } from "./get-daily-match.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const jsonResponse = (obj, status = 200) =>
	new Response(JSON.stringify(obj), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});

const okResponse = (payload = {}) => jsonResponse({ ok: true, ...payload }, 200);
const errorResponse = (message = "Unknown error.", status = 500) =>
	jsonResponse({ ok: false, error: message }, status);

const processPendingIds = async (db, env) => {
	if (!db) {
		throw new Error('D1 binding "steam_apps_db" is not configured.');
	}

	const { results } = await db
	.prepare(
		"DELETE FROM pending_ids " +
		"WHERE app_id IN (SELECT app_id FROM pending_ids ORDER BY app_id LIMIT ?) " +
		"RETURNING app_id",
	)
	.bind(env.BATCH_SIZE)
	.all();
	
	const pendingIds = results.map((row) => row.app_id);

	const summary = {
		requested: pendingIds.length,
		inserted: 0,
		skipped: 0,
		failed: 0,
	};
	const failedIds = [];

	for (const appId of pendingIds) {
		try {
			const result = await processAppId(db, appId, {
				reviewsPerGame: env.REVIEWS_PER_GAME,
				achievementsPerGame: env.ACHIEVEMENTS_PER_GAME,
			});
			if (result.status === "missing" || result.status === "skipped") {
				summary.skipped += 1;
			} else {
				summary.inserted += 1;
			}
			await sleep(env.REQUEST_DELAY);
		} catch (error) {
			summary.failed += 1;
			failedIds.push(appId);
			console.error(`Failed to process app_id ${appId}:`, error?.stack || error);

			const isRateLimit =
				error?.status === 429 ||
				String(error?.message || "").includes("429");
			if (isRateLimit) {
				const remainingIndex = pendingIds.indexOf(appId) + 1;
				const remainingIds = pendingIds.slice(remainingIndex);
				failedIds.push(...remainingIds);
				console.error("429: Too many requests")
				break;
			}
		}
	}

	if (failedIds.length) {
		await db
			.prepare(
				"INSERT OR IGNORE INTO pending_ids (app_id) " +
					"SELECT value FROM json_each(?)",
			)
			.bind(JSON.stringify(failedIds))
			.run();
	}
	
	return summary;
};

// ###########
// EXPORTS
// ###########

export default {
	async fetch(req, env) {
		const url = new URL(req.url);
		if (url.pathname === "/fetch-top-games") {
			const limit = url.searchParams.get("limit");

			try {
				const result = await fetchTopGames({ db: env.steam_apps_db, limit });
				return okResponse(result);
			} catch (error) {
				return errorResponse(error?.message || "Unknown error.", 500);
			}
		}

		if (url.pathname === "/get-app") {
			const idParam = url.searchParams.get("id");
			const appId = Number(idParam);

			if (!idParam || !Number.isInteger(appId)) {
				return errorResponse("Missing or invalid id.", 400);
			}

			try {
				const result = await getAppInfo(env.steam_apps_db, appId);
				if (!result) return errorResponse("Not found.", 404);
				return okResponse(result);
			} catch (error) {
				return errorResponse(error?.message || "Unknown error.", 500);
			}
		}

		if (url.pathname === "/get-match") {
			try {
				const result = await getMatch(env.steam_apps_db);
				if (!result) return errorResponse("Not found.", 404);
				return okResponse(result);
			} catch (error) {
				return errorResponse(error?.message || "Unknown error.", 500);
			}
		}

		if (url.pathname === "/get-daily-match") {
			const dateParam = url.searchParams.get("date");
			let dateArg;
			if (dateParam) {
				const parsed = new Date(dateParam);
				if (isNaN(parsed.getTime())) {
					return errorResponse("Invalid date.", 400);
				}
				dateArg = parsed;
			} else {
				dateArg = undefined;
			}

			try {
				const result = await getDailyMatch(env.steam_apps_db, dateArg);
				if (!result) return errorResponse("Not found.", 404);
				return okResponse(result);
			} catch (error) {
				return errorResponse(error?.message || "Unknown error.", 500);
			}
		}

		return new Response(JSON.stringify({
			ok: false,
			error: "Not found.",
		}), {
			status: 404,
			headers: {
				"Content-Type": "application/json",
			},
		});
	},

	// The scheduled handler is invoked at the interval set in the triggers config.
	async scheduled(event, env, ctx) {
		if (event.cron === "0 0 * * *") {
			try {
				const scheduledDate = new Date(event.scheduledTime);
				await addDailyMatch(env.steam_apps_db, scheduledDate);
			} catch (error) {
				console.error("Daily match failed:", error?.stack || error);
			}
		}

		if (event.cron === "* * * * *") {
			try {
				const result = await processPendingIds(env.steam_apps_db, env);
				console.log(`Processed ${result.inserted} app(s), skipped ${result.skipped}, failed ${result.failed}.`);
			} catch (error) {
				console.error("Scheduled run failed:", error?.stack || error);
			}
		}
	},
};
