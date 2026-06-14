UNIVERSIDAD DEL VALLE DE GUATEMALA

FACULTAD DE INGENIERÍA

Redes neuronales convolucionales aplicadas al análisis de
imágenes de conexiones en estructuras de acero para la
detección de corrosión

Trabajo de graduación en modalidad de Tesis presentado por
Nathaniel Douglas Ernesto Sanchez Vasquez para optar al grado académico
de Licenciado en Ingeniería Civil Arquitectonica

Guatemala,

2026

UNIVERSIDAD DEL VALLE DE GUATEMALA

FACULTAD DE INGENIERÍA

Redes neuronales convolucionales aplicadas al análisis de
imágenes de conexiones en estructuras de acero para la
detección de corrosión

Trabajo de graduación en modalidad de Tesis presentado por
Nathaniel Douglas Ernesto Sanchez Vasquez para optar al grado académico
de Licenciado en Ingeniería Civil Arquitectonica

Guatemala,

2026

Vo.Bo.:

(f)

Nombre de tu Asesor

Tribunal Examinador:

Nombre de tu Asesor

Nombre del Primer Examinador

(f)

(f)

(f)

Nombre del Segundo Examinador

Fecha de aprobación: Guatemala, 19 de enero de 2026.

PREFACIO

El presente trabajo representa el final de una etapa de mucho esfuerzo, dedicación y aprendi-

zaje, un camino que no recorrí en solitario.

A mis papás, mi primer y más grande agradecimiento. Gracias por ser los pilares que

sostienen mis sueños y por brindarme su apoyo inquebrantable durante todo este proceso

universitario. Todo lo que soy y lo que he logrado es el reflejo de su amor y sacrificio.

A Luisa, mi novia y mi compañera de vida. Gracias por estar a mi lado en los

momentos de estrés y en los de celebración, por no soltarme la mano durante todo este

proceso y por creer en mí incluso cuando yo mismo dudaba. Gracias por hacer este viaje

mucho más hermoso.

A mi asesor, MSc. Juan Adolfo Orozco Coloma, le agradezco profundamente el

tiempo y la dedicación que invirtió en este proyecto. Sus ideas y su expertise fueron clave para

ampliar mi visión profesional y me permitieron descubrir una nueva rama de la ingeniería

civil en la que hoy encuentro mi verdadera vocación. Gracias por ser una guía de excelencia.

III

RESUMEN

La detección oportuna de corrosión en conexiones estructurales de acero es relevante

para el mantenimiento y la seguridad de la infraestructura; sin embargo, la inspección visual

convencional depende de criterios humanos y presenta dificultades para estandarizar la

evaluación cuando la evidencia fotográfica es heterogénea. En este contexto, la tesis comparó

arquitecturas de redes neuronales convolucionales para la clasificación binaria de imágenes

con y sin corrosión, con el propósito de identificar la alternativa con mejor equilibrio entre

capacidad de detección, eficiencia computacional e interpretabilidad visual de apoyo. El

estudio se desarrolló con un enfoque cuantitativo y comparativo sobre un split oficial auditado

de 2,667 imágenes, distribuidas en entrenamiento, validación y prueba sin solapamientos

entre particiones. Se evaluó una CNN propia con variantes de profundidad, MobileNetV2 y

EfficientNet-B0 mediante transferencia de aprendizaje, bajo un protocolo homogéneo de

preprocesamiento, aumento de datos, configuraciones de batch size y evaluación sobre el

conjunto oficial de prueba. Los resultados mostraron que la CNN propia alcanzó la mayor

exactitud, especificidad y F1, además de la menor latencia en GPU; EfficientNet-B0 obtuvo

la mayor AUC-ROC y empató con MobileNetV2 en el menor número de falsos negativos,

con menos falsas alarmas que este último. En consecuencia, la investigación aporta una

base metodológica reproducible para seleccionar arquitecturas según el costo relativo de

omisiones, falsas alarmas y latencia, y confirma que la relación entre precisión operativa y

costo computacional es decisiva en sistemas de apoyo a la inspección visual de corrosión.

IV

ABSTRACT

Timely detection of corrosion in steel structural connections is relevant to infrastruc-

ture safety and maintenance; however, conventional visual inspection depends on human

judgment and is difficult to standardize when photographic evidence is heterogeneous. In

this context, the thesis compared convolutional neural network architectures for binary

image classification of corrosion versus no corrosion in order to identify the alternative

with the best balance among detection capability, computational efficiency, and supporting

visual interpretability. The study followed a quantitative and comparative design on an

officially audited split of 2,667 images, distributed into training, validation, and testing

subsets without overlap across partitions. A custom CNN with depth variants, MobileNetV2,

and EfficientNet-B0 through transfer learning were evaluated under a homogeneous protocol

of preprocessing, data augmentation, batch size configurations, and testing on the official

test set. Results showed that the custom CNN achieved the highest accuracy, specificity, and

F1, as well as the lowest GPU latency; EfficientNet-B0 achieved the highest ROC-AUC

and tied MobileNetV2 for the lowest number of false negatives, with fewer false alarms

than MobileNetV2. Consequently, the study provides a reproducible methodological basis

for selecting architectures according to the relative cost of missed corrosion cases, false

alarms, and latency, and confirms that the relationship between operational accuracy and

