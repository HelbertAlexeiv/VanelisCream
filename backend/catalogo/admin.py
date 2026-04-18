from django.contrib import admin
from .models import Marca, Presentacion, Producto

#Registrar los modelos en el admin de Django
# Esto permitirá que podamos gestionar las marcas, presentaciones y productos desde el panel de administración de Django.
admin.site.register(Marca)
admin.site.register(Presentacion)
admin.site.register(Producto)