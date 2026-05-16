from django.core.management.base import BaseCommand
from games.bootstrap import ensure_daily_challenge


class Command(BaseCommand):
    help = "Generate and cache the daily challenge payload for the current UTC day."

    def handle(self, *args, **options):
        challenge = ensure_daily_challenge()

        if not challenge:
            self.stderr.write(
                self.style.ERROR(
                    "The daily challenge could not be generated. Run refresh_steamspy_top_games first if the SteamSpy list is missing."
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f"Stored daily challenge for {challenge.date} with {len(challenge.payload.get('pairs', []))} pairs."
            )
        )
