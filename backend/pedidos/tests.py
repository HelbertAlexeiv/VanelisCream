from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import AuditoriaPedido, EstadoPedido, Pedido


class PedidoAuditoriaTests(APITestCase):
	def setUp(self):
		user_model = get_user_model()
		self.admin = user_model.objects.create_user(
			username='admin_test',
			password='Segura1234!',
			is_staff=True,
		)
		self.cliente = user_model.objects.create_user(
			username='cliente_test',
			password='Segura1234!',
		)

		self.admin_token = Token.objects.create(user=self.admin)
		self.cliente_token = Token.objects.create(user=self.cliente)

		self.estado_recibido = EstadoPedido.objects.create(nombre='recibido')
		self.estado_en_camino = EstadoPedido.objects.create(nombre='en camino')

		self.pedido = Pedido.objects.create(
			cliente=self.cliente,
			estado=self.estado_recibido,
			direccion_entrega='Calle 123',
			total_pedido='15000.00',
		)

	def test_admin_cambia_estado_y_se_registra_auditoria(self):
		response = self.client.patch(
			f'/api/pedidos/{self.pedido.id}/estado/',
			{'estado': self.estado_en_camino.id},
			format='json',
			HTTP_AUTHORIZATION=f'Token {self.admin_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.pedido.refresh_from_db()
		self.assertEqual(self.pedido.estado_id, self.estado_en_camino.id)
		self.assertEqual(self.pedido.empleado_id, self.admin.id)

		auditoria = AuditoriaPedido.objects.get(pedido=self.pedido)
		self.assertEqual(auditoria.usuario, self.admin.username)
		self.assertEqual(auditoria.accion, 'ACTUALIZAR')
		self.assertEqual(auditoria.campo_modificado, 'estado')
		self.assertEqual(auditoria.valor_anterior, self.estado_recibido.nombre)
		self.assertEqual(auditoria.valor_nuevo, self.estado_en_camino.nombre)

	def test_cliente_no_puede_cambiar_estado(self):
		response = self.client.patch(
			f'/api/pedidos/{self.pedido.id}/estado/',
			{'estado': self.estado_en_camino.id},
			format='json',
			HTTP_AUTHORIZATION=f'Token {self.cliente_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
		self.assertFalse(AuditoriaPedido.objects.filter(pedido=self.pedido).exists())

	def test_admin_puede_ver_auditoria(self):
		AuditoriaPedido.objects.create(
			pedido=self.pedido,
			usuario=self.admin.username,
			accion='ACTUALIZAR',
			campo_modificado='estado',
			valor_anterior='recibido',
			valor_nuevo='en camino',
		)

		response = self.client.get(
			'/api/pedidos/auditoria/',
			HTTP_AUTHORIZATION=f'Token {self.admin_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('results', response.data)
		self.assertEqual(response.data['count'], 1)
		self.assertEqual(response.data['results'][0]['pedido_id'], self.pedido.id)

	def test_admin_puede_ordenar_auditoria_por_usuario(self):
		# Se crean usuarios en orden inverso para comprobar que ordering=usuario se respeta.
		AuditoriaPedido.objects.create(
			pedido=self.pedido,
			usuario='zeta_user',
			accion='ACTUALIZAR',
			campo_modificado='estado',
			valor_anterior='recibido',
			valor_nuevo='en camino',
		)
		AuditoriaPedido.objects.create(
			pedido=self.pedido,
			usuario='alfa_user',
			accion='ACTUALIZAR',
			campo_modificado='estado',
			valor_anterior='en camino',
			valor_nuevo='cancelado',
		)

		response = self.client.get(
			'/api/pedidos/auditoria/?ordering=usuario',
			HTTP_AUTHORIZATION=f'Token {self.admin_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['results'][0]['usuario'], 'alfa_user')
		self.assertEqual(response.data['results'][1]['usuario'], 'zeta_user')

	def test_cliente_no_puede_ver_auditoria(self):
		response = self.client.get(
			'/api/pedidos/auditoria/',
			HTTP_AUTHORIZATION=f'Token {self.cliente_token.key}',
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
