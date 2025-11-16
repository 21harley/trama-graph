# API Trama Graph

## Descripción general
Backend desarrollado con Node.js + Express, Prisma y PostgreSQL que expone servicios para gestionar mediciones de gases y alarmas. Todas las rutas de negocio están versionadas bajo el prefijo `\/api\/v1` y retornan respuestas JSON.

---

## Estructura de carpetas

```bash
api-trama-graph/
├── dist/                    # Salida compilada (se genera con `npm run build`)
├── prisma/
│   ├── migrations/          # Historial de migraciones generadas por Prisma
│   ├── schema.prisma        # Modelo de datos y relaciones
│   └── seed.ts              # Script opcional para poblar datos iniciales
├── src/
│   ├── config/              # Configuración y carga de variables de entorno (`env.ts`)
│   ├── libs/                # Utilidades compartidas (por ejemplo, logger basado en Pino)
│   ├── modules/
│   │   ├── alarms/          # Lógica de alarmas (controladores, servicios, rutas)
│   │   └── measurements/    # Lógica de mediciones (controladores, servicios, esquemas, rutas)
│   ├── shared/              # Middlewares, errores personalizados y helpers transversales
│   ├── app.ts               # Configuración principal de la app Express y registro de rutas
│   └── server.ts            # Punto de entrada; busca puerto libre y habilita cron opcional
├── prisma.config.ts         # Configuración adicional para comandos Prisma CLI
├── package.json             # Dependencias y scripts npm
├── tsconfig.json            # Configuración de TypeScript
└── README.md                # Este documento
```

> Nota: `node_modules/` y archivos sensibles (`.env`) no se incluyen en control de versiones. Al compilar, los artefactos de `dist/` pueden subirse a despliegue.

## Requerimientos

| Componente            | Versión recomendada | Notas |
| --------------------- | ------------------- | ----- |
| Node.js               | 20.x o superior      | Se utiliza ES2022 y `node:net` para detección de puertos. |
| npm                   | 9.x o superior       | Administrador de paquetes por defecto con Node 20. |
| PostgreSQL            | 14 o superior        | Requerido por Prisma. Ajusta la URL de conexión en `.env`. |
| Git                   | Cualquier versión actual | Para clonar el repositorio. |

Variables de entorno necesarias (`.env` en la raíz del paquete):

```bash
DATABASE_URL="postgresql://usuario:password@host:puerto/basedatos"
PORT=3000                          # opcional, 3000 por defecto
ENABLE_GESTION_SNAPSHOT_CRON=true  # opcional, activa cron diario
```

> Si se omite `PORT`, el servidor intentará usar 3000 y, en caso de estar ocupado, buscará automáticamente un puerto disponible cercano.

---

## Puesta en marcha desde cero

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/21harley/trama-graph.git
   cd trama-graph/api-trama-graph
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar el entorno**
   - Copia `.env.example` (si existe) o crea `.env` con las variables descritas arriba.
   - Asegúrate de que la base de datos PostgreSQL esté creada y accesible.


4. **Preparar la base de datos**
   ```bash
   npx prisma migrate dev    # aplica migraciones y genera tipados
   npx prisma db seed        # opcional: carga datos de ejemplo (usa prisma/seed.ts)
   ```

5. **Ejecutar el servidor en desarrollo**
   ```bash
   npm run dev
   ```
   El servicio queda accesible en `http://localhost:3000` por defecto (o el puerto disponible registrado en el log).

6. **Compilar y ejecutar en producción**
   ```bash
   npm run build
   npm start
   ```

### Inicio del programa

- El entrypoint se encuentra en `src/server.ts`. Allí se instancia la app con `createApp()` y se busca un puerto disponible a partir del indicado en `env.port` (por defecto 3000) usando un escaneo ligero con `node:net`.
- Una vez obtenido el puerto, Express queda escuchando y se registran logs con Pino indicando el puerto final.
- Si `ENABLE_GESTION_SNAPSHOT_CRON=true`, se programa un `cron` diario (medianoche) que ejecuta `generateDailyGestionAlarmasSnapshot` para generar resúmenes de alarmas.



### Scripts útiles

