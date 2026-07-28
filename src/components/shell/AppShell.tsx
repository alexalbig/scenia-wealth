"use client";

import { usePathname, useRouter } from "next/navigation";

const CLIENT_NAV = [
  { href: "patrimonio", label: "Patrimonio" },
  { href: "fiscalidad", label: "Fiscalidad" },
  { href: "proyeccion", label: "Proyección" },
  { href: "escenarios", label: "Escenarios" },
  { href: "historial", label: "Historial" },
] as const;

/** Mockup `.clientnav` */
export function ClientNav({ clienteId }: { clienteId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/clientes/${clienteId}`;

  return (
    <nav className="clientnav" aria-label="Navegación del cliente">
      {CLIENT_NAV.map((item) => {
        const href = `${base}/${item.href}`;
        const active =
          pathname === href ||
          pathname.startsWith(`${href}/`) ||
          (item.href === "patrimonio" && pathname.includes("/fichas/"));
        return (
          <button
            key={item.href}
            type="button"
            className={active ? "on" : undefined}
            onClick={() => router.push(href)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

/** Mockup `.topbar` */
export function AppTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const onAjustes = pathname.startsWith("/ajustes");
  const onCartera = pathname === "/" || pathname === "";

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div className="brand-name">
          Scenia <span>Wealth</span>
        </div>
      </div>
      <div className="topnav">
        <button
          type="button"
          className={onCartera ? "on" : undefined}
          onClick={() => router.push("/")}
        >
          Cartera
        </button>
        <button
          type="button"
          className={onAjustes ? "on" : undefined}
          onClick={() => router.push("/ajustes")}
        >
          Ajustes
        </button>
      </div>
    </div>
  );
}

/** Mockup `.app` */
export function PaperShell({ children }: { children: React.ReactNode }) {
  return <div className="app">{children}</div>;
}

export { Sheet } from "@/components/ui/Sheet";
