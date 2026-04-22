import { create } from 'zustand';
import type { ModoSeleccion, TemaConNumero } from '@/models/types';

interface UIState {
  // Estado de carga
  temasCargados: TemaConNumero[] | null;
  cargando: boolean;
  error: string | null;

  // Navegación y tema
  vistaActual: ModoSeleccion;
  temaSeleccionado: number | null;
  modoAmpliado: boolean;
  temaDarkMode: boolean;

  // Acciones de UI pura
  cargarTemas: () => Promise<void>;
  seleccionarModo: (modo: ModoSeleccion) => void;
  seleccionarTema: (numero: number) => void;
  setModoAmpliado: (activo: boolean) => void;
  toggleModoAmpliado: (activo: boolean) => void;
  volverInicio: () => void;
  setDarkMode: (activo: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  temasCargados: null,
  cargando: true,
  error: null,
  vistaActual: 'simulacion',
  temaSeleccionado: null,
  modoAmpliado: false,
  temaDarkMode: false,

  cargarTemas: async () => {
    set({ cargando: true, error: null });
    try {
      const temasMap = new Map<number, TemaConNumero>();
      let exitosos = 0;
      let errores = 0;
      
      for (let i = 1; i <= 133; i++) {
        const num = i.toString().padStart(3, '0');
        const url = `/dataset_temas/dataset_tema${num}.json`;
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            const data: any = await resp.json();
            // Usar Map para evitar duplicados por numero_tema
            temasMap.set(i, { ...data, numero_tema: i });
            exitosos++;
          } else {
            errores++;
          }
        } catch (e) {
          errores++;
        }
      }
      
      // Convertir Map a array y ordenar por numero_tema
      const temasOrdenados = Array.from(temasMap.values()).sort(
        (a, b) => a.numero_tema - b.numero_tema
      );
      
      console.log(`[UIStore] Temas cargados: ${temasOrdenados.length} únicos (${exitosos} exitosos, ${errores} errores)`);
      set({ temasCargados: temasOrdenados, cargando: false });
    } catch (e) {
      console.error('[UIStore] Error al cargar temas:', e);
      set({
        error: `Error al cargar los temas.`,
        cargando: false,
      });
    }
  },

  seleccionarModo: (modo: ModoSeleccion) => {
    set({ vistaActual: modo, temaSeleccionado: null });
  },

  seleccionarTema: (numero: number) => {
    set({ temaSeleccionado: numero });
  },

  setModoAmpliado: (activo: boolean) => {
    set({ modoAmpliado: activo });
  },

  toggleModoAmpliado: (activo: boolean) => {
    set({ modoAmpliado: activo });
  },

  volverInicio: () => {
    set({
      vistaActual: 'simulacion',
      temaSeleccionado: null,
    });
  },

  setDarkMode: (activo: boolean) => {
    set({ temaDarkMode: activo });
  },
}));
