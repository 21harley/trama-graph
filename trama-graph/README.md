# Trama Graph (Frontend)

Aplicación React + Vite que permite visualizar en tiempo real las lecturas de gases provenientes de un sensor Arduino, configurar umbrales por gas y enviar los registros al backend `api-trama-graph` para su persistencia y gestión de alarmas.

---

## Requerimientos

| Componente               | Versión recomendada | Notas |
| ------------------------ | ------------------- | ----- |
| Node.js                  | 20.x o superior      | Necesario para ejecutar Vite y los scripts de build. |
| npm                      | 9.x o superior       | Administrador de paquetes por defecto con Node 20. |
| Navegador compatible     | Chromium-based con [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) habilitado. | Requerido para conectarse vía USB al Arduino. |
| Backend `api-trama-graph`| Última versión disponible | Debe estar accesible en red. Por defecto se usa `http://localhost:3000`. |

> Si el backend se aloja en otra URL, modifica la constante usada en `src/pages/live/index.tsx` (búsqueda `fetch("http://localhost:3000/api/v1/measurements/batch")`).

---

## Instalación y ejecución

1. **Clonar el repositorio** (o asegurarse de tener la carpeta `trama-graph/`):
   ```bash
   git clone https://github.com/21harley/trama-graph.git
   cd trama-graph/trama-graph
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Levantar en desarrollo:**
   ```bash
   npm run dev
   ```
   Vite expone la app en `http://localhost:5173` (puerto reportado en consola). El navegador debe solicitar el permiso de acceso al puerto serie al intentar conectarse.

4. **Compilar build de producción:**
   ```bash
   npm run build
   npm run preview   # opcional: sirve la build resultante
   ```

### Scripts útiles

| Comando         | Descripción |
| ----------------| ----------- |
| `npm run dev`   | Ejecuta el servidor de desarrollo de Vite con HMR. |
| `npm run build` | Genera la salida optimizada en `dist/`. |
| `npm run preview` | Sirve la build generada para verificación local. |
| `npm run lint`  | Ejecuta ESLint con la configuración del proyecto. |

---

## Estructura de carpetas

```bash
trama-graph/
├── public/                  # Recursos estáticos (favicon, imágenes)
├── src/
│   ├── assets/              # Estilos, fuentes y recursos compartidos
│   ├── core/                # Layouts y componentes base (por ejemplo, Layout)
│   ├── pages/
│   │   ├── live/            # Página principal de monitoreo en tiempo real
│   │   │   ├── components/  # GasChart, ControlPanel, ThresholdControl, etc.
│   │   │   ├── store.ts     # Zustand store con umbrales, alarmas y backend state
│   │   │   └── index.tsx    # Lógica de conexión serial, parsing y envío al backend
│   │   ├── registro/        # Vista para registros históricos (si aplica)
│   │   ├── LoaderPage.tsx   # Pantalla inicial / splash
│   │   └── LivePage.tsx     # Versión previa (legacy) conservada como referencia
│   ├── App.tsx              # Definición de rutas mediante react-router
│   └── main.tsx             # Punto de entrada del cliente React
├── vite.config.ts           # Configuración de Vite
├── tsconfig*.json           # Configuración de TypeScript (app / node)
└── README.md                # Este documento
```

---

## Componentes y librerías principales

- **React 19 + TypeScript**: base del front.
- **Vite 7**: bundler y servidor de desarrollo rápido.
- **Zustand** (`src/pages/live/store.ts`): almacena umbrales por gas, alertas, estado del backend y preferencias (persistidas en `localStorage`).
- **Recharts**: renderizado del gráfico de líneas con las lecturas históricas.
- **React Toastify**: notificaciones cuando un gas supera el umbral configurado.
- **Web Serial API**: conexión directa con el Arduino desde el navegador.
- **React Router DOM**: gestiona navegación entre `/`, `/live`, `/registro`, etc.

---

## Flujo de lecturas del sensor y persistencia en backend

1. **Conexión al dispositivo**
   - En la vista **Live**, el usuario presiona "Conectar Arduino".
   - El navegador muestra el diálogo de selección de puerto serie (`navigator.serial.requestPort`).
   - Se abre el puerto a `115200` baudios y se comienza a leer el stream (`ReadableStream<Uint8Array>`).

2. **Parsing de datos**
   - Cada paquete recibido se decodifica como texto y se separa línea por línea.
   - Se espera un formato `millis,CO,AL,H2,CH4,LPG`.
   - Valores no numéricos se descartan para evitar lecturas corruptas.

3. **Actualización de la UI**
   - Se calcula el tiempo relativo (segundos desde que inició la sesión).
   - Se actualiza el gráfico (`GasChart`) con una ventana deslizante de 30 segundos.
   - Se comparan las lecturas con los umbrales por gas configurados en la modal.
   - Si la lectura supera el umbral y la alarma está habilitada, se dispara una alerta visual/toast y se marca el gas en `ActiveAlertsPanel`.

4. **Persistencia local**
   - Las alertas generadas se almacenan en `localStorage` para permitir descargar el registro.
   - Los umbrales y el estado de activación de alarmas por gas también se guardan en `localStorage` a través del store de Zustand.

5. **Envío de datos al backend**
   - Por cada batch de líneas procesadas, se prepara un arreglo con el esquema esperado (`id_type_gas`, `valor`, `fecha`, `umbral`).
   - Se realiza un `fetch` POST a `http://localhost:3000/api/v1/measurements/batch`.
   - En caso de errores consecutivos, se incrementa un contador en el store; después de 5 fallos se bloquean temporalmente los envíos y se muestra el botón "Descargar registro" para trabajar offline.

6. **Desconexión y reseteo**
   - El botón "Configurar umbrales" abre una modal que, al guardar cambios, emite el evento `trama:disconnect-arduino` para asegurar que el puerto serie se cierre y se reinicie la simulación con los nuevos parámetros.

---

## Recomendaciones

- Ejecuta el frontend y el backend en paralelo (por defecto `npm run dev` en cada carpeta).
- Antes de abrir el navegador, verifica que el backend exponga `/api/v1` en el puerto configurado.
- Si cambias el origen del backend, busca `http://localhost:3000` en el código y reemplázalo por la URL deseada, o expón una variable de entorno (por ejemplo `VITE_API_URL`).
- El acceso a Web Serial requiere HTTPS o `localhost`; prueba en Chrome/Edge con el flag `chrome://flags/#enable-experimental-web-platform-features` si fuera necesario.

Con esto deberías poder montar la UI, conectar el sensor y visualizar/almacenar los datos correctamente.
