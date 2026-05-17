from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DailyChallenge
from django.utils import timezone
from .bootstrap import ensure_daily_challenge


class GameViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["get"])
    def daily_challenge(self, request):
        """
        Fetch the cached daily challenge payload.
        GET /api/games/daily_challenge/
        """
        today = timezone.now().date()
        challenge = ensure_daily_challenge(today)

        if not challenge:
            return Response(
                {"error": "Daily challenge has not been generated yet"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(challenge.payload)
