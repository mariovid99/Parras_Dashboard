/**
 * =============================================================================
 * DATA ENGINE - MÓDULO DE PROCESAMIENTO ANALÍTICO
 * =============================================================================
 * 
 * Propósito: Leer, normalizar, agregar y calcular métricas desde respuestas.csv
 * Arquitectura: Modular, escalable, auditables, sin hardcodeo
 * 
 * Responsabilidades:
 * 1. Lectura y normalización de CSV
 * 2. Cálculo de KPIs compuestos (scores 0-100)
 * 3. Agregaciones dimensionales (industria, tamaño, nivel digital)
 * 4. Preparación de datos para visualización
 */

// =============================================================================
// 1. NORMALIZACIÓN DE DATOS
// =============================================================================

/**
 * Normaliza una respuesta según su tipo de pregunta
 * @param {string} rawValue - Valor crudo del CSV
 * @param {string} questionType - Tipo: single, multi, scale, matrix
 * @param {Array} validOptions - Opciones válidas del catálogo
 * @returns {*} Valor normalizado
 */
function normalizeResponse(rawValue, questionType, validOptions) {
    if (!rawValue || rawValue.trim() === '') {
        return questionType === 'multi' ? [] : null;
    }

    const value = rawValue.trim();

    switch (questionType) {
        case 'single':
            return normalizeSingleChoice(value, validOptions);
        
        case 'multi':
            return normalizeMultiChoice(value, validOptions);
        
        case 'scale':
            return normalizeScale(value, validOptions);
        
        case 'matrix':
            return normalizeMatrix(value, validOptions);
        
        default:
            return value;
    }
}

/**
 * Normaliza respuesta de selección única
 */
function normalizeSingleChoice(value, validOptions) {
    // Normalizar texto: quitar acentos, minúsculas, espacios extra
    const normalized = normalizeText(value);
    
    // Buscar coincidencia exacta primero
    const exactMatch = validOptions.find(opt => normalizeText(opt) === normalized);
    if (exactMatch) return exactMatch;
    
    // Buscar coincidencia parcial
    const partialMatch = validOptions.find(opt => 
        normalizeText(opt).includes(normalized) || normalized.includes(normalizeText(opt))
    );
    
    return partialMatch || 'Otro';
}

/**
 * Normaliza respuesta de selección múltiple
 */
function normalizeMultiChoice(value, validOptions) {
    // Dividir por ; o ,
    const separators = [';', ','];
    let items = [value];
    
    for (const sep of separators) {
        if (value.includes(sep)) {
            items = value.split(sep).map(item => item.trim()).filter(item => item);
            break;
        }
    }
    
    // Normalizar cada item y buscar en opciones válidas
    const normalizedItems = items.map(item => {
        const normalized = normalizeText(item);
        const match = validOptions.find(opt => 
            normalizeText(opt).includes(normalized) || normalized.includes(normalizeText(opt))
        );
        return match || item;
    });
    
    return [...new Set(normalizedItems)]; // Eliminar duplicados
}

/**
 * Normaliza escala numérica
 */
function normalizeScale(value, validOptions) {
    // Extraer número del texto (ej: "3- promedio" -> 3)
    const match = value.toString().match(/(\d+)/);
    if (!match) return null;
    
    const num = parseInt(match[1]);
    const min = Math.min(...validOptions);
    const max = Math.max(...validOptions);
    
    // Validar rango
    return (num >= min && num <= max) ? num : null;
}

/**
 * Normaliza respuesta tipo matriz
 */
function normalizeMatrix(value, validOptions) {
    const normalized = normalizeText(value);
    const match = validOptions.find(opt => normalizeText(opt) === normalized);
    return match || validOptions[0]; // Default al primer valor si no coincide
}

