from django.urls import path
from .views import GameViewSet

urlpatterns = [
    path(
        "games/daily_challenge/",
        GameViewSet.as_view({"get": "daily_challenge"}),
        name="game-daily-challenge",
    ),
]