computational cost is decisive in corrosion-inspection support systems.

V

ÍNDICE GENERAL

Prefacio

Resumen

LISTA DE FIGURAS

LISTA DE CUADROS

I.

INTRODUCCIÓN

II. OBJETIVOS

A. Objetivos

.

.

.

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

1.

2.

Objetivo General

. . . . . . . . . . . . . . . . . . . . . . . . . . .

Objetivos Específicos . . . . . . . . . . . . . . . . . . . . . . . . .

III.JUSTIFICACIÓN

IV. MARCO TEORICO

A.

Fundamentos del acero en estructuras metalicas . . . . . . . . . . . . . . .

1.

2.

Composición Química . . . . . . . . . . . . . . . . . . . . . . . .

Propiedades Físicas y Mecánicas del Acero . . . . . . . . . . . . .

a.

Propiedades Físicas . . . . . . . . . . . . . . . . . . . .

1).

2).

Densidad . . . . . . . . . . . . . . . . . . . .

Coeficiente de expansión térmica . . . . . . . .

VI

III

IV

XIV

XVII

1

4

4

4

4

6

8

8

8

10

10

10

10

b.

3).

1).

2).

3).

4).

5).

Punto de fusión . . . . . . . . . . . . . . . . .

Propiedades Mecánicas . . . . . . . . . . . . . . . . . .

Resistencia a la Tracción . . . . . . . . . . . .

Límite de Fluencia

. . . . . . . . . . . . . . .

Ductilidad:

. . . . . . . . . . . . . . . . . . .

Dureza:

. . . . . . . . . . . . . . . . . . . . .

Resistencia a la Corrosión:

. . . . . . . . . . .

3.

Fabricacion del acero . . . . . . . . . . . . . . . . . . . . . . . . .

a.

b.

c.

d.

Procesos Primarios

. . . . . . . . . . . . . . . . . . .

.

1).

2).

Proceso del Alto Horno . . . . . . . . . . . . .

Proceso del Horno de Arco Eléctrico (EAF)

. .

Producción Secundaria

. . . . . . . . . . . . . . . . . .

Proceso de Colada . . . . . . . . . . . . . . . . . . . . .

Procesos de Laminación . . . . . . . . . . . . . . . . . .

4.

Tipos de Acero estructural

. . . . . . . . . . . . . . . . . . . . . .

a.

b.

c.

d.

e.

f.

g.

h.

Aceros al Carbono . . . . . . . . . . . . . . . . . . . .

.

Acero de bajo carbono (acero dulce)

. . . . . . . . . . .

Acero de medio carbono . . . . . . . . . . . . . . . . . .

Acero de alto carbono (acero para herramientas) . . . . .

Aceros Aleados: . . . . . . . . . . . . . . . . . . . . .

Aceros Inoxidables:

. . . . . . . . . . . . . . . . . . .

.

.

Acero Resistente a la Intemperie:

. . . . . . . . . . . . .

Acero de Calibre Ligero:

. . . . . . . . . . . . . . . . .

B.

La ciencia de la corrosión . . . . . . . . . . . . . . . . . . . . . . . . . . .

1.

2.

3.

4.

5.

6.

Concepto y alcance de la corrosión . . . . . . . . . . . . . . . . .

Fundamentos fisicoquímicos y electroquímicos . . . . . . . . . .

.

Mecanismos y tipos de corrosión . . . . . . . . . . . . . . . . . . .

Factores determinantes: material, medio y condiciones de operación

Comportamiento frente a la corrosión de materiales de ingeniería

Métodos de estudio, evaluación y monitoreo . . . . . . . . . . . .

.

.

VII

11

11

11

11

12

13

13

14

14

15

17

19

21

23

25

25

25

25

26

26

26

27

27

27

27

28

29

32

33

35

7.

Prevención, control, impacto e innovación . . . . . . . . . . . . . .

C.

Conexiones de acero en estructuras metálicas

. . . . . . . . . . . . . . . .

1.

Tipos de conexiones y descripción técnica . . . . . . . . . . . . . .

a.

Conexiones soldadas

. . . . . . . . . . . . . . . . . . .

1).

2).

1).

2).

b.

c.

Procesos de soldadura más utilizados en cons-

trucción metálica.

. . . . . . . . . . . . . . . .

Tipos geométrico-funcionales de soldadura.

.

Conexiones pernadas o atornilladas . . . . . . . . . . .

Clasificación por tipo de perno . . . . . . . .

.

.

.

Clasificación por mecanismo resistente de la junta. 45

Remaches estructurales . . . . . . . . . . . . . . . . .

.

2.

Normas y códigos aplicables . . . . . . . . . . . . . . . . . . . . .

a.

Marco normativo estadounidense . . . . . . . . . . . .

.

1).

2).

3).

4).

AISC 360-22.

. . . . . . . . . . . . . . . . . .

RCSC 2020. . . . . . . . . . . . . . . . . . . .

ASTM F3125/F3125M-22.

. . . . . . . . . .

.

AWS D1.1/D1.1M:2025.

. . . . . . . . . . . .

b.

Normas hispanas nacionales . . . . . . . . . . . . . . .

.

3.

Aplicaciones principales y criterios de selección . . . . . . . . . .

a.

b.

