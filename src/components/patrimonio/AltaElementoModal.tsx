"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@/components/ui";
import {
  TitularidadEditor,
  titularidadSumaOk,
} from "@/components/expediente/TitularidadEditor";
import {
  FUENTE_INGRESO_OPTIONS,
  GASTO_CATEGORIAS,
  TIPO_FISCAL_OPTIONS,
  TIPO_OTRO_OPTIONS,
  TIPO_PASIVO_OPTIONS,
} from "@/lib/categorias";
import {
  defaultTitularidades,
  newId,
  type AltaKind,
} from "@/lib/expediente";
import {
  CCAAS,
  CCAA_CON_COBERTURA_FISCAL,
  type CCAA,
  type FuenteIngreso,
  type Gasto,
  type Ingreso,
  type Inmueble,
  type Instrumento,
  type OtroActivo,
  type Pasivo,
  type Persona,
  type Sociedad,
  type TipoFiscalInstrumento,
  type TipoOtroActivo,
  type TipoPasivo,
  type Titularidad,
  type UsoInmueble,
} from "@/lib/types";

export type AltaTarget =
  | { kind: "persona"; item?: Persona }
  | { kind: "instrumento"; item?: Instrumento }
  | { kind: "inmueble"; item?: Inmueble }
  | { kind: "sociedad"; item?: Sociedad }
  | { kind: "otro"; item?: OtroActivo }
  | { kind: "pasivo"; item?: Pasivo }
  | { kind: "ingreso"; item?: Ingreso }
  | { kind: "gasto"; item?: Gasto };

interface AltaElementoModalProps {
  open: boolean;
  target: AltaTarget | null;
  personas: Persona[];
  pasivos: Pasivo[];
  inmuebles: Inmueble[];
  sociedades: Sociedad[];
  onClose: () => void;
  onSavePersona: (p: Persona) => void;
  onSaveInstrumento: (i: Instrumento) => void;
  onSaveInmueble: (i: Inmueble) => void;
  onSaveSociedad: (s: Sociedad) => void;
  onSaveOtro: (a: OtroActivo) => void;
  onSavePasivo: (p: Pasivo) => void;
  onSaveIngreso: (i: Ingreso) => void;
  onSaveGasto: (g: Gasto) => void;
}

const TITLES: Record<AltaKind, string> = {
  persona: "Persona",
  instrumento: "Portfolio financiero",
  inmueble: "Inmueble",
  sociedad: "Inversión empresarial",
  otro: "Otro activo",
  pasivo: "Pasivo",
  ingreso: "Ingreso",
  gasto: "Gasto",
};

function yearFromBirthDate(iso: string) {
  const y = Number(iso.slice(0, 4));
  return Number.isFinite(y) ? y : 1970;
}

/**
 * Modal de alta / edición de elementos del patrimonio.
 * Distinto de CT1 Evento: nunca dispara cálculo fiscal.
 */
