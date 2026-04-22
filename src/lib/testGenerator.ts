import type { Tema, PreguntaNormalizada } from '@/models/types';
import { normalizarTema, extraerNumeroTema } from './dataUtils';

// ============================================================================
// UTILIDADES INTERNAS
// ============================================================================

/**
 * Convierte un array de Tema[] a Map<number, PreguntaNormalizada[]>
 */
function temasArrayAMap(temas: Tema[]): Map<number, PreguntaNormalizada[]> {
  const mapa = new Map<number, PreguntaNormalizada[]>();
  for (const tema of temas) {
    const numero = extraerNumeroTema(tema.nombre_tema);
    if (numero > 0) {
      mapa.set(numero, normalizarTema(tema));
    }
  }
  return mapa;
}

/**
 * Mezcla un array usando Fisher-Yates (determinista si se proporciona seed).
 */
function mezclar<T>(array: T[]): T[] {
  const resultado = [...array];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

/**
 * Selecciona N elementos al azar de un array.
 */
function seleccionarN<T>(array: T[], n: number): T[] {
  const mezclados = mezclar(array);
  return mezclados.slice(0, n);
}

/**
 * Obtiene una pregunta aleatoria de una lista que no haya sido usada aún.
 */
function obtenerPreguntaAleatoria(
  preguntas: PreguntaNormalizada[],
  usadas: Set<string>
): PreguntaNormalizada | null {
  // Filtrar las ya usadas
  const disponibles = preguntas.filter((p) => !usadas.has(p.id_pregunta));

  if (disponibles.length === 0) {
    // Si no hay disponibles, devolver cualquiera del tema (con advertencia)
    console.warn(
      `No hay preguntas disponibles sin repetir para el tema. Usando cualquier pregunta.`
    );
    return preguntas[Math.floor(Math.random() * preguntas.length)] ?? null;
  }

  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

// ============================================================================
// GENERACIÓN PRINCIPAL (simulación completa)
// ============================================================================

/**
 * Genera las preguntas para una simulación completa (específicos + generales).
 */
export function generarPreguntasSimulacion(
  temas: Tema[],
  modoAmpliado: boolean
): PreguntaNormalizada[] {
  const mapa = temasArrayAMap(temas);
  const log: string[] = [];
  const preguntasUsadas = new Set<string>();
  const resultado: PreguntaNormalizada[] = [];

  // Separar temas específicos (28-133) y generales (1-27)
  const temasEspecNums = Array.from(mapa.keys())
    .filter((n) => n >= 28 && n <= 133)
    .sort((a, b) => a - b);
  const temasGenNums = Array.from(mapa.keys())
    .filter((n) => n >= 1 && n <= 27)
    .sort((a, b) => a - b);

  log.push(`Temas específicos disponibles: ${temasEspecNums.length}`);
  log.push(`Temas generales disponibles: ${temasGenNums.length}`);

  // --- Bloque específico ---
  // 100 oficiales + 5 adicionales
  const temasOficialesEspec = seleccionarN(temasEspecNums, 100);
  const restantesEspec = temasEspecNums.filter(
    (t) => !temasOficialesEspec.includes(t)
  ); // 6 restantes

  for (const temaNum of temasOficialesEspec) {
    const preguntas = mapa.get(temaNum);
    if (preguntas) {
      const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
      if (p) {
        resultado.push({ ...p, tipo: 'oficial' as const, bloque: 'especifico' });
        preguntasUsadas.add(p.id_pregunta);
      }
    }
  }

  // 5 adicionales de los restantes
  const temasAdicionalesEspec = seleccionarN(restantesEspec, 5);
  for (const temaNum of temasAdicionalesEspec) {
    const preguntas = mapa.get(temaNum);
    if (preguntas) {
      const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
      if (p) {
        resultado.push({ ...p, tipo: 'adicional' as const, bloque: 'especifico' });
        preguntasUsadas.add(p.id_pregunta);
      }
    }
  }

  // --- Bloque general ---
  // 27 oficiales (1 por tema) + 3 adicionales oficiales + 3 adicionales reserva
  for (const temaNum of temasGenNums) {
    const preguntas = mapa.get(temaNum);
    if (preguntas) {
      const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
      if (p) {
        resultado.push({ ...p, tipo: 'oficial' as const, bloque: 'general' });
        preguntasUsadas.add(p.id_pregunta);
      }
    }
  }

  // 6 adicionales generales (3 oficiales + 3 reserva)
  const temasAdicionalesGen = seleccionarN(temasGenNums, 6);
  for (let i = 0; i < 3 && i < temasAdicionalesGen.length; i++) {
    const preguntas = mapa.get(temasAdicionalesGen[i]);
    if (preguntas) {
      const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
      if (p) {
        resultado.push({ ...p, tipo: 'oficial' as const, bloque: 'general' });
        preguntasUsadas.add(p.id_pregunta);
      }
    }
  }

  for (let i = 3; i < 6 && i < temasAdicionalesGen.length; i++) {
    const preguntas = mapa.get(temasAdicionalesGen[i]);
    if (preguntas) {
      const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
      if (p) {
        resultado.push({ ...p, tipo: 'adicional' as const, bloque: 'general' });
        preguntasUsadas.add(p.id_pregunta);
      }
    }
  }

  log.push(`Total preguntas generadas: ${resultado.length}`);
  log.push(
    `Preguntas oficiales específicas: ${resultado.filter((p) => p.tipo === 'oficial' && p.bloque === 'especifico').length}`
  );
  log.push(
    `Preguntas adicionales específicas: ${resultado.filter((p) => p.tipo === 'adicional' && p.bloque === 'especifico').length}`
  );
  log.push(
    `Preguntas oficiales generales: ${resultado.filter((p) => p.tipo === 'oficial' && p.bloque === 'general').length}`
  );
  log.push(
    `Preguntas adicionales generales: ${resultado.filter((p) => p.tipo === 'adicional' && p.bloque === 'general').length}`
  );

  // En modo estricto BOE, filtrar solo las oficiales (130 preguntas)
  if (!modoAmpliado) {
    const oficiales = resultado.filter((p) => p.tipo === 'oficial');
    log.push(`Modo estricto BOE: ${oficiales.length} preguntas oficiales`);
    return oficiales;
  }

  return resultado;
}

// ============================================================================
// GENERACIÓN POR BLOQUE (solo general o solo específico)
// ============================================================================

/**
 * Genera las preguntas para un solo bloque (general o específico).
 */
export function generarPreguntasBloque(
  temas: Tema[],
  bloque: 'general' | 'especifico',
  modoAmpliado: boolean
): PreguntaNormalizada[] {
  const mapa = temasArrayAMap(temas);
  const log: string[] = [];
  const preguntasUsadas = new Set<string>();
  const resultado: PreguntaNormalizada[] = [];

  if (bloque === 'general') {
    // Solo bloque general: 27 oficiales + 3 adicionales oficiales + 3 adicionales reserva
    const temasGenNums = Array.from(mapa.keys())
      .filter((n) => n >= 1 && n <= 27)
      .sort((a, b) => a - b);

    log.push(`Temas generales disponibles: ${temasGenNums.length}`);

    // 27 oficiales (1 por tema)
    for (const temaNum of temasGenNums) {
      const preguntas = mapa.get(temaNum);
      if (preguntas) {
        const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
        if (p) {
          resultado.push({ ...p, tipo: 'oficial' as const, bloque: 'general' });
          preguntasUsadas.add(p.id_pregunta);
        }
      }
    }

    // 6 adicionales (3 oficiales + 3 reserva)
    const temasAdicionales = seleccionarN(temasGenNums, 6);
    for (let i = 0; i < 3 && i < temasAdicionales.length; i++) {
      const preguntas = mapa.get(temasAdicionales[i]);
      if (preguntas) {
        const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
        if (p) {
          resultado.push({ ...p, tipo: 'oficial' as const, bloque: 'general' });
          preguntasUsadas.add(p.id_pregunta);
        }
      }
    }

    for (let i = 3; i < 6 && i < temasAdicionales.length; i++) {
      const preguntas = mapa.get(temasAdicionales[i]);
      if (preguntas) {
        const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
        if (p) {
          resultado.push({ ...p, tipo: 'adicional' as const, bloque: 'general' });
          preguntasUsadas.add(p.id_pregunta);
        }
      }
    }

    log.push(`Total preguntas generales: ${resultado.length}`);

    if (!modoAmpliado) {
      const oficiales = resultado.filter((p) => p.tipo === 'oficial');
      return oficiales; // 30 oficiales
    }

    return resultado; // 30 oficiales + 3 adicionales
  } else {
    // Solo bloque específico: 100 oficiales + 5 adicionales
    const temasEspecNums = Array.from(mapa.keys())
      .filter((n) => n >= 28 && n <= 133)
      .sort((a, b) => a - b);

    log.push(`Temas específicos disponibles: ${temasEspecNums.length}`);

    // 100 oficiales
    const temasOficiales = seleccionarN(temasEspecNums, 100);
    const restantes = temasEspecNums.filter(
      (t) => !temasOficiales.includes(t)
    );

    for (const temaNum of temasOficiales) {
      const preguntas = mapa.get(temaNum);
      if (preguntas) {
        const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
        if (p) {
          resultado.push({ ...p, tipo: 'oficial' as const, bloque: 'especifico' });
          preguntasUsadas.add(p.id_pregunta);
        }
      }
    }

    // 5 adicionales de los restantes
    const temasAdicionales = seleccionarN(restantes, 5);
    for (const temaNum of temasAdicionales) {
      const preguntas = mapa.get(temaNum);
      if (preguntas) {
        const p = obtenerPreguntaAleatoria(preguntas, preguntasUsadas);
        if (p) {
          resultado.push({ ...p, tipo: 'adicional' as const, bloque: 'especifico' });
          preguntasUsadas.add(p.id_pregunta);
        }
      }
    }

    log.push(`Total preguntas específicas: ${resultado.length}`);

    if (!modoAmpliado) {
      const oficiales = resultado.filter((p) => p.tipo === 'oficial');
      return oficiales; // 100 oficiales
    }

    return resultado; // 100 oficiales + 5 adicionales
  }
}

// ============================================================================
// GENERACIÓN POR TEMA INDIVIDUAL
// ============================================================================

/**
 * Genera las preguntas para un examen por tema individual (orden original).
 */
export function generarPreguntasTema(
  temas: Tema[],
  temaNumero: number
): PreguntaNormalizada[] {
  const mapa = temasArrayAMap(temas);
  const log: string[] = [];
  const preguntas = mapa.get(temaNumero);

  if (!preguntas || preguntas.length === 0) {
    log.push(`No se encontraron preguntas para el tema ${temaNumero}`);
    console.warn(`No se encontraron preguntas para el tema ${temaNumero}`);
    return [];
  }

  // Marcar todas como oficiales del bloque correspondiente
  const bloque: 'especifico' | 'general' =
    temaNumero >= 28 && temaNumero <= 133 ? 'especifico' : 'general';

  const resultado = preguntas.map(
    (p) => ({ ...p, tipo: 'oficial' as const, bloque } as PreguntaNormalizada)
  );
  log.push(`Tema ${temaNumero}: ${resultado.length} preguntas cargadas`);

  return resultado;
}

/**
 * Genera las preguntas de un tema en orden aleatorio.
 */
export function generarPreguntasTemaAleatorio(
  temas: Tema[],
  temaNumero: number
): PreguntaNormalizada[] {
  const mapa = temasArrayAMap(temas);
  const log: string[] = [];
  const preguntas = mapa.get(temaNumero);

  if (!preguntas || preguntas.length === 0) {
    log.push(`No se encontraron preguntas para el tema ${temaNumero}`);
    console.warn(`No se encontraron preguntas para el tema ${temaNumero}`);
    return [];
  }

  const mezcladas = mezclar(preguntas);
  const bloque: 'especifico' | 'general' =
    temaNumero >= 28 && temaNumero <= 133 ? 'especifico' : 'general';

  const resultado = mezcladas.map(
    (p) => ({ ...p, tipo: 'oficial' as const, bloque } as PreguntaNormalizada)
  );
  log.push(
    `Tema ${temaNumero}: ${resultado.length} preguntas en orden aleatorio`
  );

  return resultado;
}