Aplicaciones típicas . . . . . . . . . . . . . . . . . . .

Criterios de selección entre soldadura y pernos . . . . .

.

.

4.

Inspección y ensayos no destructivos

. . . . . . . . . . . . . . . .

a.

b.

Inspección de soldaduras

. . . . . . . . . . . . . . . .

Inspección de conexiones atornilladas

. . . . . . . . .

.

.

5.

Defectos típicos y estrategias de mitigación . . . . . . . . . . . . .

a.

b.

Defectos en soldaduras

. . . . . . . . . . . . . . . . .

Defectos en conexiones atornilladas . . . . . . . . . . .

D. Monitoreo estructural . . . . . . . . . . . . . . . . . . . . . . . . . . . .

.

.

.

1.

Tipos de monitoreo . . . . . . . . . . . . . . . . . . . . . . . . . .

a.

Monitoreo estático . . . . . . . . . . . . . . . . . . . .

.

VIII

37

40

41

41

41

43

44

44

45

46

46

46

46

47

47

47

48

48

49

50

50

50

51

51

51

54

54

54

b.

Monitoreo dinámico . . . . . . . . . . . . . . . . . . . .

2.

Técnicas de monitoreo . . . . . . . . . . . . . . . . . . . . . . . .

a.

b.

c.

d.

e.

Galgas extensométricas (strain gauges) . . . . . . . . . .

Acelerómetros . . . . . . . . . . . . . . . . . . . . . . .

Inclinómetros

. . . . . . . . . . . . . . . . . . . . . . .

Sensores de corrosión . . . . . . . . . . . . . . . . . . .

Criterios de selección del sensor

. . . . . . . . . . . . .

3.

Análisis de vibraciones . . . . . . . . . . . . . . . . . . . . . . . .

a.

b.

c.

d.

Análisis modal . . . . . . . . . . . . . . . . . . . . . . .

Análisis espectral

. . . . . . . . . . . . . . . . . . . . .

Análisis en dominio del tiempo . . . . . . . . . . . . . .

Análisis combinado . . . . . . . . . . . . . . . . . . . .

4.

Inspección visual . . . . . . . . . . . . . . . . . . . . . . . . . . .

a.

b.

c.

Inspección directa . . . . . . . . . . . . . . . . . . . . .

Inspección asistida con herramientas . . . . . . . . . . .

Limitaciones . . . . . . . . . . . . . . . . . . . . . . . .

E. Visión artificial y procesamiento digital de imágenes

. . . . . . . . . . . .

1.

2.

Conceptos básicos de visión artificial

. . . . . . . . . . . . . . . .

Procesamiento de imágenes

. . . . . . . . . . . . . . . . . . . . .

a.

b.

c.

d.

Adquisición . . . . . . . . . . . . . . . . . . . . . . . .

Representación de imágenes . . . . . . . . . . . . . . . .

Preprocesamiento . . . . . . . . . . . . . . . . . . . . .

Segmentación . . . . . . . . . . . . . . . . . . . . . . .

1).

2).

3).

Umbralización.

. . . . . . . . . . . . . . . . .

Detección de bordes.

. . . . . . . . . . . . . .

Segmentación basada en color y textura.

. . . .

e.

Extracción de características

. . . . . . . . . . . . . . .

F.

Deep learning y redes neuronales convolucionales . . . . . . . . . . . . . .

1.

2.

Introducción al aprendizaje profundo y arquitecturas neuronales . .

Taxonomía matemática del aprendizaje estadístico . . . . . . . . .

55

56

56

56

57

57

58

58

59

59

60

60

61

61

61

61

63

63

63

63

64

64

65

65

66

66

67

68

68

69

IX

3.

4.

Optimización de redes profundas: retropropagación y dinámica del

gradiente . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

Funciones de activación: motores de no linealidad . . . . . . . . .

G. Redes neuronales convolucionales . . . . . . . . . . . . . . . . . . . . . .

1.

2.

3.

Principios y biología computacional . . . . . . . . . . . . . . . . .

Evolución histórica de arquitecturas convolucionales canónicas

. .

Anatomía funcional y componentes estructurales avanzados

. . . .

a.

b.

c.

d.

Convolución y variantes trascendentales

. . . . . . . . .

Mecanismos de submuestreo y Global Average Pooling .

Normalización por lotes . . . . . . . . . . . . . . . . . .

Dropout y regularización estocástica . . . . . . . . . . .

4.

Aplicaciones extensivas en visión por computadora . . . . . . . . .

H. Métricas de evaluación para modelos de clasificación . . . . . . . . . . . .

1.

2.

3.

4.

5.

6.

7.

Paradigmas, errores comunes y limitaciones . . . . . . . . . . . . .

Matriz de confusión y fragilidad de la exactitud . . . . . . . . . . .

Métricas derivadas de la matriz de confusión . . . . . . . . . . . .

Exactitud balanceada, MCC y Kappa

. . . . . . . . . . . . . . . .

Análisis por umbrales: ROC, AUC y Precision–Recall

. . . . . . .

Puntuación probabilística y calibración predictiva . . . . . . . . . .

Recomendaciones prácticas para reportar métricas

. . . . . . . . .

I.

Conclusión .

.

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

V. METODOLOGÍA

A.

B.

