// ==========================================
// VARIABLES GLOBALES
// ==========================================
let rawCSVData = [];        // Datos crudos del CSV
let normalizedData = [];    // Datos normalizados por DataEngine
let filteredData = [];      // Datos filtrados actualmente visibles
let charts = {};

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
    // Cargar respuestas.csv por defecto
    fetch('respuestas.csv')
        .then(response => response.text())
        .then(csvText => {
            parseCSV(csvText);
        })
        .catch(error => {
            console.log('No se encontró respuestas.csv. Por favor carga el archivo manualmente.');
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
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
            console.log('CSV parseado:', results.data.length, 'filas totales');
            
            // Guardar datos crudos
            rawCSVData = results.data;
            
            // Procesar con DataEngine
            normalizedData = DataEngine.processRawCSV(rawCSVData);
            filteredData = [...normalizedData];
            
            console.log('Datos normalizados:', normalizedData.length, 'negocios');
            console.log('Ejemplo:', normalizedData[0]);
            
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
    normalizedData.forEach(business => {
        if (business.tipoNegocio) {
            types.add(business.tipoNegocio);
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
    normalizedData.forEach(business => {
        if (business.tamanoNegocio) {
            sizes.add(business.tamanoNegocio);
        }
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
    normalizedData.forEach(business => {
        if (business.responsableOperacion && Array.isArray(business.responsableOperacion)) {
            business.responsableOperacion.forEach(rol => roles.add(rol));
        }
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
    
    filteredData = normalizedData.filter(business => {
        // Filtro tipo
        const typeMatch = typeValues.includes('all') || typeValues.includes(business.tipoNegocio);
        
        // Filtro tamaño
        const sizeMatch = sizeValues.includes('all') || sizeValues.includes(business.tamanoNegocio);
        
        // Filtro rol (multi-select)
        let roleMatch = roleValues.includes('all');
        if (!roleMatch && business.responsableOperacion && Array.isArray(business.responsableOperacion)) {
            roleMatch = business.responsableOperacion.some(rol => roleValues.includes(rol));
        }
        
        return typeMatch && sizeMatch && roleMatch;
    });
    
    updateDashboard();
}

function resetFilters() {
    document.getElementById('filter-type').selectedIndex = 0;
    document.getElementById('filter-size').selectedIndex = 0;
    document.getElementById('filter-role').selectedIndex = 0;
    filteredData = [...normalizedData];
    updateDashboard();
}

// ==========================================
// ACTUALIZACIÓN DEL DASHBOARD
// ==========================================
function updateDashboard() {
    updateResponseCount();
    updateDigitalizationChart();
    
    // Usar funciones del módulo ChartUpdates
    ChartUpdates.updateTechnologyChart();
    ChartUpdates.updateProcessesChart();
    ChartUpdates.updateClientOriginChart();
    ChartUpdates.updateDigitalReadinessChart();
    ChartUpdates.updateSummaryTable();
    ChartUpdates.updateVisibilityMessage();
    ChartUpdates.generateInsights();
    ChartUpdates.updateBusinessCards();
}

function updateResponseCount() {
    document.getElementById('total-responses').textContent = `${filteredData.length} respuestas`;
}

// ==========================================
// GRÁFICA: DIGITALIZACIÓN POR TIPO
// ==========================================
function updateDigitalizationChart() {
    const ctx = document.getElementById('chart-digitalization');
    
    // Obtener todas las opciones válidas
    const validTypes = encuestaOpciones.tipoNegocio.options;
    
    // Inicializar grupos con todas las opciones
    const typeGroups = {};
    validTypes.forEach(type => {
        typeGroups[type] = [];
    });
    
    // Agrupar datos
    filteredData.forEach(business => {
        const type = business.tipoNegocio;
        if (type && typeGroups.hasOwnProperty(type)) {
            if (business.nivelDigitalizacion) {
                typeGroups[type].push(business.nivelDigitalizacion);
            }
        }
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

// ==========================================
// UPLOAD DE ARCHIVO CSV
// ==========================================
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            parseCSV(e.target.result);
        };
        reader.readAsText(file);
    }
}

function getBusinessIcon(type) {
    const typeL = type.toLowerCase();
    if (typeL.includes('restaurante')) return '🍽️';
    if (typeL.includes('hotel')) return '🏨';
    if (typeL.includes('tour') || typeL.includes('experiencia')) return '🎯';
    if (typeL.includes('viñedo') || typeL.includes('vino')) return '🍷';
    return '🏢';
}
