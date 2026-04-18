from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MarcaViewSet, PresentacionViewSet, ProductoViewSet


# Configuramos las URLs para la aplicación "catalogo" 
# utilizando un router de Django REST Framework.

#Esto hacer tipo que las URLs para las vistas de Marca, Presentacion y Producto se generen automáticamente
# con las rutas adecuadas para las operaciones CRUD (Create, Read, Update, Delete) en cada uno de los modelos.
router = DefaultRouter()
router.register(r'marcas', MarcaViewSet)
router.register(r'presentaciones', PresentacionViewSet)
router.register(r'productos', ProductoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
