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
    # Se mantiene para compatibilidad con clientes actuales, pero se ignora al crear.
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
        # Validacion explicita para devolver un mensaje claro en la confirmacion.
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password2": "Las contrasenas no coinciden."}
            )

        # Aplica reglas de seguridad definidas en AUTH_PASSWORD_VALIDATORS.
        password_validation.validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        # Se ignora cualquier rol enviado por el cliente para forzar rol Cliente.
        validated_data.pop("rol", None)
        password = validated_data.pop("password")

        # Si no existe el rol cliente, se crea para mantener el registro operativo.
        rol_cliente = Rol.objects.filter(nombre__iexact="cliente").first()
        if rol_cliente is None:
            rol_cliente = Rol.objects.create(nombre="Cliente")

        usuario = Usuario(**validated_data, rol=rol_cliente)
        usuario.set_password(password)
        usuario.save()
        return usuario
