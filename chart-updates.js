/**
 * =============================================================================
 * CHART UPDATES - FUNCIONES DE ACTUALIZACIÓN DE GRÁFICAS
 * =============================================================================
 * 
 * Usa datos normalizados de DataEngine y VisualizationHelpers
 */

// ==========================================
// GRÁFICA: TECNOLOGÍA UTILIZADA
// ==========================================
function updateTechnologyChart() {
    const ctx = document.getElementById('chart-technology');
    
    const distribution = DataEngine.calculateDistribution(
        filteredData,
        'herramientasDigitales',
        encuestaOpciones.herramientasDigitales.options
    );
    
    const chartData = VisualizationHelpers.prepareHorizontalBarData(
        distribution,
        encuestaOpciones.herramientasDigitales.options
    );
    
    if (charts.technology) {
        charts.technology.destroy();
    }
    
    charts.technology = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Uso de Tecnología',
                data: chartData.data,
                backgroundColor: chartData.colors,
                borderColor: '#00E676',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.x} negocios`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#E0E0E0' },
                    ticks: { color: '#666666', precision: 0 }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#666666' }
                }
            }
        }
    });
}

// ==========================================
// GRÁFICA: GESTIÓN DE PROCESOS
// ==========================================
function updateProcessesChart() {
    const ctx = document.getElementById('chart-processes');
    
    // Agrupar por tamaño
    const sizes = encuestaOpciones.tamanoNegocio.options;
    const processLevels = encuestaOpciones.gestionOperacion.options;
    
    const processData = {};
    sizes.forEach(size => {
        processData[size] = {
            'Manual': 0,
            'Digital basica': 0,
            'Digital automatizada': 0
        };
    });
    
    filteredData.forEach(business => {
        const size = business.tamanoNegocio || 'Sin especificar';
        if (!processData[size]) return;
        
        const procesos = [
            business.gestionReservaciones,
            business.gestionPagos,
            business.gestionInventarios,
            business.gestionFacturacion,
            business.gestionAtencionClientes
        ];
        
        procesos.forEach(proceso => {
            if (proceso && processData[size][proceso] !== undefined) {
                processData[size][proceso]++;
            }
        });
    });
    
    const chartData = VisualizationHelpers.prepareGroupedBarData(
        processData,
        sizes,
        processLevels
    );
    
    if (charts.processes) {
        charts.processes.destroy();
    }
    
    charts.processes = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#666666' }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { color: '#666666' }
                },
                y: {
                    stacked: true,
                    grid: { color: '#E0E0E0' },
                    ticks: { color: '#666666', precision: 0 }
                }
            }
        }
    });
}

// ==========================================
// GRÁFICA: ORIGEN DE CLIENTES
// ==========================================
function updateClientOriginChart() {
    const ctx = document.getElementById('chart-client-origin');
    
    const distribution = DataEngine.calculateDistribution(
        filteredData,
        'origenClientes',
        encuestaOpciones.origenClientes.options
    );
    
    const chartData = VisualizationHelpers.prepareDoughnutChartData(
        distribution,
        encuestaOpciones.origenClientes.options
    );
    
    if (charts.clientOrigin) {
        charts.clientOrigin.destroy();
    }
    
    charts.clientOrigin = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: chartData.colors,
                borderColor: '#FFFFFF',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#666666',
                        padding: 15,
                        font: { size: 13 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ==========================================
// GRÁFICA: PREPARACIÓN DIGITAL
// ==========================================
function updateDigitalReadinessChart() {
    const ctx = document.getElementById('chart-digital-readiness');
    
    const distribution = DataEngine.calculateDistribution(
        filteredData,
        'preparacionGoogleChatGPT',
        encuestaOpciones.preparacionGoogleChatGPT.options
    );
    
    const chartData = VisualizationHelpers.prepareBarChartData(
        distribution,
        encuestaOpciones.preparacionGoogleChatGPT.options
    );
    
    if (charts.digitalReadiness) {
        charts.digitalReadiness.destroy();
    }
    
    charts.digitalReadiness = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Nivel de Preparación',
                data: chartData.data,
                backgroundColor: chartData.colors,
                borderColor: '#00E676',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#E0E0E0' },
                    ticks: { color: '#666666', precision: 0 }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#666666' }
                }
            }
        }
    });
}

// ==========================================
// TABLA RESUMEN CON SCORES
// ==========================================
function updateSummaryTable() {
    const tbody = document.getElementById('summary-table-body');
    
    const scoresData = VisualizationHelpers.prepareScoresTable(
        filteredData,
        'digitalMaturity'
    );
    
    let html = '';
    scoresData.forEach(row => {
        const scores = row.allScores;
        
        // Badge de nivel digital
        const digitalClass = scores.digitalMaturity >= 70 ? 'high' : 
                            scores.digitalMaturity >= 40 ? 'medium' : 'low';
        
        // Identificar oportunidad principal
        let oportunidad = 'Mantener';
        if (scores.operationalRisk >= 70) {
            oportunidad = 'Reducir riesgo operativo';
        } else if (scores.techAdoptionReadiness >= 60 && scores.digitalMaturity < 50) {
            oportunidad = 'Adopción tecnológica';
        } else if (scores.scalabilityReadiness < 40) {
            oportunidad = 'Mejorar escalabilidad';
        }
        
        html += `
            <tr>
                <td>${row.nombre}</td>
                <td>${row.tipo || 'N/A'}</td>
                <td>${row.tamano || 'N/A'}</td>
                <td><span class="badge badge-${digitalClass}">${scores.digitalMaturity}</span></td>
                <td>${oportunidad}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="5">No hay datos disponibles</td></tr>';
}

