from calendar import monthrange
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Sum, Value
from django.db.models.functions import Coalesce, TruncDate, TruncMonth, TruncWeek
from django.utils import timezone

from catalogo.models import Producto
from pedidos.models import DetallePedido, Pedido


class ReportesService:
	@staticmethod
	def _parse_int(value, default):
		try:
			return int(value)
		except (TypeError, ValueError):
			return default

	@staticmethod
	def _to_aware_datetime(fecha):
		tz = timezone.get_current_timezone()
		return timezone.make_aware(datetime.combine(fecha, time.min), tz)

	@staticmethod
	def _month_bounds(year_value, month_value):
		start_date = date(year_value, month_value, 1)
		last_day = monthrange(year_value, month_value)[1]
		end_date = start_date + timedelta(days=last_day)
		return ReportesService._to_aware_datetime(start_date), ReportesService._to_aware_datetime(end_date)

	@staticmethod
	def _year_bounds(year_value):
		start_date = date(year_value, 1, 1)
		end_date = date(year_value + 1, 1, 1)
		return ReportesService._to_aware_datetime(start_date), ReportesService._to_aware_datetime(end_date)

	@staticmethod
	def _detalle_valor_expression():
		cero_decimal = Value(Decimal('0.00'), output_field=DecimalField(max_digits=12, decimal_places=2))
		cantidad = Coalesce(F('cantidad'), Value(0))
		precio = Coalesce(F('precio_unitario'), cero_decimal)
		valor_calculado = ExpressionWrapper(precio * cantidad, output_field=DecimalField(max_digits=12, decimal_places=2))
		return Coalesce(F('subtotal'), valor_calculado, cero_decimal, output_field=DecimalField(max_digits=12, decimal_places=2))

	@staticmethod
	def _decimal_to_float(value):
		if value is None:
			return 0.0
		return float(value)

	@staticmethod
	def _build_ingresos_series(*, detalles_qs, periodo, year_value):
		valor_detalle = ReportesService._detalle_valor_expression()

		if periodo == 'semana':
			agrupado = (
				detalles_qs
				.annotate(bucket=TruncWeek('pedido__fecha_creacion'))
				.values('bucket')
				.annotate(ingresos=Coalesce(Sum(valor_detalle), Decimal('0.00')))
				.order_by('bucket')
			)
			etiquetas = [item['bucket'].strftime('%d/%m') for item in agrupado]
		elif periodo == 'mes':
			start_year, end_year = ReportesService._year_bounds(year_value)
			agrupado = (
				DetallePedido.objects
				.filter(
					pedido__fecha_creacion__gte=start_year,
					pedido__fecha_creacion__lt=end_year,
				)
				.annotate(bucket=TruncMonth('pedido__fecha_creacion'))
				.values('bucket')
				.annotate(ingresos=Coalesce(Sum(valor_detalle), Decimal('0.00')))
				.order_by('bucket')
			)
			etiquetas = [item['bucket'].strftime('%b') for item in agrupado]
		else:
			agrupado = (
				detalles_qs
				.annotate(bucket=TruncDate('pedido__fecha_creacion'))
				.values('bucket')
				.annotate(ingresos=Coalesce(Sum(valor_detalle), Decimal('0.00')))
				.order_by('bucket')
			)
			etiquetas = [str(item['bucket'].day) for item in agrupado]

		valores = [ReportesService._decimal_to_float(item['ingresos']) for item in agrupado]
		return {
			'periodo': periodo,
			'etiquetas': etiquetas,
			'valores': valores,
		}

	@staticmethod
	def obtener_dashboard(*, periodo='dia', anio=None, mes=None, umbral_stock=15, top_limit=5, alertas_limit=5):
		now = timezone.localtime(timezone.now())
		current_year = now.year
		current_month = now.month

		year_value = ReportesService._parse_int(anio, current_year)
		month_value = ReportesService._parse_int(mes, current_month)
		periodo = (periodo or 'dia').lower()
		if periodo not in {'dia', 'semana', 'mes'}:
			periodo = 'dia'

		start_month, end_month = ReportesService._month_bounds(year_value, month_value)
		start_today = ReportesService._to_aware_datetime(now.date())
		end_today = start_today + timedelta(days=1)

		pedidos_mes = Pedido.objects.filter(fecha_creacion__gte=start_month, fecha_creacion__lt=end_month)
		detalles_mes = DetallePedido.objects.filter(
			pedido__fecha_creacion__gte=start_month,
			pedido__fecha_creacion__lt=end_month,
		)
		pedidos_hoy = Pedido.objects.filter(fecha_creacion__gte=start_today, fecha_creacion__lt=end_today)

		ventas_mes = pedidos_mes.aggregate(total=Coalesce(Sum('total_pedido'), Decimal('0.00')))['total']
		pedidos_dia = pedidos_hoy.count()
		pedidos_por_estado_qs = (
			pedidos_mes
			.values('estado__nombre')
			.annotate(total=Count('id'))
			.order_by('estado__nombre')
		)
		pedidos_por_estado = [
			{
				'estado': item['estado__nombre'] or 'sin estado',
				'total': item['total'],
			}
			for item in pedidos_por_estado_qs
		]

		valor_detalle = ReportesService._detalle_valor_expression()
		marcas_qs = (
			detalles_mes
			.values('producto__marca__nombre')
			.annotate(ingresos=Coalesce(Sum(valor_detalle), Decimal('0.00')))
			.order_by('-ingresos', 'producto__marca__nombre')
		)
		total_marcas = sum((item['ingresos'] or Decimal('0.00')) for item in marcas_qs)
		distribucion_marcas = []
		for item in marcas_qs:
			ingresos = item['ingresos'] or Decimal('0.00')
			porcentaje = float((ingresos / total_marcas) * 100) if total_marcas > 0 else 0.0
			distribucion_marcas.append(
				{
					'marca': item['producto__marca__nombre'] or 'Sin marca',
					'ingresos': ReportesService._decimal_to_float(ingresos),
					'porcentaje': round(porcentaje, 2),
				}
			)

		ingresos_serie = ReportesService._build_ingresos_series(
			detalles_qs=detalles_mes,
			periodo=periodo,
			year_value=year_value,
		)

		top_limit = max(1, ReportesService._parse_int(top_limit, 5))
		top_sellers_qs = (
			detalles_mes
			.values('producto_id', 'producto__nombre', 'producto__marca__nombre', 'producto__imagen')
			.annotate(
				cantidad_vendida=Coalesce(Sum('cantidad'), 0),
				ingresos=Coalesce(Sum(valor_detalle), Decimal('0.00')),
			)
			.order_by('-cantidad_vendida', '-ingresos', 'producto__nombre')[:top_limit]
		)
		top_sellers = [
			{
				'producto_id': item['producto_id'],
				'producto': item['producto__nombre'],
				'marca': item['producto__marca__nombre'],
				'cantidad_vendida': item['cantidad_vendida'],
				'ingresos': ReportesService._decimal_to_float(item['ingresos']),
				'imagen': item['producto__imagen'],
			}
			for item in top_sellers_qs
		]

		umbral_stock = max(0, ReportesService._parse_int(umbral_stock, 15))
		alertas_limit = max(1, ReportesService._parse_int(alertas_limit, 5))
		alertas_qs = (
			Producto.objects
			.select_related('marca')
			.filter(stock__lte=umbral_stock)
			.order_by('stock', 'nombre')[:alertas_limit]
		)
		alertas = [
			{
				'producto_id': producto.id,
				'producto': producto.nombre,
				'marca': producto.marca.nombre if producto.marca_id else None,
				'stock': producto.stock,
				'imagen': producto.imagen,
			}
			for producto in alertas_qs
		]

		return {
			'resumen': {
				'ventas_mes': ReportesService._decimal_to_float(ventas_mes),
				'pedidos_dia': pedidos_dia,
				'pedidos_por_estado': pedidos_por_estado,
				'anio': year_value,
				'mes': month_value,
			},
			'distribucion_marcas': distribucion_marcas,
			'ingresos': ingresos_serie,
			'top_sellers': top_sellers,
			'alertas': alertas,
		}