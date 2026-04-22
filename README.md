# Simulador de Test para Oposiciones — Cuerpo Superior TIC A1

Aplicación web local para practicar el **primer ejercicio tipo test** de las oposiciones al **Cuerpo Superior de Sistemas y Tecnologías de la Información de la Administración del Estado (A1)**.

El aplicativo permite simular exámenes completos, practicar por bloques y examinar por tema, utilizando como base una colección de **133 ficheros JSON** con preguntas, opciones, justificación y referencia.

---
## Capturas del aplicativo

<p align="center">
  <a href="docs/images/Screenshot%202026-04-22%20051046.png" target="_blank">
    <img src="docs/images/Screenshot%202026-04-22%20051046.png" alt="Inicio" width="35%">
  </a>
  &nbsp;
  <a href="docs/images/Screenshot%202026-04-22%20051107.png" target="_blank">
    <img src="docs/images/Screenshot%202026-04-22%20051107.png" alt="Temas" width="35%">
  </a>
</p>

<p align="center">
  <a href="docs/images/Screenshot%202026-04-22%20051129.png" target="_blank">
    <img src="docs/images/Screenshot%202026-04-22%20051129.png" alt="Exámen" width="35%">
  </a>
  &nbsp;
  <a href="docs/images/Screenshot%202026-04-22%20051239.png" target="_blank">
    <img src="docs/images/Screenshot%202026-04-22%20051239.png" alt="Test" width="35%">
  </a>
</p>
---
## Características principales

- Simulación del examen completo tipo test.
- Modos de examen:
  - **Simulación completa**
  - **Solo temas generales**
  - **Solo temas específicos**
  - **Examinar por tema**
  - **Examinar por tema en orden aleatorio**
- Corrección automática.
- Penalización por fallo: **-1/3**.
- Respuestas en blanco: **no penalizan**.
- Temporizador global y temporizador por pregunta.
- Estadísticas al finalizar:
  - aciertos
  - errores
  - blancas
  - puntuación directa bruta
  - nota simulada sobre 60
  - tiempo total
  - tiempo medio por pregunta
  - pregunta más rápida / más lenta
  - porcentaje de acierto
- Persistencia local de sesión mediante `localStorage`.
- Funcionamiento **sin backend** en esta versión.
- Aplicación basada en **React + TypeScript + Vite**.

---

## Aviso importante sobre la calificación

La aplicación calcula:

- **Puntuación directa bruta**:  
  `aciertos - errores / 3`
- **Nota simulada sobre 60**

La **nota simulada sobre 60 es orientativa**.  
La **calificación oficial real** depende de la convocatoria y del criterio del tribunal.

---

## Estado actual del proyecto

- Proyecto funcional en entorno local.
- No requiere backend.
- La fuente de datos está formada por ficheros JSON estáticos.
- El modo oscuro **no está incluido actualmente**.

---

## Tecnologías utilizadas

### Frontend
- React
- TypeScript
- Vite
- Zustand
- Tailwind CSS
- Lucide React

### Datos
- JSON estáticos en `dataset_temas/`

### Scripts auxiliares opcionales
- Python 3
- `venv` para aislamiento del entorno Python

---

## Requisitos previos

### Windows 11

Necesitas tener instalado:

- **Git**
- **Node.js**
- **npm**  
  (normalmente viene incluido con Node.js)

Opcionalmente, para scripts auxiliares de validación/saneamiento:

- **Python 3**
- soporte para `venv`

---

### Linux (AlmaLinux, Rocky, Fedora, Ubuntu, Debian, etc.)

Necesitas tener instalado:

- **Git**
- **Node.js**
- **npm**

Opcionalmente, para scripts Python:

- **Python 3**
- paquete `venv`

---

## Dependencias del proyecto

Las dependencias JavaScript del proyecto se instalan desde el propio `package.json`.

En otras palabras:

- **no copies `node_modules` entre máquinas**
- **no copies binarios generados**
- tras clonar o copiar el proyecto, ejecuta siempre:

```bash
npm install
```

O, si quieres una instalación limpia basada en el lockfile:

```bash
npm ci
```

---

## Clonar el proyecto

```bash
git clone https://github.com/lgfraga/simulador_de_test_para_oposiciones_TIC-A1.git
cd simulador_de_test_para_oposiciones_TIC-A1
```

---

## Instalación en local

### Windows 11

#### 1. Clonar el repositorio

```powershell
git clone https://github.com/lgfraga/simulador_de_test_para_oposiciones_TIC-A1.git
cd simulador_de_test_para_oposiciones_TIC-A1
```

#### 2. Instalar dependencias JavaScript

```powershell
npm install
```

#### 3. Ejecutar la aplicación en modo desarrollo

```powershell
npm run dev
```

#### 4. Abrir la aplicación en el navegador

Normalmente Vite mostrará una URL como:

```text
http://localhost:5173
```

Ábrela en tu navegador.

---

### Linux

#### 1. Clonar el repositorio

```bash
git clone https://github.com/lgfraga/simulador_de_test_para_oposiciones_TIC-A1.git
cd simulador_de_test_para_oposiciones_TIC-A1
```

