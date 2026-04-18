from collections import defaultdict

from django.db import transaction
from django.utils import timezone

from catalogo.models import Producto

# Servicio para gestionar el inventario en función de los pedidos y su estado
class InventarioService:
    # Métodos estáticos para determinar si se debe descontar o reintegrar stock según el estado del pedido
	@staticmethod
	def stock_descontado(pedido):
		return pedido.estado.nombre.lower() == 'recibido'

	@staticmethod
	def stock_reintegrado(pedido):
		return pedido.estado.nombre.lower() == 'cancelado'
	# Método privado para obtener las cantidades totales por producto en un pedido, manejando casos de error
	@staticmethod
	def _obtener_cantidades_por_producto(pedido):
		cantidades_por_producto = defaultdict(int)
		# Validar que cada detalle del pedido tenga un producto asociado
		for detalle in pedido.detalles.all():
			if detalle.producto_id is None:
				return None, 'El detalle del pedido no tiene producto asociado.'

			cantidades_por_producto[detalle.producto_id] += detalle.cantidad or 0

		return cantidades_por_producto, None
	# Método para descontar stock de un pedido, asegurando 
 	# que el pedido esté en el estado correcto y que haya suficiente stock disponible
	@staticmethod
	def descontar_stock_pedido(pedido_id, usuario='sistema'):
		from pedidos.models import Pedido

		with transaction.atomic():
			try:
				pedido = (
					Pedido.objects.select_related('estado')
					.prefetch_related('detalles__producto')
					.select_for_update()
					.get(id=pedido_id)
				)
			except Pedido.DoesNotExist:
				return False, 'Pedido no encontrado.'

			if not InventarioService.stock_descontado(pedido):
				return False, 'Solo se puede descontar stock para pedidos en estado recibido.'

			cantidades_por_producto, error = InventarioService._obtener_cantidades_por_producto(pedido)
			if error:
				return False, error

			productos = Producto.objects.select_for_update().filter(id__in=cantidades_por_producto.keys()).in_bulk()
			# Validar que cada producto exista y que haya suficiente stock para descontar
			for producto_id, cantidad_total in cantidades_por_producto.items():
				producto = productos.get(producto_id)
				if producto is None:
					return False, f'Producto {producto_id} no encontrado.'

				if producto.stock < cantidad_total:
					return False, f'Stock insuficiente para el producto {producto.nombre}.'
			# Descontar el stock de cada producto según la cantidad total requerida por el pedido
			for producto_id, cantidad_total in cantidades_por_producto.items():
				producto = productos[producto_id]
				producto.stock -= cantidad_total
				producto.save(update_fields=['stock'])

			return True, 'Stock descontado exitosamente.'

	# Método para reintegrar stock de un pedido, asegurando 
	# que el pedido esté en el estado correcto y que los productos existan
	@staticmethod
	def reintegrar_stock_pedido(pedido_id, usuario='sistema'):
		from pedidos.models import Pedido

		with transaction.atomic():
			try:
				pedido = (
					Pedido.objects.select_related('estado')
					.prefetch_related('detalles__producto')
					.select_for_update()
					.get(id=pedido_id)
				)
			except Pedido.DoesNotExist:
				return False, 'Pedido no encontrado.'

			if not InventarioService.stock_reintegrado(pedido):
				return False, 'Solo se puede reintegrar stock para pedidos en estado cancelado.'

			cantidades_por_producto, error = InventarioService._obtener_cantidades_por_producto(pedido)
			if error:
				return False, error

			productos = Producto.objects.select_for_update().filter(id__in=cantidades_por_producto.keys()).in_bulk()

			for producto_id, cantidad_total in cantidades_por_producto.items():
				producto = productos.get(producto_id)
				if producto is None:
					return False, f'Producto {producto_id} no encontrado.'

			for producto_id, cantidad_total in cantidades_por_producto.items():
				producto = productos[producto_id]
				producto.stock += cantidad_total
				producto.save(update_fields=['stock'])

			return True, 'Stock reintegrado exitosamente.'

	# Método para procesar pedidos vencidos, buscando aquellos que han superado
 	# su fecha límite de cancelación y están en estado "recibido", y descontando su stock automáticamente
	@staticmethod
	def procesar_pedidos_vencidos():
		from pedidos.models import Pedido

		pedidos_vencidos = (
			Pedido.objects.select_related('estado')
			.prefetch_related('detalles__producto')
			.filter(
				fecha_limite_cancelacion__isnull=False,
				fecha_limite_cancelacion__lte=timezone.now(),
				estado__nombre__iexact='recibido',
			)
		)

		procesados = 0
		for pedido in pedidos_vencidos:
			exito, _ = InventarioService.descontar_stock_pedido(pedido.id)
			if exito:
				procesados += 1

		return procesados
