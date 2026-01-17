# 📊 DOCUMENTACIÓN TÉCNICA - SISTEMA ANALÍTICO

## 🎯 ARQUITECTURA DE DATOS

### Módulos Implementados

```
├── columnas.js              # Mapeo de índices CSV
├── encuesta_opciones.js     # Catálogo de opciones válidas
├── data-engine.js           # Motor de procesamiento y normalización
├── visualization-helpers.js # Preparación de datos para gráficas
├── chart-updates.js         # Funciones de actualización de visuales
└── app.js                   # Orquestación y flujo principal
```

---

## 🔧 FUNCIONES PRINCIPALES

### 1. NORMALIZACIÓN DE DATOS

#### `DataEngine.processRawCSV(csvData)`

**Input:** Array con datos parseados por PapaParse
**Output:** Array de objetos normalizados

**Proceso:**

1. Itera sobre cada fila del CSV (saltando headers)
2. Valida que la fila tenga datos mínimos
3. Llama a `normalizeRow()` para cada registro
4. Retorna array de objetos estructurados

**Ejemplo de uso:**

```javascript
const normalizedData = DataEngine.processRawCSV(rawCSVData);
console.log(normalizedData[0]);
// {
//   nombreNegocio: "Tacos ABACO",
//   tipoNegocio: "Restaurante",
//   nivelDigitalizacion: 3,
//   herramientasDigitales: ["WhatsApp", "Redes sociales"],
//   ...
// }
```

#### `DataEngine.normalizeResponse(value, type, options)`

**Tipos soportados:**

- `single`: Selección única → String
- `multi`: Selección múltiple → Array
- `scale`: Escala numérica → Number
- `matrix`: Matriz de opciones → String

**Normalización de texto:**

- Convierte a minúsculas
- Elimina acentos
- Normaliza espacios
- Busca coincidencias parciales

---

### 2. SCORES COMPUESTOS

Cada score es calculado en escala 0-100 con pesos configurables.

#### `DataEngine.calculateDigitalMaturityScore(business)`

**Componentes (pesos configurables):**

- Nivel de digitalización (30%)
- Herramientas digitales utilizadas (20%)
- Gestión digital de procesos (25%)
- Uso de datos digitales (15%)
- Documentación de procesos (10%)

**Interpretación:**

- 0-40: Bajo nivel digital
- 41-70: Nivel digital medio
- 71-100: Alto nivel digital

**Ejemplo:**

```javascript
const scores = DataEngine.calculateAllScores(business);
console.log(scores.digitalMaturity); // 65
```

#### `DataEngine.calculateOperationalRiskScore(business)`

**Componentes:**

- Frecuencia de problemas operativos (35%)
- Dependencia de una persona (25%)
- Falta de documentación (20%)
- Causas recurrentes de errores (20%)

**Interpretación:**

- 0-40: Riesgo bajo
- 41-70: Riesgo medio
- 71-100: Riesgo alto (requiere atención inmediata)

#### `DataEngine.calculateTechAdoptionReadinessScore(business)`

**Componentes:**

- Apertura a tecnología (30%)
- Barreras percibidas (25%)
- Capacidad de aprendizaje del equipo (25%)
- Comodidad personal (20%)

**Uso estratégico:**

- Score ≥ 60: Candidatos para quick wins
- Score < 40: Requieren capacitación previa

#### `DataEngine.calculateScalabilityReadinessScore(business)`

**Componentes:**

- Capacidad declarada de escalar (30%)
- Nivel de automatización (30%)
- Uso de datos para decisiones (25%)
- Interés en crecimiento (15%)

---

### 3. AGREGACIONES Y MÉTRICAS

#### `DataEngine.calculateDistribution(data, field, validOptions)`

**Propósito:** Generar distribución completa (incluyendo opciones con 0 respuestas)

**Parámetros:**

- `data`: Array de negocios normalizados
- `field`: Campo a agregar (ej: 'herramientasDigitales')
- `validOptions`: Array de opciones válidas del catálogo

**Output:**

```javascript
{
  "WhatsApp": 15,
  "Redes sociales": 12,
  "Punto de venta": 3,
  "Sistemas especializados": 0,  // ← Incluye opciones no seleccionadas
  "Google Sheets": 5
}
```

#### `DataEngine.calculateAverageByDimension(data, dimension, scoreField)`

**Ejemplo:**

```javascript
// Promedio de madurez digital por tipo de negocio
const avgByType = DataEngine.calculateAverageByDimension(
  normalizedData,
  "tipoNegocio",
  "digitalMaturity"
);
// {
//   "Restaurante": 45,
//   "Hotel": 62,
//   "Tour": 38
// }
```

