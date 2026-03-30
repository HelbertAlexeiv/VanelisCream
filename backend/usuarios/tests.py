from rest_framework import status
from rest_framework.test import APITestCase

from .models import Usuario


class UsuariosAuthAPITestCase(APITestCase):
	def test_registro_usuario_exitoso(self):
		response = self.client.post(
			"/api/usuarios/registro/",
			{
				"username": "carla",
				"email": "carla@example.com",
				"password": "Segura1234!",
				"password2": "Segura1234!",
				"first_name": "Carla",
				"last_name": "Mora",
				"telefono": "3001234567",
				"direccion": "Calle 1",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(Usuario.objects.filter(username="carla").exists())

	def test_login_usuario_exitoso(self):
		Usuario.objects.create_user(
			username="jhon",
			email="jhon@example.com",
			password="Segura1234!",
		)

		response = self.client.post(
			"/api/usuarios/login/",
			{
				"username": "jhon",
				"password": "Segura1234!",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["usuario"]["username"], "jhon")

	def test_login_usuario_credenciales_invalidas(self):
		Usuario.objects.create_user(
			username="laura",
			email="laura@example.com",
			password="Segura1234!",
		)

		response = self.client.post(
			"/api/usuarios/login/",
			{
				"username": "laura",
				"password": "incorrecta",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
