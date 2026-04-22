import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AnswerSheet } from './AnswerSheet';
import { FeedbackPanel } from './FeedbackPanel';
import { ProgressBar } from './ProgressBar';
import { BadgeTipo } from './BadgeTipo';
import { TimerDisplay } from './TimerDisplay';
import type { PreguntaNormalizada, RespuestaUsuario } from '@/models/types';

interface SlideQuestionProps {
  pregunta: PreguntaNormalizada;
  numeroPregunta: number;
  totalPreguntas: number;
  tiempoObjetivoSegundos?: number;
  onFinalizar: (respuesta: RespuestaUsuario) => void;
  onSiguiente: () => void;
  modoEstudio?: boolean;
}

/**
 * Slide individual de pregunta.
 * Muestra el enunciado, las opciones tipo hoja de examen,
 * feedback inmediato y navegación.
 */
export function SlideQuestion({
  pregunta,
  numeroPregunta,
  totalPreguntas,
  tiempoObjetivoSegundos = 52.17,
  onFinalizar,
  onSiguiente,
  modoEstudio = false,
}: SlideQuestionProps) {
  const [seleccionada, setSeleccionada] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(tiempoObjetivoSegundos);
  const [activo] = useState(true);

  // La opción correcta ya viene como 'A' | 'B' | 'C' | 'D' en PreguntaNormalizada
  const letraCorrecta = pregunta.opcion_correcta_id;
  const esCorrecta = seleccionada === letraCorrecta;

  // Temporizador por pregunta
  useEffect(() => {
    if (!activo || respondida) return;

    setTiempoRestante(tiempoObjetivoSegundos);
    
    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => {
        const nuevo = prev - 0.1;
        if (nuevo <= 0) {
          clearInterval(intervalo);
          handleTimeout();
          return 0;
        }
        return nuevo;
      });
    }, 100);

    return () => clearInterval(intervalo);
  }, [activo, respondida, tiempoObjetivoSegundos]);

  const handleTimeout = useCallback(() => {
    if (respondida) return;
    
    setRespondida(true);
    onFinalizar({
      pregunta_id: pregunta.id_pregunta,
      opcion_elegida: null,
      es_correcta: false,
      es_blanca: true,
      tiempo_consumido_ms: tiempoObjetivoSegundos * 1000,
    });
  }, [respondida, pregunta, onFinalizar, tiempoObjetivoSegundos]);

  // Manejar selección de respuesta
  const handleSeleccionar = (opcion: 'A' | 'B' | 'C' | 'D') => {
    if (respondida) return;
    
    setSeleccionada(opcion);
    setRespondida(true);
    
    onFinalizar({
      pregunta_id: pregunta.id_pregunta,
      opcion_elegida: opcion,
      es_correcta: opcion === letraCorrecta,
      es_blanca: false,
      tiempo_consumido_ms: (tiempoObjetivoSegundos - tiempoRestante) * 1000,
    });
  };

  // Atajos de teclado (A/B/C/D + Enter)
  useEffect(() => {
    if (!activo || respondida) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSeleccionar(key as 'A' | 'B' | 'C' | 'D');
      } else if (key === 'ENTER' && respondida) {
        onSiguiente();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activo, respondida, letraCorrecta, onSiguiente]);

  // Determinar si mostrar feedback
  const mostrarFeedback = respondida && (modoEstudio || true);

  return (
    <div className={cn(
      'w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500',
      respondida && 'opacity-90'
    )}>
      {/* Header de la slide */}
      <div className="mb-6">
        {/* Barra de progreso superior */}
        <ProgressBar actual={numeroPregunta} total={totalPreguntas} clase="mb-4" />
        
        {/* Badges y número de pregunta */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-foreground">
              {numeroPregunta}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ {totalPreguntas}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <BadgeTipo 
              tipo={pregunta.tipo} 
              bloque={pregunta.bloque}
            />
          </div>
        </div>
        
        {/* Tema y bloque */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold">{pregunta.tema_nombre}</span>
          <span>·</span>
          <span>{pregunta.bloque === 'especifico' ? 'Bloque específico' : 'Bloque general'}</span>
        </div>
      </div>

      {/* Enunciado */}
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
          {pregunta.enunciado}
        </h2>
      </div>

      {/* AnswerSheet - Hoja de respuestas estilo BOE */}
      <AnswerSheet
        opciones={pregunta.opciones}
        seleccionada={seleccionada}
        correcta={letraCorrecta}
        onSeleccionar={handleSeleccionar}
        deshabilitada={respondida}
        feedbackVisible={mostrarFeedback}
      />

      {/* Feedback Panel */}
      {mostrarFeedback && respondida && (
        <FeedbackPanel
          esCorrecta={esCorrecta}
          justificacion={pregunta.justificacion || ''}
          referencia={pregunta.referencia || ''}
          opcionCorrecta={letraCorrecta}
          opcionElegida={seleccionada || '—'}
          onContinuar={onSiguiente}
        />
      )}

      {/* Timer y navegación inferior */}
      <div className="mt-6 flex items-center justify-between">
        {/* Timer */}
        <TimerDisplay
          tiempoRestante={tiempoRestante}
          tiempoTotal={tiempoObjetivoSegundos}
          respondida={respondida}
        />

        {/* Atajos de teclado */}
        {!respondida && (
          <div className="text-xs text-muted-foreground hidden md:block">
            Presiona <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">A</kbd>
            {' '}<kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">B</kbd>
            {' '}<kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">C</kbd>
            {' '}<kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">D</kbd>
            {' '}para responder
          </div>
        )}

        {/* Botón continuar (solo tras responder) */}
        {respondida && (
          <button
            type="button"
            onClick={onSiguiente}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold 
                       hover:bg-primary/90 active:scale-95 transition-all duration-200
                       shadow-md hover:shadow-lg flex items-center gap-2"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
