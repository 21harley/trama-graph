import { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
}
