from django.db import models
from django.contrib.auth.models import AbstractUser

class Rol(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "rol"
        verbose_name = "Rol"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.nombre
    
class Usuario(AbstractUser):

    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, related_name="usuarios", null=True, blank=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "usuario"

    def __str__(self):
        return self.username

