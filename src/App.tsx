import { useEffect } from 'react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { HomePage } from '@/pages/HomePage';
import { ExamPage } from '@/pages/ExamPage';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';

function App() {
  const sesionActiva = useSessionStore(s => s.sesionActiva);
  const cargarTemas = useUIStore(s => s.cargarTemas);

  // Cargar temas al iniciar la aplicación
  useEffect(() => {
    cargarTemas();
  }, [cargarTemas]);

  return (
    <ThemeProvider>
      {sesionActiva ? <ExamPage /> : <HomePage />}
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
