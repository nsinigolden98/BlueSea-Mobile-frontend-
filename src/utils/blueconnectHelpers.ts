export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
}

export function validateIdentifier(identifier: string, regexPattern?: string): boolean {
  if (!identifier || identifier.trim() === '') return false;
  if (regexPattern) {
    try {
      const regex = new RegExp(regexPattern);
      return regex.test(identifier);
    } catch (e) {
      return identifier.length >= 3;
    }
  }
  return identifier.length >= 3;
}