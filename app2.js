// ==================== VARIABLES GLOBALES ====================
let rawCSVData = [];
let normalizedData = [];
let filteredData = [];
let allCharts = {};

// ==================== PARTÍCULAS CANVAS ====================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 80;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = 'rgba(0, 230, 118, 0.15)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==================== NAVEGACIÓN DE PESTAÑAS ====================
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = item.getAttribute('data-tab');
        
        // Actualizar nav items
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Actualizar tabs
        tabContents.forEach(tab => tab.classList.remove('active'));
        document.getElementById(`tab-${targetTab}`).classList.add('active');
        
        // Actualizar gráficas de la pestaña activa
        updateActiveTabCharts(targetTab);
    });
});

// ==================== CARGA DE DATOS ====================
function loadDefaultCSV() {
    fetch('respuestas.csv')
        .then(response => response.text())
        .then(csv => parseCSV(csv))
        .catch(error => {
            console.error('Error al cargar CSV:', error);
            document.getElementById('total-businesses').textContent = 'Error al cargar datos';
        });
}

function parseCSV(csvText) {
    Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: function(results) {
            rawCSVData = results.data;
            console.log('CSV cargado:', rawCSVData.length, 'filas');
            
            // Procesar con DataEngine
            normalizedData = DataEngine.processRawCSV(rawCSVData);
            console.log('Datos normalizados:', normalizedData.length, 'negocios');
            console.log('Ejemplo de negocio normalizado:', normalizedData[0]);
            
            filteredData = [...normalizedData];
            
            // Poblar filtros
            populateFilters();
            
            // Actualizar dashboard
            updateAllDashboard();
        }
    });
}

// ==================== FILTROS ====================
function populateFilters() {
    const filterType = document.getElementById('filter-type');
    const filterSize = document.getElementById('filter-size');
    
    // Tipos de negocio únicos
    const types = [...new Set(normalizedData.map(b => b.tipoNegocio).filter(Boolean))];
    filterType.innerHTML = '<option value="all">Todas las industrias</option>';
    types.forEach(type => {
        filterType.innerHTML += `<option value="${type}">${type}</option>`;
    });
    
    // Tamaños únicos
    const sizes = [...new Set(normalizedData.map(b => b.tamanoNegocio).filter(Boolean))];
    filterSize.innerHTML = '<option value="all">Todos los tamaños</option>';
    sizes.forEach(size => {
        filterSize.innerHTML += `<option value="${size}">${size}</option>`;
    });
}

document.getElementById('apply-filters').addEventListener('click', applyFilters);
document.getElementById('reset-filters').addEventListener('click', resetFilters);

function applyFilters() {
    const selectedType = document.getElementById('filter-type').value;
    const selectedSize = document.getElementById('filter-size').value;
    
    filteredData = normalizedData.filter(business => {
        const matchesType = selectedType === 'all' || business.tipoNegocio === selectedType;
        const matchesSize = selectedSize === 'all' || business.tamanoNegocio === selectedSize;
        return matchesType && matchesSize;
    });
    
    updateAllDashboard();
}

function resetFilters() {
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-size').value = 'all';
    filteredData = [...normalizedData];
    updateAllDashboard();
}

// ==================== ACTUALIZACIÓN GENERAL ====================
function updateAllDashboard() {
    updateDataStatus();
    updateActiveTabCharts(getCurrentTab());
}

function updateDataStatus() {
    const count = filteredData.length;
    document.getElementById('total-businesses').textContent = `${count} negocios analizados`;
}

function getCurrentTab() {
    const activeNav = document.querySelector('.nav-item.active');
    return activeNav ? activeNav.getAttribute('data-tab') : 'panorama';
}

function updateActiveTabCharts(tabName) {
    switch(tabName) {
        case 'panorama':
            updatePanoramaTab();
            break;
        case 'operacion':
            updateOperacionTab();
            break;
        case 'tecnologia':
            updateTecnologiaTab();
            break;
        case 'decisiones':
            updateDecisionesTab();
            break;
        case 'oportunidades':
            updateOportunidadesTab();
            break;
    }
}

