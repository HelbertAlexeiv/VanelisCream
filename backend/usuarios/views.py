from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
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


class UsuarioMeAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		usuario_data = UsuarioRespuestaSerializer(request.user).data
		return Response(usuario_data, status=status.HTTP_200_OK)
