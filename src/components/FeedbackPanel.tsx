import { cn } from '@/lib/utils';

interface FeedbackPanelProps {
  esCorrecta: boolean;
  justificacion: string;
  referencia: string;
  opcionCorrecta: string;
  opcionElegida: string;
  onContinuar: () => void;
}

/**
 * Panel de feedback que se muestra tras marcar una respuesta.
 * Muestra si es correcta/incorrecta, la justificación y la referencia documental.
 */
export function FeedbackPanel({
  esCorrecta,
  justificacion,
  referencia,
  opcionCorrecta,
  opcionElegida,
  onContinuar,
}: FeedbackPanelProps) {
  return (
    <div className={cn(
      'mt-6 p-5 rounded-xl border-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4',
      esCorrecta
        ? 'border-emerald-500/50 bg-emerald-500/5'
        : 'border-red-500/50 bg-red-500/5'
    )}>
      {/* Encabezado del resultado */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0',
          esCorrecta
            ? 'bg-emerald-500 text-white'
            : 'bg-red-500 text-white'
        )}>
          {esCorrecta ? '✓' : '✕'}
        </div>
        
        <div>
          <h3 className={cn(
            'text-lg font-bold',
            esCorrecta ? 'text-emerald-600' : 'text-red-600'
          )}>
            {esCorrecta ? '¡Respuesta correcta!' : 'Respuesta incorrecta'}
          </h3>
          
          {!esCorrecta && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Elegiste la opción <span className="font-bold">{opcionElegida}</span> — La correcta es{' '}
              <span className="font-bold text-emerald-600">{opcionCorrecta}</span>
            </p>
          )}
          
          {esCorrecta && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Has acertado la opción <span className="font-bold">{opcionElegida}</span>
            </p>
          )}
        </div>
      </div>

      {/* Justificación */}
      {justificacion && (
        <div className={cn(
          'p-4 rounded-lg mb-3',
          esCorrecta
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        )}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">
            Justificación
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {justificacion}
          </p>
        </div>
      )}

      {/* Referencia documental */}
      {referencia && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">
            Referencia documental
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            {referencia}
          </p>
        </div>
      )}

      {/* Botón continuar */}
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={onContinuar}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold 
                     hover:bg-primary/90 active:scale-95 transition-all duration-200
                     shadow-md hover:shadow-lg"
        >
          Continuar con la siguiente pregunta →
        </button>
      </div>
    </div>
  );
}
