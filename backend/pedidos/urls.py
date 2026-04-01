from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PedidoViewSet, EstadoPedidoViewSet


router = DefaultRouter()
router.register(r'estado', EstadoPedidoViewSet, basename='estado-pedido')
router.register(r'', PedidoViewSet, basename='pedido')

urlpatterns = router.urls
