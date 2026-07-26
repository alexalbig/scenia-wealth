"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const CLIENT_NAV = [
  { href: "patrimonio", label: "Patrimonio" },
  { href: "fiscalidad", label: "Fiscalidad" },
  { href: "proyeccion", label: "Proyección" },
  { href: "escenarios", label: "Escenarios" },
  { href: "historial", label: "Historial" },
] as const;

interface ClientNavProps {
  clienteId: string;
  clienteNombre: string;
}

/**
 * Barra plana de 5 entradas — dentro del cliente.
 * Las fichas NO están aquí; se abren pinchando elementos.
 */
export function ClientNav({ clienteId, clienteNombre }: ClientNavProps) {
  const pathname = usePathname();
  const base = `/clientes/${clienteId}`;

  return (
    <header className="border-b border-line-2 bg-paper">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="label-upper shrink-0 text-mute hover:text-blue"
          >
            ← Cartera
          </Link>
          <span className="h-4 w-px bg-line-2" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold tracking-[-0.02em] text-ink">
              {clienteNombre}
            </p>
          </div>
        </div>
        <span className="label-upper hidden sm:inline">Scenia Wealth</span>
      </div>

      <nav
        aria-label="Navegación del cliente"
        className="mx-auto flex max-w-[1280px] gap-0 overflow-x-auto px-3"
      >
        {CLIENT_NAV.map((item) => {
          const href = `${base}/${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "relative shrink-0 px-3.5 py-2.5 text-[12px] font-semibold transition-colors",
                active ? "text-blue" : "text-mute hover:text-ink-3",
              )}
            >
              {item.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function AppTopBar({
  title = "Cartera",
  action,
}: {
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line-2 bg-paper">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-bold tracking-[-0.02em] text-ink">
            Scenia Wealth
          </span>
          <span className="h-4 w-px bg-line-2" />
          <h1 className="text-[13px] font-semibold text-ink-3">{title}</h1>
        </div>
        {action}
      </div>
    </header>
  );
}

export function PaperShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-paper">
        {children}
      </div>
    </div>
  );
}
