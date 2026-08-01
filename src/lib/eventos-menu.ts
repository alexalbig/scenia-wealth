import {
  getInmuebles,
  getInstrumentos,
  getOtrosActivos,
  getPasivos,
  getSociedades,
  personaLabel,
} from "./patrimonio";
import { getPersonasDeCliente } from "./seed";
import type { TipoEvento } from "./types";

export type ElementoMenuContexto =
  | "instrumento"
  | "inmueble"
  | "pasivo"
  | "sociedad"
  | "otro"
  | "persona"
  | "generico";

export interface ElementoMenuItem {
  id: string;
  nombre: string;
  contexto: ElementoMenuContexto;
  /** Subtítulo bajo el nombre en el opt-grid */
  hint: string;
  /** Solo instrumentos: fondo | plan_pensiones | … */
  tipoFiscal?: string;
}

/** Menú completo de elementos del cliente (CT1 paso 1). */
export function elementosMenuCliente(clienteId: string): ElementoMenuItem[] {
  const items: ElementoMenuItem[] = [];

  for (const i of getInstrumentos(clienteId)) {
    let nombre = i.nombre;
    if (i.tipoFiscal === "plan_pensiones") {
      const tit = i.titularidades.find((t) => t.owner.kind === "persona");
      const owner = tit?.owner;
      if (owner?.kind === "persona") {
        const p = getPersonasDeCliente(clienteId).find(
          (x) => x.id === owner.personaId,
        );
        if (p) nombre = `${i.nombre} (${p.nombre})`;
      }
    }
    items.push({
      id: i.id,
      nombre,
      contexto: "instrumento",
      hint: "menú de acciones de este elemento",
      tipoFiscal: i.tipoFiscal,
    });
  }
  for (const inm of getInmuebles(clienteId)) {
    items.push({
      id: inm.id,
      nombre: inm.nombre,
      contexto: "inmueble",
      hint: "menú de acciones de este elemento",
    });
  }
  for (const p of getPasivos(clienteId)) {
    items.push({
      id: p.id,
      nombre:
        p.tipo === "hipoteca"
          ? `Hipoteca ${p.prestamista}`
          : `Crédito ${p.prestamista}`,
      contexto: "pasivo",
      hint: "menú de acciones de este elemento",
    });
  }
  for (const a of getOtrosActivos(clienteId)) {
    items.push({
      id: a.id,
      nombre: a.nombre,
      contexto: "otro",
      hint: "menú de acciones de este elemento",
    });
  }
  for (const s of getSociedades(clienteId)) {
    items.push({
      id: s.id,
      nombre: s.nombre,
      contexto: "sociedad",
      hint: "menú de acciones de este elemento",
    });
  }
  for (const persona of getPersonasDeCliente(clienteId)) {
    items.push({
      id: persona.id,
      nombre: personaLabel(persona),
      contexto: "persona",
      hint: "menú de acciones de este elemento",
    });
  }
  items.push({
    id: "generico",
    nombre: "Evento genérico (ingreso · gasto · movimiento)",
    contexto: "generico",
    hint: "sin cálculo fiscal",
  });

  return items;
}

/** Acciones del mockup ACCIONES con tipado de TipoEvento. */
export function accionesParaElemento(
  contexto: ElementoMenuContexto,
  tipoFiscal?: string,
): Array<{ tipo: TipoEvento; label: string; hint: string }> {
  switch (contexto) {
    case "instrumento":
      if (tipoFiscal === "plan_pensiones") {
        return [
          {
            tipo: "rescatar_plan",
            label: "Rescatar plan",
            hint: "Base general · capital / renta / mixto",
          },
        ];
      }
      return [
        {
          tipo: "reembolsar_fondo",
          label: "Reembolsar",
          hint: "Plusvalía → base del ahorro (FIFO)",
        },
        {
          tipo: "traspasar_fondo",
          label: "Traspasar",
          hint: "Neutro · Art. 94",
        },
        {
          tipo: "pignorar",
          label: "Pignorar",
          hint: "No realiza plusvalía",
        },
        {
          tipo: "aportar_fondo",
          label: "Aportar",
          hint: "Sin consecuencia fiscal",
        },
      ];
    case "inmueble":
      return [
        {
          tipo: "vender_inmueble",
          label: "Vender",
          hint: "Exención >65 por reinversión",
        },
        {
          tipo: "amortizar_hipoteca",
          label: "Amortizar hipoteca",
          hint: "Amortizar vs invertir",
        },
        {
          tipo: "comprar_inmueble",
          label: "Comprar inmueble",
          hint: "Sin fiscalidad · crea activo",
        },
      ];
    case "pasivo":
      return [
        {
          tipo: "amortizar_hipoteca",
          label: "Amortizar hipoteca",
          hint: "Amortizar vs invertir",
        },
      ];
    case "sociedad":
      return [
        {
          tipo: "repartir_dividendo",
          label: "Repartir dividendo",
          hint: "Sin cálculo · IS pendiente",
        },
        {
          tipo: "vender_participacion",
          label: "Vender participación",
          hint: "Sin cálculo · IS pendiente",
        },
      ];
    case "persona":
      return [
        {
          tipo: "jubilarse",
          label: "Jubilarse",
          hint: "Pensión estimada a mano",
        },
      ];
    case "otro":
      return [
        {
          tipo: "generico",
          label: "Vender / movimiento (genérico)",
          hint: "Sin cálculo fiscal",
        },
      ];
    case "generico":
    default:
      return [
        {
          tipo: "generico",
          label: "Evento genérico",
          hint: "Sin cálculo fiscal",
        },
      ];
  }
}

