"use client";

import { useState } from "react";
import { AppTopBar, PaperShell, Sheet } from "@/components/shell/AppShell";
import {
  Avatar,
  Button,
  SheetPad,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Toast,
  TR,
} from "@/components/ui";
import { seed } from "@/lib/seed";

/**
 * P8 · Ajustes — marcado literal del mockup.
 * Marca del despacho + usuarios/asientos. Sin parámetros fiscales (V2).
 */
export default function AjustesPage() {
  const [nombreDespacho, setNombreDespacho] = useState(seed.cuenta.nombre);
  const [registroCnmv, setRegistroCnmv] = useState("EAF 000 (demo)");
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  const logoInitial =
    nombreDespacho.trim().charAt(0).toUpperCase() || "D";

  return (
    <PaperShell>
      <AppTopBar />

      <Sheet>
        <div className="scr-head">
          <div className="grow">
            <div className="lbl">Configuración</div>
            <div className="h1">Ajustes</div>
          </div>
        </div>

        <SheetPad style={{ paddingTop: 0, display: "grid", gap: 14 }}>
          <div
            style={{
              border: "1px solid var(--line-2)",
              borderRadius: 10,
              background: "#fff",
              padding: "16px 18px",
            }}
          >
            <div className="h3">Marca del despacho</div>
            <div className="sub" style={{ margin: "3px 0 12px" }}>
              Identidad que aparece en los informes PDF generados.
            </div>
            <div className="grid2">
              <div className="field">
                <label className="lbl">Nombre del despacho</label>
                <input
                  type="text"
                  value={nombreDespacho}
                  onChange={(e) => setNombreDespacho(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="lbl">Nº registro CNMV</label>
                <input
                  type="text"
                  value={registroCnmv}
                  onChange={(e) => setRegistroCnmv(e.target.value)}
                />
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--paper-2)",
                  border: "1px dashed var(--faintest)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--mute)",
                  fontWeight: 700,
                }}
                aria-label="Marcador de posición del logo"
              >
                {logoInitial}
              </div>
              <Button
                size="sm"
                type="button"
                onClick={() =>
                  flash("Carga de logo simulada en esta demo")
                }
              >
                Subir logo
              </Button>
            </div>
          </div>

          <div
            style={{
              border: "1px solid var(--line-2)",
              borderRadius: 10,
              background: "#fff",
              padding: "16px 18px",
            }}
          >
            <div className="h3">Usuarios y asientos</div>
            <div className="sub" style={{ margin: "3px 0 10px" }}>
              Modelo por asiento · 1 de 3 asientos en uso.
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Usuario</TH>
                  <TH>Rol</TH>
                  <TH>Estado</TH>
                </TR>
              </THead>
              <TBody>
                <TR>
                  <TD>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                      }}
                    >
                      <Avatar initials="MA" />
                      <b>Marco Asesor</b>
                    </div>
                  </TD>
                  <TD>Titular</TD>
                  <TD>
                    <span
                      className="pill"
                      style={{
                        background: "var(--green-bg)",
                        color: "var(--green)",
                      }}
                    >
                      Activo
                    </span>
                  </TD>
                </TR>
              </TBody>
            </Table>
            <Button
              size="sm"
              type="button"
              style={{ marginTop: 10 }}
              onClick={() =>
                flash(
                  "Invitaciones disponibles en el producto, no en la demo",
                )
              }
            >
              + Invitar usuario
            </Button>
          </div>
        </SheetPad>
      </Sheet>

      <Toast message={toast} />
    </PaperShell>
  );
}
