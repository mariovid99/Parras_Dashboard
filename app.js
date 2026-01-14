// ==========================================
// VARIABLES GLOBALES
// ==========================================
let rawData = [];
let filteredData = [];
let charts = {};

// Índices de columnas (basado en el CSV)
const COL = {
    ID: 0,
    NOMBRE_NEGOCIO: 8,
    TIPO_NEGOCIO: 11,
    TAMANO_NEGOCIO: 14,
    QUIEN_FRENTE: 17,
    HERRAMIENTAS_DIGITALES: 26,
    NIVEL_DIGITAL: 38,
    RESERVACION: 43,
    PAGOS: 45,
    INVENTARIOS: 48,
    FACTURACION: 50,
    ATENCION_CLIENTES: 52,
    DISPUESTO_TECNOLOGIA: 73,
    QUIEN_MANEJA_TEC: 77,
    COMO_LLEGAN_CLIENTES: 99,
    PREPARACION_BUSQUEDAS: 35
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initEventListeners();
    // Cargar automáticamente el CSV si existe
    loadDefaultCSV();
});

// ==========================================
// ANIMACIÓN DE PARTÍCULAS
// ==========================================
function initParticles() {
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
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = 'rgba(0, 230, 118, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.strokeStyle = `rgba(0, 230, 118, ${0.15 * (1 - distance / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function initEventListeners() {
    // Upload CSV
    document.getElementById('csv-upload').addEventListener('change', handleFileUpload);
    
    // Filtros
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateToSection(section);
        });
    });
}

// ==========================================
// CARGA DE CSV
// ==========================================
function loadDefaultCSV() {
    // Intentar cargar el CSV por defecto
    fetch('diagnostico.csv')
        .then(response => response.text())
        .then(csvText => {
            parseCSV(csvText);
        })
        .catch(error => {
            console.log('No se encontró CSV por defecto. Esperando carga manual.');
        });
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target.result;
            parseCSV(csvText);
        };
        reader.readAsText(file, 'UTF-8');
    }
}

function parseCSV(csvText) {
    Papa.parse(csvText, {
        header: false, // Cambiar a false para obtener arrays
        skipEmptyLines: true,
        complete: (results) => {
            // La primera fila son los headers, el resto son datos
            const headers = results.data[0];
            rawData = results.data.slice(1); // Saltar el header
            filteredData = [...rawData];
            
            console.log('Datos cargados:', rawData.length, 'registros');
            
            populateFilters();
            updateDashboard();
        },
        error: (error) => {
            console.error('Error al parsear CSV:', error);
            alert('Error al leer el archivo CSV');
        }
    });
}

// ==========================================
// POBLACIÓN DE FILTROS
// ==========================================
function populateFilters() {
    // Tipo de Negocio
    const types = new Set();
    rawData.forEach(row => {
        const type = row[COL.TIPO_NEGOCIO];
        if (type) {
            type.split(';').forEach(t => {
                const cleaned = t.trim();
                if (cleaned) types.add(cleaned);
            });
        }
    });
    
    const typeSelect = document.getElementById('filter-type');
    typeSelect.innerHTML = '<option value="all">Todos</option>';
    Array.from(types).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
    
    // Tamaño del Negocio
    const sizes = new Set();
    rawData.forEach(row => {
        const size = row[COL.TAMANO_NEGOCIO];
        if (size) sizes.add(size.trim());
    });
    
    const sizeSelect = document.getElementById('filter-size');
    sizeSelect.innerHTML = '<option value="all">Todos</option>';
    Array.from(sizes).sort().forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });
    
    // Rol
    const roles = new Set();
    rawData.forEach(row => {
        const role = row[COL.QUIEN_FRENTE];
        if (role) roles.add(role.trim());
    });
    
    const roleSelect = document.getElementById('filter-role');
    roleSelect.innerHTML = '<option value="all">Todos</option>';
    Array.from(roles).sort().forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleSelect.appendChild(option);
    });
}

