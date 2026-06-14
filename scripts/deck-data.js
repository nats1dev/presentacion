/* Datos de la tesis embebidos — fuente: Tesis/Resultados y discusion.md
   Embebidos en JS para que el deck funcione abriendo el archivo directo (file://). */
window.THESIS = {
  test_size: 267,
  test_pos: 107,   // imágenes con corrosión
  test_neg: 160,   // imágenes sin corrosión
  threshold: 0.5,
  models: [
    {
      id: "cnn", label: "CNN propia", short: "CNN", color: "var(--c-cnn)",
      accuracy: 92.88, recall: 0.8785, specificity: 0.9625, f1: 0.9082, auc: 0.9577,
      latency: 0.651, fps: 1536.29, params: 1749185, mb: 6.67,
      cm: { tn: 154, fp: 6, fn: 13, tp: 94 }
    },
    {
      id: "mobilenet", label: "MobileNetV2", short: "MobileNet", color: "var(--c-mobilenet)",
      accuracy: 76.40, recall: 0.9813, specificity: 0.6188, f1: 0.7692, auc: 0.9504,
      latency: 1.921, fps: 520.70, params: 2552577, mb: 9.74,
      cm: { tn: 99, fp: 61, fn: 2, tp: 105 }
    },
    {
      id: "efficientnet", label: "EfficientNet-B0", short: "EfficientNet", color: "var(--c-efficientnet)",
      accuracy: 86.89, recall: 0.9813, specificity: 0.7937, f1: 0.8571, auc: 0.9850,
      latency: 3.109, fps: 321.60, params: 4336253, mb: 16.54,
      cm: { tn: 127, fp: 33, fn: 2, tp: 105 }
    }
  ],
  dataset: { total: 2667, train: 2133, val: 267, test: 267 }
};
