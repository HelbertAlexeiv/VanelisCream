from rest_framework import serializers
from .models import Pedido, DetallePedido

class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = [
            'producto',
            'cantidad',
            'precio_unitario',
            'subtotal'
        ]


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = '__all__'

class PedidoCreateSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField()
    direccion_entrega = serializers.CharField()
    total_pedido = serializers.DecimalField(max_digits=10, decimal_places=2)
    detalles = DetallePedidoSerializer(many=True)

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')

        pedido = Pedido.objects.create(
            cliente_id=validated_data['cliente_id'],
            estado_id=1,  # pendiente
            direccion_entrega=validated_data['direccion_entrega'],
            total_pedido=validated_data['total_pedido']
        )

        detalles = [
            DetallePedido(
                pedido=pedido,
                producto=item['producto'],
                cantidad=item['cantidad'],
                precio_unitario=item['precio_unitario'],
                subtotal=item['subtotal']
            )
            for item in detalles_data
        ]

        DetallePedido.objects.bulk_create(detalles)

        return pedido