import { cn } from "@/lib/cn";

export function Sheet({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("sheet", className)}>{children}</div>;
}

export function SheetPad({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("sheet-pad", className)} style={style}>
      {children}
    </div>
  );
}