Supuestos de investigación y variables . . . . . . . . . . . . . . . . . . . .

Tipo y diseño de investigación . . . . . . . . . . . . . . . . . . . . . . . .

1.

2.

3.

Enfoque de investigación . . . . . . . . . . . . . . . . . . . . . . .

Alcance de investigación . . . . . . . . . . . . . . . . . . . . . . .

Diseño de investigación . . . . . . . . . . . . . . . . . . . . . . .

C.

Población y muestra documental

. . . . . . . . . . . . . . . . . . . . . . .

1.

Descripción de la población documental . . . . . . . . . . . . . . .

70

70

72

72

72

74

74

75

75

75

76

77

77

77

78

79

80

81

82

83

84

84

85

85

86

86

87

87

X

87

88

88

90

91

91

92

92

94

94

95

95

95

96

96

97

99

2.

3.

4.

5.

Tipo de muestreo y justificación . . . . . . . . . . . . . . . . . . .

Tamaño de la muestra y justificación . . . . . . . . . . . . . . . . .

Criterios de inclusión, exclusión y eliminación . . . . . . . . . . .

Conformación y auditoría del split oficial

. . . . . . . . . . . . . .

D. Variables y operacionalización . . . . . . . . . . . . . . . . . . . . . . . .

1.

2.

3.

4.

5.

6.

7.

Variable independiente principal: arquitectura de red neuronal

. . .

Variables de proceso: preprocesamiento y aumento de datos

. . . .

Variables dependientes: desempeño de clasificación . . . . . . . . .

Contraste estadístico pareado entre arquitecturas

. . . . . . . . . .

Variables dependientes: eficiencia computacional

. . . . . . . . . .

Variables controladas . . . . . . . . . . . . . . . . . . . . . . . . .

Tabla de operacionalización . . . . . . . . . . . . . . . . . . . . .

E.

Técnicas e instrumentos de recolección y procesamiento de datos . . . . . .

1.

2.

3.

4.

5.

6.

Framework de desarrollo . . . . . . . . . . . . . . . . . . . . . . .

Entorno computacional . . . . . . . . . . . . . . . . . . . . . . . .

Pipeline de carga y preprocesamiento . . . . . . . . . . . . . . . .

Pipeline de aumento de datos . . . . . . . . . . . . . . . . . . . . .

Estrategia de balanceo de clases . . . . . . . . . . . . . . . . . . . 102

Definición de arquitecturas . . . . . . . . . . . . . . . . . . . . . . 103

F.

Procedimiento de recolección de datos . . . . . . . . . . . . . . . . . . . . 106

1.

2.

3.

4.

5.

Fase 1: Identificación y selección de fuentes . . . . . . . . . . . . . 106

Fase 2: Revisión manual y filtrado . . . . . . . . . . . . . . . . . . 106

Fase 3: Deduplicación y normalización . . . . . . . . . . . . . . . 106

Fase 4: Construcción del split oficial . . . . . . . . . . . . . . . . . 107

Fase 5: Auditoría de integridad . . . . . . . . . . . . . . . . . . . . 107

G.

Procedimiento de análisis de datos . . . . . . . . . . . . . . . . . . . . . . 108

1.

2.

3.

4.

Entrenamiento de modelos . . . . . . . . . . . . . . . . . . . . . . 108

Evaluación cuantitativa sobre el split de prueba . . . . . . . . . . . 112

Benchmark de inferencia . . . . . . . . . . . . . . . . . . . . . . . 114

Interpretabilidad visual . . . . . . . . . . . . . . . . . . . . . . . . 114

XI

5.

Software utilizado . . . . . . . . . . . . . . . . . . . . . . . . . . 115

H. Criterios de rigor científico . . . . . . . . . . . . . . . . . . . . . . . . . . 116

1.

2.

3.

4.

Validez interna . . . . . . . . . . . . . . . . . . . . . . . . . . . . 116

Validez externa . . . . . . . . . . . . . . . . . . . . . . . . . . . . 116

Confiabilidad (reproducibilidad) . . . . . . . . . . . . . . . . . . . 117

Objetividad . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 118

I.

J.

Consideraciones éticas

. . . . . . . . . . . . . . . . . . . . . . . . . . . . 118

Obstáculos metodológicos y soluciones

. . . . . . . . . . . . . . . . . . . 119

VI. RESULTADOS

121

A. Contexto del conjunto de evaluación . . . . . . . . . . . . . . . . . . . . . 121

B. Desempeño predictivo global: comparación de arquitecturas

. . . . . . . . 122

1.

Contraste estadístico pareado . . . . . . . . . . . . . . . . . . . . . 124

C. Análisis de errores: matriz de confusión . . . . . . . . . . . . . . . . . . . 125

D.

E.

F.

G.

Interpretabilidad visual: GradCAM++ . . . . . . . . . . . . . . . . . . . . 127

Eficiencia computacional

. . . . . . . . . . . . . . . . . . . . . . . . . . . 127

Síntesis del ajuste paramétrico . . . . . . . . . . . . . . . . . . . . . . . . 130

Estado de la evaluación externa . . . . . . . . . . . . . . . . . . . . . . . . 131

VII.DISCUSIÓN DE RESULTADOS

132

A.

Interpretación del desempeño por arquitectura . . . . . . . . . . . . . . . . 133

