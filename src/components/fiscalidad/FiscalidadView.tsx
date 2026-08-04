"use client";

import { useMemo, useState } from "react";
import { SheetPad } from "@/components/ui";
import { FiscalControls } from "@/components/fiscalidad/FiscalControls";
import { EscalaColumna } from "@/components/fiscalidad/EscalaColumna";
import { EstadoPersonaPanel } from "@/components/fiscalidad/EstadoPersonaPanel";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import { formatEUR, formatTipo } from "@/lib/format";
import {
  anioPorDefecto,
  aniosToolbarFiscal,
  avisoCoberturaCcaa,
  baseAhorroPersona,
  ccaaConCobertura,
  estadoFiscalPersona,
  getTramos,
  liquidacionEjercicio,
  margenSiguienteSaltoGeneral,
  tramoDeBase,
  type EstadoFiscalPersona,
} from "@/lib/fiscal";
import type { Cliente } from "@/lib/types";

/**
 * P4 · Fiscalidad — foto del plan base (porte de fiscalidad-d-zona).
 * Toda cifra sale del motor. La UI solo jerarquiza y pinta.
 */
export function FiscalidadView({ cliente }: { cliente: Cliente }) {
  const { bag, desgloseBasePersona } = useExpediente();
  const personas = bag.personas;

  const anios = useMemo(() => aniosToolbarFiscal(), []);
  const [personaId, setPersonaId] = useState(() => personas[0]?.id ?? "");
  const [anio, setAnio] = useState(anioPorDefecto);

  const estados = useMemo(() => {
    const map: Record<string, EstadoFiscalPersona> = {};
    for (const p of personas) {
      const ingresos = bag.ingresos.filter((i) => i.personaId === p.id);
      map[p.id] = estadoFiscalPersona(p, ingresos);
    }
    return map;
  }, [personas, bag.ingresos]);

  // Expediente sin personas: avisos de cobertura / ligero (orden: CCAA primero).
  if (personas.length === 0) {
    return (
      <SheetPad>
        <div className="top">
          <div>
            <div className="lbl">Fiscalidad · Foto del plan base</div>
            <div className="h2">Cómo está fiscalmente este cliente</div>
          </div>
        </div>
        <section className="notes">
          {!ccaaConCobertura(cliente.ccaa) && (
            <div className="nrow">
              <span className="lbl">Cobertura</span>
              <span>{avisoCoberturaCcaa(cliente.ccaa)}</span>
            </div>
          )}
          {!cliente.completo && (
            <div className="nrow">
              <span className="lbl">Expediente</span>
              <span>
                Este expediente solo puebla la Cartera. Faltan ingresos y datos
                suficientes para liquidar el ejercicio — hueco, sin cifra
                inventada.
              </span>
            </div>
          )}
          {ccaaConCobertura(cliente.ccaa) && cliente.completo && (
            <div className="nrow">
              <span className="lbl">Personas</span>
              <span>No hay personas en el expediente.</span>
            </div>
          )}
        </section>
      </SheetPad>
    );
  }

  const personaActiva =
    personas.find((p) => p.id === personaId) ?? personas[0]!;
  const pid = personaActiva.id;
  const nombreCorto = personaActiva.nombre;
  const estado = estados[pid] ?? estadoFiscalPersona(personaActiva, []);

  return (
    <SheetPad>
      <div className="top">
        <div>
          <div className="lbl">Fiscalidad · Foto del plan base</div>
          <div className="h2">Cómo está fiscalmente este cliente</div>
        </div>
        <FiscalControls
          personas={personas}
          estados={estados}
          personaId={pid}
          onPersona={setPersonaId}
          anios={anios}
          anio={anio}
          onAnio={setAnio}
        />
      </div>

      {estado.kind === "sin_calculo" ? (
        <EstadoPersonaPanel estado={estado} clienteId={cliente.id} />
      ) : (
        <PersonaCalculable
          cliente={cliente}
          personaId={pid}
          nombreCorto={nombreCorto}
          anio={anio}
          desgloseBasePersona={desgloseBasePersona}
          perfil={estado.perfil}
        />
      )}

      {!cliente.completo && (
        <section className="notes" style={{ marginTop: 14 }}>
          <div className="nrow">
            <span className="lbl">Expediente</span>
            <span>
              Este expediente solo puebla la Cartera. La foto fiscal se limita a
              las personas cargadas — sin inventar el resto.
            </span>
          </div>
        </section>
      )}
    </SheetPad>
  );
}

