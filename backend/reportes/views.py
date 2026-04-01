from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import ReportesService


class DashboardReporteAPIView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		if not request.user.is_staff:
			return Response(
				{'detalle': 'Solo un administrador puede consultar reportes estadisticos.'},
				status=status.HTTP_403_FORBIDDEN,
			)

		data = ReportesService.obtener_dashboard(
			periodo=request.query_params.get('periodo', 'dia'),
			anio=request.query_params.get('anio'),
			mes=request.query_params.get('mes'),
			umbral_stock=request.query_params.get('umbral_stock', 15),
			top_limit=request.query_params.get('top_limit', 5),
			alertas_limit=request.query_params.get('alertas_limit', 5),
		)
		return Response(data, status=status.HTTP_200_OK)
