from django.urls import path
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny

from .views import RegistroUsuarioAPIView, UsuarioMeAPIView

app_name = "usuarios"

urlpatterns = [
    path("registro/", RegistroUsuarioAPIView.as_view(), name="registro"),
    path(
        "login/",
        ObtainAuthToken.as_view(authentication_classes=[], permission_classes=[AllowAny]),
        name="login",
    ),
    path("me/", UsuarioMeAPIView.as_view(), name="me"),
]