// ==================== TAB 1: PANORAMA GENERAL ====================
function updatePanoramaTab() {
    if (!filteredData || filteredData.length === 0) {
        console.warn('No hay datos filtrados para actualizar Panorama');
        return;
    }
    
    // KPIs globales
    const globalKPIs = VisualizationHelpers.prepareGlobalKPIs(filteredData);
    document.getElementById('kpi-digital-maturity').textContent = (globalKPIs.avgScores.digitalMaturity || 0).toFixed(1) + '/100';
    document.getElementById('kpi-operational-risk').textContent = (globalKPIs.avgScores.operationalRisk || 0).toFixed(1) + '/100';
    document.getElementById('kpi-tech-adoption').textContent = (globalKPIs.avgScores.techAdoptionReadiness || 0).toFixed(1) + '/100';
    document.getElementById('kpi-scalability').textContent = (globalKPIs.avgScores.scalabilityReadiness || 0).toFixed(1) + '/100';
    
    // Trends (opcional - aquí puedes comparar con promedios históricos)
    document.getElementById('kpi-digital-trend').textContent = interpretScore(globalKPIs.avgScores.digitalMaturity || 0);
    document.getElementById('kpi-risk-trend').textContent = interpretScore(100 - (globalKPIs.avgScores.operationalRisk || 0));
    document.getElementById('kpi-adoption-trend').textContent = interpretScore(globalKPIs.avgScores.techAdoptionReadiness || 0);
    document.getElementById('kpi-scalability-trend').textContent = interpretScore(globalKPIs.avgScores.scalabilityReadiness || 0);
    
    // Gráfica: Madurez Digital por Industria
    const maturityByIndustry = DataEngine.calculateAverageByDimension(filteredData, 'tipoNegocio', 'digitalMaturity');
    updateBarChart('chart-maturity-by-industry', maturityByIndustry, 'Madurez Digital Promedio');
    
    // Gráfica: Distribución de Madurez (nivel digitalización 1-5)
    const maturityDist = DataEngine.calculateDistribution(
        filteredData, 
        'nivelDigitalizacion', 
        encuestaOpciones.nivelDigitalizacion.options
    );
    updateDoughnutChart('chart-maturity-distribution', convertDistributionToChartData(maturityDist));
    
    // Gráfica: Comparativo de Scores por Tamaño
    const scoresBySize = calculateScoresBySize(filteredData);
    updateGroupedBarChart('chart-scores-by-size', scoresBySize);
    
    // Gráfica: Herramientas Digitales
    const toolsAdoption = DataEngine.calculateDistribution(
        filteredData,
        'herramientasDigitales',
        encuestaOpciones.herramientasDigitales.options
    );
    updateHorizontalBarChart('chart-tools-adoption', convertDistributionToChartData(toolsAdoption));
}

function interpretScore(score) {
    if (score >= 70) return '🟢 Excelente';
    if (score >= 50) return '🟡 Bueno';
    if (score >= 30) return '🟠 Regular';
    return '🔴 Bajo';
}

function convertDistributionToChartData(distribution) {
    return {
        labels: Object.keys(distribution),
        values: Object.values(distribution)
    };
}

function calculateScoresBySize(data) {
    const sizes = [...new Set(data.map(b => b.tamanoNegocio).filter(Boolean))];
    const scores = ['digitalMaturity', 'operationalRisk', 'techAdoptionReadiness', 'scalabilityReadiness'];
    const scoreLabels = ['Madurez Digital', 'Riesgo Operativo', 'Disposición Tech', 'Escalabilidad'];
    
    const datasets = scores.map((scoreKey, idx) => {
        return {
            label: scoreLabels[idx],
            data: sizes.map(size => {
                const businesses = data.filter(b => b.tamanoNegocio === size);
                const avg = businesses.reduce((sum, b) => sum + (b.scores[scoreKey] || 0), 0) / businesses.length;
                return avg.toFixed(1);
            })
        };
    });
    
    return { labels: sizes, datasets };
}

