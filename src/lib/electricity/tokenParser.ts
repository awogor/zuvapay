/**
 * ZuvaPay Electricity Token Parser
 * Handles standard 20-digit prepaid tokens as well as multi-token scenarios:
 * - Main purchased token + Bonus/Gift token (e.g. Free Basic Electricity ~9 kWh for new/MAP meters)
 * - Key Change Tokens (KCT1 & KCT2) issued for TID rollover or meter configuration
 * - Comma, slash, pipe, or newline delimited multi-token strings from DisCo APIs
 */

export interface TokenItem {
  type: 'main' | 'bonus' | 'kct1' | 'kct2' | 'token';
  label: string;
  token: string; // e.g. "4839 - 2049 - 1830 - 4920 - 1940"
  rawDigits: string; // e.g. "48392049183049201940"
  units?: string | null;
  subtitle?: string;
}

export interface ParsedTokensResult {
  hasTokens: boolean;
  isMultiToken: boolean;
  tokens: TokenItem[];
  mainToken: string | null;
  bonusToken: string | null;
  bonusUnits: string | null;
  allTokensText: string;
}

/**
 * Formats a 20-digit string into standard compact 4-digit chunks: "XXXX-XXXX-XXXX-XXXX-XXXX"
 * No extra gaps to ensure it stays on a single line on mobile screens.
 */
export function format20DigitToken(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 20) {
    return digits.match(/.{1,4}/g)?.join('-') || raw;
  }
  // If already contains hyphens or spaces, clean and normalize to single compact hyphens
  const cleaned = raw.replace(/\s*-\s*/g, '-').replace(/\s+/g, '-').trim();
  return cleaned;
}

/**
 * Extracts labeled tokens (e.g. "bsstToken:6672-5044... TOKEN:3072-7820...")
 */
function extractLabeledTokens(text: string): TokenItem[] {
  if (!text) return [];
  const items: TokenItem[] = [];

  // Match bsstToken / bonus
  const bsstMatch = text.match(/(?:bsstToken|bsst_token|bsst|bonus(?:Token)?)\s*[:=]\s*([\d\s-]{20,29})/i);
  // Match main Token
  const tokenMatch = text.match(/(?:^|[^\w])token\s*[:=]\s*([\d\s-]{20,29})/i);
  // Match KCT
  const kct1Match = text.match(/kct1\s*[:=]\s*([\d\s-]{20,29})/i);
  const kct2Match = text.match(/kct2\s*[:=]\s*([\d\s-]{20,29})/i);

  if (kct1Match) {
    const d = kct1Match[1].replace(/\D/g, '');
    if (d.length === 20) {
      items.push({
        type: 'kct1',
        label: 'Key Change Token 1 (KCT1)',
        token: format20DigitToken(d),
        rawDigits: d,
        subtitle: 'Key this token first into your meter',
      });
    }
  }

  if (kct2Match) {
    const d = kct2Match[1].replace(/\D/g, '');
    if (d.length === 20) {
      items.push({
        type: 'kct2',
        label: 'Key Change Token 2 (KCT2)',
        token: format20DigitToken(d),
        rawDigits: d,
        subtitle: 'Key this token second into your meter',
      });
    }
  }

  if (tokenMatch) {
    const d = tokenMatch[1].replace(/\D/g, '');
    if (d.length === 20) {
      items.push({
        type: 'main',
        label: 'Main Purchased Token',
        token: format20DigitToken(d),
        rawDigits: d,
      });
    }
  }

  if (bsstMatch) {
    const d = bsstMatch[1].replace(/\D/g, '');
    if (d.length === 20 && !items.some((r) => r.rawDigits === d)) {
      items.push({
        type: 'bonus',
        label: 'BSST Bonus Token (Gift Units)',
        token: format20DigitToken(d),
        rawDigits: d,
        subtitle: 'Free electricity subsidy / bonus units from DisCo',
      });
    }
  }

  return items;
}

/**
 * Extracts 20-digit numeric chunks from a string or continuous digits
 */