/**
 * Normaliza texto: minúsculas, sin acentos, sin espacios extra
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .replace(/\s+/g, ' ')
        .trim();
}

// =============================================================================
// 2. LECTURA Y PROCESAMIENTO DE CSV
// =============================================================================

/**
 * Procesa el CSV completo y retorna datos normalizados
 * @param {Array} csvData - Datos parseados por PapaParse
 * @returns {Array} Array de objetos normalizados
 */
function processRawCSV(csvData) {
    const processedData = [];
    
    // Saltar primera fila (headers) y procesar desde la segunda
    for (let i = 1; i < csvData.length; i++) {
        const row = csvData[i];
        
        // Validar que la fila tenga contenido
        if (!row || row.length < 10) continue;
        if (!row[encuestaColumnMap.nombreNegocio]) continue;
        
        const normalized = normalizeRow(row);
        
        // Calcular y agregar scores
        normalized.scores = calculateAllScores(normalized);
        
        processedData.push(normalized);
    }
    
    return processedData;
}

/**
 * Normaliza una fila completa del CSV
 */
function normalizeRow(row) {
    const normalized = {
        // Identificación
        id: row[0],
        nombreNegocio: row[encuestaColumnMap.nombreNegocio],
        
        // Perfil del negocio
        tipoNegocio: normalizeResponse(
            row[encuestaColumnMap.tipoNegocio], 
            'single', 
            encuestaOpciones.tipoNegocio.options
        ),
        tamanoNegocio: normalizeResponse(
            row[encuestaColumnMap.tamanoNegocio], 
            'single', 
            encuestaOpciones.tamanoNegocio.options
        ),
        responsableOperacion: normalizeResponse(
            row[encuestaColumnMap.responsableOperacion], 
            'multi', 
            encuestaOpciones.responsableOperacion.options
        ),
        edadPersonal: normalizeResponse(
            row[encuestaColumnMap.edadPersonal], 
            'multi', 
            encuestaOpciones.edadPersonal.options
        ),
        posicionCompetencia: normalizeResponse(
            row[encuestaColumnMap.posicionCompetencia], 
            'single', 
            encuestaOpciones.posicionCompetencia.options
        ),
        
        // Tecnología y digitalización
        herramientasDigitales: normalizeResponse(
            row[encuestaColumnMap.herramientasDigitales], 
            'multi', 
            encuestaOpciones.herramientasDigitales.options
        ),
        visibilidadInternet: normalizeResponse(
            row[encuestaColumnMap.visibilidadInternet], 
            'single', 
            encuestaOpciones.visibilidadInternet.options
        ),
        expectativaTecnologiaClientes: normalizeResponse(
            row[encuestaColumnMap.expectativaTecnologiaClientes], 
            'single', 
            encuestaOpciones.expectativaTecnologiaClientes.options
        ),
        preparacionGoogleChatGPT: normalizeResponse(
            row[encuestaColumnMap.preparacionGoogleChatGPT], 
            'single', 
            encuestaOpciones.preparacionGoogleChatGPT.options
        ),
        nivelDigitalizacion: normalizeResponse(
            row[encuestaColumnMap.nivelDigitalizacion], 
            'scale', 
            encuestaOpciones.nivelDigitalizacion.options
        ),
        
        // Gestión de procesos
        gestionReservaciones: normalizeResponse(
            row[encuestaColumnMap.gestionReservaciones], 
            'matrix', 
            encuestaOpciones.gestionOperacion.options
        ),
        gestionPagos: normalizeResponse(
            row[encuestaColumnMap.gestionPagos], 
            'matrix', 
            encuestaOpciones.gestionOperacion.options
        ),
        gestionInventarios: normalizeResponse(
            row[encuestaColumnMap.gestionInventarios], 
            'matrix', 
            encuestaOpciones.gestionOperacion.options
        ),
        gestionFacturacion: normalizeResponse(
            row[encuestaColumnMap.gestionFacturacion], 
            'matrix', 
            encuestaOpciones.gestionOperacion.options
        ),
        gestionAtencionClientes: normalizeResponse(
            row[encuestaColumnMap.gestionAtencionClientes], 
            'matrix', 
            encuestaOpciones.gestionOperacion.options
        ),
        
        // Problemas operativos
        problemasReservasDuplicadas: normalizeResponse(
            row[encuestaColumnMap.problemasReservasDuplicadas], 
            'matrix', 
            encuestaOpciones.problemasOperacion.options
        ),
        problemasInventario: normalizeResponse(
            row[encuestaColumnMap.problemasInventario], 
            'matrix', 
            encuestaOpciones.problemasOperacion.options
        ),
        problemasAdministracion: normalizeResponse(
            row[encuestaColumnMap.problemasAdministracion], 
            'matrix', 
            encuestaOpciones.problemasOperacion.options
        ),
        problemasFaltaInfo: normalizeResponse(
            row[encuestaColumnMap.problemasFaltaInfo], 
            'matrix', 
            encuestaOpciones.problemasOperacion.options
        ),
        problemasDatosDispersos: normalizeResponse(
            row[encuestaColumnMap.problemasDatosDispersos], 
            'matrix', 
            encuestaOpciones.problemasOperacion.options
        ),
        
        // Adopción tecnológica
        aperturaTecnologica: normalizeResponse(
            row[encuestaColumnMap.aperturaTecnologica], 
            'single', 
            encuestaOpciones.aperturaTecnologica.options
        ),
        barrerasTecnologia: normalizeResponse(
            row[encuestaColumnMap.barrerasTecnologia], 
            'multi', 
            encuestaOpciones.barrerasTecnologia.options
        ),
        responsableTecnologia: normalizeResponse(
            row[encuestaColumnMap.responsableTecnologia], 
            'single', 
            encuestaOpciones.responsableTecnologia.options
        ),
        capacidadAprendizajeEquipo: normalizeResponse(
            row[encuestaColumnMap.capacidadAprendizajeEquipo], 
            'single', 
            encuestaOpciones.capacidadAprendizajeEquipo.options
        ),
        comodidadAprenderTecnologia: normalizeResponse(
            row[encuestaColumnMap.comodidadAprenderTecnologia], 
            'single', 
            encuestaOpciones.comodidadAprenderTecnologia.options
        ),
        tipoCapacitacion: normalizeResponse(
            row[encuestaColumnMap.tipoCapacitacion], 
            'multi', 
            encuestaOpciones.tipoCapacitacion.options
        ),
        riesgoSalidaResponsableTI: normalizeResponse(
            row[encuestaColumnMap.riesgoSalidaResponsableTI], 
            'single', 
            encuestaOpciones.riesgoSalidaResponsableTI.options
        ),
        habilidadesFaltantes: normalizeResponse(
            row[encuestaColumnMap.habilidadesFaltantes], 
            'multi', 
            encuestaOpciones.habilidadesFaltantes.options
        ),
        
        // Operación y procesos
        origenClientes: normalizeResponse(
            row[encuestaColumnMap.origenClientes], 
            'multi', 
            encuestaOpciones.origenClientes.options
        ),
        facilidadOnboardingPersonal: normalizeResponse(
            row[encuestaColumnMap.facilidadOnboardingPersonal], 
            'single', 
            encuestaOpciones.facilidadOnboardingPersonal.options
        ),
        documentacionProcesos: normalizeResponse(
            row[encuestaColumnMap.documentacionProcesos], 
            'multi', 
            encuestaOpciones.documentacionProcesos.options
        ),
        indicadoresActuales: normalizeResponse(
            row[encuestaColumnMap.indicadoresActuales], 
            'multi', 
            encuestaOpciones.indicadoresActuales.options
        ),
        seguimientoIndicadores: normalizeResponse(
            row[encuestaColumnMap.seguimientoIndicadores], 
            'single', 
            encuestaOpciones.seguimientoIndicadores.options
        ),
        causaErrores: normalizeResponse(
            row[encuestaColumnMap.causaErrores], 
            'multi', 
            encuestaOpciones.causaErrores.options
        ),
        
        // Toma de decisiones
        tomaDecisiones: normalizeResponse(
            row[encuestaColumnMap.tomaDecisiones], 
            'single', 
            encuestaOpciones.tomaDecisiones.options
        ),
        criteriosDecision: normalizeResponse(
            row[encuestaColumnMap.criteriosDecision], 
            'multi', 
            encuestaOpciones.criteriosDecision.options
        ),
        usoDatosDigitales: normalizeResponse(
            row[encuestaColumnMap.usoDatosDigitales], 
            'single', 
            encuestaOpciones.usoDatosDigitales.options
        ),
        
        // Escalabilidad
        interesCrecimiento: normalizeResponse(
            row[encuestaColumnMap.interesCrecimiento], 
            'single', 
            encuestaOpciones.interesCrecimiento.options
        ),
        capacidadEscalar: normalizeResponse(
            row[encuestaColumnMap.capacidadEscalar], 
            'single', 
            encuestaOpciones.capacidadEscalar.options
        ),
        confianzaAdoptarTecnologia: normalizeResponse(
            row[encuestaColumnMap.confianzaAdoptarTecnologia], 
            'multi', 
            encuestaOpciones.confianzaAdoptarTecnologia.options
        ),
        interesFinalTecnologia: normalizeResponse(
            row[encuestaColumnMap.interesFinalTecnologia], 
            'single', 
            encuestaOpciones.interesFinalTecnologia.options
        )
    };
    
    return normalized;
}

