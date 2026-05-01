export interface Payment {
  id: string;
  monto: number;
  fecha: string;
  codigoAutorizacion: string | null;
  notas: string | null;
  creadoEn: Date;
}

export interface AppConfig {
  monto: number;
  fechaViaje: string;
  pin: string | null;
}
