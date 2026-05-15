from django.urls import path
from .views import GameViewSet

urlpatterns = [
    path("games/fetch/", GameViewSet.as_view({"get": "fetch"}), name="game-fetch"),
    path("games/full_data/", GameViewSet.as_view({"get": "full_data"}), name="game-full-data"),
    path("games/compare/", GameViewSet.as_view({"get": "compare"}), name="game-compare"),
    path("games/daily_challenge/", GameViewSet.as_view({"get": "daily_challenge"}), name="game-daily-challenge"),
]
