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

		periodo = request.query_params.get('periodo', 'dia')
		if periodo not in {'dia', 'semana', 'mes'}:
			return Response(
				{'detalle': 'Parametro periodo invalido. Use: dia, semana o mes.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		mes = request.query_params.get('mes')
		if mes not in (None, ''):
			try:
				mes_int = int(mes)
			except (TypeError, ValueError):
				return Response(
					{'detalle': 'Parametro mes invalido. Debe ser un numero entre 1 y 12.'},
					status=status.HTTP_400_BAD_REQUEST,
				)

			if mes_int < 1 or mes_int > 12:
				return Response(
					{'detalle': 'Parametro mes invalido. Debe estar entre 1 y 12.'},
					status=status.HTTP_400_BAD_REQUEST,
				)

		anio = request.query_params.get('anio')
		if anio not in (None, ''):
			try:
				anio_int = int(anio)
			except (TypeError, ValueError):
				return Response(
					{'detalle': 'Parametro anio invalido. Debe ser un numero entero entre 1 y 9999.'},
					status=status.HTTP_400_BAD_REQUEST,
				)

			if anio_int < 1 or anio_int > 9999:
				return Response(
					{'detalle': 'Parametro anio invalido. Debe estar entre 1 y 9999.'},
					status=status.HTTP_400_BAD_REQUEST,
				)

		data = ReportesService.obtener_dashboard(
			periodo=periodo,
			anio=anio,
			mes=mes,
			umbral_stock=request.query_params.get('umbral_stock', 15),
			top_limit=request.query_params.get('top_limit', 5),
			alertas_limit=request.query_params.get('alertas_limit', 5),
		)
		return Response(data, status=status.HTTP_200_OK)
