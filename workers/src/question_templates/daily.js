export const daily_templates = {
    "media": [
        {
            "question": "Which game is this screenshot from?",
            "type": "screenshots"
        }
    ],
    "price": [
        {
            "question": "Which game costs more?",
            "type": "compare",
            "criteria": "price",
            "higher": 1
        }
    ],
    "devlishers": [
        {
            "question": "Which game was created by...",
            "type": "devlishers"
        }
    ],
    "release": [
        {
            "question": "Which game is newer?",
            "type": "compare",
            "criteria": "release_timestamp",
            "higher": 1
        }
    ],
    "achievements": [
        {
            "question": "Which game is this achievement from?",
            "type": "achievements"
        }
    ],
    "review_count": [
        {
            "question": "Which game has more English reviews?",
            "type": "compare",
            "criteria": "num_reviews",
            "higher": 1
        }
    ],
    "review_score": [
        {
            "question": "Which game has a higher review score?",
            "type": "compare",
            "criteria": "review_score",
            "higher": 1
        }
    ],
    "reviews": [
        {
            "question": "Which game is this review from?",
            "type": "reviews"
        }
    ]
}
