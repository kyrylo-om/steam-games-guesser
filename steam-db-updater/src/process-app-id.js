const APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails?l=english&cc=us&appids=";
const APP_REVIEWS_URL = "https://store.steampowered.com/appreviews/";
const REVIEWS_QUERY = "?json=1&purchase_type=all&language=english&filter=all&use_review_quality=0&filter_offtopic_activity=1&day_range=365";

const gameColumns = [
  "app_id",
  "name",
  "description",
  "screenshots",
  "videos",
  "developers",
  "publishers",
  "price",
  "release_timestamp",
  "num_reviews",
  "num_positive_reviews",
  "num_achievements",
  "metacritic_score",
  "genres",
  "required_age",
  "controller_support",
  "platforms",
  "multiplayer",
  "content_descriptors",
  "dlc_count",
  "pc_requirements",
];

const achievementColumns = [
  "app_id",
  "name",
  "icon"
];

const reviewColumns = [
  "app_id",
  "author_name",
  "author_id",
  "author_icon",
  "author_games_owned",
  "author_num_reviews",
  "playtime",
  "review",
  "recommended",
  "votes_up",
];

// #######################
// Helper functions
// #######################

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const sanitizeString = (value) => {
  if (value === null || value === undefined) return null;
  return String(value).replace(/\u0000/g, "");
};

const safeString = (value, fallback = "") =>
  sanitizeString(value) ?? fallback;

const toInteger = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") return fallback;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.trunc(numberValue);
};

