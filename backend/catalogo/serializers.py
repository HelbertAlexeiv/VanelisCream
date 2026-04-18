from rest_framework import serializers
from .models import Marca, Presentacion, Producto

# Creamos los serializers para cada uno de los modelos, 
# esto nos permitirá convertir los objetos de los modelos a formatos como 
# JSON para poder enviarlos a través de la API.
class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = '__all__'

class PresentacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presentacion
        fields = '__all__'

# El serializer para el modelo Producto incluye una representación
# personalizada para mostrar los nombres de la marca y presentación en lugar de sus IDs.
class ProductoSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["marca"] = instance.marca.nombre if instance.marca_id else None
        data["presentacion"] = instance.presentacion.nombre if instance.presentacion_id else None
        return data

    class Meta:
        model = Producto
        fields = '__all__'
