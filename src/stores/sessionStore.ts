import { create } from 'zustand';
import type {
  PreguntaNormalizada,
  ModoExamen,
  RespuestaUsuario,
  TemaConNumero,
} from '@/models/types';
import {
  generarPreguntasSimulacion,
  generarPreguntasBloque,
  generarPreguntasTema,
  generarPreguntasTemaAleatorio,
} from '@/lib/testGenerator';
import { calcularTiempoObjetivoPorPregunta } from '@/lib/scoring';

interface SessionState {
  // Estado de sesión
  preguntasSesion: PreguntaNormalizada[];
  respuestas: RespuestaUsuario[];
  preguntaActual: number;
  sesionActiva: boolean;
  tiempoInicio: number | null;
  tiempoPreguntaInicioMs: number | null;
  tiempoTotalMs: number;
  logGeneracion: string[];
  esUltimaPregunta: boolean;

  // Acciones de sesión
  iniciarSesion: (
    temas: TemaConNumero[],
    modo: ModoExamen,
    temaSeleccionado?: number
  ) => Promise<boolean>;
  responderPregunta: (
    opcion: 'A' | 'B' | 'C' | 'D' | null,
    tiempoConsumidoMs?: number
  ) => void;
  siguientePregunta: () => void;
  anteriorPregunta: () => void;
  finalizarSesion: () => void;
  limpiarSesion: () => void;

  // Getters
  obtenerRespuestaActual: () => RespuestaUsuario | undefined;
  obtenerTiempoConsumido: () => number;
}

type SessionPersistedState = Pick<
  SessionState,
  | 'preguntasSesion'
  | 'respuestas'
  | 'preguntaActual'
  | 'sesionActiva'
  | 'tiempoInicio'
  | 'tiempoPreguntaInicioMs'
  | 'tiempoTotalMs'
  | 'logGeneracion'
  | 'esUltimaPregunta'
>;

function persistirSesion(state: SessionPersistedState) {
  try {
    localStorage.setItem('simulador-sesion', JSON.stringify(state));
  } catch (e) {
    console.warn('No se pudo persistir la sesión:', e);
  }
}

function eliminarSesionPersistida() {
  try {
    localStorage.removeItem('simulador-sesion');
  } catch {
    // ignore
  }
}

