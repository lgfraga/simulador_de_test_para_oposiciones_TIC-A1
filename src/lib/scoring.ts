import type { ResultadoPregunta, PreguntaNormalizada } from '@/models/types';

const VALOR_PREGUNTA = 1;
const PENALIZACION_ERROR = 1 / 3;
const PUNTUACION_MAXIMA = 60;

const TIEMPO_POR_PREGUNTA_AMPLIADO_MS = 52170; // 52,17 s
const TIEMPO_POR_PREGUNTA_ESTRICTO_MS = Math.round((120 * 60 * 1000) / 130); // ~55,38 s

type OpcionRespuesta = 'A' | 'B' | 'C' | 'D' | null;
type PonderacionAdicionales = 'no_computan' | 'computan';

function redondear(valor: number, decimales = 2): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

function esResultadoComputable(
  resultado: ResultadoPregunta,
  ponderacionAdicionales: PonderacionAdicionales
): boolean {
  if (ponderacionAdicionales === 'computan') return true;
  return resultado.pregunta.tipo === 'oficial';
}

function filtrarResultadosComputables(
  resultados: ResultadoPregunta[],
  ponderacionAdicionales: PonderacionAdicionales
): ResultadoPregunta[] {
  return resultados.filter((r) => esResultadoComputable(r, ponderacionAdicionales));
}

/**
 * Calcula la puntuación directa bruta.
 *
 * Regla:
 * - Correcta: +1
 * - Incorrecta: -1/3
 * - Blanca: 0
 *
 * Por defecto, las preguntas adicionales NO computan.
 */
export function calcularPuntuacionDirecta(
  resultados: ResultadoPregunta[],
  ponderacionAdicionales: PonderacionAdicionales = 'no_computan'
): number {
  const computables = filtrarResultadosComputables(resultados, ponderacionAdicionales);

  let puntos = 0;

  for (const r of computables) {
    if (r.estado === 'correcta') {
      puntos += VALOR_PREGUNTA;
    } else if (r.estado === 'incorrecta') {
      puntos -= PENALIZACION_ERROR;
    }
    // blanca = 0
  }

  return redondear(puntos, 3);
}

/**
 * Calcula una nota simulada orientativa sobre 60.
 *
 * IMPORTANTE:
 * - Es una estimación proporcional basada en la puntuación bruta y el máximo bruto posible.
 * - NO representa la transformación oficial real del tribunal.
 * - La nota final se acota siempre al rango [0, 60].
 *
 * Fórmula orientativa:
 *   nota = max(0, min(60, (puntuacion_bruta / maximo_bruto) * 60))
 *
 * donde:
 *   maximo_bruto = nº de preguntas computables * 1
 */
export function calcularPuntuacionSimuladaSobre60(
  resultados: ResultadoPregunta[],
  ponderacionAdicionales: PonderacionAdicionales = 'no_computan'
): number {
  const computables = filtrarResultadosComputables(resultados, ponderacionAdicionales);

  if (computables.length === 0) return 0;

  const puntuacionDirecta = calcularPuntuacionDirecta(resultados, ponderacionAdicionales);
  const maximoBrutoPosible = computables.length * VALOR_PREGUNTA;

  if (maximoBrutoPosible <= 0) return 0;

  const notaSimulada = (puntuacionDirecta / maximoBrutoPosible) * PUNTUACION_MAXIMA;

  return redondear(Math.max(0, Math.min(PUNTUACION_MAXIMA, notaSimulada)), 2);
}

/**
 * Genera el resumen detallado de estadísticas.
 */
export function generarResumenDetallado(
  resultados: ResultadoPregunta[],
  _tiempoTotalSegundos: number,
  tiempoPorPreguntaMs: number[]
): {
  aciertos: number;
  errores: number;
  blancas: number;
  porcentajeAcierto: number;
  tiempoMedioPorPregunta: number; // en segundos
  tiempoTotal: number; // en segundos
  preguntasRespondidas: number;
  preguntasSinResponder: number;
  preguntaMasRapida: { id: string; tiempo: number } | null;
  preguntaMasLenta: { id: string; tiempo: number } | null;
  fueraDeMedia: { id: string; tiempo: number }[];
} {
  const aciertos = resultados.filter((r) => r.estado === 'correcta').length;
  const errores = resultados.filter((r) => r.estado === 'incorrecta').length;
  const blancas = resultados.filter((r) => r.estado === 'blanca').length;

  const preguntasRespondidas = aciertos + errores;
  const preguntasSinResponder = blancas;

  const totalPreguntas = resultados.length;
  const porcentajeAcierto = totalPreguntas > 0 ? (aciertos / totalPreguntas) * 100 : 0;

  const tiemposValidos = tiempoPorPreguntaMs.filter((t) => t > 0);
  const tiempoMedioMs =
    tiemposValidos.length > 0
      ? tiemposValidos.reduce((a, b) => a + b, 0) / tiemposValidos.length
      : 0;

  let preguntaMasRapida: { id: string; tiempo: number } | null = null;
  let preguntaMasLenta: { id: string; tiempo: number } | null = null;
  const fueraDeMedia: { id: string; tiempo: number }[] = [];

  for (let i = 0; i < resultados.length; i++) {
    const r = resultados[i];
    const t = tiempoPorPreguntaMs[i] ?? 0;

    if (t <= 0) continue;

    if (!preguntaMasRapida || t < preguntaMasRapida.tiempo) {
      preguntaMasRapida = { id: r.pregunta.id_pregunta, tiempo: t };
    }

    if (!preguntaMasLenta || t > preguntaMasLenta.tiempo) {
      preguntaMasLenta = { id: r.pregunta.id_pregunta, tiempo: t };
    }

    // Fuera de la media: más del doble del tiempo medio
    if (tiempoMedioMs > 0 && t > tiempoMedioMs * 2) {
      fueraDeMedia.push({ id: r.pregunta.id_pregunta, tiempo: t });
    }
  }

  return {
    aciertos,
    errores,
    blancas,
    porcentajeAcierto: redondear(porcentajeAcierto, 2),
    tiempoMedioPorPregunta: redondear(tiempoMedioMs / 1000, 2),
    tiempoTotal: redondear(tiempoPorPreguntaMs.reduce((a, b) => a + b, 0) / 1000, 2),
    preguntasRespondidas,
    preguntasSinResponder,
    preguntaMasRapida,
    preguntaMasLenta,
    fueraDeMedia: fueraDeMedia.sort((a, b) => b.tiempo - a.tiempo),
  };
}

