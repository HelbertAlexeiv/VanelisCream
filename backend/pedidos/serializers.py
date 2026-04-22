from rest_framework import serializers
from datetime import timedelta
from django.db import transaction

from .models import AuditoriaPedido, Pedido, DetallePedido, EstadoPedido
from usuarios.serializers import UsuarioRespuestaSerializer

#Este serializador se encarga de darme la información del estado del pedido
class EstadoPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoPedido
        fields = '__all__'

# Este serializador se encarga de darme la información del detalle de los pedidos
class DetallePedidoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    producto_marca = serializers.ReadOnlyField(source='producto.marca.nombre')
    producto_imagen = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DetallePedido
        fields = [
            'producto',
            'producto_nombre',
            'producto_imagen',
            'producto_marca',
            'cantidad',
            'precio_unitario',
            'subtotal'
        ]

    def get_producto_imagen(self, obj):
        if obj.producto and hasattr(obj.producto, 'imagen') and obj.producto.imagen:
            imagen = obj.producto.imagen
            # Si es un campo de archivo (ImageField), usamos la URL
            if hasattr(imagen, 'url'):
                try:
                    request = self.context.get('request')
                    if request is not None:
                        return request.build_absolute_uri(imagen.url)
                    return imagen.url
                except ValueError:
                    return None
            # Si es simplemente un string (URL directa)
            if isinstance(imagen, str):
                return imagen
        return None


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)
    estado = EstadoPedidoSerializer(read_only=True)
    cliente = UsuarioRespuestaSerializer(read_only=True)
    empleado = UsuarioRespuestaSerializer(read_only=True)
    class Meta:
        model = Pedido
        fields = '__all__'

class PedidoCreateSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField(read_only=True)
    direccion_entrega = serializers.CharField()
    total_pedido = serializers.DecimalField(max_digits=10, decimal_places=2)
    detalles = DetallePedidoSerializer(many=True)
    fecha_creacion = serializers.DateTimeField(read_only=True)
    fecha_limite_cancelacion = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        from inventario.services import InventarioService

        detalles_data = validated_data.pop('detalles')
        user = self.context['request'].user

        with transaction.atomic():
            pedido = Pedido.objects.create(
                cliente_id=user.id,
                estado_id=1,  # recibido
                direccion_entrega=validated_data['direccion_entrega'],
                total_pedido=validated_data['total_pedido']
            )

            pedido.fecha_limite_cancelacion = pedido.fecha_creacion + timedelta(minutes=5)
            pedido.save(update_fields=['fecha_limite_cancelacion'])

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

            exito, mensaje = InventarioService.descontar_stock_pedido(pedido.id, usuario=user.username)
            if not exito:
                raise serializers.ValidationError({'detalle': mensaje})

            return pedido


class PedidoEstadoUpdateSerializer(serializers.Serializer):
    estado = serializers.PrimaryKeyRelatedField(queryset=EstadoPedido.objects.all())


class AuditoriaPedidoSerializer(serializers.ModelSerializer):
    pedido_id = serializers.IntegerField(source='pedido.id', read_only=True)

    class Meta:
        model = AuditoriaPedido
        fields = [
            'id',
            'pedido_id',
            'usuario',
            'accion',
            'campo_modificado',
            'valor_anterior',
            'valor_nuevo',
            'fecha_evento',
        ]