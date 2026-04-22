import { cn } from '@/lib/utils';

interface ProgressBarProps {
  actual: number;
  total: number;
  clase?: string;
}

/**
 * Barra de progreso visual entre slides.
 * Muestra el avance del examen con porcentaje y número de preguntas.
 */
export function ProgressBar({ actual, total, clase }: ProgressBarProps) {
  const porcentaje = total > 0 ? (actual / total) * 100 : 0;
  
  // Color según progreso
  let color = 'bg-blue-500';
  if (porcentaje >= 75) color = 'bg-emerald-500';
  else if (porcentaje >= 50) color = 'bg-blue-500';
  else if (porcentaje >= 25) color = 'bg-amber-500';
  else color = 'bg-red-400';

  return (
    <div className={cn('w-full', clase)}>
      {/* Contenedor principal */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Pregunta {actual} de {total}
        </span>
        <span className="text-xs font-bold text-primary">
          {porcentaje.toFixed(0)}%
        </span>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
          style={{ width: `${porcentaje}%` }}
          role="progressbar"
          aria-valuenow={actual}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
      
      {/* Indicadores de bloques */}
      <div className="flex justify-between mt-1.5 px-0.5">
        <span className="text-[10px] text-muted-foreground/70">Específicas</span>
        <span className="text-[10px] text-muted-foreground/70">Generales</span>
      </div>
    </div>
  );
}
