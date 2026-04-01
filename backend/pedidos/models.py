from django.db import models
from django.db.models import Sum, F
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class EstadoPedido(models.Model):

    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "estado_pedido"

    def __str__(self):
        return self.nombre
    
class Pedido(models.Model):

    cliente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="pedidos_cliente")
    empleado = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="pedidos_empleado", blank=True, null=True)
    estado = models.ForeignKey(EstadoPedido, on_delete=models.PROTECT, related_name="pedidos")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_limite_cancelacion = models.DateTimeField(blank=True, null=True)
    direccion_entrega = models.CharField(max_length=200)
    total_pedido = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "pedido"

    def __str__(self):
        return f"Pedido {self.id}"
    

class DetallePedido(models.Model):

    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey('catalogo.Producto', on_delete=models.PROTECT, related_name="detalles_pedido")
    cantidad = models.PositiveIntegerField(null=True, blank=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "detalle_pedido"

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"
    

class AuditoriaPedido(models.Model):

    pedido = models.ForeignKey(Pedido, on_delete=models.SET_NULL, null=True)
    usuario = models.CharField(max_length=100)
    accion = models.CharField(max_length=20)
    campo_modificado = models.CharField(max_length=50)
    valor_anterior = models.CharField(max_length=255, null=True, blank=True)
    valor_nuevo = models.CharField(max_length=255, null=True, blank=True)
    fecha_evento = models.DateTimeField(auto_now_add=True)