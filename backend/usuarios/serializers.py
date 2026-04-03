from django.contrib.auth import password_validation
from rest_framework import serializers

from .models import Rol, Usuario


class UsuarioRespuestaSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "telefono",
            "direccion",
            "rol",
            "is_staff",
            "is_superuser",
        ]

    def get_rol(self, obj):
        if not obj.rol:
            return None
        return {
            "id": obj.rol.id,
            "nombre": obj.rol.nombre,
        }


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    rol = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Usuario
        fields = [
            "username",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "telefono",
            "direccion",
            "rol",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password2": "Las contrasenas no coinciden."}
            )

        password_validation.validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario
