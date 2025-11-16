export type GasOption = {
  label: string;
  value: string;
  id: number;
};

export type MeasurementRecord = {
  id: number;
  idTipoGas: number;
  valor: number;
  umbral: number;
  fechaMedida: string;
  tipoDeGasNombre: string | null;
};
