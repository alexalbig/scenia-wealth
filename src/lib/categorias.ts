import type {
  FuenteIngreso,
  TipoFiscalInstrumento,
  TipoOtroActivo,
  TipoPasivo,
} from "@/lib/types";

/**
 * Catálogos de alta — desplegables fijos (no texto libre).
 * Gastos: lista ampliada sobre el mockup. Resto: alineado al MVP.
 */

export const GASTO_CATEGORIAS = [
  "Intereses de deuda",
  "Suministros y comunidad",
  "Familia y estilo de vida",
  "Seguros",
  "Vehículo",
  "Salud",
  "Educación",
  "Impuestos y tasas",
  "Mantenimiento de inmuebles",
  "Donaciones",
  "Ocio y viajes",
  "Otros",
] as const;

export type GastoCategoria = (typeof GASTO_CATEGORIAS)[number];

export const TIPO_FISCAL_OPTIONS: Array<{
  value: TipoFiscalInstrumento;
  label: string;
}> = [
  { value: "fondo", label: "Fondo traspasable" },
  { value: "plan_pensiones", label: "Plan de pensiones" },
  { value: "accion", label: "Acciones" },
  { value: "otro", label: "Otro" },
];

export const TIPO_OTRO_OPTIONS: Array<{
  value: TipoOtroActivo;
  label: string;
}> = [
  { value: "vehiculo", label: "Vehículo" },
  { value: "arte", label: "Arte" },
  { value: "joyas", label: "Joyas" },
  { value: "efectivo", label: "Efectivo / liquidez" },
  { value: "mobiliario", label: "Mobiliario y enseres" },
  { value: "cripto", label: "Criptomonedas" },
  { value: "coleccion", label: "Colección" },
  { value: "otro", label: "Otro" },
];

export const FUENTE_INGRESO_OPTIONS: Array<{
  value: FuenteIngreso;
  label: string;
}> = [
  { value: "trabajo", label: "Trabajo" },
  { value: "alquiler", label: "Alquiler" },
  { value: "dividendo", label: "Dividendo" },
  { value: "pension", label: "Pensión" },
  { value: "otros", label: "Otros" },
];

export const TIPO_PASIVO_OPTIONS: Array<{
  value: TipoPasivo;
  label: string;
}> = [
  { value: "hipoteca", label: "Hipoteca" },
  { value: "credito", label: "Crédito personal" },
];
