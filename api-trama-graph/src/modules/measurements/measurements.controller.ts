import { NextFunction, Request, Response } from "express";

import { AppError } from "../../shared/errors/app-error";
import { deleteMeasurement, listMeasurements, registerMeasurementsBatch } from "./measurements.service";
import { MeasurementInput } from "./measurements.schema";

export async function listMeasurementsController(req: Request, res: Response, next: NextFunction) {
  try {
    const gasParam = (req.query.gasId ?? req.query.idTipoGas) as string | undefined;
    const startParam = (req.query.start ?? req.query.startDate) as string | undefined;
    const endParam = (req.query.end ?? req.query.endDate) as string | undefined;

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

    const measurements = await listMeasurements({ gasId, start, end });

    return res.json({ data: measurements });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMeasurementController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const measurementId = Number(id);

    if (Number.isNaN(measurementId)) {
      throw new AppError("El identificador de la medición debe ser numérico", {
        statusCode: 400,
        code: "INVALID_MEASUREMENT_ID",
      });
    }

    await deleteMeasurement(measurementId);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function registerMeasurementsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body as MeasurementInput[];

    const result = await registerMeasurementsBatch(body);

    return res.status(201).json({
      message: "Mediciones registradas",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function putMeasurementsController(req: Request, res: Response, next: NextFunction) {
  try {
    const gasParam = (req.query.gasId ?? req.query.idTipoGas) as string | undefined;
    const startParam = (req.query.start ?? req.query.startDate) as string | undefined;
    const endParam = (req.query.end ?? req.query.endDate) as string | undefined;

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

    const measurements = await listMeasurements({ gasId, start, end });

    return res.json({ data: measurements });
  } catch (error) {
    return next(error);
  }
}
