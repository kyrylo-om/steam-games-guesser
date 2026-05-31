export const prepareGame = (game) => {
	const {
		app_id: appId,
		screenshots,
		videos,
		developers,
		genres,
		platforms,
		publishers,
		...rest
	} = game;
	const baseUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/`;
	const screenshotList = screenshots
		.split(",")
		.map((token) => `${baseUrl}${appId}/${token}.1920x1080.jpg`);
	const videoList = videos
		? videos
				.split(",")
				.map((item) => {
					const [thumbnailToken, videoToken] = item.split("|");
					return {
						thumbnail: `${baseUrl}${thumbnailToken}.jpg`,
						video: `https://video.akamai.steamstatic.com/store_trailers/${appId}/${videoToken}/hls_264_master.m3u8`,
					};
				})
		: null;

	return {
		...rest,
		thumbnail: `${baseUrl}${appId}/header.jpg`,
		background: `https://store.akamai.steamstatic.com/images/storepagebackground/app/${appId}`,
		developers: developers.split(","),
		genres: genres.split(","),
		platforms: platforms.split(","),
		publishers: publishers.split(","),
		screenshots: screenshotList,
		videos: videoList,
	};
};

export const prepareAchievements = (achievements) =>
	achievements.map((achievement) => ({
		name: achievement.name,
		icon: achievement.icon,
	}));

export const prepareReviews = (reviews) =>
	reviews.map((review) => {
		const { id, app_id: appId, author_id, author_icon, ...rest } = review;
		return {
			...rest,
			author_icon: `https://avatars.akamai.steamstatic.com/${author_icon}_full.jpg`,
			author_link: `https://steamcommunity.com/profiles/${author_id}`,
		};
	});

export const getAppInfo = async (db, appId) => {
	if (!db) {
		throw new Error('D1 binding "steam_apps_db" is not configured.');
	}

	const game = await db
		.prepare("SELECT * FROM games WHERE app_id = ?")
		.bind(appId)
		.first();

	if (!game) {
		return null;
	}

	const achievementsResult = await db
		.prepare("SELECT * FROM achievements WHERE app_id = ? ORDER BY id")
		.bind(appId)
		.all();

	const reviewsResult = await db
		.prepare("SELECT * FROM reviews WHERE app_id = ? ORDER BY id")
		.bind(appId)
		.all();

	return {
		game: prepareGame(game),
		achievements: prepareAchievements(achievementsResult.results),
		reviews: prepareReviews(reviewsResult.results),
	};
};
