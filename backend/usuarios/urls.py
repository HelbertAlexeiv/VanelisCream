from django.urls import path

from .views import LoginUsuarioAPIView, RegistroUsuarioAPIView

app_name = "usuarios"

urlpatterns = [
    path("registro/", RegistroUsuarioAPIView.as_view(), name="registro"),
    path("login/", LoginUsuarioAPIView.as_view(), name="login"),
]
