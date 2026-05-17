import requests
import logging
import os
import json
from pathlib import Path
from datetime import datetime
import random
import time

logger = logging.getLogger(__name__)

# Debug export directory and flag
_DEBUG_ENABLED = os.getenv("GAME_FETCH_DEBUG") == "1"
_DEBUG_DIR = Path(
    os.getenv("GAME_FETCH_DEBUG_DIR", Path(__file__).resolve().parent / "debug_fetch")
)
if _DEBUG_ENABLED:
    try:
        _DEBUG_DIR.mkdir(parents=True, exist_ok=True)
    except Exception:
        logger.exception("Failed to create debug directory %s", _DEBUG_DIR)

STEAM_STORE_API_URL = "https://store.steampowered.com/api/"
STEAM_OFFICIAL_API_URL = "https://api.steampowered.com/"
STEAMSPY_API_URL = "https://steamspy.com/api.php"


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
        if _DEBUG_ENABLED:
            try:
                with open(
                    _DEBUG_DIR / f"{app_id}_playercount.json", "w", encoding="utf-8"
                ) as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            except Exception:
                logger.exception("Failed to write playercount debug for %s", app_id)

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

        if _DEBUG_ENABLED:
            try:
                with open(
                    _DEBUG_DIR / f"{app_id}_store.json", "w", encoding="utf-8"
                ) as f:
                    json.dump(app_data, f, ensure_ascii=False, indent=2)
            except Exception:
                logger.exception("Failed to write store debug for %s", app_id)

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


def fetch_steamspy_top_game_ids():
    """
    Fetch the top 2000 SteamSpy game app ids from page 0 and 1.
    The function waits at least one minute between requests to avoid rate limiting.
    """
    app_ids = []
    seen_app_ids = set()

    for page in (0, 1):
        try:
            response = requests.get(
                STEAMSPY_API_URL,
                params={"request": "all", "page": page},
                timeout=30,
            )
            response.raise_for_status()
            payload = response.json()

            for app_id in payload.keys():
                try:
                    parsed_app_id = int(app_id)
                except (TypeError, ValueError):
                    continue

                if parsed_app_id not in seen_app_ids:
                    seen_app_ids.add(parsed_app_id)
                    app_ids.append(parsed_app_id)
        except (requests.RequestException, ValueError) as e:
            logger.error(f"Error fetching SteamSpy top games page {page}: {e}")
            if not app_ids:
                return []

        if page == 0:
            time.sleep(60)

    if _DEBUG_ENABLED:
        try:
            with open(
                _DEBUG_DIR / "steamspy_top_pages.json", "w", encoding="utf-8"
            ) as f:
                json.dump(app_ids, f, ensure_ascii=False, indent=2)
        except Exception:
            logger.exception("Failed to write steamspy debug file")

    return app_ids


