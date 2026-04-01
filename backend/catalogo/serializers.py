from rest_framework import serializers
from .models import Marca, Presentacion, Producto

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = '__all__'

class PresentacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presentacion
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["marca"] = instance.marca.nombre if instance.marca_id else None
        data["presentacion"] = instance.presentacion.nombre if instance.presentacion_id else None
        return data

    class Meta:
        model = Producto
        fields = '__all__'
