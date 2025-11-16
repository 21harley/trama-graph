import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodTypeAny } from "zod";

export function validateBody(schema: AnyZodObject | ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;
    return next();
  };
}
