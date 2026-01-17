const encuestaOpciones = {

  tipoNegocio: {
    type: "single",
    options: [
      "Restaurante",
      "Hotel / Hospedaje",
      "Vinedo / Casa de vino",
      "Tour / Experiencia turistica",
      "Institucion Educativa",
      "Otro"
    ]
  },

  tamanoNegocio: {
    type: "single",
    options: [
      "1 a 5 personas",
      "6 a 15 personas",
      "16 a 30 personas",
      "Mas de 30 personas"
    ]
  },

  responsableOperacion: {
    type: "multi",
    options: [
      "Dueno",
      "Administrador / Gerente / Rector",
      "Familiar",
      "Personal joven / apoyo digital"
    ]
  },

  edadPersonal: {
    type: "multi",
    options: [
      "20 a 30 anos",
      "31 a 45 anos",
      "45 a 60 anos",
      "Mas de 60 anos"
    ]
  },

  posicionCompetencia: {
    type: "single",
    options: [
      "Mejor que la mayoria",
      "Similar",
      "Un poco rezagado",
      "Muy rezagado",
      "No lo se"
    ]
  },

  herramientasDigitales: {
    type: "multi",
    options: [
      "WhatsApp",
      "Redes sociales",
      "Sistemas especializados",
      "Punto de venta",
      "Office",
      "Google Sheets",
      "Ninguna"
    ]
  },

  visibilidadInternet: {
    type: "single",
    options: [
      "No aparecemos",
      "Solo redes sociales basicas",
      "Aparecemos en Google sin estrategia",
      "Buena presencia en Google y redes",
      "Bien posicionados y nos buscan"
    ]
  },

  expectativaTecnologiaClientes: {
    type: "single",
    options: [
      "Si",
      "Tal vez",
      "No",
      "No lo he pensado"
    ]
  },

  preparacionGoogleChatGPT: {
    type: "single",
    options: [
      "No lo habia pensado",
      "No estamos preparados",
      "Algo preparados",
      "Bastante preparados"
    ]
  },

  nivelDigitalizacion: {
    type: "scale",
    options: [1, 2, 3, 4, 5]
  },

  gestionOperacion: {
    type: "matrix",
    options: [
      "Manual",
      "Digital basica",
      "Digital automatizada"
    ],
    procesos: [
      "Reservaciones",
      "Pagos",
      "Inventarios",
      "Facturacion",
      "Atencion a clientes"
    ]
  },

  problemasOperacion: {
    type: "matrix",
    options: [
      "Rara vez",
      "Si pocas veces",
      "Si muchas veces"
    ],
    problemas: [
      "Reservas duplicadas",
      "Falta de control de inventario",
      "Mucho tiempo administrativo",
      "Falta de informacion",
      "Datos en distintos lugares"
    ]
  },

  aperturaTecnologica: {
    type: "single",
    options: [
      "Muy poco",
      "Neutral",
      "Dispuesto",
      "Muy dispuesto"
    ]
  },

  barrerasTecnologia: {
    type: "multi",
    options: [
      "Costo",
      "Falta de tiempo",
      "No saber usarla",
      "Desconfianza",
      "Nadie que me ayude"
    ]
  },

  responsableTecnologia: {
    type: "single",
    options: [
      "Yo",
      "Colaborador joven",
      "Familiar",
      "Externo",
      "Nadie"
    ]
  },

  capacidadAprendizajeEquipo: {
    type: "single",
    options: [
      "Aprende rapido",
      "Necesita acompanamiento",
      "Le cuesta mucho"
    ]
  },

  comodidadAprenderTecnologia: {
    type: "single",
    options: [
      "Muy comodo",
      "Se me dificulta",
      "No es de mi interes"
    ]
  },

  tipoCapacitacion: {
    type: "multi",
    options: [
      "Taller presencial",
      "Videos cortos",
      "Acompanamiento 1 a 1",
      "Manuales sencillos"
    ]
  },

  riesgoSalidaResponsableTI: {
    type: "single",
    options: [
      "Sin problema",
      "Algunas dificultades",
      "Muchos problemas",
      "Seriamente afectado"
    ]
  },

  habilidadesFaltantes: {
    type: "multi",
    options: [
      "Uso de tecnologia",
      "Organizacion",
      "Atencion al cliente",
      "Analisis de informacion",
      "Liderazgo",
      "Procesos"
    ]
  },

  origenClientes: {
    type: "multi",
    options: [
      "Recomendacion",
      "Redes sociales",
      "WhatsApp",
      "Google",
      "Campanas digitales"
    ]
  },

  facilidadOnboardingPersonal: {
    type: "single",
    options: [
      "Muy facil",
      "Regular",
      "Dificil",
      "Depende"
    ]
  },

  documentacionProcesos: {
    type: "multi",
    options: [
      "En mi cabeza",
      "Libretas",
      "Excel / Sheets",
      "Documentados",
      "Videos"
    ]
  },

  indicadoresActuales: {
    type: "multi",
    options: [
      "Ventas",
      "Ocupacion",
      "Costos",
      "Rentabilidad",
      "Otros"
    ]
  },

  seguimientoIndicadores: {
    type: "single",
    options: [
      "Cuaderno",
      "Excel / Sheets",
      "Sistema",
      "No llevo control"
    ]
  },

  causaErrores: {
    type: "multi",
    options: [
      "Falta de informacion",
      "Falta de comunicacion",
      "Falta de herramientas",
      "Falta de capacitacion"
    ]
  },

  tomaDecisiones: {
    type: "single",
    options: [
      "Dueno",
      "En conjunto",
      "Segun urgencia"
    ]
  },

  criteriosDecision: {
    type: "multi",
    options: [
      "Experiencia",
      "Intuicion",
      "Datos",
      "Opinion de otros"
    ]
  },

  usoDatosDigitales: {
    type: "single",
    options: [
      "No uso informacion",
      "Ocasional",
      "Algunas decisiones",
      "Frecuente",
      "Sistematica"
    ]
  },

  interesCrecimiento: {
    type: "single",
    options: [
      "Mantenerme",
      "Crecer poco a poco",
      "Expandirme",
      "No lo he pensado"
    ]
  },

  capacidadEscalar: {
    type: "single",
    options: [
      "Sin problema",
      "Me costaria trabajo",
      "Muy complicado",
      "No es posible hoy"
    ]
  },

  confianzaAdoptarTecnologia: {
    type: "multi",
    options: [
      "Casos locales",
      "Acompanamiento",
      "Bajo costo",
      "Capacitacion clara"
    ]
  },

  interesFinalTecnologia: {
    type: "single",
    options: [
      "Menor",
      "Igual",
      "Mayor",
      "Mucho mayor"
    ]
  }
};