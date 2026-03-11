from django.contrib import admin
from .models import AuditoriaPedido, DetallePedido, EstadoPedido, Pedido
# Register your models here.
admin.site.register(EstadoPedido)
admin.site.register(Pedido)
admin.site.register(DetallePedido)
admin.site.register(AuditoriaPedido)