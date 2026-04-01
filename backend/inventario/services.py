from collections import defaultdict

from django.db import transaction
from django.utils import timezone

from catalogo.models import Producto


class InventarioService:
	@staticmethod
	def procesar_pedidos_vencidos():
		from pedidos.models import Pedido

		pedidos_vencidos = (
			Pedido.objects.select_related('estado')
			.prefetch_related('detalles__producto')
			.filter(fecha_limite_cancelacion__isnull=False, fecha_limite_cancelacion__lte=timezone.now(), stock_descontado=False)
			.exclude(estado__nombre__iexact='cancelado')
		)

		procesados = 0
		for pedido in pedidos_vencidos:
			exito, _ = InventarioService.descontar_stock_pedido_vencido(pedido.id)
			if exito:
				procesados += 1

		return procesados

	@staticmethod
	def descontar_stock_pedido_vencido(pedido_id):
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

			if pedido.estado.nombre.lower() == 'cancelado':
				return False, 'El pedido fue cancelado.'

			if pedido.stock_descontado:
				return False, 'El pedido ya fue procesado.'

			if pedido.fecha_limite_cancelacion is None:
				return False, 'El pedido no tiene fecha limite de cancelacion definida.'

			if timezone.now() < pedido.fecha_limite_cancelacion:
				return False, 'Aún no ha vencido el tiempo permitido de cancelación.'

			cantidades_por_producto = defaultdict(int)
			for detalle in pedido.detalles.all():
				if detalle.producto_id is None:
					return False, 'El detalle del pedido no tiene producto asociado.'
				cantidades_por_producto[detalle.producto_id] += detalle.cantidad or 0

			productos = Producto.objects.select_for_update().filter(id__in=cantidades_por_producto.keys()).in_bulk()

			for producto_id, cantidad_total in cantidades_por_producto.items():
				producto = productos.get(producto_id)
				if producto is None:
					return False, f'Producto {producto_id} no encontrado.'

				if producto.stock < cantidad_total:
					return False, f'Stock insuficiente para el producto {producto.nombre}.'

			for producto_id, cantidad_total in cantidades_por_producto.items():
				producto = productos[producto_id]
				producto.stock -= cantidad_total
				producto.save(update_fields=['stock'])

			pedido.stock_descontado = True
			pedido.save(update_fields=['stock_descontado'])

			return True, 'Stock descontado exitosamente.'
