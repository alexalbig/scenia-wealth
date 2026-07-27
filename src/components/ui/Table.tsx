import { cn } from "@/lib/cn";

export function Table({
  className,
  children,
  ...rest
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse text-left text-[12.5px]",
          className,
        )}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn(className)} {...rest}>
      {children}
    </thead>
  );
}

export function TBody({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn(className)} {...rest}>
      {children}
    </tbody>
  );
}

export function TFoot({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot className={cn(className)} {...rest}>
      {children}
    </tfoot>
  );
}

export function TR({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn(className)} {...rest}>
      {children}
    </tr>
  );
}

export function TH({
  className,
  children,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-3 py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.05em] text-mute",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

/** Celdas numéricas llevan tabular-nums por defecto. */
export function TD({
  className,
  numeric = false,
  children,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        "px-3 py-[11px] align-middle text-[12.5px] text-ink",
        numeric && "tabular-nums text-right font-semibold",
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}