// ==========================================
// MENSAJE DE VISIBILIDAD
// ==========================================
function updateVisibilityMessage() {
    const visibilityEl = document.getElementById('visibility-message');
    
    const distribution = DataEngine.calculateDistribution(
        filteredData,
        'visibilidadInternet',
        encuestaOpciones.visibilidadInternet.options
    );
    
    const poorVisibility = (distribution['No aparecemos'] || 0) + 
                          (distribution['Solo redes sociales basicas'] || 0);
    
    const total = filteredData.length;
    const percentage = total > 0 ? Math.round((poorVisibility / total) * 100) : 0;
    
    visibilityEl.innerHTML = `
        <p class="visibility-stat">${percentage}% de los negocios tiene <strong>baja visibilidad digital</strong></p>
        <p class="visibility-detail">
            Esto representa ${poorVisibility} de ${total} negocios que podrían beneficiarse de 
            estrategias de SEO, Google My Business y presencia en redes sociales.
        </p>
    `;
}

// ==========================================
// INSIGHTS GENERADOS
// ==========================================
function generateInsights() {
    const container = document.getElementById('insights-container');
    
    const kpis = VisualizationHelpers.prepareGlobalKPIs(filteredData);
    const insights = [];
    
    // Insight 1: Madurez digital
    insights.push({
        icon: '📊',
        title: 'Madurez Digital',
        text: `El nivel promedio de madurez digital es de ${kpis.avgScores.digitalMaturity}/100. ${
            kpis.avgScores.digitalMaturity < 50 
            ? 'Hay una oportunidad significativa de digitalización.'
            : 'Los negocios muestran buen nivel de adopción digital.'
        }`
    });
    
    // Insight 2: Riesgo operativo
    insights.push({
        icon: '⚠️',
        title: 'Riesgo Operativo',
        text: `${kpis.highRiskCount} negocio(s) presentan alto riesgo operativo (score ≥70). Priorizar soluciones de automatización y documentación de procesos.`
    });
    
    // Insight 3: Apertura tecnológica
    insights.push({
        icon: '🚀',
        title: 'Disposición a Tecnología',
        text: `${kpis.readyForTechCount} negocio(s) están listos para adoptar tecnología. Oportunidad para quick wins con soluciones sencillas.`
    });
    
    // Insight 4: Escalabilidad
    insights.push({
        icon: '📈',
        title: 'Capacidad de Escala',
        text: `Score promedio de escalabilidad: ${kpis.avgScores.scalabilityReadiness}/100. ${
            kpis.avgScores.scalabilityReadiness < 50
            ? 'Se requiere fortalecer procesos para crecimiento.'
            : 'Buena base para expansión con tecnología adecuada.'
        }`
    });
    
    let html = '';
    insights.forEach(insight => {
        html += `
            <div class="insight-card">
                <div class="insight-icon">${insight.icon}</div>
                <h3 class="insight-title">${insight.title}</h3>
                <p class="insight-text">${insight.text}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==========================================
// TARJETAS DE NEGOCIOS CON SCORES
// ==========================================
function updateBusinessCards() {
    const container = document.getElementById('business-cards-container');
    
    let html = '';
    filteredData.slice(0, 20).forEach(business => {
        const scores = DataEngine.calculateAllScores(business);
        
        // Determinar perfil
        let perfil = 'Traditional';
        if (scores.digitalMaturity >= 70 && scores.techAdoptionReadiness >= 70) {
            perfil = 'Digital Leader';
        } else if (scores.digitalMaturity < 50 && scores.techAdoptionReadiness >= 60) {
            perfil = 'Tech Ready';
        } else if (scores.operationalRisk >= 70) {
            perfil = 'High Risk';
        }
        
        html += `
            <div class="business-card">
                <div class="business-header">
                    <h3 class="business-name">${business.nombreNegocio || 'Sin nombre'}</h3>
                    <span class="business-type">${business.tipoNegocio || 'N/A'}</span>
                </div>
                <div class="business-info">
                    <div class="info-row">
                        <span class="info-label">Tamaño:</span>
                        <span class="info-value">${business.tamanoNegocio || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Perfil:</span>
                        <span class="info-value">${perfil}</span>
                    </div>
                </div>
                <div class="business-scores">
                    <div class="score-item">
                        <span class="score-label">Digital</span>
                        <span class="score-value">${scores.digitalMaturity}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Riesgo</span>
                        <span class="score-value score-risk">${scores.operationalRisk}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Adopción</span>
                        <span class="score-value">${scores.techAdoptionReadiness}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Escala</span>
                        <span class="score-value">${scores.scalabilityReadiness}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p>No hay datos disponibles</p>';
}

// Exportar funciones
window.ChartUpdates = {
    updateTechnologyChart,
    updateProcessesChart,
    updateClientOriginChart,
    updateDigitalReadinessChart,
    updateSummaryTable,
    updateVisibilityMessage,
    generateInsights,
    updateBusinessCards
};
