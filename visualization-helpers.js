/**
 * =============================================================================
 * VISUALIZATION HELPERS - PREPARACIÓN DE DATOS PARA GRÁFICAS
 * =============================================================================
 * 
 * Propósito: Transformar datos normalizados en estructuras listas para Chart.js
 * Garantiza que todas las opciones aparezcan (incluso con valor 0)
 */

/**
 * Prepara datos para gráfica de barras desde distribución
 * @param {Object} distribution - Objeto con {opcion: count}
 * @param {Array} validOptions - Array de opciones válidas
 * @returns {Object} {labels, data, colors}
 */
function prepareBarChartData(distribution, validOptions) {
    const labels = [];
    const data = [];
    const colors = [];
    
    const primaryColor = 'rgba(0, 230, 118, 0.7)';
    const secondaryColor = 'rgba(0, 230, 118, 0.3)';
    
    validOptions.forEach(option => {
        labels.push(option);
        const count = distribution[option] || 0;
        data.push(count);
        colors.push(count > 0 ? primaryColor : secondaryColor);
    });
    
    return { labels, data, colors };
}

/**
 * Prepara datos para gráfica de dona/pastel
 */
function prepareDoughnutChartData(distribution, validOptions) {
    const labels = [];
    const data = [];
    const colors = [];
    
    const colorPalette = [
        'rgba(0, 230, 118, 0.9)',
        'rgba(0, 230, 118, 0.7)',
        'rgba(0, 230, 118, 0.5)',
        'rgba(0, 230, 118, 0.3)',
        'rgba(0, 230, 118, 0.2)'
    ];
    
    validOptions.forEach((option, index) => {
        const count = distribution[option] || 0;
        if (count > 0) {  // Solo incluir opciones con datos para dona
            labels.push(option);
            data.push(count);
            colors.push(colorPalette[index % colorPalette.length]);
        }
    });
    
    return { labels, data, colors };
}

/**
 * Prepara datos para gráfica de barras horizontales
 */
function prepareHorizontalBarData(distribution, validOptions) {
    const result = prepareBarChartData(distribution, validOptions);
    // Ordenar por valor descendente
    const combined = result.labels.map((label, i) => ({
        label,
        value: result.data[i],
        color: result.colors[i]
    }));
    
    combined.sort((a, b) => b.value - a.value);
    
    return {
        labels: combined.map(item => item.label),
        data: combined.map(item => item.value),
        colors: combined.map(item => item.color)
    };
}

/**
 * Prepara datos para gráfica de barras agrupadas
 */
function prepareGroupedBarData(data, categories, groups) {
    const datasets = groups.map((group, index) => ({
        label: group,
        data: categories.map(cat => data[cat]?.[group] || 0),
        backgroundColor: `rgba(0, 230, 118, ${0.9 - index * 0.2})`,
        borderColor: '#00E676',
        borderWidth: 1,
        borderRadius: 6
    }));
    
    return {
        labels: categories,
        datasets
    };
}

/**
 * Prepara datos para tabla de scores
 */
function prepareScoresTable(data, scoreType = 'digitalMaturity') {
    const rows = data.map(business => {
        const scores = DataEngine.calculateAllScores(business);
        return {
            nombre: business.nombreNegocio,
            tipo: business.tipoNegocio,
            tamano: business.tamanoNegocio,
            score: scores[scoreType],
            allScores: scores
        };
    });
    
    // Ordenar por score descendente
    rows.sort((a, b) => b.score - a.score);
    
    return rows;
}

/**
 * Prepara datos para ranking de problemas
 */
function prepareProblemsRanking(data) {
    const ranking = DataEngine.generateProblemsRanking(data);
    
    const labels = ranking.map(item => item.name);
    const counts = ranking.map(item => item.count);
    const severities = ranking.map(item => item.avgSeverity);
    
    return {
        labels,
        datasets: [
            {
                label: 'Frecuencia',
                data: counts,
                backgroundColor: 'rgba(255, 152, 0, 0.7)',
                borderColor: '#FF9800',
                borderWidth: 2,
                yAxisID: 'y'
            },
            {
                label: 'Severidad Promedio',
                data: severities,
                backgroundColor: 'rgba(244, 67, 54, 0.7)',
                borderColor: '#F44336',
                borderWidth: 2,
                type: 'line',
                yAxisID: 'y1'
            }
        ]
    };
}

/**
 * Genera datos para segmentación de negocios
 */
function prepareBusinessSegments(data) {
    const segments = DataEngine.segmentBusinessesByProfile(data);
    
    const labels = Object.keys(segments);
    const counts = labels.map(label => segments[label].length);
    const percentages = counts.map(count => 
        ((count / data.length) * 100).toFixed(1)
    );
    
    return {
        labels: labels.map((label, i) => `${label} (${percentages[i]}%)`),
        data: counts,
        segments: segments  // Datos completos para drill-down
    };
}

/**
 * Prepara KPIs globales para cards
 */
function prepareGlobalKPIs(data) {
    // Calcular scores promedio
    const avgScores = {
        digitalMaturity: 0,
        operationalRisk: 0,
        techAdoptionReadiness: 0,
        scalabilityReadiness: 0
    };
    
    data.forEach(business => {
        const scores = DataEngine.calculateAllScores(business);
        Object.keys(avgScores).forEach(key => {
            avgScores[key] += scores[key];
        });
    });
    
    Object.keys(avgScores).forEach(key => {
        avgScores[key] = Math.round(avgScores[key] / data.length);
    });
    
    // Calcular distribuciones clave
    const digitalizationDist = DataEngine.calculateDistribution(
        data, 
        'nivelDigitalizacion',
        encuestaOpciones.nivelDigitalizacion.options
    );
    
    const aperturaDist = DataEngine.calculateDistribution(
        data,
        'aperturaTecnologica',
        encuestaOpciones.aperturaTecnologica.options
    );
    
    return {
        totalBusinesses: data.length,
        avgScores,
        digitalizationDist,
        aperturaDist,
        // Métricas derivadas
        highRiskCount: data.filter(b => {
            const scores = DataEngine.calculateAllScores(b);
            return scores.operationalRisk >= 70;
        }).length,
        readyForTechCount: data.filter(b => {
            const scores = DataEngine.calculateAllScores(b);
            return scores.techAdoptionReadiness >= 60;
        }).length
    };
}

// Exportar funciones
window.VisualizationHelpers = {
    prepareBarChartData,
    prepareDoughnutChartData,
    prepareHorizontalBarData,
    prepareGroupedBarData,
    prepareScoresTable,
    prepareProblemsRanking,
    prepareBusinessSegments,
    prepareGlobalKPIs
};
