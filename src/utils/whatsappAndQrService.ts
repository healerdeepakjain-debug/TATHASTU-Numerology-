import QRCode from 'qrcode';
import {
  AstroProfileRecord,
  AccountRecord,
  TATHASTU_BRAND_NAME,
  TATHASTU_TAGLINE,
  TATHASTU_APP_NAME,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_ADMIN_EMAIL,
  TATHASTU_DEFAULT_HEALER_NAME,
  TATHASTU_OFFICIAL_APP_URL,
} from './tathastuStore';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeName,
  analyzeMobileNumber,
  getDailyPanchang,
} from './numerology';
import { calculateVedicAstrologyFromBirth } from './astrologyAndCities';
import { getBestUpcomingEventsNext12Months } from '../components/CosmicCalendar';
import {
  getCurrentLanguage,
  translateMultilineBlock,
  validateAndNormalizeLocaleText,
} from './i18n';

/**
 * Returns the official publicly accessible Tathastu App Origin URL for WhatsApp report links,
 * Install App portal cards, and printed/scannable QR codes.
 */
export function getShareablePublicAppOrigin(customUrl?: string): string {
  if (customUrl && customUrl.trim()) {
    const trimmed = customUrl.trim().replace(/\/+$/, '');
    if (!trimmed.includes('//ais-dev-') && !trimmed.includes('//ais-pre-')) {
      return trimmed;
    }
  }
  return TATHASTU_OFFICIAL_APP_URL;
}

export function getPublicAppOriginUrl(customUrl?: string): string {
  return getShareablePublicAppOrigin(customUrl);
}

export interface WhatsAppApiConfig {
  mode: 'direct_web_api' | 'cloud_business_api';
  phoneNumberId: string;
  accessToken: string;
  businessDisplayName: string;
  autoIncludeReportQrLink: boolean;
}

const WHATSAPP_CONFIG_STORAGE_KEY = 'tathastu_whatsapp_api_config_v1';

export function loadWhatsAppApiConfig(): WhatsAppApiConfig {
  try {
    const raw = localStorage.getItem(WHATSAPP_CONFIG_STORAGE_KEY);
    if (raw) {
      return {
        mode: 'direct_web_api',
        phoneNumberId: '',
        accessToken: '',
        businessDisplayName: TATHASTU_BRAND_NAME,
        autoIncludeReportQrLink: true,
        ...JSON.parse(raw),
      };
    }
  } catch {
    // Fallback
  }
  return {
    mode: 'direct_web_api',
    phoneNumberId: '',
    accessToken: '',
    businessDisplayName: TATHASTU_BRAND_NAME,
    autoIncludeReportQrLink: true,
  };
}

export function saveWhatsAppApiConfig(config: WhatsAppApiConfig): void {
  try {
    localStorage.setItem(WHATSAPP_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Builds the direct deep link URL encoded inside WhatsApp messages and printed A4 QR codes.
 * When clicked or scanned, it opens the client's personalized report view directly.
 */
export function getClientReportDirectUrl(
  profile: Partial<AstroProfileRecord> & Pick<AstroProfileRecord, 'id' | 'name' | 'dob' | 'mobile' | 'tob' | 'pob'>,
  targetTab = 'dashboard'
): string {
  const origin = getShareablePublicAppOrigin();
  const params = new URLSearchParams({
    reportProfileId: profile.id,
    clientName: profile.name,
    dob: profile.dob,
    tob: profile.tob || '09:30',
    pob: profile.pob || 'New Delhi, India',
    mobile: profile.mobile || '',
    gender: profile.gender || 'male',
    lat: String(profile.lat ?? 28.6139),
    lng: String(profile.lng ?? 77.209),
    qrAccess: 'mobile_pdf',
    tab: targetTab,
    lang: getCurrentLanguage(),
  });
  if (profile.includePartnerMilan) {
    params.set('includePartnerMilan', '1');
    if (profile.partnerName) params.set('partnerName', profile.partnerName);
    if (profile.partnerDob) params.set('partnerDob', profile.partnerDob);
    if (profile.partnerTob) params.set('partnerTob', profile.partnerTob);
    if (profile.partnerPob) params.set('partnerPob', profile.partnerPob);
  }
  if (profile.originalName) params.set('originalName', profile.originalName);
  if (profile.selectedNameA) params.set('selectedNameA', profile.selectedNameA);
  if (profile.selectedNameB) params.set('selectedNameB', profile.selectedNameB);
  if (profile.originalMobile) params.set('originalMobile', profile.originalMobile);
  if (profile.selectedMobileA) params.set('selectedMobileA', profile.selectedMobileA);
  if (profile.selectedMobileB) params.set('selectedMobileB', profile.selectedMobileB);
  return `${origin}/?${params.toString()}`;
}

/**
 * Generates a high-resolution PNG Data URL QR code for a client's PDF report.
 * Works 100% client-side with zero external network or CORS dependency.
 */
export async function generateClientReportQrDataUrl(
  profile: Partial<AstroProfileRecord> & Pick<AstroProfileRecord, 'id' | 'name' | 'dob' | 'mobile' | 'tob' | 'pob'>
): Promise<string> {
  const url = getClientReportDirectUrl(profile);
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 260,
      color: {
        dark: '#0f172a',
        light: '#fef3c7',
      },
    });
    return dataUrl;
  } catch {
    return '';
  }
}

