import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNumber, getStatus, setStatus, getBalance, getPrices } from '@/lib/vendors/grizzly';
import {
  getSMSPoolBalance,
  getSMSPoolCountries,
  getSMSPoolServices,
  getSMSPoolPrice,
  purchaseSMSPoolNumber,
  checkSMSPoolStatus,
  cancelSMSPoolOrder,
} from '@/lib/vendors/smspool';
import { getPricingConfigSync, computeRetailPrice } from '@/lib/pricing/pricingStore';
import { getDynamicSMSQuote } from '@/lib/pricing/smsPricing';
import { checkServiceAvailability } from '@/lib/services/serviceStatusStore';

// Helper to generate native emoji flag from ISO 2-letter country code
function getCountryFlag(shortName?: string): string {
  if (!shortName || shortName.length !== 2) return '🌐';
  try {
    const codePoints = shortName
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

// ==========================================
// SERVER 1 (GrizzlySMS) Priority Catalogs
// ==========================================
const S1_PRIORITY_COUNTRIES = [
  { code: 'usa', id: 187, name: 'United States', flag: '🇺🇸', costMultiplier: 1.2, isPriority: true },
  { code: 'uk', id: 16, name: 'United Kingdom', flag: '🇬🇧', costMultiplier: 1.3, isPriority: true },
  { code: 'ng', id: 19, name: 'Nigeria', flag: '🇳🇬', costMultiplier: 1.0, isPriority: true },
  { code: 'ca', id: 36, name: 'Canada', flag: '🇨🇦', costMultiplier: 1.2, isPriority: true },
  { code: 'ke', id: 8, name: 'Kenya', flag: '🇰🇪', costMultiplier: 0.9, isPriority: true },
  { code: 'gh', id: 38, name: 'Ghana', flag: '🇬🇭', costMultiplier: 0.9, isPriority: true },
  { code: 'za', id: 31, name: 'South Africa', flag: '🇿🇦', costMultiplier: 1.1, isPriority: true },
  { code: 'in', id: 22, name: 'India', flag: '🇮🇳', costMultiplier: 0.8, isPriority: true },
  { code: 'de', id: 43, name: 'Germany', flag: '🇩🇪', costMultiplier: 1.4, isPriority: true },
  { code: 'fr', id: 78, name: 'France', flag: '🇫🇷', costMultiplier: 1.4, isPriority: true },
];

const S1_PRIORITY_SERVICES = [
  { id: 'wa', name: 'WhatsApp', usdCost: 0.45, isPriority: true },
  { id: 'tg', name: 'Telegram', usdCost: 0.40, isPriority: true },
  { id: 'go', name: 'Google / Gmail / YouTube', usdCost: 0.36, isPriority: true },
  { id: 'oa', name: 'OpenAI / ChatGPT', usdCost: 0.55, isPriority: true },
  { id: 'ig', name: 'Instagram & Threads', usdCost: 0.33, isPriority: true },
  { id: 'tk', name: 'TikTok', usdCost: 0.30, isPriority: true },
  { id: 'fb', name: 'Facebook', usdCost: 0.36, isPriority: true },
  { id: 'tw', name: 'Twitter / X', usdCost: 0.42, isPriority: true },
  { id: 'nf', name: 'Netflix', usdCost: 0.48, isPriority: true },
  { id: 'st', name: 'Steam', usdCost: 0.30, isPriority: true },
  { id: 'ds', name: 'Discord', usdCost: 0.33, isPriority: true },
  { id: 'mm', name: 'Microsoft', usdCost: 0.36, isPriority: true },
];

// In-memory cache for live Grizzly catalog (1 hour TTL)
let cachedGrizzlyCatalog: {
  countries: any[];
  services: any[];
  cachedAt: number;
} | null = null;

async function fetchLiveGrizzlyCatalog() {
  const apiKey = process.env.GRIZZLY_API_KEY || '';
  const isMock = !apiKey || apiKey.includes('mock') || apiKey.includes('your-');

  if (isMock) {
    return {
      countries: S1_PRIORITY_COUNTRIES,
      services: S1_PRIORITY_SERVICES,
    };
  }

  if (cachedGrizzlyCatalog && Date.now() - cachedGrizzlyCatalog.cachedAt < 3600000) {
    return cachedGrizzlyCatalog;
  }

  try {
    const baseUrl = process.env.GRIZZLY_API_BASE_URL || 'https://api.grizzlysms.com/stubs/handler_api.php';
    const [cRes, sRes] = await Promise.all([
      fetch(`${baseUrl}?api_key=${apiKey}&action=getCountries`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}?api_key=${apiKey}&action=getServicesList`, { next: { revalidate: 3600 } }),
    ]);

    const cJson = await cRes.json();
    const sJson = await sRes.json();

    const priorityCountryIds = new Set(S1_PRIORITY_COUNTRIES.map((c) => c.id));
    const allRawCountries = Object.values(cJson) as any[];

    const otherCountries = allRawCountries
      .filter((c) => !priorityCountryIds.has(c.id) && c.eng && c.eng !== 'ANY_COUNTRY')
      .map((c) => ({
        code: String(c.id),
        id: c.id,
        name: c.eng,
        flag: '🌐',
        costMultiplier: 1.1,
        isPriority: false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const fullCountries = [...S1_PRIORITY_COUNTRIES, ...otherCountries];

    const priorityServiceIds = new Set(S1_PRIORITY_SERVICES.map((s) => s.id));
    priorityServiceIds.add('dr'); // OpenAI in Grizzly
    priorityServiceIds.add('mt'); // Steam in Grizzly

    const allRawServices = (sJson.services || []) as any[];
    const otherServices = allRawServices
      .filter((s) => !priorityServiceIds.has(s.code) && s.name)
      .map((s) => ({
        id: s.code,
        name: s.name.trim(),
        usdCost: 0.40,
        isPriority: false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const fullServices = [...S1_PRIORITY_SERVICES, ...otherServices];

    cachedGrizzlyCatalog = {
      countries: fullCountries,
      services: fullServices,
      cachedAt: Date.now(),
    };

    return cachedGrizzlyCatalog;
  } catch (err) {
    console.error('Failed to fetch live Grizzly catalog, falling back to priority list', err);
    return {
      countries: S1_PRIORITY_COUNTRIES,
      services: S1_PRIORITY_SERVICES,
    };
  }
}

// ==========================================
// SERVER 2 (SMSPool) Priority Catalogs & Cache
// ==========================================
// Note: WhatsApp is deliberately excluded from Server 2 as it is whitelist-restricted on SMSPool.
const S2_PRIORITY_COUNTRY_IDS = new Set([1, 2, 14, 53, 3, 4, 5, 6, 11, 15, 7]);
const S2_PRIORITY_SERVICE_MAP: Record<string, { name: string; usdCost: number }> = {
  '907': { name: 'Telegram', usdCost: 0.60 },
  '395': { name: 'Google / Gmail / YouTube', usdCost: 0.58 },
  '671': { name: 'OpenAI / ChatGPT', usdCost: 0.85 },
  '457': { name: 'Instagram / Threads', usdCost: 0.64 },
  '924': { name: 'TikTok / Douyin', usdCost: 0.60 },
  '329': { name: 'Facebook / Meta Viewpoints', usdCost: 0.55 },
  '948': { name: 'Twitter / X', usdCost: 0.67 },
  '630': { name: 'Netflix', usdCost: 0.73 },
  '868': { name: 'Steam', usdCost: 0.52 },
  '248': { name: 'Discord', usdCost: 0.55 },
  '558': { name: 'Microsoft / Outlook', usdCost: 0.58 },
};

let cachedSMSPoolCatalog: {
  countries: any[];
  services: any[];
  cachedAt: number;
} | null = null;

async function fetchLiveSMSPoolCatalog() {
  if (cachedSMSPoolCatalog && Date.now() - cachedSMSPoolCatalog.cachedAt < 3600000) {
    return cachedSMSPoolCatalog;
  }

  try {
    const [rawCountries, rawServices] = await Promise.all([
      getSMSPoolCountries(),
      getSMSPoolServices(),
    ]);

    // Format countries
    const priorityCountries: any[] = [];
    const regularCountries: any[] = [];

    rawCountries.forEach((c) => {
      const isPriority = S2_PRIORITY_COUNTRY_IDS.has(c.ID);
      const item = {
        code: String(c.ID),
        id: c.ID,
        name: c.name,
        flag: getCountryFlag(c.short_name),
        costMultiplier: c.ID === 1 ? 1.2 : c.ID === 2 ? 1.3 : 1.1,
        isPriority,
      };
      if (isPriority) {
        priorityCountries.push(item);
      } else {
        regularCountries.push(item);
      }
    });

    regularCountries.sort((a, b) => a.name.localeCompare(b.name));
    const fullCountries = [...priorityCountries, ...regularCountries];

    // Format services
    const priorityServices: any[] = [];
    const regularServices: any[] = [];

    rawServices.forEach((s) => {
      // Deliberately exclude WhatsApp on Server 2 (whitelist-only on SMSPool)
      const serviceName = (s.name || '').toLowerCase();
      if (String(s.ID) === '1012' || serviceName.includes('whatsapp')) {
        return;
      }

      const mapped = S2_PRIORITY_SERVICE_MAP[String(s.ID)];
      if (mapped) {
        priorityServices.push({
          id: String(s.ID),
          name: mapped.name,
          usdCost: mapped.usdCost,
          isPriority: true,
        });
      } else {
        regularServices.push({
          id: String(s.ID),
          name: s.name,
          usdCost: 0.60,
          isPriority: false,
        });
      }
    });

    regularServices.sort((a, b) => a.name.localeCompare(b.name));
    const fullServices = [...priorityServices, ...regularServices];

    const s2FallbackServices = S1_PRIORITY_SERVICES.filter(
      (s) => s.id !== 'wa' && !s.name.toLowerCase().includes('whatsapp')
    );

    cachedSMSPoolCatalog = {
      countries: fullCountries.length > 0 ? fullCountries : S1_PRIORITY_COUNTRIES,
      services: fullServices.length > 0 ? fullServices : s2FallbackServices,
      cachedAt: Date.now(),
    };

    return cachedSMSPoolCatalog;
  } catch (err) {
    console.error('Failed to fetch SMSPool catalog:', err);
    return {
      countries: S1_PRIORITY_COUNTRIES,
      services: S1_PRIORITY_SERVICES.filter(
        (s) => s.id !== 'wa' && !s.name.toLowerCase().includes('whatsapp')
      ),
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'catalog';
  const server = (searchParams.get('server') || 'server1').toLowerCase();
  const orderId = searchParams.get('orderId');

  // 1. Live Dynamic Quote action
  if (action === 'quote') {
    const serviceId = searchParams.get('serviceId');
    const countryCode = searchParams.get('countryCode') || searchParams.get('countryId');

    if (!serviceId || !countryCode) {
      return NextResponse.json(
        { success: false, error: 'Missing serviceId or countryCode parameter' },
        { status: 400 }
      );
    }

    const selectedServer = server === 'server2' ? 'server2' : 'server1';
    let countryName: string | undefined = undefined;
    let serviceName: string | undefined = undefined;
    let costMultiplier = 1.0;

    if (selectedServer === 'server2') {
      const catalog = await fetchLiveSMSPoolCatalog();
      const country = catalog.countries.find(
        (c) =>
          String(c.id) === String(countryCode) ||
          String(c.code).toLowerCase() === String(countryCode).toLowerCase()
      );
      const service = catalog.services.find(
        (s) => String(s.id).toLowerCase() === String(serviceId).toLowerCase()
      );
      countryName = country?.name;
      serviceName = service?.name;
      costMultiplier = country?.costMultiplier || 1.1;
    } else {
      const catalog = await fetchLiveGrizzlyCatalog();
      const country = catalog.countries.find(
        (c) =>
          String(c.id) === String(countryCode) ||
          String(c.code).toLowerCase() === String(countryCode).toLowerCase()
      );
      const service = catalog.services.find(
        (s) => String(s.id).toLowerCase() === String(serviceId).toLowerCase()
      );
      countryName = country?.name;
      serviceName = service?.name;
      costMultiplier = country?.costMultiplier || 1.1;
    }

    const quote = await getDynamicSMSQuote({
      server: selectedServer,
      countryCode,
      countryName,
      serviceId,
      serviceName,
      costMultiplier,
    });

    return NextResponse.json({
      success: true,
      quote,
    });
  }

  // 2. Catalog action
  if (action === 'catalog') {
    const pricingConfig = getPricingConfigSync();

    if (server === 'server2') {
      const s2Catalog = await fetchLiveSMSPoolCatalog();
      const s2Rate = pricingConfig.smspool?.usdToNgnRate || 1650;
      const s2Rule = pricingConfig.smspool?.globalRule || { type: 'percentage', value: 25 };
      const s2Overrides = pricingConfig.smspool?.overrides || {};

      const dynamicServices = s2Catalog.services.map((s) => {
        const usdCost = s.usdCost || 0.60;
        const wholesaleCost = Math.round(usdCost * s2Rate);
        const override = s2Overrides[s.id];
        const { retailPrice } = computeRetailPrice(wholesaleCost, s2Rule, override);
        return {
          ...s,
          usdCost,
          wholesaleCost,
          basePrice: retailPrice,
        };
      });

      return NextResponse.json({
        success: true,
        server: 'server2',
        serverName: 'Server 2',
        usdToNgnRate: s2Rate,
        countries: s2Catalog.countries,
        services: dynamicServices,
      });
    }

    const s1Catalog = await fetchLiveGrizzlyCatalog();
    const s1Rate = pricingConfig.grizzly?.usdToNgnRate || 1650;
    const s1Rule = pricingConfig.grizzly?.globalRule || { type: 'percentage', value: 30 };
    const s1Overrides = pricingConfig.grizzly?.overrides || {};

    const dynamicServices = s1Catalog.services.map((s) => {
      const usdCost = s.usdCost || 0.40;
      const wholesaleCost = Math.round(usdCost * s1Rate);
      const override = s1Overrides[s.id];
      const { retailPrice } = computeRetailPrice(wholesaleCost, s1Rule, override);
      return {
        ...s,
        usdCost,
        wholesaleCost,
        basePrice: retailPrice,
      };
    });

    return NextResponse.json({
      success: true,
      server: 'server1',
      serverName: 'Server 1',
      usdToNgnRate: s1Rate,
      countries: s1Catalog.countries,
      services: dynamicServices,
    });
  }

  // 2. Multi-Vendor Balance check
  if (action === 'balance') {
    const [grizzlyBal, smspoolBal] = await Promise.all([
      getBalance(),
      getSMSPoolBalance(),
    ]);
    return NextResponse.json({
      success: true,
      server1: grizzlyBal,
      server2: smspoolBal,
    });
  }

  // 3. Poll Status action
  if (action === 'getStatus') {
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }

    // Determine route from server param or orderId format
    const isServer2 = server === 'server2' || orderId.startsWith('SMP') || (!orderId.match(/^\d+$/) && !orderId.startsWith('GZ-'));

    if (isServer2) {
      const smspoolRes = await checkSMSPoolStatus({ orderId });
      return NextResponse.json({
        success: smspoolRes.success,
        status: smspoolRes.status,
        code: smspoolRes.code,
        timeLeft: smspoolRes.timeLeft,
      });
    }

    const grizzlyRes = await getStatus(orderId);

    if (!grizzlyRes.isMock) {
      if (grizzlyRes.success) {
        return NextResponse.json({
          success: true,
          status: grizzlyRes.status,
          code: grizzlyRes.code,
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: grizzlyRes.error || 'Failed to fetch status from Grizzly SMS',
        },
        { status: 502 }
      );
    }

    // Mock Simulation
    const parts = orderId.split('-');
    const createdAt = parseInt(parts[parts.length - 1], 10);
    const elapsedSeconds = !isNaN(createdAt) ? (Date.now() - createdAt) / 1000 : 15;

    if (elapsedSeconds > 8) {
      const sampleOtp = Math.floor(100000 + Math.random() * 900000).toString();
      return NextResponse.json({
        success: true,
        status: 'RECEIVED',
        code: sampleOtp,
        message: 'OTP Code received from SMS gateway.',
      });
    }

    return NextResponse.json({
      success: true,
      status: 'WAIT_CODE',
      elapsedSeconds: Math.floor(elapsedSeconds),
    });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, serviceId, countryCode, orderId, reference, server: rawServer } = body;
    const server = (rawServer || 'server1').toLowerCase();

    // 1. BUY / RENT NUMBER
    if (action === 'buy') {
      const serviceCheck = checkServiceAvailability('sms');
      if (!serviceCheck.allowed) {
        return NextResponse.json(
          { success: false, error: serviceCheck.message },
          { status: 503 }
        );
      }

      // ----------------------------------------------------
      // SERVER 2 ROUTE (SMSPool)
      // ----------------------------------------------------
      if (server === 'server2') {
        const catalog = await fetchLiveSMSPoolCatalog();
        const country =
          catalog.countries.find(
            (c) =>
              String(c.id) === String(countryCode) ||
              String(c.code).toLowerCase() === String(countryCode).toLowerCase()
          ) || catalog.countries[0];

        const service =
          catalog.services.find(
            (s) =>
              String(s.id).toLowerCase() === String(serviceId).toLowerCase() ||
              s.name.toLowerCase() === String(serviceId).toLowerCase()
          ) || catalog.services[0];

        if (!service) {
          return NextResponse.json({ success: false, error: 'Service not found' }, { status: 400 });
        }

        // Deliberately block WhatsApp on Server 2
        if (
          service.name.toLowerCase().includes('whatsapp') ||
          String(service.id) === '1012' ||
          String(serviceId).toLowerCase() === 'wa'
        ) {
          return NextResponse.json(
            {
              success: false,
              error: 'WhatsApp is exclusively available on Server 1. Please switch to Server 1 to rent a WhatsApp number.',
            },
            { status: 400 }
          );
        }

        const quote = await getDynamicSMSQuote({
          server: 'server2',
          countryCode: country.id || country.code,
          countryName: country.name,
          serviceId: service.id,
          serviceName: service.name,
          costMultiplier: country.costMultiplier || 1.1,
        });

        const calculatedCost = quote.retailPrice;

        const smspoolRes = await purchaseSMSPoolNumber({
          country: country.id,
          service: service.id,
        });

        if (!smspoolRes.isMock) {
          if (smspoolRes.success && smspoolRes.orderId && smspoolRes.phoneNumber) {
            return NextResponse.json({
              success: true,
              orderId: smspoolRes.orderId,
              phoneNumber: smspoolRes.phoneNumber,
              country: country.name,
              service: service.name,
              cost: calculatedCost,
              server: 'server2',
              expiresAt: Date.now() + (smspoolRes.expiresIn || 600) * 1000,
            });
          }

          // Admin telemetry logging
          console.error(`[SMS Server 2 Order Error] SMSPool gateway failure for ${country.name} (${service.name}):`, {
            rawError: smspoolRes.error,
            country: country.code,
            serviceId: service.id,
            reference,
          });

          // User-friendly client messages (NEVER expose vendor name or internal links to end users)
          let clientMessage = 'Temporary lines for this country/service are currently unavailable on Server 2. Please try another service or switch to Server 1.';
          const rawErr = (smspoolRes.error || '').toLowerCase();
          if (
            rawErr.includes('whitelist') ||
            rawErr.includes('not available') ||
            rawErr.includes('smspool') ||
            rawErr.includes('http') ||
            rawErr.includes('form') ||
            rawErr.includes('request')
          ) {
            clientMessage = 'Temporary lines for this service are currently out of stock on Server 2. Please switch to Server 1.';
          } else if (rawErr.includes('balance') || rawErr.includes('funds') || rawErr.includes('deposit')) {
            clientMessage = 'Carrier route is temporarily undergoing scheduled maintenance. Please try Server 1.';
          }

          return NextResponse.json(
            {
              success: false,
              error: clientMessage,
              adminTrace: {
                vendor: 'SMSPool',
                rawError: smspoolRes.error,
                timestamp: new Date().toISOString(),
              },
            },
            { status: 502 }
          );
        }

        // Mock simulation for Server 2
        await new Promise((res) => setTimeout(res, 400));
        const simId = `SMP-${country.id}-${Date.now()}`;
        const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
        return NextResponse.json({
          success: true,
          orderId: simId,
          phoneNumber: `+1${randomDigits}`,
          country: country.name,
          service: service.name,
          cost: calculatedCost,
          server: 'server2',
          expiresAt: Date.now() + 10 * 60 * 1000,
        });
      }

      // ----------------------------------------------------
      // SERVER 1 ROUTE (GrizzlySMS)
      // ----------------------------------------------------
      const catalog = await fetchLiveGrizzlyCatalog();
      const country =
        catalog.countries.find(
          (c) =>
            c.code.toLowerCase() === countryCode?.toLowerCase() ||
            String(c.id) === String(countryCode)
        ) || S1_PRIORITY_COUNTRIES[0];

      const service = catalog.services.find(
        (s) => s.id.toLowerCase() === serviceId?.toLowerCase()
      );

      if (!service) {
        return NextResponse.json({ success: false, error: 'Service not found' }, { status: 400 });
      }

      const quote = await getDynamicSMSQuote({
        server: 'server1',
        countryCode: country.id || country.code,
        countryName: country.name,
        serviceId: service.id,
        serviceName: service.name,
        costMultiplier: country.costMultiplier || 1.1,
      });

      const calculatedCost = quote.retailPrice;

      // GrizzlySMS: action=getNumber
      const grizzlyRes = await getNumber({
        service: service.id,
        country: country.id || country.code,
      });

      if (!grizzlyRes.isMock) {
        if (grizzlyRes.success && grizzlyRes.activationId && grizzlyRes.phoneNumber) {
          return NextResponse.json({
            success: true,
            orderId: grizzlyRes.activationId,
            phoneNumber: `+${grizzlyRes.phoneNumber}`,
            country: country.name,
            service: service.name,
            cost: calculatedCost,
            server: 'server1',
            expiresAt: Date.now() + 15 * 60 * 1000,
          });
        }

        // Log internal vendor trace for Admin telemetry
        console.error(`[SMS Server 1 Order Error] Gateway failure for ${country.name} (${service.name}):`, {
          rawError: grizzlyRes.error,
          country: country.code,
          serviceId: service.id,
          reference,
        });

        // User-friendly client messages
        let clientMessage = 'Temporary lines for this country/service are currently unavailable. Please try another service or switch to Server 2.';
        const rawErr = (grizzlyRes.error || '').toUpperCase();

        if (rawErr.includes('NO_NUMBERS') || rawErr.includes('NO_BALANCE') || rawErr.includes('NO_REPUTATION')) {
          clientMessage = 'All virtual lines for this service are currently out of stock on Server 1. Please switch to Server 2 or try another service.';
        } else if (rawErr.includes('BANNED') || rawErr.includes('BLOCKED')) {
          clientMessage = 'This service route is temporarily undergoing scheduled carrier maintenance. Please try Server 2.';
        } else if (rawErr.includes('WRONG_SERVICE') || rawErr.includes('BAD_SERVICE')) {
          clientMessage = 'Selected service is currently unavailable in this country.';
        }

        return NextResponse.json(
          {
            success: false,
            error: clientMessage,
            adminTrace: {
              vendor: 'GrizzlySMS',
              rawError: grizzlyRes.error,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 502 }
        );
      }

      // Realistic Simulation
      await new Promise((res) => setTimeout(res, 400));

      if (countryCode === 'fail' || serviceId === 'fail') {
        return NextResponse.json(
          {
            success: false,
            error: 'SMS Gateway: No active virtual numbers in carrier pool. Automated refund initiated.',
          },
          { status: 502 }
        );
      }

      const simulatedOrderId = `GZ-${country.code.toUpperCase()}-${Date.now()}`;
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      const phonePrefix =
        country.code === 'usa' ? '+1' : country.code === 'uk' ? '+44' : '+234';
      const phoneNumber = `${phonePrefix}${randomDigits}`;

      return NextResponse.json({
        success: true,
        orderId: simulatedOrderId,
        phoneNumber,
        country: country.name,
        service: service.name,
        cost: calculatedCost,
        server: 'server1',
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
    }

    // 2. CANCEL ORDER (Triggers Instant Refund)
    if (action === 'cancel') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
      }

      const isServer2 = server === 'server2' || orderId.startsWith('SMP') || (!orderId.match(/^\d+$/) && !orderId.startsWith('GZ-'));

      if (isServer2) {
        await cancelSMSPoolOrder({ orderId });
      } else {
        // GrizzlySMS: action=setStatus&status=8&id=$orderId (8 = cancel)
        await setStatus({ activationId: orderId, status: 8 });
      }

      return NextResponse.json({
        success: true,
        status: 'CANCELED',
        message: 'Number rental cancelled. Wallet is eligible for immediate full refund.',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