#### `DataEngine.generateProblemsRanking(data)`

**Output:**

```javascript
[
  {
    name: "Falta de control de inventario",
    count: 23,          // Cuántos negocios lo reportan
    severity: 58,       // Suma ponderada de frecuencia
    avgSeverity: 2.5    // Promedio (1=rara vez, 2=pocas veces, 3=muchas veces)
  },
  ...
]
```

#### `DataEngine.segmentBusinessesByProfile(data)`

**Segmentos automáticos:**

- **Digital Leaders**: Alta madurez + alta adopción (≥70 ambos)
- **Tech Ready**: Baja madurez (<50) pero alta disposición (≥60)
- **High Risk**: Riesgo operativo alto (≥70)
- **Growth Potential**: Alta escalabilidad (≥70)
- **Traditional**: Resto

**Uso:**

```javascript
const segments = DataEngine.segmentBusinessesByProfile(normalizedData);

// Identificar candidatos para solución X
const candidatos = segments["Tech Ready"];
candidatos.forEach((business) => {
  console.log(`${business.nombreNegocio} - Listo para adoptar`);
});
```

---

### 4. HELPERS DE VISUALIZACIÓN

#### `VisualizationHelpers.prepareBarChartData(distribution, validOptions)`

**Propósito:** Convertir distribución en estructura Chart.js

**Output:**

```javascript
{
  labels: ["Opción A", "Opción B", "Opción C"],
  data: [10, 5, 0],
  colors: ["rgba(0,230,118,0.7)", "rgba(0,230,118,0.7)", "rgba(0,230,118,0.3)"]
  // ↑ Opciones sin datos tienen color más claro
}
```

#### `VisualizationHelpers.prepareGlobalKPIs(data)`

**Output:**

```javascript
{
  totalBusinesses: 47,
  avgScores: {
    digitalMaturity: 52,
    operationalRisk: 65,
    techAdoptionReadiness: 58,
    scalabilityReadiness: 43
  },
  highRiskCount: 12,        // Cuántos tienen riesgo ≥70
  readyForTechCount: 28     // Cuántos están listos (adopción ≥60)
}
```

---

## 📈 FLUJO DE DATOS

### Pipeline Completo

```
1. CARGA
   respuestas.csv
   ↓
   PapaParse (header: false)
   ↓
   rawCSVData (array de arrays)

2. NORMALIZACIÓN
   DataEngine.processRawCSV()
   ↓
   normalizedData (array de objetos estructurados)

3. FILTRADO
   applyFilters()
   ↓
   filteredData (subconjunto basado en filtros UI)

4. CÁLCULO DE SCORES
   calculateAllScores() por cada negocio
   ↓
   Scores: digitalMaturity, operationalRisk, techAdoption, scalability

5. AGREGACIÓN
   calculateDistribution(), generateProblemsRanking(), etc.
   ↓
   Métricas agrupadas por dimensión

6. VISUALIZACIÓN
   VisualizationHelpers.prepare*()
   ↓
   Datos listos para Chart.js

7. RENDERIZADO
   ChartUpdates.update*Chart()
   ↓
   Gráficas actualizadas en UI
```

---

## 🎨 ACTUALIZACIÓN DE GRÁFICAS

### Gráfica de Digitalización por Tipo

```javascript
// Archivo: app.js
function updateDigitalizationChart() {
  const validTypes = encuestaOpciones.tipoNegocio.options;

  // Inicializar con todas las opciones (incluso las no seleccionadas)
  const typeGroups = {};
  validTypes.forEach(type => {
    typeGroups[type] = [];
  });

  // Agregar datos
  filteredData.forEach(business => {
    if (business.nivelDigitalizacion) {
      typeGroups[business.tipoNegocio].push(business.nivelDigitalizacion);
    }
  });

  // Calcular promedios
  const labels = Object.keys(typeGroups);
  const data = labels.map(type => {
    const scores = typeGroups[type];
    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  });

  // Renderizar con Chart.js
  ...
}
```

### Tabla de Resumen con Scores

```javascript
// Archivo: chart-updates.js
function updateSummaryTable() {
  const scoresData = VisualizationHelpers.prepareScoresTable(
    filteredData,
    "digitalMaturity" // ← Score a mostrar
  );

  scoresData.forEach((row) => {
    // row.nombre
    // row.tipo
    // row.score (solo el seleccionado)
    // row.allScores (todos los scores calculados)
  });
}
```

---

## ⚙️ CONFIGURACIÓN DE PESOS