// =============================================================================
// 3. CÁLCULO DE SCORES COMPUESTOS
// =============================================================================

/**
 * Configuración de pesos para cada score
 * Permite ajuste fácil sin tocar lógica
 */
const scoreWeights = {
    digitalMaturity: {
        nivelDigitalizacion: 0.30,
        herramientasDigitales: 0.20,
        gestionProcesos: 0.25,
        usoDatosDigitales: 0.15,
        documentacionProcesos: 0.10
    },
    operationalRisk: {
        problemasOperativos: 0.35,
        dependenciaPersonal: 0.25,
        documentacionProcesos: 0.20,
        causaErrores: 0.20
    },
    techAdoptionReadiness: {
        aperturaTecnologica: 0.30,
        barrerasTecnologia: 0.25,
        capacidadAprendizaje: 0.25,
        comodidadAprender: 0.20
    },
    scalabilityReadiness: {
        capacidadEscalar: 0.30,
        automatizacionProcesos: 0.30,
        usoDatosDigitales: 0.25,
        interesCrecimiento: 0.15
    }
};

/**
 * Calcula Digital Maturity Score (0-100)
 */
function calculateDigitalMaturityScore(business) {
    let score = 0;
    const weights = scoreWeights.digitalMaturity;
    
    // 1. Nivel de digitalización (escala 1-5)
    if (business.nivelDigitalizacion) {
        score += ((business.nivelDigitalizacion - 1) / 4) * 100 * weights.nivelDigitalizacion;
    }
    
    // 2. Herramientas digitales utilizadas
    const herramientas = business.herramientasDigitales || [];
    const herramientasAvanzadas = ['Sistemas especializados', 'Punto de venta', 'Google Sheets'];
    const herramientasUsadas = herramientas.filter(h => herramientasAvanzadas.includes(h)).length;
    score += (herramientasUsadas / herramientasAvanzadas.length) * 100 * weights.herramientasDigitales;
    
    // 3. Gestión de procesos digitales
    const procesos = [
        business.gestionReservaciones,
        business.gestionPagos,
        business.gestionInventarios,
        business.gestionFacturacion,
        business.gestionAtencionClientes
    ];
    const procesosDigitales = procesos.filter(p => 
        p === 'Digital basica' || p === 'Digital automatizada'
    ).length;
    score += (procesosDigitales / procesos.length) * 100 * weights.gestionProcesos;
    
    // 4. Uso de datos digitales
    const nivelUsoDatos = {
        'No uso informacion': 0,
        'Ocasional': 25,
        'Algunas decisiones': 50,
        'Frecuente': 75,
        'Sistematica': 100
    };
    const usoDatos = nivelUsoDatos[business.usoDatosDigitales] || 0;
    score += usoDatos * weights.usoDatosDigitales;
    
    // 5. Documentación de procesos
    const docProcesos = business.documentacionProcesos || [];
    const docDigital = docProcesos.filter(d => 
        d === 'Excel / Sheets' || d === 'Documentados' || d === 'Videos'
    ).length;
    const totalDoc = ['En mi cabeza', 'Libretas', 'Excel / Sheets', 'Documentados', 'Videos'].length;
    score += (docDigital / totalDoc) * 100 * weights.documentacionProcesos;
    
    return Math.round(score);
}

