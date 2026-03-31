from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from catalogo.models import Producto
from pedidos.models import Pedido, EstadoPedido

class InventarioService:
    @staticmethod
    def descontar_stock_pedido(pedido_id):
        """
        descuenta el stock de los productos de un pedido, pero solo si ya 
        pasó el tiempo límite de cancelación y el pedido 
        no ha sido cancelado.
        """
        tiempo_limite_cancelacion = timedelta(minutes=10)
        
        with transaction.atomic():
            try:
                pedido = Pedido.objects.select_related('estado').get(id=pedido_id)
            except Pedido.DoesNotExist:
                return False, "Pedido no encontrado."
            
            # Si el pedido está cancelado, no descontamos
            if pedido.estado.nombre.lower() == 'cancelado':
                return False, "El pedido fue cancelado."
            
            # Verificar si ya pasó el tiempo para cancelar
            tiempo_actual = timezone.now()
            if (tiempo_actual - pedido.fecha_creacion) < tiempo_limite_cancelacion:
                return False, "Aún no ha pasado el tiempo posible para cancelar."
            
            # Proceder a descontar
            detalles = pedido.detalles.select_related('producto')
            for detalle in detalles:
                producto = detalle.producto
                if producto.stock < detalle.cantidad:
                    # Alternativa: descontar lo que hay, o lanzar un ValueError
                    return False, f"Stock insuficiente para el producto {producto.nombre}."
                
                producto.stock -= detalle.cantidad
                producto.save(update_fields=['stock'])
            
            return True, "Stock descontado exitosamente."
            
    @staticmethod
    def verificar_stock_disponible(producto_id, cantidad):
        """
        Calcula el stock real disponible, restando los productos que están 'reservados'
        en pedidos recientes que aún están en periodo de cancelación (no han sido descontados 
        oficialmente) y no están cancelados.
        """
        from django.db.models import Sum
        from datetime import timedelta
        from django.utils import timezone
        
        try:
            producto = Producto.objects.get(id=producto_id)
        except Producto.DoesNotExist:
            return False, "Producto no encontrado."
            
        tiempo_limite = timezone.now() - timedelta(minutes=30)
        
        # Filtrar pedidos creados recientemente pero que no estén cancelados y no han descontado todavía 
        # (Esto asume que los pedidos aprobados 'descontados' cambian de estado o se registran de alguna forma.
        # Aquí asumiremos estado 'creado' o similar representa en ventana de cancelación.)
        pedidos_recientes = Pedido.objects.filter(
            fecha_creacion__gte=tiempo_limite
        ).exclude(estado__nombre__icontains='cancelado').values_list('id', flat=True)
        
        from pedidos.models import DetallePedido
        reservado = DetallePedido.objects.filter(
            pedido_id__in=pedidos_recientes,
            producto_id=producto_id
        ).aggregate(total=Sum('cantidad'))['total'] or 0
        
        stock_real = producto.stock - reservado
        return stock_real >= cantidad, stock_real

    @staticmethod
    def validar_stock_para_pedido(articulos):
        """
        articulos: lista de diccionarios [{'producto_id': 1, 'cantidad': 5}, ...]
        Valida que cada artículo tenga stock suficiente en tiempo real.
        Si algún artículo supera el stock disponible, lanza una alerta (ValidationError)
        con un mensaje claro para que el frontend pida al usuario modificar la cantidad.
        """
        from rest_framework.exceptions import ValidationError
        
        errores = []
        for articulo in articulos:
            producto_id = articulo.get('producto_id')
            cantidad = articulo.get('cantidad', 0)
            
            suficiente, stock_real_o_msg = InventarioService.verificar_stock_disponible(producto_id, cantidad)
            
            if not suficiente:
                if isinstance(stock_real_o_msg, str): # Caso donde el producto no exista
                    errores.append({
                        "producto_id": producto_id, 
                        "mensaje": stock_real_o_msg
                    })
                else: # Caso donde supera el stock
                    errores.append({
                        "producto_id": producto_id,
                        "mensaje": f"Has seleccionado {cantidad} unidades, pero solo quedan {stock_real_o_msg} disponibles en este momento. Por favor, modifica la cantidad."
                    })
        
        if errores:
            # Levantamos el error que DRF atrapará y retornará como un HTTP 400 Bad Request.
            # El frontend puede leer "alerta_stock" para mostrarle al usuario el o los mensajes.
            raise ValidationError({"alerta_stock": errores})
