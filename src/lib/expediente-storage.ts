import {
  cloneExpedienteFromSeed,
  emptyExpediente,
  normalizeBag,
  syncClienteTotales,
  type ExpedienteBag,
  newId,
} from "@/lib/expediente";
import type { Cliente, Persona, Segmento, CCAA } from "@/lib/types";
import { CCAA_CON_COBERTURA_FISCAL } from "@/lib/types";

const KEY_PREFIX = "scenia-expediente-v1:";
const KEY_INDEX = "scenia-expediente-index-v1";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.sessionStorage;
}

export function readExpediente(clienteId: string): ExpedienteBag | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + clienteId);
    if (!raw) return null;
    return normalizeBag(JSON.parse(raw) as ExpedienteBag);
  } catch {
    return null;
  }
}

function indexCustomCliente(clienteId: string) {
  if (!canUseStorage()) return;
  const idx = listCustomClienteIds();
  if (!idx.includes(clienteId)) {
    sessionStorage.setItem(KEY_INDEX, JSON.stringify([...idx, clienteId]));
  }
}

export function writeExpediente(bag: ExpedienteBag) {
  if (!canUseStorage()) return;
  const synced = syncClienteTotales(bag);
  sessionStorage.setItem(
    KEY_PREFIX + synced.cliente.id,
    JSON.stringify(synced),
  );
}

export function listCustomClienteIds(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = sessionStorage.getItem(KEY_INDEX);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function listCustomClientes(): Cliente[] {
  return listCustomClienteIds()
    .map((id) => readExpediente(id)?.cliente)
    .filter((c): c is Cliente => !!c);
}

/** Carga bag: session → clone seed → null. */
export function resolveExpediente(clienteId: string): ExpedienteBag | null {
  const stored = readExpediente(clienteId);
  if (stored) return stored;
  const fromSeed = cloneExpedienteFromSeed(clienteId);
  if (fromSeed) {
    const normalized = normalizeBag(fromSeed);
    writeExpediente(normalized);
    return normalized;
  }
  return null;
}

export function createExpedienteFromAlta(payload: {
  nombre: string;
  segmento: Segmento;
  ccaa?: CCAA;
  personas: Array<{
    nombre: string;
    birthDate: string;
    ccaa: CCAA;
  }>;
}): ExpedienteBag {
  const clienteId = newId("cliente");
  const ccaaExpediente =
    payload.ccaa ??
    payload.personas[0]?.ccaa ??
    CCAA_CON_COBERTURA_FISCAL;
  const personas: Persona[] = payload.personas.map((p) => {
    const parts = p.nombre.trim().split(/\s+/);
    const nombre = parts[0] ?? "";
    const apellidos = parts.slice(1).join(" ");
    const year = Number(p.birthDate.slice(0, 4));
    return {
      id: newId("persona"),
      nombre,
      apellidos,
      birthYear: Number.isFinite(year) ? year : 1970,
      ccaa: p.ccaa || ccaaExpediente,
    };
  });

  const cliente: Cliente = {
    id: clienteId,
    cuentaId: "cuenta-local",
    nombre: payload.nombre.trim(),
    segmento: payload.segmento,
    ccaa: ccaaExpediente,
    personaIds: personas.map((p) => p.id),
    sociedadIds: [],
    patrimonioNeto: 0,
    composicion: {
      financiero: 0,
      inmobiliario: 0,
      empresarial: 0,
      otros: 0,
    },
    ultimaRevisionMeses: 0,
    completo: true,
    datosAFecha: new Date().toISOString().slice(0, 10),
  };

  const bag = emptyExpediente(cliente, personas);
  writeExpediente(bag);
  indexCustomCliente(clienteId);
  return bag;
}
