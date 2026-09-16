import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { addOrder, getOrderStatus, getMultipleOrdersStatus, getBalance, getServices, MomoServiceItem } from '@/lib/vendors/momo';
import { getPricingConfig, computeRetailPrice } from '@/lib/pricing/pricingStore';
import { checkServiceAvailability } from '@/lib/services/serviceStatusStore';

// The 6 allowed platforms
const ALLOWED_PLATFORMS = [
  'youtube',
  'instagram',
  'facebook',
  'twitter',
  'tiktok',
  'telegram',
] as const;

type PlatformId = (typeof ALLOWED_PLATFORMS)[number];

// Helper to determine platform from MomoPanel item
function detectPlatform(s: { category: string; name: string }): PlatformId | null {
  const cat = (s.category || '').toLowerCase();
  const name = (s.name || '').toLowerCase();

  if (
    cat.includes('youtube') ||
    (!cat.includes('instagram') && !cat.includes('tiktok') && name.includes('youtube'))
  ) {
    return 'youtube';
  }
  if (cat.includes('instagram') || name.includes('instagram') || name.includes('ig follower')) {
    return 'instagram';
  }
  if (cat.includes('facebook') || name.includes('facebook')) {
    return 'facebook';
  }
  if (cat.includes('tiktok') || name.includes('tiktok')) {
    return 'tiktok';
  }
  if (cat.includes('telegram') || name.includes('telegram')) {
    return 'telegram';
  }
  if (
    cat.includes('twitter') ||
    cat.includes(' x ') ||
    cat.includes(' x/') ||
    cat.startsWith('x ') ||
    name.includes('twitter') ||
    name.includes('retweet')
  ) {
    return 'twitter';
  }

  return null;
}

// In-memory cache for live MomoPanel catalog (1 hour TTL)
let cachedMomoCatalog: {
  services: any[];
  cachedAt: number;
} | null = null;

async function fetchLiveMomoCatalog() {
  const apiKey = process.env.MOMO_API_KEY || '';
  const isMock = !apiKey || apiKey.includes('mock') || apiKey.includes('your-');
  const config = await getPricingConfig();
  const usdToNgn = config.momo.usdToNgnRate || 1650;

  if (isMock) {
    const rawFallback = getFallbackCatalog();
    return rawFallback.map((s: any) => {
      const id = String(s.serviceId);
      const wholesaleCost = Math.round((s.ratePer1000 / 1.45)); // base cost
      const override = config.momo.overrides[id];
      const { retailPrice } = computeRetailPrice(wholesaleCost, config.momo.globalRule, override);
      return {
        ...s,
        ratePer1000: retailPrice,
      };
    });
  }

  try {
    const res = await getServices();
    if (!res.isMock && res.ok && Array.isArray(res.data)) {
      const parsed = res.data
        .map((s) => {
          const platform = detectPlatform(s);
          if (!platform) return null;

          const serviceId = Number(s.service);
          const usdRate = parseFloat(s.rate) || 0.1;
          const wholesaleCost = Math.round(usdRate * usdToNgn);
          const override = config.momo.overrides[String(serviceId)];
          const { retailPrice } = computeRetailPrice(wholesaleCost, config.momo.globalRule, override);

          const isCustomComment =
            (s.type && s.type.toLowerCase().includes('custom comment')) ||
            (s.name && s.name.toLowerCase().includes('custom comment')) ||
            (s.category && s.category.toLowerCase().includes('custom comment'));

          return {
            serviceId,
            name: s.name,
            platform,
            category: s.category, // e.g. "⭕️ YOUTUBE COMMENTS"
            type: s.type || (isCustomComment ? 'Custom Comments' : 'Default'),
            isCustomComment,
            ratePer1000: retailPrice,
            min: Number(s.min) || 10,
            max: Number(s.max) || 100000,
            description: `Instant Automated Delivery • Min: ${s.min} • Max: ${s.max}`,
          };
        })
        .filter(Boolean);

      return parsed;
    }
  } catch (err) {
    console.error('Failed to fetch live MomoPanel services:', err);
  }

  const rawFallback = getFallbackCatalog();
  return rawFallback.map((s: any) => {
    const id = String(s.serviceId);
    const wholesaleCost = Math.round((s.ratePer1000 / 1.45));
    const override = config.momo.overrides[id];
    const { retailPrice } = computeRetailPrice(wholesaleCost, config.momo.globalRule, override);
    return {
      ...s,
      ratePer1000: retailPrice,
    };
  });
}

