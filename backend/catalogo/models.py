from django.db import models


# Estos modelos representan las tablas de la base de datos que almacenarán la información 


#Creamos los modelos para la aplicación "catalogo"
class Marca(models.Model):

    nombre = models.CharField(max_length=100, unique=True)

    #Definimos la clase Meta para configurar el nombre de la tabla y los nombres en singular y plural para el modelo Marca
    class Meta:
        db_table = "marca"
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"
    #Definimos el método __str__ para que al mostrar un objeto Marca en el admin de Django, 
    # se muestre su nombre en lugar de su representación por defecto (que sería algo como "Marca object (1)")
    def __str__(self):
        return self.nombre
    

#Creamos el modelo para las presentaciones de los productos

class Presentacion(models.Model):

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "presentacion"
        verbose_name = "Presentación"
        verbose_name_plural = "Presentaciones"

    def __str__(self):
        return self.nombre

#Creamos el modelo para los productos, que tendrá una relación con las marcas y presentaciones
class Producto(models.Model):

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    marca = models.ForeignKey(Marca, on_delete=models.PROTECT, related_name="productos")
    presentacion = models.ForeignKey(Presentacion, on_delete=models.PROTECT, related_name="productos")
    precio = models.DecimalField(max_digits=10,decimal_places=2)
    imagen = models.URLField(max_length=1000, blank=True, null=True)
    stock = models.PositiveIntegerField()

    class Meta:
        db_table = "producto"

    def __str__(self):
        return self.nombre