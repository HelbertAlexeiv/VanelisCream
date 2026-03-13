from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MarcaViewSet, PresentacionViewSet, ProductoViewSet

router = DefaultRouter()
router.register(r'marcas', MarcaViewSet)
router.register(r'presentaciones', PresentacionViewSet)
router.register(r'productos', ProductoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
