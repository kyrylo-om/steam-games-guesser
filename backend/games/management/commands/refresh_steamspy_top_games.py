from django.core.management.base import BaseCommand
from games.bootstrap import ensure_steamspy_top_game_list


class Command(BaseCommand):
    help = "Fetch and store the top 2000 SteamSpy app ids."

    def handle(self, *args, **options):
        top_game_list = ensure_steamspy_top_game_list()

        if not top_game_list:
            self.stderr.write(self.style.ERROR("No SteamSpy app ids were fetched."))
            return

        self.stdout.write(
            self.style.SUCCESS(
                f"Stored {len(top_game_list.app_ids)} SteamSpy app ids in the database."
            )
        )
