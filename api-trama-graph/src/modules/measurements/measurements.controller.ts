import { NextFunction, Request, Response } from "express";

import { AppError } from "../../shared/errors/app-error";
import { deleteMeasurement, listMeasurements, registerMeasurementsBatch } from "./measurements.service";
import { MeasurementInput } from "./measurements.schema";

export async function listMeasurementsController(req: Request, res: Response, next: NextFunction) {
  try {
    const gasParam = (req.query.gasId ?? req.query.idTipoGas) as string | undefined;
    const startParam = (req.query.start ?? req.query.startDate) as string | undefined;
    const endParam = (req.query.end ?? req.query.endDate) as string | undefined;
    const thresholdParam = (req.query.threshold ?? req.query.umbralMin) as string | undefined;
    const thresholdOperatorParam = (req.query.thresholdOperator ?? req.query.umbralOperador) as string | undefined;
    const measurementParam = (req.query.measurement ?? req.query.valorMin) as string | undefined;
    const measurementOperatorParam = (req.query.measurementOperator ?? req.query.valorOperador) as string | undefined;

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

    let threshold: number | undefined;
    if (thresholdParam && thresholdParam.trim().length > 0) {
      threshold = Number(thresholdParam);
      if (Number.isNaN(threshold)) {
        throw new AppError("El parámetro threshold debe ser numérico", {
          statusCode: 400,
          code: "INVALID_THRESHOLD",
        });
      }
    }

    let thresholdOperator: "gte" | "lte" | "eq" | undefined;
    if (thresholdOperatorParam && thresholdOperatorParam.trim().length > 0) {
      const normalized = thresholdOperatorParam.trim().toLowerCase();
      if (normalized === "gte" || normalized === "lte" || normalized === "eq") {
        thresholdOperator = normalized;
      } else {
        throw new AppError("El parámetro thresholdOperator debe ser gte, lte o eq", {
          statusCode: 400,
          code: "INVALID_THRESHOLD_OPERATOR",
        });
      }
    }

    let measurement: number | undefined;
    if (measurementParam && measurementParam.trim().length > 0) {
      measurement = Number(measurementParam);
      if (Number.isNaN(measurement)) {
        throw new AppError("El parámetro measurement debe ser numérico", {
          statusCode: 400,
          code: "INVALID_MEASUREMENT",
        });
      }
    }

    let measurementOperator: "gte" | "lte" | undefined;
    if (measurementOperatorParam && measurementOperatorParam.trim().length > 0) {
      const normalized = measurementOperatorParam.trim().toLowerCase();
      if (normalized === "gte" || normalized === "lte") {
        measurementOperator = normalized;
      } else {
        throw new AppError("El parámetro measurementOperator debe ser gte o lte", {
          statusCode: 400,
          code: "INVALID_MEASUREMENT_OPERATOR",
        });
      }
    }

    const measurements = await listMeasurements({
      gasId,
      start,
      end,
      threshold,
      thresholdOperator,
      measurement,
      measurementOperator,
    });

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
    const storeAllParam = req.query.storeAll as string | undefined;

    let storeAll = false;
    if (typeof storeAllParam === "string" && storeAllParam.trim().length > 0) {
      const normalized = storeAllParam.trim().toLowerCase();
      storeAll = normalized === "true" || normalized === "1";
    }

    const result = await registerMeasurementsBatch(body, { storeAll });

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
