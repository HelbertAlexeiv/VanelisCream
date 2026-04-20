from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase

from .models import Rol, Usuario


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
		usuario = Usuario.objects.get(username="carla")
		self.assertIsNotNone(usuario.rol)
		self.assertEqual(usuario.rol.nombre.lower(), "cliente")
		self.assertEqual(response.data["usuario"]["rol"]["nombre"].lower(), "cliente")

	def test_registro_ignora_rol_enviado_y_asigna_cliente(self):
		rol_admin = Rol.objects.create(nombre="Admin")

		response = self.client.post(
			"/api/auth/registro/",
			{
				"username": "sara",
				"email": "sara@example.com",
				"password": "Segura1234!",
				"password2": "Segura1234!",
				"first_name": "Sara",
				"last_name": "Lopez",
				"telefono": "3009876543",
				"direccion": "Calle 2",
				"rol": rol_admin.id,
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		usuario = Usuario.objects.get(username="sara")
		self.assertIsNotNone(usuario.rol)
		self.assertEqual(usuario.rol.nombre.lower(), "cliente")
		self.assertNotEqual(usuario.rol.id, rol_admin.id)

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
		rol_cliente = Rol.objects.create(nombre="Cliente")
		usuario = Usuario.objects.create_user(
			username="maria",
			email="maria@example.com",
			password="Segura1234!",
			first_name="Maria",
			rol=rol_cliente,
		)
		token = Token.objects.create(user=usuario)

		response = self.client.get(
			"/api/auth/me/",
			HTTP_AUTHORIZATION=f"Token {token.key}",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["username"], "maria")
		self.assertEqual(response.data["rol"]["nombre"].lower(), "cliente")

	def test_me_usuario_sin_autenticacion(self):
		response = self.client.get("/api/auth/me/")
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
