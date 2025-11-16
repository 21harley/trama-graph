import { Router } from "express";

import { measurementsRouter } from "../modules/measurements/measurements.routes";
import { alarmsRouter } from "../modules/alarms/alarms.routes";

export const apiRouter = Router();

apiRouter.use((req, res, next) => {
  console.log(`[API Router] ${req.method} ${req.path}`);
  next();
});

apiRouter.use("/measurements", measurementsRouter);
apiRouter.use("/alarms", alarmsRouter);

export { measurementsRouter };
