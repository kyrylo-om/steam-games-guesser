import requests
import logging
from datetime import datetime
import random

logger = logging.getLogger(__name__)

STEAM_STORE_API_URL = "https://store.steampowered.com/api/"
STEAM_OFFICIAL_API_URL = "https://api.steampowered.com/"

CHALLENGE_GAME_POOL = [
    730,     # Counter-Strike 2
    570,     # Dota 2
    440,     # Team Fortress 2
    220,     # Half-Life 2
    240,     # Counter-Strike: Source
    271590,  # GTA V
    578080,  # PUBG
    1172470, # Apex Legends
    1089130, # Valheim
    359550,  # Rainbow Six Siege
    1622730, # Elden Ring
    292030,  # The Witcher 3
    242050,  # Skyrim
    394360,  # Total War: Warhammer
    203160,  # Torchlight II
    236390,  # Street Fighter V
    105600,  # Terraria
    252490,  # Rust
    381210,  # Dead by Daylight
    1091500, # Cyberpunk 2077
    945360,  # Among Us
    72850,   # Civilization V
]


def fetch_player_count(app_id):
    """
    Fetch current player count from Official Steam API
    Returns player_count or 0 if not available
    """
    try:
        url = f"{STEAM_OFFICIAL_API_URL}ISteamUserStats/GetNumberOfCurrentPlayers/v1/"
        params = {"appid": app_id}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        return data.get("response", {}).get("player_count", 0)

    except requests.RequestException as e:
        logger.warning(f"Error fetching player count for app {app_id}: {e}")
        return 0


def fetch_game_from_steam(app_id):
    """
    Fetch game data from Steam Store API in English locale
    Returns tuple of (cleaned_data, full_steam_data)
    """
    try:
        url = f"{STEAM_STORE_API_URL}appdetails/"
        params = {
            "appids": app_id,
            "hl": "en",  # Force English language
            "cc": "US",  # Force US region
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Steam API returns data keyed by app_id
        if str(app_id) not in data:
            return None, None

        app_data = data[str(app_id)]

        # Return False if the app doesn't exist or is not available
        if not app_data.get("success"):
            return None, None

        game_info = app_data.get("data", {})

        # Extract only necessary data
        cleaned_data = {
            "name": game_info.get("name"),
            "release_date": game_info.get("release_date", {}).get("date"),
            "header_image": game_info.get("header_image"),
            "price": game_info.get("price_overview", {}).get("final") / 100
            if game_info.get("price_overview")
            else None,
            "platforms": game_info.get("platforms", {}),
            "genres": [g.get("description") for g in game_info.get("genres", [])],
            "categories": [
                c.get("description") for c in game_info.get("categories", [])
            ],
            "short_description": game_info.get("short_description"),
        }

        # Return both cleaned and full data
        return cleaned_data, game_info

    except requests.RequestException as e:
        logger.error(f"Error fetching game {app_id} from Steam: {e}")
        return None, None


def fetch_review_summary(app_id):
    """
    Fetch user review summary from Steam appreviews endpoint.
    Returns tuple: (review_count, review_sentiment)
    """
    try:
        url = f"https://store.steampowered.com/appreviews/{app_id}"
        params = {
            "json": 1,
            "language": "english",
            "purchase_type": "all",
            "num_per_page": 0,
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        payload = response.json()
        summary = payload.get("query_summary", {})
        review_count = summary.get("total_reviews", 0) or 0
        total_positive = summary.get("total_positive", 0) or 0
        if review_count > 0:
            positive_percentage = round((total_positive / review_count) * 100)
            review_sentiment = f"{positive_percentage}%"
        else:
            review_sentiment = "N/A"
        return review_count, review_sentiment
    except requests.RequestException as e:
        logger.warning(f"Error fetching review summary for app {app_id}: {e}")
        return 0, "N/A"


def fetch_comparison_data(app_id):
    """
    Fetch comparison data for a single game combining Store and Official APIs
    Returns dict with 5 statistics or None if game not found
    """
    try:
        # Fetch from Store API
        url = f"{STEAM_STORE_API_URL}appdetails/"
        params = {
            "appids": app_id,
            "hl": "en",
            "cc": "US",
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        if str(app_id) not in data or not data[str(app_id)].get("success"):
            return None

        game_info = data[str(app_id)].get("data", {})

        review_count, review_sentiment = fetch_review_summary(app_id)

        # Extract price
        price_overview = game_info.get("price_overview")
        if price_overview:
            price = price_overview.get("final_formatted", "N/A")
        elif game_info.get("is_free"):
            price = "Free"
        else:
            price = "N/A"

        # Extract release date
        release_date = game_info.get("release_date", {}).get("date", "N/A")

        # Fetch current players from Official API
        current_online = fetch_player_count(app_id)

        comparison_data = {
            "app_id": app_id,
            "name": game_info.get("name"),
            "header_image": game_info.get("header_image"),
            "review_count": review_count,
            "review_sentiment": review_sentiment,
            "release_date": release_date,
            "price": price,
            "current_online": current_online,
        }

        return comparison_data

    except requests.RequestException as e:
        logger.error(f"Error fetching comparison data for app {app_id}: {e}")
        return None


def get_daily_game_pairs():
    """
    Generate 10 unique game pairs for daily challenge.
    Uses date-based seeding so same pairs appear all day.
    """
    seed = datetime.utcnow().strftime("%Y-%m-%d")
    rng = random.Random(seed)
    pool = CHALLENGE_GAME_POOL.copy()
    rng.shuffle(pool)

    pairs = []
    while len(pairs) < 10 and len(pool) >= 2:
        app_id1 = pool.pop()
        app_id2 = pool.pop()
        pairs.append((app_id1, app_id2))

    return pairs


def build_daily_challenge_payload():
    """
    Build daily challenge payload containing 10 game pairs with stats.
    """
    pairs = get_daily_game_pairs()
    results = []

    for index, (app_id1, app_id2) in enumerate(pairs, start=1):
        game1 = fetch_comparison_data(app_id1)
        game2 = fetch_comparison_data(app_id2)
        if not game1 or not game2:
            logger.warning(
                f"Skipping daily challenge pair {app_id1} vs {app_id2} due to missing data"
            )
            continue

        results.append(
            {
                "id": index,
                "game1": game1,
                "game2": game2,
            }
        )

    return {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "pairs": results,
    }
