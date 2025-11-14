export type ChartPoint = {
  time: number;
  CO: number;
  AL: number;
  H2: number;
  CH4: number;
  LPG: number;
};

export type AlertItem = { 
  time: string; 
  gas: string; 
  value: number; 
  threshold: number 
};

export type ActiveAlert = { 
  gas: string; 
  value: number 
};