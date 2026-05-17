import logging
import threading
from datetime import (
    datetime,
    time as datetime_time,
    timedelta,
    timezone as datetime_timezone,
)

from django.db import close_old_connections, connection
from django.utils import timezone

from .models import DailyChallenge, SteamSpyTopGameList
from .steam_service import (
    build_comparison_data,
    fetch_game_from_steam,
    fetch_steamspy_top_game_ids,
    get_daily_game_pairs,
)


logger = logging.getLogger(__name__)

DEFAULT_TOP_GAME_LIST_NAME = "default"
DAILY_ROUND_COUNT = 5
RICH_GAME_FIELDS = {
    "name",
    "steam_appid",
    "required_age",
    "is_free",
    "short_description",
    "header_image",
    "developers",
    "publishers",
    "platforms",
    "metacritic",
    "categories",
    "genres",
    "screenshots",
    "movies",
    "achievements",
    "release_date",
    "background",
    "content_descriptors",
    "ratings",
    "reviews",
}

_scheduler_started = False
_scheduler_lock = threading.Lock()
_bootstrap_lock = threading.Lock()


def _game_tables_ready():
    existing_tables = set(connection.introspection.table_names())
    return {
        DailyChallenge._meta.db_table,
        SteamSpyTopGameList._meta.db_table,
    }.issubset(existing_tables)


def _daily_challenge_pair_count(challenge):
    if not challenge or not challenge.payload:
        return 0

    pairs = challenge.payload.get("pairs", [])
    if not isinstance(pairs, list):
        return 0

    return len(pairs)


def _payload_has_rich_game_data(payload):
    if not payload:
        return False

    pairs = payload.get("pairs", [])
    if not isinstance(pairs, list) or not pairs:
        return False

    for pair in pairs:
        if not isinstance(pair, dict):
            return False

        for game_key in ("game1", "game2"):
            game = pair.get(game_key)
            if not isinstance(game, dict):
                return False

            if not RICH_GAME_FIELDS.issubset(game.keys()):
                return False

            if not isinstance(game.get("reviews"), list):
                return False

    return True


def ensure_steamspy_top_game_list():
    if not _game_tables_ready():
        logger.info("Skipping SteamSpy bootstrap until game tables exist.")
        return None

    existing_list = SteamSpyTopGameList.objects.filter(
        name=DEFAULT_TOP_GAME_LIST_NAME
    ).first()
    if existing_list and existing_list.app_ids:
        return existing_list

    app_ids = fetch_steamspy_top_game_ids()
    if not app_ids:
        logger.error("SteamSpy top game list could not be generated.")
        return None

    top_game_list, _ = SteamSpyTopGameList.objects.update_or_create(
        name=DEFAULT_TOP_GAME_LIST_NAME,
        defaults={"app_ids": app_ids},
    )
    return top_game_list


def _ensure_cached_game(app_id):
    """
    Fetch game data from Steam without persisting to a per-game cache.
    Returns tuple (cleaned_data, full_data) or (None, None) on failure.
    """
    cleaned_data, full_data = fetch_game_from_steam(app_id)
    if not cleaned_data or not full_data:
        return None, None

    return cleaned_data, full_data


def _build_daily_challenge_payload(target_date):
    top_game_list = ensure_steamspy_top_game_list()
    if not top_game_list or not top_game_list.app_ids:
        return None

    pairs = get_daily_game_pairs(top_game_list.app_ids, round_count=DAILY_ROUND_COUNT)
    results = []

    for index, (app_id1, app_id2) in enumerate(pairs, start=1):
        cleaned1, full1 = _ensure_cached_game(app_id1)
        cleaned2, full2 = _ensure_cached_game(app_id2)

        if not cleaned1 or not full1 or not cleaned2 or not full2:
            logger.warning(
                "Skipping daily pair %s vs %s because one or both games could not be fetched.",
                app_id1,
                app_id2,
            )
            continue

        comparison_game1 = build_comparison_data(app_id1, full1)
        comparison_game2 = build_comparison_data(app_id2, full2)

        if not comparison_game1 or not comparison_game2:
            logger.warning(
                "Skipping daily pair %s vs %s because comparison data could not be built.",
                app_id1,
                app_id2,
            )
            continue

        results.append(
            {
                "id": index,
                "game1": comparison_game1,
                "game2": comparison_game2,
            }
        )

    payload = {
        "date": target_date.isoformat(),
        "pairs": results,
    }

    DailyChallenge.objects.update_or_create(
        date=target_date,
        defaults={"payload": payload},
    )
    return payload


def ensure_daily_challenge(target_date=None):
    target_date = target_date or timezone.now().date()
    challenge = DailyChallenge.objects.filter(date=target_date).first()
    if (
        challenge
        and _daily_challenge_pair_count(challenge) == DAILY_ROUND_COUNT
        and _payload_has_rich_game_data(challenge.payload)
    ):
        return challenge

    payload = _build_daily_challenge_payload(target_date)
    if not payload:
        return None

    return DailyChallenge.objects.filter(date=target_date).first()


def bootstrap_game_data():
    with _bootstrap_lock:
        if not _game_tables_ready():
            logger.info(
                "Skipping automatic game bootstrap until migrations are applied."
            )
            return False

        ensure_steamspy_top_game_list()
        ensure_daily_challenge()
        return True


def _seconds_until_next_utc_midnight():
    now = timezone.now()
    next_midnight = datetime.combine(
        now.date() + timedelta(days=1),
        datetime_time.min,
        tzinfo=datetime_timezone.utc,
    )
    return max(1, (next_midnight - now).total_seconds())


def _daily_scheduler_loop():
    close_old_connections()
    while True:
        try:
            sleep_seconds = _seconds_until_next_utc_midnight()
            threading.Event().wait(sleep_seconds)
            close_old_connections()
            ensure_daily_challenge()
        except Exception:
            logger.exception(
                "Unexpected error while running the daily challenge scheduler."
            )
            threading.Event().wait(60)


def start_daily_challenge_scheduler():
    global _scheduler_started

    with _scheduler_lock:
        if _scheduler_started:
            return

        scheduler_thread = threading.Thread(
            target=_daily_scheduler_loop,
            name="daily-challenge-scheduler",
            daemon=True,
        )
        scheduler_thread.start()
        _scheduler_started = True
