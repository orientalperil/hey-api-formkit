from django.urls import path
from rest_framework.routers import DefaultRouter

from core.views import (
    CategoryViewSet,
    LoginView,
    OrderViewSet,
    ProductViewSet,
    SupplierViewSet,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('products', ProductViewSet, basename='product')
router.register('orders', OrderViewSet, basename='order')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    *router.urls,
]
