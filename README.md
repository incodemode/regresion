# regresion
El programa está distribuido en tres capas principales:

- El Algoritmo Genético (public/assets/js/geneticAlgorithm.js): Se encarga de hacer los ciclos necesarios sin que se trabe el explorador y hacer los callbacks cuando se inicia una nueva generación o un gen.
- La implementación matemática (public/assets/js/regresion.js): Se encarga de utilizar la librería math.js para implementar las siguientes funciones:
	* randomize(limit =10): Es una función recursiva que genera un gen totalmente aleatorio, esta es la base para el resto del algoritmo genético, el parámetro limit se refiere a la profundidad máxima, cuando llega a esta solo puede elegir entre variables y números o constantes. Por ejemplo para crear una suma se hace:

		var op1 = randomize(limit -1);
		var op2 = randomize(limit -1);
		genes = op1+operator+op2;

	* fitnessFunction(gene): Recibe el parámetro del gen en modo de texto y luego por medio de la librería matemática evalúa para todos los posibles puntos (X0,X1,..,Xn) que ha proveído el usuario para sacar la sumatoria del cuadrado de las diferencias, el resultado es el fitness del gen.
	* validation(code): Por medio de la librería matemática hace lo siguiente:
		- Verifica que todos los puntos del gen puedan ser evaluados y den como resultado números reales
		- Simplifica la ecuación para evitar resultados repetidos.
		- Que el fitness del gen también sea un número real.
		Por último retorna el gen simplificado.
	* equals(gene1, gene2): Verifica si dos funciones son iguales.
	* crossover(gene1, gene2): cruza de manera aleatoria los dos árboles de las ecuaciones en un solo punto y tiene un 10% de probabilidad de crear una mutación en cualquiera de los dos extremos del nuevo gen.
	* execute(): inicializa las variables para el algoritmo genético con sus funciones y lo ejecuta.
- La parte visual y de control (public/index.html): Se encarga de la interfaz gráfica por medio de bootstrap, jQuery, graph.js y otros, también implementa los dos callbacks del algoritmo genético e inicializa el código de regresion.js.

* Código: https://github.com/incodemode/regresion
* Url del proyecto: http://regresion.incodemode.com

