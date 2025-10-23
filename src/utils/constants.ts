// Constantes y opciones para la aplicación ViajeMoz

// Tipos de transporte disponibles
export const TIPOS_TRANSPORTE = {
  AEREO: 'aereo',
  TREN: 'tren',
  BUS: 'bus',
  CARRO_PRIVADO: 'carro_privado',
  AUTO_RENTADO: 'auto_rentado',
  UBER: 'uber',
  OTRO: 'otro',
} as const

export type TipoTransporte = (typeof TIPOS_TRANSPORTE)[keyof typeof TIPOS_TRANSPORTE]

// Etiquetas legibles para los tipos de transporte
export const ETIQUETAS_TRANSPORTE: Record<TipoTransporte, string> = {
  [TIPOS_TRANSPORTE.AEREO]: 'Aéreo',
  [TIPOS_TRANSPORTE.TREN]: 'Tren',
  [TIPOS_TRANSPORTE.BUS]: 'Bus',
  [TIPOS_TRANSPORTE.CARRO_PRIVADO]: 'Carro Privado',
  [TIPOS_TRANSPORTE.AUTO_RENTADO]: 'Auto Rentado',
  [TIPOS_TRANSPORTE.UBER]: 'Uber',
  [TIPOS_TRANSPORTE.OTRO]: 'Otro',
}

// Tipos de hospedaje disponibles
export const TIPOS_HOSPEDAJE = {
  HOTEL: 'hotel',
  RENTA_PRIVADA: 'renta_privada',
  AIRBNB: 'airbnb',
  OTRO: 'otro',
} as const

export type TipoHospedaje = (typeof TIPOS_HOSPEDAJE)[keyof typeof TIPOS_HOSPEDAJE]

// Etiquetas legibles para los tipos de hospedaje
export const ETIQUETAS_HOSPEDAJE: Record<TipoHospedaje, string> = {
  [TIPOS_HOSPEDAJE.HOTEL]: 'Hotel',
  [TIPOS_HOSPEDAJE.RENTA_PRIVADA]: 'Renta Privada',
  [TIPOS_HOSPEDAJE.AIRBNB]: 'Airbnb',
  [TIPOS_HOSPEDAJE.OTRO]: 'Otro',
}
