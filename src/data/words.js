// Palabras por nivel de la sopa de letras.
// - Escribe todo en MAYÚSCULAS, sin acentos, sin Ñ y sin espacios (una sola palabra).
// - Ninguna palabra puede tener más letras que el `size` de su nivel.
// - Cada partida elige `count` palabras al azar de la lista del nivel, así que
//   mientras más palabras haya, más variadas salen las sopas.
// - Pasado el último nivel, el juego sigue con la configuración del último.

const DIRECCIONES_BASICAS = [
  [0, 1], // →
  [1, 0], // ↓
];
const CON_DIAGONAL = [...DIRECCIONES_BASICAS, [1, 1]]; // ↘
const TODAS = [
  ...CON_DIAGONAL,
  [0, -1], // ←
  [-1, 0], // ↑
  [-1, -1], // ↖
  [1, -1], // ↙
  [-1, 1], // ↗
];

export const LEVELS = [
  {
    // Nivel 1: palabras cortas (hasta 6 letras), solo → y ↓
    size: 6,
    count: 4,
    directions: DIRECCIONES_BASICAS,
    words: [
      // Naturaleza y animales
      "SOL", "LUNA", "MAR", "NUBE", "LLUVIA", "AGUA", "FUEGO", "VIENTO", "CIELO", "ASTRO",
      "ARBOL", "HOJA", "RAMA", "PASTO", "FLOR", "ROSA", "NIDO",
      "GATO", "PERRO", "PATO", "OSO", "SAPO", "RANA", "VACA", "LOBO", "PEZ", "AVE",
      "MONO", "TIGRE", "LEON", "CERDO", "GALLO", "POLLO", "PAVO", "CABRA", "BURRO",
      "MULA", "OVEJA", "ABEJA", "LORO",
      // Casa y escuela
      "CASA", "MESA", "SILLA", "CAMA", "LUZ", "LAPIZ", "LIBRO", "GOMA", "PAPEL", "TIZA",
      "REGLA", "DADO", "BOLA", "PELOTA", "TREN", "CARRO", "BUS",
      // Colores y números
      "AZUL", "VERDE", "ROJO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE",
      "OCHO", "NUEVE", "DIEZ",
      // Cuerpo, comida y familia
      "DEDO", "MANO", "PIE", "OJO", "NARIZ", "BOCA", "PELO", "CARA", "BRAZO", "OREJA",
      "PAN", "LECHE", "QUESO", "HUEVO", "PERA", "UVA", "LIMON", "MANGO", "COCO", "SOPA",
      "ARROZ", "PAPA", "TACO", "DULCE", "TORTA", "JUGO", "MIEL", "SAL",
      "MAMA", "TIA", "TIO", "BEBE",
      // Tiempo y juego
      "DIA", "NOCHE", "TARDE", "HORA", "AYER", "HOY", "RISA", "JUEGO", "SALTO", "CANTO",
      "BAILE",
    ],
  },
  {
    // Nivel 2: hasta 7 letras, se agrega la diagonal
    size: 7,
    count: 5,
    directions: CON_DIAGONAL,
    words: [
      // Escuela
      "ESCUELA", "MAESTRO", "MAESTRA", "ALUMNO", "ALUMNA", "SALON", "CLASE", "TAREA",
      "EXAMEN", "TINTA", "PLUMA", "MOCHILA", "LETRAS", "NUMEROS", "RECREO", "AMIGOS",
      "JUGUETE", "CRAYOLA", "TIJERAS", "COLORES", "CUENTOS", "CANCION", "RONDA", "SILABAS",
      "ABRAZOS", "CUENTO", "BLOQUES", "PATIO", "JARDIN",
      // Acciones
      "BAILAR", "CORRER", "SALTAR", "JUGAR", "DIBUJO", "PINTAR", "CORTAR", "PEGAR", "ARMAR",
      // Familia
      "FAMILIA", "ABUELO", "ABUELA", "HERMANO", "HERMANA", "PRIMO", "PRIMA",
      // Colores y figuras
      "NARANJA", "MORADO", "ROSADO", "BLANCO", "NEGRO", "CAFE", "DORADO", "CIRCULO",
      "LINEA", "CURVA", "FIGURAS", "PUNTO", "CUADRO",
      // Animales
      "GALLINA", "CONEJO", "DELFIN", "BALLENA", "ZORRO", "VENADO", "PALOMA", "AGUILA",
      "PULPO", "FOCA", "CEBRA", "JIRAFA", "TORTUGA", "CABALLO", "HORMIGA", "CARACOL",
      "LAGARTO",
      // Comida
      "SANDIA", "FRESA", "PAPAYA", "MELON", "CEREZA", "TOMATE", "PEPINO", "ELOTE", "HELADO",
      "PALETA", "YOGURT", "CEREAL", "GALLETA", "MANZANA", "PLATANO", "DURAZNO", "LECHUGA",
      "CEBOLLA",
      // Lugares, transportes y oficios
      "VOLCAN", "RIO", "LAGO", "SELVA", "BOSQUE", "PLAYA", "ISLA", "TRUENO", "VERANO",
      "AVION", "BARCO", "CAMION", "COHETE", "TRACTOR", "BOMBERO", "DOCTORA", "POLICIA",
      "CARTERO", "PINTOR", "ARTISTA",
    ],
  },
  {
    // Nivel 3: hasta 8 letras, ya pueden estar al revés
    size: 8,
    count: 6,
    directions: TODAS,
    words: [
      // Escuela
      "PIZARRON", "CUADERNO", "DIBUJAR", "PINTURA", "APRENDER", "ESCRIBIR", "ESTUDIAR",
      "MUSICA", "LECTURA", "PALABRA", "BORRADOR", "ACUARELA", "PINCELES", "CRAYONES",
      "LENGUAJE", "CUADRADO", "AMARILLO",
      // Comida
      "AGUACATE", "GELATINA", "FRIJOLES", "TORTILLA", "CALABAZA", // Animales
      "PINGUINO", "MARIPOSA", "LIBELULA", "TIBURON", "ESTRELLA", "CANGREJO", "CALAMAR",
      "LOMBRIZ", "CAMELLO", "PANTERA", "COYOTE", "ARDILLA", "GAVIOTA", "PELICANO",
      "FLAMENCO", "HAMSTER",
      // Naturaleza y clima
      "INVIERNO", "DESIERTO", "ARCOIRIS", "TORMENTA", "CASCADA", "NEBLINA", // Transportes y oficios
      "TRICICLO", "AUTOBUS", "PATRULLA", "CANTANTE", "MECANICO", "GRANJERO", "PANADERO",
      "COCINERO", "DENTISTA", "PESCADOR", "PILOTO", "MARINERO", "SOLDADO",
      "PLOMERO", "MUSICO",
      // Casa
      "TELEFONO", "PARAGUAS", "LAVADORA", "ESCALERA", "VENTANA", "COCINA", "SALA", "COMEDOR", "JARDINES",
      // Valores
      "ALEGRIA", "AMISTAD", "RESPETO",
      // Fiesta y cuentos
      "FIESTA", "GLOBOS", "REGALO", "PASTEL", "SORPRESA", "CONFETI", "MAGIA",
      "PAYASO", "PRINCESA", "DRAGON", "CASTILLO", "HADA", "PIRATA", "TESORO",
      // Especiales
      "TEAMO", "CHICHAR",
    ],
  },
  {
    // Nivel 4: hasta 9 letras
    size: 9,
    count: 6,
    directions: TODAS,
    words: [
      // Escuela y aprendizaje
      "ALFABETO", "PEGAMENTO", "TRIANGULO", "PEDAGOGIA", "EDUCACION", "EXPRESION",
      "ACTIVIDAD", "FELICIDAD", "CUADERNOS", // Animales
      "COCODRILO", "ELEFANTE", "SERPIENTE", "CABALLERO", "MOSQUITO", "CHIMPANCE", "LANGOSTA",
      "CARACOLES", "TAMANDUA", "GUACAMAYA", "CODORNIZ", "CAMALEON", "CANGURO", "KOALA",
      // Comida
      "CHOCOLATE", "MANDARINA", "ZANAHORIA", "SALCHICHA", "ESPINACA",
      "BROCOLI", "COLIFLOR", "MERMELADA", "PANQUEQUE", "TAMALES", "ENCHILADA",
      // Transportes y estaciones
      "BICICLETA", "SUBMARINO", "PRIMAVERA", "RELAMPAGO", "TERREMOTO", "HURACAN",
      "SEMAFORO", "BANQUETA", "CARRETERA", "ESTACION",
      // Oficios
      "BAILARINA", "PROFESORA", "DIRECTORA", "ENFERMERA", "JARDINERO", "FOTOGRAFO",
      "ABOGADO", "VENDEDOR",
      // Ropa
      "CALCETIN", "ZAPATOS", "CAMISETA", "PANTALON", "VESTIDO", "SOMBRERO", "BUFANDA",
      "GUANTES", "CHAMARRA", "PIJAMA", "BOTAS", "FALDA", "SUETER", "CINTURON", "LENTES",
      // Música
      "GUITARRA", "TAMBOR", "FLAUTA", "TROMPETA", "PANDERO", "MARACAS", "VIOLIN", "PIANO",
      "XILOFONO", "ARMONICA", "MUSICAL", "ORQUESTA", "ACORDEON",
      // Cuerpo
      "CABEZA", "CUELLO", "HOMBRO", "CODO", "RODILLA", "TOBILLO", "GARGANTA", "ESPALDA",
      "ESTOMAGO", "CORAZON", "PULMONES", "CEREBRO", "LENGUA", "MEJILLA", "CEJAS", "DIENTES",
      "CADERA",
      // Lugares
      "MERCADO", "TIENDA", "HOSPITAL", "BOMBEROS", "PANADERIA", "FRUTERIA", "LIBRERIA",
      "PAPELERIA", "ZAPATERIA", "PLAZA", "IGLESIA", "CINE", "PARQUE", "GRANJA",
      // Más palabras
      "PALOMITAS", "PERIQUITO", "INGENIERO", "PACIENCIA", "DIVERSION", "ESPAGUETI",
      // Especiales
      "TEAMO", "CHICHAR",
    ],
  },
  {
    // Nivel 5: hasta 10 letras
    size: 10,
    count: 7,
    directions: TODAS,
    words: [
      // Escuela
      "PLASTILINA", "RECTANGULO", "BIBLIOTECA", "ABECEDARIO", "CALENDARIO", "MATEMATICA",
      "ESCRITORIO", "SACAPUNTAS", "ESTUDIANTE", "PLANEACION", "EVALUACION",
      "DESARROLLO", "PSICOLOGIA", "MOTRICIDAD", "CURIOSIDAD", "HONESTIDAD",
      // Animales
      "MURCIELAGO", "DINOSAURIO", "ESCARABAJO", "CHINCHILLA", "ORANGUTAN", "ARMADILLO",
      "COLIBRI", "SALAMANDRA", "ESCORPION", "GUACAMAYA", "CABALLITO", "GOLONDRINA",
      "ALACRAN", "TARANTULA", "CUCARACHA", // Oficios
      "CARPINTERO", "ASTRONAUTA", "ARQUITECTO", "PERIODISTA", "BOMBEROS", "ELECTRICO",
      "ESCULTOR", "BIOLOGO", "QUIMICO", "FISICO", "CIRUJANO", "DOCTOR", "PROFESOR",
      "ENTRENADOR", "CAMARERO", "PASTELERO",
      // Transportes
      "AMBULANCIA", "MOTONETA", "TELEFERICO", "CAMIONETA", "LANCHA", "VELERO", "CARRETA",
      "PARACAIDAS", "PATINETA", "TRANVIA", "METROBUS", "TAXI", "TRAILER",
      // Aparatos
      "TELEVISION", "MICROONDAS", "TERMOMETRO", "TELESCOPIO", "LICUADORA",
      "VENTILADOR", "TELEFONO", "CAMARA", "RELOJ", "RADIO",
      "LINTERNA", "BATERIA", "CARGADOR",
      // Tiendas
      "CARNICERIA", "JUGUETERIA", "PESCADERIA", "FARMACIA", "HELADERIA",
      "PASTELERIA", "FLORERIA", "VERDULERIA", "ABARROTES", // Naturaleza
      "NATURALEZA", "ATMOSFERA", "INUNDACION", "PLANETARIO", "ECOSISTEMA", "ASTRONOMIA",
      "UNIVERSO", "GALAXIA", "PLANETA", "SATELITE", "COMETA", "ASTEROIDE",
      "VOLCANES", "CORDILLERA", "ACANTILADO", "PENINSULA",
      // Especiales
      "TEAMO", "CHICHAR",
    ],
  },
  {
    // Nivel 6 en adelante: palabras largas (hasta 13 letras)
    size: 13,
    count: 8,
    directions: TODAS,
    words: [
      // Transportes y animales
      "HELICOPTERO", "MOTOCICLETA", "VETERINARIO", "ROMPECABEZAS", "HIPOPOTAMO",
      "RINOCERONTE", "CHIMPANCE", "ORNITORRINCO", "CUENTACUENTOS", "ESCARABAJO",
      "MURCIELAGO", "DINOSAURIO", "ARMADILLO", // Aprendizaje
      "COMUNICACION", "COORDINACION", "PENSAMIENTO", "CONOCIMIENTO", "APRENDIZAJE",
      "OBSERVACION", "EXPLORACION", "CONVIVENCIA", "COLABORACION", "SOLIDARIDAD",
      "GENEROSIDAD", "CREATIVIDAD", "EXPERIMENTO", "INVESTIGACION", "PARTICIPACION",
      "ORGANIZACION", "ESTIMULACION", "PRONUNCIACION", "PSICOMOTRIZ", "ACTIVIDADES",
      "EVALUACION", "DESARROLLO", "IMAGINACION", "VOCABULARIO", "MATEMATICAS",
      // Aparatos
      "COMPUTADORA", "REFRIGERADOR", "ELECTRICIDAD", "MICROSCOPIO", "CALCULADORA",
      "ENCICLOPEDIA", "DICCIONARIO", "ELECTRICISTA", "LABORATORIO", "TELEVISION",
      "MICROONDAS", "TERMOMETRO", "TELESCOPIO", "BINOCULARES", // Ciencias y naturaleza
      "ASTRONOMIA", "METEOROLOGIA", "GEOGRAFIA", "BIOLOGIA", "HISTORIA", "CIENCIAS",
      "NATURALEZA", "AMBIENTE", "RECICLAJE", "CONTAMINACION", "SUSTENTABLE", "BIODIVERSIDAD",
      "ECOSISTEMA", "FOTOSINTESIS", "CONSTELACION", "GRAVEDAD", "ATMOSFERA", "INUNDACION",
      "ERUPCION", "TORNADO", "PLANETARIO", "ARQUEOLOGIA", "PALEONTOLOGO", "CARTOGRAFIA",
      // Valores y emociones
      "RESPONSABLE", "TOLERANCIA", "AMABILIDAD", "GRATITUD", "SOLIDARIO", "HONESTIDAD", "CURIOSIDAD", "FELICIDAD", "ALEGRIA", "EMOCIONES", "SENTIMIENTOS",
      "CONFIANZA", // Especiales
      "TEAMO", "CHICHAR",
    ],
  },
];

// Segundos disponibles = base + segundos por cada palabra del nivel
export const TIME_BASE = 60;
export const TIME_PER_WORD = 15;

// Puntos: cada palabra vale POINTS_PER_WORD × nivel; equivocarse resta WRONG_PENALTY
export const POINTS_PER_WORD = 100;
export const WRONG_PENALTY = 5;

export const getLevelConfig = (level) => {
  const base = LEVELS[Math.min(level, LEVELS.length) - 1];
  return { ...base, time: TIME_BASE + base.count * TIME_PER_WORD };
};
