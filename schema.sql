CREATE TABLE pending_ids (
    app_id INTEGER PRIMARY KEY
);

CREATE TABLE games (
    app_id INTEGER PRIMARY KEY,

    name TEXT NOT NULL,
    description TEXT NOT NULL,

    screenshots TEXT NOT NULL,
    videos TEXT,

    developers TEXT NOT NULL,
    publishers TEXT NOT NULL,

    price INTEGER NOT NULL,
    
    release_timestamp INTEGER NOT NULL,

    num_reviews INTEGER NOT NULL,
    num_positive_reviews INTEGER NOT NULL,

    num_achievements INTEGER NOT NULL,

    metacritic_score INTEGER,
    genres TEXT,
    required_age INTEGER NOT NULL,
    controller_support INTEGER NOT NULL,
    platforms TEXT,
    multiplayer INTEGER NOT NULL,
    content_descriptors TEXT,
    dlc_count INTEGER NOT NULL,
    pc_requirements TEXT
);

CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id INTEGER NOT NULL,
    name TEXT,
    icon TEXT NOT NULL,

    FOREIGN KEY (app_id) REFERENCES games(app_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    author_icon TEXT,
    author_games_owned,
    author_num_reviews,
    playtime INTEGER NOT NULL,

    review TEXT NOT NULL,
    recommended INTEGER NOT NULL,
    votes_up INTEGER NOT NULL,

    FOREIGN KEY (app_id) REFERENCES games(app_id) ON DELETE CASCADE
);
