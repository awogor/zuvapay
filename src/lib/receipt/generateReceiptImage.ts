import { Transaction, UserProfile } from '@/types';
import { formatNaira, formatDate } from '@/lib/utils';
import { parseElectricityTokens } from '@/lib/electricity/tokenParser';

/**
 * Validates whether a transaction receipt qualifies for image sharing.
 * Per requirement: Only receipts from electricity, cable tv, data, and airtime.
 * Strictly excludes logs, marketplace, wallet deposits, transfers, swaps, etc.
 */
export function isShareableReceipt(receipt: Transaction | null | undefined): boolean {
  if (!receipt) return false;

  const cat = (receipt.category || '').toLowerCase();
  const desc = (receipt.description || '').toLowerCase();
  const meta = receipt.metadata || {};

  // Explicit exclusions
  if (
    cat === 'logs' ||
    cat === 'marketplace' ||
    cat === 'deposit' ||
    cat === 'swap' ||
    cat === 'refund' ||
    cat === 'transfer' ||
    cat === 'card' ||
    cat === 'virtual_card' ||
    cat === 'virtual_card_topup' ||
    cat === 'sms' ||
    cat === 'social'
  ) {
    return false;
  }

  // 1. Airtime
  if (cat === 'airtime' || desc.includes('airtime')) return true;

  // 2. Data
  if (cat === 'data' || desc.includes('data')) return true;

  // 3. Electricity / Power
  if (
    cat === 'power' ||
    cat === 'electricity' ||
    desc.includes('electricity') ||
    desc.includes('nepa') ||
    desc.includes('disco') ||
    meta.disco ||
    meta.meter_number ||
    meta.meterNumber ||
    meta.token ||
    meta.electricity_token
  ) {
    return true;
  }

  // 4. Cable TV
  if (
    cat === 'cable' ||
    cat === 'tv' ||
    desc.includes('cable') ||
    desc.includes('gotv') ||
    desc.includes('dstv') ||
    desc.includes('startimes') ||
    meta.iuc ||
    meta.smartcard ||
    meta.tv_provider
  ) {
    return true;
  }

  return false;
}

function formatMetaKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}

/**
 * Bulletproof rounded rectangle drawing for Canvas 2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Measures and breaks text into multiple lines given a max width
 */
function getWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const words = String(text).split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

interface ReceiptRowItem {
  label: string;
  value: string;
  isMono?: boolean;
  isOrange?: boolean;
}

/**
 * Generates an ultra-crisp, pre-designed high-DPI receipt image as a Blob.
 * Completely independent of screen resolution, viewport width, or scroll position.
 */
