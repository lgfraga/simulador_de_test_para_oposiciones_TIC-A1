import { cn } from '@/lib/utils';

type TipoPregunta = 'oficial' | 'adicional';
type Bloque = 'especifico' | 'general';

interface BadgeTipoProps {
  tipo: TipoPregunta;
  bloque?: Bloque;
  clase?: string;
}

/**
 * Badge que indica si una pregunta es oficial o adicional.
 */
export function BadgeTipo({ tipo, bloque, clase }: BadgeTipoProps) {
  const esAdicional = tipo === 'adicional';
  
  let badgeClases = cn(
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
    clase
  );

  if (esAdicional) {
    badgeClases += ' bg-amber-500/15 text-amber-600 border border-amber-500/30';
  } else {
    badgeClases += ' bg-blue-500/15 text-blue-600 border border-blue-500/30';
  }

  return (
    <span className={badgeClases}>
      {/* Icono */}
      <span className="w-2 h-2 rounded-full shrink-0" 
            style={{ backgroundColor: esAdicional ? '#f59e0b' : '#3b82f6' }} />
      
      {esAdicional ? 'Pregunta adicional' : 'Pregunta oficial'}
      
      {bloque && (
        <>
          <span className="text-muted-foreground/60">·</span>
          {bloque === 'especifico' ? 'Específica' : 'General'}
        </>
      )}
    </span>
  );
}
