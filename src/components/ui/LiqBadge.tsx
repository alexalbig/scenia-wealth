export function LiqBadge({ level }: { level: "a" | "b" }) {
  if (level === "a") return <span className="liq a">● Alta</span>;
  return <span className="liq b">● Media/baja</span>;
}