/**
 * Calcula Operational Risk Score (0-100)
 * Nota: Mayor score = Mayor riesgo
 */
function calculateOperationalRiskScore(business) {
    let score = 0;
    const weights = scoreWeights.operationalRisk;
    
    // 1. Problemas operativos frecuentes
    const problemas = [
        business.problemasReservasDuplicadas,
        business.problemasInventario,
        business.problemasAdministracion,
        business.problemasFaltaInfo,
        business.problemasDatosDispersos
    ];
    const problemasAltos = problemas.filter(p => p === 'Si muchas veces').length;
    const problemasMedios = problemas.filter(p => p === 'Si pocas veces').length;
    const riesgoProblemas = (problemasAltos * 100 + problemasMedios * 50) / (problemas.length * 100);
    score += riesgoProblemas * 100 * weights.problemasOperativos;
    
    // 2. Dependencia de una persona
    const dependencia = {
        'Sin problema': 0,
        'Algunas dificultades': 40,
        'Muchos problemas': 70,
        'Seriamente afectado': 100
    };
    const riesgoDependencia = dependencia[business.riesgoSalidaResponsableTI] || 0;
    score += riesgoDependencia * weights.dependenciaPersonal;
    
    // 3. Falta de documentación
    const docProcesos = business.documentacionProcesos || [];
    const sinDocumentar = docProcesos.filter(d => d === 'En mi cabeza').length > 0 ? 100 : 0;
    score += sinDocumentar * weights.documentacionProcesos;
    
    // 4. Causas de errores (multi)
    const causas = business.causaErrores || [];
    const riesgoCausas = (causas.length / encuestaOpciones.causaErrores.options.length) * 100;
    score += riesgoCausas * weights.causaErrores;
    
    return Math.round(score);
}

