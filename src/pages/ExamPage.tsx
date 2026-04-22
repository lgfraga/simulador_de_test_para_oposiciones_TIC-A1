import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { AnswerSheet } from '@/components/AnswerSheet';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { ProgressBar } from '@/components/ProgressBar';
import { BadgeTipo } from '@/components/BadgeTipo';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import {
  calcularResultado,
  formatearTiempo,
  formatearTiempoCorto,
} from '@/lib/scoring';

export function ExamPage() {
  const preguntasSesion = useSessionStore((s) => s.preguntasSesion);
  const respuestas = useSessionStore((s) => s.respuestas);
  const preguntaActualIdx = useSessionStore((s) => s.preguntaActual);
  const sesionActiva = useSessionStore((s) => s.sesionActiva);
  const tiempoTotalMs = useSessionStore((s) => s.tiempoTotalMs);
  const tiempoInicio = useSessionStore((s) => s.tiempoInicio);
  const responderPregunta = useSessionStore((s) => s.responderPregunta);
  const siguientePregunta = useSessionStore((s) => s.siguientePregunta);
  const anteriorPregunta = useSessionStore((s) => s.anteriorPregunta);
  const obtenerTiempoConsumido = useSessionStore((s) => s.obtenerTiempoConsumido);
  const limpiarSesion = useSessionStore((s) => s.limpiarSesion);

  const [opcionSeleccionada, setOpcionSeleccionada] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [tiempoPreguntaRestante, setTiempoPreguntaRestante] = useState(0);
  const [ahora, setAhora] = useState(Date.now());

  const timerGlobalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerPreguntaRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPreguntas = preguntasSesion.length;
  const preguntaActual =
    totalPreguntas > 0 ? preguntasSesion[Math.min(preguntaActualIdx, totalPreguntas - 1)] : null;
  const esUltimaPregunta = totalPreguntas > 0 && preguntaActualIdx === totalPreguntas - 1;

  const tiempoObjetivoPreguntaMs =
    totalPreguntas > 0 ? Math.round(tiempoTotalMs / totalPreguntas) : 52170;
  const tiempoObjetivoPreguntaSeg = tiempoObjetivoPreguntaMs / 1000;

  const resultadoSesion = useMemo(() => {
    const respuestasMap = new Map<string, 'A' | 'B' | 'C' | 'D' | null>();
    const tiemposMap = new Map<string, number>();

    for (const r of respuestas) {
      respuestasMap.set(r.pregunta_id, r.opcion_elegida);
      tiemposMap.set(r.pregunta_id, r.tiempo_consumido_ms);
    }

    return calcularResultado(preguntasSesion, respuestasMap, tiemposMap, 'no_computan');
  }, [preguntasSesion, respuestas]);

  const respuestaActualExistente = useMemo(() => {
    if (!preguntaActual) return undefined;
    return respuestas.find((r) => r.pregunta_id === preguntaActual.id_pregunta);
  }, [respuestas, preguntaActual]);

  const tiempoGlobalRestante =
    tiempoInicio != null
      ? Math.max(0, tiempoTotalMs / 1000 - (ahora - tiempoInicio) / 1000)
      : 0;

  const detenerTemporizadores = useCallback(() => {
    if (timerGlobalRef.current) {
      clearInterval(timerGlobalRef.current);
      timerGlobalRef.current = null;
    }
    if (timerPreguntaRef.current) {
      clearInterval(timerPreguntaRef.current);
      timerPreguntaRef.current = null;
    }
  }, []);

  const manejarRespuesta = useCallback(
    (opcion: 'A' | 'B' | 'C' | 'D') => {
      if (!preguntaActual || respondida || mostrarResultados) return;

      const tiempoConsumidoMs = obtenerTiempoConsumido();

      setOpcionSeleccionada(opcion);
      setRespondida(true);
      responderPregunta(opcion, tiempoConsumidoMs);

      if (timerPreguntaRef.current) {
        clearInterval(timerPreguntaRef.current);
        timerPreguntaRef.current = null;
      }
    },
    [preguntaActual, respondida, mostrarResultados, obtenerTiempoConsumido, responderPregunta]
  );

  const manejarContinuar = useCallback(() => {
    if (mostrarResultados) return;

    setOpcionSeleccionada(null);
    setRespondida(false);

    if (esUltimaPregunta) {
      detenerTemporizadores();
      setMostrarResultados(true);
    } else {
      siguientePregunta();
    }
  }, [mostrarResultados, esUltimaPregunta, detenerTemporizadores, siguientePregunta]);

  useEffect(() => {
    if (mostrarResultados || !preguntaActual || tiempoInicio == null) return;

    if (timerGlobalRef.current) {
      clearInterval(timerGlobalRef.current);
    }

    timerGlobalRef.current = setInterval(() => {
      const now = Date.now();
      setAhora(now);

      const restanteMs = Math.max(0, tiempoTotalMs - (now - tiempoInicio));

      if (restanteMs <= 0) {
        detenerTemporizadores();

        if (!respuestaActualExistente) {
          responderPregunta(null, obtenerTiempoConsumido());
        }

        setMostrarResultados(true);
      }
    }, 250);

    return () => {
      if (timerGlobalRef.current) {
        clearInterval(timerGlobalRef.current);
        timerGlobalRef.current = null;
      }
    };
  }, [
    mostrarResultados,
    preguntaActual,
    tiempoInicio,
    tiempoTotalMs,
    respuestaActualExistente,
    obtenerTiempoConsumido,
    responderPregunta,
    detenerTemporizadores,
  ]);

  useEffect(() => {
    if (mostrarResultados || !preguntaActual) return;

    if (timerPreguntaRef.current) {
      clearInterval(timerPreguntaRef.current);
      timerPreguntaRef.current = null;
    }

    if (respuestaActualExistente) {
      setOpcionSeleccionada(
        (respuestaActualExistente.opcion_elegida as 'A' | 'B' | 'C' | 'D' | null) ?? null
      );
      setRespondida(true);
      setTiempoPreguntaRestante(0);
      return;
    }

    setOpcionSeleccionada(null);
    setRespondida(false);
    setTiempoPreguntaRestante(tiempoObjetivoPreguntaSeg);

    let tiempoActual = tiempoObjetivoPreguntaSeg;

    timerPreguntaRef.current = setInterval(() => {
      tiempoActual = Math.max(0, tiempoActual - 1);
      setTiempoPreguntaRestante(tiempoActual);

      if (tiempoActual <= 0) {
        if (timerPreguntaRef.current) {
          clearInterval(timerPreguntaRef.current);
          timerPreguntaRef.current = null;
        }

        responderPregunta(null, obtenerTiempoConsumido());
        setRespondida(true);

        window.setTimeout(() => {
          if (esUltimaPregunta) {
            detenerTemporizadores();
            setMostrarResultados(true);
          } else {
            siguientePregunta();
          }
        }, 250);
      }
    }, 1000);

    return () => {
      if (timerPreguntaRef.current) {
        clearInterval(timerPreguntaRef.current);
        timerPreguntaRef.current = null;
      }
    };
  }, [
    mostrarResultados,
    preguntaActualIdx,
    preguntaActual,
    respuestaActualExistente,
    tiempoObjetivoPreguntaSeg,
    responderPregunta,
    obtenerTiempoConsumido,
    esUltimaPregunta,
    siguientePregunta,
    detenerTemporizadores,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mostrarResultados || !preguntaActual) return;

      if (respondida) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          manejarContinuar();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'a':
          manejarRespuesta('A');
          break;
        case 'b':
          manejarRespuesta('B');
          break;
        case 'c':
          manejarRespuesta('C');
          break;
        case 'd':
          manejarRespuesta('D');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mostrarResultados, preguntaActual, respondida, manejarContinuar, manejarRespuesta]);

  if ((!sesionActiva && !mostrarResultados && preguntasSesion.length === 0) || (!preguntaActual && !mostrarResultados)) {
    return null;
  }

  if (mostrarResultados) {
    const { puntuacionDirecta, puntuacionSimuladaSobre60, resumen } = resultadoSesion;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Examen Finalizado
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Aquí tienes el resumen de tu rendimiento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center space-y-1">
              <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {resumen.aciertos}
              </p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Aciertos
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center space-y-1">
              <p className="text-4xl font-black text-red-600 dark:text-red-400">
                {resumen.errores}
              </p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Errores
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center space-y-1">
              <p className="text-4xl font-black text-slate-600 dark:text-slate-400">
                {resumen.blancas}
              </p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Blancas
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Puntuación</h3>

            <div className="text-5xl font-black text-blue-600 dark:text-blue-400">
              {puntuacionDirecta.toFixed(2)}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Puntuación directa bruta
            </p>

            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nota simulada sobre 60:{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {puntuacionSimuladaSobre60.toFixed(2)}
                </span>{' '}
                puntos
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Nota orientativa. La nota oficial la fija el tribunal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">Tiempos</h3>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tiempo total del test:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatearTiempo(Math.round(resumen.tiempoTotal))}
                </span>
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tiempo medio por pregunta:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatearTiempoCorto(Math.round(resumen.tiempoMedioPorPregunta * 1000))}
                </span>
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Preguntas respondidas:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {resumen.preguntasRespondidas}
                </span>
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Preguntas sin responder:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {resumen.preguntasSinResponder}
                </span>
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">Rendimiento temporal</h3>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Más rápida:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {resumen.preguntaMasRapida
                    ? `${resumen.preguntaMasRapida.id} · ${formatearTiempoCorto(
                        resumen.preguntaMasRapida.tiempo
                      )}`
                    : '—'}
                </span>
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Más lenta:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {resumen.preguntaMasLenta
                    ? `${resumen.preguntaMasLenta.id} · ${formatearTiempoCorto(
                        resumen.preguntaMasLenta.tiempo
                      )}`
                    : '—'}
                </span>
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Fuera de media:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {resumen.fueraDeMedia.length}
                </span>
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                Porcentaje de acierto:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {resumen.porcentajeAcierto.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                detenerTemporizadores();
                limpiarSesion();
                window.location.hash = '#/';
              }}
              variant="default"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <BadgeTipo tipo={preguntaActual.tipo} />
          <TimerDisplay
            tiempoTotal={tiempoTotalMs / 1000}
            tiempoRestante={tiempoGlobalRestante}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-6">
          <ProgressBar actual={preguntaActualIdx + 1} total={totalPreguntas} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {preguntaActualIdx + 1}
                <span className="text-sm font-normal text-slate-500 ml-1">/ {totalPreguntas}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold">{preguntaActual.tema_nombre}</span>
              <span>·</span>
              <span>
                {preguntaActual.bloque === 'especifico' ? 'Bloque específico' : 'Bloque general'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {preguntaActual.enunciado}
            </h2>

            <AnswerSheet
              opciones={preguntaActual.opciones}
              seleccionada={opcionSeleccionada}
              correcta={preguntaActual.opcion_correcta_id}
              onSeleccionar={manejarRespuesta}
              deshabilitada={respondida}
              feedbackVisible={respondida}
            />

            {respondida && (
              <FeedbackPanel
                esCorrecta={opcionSeleccionada === preguntaActual.opcion_correcta_id}
                opcionElegida={opcionSeleccionada || '—'}
                opcionCorrecta={preguntaActual.opcion_correcta_id}
                justificacion={preguntaActual.justificacion}
                referencia={preguntaActual.referencia || ''}
                onContinuar={manejarContinuar}
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <TimerDisplay
              tiempoRestante={respondida ? 0 : tiempoPreguntaRestante}
              tiempoTotal={tiempoObjetivoPreguntaSeg}
              respondida={respondida}
            />

            {!respondida && (
              <div className="text-xs text-slate-400 dark:text-slate-500 hidden md:block">
                Presiona{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                  A
                </kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                  B
                </kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                  C
                </kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                  D
                </kbd>{' '}
                para responder
              </div>
            )}

            {respondida ? (
              <Button onClick={manejarContinuar} className="gap-2">
                {esUltimaPregunta ? 'Ver Resultados' : 'Siguiente'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={anteriorPregunta}
                disabled={preguntaActualIdx === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}