from django.contrib import admin

from backend.usuarios.models import Rol, Usuario

# Register your models here.
admin.site.register(Rol)
admin.site.register(Usuario)