export function AltaElementoModal({
  open,
  target,
  personas,
  pasivos,
  inmuebles,
  sociedades,
  onClose,
  onSavePersona,
  onSaveInstrumento,
  onSaveInmueble,
  onSaveSociedad,
  onSaveOtro,
  onSavePasivo,
  onSaveIngreso,
  onSaveGasto,
}: AltaElementoModalProps) {
  const kind = target?.kind ?? "persona";
  const editing = !!target && "item" in target && !!target.item;

  const [submitted, setSubmitted] = useState(false);

  // Persona
  const [pNombre, setPNombre] = useState("");
  const [pBirth, setPBirth] = useState("");
  const [pCcaa, setPCcaa] = useState<CCAA>(CCAA_CON_COBERTURA_FISCAL);

  // Instrumento
  const [iNombre, setINombre] = useState("");
  const [iTipo, setITipo] = useState<TipoFiscalInstrumento>("fondo");
  const [iValor, setIValor] = useState("");
  const [iFecha, setIFecha] = useState("");
  const [iCoste, setICoste] = useState("");
  const [iTit, setITit] = useState<Titularidad[]>([]);
  const [iFracPre2007, setIFracPre2007] = useState("");

  // Inmueble
  const [nNombre, setNNombre] = useState("");
  const [nValor, setNValor] = useState("");
  const [nFecha, setNFecha] = useState("");
  const [nCoste, setNCoste] = useState("");
  const [nPasivoId, setNPasivoId] = useState("");
  const [nUso, setNUso] = useState<UsoInmueble | "">("vivienda_habitual");
  const [nTit, setNTit] = useState<Titularidad[]>([]);

  // Sociedad
  const [sNombre, setSNombre] = useState("");
  const [sNif, setSNif] = useState("");
  const [sCapital, setSCapital] = useState("");
  const [sFecha, setSFecha] = useState("");
  const [sObjeto, setSObjeto] = useState("");
  const [sValor, setSValor] = useState("");
  const [sParts, setSParts] = useState<Titularidad[]>([]);

  // Otro
  const [oNombre, setONombre] = useState("");
  const [oTipo, setOTipo] = useState<TipoOtroActivo>("vehiculo");
  const [oValor, setOValor] = useState("");
  const [oFecha, setOFecha] = useState("");
  const [oTit, setOTit] = useState<Titularidad[]>([]);

  // Pasivo
  const [paTipo, setPaTipo] = useState<TipoPasivo>("hipoteca");
  const [paPrestamista, setPaPrestamista] = useState("");
  const [paCapital, setPaCapital] = useState("");
  const [paInteres, setPaInteres] = useState("");
  const [paCuota, setPaCuota] = useState("");
  const [paInmuebleId, setPaInmuebleId] = useState("");
  const [paTit, setPaTit] = useState<Titularidad[]>([]);

  // Ingreso
  const [ingPersonaId, setIngPersonaId] = useState("");
  const [ingFuente, setIngFuente] = useState<FuenteIngreso>("trabajo");
  const [ingImporte, setIngImporte] = useState("");
  const [ingCotizaciones, setIngCotizaciones] = useState("");

  // Gasto
  const [gCat, setGCat] = useState<string>(GASTO_CATEGORIAS[0]);
  const [gImporte, setGImporte] = useState("");
  const [gVinc, setGVinc] = useState("ninguno");

  useEffect(() => {
    if (!open || !target) return;
    setSubmitted(false);
    const defs = defaultTitularidades(personas);

    if (target.kind === "persona") {
      const it = target.item;
      setPNombre(it ? `${it.nombre} ${it.apellidos}`.trim() : "");
      setPBirth(it ? `${it.birthYear}-01-01` : "");
      setPCcaa(it?.ccaa ?? CCAA_CON_COBERTURA_FISCAL);
    }
    if (target.kind === "instrumento") {
      const it = target.item;
      setINombre(it?.nombre ?? "");
      setITipo(it?.tipoFiscal ?? "fondo");
      setIValor(it ? String(it.valor) : "");
      setIFecha(it?.fechaAdquisicion ?? "");
      setICoste(it?.costeAdquisicion != null ? String(it.costeAdquisicion) : "");
      setITit(it?.titularidades ?? defs);
      setIFracPre2007(
        it?.fraccionPre2007 != null
          ? String(Math.round(it.fraccionPre2007 * 100))
          : "",
      );
    }
    if (target.kind === "inmueble") {
      const it = target.item;
      setNNombre(it?.nombre ?? "");
      setNValor(it ? String(it.valor) : "");
      setNFecha(it?.fechaAdquisicion ?? "");
      setNCoste(it?.costeAdquisicion != null ? String(it.costeAdquisicion) : "");
      setNPasivoId(it?.pasivoId ?? "");
      setNUso(it?.uso ?? "vivienda_habitual");
      setNTit(it?.titularidades ?? defs);
    }
    if (target.kind === "sociedad") {
      const it = target.item;
      setSNombre(it?.nombre ?? "");
      setSNif(it?.nif ?? "");
      setSCapital(it ? String(it.capitalSocial) : "");
      setSFecha(it?.fechaConstitucion ?? "");
      setSObjeto(it?.objetoSocial ?? "");
      setSValor(it?.valor != null ? String(it.valor) : "");
      if (it) {
        setSParts(
          Object.entries(it.participaciones).map(([personaId, porcentaje]) => ({
            owner: { kind: "persona" as const, personaId },
            porcentaje,
          })),
        );
      } else setSParts(defs);
    }
    if (target.kind === "otro") {
      const it = target.item;
      setONombre(it?.nombre ?? "");
      setOTipo(it?.tipo ?? "vehiculo");
      setOValor(it ? String(it.valor) : "");
      setOFecha(it?.fechaAdquisicion ?? "");
      setOTit(it?.titularidades ?? defs);
    }
    if (target.kind === "pasivo") {
      const it = target.item;
      setPaTipo(it?.tipo ?? "hipoteca");
      setPaPrestamista(it?.prestamista ?? "");
      setPaCapital(it ? String(it.capitalPendiente) : "");
      setPaInteres(it ? String(it.tipoInteres * 100) : "");
      setPaCuota(it ? String(it.cuotaMensual) : "");
      setPaInmuebleId(it?.inmuebleId ?? "");
      setPaTit(it?.titularidades ?? defs);
    }
    if (target.kind === "ingreso") {
      const it = target.item;
      setIngPersonaId(it?.personaId ?? personas[0]?.id ?? "");
      setIngFuente(it?.fuente ?? "trabajo");
      setIngImporte(it ? String(it.importeAnual) : "");
      setIngCotizaciones(
        it?.cotizacionesSS != null ? String(it.cotizacionesSS) : "",
      );
    }
    if (target.kind === "gasto") {
      const it = target.item;
      const cat = it?.categoria ?? GASTO_CATEGORIAS[0];
      setGCat(
        (GASTO_CATEGORIAS as readonly string[]).includes(cat)
          ? cat
          : "Otros",
      );
      setGImporte(it ? String(it.importeAnual) : "");
      if (!it?.vinculadoA) setGVinc("ninguno");
      else if (it.vinculadoA.kind === "persona")
        setGVinc(`persona:${it.vinculadoA.personaId}`);
      else if (it.vinculadoA.kind === "inmueble")
        setGVinc(`inmueble:${it.vinculadoA.inmuebleId}`);
      else if (it.vinculadoA.kind === "sociedad")
        setGVinc(`sociedad:${it.vinculadoA.sociedadId}`);
      else if (it.vinculadoA.kind === "otro")
        setGVinc(`otro:${it.vinculadoA.otroId}`);
      else setGVinc("ninguno");
    }
  }, [open, target, personas]);

  const nonCv = kind === "persona" && pCcaa !== CCAA_CON_COBERTURA_FISCAL;

  const errors = useMemo(() => {
    const e = new Set<string>();
    if (kind === "persona") {
      if (!pNombre.trim()) e.add("pNombre");
      if (!pBirth) e.add("pBirth");
    }
    if (kind === "instrumento") {
      if (!iNombre.trim()) e.add("iNombre");
      if (!iValor || Number(iValor) < 0) e.add("iValor");
      if (!iFecha) e.add("iFecha");
      if (!titularidadSumaOk(iTit)) e.add("iTit");
    }
    if (kind === "inmueble") {
      if (!nNombre.trim()) e.add("nNombre");
      if (!nValor || Number(nValor) < 0) e.add("nValor");
      if (!nFecha) e.add("nFecha");
      if (!titularidadSumaOk(nTit)) e.add("nTit");
    }
    if (kind === "sociedad") {
      if (!sNombre.trim()) e.add("sNombre");
      if (!sNif.trim()) e.add("sNif");
      if (!titularidadSumaOk(sParts)) e.add("sParts");
    }
    if (kind === "otro") {
      if (!oNombre.trim()) e.add("oNombre");
      if (!oValor || Number(oValor) < 0) e.add("oValor");
      if (!titularidadSumaOk(oTit)) e.add("oTit");
    }
    if (kind === "pasivo") {
      if (!paPrestamista.trim()) e.add("paPrestamista");
      if (!paCapital || Number(paCapital) < 0) e.add("paCapital");
      if (!titularidadSumaOk(paTit)) e.add("paTit");
    }
    if (kind === "ingreso") {
      if (!ingPersonaId) e.add("ingPersona");
      if (!ingImporte || Number(ingImporte) < 0) e.add("ingImporte");
    }
    if (kind === "gasto") {
      if (!gCat.trim()) e.add("gCat");
      if (!gImporte || Number(gImporte) < 0) e.add("gImporte");
    }
    return e;
  }, [
    kind,
    pNombre,
    pBirth,
    iNombre,
    iValor,
    iFecha,
    iTit,
    nNombre,
    nValor,
    nFecha,
    nTit,
    sNombre,
    sNif,
    sParts,
    oNombre,
    oValor,
    oTit,
    paPrestamista,
    paCapital,
    paTit,
    ingPersonaId,
    ingImporte,
    gCat,
    gImporte,
  ]);

  function save() {
    setSubmitted(true);
    if (errors.size > 0) return;
    const idOf = (item?: { id: string }, prefix?: string) =>
      item?.id ?? newId(prefix ?? "el");

    if (kind === "persona" && target?.kind === "persona") {
      const parts = pNombre.trim().split(/\s+/);
      onSavePersona({
        id: idOf(target.item, "persona"),
        nombre: parts[0] ?? "",
        apellidos: parts.slice(1).join(" "),
        birthYear: yearFromBirthDate(pBirth),
        ccaa: pCcaa,
      });
    }
    if (kind === "instrumento" && target?.kind === "instrumento") {
      const valor = Number(iValor) || 0;
      const coste = iCoste.trim() ? Number(iCoste) : undefined;
      const fracPct = iFracPre2007.trim() ? Number(iFracPre2007) : NaN;
      const fraccionPre2007 =
        iTipo === "plan_pensiones" &&
        Number.isFinite(fracPct) &&
        fracPct >= 0 &&
        fracPct <= 100
          ? fracPct / 100
          : undefined;
      onSaveInstrumento({
        id: idOf(target.item, "inst"),
        clienteId: "",
        nombre: iNombre.trim(),
        tipoFiscal: iTipo,
        valor,
        fechaAdquisicion: iFecha,
        costeAdquisicion: coste,
        plusvaliaLatente:
          coste != null && Number.isFinite(coste) ? valor - coste : undefined,
        fraccionPre2007,
        titularidades: iTit,
      });
    }
    if (kind === "inmueble" && target?.kind === "inmueble") {
      const valor = Number(nValor) || 0;
      const coste = nCoste.trim() ? Number(nCoste) : undefined;
      onSaveInmueble({
        id: idOf(target.item, "inm"),
        clienteId: "",
        nombre: nNombre.trim(),
        valor,
        fechaAdquisicion: nFecha,
        costeAdquisicion: coste,
        plusvaliaLatente:
          coste != null && Number.isFinite(coste) ? valor - coste : undefined,
        uso: nUso || undefined,
        pasivoId: nPasivoId || undefined,
        titularidades: nTit,
      });
    }
    if (kind === "sociedad" && target?.kind === "sociedad") {
      const participaciones: Record<string, number> = {};
      for (const t of sParts) {
        if (t.owner.kind === "persona") {
          participaciones[t.owner.personaId] = t.porcentaje;
        }
      }
      onSaveSociedad({
        id: idOf(target.item, "soc"),
        clienteId: "",
        nombre: sNombre.trim(),
        nif: sNif.trim(),
        capitalSocial: Number(sCapital) || 0,
        fechaConstitucion: sFecha || "2020-01-01",
        situacion: "Activa",
        objetoSocial: sObjeto.trim() || "—",
        participaciones,
        ...(sValor.trim() !== "" && Number.isFinite(Number(sValor))
          ? { valor: Number(sValor) }
          : {}),
      });
    }
    if (kind === "otro" && target?.kind === "otro") {
      onSaveOtro({
        id: idOf(target.item, "otro"),
        clienteId: "",
        nombre: oNombre.trim(),
        tipo: oTipo,
        valor: Number(oValor) || 0,
        fechaAdquisicion: oFecha || undefined,
        titularidades: oTit,
      });
    }
    if (kind === "pasivo" && target?.kind === "pasivo") {
      onSavePasivo({
        id: idOf(target.item, "pas"),
        clienteId: "",
        tipo: paTipo,
        prestamista: paPrestamista.trim(),
        capitalPendiente: Number(paCapital) || 0,
        tipoInteres: (Number(paInteres) || 0) / 100,
        cuotaMensual: Number(paCuota) || 0,
        inmuebleId:
          paTipo === "hipoteca" && paInmuebleId ? paInmuebleId : undefined,
        titularidades: paTit,
      });
    }
    if (kind === "ingreso" && target?.kind === "ingreso") {
      const cotizRaw = ingCotizaciones.trim();
      const cotiz =
        cotizRaw !== "" && Number.isFinite(Number(cotizRaw))
          ? Number(cotizRaw)
          : undefined;
      onSaveIngreso({
        id: idOf(target.item, "ing"),
        clienteId: "",
        personaId: ingPersonaId,
        fuente: ingFuente,
        importeAnual: Number(ingImporte) || 0,
        cotizacionesSS:
          ingFuente === "trabajo" || ingFuente === "pension"
            ? cotiz
            : undefined,
      });
    }
    if (kind === "gasto" && target?.kind === "gasto") {
      let vinculadoA: Gasto["vinculadoA"] = null;
      if (gVinc.startsWith("persona:")) {
        vinculadoA = {
          kind: "persona",
          personaId: gVinc.slice(8),
        };
      } else if (gVinc.startsWith("inmueble:")) {
        vinculadoA = {
          kind: "inmueble",
          inmuebleId: gVinc.slice(9),
        };
      } else if (gVinc.startsWith("sociedad:")) {
        vinculadoA = {
          kind: "sociedad",
          sociedadId: gVinc.slice(9),
        };
      }
      onSaveGasto({
        id: idOf(target.item, "gas"),
        clienteId: "",
        categoria: gCat.trim(),
        importeAnual: Number(gImporte) || 0,
        vinculadoA,
      });
    }
    onClose();
  }

  function err(key: string) {
    return submitted && errors.has(key);
  }

  if (!target) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Alta de elemento"
      title={`${editing ? "Editar" : "Nuevo"} · ${TITLES[kind]}`}
      size="lg"
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={save}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="tiny" style={{ marginBottom: 4 }}>
        Carga por capas: lo mínimo ahora; el detalle se completa después desde
        su ficha. El alta no dispara cálculo fiscal.
      </div>

      {kind === "persona" && (
        <>
          <div className="field">
            <label className="lbl">Nombre</label>
            <input
              type="text"
              value={pNombre}
              onChange={(e) => setPNombre(e.target.value)}
              className={err("pNombre") ? "err" : undefined}
              placeholder="Ej.: Carlos García"
            />
            <div className={`err-msg ${err("pNombre") ? "on" : ""}`}>
              Obligatorio
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Fecha de nacimiento</label>
              <input
                type="date"
                value={pBirth}
                onChange={(e) => setPBirth(e.target.value)}
                className={err("pBirth") ? "err" : undefined}
              />
              <div className={`err-msg ${err("pBirth") ? "on" : ""}`}>
                Obligatorio
              </div>
            </div>
            <div className="field">
              <label className="lbl">CCAA</label>
              <select
                value={pCcaa}
                onChange={(e) => setPCcaa(e.target.value as CCAA)}
              >
                {CCAAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {nonCv && (
            <div className="hint-info">
              <b>ⓘ</b>
              <span>
                El cálculo fiscal solo está disponible para la Comunitat
                Valenciana.
              </span>
            </div>
          )}
        </>
      )}

      {kind === "instrumento" && (
        <>
          <div className="field">
            <label className="lbl">Nombre</label>
            <input
              type="text"
              value={iNombre}
              onChange={(e) => setINombre(e.target.value)}
              className={err("iNombre") ? "err" : undefined}
            />
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Tipo fiscal</label>
              <select
                value={iTipo}
                onChange={(e) =>
                  setITipo(e.target.value as TipoFiscalInstrumento)
                }
              >
                {TIPO_FISCAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="lbl">Valor</label>
              <input
                type="number"
                value={iValor}
                onChange={(e) => setIValor(e.target.value)}
                className={err("iValor") ? "err" : undefined}
              />
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Fecha de adquisición</label>
              <input
                type="date"
                value={iFecha}
                onChange={(e) => setIFecha(e.target.value)}
                className={err("iFecha") ? "err" : undefined}
              />
            </div>
            <div className="field">
              <label className="lbl">Coste de adquisición</label>
              <input
                type="number"
                value={iCoste}
                onChange={(e) => setICoste(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
          {iCoste && iValor && (
            <div className="tiny">
              Plusvalía latente (calculada):{" "}
              <b className="num">
                {(Number(iValor) - Number(iCoste)).toLocaleString("es-ES")} €
              </b>
            </div>
          )}
          {iTipo === "plan_pensiones" && (
            <div className="field">
              <label className="lbl">
                % aportaciones ≤ 31/12/2006 (DT 12ª)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={iFracPre2007}
                onChange={(e) => setIFracPre2007(e.target.value)}
                placeholder="Opcional · introducido por el asesor"
              />
              <div className="tiny" style={{ marginTop: 4 }}>
                Dato introducido por el asesor · no calculado. Sin él, el motor
                no aplica la reducción del 40 % en rescates en capital.
              </div>
            </div>
          )}
          <TitularidadEditor
            personas={personas}
            value={iTit}
            onChange={setITit}
            error={err("iTit")}
          />
        </>
      )}

      {kind === "inmueble" && (
        <>
          <div className="field">
            <label className="lbl">Nombre</label>
            <input
              type="text"
              value={nNombre}
              onChange={(e) => setNNombre(e.target.value)}
              className={err("nNombre") ? "err" : undefined}
            />
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Valor actual</label>
              <input
                type="number"
                value={nValor}
                onChange={(e) => setNValor(e.target.value)}
                className={err("nValor") ? "err" : undefined}
              />
            </div>
            <div className="field">
              <label className="lbl">Fecha de adquisición</label>
              <input
                type="date"
                value={nFecha}
                onChange={(e) => setNFecha(e.target.value)}
                className={err("nFecha") ? "err" : undefined}
              />
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Coste de adquisición</label>
              <input
                type="number"
                value={nCoste}
                onChange={(e) => setNCoste(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Uso</label>
              <select
                value={nUso}
                onChange={(e) =>
                  setNUso(e.target.value as UsoInmueble | "")
                }
              >
                <option value="vivienda_habitual">Vivienda habitual</option>
                <option value="segunda_residencia">Segunda residencia</option>
                <option value="alquiler">Inmueble en alquiler</option>
                <option value="local">Local</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="lbl">Hipoteca asociada</label>
            <select
              value={nPasivoId}
              onChange={(e) => setNPasivoId(e.target.value)}
            >
              <option value="">Ninguna</option>
              {pasivos
                .filter((p) => p.tipo === "hipoteca")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    Hipoteca {p.prestamista}
                  </option>
                ))}
            </select>
          </div>
          <TitularidadEditor
            personas={personas}
            value={nTit}
            onChange={setNTit}
            error={err("nTit")}
          />
        </>
      )}

      {kind === "sociedad" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Nombre</label>
              <input
                type="text"
                value={sNombre}
                onChange={(e) => setSNombre(e.target.value)}
                className={err("sNombre") ? "err" : undefined}
              />
            </div>
            <div className="field">
              <label className="lbl">NIF</label>
              <input
                type="text"
                value={sNif}
                onChange={(e) => setSNif(e.target.value)}
                className={err("sNif") ? "err" : undefined}
              />
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Capital social</label>
              <input
                type="number"
                value={sCapital}
                onChange={(e) => setSCapital(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="lbl">Constitución</label>
              <input
                type="date"
                value={sFecha}
                onChange={(e) => setSFecha(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="lbl">Objeto social</label>
            <input
              type="text"
              value={sObjeto}
              onChange={(e) => setSObjeto(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="lbl">Valor (opcional)</label>
            <input
              type="number"
              value={sValor}
              onChange={(e) => setSValor(e.target.value)}
              placeholder="Puede quedar sin valorar"
            />
          </div>
          <TitularidadEditor
            personas={personas}
            value={sParts}
            onChange={setSParts}
            error={err("sParts")}
          />
        </>
      )}

      {kind === "otro" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Nombre</label>
              <input
                type="text"
                value={oNombre}
                onChange={(e) => setONombre(e.target.value)}
                className={err("oNombre") ? "err" : undefined}
              />
            </div>
            <div className="field">
              <label className="lbl">Tipo</label>
              <select
                value={oTipo}
                onChange={(e) => setOTipo(e.target.value as TipoOtroActivo)}
              >
                {TIPO_OTRO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Valor</label>
              <input
                type="number"
                value={oValor}
                onChange={(e) => setOValor(e.target.value)}
                className={err("oValor") ? "err" : undefined}
              />
            </div>
            <div className="field">
              <label className="lbl">Fecha de adquisición</label>
              <input
                type="date"
                value={oFecha}
                onChange={(e) => setOFecha(e.target.value)}
              />
            </div>
          </div>
          <TitularidadEditor
            personas={personas}
            value={oTit}
            onChange={setOTit}
            error={err("oTit")}
          />
        </>
      )}

      {kind === "pasivo" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Tipo</label>
              <select
                value={paTipo}
                onChange={(e) => setPaTipo(e.target.value as TipoPasivo)}
              >
                {TIPO_PASIVO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="lbl">Prestamista</label>
              <input
                type="text"
                value={paPrestamista}
                onChange={(e) => setPaPrestamista(e.target.value)}
                className={err("paPrestamista") ? "err" : undefined}
              />
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Capital pendiente</label>
              <input
                type="number"
                value={paCapital}
                onChange={(e) => setPaCapital(e.target.value)}
                className={err("paCapital") ? "err" : undefined}
              />
            </div>
            <div className="field">
              <label className="lbl">Tipo de interés (%)</label>
              <input
                type="number"
                step="0.01"
                value={paInteres}
                onChange={(e) => setPaInteres(e.target.value)}
              />
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Cuota mensual</label>
              <input
                type="number"
                value={paCuota}
                onChange={(e) => setPaCuota(e.target.value)}
              />
            </div>
            {paTipo === "hipoteca" && (
              <div className="field">
                <label className="lbl">Inmueble asociado</label>
                <select
                  value={paInmuebleId}
                  onChange={(e) => setPaInmuebleId(e.target.value)}
                >
                  <option value="">Ninguno</option>
                  {inmuebles.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <TitularidadEditor
            personas={personas}
            value={paTit}
            onChange={setPaTit}
            error={err("paTit")}
          />
        </>
      )}

      {kind === "ingreso" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Persona</label>
              <select
                value={ingPersonaId}
                onChange={(e) => setIngPersonaId(e.target.value)}
                className={err("ingPersona") ? "err" : undefined}
              >
                <option value="">Elegir…</option>
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {`${p.nombre} ${p.apellidos}`.trim()}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="lbl">Fuente</label>
              <select
                value={ingFuente}
                onChange={(e) =>
                  setIngFuente(e.target.value as FuenteIngreso)
                }
              >
                {FUENTE_INGRESO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="lbl">Importe anual</label>
            <input
              type="number"
              value={ingImporte}
              onChange={(e) => setIngImporte(e.target.value)}
              className={err("ingImporte") ? "err" : undefined}
            />
          </div>
          {(ingFuente === "trabajo" || ingFuente === "pension") && (
            <div className="field">
              <label className="lbl">
                Cotizaciones SS anuales (opcional)
              </label>
              <input
                type="number"
                value={ingCotizaciones}
                onChange={(e) => setIngCotizaciones(e.target.value)}
                placeholder="Art. 19.2.a · no se estima si falta"
              />
              <div className="tiny" style={{ marginTop: 4 }}>
                Dato del asesor. Si no se informa, el motor resta 0 € (no inventa
                cotizaciones).
              </div>
            </div>
          )}
        </>
      )}

      {kind === "gasto" && (
        <>
          <div className="grid2">
            <div className="field">
              <label className="lbl">Categoría</label>
              <select
                value={gCat}
                onChange={(e) => setGCat(e.target.value)}
                className={err("gCat") ? "err" : undefined}
              >
                {GASTO_CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="lbl">Importe anual</label>
              <input
                type="number"
                value={gImporte}
                onChange={(e) => setGImporte(e.target.value)}
                className={err("gImporte") ? "err" : undefined}
              />
            </div>
          </div>
          <div className="field">
            <label className="lbl">Vincular a</label>
            <select
              value={gVinc}
              onChange={(e) => setGVinc(e.target.value)}
            >
              <option value="ninguno">Sin vincular</option>
              {personas.map((p) => (
                <option key={p.id} value={`persona:${p.id}`}>
                  Persona · {`${p.nombre} ${p.apellidos}`.trim()}
                </option>
              ))}
              {inmuebles.map((i) => (
                <option key={i.id} value={`inmueble:${i.id}`}>
                  Inmueble · {i.nombre}
                </option>
              ))}
              {sociedades.map((s) => (
                <option key={s.id} value={`sociedad:${s.id}`}>
                  Sociedad · {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </Modal>
  );
}
