import type { Tema, PreguntaNormalizada, OpcionInterna } from '@/models/types';

/**
 * Extrae el identificador de opción (A, B, C, D) de un string como "A. Contenido..."
 */
export function extraerIdOpcion(opcionTexto: string): 'A' | 'B' | 'C' | 'D' | null {
  const match = opcionTexto.match(/^([A-D])[\.\)]\s*/);
  if (match) {
    return match[1] as 'A' | 'B' | 'C' | 'D';
  }
  // Intentar extraer primera letra mayúscula
  const firstLetter = opcionTexto.trim().charAt(0).toUpperCase();
  if ('ABCD'.includes(firstLetter)) {
    return firstLetter as 'A' | 'B' | 'C' | 'D';
  }
  return null;
}

/**
 * Extrae el texto limpio de una opción, eliminando el prefijo "A. ", "B.", etc.
 */
export function extraerTextoOpcion(opcionTexto: string): string {
  const cleaned = opcionTexto.trim().replace(/^([A-D])[\.\)]\s*/, '');
  // Limpiar posibles marcas de markdown residual
  return cleaned.replace(/\*\*/g, '').trim();
}

/**
 * Determina si una opción es la correcta comparando el texto limpio.
 */
function esOpcionCorrecta(opcionTexto: string, opcionCorrecta: string): boolean {
  const limpia = extraerTextoOpcion(opcionTexto).toLowerCase().trim();
  const correcta = extraerTextoOpcion(opcionCorrecta).toLowerCase().trim();
  return limpia === correcta;
}

/**
 * Normaliza un enunciado limpiando posibles marcas de markdown o caracteres extraños.
 */
export function sanitizarTexto(texto: string): string {
  if (!texto) return '';
  return texto
    .replace(/\*\*/g, '') // Eliminar negritas markdown
    .replace(/#{1,6}\s?/g, '') // Eliminar encabezados markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convertir links a texto
    .replace(/[–—]/g, '-') // Normalizar guiones
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

/**
 * Extrae el número de tema desde un string como "Tema 001" o "Tema 1".
 */
export function extraerNumeroTema(nombreTema: string): number {
  const match = nombreTema.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  // Intentar patrón "tema X" o similar
  const match2 = nombreTema.toLowerCase().match(/tema\s*(\d+)/);
  if (match2) {
    return parseInt(match2[1], 10);
  }
  return 0;
}

/**
 * Normaliza un tema completo del JSON original al formato interno PreguntaNormalizada.
 */
export function normalizarTema(tema: Tema): PreguntaNormalizada[] {
  const temaNumero = extraerNumeroTema(tema.nombre_tema);

  return tema.preguntas.map((p) => {
    // Procesar opciones
    const opcionesInternas: OpcionInterna[] = p.opciones.map((op, idx) => ({
      id: ('ABCD'[idx] as 'A' | 'B' | 'C' | 'D') || 'A',
      texto: extraerTextoOpcion(op),
    }));

    // Determinar ID de la opción correcta
    let opcionCorrectaId: 'A' | 'B' | 'C' | 'D' = 'A';
    for (const op of opcionesInternas) {
      if (esOpcionCorrecta(op.texto, p.opcion_correcta)) {
        opcionCorrectaId = op.id;
        break;
      }
    }

    return {
      id_pregunta: p.id_pregunta,
      enunciado: sanitizarTexto(p.enunciado),
      opciones: opcionesInternas,
      opcion_correcta_id: opcionCorrectaId,
      justificacion: sanitizarTexto(p.justificacion ?? ''),
      referencia: p.referencia ? sanitizarTexto(p.referencia) : undefined,
      tipo: 'oficial' as const, // Se sobrescribe después según contexto
      bloque: 'especifico' as const, // Se sobrescribe después según contexto
      tema_numero: temaNumero,
      tema_nombre: sanitizarTexto(tema.nombre_tema),
    };
  });
}

/**
 * Carga y parsea un archivo JSON de tema.
 */
export async function cargarTemaDesdeJSON(ruta: string): Promise<Tema | null> {
  try {
    const response = await fetch(ruta);
    if (!response.ok) return null;
    const data = await response.json();
    return data as Tema;
  } catch (error) {
    console.error(`Error cargando tema desde ${ruta}:`, error);
    return null;
  }
}

/**
 * Carga todos los temas del dataset.
 */
export async function cargarTodosLosTemas(): Promise<Map<number, PreguntaNormalizada[]>> {
  const temas = new Map<number, PreguntaNormalizada[]>();

  for (let i = 1; i <= 133; i++) {
    const padding = String(i).padStart(3, '0');
    const ruta = `/dataset_temas/dataset_tema${padding}.json`;
    const tema = await cargarTemaDesdeJSON(ruta);
    if (tema && tema.preguntas.length > 0) {
      const normalizadas = normalizarTema(tema);
      temas.set(i, normalizadas);
    }
  }

  return temas;
}

/**
 * Genera un ID de sesión único.
 */
export function generarIdSesion(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
