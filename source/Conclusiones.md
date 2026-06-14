VIII. CONCLUSIONES

A Conclusiones

La presente tesis evaluó tres arquitecturas de redes neuronales convolucionales como

apoyo a la inspección visual preliminar de corrosión en conexiones estructurales de acero:

una CNN propia entrenada desde cero, MobileNetV2 y EfficientNet-B0. El estudio se

desarrolló sobre un banco documental auditado de 2 667 imágenes, distribuido en 2 133

imágenes para entrenamiento, 267 para validación y 267 para prueba. La evaluación principal

se realizó sobre el conjunto oficial de prueba, compuesto por 107 imágenes con corrosión y

160 sin corrosión visible, utilizando un umbral operativo fijo de 0.5.

Los resultados permiten concluir que la visión por computadora puede aportar

información útil como herramienta auxiliar de cribado visual, pero no como sustituto del

criterio profesional. La evidencia obtenida corresponde a particiones no vistas dentro del

mismo dominio documental; por tanto, no debe interpretarse como validación operacional

en campo ni como prueba de generalización a otras estructuras, ambientes o condiciones de

captura.

La comparación entre arquitecturas mostró que no existe un modelo universalmente

superior. La CNN propia obtuvo la mayor exactitud observada (92.88 %), el mayor F1

(0.9082), la mayor especificidad (0.9625) y el menor costo computacional, con 0.651 ms

por imagen, 1 536.29 FPS, 1 749 185 parámetros y 6.67 MB. Sin embargo, registró 13 falsos

negativos sobre 107 imágenes positivas, lo que limita su conveniencia cuando el objetivo

139

principal es reducir omisiones de corrosión.

MobileNetV2 y EfficientNet-B0 alcanzaron el mayor recall observado (0.9813),

con solo dos falsos negativos cada uno. No obstante, MobileNetV2 produjo 61 falsos

positivos y una especificidad de 0.6188, lo que implica una carga elevada de revisión manual.

EfficientNet-B0, en cambio, mantuvo los mismos dos falsos negativos, redujo los falsos

positivos a 33, obtuvo una especificidad de 0.7937 y presentó la mayor AUC-ROC (0.9850).

Por ello, dentro de las condiciones evaluadas, EfficientNet-B0 ofrece el equilibrio más

defendible cuando se prioriza minimizar falsos negativos sin aumentar excesivamente las

falsas alarmas.

La prueba Q de Cochran identificó diferencias globales significativas entre las propor-

ciones de acierto de las tres arquitecturas (Q = 36,292,683, p = 1,316 × 10−8). Las compa-

raciones post-hoc mostraron diferencias significativas entre la CNN propia y MobileNetV2,

así como entre MobileNetV2 y EfficientNet-B0. En cambio, la diferencia entre la CNN

propia y EfficientNet-B0 no alcanzó significancia después de la corrección de Bonferroni.

Esto refuerza que la selección del modelo debe depender del criterio técnico priorizado y no

solo de la exactitud global.

El uso de GradCAM++ aportó evidencia cualitativa para inspeccionar las regiones

de activación asociadas a las predicciones. Esta herramienta permitió complementar las

métricas cuantitativas con una revisión visual del comportamiento de los modelos, pero no

constituye una explicación causal completa ni una validación espacial del daño. Su valor

principal fue ofrecer trazabilidad interpretativa auxiliar para examinar si las activaciones

eran visualmente coherentes con zonas de deterioro superficial.

La contribución principal de esta tesis no consiste en declarar un modelo defini-

tivo, sino en consolidar un protocolo comparativo reproducible para evaluar modelos de

clasificación visual de corrosión. Dicho protocolo integra auditoría del conjunto de datos,

partición controlada, preprocesamiento homogéneo, comparación de arquitecturas, análisis

de matrices de confusión, contraste estadístico, benchmark de inferencia e interpretabilidad

visual. En problemas asociados a seguridad estructural, esta lectura multicriterio es más

140

defendible que una evaluación basada exclusivamente en exactitud.

Finalmente, el alcance del estudio queda limitado por el tamaño del conjunto de

prueba, la ausencia de validación externa, la falta de una campaña multisemilla, la ausencia

de análisis de ablación y la formulación binaria de la tarea. Los modelos evaluados permiten

distinguir presencia o ausencia de corrosión visible, pero no estiman severidad, extensión,

profundidad del daño ni prioridad de intervención. Por ello, sus resultados deben entenderse

como apoyo preliminar a la inspección, no como diagnóstico estructural automatizado.

B Recomendaciones

Para una aplicación práctica preliminar, se recomienda considerar EfficientNet-B0

cuando el criterio prioritario sea maximizar la sensibilidad y reducir falsos negativos, siem-

pre que se acepte su mayor costo computacional relativo frente a la CNN propia. Esta

recomendación es condicional al conjunto documental, al umbral de decisión y al entorno de

evaluación utilizados en esta tesis.

La IA debe utilizarse únicamente como herramienta de alerta temprana o priorización

de revisión. Toda predicción automática debe ser verificada por un especialista, especialmente

cuando pueda tener implicaciones de seguridad estructural. La decisión final sobre el estado

de una conexión, la severidad del daño y la necesidad de intervención debe permanecer bajo

responsabilidad profesional.

Se recomienda validar los modelos con imágenes externas capturadas en condiciones

reales de inspección, incorporando variaciones de iluminación, distancia, ángulo, resolución,

humedad, sombras, suciedad, oclusiones y distintos estados de recubrimiento. Esta validación

externa es necesaria antes de sostener cualquier afirmación sobre generalización o uso

operativo.

También se recomienda ampliar la tarea más allá de la clasificación binaria. Para una

aplicación de mayor utilidad en ingeniería, futuros trabajos deberían evaluar detección con

141

bounding boxes, segmentación semántica o segmentación de instancias, de modo que sea

posible localizar la corrosión y estimar su extensión visible.

Finalmente, investigaciones posteriores deberían incorporar validación experta, ca-

libración de umbrales, análisis de costos asimétricos, campañas multisemilla, validación

cruzada y pruebas de robustez ante perturbaciones visuales. Estas extensiones permitirían

pasar de una comparación experimental controlada a una evaluación más cercana a las

exigencias reales de la inspección estructural asistida por inteligencia artificial.

142