export function formatIndianWhatsAppPhone(rawMobile?: string): string {
  const digits = (rawMobile || '').replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `91${last10}`;
  }
  return `91${TATHASTU_ADMIN_PHONE}`;
}

/**
 * Builds a structured block containing:
 * 1) Client Report Status (Ready status, 12-Month validity starting from today, Name & Mobile harmony scores)
 * 2) Live Auspicious Time Updates (Good Time Choghadiya, Rahu Kaal Caution Window, Planetary Hora)
 * 3) Direct Deep Link to the Client's Personalized Report View
 */
export function buildClientStatusAndAuspiciousUpdateBlock(profile: AstroProfileRecord): {
  reportStatusSummary: string[];
  auspiciousTimeSummary: string[];
  deepLinkSection: string[];
  deepLinkUrl: string;
} {
  const m = calculateMulank(profile.dob);
  const b = calculateBhagyank(profile.dob);
  const mPlanet = PLANETARY_PROFILES[m] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[b] || PLANETARY_PROFILES[9];
  const nameAnalysis = analyzeName(profile.name, m, b);
  const mobileAnalysis = analyzeMobileNumber(profile.mobile || '', m, b);
  const panchang = getDailyPanchang(new Date(), m, b);

  // Start 12-month validity from Today's Report Creation Date
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const goodSlots = panchang.choghadiyaPeriods
    .filter((c) => c.quality === 'Excellent' || c.quality === 'Good' || c.quality === 'Gainful')
    .map((c) => `${c.name} (${c.startTime}–${c.endTime})`)
    .join(', ');

  const deepLinkUrl = getClientReportDirectUrl(profile, 'dashboard');

  const reportStatusSummary = [
    `📊 *CLIENT REPORT STATUS:*`,
    `• Status: ✅ *VERIFIED & ENERGIZED (Personalized A4 Spiritual Dossier Ready)*`,
    `• 12-Month Validity: *${fmt(startDate)} to ${fmt(endDate)}*`,
    `• Name Harmony Score: *${nameAnalysis.harmonyScore}%* (Compound ${nameAnalysis.totalChaldeanCompound} ➔ Root ${nameAnalysis.chaldeanSingle})`,
    `• Mobile Audit Status: *${mobileAnalysis.overallScore}/100* (${mobileAnalysis.verdict})`,
  ];

  const auspiciousTimeSummary = [
    `⏰ *LIVE AUSPICIOUS TIME & RAHU KAAL UPDATE (${panchang.date}):*`,
    `• Good Time (Shubh/Amrit/Labh): *${goodSlots}*`,
    `• Bad Time to Avoid (Rahu Kaal): *${panchang.rahuKaalWindow.start} – ${panchang.rahuKaalWindow.end}*`,
    `• Active Planetary Hora: *${panchang.currentHora}* | Lucky Color: *${panchang.luckyColor}*`,
    `• Daily Vedic Planetary Mantra: *"${panchang.todayBeejMantra}"*`,
    `• Personal Mulank & Bhagyank Mantra: *"${mPlanet.beejMantra}"* & *"${bPlanet.beejMantra}"* (108x)`,
  ];

  const deepLinkSection = [
    `🔗 *DIRECT DEEP LINK TO YOUR PERSONALIZED REPORT VIEW & PDF:*`,
    `${deepLinkUrl}`,
  ];

  return {
    reportStatusSummary,
    auspiciousTimeSummary,
    deepLinkSection,
    deepLinkUrl,
  };
}

/**
 * Dispatches a WhatsApp message using either Meta Cloud Business API (if configured)
 * AND/OR instant 1-click WhatsApp Direct API (`api.whatsapp.com/send`).
 */
