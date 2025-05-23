export enum Motivo {
  PENDIENTE = 'PENDIENTE',
  RECHAZADO = 'RECHAZADO',
  ACEPTADO = 'ACEPTADO'
}

export interface Documentacion {
  estado: string;
  motivo: Motivo;
}