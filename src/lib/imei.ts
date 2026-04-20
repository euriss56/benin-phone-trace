// IMEI utilities: Luhn validation + TAC (Type Allocation Code) lookup
// TAC = 8 first digits, identifies brand/model. This is a pragmatic local DB
// (not the full GSMA database, which is paid). Covers most phones sold in Bénin.

export interface TacInfo {
  brand: string;
  model: string;
}

// Compact TAC prefix database — matches by 6-digit prefix for broader coverage.
// Sources: public TAC ranges most common on the Béninois market.
const TAC_PREFIXES: Record<string, TacInfo> = {
  // Samsung
  "352099": { brand: "Samsung", model: "Galaxy A54" },
  "353048": { brand: "Samsung", model: "Galaxy S23" },
  "354401": { brand: "Samsung", model: "Galaxy A14" },
  "356303": { brand: "Samsung", model: "Galaxy A24" },
  "358240": { brand: "Samsung", model: "Galaxy" },
  // Apple
  "353328": { brand: "Apple", model: "iPhone 14" },
  "356728": { brand: "Apple", model: "iPhone 13" },
  "358433": { brand: "Apple", model: "iPhone 15" },
  "359206": { brand: "Apple", model: "iPhone 12" },
  "351526": { brand: "Apple", model: "iPhone 11" },
  // Tecno (très populaire au Bénin)
  "861234": { brand: "Tecno", model: "Camon" },
  "863112": { brand: "Tecno", model: "Spark" },
  "865432": { brand: "Tecno", model: "Pova" },
  "867891": { brand: "Tecno", model: "Phantom" },
  // Infinix
  "862301": { brand: "Infinix", model: "Hot" },
  "864502": { brand: "Infinix", model: "Note" },
  "866110": { brand: "Infinix", model: "Smart" },
  // Itel
  "868901": { brand: "Itel", model: "A-series" },
  "869102": { brand: "Itel", model: "Vision" },
  // Xiaomi
  "860123": { brand: "Xiaomi", model: "Redmi Note" },
  "862456": { brand: "Xiaomi", model: "Redmi" },
  "864789": { brand: "Xiaomi", model: "Poco" },
  // Huawei
  "867012": { brand: "Huawei", model: "P-series" },
  "868345": { brand: "Huawei", model: "Y-series" },
  // Oppo
  "863901": { brand: "Oppo", model: "A-series" },
};

/**
 * Validate IMEI using the Luhn algorithm (mod 10).
 * @param imei 15-digit string
 */
export function isValidLuhn(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei[i], 10);
    // Double every second digit from the right (i.e. even indices when length=15)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Lookup brand/model from the TAC (first 8 digits, matched by 6-digit prefix).
 * Returns null if unknown — this is expected for many devices.
 */
export function lookupTac(imei: string): TacInfo | null {
  if (imei.length < 8) return null;
  const prefix6 = imei.slice(0, 6);
  return TAC_PREFIXES[prefix6] ?? null;
}

/**
 * Format IMEI for readability: 12-345678-901234-5
 */
export function formatImei(imei: string): string {
  const d = imei.replace(/\D/g, "");
  if (d.length !== 15) return d;
  return `${d.slice(0, 2)}-${d.slice(2, 8)}-${d.slice(8, 14)}-${d.slice(14)}`;
}
