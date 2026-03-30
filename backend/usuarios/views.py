from django.contrib.auth import login as auth_login
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
	LoginSerializer,
	RegistroUsuarioSerializer,
	UsuarioRespuestaSerializer,
)


class RegistroUsuarioAPIView(APIView):
	permission_classes = [permissions.AllowAny]
	authentication_classes = []

	def post(self, request):
		serializer = RegistroUsuarioSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		usuario = serializer.save()
		usuario_data = UsuarioRespuestaSerializer(usuario).data
		return Response(
			{
				"mensaje": "Usuario registrado correctamente",
				"usuario": usuario_data,
			},
			status=status.HTTP_201_CREATED,
		)


class LoginUsuarioAPIView(APIView):
	permission_classes = [permissions.AllowAny]
	authentication_classes = []

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		usuario = serializer.validated_data["user"]
		auth_login(request, usuario)
		usuario_data = UsuarioRespuestaSerializer(usuario).data
		return Response(
			{
				"mensaje": "Inicio de sesion exitoso",
				"usuario": usuario_data,
			},
			status=status.HTTP_200_OK,
		)