function getFallbackCatalog() {
  return [
    // YouTube
    {
      serviceId: 301,
      name: 'YouTube Monetization Subscribers [Non-Drop • Safe]',
      platform: 'youtube',
      category: 'YouTube Subscribers',
      ratePer1000: 16500,
      min: 50,
      max: 5000,
      description: '100% Safe for YouTube Partner Program (YPP) Monetization. Lifetime refill.',
    },
    {
      serviceId: 302,
      name: 'YouTube High Retention Watch Time Views',
      platform: 'youtube',
      category: 'YouTube Views',
      ratePer1000: 4800,
      min: 500,
      max: 100000,
      description: 'Retention 5-15 mins per view. Crucial for 4,000 watch hours.',
    },
    {
      serviceId: 303,
      name: 'YouTube Live Stream Concurrent Viewers [15-30 Mins]',
      platform: 'youtube',
      category: 'YouTube Live Stream',
      ratePer1000: 3500,
      min: 50,
      max: 10000,
      description: 'Boost live stream concurrent viewers and organic chat ranking.',
    },
    {
      serviceId: 798,
      name: 'YouTube Custom Comments | 30K/DAY | super instant | No Refill',
      platform: 'youtube',
      category: 'YouTube Comments',
      type: 'Custom Comments',
      isCustomComment: true,
      ratePer1000: 3105,
      min: 5,
      max: 100000,
      description: 'Custom comments on any YouTube video. 1 comment per line.',
    },

    // Instagram
    {
      serviceId: 101,
      name: 'Instagram High-Quality Followers [Non-Drop • Real Profiles]',
      platform: 'instagram',
      category: 'Instagram Followers (Guaranteed)',
      ratePer1000: 3200,
      min: 100,
      max: 50000,
      description: 'Instant start. Speed: 5K - 10K per day. 30 Days Refill Guarantee.',
    },
    {
      serviceId: 102,
      name: 'Instagram Fast Likes [Explore Reach • Instant]',
      platform: 'instagram',
      category: 'Instagram Likes',
      ratePer1000: 950,
      min: 50,
      max: 20000,
      description: 'Super instant start. Real accounts boost algorithm visibility.',
    },
    {
      serviceId: 103,
      name: 'Instagram Video / Reels Views [High Retention]',
      platform: 'instagram',
      category: 'Instagram Views / Reels',
      ratePer1000: 450,
      min: 500,
      max: 500000,
      description: 'Guaranteed view duration boosts Instagram algorithm ranking.',
    },
    {
      serviceId: 493,
      name: 'Instagram Custom Comments | Speed 5K | Instant | Non-Drop',
      platform: 'instagram',
      category: 'Instagram Comments',
      type: 'Custom Comments',
      isCustomComment: true,
      ratePer1000: 4500,
      min: 5,
      max: 10000,
      description: 'Custom comments on posts/reels from real accounts. 1 comment per line.',
    },

    // Facebook
    {
      serviceId: 501,
      name: 'Facebook Page & Profile Followers [Non-Drop]',
      platform: 'facebook',
      category: 'Facebook Page Followers',
      ratePer1000: 2900,
      min: 100,
      max: 50000,
      description: 'High quality page & profile followers with 30-day refill.',
    },
    {
      serviceId: 502,
      name: 'Facebook Post Reactions (Like / Love / Care)',
      platform: 'facebook',
      category: 'Facebook Post Reactions',
      ratePer1000: 850,
      min: 50,
      max: 25000,
      description: 'Instant delivery of targeted positive reactions on posts.',
    },
    {
      serviceId: 1094,
      name: 'Facebook Post Custom Comments [Non-Drop • Real Profiles]',
      platform: 'facebook',
      category: 'Facebook Comments',
      type: 'Custom Comments',
      isCustomComment: true,
      ratePer1000: 3800,
      min: 5,
      max: 1000,
      description: 'Custom positive feedback on posts or pages. 1 comment per line.',
    },

    // Twitter / X
    {
      serviceId: 401,
      name: 'Twitter / X High Quality Followers',
      platform: 'twitter',
      category: 'Twitter Followers',
      ratePer1000: 6800,
      min: 100,
      max: 10000,
      description: 'Realistic profiles with tweets, bios, and profile pictures.',
    },
    {
      serviceId: 402,
      name: 'Twitter / X Retweets & Quotes',
      platform: 'twitter',
      category: 'Twitter Retweets',
      ratePer1000: 3600,
      min: 50,
      max: 10000,
      description: 'Instant retweets to trend keywords on Nigeria or Global trends.',
    },

    // TikTok
    {
      serviceId: 201,
      name: 'TikTok Genuine Followers [Real Accounts • Instant]',
      platform: 'tiktok',
      category: 'TikTok Followers',
      ratePer1000: 4200,
      min: 100,
      max: 25000,
      description: 'High retention followers that unlock TikTok LIVE creator privileges.',
    },
    {
      serviceId: 202,
      name: 'TikTok Video Likes [Instant Delivery]',
      platform: 'tiktok',
      category: 'TikTok Likes',
      ratePer1000: 1200,
      min: 100,
      max: 50000,
      description: 'Delivered smoothly within minutes of posting for FYP boost.',
    },
    {
      serviceId: 203,
      name: 'TikTok FYP Viral Views [100% Non-Drop]',
      platform: 'tiktok',
      category: 'TikTok Views',
      ratePer1000: 380,
      min: 1000,
      max: 1000000,
      description: 'Ultra fast FYP viral views. 100K in under 2 hours.',
    },

    // Telegram
    {
      serviceId: 601,
      name: 'Telegram Channel / Group Members [Search Optimized]',
      platform: 'telegram',
      category: 'Telegram Members',
      ratePer1000: 1950,
      min: 100,
      max: 50000,
      description: 'Real Telegram members from global search results.',
    },
    {
      serviceId: 602,
      name: 'Telegram Post Views [Instant Delivery]',
      platform: 'telegram',
      category: 'Telegram Views',
      ratePer1000: 320,
      min: 200,
      max: 100000,
      description: 'Fast post views on recent 5 posts.',
    },
  ];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const orderId = searchParams.get('orderId');
  const platform = searchParams.get('platform')?.toLowerCase() || searchParams.get('category')?.toLowerCase();

  // 1. Check batch order statuses on MomoPanel
  const ordersParam = searchParams.get('orders') || searchParams.get('orderIds');
  if ((action === 'status' || action === 'batch_status') && ordersParam) {
    const idList = ordersParam.split(',').map((s) => s.trim()).filter(Boolean);
    if (idList.length > 0) {
      const now = Date.now();
      const mockStatuses: Record<string, any> = {};
      const liveIds: string[] = [];

      for (const id of idList) {
        if (id.startsWith('KP-')) {
          let ageMs = 60000;
          const parsed = Number(id.replace('KP-', ''));
          if (!isNaN(parsed)) ageMs = now - parsed;

          if (ageMs < 15000) {
            mockStatuses[id] = { status: 'Pending', start_count: '120', remains: '1000', charge: '0.50', currency: 'USD' };
          } else if (ageMs < 45000) {
            mockStatuses[id] = { status: 'In progress', start_count: '120', remains: '350', charge: '0.50', currency: 'USD' };
          } else {
            mockStatuses[id] = { status: 'Completed', start_count: '120', remains: '0', charge: '0.50', currency: 'USD' };
          }
        } else {
          liveIds.push(id);
        }
      }

      if (liveIds.length > 0) {
        const batchRes = await getMultipleOrdersStatus(liveIds);
        if (!batchRes.isMock && batchRes.success && batchRes.statuses) {
          Object.assign(mockStatuses, batchRes.statuses);
        }
      }

      return NextResponse.json({ success: true, statuses: mockStatuses });
    }
  }

  // 2. Check individual order status on MomoPanel
  if (action === 'status' && orderId) {
    const isSimulated = String(orderId).startsWith('KP-');

    if (!isSimulated) {
      const statusRes = await getOrderStatus(orderId);
      if (!statusRes.isMock) {
        if (statusRes.success) {
          return NextResponse.json({ success: true, status: statusRes.status });
        }
        return NextResponse.json({ success: false, error: statusRes.error }, { status: 502 });
      }
    }

    // Mock order status simulation with realistic progression
    const now = Date.now();
    let ageMs = 60000;
    if (String(orderId).startsWith('KP-')) {
      const parsed = Number(String(orderId).replace('KP-', ''));
      if (!isNaN(parsed)) ageMs = now - parsed;
    }

    let mockStatus: 'Pending' | 'In progress' | 'Completed' = 'Completed';
    let mockRemains = '0';
    if (ageMs < 15000) {
      mockStatus = 'Pending';
      mockRemains = '1000';
    } else if (ageMs < 45000) {
      mockStatus = 'In progress';
      mockRemains = '350';
    } else {
      mockStatus = 'Completed';
      mockRemains = '0';
    }

    return NextResponse.json({
      success: true,
      status: {
        charge: '0.50',
        start_count: '120',
        status: mockStatus,
        remains: mockRemains,
        currency: 'USD',
      },
    });
  }

  // 2. Check vendor balance (Admin only)
  if (action === 'balance') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    const balRes = await getBalance();
    return NextResponse.json(balRes);
  }

  // 3. Catalog services
  const allServices = await fetchLiveMomoCatalog();

  if (platform && platform !== 'all') {
    const filtered = allServices.filter((s: any) => s.platform === platform);
    return NextResponse.json({ success: true, services: filtered });
  }

  return NextResponse.json({ success: true, services: allServices });
}