export async function generateReceiptImageBlob(
  receipt: Transaction,
  profile?: UserProfile | null
): Promise<Blob> {
  const metadata = receipt.metadata || {};
  const isPostpaid = String(metadata.meter_type || metadata.meterType || '').toLowerCase() === 'postpaid';
  const parsedTokens = parseElectricityTokens(metadata);

  // Compile Key-Value details
  const rows: ReceiptRowItem[] = [];

  // 1. Service Category
  const categoryNames: Record<string, string> = {
    airtime: 'Airtime Top-up',
    data: 'Data Bundle',
    power: 'Electricity Bill',
    electricity: 'Electricity Bill',
    cable: 'Cable TV Subscription',
    tv: 'Cable TV Subscription',
  };
  const displayCategory = categoryNames[receipt.category?.toLowerCase()] || formatMetaKey(receipt.category || 'Service');
  rows.push({ label: 'Service Category', value: displayCategory });

  // 2. Description
  if (receipt.description) {
    rows.push({ label: 'Description', value: receipt.description });
  }

  // 3. Reference No.
  rows.push({
    label: 'Reference No.',
    value: receipt.reference,
    isMono: true,
    isOrange: true,
  });

  // 4. Date & Time
  rows.push({
    label: 'Date & Time',
    value: formatDate(receipt.created_at),
  });

  // 5. Customer / Account Holder Name
  if (profile) {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    if (fullName) {
      rows.push({ label: 'Customer Name', value: fullName });
    }
  }

  // 6. Clean metadata entries
  Object.entries(metadata)
    .filter(([k, val]) => {
      if (val === null || val === undefined || val === '') return false;
      if (typeof val === 'object') return false;

      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Exclude handled keys
      if (['token', 'metertoken', 'electricitytoken', 'units', 'unit', 'bonustoken', 'bonusunits', 'bssttoken', 'freetoken', 'freeunits', 'kct1', 'kct2', 'tokens'].includes(cleanKey)) return false;
      if (['delivery', 'credentials', 'activationlink', 'instructions', 'rawtext', 'raw', 'code'].includes(cleanKey)) return false;

      // Exclude internal vendor / operator details
      const isInternalVendorKey =
        cleanKey.includes('supplier') ||
        cleanKey.includes('vendor') ||
        cleanKey.includes('upstream') ||
        cleanKey.includes('backend') ||
        cleanKey.includes('fadded') ||
        cleanKey.includes('aiplug') ||
        cleanKey.includes('gongoz') ||
        cleanKey.includes('grizzly') ||
        cleanKey.includes('momo') ||
        (cleanKey.includes('provider') && cleanKey.includes('api')) ||
        (cleanKey.includes('operator') && cleanKey.includes('ref')) ||
        cleanKey.includes('external');

      if (isInternalVendorKey) return false;

      if (['productid', 'itemid', 'planid', 'packageid', 'serviceid'].includes(cleanKey)) return false;
      if (['customeremail', 'useremail', 'idempotencykey'].includes(cleanKey)) return false;

      return true;
    })
    .forEach(([key, val]) => {
      rows.push({
        label: formatMetaKey(key),
        value: String(val),
        isMono: key.toLowerCase().includes('meter') || key.toLowerCase().includes('iuc') || key.toLowerCase().includes('card'),
      });
    });

  // Fixed Dimensions: 560px card, 2x Retina scale = 1120px wide
  const cardWidth = 560;
  const paddingX = 36;
  const contentWidth = cardWidth - paddingX * 2;
  const innerPadX = paddingX + 16;
  const innerContentW = contentWidth - 32;
  const valMaxWidth = innerContentW - 140;

  // Calculate layout heights dynamically
  let totalHeight = 36; // top padding
  totalHeight += 50; // Header (logo + ZuvaPay title + receipt badge)
  totalHeight += 24; // divider spacing
  totalHeight += 120; // Hero (check icon, amount paid label, amount, status badge)

  if (parsedTokens.hasTokens) {
    for (const tok of parsedTokens.tokens) {
      const boxH = tok.units ? 104 : 86;
      totalHeight += boxH + 16;
    }
    totalHeight += 4;
  }

  // Details card height calculation with EXACT same font and width as drawing
  const dummyCanvas = document.createElement('canvas');
  const dummyCtx = dummyCanvas.getContext('2d')!;

  const rowHeights: number[] = [];
  rows.forEach((row) => {
    dummyCtx.font = row.isMono
      ? '700 12.5px "SFMono-Regular", Consolas, monospace'
      : '600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const valueLines = getWrappedLines(dummyCtx, row.value, valMaxWidth);
    const rowH = Math.max(34, valueLines.length * 18 + 12);
    rowHeights.push(rowH);
  });

  const detailsTableHeight = rowHeights.reduce((acc, h) => acc + h, 0) + 16;
  totalHeight += detailsTableHeight + 20;

  totalHeight += 80; // Security notice + copyright + bottom bar
  totalHeight += 24; // bottom padding

  // Initialize High-DPI Canvas
  const dpr = 2; // 2x Retina
  const canvas = document.createElement('canvas');
  canvas.width = cardWidth * dpr;
  canvas.height = totalHeight * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain Canvas 2D context');

  ctx.scale(dpr, dpr);

  // 1. Background Fill: Clean, high-contrast white card
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cardWidth, totalHeight);

  // Outer border
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, cardWidth, totalHeight);

  let currentY = 32;

  // 2. HEADER
  // ZuvaPay Logo Mark (Orange square with white ZP)
  const logoSize = 38;
  ctx.fillStyle = '#FF6B00';
  drawRoundedRect(ctx, paddingX, currentY, logoSize, logoSize, 10);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ZP', paddingX + logoSize / 2, currentY + logoSize / 2);

  // Brand Name & Subtitle
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '800 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Zuva', paddingX + logoSize + 12, currentY + 18);

  const zuvaWidth = ctx.measureText('Zuva').width;
  ctx.fillStyle = '#FF6B00';
  ctx.fillText('Pay', paddingX + logoSize + 12 + zuvaWidth, currentY + 18);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Transaction Receipt', paddingX + logoSize + 12, currentY + 34);

  // Top-Right Official Badge
  const badgeText = 'OFFICIAL RECEIPT';
  ctx.font = '700 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const badgeTextWidth = ctx.measureText(badgeText).width;
  const badgeW = badgeTextWidth + 20;
  const badgeH = 26;
  const badgeX = cardWidth - paddingX - badgeW;
  const badgeY = currentY + 6;

  ctx.fillStyle = '#FFF7ED';
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 13);
  ctx.fill();
  ctx.strokeStyle = '#FED7AA';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#C2410C';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

  currentY += logoSize + 18;

  // Divider line
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, currentY);
  ctx.lineTo(cardWidth - paddingX, currentY);
  ctx.stroke();

  currentY += 22;

  // 3. HERO: Amount & Status
  // Green check icon
  const checkCircleX = cardWidth / 2;
  const checkCircleY = currentY + 14;
  const checkRadius = 18;

  ctx.fillStyle = '#DCFCE7';
  ctx.beginPath();
  ctx.arc(checkCircleX, checkCircleY, checkRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#86EFAC';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Check mark
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(checkCircleX - 6, checkCircleY);
  ctx.lineTo(checkCircleX - 1.5, checkCircleY + 4.5);
  ctx.lineTo(checkCircleX + 6.5, checkCircleY - 4.5);
  ctx.stroke();

  currentY += checkRadius * 2 + 16;

  // Amount Paid Label
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('AMOUNT PAID', cardWidth / 2, currentY);

  currentY += 24;

  // Big Bold Amount
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(formatNaira(receipt.amount), cardWidth / 2, currentY);

  currentY += 14;

  // Success Pill Badge
  const statusLabel = '✔ COMPLETED';
  ctx.font = '700 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const statusW = ctx.measureText(statusLabel).width + 18;
  const statusH = 22;
  const statusX = (cardWidth - statusW) / 2;

  ctx.fillStyle = '#DCFCE7';
  drawRoundedRect(ctx, statusX, currentY, statusW, statusH, 11);
  ctx.fill();
  ctx.strokeStyle = '#86EFAC';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#15803D';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(statusLabel, cardWidth / 2, currentY + statusH / 2);

  currentY += statusH + 24;

  // 4. PREPAID ELECTRICITY TOKEN BOXES (supports multi-token: main + bonus / KCT)
  if (parsedTokens.hasTokens) {
    for (const tok of parsedTokens.tokens) {
      const boxH = tok.units ? 104 : 86;
      const isBonus = tok.type === 'bonus';
      const isKct = tok.type === 'kct1' || tok.type === 'kct2';

      const bgFill = isBonus ? '#FEFCE8' : (isKct ? '#F8FAFC' : '#FFF7ED');
      const strokeColor = isBonus ? '#FEF08A' : (isKct ? '#E2E8F0' : '#FED7AA');
      const headerColor = isBonus ? '#A16207' : (isKct ? '#475569' : '#C2410C');

      ctx.fillStyle = bgFill;
      drawRoundedRect(ctx, paddingX, currentY, contentWidth, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Header label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = headerColor;
      ctx.font = '700 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      let headerText = '⚡ 20-DIGIT PREPAID METER TOKEN';
      if (parsedTokens.isMultiToken) {
        if (tok.type === 'main') headerText = '⚡ MAIN PURCHASED TOKEN';
        else if (tok.type === 'bonus') headerText = `🎁 BSST BONUS TOKEN${tok.units ? ` (${tok.units})` : ' (GIFT UNITS)'}`;
        else if (tok.type === 'kct1') headerText = '🔑 KEY CHANGE TOKEN 1 (KCT1)';
        else if (tok.type === 'kct2') headerText = '🔑 KEY CHANGE TOKEN 2 (KCT2)';
        else headerText = `⚡ ${tok.label.toUpperCase()}`;
      }
      ctx.fillText(headerText, cardWidth / 2, currentY + 20);

      // Monospace token digits (compact 14px font so it never wraps)
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 14px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace';
      ctx.fillText(tok.token, cardWidth / 2, currentY + 44);

      // Helper text
      ctx.fillStyle = '#64748B';
      ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const helper = isBonus
        ? 'DisCo subsidy / bonus units. Enter into meter after main token.'
        : isKct
        ? (tok.subtitle || 'Key into meter keypad to reconfigure meter.')
        : 'Key these 20 digits into your meter CIU keypad, then press Enter.';
      ctx.fillText(helper, cardWidth / 2, currentY + 64);

      if (tok.units) {
        ctx.fillStyle = '#059669';
        ctx.font = '700 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`Units Credited: ${tok.units}`, cardWidth / 2, currentY + 84);
      }

      currentY += boxH + 16;
    }
    currentY += 4;
  }

  // 5. TRANSACTION DETAILS CARD
  ctx.fillStyle = '#F8FAFC';
  drawRoundedRect(ctx, paddingX, currentY, contentWidth, detailsTableHeight, 12);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();

  let rowY = currentY + 14;

  rows.forEach((row, idx) => {
    const rowH = rowHeights[idx];

    // Label (Left)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#64748B';
    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(row.label, innerPadX, rowY + 3);

    // Value (Right)
    ctx.font = row.isMono
      ? '700 12.5px "SFMono-Regular", Consolas, monospace'
      : '600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    ctx.fillStyle = row.isOrange ? '#FF6B00' : '#0F172A';
    ctx.textAlign = 'right';

    const lines = getWrappedLines(ctx, row.value, valMaxWidth);
    lines.forEach((line, lineIdx) => {
      ctx.fillText(line, innerPadX + innerContentW, rowY + 3 + lineIdx * 17);
    });

    // Divider line between rows (except last)
    if (idx < rows.length - 1) {
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(innerPadX, rowY + rowH - 1);
      ctx.lineTo(innerPadX + innerContentW, rowY + rowH - 1);
      ctx.stroke();
    }

    rowY += rowH;
  });

  currentY += detailsTableHeight + 20;

  // 6. FOOTER: Security notice & verification
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('🛡️ Verified Secure ZuvaPay Transaction', cardWidth / 2, currentY + 10);

  ctx.font = '400 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Automated receipt generated by ZuvaPay Technologies Limited • zuvapay.com', cardWidth / 2, currentY + 28);

  // Bottom Brand Accent Bar (4px height)
  ctx.fillStyle = '#FF6B00';
  ctx.fillRect(0, totalHeight - 4, cardWidth, 4);

  // Return PNG Blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create receipt image Blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Handles sharing the receipt image via Web Share API on mobile devices,
 * or downloading it directly as a high-resolution PNG on desktop browsers.
 */
export async function shareOrDownloadReceiptImage(
  receipt: Transaction,
  profile?: UserProfile | null
): Promise<'shared' | 'downloaded'> {
  const blob = await generateReceiptImageBlob(receipt, profile);
  const fileName = `ZuvaPay-Receipt-${receipt.reference}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  // Check if native file sharing is supported (Mobile Chrome, Safari iOS, etc.)
  let canShareFiles = false;
  try {
    canShareFiles =
      typeof navigator !== 'undefined' &&
      !!navigator.canShare &&
      navigator.canShare({ files: [file] });
  } catch {
    canShareFiles = false;
  }

  if (canShareFiles) {
    try {
      await navigator.share({
        files: [file],
        title: 'ZuvaPay Transaction Receipt',
        text: `Transaction Receipt for ${receipt.description || receipt.reference} - ZuvaPay`,
      });
      return 'shared';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled share dialog
        return 'shared';
      }
      // If sharing fails for other reasons, fall through to download
      console.warn('Native share failed, falling back to download:', err);
    }
  }

  // Desktop or fallback: Download PNG file directly
  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = objectUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);

  return 'downloaded';
}
