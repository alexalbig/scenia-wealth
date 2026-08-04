"use client";

import { useState } from "react";
import { formatEUR, formatTipo } from "@/lib/format";
import type { EspacioTramo, Tramo } from "@/lib/fiscal";

/**
 * Una columna de escala (estatal o autonómica) · porte de fiscalidad-d-zona.
 * Solo rebanado de tramos + geometría de barra — ninguna cifra fiscal propia.
 */
export function EscalaColumna({
  nombre,
  tramos,
  activo,
  base,
}: {
  nombre: string;
  tramos: Tramo[];
  activo: EspacioTramo | null;
  base: number;
}) {
  const [infOpen, setInfOpen] = useState(false);
  const [supOpen, setSupOpen] = useState(false);

  if (!activo || tramos.length === 0) {
    return (
      <section className="esc">
        <div className="esc-head">
          <span className="lbl">{nombre}</span>
          <span className="tag">🔒 solo lectura</span>
        </div>
        <div className="esc-foot">Sin tramo aplicable — hueco</div>
      </section>
    );
  }

  const idx = activo.tramoIndex;
  const inf = tramos.slice(0, idx);
  const act = tramos[idx]!;
  const nxt = tramos[idx + 1] ?? null;
  const sup = tramos.slice(idx + 2);

  const w =
    act.hasta === Infinity
      ? 50
      : Math.min(
          Math.max(((base - act.desde) / (act.hasta - act.desde)) * 100, 0),
          100,
        );
  const quedan = activo.espacio;

  return (
    <section className="esc">
      <div className="esc-head">
        <span className="lbl">{nombre}</span>
        <span className="tag">🔒 solo lectura</span>
      </div>

      {inf.length > 0 && (
        <>
          <div
            className="trow grp num"
            role="button"
            tabIndex={0}
            onClick={() => setInfOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setInfOpen((o) => !o);
              }
            }}
          >
            <span>
              <span className="cue">{infOpen ? "▾" : "▸"}</span>
              {inf.length} tramos superados · {formatEUR(inf[0]!.desde)} –{" "}
              {formatEUR(inf[inf.length - 1]!.hasta)}
            </span>
            <span className="r">
              {formatTipo(inf[0]!.tipo)} – {formatTipo(inf[inf.length - 1]!.tipo)}
            </span>
          </div>
          {infOpen &&
            inf.map((t) => (
              <div
                key={`inf-${t.desde}`}
                className="trow num"
              >
                <span>
                  {formatEUR(t.desde)} – {formatEUR(t.hasta)}
                </span>
                <span className="r">{formatTipo(t.tipo)}</span>
              </div>
            ))}
        </>
      )}

      <div className="active num">
        <div className="head">
          <span>
            Tramo actual · <b>{formatTipo(act.tipo)}</b>
          </span>
          <span>
            {formatEUR(act.desde)} –{" "}
            {act.hasta === Infinity ? "∞" : formatEUR(act.hasta)}
          </span>
        </div>
        <div className="abar">
          <div className="afill" style={{ width: `${w}%` }} />
          <div className="amark" style={{ left: `${w}%` }}>
            <i>{formatEUR(base)}</i>
          </div>
        </div>
        <div className="ainfo">
          <span>lo que exceda tributa aquí al {formatTipo(act.tipo)}</span>
          <span className="aquedan">
            {quedan != null ? formatEUR(quedan) : "—"}{" "}
            <small>hasta el {nxt ? formatTipo(nxt.tipo) : "—"}</small>
          </span>
        </div>
      </div>

      {nxt && (
        <div className="trow dim num">
          <span>
            siguiente · {formatEUR(nxt.desde)} –{" "}
            {nxt.hasta === Infinity ? "∞" : formatEUR(nxt.hasta)}
          </span>
          <span className="r">{formatTipo(nxt.tipo)}</span>
        </div>
      )}

      {sup.length > 0 && (
        <>
          <div
            className="trow grp num"
            role="button"
            tabIndex={0}
            onClick={() => setSupOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSupOpen((o) => !o);
              }
            }}
          >
            <span>
              <span className="cue">{supOpen ? "▾" : "▸"}</span>
              {sup.length} tramos superiores
            </span>
            <span className="r">
              hasta {formatTipo(sup[sup.length - 1]!.tipo)}
            </span>
          </div>
          {supOpen &&
            sup.map((t) => (
              <div key={`sup-${t.desde}`} className="trow num">
                <span>
                  {formatEUR(t.desde)} –{" "}
                  {t.hasta === Infinity ? "∞" : formatEUR(t.hasta)}
                </span>
                <span className="r">{formatTipo(t.tipo)}</span>
              </div>
            ))}
        </>
      )}

      <div className="esc-foot">
        parámetros (a verificar) · fuente en la tabla del motor
      </div>
    </section>
  );
}
