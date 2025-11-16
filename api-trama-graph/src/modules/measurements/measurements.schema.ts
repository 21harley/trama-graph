import { z } from "zod";

const dateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return value;
}, z.date());

export const measurementSchema = z.object({
  id_type_gas: z.number().int().positive(),
  valor: z.number(),
  fecha: dateSchema,
  umbral: z.number(),
});

export const measurementsBatchSchema = z.array(measurementSchema).min(1);

export type MeasurementInput = z.infer<typeof measurementSchema>;