1.

2.

3.

CNN propia (V1): solución compacta con mayor exactitud y especi-

ficidad .

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 133

MobileNetV2: sensibilidad alta con penalización apreciable en es-

pecificidad . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 133

EfficientNet-B0: mayor capacidad discriminativa y menor omisión

entre modelos transferidos . . . . . . . . . . . . . . . . . . . . . . 134

B.

C.

D.

E.

Perfil de error e implicaciones para la inspección estructural

. . . . . . . . 136

Interpretabilidad visual y alcance de la evidencia GradCAM++ . . . . . . . 136

Limitaciones del estudio y validez de la inferencia . . . . . . . . . . . . . . 137

Implicaciones metodológicas y prácticas . . . . . . . . . . . . . . . . . . . 138

XII

VIII.CONCLUSIONES

139

A. Conclusiones

.

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 139

B.

Recomendaciones . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 141

IX. ANEXOS

143

Glosario básico para la lectura de metodología y resultados . . . . . . . . . . . . 143

A. Conformación, trazabilidad y auditoría del dataset oficial

. . . . . . . . .

. 147

B.

Protocolo experimental reproducible . . . . . . . . . . . . . . . . . . . . . 149

1.

2.

3.

4.

Preprocesamiento y aumento de datos . . . . . . . . . . . . . . . . 151

Configuración principal de entrenamiento . . . . . . . . . . . . .

. 152

Implementación del control de parada temprana . . . . . . . . . .

. 153

Comandos principales de reproducción . . . . . . . . . . . . . . . 155

C. Arquitecturas evaluadas y checkpoints comparativos

. . . . . . . . . . .

. 156

D. Resultados cuantitativos ampliados del split oficial actual . . . . . . . . .

. 156

E.

Reportes tabulares y gráficos del análisis paramétrico histórico . . . . . .

. 158

1.

2.

3.

4.

5.

6.

Sección A: CNN propia (V1/V2) por tamaño de lote . . . . . . . . 158

Sección B: Efecto del tamaño de lote a profundidad fija (CNN Propia)161

Sección C: Comparación de Transfer Learning . . . . . . . . . .

. 161

Sección D, E y F: Selección Top 6, Interpretabilidad y Eficiencia

Computacional

. . . . . . . . . . . . . . . . . . . . . . . . . . . . 163

Trazabilidad de figuras GradCAM++ . . . . . . . . . . . . . . . . 163

Síntesis Consolidada . . . . . . . . . . . . . . . . . . . . . . . . . 164

F.

Benchmark de inferencia y trade-offs operativos . . . . . . . . . . . . . . . 164

G. Criterios de selección del modelo para tesis y validación de artefactos

. . . 165

BIBLIOGRAFÍA

167

XIII

LISTA DE FIGURAS

1.

Diagrama esfuerzo-deformación convencional y verdadero para acero: Fases

de comportamiento mecánico (Hibbeler, 2019).

. . . . . . . . . . . . . . .

12

2.

Un moderno alto horno es capaz de producir 8000 toneladas de hierro

fundido por día. Imagen adaptada de (Spence & Kuttermann, 2022)

. . . .

15

3.

Alto horno. La mena de hierro, la piedra caliza y el coque se introducen

en la parte superior del horno. El hierro se obtiene de la mena mediante la

reducción con carbono. Imagen adaptada de (Chang & Goldsby, 2013) . . .

4.

Un horno de arco eléctrico. Imagen adaptada de (Nutting et al., 2025)

. . .

5. Metodos de desulfuracion del acero. Imagen adaptada de (Subtech, 2023)

.

6.

Proceso de agitación en el refinamiento del acero. Imagen adaptada de

(Carburos Metálicos, s.f.) . . . . . . . . . . . . . . . . . . . . . . . . . . .

7.

8.

9.

Proceso de colada continua. Imagen adaptada de (Barta, s.f.). . . . . . . . .

Proceso de laminado en frio. Imagen adaptada (Planes, 2023) . . . . . . . .

Detalle en elevación de conexión soldada y pernada (Boracchini, 2018).

. .

10.

(a, b) Arreglo esquemático del proceso de soldadura por arco manual de

17

18

20

21

22

24

40

metal (SMAW) (Ghosh, 2015).

. . . . . . . . . . . . . . . . . . . . . . . .

42

11.

(a, b) Disposición esquemática del proceso de soldadura por gas activo de

metal (MAG). (Ghosh, 2015).

. . . . . . . . . . . . . . . . . . . . . . . .

12. Clasificación de juntas de soldadura según su posición. (Rodríguez, 2001). .

13. Tipos comunes de defectos de soldadura (Aleleyton, 2024). . . . . . . . . .

42

44

52

XIV

14. Posicionamiento de instrumentación para monitoreo estructural en fachada

de iglesia patrimonial en Venecia: sensores estáticos y acelerométricos (Dal

Cin & Russo, 2019).

. . . . . . . . . . . . . . . . . . . . . . . . . . . . .

55

15. Hardware de control activo: aceleradores electromagnéticos instalados si-

métricamente en la tubería conveying para la investigación experimental de

amortiguamiento de vibraciones. (Hussein & Al-Waily, 2020).

. . . . . . .

57

16. Composición de la macrocorriente en un sistema de monitoreo que utiliza

