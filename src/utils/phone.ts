/**
 * Clean & normalize Indian phone numbers to 10 digits.
 * Accurately strips +91, 91 prefix, leading zero, spaces, and punctuation.
 *
 * Examples:
 * "+916300745350"    -> "6300745350"
 * "+91 63007 45350"  -> "6300745350"
 * "916300745350"     -> "6300745350"
 * "06300745350"      -> "6300745350"
 * "6300745350"       -> "6300745350"
 */
export function normalizeIndianPhone(input: string | undefined | null): string {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');
  
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    // If user entered +91 or country code, take last 10 digits
    digits = digits.slice(-10);
  }
  return digits;
}

/**
 * Validates Indian 10-digit mobile number starting with 6, 7, 8, or 9
 */
export function isValidIndianPhone(input: string | undefined | null): boolean {
  const digits = normalizeIndianPhone(input);
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

/**
 * Format 10-digit phone for user display: "+91 XXXXX XXXXX"
 */
export function formatIndianPhoneDisplay(input: string | undefined | null): string {
  const digits = normalizeIndianPhone(input);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return input || '';
}
