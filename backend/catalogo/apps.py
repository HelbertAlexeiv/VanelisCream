from django.apps import AppConfig

#Redefinir la configuración de la aplicación "catalogo"
# Esto es necesario para que Django reconozca la aplicación y pueda cargarla correctamente.
class CatalogoConfig(AppConfig):
    name = 'catalogo'