export async function dispatchWhatsAppMessage(
  rawMobile: string,
  messageText: string
): Promise<{ ok: boolean; method: string; url: string }> {
  const targetPhone = formatIndianWhatsAppPhone(rawMobile);
  const config = loadWhatsAppApiConfig();
  const activeLang = getCurrentLanguage();
  const localizedMessage = validateAndNormalizeLocaleText(
    translateMultilineBlock(messageText, activeLang),
    activeLang,
    { context: 'whatsapp' }
  ).sanitizedText;
  const encodedText = encodeURIComponent(localizedMessage);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;

  // If Cloud Business API credentials are provided, attempt Graph API call first
  if (
    config.mode === 'cloud_business_api' &&
    config.phoneNumberId.trim() &&
    config.accessToken.trim()
  ) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${config.phoneNumberId.trim()}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: targetPhone,
            type: 'text',
            text: { preview_url: true, body: localizedMessage },
          }),
        }
      );
      if (response.ok) {
        return { ok: true, method: 'WhatsApp Business Cloud API', url: whatsappUrl };
      }
    } catch {
      // Fallback to direct WhatsApp connection
    }
  }

  // Instant 1-Click Direct WhatsApp API Connection
  const link = document.createElement('a');
  link.href = whatsappUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { ok: true, method: 'Direct WhatsApp API', url: whatsappUrl };
}

/**
 * 1) One-Click WhatsApp Message: Specific Event & Best 12-Month Vedic Muhurat Alert
 * Always includes: Report Status + Event Muhurat + Live Auspicious Time Updates + Deep Link
 */
export async function sendWhatsAppSpecificEventAlert(
  profile: AstroProfileRecord,
  senderAccount: AccountRecord,
  eventIndex = 0
): Promise<{ ok: boolean; eventTitle: string }> {
  const m = calculateMulank(profile.dob);
  const b = calculateBhagyank(profile.dob);
  const astro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.209
  );
  const bestEvents12M = getBestUpcomingEventsNext12Months(
    {
      id: profile.id,
      name: profile.name,
      dob: profile.dob,
      tob: profile.tob || '09:30',
      pob: profile.pob || 'New Delhi, India',
      lat: profile.lat ?? 28.6139,
      lng: profile.lng ?? 77.209,
      mobile: profile.mobile,
    },
    new Date().toISOString()
  );

  const selectedEvent =
    bestEvents12M.events12M[eventIndex] || bestEvents12M.events12M[0];
  const isHealer = senderAccount.role === 'healer' || profile.ownerRole === 'healer';
  const healerName = isHealer ? senderAccount.name : TATHASTU_DEFAULT_HEALER_NAME;
  const brandTitle =
    isHealer && senderAccount.healerBrandName
      ? senderAccount.healerBrandName
      : isHealer
      ? senderAccount.name
      : TATHASTU_BRAND_NAME;
  const healerMobile = isHealer ? senderAccount.mobile : `+91 ${TATHASTU_ADMIN_PHONE}`;
  const healerEmail = isHealer ? senderAccount.email : TATHASTU_ADMIN_EMAIL;
  const { reportStatusSummary, auspiciousTimeSummary, deepLinkSection } =
    buildClientStatusAndAuspiciousUpdateBlock(profile);

  const lines = [
    `🕉️ *${brandTitle}*`,
    `✨ *${TATHASTU_BRAND_NAME} — ${TATHASTU_TAGLINE}*`,
    `📅 *UPCOMING VEDIC MUHURAT, REPORT STATUS & AUSPICIOUS TIME ALERT*`,
    ``,
    `Namaste *${profile.name}* Ji (DOB: ${profile.dob}),`,
    `According to your Vedic & Chaldean Birth Chart (Mulank ${m}, Bhagyank ${b}, Rashi: ${astro.rashi}, Nakshatra: ${astro.nakshatra}), here is your upcoming event Muhurat & live cosmic status:`,
    ``,
    `🌟 *Event:* ${selectedEvent.title}`,
    `📆 *Best Upcoming Date:* ${selectedEvent.bestUpcomingDate}`,
    `⏰ *Abhijit & Shubh Muhurat Window:* ${selectedEvent.bestTimeWindow} (${selectedEvent.choghadiyaAndHora})`,
    `🪐 *Vedic Planetary Alignment:* ${selectedEvent.nakshatraYoga} — ${selectedEvent.vedicAstrologyReason}`,
    `🕯️ *Recommended Vedic Mantra & Remedy:* ${selectedEvent.mantraAndDhikrBeforeEvent}`,
    ``,
    ...reportStatusSummary,
    ``,
    ...auspiciousTimeSummary,
    ``,
    ...deepLinkSection,
    ``,
    `Warm Spiritual Blessings,`,
    `Healer: *${healerName}* (${brandTitle})`,
    `📞 ${healerMobile} • ✉️ ${healerEmail}`,
  ];

  await dispatchWhatsAppMessage(profile.mobile, lines.join('\n'));
  return { ok: true, eventTitle: selectedEvent.title };
}

