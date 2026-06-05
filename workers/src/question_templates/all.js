export const question_templates = {
    "media": [
        {
            "id": "screenshots",
            "question": "Which game is this screenshot from?",
            "type": "screenshots"
        }
    ],
    "price": [
        {
            "id": "price_higher",
            "question": "Which game costs more?",
            "type": "compare",
            "criteria": "price",
            "higher": 1
        },
        {
            "id": "price_lower",
            "question": "Which game is cheaper?",
            "type": "compare",
            "criteria": "price",
            "higher": 0
        },
        {
            "id": "is_free",
            "question": "Which game is free to play?",
            "type": "select",
            "condition": (game) => game.price === 0
        }
    ],
    "release": [
        {
            "id": "release_newer",
            "question": "Which game is newer?",
            "type": "compare",
            "criteria": "release_timestamp",
            "higher": 1
        },
        {
            "id": "release_older",
            "question": "Which game released first?",
            "type": "compare",
            "criteria": "release_timestamp",
            "higher": 0
        }
    ],
    "devlishers": [
        {
            "id": "developer",
            "question": (property) => `${property} is a developer of which game?`,
            "type": "belongs",
            "property": "developers"
        },
        {
            "id": "publisher",
            "question": (property) => `${property} is a publisher of which game?`,
            "type": "belongs",
            "property": "publishers"
        },
        {
            "id": "is_self_published",
            "question": "Which game is self-published?",
            "type": "select",
            "condition": (game) => game.publishers.some((p) => game.developers.includes(p))
        }
    ],
    "achievements": [
        {
            "id": "achievements",
            "question": "Which game is this achievement from?",
            "type": "achievements"
        }
    ],
    "review_count": [
        {
            "id": "review_count_higher",
            "question": "Which game has more English reviews?",
            "type": "compare",
            "criteria": "num_reviews",
            "higher": 1
        }
    ],
    "review_score": [
        {
            "id": "review_score_higher",
            "question": "Which game has a higher review score?",
            "type": "compare",
            "criteria": "review_score",
            "higher": 1
        },
        {
            "id": "review_sentiment",
            "question": (property) => `Which game has ${property} reviews?`,
            "type": "belongs",
            "property": "review_sentiment"
        }
    ],
    "reviews": [
        {
            "question": "Which game is this review from?",
            "type": "reviews"
        }
    ],
    "platforms": [
        {
            "id": "playable_linux",
            "question": "Which game is playable on Linux?",
            "type": "select",
            "condition": (game) => game.platforms.includes("linux")
        },
        {
            "id": "playable_mac",
            "question": "Which game is playable on MacOS?",
            "type": "select",
            "condition": (game) => game.platforms.includes("mac")
        }
    ],
    "multiplayer": [
        {
            "id": "multiplayer",
            "question": "Which game supports multiplayer?",
            "type": "select",
            "condition": (game) => game.multiplayer === 1
        }
    ],
    "required_age": [
        {
            "id": "required_age",
            "question": (property) => `Which game is ${property}+?`,
            "type": "belongs",
            "property": "required_age"
        },
        {
            "id": "required_age_higher",
            "question": "Which game has a higher age required to play?",
            "type": "compare",
            "criteria": "required_age",
            "higher": 1
        }
    ],
    "metacritic": [
        {
            "id": "metacritic_higher",
            "question": "Which game has a higher score on Metacritic?",
            "type": "compare",
            "criteria": "metacritic_score",
            "higher": 1
        }
    ]
}
