"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  FilaFiscal,
  LiquidityBadge,
  Modal,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Tabs,
} from "@/components/ui";
import { AppTopBar, PaperShell } from "@/components/shell/AppShell";
import {
  getEscenariosDeCliente,
  ids,
  patrimonioTotalCartera,
  seed,
} from "@/lib/seed";
import { formatEUR, monthsAgoLabel } from "@/lib/format";

export default function Fase0Page() {
  const [tab, setTab] = useState("tokens");
  const [modalOpen, setModalOpen] = useState(false);
  const escenarios = getEscenariosDeCliente(ids.clienteGarciaLlorente);
  const escA = escenarios.find((e) => e.id === ids.escA)!;
  const escB = escenarios.find((e) => e.id === ids.escB)!;

  return (
    <PaperShell>
      <AppTopBar
        title="Fase 0 · Fundación"
        action={
          <Button size="sm" variant="secondary" disabled>
            + Nuevo cliente
          </Button>
        }
      />

      <main className="space-y-5 px-5 py-5">
        <Card>
          <p className="label-upper mb-1">Estado</p>
          <h2 className="text-[19px] font-bold tracking-[-0.03em] text-ink">
            Fase 0 lista — revisión
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] text-slate">
            Tokens Estilo G, DM Sans, modelo ANEXO B, seed ANEXO F (6 clientes),
            componentes base y barra plana de 5 entradas. Las pantallas P1/P3
            esperan tu OK.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/clientes/${ids.clienteGarciaLlorente}/patrimonio`}
              className="inline-flex h-8 items-center justify-center rounded-[8px] bg-blue px-3 text-[12px] font-semibold text-white hover:bg-[#314db0]"
            >
              Ver shell · García-Llorente
            </Link>
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
              Abrir modal de prueba
            </Button>
          </div>
        </Card>

        <Tabs
          items={[
            { id: "tokens", label: "Tokens" },
            { id: "seed", label: "Seed" },
            { id: "componentes", label: "Componentes" },
            { id: "firewall", label: "FilaFiscal" },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === "tokens" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <p className="label-upper mb-3">Tinta</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["ink", "bg-ink"],
                  ["ink-2", "bg-ink-2"],
                  ["ink-3", "bg-ink-3"],
                  ["slate", "bg-slate"],
                  ["mute", "bg-mute"],
                  ["faint", "bg-faint"],
                  ["faintest", "bg-faintest"],
                ].map(([name, cls]) => (
                  <div key={name} className="space-y-1">
                    <div className={`h-8 rounded-[6px] ${cls}`} />
                    <p className="text-[10px] text-mute">{name}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="label-upper mb-3">Papel · acentos · firewall</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["paper", "bg-paper border border-line-2"],
                  ["paper-2", "bg-paper-2"],
                  ["blue", "bg-blue"],
                  ["coral", "bg-coral"],
                  ["green", "bg-green"],
                  ["amber", "bg-amber"],
                  ["coral-deep", "bg-coral-deep"],
                ].map(([name, cls]) => (
                  <div key={name} className="space-y-1">
                    <div className={`h-8 rounded-[6px] ${cls}`} />
                    <p className="text-[10px] text-mute">{name}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-mute">
                Verde / ámbar solo hechos objetivos. Rojo solo errores de
                formulario. Sin sombras.
              </p>
            </Card>
            <Card variant="dark" className="md:col-span-2">
              <p className="label-upper mb-2 !text-faint">
                Superficie oscura (capacidad de ahorro)
              </p>
              <p className="text-[28px] font-bold tracking-[-0.03em] tabular-nums text-dark-text">
                {formatEUR(87_000)}
              </p>
              <p className="mt-1 text-[12px] text-green-light">
                Ingresos − gastos + amortización de capital
              </p>
            </Card>
          </div>
        )}

        {tab === "seed" && (
          <Card padding="sm">
            <div className="mb-3 flex items-baseline justify-between px-3 pt-2">
              <div>
                <p className="label-upper">ANEXO F · Cartera</p>
                <p className="text-[13px] font-semibold text-ink">
                  {seed.clientes.length} clientes ·{" "}
                  <span className="tabular-nums">
                    {formatEUR(patrimonioTotalCartera())}
                  </span>
                </p>
              </div>
              <Badge variant="blue">{seed.cuenta.nombre}</Badge>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Cliente</TH>
                  <TH>Segmento</TH>
                  <TH className="text-right">Patrimonio</TH>
                  <TH className="text-right">Escenarios</TH>
                  <TH>Última revisión</TH>
                </TR>
              </THead>
              <TBody>
                {seed.clientes.map((c) => {
                  const nEsc = getEscenariosDeCliente(c.id).length;
                  return (
                    <TR key={c.id}>
                      <TD>
                        <Link
                          href={`/clientes/${c.id}/patrimonio`}
                          className="font-semibold text-blue hover:underline"
                        >
                          {c.nombre}
                        </Link>
                        {c.completo && (
                          <Badge variant="coral" className="ml-2">
                            Completo
                          </Badge>
                        )}
                      </TD>
                      <TD>
                        <Badge variant="segment">{c.segmento}</Badge>
                      </TD>
                      <TD numeric>{formatEUR(c.patrimonioNeto)}</TD>
                      <TD numeric>{nEsc || "—"}</TD>
                      <TD>{monthsAgoLabel(c.ultimaRevisionMeses)}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Card>
        )}

        {tab === "componentes" && (
          <div className="space-y-4">
            <Card>
              <p className="label-upper mb-3">Botones · badges</p>
              <div className="flex flex-wrap gap-2">
                <Button>Primario</Button>
                <Button variant="secondary">Secundario</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="coral">Coral</Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>Neutro</Badge>
                <Badge variant="blue">Informativo</Badge>
                <Badge variant="coral">Categoría</Badge>
                <Badge variant="green">+120.000 € latente</Badge>
                <LiquidityBadge level="alta" />
                <LiquidityBadge level="media" />
              </div>
            </Card>
            <Card>
              <p className="label-upper mb-2">Tabla con tabular-nums</p>
              <Table>
                <THead>
                  <TR>
                    <TH>Instrumento</TH>
                    <TH className="text-right">Valor</TH>
                    <TH className="text-right">Plusvalía</TH>
                  </TR>
                </THead>
                <TBody>
                  {seed.instrumentos.map((i) => (
                    <TR key={i.id}>
                      <TD className="font-semibold">{i.nombre}</TD>
                      <TD numeric>{formatEUR(i.valor)}</TD>
                      <TD numeric>
                        {i.plusvaliaLatente != null ? (
                          <span className="text-green">
                            +{formatEUR(i.plusvaliaLatente)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
          </div>
        )}

        {tab === "firewall" && (
          <div className="space-y-3">
            <Card>
              <p className="label-upper mb-2">CT2 · Fila fiscal neutra</p>
              <p className="mb-3 text-[12px] text-slate">
                Sin props de color. Tinta neutra + azul informativo. Siempre
                «orientativo». Imposible coronar un ganador desde fuera.
              </p>
              <FilaFiscal
                scenarioA={escA.nombre}
                amountA={escA.impuestosPeriodo ?? 0}
                scenarioB={escB.nombre}
                amountB={escB.impuestosPeriodo ?? 0}
              />
            </Card>
            <Card className="border-dashed">
              <p className="text-[12px] text-mute">
                Regla de oro: ante la duda, no inventes un número. Hueco marcado
                &gt; cifra fiscal inventada.
              </p>
            </Card>
          </div>
        )}
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal de prueba"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalOpen(false)}>Aceptar</Button>
          </>
        }
      >
        <p className="text-[13px] text-slate">
          Componente base listo para P2 (alta de cliente) y CT1 (plantilla de
          evento). Texto de UI en español.
        </p>
      </Modal>
    </PaperShell>
  );
}
