/**
 * Modelo de datos para las preguntas del temario.
 * Representa la estructura base de cada pregunta en los JSON originales.
 */
export interface Pregunta {
  id_pregunta: string;
  enunciado: string;
  opciones: string[]; // Array de opciones como "A. ...", "B. ...", etc.
  opcion_correcta: string; // La opción correcta completa
  justificacion: string;
  referencia?: string;
}

/**
 * Modelo de datos para un tema completo del temario.
 * Representa la estructura base de cada JSON en dataset_temas/.
 */
export interface Tema {
  nombre_tema: string;
  preguntas: Pregunta[];
}

/**
 * Tipo que indica si una pregunta es oficial o adicional/de reserva.
 */
export type PreguntaTipo = 'oficial' | 'adicional';

/**
 * Tipo de bloque al que pertenece una pregunta.
 */
export type BloqueTipo = 'especifico' | 'general';

/**
 * Opción de respuesta normalizada para uso interno.
 * Cada opción tiene un identificador único (A, B, C, D).
 */
export interface OpcionInterna {
  id: 'A' | 'B' | 'C' | 'D';
  texto: string;
}

/**
 * Pregunta normalizada con opciones procesadas internamente.
 * Se usa para la lógica del examen y corrección.
 */
export interface PreguntaNormalizada {
  id_pregunta: string;
  enunciado: string;
  opciones: OpcionInterna[];
  opcion_correcta_id: 'A' | 'B' | 'C' | 'D';
  justificacion: string;
  referencia?: string;
  tipo: PreguntaTipo;
  bloque: BloqueTipo;
  tema_numero: number;
  tema_nombre: string;
}

/**
 * Respuesta del usuario a una pregunta.
 */
export interface RespuestaUsuario {
  pregunta_id: string;
  opcion_elegida: 'A' | 'B' | 'C' | 'D' | null;
  es_correcta: boolean;
  tiempo_consumido_ms: number;
  es_blanca: boolean;
}

/**
 * Configuración de tiempo para un modo de examen.
 */
export interface ConfiguracionTiempo {
  /** Tiempo total disponible en milisegundos */
  tiempo_total_ms: number;
  /** Tiempo por pregunta en milisegundos */
  tiempo_por_pregunta_ms: number;
}

/**
 * Estado de una sesión de examen activa.
 */
export interface SesionExamen {
  id: string;
  modo: ModoExamen;
  preguntas: PreguntaNormalizada[];
  respuestas: RespuestaUsuario[];
  tiempo_inicio: number;
  tiempo_total_ms: number;
  pregunta_actual: number;
  esta_activa: boolean;
}

/**
 * Tipos de modo de examen disponibles.
 */
export type ModoExamen =
  | 'simulacion_completa'
  | 'solo_general'
  | 'solo_especifico'
  | 'por_tema'
  | 'por_tema_aleatorio';

/**
 * Tipo de vista para la selección de modo en la home.
 */
export type ModoSeleccion =
  | 'simulacion'
  | 'general'
  | 'especifico'
  | 'tema'
  | 'tema_aleatorio'
  | 'resultados';

/**
 * Resultado final de un examen completado.
 */
export interface ResultadoExamen {
  id_sesion: string;
  modo: ModoExamen;
  respuestas: RespuestaUsuario[];
  puntuacion_bruta: number;
  nota_simulada_60: number;
  tiempo_total_ms: number;
  preguntas_totales: number;
  aciertos: number;
  errores: number;
  blancas: number;
  porcentaje_acierto: number;
  tiempo_promedio_pregunta_ms: number;
  pregunta_mas_lenta_ms?: number;
  pregunta_mas_rapida_ms?: number;
  fecha: string;
}

/**
 * Estadísticas detalladas por bloque.
 */
export interface EstadisticasBloque {
  bloque: BloqueTipo;
  total_preguntas: number;
  aciertos: number;
  errores: number;
  blancas: number;
  puntuacion_bruta: number;
  tiempo_promedio_ms: number;
}

/**
 * Estado de una respuesta (correcta, incorrecta o blanca).
 */
export type EstadoRespuesta = 'correcta' | 'incorrecta' | 'blanca';

/**
 * Resultado de una pregunta tras ser respondida.
 */
export interface ResultadoPregunta {
  pregunta: PreguntaNormalizada;
  respuesta_usuario: 'A' | 'B' | 'C' | 'D' | null;
  estado: EstadoRespuesta;
  tiempo_consumido_ms: number;
  es_adicional: boolean;
}

/**
 * Configuración de tema para selección individual.
 */
export interface TemaInfo {
  numero: number;
  nombre: string;
  total_preguntas: number;
}

/**
 * Tema cargado con número adjunto (para UI).
 * Extiende Tema añadiendo numero_tema derivado del nombre de archivo.
 */
export interface TemaConNumero extends Tema {
  numero_tema: number;
}
