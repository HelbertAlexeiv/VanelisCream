from django.db import models

# Create your models here.
class Marca(models.Model):

    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "marca"
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"

    def __str__(self):
        return self.nombre
    
class Presentacion(models.Model):

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "presentacion"
        verbose_name = "Presentación"
        verbose_name_plural = "Presentaciones"

    def __str__(self):
        return self.nombre

class Producto(models.Model):

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    marca = models.ForeignKey(Marca, on_delete=models.PROTECT, related_name="productos")
    presentacion = models.ForeignKey(Presentacion, on_delete=models.PROTECT, related_name="productos")
    precio = models.DecimalField(max_digits=10,decimal_places=2)
    imagen = models.URLField(max_length=500, blank=True, null=True)
    stock = models.PositiveIntegerField()

    class Meta:
        db_table = "producto"

    def __str__(self):
        return self.nombre