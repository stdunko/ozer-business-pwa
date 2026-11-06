export type Country = {
  iso: string;
  dial: string;
  flag: string;
};

export const COUNTRIES: Country[] = [
  { iso: "IL", dial: "972", flag: "🇮🇱" },
  { iso: "RU", dial: "7", flag: "🇷🇺" },
  { iso: "UA", dial: "380", flag: "🇺🇦" },
  { iso: "BY", dial: "375", flag: "🇧🇾" },
  { iso: "KZ", dial: "7", flag: "🇰🇿" },
  { iso: "US", dial: "1", flag: "🇺🇸" },
  { iso: "CA", dial: "1", flag: "🇨🇦" },
  { iso: "GB", dial: "44", flag: "🇬🇧" },
  { iso: "DE", dial: "49", flag: "🇩🇪" },
  { iso: "FR", dial: "33", flag: "🇫🇷" },
  { iso: "IT", dial: "39", flag: "🇮🇹" },
  { iso: "ES", dial: "34", flag: "🇪🇸" },
  { iso: "PL", dial: "48", flag: "🇵🇱" },
  { iso: "TR", dial: "90", flag: "🇹🇷" },
  { iso: "AE", dial: "971", flag: "🇦🇪" },
  { iso: "SA", dial: "966", flag: "🇸🇦" },
  { iso: "EG", dial: "20", flag: "🇪🇬" },
  { iso: "JO", dial: "962", flag: "🇯🇴" },
  { iso: "PS", dial: "970", flag: "🇵🇸" },
  { iso: "LB", dial: "961", flag: "🇱🇧" },
  { iso: "CY", dial: "357", flag: "🇨🇾" },
  { iso: "GR", dial: "30", flag: "🇬🇷" },
  { iso: "NL", dial: "31", flag: "🇳🇱" },
  { iso: "BE", dial: "32", flag: "🇧🇪" },
  { iso: "AT", dial: "43", flag: "🇦🇹" },
  { iso: "CH", dial: "41", flag: "🇨🇭" },
  { iso: "SE", dial: "46", flag: "🇸🇪" },
  { iso: "NO", dial: "47", flag: "🇳🇴" },
  { iso: "FI", dial: "358", flag: "🇫🇮" },
  { iso: "DK", dial: "45", flag: "🇩🇰" },
  { iso: "CZ", dial: "420", flag: "🇨🇿" },
  { iso: "SK", dial: "421", flag: "🇸🇰" },
  { iso: "HU", dial: "36", flag: "🇭🇺" },
  { iso: "RO", dial: "40", flag: "🇷🇴" },
  { iso: "BG", dial: "359", flag: "🇧🇬" },
  { iso: "MD", dial: "373", flag: "🇲🇩" },
  { iso: "GE", dial: "995", flag: "🇬🇪" },
  { iso: "AM", dial: "374", flag: "🇦🇲" },
  { iso: "AZ", dial: "994", flag: "🇦🇿" },
  { iso: "UZ", dial: "998", flag: "🇺🇿" },
  { iso: "TJ", dial: "992", flag: "🇹🇯" },
  { iso: "KG", dial: "996", flag: "🇰🇬" },
  { iso: "TM", dial: "993", flag: "🇹🇲" },
  { iso: "LT", dial: "370", flag: "🇱🇹" },
  { iso: "LV", dial: "371", flag: "🇱🇻" },
  { iso: "EE", dial: "372", flag: "🇪🇪" },
  { iso: "PT", dial: "351", flag: "🇵🇹" },
  { iso: "IE", dial: "353", flag: "🇮🇪" },
  { iso: "AU", dial: "61", flag: "🇦🇺" },
  { iso: "NZ", dial: "64", flag: "🇳🇿" },
  { iso: "IN", dial: "91", flag: "🇮🇳" },
  { iso: "CN", dial: "86", flag: "🇨🇳" },
  { iso: "JP", dial: "81", flag: "🇯🇵" },
  { iso: "KR", dial: "82", flag: "🇰🇷" },
  { iso: "BR", dial: "55", flag: "🇧🇷" },
  { iso: "MX", dial: "52", flag: "🇲🇽" },
  { iso: "AR", dial: "54", flag: "🇦🇷" },
  { iso: "ZA", dial: "27", flag: "🇿🇦" },
  { iso: "NG", dial: "234", flag: "🇳🇬" },
  { iso: "KE", dial: "254", flag: "🇰🇪" },
  { iso: "TH", dial: "66", flag: "🇹🇭" },
  { iso: "VN", dial: "84", flag: "🇻🇳" },
  { iso: "PH", dial: "63", flag: "🇵🇭" },
  { iso: "ID", dial: "62", flag: "🇮🇩" },
  { iso: "MY", dial: "60", flag: "🇲🇾" },
  { iso: "SG", dial: "65", flag: "🇸🇬" },
  { iso: "HK", dial: "852", flag: "🇭🇰" },
  { iso: "TW", dial: "886", flag: "🇹🇼" },
  { iso: "PK", dial: "92", flag: "🇵🇰" },
  { iso: "BD", dial: "880", flag: "🇧🇩" },
  { iso: "IR", dial: "98", flag: "🇮🇷" },
  { iso: "IQ", dial: "964", flag: "🇮🇶" },
  { iso: "KW", dial: "965", flag: "🇰🇼" },
  { iso: "QA", dial: "974", flag: "🇶🇦" },
  { iso: "BH", dial: "973", flag: "🇧🇭" },
  { iso: "OM", dial: "968", flag: "🇴🇲" },
  { iso: "MA", dial: "212", flag: "🇲🇦" },
  { iso: "DZ", dial: "213", flag: "🇩🇿" },
  { iso: "TN", dial: "216", flag: "🇹🇳" },
  { iso: "RS", dial: "381", flag: "🇷🇸" },
  { iso: "HR", dial: "385", flag: "🇭🇷" },
  { iso: "SI", dial: "386", flag: "🇸🇮" },
  { iso: "BA", dial: "387", flag: "🇧🇦" },
  { iso: "AL", dial: "355", flag: "🇦🇱" },
  { iso: "ME", dial: "382", flag: "🇲🇪" },
  { iso: "MK", dial: "389", flag: "🇲🇰" },
  { iso: "IS", dial: "354", flag: "🇮🇸" },
  { iso: "LU", dial: "352", flag: "🇱🇺" },
  { iso: "MT", dial: "356", flag: "🇲🇹" },
  { iso: "CL", dial: "56", flag: "🇨🇱" },
  { iso: "CO", dial: "57", flag: "🇨🇴" },
  { iso: "PE", dial: "51", flag: "🇵🇪" },
];

export const POPULAR_COUNTRY_ISOS = ["IL", "RU", "UA", "US", "BY", "DE", "GB", "TR", "AE", "PS"];

export const DEFAULT_COUNTRY =
  COUNTRIES.find((country) => country.iso === "IL") ?? COUNTRIES[0];

export const normalizePhoneInput = (value: string) => `+${value.replace(/\D/g, "")}`;

export const matchCountryByDigits = (digits: string): Country | undefined => {
  if (!digits) {
    return undefined;
  }
  let best: Country | undefined;
  for (const country of COUNTRIES) {
    if (!digits.startsWith(country.dial)) {
      continue;
    }
    if (!best || country.dial.length > best.dial.length) {
      best = country;
    }
  }
  return best;
};

export const resolveCountryFromPhone = (phone: string, current: Country): Country => {
  const matched = matchCountryByDigits(phone.replace(/\D/g, ""));
  if (!matched || matched.dial === current.dial) {
    return current;
  }
  return matched;
};

export const replaceDialCode = (phone: string, next: Country): string => {
  const digits = phone.replace(/\D/g, "");
  const current = matchCountryByDigits(digits);
  const rest = current ? digits.slice(current.dial.length) : "";
  return `+${next.dial}${rest}`;
};
