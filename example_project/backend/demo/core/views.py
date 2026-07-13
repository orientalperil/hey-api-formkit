from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Category, Order, Product, Supplier
from core.serializers import (
    CategorySerializer,
    LoginSerializer,
    OrderSerializer,
    ProductSerializer,
    SupplierSerializer,
    TokenSerializer,
)


class LoginView(APIView):
    """Exchange a username and password for an auth token."""

    authentication_classes = []  # logging in must not require being logged in
    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses=TokenSerializer,
        operation_id='login',
        tags=['Auth'],
    )
    def post(self, request):
        serializer = AuthTokenSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        token, _ = Token.objects.get_or_create(user=serializer.validated_data['user'])
        return Response({'token': token.key})


@extend_schema(tags=['Categories'])
class CategoryViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for product categories."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@extend_schema(tags=['Suppliers'])
class SupplierViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for suppliers."""

    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


@extend_schema(tags=['Products'])
class ProductViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for products."""

    queryset = Product.objects.select_related('category', 'supplier').all()
    serializer_class = ProductSerializer


@extend_schema(tags=['Orders'])
class OrderViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for orders, including their line items."""

    queryset = Order.objects.prefetch_related('items__product').all()
    serializer_class = OrderSerializer
