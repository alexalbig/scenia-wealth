import { cn } from "@/lib/cn";

export function Table({
  className,
  children,
  ...rest
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-left text-[12px]", className)}
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
    <thead className={cn("border-b border-line-2", className)} {...rest}>
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
    <tbody className={cn("divide-y divide-line", className)} {...rest}>
      {children}
    </tbody>
  );
}

export function TR({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("hover:bg-paper-2/80 transition-colors", className)}
      {...rest}
    >
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
        "label-upper px-3 py-2.5 font-semibold text-mute",
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
        "px-3 py-2.5 text-ink align-middle",
        numeric && "tabular-nums text-right font-semibold",
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}
