import { Router, Request, Response, NextFunction } from "express";
import { logger } from "../../libs/logger";

import { validateBody } from "../../shared/middlewares/validate-request";
import {
  deleteMeasurementController,
  listMeasurementsController,
  putMeasurementsController,
  registerMeasurementsController,
} from "./measurements.controller";
import { measurementsBatchSchema } from "./measurements.schema";

const logExecution = (target: string) => (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[MeasurementsRouter] ${req.method} ${req.originalUrl} -> ${target}`);
  next();
};

export const measurementsRouter = Router();

measurementsRouter.use((req, res, next) => {
  logger.info(`MeasurementsRouter: ${req.method} ${req.path}`);
  console.log(`[MeasurementsRouter] ${req.method} ${req.originalUrl} received`);
  next();
});

measurementsRouter.get("", logExecution("listMeasurementsController"), listMeasurementsController);
measurementsRouter.get("/", (req, res, next) => {
  logger.info(`GET /measurements${req.path} matched`);
  console.log(`[MeasurementsRouter] ${req.method} ${req.originalUrl} -> listMeasurementsController`);
  next();
}, listMeasurementsController);
measurementsRouter.put("", logExecution("putMeasurementsController"), putMeasurementsController);
measurementsRouter.put("/", logExecution("putMeasurementsController"), putMeasurementsController);
measurementsRouter.post("/batch", logExecution("registerMeasurementsController"), validateBody(measurementsBatchSchema), registerMeasurementsController);
measurementsRouter.put("/:id", logExecution("putMeasurementsController"), putMeasurementsController);
measurementsRouter.delete("/:id", logExecution("deleteMeasurementController"), deleteMeasurementController);
