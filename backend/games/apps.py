from django.apps import AppConfig
import os
import sys


def _should_bootstrap_game_data():
    if os.environ.get("GAMES_SKIP_AUTO_BOOTSTRAP") == "1":
        return False

    if os.environ.get("RUN_MAIN") == "true":
        return True

    command_name = " ".join(sys.argv).lower()
    return any(
        token in command_name
        for token in ("runserver", "gunicorn", "uvicorn", "daphne")
    )


class GamesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "games"

    def ready(self):
        if not _should_bootstrap_game_data():
            return

        from .bootstrap import bootstrap_game_data, start_daily_challenge_scheduler

        if bootstrap_game_data():
            start_daily_challenge_scheduler()
