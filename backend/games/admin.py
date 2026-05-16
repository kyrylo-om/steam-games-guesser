from django.contrib import admin
from .models import CachedGame, DailyChallenge, SteamSpyTopGameList

admin.site.register(CachedGame)
admin.site.register(DailyChallenge)
admin.site.register(SteamSpyTopGameList)
