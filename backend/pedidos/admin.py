from django.contrib import admin
from .models import AuditoriaPedido, DetallePedido, EstadoPedido, Pedido
# Aca se registran los modelos para que aparezcan en el panel de administración de Django
admin.site.register(EstadoPedido)
admin.site.register(Pedido)
admin.site.register(DetallePedido)
admin.site.register(AuditoriaPedido)