def fetch_review_summary(app_id):
    """
    Fetch user review summary from Steam appreviews endpoint.
    Returns tuple: (review_count, review_sentiment)
    """
    try:
        url = f"https://store.steampowered.com/appreviews/{app_id}"
        params = {
            "json": 1,
            "language": "all",
            "purchase_type": "all",
            "num_per_page": 0,
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        payload = response.json()
        if _DEBUG_ENABLED:
            try:
                with open(
                    _DEBUG_DIR / f"{app_id}_reviews.json", "w", encoding="utf-8"
                ) as f:
                    json.dump(payload, f, ensure_ascii=False, indent=2)
            except Exception:
                logger.exception("Failed to write review debug for %s", app_id)

        summary = payload.get("query_summary", {})
        review_count = summary.get("total_reviews", 0) or 0
        total_positive = summary.get("total_positive", 0) or 0
        review_score_desc = summary.get("review_score_desc")
        if review_count > 0:
            percent = round((total_positive / review_count) * 100)
            review_sentiment = f"{percent}%"
        else:
            review_sentiment = "N/A"
        return review_count, review_sentiment, review_score_desc
    except requests.RequestException as e:
        logger.warning(f"Error fetching review summary for app {app_id}: {e}")
        return 0, "N/A", None


def fetch_random_english_reviews(app_id, sample_size=10):
    """
    Fetch English reviews from Steam appreviews endpoint and return a random sample.
    """
    try:
        url = f"https://store.steampowered.com/appreviews/{app_id}"
        params = {
            "json": 1,
            "language": "english",
            "purchase_type": "all",
            "filter": "all",
            "num_per_page": 100,
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        payload = response.json()
        if _DEBUG_ENABLED:
            try:
                with open(
                    _DEBUG_DIR / f"{app_id}_reviews_english.json",
                    "w",
                    encoding="utf-8",
                ) as f:
                    json.dump(payload, f, ensure_ascii=False, indent=2)
            except Exception:
                logger.exception("Failed to write English review debug for %s", app_id)

        reviews = payload.get("reviews", []) or []
        english_reviews = [
            review
            for review in reviews
            if review.get("language", "").lower() == "english"
        ]
        if len(english_reviews) <= sample_size:
            return english_reviews

        return random.sample(english_reviews, sample_size)
    except requests.RequestException as e:
        logger.warning(f"Error fetching English reviews for app {app_id}: {e}")
        return []


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

        return build_comparison_data(app_id, game_info)

    except requests.RequestException as e:
        logger.error(f"Error fetching comparison data for app {app_id}: {e}")
        return None


def build_comparison_data(app_id, game_info):
    """
    Build the comparison payload from already fetched Steam Store data.
    """
    review_count, review_sentiment, review_score_desc = fetch_review_summary(app_id)
    sampled_reviews = fetch_random_english_reviews(app_id)

    review_sentiment_label = review_score_desc or review_sentiment

    price_overview = game_info.get("price_overview")
    if price_overview:
        price = price_overview.get("final_formatted", "N/A")
    elif game_info.get("is_free"):
        price = "Free"
    else:
        price = "N/A"

    current_online = fetch_player_count(app_id)

    return {
        "app_id": app_id,
        "name": game_info.get("name"),
        "steam_appid": game_info.get("steam_appid", app_id),
        "required_age": game_info.get("required_age"),
        "is_free": game_info.get("is_free"),
        "short_description": game_info.get("short_description"),
        "header_image": game_info.get("header_image"),
        "developers": game_info.get("developers", []),
        "publishers": game_info.get("publishers", []),
        "platforms": game_info.get("platforms", {}),
        "metacritic": game_info.get("metacritic"),
        "categories": game_info.get("categories", []),
        "genres": game_info.get("genres", []),
        "screenshots": game_info.get("screenshots", []),
        "movies": game_info.get("movies", []),
        "achievements": game_info.get("achievements"),
        "release_date": game_info.get("release_date", {}).get("date", "N/A"),
        "background": game_info.get("background"),
        "content_descriptors": game_info.get("content_descriptors"),
        "ratings": game_info.get("ratings"),
        "review_count": review_count,
        "review_sentiment": review_sentiment,
        "review_sentiment_label": review_sentiment_label,
        "review_score_desc": review_score_desc,
        "price": price,
        "current_online": current_online,
        "reviews": sampled_reviews,
    }


def get_daily_game_pairs(game_pool, round_count=5):
    """
    Generate unique game pairs for daily challenge.
    Uses date-based seeding so same pairs appear all day.
    """
    seed = datetime.utcnow().strftime("%Y-%m-%d")
    rng = random.Random(seed)
    pool = list(dict.fromkeys(game_pool))
    rng.shuffle(pool)

    pairs = []
    while len(pairs) < round_count and len(pool) >= 2:
        app_id1 = pool.pop()
        app_id2 = pool.pop()
        pairs.append((app_id1, app_id2))

    return pairs