sensores de corrosión para el refuerzo de acero en concreto (Xinrong &

Moujie, 2021).

.

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

58

17. Procesamiento para umbralización a imágenes de video con fondo dinámico

y estático. De izquierda a derecha: imagen original, conversión a grises,

segmentación, umbralización binaria, histograma de umbralización binaria,

umbralización por método de Otsu, histograma de umbralización por método

de Otsu. (Niño-Rondón et al., 2021).

. . . . . . . . . . . . . . . . . . . . .

18. Ejemplo de detección de bordes mediante Canny (Nikan, 2020).

. . . . . .

19.

Ilustración de cómo se calculan las características de textura de Haralick.

65

66

En una imagen de 4 × 4, se representan tres niveles de gris mediante valores

numéricos del 1 al 3. (Löfstedt et al., 2019).

. . . . . . . . . . . . . . . . .

66

20. Resumen de la arquitectura CNN propia para clasificación binaria de corrosión.104

21. Relación entre el presupuesto máximo de épocas y el entrenamiento efectivo

de los checkpoints comparativos. El margen no utilizado corresponde a

épocas que no fue necesario consumir debido al control por early stopping

sobre la pérdida de validación.

. . . . . . . . . . . . . . . . . . . . . . . . 110

22. Curvas ROC comparativas de las tres arquitecturas sobre el conjunto oficial

de prueba.

.

.

. .

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 123

23. Matrices de confusión de las tres arquitecturas sobre el conjunto oficial de

prueba. TN: verdaderos negativos; FP: falsos positivos; FN: falsos negativos;

TP: verdaderos positivos.

. . . . . . . . . . . . . . . . . . . . . . . . . .

. 126

XV

24. GradCAM++ de MobileNetV2 sobre la imagen común con corrosión, cla-

sificada correctamente como corrosión (TP). Izquierda: imagen original.

Centro: mapa de calor. Derecha: superposición.

. . . . . . . . . . . . . . . 128

25. GradCAM++ de MobileNetV2 sobre la imagen de prueba sin corrosión

Pruebareal3.jpg, clasificada correctamente como no corrosión (TN).

. . 128

26. GradCAM++ de EfficientNet-B0 sobre la misma imagen con corrosión,

clasificada correctamente como corrosión (TP).

. . . . . . . . . . . . . . . 128

27. GradCAM++ de EfficientNet-B0 sobre la imagen de prueba sin corrosión

Pruebareal3.jpg, clasificada correctamente como no corrosión (TN).

. . 129

28. GradCAM++ de la CNN propia sobre la misma imagen con corrosión,

clasificada erróneamente como no corrosión (FN). . . . . . . . . . . . . . . 129

29. GradCAM++ de la CNN propia sobre la imagen de prueba sin corrosión

Pruebareal3.jpg, clasificada correctamente como no corrosión (TN).

. . 129

30. Curvas de entrenamiento para la CNN propia (Batch Size = 32).

. . . . . . 159

31. Curvas de entrenamiento para la CNN propia (Batch Size = 64).

. . . . . . 159

32. Curvas de entrenamiento para la CNN propia (Batch Size = 128). . . . . . . 160

XVI

LISTA DE CUADROS

1.

Coeficiente de expansión térmica de diferentes aceros. Tabla adaptada de

(Hibbeler, 2019) .

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

10

2.

Resumen de tipos de conexión, normativa aplicable, aplicaciones e inspec-

ción recomendada .

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

Funciones de activación rectificadas y variantes modernas.

. . . . . . . . .

Comparación de métricas puntuales de clasificación.

. . . . . . . . . . . .

Distribución del split oficial auditado por partición y clase.

. . . . . . . . .

Operacionalización de las variables del estudio.

. . . . . . . . . . . . . . .

53

71

80

90

96

Arquitecturas comparadas y checkpoints representativos.

. . . . . . . . . . 105

Configuración principal de entrenamiento por familia arquitectónica. . . . . 109

Software principal utilizado en el análisis de datos.

. . . . . . . . . . . . . 115

3.

4.

5.

6.

7.

8.

9.

10. Métricas principales de clasificación de las tres arquitecturas sobre el con-

junto oficial de prueba (267 imágenes). Las métricas extendidas se presentan

en el Cuadro 26 del Anexo. . . . . . . . . . . . . . . . . . . . . . . . . . . 122

11. Métricas principales con intervalos de confianza al 95 %. Accuracy, recall

y specificity usan intervalos de Wilson; F1 y AUC-ROC usan bootstrap

percentil con 5 000 remuestreos.

. . . . . . . . . . . . . . . . . . . . . . . 123

12. Prueba Q de Cochran para comparar globalmente las proporciones de acierto

de las tres arquitecturas sobre el mismo conjunto de prueba. . . . . . . . . . 124

XVII

13. Comparaciones post-hoc por pares mediante McNemar con corrección de

Bonferroni.

.

.

.

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 124

14. Desglose de la matriz de confusión por modelo sobre el conjunto oficial de

prueba (107 imágenes con corrosión y 160 sin corrosión). . . . . . . . . . . 125

15. Configuración de la capa objetivo para GradCAM++ por modelo. . . . . . . 127

16. Eficiencia computacional de las tres arquitecturas medida sobre GPU con

