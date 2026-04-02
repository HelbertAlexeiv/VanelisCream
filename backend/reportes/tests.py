from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from catalogo.models import Marca, Presentacion, Producto
from pedidos.models import DetallePedido, EstadoPedido, Pedido


class DashboardReportesTests(APITestCase):
	def setUp(self):
		user_model = get_user_model()
		self.admin = user_model.objects.create_user(
			username='admin_reportes',
			password='Segura1234!',
			is_staff=True,
		)
		self.cliente = user_model.objects.create_user(
			username='cliente_reportes',
			password='Segura1234!',
		)

		self.admin_token = Token.objects.create(user=self.admin)
		self.cliente_token = Token.objects.create(user=self.cliente)

		self.estado_preparando = EstadoPedido.objects.create(nombre='preparando')
		self.estado_recibido = EstadoPedido.objects.create(nombre='recibido')

		marca = Marca.objects.create(nombre='Popsy')
		presentacion = Presentacion.objects.create(nombre='Pote')

		self.producto_a = Producto.objects.create(
			nombre='Helado Vainilla Brownie',
			descripcion='Producto A',
			marca=marca,
			presentacion=presentacion,
			precio='5000.00',
			stock=40,
			imagen='https://example.com/a.png',
		)
		self.producto_b = Producto.objects.create(
			nombre='Helado Choco 100ml',
			descripcion='Producto B',
			marca=marca,
			presentacion=presentacion,
			precio='5000.00',
			stock=10,
			imagen='https://example.com/b.png',
		)

		now = timezone.now()
		fecha_mes = now.replace(day=1, hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)
		fecha_anterior = now - timedelta(days=40)

		self._crear_pedido(
			fecha=now,
			estado=self.estado_preparando,
			total='10000.00',
			detalles=[(self.producto_a, 2, '10000.00')],
		)
		self._crear_pedido(
			fecha=fecha_mes,
			estado=self.estado_recibido,
			total='5000.00',
			detalles=[(self.producto_b, 1, '5000.00')],
		)
		self._crear_pedido(
			fecha=fecha_anterior,
			estado=self.estado_recibido,
			total='7000.00',
			detalles=[(self.producto_b, 1, '7000.00')],
		)

	def _crear_pedido(self, *, fecha, estado, total, detalles):
		pedido = Pedido.objects.create(
			cliente=self.cliente,
			estado=estado,
			direccion_entrega='Calle 10',
			total_pedido=total,
		)
		Pedido.objects.filter(id=pedido.id).update(fecha_creacion=fecha)
		pedido.refresh_from_db()

		for producto, cantidad, subtotal in detalles:
			DetallePedido.objects.create(
				pedido=pedido,
				producto=producto,
				cantidad=cantidad,
				precio_unitario=producto.precio,
				subtotal=subtotal,
			)

	def test_dashboard_admin_devuelve_estructura_y_metricas(self):
		now = timezone.localtime(timezone.now())
		response = self.client.get(
			f'/api/reportes/dashboard/?periodo=dia&anio={now.year}&mes={now.month}',
			HTTP_AUTHORIZATION=f'Token {self.admin_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('resumen', response.data)
		self.assertIn('distribucion_marcas', response.data)
		self.assertIn('ingresos', response.data)
		self.assertIn('top_sellers', response.data)
		self.assertIn('alertas', response.data)

		estados_resumen = {
			item['estado']: item['total']
			for item in response.data['resumen']['pedidos_por_estado']
		}
		self.assertEqual(estados_resumen.get('preparando'), 1)
		self.assertEqual(estados_resumen.get('recibido'), 1)
		self.assertAlmostEqual(response.data['resumen']['ventas_mes'], 15000.0)
		self.assertGreaterEqual(response.data['resumen']['pedidos_dia'], 1)
		self.assertEqual(response.data['top_sellers'][0]['producto'], self.producto_a.nombre)
		self.assertTrue(any(item['producto'] == self.producto_b.nombre for item in response.data['alertas']))

	def test_dashboard_parametros_invalidos_retorna_400(self):
		now = timezone.localtime(timezone.now())
		response = self.client.get(
			f'/api/reportes/dashboard/?periodo=xyz&anio={now.year}&mes=13',
			HTTP_AUTHORIZATION=f'Token {self.admin_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(
			response.data['detalle'],
			'Parametro periodo invalido. Use: dia, semana o mes.',
		)

	def test_dashboard_anio_invalido_retorna_400(self):
		response = self.client.get(
			'/api/reportes/dashboard/?periodo=dia&anio=-1&mes=4',
			HTTP_AUTHORIZATION=f'Token {self.admin_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(
			response.data['detalle'],
			'Parametro anio invalido. Debe estar entre 1 y 9999.',
		)

	def test_dashboard_no_admin_es_forbidden(self):
		response = self.client.get(
			'/api/reportes/dashboard/',
			HTTP_AUTHORIZATION=f'Token {self.cliente_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
