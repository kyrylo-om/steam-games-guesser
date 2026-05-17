from copy import deepcopy

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .bootstrap import ensure_daily_challenge


PUBLICLY_HIDDEN_GAME_FIELDS = {"platforms", "metacritic", "ratings"}


def _public_daily_payload(payload):
    if not payload:
        return payload

    public_payload = deepcopy(payload)
    for pair in public_payload.get("pairs", []):
        if not isinstance(pair, dict):
            continue

        for game_key in ("game1", "game2"):
            game = pair.get(game_key)
            if not isinstance(game, dict):
                continue

            for field in PUBLICLY_HIDDEN_GAME_FIELDS:
                game.pop(field, None)

    return public_payload


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

        return Response(_public_daily_payload(challenge.payload))
