// Single source of truth for the current limited-time discount — used by the
// top announcement banner, the Premium-section pricing card, and the VIP
// hero pitch card. Update once here when the offer changes instead of
// hunting down three separate copies.
export const DISCOUNT_CODE = "DTMY6JYW";
export const DISCOUNT_PERCENT = 30;
export const DISCOUNT_OLD_PRICE = "$44.99";
export const DISCOUNT_NEW_PRICE = "$31.49";
export const DISCOUNT_CHECKOUT_URL = "https://buymeacoffee.com/omerovvvvv/e/547932";
// End of day, 8 Sep 2026, UK time (Europe/London) — matches the site's other
// time-boxed banners, which all key off UK time for a single consistent cutoff
// regardless of visitor timezone.
export const DISCOUNT_EXPIRES_AT_UTC = new Date("2026-09-08T23:59:59+01:00").getTime();

export function isDiscountExpired(): boolean {
  return Date.now() > DISCOUNT_EXPIRES_AT_UTC;
}

export const DISCOUNT_DATE_LABEL: Record<string, string> = {
  tr: "8 Eylül 2026",
  en: "September 8, 2026",
  hu: "2026. szeptember 8.",
  ar: "8 سبتمبر 2026",
  pt: "8 de setembro de 2026",
};