// ==========================================
// APLICAR FILTROS
// ==========================================
function applyFilters() {
    const typeValues = Array.from(document.getElementById('filter-type').selectedOptions).map(o => o.value);
    const sizeValues = Array.from(document.getElementById('filter-size').selectedOptions).map(o => o.value);
    const roleValues = Array.from(document.getElementById('filter-role').selectedOptions).map(o => o.value);
    
    filteredData = rawData.filter(row => {
        // Filtro tipo
        let typeMatch = typeValues.includes('all');
        if (!typeMatch && row[COL.TIPO_NEGOCIO]) {
            const types = row[COL.TIPO_NEGOCIO].split(';').map(t => t.trim());
            typeMatch = typeValues.some(tv => types.includes(tv));
        }
        
        // Filtro tamaño
        const sizeMatch = sizeValues.includes('all') || sizeValues.includes(row[COL.TAMANO_NEGOCIO]);
        
        // Filtro rol
        const roleMatch = roleValues.includes('all') || roleValues.includes(row[COL.QUIEN_FRENTE]);
        
        return typeMatch && sizeMatch && roleMatch;
    });
    
    updateDashboard();
}

function resetFilters() {
    document.getElementById('filter-type').selectedIndex = 0;
    document.getElementById('filter-size').selectedIndex = 0;
    document.getElementById('filter-role').selectedIndex = 0;
    filteredData = [...rawData];
    updateDashboard();
}

// ==========================================
// ACTUALIZACIÓN DEL DASHBOARD
// ==========================================
function updateDashboard() {
    updateResponseCount();
    updateDigitalizationChart();
    updateTechnologyChart();
    updateProcessesChart();
    updateSummaryTable();
    updateClientOriginChart();
    updateDigitalReadinessChart();
    updateVisibilityMessage();
    updateInsights();
    updateBusinessCards();
}

function updateResponseCount() {
    document.getElementById('total-responses').textContent = `${filteredData.length} respuestas`;
}

// ==========================================
// GRÁFICA: DIGITALIZACIÓN POR TIPO
// ==========================================
function updateDigitalizationChart() {
    const ctx = document.getElementById('chart-digitalization');
    
    // Agrupar por tipo de negocio
    const typeGroups = {};
    filteredData.forEach(row => {
        const types = row[COL.TIPO_NEGOCIO]?.split(';').map(t => t.trim()).filter(t => t) || ['Sin especificar'];
        const digitalField = row[COL.NIVEL_DIGITAL];
        let digitalScore = 0;
        if (digitalField) {
            const match = digitalField.toString().match(/(\d+)/);
            digitalScore = match ? parseInt(match[1]) : 0;
        }
        
        types.forEach(type => {
            if (!typeGroups[type]) typeGroups[type] = [];
            if (digitalScore > 0) {
                typeGroups[type].push(digitalScore);
            }
        });
    });
    
    // Calcular promedios
    const labels = Object.keys(typeGroups);
    const data = labels.map(type => {
        const scores = typeGroups[type];
        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });
    
    if (charts.digitalization) {
        charts.digitalization.destroy();
    }
    
    charts.digitalization = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nivel de Digitalización (1-5)',
                data: data,
                backgroundColor: 'rgba(0, 230, 118, 0.7)',
                borderColor: '#00E676',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    grid: {
                        color: '#E0E0E0'
                    },
                    ticks: {
                        color: '#666666'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            }
        }
    });
}

// ==========================================
// GRÁFICA: TECNOLOGÍA POR TIPO
// ==========================================
function updateTechnologyChart() {
    const ctx = document.getElementById('chart-technology');
    
    const techCategories = {
        'WhatsApp': 0,
        'Redes sociales': 0,
        'Office': 0,
        'Punto de Venta': 0,
        'Otros': 0
    };
    
    filteredData.forEach(row => {
        const tools = row[COL.HERRAMIENTAS_DIGITALES] || '';
        if (tools.toLowerCase().includes('whatsapp')) techCategories['WhatsApp']++;
        if (tools.toLowerCase().includes('redes sociales') || tools.toLowerCase().includes('instagram') || tools.toLowerCase().includes('facebook')) techCategories['Redes sociales']++;
        if (tools.toLowerCase().includes('office') || tools.toLowerCase().includes('excel')) techCategories['Office']++;
        if (tools.toLowerCase().includes('punto de venta') || tools.toLowerCase().includes('pos')) techCategories['Punto de Venta']++;
    });
    
    if (charts.technology) {
        charts.technology.destroy();
    }
    
    charts.technology = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(techCategories),
            datasets: [{
                label: 'Uso de Tecnología',
                data: Object.values(techCategories),
                backgroundColor: 'rgba(0, 230, 118, 0.7)',
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
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#E0E0E0'
                    },
                    ticks: {
                        color: '#666666'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            }
        }
    });
}

