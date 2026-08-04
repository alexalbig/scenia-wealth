const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true,
});

const currencyExact = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

/** Entero con separador de miles es-ES (sin símbolo €). */
const integerES = new Intl.NumberFormat("es-ES", {
  useGrouping: true,
  maximumFractionDigits: 0,
});

export function formatIntegerES(value: number): string {
  return integerES.format(value);
}

const percent = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 0,
});

export function formatEUR(value: number, exact = false): string {
  return (exact ? currencyExact : currency).format(value);
}

export function formatPercent(value: number): string {
  return percent.format(value);
}

/** Tipo marginal de escala (fracción → «22,5 %»). Un decimal; no redondea a entero. */
export function formatTipo(tipo: number): string {
  return (
    new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    }).format(tipo * 100) + " %"
  );
}

export function formatDeltaEUR(value: number, exact = false): string {
  const abs = formatEUR(Math.abs(value), exact);
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return abs;
}

/** Fecha relativa tipo "hace 2 meses" a partir de meses atrás desde hoy. */
export function monthsAgoLabel(monthsAgo: number, now = new Date()): string {
  if (monthsAgo <= 0) return "hoy";
  if (monthsAgo < 1) {
    const weeks = Math.max(1, Math.round(monthsAgo * 4.345));
    return weeks === 1 ? "hace 1 semana" : `hace ${weeks} semanas`;
  }
  if (monthsAgo < 12) {
    const m = Math.round(monthsAgo);
    return m === 1 ? "hace 1 mes" : `hace ${m} meses`;
  }
  const years = Math.round(monthsAgo / 12);
  return years === 1 ? "hace 1 año" : `hace ${years} años`;
}

export function ageFromBirthYear(birthYear: number, now = new Date()): number {
  return now.getFullYear() - birthYear;
}
