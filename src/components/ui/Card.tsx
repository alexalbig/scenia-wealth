/** Compat: preferir clases mockup (`.darkcard`, `.chartbox`). */
export function Card({
  children,
  variant = "white",
  className,
  style,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "white" | "dark" | "paper";
  padding?: "sm" | "md" | "lg" | "none";
}) {
  if (variant === "dark") {
    return (
      <div className={className ? `darkcard ${className}` : "darkcard"} style={style} {...rest}>
        {children}
      </div>
    );
  }
  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--line-2)",
        borderRadius: 10,
        background: "#fff",
        padding: 14,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
