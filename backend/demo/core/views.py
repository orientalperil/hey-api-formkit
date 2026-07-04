from drf_spectacular.utils import extend_schema
from rest_framework import viewsets

from core.models import Category, Order, Product, Supplier
from core.serializers import (
    CategorySerializer,
    OrderSerializer,
    ProductSerializer,
    SupplierSerializer,
)


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