// ==================== TAB 2: OPERACIÓN Y DOLOR ====================
function updateOperacionTab() {
    if (!filteredData || filteredData.length === 0) return;
    
    // Alerta de alto riesgo
    const highRiskBusinesses = filteredData.filter(b => b.scores && b.scores.operationalRisk >= 70);
    document.getElementById('high-risk-count').textContent = `${highRiskBusinesses.length} negocios`;
    
    // Ranking de problemas
    const problemsRanking = DataEngine.generateProblemsRanking(filteredData);
    updateProblemsChart('chart-problems-ranking', problemsRanking);
    
    // Distribución de riesgo operativo
    const riskDistribution = createScoreDistribution(filteredData, 'operationalRisk');
    updateDoughnutChart('chart-operational-risk', riskDistribution);
    
    // Procesos manuales vs digitales
    const processesStatus = calculateProcessesBySize(filteredData);
    updateStackedBarChart('chart-processes-status', processesStatus);
    
    // Dependencia tecnológica
    const techDependency = DataEngine.calculateDistribution(
        filteredData,
        'riesgoSalidaResponsableTI',
        encuestaOpciones.riesgoSalidaResponsableTI.options
    );
    updateDoughnutChart('chart-tech-dependency', convertDistributionToChartData(techDependency));
    
    // Tabla de alto riesgo
    updateHighRiskTable(highRiskBusinesses);
}

function createScoreDistribution(data, scoreKey) {
    const ranges = [
        { label: 'Bajo (0-30)', min: 0, max: 30, count: 0 },
        { label: 'Medio (31-60)', min: 31, max: 60, count: 0 },
        { label: 'Alto (61-80)', min: 61, max: 80, count: 0 },
        { label: 'Crítico (81-100)', min: 81, max: 100, count: 0 }
    ];
    
    data.forEach(business => {
        const score = (business.scores && business.scores[scoreKey]) || 0;
        const range = ranges.find(r => score >= r.min && score <= r.max);
        if (range) range.count++;
    });
    
    return {
        labels: ranges.map(r => r.label),
        values: ranges.map(r => r.count)
    };
}

function calculateProcessesBySize(data) {
    const sizes = [...new Set(data.map(b => b.tamanoNegocio).filter(Boolean))];
    
    const datasets = [
        {
            label: 'Procesos Digitales',
            data: sizes.map(size => {
                const businesses = data.filter(b => b.tamanoNegocio === size);
                return businesses.filter(b => b.gestionProcesos === 'Mayormente digital' || b.gestionProcesos === 'Completamente digital').length;
            }),
            backgroundColor: 'rgba(0, 230, 118, 0.8)'
        },
        {
            label: 'Procesos Manuales',
            data: sizes.map(size => {
                const businesses = data.filter(b => b.tamanoNegocio === size);
                return businesses.filter(b => b.gestionProcesos === 'Completamente manual' || b.gestionProcesos === 'Mayormente manual').length;
            }),
            backgroundColor: 'rgba(239, 68, 68, 0.8)'
        },
        {
            label: 'Mixto',
            data: sizes.map(size => {
                const businesses = data.filter(b => b.tamanoNegocio === size);
                return businesses.filter(b => b.gestionProcesos === 'Mixto (manual y digital)').length;
            }),
            backgroundColor: 'rgba(245, 158, 11, 0.8)'
        }
    ];
    
    return { labels: sizes, datasets };
}

