from rest_framework import serializers
from .models import CachedGame


class CachedGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = CachedGame
        fields = ["app_id", "name", "data", "cached_at"]
