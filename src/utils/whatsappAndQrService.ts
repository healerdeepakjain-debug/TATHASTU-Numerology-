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
  calculateCompatibility,
} from './numerology';
import { calculateVedicAstrologyFromBirth } from './astrologyAndCities';
import { getBestUpcomingEventsNext12Months } from '../components/CosmicCalendar';
import { calculateParivarMilanReport, ParivarMemberRecord } from './parivarMilan';
import { generateAdvanceMobileReport } from './advanceMobileReport';
import { SANSKRit_BEEJ_DEVANAGARI } from '../components/DailyMantras';
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
  if (profile.includeParivarMilan === false) {
    params.set('includeParivarMilan', '0');
  } else if (profile.includeParivarMilan === true) {
    params.set('includeParivarMilan', '1');
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

  const savedParivarMembers = ((profile.parivarMembers || []) as ParivarMemberRecord[])
    .filter((fm) => fm && fm.isSaved && fm.name?.trim() && fm.dob?.trim())
    .slice(0, 5);
  const parivarSummaryLines: string[] = [];
  if (profile.includeParivarMilan !== false && savedParivarMembers.length > 0) {
    const pRep = calculateParivarMilanReport(
      {
        name: profile.name,
        dob: profile.dob,
        tob: profile.tob || '09:30',
        pob: profile.pob || 'New Delhi, India',
        lat: profile.lat ?? 28.6139,
        lng: profile.lng ?? 77.209,
      },
      savedParivarMembers
    );
    parivarSummaryLines.push(
      `👨‍👩‍👧‍👦 *PARIVAR MILAN (9-CHAKRA & VEDIC HARMONY):*`,
      `• Overall Parivar Harmony: *${pRep.averageFamilyHarmony}%* (${pRep.familyCollectiveVerdict})`,
      ...pRep.memberResults.map(
        (mr) =>
          `• ${mr.member.name} (${mr.member.relation}): *${mr.overallHarmonyScore}%* | Rudraksha: ${mr.gemstoneAndRudrakshaRemedy.familyUnityRudraksha}`
      ),
      `_${pRep.importantDisclaimer}_`,
      ``
    );
  }

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
    ...parivarSummaryLines,
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

/**
 * 4) TAB 1 — Focused WhatsApp: Auspicious Time & Lucky Colour of the Day ONLY (Short & Clean)
 */
export async function sendWhatsAppAuspiciousTimeAndColor(
  profile: AstroProfileRecord,
  senderAccount: AccountRecord
): Promise<{ ok: boolean }> {
  const m = calculateMulank(profile.dob);
  const b = calculateBhagyank(profile.dob);
  const panchang = getDailyPanchang(new Date(), m, b);
  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const brandTitle =
    senderAccount.role === 'healer' && senderAccount.healerBrandName
      ? senderAccount.healerBrandName
      : TATHASTU_BRAND_NAME;

  const auspiciousWindowText =
    panchang.auspiciousTimings.length > 0
      ? panchang.auspiciousTimings.slice(0, 3).join(' | ')
      : 'Amrit / Shubh Choghadiya (Morning & Midday)';

  const lines = [
    `🕉️ *${brandTitle}*`,
    `Namaste *${profile.name}* Ji (${dateLabel})`,
    ``,
    `⏰ *TODAY'S AUSPICIOUS TIME (IST):*`,
    `• Brahma Muhurat: 04:45 – 05:33 IST`,
    `• Abhijit Muhurat: 11:51 – 12:39 IST`,
    `• Shubh Choghadiya: ${auspiciousWindowText}`,
    `• Avoid Rahu Kaal: ${panchang.rahuKaalWindow.start} – ${panchang.rahuKaalWindow.end} IST`,
    ``,
    `🎨 *LUCKY COLOUR TO WEAR TODAY:*`,
    `• ${panchang.todayLuckyColor}`,
  ];

  await dispatchWhatsAppMessage(profile.mobile, lines.join('\n'));
  return { ok: true };
}

/**
 * 5) TAB 2 — Focused WhatsApp: Day-According Remedies ONLY (Personal + Partner Milan + Parivar Milan)
 * Strictly includes:
 * 1. Vedic Beej Mantra
 * 2. Daily Karmic Ritual & Daan
 * 3. Maha Dasha Mantra
 * 4. Bhagyank & Missing Number Siddhi Mantra
 * 5. Natal Soul & Janma Rashi Siddhi Mantra
 * 6. Today's Siddhi Mantra
 */
export async function sendWhatsAppDayRemediesDigest(
  profile: AstroProfileRecord,
  senderAccount: AccountRecord
): Promise<{ ok: boolean }> {
  const m = calculateMulank(profile.dob);
  const b = calculateBhagyank(profile.dob);
  const mulankInfo = PLANETARY_PROFILES[m] || PLANETARY_PROFILES[1];
  const bhagyankInfo = PLANETARY_PROFILES[b] || PLANETARY_PROFILES[3];
  const panchang = getDailyPanchang(new Date(), m, b);
  const astro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.209
  );
  const advReport = generateAdvanceMobileReport(
    profile.dob,
    profile.mobile || '8899444444',
    m,
    b
  );
  const activeDasha =
    advReport.dashaTimeline.find((d) => d.isCurrent) || advReport.dashaTimeline[0];
  const dashaNum = activeDasha?.dashaNumber || 6;
  const dashaInfo = PLANETARY_PROFILES[dashaNum] || mulankInfo;
  const mulankDev = SANSKRit_BEEJ_DEVANAGARI[m] || SANSKRit_BEEJ_DEVANAGARI[1];
  const dashaDev = SANSKRit_BEEJ_DEVANAGARI[dashaNum] || SANSKRit_BEEJ_DEVANAGARI[6];
  const bhagyankDev = SANSKRit_BEEJ_DEVANAGARI[b] || SANSKRit_BEEJ_DEVANAGARI[3];

  const today = new Date();
  const weekdayIndex = today.getDay();
  const dateLabel = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const DAY_KARMIC_RITUAL_AND_DAAN: Record<number, string> = {
    0: 'Offer Surya Arghya in copper vessel at sunrise; donate wheat or jaggery (Gur) to the needy.',
    1: 'Offer raw milk & water on Shivling; donate white rice, milk, or white sweets.',
    2: 'Recite Hanuman Chalisa & light a Jasmine oil diya; donate red masoor dal or jaggery.',
    3: 'Offer Durva grass to Lord Ganesha; feed green fodder to cows or donate green moong dal.',
    4: 'Apply Haldi/Kesar tilak & water Banana tree; donate chana dal, turmeric, or bananas.',
    5: 'Offer white flowers to Goddess Mahalakshmi; donate kheer, sugar, or white clothes.',
    6: 'Light a mustard oil diya under Peepal tree at dusk; donate black sesame (til) or mustard oil.',
  };

  // Partner Milan day-aligned chakra remedy (if Partner Milan is active)
  const partnerLines: string[] = [];
  if (profile.includePartnerMilan && (profile.partnerName || '').trim()) {
    const isFemale = profile.gender === 'female';
    const clientBirth = {
      id: profile.id,
      name: profile.name,
      dob: profile.dob,
      tob: profile.tob || '09:30',
      pob: profile.pob || 'New Delhi, India',
      lat: profile.lat ?? 28.6139,
      lng: profile.lng ?? 77.209,
    };
    const partnerBirth = {
      id: `${profile.id}-partner`,
      name: profile.partnerName!.trim(),
      dob: profile.partnerDob || '1990-11-24',
      tob: profile.partnerTob || '11:15',
      pob: profile.partnerPob || 'Mumbai, Maharashtra, India',
      lat: profile.partnerLat ?? 19.076,
      lng: profile.partnerLng ?? 72.8777,
    };
    const compat = isFemale
      ? calculateCompatibility(partnerBirth, clientBirth)
      : calculateCompatibility(clientBirth, partnerBirth);
    const priorityChakras = compat.chakraChallenges.filter(
      (c) => c.status !== 'Harmonious' || c.alignmentScore < 75
    );
    const chosenChakra =
      priorityChakras.length > 0
        ? priorityChakras[weekdayIndex % priorityChakras.length]
        : compat.chakraChallenges[weekdayIndex % compat.chakraChallenges.length];
    if (chosenChakra) {
      partnerLines.push(
        ``,
        `💑 *Partner Milan Remedy (${profile.name} & ${partnerBirth.name} — ${priorityChakras.length}/9 Chakras Need Remedies):*`,
        `• Focus Chakra: ${chosenChakra.chakraName} (${chosenChakra.alignmentScore}%)`,
        `• Beej Mantra: ${chosenChakra.beejMantra}`,
        `• Joint Ritual: ${chosenChakra.bothRemedy}`
      );
    }
  }

  // Parivar Milan day-aligned remedy (if family members exist)
  const parivarLines: string[] = [];
  const members: ParivarMemberRecord[] = Array.isArray(profile.parivarMembers)
    ? profile.parivarMembers
    : [];
  if (profile.includeParivarMilan !== false && members.length > 0) {
    const pRep = calculateParivarMilanReport(
      {
        name: profile.name,
        dob: profile.dob,
        tob: profile.tob || '09:30',
        pob: profile.pob || 'New Delhi, India',
        lat: profile.lat ?? 28.6139,
        lng: profile.lng ?? 77.209,
      },
      members
    );
    const targetMember = pRep.memberResults[weekdayIndex % pRep.memberResults.length];
    if (targetMember) {
      const remChakras = targetMember.nineChakraDiagnostics.filter(
        (c) => c.status !== 'Harmonious' || c.alignmentScore < 75
      );
      const focusCh =
        remChakras.length > 0
          ? remChakras[weekdayIndex % remChakras.length]
          : targetMember.nineChakraDiagnostics[0];
      parivarLines.push(
        ``,
        `🏡 *Parivar Milan Remedy (${targetMember.member.name} — ${targetMember.member.relation}):*`,
        `• Focus Chakra: ${focusCh?.chakraName || 'Heart Chakra'} (${remChakras.length}/9 Chakras Need Remedies)`,
        `• Beej Mantra: ${focusCh?.beejMantra || targetMember.gemstoneAndRudrakshaRemedy.rudrakshaMantra}`,
        `• Family Ritual: ${focusCh?.jointFamilyRemedy || targetMember.vedicAstrologyHarmony.vedicRemedy}`
      );
    }
  }

  const brandTitle =
    senderAccount.role === 'healer' && senderAccount.healerBrandName
      ? senderAccount.healerBrandName
      : TATHASTU_BRAND_NAME;

  const missingLabel =
    advReport.missingNumbersList.length > 0
      ? advReport.missingNumbersList.slice(0, 3).join(', ')
      : 'Balanced';

  const lines = [
    `🕉️ *${brandTitle}* — *Day-According Remedies (${dateLabel})*`,
    `Client: *${profile.name}*`,
    ``,
    `1. *Vedic Beej Mantra:*`,
    `${mulankInfo.beejMantra}`,
    ``,
    `2. *Daily Karmic Ritual & Daan:*`,
    `${DAY_KARMIC_RITUAL_AND_DAAN[weekdayIndex]}`,
    ``,
    `3. *Maha Dasha Mantra (${activeDasha.planet} ${activeDasha.startYear}–${activeDasha.endYear}):*`,
    `${dashaDev.devanagari} (${dashaInfo.beejMantra})`,
    ``,
    `4. *Bhagyank (${b}) & Missing Number (${missingLabel}) Siddhi Mantra:*`,
    `${bhagyankDev.devanagari} (${bhagyankInfo.beejMantra})`,
    ``,
    `5. *Natal Soul & Janma Rashi Siddhi Mantra (${astro.rashi} • ${mulankInfo.planet}):*`,
    `${mulankDev.devanagari} (${mulankInfo.beejMantra})`,
    ``,
    `6. *Today's Siddhi Mantra (${panchang.vara}):*`,
    `${panchang.todayBeejMantra}`,
    ...partnerLines,
    ...parivarLines,
  ];

  await dispatchWhatsAppMessage(profile.mobile, lines.join('\n'));
  return { ok: true };
}