function extract20DigitChunks(text: string): string[] {
  if (!text) return [];

  // Look for labeled tokens first
  const labeled = extractLabeledTokens(text);
  if (labeled.length > 0) {
    return labeled.map((l) => l.rawDigits);
  }

  // 1. Look for explicit 20-digit blocks (e.g. 1234-5678-9012-3456-7890 or 12345678901234567890)
  const segments = text.split(/[,;\n\/|]/).map((s) => s.trim()).filter(Boolean);
  const found: string[] = [];

  for (const seg of segments) {
    const digitsOnly = seg.replace(/\D/g, '');
    if (digitsOnly.length === 20) {
      found.push(digitsOnly);
    } else if (digitsOnly.length === 40) {
      // Two 20-digit tokens concatenated
      found.push(digitsOnly.slice(0, 20));
      found.push(digitsOnly.slice(20, 40));
    } else if (digitsOnly.length === 60) {
      // Three 20-digit tokens (KCT1, KCT2, Main)
      found.push(digitsOnly.slice(0, 20));
      found.push(digitsOnly.slice(20, 40));
      found.push(digitsOnly.slice(40, 60));
    } else if (digitsOnly.length > 20 && digitsOnly.length % 20 === 0) {
      for (let i = 0; i < digitsOnly.length; i += 20) {
        found.push(digitsOnly.slice(i, i + 20));
      }
    } else if (seg.length >= 16) {
      // Fallback: keep segment if plausible
      found.push(seg);
    }
  }

  // If simple regex finds 20-digit chunks directly
  if (found.length === 0) {
    const regexMatches = text.match(/\b\d{20}\b/g);
    if (regexMatches && regexMatches.length > 0) {
      return regexMatches;
    }
  }

  return found;
}

/**
 * Primary Parser: Inspects metadata or API response and returns a structured multi-token payload
 */
export function parseElectricityTokens(input: any): ParsedTokensResult {
  if (!input) {
    return {
      hasTokens: false,
      isMultiToken: false,
      tokens: [],
      mainToken: null,
      bonusToken: null,
      bonusUnits: null,
      allTokensText: '',
    };
  }

  // Check if string was passed directly
  if (typeof input === 'string') {
    return parseTokensFromString(input);
  }

  // 1. Postpaid Guard
  const meterType = String(input.meter_type || input.meterType || '').toLowerCase();
  if (meterType === 'postpaid') {
    return {
      hasTokens: false,
      isMultiToken: false,
      tokens: [],
      mainToken: null,
      bonusToken: null,
      bonusUnits: null,
      allTokensText: '',
    };
  }

  const tokensList: TokenItem[] = [];

  // 2. Check if structured tokens array is already stored
  if (Array.isArray(input.tokens) && input.tokens.length > 0) {
    for (const t of input.tokens) {
      if (typeof t === 'string') {
        const digits = t.replace(/\D/g, '');
        tokensList.push({
          type: 'token',
          label: tokensList.length === 0 ? 'Main Purchased Token' : `Token ${tokensList.length + 1}`,
          token: format20DigitToken(t),
          rawDigits: digits,
        });
      } else if (typeof t === 'object' && t?.token) {
        tokensList.push({
          type: t.type || (tokensList.length === 0 ? 'main' : 'bonus'),
          label: t.label || (t.type === 'bonus' ? 'Bonus Token (Gift Units)' : 'Main Purchased Token'),
          token: format20DigitToken(t.token),
          rawDigits: String(t.token).replace(/\D/g, ''),
          units: t.units || null,
          subtitle: t.subtitle,
        });
      }
    }
  }

  // 3. Check for explicit separate fields: token, bonus_token, bsstToken, kct1, kct2
  const mainRaw = input.token || input.Token || input.meter_token || input.electricity_token || input.purchased_code;
  const bonusRaw =
    input.bonus_token ||
    input.BonusToken ||
    input.bonusToken ||
    input.gift_token ||
    input.free_token ||
    input.free_code ||
    input.bsstToken ||
    input.bsst_token ||
    input.BSSToken ||
    input.bsst ||
    input.BSST;
  const bonusUnits = input.bonus_units || input.BonusUnits || input.bonusUnits || input.free_units || input.freeUnits || null;
  const mainUnits = input.units || input.Units || input.unit || null;
  const kct1 = input.kct1 || input.KCT1;
  const kct2 = input.kct2 || input.KCT2;

  // If array wasn't already populated, extract from fields
  if (tokensList.length === 0) {
    // If KCT tokens present (meter upgrade / key change)
    if (kct1) {
      tokensList.push({
        type: 'kct1',
        label: 'Key Change Token 1 (KCT1)',
        token: format20DigitToken(String(kct1)),
        rawDigits: String(kct1).replace(/\D/g, ''),
        subtitle: 'Enter this token first into your meter',
      });
    }
    if (kct2) {
      tokensList.push({
        type: 'kct2',
        label: 'Key Change Token 2 (KCT2)',
        token: format20DigitToken(String(kct2)),
        rawDigits: String(kct2).replace(/\D/g, ''),
        subtitle: 'Enter this token second into your meter',
      });
    }

    // Main Token
    if (mainRaw) {
      const mainStr = String(mainRaw).trim();
      const labeled = extractLabeledTokens(mainStr);

      if (labeled.length > 0) {
        // Found explicitly labeled tokens (e.g. Token:bsstToken:6672-... TOKEN:3072-...)
        tokensList.push(...labeled);
      } else {
        const extracted = extract20DigitChunks(mainStr);

        if (extracted.length > 1) {
          // Multiple tokens embedded in the main string (e.g. "Main, Bonus" or "KCT1, KCT2, Main")
          extracted.forEach((tok, idx) => {
            const isSecondBonus = idx === 1 && !kct1 && !kct2;
            tokensList.push({
              type: idx === 0 ? 'main' : (isSecondBonus ? 'bonus' : 'token'),
              label: idx === 0 ? 'Main Purchased Token' : (isSecondBonus ? 'Bonus Token (Gift Units)' : `Token ${idx + 1}`),
              token: format20DigitToken(tok),
              rawDigits: tok.replace(/\D/g, ''),
              units: idx === 0 ? mainUnits : (isSecondBonus ? bonusUnits : null),
              subtitle: isSecondBonus ? 'Free electricity bonus units credited by DisCo' : undefined,
            });
          });
        } else if (extracted.length === 1) {
          tokensList.push({
            type: 'main',
            label: 'Main Purchased Token',
            token: format20DigitToken(extracted[0]),
            rawDigits: extracted[0].replace(/\D/g, ''),
            units: mainUnits,
          });
        } else {
          // Fallback to raw string
          tokensList.push({
            type: 'main',
            label: 'Prepaid Meter Token',
            token: mainStr,
            rawDigits: mainStr.replace(/\D/g, ''),
            units: mainUnits,
          });
        }
      }
    }

    // Bonus Token field
    if (bonusRaw && !tokensList.some((t) => t.type === 'bonus')) {
      const bonusStr = String(bonusRaw).trim();
      const formattedBonusUnits = bonusUnits
        ? (String(bonusUnits).toLowerCase().includes('kwh') ? String(bonusUnits) : `${bonusUnits} kWh`)
        : 'Bonus Units';

      tokensList.push({
        type: 'bonus',
        label: 'Bonus Token (Gift Units)',
        token: format20DigitToken(bonusStr),
        rawDigits: bonusStr.replace(/\D/g, ''),
        units: formattedBonusUnits,
        subtitle: 'Free electricity gift units credited by DisCo',
      });
    }
  }

  const hasTokens = tokensList.length > 0;
  const isMultiToken = tokensList.length > 1;
  const mainToken = tokensList.find((t) => t.type === 'main')?.token || tokensList[0]?.token || null;
  const bonusTokenItem = tokensList.find((t) => t.type === 'bonus');
  const bonusToken = bonusTokenItem?.token || null;
  const bonusUnitsFormatted = bonusTokenItem?.units || bonusUnits || null;

  const allTokensText = tokensList
    .map((t) => `${t.label}: ${t.token}${t.units ? ` (${t.units})` : ''}`)
    .join('\n');

  return {
    hasTokens,
    isMultiToken,
    tokens: tokensList,
    mainToken,
    bonusToken,
    bonusUnits: bonusUnitsFormatted,
    allTokensText,
  };
}

