"use client";

/**
 * Lectura en hechos · las dos caras siempre · sin coronar ganador.
 * El texto lo compone `lecturaEnHechos` en lib/escenarios.
 */
export function LecturaEnHechos({ texto }: { texto: string }) {
  return (
    <div className="sect">
      <div className="lectura">
        <span className="lbl" style={{ display: "block", marginBottom: 5 }}>
          Lectura en hechos{" "}
          <span className="orient" style={{ marginLeft: 6 }}>
            orientativo · sin recomendación
          </span>
        </span>
        <p>{texto}</p>
      </div>
    </div>
  );
}
