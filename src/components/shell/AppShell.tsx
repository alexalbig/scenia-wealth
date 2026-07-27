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

export function ClientNav({ clienteId, clienteNombre }: ClientNavProps) {
  const pathname = usePathname();
  const base = `/clientes/${clienteId}`;

  return (
    <header className="border-b border-line-2 bg-white">
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="shrink-0 rounded-[6px] px-2 py-1 text-[12px] font-semibold text-slate hover:bg-paper-2 hover:text-ink"
          >
            ‹ Cartera
          </Link>
          <span className="h-4 w-px bg-line-2" />
          <p className="truncate text-[14.5px] font-bold tracking-[-0.01em] text-ink">
            {clienteNombre}
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-paper-2 text-[11px] font-bold text-ink">
            S
          </span>
          <span className="text-[12px] font-semibold text-mute">Scenia</span>
        </div>
      </div>

      <nav
        aria-label="Navegación del cliente"
        className="flex gap-0.5 overflow-x-auto border-t border-line px-3.5"
      >
        {CLIENT_NAV.map((item) => {
          const href = `${base}/${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "-mb-px shrink-0 border-b-2 px-[13px] py-[11px] text-[12.5px] font-semibold transition-colors",
                active
                  ? "border-ink text-ink"
                  : "border-transparent text-slate hover:text-ink",
              )}
            >
              {item.label}
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
  const pathname = usePathname();
  const onAjustes = pathname.startsWith("/ajustes");

  return (
    <header className="mb-4 flex items-center justify-between gap-4 px-1 pb-0 pt-1">
      <div className="flex items-center gap-2.5 text-dark-text">
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-paper text-[13px] font-bold tracking-[-0.02em] text-ink">
          S
        </span>
        <Link href="/" className="text-[14.5px] font-bold tracking-[-0.01em]">
          Scenia <span className="font-medium text-faint">Wealth</span>
        </Link>
      </div>
      <div className="flex items-center gap-1.5">
        <Link
          href="/"
          className={cn(
            "rounded-[8px] px-3 py-[7px] text-[12px] font-semibold",
            !onAjustes
              ? "bg-paper text-ink"
              : "text-[#8FA0BE] hover:bg-white/5 hover:text-dark-text",
          )}
        >
          Cartera
        </Link>
        <Link
          href="/ajustes"
          className={cn(
            "rounded-[8px] px-3 py-[7px] text-[12px] font-semibold",
            onAjustes
              ? "bg-paper text-ink"
              : "text-[#8FA0BE] hover:bg-white/5 hover:text-dark-text",
          )}
        >
          Ajustes
        </Link>
        {action}
      </div>
      {title && title !== "Cartera" && title !== "Ajustes" && (
        <span className="sr-only">{title}</span>
      )}
    </header>
  );
}

export function PaperShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <div className="mx-auto max-w-[1240px] px-5 pb-[60px] pt-[22px]">
        {children}
      </div>
    </div>
  );
}

/** Contenedor hoja de papel (mockup .sheet) */
export function Sheet({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("sheet", className)}>{children}</div>;
}
