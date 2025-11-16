import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";

export const logger = pino({
  level,
  redact: {
    paths: ["req.headers.authorization"],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
