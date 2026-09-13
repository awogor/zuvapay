import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AccountLogItem } from '@/types';
import { faddedFetch } from '@/lib/vendors/fadded';
import { getPricingConfig, computeRetailPrice } from '@/lib/pricing/pricingStore';

const FALLBACK_LOGS_CATALOG: AccountLogItem[] = [
  {
    id: 'prod_12',
    category: 'facebook',
    title: 'Facebook Aged Account [2017-2019 · 2FA Enabled]',
    description: 'High-trust aged account with friends history, marketplace enabled, full 2FA cookies and email access.',
    price: 6500,
    stock: 14,
    features: ['2FA Secret Key Included', 'Marketplace Active', 'Includes Hotmail / Outlook', 'Cookies json attached'],
  },
  {
    id: 'prod_13',
    category: 'instagram',
    title: 'Instagram Aged Account [Phone Verified · Real Followers]',
    description: 'Aged 3+ years with 500+ organic followers, clean status, verified on foreign number.',
    price: 5200,
    stock: 22,
    features: ['Original Email (OGE)', '500+ Real Followers', 'Clean IP history', 'Instant Login'],
  },
  {
    id: 'prod_14',
    category: 'twitter',
    title: 'Twitter / X Account [2020 Creation · 1,200 Followers]',
    description: 'Clean handle, organic crypto / tech followers, API access token ready.',
    price: 8500,
    stock: 8,
    features: ['Token Login', 'Auth Token Included', '1.2K Followers', 'Phone Unlinked'],
  },
  {
    id: 'prod_15',
    category: 'vpn',
    title: 'NordVPN Premium Account [1 Year Warranty]',
    description: 'Full high-speed NordLynx servers across 60+ countries with kill switch and threat protection.',
    price: 4500,
    stock: 35,
    features: ['Private Profile', 'Works on 6 Devices', 'Fast Dedicated IPs', 'Auto-renew active'],
  },
  {
    id: 'prod_16',
    category: 'developer',
    title: 'USA Windows RDP [16GB RAM · 8 vCPU · 10Gbps Port]',
    description: 'Pure datacenter IP, admin access, SSD storage, active for 30 days renewable.',
    price: 12000,
    stock: 6,
    features: ['Full Administrator Rights', '10 Gbps Port Speed', 'Clean Residential IP', 'Reboot Anytime'],
  },
];

