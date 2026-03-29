from rest_framework.routers import DefaultRouter

from .views import AuditoriaPedidoViewSet, DetallePedidoViewSet, EstadoPedidoViewSet, PedidoViewSet

router = DefaultRouter()
router.register(r"estados", EstadoPedidoViewSet, basename="estado-pedido")
router.register(r"pedidos", PedidoViewSet, basename="pedido")
router.register(r"detalles", DetallePedidoViewSet, basename="detalle-pedido")
router.register(r"auditoria", AuditoriaPedidoViewSet, basename="auditoria-pedido")

urlpatterns = router.urls
