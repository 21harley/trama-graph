import { Router, Request, Response, NextFunction } from "express";

import { deleteAlarmController, listAlarmsController } from "./alarms.controller";

export const alarmsRouter = Router();

const logExecution = (target: string) => (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[AlarmsRouter] ${req.method} ${req.originalUrl} -> ${target}`);
  next();
};

alarmsRouter.use((req, _res, next) => {
  console.log(`[AlarmsRouter] ${req.method} ${req.originalUrl} received`);
  next();
});

alarmsRouter.get("", logExecution("listAlarmsController"), listAlarmsController);
alarmsRouter.get("/", logExecution("listAlarmsController"), listAlarmsController);
alarmsRouter.delete("/:id", logExecution("deleteAlarmController"), deleteAlarmController);