// Intelligent category classification from product name
function categorizeProduct(name: string): string {
  const n = (name || '').toUpperCase();

  // 1. Proxies & IPs
  if (n.includes('9PROXY') || n.includes('9PPROXY') || n.includes('PROXY (IPS)') || n.includes('RESIDENTIAL IP')) {
    return '9PROXY (IPS)';
  }

  // 2. Instagram
  if (n.includes('INSTAGRAM') || n.includes(' IG ') || n.startsWith('IG ') || n.includes('IG ACCOUNTS')) {
    return 'ALL COUNTRIES INSTAGRAM';
  }

  // 3. TikTok
  if (n.includes('TIKTOK') || n.includes('TITKOK')) {
    return 'ALL COUNTRIES TIKTOK';
  }

  // 4. Facebook Breakdown
  if (n.includes('FACEBOOK') || n.includes(' FB ') || n.startsWith('FB ')) {
    if (n.includes('CREATE PAGE') || n.includes('PAGE') || n.includes('BUSINESS')) {
      return 'CREATE PAGE FACEBOOK';
    }
    if (n.includes('0-5') || n.includes('0-5 FRIENDS') || n.includes('0-30 FRIEND')) {
      return 'COUNTRIES FACEBOOK (0-5 FRIENDS)';
    }
    if (n.includes('30+') || n.includes('50+') || n.includes('100+') || n.includes('200+') || n.includes('1000+')) {
      return 'COUNTRIES FACEBOOK (30+ FRIENDS)';
    }
    if (n.includes('DATING')) {
      return 'FACEBOOK DATING';
    }
    return 'COUNTRIES FACEBOOK (30+ FRIENDS)';
  }

  // 5. Dating Services
  if (n.includes('DATING') || n.includes('BADOO') || n.includes('POF') || n.includes('TINDER') || n.includes('BUMBLE')) {
    return 'DATING SITES';
  }

  // 6. Email Services
  if (
    n.includes('MAIL.RU') ||
    n.includes('HOTMAIL') ||
    n.includes('OUTLOOK') ||
    n.includes('GMAIL') ||
    n.includes('GMX') ||
    n.includes('TEXPLUS') ||
    n.includes('TALKATONE') ||
    n.includes('TEXT FREE') ||
    n.includes('GOOGLE VOICE') ||
    n.includes('EMAIL SERVICES')
  ) {
    return 'EMAIL SERVICES';
  }

  // 7. Twitter / X
  if (n.includes('TWITTER') || n.includes(' X ') || n.startsWith('X ') || n.includes('X OLD')) {
    return 'TWITTER / X';
  }

  // 8. VPN Subscriptions
  if (n.includes('VPN') || n.includes('NORD') || n.includes('EXPRESS') || n.includes('PURE VPN') || n.includes('HMA') || n.includes('IP VANISH')) {
    return 'VPN SERVICES';
  }

  // 9. Reddit
  if (n.includes('REDDIT')) {
    return 'REDDIT ACCOUNTS';
  }

  // 10. Social Apps & Messengers
  if (n.includes('DISCORD') || n.includes('SNAPCHAT') || n.includes('LINKEDIN') || n.includes('PINTEREST') || n.includes('TRUTHSOCIAL') || n.includes('QUORA') || n.includes('TWITCH') || n.includes('STEAM') || n.includes('ONLY FANS')) {
    return 'SOCIAL & CHAT APPS';
  }

  // 11. Developer, AI & Premium Tools
  if (n.includes('CHATGPT') || n.includes('DEEP SEEK') || n.includes('CANVA') || n.includes('APPLE MUSIC') || n.includes('NETFLIX') || n.includes('DISNEY') || n.includes('PRIME VIDEO') || n.includes('RDP') || n.includes('INDEED')) {
    return 'PREMIUM TOOLS & SOFTWARE';
  }

  return 'DIGITAL & UPDATES';
}

