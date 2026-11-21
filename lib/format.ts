const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export const formatPence = (pence: number) => gbp.format(pence / 100);

/** "12.99" -> 1299. Returns NaN for invalid input. */
export function poundsToPence(pounds: string): number {
  const value = Number(pounds.trim());
  return Number.isFinite(value) ? Math.round(value * 100) : NaN;
}

export const penceToPounds = (pence: number) => (pence / 100).toFixed(2);

export const formatWeight = (grams: number) =>
  grams >= 1000 ? `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 2)} kg` : `${grams} g`;
