# Trama Graph

Suite compuesta por una API en Node.js y un frontend React que permiten visualizar en tiempo real lecturas de sensores de gases conectados a un Arduino, gestionar umbrales/alertas y persistir las mediciones en una base de datos PostgreSQL.

---

## Arquitectura

```
trama-graph/
├── api-trama-graph/      # Backend REST (Express + Prisma + PostgreSQL)
└── trama-graph/          # Frontend (React + Vite + Web Serial API)
```

- **API** (`api-trama-graph`): expone `/api/v1/measurements` y `/api/v1/alarms` para registrar mediciones que superan umbrales, listar alarmas y generar snapshots.
- **Frontend** (`trama-graph`): conecta vía Web Serial al Arduino, grafica los gases con umbrales configurables, dispara alertas visuales y sincroniza los datos con la API.

Diagrama de flujo simplificado:

```
Arduino  ──(Web Serial)──► Frontend ──(HTTP JSON)──► API ──► PostgreSQL
      (lecturas)        (parsing + UI)            (batch / alarms)
```

---

## Requerimientos globales

| Componente | Versión recomendada | Notas |
| ---------- | ------------------- | ----- |
| Node.js    | 20.x o superior      | Necesario en frontend y backend. |
| npm        | 9.x o superior       | Scripts de instalación/ejecución. |
| PostgreSQL | 14 o superior        | Base de datos usada por Prisma. |
| Navegador Chromium | Con Web Serial habilitada | Para conectar el Arduino desde el frontend. |

> Variables de entorno mínimas: definir `DATABASE_URL` (backend) y, opcionalmente, `PORT` y `ENABLE_GESTION_SNAPSHOT_CRON`. El frontend puede parametrizar la URL del backend editando `src/pages/live/index.tsx` o exponiendo `VITE_API_URL`.

---

## Puesta en marcha

1. **Clonar el proyecto**
   ```bash
   git clone https://github.com/21harley/trama-graph.git
   cd trama-graph
   ```

2. **Backend (`api-trama-graph`)**
   ```bash
   cd api-trama-graph
   npm install
   cp .env.example .env   # completa DATABASE_URL y opcionales
   npx prisma migrate dev
   npm run dev             # levanta en http://localhost:3000 (auto-ajusta si está ocupado)
   cd ..
   ```

3. **Frontend (`trama-graph`)**
   ```bash
   cd trama-graph
   npm install
   npm run dev             # expone la UI en http://localhost:5173
   ```
   Al ingresar a la vista **Live** y pulsar "Conectar Arduino", el navegador solicitará permisos para acceder al puerto USB.

---

## Flujo funcional destacado

1. **Lectura de sensor**: el frontend usa `navigator.serial.requestPort()` para abrir el puerto a 115200 baudios, decodifica las líneas `millis,CO,AL,H2,CH4,LPG` y mantiene una ventana móvil de 30 segundos en el gráfico.
2. **Gestión de umbrales**: la modal "Configurar umbrales" guarda per gas (CO, AL, H2, CH4, LPG) valores y banderas de alarma en Zustand + `localStorage`. Al confirmarla se desconecta el Arduino para reiniciar la simulación con los nuevos parámetros.
3. **Alertas**: si un gas supera su umbral y la alarma está activada, se muestra un toast y se registra la alerta con timestamp. El usuario puede descargar el log local.
4. **Persistencia**: las muestras que superan umbral se envían en lote a `POST /api/v1/measurements/batch`. El backend persiste solo las que activan umbral y actualiza/crea alarmas abiertas. También ofrece `/alarms` para reportes y snapshots.
5. **Resiliencia**: tras 5 fallos de red consecutivos, el frontend bloquea envíos hasta que el usuario lo reintente o descargue los registros manualmente.

---

## Readmes específicos

- [`api-trama-graph/README.md`](api-trama-graph/README.md): detalles de requisitos backend, estructura Prisma, endpoints y manejo de cron.
- [`trama-graph/README.md`](trama-graph/README.md): documentación del frontend, scripts de Vite, componentes clave y uso de la Web Serial API.

Consulte cada documento para pasos más profundos o ajustes avanzados.
