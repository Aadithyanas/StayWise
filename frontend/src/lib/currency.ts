export function parsePriceStringToNumber(input: string | number | undefined): number {
  if (input == null) return 0;
  if (typeof input === 'number') return input;
  const num = parseFloat(String(input).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

export function usdToInr(amountUsd: number, rate = 83): number {
  return Math.round(amountUsd * rate);
}

export function formatINR(amount: number): string {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

export function convertUsdPriceStringToINRDisplay(input: string | number | undefined): string {
  const usd = parsePriceStringToNumber(input);
  return formatINR(usdToInr(usd));
}





