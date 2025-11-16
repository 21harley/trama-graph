import express from "express";
import cors from "cors";
import "express-async-errors";

import { env } from "./config/env";
import { logger } from "./libs/logger";
import { notFoundHandler } from "./shared/middlewares/not-found";
import { errorHandler } from "./shared/middlewares/error-handler";
import { validateBody } from "./shared/middlewares/validate-request";
import * as measurementsController from "./modules/measurements/measurements.controller";
import { measurementsBatchSchema } from "./modules/measurements/measurements.schema";
import * as alarmsController from "./modules/alarms/alarms.controller";


export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  const apiPrefix = "/api/v1";
  const logExecution = (target: string) => (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    logger.info({ method: req.method, url: req.originalUrl, target }, "Ruta ejecutada");
    next();
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("[DEBUG] Controladores disponibles en measurementsController:", Object.keys(measurementsController));
    console.log("[DEBUG] Controladores disponibles en alarmsController:", Object.keys(alarmsController));
  }

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), environment: env.nodeEnv });
  });

  app.get('/test-connection', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Measurements routes
  app.get(`${apiPrefix}/measurements`, logExecution("listMeasurementsController"), measurementsController.listMeasurementsController);
  app.put(`${apiPrefix}/measurements`, logExecution("putMeasurementsController"), measurementsController.putMeasurementsController);
  app.post(
    `${apiPrefix}/measurements/batch`,
    logExecution("registerMeasurementsController"),
    validateBody(measurementsBatchSchema),
    measurementsController.registerMeasurementsController,
  );
  app.put(`${apiPrefix}/measurements/:id`, logExecution("putMeasurementsController"), measurementsController.putMeasurementsController);
  app.delete(`${apiPrefix}/measurements/:id`, logExecution("deleteMeasurementController"), measurementsController.deleteMeasurementController);

  // Alarms routes
  app.get(`${apiPrefix}/alarms`, logExecution("listAlarmsController"), alarmsController.listAlarmsController);
  app.delete(`${apiPrefix}/alarms/:id`, logExecution("deleteAlarmController"), alarmsController.deleteAlarmController);

  app.use(notFoundHandler);
  app.use(errorHandler);


  logger.debug("Application instance created");

  return app;
}
