export const GAS_KEYS = ["CO", "AL", "H2", "CH4", "LPG"] as const;

export type GasKey = (typeof GAS_KEYS)[number];

export type ChartPoint = {
  time: number;
} & Record<GasKey, number>;

export type AlertItem = { time: string; gas: GasKey; value: number; threshold: number };

export type ActiveAlert = { gas: GasKey; value: number };
