from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase

from .models import Usuario


class UsuariosAuthAPITestCase(APITestCase):
	def test_registro_usuario_exitoso(self):
		response = self.client.post(
			"/api/auth/registro/",
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
			"/api/auth/login/",
			{
				"username": "jhon",
				"password": "Segura1234!",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("token", response.data)
		token = Token.objects.get(key=response.data["token"])
		self.assertEqual(token.user.username, "jhon")

	def test_login_usuario_credenciales_invalidas(self):
		Usuario.objects.create_user(
			username="laura",
			email="laura@example.com",
			password="Segura1234!",
		)

		response = self.client.post(
			"/api/auth/login/",
			{
				"username": "laura",
				"password": "incorrecta",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertNotIn("token", response.data)

	def test_login_usuario_no_requiere_csrf(self):
		Usuario.objects.create_user(
			username="ana",
			email="ana@example.com",
			password="Segura1234!",
		)

		csrf_client = APIClient(enforce_csrf_checks=True)
		response = csrf_client.post(
			"/api/auth/login/",
			{
				"username": "ana",
				"password": "Segura1234!",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("token", response.data)

	def test_me_usuario_autenticado(self):
		usuario = Usuario.objects.create_user(
			username="maria",
			email="maria@example.com",
			password="Segura1234!",
			first_name="Maria",
		)
		token = Token.objects.create(user=usuario)

		response = self.client.get(
			"/api/auth/me/",
			HTTP_AUTHORIZATION=f"Token {token.key}",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["username"], "maria")

	def test_me_usuario_sin_autenticacion(self):
		response = self.client.get("/api/auth/me/")
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
