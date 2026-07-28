import { cn } from "@/lib/cn";

export function Table({
  className,
  children,
  ...rest
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table className={cn(className)} {...rest}>
      {children}
    </table>
  );
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}
export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}
export function TFoot(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot {...props} />;
}
export function TR(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}

export function TH({
  className,
  sortable,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement> & { sortable?: boolean }) {
  return <th className={cn(sortable && "sortable", className)} {...rest} />;
}

export function TD({
  className,
  numeric = false,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return <td className={cn(numeric && "right num", className)} {...rest} />;
}
