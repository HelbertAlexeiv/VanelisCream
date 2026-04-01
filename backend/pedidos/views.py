from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Pedido
from .serializers import PedidoCreateSerializer, PedidoSerializer

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return PedidoCreateSerializer
        return PedidoSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Pedido.objects.all()
        return Pedido.objects.filter(cliente=user)