// ==========================================
// GRÁFICA: PROCESOS POR TAMAÑO
// ==========================================
function updateProcessesChart() {
    const ctx = document.getElementById('chart-processes');
    
    const sizeGroups = {};
    filteredData.forEach(row => {
        const size = row[COL.TAMANO_NEGOCIO] || 'Sin especificar';
        if (!sizeGroups[size]) {
            sizeGroups[size] = { manual: 0, digitalBasica: 0, digitalAvanzada: 0 };
        }
        
        // Analizar diferentes procesos
        const processes = [
            row[COL.RESERVACION],
            row[COL.PAGOS],
            row[COL.INVENTARIOS],
            row[COL.FACTURACION],
            row[COL.ATENCION_CLIENTES]
        ];
        
        processes.forEach(proc => {
            if (!proc) return;
            if (proc.toLowerCase().includes('manual')) sizeGroups[size].manual++;
            else if (proc.toLowerCase().includes('digital')) sizeGroups[size].digitalBasica++;
        });
    });
    
    const labels = Object.keys(sizeGroups);
    
    if (charts.processes) {
        charts.processes.destroy();
    }
    
    charts.processes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Manual',
                    data: labels.map(l => sizeGroups[l].manual),
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    borderRadius: 6
                },
                {
                    label: 'Digital Básica',
                    data: labels.map(l => sizeGroups[l].digitalBasica),
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderRadius: 6
                },
                {
                    label: 'Digital Avanzada',
                    data: labels.map(l => sizeGroups[l].digitalAvanzada),
                    backgroundColor: 'rgba(0, 230, 118, 0.7)',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        color: '#E0E0E0'
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            }
        }
    });
}