/**
 * 2) One-Click WhatsApp Message: Full Personalized Report Sharing + Report Status + Live Auspicious Time + Deep Link
 */
export async function sendWhatsAppFullReportShare(
  profile: AstroProfileRecord,
  senderAccount: AccountRecord
): Promise<{ ok: boolean }> {
  const m = calculateMulank(profile.dob);
  const b = calculateBhagyank(profile.dob);
  const astro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.209
  );
  const isHealer = senderAccount.role === 'healer' || profile.ownerRole === 'healer';
  const healerName = isHealer ? senderAccount.name : TATHASTU_DEFAULT_HEALER_NAME;
  const brandTitle =
    isHealer && senderAccount.healerBrandName
      ? senderAccount.healerBrandName
      : isHealer
      ? senderAccount.name
      : TATHASTU_BRAND_NAME;
  const healerMobile = isHealer ? senderAccount.mobile : `+91 ${TATHASTU_ADMIN_PHONE}`;
  const healerEmail = isHealer ? senderAccount.email : TATHASTU_ADMIN_EMAIL;
  const { reportStatusSummary, auspiciousTimeSummary, deepLinkSection } =
    buildClientStatusAndAuspiciousUpdateBlock(profile);

  const lines = [
    `🕉️ *${brandTitle}*`,
    `✨ *${TATHASTU_BRAND_NAME} — ${TATHASTU_TAGLINE}*`,
    `📜 *PERSONALIZED VEDIC & CHALDEAN REPORT STATUS, AUSPICIOUS TIMINGS & DEEP LINK*`,
    ``,
    `Namaste *${profile.name}* Ji (DOB: ${profile.dob}),`,
    `Your personalized Vedic, Chaldean & Pranic Numerology Spiritual Dossier is ready for instant viewing and PDF download:`,
    ``,
    `🔢 *CORE BIRTH VIBRATION:*`,
    `• Mulank: ${m} (${PLANETARY_PROFILES[m]?.planet}) | Bhagyank: ${b} (${PLANETARY_PROFILES[b]?.planet})`,
    `• Vedic Rashi: ${astro.rashi} | Nakshatra: ${astro.nakshatra} (Pada ${astro.pada})`,
    ``,
    ...reportStatusSummary,
    ``,
    ...auspiciousTimeSummary,
    ``,
    ...deepLinkSection,
    ``,
    `Prepared & Energized By Healer: *${healerName}*`,
    `${brandTitle} • 📞 ${healerMobile} • ✉️ ${healerEmail}`,
  ];

  await dispatchWhatsAppMessage(profile.mobile, lines.join('\n'));
  return { ok: true };
}

/**
 * 3) One-Click WhatsApp Message: Live Auspicious Time, Choghadiya, Rahu Kaal, Report Status & Deep Link
 */
export async function sendWhatsAppAuspiciousTimeUpdate(
  profile: AstroProfileRecord,
  senderAccount: AccountRecord
): Promise<{ ok: boolean }> {
  const isHealer = senderAccount.role === 'healer' || profile.ownerRole === 'healer';
  const healerName = isHealer ? senderAccount.name : TATHASTU_DEFAULT_HEALER_NAME;
  const brandTitle =
    isHealer && senderAccount.healerBrandName
      ? senderAccount.healerBrandName
      : isHealer
      ? senderAccount.name
      : TATHASTU_BRAND_NAME;
  const healerMobile = isHealer ? senderAccount.mobile : `+91 ${TATHASTU_ADMIN_PHONE}`;
  const { reportStatusSummary, auspiciousTimeSummary, deepLinkSection } =
    buildClientStatusAndAuspiciousUpdateBlock(profile);

  const lines = [
    `🕉️ *${brandTitle}*`,
    `✨ *${TATHASTU_APP_NAME} — LIVE AUSPICIOUS TIME, RAHU KAAL & REPORT STATUS*`,
    ``,
    `Namaste *${profile.name}* Ji (DOB: ${profile.dob}),`,
    `Here is your personalized Good/Bad Time, Rahu Kaal caution window, and direct report link for today:`,
    ``,
    ...auspiciousTimeSummary,
    ``,
    ...reportStatusSummary,
    ``,
    ...deepLinkSection,
    ``,
    `Blessings,`,
    `Healer: *${healerName}* (${brandTitle} • 📞 ${healerMobile})`,
  ];

  await dispatchWhatsAppMessage(profile.mobile, lines.join('\n'));
  return { ok: true };
}
