from django.db import models
from django.utils import timezone
from datetime import timedelta


# `CachedGame` removed: per-game caching is no longer used. The model and
# its table should be removed via a migration if desired. Keeping this
# comment here to explain the historical behavior.


class DailyChallenge(models.Model):
    date = models.DateField(unique=True)
    payload = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Daily Challenge {self.date}"


class SteamSpyTopGameList(models.Model):
    name = models.CharField(max_length=64, unique=True, default="default")
    app_ids = models.JSONField(default=list)
    fetched_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SteamSpy Top Game List ({self.name})"