/**
 * Determina el estado de una respuesta comparando con la correcta.
 */
export function determinarEstado(
  opcionElegida: OpcionRespuesta,
  opcionCorrectaId: 'A' | 'B' | 'C' | 'D'
): 'correcta' | 'incorrecta' | 'blanca' {
  if (!opcionElegida) return 'blanca';
  return opcionElegida === opcionCorrectaId ? 'correcta' : 'incorrecta';
}

/**
 * Calcula el resultado de una pregunta individual.
 */
export function calcularResultadoPregunta(
  pregunta: PreguntaNormalizada,
  opcionElegida: OpcionRespuesta,
  tiempoConsumidoMs: number
): ResultadoPregunta {
  const estado = determinarEstado(opcionElegida, pregunta.opcion_correcta_id);

  return {
    pregunta,
    respuesta_usuario: opcionElegida,
    estado,
    tiempo_consumido_ms: tiempoConsumidoMs,
    es_adicional: pregunta.tipo === 'adicional',
  };
}

/**
 * Calcula el resultado completo de una sesión de examen.
 *
 * Por defecto, las preguntas adicionales no computan en la puntuación.
 */
export function calcularResultado(
  preguntas: PreguntaNormalizada[],
  respuestas: Map<string, OpcionRespuesta>,
  tiemposConsumidos: Map<string, number>,
  ponderacionAdicionales: PonderacionAdicionales = 'no_computan'
): {
  resultados: ResultadoPregunta[];
  puntuacionDirecta: number;
  puntuacionSimuladaSobre60: number;
  resumen: ReturnType<typeof generarResumenDetallado>;
} {
  const resultados: ResultadoPregunta[] = [];
  const tiemposArray: number[] = [];

  for (const pregunta of preguntas) {
    const opcionElegida = respuestas.get(pregunta.id_pregunta) ?? null;
    const tiempoMs = tiemposConsumidos.get(pregunta.id_pregunta) ?? 0;
    const resultado = calcularResultadoPregunta(pregunta, opcionElegida, tiempoMs);

    resultados.push(resultado);
    tiemposArray.push(tiempoMs);
  }

  const puntuacionDirecta = calcularPuntuacionDirecta(resultados, ponderacionAdicionales);
  const puntuacionSimuladaSobre60 = calcularPuntuacionSimuladaSobre60(
    resultados,
    ponderacionAdicionales
  );
  const resumen = generarResumenDetallado(resultados, 0, tiemposArray);

  return {
    resultados,
    puntuacionDirecta,
    puntuacionSimuladaSobre60,
    resumen,
  };
}

/**
 * Formatea segundos a formato legible (HH:MM:SS).
 */
export function formatearTiempo(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(
    2,
    '0'
  )}`;
}

/**
 * Formatea milisegundos a formato legible (MM:SS).
 */
export function formatearTiempoCorto(ms: number): string {
  const totalSegundos = Math.floor(ms / 1000);
  const m = Math.floor(totalSegundos / 60);
  const s = totalSegundos % 60;

  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Calcula el tiempo objetivo por pregunta en milisegundos.
 *
 * - estricto: 120 min / 130 preguntas oficiales ≈ 55,38 s
 * - ampliado: 52,17 s por pregunta (decisión de entrenamiento)
 *
 * El parámetro totalPreguntas se mantiene por compatibilidad y posibles usos futuros.
 */
export function calcularTiempoObjetivoPorPregunta(
  modo: 'estricto' | 'ampliado',
  _totalPreguntas: number
): number {
  return modo === 'estricto'
    ? TIEMPO_POR_PREGUNTA_ESTRICTO_MS
    : TIEMPO_POR_PREGUNTA_AMPLIADO_MS;
}