// ==========================================
// TABLA RESUMEN
// ==========================================
function updateSummaryTable() {
    const container = document.getElementById('summary-table');
    
    // Agrupar por tipo
    const typeGroups = {};
    filteredData.forEach(row => {
        const types = row[COL.TIPO_NEGOCIO]?.split(';').map(t => t.trim()).filter(t => t) || ['Sin especificar'];
        
        types.forEach(type => {
            if (!typeGroups[type]) {
                typeGroups[type] = {
                    digital: [],
                    preparacion: [],
                    control: []
                };
            }
            
            const digitalField = row[COL.NIVEL_DIGITAL];
            let digitalScore = 0;
            if (digitalField) {
                const match = digitalField.toString().match(/(\d+)/);
                digitalScore = match ? parseInt(match[1]) : 0;
            }
            if (digitalScore > 0) {
                typeGroups[type].digital.push(digitalScore);
            }
        });
    });
    
    // Generar tabla
    let html = '<table class="summary-table"><thead><tr>';
    html += '<th>Tipo de Negocio</th>';
    html += '<th>Score Global</th>';
    html += '<th>Mayor Oportunidad</th>';
    html += '</tr></thead><tbody>';
    
    Object.keys(typeGroups).forEach(type => {
        const scores = typeGroups[type].digital;
        const avgDigital = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const score = (avgDigital / 5 * 100).toFixed(0);
        
        let scoreClass = 'score-low';
        if (score >= 70) scoreClass = 'score-high';
        else if (score >= 40) scoreClass = 'score-medium';
        
        let oportunidad = 'Ordenar procesos';
        if (score < 40) oportunidad = 'Capacitación digital básica';
        else if (score < 70) oportunidad = 'Automatización y visibilidad';
        else oportunidad = 'Optimización avanzada';
        
        html += '<tr>';
        html += `<td><strong>${type}</strong></td>`;
        html += `<td><span class="score-badge ${scoreClass}">${score}%</span></td>`;
        html += `<td>${oportunidad}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ==========================================
// GRÁFICA: ORIGEN DE CLIENTES
// ==========================================
function updateClientOriginChart() {
    const ctx = document.getElementById('chart-client-origin');
    
    const origins = {
        'Boca a boca': 0,
        'WhatsApp / Mensajes': 0,
        'Redes sociales': 0,
        'Google': 0,
        'Plataformas digitales': 0
    };
    
    filteredData.forEach(row => {
        const origin = row[COL.COMO_LLEGAN_CLIENTES] || '';
        const originLower = origin.toLowerCase();
        
        if (originLower.includes('boca a boca') || originLower.includes('recomendación')) {
            origins['Boca a boca']++;
        }
        if (originLower.includes('whatsapp') || originLower.includes('mensajes')) {
            origins['WhatsApp / Mensajes']++;
        }
        if (originLower.includes('redes') || originLower.includes('social') || originLower.includes('instagram') || originLower.includes('facebook')) {
            origins['Redes sociales']++;
        }
        if (originLower.includes('google')) {
            origins['Google']++;
        }
        if (originLower.includes('plataforma') || (originLower.includes('digital') && !originLower.includes('whatsapp'))) {
            origins['Plataformas digitales']++;
        }
    });
    
    if (charts.clientOrigin) {
        charts.clientOrigin.destroy();
    }
    
    charts.clientOrigin = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(origins),
            datasets: [{
                data: Object.values(origins),
                backgroundColor: [
                    'rgba(0, 230, 118, 0.8)',
                    'rgba(0, 230, 118, 0.6)',
                    'rgba(0, 230, 118, 0.4)',
                    'rgba(0, 230, 118, 0.2)'
                ],
                borderColor: '#FFFFFF',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
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
    
    const readinessLevels = {
        'Muy preparados': 0,
        'Algo preparados': 0,
        'Poco preparados': 0,
        'Nada preparados': 0
    };
    
    filteredData.forEach(row => {
        const readiness = row[COL.PREPARACION_BUSQUEDAS] || '';
        if (readiness.toLowerCase().includes('muy')) readinessLevels['Muy preparados']++;
        else if (readiness.toLowerCase().includes('algo')) readinessLevels['Algo preparados']++;
        else if (readiness.toLowerCase().includes('poco')) readinessLevels['Poco preparados']++;
        else if (readiness.toLowerCase().includes('nada')) readinessLevels['Nada preparados']++;
    });
    
    if (charts.digitalReadiness) {
        charts.digitalReadiness.destroy();
    }
    
    charts.digitalReadiness = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(readinessLevels),
            datasets: [{
                label: 'Número de Negocios',
                data: Object.values(readinessLevels),
                backgroundColor: [
                    'rgba(0, 230, 118, 0.9)',
                    'rgba(0, 230, 118, 0.6)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(244, 67, 54, 0.7)'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#E0E0E0'
                    },
                    ticks: {
                        color: '#666666',
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666666'
                    }
                }
            }
        }
    });
}

// ==========================================
// MENSAJE DE VISIBILIDAD
// ==========================================
function updateVisibilityMessage() {
    const messageEl = document.getElementById('visibility-message');
    
    // Calcular estadísticas
    const bocaAboca = filteredData.filter(row => {
        const origin = row[COL.COMO_LLEGAN_CLIENTES] || '';
        return origin.toLowerCase().includes('boca a boca') || origin.toLowerCase().includes('recomendación');
    }).length;
    
    const total = filteredData.length;
    const percentage = total > 0 ? ((bocaAboca / total) * 100).toFixed(0) : 0;
    
    if (percentage > 60) {
        messageEl.textContent = `La región depende fuertemente de la recomendación boca a boca (${percentage}%), con una gran oportunidad de posicionamiento digital conjunto.`;
    } else if (percentage > 30) {
        messageEl.textContent = `El ${percentage}% de los clientes llegan por recomendación. Hay potencial para diversificar los canales digitales.`;
    } else {
        messageEl.textContent = `La región muestra buena diversificación en canales de adquisición. Oportunidad de optimizar estrategias digitales existentes.`;
    }
}

// ==========================================
// INSIGHTS ACCIONABLES
// ==========================================
function updateInsights() {
    const container = document.getElementById('insights-container');
    const insights = generateInsights();
    
    let html = '';
    insights.forEach(insight => {
        html += `
            <div class="insight-card">
                <div class="insight-icon">${insight.icon}</div>
                <p class="insight-text">${insight.text}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function generateInsights() {
    const insights = [];
    
    // Insight 1: Nivel de digitalización
    const avgDigital = filteredData.reduce((sum, row) => {
        const digitalField = row[COL.NIVEL_DIGITAL];
        let score = 0;
        if (digitalField) {
            const match = digitalField.toString().match(/(\d+)/);
            score = match ? parseInt(match[1]) : 0;
        }
        return sum + score;
    }, 0) / (filteredData.length || 1);
    
    if (avgDigital < 2.5) {
        insights.push({
            icon: '🎯',
            text: 'La mayor oportunidad está en ordenar procesos antes de automatizar. El nivel promedio de digitalización es bajo.'
        });
    } else if (avgDigital < 3.5) {
        insights.push({
            icon: '📈',
            text: 'Los negocios tienen bases digitales, pero necesitan avanzar hacia la automatización para escalar.'
        });
    } else {
        insights.push({
            icon: '🚀',
            text: 'Alto nivel de digitalización. La oportunidad está en optimizar y crear ventajas competitivas.'
        });
    }
    
    // Insight 2: Disposición a tecnología
    const dispuestos = filteredData.filter(row => {
        const disp = row[COL.DISPUESTO_TECNOLOGIA] || '';
        return disp.toLowerCase().includes('dispuesto') || disp.toLowerCase().includes('muy');
    }).length;
    
    const percentage = (dispuestos / (filteredData.length || 1)) * 100;
    
    if (percentage > 70) {
        insights.push({
            icon: '💡',
            text: `Existe alto interés en tecnología (${percentage.toFixed(0)}% dispuestos), pero se requiere capacitación práctica.`
        });
    } else {
        insights.push({
            icon: '⚠️',
            text: 'Se detecta resistencia al cambio tecnológico. Necesario mostrar casos de éxito locales.'
        });
    }
    
    // Insight 3: Dependencia tecnológica
    const soloUnaPersona = filteredData.filter(row => {
        const quien = row[COL.QUIEN_MANEJA_TEC] || '';
        return quien.toLowerCase().includes('yo') || quien.toLowerCase().includes('una persona');
    }).length;
    
    if (soloUnaPersona > filteredData.length * 0.5) {
        insights.push({
            icon: '👥',
            text: 'La tecnología depende de una sola persona en la mayoría de negocios. Riesgo operativo alto.'
        });
    }
    
    // Insight 4: Posicionamiento digital
    insights.push({
        icon: '🌐',
        text: 'Parras tiene potencial para posicionarse mejor como destino digital si se trabaja de forma colectiva.'
    });
    
    return insights;
}

// ==========================================
// TARJETAS DE NEGOCIOS
// ==========================================
function updateBusinessCards() {
    const container = document.getElementById('business-cards-container');
    
    let html = '';
    filteredData.slice(0, 20).forEach(row => {
        const name = row[COL.NOMBRE_NEGOCIO] || 'Sin nombre';
        const type = (row[COL.TIPO_NEGOCIO] || 'Sin especificar').split(';')[0].trim();
        const size = row[COL.TAMANO_NEGOCIO] || 'N/A';
        const digitalField = row[COL.NIVEL_DIGITAL];
        let digital = 'N/A';
        if (digitalField) {
            const match = digitalField.toString().match(/(\d+)/);
            digital = match ? match[1] : 'N/A';
        }
        
        const icon = getBusinessIcon(type);
        
        html += `
            <div class="business-card">
                <div class="business-card-header">
                    <div class="business-icon">${icon}</div>
                    <div>
                        <div class="business-name">${name}</div>
                        <div style="font-size: 12px; color: #666;">${type}</div>
                    </div>
                </div>
                <div class="business-stats">
                    <div class="stat-item">
                        <span class="stat-label">Tamaño</span>
                        <span class="stat-value" style="font-size: 14px; color: #1A1F3A;">${size}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Digital</span>
                        <span class="stat-value">${digital}/5</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="color: #666; text-align: center; padding: 40px;">No hay datos para mostrar</p>';
}

function getBusinessIcon(type) {
    const typeL = type.toLowerCase();
    if (typeL.includes('restaurante')) return '🍽️';
    if (typeL.includes('hotel')) return '🏨';
    if (typeL.includes('tour') || typeL.includes('experiencia')) return '🎯';
    if (typeL.includes('viñedo') || typeL.includes('vino')) return '🍷';
    return '🏢';
}

// ==========================================
// NAVEGACIÓN
// ==========================================
function navigateToSection(section) {
    // Actualizar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Scroll a la sección
    const sectionMap = {
        'overview': 'overview-section',
        'visibility': 'visibility-section',
        'insights': 'insights-section',
        'details': 'details-section'
    };
    
    const targetSection = document.getElementById(sectionMap[section]);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