export async function POST(request: NextRequest) {
  try {
    const serviceCheck = checkServiceAvailability('social');
    if (!serviceCheck.allowed) {
      return NextResponse.json(
        { success: false, error: serviceCheck.message },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, link, quantity, comments, reference, amount } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const isMock = process.env.NEXT_PUBLIC_MOCK_DATA === 'true';

    // Anti-exploit guard: Verify debit transaction in database
    let verifiedTx: any = null;
    if (!isMock) {
      const { data: tx, error: txErr } = await adminSupabase
        .from('transactions')
        .select('*, wallets!inner(user_id)')
        .eq('reference', reference)
        .maybeSingle();

      if (txErr || !tx) {
        return NextResponse.json(
          { success: false, error: 'Debit transaction reference not found or unverified' },
          { status: 400 }
        );
      }

      if (tx.wallets?.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized transaction reference' },
          { status: 403 }
        );
      }

      if (tx.type !== 'debit' || tx.status !== 'completed') {
        return NextResponse.json(
          { success: false, error: 'Transaction is not a verified completed debit' },
          { status: 400 }
        );
      }

      if (tx.category !== 'social' && tx.category !== 'digital_service') {
        return NextResponse.json(
          { success: false, error: 'Transaction category mismatch for social order' },
          { status: 400 }
        );
      }

      if (amount && Number(tx.amount) < Number(amount)) {
        return NextResponse.json(
          { success: false, error: 'Debit transaction amount is insufficient for social order' },
          { status: 400 }
        );
      }

      if (tx.metadata?.fulfillment_status === 'fulfilled') {
        return NextResponse.json(
          { success: false, error: 'This transaction has already been fulfilled' },
          { status: 409 }
        );
      }
      verifiedTx = tx;
    }

    const allServices = await fetchLiveMomoCatalog();
    const service = allServices.find((s: any) => s.serviceId === Number(serviceId));

    if (!service) {
      return NextResponse.json({ success: false, error: 'Service package not found' }, { status: 400 });
    }

    const isCustomComment =
      service.isCustomComment ||
      (service.type && service.type.toLowerCase().includes('custom comment')) ||
      (service.name && service.name.toLowerCase().includes('custom comment'));

    // If custom comments service, comments are mandatory and quantity is calculated from lines
    let finalQuantity = quantity;
    let formattedComments = '';

    if (isCustomComment) {
      if (!comments || typeof comments !== 'string' || comments.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Please enter custom comments (one per line).' },
          { status: 400 }
        );
      }

      // Clean lines: strip trailing/leading spaces, filter out empty lines
      const commentLines = comments
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);

      if (commentLines.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Please provide at least one valid comment.' },
          { status: 400 }
        );
      }

      finalQuantity = commentLines.length;
      formattedComments = commentLines.join('\r\n');
    }

    if (finalQuantity < service.min || finalQuantity > service.max) {
      return NextResponse.json(
        {
          success: false,
          error: isCustomComment
            ? `Number of comments (${finalQuantity}) must be between ${service.min} and ${service.max}`
            : `Quantity must be between ${service.min} and ${service.max}`,
        },
        { status: 400 }
      );
    }

    const calculatedPrice = Math.round((service.ratePer1000 / 1000) * finalQuantity);

    // Call MomoPanel via standard SMM v2 protocol
    const momoParams: any = {
      service: serviceId,
      link,
    };

    if (isCustomComment) {
      // Standard SMM v2 API expects `comments` parameter (newline-separated)
      // When comments are passed, MomoPanel determines quantity automatically from comments
      momoParams.comments = formattedComments;
    } else {
      momoParams.quantity = finalQuantity;
    }

    const momoRes = await addOrder(momoParams);

    if (!momoRes.isMock) {
      if (!momoRes.success || !momoRes.orderId) {
        console.error('[Social Order Error] MomoPanel rejection:', {
          rawError: momoRes.error,
          serviceId,
          link,
          quantity: finalQuantity,
          hasComments: !!formattedComments,
          reference,
        });

        return NextResponse.json(
          {
            success: false,
            error: 'The provider could not fulfill this service request at this time. Your wallet has been refunded.',
          },
          { status: 502 }
        );
      }

      if (!isMock && verifiedTx) {
        await adminSupabase
          .from('transactions')
          .update({
            metadata: {
              ...(verifiedTx.metadata || {}),
              fulfillment_status: 'fulfilled',
              fulfilled_at: new Date().toISOString(),
              supplierOrderId: momoRes.orderId,
            },
          })
          .eq('reference', reference);
      }

      return NextResponse.json({
        success: true,
        orderId: momoRes.orderId,
        serviceName: service.name,
        quantity,
        link,
        price: calculatedPrice,
      });
    }

    // Simulation
    await new Promise((res) => setTimeout(res, 500));

    // Allow simulating provider rejection
    if (link.includes('fail') || link.includes('reject')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server rejection: Target account is private or invalid. Automated refund initiated.',
        },
        { status: 502 }
      );
    }

    const simOrderId = `KP-${Date.now()}`;
    if (!isMock && verifiedTx) {
      await adminSupabase
        .from('transactions')
        .update({
          metadata: {
            ...(verifiedTx.metadata || {}),
            fulfillment_status: 'fulfilled',
            fulfilled_at: new Date().toISOString(),
            supplierOrderId: simOrderId,
          },
        })
        .eq('reference', reference);
    }

    return NextResponse.json({
      success: true,
      orderId: simOrderId,
      serviceName: service.name,
      quantity,
      link,
      price: calculatedPrice,
      message: `Order submitted successfully! Delivery started for ${link}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
