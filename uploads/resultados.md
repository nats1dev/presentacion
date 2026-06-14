# Resultados usados para la presentacion

Fuentes principales: `Tesis/Resultados y discusion.md` y `Tesis/Conclusiones.md`.

## Metricas principales sobre test oficial

| Modelo | Accuracy | Recall | Specificity | F1 | AUC-ROC |
| --- | ---: | ---: | ---: | ---: | ---: |
| CNN propia | 92.88% | 0.8785 | 0.9625 | 0.9082 | 0.9577 |
| MobileNetV2 | 76.40% | 0.9813 | 0.6188 | 0.7692 | 0.9504 |
| EfficientNet-B0 | 86.89% | 0.9813 | 0.7937 | 0.8571 | 0.9850 |

## Matrices de confusion

| Modelo | TN | FP | FN | TP |
| --- | ---: | ---: | ---: | ---: |
| CNN propia | 154 | 6 | 13 | 94 |
| MobileNetV2 | 99 | 61 | 2 | 105 |
| EfficientNet-B0 | 127 | 33 | 2 | 105 |

## Eficiencia computacional

| Modelo | Media ms/img | FPS | Parametros | MB |
| --- | ---: | ---: | ---: | ---: |
| CNN propia | 0.651 | 1,536.29 | 1,749,185 | 6.67 |
| MobileNetV2 | 1.921 | 520.70 | 2,552,577 | 9.74 |
| EfficientNet-B0 | 3.109 | 321.60 | 4,336,253 | 16.54 |

## Lectura sintetica

- La CNN propia lidero accuracy, specificity, F1 y costo computacional.
- EfficientNet-B0 lidero AUC-ROC y empato con MobileNetV2 en menor numero de falsos negativos.
- MobileNetV2 mantuvo recall alto, pero genero la mayor cantidad de falsos positivos.
- La seleccion del modelo depende del costo relativo entre omisiones, falsas alarmas y latencia.

## TODOs de defensa

- [TODO: Insertar figura ROC comparativa exportada desde resultados]
- [TODO: Insertar ejemplos GradCAM++ definitivos si se desea mostrar imagenes reales]
