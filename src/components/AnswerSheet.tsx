import { cn } from '@/lib/utils';
import type { OpcionInterna } from '@/models/types';

interface AnswerSheetProps {
  opciones: OpcionInterna[];
  seleccionada: 'A' | 'B' | 'C' | 'D' | null;
  correcta: 'A' | 'B' | 'C' | 'D';
  onSeleccionar: (opcion: 'A' | 'B' | 'C' | 'D') => void;
  deshabilitada?: boolean;
  feedbackVisible?: boolean;
}

/**
 * Hoja de respuestas estilo examen oficial BOE.
 * 
 * Patrón visual inspirado en la hoja oficial:
 * - Opciones A B C D con casillas cuadradas para marcar
 * - Al seleccionar, se muestra una X dentro de la casilla
 * - Si feedbackVisible: muestra correcta/incorrecta + justificación + referencia
 */
export function AnswerSheet({
  opciones,
  seleccionada,
  correcta,
  onSeleccionar,
  deshabilitada = false,
  feedbackVisible = false,
}: AnswerSheetProps) {
  const letras: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  
  // Determinar si una opción es la correcta
  const esCorrecta = (opcion: string) => opcion === correcta;
  
  // Determinar el estado visual de cada opción
  const getEstadoOpcion = (opcion: string): 'default' | 'selected' | 'correct' | 'incorrect' => {
    if (!seleccionada && !feedbackVisible) return 'default';
    
    if (feedbackVisible) {
      if (esCorrecta(opcion)) return 'correct';
      if (opcion === seleccionada && !esCorrecta(opcion)) return 'incorrect';
    } else {
      if (opcion === seleccionada) return 'selected';
    }
    return 'default';
  };

  return (
    <div className="w-full mt-6">
      {/* Encabezado estilo hoja oficial */}
      <div className="mb-4 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          Indique la respuesta correcta marcando una X dentro de la casilla correspondiente
        </p>
        
        {/* Letras A B C D en círculos */}
        <div className="flex justify-center gap-3 mb-3">
          {letras.map((letra) => (
            <span
              key={letra}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-muted text-muted-foreground"
            >
              {letra}
            </span>
          ))}
        </div>
      </div>

      {/* Casillas de respuesta */}
      <div className="flex justify-center gap-4 mb-6">
        {opciones.map((opcion, index) => {
          const letra = letras[index] || '';
          const estado = getEstadoOpcion(letra);
          
          // Colores según estado
          let casillaClases = 'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 cursor-pointer ';
          
          if (deshabilitada && !feedbackVisible) {
            casillaClases += 'border-muted bg-muted/50 ';
          } else if (estado === 'correct') {
            casillaClases += 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105 ';
          } else if (estado === 'incorrect') {
            casillaClases += 'border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/30 ';
          } else if (estado === 'selected') {
            casillaClases += 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105 ';
          } else {
            casillaClases += 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 ';
          }

          // Icono dentro de la casilla
          let icono = '';
          if (estado === 'correct' || estado === 'incorrect' || estado === 'selected') {
            icono = '✕';
          }

          return (
            <button
              key={letra}
              type="button"
              className={casillaClases}
              onClick={() => !deshabilitada && onSeleccionar(letra)}
              disabled={deshabilitada}
              aria-label={`Opción ${letra}`}
              title={`Opción ${letra}: ${opcion.texto}`}
            >
              {icono}
            </button>
          );
        })}
      </div>

      {/* Indicador de respuesta correcta (solo en feedback) */}
      {feedbackVisible && seleccionada && (
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-muted-foreground">
            Respuesta correcta:{' '}
            <span className="font-bold text-primary">{correcta}</span>
          </p>
        </div>
      )}

      {/* Opciones detalladas (texto completo) */}
      <div className="space-y-2 mt-4">
        {opciones.map((opcion, index) => {
          const letra = letras[index] || '';
          const estado = getEstadoOpcion(letra);
          
          let opcionClases = 'flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ';
          
          if (estado === 'correct') {
            opcionClases += 'border-emerald-500/50 bg-emerald-500/10 ';
          } else if (estado === 'incorrect') {
            opcionClases += 'border-red-500/50 bg-red-500/10 ';
          } else if (estado === 'selected') {
            opcionClases += 'border-primary/50 bg-primary/5 ';
          } else {
            opcionClases += 'border-transparent hover:bg-muted/50 ';
          }

          // Icono de estado
          let estadoIcon = '';
          if (estado === 'correct') estadoIcon = '✅';
          else if (estado === 'incorrect') estadoIcon = '❌';
          else if (estado === 'selected') estadoIcon = '⬤';

          return (
            <div
              key={letra}
              className={opcionClases}
            >
              {/* Casilla pequeña */}
              <div className={cn(
                'w-7 h-7 rounded-md border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300',
                estado === 'correct' && 'border-emerald-500 bg-emerald-500 text-white',
                estado === 'incorrect' && 'border-red-500 bg-red-500 text-white',
                estado === 'selected' && 'border-primary bg-primary text-primary-foreground',
                !estadoIcon && 'border-muted-foreground/30',
              )}>
                {estadoIcon || letra}
              </div>
              
              {/* Letra */}
              <span className="font-bold text-sm">{letra}.</span>
              
              {/* Texto de la opción */}
              <span className="text-sm leading-relaxed">
                {opcion.texto}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
