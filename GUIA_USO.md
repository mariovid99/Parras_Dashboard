# 📋 GUÍA DE USO RÁPIDO

## 🚀 INICIO RÁPIDO

### 1. Abrir el Dashboard

```bash
# Navegar a la carpeta
cd c:\Users\mario\Parras_Dashboard

# Abrir index.html en navegador
# (Doble clic o arrastrar al navegador)
```

### 2. Cargar Datos

El dashboard carga automáticamente `respuestas.csv` si está en la misma carpeta.

**Archivos requeridos:**

- ✅ `respuestas.csv` - Datos de la encuesta
- ✅ `columnas.js` - Mapeo de columnas
- ✅ `encuesta_opciones.js` - Catálogo de opciones

---

## 📊 SCORES DISPONIBLES

### Digital Maturity Score (0-100)

**¿Qué mide?** Nivel de adopción digital actual

**Componentes:**

- Autoevaluación digital (30%)
- Herramientas utilizadas (20%)
- Procesos digitalizados (25%)
- Uso de datos (15%)
- Documentación (10%)

**Interpretación:**

- **0-40**: Oportunidad de digitalización básica
- **41-70**: Necesita optimización y automatización
- **71-100**: Listo para innovación avanzada

---

### Operational Risk Score (0-100)

**¿Qué mide?** Riesgo de fallos operativos

**Componentes:**

- Frecuencia de problemas (35%)
- Dependencia de personas clave (25%)
- Falta de documentación (20%)
- Causas de errores (20%)

**Interpretación:**

- **0-40**: Operación estable
- **41-70**: Requiere atención preventiva
- **71-100**: 🚨 Riesgo crítico - acción inmediata

**Acción:** Negocios con score ≥70 son candidatos prioritarios para automatización

---

### Tech Adoption Readiness (0-100)

**¿Qué mide?** Disposición para adoptar tecnología

**Componentes:**

- Apertura declarada (30%)
- Barreras percibidas (25%)
- Capacidad de aprendizaje (25%)
- Comodidad personal (20%)

**Interpretación:**

- **≥60**: ✅ Listos para quick wins
- **40-59**: Necesitan acompañamiento
- **<40**: Requieren capacitación previa

**Uso estratégico:** Priorizar negocios con score ≥60 para pilotos

---

### Scalability Readiness (0-100)

**¿Qué mide?** Capacidad de crecer/escalar

**Componentes:**

- Capacidad declarada (30%)
- Automatización actual (30%)
- Uso de datos (25%)
- Interés en crecimiento (15%)

**Interpretación:**

- **≥70**: Listos para expansión
- **40-69**: Necesitan fortalecer procesos
- **<40**: Enfoque en estabilización

---

## 🎯 PERFILES AUTOMÁTICOS

### Digital Leaders

**Criterio:** Digital Maturity ≥70 AND Tech Adoption ≥70  
**Acción:** Optimización avanzada, casos de estudio

### Tech Ready

**Criterio:** Digital Maturity <50 AND Tech Adoption ≥60  
**Acción:** ⭐ Quick wins, soluciones sencillas

### High Risk

**Criterio:** Operational Risk ≥70  
**Acción:** 🚨 Prioridad 1 - automatización urgente

### Growth Potential

**Criterio:** Scalability ≥70  
**Acción:** Soluciones para expansión

### Traditional

**Criterio:** Resto  
**Acción:** Capacitación básica, casos locales

---

## 💡 CASOS DE USO COMUNES

### ¿Quién necesita POS urgentemente?

```javascript
Filtros:
- Tipo: Restaurante
- Operational Risk: ≥70
- Problemas de inventario: "Si muchas veces"
```

### ¿Quién está listo para plataforma de reservas?

```javascript
Criterios:
- Tech Adoption ≥60
- Origen clientes: incluye "Redes sociales"
- NO usa sistemas especializados
```

### ¿A quién capacitar primero?

```javascript
Priorizar:
- Tech Adoption ≥60 (están dispuestos)
- Digital Maturity <50 (tienen margen de mejora)
- High Risk (necesitan ayuda)
```

### ¿Quiénes pueden ser early adopters?

```javascript
Segmento: Digital Leaders
Características:
- Alta madurez digital
- Alta disposición
- Pueden ser evangelizadores
```

---

## 📈 MÉTRICAS CLAVE A MONITOREAR

### KPIs Globales

- **Promedio Digital Maturity**: Meta ≥60
- **% High Risk**: Meta <20%
- **% Tech Ready**: Indicador de mercado potencial

### Por Industria

- Digital Maturity promedio por tipo
- Principales dolores por sector
- Apertura tecnológica por industria

### Oportunidades

- Cantidad en cada perfil automático
- Problemas más frecuentes (ranking)
- Barreras más comunes

---

## 🔍 ANÁLISIS RECOMENDADOS

### 1. Priorización de Negocios

```
Paso 1: Identificar High Risk (≥70)
Paso 2: Dentro de High Risk, buscar Tech Ready (≥60)
Paso 3: Ofrecer solución específica al dolor
```

### 2. Diseño de Solución

```
Paso 1: Segmentar por perfil automático
Paso 2: Identificar dolores comunes del segmento
Paso 3: Mapear barreras principales
Paso 4: Diseñar propuesta considerando capacidad de aprendizaje
```

### 3. Validación de Mercado

```
Paso 1: Contar cuántos Tech Ready hay
Paso 2: Ver distribución de problemas operativos
Paso 3: Validar que el problema es frecuente Y severo
```

---

## ⚙️ AJUSTES DE CONFIGURACIÓN

### Modificar Pesos de Scores

```javascript
// Abrir data-engine.js
// Modificar scoreWeights

const scoreWeights = {
  digitalMaturity: {
    nivelDigitalizacion: 0.4, // Cambiar de 0.30 a 0.40
    // ...resto igual
  },
};
```

### Agregar Nueva Segmentación

```javascript
// En data-engine.js, función segmentBusinessesByProfile()

// Agregar nuevo criterio
if (scores.digitalMaturity >= 60 && scores.scalabilityReadiness < 40) {
  segments["Digital pero no escalable"].push(business);
}
```

---

## 🐛 TROUBLESHOOTING

### No aparecen datos

✅ Verificar que `respuestas.csv` esté en la misma carpeta  
✅ Abrir consola del navegador (F12) y buscar errores  
✅ Verificar que los archivos JS estén cargados

### Scores parecen incorrectos

✅ Revisar que `encuestaColumnMap` tenga índices correctos  
✅ Validar que `encuestaOpciones` contenga todas las opciones  
✅ Ver consola: `console.log(DataEngine.calculateAllScores(normalizedData[0]))`

### Gráficas vacías

✅ Verificar que filtros no estén demasiado restrictivos  
✅ Revisar que las opciones en `encuestaOpciones` coincidan con CSV  
✅ Ver consola: `console.log(filteredData.length)`

---

## 📚 REFERENCIAS

- **Documentación técnica completa**: `DOCUMENTACION_TECNICA.md`
- **Código fuente**:
  - `data-engine.js` - Procesamiento y scores
  - `visualization-helpers.js` - Preparación de gráficas
  - `chart-updates.js` - Actualización de visuales
  - `app.js` - Flujo principal

---

**Tip:** Usa la consola del navegador (F12) para experimentar:

```javascript
// Ver datos normalizados
console.log(normalizedData);

// Calcular scores de un negocio específico
const scores = DataEngine.calculateAllScores(normalizedData[0]);
console.log(scores);

// Ver segmentación completa
const segments = DataEngine.segmentBusinessesByProfile(normalizedData);
console.log(segments);
```