function PersonaCalculable({
  cliente,
  personaId,
  nombreCorto,
  anio,
  desgloseBasePersona,
  perfil,
}: {
  cliente: Cliente;
  personaId: string;
  nombreCorto: string;
  anio: number;
  desgloseBasePersona: ReturnType<
    typeof useExpediente
  >["desgloseBasePersona"];
  perfil: Extract<EstadoFiscalPersona, { kind: "calculable" }>["perfil"];
}) {
  const desg = desgloseBasePersona(personaId);
  const baseG = desg.baseLiquidable;
  const baseA = baseAhorroPersona(cliente.id, personaId);
  const { bag } = useExpediente();
  const persona = bag.personas.find((p) => p.id === personaId);
  const edad = persona ? anio - persona.birthYear : undefined;
  // Cobertura por persona (estado ya filtró); liquidamos con persona.ccaa.
  const ccaa = persona?.ccaa ?? cliente.ccaa;
  const liq = liquidacionEjercicio({
    baseGeneral: baseG,
    baseAhorro: baseA ?? 0,
    anio,
    ccaa,
    edad,
  });

  const tramosEst = getTramos("estatal", anio);
  const tramosAut = getTramos("autonomica", anio);
  const activoEst = tramoDeBase(baseG, "estatal", anio);
  const activoAut = tramoDeBase(baseG, "autonomica", anio);
  const margen = margenSiguienteSaltoGeneral(baseG, anio, ccaa);

  const baseSub =
    desg.conceptos.length > 0
      ? `de ${formatEUR(Math.round(desg.bruto))} brutos · ${resumenConceptos(desg, perfil)}`
      : desg.nota;

  return (
    <>
      <div className="idrow num">
        <div className="idcell">
          <div className="lbl">
            Cuota del ejercicio {anio} · {nombreCorto}
          </div>
          <div className="v">{formatEUR(liq.cuotaGeneral)}</div>
          <div className="s">
            estatal {formatEUR(liq.estatalGeneral)} · autonómica{" "}
            {formatEUR(liq.autonomicaGeneral)}
          </div>
        </div>
        <div className="idcell">
          <div className="lbl">Base liquidable · arts. 19/20</div>
          <div className="v">{formatEUR(Math.round(baseG))}</div>
          <div className="s">{baseSub}</div>
        </div>
        <div className="idcell">
          <div className="lbl">Estado</div>
          <div className="v" style={{ fontSize: 14, marginTop: 6 }}>
            orientativo
          </div>
          <div className="s">
            {liq.parametrosAVerificar ? "parámetros (a verificar) · " : ""}
            🔒 escalas de solo lectura
          </div>
        </div>
      </div>

      <div className="cols">
        <EscalaColumna
          nombre="Escala autonómica CV · Ley 13/1997"
          tramos={tramosAut}
          activo={activoAut}
          base={baseG}
        />
        <EscalaColumna
          nombre="Escala estatal · art. 63.1"
          tramos={tramosEst}
          activo={activoEst}
          base={baseG}
        />
      </div>

      {margen && (
        <section className="notes" style={{ marginBottom: 14 }}>
          <div className="nrow">
            <span className="lbl">Lectura · orientativo</span>
            <span>
              Una renta adicional en base general —por ejemplo, un rescate del
              plan— tributa al{" "}
              <strong className="num">{formatTipo(margen.tipoCombinado)}</strong>{" "}
              combinado hasta agotar{" "}
              <strong className="num">{formatEUR(margen.margen)}</strong>; a
              partir de ahí, al{" "}
              <strong className="num">
                {formatTipo(margen.tipoCombinadoTrasSalto)}
              </strong>
              .
            </span>
          </div>
        </section>
      )}

      <section className="notes">
        <div className="nrow">
          <span className="lbl">Cómo leerlo</span>
          <span>
            Los tramos ya superados y los lejanos vienen plegados: pincha para
            desplegarlos. La zona donde está la persona se muestra abierta con
            su posición exacta.
          </span>
        </div>
        <div className="nrow">
          <span className="lbl">Base del ahorro</span>
          <span>
            {baseA == null
              ? "Sin rentas del ahorro en el expediente — hueco. Las plusvalías latentes no tributan hasta que un evento las realice."
              : `Base del ahorro ${formatEUR(baseA)} → cuota ${formatEUR(liq.cuotaAhorro)} · orientativo`}
          </span>
        </div>
        {liq.minimoAutonomicoSimplificado && (
          <div className="nrow">
            <span className="lbl">Simplificación declarada</span>
            <span>
              Gravamen autonómico con mínimo estatal · cálculo individual.
            </span>
          </div>
        )}
        {!liq.minimoAutonomicoSimplificado && (
          <div className="nrow">
            <span className="lbl">Simplificación declarada</span>
            <span>Cálculo individual · la tributación conjunta no está contemplada.</span>
          </div>
        )}
      </section>
    </>
  );
}

function resumenConceptos(
  desg: ReturnType<ReturnType<typeof useExpediente>["desgloseBasePersona"]>,
  perfil: string,
): string {
  if (perfil === "pension") {
    const partes: string[] = [];
    if (desg.gastosOtrosArt19 > 0) {
      partes.push(`gastos art. 19 restados`);
    }
    return partes.length > 0 ? partes.join(" · ") : "pensión";
  }
  const partes: string[] = [];
  if (desg.cotizacionesInformadas) partes.push("SS y gastos restados");
  else if (desg.trabajoBruto > 0) partes.push("gastos restados");
  return partes.join(" · ") || "arts. 19/20";
}
