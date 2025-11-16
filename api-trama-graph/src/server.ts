import net from 'net';
import cron from "node-cron";

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./libs/logger";
import { generateDailyGestionAlarmasSnapshot } from "./modules/alarms/alarms.service";

async function findAvailablePort(startPort: number, maxTries = 5): Promise<number> {
  for (let port = startPort; port < startPort + maxTries; port++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const testServer = net.createServer();
        testServer.once('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') reject(new Error(`Port ${port} in use`));
          else reject(err);
        });
        testServer.once('listening', () => {
          testServer.close(() => resolve());
        });
        testServer.listen(port);
      });
      return port;
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('in use')) throw error;
    }
  }
  throw new Error(`No available ports between ${startPort}-${startPort + maxTries - 1}`);
}

async function bootstrap() {
  const app = createApp();
  
  try {
    const availablePort = await findAvailablePort(env.port);
    
    if (availablePort !== env.port) {
      logger.warn({ originalPort: env.port, newPort: availablePort }, "Puerto original ocupado, usando puerto alternativo");
    }

    app.listen(availablePort, () => {
      logger.info({ port: availablePort }, "Servidor iniciado");
    });

    if (env.enableGestionSnapshotCron) {
      cron.schedule("0 0 * * *", async () => {
        try {
          const result = await generateDailyGestionAlarmasSnapshot({ includeAlarmList: false });
          logger.info({ date: result.date.toISOString(), summary: result.snapshot }, "Snapshot diario de alarmas generado");
        } catch (error) {
          logger.error({ err: error }, "Error generando snapshot diario de alarmas");
        }
      });

      logger.info("Cron de gestión de alarmas habilitado (ejecución diaria a medianoche)");
    } else {
      logger.info("Cron de gestión de alarmas deshabilitado");
    }
  } catch (error) {
    logger.error({ err: error }, "Error al iniciar el servidor");
    process.exit(1);
  }
}

void bootstrap();