function calcularTiempoTotalSesionMs(
  modo: ModoExamen,
  totalPreguntas: number,
  modoAmpliado: boolean
): number {
  // En simulación completa estricta, respetar exactamente 120 min del BOE
  if (modo === 'simulacion_completa' && !modoAmpliado) {
    return 120 * 60 * 1000;
  }

  const modoTiempo = modoAmpliado ? 'ampliado' : 'estricto';
  const tiempoPorPreguntaMs = calcularTiempoObjetivoPorPregunta(modoTiempo, totalPreguntas);
  return totalPreguntas * tiempoPorPreguntaMs;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  preguntasSesion: [],
  respuestas: [],
  preguntaActual: 0,
  sesionActiva: false,
  tiempoInicio: null,
  tiempoPreguntaInicioMs: null,
  tiempoTotalMs: 120 * 60 * 1000,
  logGeneracion: [],
  esUltimaPregunta: false,

  iniciarSesion: async (temas: TemaConNumero[], modo: ModoExamen, temaSeleccionado?: number) => {
    if (!temas?.length) {
      return false;
    }

    const { useUIStore } = await import('@/stores/uiStore');
    const modoAmpliado = useUIStore.getState().modoAmpliado;

    let preguntas: PreguntaNormalizada[] = [];
    const log: string[] = [];

    switch (modo) {
      case 'simulacion_completa': {
        preguntas = generarPreguntasSimulacion(temas, modoAmpliado);
        log.push(`Simulación completa: ${preguntas.length} preguntas`);
        break;
      }
      case 'solo_general': {
        preguntas = generarPreguntasBloque(temas, 'general', modoAmpliado);
        log.push(`Solo general: ${preguntas.length} preguntas`);
        break;
      }
      case 'solo_especifico': {
        preguntas = generarPreguntasBloque(temas, 'especifico', modoAmpliado);
        log.push(`Solo específico: ${preguntas.length} preguntas`);
        break;
      }
      case 'por_tema': {
        if (temaSeleccionado !== undefined && temaSeleccionado !== null) {
          preguntas = generarPreguntasTema(temas, temaSeleccionado);
          log.push(`Tema ${temaSeleccionado}: ${preguntas.length} preguntas`);
        }
        break;
      }
      case 'por_tema_aleatorio': {
        if (temaSeleccionado !== undefined && temaSeleccionado !== null) {
          preguntas = generarPreguntasTemaAleatorio(temas, temaSeleccionado);
          log.push(`Tema ${temaSeleccionado} aleatorio: ${preguntas.length} preguntas`);
        }
        break;
      }
    }

    if (preguntas.length === 0) {
      log.push('Error: No se pudieron generar preguntas.');
      return false;
    }

    const now = Date.now();
    const tiempoTotalMs = calcularTiempoTotalSesionMs(modo, preguntas.length, modoAmpliado);

    const nuevoEstado: SessionPersistedState = {
      preguntasSesion: preguntas,
      respuestas: [],
      preguntaActual: 0,
      sesionActiva: true,
      tiempoInicio: now,
      tiempoPreguntaInicioMs: now,
      tiempoTotalMs,
      logGeneracion: log,
      esUltimaPregunta: preguntas.length <= 1,
    };

    set(nuevoEstado);
    persistirSesion(nuevoEstado);

    return true;
  },

  responderPregunta: (
    opcion: 'A' | 'B' | 'C' | 'D' | null,
    tiempoConsumidoMs?: number
  ) => {
    const state = get();

    if (state.preguntaActual >= state.preguntasSesion.length) return;

    const pregunta = state.preguntasSesion[state.preguntaActual];

    const tiempoBase =
      tiempoConsumidoMs ??
      (state.tiempoPreguntaInicioMs ? Date.now() - state.tiempoPreguntaInicioMs : 0);

    const tiempoConsumidoSeguro = Math.max(0, tiempoBase);
    const esCorrecta = opcion === pregunta.opcion_correcta_id;
    const esBlanca = opcion === null;

    const nuevaRespuesta: RespuestaUsuario = {
      pregunta_id: pregunta.id_pregunta,
      opcion_elegida: opcion,
      es_correcta: esCorrecta,
      tiempo_consumido_ms: tiempoConsumidoSeguro,
      es_blanca: esBlanca,
    };

    const indiceExistente = state.respuestas.findIndex(
      (r) => r.pregunta_id === pregunta.id_pregunta
    );

    const nuevasRespuestas =
      indiceExistente >= 0
        ? state.respuestas.map((r, idx) =>
            idx === indiceExistente ? nuevaRespuesta : r
          )
        : [...state.respuestas, nuevaRespuesta];

    const nuevoEstado: Partial<SessionState> = {
      respuestas: nuevasRespuestas,
    };

    set(nuevoEstado);

    persistirSesion({
      preguntasSesion: state.preguntasSesion,
      respuestas: nuevasRespuestas,
      preguntaActual: state.preguntaActual,
      sesionActiva: state.sesionActiva,
      tiempoInicio: state.tiempoInicio,
      tiempoPreguntaInicioMs: state.tiempoPreguntaInicioMs,
      tiempoTotalMs: state.tiempoTotalMs,
      logGeneracion: state.logGeneracion,
      esUltimaPregunta: state.esUltimaPregunta,
    });
  },

  siguientePregunta: () => {
    const state = get();

    if (state.preguntaActual < state.preguntasSesion.length - 1) {
      const nuevoIndice = state.preguntaActual + 1;
      const nuevoEstado: Partial<SessionState> = {
        preguntaActual: nuevoIndice,
        tiempoPreguntaInicioMs: Date.now(),
        esUltimaPregunta: nuevoIndice === state.preguntasSesion.length - 1,
      };

      set(nuevoEstado);

      persistirSesion({
        preguntasSesion: state.preguntasSesion,
        respuestas: get().respuestas,
        preguntaActual: nuevoIndice,
        sesionActiva: state.sesionActiva,
        tiempoInicio: state.tiempoInicio,
        tiempoPreguntaInicioMs: Date.now(),
        tiempoTotalMs: state.tiempoTotalMs,
        logGeneracion: state.logGeneracion,
        esUltimaPregunta: nuevoIndice === state.preguntasSesion.length - 1,
      });
    } else {
      get().finalizarSesion();
    }
  },

  anteriorPregunta: () => {
    const state = get();

    if (state.preguntaActual > 0) {
      const nuevoIndice = state.preguntaActual - 1;
      const nuevoEstado: Partial<SessionState> = {
        preguntaActual: nuevoIndice,
        tiempoPreguntaInicioMs: Date.now(),
        esUltimaPregunta: nuevoIndice === state.preguntasSesion.length - 1,
      };

      set(nuevoEstado);

      persistirSesion({
        preguntasSesion: state.preguntasSesion,
        respuestas: state.respuestas,
        preguntaActual: nuevoIndice,
        sesionActiva: state.sesionActiva,
        tiempoInicio: state.tiempoInicio,
        tiempoPreguntaInicioMs: Date.now(),
        tiempoTotalMs: state.tiempoTotalMs,
        logGeneracion: state.logGeneracion,
        esUltimaPregunta: nuevoIndice === state.preguntasSesion.length - 1,
      });
    }
  },

  finalizarSesion: () => {
    const state = get();

    set({
      sesionActiva: false,
      tiempoPreguntaInicioMs: null,
    });

    // Si quieres permitir reanudación tras terminar, no lo borres aquí.
    // En esta versión lo limpiamos para dejar claro que la sesión ha concluido.
    eliminarSesionPersistida();

    // Mantenemos preguntas/respuestas en memoria para la pantalla de resultados.
    // Solo se desactiva la sesión activa.
    void state;
  },

  limpiarSesion: () => {
    set({
      preguntasSesion: [],
      respuestas: [],
      preguntaActual: 0,
      sesionActiva: false,
      tiempoInicio: null,
      tiempoPreguntaInicioMs: null,
      tiempoTotalMs: 120 * 60 * 1000,
      logGeneracion: [],
      esUltimaPregunta: false,
    });

    eliminarSesionPersistida();
  },

  obtenerRespuestaActual: () => {
    const state = get();
    const pregunta = state.preguntasSesion[state.preguntaActual];
    if (!pregunta) return undefined;

    return state.respuestas.find((r) => r.pregunta_id === pregunta.id_pregunta);
  },

  obtenerTiempoConsumido: () => {
    const state = get();
    if (!state.tiempoPreguntaInicioMs) return 0;
    return Date.now() - state.tiempoPreguntaInicioMs;
  },
}));