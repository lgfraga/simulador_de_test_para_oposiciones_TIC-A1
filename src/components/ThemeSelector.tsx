import { useState, useMemo } from 'react';
import { X, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { TemaConNumero } from '@/models/types';

interface ThemeSelectorProps {
  temasCargados: TemaConNumero[] | null;
  modo: 'tema' | 'tema_aleatorio';
  onSelect: (numeroTema: number) => void;
  onClose: () => void;
}

export function ThemeSelector({ temasCargados, onSelect, onClose, modo }: ThemeSelectorProps) {
  const [busqueda, setBusqueda] = useState('');
  
  // Deduplicar temas por numero_tema usando Map
  const temasUnicos = useMemo(() => {
    if (!temasCargados) return [];
    const map = new Map<number, TemaConNumero>();
    temasCargados.forEach(tema => {
      if (!map.has(tema.numero_tema)) {
        map.set(tema.numero_tema, tema);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.numero_tema - b.numero_tema);
  }, [temasCargados]);
  
  console.log(`[ThemeSelector] Temas únicos disponibles: ${temasUnicos.length}`);
  
  // Filtrar temas según búsqueda
  const temasFiltrados = useMemo(() => {
    if (!busqueda) return temasUnicos;
    const textoBusqueda = busqueda.toLowerCase();
    return temasUnicos.filter((tema: TemaConNumero) => {
      return (
        tema.numero_tema.toString().includes(textoBusqueda) ||
        tema.nombre_tema.toLowerCase().includes(textoBusqueda)
      );
    });
  }, [temasUnicos, busqueda]);

  // Separar generales (1-27) y específicos (28-133)
  const generales = temasFiltrados.filter((t: TemaConNumero) => t.numero_tema <= 27);
  const especificos = temasFiltrados.filter((t: TemaConNumero) => t.numero_tema >= 28);

  const manejarSeleccion = (numero: number) => {
    onSelect(numero);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {modo === 'tema_aleatorio' ? 'Selecciona un Tema (Orden Aleatorio)' : 'Selecciona un Tema'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Elige un tema del 1 al 133 para comenzar
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por número o nombre del tema..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 h-10"
              autoFocus
            />
          </div>
        </div>

        {/* Tema List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Generales */}
          {generales.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Temas Generales (1-27)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {generales.map((tema) => (
                  <Button
                    key={tema.numero_tema}
                    variant="outline"
                    className="h-auto py-3 px-3 justify-start text-left border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    onClick={() => manejarSeleccion(tema.numero_tema)}
                  >
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Tema {tema.numero_tema.toString().padStart(3, '0')}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {tema.nombre_tema}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Específicos */}
          {especificos.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Temas Específicos (28-133)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {especificos.map((tema) => (
                  <Button
                    key={tema.numero_tema}
                    variant="outline"
                    className="h-auto py-3 px-3 justify-start text-left border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                    onClick={() => manejarSeleccion(tema.numero_tema)}
                  >
                    <div>
                      <p className="font-semibold text-purple-700 dark:text-purple-400">
                        Tema {tema.numero_tema.toString().padStart(3, '0')}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {tema.nombre_tema}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {generales.length === 0 && especificos.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No se encontraron temas</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {temasUnicos.length} temas disponibles • Selecciona uno para comenzar
          </p>
        </div>
      </Card>
    </div>
  );
}