// Strip out external vendor links (fadded.net, t.me/fadded..., telegram links, etc.)
function sanitizeDescription(html: string): string {
  if (!html) return 'Verified authentic digital log credentials.';

  let clean = html;

  // 1. Remove telegram/fadded links and text mentioning fadded
  clean = clean.replace(/https?:\/\/[^\s<>"']*(fadded|t\.me|telegram)[^\s<>"']*/gi, '');
  clean = clean.replace(/watch how to login here\s*:?/gi, '');
  clean = clean.replace(/fadded\s*(socials)?/gi, 'ZuvaPay Hub');

  // 2. Remove hardcoded inline styles (e.g. style="color:rgb(33,37,41);") that break dark mode
  clean = clean.replace(/\s*style\s*=\s*("[^"]*"|'[^']*')/gi, '');

  // 3. Remove empty divs, excessive br tags and empty paragraphs
  clean = clean.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1'); // keep anchor text, strip link tag
  clean = clean.replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '');
  clean = clean.replace(/(<br\s*\/?>\s*){3,}/gi, '<br /><br />');

  return clean.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search')?.toLowerCase() || '';

  // Try live Fadded Reseller API GET /products
  const faddedRes = await faddedFetch('products');
  let rawList: any[] = [];

  if (!faddedRes.isMock && faddedRes.ok && faddedRes.data?.success && Array.isArray(faddedRes.data?.data)) {
    rawList = faddedRes.data.data;
  } else {
    rawList = FALLBACK_LOGS_CATALOG.map((f) => ({
      product_key: f.id,
      name: f.title,
      description: f.description,
      unit_price: f.price,
      in_stock: f.stock,
    }));
  }

  const pricingConfig = await getPricingConfig();
  const faddedGlobalRule = pricingConfig.fadded.globalRule;
  const faddedOverrides = pricingConfig.fadded.overrides;

  const liveItems: AccountLogItem[] = rawList.map((p: any) => {
    const assignedCategory = categorizeProduct(p.name);
    const cleanedDesc = sanitizeDescription(p.description || '');

    const key = p.product_key || `prod_${p.product_id}`;
    const baseCost = p.unit_price || p.base_api_price || 1000;
    const override = faddedOverrides[key];

    const { retailPrice } = computeRetailPrice(baseCost, faddedGlobalRule, override);

    return {
      id: key,
      category: assignedCategory,
      title: p.name,
      description: cleanedDesc,
      cleanDescription: cleanedDesc,
      price: retailPrice,
      stock: p.in_stock || 0,
      features: ['Instant Delivery', 'Sanitized Credentials', 'Guaranteed Quality'],
    };
  });

  // Collect all unique categories with counts
  const categoryMap: Record<string, number> = {};
  liveItems.forEach((item) => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
  });

  const categories = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Filter by category
  let filtered = liveItems;
  if (category && category !== 'all') {
    filtered = filtered.filter(
      (i) => i.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by search query
  if (search) {
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(search) ||
        i.category.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    categories,
    items: filtered,
    totalCount: liveItems.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Extract Bearer token directly from mobile request headers
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    const { data: { user } } = bearerToken
      ? await supabase.auth.getUser(bearerToken)
      : await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, quantity = 1, reference, customerEmail } = body;

    if (!itemId || !reference) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters (itemId, reference)' },
        { status: 400 }
      );
    }

    // Call live Fadded Reseller API POST /order
    const faddedRes = await faddedFetch('order', {
      method: 'POST',
      body: JSON.stringify({
        product_key: itemId,
        quantity: parseInt(quantity) || 1,
        external_order_id: reference,
        customer_info: { email: customerEmail || 'customer@zuvapay.com' },
      }),
    });

    if (!faddedRes.isMock) {
      const { data, ok } = faddedRes;
      if (!ok || !data?.success) {
        return NextResponse.json(
          { success: false, error: data?.message || 'Fadded Socials order fulfillment failed' },
          { status: 502 }
        );
      }

      // items is an array of { product_detail_id, details }
      const deliveredItems = data?.data?.items || [];
      const credentialsText = deliveredItems.map((item: any) => item.details).join('\n---\n');

      return NextResponse.json({
        success: true,
        orderId: data?.data?.product_key || reference,
        credentials: {
          username: deliveredItems[0]?.details || credentialsText,
          password: 'See complete credentials details string above',
          fullDetails: credentialsText,
        },
        item: {
          title: data?.data?.name || itemId,
          price: data?.data?.total_amount,
        },
      });
    }

    // Simulation
    await new Promise((res) => setTimeout(res, 500));

    if (itemId.includes('fail') || itemId.includes('reject')) {
      return NextResponse.json(
        { success: false, error: 'Fadded marketplace escrow rejected credential handover. Automated refund initiated.' },
        { status: 502 }
      );
    }

    const mockDelivered = {
      username: `account_${Math.random().toString(36).substring(7)}@domain.com`,
      password: `KpSec!${Math.floor(1000 + Math.random() * 9000)}#`,
      twoFactor: 'JBSWY3DPEHPK3PXP',
      cookies: 'datr=v9X3qh...; sessionid=korrect_session; c_user=10004928192;',
    };

    return NextResponse.json({
      success: true,
      orderId: `FAD-${Date.now()}`,
      credentials: mockDelivered,
      item: {
        title: `Product ${itemId}`,
        price: 5200,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