/**
 * Calcula Tech Adoption Readiness Score (0-100)
 */
function calculateTechAdoptionReadinessScore(business) {
    let score = 0;
    const weights = scoreWeights.techAdoptionReadiness;
    
    // 1. Apertura tecnológica
    const apertura = {
        'Muy poco': 0,
        'Neutral': 33,
        'Dispuesto': 66,
        'Muy dispuesto': 100
    };
    const aperturaScore = apertura[business.aperturaTecnologica] || 0;
    score += aperturaScore * weights.aperturaTecnologica;
    
    // 2. Barreras (menos barreras = mejor score)
    const barreras = business.barrerasTecnologia || [];
    const barrerasScore = Math.max(0, 100 - (barreras.length / encuestaOpciones.barrerasTecnologia.options.length) * 100);
    score += barrerasScore * weights.barrerasTecnologia;
    
    // 3. Capacidad de aprendizaje del equipo
    const capacidad = {
        'Aprende rapido': 100,
        'Necesita acompanamiento': 60,
        'Le cuesta mucho': 20
    };
    const capacidadScore = capacidad[business.capacidadAprendizajeEquipo] || 50;
    score += capacidadScore * weights.capacidadAprendizaje;
    
    // 4. Comodidad personal
    const comodidad = {
        'Muy comodo': 100,
        'Se me dificulta': 40,
        'No es de mi interes': 0
    };
    const comodidadScore = comodidad[business.comodidadAprenderTecnologia] || 50;
    score += comodidadScore * weights.comodidadAprender;
    
    return Math.round(score);
}

