from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Registers the BearerTokenScheme OpenAPI extension.
        from . import schema  # noqa: F401