function updateHighRiskTable(businesses) {
    const container = document.getElementById('high-risk-table');
    if (businesses.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6B7280; padding: 20px;">No hay negocios en alto riesgo</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Negocio</th>
                    <th>Tipo</th>
                    <th>Tamaño</th>
                    <th>Riesgo</th>
                    <th>Principales Problemas</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    businesses.forEach(b => {
        const topProblems = b.problemasOperativos ? b.problemasOperativos.slice(0, 2).join(', ') : 'N/A';
        html += `
            <tr>
                <td><strong>${b.nombreNegocio || 'Sin nombre'}</strong></td>
                <td>${b.tipoNegocio || 'N/A'}</td>
                <td>${b.tamanoNegocio || 'N/A'}</td>
                <td><span class="score-badge score-high">${(b.scores.operationalRisk || 0).toFixed(1)}</span></td>
                <td>${topProblems}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ==================== TAB 3: TECNOLOGÍA Y ADOPCIÓN ====================
function updateTecnologiaTab() {
    if (!filteredData || filteredData.length === 0) return;
    
    // Stats rápidos
    const techReady = filteredData.filter(b => b.scores && b.scores.techAdoptionReadiness >= 60).length;
    document.getElementById('stat-tech-ready').textContent = techReady;
    
    const barriersCount = DataEngine.calculateDistribution(
        filteredData,
        'barrerasTecnologicas',
        encuestaOpciones.barrerasTecnologicas.options
    );
    const barriersChartData = convertDistributionToChartData(barriersCount);
    const topBarrier = barriersChartData.labels[barriersChartData.values.indexOf(Math.max(...barriersChartData.values))];
    document.getElementById('stat-barriers').textContent = topBarrier || 'N/A';
    
    const googleReady = filteredData.filter(b => 
        b.preparacionGoogleIA === 'Muy preparados' || 
        b.preparacionGoogleIA === 'Algo preparados'
    ).length;
    document.getElementById('stat-google-ready').textContent = `${googleReady}/${filteredData.length}`;
    
    // Gráficas
    const techOpenness = DataEngine.calculateDistribution(
        filteredData,
        'aperturaTecnologica',
        encuestaOpciones.aperturaTecnologica.options
    );
    updateDoughnutChart('chart-tech-openness', convertDistributionToChartData(techOpenness));
    
    updateHorizontalBarChart('chart-tech-barriers', barriersChartData);
    
    const learningCapacity = DataEngine.calculateDistribution(
        filteredData,
        'capacidadAprendizajeEquipo',
        encuestaOpciones.capacidadAprendizajeEquipo.options
    );
    updateDoughnutChart('chart-learning-capacity', convertDistributionToChartData(learningCapacity));
    
    const googleReadiness = DataEngine.calculateDistribution(
        filteredData,
        'preparacionGoogleIA',
        encuestaOpciones.preparacionGoogleIA.options
    );
    updateDoughnutChart('chart-google-readiness', convertDistributionToChartData(googleReadiness));
    
    const adoptionByIndustry = DataEngine.calculateAverageByDimension(
        filteredData,
        'tipoNegocio',
        'techAdoptionReadiness'
    );
    updateBarChart('chart-adoption-by-industry', adoptionByIndustry, 'Tech Adoption Score');
}

// ==================== TAB 4: DECISIONES Y DATOS ====================
function updateDecisionesTab() {
    if (!filteredData || filteredData.length === 0) return;
    
    const dataUsage = DataEngine.calculateDistribution(
        filteredData,
        'usoDatosDigitales',
        encuestaOpciones.usoDatosDigitales.options
    );
    updateBarChart('chart-data-usage', dataUsage, 'Uso de Datos');
    
    const decisionCriteria = DataEngine.calculateDistribution(
        filteredData,
        'criteriosDecisiones',
        encuestaOpciones.criteriosDecisiones.options
    );
    updateDoughnutChart('chart-decision-criteria', convertDistributionToChartData(decisionCriteria));
    
    const kpisUsed = DataEngine.calculateDistribution(
        filteredData,
        'indicadoresUtilizados',
        encuestaOpciones.indicadoresUtilizados.options
    );
    updateHorizontalBarChart('chart-kpis-used', convertDistributionToChartData(kpisUsed));
    
    const kpiTracking = DataEngine.calculateDistribution(
        filteredData,
        'seguimientoIndicadores',
        encuestaOpciones.seguimientoIndicadores.options
    );
    updateDoughnutChart('chart-kpi-tracking', convertDistributionToChartData(kpiTracking));
    
    const processDoc = DataEngine.calculateDistribution(
        filteredData,
        'documentacionProcesos',
        encuestaOpciones.documentacionProcesos.options
    );
    updateDoughnutChart('chart-process-documentation', convertDistributionToChartData(processDoc));
    
    const clientOrigin = DataEngine.calculateDistribution(
        filteredData,
        'origenClientes',
        encuestaOpciones.origenClientes.options
    );
    updateDoughnutChart('chart-client-origin', convertDistributionToChartData(clientOrigin));
}

// ==================== TAB 5: OPORTUNIDADES ====================
function updateOportunidadesTab() {
    if (!filteredData || filteredData.length === 0) return;
    
    const segments = DataEngine.segmentBusinessesByProfile(filteredData);
    
    // Actualizar contadores de segmentos
    document.getElementById('segment-leaders-count').textContent = segments['Digital Leaders'].length;
    document.getElementById('segment-ready-count').textContent = segments['Tech Ready'].length;
    document.getElementById('segment-risk-count').textContent = segments['High Risk'].length;
    document.getElementById('segment-growth-count').textContent = segments['Growth Potential'].length;
    document.getElementById('segment-traditional-count').textContent = segments['Traditional'].length;
    
    // Recomendaciones automáticas
    generateRecommendations(segments);
    
    // Quick wins
    generateQuickWins(segments);
    
    // Proyectos estructurales
    generateStructuralProjects(segments);
    
    // Tabla detallada
    generateBusinessesDetailTable(filteredData);
}

function generateRecommendations(segments) {
    const container = document.getElementById('recommendations-container');
    const recommendations = [];
    
    if (segments['Tech Ready'].length > 0) {
        recommendations.push({
            title: '⚡ Quick Wins Identificados',
            text: `${segments['Tech Ready'].length} negocios con alta disposición tecnológica pero baja madurez digital. Oportunidad para soluciones simples con ROI rápido.`,
            priority: 'Alta'
        });
    }
    
    if (segments['High Risk'].length > 0) {
        recommendations.push({
            title: '🚨 Atención Urgente',
            text: `${segments['High Risk'].length} negocios en alto riesgo operativo. Requieren automatización prioritaria de procesos críticos.`,
            priority: 'Crítica'
        });
    }
    
    if (segments['Growth Potential'].length > 0) {
        recommendations.push({
            title: '📈 Potencial de Escalabilidad',
            text: `${segments['Growth Potential'].length} negocios preparados para crecer. Implementar soluciones que soporten expansión.`,
            priority: 'Media'
        });
    }
    
    if (segments['Digital Leaders'].length > 0) {
        recommendations.push({
            title: '🏆 Casos de Éxito',
            text: `${segments['Digital Leaders'].length} líderes digitales. Usar como casos de estudio para convencer a negocios tradicionales.`,
            priority: 'Estratégica'
        });
    }
    
    container.innerHTML = recommendations.map(r => `
        <div class="recommendation-card">
            <div class="recommendation-title">${r.title}</div>
            <div class="recommendation-text">${r.text}</div>
            <span class="recommendation-priority">Prioridad: ${r.priority}</span>
        </div>
    `).join('');
}

function generateQuickWins(segments) {
    const container = document.getElementById('quick-wins-list');
    const wins = [
        { title: 'Google Business Profile', desc: 'Mejorar visibilidad en búsquedas locales' },
        { title: 'WhatsApp Business', desc: 'Automatizar respuestas y catálogo digital' },
        { title: 'Redes Sociales', desc: 'Presencia digital básica con Meta Business Suite' },
        { title: 'Google Sheets', desc: 'Control de inventario y ventas compartido' },
        { title: 'Canva', desc: 'Material de marketing profesional sin diseñador' }
    ];
    
    container.innerHTML = wins.map(w => `
        <div class="win-item">
            <strong>${w.title}</strong> - ${w.desc}
        </div>
    `).join('');
}

function generateStructuralProjects(segments) {
    const container = document.getElementById('structural-projects-list');
    const projects = [
        { title: 'CRM Implementación', desc: 'Sistema de gestión de clientes completo' },
        { title: 'E-commerce Platform', desc: 'Tienda en línea con pasarela de pagos' },
        { title: 'ERP Básico', desc: 'Integración de procesos operativos' },
        { title: 'BI Dashboard', desc: 'Reportes automáticos y análisis de datos' },
        { title: 'Automatización Procesos', desc: 'Workflows digitales para operaciones repetitivas' }
    ];
    
    container.innerHTML = projects.map(p => `
        <div class="project-item">
            <strong>${p.title}</strong> - ${p.desc}
        </div>
    `).join('');
}

function generateBusinessesDetailTable(data) {
    const container = document.getElementById('businesses-detail-table');
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Negocio</th>
                    <th>Tipo</th>
                    <th>Tamaño</th>
                    <th>Digital</th>
                    <th>Riesgo</th>
                    <th>Adoption</th>
                    <th>Escalabilidad</th>
                    <th>Perfil</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(b => {
        const profile = getBusinessProfile(b);
        html += `
            <tr>
                <td><strong>${b.nombreNegocio || 'Sin nombre'}</strong></td>
                <td>${b.tipoNegocio || 'N/A'}</td>
                <td>${b.tamanoNegocio || 'N/A'}</td>
                <td><span class="score-badge ${getScoreClass(b.scores.digitalMaturity)}">${(b.scores.digitalMaturity || 0).toFixed(1)}</span></td>
                <td><span class="score-badge ${getScoreClass(100 - b.scores.operationalRisk)}">${(b.scores.operationalRisk || 0).toFixed(1)}</span></td>
                <td><span class="score-badge ${getScoreClass(b.scores.techAdoptionReadiness)}">${(b.scores.techAdoptionReadiness || 0).toFixed(1)}</span></td>
                <td><span class="score-badge ${getScoreClass(b.scores.scalabilityReadiness)}">${(b.scores.scalabilityReadiness || 0).toFixed(1)}</span></td>
                <td>${profile}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function getBusinessProfile(business) {
    const s = business.scores;
    if (!s) return '📚 Traditional';
    if (s.digitalMaturity >= 70 && s.techAdoptionReadiness >= 70) return '🏆 Digital Leader';
    if (s.digitalMaturity < 50 && s.techAdoptionReadiness >= 60) return '⚡ Tech Ready';
    if (s.operationalRisk >= 70) return '🚨 High Risk';
    if (s.scalabilityReadiness >= 70) return '📈 Growth Potential';
    return '📚 Traditional';
}

function getScoreClass(score) {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
}

// ==================== FUNCIONES DE GRÁFICAS ====================
function updateBarChart(chartId, data, label) {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    if (allCharts[chartId]) {
        allCharts[chartId].destroy();
    }
    
    allCharts[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels || Object.keys(data),
            datasets: [{
                label: label,
                data: data.values || Object.values(data),
                backgroundColor: 'rgba(0, 230, 118, 0.8)',
                borderColor: 'rgba(0, 230, 118, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateDoughnutChart(chartId, data) {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    if (allCharts[chartId]) {
        allCharts[chartId].destroy();
    }
    
    const colors = [
        'rgba(0, 230, 118, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)'
    ];
    
    allCharts[chartId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: colors.slice(0, data.labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 15 }
                }
            }
        }
    });
}

function updateHorizontalBarChart(chartId, data) {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    if (allCharts[chartId]) {
        allCharts[chartId].destroy();
    }
    
    allCharts[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

function updateGroupedBarChart(chartId, data) {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    if (allCharts[chartId]) {
        allCharts[chartId].destroy();
    }
    
    const colors = [
        'rgba(0, 230, 118, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)'
    ];
    
    const datasets = data.datasets.map((ds, idx) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor || colors[idx],
        borderWidth: 2,
        borderColor: ds.borderColor || colors[idx].replace('0.8', '1')
    }));
    
    allCharts[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { padding: 15 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateStackedBarChart(chartId, data) {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    if (allCharts[chartId]) {
        allCharts[chartId].destroy();
    }
    
    allCharts[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: data.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { padding: 15 }
                }
            },
            scales: {
                x: { stacked: true },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
}

function updateProblemsChart(chartId, problems) {
    const topProblems = problems.slice(0, 8);
    updateHorizontalBarChart(chartId, {
        labels: topProblems.map(p => p.problema),
        values: topProblems.map(p => p.score)
    });
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    loadDefaultCSV();
});