/**
 * Calcula Scalability Readiness Score (0-100)
 */
function calculateScalabilityReadinessScore(business) {
    let score = 0;
    const weights = scoreWeights.scalabilityReadiness;
    
    // 1. Capacidad de escalar
    const capacidad = {
        'Sin problema': 100,
        'Me costaria trabajo': 50,
        'Muy complicado': 20,
        'No es posible hoy': 0
    };
    const capacidadScore = capacidad[business.capacidadEscalar] || 50;
    score += capacidadScore * weights.capacidadEscalar;
    
    // 2. Automatización de procesos
    const procesos = [
        business.gestionReservaciones,
        business.gestionPagos,
        business.gestionInventarios,
        business.gestionFacturacion,
        business.gestionAtencionClientes
    ];
    const automatizados = procesos.filter(p => p === 'Digital automatizada').length;
    const digitales = procesos.filter(p => p === 'Digital basica' || p === 'Digital automatizada').length;
    const automatizacionScore = ((automatizados * 2 + digitales) / (procesos.length * 2)) * 100;
    score += automatizacionScore * weights.automatizacionProcesos;
    
    // 3. Uso de datos para decisiones
    const nivelUsoDatos = {
        'No uso informacion': 0,
        'Ocasional': 25,
        'Algunas decisiones': 50,
        'Frecuente': 75,
        'Sistematica': 100
    };
    const usoDatosScore = nivelUsoDatos[business.usoDatosDigitales] || 0;
    score += usoDatosScore * weights.usoDatosDigitales;
    
    // 4. Interés en crecimiento
    const interes = {
        'Mantenerme': 20,
        'Crecer poco a poco': 60,
        'Expandirme': 100,
        'No lo he pensado': 0
    };
    const interesScore = interes[business.interesCrecimiento] || 0;
    score += interesScore * weights.interesCrecimiento;
    
    return Math.round(score);
}

/**
 * Calcula todos los scores para un negocio
 */
function calculateAllScores(business) {
    return {
        digitalMaturity: calculateDigitalMaturityScore(business),
        operationalRisk: calculateOperationalRiskScore(business),
        techAdoptionReadiness: calculateTechAdoptionReadinessScore(business),
        scalabilityReadiness: calculateScalabilityReadinessScore(business)
    };
}

// =============================================================================
// 4. AGREGACIONES Y MÉTRICAS
// =============================================================================

/**
 * Calcula distribución de una pregunta single/multi
 */
function calculateDistribution(data, field, validOptions) {
    const distribution = {};
    
    // Inicializar todas las opciones con 0
    validOptions.forEach(opt => {
        distribution[opt] = 0;
    });
    
    // Contar respuestas
    data.forEach(business => {
        const value = business[field];
        
        if (Array.isArray(value)) {
            // Multi-choice
            value.forEach(v => {
                if (distribution.hasOwnProperty(v)) {
                    distribution[v]++;
                }
            });
        } else if (value && distribution.hasOwnProperty(value)) {
            // Single-choice
            distribution[value]++;
        }
    });
    
    return distribution;
}

/**
 * Calcula promedio de scores por dimensión
 */
