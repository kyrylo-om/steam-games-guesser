export const QUESTION_DEFS = [
  {
    key: "screenshot_source",
    prompt: "Which game is this screenshot from?",
    answerType: "source",
    clueType: "screenshot",
    revealFields: ["media"],
    clueCount: 3,
  },
  {
    key: "price_compare",
    prompt: "Which game costs more?",
    answerType: "compare",
    compareField: "price",
    clueType: null,
    revealFields: ["price"],
  },
  {
    key: "developer_source",
    prompt: (clue) => `${clue} is a developer of which game?`,
    answerType: "source",
    clueType: "developer",
    revealFields: ["developer"],
  },
  {
    key: "release_recency",
    prompt: "Which game came out more recently?",
    answerType: "compare",
    compareField: "release_date",
    clueType: null,
    revealFields: ["release_date"],
  },
  {
    key: "review_count_compare",
    prompt: "Which game has more reviews?",
    answerType: "compare",
    compareField: "review_count",
    clueType: null,
    revealFields: ["reviews"],
  },
  {
    key: "review_sentiment_compare",
    prompt: "Which game has more positive reviews?",
    answerType: "compare",
    compareField: "review_sentiment",
    clueType: null,
    revealFields: ["review_sentiment"],
  },
  {
    key: "review_source",
    prompt: "Which game is this review from?",
    answerType: "source",
    clueType: "review",
    revealFields: [],
    clueCount: 3,
  },
  {
    key: "achievement_source",
    prompt: "Which game is this achievement from?",
    answerType: "source",
    clueType: "achievement",
    revealFields: ["achievements"],
    clueCount: 3,
  },
];

const SENTIMENT_RANKS = [
  ["overwhelmingly positive", 5],
  ["very positive", 4],
  ["positive", 3],
  ["mostly positive", 3],
  ["mixed", 2],
  ["mostly negative", 1],
  ["negative", 0],
  ["overwhelmingly negative", -1],
];

const getQuestionDefinition = (roundIndex) => {
  return QUESTION_DEFS[roundIndex % QUESTION_DEFS.length];
};

const getGameForSide = (pair, side) => {
  if (!pair) {
    return null;
  }

  return side === "left" ? (pair.game1 ?? null) : (pair.game2 ?? null);
};

const getOtherSide = (side) => {
  return side === "left" ? "right" : "left";
};

const getSourceSide = (pair, roundIndex) => {
  const seed =
    (pair?.game1?.app_id ?? 0) + (pair?.game2?.app_id ?? 0) + roundIndex;
  return seed % 2 === 0 ? "left" : "right";
};

const parsePriceValue = (price) => {
  if (!price) {
    return null;
  }

  const text = String(price).toLowerCase();
  if (text.includes("free")) {
    return 0;
  }

  const match = text.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  const value = Number.parseFloat(match);
  return Number.isFinite(value) ? value : null;
};

const getSentimentRank = (game) => {
  const source = String(game?.review_score_desc || game?.review_sentiment || "")
    .toLowerCase()
    .trim();

  for (const [label, rank] of SENTIMENT_RANKS) {
    if (source.includes(label)) {
      return rank;
    }
  }

  return 0;
};

const compareGames = (pair, field) => {
  const left = pair?.game1 ?? null;
  const right = pair?.game2 ?? null;

  if (!left || !right) {
    return null;
  }

  if (field === "price") {
    const leftPrice = parsePriceValue(left.price);
    const rightPrice = parsePriceValue(right.price);

    if (leftPrice === null || rightPrice === null || leftPrice === rightPrice) {
      return null;
    }

    return leftPrice > rightPrice ? "left" : "right";
  }

  if (field === "release_date") {
    const leftDate = Date.parse(left.release_date);
    const rightDate = Date.parse(right.release_date);

    if (
      Number.isNaN(leftDate) ||
      Number.isNaN(rightDate) ||
      leftDate === rightDate
    ) {
      return null;
    }

    return leftDate > rightDate ? "left" : "right";
  }

  if (field === "review_count") {
    const leftCount = Number(left.review_count ?? 0);
    const rightCount = Number(right.review_count ?? 0);

    if (leftCount === rightCount) {
      return null;
    }

    return leftCount > rightCount ? "left" : "right";
  }

  if (field === "review_sentiment") {
    const leftRank = getSentimentRank(left);
    const rightRank = getSentimentRank(right);

    if (leftRank === rightRank) {
      return null;
    }

    return leftRank > rightRank ? "left" : "right";
  }

  return null;
};

const buildClue = (definition, pair, roundIndex, clueIndex) => {
  if (!definition || !pair) {
    return null;
  }

  const sourceSide = getSourceSide(pair, roundIndex);
  const sourceGame = getGameForSide(pair, sourceSide);

  if (!sourceGame) {
    return null;
  }

  if (definition.clueType === "screenshot") {
    const screenshots = sourceGame.screenshots ?? [];
    const screenshot = screenshots[clueIndex] ?? screenshots[0] ?? null;

    return {
      type: "screenshot",
      side: sourceSide,
      game: sourceGame,
      screenshot,
    };
  }

  if (definition.clueType === "developer") {
    return {
      type: "developer",
      side: sourceSide,
      game: sourceGame,
      developer: sourceGame.developers?.[0] ?? "Unknown developer",
    };
  }

  if (definition.clueType === "review") {
    const reviews = sourceGame.reviews ?? [];
    const review = reviews[clueIndex] ?? reviews[0] ?? null;
    return {
      type: "review",
      side: sourceSide,
      game: sourceGame,
      review,
    };
  }

  if (definition.clueType === "achievement") {
    const achievements = sourceGame.achievements?.highlighted ?? [];
    const achievement = achievements[clueIndex] ?? achievements[0] ?? null;
    return {
      type: "achievement",
      side: sourceSide,
      game: sourceGame,
      achievement,
    };
  }

  return null;
};

export const getRoundModel = (pair, roundIndex, clueIndex = 0) => {
  const definition = getQuestionDefinition(roundIndex);
  const safeClueIndex = Math.max(0, clueIndex || 0);
  const clue = buildClue(definition, pair, roundIndex, safeClueIndex);
  const correctSide =
    definition.answerType === "source"
      ? (clue?.side ?? null)
      : compareGames(pair, definition.compareField);

  const prompt =
    typeof definition.prompt === "function"
      ? definition.prompt(clue?.developer)
      : definition.prompt;

  return {
    definition,
    clue,
    prompt,
    correctSide,
    revealFields: definition.revealFields,
    sourceSide: clue?.side ?? null,
    clueCount: definition.clueCount ?? 1,
  };
};

export const getGameForAnswerSide = getGameForSide;
export const getOtherAnswerSide = getOtherSide;
export const GAME_REVEAL_FIELDS = [
  "media",
  "developer",
  "publisher",
  "release_date",
  "reviews",
  "review_sentiment",
  "achievements",
  "price",
];
