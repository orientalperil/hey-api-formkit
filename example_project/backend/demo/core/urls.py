from rest_framework.routers import DefaultRouter

from core.views import (
    CategoryViewSet,
    OrderViewSet,
    ProductViewSet,
    SupplierViewSet,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('products', ProductViewSet, basename='product')
router.register('orders', OrderViewSet, basename='order')

urlpatterns = router.urls