function calculateAverageByDimension(data, dimension, scoreField) {
    const groups = {};
    
    data.forEach(business => {
        const dimValue = business[dimension];
        if (!dimValue) return;
        
        if (!groups[dimValue]) {
            groups[dimValue] = {
                sum: 0,
                count: 0
            };
        }
        
        const scores = calculateAllScores(business);
        groups[dimValue].sum += scores[scoreField];
        groups[dimValue].count++;
    });
    
    // Calcular promedios
    const averages = {};
    Object.keys(groups).forEach(key => {
        averages[key] = Math.round(groups[key].sum / groups[key].count);
    });
    
    return averages;
}

/**
 * Genera ranking de problemas operativos
 */
function generateProblemsRanking(data) {
    const problems = {
        'Reservas duplicadas': { count: 0, severity: 0 },
        'Falta de control de inventario': { count: 0, severity: 0 },
        'Mucho tiempo administrativo': { count: 0, severity: 0 },
        'Falta de informacion': { count: 0, severity: 0 },
        'Datos en distintos lugares': { count: 0, severity: 0 }
    };
    
    const severityWeight = {
        'Rara vez': 1,
        'Si pocas veces': 2,
        'Si muchas veces': 3
    };
    
    data.forEach(business => {
        const problemFields = [
            { key: 'Reservas duplicadas', field: 'problemasReservasDuplicadas' },
            { key: 'Falta de control de inventario', field: 'problemasInventario' },
            { key: 'Mucho tiempo administrativo', field: 'problemasAdministracion' },
            { key: 'Falta de informacion', field: 'problemasFaltaInfo' },
            { key: 'Datos en distintos lugares', field: 'problemasDatosDispersos' }
        ];
        
        problemFields.forEach(({ key, field }) => {
            const value = business[field];
            if (value && value !== 'Rara vez') {
                problems[key].count++;
                problems[key].severity += severityWeight[value] || 0;
            }
        });
    });
    
    // Convertir a array y ordenar por severidad
    return Object.entries(problems)
        .map(([name, data]) => ({
            name,
            count: data.count,
            severity: data.severity,
            avgSeverity: data.count > 0 ? data.severity / data.count : 0
        }))
        .sort((a, b) => b.severity - a.severity);
}

/**
 * Segmenta negocios por perfil tecnológico
 */
function segmentBusinessesByProfile(data) {
    const segments = {
        'Digital Leaders': [],
        'Tech Ready': [],
        'Growth Potential': [],
        'High Risk': [],
        'Traditional': []
    };
    
    data.forEach(business => {
        const scores = calculateAllScores(business);
        
        // Digital Leaders: alta madurez digital + alta capacidad de adopción
        if (scores.digitalMaturity >= 70 && scores.techAdoptionReadiness >= 70) {
            segments['Digital Leaders'].push(business);
        }
        // Tech Ready: baja madurez pero alta disposición
        else if (scores.digitalMaturity < 50 && scores.techAdoptionReadiness >= 60) {
            segments['Tech Ready'].push(business);
        }
        // High Risk: alto riesgo operativo
        else if (scores.operationalRisk >= 70) {
            segments['High Risk'].push(business);
        }
        // Growth Potential: alta escalabilidad
        else if (scores.scalabilityReadiness >= 70) {
            segments['Growth Potential'].push(business);
        }
        // Traditional: resto
        else {
            segments['Traditional'].push(business);
        }
    });
    
    return segments;
}

// =============================================================================
// 5. EXPORTAR FUNCIONES
// =============================================================================

// Hacer funciones disponibles globalmente
window.DataEngine = {
    // Normalización
    processRawCSV,
    normalizeRow,
    normalizeResponse,
    
    // Scores
    calculateAllScores,
    calculateDigitalMaturityScore,
    calculateOperationalRiskScore,
    calculateTechAdoptionReadinessScore,
    calculateScalabilityReadinessScore,
    
    // Métricas
    calculateDistribution,
    calculateAverageByDimension,
    generateProblemsRanking,
    segmentBusinessesByProfile,
    
    // Configuración
    scoreWeights
};
