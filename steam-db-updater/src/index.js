import { fetchTopGames } from "./fetch-top-games.js";
import { processAppId } from "./process-app-id.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
		if (url.pathname !== "/fetch-top-games") {
			return new Response(JSON.stringify({
				ok: false,
				error: "Not found.",
			}), {
				status: 404,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		const limit = url.searchParams.get("limit");

		try {
			const result = await fetchTopGames({
				db: env.steam_apps_db,
				limit,
			});

			return new Response(JSON.stringify({
				ok: true,
				...result,
			}), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			return new Response(JSON.stringify({
				ok: false,
				error: error?.message || "Unknown error.",
			}), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
	},

	// The scheduled handler is invoked at the interval set in the triggers config.
	async scheduled(event, env, ctx) {
		try {
			const result = await processPendingIds(env.steam_apps_db, env);
			console.log(`Processed ${result.inserted} app(s), skipped ${result.skipped}, failed ${result.failed}.`);
		} catch (error) {
			console.error("Scheduled run failed:", error?.stack || error);
		}
	},
};