Los pesos de cada score son configurables desde el objeto `scoreWeights`:

```javascript
// Archivo: data-engine.js
const scoreWeights = {
  digitalMaturity: {
    nivelDigitalizacion: 0.3, // 30%
    herramientasDigitales: 0.2, // 20%
    gestionProcesos: 0.25, // 25%
    usoDatosDigitales: 0.15, // 15%
    documentacionProcesos: 0.1, // 10%
  },
  // ...otros scores
};

// Acceso global
DataEngine.scoreWeights.digitalMaturity.nivelDigitalizacion = 0.4; // Ajustar
```

---

## 🔍 DEBUGGING Y VALIDACIÓN

### Verificar normalización

```javascript
console.log("Datos crudos:", rawCSVData[1]);
console.log("Datos normalizados:", normalizedData[0]);
```

### Validar scores

```javascript
const testBusiness = normalizedData[0];
const scores = DataEngine.calculateAllScores(testBusiness);

console.log("Digital Maturity:", scores.digitalMaturity);
console.log("Operational Risk:", scores.operationalRisk);
console.log("Tech Adoption:", scores.techAdoptionReadiness);
console.log("Scalability:", scores.scalabilityReadiness);
```

### Verificar distribuciones

```javascript
const dist = DataEngine.calculateDistribution(
  normalizedData,
  "herramientasDigitales",
  encuestaOpciones.herramientasDigitales.options
);

console.table(dist);
// Debe mostrar TODAS las opciones, incluso las con valor 0
```

---

## 📊 CASOS DE USO

### 1. Identificar negocios de alto riesgo

```javascript
const highRisk = normalizedData.filter((business) => {
  const scores = DataEngine.calculateAllScores(business);
  return scores.operationalRisk >= 70;
});

console.log(`${highRisk.length} negocios en alto riesgo`);
highRisk.forEach((b) => console.log(b.nombreNegocio));
```

### 2. Encontrar candidatos para solución específica

```javascript
// Ejemplo: POS para restaurantes con bajo control de inventario
const candidatos = normalizedData.filter((business) => {
  return (
    business.tipoNegocio === "Restaurante" &&
    business.problemasInventario === "Si muchas veces" &&
    !business.herramientasDigitales.includes("Punto de venta")
  );
});
```

### 3. Generar reporte ejecutivo

```javascript
const kpis = VisualizationHelpers.prepareGlobalKPIs(normalizedData);
const segments = DataEngine.segmentBusinessesByProfile(normalizedData);

const reporte = {
  resumen: {
    total: kpis.totalBusinesses,
    promedios: kpis.avgScores,
  },
  segmentacion: Object.keys(segments).map((key) => ({
    perfil: key,
    cantidad: segments[key].length,
    negocios: segments[key].map((b) => b.nombreNegocio),
  })),
  oportunidades: {
    altoRiesgo: kpis.highRiskCount,
    listosParaTech: kpis.readyForTechCount,
  },
};

console.log(JSON.stringify(reporte, null, 2));
```

---

## 🚀 EXTENSIBILIDAD

### Agregar nuevo score

1. Definir pesos en `scoreWeights`
2. Crear función `calculateNuevoScore(business)`
3. Agregarlo a `calculateAllScores()`
4. Usar en visualizaciones

### Agregar nueva métrica

1. Crear función en `data-engine.js`
2. Exportarla en `window.DataEngine`
3. Usar desde `chart-updates.js` o `app.js`

### Agregar nueva pregunta

1. Actualizar `encuestaColumnMap` con índice
2. Agregar opciones en `encuestaOpciones`
3. Incluir en `normalizeRow()`
4. Crear visualización correspondiente

---

## 📝 NOTAS IMPORTANTES

### Principios del sistema

1. **Sin hardcodeo**: Todo basado en `encuestaOpciones`
2. **Completo**: Incluir opciones con valor 0
3. **Normalizado**: Validar siempre contra catálogo
4. **Escalable**: Funciona con 10 o 10,000 registros
5. **Auditable**: Pesos explícitos y ajustables

### Mantenimiento

- Si cambia el CSV: Actualizar `encuestaColumnMap`
- Si cambian opciones: Actualizar `encuestaOpciones`
- Si cambian criterios: Ajustar `scoreWeights`

### Performance

- Normalización se hace 1 vez al cargar
- Filtros operan sobre datos ya normalizados
- Scores se calculan on-demand (no pre-calculados)

---

**Versión:** 1.0  
**Última actualización:** Enero 2026  
**Autor:** Senior Data Engineer & Analytics Developer
