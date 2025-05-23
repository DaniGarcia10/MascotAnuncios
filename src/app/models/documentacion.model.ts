export enum Estado {
  PENDIENTE = 'PENDIENTE',
  RECHAZADO = 'RECHAZADO',
  ACEPTADO = 'ACEPTADO'
}

export interface Documentacion {
  estado: Estado;
  motivo: string;
}