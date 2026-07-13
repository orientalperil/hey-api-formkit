from drf_spectacular.extensions import OpenApiAuthenticationExtension


class BearerTokenScheme(OpenApiAuthenticationExtension):
    """Describe ``BearerTokenAuthentication`` as HTTP bearer in the OpenAPI schema.

    Without this, drf-spectacular would document the token class as an
    ``apiKey`` header, and the generated hey-api client would send the raw token
    with no ``Bearer`` prefix. Emitting ``http`` / ``bearer`` makes the client
    prepend ``Bearer `` automatically.
    """

    target_class = 'core.authentication.BearerTokenAuthentication'
    name = 'bearerAuth'

    def get_security_definition(self, auto_schema):
        return {'type': 'http', 'scheme': 'bearer'}