#### 2. Instalar dependencias JavaScript

```bash
npm install
```

#### 3. Ejecutar la aplicación en modo desarrollo

```bash
npm run dev
```

#### 4. Abrir la aplicación en el navegador

Normalmente en:

```text
http://localhost:5173
```

Si quieres exponerla a la red local:

```bash
npm run dev -- --host 0.0.0.0
```

---

## Compilación para producción

Si quieres generar una build estática:

```bash
npm run build
```

Esto generará la carpeta `dist/`.

Para probar localmente la build generada:

```bash
npm run preview
```

---

## Ejecución en otra máquina Linux tras copiar el proyecto

Si copias el proyecto manualmente a otra estación Linux:

### Recomendaciones

- **Sí copiar**:
  - `src/`
  - `public/` si existe
  - `dataset_temas/`
  - `package.json`
  - `package-lock.json` si existe
  - `vite.config.*`
  - `tsconfig*.json`
  - resto del código fuente

- **No copiar**:
  - `node_modules/`
  - `dist/`
  - `.venv/`
  - caches temporales

### Pasos

```bash
cd /ruta/del/proyecto
npm install
npm run dev
```

O para producción:

```bash
npm install
npm run build
npm run preview
```

---

## Uso de entorno virtual Python

### ¿Es obligatorio?

**No para el frontend React.**

La aplicación web funciona con **Node.js + npm**.

### ¿Cuándo sí usar `.venv`?

Solo cuando vayas a ejecutar scripts Python auxiliares, por ejemplo:

- validación de dataset
- saneamiento de JSON
- generación de informes

#### Windows

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

#### Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Una vez activado, puedes ejecutar tus scripts Python con seguridad sin afectar al sistema.

---

## Estructura general del proyecto

```text
simulador_de_test_para_oposiciones_TIC-A1/
├── dataset_temas/              # Base de datos en JSON (133 temas)
├── src/
│   ├── components/            # Componentes React reutilizables
│   ├── lib/                   # Lógica de scoring, generación, etc.
│   ├── models/                # Tipos TypeScript
│   ├── pages/                 # Pantallas principales
│   ├── stores/                # Estado global con Zustand
│   └── ...
├── public/                    # Recursos públicos si existen
├── package.json
├── vite.config.*
├── tsconfig*.json
└── README.md
```

---

## Observaciones sobre los ficheros JSON del dataset

Los ficheros JSON del directorio `dataset_temas/` constituyen la **base de datos del aplicativo**.

### Incidencia detectada

Se ha detectado que en **muy pocas preguntas** de algunos ficheros `.json`:

- faltan una o más opciones de respuesta

### Importante

Esto **no es un problema del código del aplicativo**.  
Es un problema de calidad de datos en algunos registros concretos del dataset.

### Cómo solucionarlo

Hay dos formas correctas de resolverlo:

1. **Eliminar directamente la pregunta defectuosa del fichero `.json`**
2. **Completar manualmente la información faltante** en el `.json`

### Recomendación

Antes de dar por cerrado el dataset, conviene revisar que cada pregunta tenga:

- enunciado
- exactamente 4 opciones
- opción correcta válida
- justificación
- referencia, si existe

---

## Comportamiento esperado de la aplicación

La aplicación asume que cada pregunta tiene una estructura coherente.

Si una pregunta viene incompleta en origen, el resultado puede ser:

- error de renderizado
- comportamiento anómalo en la corrección
- imposibilidad de responder correctamente esa pregunta

Por eso, la corrección debe hacerse en el **dataset**, no en el núcleo del frontend.

---

## Comandos útiles

### Instalar dependencias

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Compilar

```bash
npm run build
```

### Previsualizar build

```bash
npm run preview
```

---

## Solución de problemas

### 1. El proyecto no arranca

Comprueba:

- que Node.js y npm están instalados
- que estás en la carpeta correcta del proyecto
- que has ejecutado `npm install`

---

### 2. Error al copiar desde Windows a Linux

No copies:

- `node_modules`
- `.venv`
- `dist`

Vuelve a instalar las dependencias en Linux con:

```bash
npm install
```

---

### 3. Algunas preguntas fallan o no muestran opciones

Revisa el fichero `.json` del tema correspondiente.

Es posible que:

- falten opciones
- falte la opción correcta
- el registro esté incompleto

La solución está en el dato fuente, no en el motor de la aplicación.

---

### 4. La aplicación abre pero no carga correctamente

Comprueba:

- que el directorio `dataset_temas/` está presente
- que los ficheros JSON siguen la estructura esperada
- que no se han cambiado nombres de rutas ni archivos

---

## Futuras mejoras posibles

- Exportación de resultados
- Historial completo de sesiones
- Comparación de sesiones
- Validación automática del dataset
- Scripts de saneamiento
- Modo simulación realista sin feedback inmediato
- Despliegue con servidor web en producción

---

## Autor

Proyecto desarrollado por Luis González Fraga para el entrenamiento y simulación de test del proceso selectivo del **Cuerpo Superior TIC de la Administración del Estado**.