/** Defaults de campos al entrar al formulario (mockup renderEventoForm). */
export function defaultsParaEvento(tipo: TipoEvento): {
  importe?: string;
  anio?: string;
  hastaAnio?: string;
  destino?: string;
  pension?: string;
  reinvierte?: boolean;
} {
  switch (tipo) {
    case "reembolsar_fondo":
      return { importe: "35000", anio: "2026", hastaAnio: "2031" };
    case "traspasar_fondo":
      return { destino: "Fondo B · RF mixta", anio: "2026" };
    case "pignorar":
      return { importe: "100000", anio: "2026" };
    case "aportar_fondo":
      return { importe: "10000", anio: "2026" };
    case "rescatar_plan":
      return { importe: "15000", anio: "2026", hastaAnio: "2033" };
    case "vender_inmueble":
      return { importe: "420000", anio: "2026", reinvierte: true };
    case "amortizar_hipoteca":
      return { importe: "50000", anio: "2026" };
    case "comprar_inmueble":
      return { importe: "250000", anio: "2026" };
    case "jubilarse":
      return { anio: "2026", pension: "32000" };
    case "repartir_dividendo":
    case "vender_participacion":
      return { importe: "20000", anio: "2026" };
    case "generico":
      return { importe: "10000", anio: "2026" };
    default:
      return { anio: "2026" };
  }
}

/**
 * Chip de preview — textos sin cifras inventadas.
 * PlantillaEvento prefiere la nota del motor en vivo.
 */
export function chipPreviewEvento(tipo: TipoEvento, reinvierte = true): string {
  switch (tipo) {
    case "reembolsar_fondo":
      return "Plusvalía estimada (FIFO) → base del ahorro · cuota del motor · orientativo";
    case "traspasar_fondo":
      return "Neutro (Art. 94) · cuota 0 € · el destino hereda valor y fecha · orientativo";
    case "pignorar":
      return "No realiza plusvalía · cuota 0 € · coste financiero según entidad · orientativo";
    case "aportar_fondo":
      return "Sin consecuencia fiscal en el momento de la aportación";
    case "rescatar_plan":
      return "Base general · se apila sobre los ingresos del año · cuota del motor · orientativo";
    case "vender_inmueble":
      return reinvierte
        ? "Exención por reinversión >65 · límite (a verificar) · sin cifra inventada · orientativo"
        : "Plusvalía → base del ahorro · cuota del motor · orientativo";
    case "amortizar_hipoteca":
      return "Comparación amortizar vs invertir · sin cuota fiscal directa del motor · orientativo";
    case "comprar_inmueble":
      return "Sin fiscalidad en IRPF · crea el activo y descuenta liquidez";
    default:
      return "";
  }
}

/** Título del formulario (mockup renderEventoForm), distinto del label del menú. */
export function tituloFormEvento(tipo: TipoEvento): string {
  switch (tipo) {
    case "reembolsar_fondo":
      return "Reembolsar";
    case "traspasar_fondo":
      return "Traspasar";
    case "pignorar":
      return "Pignorar";
    case "aportar_fondo":
      return "Aportar";
    case "rescatar_plan":
      return "Rescatar plan";
    case "vender_inmueble":
      return "Vender inmueble";
    case "amortizar_hipoteca":
      return "Amortizar hipoteca";
    case "comprar_inmueble":
      return "Comprar inmueble";
    case "jubilarse":
      return "Jubilarse";
    case "repartir_dividendo":
      return "Repartir dividendo";
    case "vender_participacion":
      return "Vender participación";
    case "generico":
      return "Evento genérico";
    case "aportar_plan":
      return "Aportar a plan";
    default:
      return "Evento";
  }
}

