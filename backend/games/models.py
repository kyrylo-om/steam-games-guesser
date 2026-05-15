from django.db import models
from django.utils import timezone
from datetime import timedelta


class CachedGame(models.Model):
    app_id = models.IntegerField(unique=True, primary_key=True)
    name = models.CharField(max_length=255)
    data = models.JSONField()  # Cleaned/simplified data
    full_steam_data = models.JSONField(null=True, blank=True)  # Full Steam API response
    cached_at = models.DateTimeField(auto_now=True)

    def is_expired(self):
        """Check if cache is older than 24 hours"""
        expiration_time = self.cached_at + timedelta(hours=24)
        return timezone.now() > expiration_time

    def __str__(self):
        return f"{self.name} ({self.app_id})"

    class Meta:
        ordering = ["-cached_at"]


class DailyChallenge(models.Model):
    date = models.DateField(unique=True)
    payload = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Daily Challenge {self.date}"