CUDA.

.

.

.

.

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 130

17. Glosario básico: conceptos básicos.

. . . . . . . . . . . . . . . . . . . . . 143

18. Glosario básico: términos de entrenamiento.

. . . . . . . . . . . . . . . . . 144

19. Glosario básico: términos de evaluación. . . . . . . . . . . . . . . . . . . . 145

20. Glosario básico: eficiencia e interpretabilidad.

. . . . . . . . . . . . . . . . 146

21. Distribución del dataset oficial auditado por partición y clase. . . . . . . . . 147

22. Resumen de reconstrucción y deduplicación de las fuentes del dataset.

. . . 148

23. Módulos auxiliares del proyecto utilizados para la trazabilidad del flujo

experimental.

.

.

.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 149

24. Configuración principal de entrenamiento por familia de arquitectura.

. . . 152

25. Familias de arquitecturas evaluadas y checkpoints representativos de la

comparación vigente.

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . 156

26. Métricas extendidas de clasificación sobre el conjunto de prueba oficial (267

imágenes). Mejores checkpoints por familia. . . . . . . . . . . . . . . . . . 157

27. Clasificación de errores por arquitectura a partir de la matriz de confusión

(mejores checkpoints).

. . . . . . . . . . . . . . . . . . . . . . . . . . . . 157

28. Métricas extendidas para CNN propia con tamaño de lote 32. . . . . . . . . 158

29. Métricas extendidas para CNN propia con tamaño de lote 64. . . . . . . . . 159

30. Métricas extendidas para CNN propia con tamaño de lote 128.

. . . . . . . 160

31. Análisis de profundidad fija: 3 Bloques Convolucionales.

. . . . . . . . . . 160

32. Análisis de profundidad fija: 5 Bloques Convolucionales.

. . . . . . . . . . 160

33. Análisis de profundidad fija: 7 Bloques Convolucionales.

. . . . . . . . . . 161

34. Métricas de arquitecturas preentrenadas: Batch Size 32. . . . . . . . . . . . 161

XVIII

35. Métricas de arquitecturas preentrenadas: Batch Size 64. . . . . . . . . . . . 161

36. Métricas de arquitecturas preentrenadas: Batch Size 128.

. . . . . . . . . . 162

37. Selección automática de los 6 mejores modelos (Top 6). . . . . . . . . . . . 162

38. Estado analítico de interpretabilidad visual (XAI) sobre el Top 6. . . . . . . 162

39. Trazabilidad de las figuras GradCAM++ incluidas en resultados.

. . . . . . 163

40. Eficiencia computacional e inferencia evaluada en los mejores modelos.

. . 164

41. Manifiesto de síntesis de todas las métricas evaluadas. . . . . . . . . . . .

. 164

42. Benchmark de inferencia vigente sobre GPU con CUDA.

. . . . . . . . . . 164

43. Shortlist metodológica actual y estado de cierre de sus artefactos. . . . . .

. 165

44.

Indicadores de readiness del proceso actual de selección para tesis. . . . . . 166

XIX

I.

INTRODUCCIÓN

La corrosión en elementos estructurales de acero constituye un problema de ingeniería

con efectos directos sobre la seguridad, la durabilidad y los costos de mantenimiento de la

infraestructura. En las conexiones estructurales, donde convergen placas, pernos y soldaduras,

la identificación oportuna del deterioro visible resulta especialmente relevante porque una

degradación no atendida puede escalar desde una afectación superficial hasta una condición

que comprometa la confiabilidad del sistema. Sin embargo, la valoración inicial de estas

condiciones sigue dependiendo en gran medida de inspecciones visuales manuales, cuya

consistencia puede verse afectada por la experiencia del inspector, la accesibilidad del

elemento y la heterogeneidad de la evidencia fotográfica disponible.

Esta dependencia de procedimientos manuales vuelve necesario explorar herramien-

tas que apoyen la inspección sin sustituir el juicio técnico. En un problema de detección de

corrosión, además, no todos los errores tienen el mismo peso operativo. Omitir una conexión

corroída implica aceptar un riesgo potencialmente más costoso que generar una alarma falsa

que luego sea verificada en campo. Por lo tanto, cualquier aproximación automatizada para

este dominio debe juzgarse no solo por su exactitud global, sino también por su capacidad

para reducir falsos negativos y por la viabilidad computacional de su uso dentro de escenarios

realistas de procesamiento.

En paralelo, la visión por computadora y el aprendizaje profundo han ampliado de

forma significativa la posibilidad de extraer patrones útiles a partir de imágenes complejas,

mientras que el transfer learning ha permitido adaptar modelos preentrenados a problemas

1

específicos con conjuntos de datos más acotados que los bancos masivos de propósito

general (Goodfellow et al., 2016; Pan & Yang, 2010; Yosinski et al., 2014). En el campo de

la detección de corrosión, trabajos recientes han reportado resultados promisorios mediante

arquitecturas convolucionales y esquemas de aprendizaje transferido (Das et al., 2024; Ocran

et al., 2025; Savino et al., 2025; Zhao et al., 2024). No obstante, esos antecedentes no

resuelven de manera directa el problema abordado en esta tesis, porque difieren en el tipo

de superficie analizada, en el dominio visual de las imágenes, en el tamaño y composición

