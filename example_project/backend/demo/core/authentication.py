from rest_framework.authentication import TokenAuthentication


class BearerTokenAuthentication(TokenAuthentication):
    """DRF token auth that expects ``Authorization: Bearer <token>``.

    The only change from the stock class is the keyword, so the header format
    matches the OpenAPI ``http`` / ``bearer`` security scheme (see
    ``core.schema.BearerTokenScheme``).
    """

    keyword = 'Bearer'
