export function formatNumber(val: number, decimals: number = 2): string {
  return val.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(val: number): string {
  return `${Math.round(val * 100)}%`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = (ms / 1000).toFixed(1);
  return `${sec}s`;
}

export function formatCost(usd: number): string {
  if (usd === 0) return "$0.00";
  if (usd < 0.01) return `<$0.01`;
  return `$${usd.toFixed(2)}`;
}

export function formatDelta(delta: number, inverseGood: boolean = false, isPercent: boolean = false): {
  text: string;
  isPositive: boolean;
  isNegative: boolean;
  isNeutral: boolean;
  colorClass: string;
} {
  const rounded = Number(delta.toFixed(3));
  if (rounded === 0) {
    return {
      text: "0.00",
      isPositive: false,
      isNegative: false,
      isNeutral: true,
      colorClass: "text-[var(--fg-subtle)]",
    };
  }

  const sign = delta > 0 ? "+" : "";
  const formattedVal = isPercent ? `${Math.round(delta * 100)}%` : delta.toFixed(2);
  const text = `${delta > 0 ? "▲" : "▼"} ${sign}${formattedVal}`;

  // For metrics where lower is better (latency, cost), a decrease is good (positive)
  const isGood = inverseGood ? delta < 0 : delta > 0;

  return {
    text,
    isPositive: delta > 0,
    isNegative: delta < 0,
    isNeutral: false,
    colorClass: isGood ? "text-[var(--positive)]" : "text-[var(--negative)]",
  };
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
