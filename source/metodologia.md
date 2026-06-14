# Sintesis metodologica usada para la presentacion

Fuente principal: `Tesis/Metodologia.md`.

La investigacion se planteo como cuantitativa, aplicada y comparativa. La variable independiente principal fue la arquitectura CNN evaluada: CNN propia, MobileNetV2 y EfficientNet-B0. Las variables dependientes incluyeron desempeno de clasificacion, eficiencia computacional e interpretabilidad visual.

## Banco documental

- 2,667 imagenes totales en el split oficial auditado.
- 2,133 imagenes de entrenamiento, 267 de validacion y 267 de prueba.
- En el conjunto de prueba: 107 imagenes con corrosion y 160 sin corrosion visible.
- Se documentaron controles contra fuga de informacion mediante `source_key` y hash exacto.

## Condiciones controladas

- Resolucion de entrada: 224 x 224 px.
- Normalizacion: estadisticas de ImageNet.
- Semilla global: 42.
- Optimizador: Adam.
- Funcion de perdida: BCELoss.
- Umbral operativo de evaluacion: 0.5.

## Instrumentos y artefactos

- `prepare_dataset.py`: preparacion del split.
- `audit_dataset.py` y `audit_leakage.py`: auditoria del dataset.
- `models.py`: definicion de arquitecturas.
- `data.py`: carga, preprocesamiento y augmentation.
- `evaluate_visual.py`: evaluacion de metricas.
- `benchmark_inference.py`: medicion de latencia, FPS, parametros y tamano.
- `gradcam.py`: mapas GradCAM++.

## TODOs de defensa

- [TODO: Insertar diagrama real del pipeline si se exporta desde la tesis]
- [TODO: Agregar captura del reporte de auditoria si el tribunal solicita trazabilidad visual]
