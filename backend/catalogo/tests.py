from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Marca, Presentacion, Producto


class CatalogoTokenAuthTests(APITestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="usuario_test",
			password="testpassword123",
			email="usuario@test.com",
		)
		self.token = Token.objects.create(user=self.user)

		self.marca = Marca.objects.create(nombre="Marca Test")
		self.presentacion = Presentacion.objects.create(nombre="Pote")
		self.producto = Producto.objects.create(
			nombre="Helado Vainilla",
			descripcion="Producto de prueba",
			marca=self.marca,
			presentacion=self.presentacion,
			precio="10.50",
			stock=5,
		)

		self.marcas_url = reverse("marca-list")
		self.stock_bajo_url = reverse("producto-stock-bajo")
		self.alerta_stock_bajo_url = reverse("producto-alerta-stock-bajo")

	def test_listar_marcas_es_publico(self):
		response = self.client.get(self.marcas_url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def test_stock_bajo_requiere_token(self):
		response = self.client.get(self.stock_bajo_url)
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_alerta_stock_bajo_requiere_token(self):
		response = self.client.get(self.alerta_stock_bajo_url)
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_stock_bajo_con_token_devuelve_resultados(self):
		self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
		response = self.client.get(self.stock_bajo_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("resultados", response.data)
		self.assertEqual(len(response.data["resultados"]), 1)
		self.assertEqual(response.data["resultados"][0]["nombre"], self.producto.nombre)

	def test_alerta_stock_bajo_con_token_devuelve_resumen(self):
		self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
		response = self.client.get(self.alerta_stock_bajo_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["hay_alertas"], True)
		self.assertEqual(response.data["total_productos_bajo_stock"], 1)
