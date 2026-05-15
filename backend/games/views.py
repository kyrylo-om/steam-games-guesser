from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CachedGame, DailyChallenge
from .serializers import CachedGameSerializer
from .steam_service import (
    fetch_game_from_steam,
    fetch_comparison_data,
    build_daily_challenge_payload,
)
from django.utils import timezone


class GameViewSet(viewsets.ModelViewSet):
    queryset = CachedGame.objects.all()
    serializer_class = CachedGameSerializer
    lookup_field = "app_id"

    @action(detail=False, methods=["get"])
    def fetch(self, request):
        """
        Fetch cleaned game data by app_id
        GET /api/games/fetch/?app_id=440
        """
        app_id = request.query_params.get("app_id")

        if not app_id:
            return Response(
                {"error": "app_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            app_id = int(app_id)
        except ValueError:
            return Response(
                {"error": "app_id must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Try to get from cache
        try:
            cached_game = CachedGame.objects.get(app_id=app_id)

            # Check if cache is expired
            if cached_game.is_expired():
                # Fetch fresh data from Steam
                cleaned_data, full_data = fetch_game_from_steam(app_id)
                if cleaned_data:
                    cached_game.name = cleaned_data["name"]
                    cached_game.data = cleaned_data
                    cached_game.full_steam_data = full_data
                    cached_game.save()
                else:
                    return Response(
                        {"error": "Game not found on Steam"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

            serializer = self.get_serializer(cached_game)
            return Response(serializer.data)

        except CachedGame.DoesNotExist:
            # Fetch from Steam and cache it
            cleaned_data, full_data = fetch_game_from_steam(app_id)

            if not cleaned_data:
                return Response(
                    {"error": "Game not found on Steam"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Create cache entry
            cached_game = CachedGame.objects.create(
                app_id=app_id,
                name=cleaned_data["name"],
                data=cleaned_data,
                full_steam_data=full_data,
            )

            serializer = self.get_serializer(cached_game)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def full_data(self, request):
        """
        Fetch full Steam API response by app_id
        GET /api/games/full_data/?app_id=440
        """
        app_id = request.query_params.get("app_id")

        if not app_id:
            return Response(
                {"error": "app_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            app_id = int(app_id)
        except ValueError:
            return Response(
                {"error": "app_id must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Try to get from cache
        try:
            cached_game = CachedGame.objects.get(app_id=app_id)

            # Check if cache is expired
            if cached_game.is_expired():
                # Fetch fresh data from Steam
                cleaned_data, full_data = fetch_game_from_steam(app_id)
                if full_data:
                    cached_game.name = cleaned_data["name"]
                    cached_game.data = cleaned_data
                    cached_game.full_steam_data = full_data
                    cached_game.save()
                else:
                    return Response(
                        {"error": "Game not found on Steam"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

            # Return just the full steam data
            return Response({
                "app_id": cached_game.app_id,
                "steam_data": cached_game.full_steam_data,
                "cached_at": cached_game.cached_at,
            })

        except CachedGame.DoesNotExist:
            # Fetch from Steam and cache it
            cleaned_data, full_data = fetch_game_from_steam(app_id)

            if not full_data:
                return Response(
                    {"error": "Game not found on Steam"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Create cache entry
            cached_game = CachedGame.objects.create(
                app_id=app_id,
                name=cleaned_data["name"],
                data=cleaned_data,
                full_steam_data=full_data,
            )

            # Return the full steam data
            return Response({
                "app_id": cached_game.app_id,
                "steam_data": full_data,
                "cached_at": cached_game.cached_at,
            }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def compare(self, request):
        """
        Fetch comparison data for two games by app_id
        GET /api/games/compare/?appid1=440&appid2=730
        Returns combined stats: review_count, review_sentiment, release_date, price, current_online
        """
        appid1 = request.query_params.get("appid1")
        appid2 = request.query_params.get("appid2")

        if not appid1 or not appid2:
            return Response(
                {"error": "appid1 and appid2 parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            appid1 = int(appid1)
            appid2 = int(appid2)
        except ValueError:
            return Response(
                {"error": "appid1 and appid2 must be integers"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch both games
        game1 = fetch_comparison_data(appid1)
        game2 = fetch_comparison_data(appid2)

        if not game1 or not game2:
            return Response(
                {"error": "One or both games not found on Steam"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "game1": game1,
            "game2": game2,
        })

    @action(detail=False, methods=["get"])
    def daily_challenge(self, request):
        """
        Fetch daily challenge payload with 10 game pairs.
        GET /api/games/daily_challenge/
        """
        today = timezone.now().date()
        challenge = DailyChallenge.objects.filter(date=today).first()

        if not challenge:
            payload = build_daily_challenge_payload()
            challenge = DailyChallenge.objects.create(date=today, payload=payload)

        return Response(challenge.payload)