/**
 * Fallback parser when only a raw token string is provided
 */
function parseTokensFromString(rawStr: string): ParsedTokensResult {
  const clean = rawStr.trim();
  const extracted = extract20DigitChunks(clean);

  if (extracted.length > 1) {
    const tokens: TokenItem[] = extracted.map((tok, idx) => ({
      type: idx === 0 ? 'main' : (idx === 1 ? 'bonus' : 'token'),
      label: idx === 0 ? 'Main Purchased Token' : (idx === 1 ? 'Bonus Token (Gift Units)' : `Token ${idx + 1}`),
      token: format20DigitToken(tok),
      rawDigits: tok.replace(/\D/g, ''),
      subtitle: idx === 1 ? 'Free bonus units credited by DisCo' : undefined,
    }));

    return {
      hasTokens: true,
      isMultiToken: true,
      tokens,
      mainToken: tokens[0].token,
      bonusToken: tokens[1].token,
      bonusUnits: null,
      allTokensText: tokens.map((t) => `${t.label}: ${t.token}`).join('\n'),
    };
  }

  const singleDigits = clean.replace(/\D/g, '');
  const formatted = format20DigitToken(clean);

  return {
    hasTokens: clean.length > 0,
    isMultiToken: false,
    tokens: clean.length > 0
      ? [
          {
            type: 'main',
            label: 'Prepaid Meter Token',
            token: formatted,
            rawDigits: singleDigits,
          },
        ]
      : [],
    mainToken: formatted || null,
    bonusToken: null,
    bonusUnits: null,
    allTokensText: formatted || '',
  };
}