const toJsonValue = (value, fallback) =>
  JSON.stringify(value ?? fallback ?? null);

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9"
    },
  });

  if (!response.ok) {
    const error = new Error(
      `${url} request failed: ${response.status} ${response.statusText}`,
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
};

// ###########################
// Field filling functions
// ###########################

const buildDevelopersField = (items) =>
  ensureArray(items)
    .map((item) => sanitizeString(item))
    .filter(Boolean)
    .join(",");

const buildGenresField = (genres) =>
  ensureArray(genres)
    .map((genre) =>
      sanitizeString(genre?.description),
    )
    .filter(Boolean)
    .join(",") || null;

const buildPlatformsField = (platforms) => {
  if (!platforms || typeof platforms !== "object") return null;
  const names = [];
  if (platforms.windows) names.push("windows");
  if (platforms.mac) names.push("mac");
  if (platforms.linux) names.push("linux");
  return names.length ? names.join(",") : null;
};

const toScreenshotToken = (screenshot) => {
  const candidate =
    screenshot?.path_full || screenshot?.path_thumbnail || "";
  const match = String(candidate).match(/^(?:[^\/]*\/){7}([^\.]+)/);
  return match?.[1] || null;
};

const buildScreenshotsField = (screenshots) => {
  const tokens = ensureArray(screenshots)
    .map(toScreenshotToken)
    .filter(Boolean);
  return tokens.join(",");
};

const toMovieToken = (movie) => {
  const thumbnailCandidate = movie?.thumbnail || "";
  const thumbnailMatch = String(thumbnailCandidate).match(/^(?:[^\/]*\/){6}(.*?)\.jpg/);

  const movieCandidate = movie?.dash_av1 || movie?.dash_h264 || "";
  const movieMatch = String(movieCandidate).match(/^(?:[^\/]*\/){5}(.*?)\/dash_/);

  const tokens = [];
  if (thumbnailMatch?.[1]) tokens.push(thumbnailMatch[1]);
  if (movieMatch?.[1]) tokens.push(movieMatch[1]);

  return tokens.join("|");
};

const buildMoviesField = (movies) => {
  const tokens = ensureArray(movies)
    .map(toMovieToken)
    .filter(Boolean);
  if (!tokens.length) return null;
  return tokens.join(",");
};

const resolvePrice = (appData) => {
  if (appData?.is_free) return 0;
  const priceValue = appData?.price_overview?.final ?? appData?.price_overview?.initial;
  const parsed = toInteger(priceValue);
  return parsed ?? 0;
};

const resolveControllerSupport = (appData) => {
  const support = appData?.controller_support;
  if (support === "full") return 1;
  if (support === "partial") return 2;
  return 0;
};

const resolveMultiplayer = (appData) => {
  const categories = ensureArray(appData?.categories);
  const multiplayerIds = new Set([1, 9, 27, 38]);
  const hasMultiplayer = categories.some((category) =>
    multiplayerIds.has(Number(category?.id)),
  );
  return hasMultiplayer ? 1 : 0;
};

// ##########################
// Main query build function
// ##########################

const buildGameRow = (appId, appData, reviewsPayload) => {
  const reviewSummary = reviewsPayload?.query_summary ?? {};

  const description =
    sanitizeString(appData?.short_description) ?? "No description (somehow)";

  const screenshotsField = buildScreenshotsField(appData?.screenshots);
  const moviesField = buildMoviesField(appData?.movies);

  const developersField = buildDevelopersField(appData?.developers);
  const publishersField = buildDevelopersField(appData?.publishers);
  const genresField = buildGenresField(appData?.genres);
  const platformsField = buildPlatformsField(appData?.platforms);
  const contentDescriptors = safeString(appData.content_descriptors.notes, null);
  const pcRequirementsJson = safeString(appData?.pc_requirements?.minimum, null);

  return [
    appId,
    safeString(appData?.name),
    description,
    screenshotsField,
    moviesField,
    developersField,
    publishersField,
    resolvePrice(appData),
    toInteger(Date.parse(appData?.release_date?.date), 0),
    toInteger(reviewSummary?.total_reviews ?? reviewSummary?.num_reviews, 0),
    toInteger(reviewSummary?.total_positive, 0),
    toInteger(appData?.achievements?.total, 0),
    toInteger(appData?.metacritic?.score),
    genresField,
    toInteger(appData?.required_age, 0),
    resolveControllerSupport(appData),
    platformsField,
    resolveMultiplayer(appData),
    contentDescriptors,
    toInteger(Array.isArray(appData?.dlc) ? appData.dlc.length : 0, 0),
    pcRequirementsJson,
  ];
};

const buildInsertStatement = (table, columns, rows) => {
  if (!rows.length) return 0;

  const selectColumns = columns
    .map((_, index) => `json_extract(value, '$[${index}]')`)
    .join(", ");

  return {
    query:
      `INSERT INTO ${table} (${columns.join(", ")}) ` +
      `SELECT ${selectColumns} FROM json_each(?)`,
    params: [JSON.stringify(rows)],
  };
};

const upsertGameStatement = (row) => {
  const selectColumns = gameColumns
    .map((_, index) => `json_extract(value, '$[${index}]')`)
    .join(", ");

  return {
    query:
      `REPLACE INTO games (${gameColumns.join(", ")}) ` +
      `SELECT ${selectColumns} FROM json_each(?)`,
    params: [JSON.stringify([row])],
  };
};

// ##################################
// Query build for achievements table
// ##################################

const selectAchievements = (achievements, limit) => {
  if (!Number.isFinite(limit) || limit <= 0) return achievements;
  return achievements.slice(0, limit);
};

const buildAchievementRows = (appId, appData, limit) => {
  const highlighted = selectAchievements(
    ensureArray(appData?.achievements?.highlighted),
    limit,
  );
  return highlighted
    .map((achievement) => {
      const name =
        sanitizeString(achievement?.name);
      const icon = sanitizeString(achievement?.icon);

      if (!icon) return null;

      return [appId, name, icon];
    })
    .filter(Boolean);
};

// ##################################
// Query build for reviews table
// ##################################

const replaceGameName = (text, gameName) => {
  if (!text || !gameName) return text;
  const escapedName = String(gameName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flexibleName = escapedName.replace(/['\u2018\u2019]/g, "['\\u2018\\u2019]");
  const pattern = new RegExp(flexibleName, "gi");
  return text.replace(pattern, "[this game]");
};

const buildReviewRows = (appId, reviewsPayload, limit, gameName) => {
  const reviews = ensureArray(reviewsPayload?.reviews)
    .filter(Boolean)
    .slice(0, limit);

  return reviews.map((review) => {
    const author = review?.author;
    const authorIcon = sanitizeString(author?.avatar);
    const reviewText = replaceGameName(
      sanitizeString(review?.review),
      gameName,
    );

    return [
      appId,
      sanitizeString(author?.personaname),
      toInteger(author?.steamid),
      authorIcon,
      toInteger(author?.num_games_owned),
      toInteger(author?.num_reviews),
      toInteger(author?.playtime_at_review),
      reviewText,
      review?.voted_up ? 1 : 0,
      toInteger(review?.votes_up),
    ];
  });
};

// ###########
// Export
// ###########

export const processAppId = async (db, appId, options = {}) => {
  const payload = await fetchJson(`${APP_DETAILS_URL}${appId}`);

  const appData = payload?.[String(appId)];
  if (!appData?.success || !appData?.data) return { appId, status: "missing" };

  const appDetails = appData.data;
  if (appDetails?.type && appDetails.type !== "game") {
    return { appId, status: "skipped" };
  }

  const reviewsPayload = await fetchJson(`${APP_REVIEWS_URL}${appId}${REVIEWS_QUERY}`);

  const gameRow = buildGameRow(appId, appDetails, reviewsPayload);
  const achievementRows = buildAchievementRows(appId, appDetails, Number(options.achievementsPerGame));
  const reviewRows = buildReviewRows(
    appId,
    reviewsPayload,
    Number(options.reviewsPerGame),
    appDetails?.name,
  );

  const batchStatements = [];

  const gameStatement = upsertGameStatement(gameRow);
  batchStatements.push(
    db.prepare(gameStatement.query).bind(...gameStatement.params),
  );
  batchStatements.push(
    db.prepare("DELETE FROM achievements WHERE app_id = ?").bind(appId),
  );

  if (achievementRows.length) {
    const insertAchievements = buildInsertStatement(
      "achievements",
      achievementColumns,
      achievementRows,
    );
    batchStatements.push(
      db.prepare(insertAchievements.query).bind(...insertAchievements.params),
    );
  }

  batchStatements.push(
    db.prepare("DELETE FROM reviews WHERE app_id = ?").bind(appId),
  );

  if (reviewRows.length) {
    const insertReviews = buildInsertStatement(
      "reviews",
      reviewColumns,
      reviewRows,
    );
    batchStatements.push(
      db.prepare(insertReviews.query).bind(...insertReviews.params),
    );
  }

  await db.batch(batchStatements);


  return {
    appId,
    status: "inserted",
    achievements: achievementRows.length,
    reviews: reviewRows.length,
  };
};
