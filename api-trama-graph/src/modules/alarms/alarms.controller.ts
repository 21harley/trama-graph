import { NextFunction, Request, Response } from "express";

import { AppError } from "../../shared/errors/app-error";
import {
  createGestionAlarmasSnapshot,
  deleteAlarm,
  listAlarms,
} from "./alarms.service";

function parseBoolean(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return ["true", "1", "yes"].includes(value.toLowerCase());
}

export async function listAlarmsController(req: Request, res: Response, next: NextFunction) {
  try {
    const gasParam = (req.query.gasId ?? req.query.idTipoGas) as string | undefined;
    const startParam = (req.query.start ?? req.query.startDate) as string | undefined;
    const endParam = (req.query.end ?? req.query.endDate) as string | undefined;
    const statesParam = (req.query.states ?? req.query.state ?? req.query.estado) as string | undefined;
    const registerGenerateParam = (req.query.registerGenerate ?? req.query.registergenerate ?? req.query.generateRegisterToday) as string | undefined;
    const includeListParam = (req.query.includeAlarmList ?? req.query.includeList) as string | undefined;

    let gasId: number | undefined;
    if (gasParam && gasParam.trim().length > 0) {
      gasId = Number(gasParam);
      if (Number.isNaN(gasId)) {
        throw new AppError("El parámetro gasId debe ser numérico", {
          statusCode: 400,
          code: "INVALID_GAS_ID",
        });
      }
    }

    let start: Date | undefined;
    if (startParam) {
      start = new Date(startParam);
      if (Number.isNaN(start.getTime())) {
        throw new AppError("El parámetro start no es una fecha válida", {
          statusCode: 400,
          code: "INVALID_START_DATE",
        });
      }
    }

    let end: Date | undefined;
    if (endParam) {
      end = new Date(endParam);
      if (Number.isNaN(end.getTime())) {
        throw new AppError("El parámetro end no es una fecha válida", {
          statusCode: 400,
          code: "INVALID_END_DATE",
        });
      }
    }

    let states: string[] | undefined;
    if (statesParam) {
      states = statesParam
        .split(",")
        .map((state) => state.trim())
        .filter((state) => state.length > 0);
    }

    const shouldGenerateSnapshot = parseBoolean(registerGenerateParam);
    const includeAlarmList = shouldGenerateSnapshot ? true : parseBoolean(includeListParam);

    const alarms = await listAlarms({ gasId, start, end, states });

    let gestionSnapshot: unknown = null;
    if (shouldGenerateSnapshot) {
      const referenceDate = start ?? new Date();
      const snapshot = await createGestionAlarmasSnapshot({
        alarms,
        referenceDate,
        includeAlarmList,
      });

      gestionSnapshot = {
        referenceDate: referenceDate.toISOString(),
        ...snapshot,
      };
    }

    return res.json({
      data: alarms,
      gestionSnapshot,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAlarmController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const alarmId = Number(id);

    if (Number.isNaN(alarmId)) {
      throw new AppError("El identificador de la alarma debe ser numérico", {
        statusCode: 400,
        code: "INVALID_ALARM_ID",
      });
    }

    await deleteAlarm(alarmId);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
