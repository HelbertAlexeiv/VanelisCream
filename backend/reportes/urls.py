from django.urls import path

from .views import DashboardReporteAPIView


urlpatterns = [
    path('dashboard/', DashboardReporteAPIView.as_view(), name='reportes-dashboard'),
]
