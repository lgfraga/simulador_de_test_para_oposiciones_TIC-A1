import { useState } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeSelector } from '@/components/ThemeSelector';
import {
  ClipboardList,
  BookOpen,
  GraduationCap,
  FileText,
  Shuffle,
  Info,
  AlertTriangle,
} from 'lucide-react';

type BadgeColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';

const badgeColors: Record<BadgeColor, string> = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
};

const buttonColors: Record<BadgeColor, string> = {
  blue: 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/50',
  emerald:
    'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/50',
  purple:
    'border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950/50',
  amber:
    'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/50',
  rose: 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/50',
};

export function HomePage() {
  const iniciarSesion = useSessionStore((s) => s.iniciarSesion);
  const limpiarSesion = useSessionStore((s) => s.limpiarSesion);
  const sesionActiva = useSessionStore((s) => s.sesionActiva);
  const { modoAmpliado, toggleModoAmpliado, temasCargados } = useUIStore();

  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarSelectorTema, setMostrarSelectorTema] = useState(false);
  const [modoPendiente, setModoPendiente] = useState<'tema' | 'tema_aleatorio' | null>(null);

  const temasListos = Array.isArray(temasCargados) && temasCargados.length > 0;

  // Mapa de modos a sus claves internas en sessionStore
  const modoMap: Record<string, string> = {
    simulacion: 'simulacion_completa',
    general: 'solo_general',
    especifico: 'solo_especifico',
    tema: 'por_tema',
    tema_aleatorio: 'por_tema_aleatorio',
  };

  const manejarComenzar = async (modoId: string) => {
    if (cargando) return;

    setError(null);

    if (!temasListos) {
      setError('Los temas todavía se están cargando. Espera unos segundos e inténtalo de nuevo.');
      return;
    }

    setCargando(true);

    // Si hay sesión activa, limpiar primero
    if (sesionActiva) {
      limpiarSesion();
    }

    const modoInterno = modoMap[modoId];
    if (!modoInterno) {
      setError('Modo de examen no válido.');
      setCargando(false);
      return;
    }

    // Para modos por tema, necesitamos abrir el selector
    if (modoId === 'tema' || modoId === 'tema_aleatorio') {
      setModoPendiente(modoId as 'tema' | 'tema_aleatorio');
      setMostrarSelectorTema(true);
      setCargando(false);
      return;
    }

    const exito = await iniciarSesion(temasCargados, modoInterno as any);

    if (!exito) {
      setError(
        'No se pudieron cargar los temas. Asegúrate de que los datos JSON están en dataset_temas/.'
      );
    }

    setCargando(false);
  };

  const modos = [
    {
      id: 'simulacion',
      titulo: 'Simulación de Examen',
      descripcion:
        'Simula el examen completo: bloque específico + bloque general con selección aleatoria.',
      icono: ClipboardList,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Principal',
      badgeColor: 'blue' as BadgeColor,
    },
    {
      id: 'general',
      titulo: 'Examinar Temas Generales',
      descripcion:
        'Solo bloque general: 30 preguntas oficiales + 3 adicionales de los temas 1-27.',
      icono: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Bloque B',
      badgeColor: 'emerald' as BadgeColor,
    },
    {
      id: 'especifico',
      titulo: 'Examinar Temas Específicos',
      descripcion:
        'Solo bloque específico: 100 preguntas oficiales + 5 adicionales de los temas 28-133.',
      icono: GraduationCap,
      color: 'from-purple-500 to-violet-600',
      badge: 'Bloque A',
      badgeColor: 'purple' as BadgeColor,
    },
    {
      id: 'tema',
      titulo: 'Examinar por Tema',
      descripcion: 'Selecciona un tema concreto y responde todas sus preguntas en orden.',
      icono: FileText,
      color: 'from-amber-500 to-orange-600',
      badge: 'Individual',
      badgeColor: 'amber' as BadgeColor,
    },
    {
      id: 'tema_aleatorio',
      titulo: 'Tema con Preguntas Aleatorias',
      descripcion:
        'Selecciona un tema y responde todas sus preguntas pero en orden aleatorio.',
      icono: Shuffle,
      color: 'from-rose-500 to-pink-600',
      badge: 'Aleatorio',
      badgeColor: 'rose' as BadgeColor,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Simulador de Test para Oposiciones
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cuerpo Superior TIC — A1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMostrarInfo(!mostrarInfo)}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Información del examen"
            >
              <Info className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        </div>
      </header>

      {/* Info BOE panel */}
      {mostrarInfo && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
                <AlertTriangle className="w-4 h-4" />
                Información Oficial del Examen (BOE)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Duración</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">120 min</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Preguntas máx.</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">130</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nota mínima/máxima
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">30 / 60</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Penalización</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">−1/3</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Nota: La puntuación directa mínima exacta la fija el tribunal. Esta app muestra una
                nota simulada para entrenamiento. <br />
                El Modo ampliado incluye 5 preguntas adicionales sobre temas específicos y 3
                preguntas adicionales sobre temas generales.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-4 h-6 px-2 text-red-600 dark:text-red-400"
              onClick={() => setError(null)}
            >
              ×
            </Button>
          </div>
        )}

        {/* Estado de carga de temas */}
        {!temasListos && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
            Cargando temas... Espera a que termine la carga antes de comenzar un examen.
          </div>
        )}

        {/* Modo ampliado toggle */}
        <div className="flex items-center justify-center mb-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Modo estricto BOE
            </span>
            <div
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                modoAmpliado
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
              onClick={() => toggleModoAmpliado(!modoAmpliado)}
              role="switch"
              aria-checked={modoAmpliado}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleModoAmpliado(!modoAmpliado);
                }
              }}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  modoAmpliado ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Modo ampliado
            </span>
          </label>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modos.map((modo) => {
            const Icono = modo.icono;
            const bloqueada = cargando || !temasListos;

            return (
              <Card
                key={modo.id}
                className={`group relative overflow-hidden border-0 shadow-lg transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${
                  bloqueada ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
                }`}
                onClick={() => {
                  if (!bloqueada) {
                    manejarComenzar(modo.id);
                  }
                }}
              >
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${modo.color}`} />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${modo.color} flex items-center justify-center shadow-lg transition-transform duration-300 ${
                        bloqueada ? '' : 'group-hover:scale-110'
                      }`}
                    >
                      <Icono className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className={badgeColors[modo.badgeColor]}>
                      {modo.badge}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-base leading-tight">{modo.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {modo.descripcion}
                  </p>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bloqueada}
                      className={`w-full ${buttonColors[modo.badgeColor]}`}
                    >
                      {cargando ? 'Cargando...' : !temasListos ? 'Cargando temas...' : 'Comenzar →'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer note */}
        <footer className="text-center text-xs text-slate-400 dark:text-slate-500 mt-10 pb-6">
          <p>Simulador de Test para Oposiciones Cuerpo Superior TIC A1 — Luis González Fraga</p>
          <p className="mt-1 italic">
            Las preguntas se inspiran en los temas incluidos en la convocatoria oficial publicada en
            el BOE.
          </p>
        </footer>
      </main>

      {/* Modal selector de tema */}
      {mostrarSelectorTema && modoPendiente && (
        <ThemeSelector
          temasCargados={temasCargados}
          modo={modoPendiente}
          onClose={() => setMostrarSelectorTema(false)}
          onSelect={async (numeroTema) => {
            setMostrarSelectorTema(false);

            if (!temasListos) {
              setError('Los temas todavía no están disponibles.');
              setCargando(false);
              return;
            }

            const modoSeleccionado = modoPendiente;
            setModoPendiente(null);

            const modoInterno =
              modoSeleccionado === 'tema_aleatorio' ? 'por_tema_aleatorio' : 'por_tema';

            const exito = await iniciarSesion(temasCargados, modoInterno as any, numeroTema);

            if (!exito) {
              setError(
                'No se pudo iniciar la sesión con el tema seleccionado. Verifica los datos cargados.'
              );
            }

            setCargando(false);
          }}
        />
      )}
    </div>
  );
}