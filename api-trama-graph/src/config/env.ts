import { config } from "dotenv";

config();

const requiredEnv = ["DATABASE_URL"] as const;

type RequiredEnvKey = (typeof requiredEnv)[number];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL as string,
  enableGestionSnapshotCron: process.env.ENABLE_GESTION_SNAPSHOT_CRON === "true",
};

export type Env = typeof env;