de los conjuntos de datos y en los criterios utilizados para comparar el rendimiento de los

modelos.

En consecuencia, para un estudio centrado específicamente en imágenes fotográficas

de conexiones estructurales de acero, no bastaba con asumir que una arquitectura exitosa

en otro contexto conservaría ese comportamiento bajo condiciones distintas. El proyecto

requería una comparación controlada sobre un conjunto de datos documental existente,

heterogéneo y auditado, con clases canónicas de corrosión y no corrosión, sin fuga de

información entre entrenamiento, validación y prueba, y con un protocolo homogéneo de

preprocesamiento, aumento de datos, entrenamiento y evaluación. Solo bajo esas condiciones

podía responderse con rigor una pregunta que emerge naturalmente del problema: qué

arquitectura de red neuronal convolucional ofrece el mejor equilibrio entre capacidad de

detección de corrosión y costo computacional cuando se trabaja con este banco de imágenes

y con restricciones realistas de procesamiento.

Esa necesidad de comparación también definió el alcance del estudio. La investi-

gación no se orientó a segmentar el daño, estimar severidad, resolver una clasificación

multiclase ni validar el sistema sobre un conjunto externo de imágenes de campo. Su aporte

se concentró en construir una base metodológica reproducible para la detección binaria de

corrosión visible en conexiones estructurales de acero, a partir de tres familias concretas de

modelos: una CNN propia desarrollada para el proyecto, MobileNetV2 y EfficientNet-B0

mediante transfer learning. De este modo, la justificación del trabajo no radicó en proponer

una solución cerrada de despliegue, sino en determinar, dentro del protocolo experimen-

tal efectivamente implementado, qué alternativa ofrecía la comparación más sólida para

2

sustentar fases posteriores de validación externa y ampliación del problema.

Bajo este marco, la presente tesis se propuso evaluar comparativamente el desempeño

de dichas arquitecturas para la detección binaria de corrosión en imágenes fotográficas

de conexiones estructurales de acero provenientes de un conjunto de datos existente y

auditado, considerando métricas de clasificación, criterios de eficiencia computacional e

interpretabilidad visual de apoyo. A partir de esta formulación, los capítulos siguientes

desarrollan los objetivos, la metodología y la comparación de resultados que permiten

identificar la arquitectura con mejor equilibrio dentro del alcance real del proyecto.

3

II. OBJETIVOS

A Objetivos

1. Objetivo General

Evaluar comparativamente el desempeño de arquitecturas de redes neuronales con-

volucionales para la detección binaria de corrosión en conexiones estructurales de acero, a

partir del análisis de imágenes fotográficas obtenidas de un conjunto de datos existente.

2. Objetivos Específicos

Caracterizar el conjunto de datos de imágenes de conexiones estructurales de acero,

identificando la distribución de clases y la organización del banco utilizado para

entrenamiento, validación y prueba.

Establecer un pipeline de preprocesamiento y aumento de datos orientado a resaltar

indicadores visuales de corrosión y fortalecer el entrenamiento de los modelos de

clasificación binaria.

Comparar arquitecturas de redes neuronales convolucionales para identificar la alter-

nativa más adecuada para la detección binaria de corrosión en imágenes de conexiones

estructurales de acero.

4

Evaluar el desempeño predictivo y computacional de las arquitecturas seleccionadas

mediante métricas de clasificación y de inferencia sobre el conjunto oficial de prueba.

5

III. JUSTIFICACIÓN

El sector de la construcción se caracteriza por una adopción tecnológica notable-

mente lenta, lo que contrasta con el avance acelerado de la inteligencia artificial y el deep

learning. Esta brecha representa una oportunidad invaluable para integrar herramientas

computacionales avanzadas en los procesos de evaluación y mantenimiento estructural.

Un problema recurrente en la ingeniería civil es la ausencia de evaluaciones periódi-

cas sobre el estado de los recubrimientos anticorrosivos en elementos metálicos. La capa

protectora —como la pintura anticorrosiva o la protección catódica— se ve comprometida

durante la fabricación, el montaje y la vida útil de la estructura. Su degradación paulatina

conduce al desarrollo progresivo de corrosión (Suleiman & Ali, 2022). La infraestructura

guatemalteca ilustra críticamente este problema: el puente sobre el Río Dulce, construido

entre 1977 y 1980, acumula daños calificados como "severos"por la Conred en informes de

2017, 2022 y 2024. A pesar de esto, no se ha ejecutado un plan permanente de mantenimien-

to, al punto de que el CIV evalúa la necesidad de construir un paso alterno (Prensa Libre,

2024).

Ante la inviabilidad de depender exclusivamente de inspecciones manuales para

prevenir este nivel de deterioro estructural, esta investigación busca aplicar redes neuronales

convolucionales para la detección de corrosión en conexiones de acero, tanto soldadas como

pernadas. Se propone el desarrollo de un modelo de visión artificial capaz de analizar imáge-

nes fotográficas y emitir una clasificación cuantificada de la presencia de corrosión. Este

enfoque no destructivo permite realizar inspecciones sistemáticas, objetivas y replicables,

6

superando las limitaciones de subjetividad y de acceso físico propias de los métodos visuales

convencionales, aportando así una herramienta proactiva para la gestión de la seguridad

estructural.

7