| Comando                 | Descripción |
| ----------------------- | ----------- |
| `npm run dev`           | Ejecuta `src/server.ts` con `ts-node-dev` (recarga en caliente). |
| `npm run build`         | Compila TypeScript a `dist/` usando `tsc`. |
| `npm start`             | Levanta el servidor compilado (`dist/server.js`). |
| `npm run prisma:migrate`| `prisma migrate dev`: aplica migraciones. |
| `npm run prisma:generate` | Genera el cliente Prisma. |
| `npm run prisma:seed`   | Ejecuta `prisma/seed.ts` via `ts-node`. |

---

## Endpoints disponibles

Prefijo común: `http://<host>:<puerto>/api/v1`

| Método | Ruta                                      | Descripción                                                              | Parámetros / Cuerpo | Respuesta exitosa |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------ | ------------------- | ----------------- |
| GET    | `/health`                                 | Diagnóstico del servidor (sin prefijo).                                 | —                   | `200 OK` `{ "status": "ok", "timestamp": "ISO", "environment": "development" }` |
| GET    | `/test-connection`                        | Prueba simple de conectividad (sin prefijo).                            | —                   | `200 OK` `{ "status": "ok", "timestamp": "ISO" }` |
| GET    | `/measurements`                           | Lista mediciones filtrables por gas y rango de fechas.                   | Query opcionales: `gasId`, `start`, `end` (ISO). | `200 OK` `{ "data": [ { "id": 1, "idTipoGas": 1, "valor": "123.000", "umbral": "950.000", "fechaMedida": "ISO", "tipoDeGas": { ... } } ] }` |
| PUT    | `/measurements`                           | Sincroniza mediciones actuales (mismo filtro que GET).                   | Query opcionales iguales al GET. | `200 OK` `{ "data": [...] }` |
| POST   | `/measurements/batch`                     | Registra mediciones que superen su umbral.                              | Cuerpo `[{ id_type_gas, valor, fecha, umbral }, ...]` validado por Zod. | `201 Created` `{ "message": "Mediciones registradas", "data": { "inserted": 5, "alarmsTriggered": 5 } }` |
| PUT    | `/measurements/:id`                       | **Reservado** para futuras actualizaciones (reutiliza controlador PUT). | Parámetros de ruta: `id` (numérico). | Actualmente responde igual a GET según filtros. |
| DELETE | `/measurements/:id`                       | Elimina una medición y actualiza alarmas relacionadas.                  | Parámetro de ruta `id` (numérico). | `204 No Content` |
| GET    | `/alarms`                                 | Lista alarmas con filtros y permite generar snapshot de gestión.        | Query opcionales: `gasId`, `start`, `end`, `states`, `registerGenerate`, `includeAlarmList`. | `200 OK` `{ "data": [ { "id": 10, "estado": "abierta", "nMedidas": 3, "tipoDeGas": { ... } } ], "gestionSnapshot": null }` |
| DELETE | `/alarms/:id`                             | Elimina una alarma existente.                                           | Parámetro de ruta `id` (numérico). | `204 No Content` |

### Notas sobre parámetros
- Los filtros de fecha aceptan formatos compatibles con `new Date()` (ISO 8601 recomendado).
- `states` en `/alarms` puede ser una lista separada por comas (`states=abierta,cerrada`).
- Para generar un snapshot en `/alarms`, establecer `registerGenerate=true`. Si se provee, `gestionSnapshot` incluirá resumen y, opcionalmente, la lista de alarmas (`includeAlarmList=true`).

### Formato de errores

Las respuestas de error siguen una estructura uniforme:

```json
{
  "message": "Descripción legible",
  "code": "CODIGO_INTERNO",
  "details": null
}
```

- Errores de validación (`Zod`) retornan `code: "VALIDATION_ERROR"` y un objeto `details` con los campos inválidos.
- Errores de negocio (`AppError`) utilizan códigos específicos (por ejemplo `ALARM_NOT_FOUND`).
- Fallos inesperados responden con `500` y `code: "INTERNAL_ERROR"`.

---

## Buenas prácticas adicionales
- Revisa los logs en consola: se utiliza Pino para registrar eventos importantes y seguimiento de rutas.
- Al desconectar la API del frontend, considera la lógica de reconexión: el backend mantiene un contador de fallos en el cliente para bloquear llamadas tras múltiples errores consecutivos.
- Usa `npm run prisma:generate` cada vez que actualices el esquema de Prisma.

Con esto deberías poder levantar, ejecutar y consumir el backend `api-trama-graph` sin problemas.
