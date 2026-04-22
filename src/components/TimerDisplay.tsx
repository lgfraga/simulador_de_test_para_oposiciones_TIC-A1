import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  tiempoRestante: number;
  tiempoTotal: number;
  respondida?: boolean;
}

/**
 * Display del temporizador por pregunta.
 * Muestra el tiempo restante con indicador visual de urgencia.
 */
export function TimerDisplay({ tiempoRestante, tiempoTotal, respondida }: TimerDisplayProps) {
  const porcentaje = tiempoTotal > 0 ? (tiempoRestante / tiempoTotal) * 100 : 0;
  
  // Color según urgencia
  let color = 'text-emerald-500';
  let bgColor = 'bg-emerald-500';
  if (porcentaje <= 20) {
    color = 'text-red-500';
    bgColor = 'bg-red-500';
  } else if (porcentaje <= 40) {
    color = 'text-amber-500';
    bgColor = 'bg-amber-500';
  }

  // Formatear tiempo
  const mins = Math.floor(tiempoRestante / 60);
  const secs = Math.floor(tiempoRestante % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  if (respondida) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-semibold text-muted-foreground">Respondida</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Mini barra de tiempo */}
      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', bgColor)}
          style={{ width: `${Math.max(0, porcentaje)}%` }}
        />
      </div>
      
      {/* Tiempo restante */}
      <div className={cn('text-lg font-mono font-bold tabular-nums', color)}>
        {timeStr}
      </div>
    </div>
  );
}
