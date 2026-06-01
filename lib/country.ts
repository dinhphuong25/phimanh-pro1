export function getCountryFlag(nameOrSlug: string): string {
  if (!nameOrSlug) return "🌏";
  const normalized = nameOrSlug.toLowerCase().trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
    .replace(/đ/g, "d");

  const flags: Record<string, string> = {
    "han quoc": "🇰🇷",
    "han-quoc": "🇰🇷",
    "korea": "🇰🇷",
    "south korea": "🇰🇷",
    "trung quoc": "🇨🇳",
    "trung-quoc": "🇨🇳",
    "china": "🇨🇳",
    "nhat ban": "🇯🇵",
    "nhat-ban": "🇯🇵",
    "japan": "🇯🇵",
    "my": "🇺🇸",
    "hoa ky": "🇺🇸",
    "au my": "🇺🇸",
    "au-my": "🇺🇸",
    "usa": "🇺🇸",
    "united states": "🇺🇸",
    "hong kong": "🇭🇰",
    "hong-kong": "🇭🇰",
    "dai loan": "🇹🇼",
    "dai-loan": "🇹🇼",
    "taiwan": "🇹🇼",
    "thai lan": "🇹🇭",
    "thai-lan": "🇹🇭",
    "thailand": "🇹🇭",
    "viet nam": "🇻🇳",
    "viet-nam": "🇻🇳",
    "vietnam": "🇻🇳",
    "an do": "🇮🇳",
    "an-do": "🇮🇳",
    "india": "🇮🇳",
    "anh": "🇬🇧",
    "uk": "🇬🇧",
    "united kingdom": "🇬🇧",
    "phap": "🇫🇷",
    "france": "🇫🇷",
    "duc": "🇩🇪",
    "germany": "🇩🇪",
    "nga": "🇷🇺",
    "russia": "🇷🇺",
    "tay ban nha": "🇪🇸",
    "tay-ban-nha": "🇪🇸",
    "spain": "🇪🇸",
    "y": "🇮🇹",
    "italy": "🇮🇹",
    "italia": "🇮🇹",
    "canada": "🇨🇦",
    "uc": "🇦🇺",
    "australia": "🇦🇺",
    "thuy dien": "🇸🇪",
    "thuy-dien": "🇸🇪",
    "sweden": "🇸🇪",
    "dan mach": "🇩🇰",
    "dan-mach": "🇩🇰",
    "denmark": "🇩🇰",
    "na uy": "🇳🇴",
    "na-uy": "🇳🇴",
    "norway": "🇳🇴",
    "thuy si": "🇨🇭",
    "thuy-si": "🇨🇭",
    "switzerland": "🇨🇭",
    "tho nhi ky": "🇹🇷",
    "tho-nhi-ky": "🇹🇷",
    "turkey": "🇹🇷",
    "brazil": "🇧🇷",
    "brasil": "🇧🇷",
    "nam phi": "🇿🇦",
    "south africa": "🇿🇦",
    "singapore": "🇸🇬",
    "philippines": "🇵🇭",
    "malaysia": "🇲🇾",
    "indonesia": "🇮🇩",
    "mexico": "🇲🇽",
  };

  // Direct lookup
  if (flags[normalized]) return flags[normalized];

  // Try matching substring/slug
  for (const [key, value] of Object.entries(flags)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return "🌏";
}
