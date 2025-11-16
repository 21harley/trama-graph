import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { logger } from "../../libs/logger";
import { AppError } from "../errors/app-error";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn({ err, path: req.originalUrl }, "AppError captured");
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details ?? null,
    });
  }

  if (err instanceof ZodError) {
    logger.warn({ err, path: req.originalUrl }, "Validation error captured");
    return res.status(400).json({
      message: "El cuerpo de la petición no es válido",
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    });
  }

  logger.error({ err, path: req.originalUrl }, "Unexpected error");
  return res.status(500).json({
    message: "Error interno del servidor",
    code: "INTERNAL_ERROR",
  });
}
