import { jsPDF } from 'jspdf';
import {
  uploadReportPdfAndGetSignedUrl,
  triggerCrossPlatformPdfBlobDownload,
} from '../firebase';
import {
  SupportedLanguage,
  getCurrentLanguage,
  translateTextForLanguage,
  deepTranslateReportPayload,
  validateAndNormalizeLocaleText,
  validateDynamicAiReportContent,
} from './i18n';
import {
  AstroProfileRecord,
  AccountRecord,
  TATHASTU_APP_NAME,
  TATHASTU_BRAND_NAME,
  TATHASTU_TAGLINE,
  TATHASTU_LOGO_PATH,
} from './tathastuStore';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeName,
  analyzeMobileNumber,
  generateNameCorrections,
  getDailyPanchang,
  calculateLoShuGrid,
  calculateCompatibility,
  resolveGroomAndBrideProfiles,
  getPlanetaryRelationship,
  validateNumericEntity,
  CELESTIAL_TRANSITS,
} from './numerology';
import {
  calculateVedicAstrologyFromBirth,
  calculateCareerAndAuraProfile,
  getPersonalizedIndianFestivals,
  solveElongationCrossingUtcMs,
  formatExactIstDateTime,
} from './astrologyAndCities';
import { generateAdvanceMobileReport } from './advanceMobileReport';
import { calculateIslamicVedicReport } from './islamicVedicRemedies';
import { getBestUpcomingEventsNext12Months } from '../components/CosmicCalendar';
import { formatTime12HourAmPm } from '../components/BirthTimeAmPmInput';
import {
  calculateGemstoneRecommendationsForProfile,
  calculateNameAndPersonalGrowthRatnaRecommendation,
  calculatePartnerMilanRatnaRecommendations,
} from '../components/GemstoneRecommendation';
import { LO_SHU_VEDIC_REMEDIES_DB } from '../components/InteractiveLoShuGrid';
import { SANSKRit_BEEJ_DEVANAGARI } from '../components/DailyMantras';
import { calculateYogaPranayamaPlan, YogaPosturePrescription } from './yogaPranayamaData';
import { calculateParivarMilanReport, ParivarMemberRecord } from './parivarMilan';
import {
  AiReportSummaryData,
  buildClassicalFallbackSummary,
  fetchAiReportSummary,
} from './aiReportSummary';

import a4DivineEnergyBg from '../assets/images/a4_divine_energy_watermark_1794229222633.jpg';
import chakraHealingArt from '../assets/images/chakra_healing_meditation_art_1794229223170.jpg';
import spiritualReportBanner from '../assets/images/spiritual_energy_report_banner_1794229220638.jpg';
import vedicNameCareerYantra from '../assets/images/vedic_name_career_yantra_1794305504547.jpg';
import mobileLoShuGridArt from '../assets/images/mobile_lo_shu_cosmic_grid_1794305505049.jpg';
import planetaryTransitsArt from '../assets/images/planetary_transits_navagraha_1794305507441.jpg';
import islamicNoorArt from '../assets/images/islamic_vedic_noor_geometry_1794305507170.jpg';

export interface PdfExportContext {
  activeProfile: AstroProfileRecord;
  healerAccount: AccountRecord;
  isHealerReport: boolean;
  brandTitle: string;
  healerDisplayName: string;
  healerDisplayMobile: string;
  healerDisplayEmail: string;
  healerDisplayAddress: string;
  healerInstagram: string;
  healerFacebook: string;
  healerYoutube: string;
  healerWebsite: string;
  startFormatted: string;
  endFormatted: string;
  twelveMonths: {
    monthLabel: string;
    periodRange: string;
    personalMonthNum: number;
    rulingPlanet: string;
    forecastSummary: string;
    transitHighlight: string;
    moonPhaseDates: string;
    luckyDays: string;
  }[];
  qrCodeDataUrl?: string;
  qrCodeDirectUrl?: string;
  watermarkOpacityPercent?: number;
  watermarkEnabled?: boolean;
  selectedSections?: {
    nameAndCareer: boolean;
    advanceMobileAudit: boolean;
    forecast12Months: boolean;
    auditedCalendar12Months: boolean;
    transitsAndMoon12Months: boolean;
    dailyMantras: boolean;
    yogaAndPranayama?: boolean;
    partnerMilanChakras: boolean;
    parivarMilan?: boolean;
    festivals12Months: boolean;
    islamicVedicRemedies: boolean;
  };
  language?: SupportedLanguage;
  aiReportSummary?: AiReportSummaryData;
}

export interface MonthlyLunarAndAstroForecast {
  monthIndex: number;
  monthLabel: string;
  periodRange: string;
  shuklaPurnima: string;
  krishnaAmavasya: string;
  shuklaEkadashi: string;
  krishnaEkadashi: string;
  rulingPlanet: string;
  astrologicalPrediction: string;
  parallelRemedy: string;
}

/**
 * Generates a complete 12-Month Shukla Purnima, Krishna Amavasya, and Shukla/Krishna Ekadashi
 * Lunar Phase Calendar starting from Today's Report Creation Date, paired in parallel with
 * Vedic Astrological Gochar Predictions & Spiritual Remedies.
 */
export function generate12MonthLunarAndAstroForecast(
  startIso?: string,
  rashi: string = 'Mesha (Aries)',
  nakshatra: string = 'Ashwini',
  mulank: number = 1,
  bhagyank: number = 1
): MonthlyLunarAndAstroForecast[] {
  const isLegacyDemoDate =
    !startIso ||
    startIso.startsWith('2026-01-03') ||
    startIso.startsWith('2026-01-05') ||
    isNaN(new Date(startIso).getTime());
  const baseDate = isLegacyDemoDate ? new Date() : new Date(startIso);
  const synodicMonthDays = 29.53059;
  const refPurnimaMs = Date.UTC(2025, 0, 13, 22, 27, 0);
  const msPerDay = 86400000;

  const fmtShort = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const planetLords = [
    'Surya (Sun) - Soul & Authority',
    'Chandra (Moon) - Mind & Liquidity',
    'Mangal (Mars) - Courage & Land',
    'Budh (Mercury) - Trade & Intellect',
    'Guru (Jupiter) - Dhana & Grace',
    'Shukra (Venus) - Luxury & Harmony',
    'Shani (Saturn) - Karmic Stability',
    'Rahu (North Node) - Breakthroughs',
    'Ketu (South Node) - Intuition & Moksha',
    'Surya-Guru Yoga - Royal Recognition',
    'Chandra-Shukra Yoga - Wealth & Peace',
    'Guru-Mangal Yoga - Asset Expansion',
  ];

  const predictions = [
    `For ${rashi} (${nakshatra}), solar-lunar alignment activates career authority, government recognition, and leadership expansion after Shukla Ekadashi.`,
    `Emotional peace, family cashflow, and liquid investments strengthen for ${rashi}. Favorable window for resolving domestic matters during Shukla Paksha.`,
    `Dynamic Mars energy supports property decisions, debt clearance, and bold business steps for ${rashi}. Avoid hasty speech near Krishna Amavasya.`,
    `Mercury transit accelerates commercial agreements, digital trade, and banking success for ${rashi} (${nakshatra}). High return on communication.`,
    `Devaguru Brihaspati blesses wealth and fortune houses. Auspicious month for gold purchase, sacred ceremonies, mentor grace, and family expansion.`,
    `Venusian grace enhances marital harmony, vehicle/home upgrades, and creative business income for ${rashi} aligned with Mulank ${mulank}.`,
    `Saturn rewards disciplined effort and structured planning. Long-pending legal, career, or real-estate matters stabilize into permanent gains.`,
    `New interstate/foreign connections and sudden financial breakthroughs open up for ${rashi}. Maintain grounded aura protection on Amavasya.`,
    `Deep intuitive clarity, research success, and dissolution of old karmic blocks for ${rashi} (${nakshatra}). Ideal month for pilgrimage and sadhana.`,
    `High-visibility promotion yogas, executive authority, and social prestige favor ${rashi} in resonance with Destiny ${bhagyank}.`,
    `Domestic auspiciousness, relationship healing, and steady business inflows multiply between Shukla Ekadashi and Shukla Purnima.`,
    `Annual karmic efforts culminate in asset consolidation, spiritual peace, and preparation for a higher prosperity cycle for ${rashi}.`,
  ];

  const remedies = [
    `Purnima: Offer Arghya to rising Sun in copper lota & chant Aditya Hridaya Stotra. Ekadashi: Observe fruit/milk vrat & donate wheat/jaggery. Amavasya: Light sesame oil lamp for Pitru peace.`,
    `Purnima: Offer raw milk & white chandan to Shiva Lingam; chant 'Om Som Somaya Namah' (108x). Ekadashi: Recite Vishnu Sahasranama. Amavasya: Feed green fodder/roti to cows.`,
    `Purnima: Recite Hanuman Chalisa 7x & offer sindoor. Ekadashi: Donate red masoor dal & jaggery to needy. Amavasya: Light 4-faced mustard oil diya at main door threshold.`,
    `Purnima: Offer 11 Durva grass blades to Lord Ganesha & chant 'Om Bum Budhaya Namah'. Ekadashi: Tulsi Archana to Lord Vishnu. Amavasya: Feed soaked green moong to birds.`,
    `Purnima: Perform Satyanarayan Puja & apply kesar tilak on forehead. Ekadashi: Donate yellow chana dal, turmeric & bananas at temple. Amavasya: Silent meditation & Pitru Tarpan.`,
    `Purnima: Recite Sri Suktam with rose/lotus flowers & pure cow-ghee lamp in North-East. Ekadashi: Offer kheer/mishri bhog to Lakshmi-Narayan. Amavasya: Camphor & clove dhuni at sunset.`,
    `Purnima: Chant Dasaratha Shani Stotra & offer blue flowers. Ekadashi: Til-deepam at Vishnu temple. Amavasya: Light sesame oil diya under Peepal tree & donate black til/blanket.`,
    `Purnima: Recite Durga Argala Stotra & offer coconut. Ekadashi: Chant 'Om Namo Bhagavate Vasudevaya' (108x). Amavasya: Offer 7 grains (Satnaja) to birds & rock-salt bath.`,
    `Purnima: Recite Ganapati Atharvashirsha & offer modak/laddoo. Ekadashi: Read Bhagavad Gita Adhyaya 11 & Tulsi parikrama. Amavasya: Feed street dogs & light ghee lamp near Tulsi.`,
    `Purnima: Rudrabhishek with honey & sugarcane juice; energize Surya-Guru Yantra. Ekadashi: Donate yellow fruits & saffron sweets. Amavasya: Perform ancestral gratitude prayer before noon.`,
    `Purnima: Chant Mahalakshmi Ashtakam & keep silver coin in rice bowl overnight. Ekadashi: Observe Shukla Ekadashi vrat & deep-daan. Amavasya: Sea-salt water mopping for Vastu cleansing.`,
    `Purnima: Chant Maha Mrityunjaya Mantra (108x) + cow-ghee havan. Ekadashi: Offer Tulsi manjari & yellow cloth at temple. Amavasya: Perform Anna-Daan (food charity) to 5 needy persons.`,
  ];

  const result: MonthlyLunarAndAstroForecast[] = [];

  for (let i = 0; i < 12; i++) {
    const windowStart = new Date(baseDate.getTime() + i * 30.4375 * msPerDay);
    const windowEnd = new Date(baseDate.getTime() + (i + 1) * 30.4375 * msPerDay);

    const cyclesSinceRef =
      (windowStart.getTime() - refPurnimaMs) / (synodicMonthDays * msPerDay);
    const nextPurnimaCycle = Math.ceil(cyclesSinceRef);
    const approxPurnimaMs = refPurnimaMs + nextPurnimaCycle * synodicMonthDays * msPerDay;

    // Solve exact astronomical Full Moon (180° Moon-Sun elongation)
    const exactPurnimaMs = solveElongationCrossingUtcMs(approxPurnimaMs, 180);

    let approxAmavasyaMs = exactPurnimaMs + 14.765 * msPerDay;
    if (approxAmavasyaMs > windowEnd.getTime() + 5 * msPerDay) {
      approxAmavasyaMs = exactPurnimaMs - 14.765 * msPerDay;
    }
    // Solve exact astronomical New Moon (360°/0° Moon-Sun elongation)
    const exactAmavasyaMs = solveElongationCrossingUtcMs(approxAmavasyaMs, 0);

    // Solve exact Shukla Ekadashi (132° elongation end) & Krishna Ekadashi (312° elongation end)
    const exactShuklaEkadashiMs = solveElongationCrossingUtcMs(exactPurnimaMs - 3.8 * msPerDay, 132);
    const exactKrishnaEkadashiMs = solveElongationCrossingUtcMs(exactAmavasyaMs - 3.8 * msPerDay, 312);

    const monthLabel = windowStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const periodRange = `${fmtShort(windowStart)} - ${fmtShort(windowEnd)}`;

    result.push({
      monthIndex: i + 1,
      monthLabel: `Month ${i + 1} (${monthLabel})`,
      periodRange,
      shuklaPurnima: formatExactIstDateTime(exactPurnimaMs, 'short'),
      krishnaAmavasya: formatExactIstDateTime(exactAmavasyaMs, 'short'),
      shuklaEkadashi: formatExactIstDateTime(exactShuklaEkadashiMs, 'short'),
      krishnaEkadashi: formatExactIstDateTime(exactKrishnaEkadashiMs, 'short'),
      rulingPlanet: planetLords[i % planetLords.length],
      astrologicalPrediction: predictions[i % predictions.length],
      parallelRemedy: remedies[i % remedies.length],
    });
  }

  return result;
}

interface PdfGridItem {
  title: string;
  subtitle?: string;
  body: string;
  highlight?: string;
}

interface LoShuSquareMatrixData {
  gridCounts: Record<number, number>;
  mulank: number;
  bhagyank: number;
  dob: string;
}

interface AshtakootGunaMilanChartData {
  groomName: string;
  brideName: string;
  totalPoints: number;
  overallPercentage: number;
  overallVerdict: string;
  dimensions: Array<{
    index: number;
    kootaDimension: string;
    maritalDomain: string;
    maxGunas: number;
    obtainedGunas: number;
    percentage: number;
    verdict: string;
  }>;
}

interface ParivarHarmonyGraphBoxData {
  clientName: string;
  averageFamilyHarmony: number;
  familyCollectiveVerdict: string;
  strongestBondLabel: string;
  priorityRemedyBondLabel: string;
  collectiveSynthesis: string;
  members: Array<{
    index: number;
    name: string;
    relation: string;
    dobAndPlace: string;
    mulankBhagyankRashi: string;
    harmonyScore: number;
    harmoniousCount: number;
    needsHarmonyCount: number;
    verdict: string;
  }>;
}

interface PdfSectionBlock {
  heading: string;
  subheading?: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
    colWidths?: number[];
  };
  gridItems?: PdfGridItem[];
  letterGridCells?: Array<{
    char: string;
    chaldeanVal: number;
    pythagoreanVal: number;
  }>;
  loShuSquareMatrix?: LoShuSquareMatrixData;
  yogaAsanaGallery?: YogaPosturePrescription[];
  ashtakootChartBox?: AshtakootGunaMilanChartData;
  parivarHarmonyGraphBox?: ParivarHarmonyGraphBoxData;
}

interface PdfPageSpec {
  pageNumber: number;
  moduleKey?: keyof NonNullable<PdfExportContext['selectedSections']>;
  isClosingSummaryPage?: boolean;
  chapterTag: string;
  title: string;
  subtitle: string;
  bannerKey?: 'name' | 'mobile' | 'transit' | 'islamic' | 'chakra' | 'banner';
  includeQrVerification?: boolean;
  includeClosingBlessing?: boolean;
  sections: PdfSectionBlock[];
}

function cleanPdfText(
  input: string | number | undefined | null,
  langOverride?: SupportedLanguage
): string {
  if (input === undefined || input === null) return '';
  const activeLang = langOverride || getCurrentLanguage();
  const rawStr =
    activeLang !== 'en' && activeLang !== 'en-hi'
      ? validateAndNormalizeLocaleText(
          translateTextForLanguage(String(input), activeLang),
          activeLang,
          { context: 'report' }
        ).sanitizedText
      : String(input);

  const normalized = rawStr
    .replace(/₹/g, 'Rs. ')
    .replace(/•/g, '-')
    .replace(/—/g, ' - ')
    .replace(/–/g, '-')
    .replace(/➔/g, '->')
    .replace(/→/g, '->')
    .replace(/×/g, 'x')
    .replace(/✓/g, '[OK]')
    .replace(/✔/g, '[OK]')
    .replace(/✦/g, '*')
    .replace(/★/g, '*')
    .replace(/☆/g, '*')
    .replace(/⚠/g, '[!]')
    .replace(/['’‘]/g, "'")
    .replace(/["“”]/g, '"');

  // When Hindi or any regional Indian language is selected, preserve Indic Unicode ranges (\u0900-\u0DFF) and ZWJ/ZWNJ (\u200C\u200D)
  if (activeLang !== 'en' && activeLang !== 'en-hi') {
    return normalized
      .replace(/[^\x20-\x7E\u0900-\u0DFF\u200C\u200D\n]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return normalized
    .replace(/[^\x20-\x7E\n]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const UNICODE_TEXT_WIDTH_CACHE = new Map<string, number>();
let sharedMeasureCanvas: HTMLCanvasElement | null = null;
let sharedMeasureCtx: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!sharedMeasureCanvas) {
    sharedMeasureCanvas = document.createElement('canvas');
    sharedMeasureCanvas.width = 400;
    sharedMeasureCanvas.height = 60;
    sharedMeasureCtx = sharedMeasureCanvas.getContext('2d');
  }
  return sharedMeasureCtx;
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Splits a word into indivisible Indic Akshara (अक्षर) clusters so a base consonant is NEVER
 * separated from its combining vowel matra, anusvara, visarga, or virama/halant conjunct.
 */
function splitIntoIndicAksharas(word: string): string[] {
  const clusters: string[] = [];
  const isCombiningOrMatra = (code: number) =>
    (code >= 0x0900 && code <= 0x0903) ||
    (code >= 0x093a && code <= 0x0957) ||
    code === 0x0962 ||
    code === 0x0963 ||
    (code >= 0x0981 && code <= 0x0983) ||
    (code >= 0x09bc && code <= 0x09cd) ||
    (code >= 0x0a01 && code <= 0x0a4d) ||
    (code >= 0x0a70 && code <= 0x0a71) ||
    (code >= 0x0a81 && code <= 0x0acd) ||
    (code >= 0x0b01 && code <= 0x0b4d) ||
    (code >= 0x0b82 && code <= 0x0bcd) ||
    (code >= 0x0c00 && code <= 0x0c4d) ||
    (code >= 0x0c81 && code <= 0x0ccd) ||
    (code >= 0x0d00 && code <= 0x0d4d) ||
    code === 0x200c ||
    code === 0x200d;

  const isVirama = (code: number) =>
    code === 0x094d ||
    code === 0x09cd ||
    code === 0x0a4d ||
    code === 0x0acd ||
    code === 0x0b4d ||
    code === 0x0bcd ||
    code === 0x0c4d ||
    code === 0x0ccd ||
    code === 0x0d4d;

  let i = 0;
  while (i < word.length) {
    let cluster = word[i];
    i += 1;
    while (i < word.length) {
      const code = word.charCodeAt(i);
      const prevCode = cluster.charCodeAt(cluster.length - 1);
      if (isCombiningOrMatra(code) || isVirama(prevCode)) {
        cluster += word[i];
        i += 1;
      } else {
        break;
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

/**
 * Attaches ultra-fast per-page Unicode / Devanagari / Indic script measurement and rendering to a jsPDF instance.
 * Instead of encoding 4,500 separate line PNGs, draws all Indic lines for a physical page onto a single
 * per-page transparent canvas (`Map<number, HTMLCanvasElement>`) and composites once per page.
 */
function installUnicodeCanvasTextRenderer(
  doc: jsPDF,
  measureOnly: boolean = false,
  langOverride?: SupportedLanguage
): () => Promise<void> {
  const origGetTextWidth = doc.getTextWidth.bind(doc);
  const origSplitTextToSize = doc.splitTextToSize.bind(doc);
  const origText = doc.text.bind(doc);
  const origSetTextColor = doc.setTextColor.bind(doc);
  const activeLang = langOverride || getCurrentLanguage();

  let currentRgb: [number, number, number] = [30, 41, 59];

  doc.setTextColor = ((ch1: any, ch2?: any, ch3?: any, ch4?: any) => {
    if (typeof ch1 === 'number' && typeof ch2 === 'number' && typeof ch3 === 'number') {
      currentRgb = [ch1, ch2, ch3];
    } else if (typeof ch1 === 'number' && ch2 === undefined) {
      currentRgb = [ch1, ch1, ch1];
    }
    return origSetTextColor(ch1, ch2, ch3, ch4);
  }) as typeof doc.setTextColor;

  const hasIndicUnicode = (str: string) => /[\u0900-\u0DFF]/.test(str);

  doc.getTextWidth = (text: string): number => {
    const s = String(text ?? '');
    if (!s || !hasIndicUnicode(s)) {
      return origGetTextWidth(s);
    }
    const fontSizePt = doc.getFontSize();
    const fontObj = doc.getFont();
    const isBold = String(fontObj?.fontStyle || '').toLowerCase().includes('bold');
    const cacheKey = `${isBold ? 'B' : 'N'}:${fontSizePt}:${s}`;
    const cached = UNICODE_TEXT_WIDTH_CACHE.get(cacheKey);
    if (cached !== undefined) return cached;

    const mCtx = getMeasureContext();
    if (!mCtx) {
      return s.length * fontSizePt * 0.21;
    }
    const fontSizePx = fontSizePt * (96 / 72);
    mCtx.font = `${isBold ? '700' : '500'} ${fontSizePx}px "Noto Sans Devanagari", "Kohinoor Devanagari", "Nirmala UI", "Mangal", sans-serif`;
    const widthMm = mCtx.measureText(s).width * (25.4 / 96);
    if (UNICODE_TEXT_WIDTH_CACHE.size > 10000) {
      UNICODE_TEXT_WIDTH_CACHE.clear();
    }
    UNICODE_TEXT_WIDTH_CACHE.set(cacheKey, widthMm);
    return widthMm;
  };

  doc.splitTextToSize = (text: string, maxsize: number, options?: any): any => {
    const s = String(text ?? '');
    if (!s || !hasIndicUnicode(s)) {
      return origSplitTextToSize(s, maxsize, options);
    }
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [''];
    const spaceW = doc.getTextWidth(' ') || doc.getFontSize() * 0.095;
    const lines: string[] = [];
    let current = '';
    let currentW = 0;

    for (const w of words) {
      const wWidth = doc.getTextWidth(w);
      if (!current) {
        current = w;
        currentW = wWidth;
      } else if (currentW + spaceW + wWidth <= maxsize) {
        current = `${current} ${w}`;
        currentW += spaceW + wWidth;
      } else {
        lines.push(current);
        current = w;
        currentW = wWidth;
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [''];
  };

  if (measureOnly) {
    return async () => {};
  }

  // Per-page transparent text canvas (7 px/mm => 1470 x 2079 px for A4 ~ 178 DPI)
  const pxPerMm = 7;
  const pageCanvasMap = new Map<
    number,
    { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }
  >();

  const getOrCreatePageTextCanvas = (pageNumber: number) => {
    let entry = pageCanvasMap.get(pageNumber);
    if (!entry && typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(210 * pxPerMm);
      canvas.height = Math.round(297 * pxPerMm);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        entry = { canvas, ctx };
        pageCanvasMap.set(pageNumber, entry);
      }
    }
    return entry || null;
  };

  doc.text = ((text: string | string[], x: number, y: number, options?: any, transform?: any) => {
    if (Array.isArray(text)) {
      const hasAnyIndic = text.some((line) => hasIndicUnicode(String(line)));
      if (!hasAnyIndic) {
        return origText(text, x, y, options, transform);
      }
      const fontSizePt = doc.getFontSize();
      const lineStepMm = fontSizePt * 0.352778 * 1.25;
      text.forEach((line, idx) => {
        doc.text(String(line), x, y + idx * lineStepMm, options, transform);
      });
      return doc;
    }

    const rawLineStr = String(text ?? '');
    const lineStr =
      activeLang !== 'en' &&
      activeLang !== 'en-hi' &&
      !hasIndicUnicode(rawLineStr) &&
      /[A-Za-z]{2,}/.test(rawLineStr)
        ? cleanPdfText(rawLineStr, activeLang)
        : rawLineStr;

    if (!lineStr || !hasIndicUnicode(lineStr)) {
      return origText(lineStr, x, y, options, transform);
    }

    const pageInfo = (doc as any).internal?.getCurrentPageInfo?.();
    const pageNum = pageInfo?.pageNumber || 1;
    const pageTarget = getOrCreatePageTextCanvas(pageNum);
    if (!pageTarget) {
      return origText(lineStr.replace(/[^\x20-\x7E]/g, ''), x, y, options, transform);
    }

    const { ctx } = pageTarget;
    const fontSizePt = doc.getFontSize();
    const fontObj = doc.getFont();
    const isBold = String(fontObj?.fontStyle || '').toLowerCase().includes('bold');
    const fontPx = fontSizePt * 0.352778 * pxPerMm;

    ctx.font = `${isBold ? '700' : '500'} ${fontPx}px "Noto Sans Devanagari", "Kohinoor Devanagari", "Nirmala UI", "Mangal", sans-serif`;
    ctx.fillStyle = `rgb(${currentRgb[0]}, ${currentRgb[1]}, ${currentRgb[2]})`;
    ctx.textBaseline = 'alphabetic';
    const align = options?.align || 'left';
    ctx.textAlign = align === 'center' || align === 'right' ? align : 'left';
    ctx.fillText(lineStr, x * pxPerMm, y * pxPerMm);

    return doc;
  }) as typeof doc.text;

  return async () => {
    const entries = Array.from(pageCanvasMap.entries());
    for (let i = 0; i < entries.length; i++) {
      const [pageNum, { canvas }] = entries[i];
      try {
        doc.setPage(pageNum);
        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      } catch {
        // Ignore single page composite error
      }
      if (i % 2 === 1) {
        await yieldToBrowser();
      }
    }
    pageCanvasMap.clear();
  };
}

const HTML_IMAGE_PROMISE_CACHE = new Map<string, Promise<HTMLImageElement | null>>();
const COMPOSITE_BG_CACHE = new Map<string, string | null>();
const WATERMARK_SEAL_CACHE = new Map<string, string | null>();
const STRIP_ILLUSTRATION_CACHE = new Map<string, string | null>();
const CIRCULAR_LOGO_CACHE = new Map<string, string | null>();

function loadHtmlImage(url: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  const cached = HTML_IMAGE_PROMISE_CACHE.get(url);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      HTML_IMAGE_PROMISE_CACHE.delete(url);
      resolve(null);
    };
    img.src = url;
  });
  HTML_IMAGE_PROMISE_CACHE.set(url, promise);
  return promise;
}

/**
 * Draws an HTMLImageElement onto a 2D canvas using exact object-fit: cover center-crop math
 * so that the image is NEVER stretched or distorted regardless of source vs target aspect ratio.
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  panRatioX: number = 0.5,
  panRatioY: number = 0.5
): void {
  const iw = img.naturalWidth || img.width || 1;
  const ih = img.naturalHeight || img.height || 1;
  const targetRatio = dw / dh;
  const srcRatio = iw / ih;

  let sx = 0;
  let sy = 0;
  let sw = iw;
  let sh = ih;

  if (srcRatio > targetRatio) {
    sw = ih * targetRatio;
    sx = Math.max(0, (iw - sw) * panRatioX);
  } else {
    sh = iw / targetRatio;
    sy = Math.max(0, (ih - sh) * panRatioY);
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

async function createCompositeA4BackgroundDataUrl(
  bgUrl: string,
  bannerUrl: string,
  logoUrl?: string,
  watermarkEnabled: boolean = true,
  watermarkOpacityPercent: number = 10,
  brandTitle: string = TATHASTU_BRAND_NAME
): Promise<string | null> {
  const cacheKey = `${bgUrl}|${bannerUrl}|${logoUrl || ''}|${watermarkEnabled}|${watermarkOpacityPercent}|${brandTitle}`;
  if (COMPOSITE_BG_CACHE.has(cacheKey)) {
    return COMPOSITE_BG_CACHE.get(cacheKey) ?? null;
  }
  const [bgImg, bannerImg, tathastuLogoImg, customLogoImg] = await Promise.all([
    loadHtmlImage(bgUrl),
    loadHtmlImage(bannerUrl),
    loadHtmlImage(TATHASTU_LOGO_PATH),
    logoUrl && logoUrl !== TATHASTU_LOGO_PATH ? loadHtmlImage(logoUrl) : Promise.resolve(null),
  ]);

  const primaryWatermarkImg = tathastuLogoImg || customLogoImg;

  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 1240, 1754);
  grad.addColorStop(0, '#FFFDF7');
  grad.addColorStop(0.5, '#FEF9EC');
  grad.addColorStop(1, '#FDF4DC');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1240, 1754);

  if (bgImg) {
    ctx.save();
    ctx.globalAlpha = 0.20;
    drawImageCover(ctx, bgImg, 0, 0, 1240, 1754);
    ctx.restore();
  }

  if (bannerImg) {
    ctx.save();
    ctx.globalAlpha = 0.14;
    drawImageCover(ctx, bannerImg, 0, 0, 1240, 210);
    ctx.restore();
  }

  const cx = 620;
  const cy = 890;

  // Sacred Geometry Sri-Chakra & Solar Mandala Halo in Page Center
  ctx.save();
  ctx.globalAlpha = 0.11;
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2.8;
  for (const r of [380, 330, 280, 230, 175]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let a = 0; a < 24; a++) {
    const rad = (a * Math.PI) / 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * 175, cy + Math.sin(rad) * 175);
    ctx.lineTo(cx + Math.cos(rad) * 380, cy + Math.sin(rad) * 380);
    ctx.stroke();
  }
  ctx.restore();

  if (watermarkEnabled && primaryWatermarkImg) {
    const baseAlpha = Math.max(0.08, Math.min(0.26, (watermarkOpacityPercent / 100) * 1.45));

    // 1. Large Central TATHASTU Brand Watermark Medallion (1:1 aspect ratio, unstretched)
    ctx.save();
    ctx.globalAlpha = baseAlpha;
    const size = 500;
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    drawImageCover(ctx, primaryWatermarkImg, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();

    // Golden Watermark Ring & Brand Typography Below Central Logo
    ctx.save();
    ctx.globalAlpha = baseAlpha * 0.95;
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, 254, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 28px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText(TATHASTU_BRAND_NAME, cx, cy + 305);

    ctx.font = 'bold 18px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(TATHASTU_TAGLINE.toUpperCase(), cx, cy + 336);

    if (brandTitle && brandTitle.toUpperCase() !== TATHASTU_BRAND_NAME.toUpperCase()) {
      ctx.font = 'bold 16px Georgia, serif';
      ctx.fillText(brandTitle.toUpperCase(), cx, cy + 364);
    }
    ctx.restore();

    // 2. Subtle Secondary TATHASTU Watermark Seals in Upper & Lower Quadrants
    const cornerPositions = [
      { x: 250, y: 500, r: 95 },
      { x: 990, y: 500, r: 95 },
      { x: 250, y: 1290, r: 95 },
      { x: 990, y: 1290, r: 95 },
    ];
    for (const pos of cornerPositions) {
      ctx.save();
      ctx.globalAlpha = baseAlpha * 0.55;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      drawImageCover(
        ctx,
        primaryWatermarkImg,
        pos.x - pos.r,
        pos.y - pos.r,
        pos.r * 2,
        pos.r * 2
      );
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = baseAlpha * 0.5;
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  COMPOSITE_BG_CACHE.set(cacheKey, dataUrl);
  return dataUrl;
}

/**
 * Creates a high-resolution, subtle Transparent PNG Brand Watermark Seal (TATHASTU Logo + Sacred Halo + Brand Typography)
 * that is rendered on every A4 PDF page so that even dense tables and multi-card grids carry a refined, visible
 * TATHASTU watermark without reducing text contrast.
 */
async function createSubtleBrandWatermarkSealPngDataUrl(
  logoUrl?: string,
  watermarkOpacityPercent: number = 10,
  brandTitle: string = TATHASTU_BRAND_NAME
): Promise<string | null> {
  const sealKey = `${logoUrl || ''}|${watermarkOpacityPercent}|${brandTitle}`;
  if (WATERMARK_SEAL_CACHE.has(sealKey)) {
    return WATERMARK_SEAL_CACHE.get(sealKey) ?? null;
  }
  const [tathastuLogoImg, customLogoImg] = await Promise.all([
    loadHtmlImage(TATHASTU_LOGO_PATH),
    logoUrl && logoUrl !== TATHASTU_LOGO_PATH ? loadHtmlImage(logoUrl) : Promise.resolve(null),
  ]);
  const watermarkImg = tathastuLogoImg || customLogoImg;
  if (!watermarkImg) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 760;
  canvas.height = 840;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calibrated subtle watermark alpha (default ~0.075 so dark text remains 100% razor-sharp)
  const sealAlpha = Math.max(0.045, Math.min(0.15, (watermarkOpacityPercent / 100) * 0.78));
  const cx = 380;
  const cy = 365;

  // Outer Sacred Lotus & Solar Geometry Rings
  ctx.save();
  ctx.globalAlpha = sealAlpha * 0.9;
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 3.5;
  for (const r of [335, 295, 252]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 245, cy + Math.sin(angle) * 245);
    ctx.lineTo(cx + Math.cos(angle) * 335, cy + Math.sin(angle) * 335);
    ctx.stroke();
  }
  ctx.restore();

  // Central Circular TATHASTU Logo Medallion (100% unstretched)
  ctx.save();
  ctx.globalAlpha = sealAlpha;
  const radius = 235;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawImageCover(ctx, watermarkImg, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();

  // Double Golden Frame Ring Around Logo
  ctx.save();
  ctx.globalAlpha = sealAlpha * 1.1;
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
  ctx.stroke();

  // Brand Watermark Typography Banner Below Seal
  ctx.fillStyle = '#78350F';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Georgia, "Times New Roman", serif';
  ctx.fillText(TATHASTU_BRAND_NAME, cx, 742);

  ctx.font = 'bold 19px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(TATHASTU_TAGLINE.toUpperCase(), cx, 774);

  if (brandTitle && brandTitle.toUpperCase() !== TATHASTU_BRAND_NAME.toUpperCase()) {
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(brandTitle.toUpperCase(), cx, 804);
  }
  ctx.restore();

  const sealDataUrl = canvas.toDataURL('image/png');
  WATERMARK_SEAL_CACHE.set(sealKey, sealDataUrl);
  return sealDataUrl;
}

/**
 * Sets jsPDF fill opacity safely so background watermarks shine through cream card/table fills
 * while keeping borders and text at 100% opacity.
 */
function setPdfFillOpacity(doc: jsPDF, fillOpacity: number) {
  try {
    const anyDoc = doc as unknown as {
      GState?: new (opts: { opacity?: number; 'fill-opacity'?: number }) => unknown;
      setGState?: (gState: unknown) => void;
    };
    if (typeof anyDoc.GState === 'function' && typeof anyDoc.setGState === 'function') {
      anyDoc.setGState(
        new anyDoc.GState({
          opacity: fillOpacity,
          'fill-opacity': fillOpacity,
        })
      );
    }
  } catch {
    // Fallback if GState is unavailable
  }
}

/**
 * Creates the top header strip at exact 194mm : 22.5mm aspect ratio (1164 x 135 px)
 * using drawImageCover so the top header banner is razor-sharp and never stretched.
 */
async function createIllustrationStripDataUrl(url: string): Promise<string | null> {
  if (STRIP_ILLUSTRATION_CACHE.has(url)) {
    return STRIP_ILLUSTRATION_CACHE.get(url) ?? null;
  }
  const img = await loadHtmlImage(url);
  if (!img) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1164;
  canvas.height = 135;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#1E1136';
  ctx.fillRect(0, 0, 1164, 135);
  ctx.globalAlpha = 0.90;
  drawImageCover(ctx, img, 0, 0, 1164, 135, 0.5, 0.5);

  const grad = ctx.createLinearGradient(0, 0, 1164, 0);
  grad.addColorStop(0, 'rgba(22, 12, 40, 0.82)');
  grad.addColorStop(0.5, 'rgba(22, 12, 40, 0.36)');
  grad.addColorStop(1, 'rgba(22, 12, 40, 0.82)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1164, 135);

  const stripUrl = canvas.toDataURL('image/jpeg', 0.92);
  STRIP_ILLUSTRATION_CACHE.set(url, stripUrl);
  return stripUrl;
}

async function createCircularLogoDataUrl(logoUrl?: string): Promise<string | null> {
  const logoKey = logoUrl || '__default_om__';
  if (CIRCULAR_LOGO_CACHE.has(logoKey)) {
    return CIRCULAR_LOGO_CACHE.get(logoKey) ?? null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const img = logoUrl ? await loadHtmlImage(logoUrl) : null;

  const grad = ctx.createRadialGradient(120, 120, 18, 120, 120, 114);
  grad.addColorStop(0, '#FFFBEB');
  grad.addColorStop(0.65, '#F59E0B');
  grad.addColorStop(1, '#78350F');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(120, 120, 114, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 7;
  ctx.stroke();

  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 120, 102, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    drawImageCover(ctx, img, 18, 18, 204, 204);
    ctx.restore();
  } else {
    ctx.strokeStyle = '#FFFBEB';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(120, 33);
    ctx.lineTo(195, 165);
    ctx.lineTo(45, 165);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(120, 207);
    ctx.lineTo(195, 75);
    ctx.lineTo(45, 75);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#451A03';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OM', 120, 123);
  }

  const circUrl = canvas.toDataURL('image/png');
  CIRCULAR_LOGO_CACHE.set(logoKey, circUrl);
  return circUrl;
}

function build18PageMasterDossier(
  ctx: PdfExportContext,
  options?: { skipIndexPage?: boolean }
): PdfPageSpec[] {
  const { activeProfile, startFormatted, endFormatted, twelveMonths } = ctx;
  const m = calculateMulank(activeProfile.dob);
  const b = calculateBhagyank(activeProfile.dob);
  const mPlanet = PLANETARY_PROFILES[m] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[b] || PLANETARY_PROFILES[1];

  const nameAnalysis = analyzeName(activeProfile.name, m, b);
  const nPlanet = PLANETARY_PROFILES[nameAnalysis.chaldeanSingle] || PLANETARY_PROFILES[1];
  const nameSuggestions = generateNameCorrections(activeProfile.name, m, b);
  const topPerfectChoice =
    nameSuggestions.find((s) => s.isTopPerfectChoice) ||
    nameSuggestions[0] || {
      originalName: activeProfile.name,
      suggestedName: activeProfile.name,
      compoundNumber: nameAnalysis.totalChaldeanCompound,
      singleDigit: nameAnalysis.chaldeanSingle,
      compoundTitle: nameAnalysis.compoundInfo.title,
      changeExplanation: 'Current name spelling is already in auspicious cosmic harmony.',
      harmonyScore: nameAnalysis.harmonyScore,
      targetPlanet: nPlanet.planet,
      planetaryBlessing: `Naturally aligned with ${nPlanet.planet}.`,
      isTopPerfectChoice: true,
    };
  const mobileAnalysis = analyzeMobileNumber(activeProfile.mobile || '9876543210', m, b);
  const advMobile = generateAdvanceMobileReport(
    activeProfile.dob,
    activeProfile.mobile || '9876543210',
    m,
    b,
    activeProfile.tob || '09:30',
    activeProfile.lat ?? 28.6139,
    activeProfile.lng ?? 77.209
  );
  const panchang = getDailyPanchang(new Date(), m, b);
  const loShu = calculateLoShuGrid(activeProfile.dob, m, b, activeProfile.gender);
  const astro = calculateVedicAstrologyFromBirth(
    activeProfile.dob,
    activeProfile.tob || '09:30',
    activeProfile.lat ?? 28.6139,
    activeProfile.lng ?? 77.209
  );
  const career = calculateCareerAndAuraProfile(
    activeProfile.name,
    m,
    b,
    nameAnalysis.chaldeanSingle
  );

  // Combined Name + DOB + Mobile Triad Synergy & Career Result (from MobileAuditor)
  const namank = nameAnalysis.chaldeanSingle;
  const mobileAnk = advMobile.mobileTotal;
  const relMulankMobile = getPlanetaryRelationship(m, mobileAnk);
  const relBhagyankMobile = getPlanetaryRelationship(b, mobileAnk);
  const relNameMobile = getPlanetaryRelationship(namank, mobileAnk);
  const relMulankName = getPlanetaryRelationship(m, namank);
  const triadCompound =
    m + b + nameAnalysis.totalChaldeanCompound + advMobile.mobileCompound;
  const triadSingle = ((m + b + namank + mobileAnk - 1) % 9) + 1;
  const triadPlanet = PLANETARY_PROFILES[triadSingle] || PLANETARY_PROFILES[1];
  const mobPlanet = PLANETARY_PROFILES[mobileAnk] || PLANETARY_PROFILES[1];
  const nameMobileBonus =
    relNameMobile === 'friendly' ? 20 : relNameMobile === 'neutral' ? 14 : 7;
  const combinedTriadScore = Math.min(
    99,
    Math.max(
      38,
      Math.round(nameAnalysis.harmonyScore * 0.35 + mobileAnalysis.overallScore * 0.45 + nameMobileBonus)
    )
  );
  const combinedCareerProfile = calculateCareerAndAuraProfile(
    activeProfile.name,
    m,
    b,
    triadSingle
  );

  // Universal Numeric Vibration Verifier Samples (from NumericValidator)
  const vehicleValidation = validateNumericEntity('vehicle', 'DL 03 CD 2437', m, b);
  const flatValidation = validateNumericEntity('flat', 'Flat 302', m, b);
  const businessValidation = validateNumericEntity('business', activeProfile.name.toUpperCase() + ' ENTERPRISES', m, b);
  const mobileValidation = validateNumericEntity('mobile', activeProfile.mobile || '9876543210', m, b);

  const reportCreatedAtIso = new Date().toISOString();
  const reportYear = new Date(reportCreatedAtIso).getFullYear();
  const festivals = getPersonalizedIndianFestivals(
    activeProfile.name,
    m,
    b,
    nameAnalysis.chaldeanSingle,
    astro.rashi,
    reportYear >= 2026 && reportYear <= 2030 ? reportYear : 2026,
    reportCreatedAtIso,
    false
  );
  const islamicReport = calculateIslamicVedicReport({
    id: activeProfile.id,
    name: activeProfile.name,
    dob: activeProfile.dob,
    tob: activeProfile.tob,
    pob: activeProfile.pob,
    lat: activeProfile.lat,
    lng: activeProfile.lng,
    mobile: activeProfile.mobile,
  });
  const bestEvents12M = getBestUpcomingEventsNext12Months(
    {
      id: activeProfile.id,
      name: activeProfile.name,
      dob: activeProfile.dob,
      tob: activeProfile.tob,
      pob: activeProfile.pob,
      lat: activeProfile.lat,
      lng: activeProfile.lng,
      mobile: activeProfile.mobile,
    },
    reportCreatedAtIso
  );
  const { groom: groomProfile, bride: brideProfile } = resolveGroomAndBrideProfiles(activeProfile);
  const partnerMilan = calculateCompatibility(groomProfile, brideProfile);
  const groomNameAnalysis = analyzeName(
    groomProfile.name,
    partnerMilan.p1Mulank,
    partnerMilan.p1Bhagyank
  );
  const groomMulankPlanet = PLANETARY_PROFILES[partnerMilan.p1Mulank] || PLANETARY_PROFILES[1];
  const groomBhagyankPlanet = PLANETARY_PROFILES[partnerMilan.p1Bhagyank] || PLANETARY_PROFILES[1];
  const brideNameAnalysis = analyzeName(
    brideProfile.name,
    partnerMilan.p2Mulank,
    partnerMilan.p2Bhagyank
  );
  const brideMulankPlanet = PLANETARY_PROFILES[partnerMilan.p2Mulank] || PLANETARY_PROFILES[2];
  const brideBhagyankPlanet = PLANETARY_PROFILES[partnerMilan.p2Bhagyank] || PLANETARY_PROFILES[6];
  const gemRecommend = calculateGemstoneRecommendationsForProfile(
    {
      id: activeProfile.id,
      name: activeProfile.name,
      dob: activeProfile.dob,
      tob: activeProfile.tob || '09:30',
      pob: activeProfile.pob || 'New Delhi, India',
      lat: activeProfile.lat ?? 28.6139,
      lng: activeProfile.lng ?? 77.209,
      mobile: activeProfile.mobile,
      gender: activeProfile.gender,
    },
    68
  );
  const nameAndGrowthRatna = calculateNameAndPersonalGrowthRatnaRecommendation(
    {
      id: activeProfile.id,
      name: activeProfile.name,
      dob: activeProfile.dob,
      tob: activeProfile.tob || '09:30',
      pob: activeProfile.pob || 'New Delhi, India',
      lat: activeProfile.lat ?? 28.6139,
      lng: activeProfile.lng ?? 77.209,
      mobile: activeProfile.mobile,
      gender: activeProfile.gender,
    },
    activeProfile.originalName || activeProfile.name,
    68
  );
  const partnerRatnaRec = calculatePartnerMilanRatnaRecommendations(
    groomProfile,
    brideProfile,
    partnerMilan
  );
  const activeDasha =
    advMobile.dashaTimeline.find((d) => d.isCurrent) || advMobile.dashaTimeline[0];
  const activeDashaPlanet =
    PLANETARY_PROFILES[activeDasha?.dashaNumber || 6] || PLANETARY_PROFILES[6];
  const dashaNum = activeDasha?.dashaNumber || 6;
  const mulankDevanagari = SANSKRit_BEEJ_DEVANAGARI[m] || SANSKRit_BEEJ_DEVANAGARI[1];
  const bhagyankDevanagari = SANSKRit_BEEJ_DEVANAGARI[b] || SANSKRit_BEEJ_DEVANAGARI[3];
  const dashaDevanagari = SANSKRit_BEEJ_DEVANAGARI[dashaNum] || SANSKRit_BEEJ_DEVANAGARI[6];

  const lunar12Months = generate12MonthLunarAndAstroForecast(
    reportCreatedAtIso,
    astro.rashi,
    astro.nakshatra,
    m,
    b
  );
  const yogaPlan = calculateYogaPranayamaPlan({
    id: activeProfile.id,
    name: activeProfile.name,
    dob: activeProfile.dob,
    tob: activeProfile.tob || '09:30',
    pob: activeProfile.pob || 'New Delhi, India',
    lat: activeProfile.lat ?? 28.6139,
    lng: activeProfile.lng ?? 77.209,
    gender: activeProfile.gender,
    mobile: activeProfile.mobile || '9876543210',
    healthConcerns: activeProfile.healthConcerns || [],
  });

  const isClientOrAdminReport = !ctx.isHealerReport;
  const authenticRemediesPortalBullet =
    'Official Remedies Portal (www.tathastulight.com): Visit www.tathastulight.com for 100% genuine & authentic Rudraksha, Crystals, Home Cleansing Material, Precious & Semi-Precious Stones.';
  const clientOrAdminRemedyBullets = isClientOrAdminReport ? [authenticRemediesPortalBullet] : [];

  let savedParivarMembers: ParivarMemberRecord[] = Array.isArray(activeProfile.parivarMembers)
    ? activeProfile.parivarMembers
    : [];
  if (savedParivarMembers.length === 0 && typeof window !== 'undefined') {
    try {
      const rawLocal = localStorage.getItem(`tathastu_parivar_members_v1_${activeProfile.id}`);
      if (rawLocal) {
        const parsedLocal = JSON.parse(rawLocal) as ParivarMemberRecord[];
        if (Array.isArray(parsedLocal)) {
          savedParivarMembers = parsedLocal;
        }
      }
    } catch {
      // ignore
    }
  }
  const parivarReport = calculateParivarMilanReport(
    {
      name: activeProfile.name,
      dob: activeProfile.dob,
      tob: activeProfile.tob || '09:30',
      pob: activeProfile.pob || 'New Delhi, India',
      lat: activeProfile.lat ?? 28.6139,
      lng: activeProfile.lng ?? 77.209,
    },
    savedParivarMembers
  );

  const rawPages: PdfPageSpec[] = [
    // =========================================================================
    // MODULE 1: NAME & CAREER + EXECUTIVE BLUEPRINT + GEMSTONE + VALIDATOR (PAGES 1 TO 5)
    // =========================================================================
    // PAGE 1: Executive Birth Chart, Mulank/Bhagyank Blueprint, Daily Panchang & 8 Lo-Shu Planes
    {
      pageNumber: 1,
      moduleKey: 'nameAndCareer',
      chapterTag: 'CHAPTER 01 • EXECUTIVE VEDIC, CHALDEAN & PRANIC MASTER BLUEPRINT',
      title: 'EXECUTIVE BIRTH CHART, PANCHANG & 8 LO-SHU PLANES',
      subtitle: `${TATHASTU_APP_NAME} • ${TATHASTU_BRAND_NAME} (${TATHASTU_TAGLINE})`,
      bannerKey: 'name',
      sections: [
        {
          heading: '1. CLIENT BIRTH, ASTROLOGY & SPIRITUAL REGISTRATION LEDGER',
          subheading: `12-Month Report Validity: ${startFormatted} to ${endFormatted} • Spiritual Healer: ${ctx.healerDisplayName} (${ctx.brandTitle})`,
          table: {
            headers: ['Vedic / Numerology Pillar', 'Client Record', 'Cosmic Parameter', 'Calculated Vibration'],
            colWidths: [44, 52, 44, 50],
            rows: [
              ['Client Full Name & Gender', `${activeProfile.name} (${activeProfile.gender === 'female' ? 'Female / Bride' : 'Male / Groom'})`, 'Psychic Number (Mulank)', `Number ${m} (${mPlanet.planet} - ${mPlanet.sanskritName})`],
              ['Date & Time of Birth', `${activeProfile.dob} (${formatTime12HourAmPm(activeProfile.tob || '09:30')})`, 'Destiny Number (Bhagyank)', `Number ${b} (${bPlanet.planet} - ${bPlanet.sanskritName})`],
              ['Birth Place & Coordinates', `${activeProfile.pob || 'New Delhi, India'} (${(activeProfile.lat ?? 28.61).toFixed(2)}N, ${(activeProfile.lng ?? 77.21).toFixed(2)}E)`, 'Name Chaldean & Pythagorean', `Chaldean: ${nameAnalysis.totalChaldeanCompound}->${nameAnalysis.chaldeanSingle} | Pyth: ${nameAnalysis.totalPythagoreanCompound}->${nameAnalysis.pythagoreanSingle} (${nameAnalysis.harmonyScore}%)`],
              ['Mobile Number & Triad', activeProfile.mobile || 'N/A', 'Mobile & Combined Triad', `Mobile: ${mobileAnalysis.compoundNumber}->${mobileAnalysis.singleDigit} (${mobileAnalysis.overallScore}/100) | Triad: ${triadCompound}->${triadSingle} (${combinedTriadScore}%)`],
              ['Vedic Janma Rashi & Sun', `Moon: ${astro.rashi} | Sun: ${astro.sunSign}`, 'Janma Nakshatra & Pada', `${astro.nakshatra} (Pada ${astro.pada})`],
              ['Today Panchang & Hora', `${panchang.tithi} • ${panchang.vara} • ${panchang.currentHora}`, 'Primary Chakra & Aura', `${career.primaryChakra} • ${career.auraColor}`],
              ['Spiritual Healer Name', `Healer: ${ctx.healerDisplayName} (${ctx.brandTitle})`, 'Healer Contact & Details', `${ctx.healerDisplayMobile} | ${ctx.healerDisplayEmail}`],
            ],
          },
        },
        {
          heading: '2. DEEP THEORETICAL EXPLANATION OF MULANK, BHAGYANK & DAILY PANCHANG RESONANCE',
          subheading: `Mulank ${m} (${mPlanet.planet} - ${mPlanet.quality}) • Bhagyank ${b} (${bPlanet.planet} - ${bPlanet.quality})`,
          gridItems: [
            {
              title: `Psychic Mulank ${m}: ${mPlanet.planet} (${mPlanet.sanskritName})`,
              subtitle: `Deity: ${mPlanet.deity} • Element: ${mPlanet.element} • Gem: ${mPlanet.gemstone} • Metal: ${mPlanet.metal}`,
              body: `Core Traits: ${mPlanet.traits.join(', ')}. Friendly Numbers: ${mPlanet.friendlyNumbers.join(', ')} | Neutral: ${mPlanet.neutralNumbers.join(', ')} | Enemy/Avoid: ${mPlanet.enemyNumbers.join(', ') || 'None'}.`,
              highlight: `Beej Mantra: "${mPlanet.beejMantra}" | Lucky Days: ${mPlanet.luckyDays.join(', ')} | Color: ${mPlanet.luckyColor}`,
            },
            {
              title: `Destiny Bhagyank ${b}: ${bPlanet.planet} (${bPlanet.sanskritName})`,
              subtitle: `Deity: ${bPlanet.deity} • Element: ${bPlanet.element} • Gem: ${bPlanet.gemstone} • Metal: ${bPlanet.metal}`,
              body: `Core Traits: ${bPlanet.traits.join(', ')}. Friendly Numbers: ${bPlanet.friendlyNumbers.join(', ')} | Neutral: ${bPlanet.neutralNumbers.join(', ')} | Enemy/Avoid: ${bPlanet.enemyNumbers.join(', ') || 'None'}.`,
              highlight: `Beej Mantra: "${bPlanet.beejMantra}" | Lucky Days: ${bPlanet.luckyDays.join(', ')} | Color: ${bPlanet.luckyColor}`,
            },
          ],
          bullets: [
            `Today's Live Panchang & Muhurat: Tithi: ${panchang.tithi} | Vara: ${panchang.vara} | Active Hora: ${panchang.currentHora} | Auspicious Windows: ${panchang.auspiciousTimings.join(' • ')} | Avoid Rahu Kaal: ${panchang.rahuKaalWindow.start} - ${panchang.rahuKaalWindow.end}.`,
            `Today's Lucky Guidance: Lucky Numbers: ${panchang.luckyNumbers.join(', ')} | Lucky Color: ${panchang.luckyColorToday} | Daily Affirmation: "${panchang.dailyAffirmation}".`,
          ],
        },
        {
          heading: '3. COMPLETE 8 LO-SHU PLANES & RAJ YOGA COMPLETION MATRIX (FROM DASHBOARD)',
          table: {
            headers: ['Lo-Shu Plane / Raj Yoga', 'Numbers', 'Completion %', 'Complete Natal Plane Interpretation'],
            colWidths: [46, 26, 26, 96],
            rows: loShu.planes.map((pl) => [
              pl.name,
              pl.numbers.join(' - '),
              `${pl.completionPercentage}%`,
              pl.interpretation,
            ]),
          },
        },
      ],
    },

    // PAGE 2: Letter-by-Letter Breakdown, 3-Way Name Comparison (Real vs Selected A & B) & All Harmonized Spellings
    {
      pageNumber: 2,
      moduleKey: 'nameAndCareer',
      chapterTag: 'CHAPTER 02 • CHALDEAN & PYTHAGOREAN NAME NUMEROLOGY AUDIT & 3-WAY COMPARISON',
      title: 'LETTER-BY-LETTER NAME BREAKDOWN & 3-WAY COMPARISON',
      subtitle: `Active Profile Name: "${activeProfile.name}" • Real Name vs Selected Name A & B Comparison & 41-Day Activation`,
      bannerKey: 'name',
      sections: [
        {
          heading: `1. LETTER-BY-LETTER CHALDEAN & PYTHAGOREAN MATRIX FOR "${activeProfile.name.toUpperCase()}"`,
          subheading: `Chaldean Compound: ${nameAnalysis.totalChaldeanCompound} (Root ${nameAnalysis.chaldeanSingle} - ${nameAnalysis.compoundInfo.title}) • Pythagorean: ${nameAnalysis.totalPythagoreanCompound} (Root ${nameAnalysis.pythagoreanSingle}) • Cosmic Harmony Index: ${nameAnalysis.harmonyScore}%`,
          paragraphs: [
            `Active Name Verdict (${nameAnalysis.verdict}): ${nameAnalysis.compoundInfo.description} ${nameAnalysis.recommendation}`,
          ],
          letterGridCells: nameAnalysis.letters,
        },
        ...(nameAnalysis.isAuspicious &&
        !activeProfile.selectedNameA &&
        !activeProfile.selectedNameB
          ? [
              {
                heading: `2. PERFECT NAME FREQUENCY RESULT — NO SPELLING SUGGESTION REQUIRED`,
                subheading: `Active Name "${activeProfile.name}" Vibrates at Compound ${nameAnalysis.totalChaldeanCompound} -> Root ${nameAnalysis.chaldeanSingle} (${nameAnalysis.harmonyScore}% Cosmic Harmony)`,
                paragraphs: [
                  `Your current name spelling "${activeProfile.name}" (${nameAnalysis.compoundInfo.title}) is already in complete auspicious resonance with your Psychic Mulank ${m} (${mPlanet.planet}) and Destiny Bhagyank ${b} (${bPlanet.planet}). Because your name frequency is already perfect, only your complete vibration result is presented and no name spelling change or suggestion is required.`,
                ],
                bullets: [
                  `1. Official & Commercial Signature: Continue using "${activeProfile.name}" across all official, banking, digital, and commercial documents.`,
                  `2. 41-Day Sankalpa Reinforcement: Write "${activeProfile.name}" 41 times at sunrise during Shukla Paksha while chanting "${mPlanet.beejMantra}" to amplify its natural planetary blessings.`,
                  `3. Ascending Signature Vastu: Sign your name slanting 15 degrees upward (North-East rise) with a firm underline and a single stability dot below.`,
                ],
              },
            ]
          : [
              (() => {
                const realNameStr = (activeProfile.originalName || activeProfile.name || '').trim();
                const selNameAStr = (
                  activeProfile.selectedNameA ||
                  nameSuggestions[0]?.suggestedName ||
                  `${activeProfile.name}a`
                ).trim();
                const selNameBStr = (
                  activeProfile.selectedNameB ||
                  nameSuggestions[1]?.suggestedName ||
                  `${activeProfile.name}h`
                ).trim();
                const realRes = analyzeName(realNameStr, m, b);
                const nameARes = analyzeName(selNameAStr, m, b);
                const nameBRes = analyzeName(selNameBStr, m, b);
                return {
                  heading: `2. 3-WAY NAME COMPARISON: REAL NAME VS SELECTED NAME A & SELECTED NAME B`,
                  subheading: `Evaluating Drawbacks / Losses of Real Name vs Planetary Benefits / Gains of Selected Names`,
                  table: {
                    headers: [
                      'Comparison Slot & Name',
                      'Compound -> Root & Planet',
                      'Cosmic Harmony Index',
                      'Losses / Drawbacks (Real Name) vs Benefits / Gains (Selected Name)',
                    ],
                    colWidths: [42, 40, 32, 80],
                    rows: [
                      [
                        `1. Real / Original Name\n"${realNameStr}"${realNameStr.toUpperCase() === activeProfile.name.trim().toUpperCase() ? '\n[ACTIVE IN PROFILE]' : ''}`,
                        `Compound ${realRes.totalChaldeanCompound} -> Root ${realRes.chaldeanSingle}\n(${PLANETARY_PROFILES[realRes.chaldeanSingle]?.planet || 'Sun'})`,
                        `${realRes.harmonyScore}% Harmony\n(${realRes.verdict})\nM:${realRes.mulankRelation} | B:${realRes.bhagyankRelation}`,
                        realRes.harmonyScore < 75
                          ? `DRAWBACK / LOSS: Creates planetary friction (${realRes.mulankRelation} with Mulank ${m}), causing career delays, unspoken obstacles & financial leakage.`
                          : `BASELINE: ${realRes.compoundInfo.title}. Can be elevated further for faster commercial & aura breakthroughs.`,
                      ],
                      [
                        `2. Selected Name A\n"${selNameAStr}"${selNameAStr.toUpperCase() === activeProfile.name.trim().toUpperCase() ? '\n[ACTIVE IN PROFILE]' : ''}`,
                        `Compound ${nameARes.totalChaldeanCompound} -> Root ${nameARes.chaldeanSingle}\n(${PLANETARY_PROFILES[nameARes.chaldeanSingle]?.planet || 'Sun'})`,
                        `${nameARes.harmonyScore}% Harmony\n(${nameARes.verdict})\nM:${nameARes.mulankRelation} | B:${nameARes.bhagyankRelation}`,
                        `BENEFIT / GAIN: Aligns with ${PLANETARY_PROFILES[nameARes.chaldeanSingle]?.planet} (${nameARes.compoundInfo.title}), unlocking +${Math.max(5, nameARes.harmonyScore - realRes.harmonyScore)}% higher Cosmic Harmony, smoother cashflow & public authority.`,
                      ],
                      [
                        `3. Selected Name B\n"${selNameBStr}"${selNameBStr.toUpperCase() === activeProfile.name.trim().toUpperCase() ? '\n[ACTIVE IN PROFILE]' : ''}`,
                        `Compound ${nameBRes.totalChaldeanCompound} -> Root ${nameBRes.chaldeanSingle}\n(${PLANETARY_PROFILES[nameBRes.chaldeanSingle]?.planet || 'Sun'})`,
                        `${nameBRes.harmonyScore}% Harmony\n(${nameBRes.verdict})\nM:${nameBRes.mulankRelation} | B:${nameBRes.bhagyankRelation}`,
                        `BENEFIT / GAIN: Resonates with ${PLANETARY_PROFILES[nameBRes.chaldeanSingle]?.planet} (${nameBRes.compoundInfo.title}), strengthening destiny support (Bhagyank ${b}), brand magnetism & career elevation.`,
                      ],
                    ],
                  },
                };
              })(),
              {
                heading: `3. COMPLETE HARMONIZED NAME SPELLING SUGGESTIONS & 41-DAY ACTIVATION PROTOCOL`,
                subheading: `Engineered to Align with Friendly Planetary Roots (${mPlanet.friendlyNumbers.join(', ')}) of Mulank ${m} & Bhagyank ${b}`,
                gridItems: nameSuggestions.map((sug, i) => ({
                  title: `${i + 1}. ${sug.suggestedName} (Compound ${sug.compoundNumber} -> Root ${sug.singleDigit} • ${sug.targetPlanet})`,
                  subtitle: `${sug.compoundTitle} • Cosmic Harmony Index: ${sug.harmonyScore}%`,
                  body: `${sug.changeExplanation} Blessing: ${sug.planetaryBlessing}`,
                  highlight: `Activation: Write "${sug.suggestedName}" 41 times daily at sunrise in green/golden ink.`,
                })),
                bullets: [
                  `1. Digital & Social Profiles: Immediately update your display name on WhatsApp, Instagram, Facebook, LinkedIn, Email Signature, and Visiting Cards to "${activeProfile.name}".`,
                  `2. 41-Day Sankalpa Writing Sadhana: Write your chosen harmonized spelling "${activeProfile.name}" 41 times every morning during Shukla Paksha while chanting "${mPlanet.beejMantra}".`,
                  `3. Ascending Signature Vastu: Sign your name slanting 15 degrees upward (North-East rise) with a firm underline and a single stability dot below.`,
                ],
              },
            ]),
      ],
    },

    // PAGE 3: Complete Career & Business Suitability (Perfect, Good, Hostile, Professions & All 6 Remedies)
    {
      pageNumber: 3,
      moduleKey: 'nameAndCareer',
      chapterTag: 'CHAPTER 03 • COMPLETE CAREER, BUSINESS & 6-PILLAR AURA REMEDIES',
      title: 'COMPLETE CAREER, BUSINESS & 6-PILLAR REMEDIES',
      subtitle: `Ideal Professions, All 4 Supreme Businesses, All 4 Supportive Businesses, All 4 Hostile Sectors & All 6 Remedies`,
      bannerKey: 'name',
      sections: [
        {
          heading: `1. IDEAL PROFESSIONS, ALL 4 SUPREME BUSINESSES & ALL 4 SUPPORTIVE BUSINESS SECTORS`,
          subheading: `Primary Chakra: ${career.primaryChakra} • Aura Field: ${career.auraColor} • Favorable Professions: ${career.favorableProfessions.join(' • ')}`,
          table: {
            headers: ['Category & Sector Type', 'Business / Industry Field', 'Match / Planet', 'Astro-Numerological Reason & Execution Advice'],
            colWidths: [38, 46, 34, 76],
            rows: [
              ...career.perfectBusinesses.map((item) => [
                'SUPREME PERFECT\n(Top Priority)',
                item.field,
                `${item.successRate}% Match\n(${mPlanet.planet}/${bPlanet.planet})`,
                item.reason,
              ]),
              ...career.goodBusinesses.map((item) => [
                'GOOD SUPPORTIVE\n(Secondary)',
                item.field,
                `${item.successRate}% Match\n(Friendly)`,
                item.reason,
              ]),
              ...career.veryBadBusinesses.map((item) => [
                'HOSTILE SECTOR\n(Strictly Avoid)',
                item.field,
                `Conflict:\n${item.conflictPlanet}`,
                item.dangerReason,
              ]),
            ],
          },
        },
        {
          heading: '2. COMPLETE 6-PILLAR VEDIC, PRANIC, SOUND FREQUENCY (HZ) & FORTUNE REMEDIES (ALL 6 LIFE DOMAINS)',
          subheading: 'Complete Prescriptions with Solfeggio & Planetary Sound Frequencies (Hz) for Career, Business, Health, Relationships, Vastu & Spiritual Protection',
          gridItems: career.fortuneReadingRemedies.map((rem) => ({
            title: `[${rem.category.toUpperCase()}] ${rem.title} • Sound Frequency: ${rem.frequencyHz}`,
            subtitle: `Issue Addressed: ${rem.issueAddressed} | Tuning: ${rem.frequencyHz}`,
            body: rem.prescription,
            highlight: `Sound Therapy (${rem.frequencyHz}) + 43-day disciplined practice stabilizes ${career.primaryChakra} (${career.auraColor}).`,
          })),
          bullets: clientOrAdminRemedyBullets,
        },
      ],
    },

    // PAGE 4: Complete Vedic Gemstone (Ratna & Upratna) Recommendation Dossier (From Dashboard Gemstone Module)
    {
      pageNumber: 4,
      moduleKey: 'nameAndCareer',
      chapterTag: 'CHAPTER 04 • COMPLETE VEDIC GEMSTONE (RATNA & UPRATNA) RECOMMENDATION DOSSIER',
      title: 'VEDIC GEMSTONE (RATNA) RECOMMENDATION DOSSIER',
      subtitle: `5-Pillar Ratna Matrix (Life, Destiny, Rashi, Gochar Transit & Name Stones) • Ideal Weight: ${gemRecommend.idealRattiRange}`,
      bannerKey: 'name',
      sections: [
        {
          heading: `1. COMPLETE 5-PILLAR AUSPICIOUS GEMSTONE & UPRATNA PRESCRIPTION FOR ${activeProfile.name.toUpperCase()}`,
          subheading: `Calculated from Mulank ${m} (${mPlanet.planet}), Bhagyank ${b} (${bPlanet.planet}), Janma Rashi (${astro.rashi}) & Active 2026 Gochar Transits`,
          table: {
            headers: ['Ratna Pillar & Planet', 'Primary Gem (Ratna) & Upratna', 'Metal, Finger & Wearing Window', 'Beej Mantra, Purification & Core Benefits'],
            colWidths: [38, 46, 46, 64],
            rows: [
              [
                `1. Life Stone (Jeevan Ratna)\nMulank ${m} - ${gemRecommend.lifeStone.planet}`,
                `Primary: ${gemRecommend.lifeStone.primaryGem} (${gemRecommend.lifeStone.sanskritGem})\nUpratna: ${gemRecommend.lifeStone.upratna}\nWeight: ${gemRecommend.idealRattiRange}`,
                `Metal: ${gemRecommend.lifeStone.metal}\nFinger: ${gemRecommend.lifeStone.finger}\nDay: ${gemRecommend.lifeStone.wearingDay}\nTime: ${gemRecommend.lifeStone.auspiciousTimeWindow}`,
                `Mantra: ${gemRecommend.lifeStone.beejMantra}\nPurify: ${gemRecommend.lifeStone.purificationLiquid}\nBenefits: ${gemRecommend.lifeStone.coreBenefits.join(' ')}`,
              ],
              [
                `2. Destiny Stone (Bhagya Ratna)\nBhagyank ${b} - ${gemRecommend.destinyStone.planet}`,
                `Primary: ${gemRecommend.destinyStone.primaryGem} (${gemRecommend.destinyStone.sanskritGem})\nUpratna: ${gemRecommend.destinyStone.upratna}\nWeight: ${gemRecommend.idealRattiRange}`,
                `Metal: ${gemRecommend.destinyStone.metal}\nFinger: ${gemRecommend.destinyStone.finger}\nDay: ${gemRecommend.destinyStone.wearingDay}\nTime: ${gemRecommend.destinyStone.auspiciousTimeWindow}`,
                `Mantra: ${gemRecommend.destinyStone.beejMantra}\nPurify: ${gemRecommend.destinyStone.purificationLiquid}\nBenefits: ${gemRecommend.destinyStone.coreBenefits.join(' ')}`,
              ],
              [
                `3. Rashi & Nakshatra Stone\n${astro.rashi} (${astro.nakshatra})`,
                `Primary: ${gemRecommend.rashiNakshatraStone.primaryGem} (${gemRecommend.rashiNakshatraStone.sanskritGem})\nUpratna: ${gemRecommend.rashiNakshatraStone.upratna}`,
                `Metal: ${gemRecommend.rashiNakshatraStone.metal}\nFinger: ${gemRecommend.rashiNakshatraStone.finger}\nDay: ${gemRecommend.rashiNakshatraStone.wearingDay}\nPaksha: ${gemRecommend.rashiNakshatraStone.pakshaAndNakshatra}`,
                `Mantra: ${gemRecommend.rashiNakshatraStone.beejMantra}\nBenefits: ${gemRecommend.rashiNakshatraStone.coreBenefits.join(' ')}`,
              ],
              [
                `4. Gochar Transit Stone\n${gemRecommend.transitStone.planet} (2026 Transit)`,
                `Primary: ${gemRecommend.transitStone.primaryGem} (${gemRecommend.transitStone.sanskritGem})\nUpratna: ${gemRecommend.transitStone.upratna}`,
                `Metal: ${gemRecommend.transitStone.metal}\nFinger: ${gemRecommend.transitStone.finger}\nDay: ${gemRecommend.transitStone.wearingDay}\nTime: ${gemRecommend.transitStone.auspiciousTimeWindow}`,
                `Transit Reason: ${gemRecommend.transitReason}\nMantra: ${gemRecommend.transitStone.beejMantra}`,
              ],
              [
                `5. Name Vibration Stone\nNamank ${nameAnalysis.chaldeanSingle} - ${gemRecommend.nameStone.planet}`,
                `Primary: ${gemRecommend.nameStone.primaryGem} (${gemRecommend.nameStone.sanskritGem})\nUpratna: ${gemRecommend.nameStone.upratna}`,
                `Metal: ${gemRecommend.nameStone.metal}\nFinger: ${gemRecommend.nameStone.finger}\nDay: ${gemRecommend.nameStone.wearingDay}`,
                `Chakra: ${gemRecommend.nameStone.chakra}\nRay: ${gemRecommend.nameStone.colorRay}`,
              ],
            ],
          },
        },
        {
          heading: '2. ENEMY GEMSTONES STRICTLY TO AVOID & 5-STEP RATNA PRANA-PRATISHTHA VIDHI',
          gridItems: [
            {
              title: `Incompatible / Enemy Gemstones Strictly to Avoid`,
              subtitle: `Anti-Resonant with Mulank ${m} (${mPlanet.planet}) & Bhagyank ${b} (${bPlanet.planet})`,
              body:
                gemRecommend.stonesToAvoid.length > 0
                  ? gemRecommend.stonesToAvoid
                      .map((s) => `Avoid #${s.number} ${s.planet}: ${s.primaryGem} (${s.sanskritGem}) / ${s.upratna}`)
                      .join(' • ')
                  : 'Avoid wearing Blue Sapphire (Neelam) or Hessonite (Gomed) simultaneously with Ruby/Pearl without a 3-day pillow trial.',
              highlight: 'Never wear enemy planetary gemstones together on the same hand.',
            },
            {
              title: '5-Step Vedic Ratna Prana-Pratishtha (Energization Ritual)',
              subtitle: `Ideal Carat / Ratti Weight: ${gemRecommend.idealRattiRange} (${gemRecommend.idealCaratRange})`,
              body: '1. Ensure open-back setting so stone touches skin. 2. Dip ring in Panchamrit (Raw Cow Milk, Gangajal, Honey, Ghee, Tulsi) for 30 mins. 3. Wash with Gangajal & offer dhoop/diya. 4. Chant planet Beej Mantra 108 times. 5. Wear during morning Shukla Paksha Hora.',
              highlight: 'Replace Upratna (semi-precious crystals) every 2.5 years; natural primary Ratnas remain active lifelong.',
            },
          ],
          bullets: clientOrAdminRemedyBullets,
        },
      ],
    },

    // PAGE 4B: Precious Stone Recommendation — If You Do Not Want to Change Name & For Personal Growth (Complete Step-by-Step Guide)
    {
      pageNumber: 4,
      moduleKey: 'nameAndCareer',
      chapterTag: 'CHAPTER 04B • PRECIOUS STONE RECOMMENDATION — IF YOU DO NOT WANT TO CHANGE NAME & FOR PERSONAL GROWTH',
      title: 'PRECIOUS STONE — NO-NAME-CHANGE & PERSONAL GROWTH',
      subtitle: `Precious Stone Recommendation — If You Do Not Want to Change Name & For Personal Growth (Complete Step-by-Step Guide)`,
      bannerKey: 'name',
      sections: [
        {
          heading: `1. PRECIOUS STONE RECOMMENDATION — IF YOU DO NOT WANT TO CHANGE NAME & FOR PERSONAL GROWTH (${activeProfile.name.toUpperCase()})`,
          subheading: `Prescribed Stone Weight: ${nameAndGrowthRatna.noNameChangeStone.idealRattiRange} (${nameAndGrowthRatna.noNameChangeStone.idealCaratRange}) • Complete Metal, Finger, Hand, Day/Time & Purification Matrix`,
          table: {
            headers: [
              'Prescription Category & Planet',
              'Primary Precious Stone (Maharatna) & Upratna',
              '1. Finger & Hand | 2. Metal & Setting | 3. Day, Time & Nakshatra',
              '4. Panchamrit Purification & 5. Prana-Pratishtha Beej Mantra (108x)',
            ],
            colWidths: [40, 44, 54, 56],
            rows: [
              [
                `1. If You Do Not Want to Change Name\n(No-Name-Change Harmony Ratna)\nPlanet: ${nameAndGrowthRatna.noNameChangeStone.ratna.planet} (${nameAndGrowthRatna.noNameChangeStone.ratna.sanskritPlanet})\n[${nameAndGrowthRatna.noNameChangeStone.priorityBadge}]`,
                `Primary: ${nameAndGrowthRatna.noNameChangeStone.ratna.primaryGem} (${nameAndGrowthRatna.noNameChangeStone.ratna.sanskritGem})\nSubstitute (Upratna): ${nameAndGrowthRatna.noNameChangeStone.ratna.upratna}\nWeight: ${nameAndGrowthRatna.noNameChangeStone.idealRattiRange} (${nameAndGrowthRatna.noNameChangeStone.idealCaratRange})`,
                `1. Finger & Hand: ${nameAndGrowthRatna.noNameChangeStone.wearingHandAndFinger}\n2. Metal & Setting: ${nameAndGrowthRatna.noNameChangeStone.metalAndSetting}\n3. Day & Time: ${nameAndGrowthRatna.noNameChangeStone.dayAndMuhurat}\nNakshatra: ${nameAndGrowthRatna.noNameChangeStone.pakshaAndNakshatra}`,
                `4. Purification Liquid: ${nameAndGrowthRatna.noNameChangeStone.purificationIngredients} (Soak 21-30 mins before sunrise)\n5. Beej Mantra (108x): ${nameAndGrowthRatna.noNameChangeStone.beejMantra}\nChakra: ${nameAndGrowthRatna.noNameChangeStone.ratna.chakra}`,
              ],
              [
                `2. For Personal Growth & Career\n(Atma-Unnati Ratna)\nPlanet: ${nameAndGrowthRatna.personalGrowthStone.ratna.planet} (${nameAndGrowthRatna.personalGrowthStone.ratna.sanskritPlanet})\n[${nameAndGrowthRatna.personalGrowthStone.priorityBadge}]`,
                `Primary: ${nameAndGrowthRatna.personalGrowthStone.ratna.primaryGem} (${nameAndGrowthRatna.personalGrowthStone.ratna.sanskritGem})\nSubstitute (Upratna): ${nameAndGrowthRatna.personalGrowthStone.ratna.upratna}\nWeight: ${nameAndGrowthRatna.personalGrowthStone.idealRattiRange} (${nameAndGrowthRatna.personalGrowthStone.idealCaratRange})`,
                `1. Finger & Hand: ${nameAndGrowthRatna.personalGrowthStone.wearingHandAndFinger}\n2. Metal & Setting: ${nameAndGrowthRatna.personalGrowthStone.metalAndSetting}\n3. Day & Time: ${nameAndGrowthRatna.personalGrowthStone.dayAndMuhurat}\nNakshatra: ${nameAndGrowthRatna.personalGrowthStone.pakshaAndNakshatra}`,
                `4. Purification Liquid: ${nameAndGrowthRatna.personalGrowthStone.purificationIngredients} (Soak 21-30 mins before sunrise)\n5. Beej Mantra (108x): ${nameAndGrowthRatna.personalGrowthStone.beejMantra}\nChakra: ${nameAndGrowthRatna.personalGrowthStone.ratna.chakra}`,
              ],
            ],
          },
        },
        {
          heading: '2. COMPLETE STEP-BY-STEP WEARING RITUAL (RATNA DHARAN VIDHI) — NO-NAME-CHANGE & PERSONAL GROWTH STONES',
          subheading: 'Step 1 (Metal & Ring Crafting) through Step 5 (Wearing Finger & Time) + Astrological & Chaldean Justification',
          gridItems: [
            {
              title: `${nameAndGrowthRatna.noNameChangeStone.purposeTitle} — ${nameAndGrowthRatna.noNameChangeStone.ratna.primaryGem} (${nameAndGrowthRatna.noNameChangeStone.ratna.sanskritGem})`,
              subtitle: `${nameAndGrowthRatna.noNameChangeStone.purposeSubtitle} • Finger: ${nameAndGrowthRatna.noNameChangeStone.wearingHandAndFinger} • Metal: ${nameAndGrowthRatna.noNameChangeStone.ratna.metal}`,
              body: `Why Recommended: ${nameAndGrowthRatna.noNameChangeStone.astrologicalReason} Complete Step-by-Step Wearing Ritual: ${nameAndGrowthRatna.noNameChangeStone.howToWearStepByStep.join(' | ')}`,
              highlight: `Day & Time: ${nameAndGrowthRatna.noNameChangeStone.dayAndMuhurat} | Beej Mantra (108x): ${nameAndGrowthRatna.noNameChangeStone.beejMantra}`,
            },
            {
              title: `${nameAndGrowthRatna.personalGrowthStone.purposeTitle} — ${nameAndGrowthRatna.personalGrowthStone.ratna.primaryGem} (${nameAndGrowthRatna.personalGrowthStone.ratna.sanskritGem})`,
              subtitle: `${nameAndGrowthRatna.personalGrowthStone.purposeSubtitle} • Finger: ${nameAndGrowthRatna.personalGrowthStone.wearingHandAndFinger} • Metal: ${nameAndGrowthRatna.personalGrowthStone.ratna.metal}`,
              body: `Why Recommended: ${nameAndGrowthRatna.personalGrowthStone.astrologicalReason} Complete Step-by-Step Wearing Ritual: ${nameAndGrowthRatna.personalGrowthStone.howToWearStepByStep.join(' | ')}`,
              highlight: `Day & Time: ${nameAndGrowthRatna.personalGrowthStone.dayAndMuhurat} | Beej Mantra (108x): ${nameAndGrowthRatna.personalGrowthStone.beejMantra}`,
            },
          ],
          bullets: clientOrAdminRemedyBullets,
        },
      ],
    },

    // PAGE 5: Universal Numeric Vibration Verifier (Vehicle, Flat/House, Business, Mobile & Alias Audit)
    {
      pageNumber: 5,
      moduleKey: 'nameAndCareer',
      chapterTag: 'CHAPTER 05 • UNIVERSAL NUMERIC VIBRATION VERIFIER (VEHICLE, FLAT & BRAND)',
      title: 'UNIVERSAL NUMERIC VERIFIER (VEHICLE, FLAT & BRAND)',
      subtitle: `Cross-Reference Guide for Vehicle Plates, Flat/Villa Doors, Brand Names & Bank/Phone Numbers`,
      bannerKey: 'name',
      sections: [
        {
          heading: `1. UNIVERSAL NUMERIC VIBRATION VERIFIER FOR MULANK ${m} (${mPlanet.planet.toUpperCase()}) & BHAGYANK ${b} (${bPlanet.planet.toUpperCase()})`,
          subheading: `Friendly Roots: ${Array.from(new Set([m, b, ...mPlanet.friendlyNumbers, ...bPlanet.friendlyNumbers])).join(', ')} • Enemy Roots to Avoid: ${Array.from(new Set([...mPlanet.enemyNumbers, ...bPlanet.enemyNumbers])).join(', ') || '8, 4'}`,
          paragraphs: [
            `Every external number attached to your daily life—your Vehicle Registration Plate, Flat/House Door Number, Commercial Brand Name, and Bank Account/Phone Line—acts as a continuous frequency transmitter. Aligning these numbers with your Mulank ${m} and Bhagyank ${b} ensures road safety, domestic peace, and commercial prosperity.`,
          ],
          table: {
            headers: ['Entity Category', 'Sample / Reference Audit', 'Compound -> Root & Grade', 'Vedic Meaning, Alignment Advice & Vastu Fix'],
            colWidths: [38, 44, 38, 74],
            rows: [
              [
                '1. Vehicle Registration\n(Car / Two-Wheeler)',
                `Sample: ${vehicleValidation.inputValue}\nIdeal Roots: ${mPlanet.friendlyNumbers.join(', ')}`,
                `Compound ${vehicleValidation.compound} -> Root ${vehicleValidation.singleDigit}\n(${vehicleValidation.planet})\nGrade: ${vehicleValidation.resonanceRating} (${vehicleValidation.harmonyScore}%)`,
                `${vehicleValidation.meaning}. ${vehicleValidation.advice} Vastu Fix: Place a brass/copper Swastika, Om, or Hanumanji emblem on the dashboard and tie a yellow/red sacred thread.`,
              ],
              [
                '2. Flat / Villa / House\n(Door & Plot Number)',
                `Sample: ${flatValidation.inputValue}\nIdeal Compounds: 19, 23, 24, 32, 33, 37, 42`,
                `Compound ${flatValidation.compound} -> Root ${flatValidation.singleDigit}\n(${flatValidation.planet})\nGrade: ${flatValidation.resonanceRating} (${flatValidation.harmonyScore}%)`,
                `${flatValidation.meaning}. ${flatValidation.advice} Vastu Fix: Install a copper Sun or crystal Vastu pyramid above the main door threshold and write a small friendly digit inside the doorframe in kumkum/haldi.`,
              ],
              [
                '3. Business / Brand Name\n(Company & Trade)',
                `${businessValidation.inputValue}`,
                `Compound ${businessValidation.compound} -> Root ${businessValidation.singleDigit}\n(${businessValidation.planet})\nGrade: ${businessValidation.resonanceRating} (${businessValidation.harmonyScore}%)`,
                `${businessValidation.meaning}. ${businessValidation.advice} Best Corporate Compounds: 19, 23, 24, 32, 37, 41, 45, 46, 51.`,
              ],
              [
                '4. Registered Mobile\n(Telecom Line)',
                `${mobileValidation.inputValue}`,
                `Compound ${mobileValidation.compound} -> Root ${mobileValidation.singleDigit}\n(${mobileValidation.planet})\nGrade: ${mobileValidation.resonanceRating} (${mobileValidation.harmonyScore}%)`,
                `${mobileValidation.meaning}. ${mobileValidation.advice}`,
              ],
            ],
          },
        },
        {
          heading: '2. STEP-BY-STEP SELF-CALCULATION FORMULA & MASTER SELECTION RULES (VEHICLES, FLATS, PLOTS, BANK ACCOUNTS & BUSINESS / BRAND NAMES)',
          subheading: 'Chaldean Key (1 to 8): [1 = A,I,J,Q,Y] • [2 = B,K,R] • [3 = C,G,L,S] • [4 = D,M,T] • [5 = E,H,N,X] • [6 = U,V,W] • [7 = O,Z] • [8 = F,P]',
          paragraphs: [
            `How to Calculate Yourself (3 Easy Steps): Step 1: Convert every alphabet letter using the Chaldean Key above (1 to 8) and keep every numeric digit (0-9) as its face value. Step 2: Add all letter values + all digits together to obtain the Compound Total (e.g., DL 03 CD 2437 = D(4)+L(3)+0+3+C(3)+D(4)+2+4+3+7 = Compound 33). Step 3: Add the digits of the Compound Total until a single Root Digit (1 to 9) remains (3+3 = Root 6). Verify that the Root Digit matches your Friendly Planetary Roots (${Array.from(new Set([m, b, ...mPlanet.friendlyNumbers, ...bPlanet.friendlyNumbers])).join(', ')}).`,
          ],
          gridItems: [
            {
              title: 'A. Vehicle Number Plate & Delivery Selection Rule',
              subtitle: `Best Vehicle Sum Digits for ${activeProfile.name}: ${mPlanet.friendlyNumbers.join(', ')}`,
              body: `When booking a new car or two-wheeler, ensure both the Last 4 Digits (RTO series) and the Full Alphanumeric Plate Sum reduce to ${mPlanet.friendlyNumbers.join(' or ')}. Strictly avoid total 8 (Shani delays/accidents) or 4 (Rahu sudden mechanical repairs).`,
              highlight: `Best Vehicle Colours: ${mPlanet.luckyColor} & ${bPlanet.luckyColor}.`,
            },
            {
              title: 'B. Flat, Villa, Plot & Office Door Selection Rule',
              subtitle: `Auspicious Door & Plot Totals: ${Array.from(new Set([m, b, 3, 5, 6])).join(', ')}`,
              body: `Select a residence, plot, or office number whose digits sum to ${m}, ${b}, 3 (Jupiter growth), 5 (Mercury trade), or 6 (Venus luxury/peace). If living in an existing house with an unfriendly total, place a small brass friendly digit inside the doorframe.`,
              highlight: `Main Entrance Vastu: Keep the threshold well-lit and place a Swastika & Ganesha Toran.`,
            },
            {
              title: 'C. Business / Brand Name (Company & Trade) Selection Rule',
              subtitle: `Best Corporate Compounds: 19, 23, 24, 32, 37, 41, 45, 46, 51`,
              body: `Calculate your Company, Startup, Shop, or Trade Brand Name using the Chaldean 1-to-8 table. Ensure the total Compound lands on 19 (Surya Crown), 23 (Budh Royal Star), 24 (Shukra Wealth), 32, 37, 41, or 45 reducing to friendly roots (${mPlanet.friendlyNumbers.join(', ')}).`,
              highlight: `Current Brand Audit ("${businessValidation.inputValue}"): Compound ${businessValidation.compound} -> Root ${businessValidation.singleDigit} (${businessValidation.harmonyScore}%).`,
            },
            {
              title: 'D. Bank Account, Locker & Demat Selection Rule',
              subtitle: `Auspicious Banking Roots: 6 (Venus), 5 (Mercury), 3 (Jupiter), or ${b} (Bhagyank)`,
              body: `Route primary business revenues, savings, and investments through a bank account whose last 4 digits or full account number sum to Root ${b}, 6, 5, or 3. Avoid keeping long-term wealth in accounts reducing to enemy digits (${mPlanet.enemyNumbers.join(', ') || '8'}).`,
              highlight: `Write your Lucky Compound (24 or 51) in saffron/green ink on your passbook or locker folder.`,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // MODULE 2: ADVANCE MOBILE AUDIT, COMBINED TRIAD, VEDIC GRID, YOGAS & MAHA DASHA (PAGES 6 TO 10)
    // =========================================================================
    // PAGE 6: Advance Mobile Audit Part 1 — Core Mobile Prediction, All 9 Digit Pairs, Wallpaper & Examples
    {
      pageNumber: 6,
      moduleKey: 'advanceMobileAudit',
      chapterTag: 'CHAPTER 06 • ADVANCE MOBILE NUMEROLOGY & ALL 9 DIGIT PAIRS AUDIT',
      title: 'ADVANCE MOBILE AUDIT, ALL 9 PAIRS & WALLPAPER',
      subtitle: `Complete Telecom Diagnostic for ${activeProfile.mobile || 'N/A'} • Compound ${advMobile.mobileCompound} -> Root ${advMobile.mobileTotal} (${mobileAnalysis.overallScore}/100)`,
      bannerKey: 'mobile',
      sections: [
        {
          heading: `1. COMPLETE MOBILE PREDICTION, LUCKY/UNLUCKY ATTRIBUTES & WALLPAPER FOR ${activeProfile.mobile || 'N/A'}`,
          subheading: `Ruling Planet: ${advMobile.rulingPlanetName} • Recommended Totals: ${advMobile.recommendedMobileTotals.join(', ')} • Avoid Digits: ${advMobile.avoidNumbersInMobile.join(', ')}`,
          paragraphs: [
            `Core Mobile Vibration (Total ${advMobile.mobileTotal} - ${mobPlanet.planet}): ${advMobile.mobileTotalPrediction}`,
          ],
          table: {
            headers: ['Lucky Colours', 'Unlucky Colours', 'Lucky Numbers', 'Unlucky / Avoid', 'Neutral Numbers', 'Missing Digits'],
            colWidths: [34, 34, 30, 32, 30, 34],
            rows: [
              [
                advMobile.luckyColours.join(', '),
                advMobile.unluckyColours.join(', '),
                advMobile.luckyNumbers.join(', '),
                `Unlucky: ${advMobile.unluckyNumbers.join(', ')}\nAvoid in SIM: ${advMobile.avoidNumbersInMobile.join(', ')}`,
                advMobile.neutralNumbers.join(', '),
                advMobile.missingNumbersFormatted,
              ],
            ],
          },
        },
        {
          heading: `2. ALL ${advMobile.mobileCombinations.length} SEQUENTIAL 2-DIGIT CELLULAR PAIRS IN ${activeProfile.mobile || 'N/A'}`,
          subheading: `Complete Pair-by-Pair Evaluation + Overall Combined Pair Summary`,
          table: {
            headers: ['Pair # & Digits', 'Status', 'Complete Pair Frequency Prediction & Impact'],
            colWidths: [38, 30, 126],
            rows: advMobile.mobileCombinations.map((pa, idx) => [
              `Pair #${idx + 1}: [${pa.pair}]`,
              pa.status.toUpperCase(),
              pa.prediction,
            ]),
          },
          bullets: [
            ...advMobile.combinedPairPrediction,
          ],
        },
        {
          heading:
            advMobile.exampleRecommendedNumbers.length === 0
              ? '3. PERFECT MOBILE FREQUENCY RESULT & PRESCRIBED WALLPAPER'
              : '3. ALL 3 CONCRETE RECOMMENDED MOBILE EXAMPLES & WALLPAPER PRESCRIPTION',
          gridItems: [
            ...(advMobile.exampleRecommendedNumbers.length === 0
              ? [
                  {
                    title: `Perfect Mobile Frequency Result: ${activeProfile.mobile}`,
                    subtitle: `Compound ${advMobile.mobileCompound} -> Root ${advMobile.mobileTotal} (${mobileAnalysis.overallScore}% Cosmic Harmony)`,
                    body: `Your mobile number already vibrates in auspicious harmony with Mulank ${m} and Bhagyank ${b} with zero malefic pairs. Only your result is shown — no mobile number change or suggestion is required.`,
                    highlight: `Continue using ${activeProfile.mobile} as your primary personal and business line.`,
                  },
                ]
              : advMobile.exampleRecommendedNumbers.map((ex, idx) => ({
                  title: `Recommended SIM Example ${idx + 1}: ${ex.number}`,
                  subtitle: `Compound ${ex.compound} -> Root ${ex.total} (Harmonized with Mulank ${m} & Bhagyank ${b})`,
                  body: ex.benefit,
                  highlight: `Ideal structure when selecting a new business or personal SIM.`,
                }))),
            {
              title: `Prescribed Mobile Wallpaper: ${advMobile.recommendedWallpaper.title} (${advMobile.recommendedWallpaper.hindiTitle})`,
              subtitle: `Theme: ${advMobile.recommendedWallpaper.theme.toUpperCase()}`,
              body: advMobile.recommendedWallpaper.description,
              highlight: advMobile.recommendedWallpaper.placementAdvice,
            },
          ],
        },
      ],
    },

    // PAGE 7: Advance Mobile Audit Part 2 — Combined Name + D.O.B + Mobile Triad Synergy & Career Result
    {
      pageNumber: 7,
      moduleKey: 'advanceMobileAudit',
      chapterTag: 'CHAPTER 07 • COMBINED NAME + D.O.B + MOBILE TRIAD SYNERGY & CAREER RESULT',
      title: 'COMBINED NAME + DOB + MOBILE TRIAD & CAREER RESULT',
      subtitle: `Triad Master Vibration: ${triadCompound} -> Root ${triadSingle} (${triadPlanet.planet}) • Combined Synergy: ${combinedTriadScore}%`,
      bannerKey: 'mobile',
      sections: [
        {
          heading: `1. LIVE COMBINED NAME + D.O.B + MOBILE NUMBER TRIAD SYNERGY AUDIT`,
          subheading: `Synthesizing Name ("${activeProfile.name}"), DOB (${activeProfile.dob}) & Mobile (${activeProfile.mobile})`,
          paragraphs: [
            `When your spoken Name "${activeProfile.name}" (Compound ${nameAnalysis.totalChaldeanCompound} -> Root ${namank} - ${nPlanet.planet}), Birth Numbers Mulank ${m} (${mPlanet.planet}) & Bhagyank ${b} (${bPlanet.planet}), and Mobile Number ${activeProfile.mobile} (Compound ${advMobile.mobileCompound} -> Root ${mobileAnk} - ${mobPlanet.planet}) operate together, they generate a Combined Triad Master Vibration of Compound ${triadCompound} -> Root ${triadSingle} (${triadPlanet.planet} - ${triadPlanet.sanskritName}) with a ${combinedTriadScore}% Overall Synergy Score.`,
          ],
          table: {
            headers: ['Triad Pillar', 'Calculated Vibration & Planet', 'Inter-Pillar Relationship', 'Primary Chakra, Aura & Verdict'],
            colWidths: [40, 48, 50, 56],
            rows: [
              [
                '1. D.O.B Vibration\n(Mulank & Bhagyank)',
                `Mulank ${m} (${mPlanet.planet}) & Bhagyank ${b} (${bPlanet.planet})`,
                `Friendly Roots: ${mPlanet.friendlyNumbers.join(', ')}`,
                `Foundation of Natal Life Path & Destiny`,
              ],
              [
                '2. Name Vibration\n(Chaldean Namank)',
                `Compound ${nameAnalysis.totalChaldeanCompound} -> Root ${namank} (${nPlanet.planet})`,
                `Name-to-Mulank: ${relMulankName.toUpperCase()} (${nameAnalysis.harmonyScore}% Harmony)`,
                `${nameAnalysis.compoundInfo.title}`,
              ],
              [
                '3. Mobile Vibration\n(Mobile Ank)',
                `Compound ${advMobile.mobileCompound} -> Root ${mobileAnk} (${mobPlanet.planet})`,
                `Mobile-to-M: ${relMulankMobile.toUpperCase()} | Mobile-to-B: ${relBhagyankMobile.toUpperCase()} | Mobile-to-Name: ${relNameMobile.toUpperCase()}`,
                `Mobile Score: ${mobileAnalysis.overallScore}/100 (${mobileAnalysis.verdict})`,
              ],
              [
                '4. Combined Triad\n(Name + DOB + Mobile)',
                `Triad Compound ${triadCompound} -> Root ${triadSingle} (${triadPlanet.planet})`,
                `Combined Triad Score: ${combinedTriadScore}% (${combinedTriadScore >= 80 ? 'Raj-Yoga Triad' : 'Harmonious Triad'})`,
                `Chakra: ${combinedCareerProfile.primaryChakra} | Aura: ${combinedCareerProfile.auraColor}`,
              ],
            ],
          },
        },
        ...(advMobile.exampleRecommendedNumbers.length === 0 &&
        !activeProfile.selectedMobileA &&
        !activeProfile.selectedMobileB
          ? [
              {
                heading: '2. PERFECT MOBILE NUMBER FREQUENCY RESULT — NO SIM SUGGESTION REQUIRED',
                subheading: `Active Mobile ${activeProfile.mobile} Vibrates at Compound ${advMobile.mobileCompound} -> Root ${advMobile.mobileTotal} (${mobileAnalysis.overallScore}% Cosmic Harmony)`,
                paragraphs: [
                  `Your mobile number ${activeProfile.mobile} is already in complete auspicious harmony with your Mulank ${m} and Bhagyank ${b}. Because your mobile frequency is already perfect, only your complete Triad and Career result is shown and no SIM change or suggestion is required.`,
                ],
                bullets: [
                  `Combined Triad Supreme Career Sectors: ${combinedCareerProfile.perfectBusinesses.map((cb) => `${cb.field} (${cb.successRate}%)`).join(' • ')}`,
                  `Combined Favorable Professions: ${combinedCareerProfile.favorableProfessions.join(' • ')}`,
                ],
              },
            ]
          : [
              (() => {
                const origMob = (activeProfile.originalMobile || activeProfile.mobile || '9876543210').trim();
                const selMobA = (
                  activeProfile.selectedMobileA ||
                  advMobile.exampleRecommendedNumbers[0]?.number ||
                  `98${mPlanet.friendlyNumbers[0] || 5}651535${b}`
                ).trim();
                const selMobB = (
                  activeProfile.selectedMobileB ||
                  advMobile.exampleRecommendedNumbers[1]?.number ||
                  `98691656${m}6`
                ).trim();
                const origMobRes = analyzeMobileNumber(origMob, m, b);
                const mobARes = analyzeMobileNumber(selMobA, m, b);
                const mobBRes = analyzeMobileNumber(selMobB, m, b);

                return {
                  heading: '2. 3-WAY MOBILE COMPARISON: CLIENT ORIGINAL NUMBER VS SELECTED NUMBER A & B',
                  subheading: `Cosmic Harmony Index % & Losses / Drawbacks of Original Number vs Benefits / Gains of Selected Numbers`,
                  table: {
                    headers: [
                      'Mobile Slot & Number',
                      'Compound -> Root & Planet',
                      'Cosmic Harmony Index',
                      'Losses / Drawbacks (Original) vs Benefits / Gains (Selected A & B)',
                    ],
                    colWidths: [42, 40, 32, 80],
                    rows: [
                      [
                        `1. Client Original Number\n${origMob}${origMob === (activeProfile.mobile || '').trim() ? '\n[ACTIVE IN PROFILE]' : ''}`,
                        `Compound ${origMobRes.compoundNumber} -> Root ${origMobRes.singleDigit}\n(${PLANETARY_PROFILES[origMobRes.singleDigit]?.planet || 'Sun'})`,
                        `${origMobRes.overallScore}% Harmony\n(${origMobRes.verdict})`,
                        origMobRes.toxicPairsFound.length > 0
                          ? `DRAWBACK / LOSS: Contains hostile cellular pairs (${origMobRes.toxicPairsFound.map((tp) => tp.pair).join(', ')}) causing payment blocks, stress & communication friction.`
                          : `BASELINE: Root ${origMobRes.singleDigit} gives ${origMobRes.overallScore}% Cosmic Harmony Index; upgrading elevates business cashflow.`,
                      ],
                      [
                        `2. Selected Number A\n${selMobA}${selMobA === (activeProfile.mobile || '').trim() ? '\n[ACTIVE IN PROFILE]' : ''}`,
                        `Compound ${mobARes.compoundNumber} -> Root ${mobARes.singleDigit}\n(${PLANETARY_PROFILES[mobARes.singleDigit]?.planet || 'Mercury'})`,
                        `${mobARes.overallScore}% Harmony\n(${mobARes.verdict})`,
                        `BENEFIT / GAIN: Aligns with ${PLANETARY_PROFILES[mobARes.singleDigit]?.planet} (Root ${mobARes.singleDigit}), accelerating B2B inquiries, daily cashflow & positive client conversions.`,
                      ],
                      [
                        `3. Selected Number B\n${selMobB}${selMobB === (activeProfile.mobile || '').trim() ? '\n[ACTIVE IN PROFILE]' : ''}`,
                        `Compound ${mobBRes.compoundNumber} -> Root ${mobBRes.singleDigit}\n(${PLANETARY_PROFILES[mobBRes.singleDigit]?.planet || 'Venus'})`,
                        `${mobBRes.overallScore}% Harmony\n(${mobBRes.verdict})`,
                        `BENEFIT / GAIN: Harmonizes with Destiny ${b} & Mulank ${m}, attracting luxury assets, executive authority & family peace.`,
                      ],
                    ],
                  },
                };
              })(),
              {
                heading: '3. COMBINED TRIAD CAREER SECTORS & VIRTUAL LUCKY SIM ARCHITECT (ALL 4 GOALS)',
                subheading: `Combined Favorable Professions: ${combinedCareerProfile.favorableProfessions.join(' • ')}`,
                table: {
                  headers: ['Life / Business Objective', 'Target Root Totals', 'Ideal 10-Digit Compounds', 'Auspicious Terminal Pairings & Benefit'],
                  colWidths: [40, 32, 52, 70],
                  rows: [
                    ['1. Business Expansion', '1 or 5', '23, 24, 32, 33, 37, 41, 42, 45, 46, 50, 51', 'End with ...15, ...19, ...23, ...37, ...51, ...55 (Sun & Mercury high-speed deal closure)'],
                    ['2. Wealth & Luxury', '6 or 1', '19, 24, 33, 37, 42, 46, 51', 'End with ...15, ...24, ...33, ...51, ...56 (Venus & Sun uninterrupted cashflow & assets)'],
                    ['3. Executive Leadership', '1 or 3', '19, 21, 23, 27, 37, 41, 51', 'End with ...19, ...23, ...31, ...37, ...51 (Sun & Jupiter high authority & institutional respect)'],
                    ['4. Peace & Spiritual Grace', '2, 3 or 7', '20, 24, 25, 30, 32, 42, 47', 'End with ...23, ...25, ...31, ...37 (Moon, Jupiter & Ketu emotional serenity & family peace)'],
                  ],
                },
              },
            ]),
      ],
    },

    // PAGE 8: Advance Mobile Audit Part 3 — Sacred 3x3 Square Lo-Shu Grid, Sepharial Vedic Grid, Present Numbers & All Chart Yogas
    {
      pageNumber: 8,
      moduleKey: 'advanceMobileAudit',
      chapterTag: 'CHAPTER 08 • SACRED 3x3 LO-SHU GRID, PRESENT NUMBERS & ALL CHART YOGAS',
      title: '3x3 LO-SHU GRID, PRESENT NUMBERS & ALL YOGAS',
      subtitle: `Square 3x3 Lo-Shu Matrix, Sepharial Vedic Grid ([3,1,9]/[6,7,5]/[2,8,4]), All Present Number Readings & All Chart Yogas`,
      bannerKey: 'mobile',
      sections: [
        {
          heading: `1. SACRED 3x3 VEDIC LO-SHU CHAKRA SQUARE MATRIX (DOB: ${activeProfile.dob})`,
          subheading: `Present Digits in Chart: [${advMobile.presentNumberReadings.map((r) => `${r.number} (${r.count}x)`).join(', ')}] • Missing Digits: [${loShu.missingNumbers.map((mItem) => mItem.number).join(', ') || 'None'}]`,
          loShuSquareMatrix: {
            gridCounts: loShu.grid,
            mulank: m,
            bhagyank: b,
            dob: activeProfile.dob,
          },
        },
        {
          heading: '2. COMPLETE PRESENT NUMBER READINGS & REPETITION IMPACT (FROM SEPHARIAL VEDIC GRID)',
          subheading: 'Classical Vedic Grid Layout: Top Row [3 - 1 - 9] • Middle Row [6 - 7 - 5] • Bottom Row [2 - 8 - 4]',
          table: {
            headers: ['Present Digit & Frequency', 'Ruling Planet', 'Complete Natal Trait & Repetition Impact Explanation'],
            colWidths: [40, 38, 116],
            rows: advMobile.presentNumberReadings.map((reading) => [
              `${reading.heading}\n(Frequency: ${reading.count}x)`,
              `${PLANETARY_PROFILES[reading.number]?.planet} (${PLANETARY_PROFILES[reading.number]?.sanskritName})`,
              `${reading.description}${reading.repetitionNote ? `\nRepetition Impact (${reading.count}x): ${reading.repetitionNote}` : ''}`,
            ]),
          },
        },
        {
          heading: `3. ALL ACTIVE 2-DIGIT & 3-DIGIT CHART COMBINATION YOGAS (${advMobile.chartCombinations.length} ACTIVE YOGAS)`,
          gridItems: advMobile.chartCombinations.map((combo) => ({
            title: `${combo.title} (${combo.combination})`,
            subtitle: `Active ${combo.type} in Your Birth & Mobile Matrix`,
            body:
              combo.paragraphs.length > 1
                ? combo.paragraphs.slice(0, -1).join(' ')
                : combo.paragraphs[0] || '',
            highlight:
              combo.paragraphs.length > 1
                ? combo.paragraphs[combo.paragraphs.length - 1]
                : 'Keep this yoga energized through ethical discipline and gratitude.',
          })),
        },
      ],
    },

    // PAGE 9: Advance Mobile Audit Part 4 — Complete Missing Karmic Numbers Remedies (All Missing Digits + Lo-Shu Planetary Remedies)
    {
      pageNumber: 9,
      moduleKey: 'advanceMobileAudit',
      chapterTag: 'CHAPTER 09 • COMPLETE MISSING KARMIC NUMBERS & LO-SHU PLANETARY REMEDIES',
      title: 'ALL MISSING NUMBERS: WEAR, VASTU & RITUAL REMEDIES',
      subtitle: `Complete Wear, Vastu & Feng Shui, Sacred Rituals, Rudraksha/Crystal & Beej Mantras for All Missing Numbers (${advMobile.missingNumbersList.join(', ') || 'None'})`,
      bannerKey: 'mobile',
      sections: [
        {
          heading: `1. COMPLETE MISSING KARMIC NUMBERS REMEDIES (${advMobile.missingNumbersList.join(', ') || 'ALL DIGITS PRESENT'})`,
          subheading: '100% Complete Wear (Ratna/Rudraksha/Mala), Vastu & Feng Shui, Sacred Rituals (Upay), Sound Frequency (Hz) & Lo-Shu Remedies',
          table: {
            headers: ['Missing Digit, Planet & Direction', '1. Wear (Ratna, Rudraksha & Crystal)', '2. Vastu & Feng Shui Placement', '3. Sacred Rituals, Sound Frequency (Hz) & Mantra'],
            colWidths: [38, 48, 48, 60],
            rows: advMobile.missingNumberRemedies.map((mr) => {
              const loShuDetail = LO_SHU_VEDIC_REMEDIES_DB[mr.number];
              return [
                `Missing #${mr.number}\n${mr.planet}\nDir: ${loShuDetail?.direction.split('(')[0] || 'Vastu'}\nChakra: ${loShuDetail?.chakra.split('(')[0] || ''}`,
                `${mr.wear.join(' ')}\nCrystal: ${loShuDetail?.rudrakshaAndCrystal || ''}`,
                `${mr.vastuAndFengShui.join(' ')}\nVastu: ${loShuDetail?.vastuRemedy || ''}`,
                `Rituals: ${mr.rituals.join(' ')}\nSound Freq: ${mr.soundFrequency}\nMantra: ${loShuDetail?.beejMantra || ''} (${loShuDetail?.mantraProtocol || ''})`,
              ];
            }),
          },
        },
        {
          heading: '2. PSYCHOLOGICAL & KARMIC IMPACT OF MISSING NUMBERS, SOUND FREQUENCY & DAILY BALANCING PROTOCOL',
          gridItems: advMobile.missingNumberRemedies.map((mr) => {
            const loShuDetail = LO_SHU_VEDIC_REMEDIES_DB[mr.number];
            return {
              title: `Missing Number ${mr.number} (${mr.planet}) — Karmic Void & Sound Frequency`,
              subtitle: `Deity: ${loShuDetail?.deity || mr.planet} • Element: ${loShuDetail?.element || ''} • Sound: ${mr.soundFrequency}`,
              body: `${loShuDetail?.missingImpact || ''} Sound Therapy: Listen to ${mr.soundFrequency} for 15 mins daily.`,
              highlight: `Daily Karma & Daan: ${loShuDetail?.dailyKarmaAndDaan || mr.rituals[0] || ''}`,
            };
          }),
          bullets: clientOrAdminRemedyBullets,
        },
      ],
    },

    // PAGE 10: Advance Mobile Audit Part 5 — Complete Vedic Astrological (120-Yr Vimshottari) & Numerology (45-Yr) Maha Dasha Timeline
    {
      pageNumber: 10,
      moduleKey: 'advanceMobileAudit',
      chapterTag: 'CHAPTER 10 • COMPLETE VEDIC ASTROLOGICAL (120-YR VIMSHOTTARI) & NUMEROLOGY (45-YR) MAHA DASHA TIMELINE',
      title: 'COMPLETE VEDIC & ASTROLOGICAL MAHA DASHA TIMELINE',
      subtitle: `120-Yr Parashari Vimshottari (${advMobile.janmaNakshatraSummary?.nakshatra || astro.nakshatra} Pada ${advMobile.janmaNakshatraSummary?.pada || 1}) & 45-Yr Vedic Numerology Cycle (Starts from ★ Present Active Cycle)`,
      bannerKey: 'mobile',
      sections: [
        ...(advMobile.vimshottariDashaTimeline && advMobile.janmaNakshatraSummary
          ? [
              {
                heading: `1. 120-YEAR CLASSICAL PARASHARI VIMSHOTTARI MAHA DASHA TIMELINE (JANMA NAKSHATRA: ${advMobile.janmaNakshatraSummary.nakshatra.toUpperCase()} PADA ${advMobile.janmaNakshatraSummary.pada})`,
                subheading: `Sidereal Moon Longitude: ${advMobile.janmaNakshatraSummary.moonDegreeSidereal.toFixed(2)}° • Birth Nakshatra Lord: ${advMobile.janmaNakshatraSummary.birthDashaLord} • Balance at Birth (Bhogya): ${advMobile.janmaNakshatraSummary.birthDashaBalanceLabel}${advMobile.vimshottariPastCycles && advMobile.vimshottariPastCycles.length > 0 ? ` • Past Completed Since Birth: ${advMobile.vimshottariPastCycles.map((p) => `${p.planet} (${p.startDate} to ${p.endDate})`).join(', ')}` : ''}`,
                table: {
                  headers: [
                    'Vimshottari Maha Dasha Lord',
                    'Exact Start Date -> End Date (Duration)',
                    'Status & Active Antardasha (Bhukti)',
                    'Vedic Parashari Planetary Period Interpretation',
                  ],
                  colWidths: [40, 44, 46, 64],
                  rows: advMobile.vimshottariDashaTimeline.map((vd, idx) => [
                    `${vd.isCurrent ? '★ ' : `${idx + 1}. `}${vd.planet}\n(${vd.sanskritName} • #${vd.dashaNumber})`,
                    `${vd.startDate} to ${vd.endDate}\n(${vd.durationYears} Years)`,
                    vd.isCurrent
                      ? `★ PRESENT ACTIVE CYCLE\n${vd.activeAntardasha || 'Current Bhukti Active'}`
                      : `UPCOMING CYCLE #${idx + 1}`,
                    vd.paragraphs.join(' ') || '',
                  ]),
                },
              },
            ]
          : []),
        {
          heading: `2. 45-YEAR VEDIC NUMEROLOGY PROGRESSIVE MAHA DASHA TIMELINE — STARTING FROM ★ PRESENT ACTIVE CYCLE (${new Date().getFullYear()})`,
          subheading: `★ 1. Present Active Cycle: Dasha #${activeDasha.dashaNumber} ${activeDasha.planet} (${activeDasha.startDate} to ${activeDasha.endDate} • ${activeDasha.durationYears} Yrs${activeDasha.activeAntardasha ? ` • ${activeDasha.activeAntardasha}` : ''}) • 2. Next Upcoming: Dasha #${advMobile.dashaTimeline[1]?.dashaNumber || activeDasha.dashaNumber} ${advMobile.dashaTimeline[1]?.planet || ''} (${advMobile.dashaTimeline[1]?.startDate || ''} Onward) • 3. Past Completed Since Birth (${activeProfile.dob}): ${(advMobile.pastDashaCycles || []).map((d) => `#${d.dashaNumber} (${d.startDate} to ${d.endDate})`).join(', ') || 'Current Cycle is First Since Birth'}`,
          gridItems: advMobile.dashaTimeline.map((dasha, idx) => ({
            title: `Cycle #${idx + 1}: Dasha #${dasha.dashaNumber} — ${dasha.planet} (${dasha.sanskritName}) [${dasha.durationYears} Years]`,
            subtitle: `${dasha.startDate} to ${dasha.endDate} • ${
              dasha.isCurrent
                ? '★ PRESENT CYCLE (ACTIVE NOW — TIMELINE START)'
                : 'UPCOMING CYCLE (FUTURE PROGRESSION)'
            }`,
            body: dasha.paragraphs.join(' '),
            highlight: dasha.isCurrent
              ? `★ Active Now (${dasha.startDate} to ${dasha.endDate}): ${dasha.activeAntardasha || 'Primary planetary period governing current career, wealth & life decisions.'}`
              : `Upcoming Period (${dasha.startDate} to ${dasha.endDate}): Sequential ${dasha.planet} Maha Dasha activation.`,
          })),
        },
      ],
    },

    // =========================================================================
    // MODULE 3: 12-MONTH FORECAST & 7-DAY WEEKLY DECISION COMPASS (PAGES 11 TO 13)
    // =========================================================================
    // PAGE 11
    {
      pageNumber: 11,
      moduleKey: 'forecast12Months',
      chapterTag: 'CHAPTER 11 • 12-MONTH PERSONALIZED FORECAST (MONTHS 1 TO 6)',
      title: '12-MONTH PERSONALIZED FORECAST (MONTHS 1 TO 6)',
      subtitle: `First 6-Month Planetary & Pranic Roadmap (${startFormatted} - ${endFormatted})`,
      bannerKey: 'banner',
      sections: [
        {
          heading: `1. THEORETICAL METHODOLOGY OF PERSONAL MONTH CYCLES (MONTHS 1 TO 6)`,
          subheading: `Synchronizing Mulank ${m} (${mPlanet.planet}) & Bhagyank ${b} (${bPlanet.planet}) with Monthly Ephemeris`,
          paragraphs: [
            `In Vedic-Chaldean time calculation, each calendar month interacts with your birth numbers to produce a Personal Month vibration (1 to 9). The first six months of your report period (${startFormatted} to ${endFormatted}) establish the foundation for career acceleration, financial agreements, debt reduction, and family peace. Schedule high-stakes signings on the Lucky Days listed inside each monthly box below.`,
          ],
          gridItems: twelveMonths.slice(0, 6).map((item) => ({
            title: `${item.monthLabel} (${item.periodRange})`,
            subtitle: `Personal Month ${item.personalMonthNum} • ${item.rulingPlanet} • Lucky: ${item.luckyDays}`,
            body: `${item.forecastSummary} ${item.transitHighlight}`,
            highlight: `${item.moonPhaseDates}`,
          })),
          bullets: [
            `Shukla Purnima & Monthly Sankalpa Remedy (Months 1-6): On every Purnima window listed above, light a pure cow-ghee lamp in the North-East corner at sunset, chant "${mPlanet.beejMantra}" 108 times, and offer white sweets or grain charity.`,
          ],
        },
      ],
    },

    // PAGE 12
    {
      pageNumber: 12,
      moduleKey: 'forecast12Months',
      chapterTag: 'CHAPTER 12 • 12-MONTH PERSONALIZED FORECAST (MONTHS 7 TO 12)',
      title: '12-MONTH PERSONALIZED FORECAST (MONTHS 7 TO 12)',
      subtitle: `Second 6-Month Asset Consolidation & Family Harmony Blueprint (${startFormatted} - ${endFormatted})`,
      bannerKey: 'banner',
      sections: [
        {
          heading: `1. SECOND HALF-YEAR CONSOLIDATION & WEALTH RETENTION THEORY (MONTHS 7 TO 12)`,
          subheading: `Long-Term Property, Investment Compounding & Spiritual Shielding for ${astro.rashi}`,
          paragraphs: [
            `During Months 7 to 12 of your annual cycle, planetary transits shift emphasis toward long-term asset creation, real-estate or gold accumulation, interstate/digital trade growth, and protective Pitru/Graha Shanti. Avoid speculative lending during Rahu Kaal and fortify your home Vastu on Amavasya dates.`,
          ],
          gridItems: twelveMonths.slice(6, 12).map((item) => ({
            title: `${item.monthLabel} (${item.periodRange})`,
            subtitle: `Personal Month ${item.personalMonthNum} • ${item.rulingPlanet} • Lucky: ${item.luckyDays}`,
            body: `${item.forecastSummary} ${item.transitHighlight}`,
            highlight: `${item.moonPhaseDates}`,
          })),
          bullets: [
            `Annual Wealth & Protection Siddha Protocol (Months 7-12): Keep an energized Bhojpatra or copper ${bPlanet.planet} Yantra in your cash locker/wallet and recite "${bPlanet.beejMantra}" (108x) & "${mPlanet.beejMantra}" (27x) daily before starting work.`,
          ],
        },
      ],
    },

    // PAGE 13: 7-Day Weekly Cosmic Decision Compass & Per-Day Forecast with Mantra Chants
    {
      pageNumber: 13,
      moduleKey: 'forecast12Months',
      chapterTag: 'CHAPTER 13 • 7-DAY WEEKLY PER-DAY FORECAST, DECISION INDEX & MANTRA CHANTS',
      title: '7-DAY WEEKLY PER-DAY FORECAST & MANTRA CHANTS',
      subtitle: `Per-Day Planetary Rhythm, Career/Love/Vitality Scores & Mantras Applicable Across Next 12 Months (${startFormatted} - ${endFormatted})`,
      bannerKey: 'banner',
      sections: [
        {
          heading: '1. DEEP THEORY OF VARA-JYOTISH (THE 7-DAY PLANETARY BIO-RHYTHM & DECISION COMPASS)',
          subheading: 'Complete Weekday Shubh Windows, Rahu Kaal, Career/Love/Health Guidance & Daily Vedic Beej Mantras',
          paragraphs: [
            `In Vedic Vara-Shastra, the seven days of the week are ruled sequentially by Surya (Sun), Chandra (Moon), Mangal (Mars), Budh (Mercury), Guru (Jupiter), Shukra (Venus), and Shani (Saturn). Aligning your daily tasks with the Shubh Hora window of each day while avoiding Rahu Kaal and chanting the daily Vedic Planetary Beej Mantra creates an unbreakable 365-day spiritual shield.`,
          ],
          table: {
            headers: ['Weekday & Graha', 'Shubh Window, Rahu Kaal & Color', 'Career, Love & Vitality Per-Day Forecast', 'Daily Vedic Beej Mantra & Sankalpa Remedy'],
            colWidths: [36, 44, 58, 56],
            rows: [
              [
                'Sunday (Ravivar)\nSurya / Sun',
                'Shubh: 08:15-12:15\nAvoid Rahu: 16:30-18:00\nColor: Ruby / Gold',
                'Career: Peak day for government approvals, executive authority & pitches.\nLove & Vitality: High solar prana; honor father & elders.',
                'Mantra: Om Hram Hreem Hroum Sah Suryaya Namah (108x)\nRemedy: Offer copper lota water Arghya to rising Sun.',
              ],
              [
                'Monday (Somvar)\nChandra / Moon',
                'Shubh: 09:00-11:45\nAvoid Rahu: 07:30-09:00\nColor: White / Silver',
                'Career: Auspicious for cash liquidity, public relations & travel.\nLove & Vitality: Deep emotional warmth; stay well-hydrated.',
                'Mantra: Om Shram Shreem Shroum Sah Chandraya Namah (108x)\nRemedy: Offer raw milk & white chandan to Shiva Lingam.',
              ],
              [
                'Tuesday (Mangalvar)\nMangal / Mars',
                'Shubh: 10:30-13:30\nAvoid Rahu: 15:00-16:30\nColor: Coral Red',
                'Career: Ideal for land/property inspection, debt repayment & legal victory.\nLove & Vitality: High physical stamina; practice pranayama.',
                'Mantra: Om Kram Kreem Kroum Sah Bhaumaya Namah (108x)\nRemedy: Recite Hanuman Chalisa & donate red masoor dal.',
              ],
              [
                'Wednesday (Budhvar)\nBudh / Mercury',
                'Shubh: 09:15-12:00\nAvoid Rahu: 12:00-13:30\nColor: Emerald Green',
                'Career: Best day for commercial contracts, banking, IT & trade.\nLove & Vitality: Articulate communication; calm nervous system.',
                'Mantra: Om Bram Breem Broum Sah Budhaya Namah (108x)\nRemedy: Offer green Durva grass to Lord Ganesha.',
              ],
              [
                'Thursday (Guruvar)\nBrihaspati / Jupiter',
                'Shubh: 07:30-11:30\nAvoid Rahu: 13:30-15:00\nColor: Golden Yellow',
                'Career: Supreme Siddha day for gold/wealth investments & consulting.\nLove & Vitality: Family harmony, marriage talks & spiritual grace.',
                'Mantra: Om Gram Greem Groum Sah Gurave Namah (108x)\nRemedy: Apply kesar/turmeric tilak & offer yellow chana dal.',
              ],
              [
                'Friday (Shukravar)\nShukra / Venus',
                'Shubh: 08:30-10:30\nAvoid Rahu: 10:30-12:00\nColor: Opal White / Pink',
                'Career: Favorable for vehicle purchase, jewelry, luxury & media.\nLove & Vitality: Romantic bliss, domestic beauty & celebration.',
                'Mantra: Om Dram Dreem Droum Sah Shukraya Namah (108x)\nRemedy: Light cow-ghee lamp in North-East & recite Sri Suktam.',
              ],
              [
                'Saturday (Shanivar)\nShani / Saturn',
                'Shubh: 11:30-14:30\nAvoid Rahu: 09:00-10:30\nColor: Royal Blue / Violet',
                'Career: Dedicated to machinery, long-term real estate & backlog clearance.\nLove & Vitality: Grounding introspection & karmic seva.',
                'Mantra: Om Pram Preem Proum Sah Shanaischaraya Namah (108x)\nRemedy: Light sesame oil diya under Peepal tree at sunset.',
              ],
            ],
          },
          bullets: [
            'Brahma Muhurta Amplification: Chanting your weekday mantra between 04:24 AM and 05:12 AM or at Sunrise facing East multiplies Pranic absorption 10x.',
            'Water Charging Ritual: Keep a copper vessel of drinking water beside your prayer mat during daily chanting and consume it throughout the day.',
          ],
        },
      ],
    },

    // =========================================================================
    // MODULE 4: AUDITED 12-MONTH LIFE PATH MUHURAT CALENDAR (PAGES 14 TO 15)
    // =========================================================================
    // PAGE 14: Events 1 to 6
    {
      pageNumber: 14,
      moduleKey: 'auditedCalendar12Months',
      chapterTag: 'CHAPTER 14 • BEST UPCOMING MUHURAT TIMINGS IN NEXT 12 MONTHS (PART 1)',
      title: 'BEST UPCOMING MUHURAT TIMINGS IN NEXT 12 MONTHS (PART 1)',
      subtitle: `Events 1 to 6 (${startFormatted} - ${endFormatted}) • Aligned with ${astro.rashi}, ${astro.nakshatra}, Mulank ${m} & Bhagyank ${b}`,
      bannerKey: 'transit',
      sections: [
        {
          heading: `1. BEST UPCOMING MUHURAT TIMINGS IN NEXT 12 MONTHS - EVENTS 1 TO 6 (${startFormatted} - ${endFormatted})`,
          subheading: `Includes Primary Date, Shubh Window, Backup Dates, Choghadiya/Hora, Nakshatra Yoga, Rahu Kaal to Avoid & Mantra`,
          table: {
            headers: [
              'Life Event, Score & Nakshatra Yoga',
              'Primary Best Date, Window & Avoid Time',
              'Other Auspicious Dates & Hora',
              'Vedic Astrology Alignment & Mantra Remedy',
            ],
            colWidths: [44, 44, 44, 62],
            rows: bestEvents12M.events12M.slice(0, 6).map((ev) => [
              `${ev.title}\n(${ev.auspiciousScore}% Siddha Yoga)\nYoga: ${ev.nakshatraYoga}`,
              `Best Date: ${ev.bestUpcomingDate}\nWindow: ${ev.bestTimeWindow}\n${ev.rahuKaalToAvoid}`,
              `Alt Dates: ${ev.secondaryUpcomingDates.join(', ')}\n${ev.choghadiyaAndHora}`,
              `${ev.vedicAstrologyReason}\n${ev.mantraAndDhikrBeforeEvent}`,
            ]),
          },
        },
        {
          heading: '2. VEDIC ABHIJIT MUHURAT & CHOGHADIYA EXECUTION CHARTER (PART 1)',
          gridItems: [
            {
              title: 'Abhijit Muhurat (11:45 AM - 12:33 PM) & Directional Vastu',
              subtitle: `Supreme Solar Midday Portal for ${activeProfile.name}`,
              body: `When signing contracts, transferring capital, or conducting Bhoomi Pujan/Griha Pravesh, sit facing East or North-East (Ishan Kon) during the listed Amrit/Shubh/Labh window.`,
              highlight: `Strictly avoid Rahu Kaal and Vishti Bhadra for all new financial commitments.`,
            },
            {
              title: `Chandra-Bala (${astro.rashi}) & Tara-Bala (${astro.nakshatra}) Synergy`,
              subtitle: `Personalized Natal Resonance Filter`,
              body: `Every date above has been filtered so the day vibration harmonizes with Mulank ${m} (${mPlanet.planet}), Bhagyank ${b} (${bPlanet.planet}), and your friendly planetary numbers (${mPlanet.friendlyNumbers.join(', ')}).`,
              highlight: `Chant "${mPlanet.beejMantra}" 27x before stepping out for any scheduled event.`,
            },
          ],
        },
      ],
    },

    // PAGE 15: Events 7 to 12
    {
      pageNumber: 15,
      moduleKey: 'auditedCalendar12Months',
      chapterTag: 'CHAPTER 15 • BEST UPCOMING MUHURAT TIMINGS IN NEXT 12 MONTHS (PART 2)',
      title: 'BEST UPCOMING MUHURAT TIMINGS IN NEXT 12 MONTHS (PART 2)',
      subtitle: `Events 7 to 12 (${startFormatted} - ${endFormatted}) • Vehicles, Travel, Health, Education, Branding & Sacred Puja`,
      bannerKey: 'transit',
      sections: [
        {
          heading: `1. BEST UPCOMING MUHURAT TIMINGS IN NEXT 12 MONTHS - EVENTS 7 TO 12 (${startFormatted} - ${endFormatted})`,
          subheading: `Complete Schedule for Vehicle Delivery, International Travel, Medical Care, Education, Brand Launch & Sacred Diksha`,
          table: {
            headers: [
              'Life Event, Score & Nakshatra Yoga',
              'Primary Best Date, Window & Avoid Time',
              'Other Auspicious Dates & Hora',
              'Vedic Astrological Alignment & Mantra Remedy',
            ],
            colWidths: [44, 44, 44, 62],
            rows: bestEvents12M.events12M.slice(6).map((ev) => [
              `${ev.title}\n(${ev.auspiciousScore}% Siddha Yoga)\nYoga: ${ev.nakshatraYoga}`,
              `Best Date: ${ev.bestUpcomingDate}\nWindow: ${ev.bestTimeWindow}\n${ev.rahuKaalToAvoid}`,
              `Alt Dates: ${ev.secondaryUpcomingDates.join(', ')}\n${ev.choghadiyaAndHora}`,
              `${ev.vedicAstrologyReason}\n${ev.mantraAndDhikrBeforeEvent}`,
            ]),
          },
        },
        {
          heading: '2. PRE-EVENT SANKALPA, DISHA-SHOOL PROTECTION & YANTRA ACTIVATION (PART 2)',
          gridItems: [
            {
              title: 'Vahana, Yatra & Brand Launch Siddhi Protocol',
              subtitle: 'Protection Against Disha-Shool & Transit Delays',
              body: `Before taking vehicle delivery or embarking on international travel, offer a coconut and sindoor tilak to Lord Ganesha, step out with your right foot first, and carry an energized copper ${bPlanet.planet} Yantra.`,
              highlight: `Lucky Colors for Event Days: ${mPlanet.luckyColor} & ${bPlanet.luckyColor}.`,
            },
            {
              title: 'Ayushya (Health) & Vidyarambham (Education) Muhurat Rule',
              subtitle: `Governed by Surya, Chandra, Budh & Devaguru Brihaspati`,
              body: `Begin medical therapies during Amrit Choghadiya and educational/brand filings during Budh-Guru Hora to guarantee rapid recovery, sharp intellect, and public recognition.`,
              highlight: `Lucky Days of Week: ${mPlanet.luckyDays.join(', ')} & ${bPlanet.luckyDays.join(', ')}.`,
            },
          ],
        },
      ],
    },

    // =========================================================================
    // MODULE 5: PLANETARY TRANSITS & 12-MONTH MOON PHASES (PAGES 16 TO 17)
    // =========================================================================
    // PAGE 16: All 5 Gochar Transits + Months 1 to 6 Lunar Calendar
    {
      pageNumber: 16,
      moduleKey: 'transitsAndMoon12Months',
      chapterTag: 'CHAPTER 16 • ALL PLANETARY TRANSITS & 12-MONTH MOON PHASES (PART 1)',
      title: 'ALL 5 PLANETARY TRANSITS & MOON PHASES (MONTHS 1-6)',
      subtitle: `All 5 Major Gochar Transits + Shukla Purnima, Krishna Amavasya & Ekadashi Calendar (${startFormatted} - ${endFormatted})`,
      bannerKey: 'transit',
      sections: [
        {
          heading: `1. ALL ${CELESTIAL_TRANSITS.length} MAJOR PLANETARY GOCHAR TRANSITS FOR ${astro.rashi.toUpperCase()} (${astro.nakshatra.toUpperCase()})`,
          table: {
            headers: ['Planet & Gochar Transit', 'Transit Sign & Period', 'Impact', 'Summary & Prescribed Gochar Remedy'],
            colWidths: [42, 40, 28, 84],
            rows: CELESTIAL_TRANSITS.map((tr) => [
              `${tr.planet}\n(${tr.transitName})`,
              `${tr.sign}\n${tr.startDate} -> ${tr.endDate}`,
              tr.impactType.toUpperCase(),
              `${tr.summary} Remedy: ${tr.recommendation}`,
            ]),
          },
        },
        {
          heading: `2. COMPLETE 12-MONTH SHUKLA PURNIMA / KRISHNA AMAVASYA / EKADASHI & PARALLEL ASTRO REMEDIES (MONTHS 1 TO 6)`,
          subheading: `Calculated from Report Creation Date (${startFormatted} to ${endFormatted}) for ${astro.rashi} (${astro.nakshatra})`,
          table: {
            headers: [
              'Month & Graha Lord',
              'Shukla Purnima & Krishna Amavasya',
              'Shukla & Krishna Ekadashi',
              'Vedic Astrological Prediction & Parallel Remedy',
            ],
            colWidths: [38, 42, 42, 72],
            rows: lunar12Months.slice(0, 6).map((mp) => [
              `${mp.monthLabel}\n${mp.rulingPlanet.split(' - ')[0]}\n(${mp.periodRange})`,
              `Purnima: ${mp.shuklaPurnima}\nAmavasya: ${mp.krishnaAmavasya}`,
              `Shukla Ekadashi: ${mp.shuklaEkadashi}\nKrishna Ekadashi: ${mp.krishnaEkadashi}`,
              `Astro Prediction: ${mp.astrologicalPrediction}\nParallel Remedy: ${mp.parallelRemedy}`,
            ]),
          },
        },
      ],
    },

    // PAGE 17: Months 7 to 12 Lunar Calendar + Sankalpa Vidhi
    {
      pageNumber: 17,
      moduleKey: 'transitsAndMoon12Months',
      chapterTag: 'CHAPTER 17 • 12-MONTH SHUKLA PURNIMA / KRISHNA AMAVASYA / EKADASHI (PART 2)',
      title: '12-MONTH MOON PHASES & PARALLEL ASTRO REMEDIES (MONTHS 7-12)',
      subtitle: `Months 7 to 12 Shukla Purnima, Krishna Amavasya & Ekadashi Dates + Astrological Predictions & Parallel Remedies`,
      bannerKey: 'transit',
      sections: [
        {
          heading: `1. COMPLETE 12-MONTH SHUKLA PURNIMA / KRISHNA AMAVASYA / EKADASHI & PARALLEL ASTRO REMEDIES (MONTHS 7 TO 12)`,
          subheading: `Second Half-Year Lunar Ephemeris & Parallel Vedic Remedies (${startFormatted} to ${endFormatted}) for ${astro.rashi}`,
          table: {
            headers: [
              'Month & Graha Lord',
              'Shukla Purnima & Krishna Amavasya',
              'Shukla & Krishna Ekadashi',
              'Vedic Astrological Prediction & Parallel Remedy',
            ],
            colWidths: [38, 42, 42, 72],
            rows: lunar12Months.slice(6, 12).map((mp) => [
              `${mp.monthLabel}\n${mp.rulingPlanet.split(' - ')[0]}\n(${mp.periodRange})`,
              `Purnima: ${mp.shuklaPurnima}\nAmavasya: ${mp.krishnaAmavasya}`,
              `Shukla Ekadashi: ${mp.shuklaEkadashi}\nKrishna Ekadashi: ${mp.krishnaEkadashi}`,
              `Astro Prediction: ${mp.astrologicalPrediction}\nParallel Remedy: ${mp.parallelRemedy}`,
            ]),
          },
        },
        {
          heading: '2. SACRED SHUKLA PURNIMA, KRISHNA AMAVASYA & EKADASHI SANKALPA VIDHI',
          gridItems: [
            {
              title: 'Shukla Purnima & Shukla/Krishna Ekadashi Siddhi Vidhi',
              subtitle: `Lunar Soma-Tattva Amplification for ${astro.rashi}`,
              body: `On every Shukla Purnima, offer raw milk and white flowers to Chandra Deva at moonrise and chant "${mPlanet.beejMantra}" 108x. On both Shukla and Krishna Ekadashi dates, observe a sattvic fruit/milk fast and offer Tulsi leaves to Lord Vishnu.`,
              highlight: 'Result: Stabilizes mental peace, liquid cashflow, and family harmony.',
            },
            {
              title: 'Krishna Amavasya Pitru-Tarpan & Aura Cleansing Protocol',
              subtitle: `Karmic Debt Removal & Drishti Shield for ${activeProfile.name}`,
              body: `On every Krishna Amavasya date listed above, light a 4-faced mustard or sesame oil diya under a Peepal tree or at the South threshold at sunset, donate food/grains to the needy, and mop the home with sea-salt water.`,
              highlight: 'Result: Dissolves Pitru Dosha, Nazar/Drishti blocks, and sudden financial obstacles.',
            },
          ],
        },
      ],
    },

    // =========================================================================
    // MODULE 6: DAILY VEDIC MANTRAS & 9-PLANET NAVAGRAHA TABLE (PAGE 18)
    // =========================================================================
    {
      pageNumber: 18,
      moduleKey: 'dailyMantras',
      chapterTag: 'CHAPTER 18 • DAILY VEDIC MANTRAS, MALA, MUDRA & NAVAGRAHA KAVACH',
      title: 'PERSONALIZED DAILY VEDIC MANTRAS & NAVAGRAHA TABLE',
      subtitle: `4 Daily Time-Phase Vedic Mantras (Mala, Mudra, Meaning & Reason) + Complete 9-Planet Navagraha Beej Mantra Ledger`,
      bannerKey: 'chakra',
      sections: [
        {
          heading: '1. PERSONALIZED 4-PHASE DAILY VEDIC MANTRAS (WITH SOUND FREQUENCY HZ, MALA, MUDRA & MEANING)',
          subheading: `Calibrated for Mulank ${m} (${mPlanet.planet}), Bhagyank ${b} (${bPlanet.planet}), Janma Rashi ${astro.rashi} & Active ${activeDasha.planet} Dasha`,
          gridItems: [
            {
              title: `1. Morning Brahma Muhurat (05:30 AM - 07:30 AM): Natal Soul & Rashi Mantra`,
              subtitle: `Planet: ${mPlanet.planet} (${mPlanet.sanskritName}) • Sound: ${mPlanet.soundFrequencyHz || '126.22 Hz'} • 108 Beads`,
              body: `Mantra: "${mPlanet.beejMantra}". Meaning: ${mulankDevanagari.englishMeaning} Why Prescribed: Tailored to Mulank ${m}, ${astro.rashi}, and ${astro.nakshatra} (Pada ${astro.pada}).`,
              highlight: `Sound Frequency: ${mPlanet.soundFrequencyHz || '126.22 Hz'} | Mala: ${mulankDevanagari.mala} | Mudra: ${mulankDevanagari.mudra}`,
            },
            {
              title: `2. Morning Work Initiation (08:15 AM - 10:30 AM): Active Maha Dasha Mantra`,
              subtitle: `Active Dasha: ${activeDasha.planet} (${activeDasha.startYear}-${activeDasha.endYear}) • Sound: ${activeDashaPlanet.soundFrequencyHz || '221.23 Hz'} • 27 Beads`,
              body: `Mantra: "${activeDashaPlanet.beejMantra}". Meaning: ${dashaDevanagari.englishMeaning} Why Prescribed: Unlocks wealth and career elevation during your active ${activeDasha.planet} Maha Dasha.`,
              highlight: `Sound Frequency: ${activeDashaPlanet.soundFrequencyHz || '221.23 Hz'} | Mala: ${dashaDevanagari.mala} | Mudra: ${dashaDevanagari.mudra}`,
            },
            {
              title: `3. Midday Planetary Transit Kavach (12:00 PM - 01:30 PM): Gochar Shanti Mantra`,
              subtitle: `Harmonizes Saturn in Pisces, Jupiter in Gemini & Rahu-Ketu Axis • Sound: 432 Hz & 528 Hz • 11 Beads`,
              body: `Mantra: "Om Brahma Muraris Tripurantakari Bhanuh Shashi Bhumisuto Budhashcha | Gurushcha Shukrah Shani Rahu Ketavah Kurvantu Sarve Mama Suprabhatam ||" Also recite "${panchang.todayBeejMantra}" (27x).`,
              highlight: `Sound Frequency: 432 Hz Cosmic Tuning & 528 Hz Shield | Mala: 5-Mukhi Rudraksha | Mudra: Anjali Mudra • Face East`,
            },
            {
              title: `4. Evening Sandhya (06:00 PM - 07:45 PM): Destiny & Missing Grid Mantra`,
              subtitle: `Bhagyank ${b} (${bPlanet.planet}) & Missing Numbers (${advMobile.missingNumbersList.join(', ') || 'None'}) • Sound: ${bPlanet.soundFrequencyHz || '183.58 Hz'} • 54 Beads`,
              body: `Mantra: "${bPlanet.beejMantra}". Meaning: ${bhagyankDevanagari.englishMeaning} Why Prescribed: Harmonizes Life Path Bhagyank ${b} and bridges missing vibrational planes.`,
              highlight: `Sound Frequency: ${bPlanet.soundFrequencyHz || '183.58 Hz'} | Mala: ${bhagyankDevanagari.mala} | Mudra: ${bhagyankDevanagari.mudra}`,
            },
          ],
        },
        {
          heading: '2. COMPLETE 9-PLANET (NAVAGRAHA) VEDIC BEEJ MANTRA, SOUND FREQUENCY (HZ), MALA & MUDRA LEDGER',
          table: {
            headers: ['No. & Graha', 'Deity, Element & Mala', 'Sacred Beej Mantra & Sound Frequency (Hz)', 'Mudra, Lucky Days & Friends'],
            colWidths: [36, 44, 60, 54],
            rows: Object.values(PLANETARY_PROFILES).map((p) => {
              const dev = SANSKRit_BEEJ_DEVANAGARI[p.number] || SANSKRit_BEEJ_DEVANAGARI[1];
              return [
                `#${p.number} ${p.planet}\n(${p.sanskritName})`,
                `${p.deity} (${p.element})\nMala: ${dev.mala}`,
                `${p.beejMantra}\nSound: ${p.soundFrequencyHz || '432 Hz'}`,
                `${dev.mudra}\nDays: ${p.luckyDays.join(', ')} | Friends: ${p.friendlyNumbers.join(', ')}`,
              ];
            }),
          },
          bullets: clientOrAdminRemedyBullets,
        },
      ],
    },

    // =========================================================================
    // MODULE 6B: VEDIC YOGA, PRANAYAMA & 7-DAY WEEKLY PLANNER (2 FULL PAGES)
    // =========================================================================
    {
      pageNumber: 18,
      moduleKey: 'yogaAndPranayama',
      chapterTag: 'CHAPTER 18A • VEDIC YOGA ASANAS, PRANAYAMA BREATHING & HEALTH REMEDIES',
      title: 'VEDIC YOGA ASANAS, PRANAYAMA & HEALTH REMEDIES',
      subtitle: `Tailored to Mulank ${m} (${mPlanet.planet}), Bhagyank ${b} (${bPlanet.planet}), ${astro.rashi} & ${yogaPlan.primaryChakra}`,
      bannerKey: 'chakra',
      sections: [
        {
          heading: `1. VISUAL YOGA POSTURE CARD GALLERY (BIRTH CHART & HEALTH PRESCRIPTIONS — ALL ${yogaPlan.dailyAsanas.length} ASANAS)`,
          subheading: `Constitutional Dosha Tendency: ${yogaPlan.dominantDoshaConstitution} • Selected Health Focus: ${yogaPlan.selectedHealthConcerns.length > 0 ? yogaPlan.selectedHealthConcerns.map((hc) => hc.label).join(' • ') : 'Holistic Pranic Vitality & 9-Chakra Balance'}`,
          yogaAsanaGallery: yogaPlan.dailyAsanas,
        },
        {
          heading: '2. DAILY VEDIC PRANAYAMA (BREATHWORK) & HASTA MUDRA PROTOCOLS',
          subheading: `Selected Health Focus: ${yogaPlan.selectedHealthConcerns.length > 0 ? yogaPlan.selectedHealthConcerns.map((hc) => hc.label).join(' • ') : 'Holistic Pranic Vitality & 9-Chakra Balance'}`,
          gridItems: yogaPlan.dailyPranayamas.map((prana, idx) => ({
            title: `${idx + 1}. ${prana.sanskritName} (${prana.englishName}) — ${prana.roundsAndDuration}`,
            subtitle: `Ratio: ${prana.breathingRatio} • Mudra: ${prana.mudraAndBandha} • Nadi/Chakra: ${prana.targetNadiAndChakra}`,
            body: `${prana.stepByStepTechnique.join(' ')} Benefits: ${prana.astrologicalAndHealthBenefit}`,
            highlight: `Mantra Sync: "${prana.beejMantra}"`,
          })),
        },
      ],
    },
    {
      pageNumber: 18,
      moduleKey: 'yogaAndPranayama',
      chapterTag: 'CHAPTER 18B • 7-DAY WEEKLY YOGA & PRANAYAMA PLANNER (VARA-JYOTISH SCHEDULE)',
      title: '7-DAY WEEKLY YOGA & PRANAYAMA PLANNER',
      subtitle: `7-Day Planetary Posture & Breathwork Tracker + Ayurvedic Dinacharya Rules for ${activeProfile.name}`,
      bannerKey: 'chakra',
      sections: [
        {
          heading: '1. COMPLETE 7-DAY WEEKLY YOGA & PRANAYAMA PLANNER (SUNDAY TO SATURDAY)',
          subheading: `Synchronized with Daily Planetary Rulers (Vara-Jyotish), Mulank ${m} (${mPlanet.planet}) & Bhagyank ${b} (${bPlanet.planet})`,
          table: {
            headers: [
              'Day & Planetary Lord',
              'Morning Yoga Asanas & Duration',
              'Pranayama & Hasta Mudra',
              'Focus Area, Mantra & Chart Synergy',
            ],
            colWidths: [40, 48, 48, 58],
            rows: yogaPlan.weeklyPlanner.map((d) => [
              `[ ] ${d.dayName}\n(${d.hindiDay})\n${d.rulingPlanet}`,
              d.morningAsanas.map((ma) => `${ma.sanskritName} (${ma.duration})`).join('\n'),
              `${d.pranayamaPractice.name} (${d.pranayamaPractice.rounds})\nMudra: ${d.mudraAndMantra.mudra}`,
              `Theme: ${d.themeTitle}\nSynergy: ${d.personalChartSynergy}\nMantra: ${d.mudraAndMantra.mantra}`,
            ]),
          },
        },
        {
          heading: '2. AYURVEDIC DINACHARYA, PRANIC HYDRATION & YOGA SADHANA GUIDELINES',
          bullets: yogaPlan.ayurvedicAharaTips,
        },
      ],
    },

    // =========================================================================
    // MODULE 7: PARTNER MILAN & 9-CHAKRA DIAGNOSTICS (4 DEDICATED PAGES — 100% APP DATA)
    // =========================================================================
    // PAGE 19: Groom & Bride Complete Natal Comparison + Visual 8-Koota Ashtakoot Guna Milan Chart Box + Marital Name Harmonizer
    {
      pageNumber: 19,
      moduleKey: 'partnerMilanChakras',
      chapterTag: 'CHAPTER 19 • PARTNER MILAN: GROOM & BRIDE DETAILS + VISUAL ASHTAKOOT GUNA MILAN CHART',
      title: 'GROOM & BRIDE DETAILS + VISUAL ASHTAKOOT MILAN CHART',
      subtitle: `Groom: ${groomProfile.name} & Bride: ${brideProfile.name} • Score: ${partnerMilan.totalPoints}/36 Gunas (${partnerMilan.overallPercentage}% - ${partnerMilan.verdict})`,
      bannerKey: 'chakra',
      sections: [
        {
          heading: `1. GROOM (${groomProfile.name.toUpperCase()}) & BRIDE (${brideProfile.name.toUpperCase()}) COMPLETE NATAL & ASTROLOGICAL DETAILS`,
          subheading: `Complete Birth Details, Coordinates, Mulank, Bhagyank, Namank, Janma Rashi, Surya Rashi & Nakshatra Comparison`,
          table: {
            headers: [
              'Astro-Numerology Parameter',
              `Groom / Partner 1: ${groomProfile.name}`,
              `Bride / Partner 2: ${brideProfile.name}`,
            ],
            colWidths: [48, 73, 73],
            rows: [
              [
                'Full Name & Chaldean Namank',
                `${groomProfile.name} (Compound ${groomNameAnalysis.totalChaldeanCompound} -> Root ${groomNameAnalysis.chaldeanSingle})`,
                `${brideProfile.name} (Compound ${brideNameAnalysis.totalChaldeanCompound} -> Root ${brideNameAnalysis.chaldeanSingle})`,
              ],
              [
                'Date & Time of Birth (AM/PM)',
                `${groomProfile.dob} at ${formatTime12HourAmPm(groomProfile.tob)}`,
                `${brideProfile.dob} at ${formatTime12HourAmPm(brideProfile.tob)}`,
              ],
              [
                'Birth Place & Geodesic Coordinates',
                `${groomProfile.pob} (${groomProfile.lat.toFixed(2)}N, ${groomProfile.lng.toFixed(2)}E)`,
                `${brideProfile.pob} (${brideProfile.lat.toFixed(2)}N, ${brideProfile.lng.toFixed(2)}E)`,
              ],
              [
                'Mulank (Psychic) & Ruling Planet',
                `Mulank ${partnerMilan.p1Mulank} - ${groomMulankPlanet.planet} (${groomMulankPlanet.sanskritName})`,
                `Mulank ${partnerMilan.p2Mulank} - ${brideMulankPlanet.planet} (${brideMulankPlanet.sanskritName})`,
              ],
              [
                'Bhagyank (Destiny) & Ruling Planet',
                `Bhagyank ${partnerMilan.p1Bhagyank} - ${groomBhagyankPlanet.planet} (${groomBhagyankPlanet.sanskritName})`,
                `Bhagyank ${partnerMilan.p2Bhagyank} - ${brideBhagyankPlanet.planet} (${brideBhagyankPlanet.sanskritName})`,
              ],
              [
                'Sidereal Moon (Janma) & Sun Rashi',
                `Moon: ${partnerMilan.p1Astrology.rashi} | Sun: ${partnerMilan.p1Astrology.sunSign}`,
                `Moon: ${partnerMilan.p2Astrology.rashi} | Sun: ${partnerMilan.p2Astrology.sunSign}`,
              ],
              [
                'Janma Nakshatra & Pada',
                `${partnerMilan.p1Astrology.nakshatra} (Pada ${partnerMilan.p1Astrology.pada})`,
                `${partnerMilan.p2Astrology.nakshatra} (Pada ${partnerMilan.p2Astrology.pada})`,
              ],
            ],
          },
        },
        {
          heading: `2. ASHTAKOOT KOOTA (DIMENSION), MARITAL DOMAIN, MAX GUNAS, OBTAINED GUNAS, VISUAL GUNA MILAN CHART & VERDICT`,
          subheading: `Total Ashtakoot Score: ${partnerMilan.totalPoints} / 36 Gunas (${partnerMilan.overallPercentage}% Compatibility) • ${partnerMilan.verdict}`,
          ashtakootChartBox: {
            groomName: groomProfile.name,
            brideName: brideProfile.name,
            totalPoints: partnerMilan.totalPoints,
            overallPercentage: partnerMilan.overallPercentage,
            overallVerdict: partnerMilan.verdict,
            dimensions: partnerMilan.dimensions.map((dim, idx) => ({
              index: idx + 1,
              kootaDimension: `${dim.name} (${dim.sanskritName})`,
              maritalDomain: dim.description,
              maxGunas: dim.maxPoints,
              obtainedGunas: dim.obtainedPoints,
              percentage: Math.round((dim.obtainedPoints / Math.max(1, dim.maxPoints)) * 100),
              verdict: dim.verdict,
            })),
          },
        },
        {
          heading: `3. MARITAL NAME VIBRATION HARMONIZER (${groomProfile.name.toUpperCase()} & ${brideProfile.name.toUpperCase()})`,
          gridItems: partnerMilan.perfectNameSuggestions.map((item) => ({
            title: `${item.partnerLabel}: ${item.suggestedPerfectName}`,
            subtitle: `Natal Spelling: ${item.currentName} -> Compound ${item.compound} (Root ${item.root} • ${item.title})`,
            body: item.maritalBenefit,
            highlight: `Harmonic Resonance Target: Compound ${item.compound} -> Root ${item.root}`,
          })),
        },
      ],
    },

    // PAGE 19B: Complete 1 to 8 Ashtakoot Koota Detailed Analysis & Groom/Bride/Joint Remedies (Width-Wise 2-Column Layout)
    {
      pageNumber: 19,
      moduleKey: 'partnerMilanChakras',
      chapterTag: 'CHAPTER 19B • PARTNER MILAN: ALL 8 ASHTAKOOT KOOTA DETAILS (1 TO 8) & REMEDIES',
      title: 'ALL 8 ASHTAKOOT KOOTA DETAILS (1 TO 8) & REMEDIES',
      subtitle: `Complete 1 to 8 Koota Analysis (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) + Groom, Bride & Joint Remedies`,
      bannerKey: 'chakra',
      sections: [
        {
          heading: `1. THE 8 VEDIC DIMENSIONS (ASHTAKOOT KOOTA 1 TO 8 COMPLETE DETAILS & REMEDIES — ${partnerMilan.totalPoints}/36 GUNAS)`,
          subheading: `Width-Wise 2-Column Layout Covering Kootas 1 to 5 (Varna, Vashya, Tara, Yoni, Graha Maitri) & Kootas 6 to 8 (Gana, Bhakoot, Nadi)`,
          gridItems: partnerMilan.dimensions.map((dim, idx) => ({
            title: `${idx + 1}. ${dim.name} (${dim.sanskritName}) — Score: ${dim.obtainedPoints}/${dim.maxPoints} Gunas [${dim.verdict}]`,
            subtitle: `Marital Domain: ${dim.description}${dim.soundFrequencyHz ? ` • Sound Frequency: ${dim.soundFrequencyHz}` : ''}`,
            body: `${dim.detailedAnalysis} Prescribed Shastra & Pranic Harmonization: ${dim.remedy}`,
            highlight: `Groom (${groomProfile.name}): ${dim.groomRemedy} | Bride (${brideProfile.name}): ${dim.brideRemedy} | Both Partners: ${dim.bothRemedy}`,
          })),
        },
      ],
    },

    // PAGE 20: Partner Milan Part 3 — Complete 9-Chakra Marital Diagnostics (Chakras 1 to 5: Earth Star to Anahata in Width-Wise 2-Column Grid)
    {
      pageNumber: 20,
      moduleKey: 'partnerMilanChakras',
      chapterTag: 'CHAPTER 20 • PARTNER MILAN: 9-CHAKRA DIAGNOSTICS & REMEDIES (CHAKRAS 1 TO 5)',
      title: 'COUPLE 9-CHAKRA DIAGNOSTICS & REMEDIES (CHAKRAS 1 TO 5)',
      subtitle: `Complete Groom & Bride Karmic Patterns, Aura Scan, Sound Frequency (Hz), Crystal, Mantra & Remedies for Chakras 1 to 5`,
      bannerKey: 'chakra',
      sections: [
        {
          heading: `1. COMPLETE 9-CHAKRA MARITAL DIAGNOSTICS — CHAKRAS 1 TO 5 (EARTH STAR TO ANAHATA)`,
          subheading: `Width-Wise 2-Column Layout: Groom (${groomProfile.name}) & Bride (${brideProfile.name}) Patterns, Sound Frequency (Hz), Crystal, Mantra & Remedies`,
          gridItems: partnerMilan.chakraChallenges.slice(0, 5).map((ch, idx) => ({
            title: `${idx + 1}. ${ch.chakraName} (${ch.sanskritName} • ${ch.element}) — ${ch.alignmentScore}% [${ch.status}]`,
            subtitle: `Carrier: ${ch.affectedPartner} (${ch.primaryCarrierName}) • Sound: ${ch.soundFrequencyHz || '528 Hz'} • Crystal: ${ch.healingCrystal} • Mantra: ${ch.beejMantra}`,
            body: `Groom (${groomProfile.name}): ${ch.groomChallengeDetail} | Bride (${brideProfile.name}): ${ch.brideChallengeDetail} | Joint Issue: ${ch.postMarriageIssue} | Diagnosis: ${ch.fortuneReadingDiagnosis} | Aura Scan: ${ch.auraScanRemedy}`,
            highlight: `Groom Remedy: ${ch.groomRemedy} | Bride Remedy: ${ch.brideRemedy} | Joint Remedy: ${ch.bothRemedy}`,
          })),
        },
      ],
    },

    // PAGE 21: Partner Milan Part 4 — Complete 9-Chakra Marital Diagnostics (Chakras 6 to 9: Vishuddha to Soul Star + Couple Vastu in Width-Wise 2-Column Grid)
    {
      pageNumber: 21,
      moduleKey: 'partnerMilanChakras',
      chapterTag: 'CHAPTER 21 • PARTNER MILAN: 9-CHAKRA DIAGNOSTICS & REMEDIES (CHAKRAS 6 TO 9)',
      title: 'COUPLE 9-CHAKRA DIAGNOSTICS & REMEDIES (CHAKRAS 6 TO 9)',
      subtitle: `Complete Groom & Bride Karmic Patterns, Aura Scan, Sound Frequency (Hz), Crystal, Mantra & Remedies for Chakras 6 to 9 + Couple Vastu`,
      bannerKey: 'chakra',
      sections: [
        {
          heading: `1. COMPLETE 9-CHAKRA MARITAL DIAGNOSTICS — CHAKRAS 6 TO 9 (VISHUDDHA TO SOUL STAR) & MASTER SUMMARY`,
          subheading: `Width-Wise 2-Column Layout: Groom (${groomProfile.name}) & Bride (${brideProfile.name}) Patterns, Sound Frequency (Hz), Crystal, Mantra & Remedies`,
          gridItems: [
            ...partnerMilan.chakraChallenges.slice(5, 9).map((ch, idx) => ({
              title: `${idx + 6}. ${ch.chakraName} (${ch.sanskritName} • ${ch.element}) — ${ch.alignmentScore}% [${ch.status}]`,
              subtitle: `Carrier: ${ch.affectedPartner} (${ch.primaryCarrierName}) • Sound: ${ch.soundFrequencyHz || '852 Hz'} • Crystal: ${ch.healingCrystal} • Mantra: ${ch.beejMantra}`,
              body: `Groom (${groomProfile.name}): ${ch.groomChallengeDetail} | Bride (${brideProfile.name}): ${ch.brideChallengeDetail} | Joint Issue: ${ch.postMarriageIssue} | Diagnosis: ${ch.fortuneReadingDiagnosis} | Aura Scan: ${ch.auraScanRemedy}`,
              highlight: `Groom Remedy: ${ch.groomRemedy} | Bride Remedy: ${ch.brideRemedy} | Joint Remedy: ${ch.bothRemedy}`,
            })),
            {
              title: `10. Master Marital Compatibility Verdict & Bedroom Vastu Shield (${partnerMilan.totalPoints}/36 Gunas)`,
              subtitle: `Groom: ${groomProfile.name} & Bride: ${brideProfile.name} • ${partnerMilan.overallPercentage}% Resonance • Couple Sound: 639 Hz & 528 Hz`,
              body: `${partnerMilan.summary} Keep a pair of energized Rose Quartz swans and a natural Pyrite cluster in the South-West corner of the master bedroom, sleep with heads towards South, and play 639 Hz + 528 Hz Solfeggio harmony tones for 15 mins every Friday evening.`,
              highlight: `Monthly Couple Purnima Sankalpa: Offer joint Arghya to the Full Moon on Shukla Purnima and chant "Om Kleem Krishnaya Namah" 108x together.`,
            },
          ],
          bullets: clientOrAdminRemedyBullets,
        },
      ],
    },

    // PAGE 21B: Precious Stone Recommendation for Relationship Harmony (Bride & Groom) — Complete Step-by-Step Guide & Joint Couple Bedroom Crystal Synergy
    {
      pageNumber: 21,
      moduleKey: 'partnerMilanChakras',
      chapterTag: 'CHAPTER 21B • PRECIOUS STONE RECOMMENDATION FOR RELATIONSHIP HARMONY (BRIDE & GROOM)',
      title: 'PRECIOUS STONE FOR RELATIONSHIP HARMONY (BRIDE & GROOM)',
      subtitle: `Who Needs To Wear For Harmony: ${partnerRatnaRec.whoNeedsItBadge} • Complete Step-by-Step Guide & Joint Couple Bedroom Crystal Synergy`,
      bannerKey: 'chakra',
      sections: [
        {
          heading: `1. PRECIOUS STONE RECOMMENDATION FOR RELATIONSHIP HARMONY (BRIDE & GROOM) — WHO NEEDS TO WEAR: ${partnerRatnaRec.whoNeedsItBadge.toUpperCase()}`,
          subheading: `Vedic Astrological Harmony Verdict (Bride vs Groom Requirement): ${partnerRatnaRec.whoNeedsItSummary}`,
          table: {
            headers: [
              'Partner, Priority & Planet',
              'Primary Precious Stone (Maharatna) & Upratna',
              '1. Finger & Hand | 2. Metal & Setting | 3. Day, Time & Nakshatra',
              '4. Panchamrit Purification & 5. Prana-Pratishtha Beej Mantra (108x)',
            ],
            colWidths: [40, 44, 54, 56],
            rows: [
              [
                `Groom (${groomProfile.name})\n[${partnerRatnaRec.groomStone.priorityBadge}]\nPlanet: ${partnerRatnaRec.groomStone.ratna.planet} (${partnerRatnaRec.groomStone.ratna.sanskritPlanet})\nRashi: ${partnerMilan.p1Astrology.rashi}`,
                `Primary: ${partnerRatnaRec.groomStone.ratna.primaryGem} (${partnerRatnaRec.groomStone.ratna.sanskritGem})\nSubstitute (Upratna): ${partnerRatnaRec.groomStone.ratna.upratna}\nWeight: ${partnerRatnaRec.groomStone.idealRattiRange} (${partnerRatnaRec.groomStone.idealCaratRange})`,
                `1. Finger & Hand: ${partnerRatnaRec.groomStone.wearingHandAndFinger}\n2. Metal & Setting: ${partnerRatnaRec.groomStone.metalAndSetting}\n3. Day & Time: ${partnerRatnaRec.groomStone.dayAndMuhurat}\nNakshatra: ${partnerRatnaRec.groomStone.pakshaAndNakshatra}`,
                `4. Purification Liquid: ${partnerRatnaRec.groomStone.purificationIngredients} (Soak 21-30 mins before sunrise)\n5. Beej Mantra (108x): ${partnerRatnaRec.groomStone.beejMantra}\nChakra: ${partnerRatnaRec.groomStone.ratna.chakra}`,
              ],
              [
                `Bride (${brideProfile.name})\n[${partnerRatnaRec.brideStone.priorityBadge}]\nPlanet: ${partnerRatnaRec.brideStone.ratna.planet} (${partnerRatnaRec.brideStone.ratna.sanskritPlanet})\nRashi: ${partnerMilan.p2Astrology.rashi}`,
                `Primary: ${partnerRatnaRec.brideStone.ratna.primaryGem} (${partnerRatnaRec.brideStone.ratna.sanskritGem})\nSubstitute (Upratna): ${partnerRatnaRec.brideStone.ratna.upratna}\nWeight: ${partnerRatnaRec.brideStone.idealRattiRange} (${partnerRatnaRec.brideStone.idealCaratRange})`,
                `1. Finger & Hand: ${partnerRatnaRec.brideStone.wearingHandAndFinger}\n2. Metal & Setting: ${partnerRatnaRec.brideStone.metalAndSetting}\n3. Day & Time: ${partnerRatnaRec.brideStone.dayAndMuhurat}\nNakshatra: ${partnerRatnaRec.brideStone.pakshaAndNakshatra}`,
                `4. Purification Liquid: ${partnerRatnaRec.brideStone.purificationIngredients} (Soak 21-30 mins before sunrise)\n5. Beej Mantra (108x): ${partnerRatnaRec.brideStone.beejMantra}\nChakra: ${partnerRatnaRec.brideStone.ratna.chakra}`,
              ],
            ],
          },
        },
        {
          heading: '2. COMPLETE STEP-BY-STEP WEARING RITUAL (RATNA DHARAN VIDHI) & JOINT COUPLE RELATIONSHIP HARMONY & BEDROOM CRYSTAL SYNERGY',
          subheading: 'Step 1 (Metal & Finger) through Step 5 (Wearing Time) for Groom & Bride + Joint Couple Relationship Harmony & Bedroom Crystal Synergy',
          gridItems: [
            {
              title: `${partnerRatnaRec.groomStone.purposeTitle} — ${partnerRatnaRec.groomStone.ratna.primaryGem} (${partnerRatnaRec.groomStone.ratna.sanskritGem})`,
              subtitle: `${partnerRatnaRec.groomStone.priorityBadge} • Finger: ${partnerRatnaRec.groomStone.wearingHandAndFinger} • Metal: ${partnerRatnaRec.groomStone.ratna.metal}`,
              body: `How It Creates Relationship & Marital Harmony: ${partnerRatnaRec.groomStone.astrologicalReason} Complete Step-by-Step Wearing Ritual (Ratna Dharan Vidhi): ${partnerRatnaRec.groomStone.howToWearStepByStep.join(' | ')}`,
              highlight: `Day & Muhurat: ${partnerRatnaRec.groomStone.dayAndMuhurat} | Beej Mantra (108x): ${partnerRatnaRec.groomStone.beejMantra}`,
            },
            {
              title: `${partnerRatnaRec.brideStone.purposeTitle} — ${partnerRatnaRec.brideStone.ratna.primaryGem} (${partnerRatnaRec.brideStone.ratna.sanskritGem})`,
              subtitle: `${partnerRatnaRec.brideStone.priorityBadge} • Finger: ${partnerRatnaRec.brideStone.wearingHandAndFinger} • Metal: ${partnerRatnaRec.brideStone.ratna.metal}`,
              body: `How It Creates Relationship & Marital Harmony: ${partnerRatnaRec.brideStone.astrologicalReason} Complete Step-by-Step Wearing Ritual (Ratna Dharan Vidhi): ${partnerRatnaRec.brideStone.howToWearStepByStep.join(' | ')}`,
              highlight: `Day & Muhurat: ${partnerRatnaRec.brideStone.dayAndMuhurat} | Beej Mantra (108x): ${partnerRatnaRec.brideStone.beejMantra}`,
            },
          ],
          bullets: [
            `Joint Couple Relationship Harmony & Bedroom Crystal Synergy: ${partnerRatnaRec.jointHarmonyStoneSummary}`,
            ...clientOrAdminRemedyBullets,
          ],
        },
      ],
    },

    // PARIVAR MILAN & 9-CHAKRA FAMILY DIAGNOSTICS (Independent Opt-In Module, tightly packed on A4)
    {
      pageNumber: 21,
      moduleKey: 'parivarMilan' as const,
      chapterTag:
        'CHAPTER 21C • PARIVAR MILAN: FINAL CONCLUSIVE HARMONY GRAPH & 9-CHAKRA DIAGNOSTICS',
      title: 'PARIVAR MILAN: HARMONY GRAPH & 9-CHAKRA DIAGNOSTICS',
      subtitle:
        parivarReport.memberResults.length > 0
          ? `Client: ${activeProfile.name} • Overall Parivar Harmony: ${parivarReport.averageFamilyHarmony}% (${parivarReport.familyCollectiveVerdict}) across ${parivarReport.memberResults.length} Family Member(s)`
          : `Client: ${activeProfile.name} • Mulank ${m} (${mPlanet.planet}) & Bhagyank ${b} (${bPlanet.planet}) • Collective Family Vedic Astrology, 9-Chakra & Gemstone/Rudraksha Charter`,
      bannerKey: 'chakra' as const,
      sections:
        parivarReport.memberResults.length > 0
          ? [
              {
                heading: `1. FINAL CONCLUSIVE RESULT • PARIVAR HARMONY GRAPH (${activeProfile.name.toUpperCase()} WITH EACH FAMILY MEMBER)`,
                subheading: `Comparative 9-Chakra & Vedic Alignment % (Earth Star #1 to Soul Star #9) • Overall Parivar Harmony: ${parivarReport.averageFamilyHarmony}%`,
                parivarHarmonyGraphBox: {
                  clientName: activeProfile.name,
                  averageFamilyHarmony: parivarReport.averageFamilyHarmony,
                  familyCollectiveVerdict: parivarReport.familyCollectiveVerdict,
                  strongestBondLabel: parivarReport.mostHarmoniousMember
                    ? `${parivarReport.mostHarmoniousMember.name} (${parivarReport.mostHarmoniousMember.relation} • ${parivarReport.mostHarmoniousMember.score}%)`
                    : 'N/A',
                  priorityRemedyBondLabel: parivarReport.mostChallengingMember
                    ? `${parivarReport.mostChallengingMember.name} (${parivarReport.mostChallengingMember.relation} • ${parivarReport.mostChallengingMember.score}%)`
                    : 'N/A',
                  collectiveSynthesis: parivarReport.collectiveHomeVastuAndParivarRemedy,
                  members: parivarReport.memberResults.map((res, idx) => {
                    const harmCount = res.nineChakraDiagnostics.filter(
                      (c) => c.status === 'Harmonious'
                    ).length;
                    return {
                      index: idx + 1,
                      name: res.member.name,
                      relation: res.member.relation,
                      dobAndPlace: `${res.member.dob} (${res.member.tob || '09:30'}) • ${res.member.pob || 'New Delhi'}`,
                      mulankBhagyankRashi: `M:${res.memberMulank} | B:${res.memberBhagyank} • ${res.memberAstrology.rashi.split(' ')[0]}`,
                      harmonyScore: res.overallHarmonyScore,
                      harmoniousCount: harmCount,
                      needsHarmonyCount: 9 - harmCount,
                      verdict: res.harmonyVerdict,
                    };
                  }),
                },
              },
              ...parivarReport.memberResults.map((res, mIdx) => {
                const harmCount = res.nineChakraDiagnostics.filter(
                  (c) => c.status === 'Harmonious'
                ).length;
                const chakrasNeedingHarmony = res.nineChakraDiagnostics.filter(
                  (ch) => ch.status !== 'Harmonious'
                );
                const allNineChakraPercentLine = res.nineChakraDiagnostics
                  .map(
                    (c) =>
                      `#${c.chakraNumber} ${c.chakraName.replace(' Chakra', '')}: ${c.alignmentScore}% (${
                        c.status === 'Harmonious' ? 'Perfect' : 'Needs Harmony'
                      })`
                  )
                  .join(' • ');

                return {
                  heading: `${mIdx + 2}. COMPLETE 9-CHAKRA PARIVAR DIAGNOSTICS: ${activeProfile.name.toUpperCase()} & ${res.member.name.toUpperCase()} (${res.member.relation.toUpperCase()} — ${res.overallHarmonyScore}%)`,
                  subheading: `DOB: ${res.member.dob} (${res.member.tob || '09:30'}) • Place: ${res.member.pob || 'New Delhi'} • Mulank ${res.memberMulank} | Bhagyank ${res.memberBhagyank} • ${res.memberAstrology.rashi} (${res.memberAstrology.nakshatra}) • Verdict: ${res.harmonyVerdict}`,
                  paragraphs: [
                    `${res.executiveSummary} All 9 Chakras Alignment % (#1 Earth Star to #9 Soul Star): ${allNineChakraPercentLine}.`,
                  ],
                  gridItems: [
                    {
                      title: `Key Parivar Strengths (${activeProfile.name} & ${res.member.name} — ${res.member.relation})`,
                      subtitle: `9-Chakra Harmony Score: ${res.overallHarmonyScore}% (${res.harmonyVerdict}) • Perfect/Harmonious Chakras: ${harmCount}/9`,
                      body: res.keyStrengths.map((s, si) => `${si + 1}. ${s}`).join(' | '),
                      highlight: `Harmonious Chakras (${harmCount}/9): ${
                        res.nineChakraDiagnostics
                          .filter((c) => c.status === 'Harmonious')
                          .map((c) => `#${c.chakraNumber} ${c.chakraName.replace(' Chakra', '')} (${c.alignmentScore}%)`)
                          .join(', ') || 'None'
                      }`,
                    },
                    {
                      title: `Key Karmic Frictions & Focus Areas (${activeProfile.name} & ${res.member.name})`,
                      subtitle: `Chakras Needing Harmony Remedies: ${chakrasNeedingHarmony.length}/9 (Only Chakras Needing Harmony Detailed Below)`,
                      body: res.keyFrictions.map((f, fi) => `${fi + 1}. ${f}`).join(' | '),
                      highlight:
                        chakrasNeedingHarmony.length > 0
                          ? `Chakras Needing Attention (${chakrasNeedingHarmony.length}/9): ${chakrasNeedingHarmony
                              .map((c) => `#${c.chakraNumber} ${c.chakraName.replace(' Chakra', '')} (${c.alignmentScore}%)`)
                              .join(', ')}`
                          : 'All 9 Chakras are naturally aligned in harmony (>=75%).',
                    },
                    {
                      title: `Vedic Astrology Family Harmony (${activeProfile.name} & ${res.member.name})`,
                      subtitle: `Bhakoot Axis: ${res.vedicAstrologyHarmony.bhakootAxisLabel} • Rashi Match: ${res.vedicAstrologyHarmony.rashiHarmonyScore}% • ${res.vedicAstrologyHarmony.taraBalaName} [${res.vedicAstrologyHarmony.taraBalaFavorability}]`,
                      body: `Rashi Lord Maitri: ${res.vedicAstrologyHarmony.rashiLordMaitri} | Solar Synergy: ${res.vedicAstrologyHarmony.sunSignSynergy} | ${res.vedicAstrologyHarmony.vedicSummary}`,
                      highlight: `Vedic Harmony Remedy: ${res.vedicAstrologyHarmony.vedicRemedy}`,
                    },
                    {
                      title: `Gemstone (Ratna) & Rudraksha Remedies (${activeProfile.name} & ${res.member.name})`,
                      subtitle: `Client Ratna: ${res.gemstoneAndRudrakshaRemedy.clientGemstone} | Member Ratna: ${res.gemstoneAndRudrakshaRemedy.memberGemstone} • Family Unity Rudraksha: ${res.gemstoneAndRudrakshaRemedy.familyUnityRudraksha}`,
                      body: `Substitute: ${res.gemstoneAndRudrakshaRemedy.gemstoneSubstitute} | Weight: ${res.gemstoneAndRudrakshaRemedy.weightAndCarat} | Metal & Finger: ${res.gemstoneAndRudrakshaRemedy.metalAndFinger} | Day & Time: ${res.gemstoneAndRudrakshaRemedy.wearingDayAndTime} | Gem Mantra: ${res.gemstoneAndRudrakshaRemedy.gemMantra}`,
                      highlight: `Client Rudraksha: ${res.gemstoneAndRudrakshaRemedy.clientRudraksha} | Member Rudraksha: ${res.gemstoneAndRudrakshaRemedy.memberRudraksha} | Method: ${res.gemstoneAndRudrakshaRemedy.rudrakshaWearingMethod} | Mantra: ${res.gemstoneAndRudrakshaRemedy.rudrakshaMantra}`,
                    },
                    ...chakrasNeedingHarmony.map((ch) => ({
                      title: `All 9 Chakras Breakdown (Needs Harmony): #${ch.chakraNumber} ${ch.chakraName} (${ch.sanskritName}) — ${ch.alignmentScore}% [${ch.status}]`,
                      subtitle: `Carrier: ${ch.affectedPerson} • Sound: ${ch.soundFrequencyHz} • Bija Mantra: ${ch.beejMantra} • Crystal: ${ch.healingCrystal} • Rudraksha: ${ch.rudrakshaMukhi}`,
                      body: `Client (${activeProfile.name}): ${ch.clientPatternDetail} | ${res.member.name} (${res.member.relation}): ${ch.memberPatternDetail} | Mutual Issue: ${ch.mutualFamilyIssue}`,
                      highlight: `1. Client Remedy: ${ch.clientRemedy} | 2. ${res.member.name} Remedy: ${ch.memberRemedy} | 3. Joint Parivar Remedy: ${ch.jointFamilyRemedy}`,
                    })),
                  ],
                  bullets:
                    mIdx === parivarReport.memberResults.length - 1
                      ? [
                          `Collective Parivar Gemstone & Rudraksha Harmony Plan: ${parivarReport.collectiveGemstoneAndRudrakshaRemedy}`,
                          parivarReport.importantDisclaimer,
                          ...clientOrAdminRemedyBullets,
                        ]
                      : undefined,
                };
              }),
            ]
          : [
              {
                heading: `1. PARIVAR MILAN: COLLECTIVE FAMILY VEDIC ASTROLOGY, 9-CHAKRA & RATNA/RUDRAKSHA HARMONY CHARTER (${activeProfile.name.toUpperCase()})`,
                subheading: `Client Natal Anchor: Mulank ${m} (${mPlanet.planet}) • Bhagyank ${b} (${bPlanet.planet}) • Rashi: ${astro.rashi} (${astro.nakshatra})`,
                paragraphs: [
                  parivarReport.collectiveHomeVastuAndParivarRemedy,
                  parivarReport.collectiveGemstoneAndRudrakshaRemedy,
                ],
                gridItems: [
                  {
                    title: `1. Earth Star (#1) to Heart Chakra (#5) Domestic Grounding & Emotional Peace`,
                    subtitle: `Vasundhara (396 Hz) • Muladhara • Svadhisthana • Manipura • Anahata (639 Hz)`,
                    body: `Keep Black Tourmaline & Himalayan Rock Salt in the South-West corner for ancestral grounding, and a natural Rose Quartz sphere in the North-East or living room to nurture unconditional family warmth, forgiveness, and mutual empathy.`,
                    highlight: `Joint Family Sankalpa: Chant "Om Sarve Bhavantu Sukhinah" (11x) together on Friday evenings.`,
                  },
                  {
                    title: `2. Throat (#6) to Soul Star Chakra (#9) Communication & Collective Grace`,
                    subtitle: `Vishuddha (741 Hz) • Ajna (852 Hz) • Sahasrara (963 Hz) • Vyapini Soul Star (1074 Hz)`,
                    body: `Place a natural White Selenite Tower and an energized Gauri Shankar + 5-Mukhi Rudraksha in the North-East (Ishan Kon) prayer altar so family dialogues remain respectful, clear, and guided by higher dharmic wisdom.`,
                    highlight: `Client Primary Family Harmony Stone: ${gemRecommend.lifeStone.primaryGem} (${gemRecommend.lifeStone.sanskritGem}) & Gauri Shankar + 5-Mukhi Rudraksha.`,
                  },
                ],
                bullets: [parivarReport.importantDisclaimer, ...clientOrAdminRemedyBullets],
              },
            ],
    },

    // =========================================================================
    // MODULE 8: NEXT 12 MONTHS ALL-INDIA FESTIVALS & VASTU BLUEPRINT (PAGES 22 TO 24)
    // =========================================================================
    // PAGE 22: Festivals 1 to 6 with All 4 Pooja Windows & Aura Cleansing
    {
      pageNumber: 22,
      moduleKey: 'festivals12Months',
      chapterTag: 'CHAPTER 22 • NEXT 12 MONTHS ALL-INDIA FESTIVALS & 4 PUJA MUHURATS (PART 1)',
      title: 'ALL-INDIA VEDIC FESTIVALS & 4 PUJA WINDOWS (PART 1)',
      subtitle: `Festivals 1 to 6: Resonance Score, All 4 Puja Windows (Siddha, Punya, Bhadra, Varjya), Aura Tip & Remedies`,
      bannerKey: 'banner',
      sections: [
        {
          heading: '1. FESTIVALS 1 TO 6 — COMPLETE 4-WINDOW PUJA MUHURATS, SIGNIFICANCE & AURA REMEDIES',
          subheading: `Calculated for ${activeProfile.name} (${astro.rashi}, ${astro.nakshatra}, Mulank ${m}, Bhagyank ${b})`,
          gridItems: festivals.slice(0, 6).map((fest, idx) => ({
            title: `${idx + 1}. ${fest.name} (${fest.hindiName}) -> ${fest.date} [${fest.personalImpactScore}% ${fest.personalVerdictTag}]`,
            subtitle: `${fest.vikramSamvatTithi} • Deity: ${fest.deity} • Ruler: ${fest.governingPlanet} (#${fest.governingNumber}) • Essence: ${fest.significance}`,
            body: `${fest.howFestivalWillBeForClient} Diya & Offerings: ${fest.personalizedRitualAndAuraRemedy.diyaAndDirection} | ${fest.personalizedRitualAndAuraRemedy.offerings}. Aura Tip: ${fest.personalizedRitualAndAuraRemedy.auraCleansingTip}`,
            highlight: `★ Siddha Puja: ${fest.auspiciousBestPoojaTime.window} (${fest.auspiciousBestPoojaTime.muhuratName}) | ✓ Punya Kaal: ${fest.sahiPoojaTime.window} | ⚠ Avoid Bhadra: ${fest.badPoojaTime.window} | ✕ Varjya: ${fest.worstPoojaTime.window} | Mantra: ${fest.personalizedRitualAndAuraRemedy.mantraForClient}`,
          })),
        },
      ],
    },

    // PAGE 23: Festivals 7 to 12 with All 4 Pooja Windows & Aura Cleansing
    {
      pageNumber: 23,
      moduleKey: 'festivals12Months',
      chapterTag: 'CHAPTER 23 • NEXT 12 MONTHS ALL-INDIA FESTIVALS & 4 PUJA MUHURATS (PART 2)',
      title: 'ALL-INDIA VEDIC FESTIVALS & 4 PUJA WINDOWS (PART 2)',
      subtitle: `Festivals 7 to 12: Resonance Score, All 4 Puja Windows (Siddha, Punya, Bhadra, Varjya), Aura Tip & Remedies`,
      bannerKey: 'banner',
      sections: [
        {
          heading: '1. FESTIVALS 7 TO 12 — COMPLETE 4-WINDOW PUJA MUHURATS, SIGNIFICANCE & AURA REMEDIES',
          subheading: `Chaturmas, Shravana, Janmashtami, Ganeshotsav & Navratri Siddha Portals for ${activeProfile.name}`,
          gridItems: festivals.slice(6, 12).map((fest, idx) => ({
            title: `${idx + 7}. ${fest.name} (${fest.hindiName}) -> ${fest.date} [${fest.personalImpactScore}% ${fest.personalVerdictTag}]`,
            subtitle: `${fest.vikramSamvatTithi} • Deity: ${fest.deity} • Ruler: ${fest.governingPlanet} (#${fest.governingNumber}) • Essence: ${fest.significance}`,
            body: `${fest.howFestivalWillBeForClient} Diya & Offerings: ${fest.personalizedRitualAndAuraRemedy.diyaAndDirection} | ${fest.personalizedRitualAndAuraRemedy.offerings}. Aura Tip: ${fest.personalizedRitualAndAuraRemedy.auraCleansingTip}`,
            highlight: `★ Siddha Puja: ${fest.auspiciousBestPoojaTime.window} (${fest.auspiciousBestPoojaTime.muhuratName}) | ✓ Punya Kaal: ${fest.sahiPoojaTime.window} | ⚠ Avoid Bhadra: ${fest.badPoojaTime.window} | ✕ Varjya: ${fest.worstPoojaTime.window} | Mantra: ${fest.personalizedRitualAndAuraRemedy.mantraForClient}`,
          })),
        },
      ],
    },

    // PAGE 24: Festivals 13 to 16 + Complete Vastu Shastra & Rudraksha Blueprint
    {
      pageNumber: 24,
      moduleKey: 'festivals12Months',
      chapterTag: 'CHAPTER 24 • ALL-INDIA FESTIVALS (PART 3) + VASTU & RUDRAKSHA BLUEPRINT',
      title: 'FESTIVALS (PART 3) + VASTU & RUDRAKSHA BLUEPRINT',
      subtitle: 'Festivals 13 to 16 (Dhanteras, Deepavali, Dev-Deepavali) + Complete Home/Office Vastu & Rudraksha Charter',
      bannerKey: 'name',
      sections: [
        {
          heading: '1. FESTIVALS 13 TO 16 — DHANTERAS, DEEPAVALI & DEV-DEEPAVALI MAHA-LAKSHMI PORTALS',
          gridItems: festivals.slice(12).map((fest, idx) => ({
            title: `${idx + 13}. ${fest.name} (${fest.hindiName}) -> ${fest.date} [${fest.personalImpactScore}% ${fest.personalVerdictTag}]`,
            subtitle: `${fest.vikramSamvatTithi} • Deity: ${fest.deity} • Ruler: ${fest.governingPlanet} (#${fest.governingNumber}) • Essence: ${fest.significance}`,
            body: `${fest.howFestivalWillBeForClient} Diya & Offerings: ${fest.personalizedRitualAndAuraRemedy.diyaAndDirection} | ${fest.personalizedRitualAndAuraRemedy.offerings}. Aura Tip: ${fest.personalizedRitualAndAuraRemedy.auraCleansingTip}`,
            highlight: `★ Siddha Puja: ${fest.auspiciousBestPoojaTime.window} (${fest.auspiciousBestPoojaTime.muhuratName}) | ✓ Punya Kaal: ${fest.sahiPoojaTime.window} | ⚠ Avoid Bhadra: ${fest.badPoojaTime.window} | ✕ Varjya: ${fest.worstPoojaTime.window} | Mantra: ${fest.personalizedRitualAndAuraRemedy.mantraForClient}`,
          })),
        },
        {
          heading: `2. COMPLETE HOME & OFFICE VASTU SHASTRA BLUEPRINT FOR MULANK ${m} & BHAGYANK ${b}`,
          table: {
            headers: ['Vastu Zone & Pillar', 'Prescribed Directional Specification', 'Activation & Spiritual Harmonization'],
            colWidths: [40, 74, 80],
            rows: [
              [
                'Work Desk & Cash Vastu',
                `Face East, North-East (Ishan Kon), or North during business calls and signings.`,
                'Keep cash locker in South-West opening towards North (Kubera Disha) with an energized Shree Yantra.',
              ],
              [
                'Sleeping & Home Vastu',
                'Sleep with head towards South or East for deep cellular recovery and calm mind.',
                'Keep North-East prayer zone clutter-free; burn pure camphor & loban at sunset.',
              ],
              [
                'Brahmasthan & Agni Kon',
                'Keep center of house (Brahmasthan) airy and open; balance South-East kitchen fire.',
                'Place a Himalayan rock salt lamp in South-East and mop floors with sea-salt water on Saturdays.',
              ],
            ],
          },
          bullets: clientOrAdminRemedyBullets,
        },
      ],
    },

    // =========================================================================
    // MODULE 9: ISLAMIC-VEDIC REMEDIES (PAGES 25 TO 26 - ONLY THESE 2 PAGES USE THE WORD "ISLAMIC")
    // =========================================================================
    // PAGE 25: All 3 Personalized Asma-ul-Husna Cards + All 5 Quranic Surah & Dua Remedies
    {
      pageNumber: 25,
      moduleKey: 'islamicVedicRemedies',
      chapterTag: 'CHAPTER 25 • ISLAMIC-VEDIC REMEDIES: ILM-UL-ADAD, 3 ASMA CARDS & 5 QURANIC DUAS',
      title: 'ISLAMIC-VEDIC REMEDIES: ABJAD, ASMA & ALL 5 DUAS',
      subtitle: `Abjad Name Total: ${islamicReport.abjadCompoundEstimate} -> Root ${islamicReport.abjadRootNumber} • Mulank ${islamicReport.mulank} • Bhagyank ${islamicReport.bhagyank} • Namank ${islamicReport.namank}`,
      bannerKey: 'islamic',
      sections: [
        {
          heading: `1. ILM-UL-ADAD (ABJAD NUMEROLOGY) & ALL 3 PERSONALIZED ASMA-UL-HUSNA WAZIFA CARDS`,
          subheading: `1. Birth Driver (Adad ${m}) • 2. Life Path Destiny (Adad ${b}) • 3. Name Vibration (Adad ${islamicReport.namank})`,
          paragraphs: [
            islamicReport.personalizedSummaryParagraph,
          ],
          table: {
            headers: ['Pillar & Planetary Sphere', 'Sacred Asma-ul-Husna & Meaning', 'Daily Tasbih & Best Prayer Time', 'Spiritual Barkat & Specific Challenge Resolved'],
            colWidths: [42, 44, 42, 66],
            rows: [
              [
                `1. Birth Driver (Mulank ${m})\n${islamicReport.primaryAsmaRemedy.planetarySphere}`,
                `${islamicReport.primaryAsmaRemedy.transliteration}\n("${islamicReport.primaryAsmaRemedy.meaning}")`,
                `${islamicReport.primaryAsmaRemedy.recommendedDailyCount}\n(Abjad: ${islamicReport.primaryAsmaRemedy.abjadCount})\nTime: ${islamicReport.primaryAsmaRemedy.bestPrayerTime}`,
                `Barkat: ${islamicReport.primaryAsmaRemedy.spiritualBenefit}\nResolved: ${islamicReport.primaryAsmaRemedy.specificChallengeSolved}`,
              ],
              [
                `2. Destiny Path (Bhagyank ${b})\n${islamicReport.destinyAsmaRemedy.planetarySphere}`,
                `${islamicReport.destinyAsmaRemedy.transliteration}\n("${islamicReport.destinyAsmaRemedy.meaning}")`,
                `${islamicReport.destinyAsmaRemedy.recommendedDailyCount}\n(Abjad: ${islamicReport.destinyAsmaRemedy.abjadCount})\nTime: ${islamicReport.destinyAsmaRemedy.bestPrayerTime}`,
                `Barkat: ${islamicReport.destinyAsmaRemedy.spiritualBenefit}\nResolved: ${islamicReport.destinyAsmaRemedy.specificChallengeSolved}`,
              ],
              [
                `3. Name Shield (Namank ${islamicReport.namank})\n${islamicReport.nameAsmaRemedy.planetarySphere}`,
                `${islamicReport.nameAsmaRemedy.transliteration}\n("${islamicReport.nameAsmaRemedy.meaning}")`,
                `${islamicReport.nameAsmaRemedy.recommendedDailyCount}\n(Abjad: ${islamicReport.nameAsmaRemedy.abjadCount})\nTime: ${islamicReport.nameAsmaRemedy.bestPrayerTime}`,
                `Barkat: ${islamicReport.nameAsmaRemedy.spiritualBenefit}\nResolved: ${islamicReport.nameAsmaRemedy.specificChallengeSolved}`,
              ],
            ],
          },
        },
        {
          heading: `2. ALL ${islamicReport.quranicRemedies.length} QURANIC SURAH, DUA, SADAQAH & HALAL GEMSTONE REMEDIES`,
          table: {
            headers: ['Life Area & Challenge', 'Surah / Dua & Transliteration', 'Recitation Protocol', 'Sadaqah & Sunnah Stone/Attar'],
            colWidths: [46, 54, 44, 50],
            rows: islamicReport.quranicRemedies.map((qr) => [
              `${qr.lifeArea}\nChallenge: ${qr.planetaryChallenge}`,
              `${qr.surahOrDuaName}\n"${qr.transliteration}"\n(${qr.translationSummary})`,
              qr.recitationProtocol,
              `Sadaqah: ${qr.sadaqahCharityItem}\nStone/Attar: ${qr.halalStoneAndAttar}`,
            ]),
          },
          bullets: clientOrAdminRemedyBullets,
        },
      ],
    },

    // PAGE 26: Complete 7-Day Dhikr & Sadaqah Schedule + Complete 1-to-9 Ilm-ul-Adad Reference Matrix + Closing Blessing & QR Seal
    {
      pageNumber: 26,
      moduleKey: 'islamicVedicRemedies',
      chapterTag: 'CHAPTER 26 • 7-DAY DHIKR, 1-9 ILM-UL-ADAD MATRIX, BLESSING & QR SEAL',
      title: '7-DAY DHIKR, 1-9 ADAD MATRIX, BLESSING & QR SEAL',
      subtitle: 'Complete Weekly Dhikr & Sadaqah Schedule + Complete 1-to-9 Ilm-ul-Adad Reference Matrix & TATHASTU Seal',
      bannerKey: 'islamic',
      includeQrVerification: true,
      includeClosingBlessing: true,
      sections: [
        {
          heading: '1. COMPLETE 7-DAY WEEKLY DHIKR, WAZIFA & SADAQAH SCHEDULE (SUNDAY TO SATURDAY)',
          table: {
            headers: ['Day & Planetary Sphere', 'Primary Sacred Dhikr & Count', 'Prescribed Daily Sadaqah Action', 'Spiritual Benefit & Focus'],
            colWidths: [42, 46, 52, 54],
            rows: islamicReport.weeklyDhikrSchedule.map((d) => [
              `${d.day}\n${d.islamicPlanet} - ${d.vedicPlanet.split(' (')[0]}`,
              `${d.primaryDhikr}\n(${d.count})`,
              d.sadaqahAction,
              d.benefit,
            ]),
          },
        },
        {
          heading: '2. COMPLETE ILM-UL-ADAD (NUMBERS 1 TO 9) ASMA-UL-HUSNA REFERENCE MATRIX',
          table: {
            headers: ['Adad & Sphere', 'Sacred Asma-ul-Husna & Meaning', 'Daily Tasbih & Prayer Time', 'Spiritual Benefit & Challenge Solved'],
            colWidths: [40, 46, 44, 64],
            rows: islamicReport.allNineAsmaRemedies.map((item) => {
              const isPersonal =
                item.number === islamicReport.mulank ||
                item.number === islamicReport.bhagyank ||
                item.number === islamicReport.namank;
              return [
                `#${item.number} ${item.planetarySphere.split('(')[0].trim()}${isPersonal ? '\n[ACTIVE IN CHART]' : ''}`,
                `${item.transliteration}\n("${item.meaning}")`,
                `${item.recommendedDailyCount}\n(${item.bestPrayerTime})`,
                `${item.spiritualBenefit} (${item.specificChallengeSolved})`,
              ];
            }),
          },
        },
      ],
    },
  ];

  // Dynamically filter pages based on active selected modules (`ctx.selectedSections`)
  const sel = ctx.selectedSections;
  let filteredPages = rawPages;
  if (sel) {
    const matching = rawPages.filter((p) => !p.moduleKey || sel[p.moduleKey]);
    filteredPages = matching.length > 0 ? matching : rawPages.filter((p) => p.moduleKey === 'nameAndCareer');
  }

  // Resolve 1–2 Page AI-Generated Complete Report Summary (Vedic + Parashar Astrology & Numerology)
  // including Next 10 Years Future (Without Remedies vs. With Remedies) + Tathastu Family Thank You & Blessings
  const summaryData: AiReportSummaryData =
    ctx.aiReportSummary ||
    buildClassicalFallbackSummary({
      profile: activeProfile,
      healerName: ctx.healerDisplayName,
      brandTitle: ctx.brandTitle,
      language: ctx.language,
    });

  const closingSummaryPagesSpec: PdfPageSpec[] = [
    {
      pageNumber: 98,
      isClosingSummaryPage: true,
      chapterTag: 'FINAL SUMMARY • COMPLETE REPORT SYNTHESIS & NEXT 10 YEARS (WITHOUT REMEDIES)',
      title: `COMPLETE REPORT SUMMARY & NEXT 10 YEARS FUTURE (${summaryData.startYear} - ${summaryData.endYear}) — PART 1 OF 2`,
      subtitle: `Simple Paragraph Summary Based on Vedic Astrology + Numerology & Parashar Astrology (BPHS Vimshottari Mahadasha) + Numerology for ${activeProfile.name}`,
      bannerKey: 'banner',
      sections: [
        {
          heading: `1. COMPLETE REPORT SUMMARY IN SIMPLE WORDS (${activeProfile.name.toUpperCase()})`,
          subheading: `Referenced With Vedic Astrology + Numerology & Parashar Hora (${summaryData.parasharMahadashaLabel})`,
          paragraphs: [
            ...summaryData.executiveSummaryParagraphs.slice(0, 2),
            summaryData.parasharVedicFoundationParagraph,
          ].filter(Boolean),
        },
        {
          heading: `2. WITHOUT REMEDIES — WHERE YOUR FUTURE GOES IN THE NEXT 10 YEARS (${summaryData.startYear} TO ${summaryData.endYear})`,
          subheading: `Honest & Easy-to-Understand Forecast Based on Parashar Dasha (${summaryData.next10YearDashaSummary}) If Remedies Are Not Followed`,
          paragraphs: summaryData.withoutRemedies10YearParagraphs.slice(0, 2).filter(Boolean),
        },
      ],
    },
    {
      pageNumber: 99,
      isClosingSummaryPage: true,
      chapterTag: 'FINAL SUMMARY • NEXT 10 YEARS (WITH REMEDIES), TATHASTU FAMILY THANK YOU & SPIRITUAL BLESSINGS',
      title: `WITH REMEDIES (NEXT 10 YEARS FUTURE) & TATHASTU FAMILY BLESSINGS — PART 2 OF 2`,
      subtitle: `Your Next 10 Years Growth Journey (${summaryData.startYear} - ${summaryData.endYear}) With Remedies + Heartfelt Thank You & Spiritual Blessings From The TATHASTU Family`,
      bannerKey: 'chakra',
      includeQrVerification: true,
      includeClosingBlessing: true,
      sections: [
        {
          heading: `1. WITH REMEDIES — WHERE YOUR FUTURE REACHES IN THE NEXT 10 YEARS (${summaryData.startYear} TO ${summaryData.endYear})`,
          subheading: `Positive Elevation in Career, Finance, Health, Family Harmony & Inner Peace Through Vedic + Parashar Astrology & Numerology`,
          paragraphs: [
            ...summaryData.withRemedies10YearParagraphs.slice(0, 2),
            summaryData.simpleRemedyRoadmapParagraph,
          ].filter(Boolean),
        },
        {
          heading: `2. HEARTFELT THANK YOU FROM THE TATHASTU FAMILY & SPIRITUAL BLESSINGS`,
          subheading: `Warm Gratitude & Divine Prayers From ${TATHASTU_BRAND_NAME} ("${TATHASTU_TAGLINE}") & Healer ${ctx.healerDisplayName}`,
          paragraphs: [
            summaryData.tathastuThankYouParagraph,
            summaryData.spiritualBlessings.join('   |   '),
          ].filter(Boolean),
        },
      ],
    },
  ];

  filteredPages = [...filteredPages, ...closingSummaryPagesSpec];

  // Dynamically generate and prepend 'Index of Modules' page at Page 1 unless skipped for raw per-module measurement
  if (!options?.skipIndexPage) {
    const pageCountSummary = calculateExactPdfPageCounts(ctx);
    const modRanges = pageCountSummary.modulePageRanges;

    type ModKey = keyof NonNullable<PdfExportContext['selectedSections']>;
    const moduleCatalog: {
      key: ModKey;
      title: string;
      chaptersAndScope: string;
      personalizedHighlight: string;
    }[] = [
      {
        key: 'nameAndCareer',
        title: 'Name, Career, 5-Pillar Ratna & Universal Validator',
        chaptersAndScope:
          'Birth Chart, 3x3 Lo-Shu Matrix, 8 Planes, Name Spellings, All Career Sectors, 5-Pillar Ratna & Vehicle/Flat/Business Validator',
        personalizedHighlight: `Mulank ${m} (${mPlanet.planet}) | Bhagyank ${b} (${bPlanet.planet}) • Best Name: ${topPerfectChoice?.suggestedName || activeProfile.name} • Primary Gem: ${gemRecommend.lifeStone.primaryGem}`,
      },
      {
        key: 'advanceMobileAudit',
        title: 'Advance Mobile Numerology, Dasha & Lo-Shu Matrix',
        chaptersAndScope:
          '10-Digit Mobile Pair Scanner, Missing/Repeated Digits, Planetary Dasha Timeline, Remedies & Ideal Number Synthesis',
        personalizedHighlight: `Mobile: ${activeProfile.mobile || '9876543210'} -> Compound ${mobileAnalysis.compoundNumber} / Root #${mobileAnalysis.singleDigit} (${mobileAnalysis.verdict})`,
      },
      {
        key: 'forecast12Months',
        title: `12-Month Vedic & Numerology Monthly Forecast (${startFormatted} – ${endFormatted})`,
        chaptersAndScope:
          'Month-by-Month Personal Month Vibrations, Career, Finance, Health, Relationships & Monthly Remedies across 12 Months',
        personalizedHighlight: `12-Month Cycle for Mulank ${m} & Bhagyank ${b} • Peak Growth & Precaution Windows Mapped`,
      },
      {
        key: 'auditedCalendar12Months',
        title: '12-Month Audited Good / Bad / Best Dates Calendar',
        chaptersAndScope:
          'Complete 365-Day Date-by-Date Classification (Siddha Best Dates, Good Dates, Neutral & Precaution/Avoid Dates)',
        personalizedHighlight: `Lucky Days: ${mPlanet.luckyDays.join(', ')} • Event-Specific Muhurat Dates for Business, Property & Travel`,
      },
      {
        key: 'transitsAndMoon12Months',
        title: 'Planetary Transits (Gochar), Hora, Purnima & Amavasya',
        chaptersAndScope:
          'Guru, Shani, Rahu-Ketu & Surya Gochar Impact on Moon Rashi + 24-Hour Planetary Hora Table + 12-Month Purnima/Amavasya',
        personalizedHighlight: `Vedic Moon Rashi: ${astro.rashi} (${astro.nakshatra}) • Lord: ${astro.rashiLord}`,
      },
      {
        key: 'dailyMantras',
        title: '7-Day Planetary Mantras & Sacred Sankalpa Schedule',
        chaptersAndScope:
          'Complete Sunday-to-Saturday Vedic Beej Mantras, Chanting Counts, Mala Selection, Disha & Morning Sankalpa Vidhi',
        personalizedHighlight: `Primary Beej Mantra: "${bPlanet.beejMantra}" (108x Daily) • Deity: ${bPlanet.deity}`,
      },
      {
        key: 'yogaAndPranayama',
        title: 'Personalized Yoga Sadhana, Asanas & Pranayama Protocol',
        chaptersAndScope:
          'Illustrated Step-by-Step Yogasanas, Therapeutic Pranayama Breathing, Mudras & Daily Holistic Sadhana Routine',
        personalizedHighlight: `Target Focus: ${(activeProfile.healthConcerns && activeProfile.healthConcerns.length > 0 ? activeProfile.healthConcerns.join(', ') : 'Complete Pranic Vitality & Stress Relief')}`,
      },
      {
        key: 'partnerMilanChakras',
        title: 'Partner Milan, 36-Guna Ashtakoot & 9-Chakra Diagnostics',
        chaptersAndScope:
          'Groom & Bride Name/DOB Compatibility Gauge, All 8 Ashtakoot Kootas, All 9 Chakras (#1 Earth Star to #9 Soul Star) & Couple Ratna',
        personalizedHighlight: `${groomProfile.name} & ${brideProfile.name} • Score: ${partnerMilan.totalPoints}/36 Gunas (${partnerMilan.overallPercentage}% — ${partnerMilan.verdict})`,
      },
      {
        key: 'parivarMilan',
        title: 'Parivar Milan (Family Harmony Graph, Vedic & 9-Chakra Diagnostics)',
        chaptersAndScope:
          'Final Conclusive Family Harmony Graph, Vedic Astrology Match, Gemstone & Rudraksha Remedies + Chakras Needing Harmony',
        personalizedHighlight:
          parivarReport.memberResults.length > 0
            ? `Family Members Analyzed: ${parivarReport.memberResults.length} • Collective Harmony: ${parivarReport.averageFamilyHarmony}% (${parivarReport.familyCollectiveVerdict})`
            : `Household Parivar Vedic Astrology, 9-Chakra & Gemstone/Rudraksha Harmony Charter`,
      },
      {
        key: 'festivals12Months',
        title: 'All-India Major Festivals Muhurat & Home/Office Vastu Blueprint',
        chaptersAndScope:
          '16 Major Festivals Personalized Siddha Puja Muhurats, Diya & Offerings + Complete Home & Office Vastu Shastra Charter',
        personalizedHighlight: `Personalized Puja Timings, Disha & Vastu Remedies for Mulank ${m} & Bhagyank ${b}`,
      },
      {
        key: 'islamicVedicRemedies',
        title: 'Ilm-ul-Adad (Abjad), Asma-ul-Husna, Quranic Duas & 7-Day Dhikr',
        chaptersAndScope:
          '3 Personalized Asma-ul-Husna Wazifa Cards, 5 Quranic Surah/Dua Remedies, 7-Day Dhikr/Sadaqah & 1–9 Adad Matrix',
        personalizedHighlight: `Abjad Root #${islamicReport.abjadRootNumber} • Primary Tasbih: ${islamicReport.primaryAsmaRemedy.transliteration} (${islamicReport.primaryAsmaRemedy.recommendedDailyCount})`,
      },
    ];

    const activeModuleEntries = moduleCatalog.filter((mItem) =>
      filteredPages.some((p) => p.moduleKey === mItem.key)
    );

    const indexPageSpec: PdfPageSpec = {
      pageNumber: 1,
      chapterTag: 'MASTER DOSSIER INDEX • TABLE OF CONTENTS & ACTIVE MODULE PAGE GUIDE',
      title: 'INDEX OF MODULES & MASTER REPORT PAGE GUIDE',
      subtitle: `Prepared for ${activeProfile.name} (DOB: ${activeProfile.dob} • Place: ${activeProfile.pob || 'New Delhi'}) • ${activeModuleEntries.length} Active Module(s) • Total ${pageCountSummary.totalPdfPages} Pages`,
      bannerKey: 'banner',
      sections: [
        {
          heading: `1. INDEX OF MODULES INCLUDED IN THIS PERSONALIZED DOSSIER (${activeModuleEntries.length} ACTIVE MODULES • PAGES 1 TO ${pageCountSummary.totalPdfPages})`,
          subheading: `Master Table of Contents Mapping Every Selected Module, Diagnostic Scope, Key Personalized Result & Exact Page Number(s)`,
          paragraphs: [
            `Welcome to the personalized ${TATHASTU_BRAND_NAME} ("${TATHASTU_TAGLINE}") Spiritual Dossier for ${activeProfile.name}. Page 1 serves as your Master Index of Modules so you can immediately locate every selected diagnostic module, prediction, and remedy across all ${pageCountSummary.totalPdfPages} pages of this report.`,
          ],
          table: {
            headers: [
              'Module # & Active Module Name',
              'Chapters, Diagnostics & Remedies Included',
              `Key Personalized Result for ${activeProfile.name}`,
              'Report Page No.',
            ],
            colWidths: [44, 62, 56, 32],
            rows: [
              [
                `00. Index of Modules & Executive Charter`,
                `Master Table of Contents, Active Module Page Directory & Core Natal/Remedy Quick Reference`,
                `Client: ${activeProfile.name} • Mulank ${m} (${mPlanet.planet}) | Bhagyank ${b} (${bPlanet.planet}) • ${astro.rashi}`,
                `Page 1\n(1 Page)`,
              ],
              ...activeModuleEntries.map((entry, idx) => {
                const rng = modRanges[entry.key];
                const pgLabel =
                  rng && rng.startPage > 0
                    ? rng.startPage === rng.endPage
                      ? `Page ${rng.startPage}\n(1 Page)`
                      : `Pages ${rng.startPage} – ${rng.endPage}\n(${rng.pageCount} Pages)`
                    : `Included`;
                return [
                  `${String(idx + 1).padStart(2, '0')}. ${entry.title}`,
                  entry.chaptersAndScope,
                  entry.personalizedHighlight,
                  pgLabel,
                ];
              }),
              [
                `${String(activeModuleEntries.length + 1).padStart(2, '0')}. Complete Report Summary, 10-Year Future (With vs. Without Remedies) & Tathastu Blessings`,
                `1-2 Page Simple Paragraph Summary (Vedic + Parashar Astrology & Numerology), Next 10 Years Future Without vs. With Remedies, Thank You & Spiritual Blessings`,
                `Parashar Dasha: ${summaryData.parasharMahadashaLabel} • Horizon: ${summaryData.startYear}-${summaryData.endYear}`,
                pageCountSummary.closingSummaryPageRange.startPage ===
                pageCountSummary.closingSummaryPageRange.endPage
                  ? `Page ${pageCountSummary.closingSummaryPageRange.startPage}\n(1 Page)`
                  : `Pages ${pageCountSummary.closingSummaryPageRange.startPage} – ${pageCountSummary.closingSummaryPageRange.endPage}\n(${pageCountSummary.closingSummaryPageRange.pageCount} Pages)`,
              ],
            ],
          },
        },
        {
          heading: `2. EXECUTIVE PERSONALIZED SNAPSHOT & CORE REMEDIES AT A GLANCE (${activeProfile.name.toUpperCase()})`,
          subheading: `Quick-Reference Summary of Core Numerology, Vedic Astrology, Name/Mobile Vibrations & Primary Remedies`,
          gridItems: [
            {
              title: `1. Core Numerology & Vedic Natal Pillars`,
              subtitle: `DOB: ${activeProfile.dob} (${activeProfile.tob || '09:30'}) • ${activeProfile.pob || 'New Delhi'}`,
              body: `Mulank (Driver): #${m} (${mPlanet.planet} / ${mPlanet.sanskritName}) | Bhagyank (Conductor): #${b} (${bPlanet.planet} / ${bPlanet.sanskritName}) | Vedic Moon Rashi: ${astro.rashi} (${astro.nakshatra}, Pada ${astro.pada}) | Sun Sign: ${astro.sunSign}.`,
              highlight: `Friendly Numbers: ${mPlanet.friendlyNumbers.join(', ')} | Lucky Days: ${mPlanet.luckyDays.join(', ')} | Lucky Color: ${mPlanet.luckyColor}`,
            },
            {
              title: `2. Name & Mobile Frequency Alignment Verdict`,
              subtitle: `Current Name: ${activeProfile.name} (#${nameAnalysis.totalChaldeanCompound} -> #${nameAnalysis.chaldeanSingle}) • Mobile: ${activeProfile.mobile || '9876543210'}`,
              body: `Recommended Top Harmonious Name Spelling: "${topPerfectChoice?.suggestedName || activeProfile.name}" (Compound #${topPerfectChoice?.compoundNumber ?? nameAnalysis.totalChaldeanCompound} -> Root #${topPerfectChoice?.singleDigit ?? nameAnalysis.chaldeanSingle} ${topPerfectChoice?.targetPlanet || nPlanet.planet}). Mobile Root #${mobileAnalysis.singleDigit} (${mobileAnalysis.verdict}).`,
              highlight: `Career & Business Domains: ${career.favorableProfessions.slice(0, 4).join(' • ')}`,
            },
            {
              title: `3. Primary 5-Pillar Ratna (Gemstone) & Rudraksha Shield`,
              subtitle: `Life-Force Stone: ${gemRecommend.lifeStone.primaryGem} (${gemRecommend.lifeStone.sanskritGem}) • Destiny Stone: ${gemRecommend.destinyStone.primaryGem}`,
              body: `Wear ${gemRecommend.lifeStone.primaryGem} (${gemRecommend.idealRattiRange}) in ${gemRecommend.lifeStone.metal} on ${gemRecommend.lifeStone.finger} on ${gemRecommend.lifeStone.wearingDay} (${gemRecommend.lifeStone.auspiciousTimeWindow}).`,
              highlight: `Personal Growth Ratna: ${nameAndGrowthRatna.personalGrowthStone.ratna.primaryGem} • Beej Mantra: "${bPlanet.beejMantra}" (108x)`,
            },
            {
              title: `4. Sacred Vastu, Daily Sadhana & Healer Attestation`,
              subtitle: `Authorized By: Healer ${ctx.healerDisplayName} (${ctx.brandTitle}) • ${ctx.healerDisplayMobile}`,
              body: `Face East or North-East (Ishan Kon) during key work and daily mantra japa. Place an energized Shree Yantra in the North-East altar and follow the date-by-date calendar & remedies on the pages mapped above.`,
              highlight: `Validity Period: ${startFormatted} – ${endFormatted} • Total Report Length: ${pageCountSummary.totalPdfPages} A4 Pages`,
            },
          ],
        },
      ],
    };

    filteredPages = [indexPageSpec, ...filteredPages];
  }

  // Re-number pages 1..N dynamically and ensure the final page ALWAYS includes the Sacred Closing Blessing,
  // Universal Gratitude, TATHASTU Family Slogan & QR Verification Seal
  const renumberedPages = filteredPages.map((pg, idx) => {
    const isLastPage = idx === filteredPages.length - 1;
    const cleanChapterSuffix = pg.chapterTag.replace(/^CHAPTER\s+\d+\s*•\s*/i, '');
    return {
      ...pg,
      pageNumber: idx + 1,
      chapterTag:
        idx === 0 && !options?.skipIndexPage
          ? pg.chapterTag
          : `CHAPTER ${String(idx + 1).padStart(2, '0')} • ${cleanChapterSuffix}`,
      includeQrVerification: isLastPage ? true : false,
      includeClosingBlessing: isLastPage ? true : false,
    };
  });

  const targetLang = ctx.language || getCurrentLanguage();
  const translated = deepTranslateReportPayload(renumberedPages, targetLang);
  return validateDynamicAiReportContent(translated, targetLang, { context: 'report' });
}

/**
 * Draws the Sacred 3x3 Vedic Lo-Shu Grid inside a Square Box Matrix on the left
 * and the Lo-Shu Plane & Arrow Theory on the right.
 */
function drawSacredLoShuSquareMatrix(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  data: LoShuSquareMatrixData
): number {
  const sqW = 56;
  const infoX = x + 3 + sqW + 4.5;
  const infoW = width - sqW - 11.5;

  doc.setFont('times', 'bold');
  doc.setFontSize(8.8);
  const titleLines = wrapPdfTextStrict(
    doc,
    'SACRED 3x3 VEDIC LO-SHU SQUARE MATRIX THEORY',
    infoW
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  const subLines = wrapPdfTextStrict(
    doc,
    `DOB: ${data.dob} - Mulank (${data.mulank}) - Bhagyank (${data.bhagyank}) Integrated`,
    infoW
  );

  const theoryLines = [
    '1. Mental Plane (Top Row 4-9-2): Governs memory, intellectual genius, vision & authority.',
    '2. Emotional / Soul Plane (Middle Row 3-5-7): Governs family harmony, heart intuition & faith.',
    '3. Practical / Material Plane (Bottom Row 8-1-6): Governs real-estate, execution, career & luxury.',
    '4. Golden Raj Yoga (Diagonal 4-5-6) & Silver Raj Yoga (Diagonal 2-5-8): Master keys to wealth.',
    '5. Active Chart Yogas & Maha Dasha are detailed directly below this Sacred 3x3 Square Box.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  const wrappedTheoryAll: string[][] = [];
  let totalTheoryLines = 0;
  for (const line of theoryLines) {
    const wrapped = wrapPdfTextStrict(doc, line, infoW);
    wrappedTheoryAll.push(wrapped);
    totalTheoryLines += wrapped.length;
  }

  const rightContentH =
    4.2 +
    titleLines.length * 3.6 +
    subLines.length * 3.2 +
    1.2 +
    totalTheoryLines * 3.25 +
    wrappedTheoryAll.length * 0.8 +
    2.6;
  const boxH = Math.max(46.5, rightContentH);

  doc.setFillColor(255, 252, 242);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.45);
  doc.roundedRect(x, y, width, boxH, 1.5, 1.5, 'FD');

  // Left: Square 3x3 Matrix Box (vertically centered inside boxH)
  const sqH = Math.min(42, boxH - 4.4);
  const sqX = x + 3;
  const sqY = y + (boxH - sqH) / 2;
  const cellW = sqW / 3;
  const cellH = sqH / 3;

  doc.setFillColor(30, 17, 54);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.rect(sqX, sqY, sqW, sqH, 'FD');

  const matrixLayout: Array<Array<{ num: number; planet: string; dir: string }>> = [
    [
      { num: 4, planet: 'Rahu (Wealth)', dir: 'SE' },
      { num: 9, planet: 'Mangal (Fame)', dir: 'S' },
      { num: 2, planet: 'Chandra (Mind)', dir: 'SW' },
    ],
    [
      { num: 3, planet: 'Guru (Wisdom)', dir: 'E' },
      { num: 5, planet: 'Budh (Balance)', dir: 'Center' },
      { num: 7, planet: 'Ketu (Intuition)', dir: 'W' },
    ],
    [
      { num: 8, planet: 'Shani (Assets)', dir: 'NE' },
      { num: 1, planet: 'Surya (Career)', dir: 'N' },
      { num: 6, planet: 'Shukra (Luxury)', dir: 'NW' },
    ],
  ];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = matrixLayout[r][c];
      const cx = sqX + c * cellW;
      const cy = sqY + r * cellH;
      const count = data.gridCounts[cell.num] || 0;
      const isPresent = count > 0;

      if (isPresent) {
        doc.setFillColor(254, 243, 199);
      } else {
        doc.setFillColor(255, 250, 240);
      }
      doc.setDrawColor(180, 83, 9);
      doc.setLineWidth(0.35);
      doc.rect(cx + 0.4, cy + 0.4, cellW - 0.8, cellH - 0.8, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.8);
      doc.setTextColor(120, 53, 15);
      doc.text(`${cell.dir} [${cell.num}]`, cx + cellW / 2, cy + 3.3, { align: 'center' });

      doc.setFont('times', 'bold');
      if (isPresent) {
        doc.setFontSize(count >= 5 ? 8.2 : 9.8);
        doc.setTextColor(15, 118, 110);
        const repeatedStr = Array(count).fill(String(cell.num)).join('');
        doc.text(repeatedStr, cx + cellW / 2, cy + cellH / 2 + 1.1, { align: 'center' });
      } else {
        doc.setTextColor(185, 28, 28);
        doc.setFontSize(7.0);
        doc.text('MISSING', cx + cellW / 2, cy + cellH / 2 + 0.9, { align: 'center' });
      }

      doc.setFont('helvetica', 'normal');
      let planetFont = 5.2;
      doc.setFontSize(planetFont);
      while (planetFont > 4.0 && doc.getTextWidth(cell.planet) > cellW - 1.8) {
        planetFont -= 0.2;
        doc.setFontSize(planetFont);
      }
      doc.setTextColor(71, 85, 105);
      doc.text(cell.planet, cx + cellW / 2, cy + cellH - 1.8, { align: 'center' });
    }
  }

  // Right side: Deep Theory of the Sacred 3x3 Square Lo-Shu Matrix
  let ry = y + 4.4;
  doc.setFont('times', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(120, 53, 15);
  drawPdfLinesStrict(doc, titleLines, infoX, ry, 3.6);
  ry += titleLines.length * 3.6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(15, 118, 110);
  drawPdfLinesStrict(doc, subLines, infoX, ry + 0.2, 3.2);
  ry += subLines.length * 3.2 + 1.2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(30, 41, 59);
  for (const wrapped of wrappedTheoryAll) {
    drawPdfLinesStrict(doc, wrapped, infoX, ry, 3.25);
    ry += wrapped.length * 3.25 + 0.8;
  }

  return boxH;
}

/**
 * Draws the Letter-by-Letter Chaldean & Pythagorean Sound Matrix inside a neat
 * multi-column cell grid on Page 2 so text never overflows outside the box.
 */
function drawLetterBreakdownGrid(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  letters: Array<{ char: string; chaldeanVal: number; pythagoreanVal: number }>
): number {
  const cleanLetters = letters.filter((l) => l.char && l.char.trim().length > 0);
  const cols = Math.min(8, Math.max(5, cleanLetters.length));
  const rows = Math.ceil(cleanLetters.length / cols);
  const cellW = (width - 5) / cols;
  const cellH = 10.8;
  const totalH = rows * cellH + 8.6;

  doc.setFillColor(254, 249, 235);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, width, totalH, 1.2, 1.2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(120, 53, 15);
  const headerLines = wrapPdfTextStrict(
    doc,
    'LETTER-BY-LETTER CHALDEAN (C) & PYTHAGOREAN (P) ACOUSTIC FREQUENCY CELL MATRIX:',
    width - 6
  );
  doc.text(headerLines[0] || '', x + 2.5, y + 4.4);

  cleanLetters.forEach((item, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    const cx = x + 2.5 + c * cellW;
    const cy = y + 6.2 + r * cellH;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.25);
    doc.roundedRect(cx + 0.5, cy, cellW - 1, cellH - 1.2, 0.8, 0.8, 'FD');

    doc.setFont('times', 'bold');
    doc.setFontSize(9.0);
    doc.setTextColor(30, 17, 54);
    doc.text(cleanPdfText(item.char.toUpperCase()), cx + cellW / 2, cy + 4.0, {
      align: 'center',
    });

    doc.setFont('helvetica', 'bold');
    const cpText = `C:${item.chaldeanVal} | P:${item.pythagoreanVal}`;
    let cpFont = 6.2;
    doc.setFontSize(cpFont);
    while (cpFont > 4.2 && doc.getTextWidth(cpText) > cellW - 2.2) {
      cpFont -= 0.2;
      doc.setFontSize(cpFont);
    }
    doc.setTextColor(15, 118, 110);
    doc.text(cpText, cx + cellW / 2, cy + 7.7, {
      align: 'center',
    });
  });

  return totalH;
}

/**
 * Strictly wraps text using the currently active jsPDF font & style with an 88% width safety
 * factor to account for PDF viewer font substitution (Helvetica -> Arial / Times -> Times New Roman)
 * so that rendered lines never cross or touch right-hand box/column borders.
 */
function wrapPdfTextStrict(doc: jsPDF, rawText: string, maxWidthMm: number): string[] {
  // 0.875 safety factor absorbs Arial/Times New Roman glyph width expansion across all PDF viewers
  const safeMaxW = Math.max(4.5, maxWidthMm * 0.875 - 0.9);
  const rawParagraphs = String(rawText ?? '').split('\n');
  const finalLines: string[] = [];

  for (const rawPara of rawParagraphs) {
    // Allow clean line breaks after slashes and pipes when tokens are dense
    const cleaned = cleanPdfText(rawPara)
      .replace(/([/])/g, '$1 ')
      .replace(/\s*\|\s*/g, ' | ')
      .trim();
    if (!cleaned) continue;

    const initialLines: string[] = doc.splitTextToSize(cleaned, safeMaxW);
    for (const rawLine of initialLines) {
      const line = String(rawLine).trim();
      if (!line) continue;
      if (doc.getTextWidth(line) <= safeMaxW) {
        finalLines.push(line);
        continue;
      }

      // Hard split any line or unbroken token that still exceeds safeMaxW
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (doc.getTextWidth(candidate) <= safeMaxW) {
          currentLine = candidate;
        } else {
          if (currentLine) {
            finalLines.push(currentLine);
            currentLine = '';
          }
          if (doc.getTextWidth(word) <= safeMaxW) {
            currentLine = word;
          } else {
            // Split by indivisible Indic Akshara (अक्षर) clusters so matras are never separated from consonants
            const aksharas = splitIntoIndicAksharas(word);
            let chunk = '';
            for (const akshara of aksharas) {
              if (doc.getTextWidth(chunk + akshara) <= safeMaxW - 1.4) {
                chunk += akshara;
              } else {
                if (chunk) finalLines.push(chunk);
                chunk = akshara;
              }
            }
            currentLine = chunk;
          }
        }
      }
      if (currentLine) finalLines.push(currentLine);
    }
  }

  return finalLines.length > 0 ? finalLines : [''];
}

/**
 * Draws an array of lines with explicit per-line Y coordinates so jsPDF's internal
 * array lineHeightFactor can never drift or overflow a box.
 */
function drawPdfLinesStrict(
  doc: jsPDF,
  lines: string[],
  x: number,
  firstBaselineY: number,
  lineHeightMm: number
): void {
  for (let i = 0; i < lines.length; i++) {
    doc.text(lines[i], x, firstBaselineY + i * lineHeightMm);
  }
}

interface ComputedGridCardLayout {
  titleLines: string[];
  subLines: string[];
  bodyLines: string[];
  highlightLines: string[];
  titleStartOffset: number;
  subStartOffset: number;
  bodyStartOffset: number;
  highlightBoxH: number;
  totalHeight: number;
}

/**
 * Unified layout computation for 2-Column Grid Cards so measurement and drawing
 * use the exact same wrapped line arrays and vertical coordinates.
 */
function computeGridCardLayout(
  doc: jsPDF,
  width: number,
  item: PdfGridItem
): ComputedGridCardLayout {
  const innerW = width - 6.0;

  doc.setFont('times', 'bold');
  doc.setFontSize(7.9);
  const titleLines = wrapPdfTextStrict(doc, item.title, innerW);

  let subLines: string[] = [];
  if (item.subtitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    subLines = wrapPdfTextStrict(doc, item.subtitle, innerW);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const bodyLines = wrapPdfTextStrict(doc, item.body, innerW);

  let highlightLines: string[] = [];
  if (item.highlight) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.7);
    highlightLines = wrapPdfTextStrict(doc, item.highlight, width - 7.8);
  }

  const titleLineH = 3.2;
  const subLineH = 2.95;
  const bodyLineH = 3.1;
  const highLineH = 2.95;

  let curOffset = 3.45;
  const titleStartOffset = curOffset;
  curOffset += titleLines.length * titleLineH;

  let subStartOffset = curOffset;
  if (subLines.length > 0) {
    subStartOffset = curOffset + 0.1;
    curOffset = subStartOffset + subLines.length * subLineH + 0.35;
  }

  const bodyStartOffset = curOffset + 0.2;
  curOffset = bodyStartOffset + bodyLines.length * bodyLineH + 0.55;

  let highlightBoxH = 0;
  if (highlightLines.length > 0) {
    highlightBoxH = highlightLines.length * highLineH + 2.4;
    curOffset += highlightBoxH + 1.4;
  } else {
    curOffset += 1.2;
  }

  const totalHeight = Math.max(15.0, curOffset);
  return {
    titleLines,
    subLines,
    bodyLines,
    highlightLines,
    titleStartOffset,
    subStartOffset,
    bodyStartOffset,
    highlightBoxH,
    totalHeight,
  };
}

function measureGridCardHeight(doc: jsPDF, width: number, item: PdfGridItem): number {
  return computeGridCardLayout(doc, width, item).totalHeight;
}

/**
 * Draws an aligned Grid Card with 100% wrapped text using the unified card layout.
 */
function drawAlignedGridCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  item: PdfGridItem
) {
  const layout = computeGridCardLayout(doc, width, item);

  setPdfFillOpacity(doc, 0.88);
  doc.setFillColor(255, 253, 246);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 1.2, 1.2, 'FD');
  setPdfFillOpacity(doc, 1.0);

  doc.setFillColor(180, 83, 9);
  doc.rect(x, y, 1.5, height, 'F');

  const textX = x + 2.9;

  // Wrapped Title
  doc.setFont('times', 'bold');
  doc.setFontSize(7.9);
  doc.setTextColor(120, 53, 15);
  drawPdfLinesStrict(doc, layout.titleLines, textX, y + layout.titleStartOffset, 3.2);

  // Wrapped Subtitle
  if (layout.subLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(146, 64, 14);
    drawPdfLinesStrict(doc, layout.subLines, textX, y + layout.subStartOffset, 2.95);
  }

  // Wrapped Body Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 41, 59);
  drawPdfLinesStrict(doc, layout.bodyLines, textX, y + layout.bodyStartOffset, 3.1);

  // Draw Complete Multi-Line Remedy / Highlight Box at bottom of card
  if (layout.highlightLines.length > 0) {
    const hy = y + height - layout.highlightBoxH - 1.1;
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.22);
    doc.roundedRect(x + 2.3, hy, width - 3.6, layout.highlightBoxH, 0.8, 0.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.7);
    doc.setTextColor(6, 95, 70);
    drawPdfLinesStrict(doc, layout.highlightLines, x + 3.5, hy + 3.05, 2.95);
  }
}

/**
 * Draws an aligned Table with automatic A4 page-break extension when rows exceed pageMaxY.
 * Measures every column using its exact rendering font style (bold for column 0, normal for others)
 * and draws every line with explicit Y coordinates so text never overflows any cell box.
 */
function drawAlignedTablePaginated(
  doc: jsPDF,
  x: number,
  startY: number,
  width: number,
  table: NonNullable<PdfSectionBlock['table']>,
  pageMaxY: number,
  onNewPage: (currentY: number) => number
): number {
  const numCols = table.headers.length;
  const colWidths =
    table.colWidths && table.colWidths.length === numCols
      ? table.colWidths.map((w) => (w / table.colWidths!.reduce((a, b) => a + b, 0)) * width)
      : Array(numCols).fill(width / numCols);

  const isDenseTable = table.rows.length >= 7;
  const headerFontSize = isDenseTable ? 6.8 : 7.2;
  const cellFontSize = isDenseTable ? 6.6 : 7.0;
  const lineH = isDenseTable ? 2.95 : 3.2;
  const cellPadX = 1.9;
  const firstBaselineOffset = 3.55;
  const bottomPad = isDenseTable ? 2.1 : 2.35;

  // Measure wrapped header lines first so multi-line column headers fit cleanly inside headerH
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(headerFontSize);
  const wrappedHeaders: string[][] = [];
  let maxHeaderLines = 1;
  for (let c = 0; c < numCols; c++) {
    const hMaxW = Math.max(8, colWidths[c] - cellPadX * 2 - 0.8);
    const hLines = wrapPdfTextStrict(doc, table.headers[c], hMaxW);
    wrappedHeaders.push(hLines);
    if (hLines.length > maxHeaderLines) maxHeaderLines = hLines.length;
  }
  const headerLineH = 2.95;
  const headerH = Math.max(6.0, maxHeaderLines * headerLineH + 2.7);

  const allWrapped: string[][][] = [];
  const rowHeights: number[] = [];

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    const wrappedCells: string[][] = [];
    let maxLines = 1;
    for (let c = 0; c < numCols; c++) {
      // CRITICAL: Match the exact font weight used when drawing column c (bold for c === 0, normal for c > 0)
      if (c === 0) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(cellFontSize);

      const maxCellTextW = Math.max(8, colWidths[c] - cellPadX * 2 - 0.8);
      const rawCell = String(row[c] ?? '');
      const subParts = rawCell
        .split('\n')
        .map((p) => cleanPdfText(p))
        .filter(Boolean);
      const lines: string[] = [];
      for (const sp of subParts) {
        const split = wrapPdfTextStrict(doc, sp, maxCellTextW);
        lines.push(...split);
      }
      if (lines.length === 0) lines.push('');
      wrappedCells.push(lines);
      if (lines.length > maxLines) maxLines = lines.length;
    }
    const rH = firstBaselineOffset + Math.max(0, maxLines - 1) * lineH + bottomPad;
    allWrapped.push(wrappedCells);
    rowHeights.push(rH);
  }

  const drawTableHeaderBar = (yPos: number) => {
    doc.setFillColor(30, 17, 54);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.3);
    doc.rect(x, yPos, width, headerH, 'FD');

    let cx = x;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(headerFontSize);
    doc.setTextColor(253, 230, 138);
    for (let c = 0; c < numCols; c++) {
      if (c > 0) {
        doc.setDrawColor(180, 83, 9);
        doc.setLineWidth(0.18);
        doc.line(cx, yPos, cx, yPos + headerH);
      }
      const hLines = wrappedHeaders[c];
      const hStartY =
        hLines.length > 1 ? yPos + 3.4 : yPos + headerH / 2 + 1.0;
      drawPdfLinesStrict(doc, hLines, cx + cellPadX, hStartY, headerLineH);
      cx += colWidths[c];
    }
    return yPos + headerH;
  };

  let curY = startY;
  const firstRowH = rowHeights[0] || 8;
  if (curY + headerH + firstRowH > pageMaxY) {
    curY = onNewPage(curY);
  }

  curY = drawTableHeaderBar(curY);

  for (let r = 0; r < table.rows.length; r++) {
    const wrappedCells = allWrapped[r];
    const rowH = rowHeights[r];

    if (curY + rowH > pageMaxY) {
      curY = onNewPage(curY);
      curY = drawTableHeaderBar(curY);
    }

    setPdfFillOpacity(doc, 0.88);
    if (r % 2 === 0) {
      doc.setFillColor(255, 253, 247);
    } else {
      doc.setFillColor(254, 246, 224);
    }
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.22);
    doc.rect(x, curY, width, rowH, 'FD');
    setPdfFillOpacity(doc, 1.0);

    let rx = x;
    for (let c = 0; c < numCols; c++) {
      if (c > 0) {
        doc.setDrawColor(234, 179, 8);
        doc.setLineWidth(0.16);
        doc.line(rx, curY, rx, curY + rowH);
      }
      if (c === 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 53, 15);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
      }
      doc.setFontSize(cellFontSize);
      drawPdfLinesStrict(
        doc,
        wrappedCells[c],
        rx + cellPadX,
        curY + firstBaselineOffset,
        lineH
      );
      rx += colWidths[c];
    }

    curY += rowH;
  }

  return curY;
}

/**
 * Draws the dedicated Ashtakoot Koota (Dimension) + Marital Domain + Max Gunas + Obtained Gunas +
 * Visual Guna Milan Chart (with graphical progress bars) + Verdict box right below the Groom & Bride details.
 */
function drawAshtakootGunaMilanChartBox(
  doc: jsPDF,
  x: number,
  startY: number,
  width: number,
  data: AshtakootGunaMilanChartData,
  pageMaxY: number,
  onNewPage: (currentY: number) => number
): number {
  // 7 Columns: # | Ashtakoot Koota (Dimension) | Marital Domain | Max Gunas | Obtained Gunas | Visual Guna Milan Chart | Verdict
  const rawColW = [8, 52, 46, 16, 18, 32, 22];
  const sumW = rawColW.reduce((a, b) => a + b, 0);
  const colW = rawColW.map((w) => (w / sumW) * width);
  const headers = [
    '#',
    'Ashtakoot Koota (Dimension)',
    'Marital Domain',
    'Max Gunas',
    'Obtained Gunas',
    'Visual Guna Milan Chart',
    'Verdict',
  ];

  const headerH = 8.4;
  const lineH = 2.85;
  const padX = 1.5;

  // Measure each dimension row height
  const measuredRows = data.dimensions.map((dim) => {
    doc.setFont('times', 'bold');
    doc.setFontSize(6.8);
    const dimLines = wrapPdfTextStrict(doc, dim.kootaDimension, colW[1] - padX * 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    const domLines = wrapPdfTextStrict(doc, dim.maritalDomain, colW[2] - padX * 2);

    const maxLines = Math.max(1, dimLines.length, domLines.length);
    const rowH = Math.max(6.4, maxLines * lineH + 2.6);
    return { dim, dimLines, domLines, rowH };
  });

  const totalRowH = 7.8;
  let curY = startY;
  if (curY + headerH + (measuredRows[0]?.rowH || 7) > pageMaxY) {
    curY = onNewPage(curY);
  }

  const drawHeader = (yPos: number): number => {
    doc.setFillColor(30, 17, 54);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.32);
    doc.rect(x, yPos, width, headerH, 'FD');

    let cx = x;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.setTextColor(253, 230, 138);
    for (let c = 0; c < headers.length; c++) {
      if (c > 0) {
        doc.setDrawColor(180, 83, 9);
        doc.setLineWidth(0.18);
        doc.line(cx, yPos, cx, yPos + headerH);
      }
      const hLines = wrapPdfTextStrict(doc, headers[c], colW[c] - 2.0);
      if (c === 0 || c === 3 || c === 4 || c === 6) {
        if (hLines.length > 1) {
          doc.text(hLines[0] || '', cx + colW[c] / 2, yPos + 3.4, { align: 'center' });
          doc.text(hLines[1] || '', cx + colW[c] / 2, yPos + 6.4, { align: 'center' });
        } else {
          doc.text(hLines[0] || '', cx + colW[c] / 2, yPos + 5.1, { align: 'center' });
        }
      } else {
        const sy = hLines.length > 1 ? yPos + 3.4 : yPos + 5.1;
        drawPdfLinesStrict(doc, hLines.slice(0, 2), cx + padX, sy, 2.9);
      }
      cx += colW[c];
    }
    return yPos + headerH;
  };

  curY = drawHeader(curY);

  for (let r = 0; r < measuredRows.length; r++) {
    const { dim, dimLines, domLines, rowH } = measuredRows[r];
    if (curY + rowH > pageMaxY) {
      curY = onNewPage(curY);
      curY = drawHeader(curY);
    }

    setPdfFillOpacity(doc, 0.9);
    if (r % 2 === 0) {
      doc.setFillColor(255, 253, 247);
    } else {
      doc.setFillColor(254, 246, 224);
    }
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.22);
    doc.rect(x, curY, width, rowH, 'FD');
    setPdfFillOpacity(doc, 1.0);

    let cx = x;
    for (let c = 0; c < colW.length; c++) {
      if (c > 0) {
        doc.setDrawColor(234, 179, 8);
        doc.setLineWidth(0.16);
        doc.line(cx, curY, cx, curY + rowH);
      }
      cx += colW[c];
    }

    const midY = curY + rowH / 2 + 1.0;

    // Col 0: #
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0);
    doc.setTextColor(180, 83, 9);
    doc.text(String(dim.index), x + colW[0] / 2, midY, { align: 'center' });

    // Col 1: Ashtakoot Koota (Dimension)
    const c1X = x + colW[0];
    doc.setFont('times', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(120, 53, 15);
    drawPdfLinesStrict(doc, dimLines, c1X + padX, curY + 3.4, lineH);

    // Col 2: Marital Domain
    const c2X = c1X + colW[1];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.setTextColor(30, 41, 59);
    drawPdfLinesStrict(doc, domLines, c2X + padX, curY + 3.4, lineH);

    // Col 3: Max Gunas
    const c3X = c2X + colW[2];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0);
    doc.setTextColor(71, 85, 105);
    doc.text(String(dim.maxGunas), c3X + colW[3] / 2, midY, { align: 'center' });

    // Col 4: Obtained Gunas
    const c4X = c3X + colW[3];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(6, 95, 70);
    doc.text(String(dim.obtainedGunas), c4X + colW[4] / 2, midY, { align: 'center' });

    // Col 5: Visual Guna Milan Chart (Graphical Progress Bar + %)
    const c5X = c4X + colW[4];
    const barW = colW[5] - 11.5;
    const barH = 2.6;
    const barX = c5X + 1.8;
    const barY = curY + (rowH - barH) / 2;

    doc.setFillColor(226, 232, 240);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.15);
    doc.roundedRect(barX, barY, barW, barH, 1.0, 1.0, 'FD');

    const fillW = Math.max(1.5, (Math.min(100, Math.max(8, dim.percentage)) / 100) * barW);
    if (dim.percentage >= 75) {
      doc.setFillColor(16, 185, 129);
    } else if (dim.percentage >= 50) {
      doc.setFillColor(245, 158, 11);
    } else {
      doc.setFillColor(225, 29, 72);
    }
    doc.roundedRect(barX, barY, fillW, barH, 1.0, 1.0, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(30, 41, 59);
    doc.text(`${dim.percentage}%`, c5X + colW[5] - 1.4, midY - 0.1, { align: 'right' });

    // Col 6: Verdict Badge
    const c6X = c5X + colW[5];
    const pillW = colW[6] - 2.6;
    const pillH = 4.2;
    const pillX = c6X + 1.3;
    const pillY = curY + (rowH - pillH) / 2;

    if (dim.verdict === 'Excellent') {
      doc.setFillColor(209, 250, 229);
      doc.setDrawColor(16, 185, 129);
      doc.setTextColor(6, 95, 70);
    } else if (dim.verdict === 'Good') {
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(217, 119, 6);
      doc.setTextColor(146, 64, 14);
    } else {
      doc.setFillColor(255, 228, 230);
      doc.setDrawColor(225, 29, 72);
      doc.setTextColor(159, 18, 57);
    }
    doc.setLineWidth(0.2);
    doc.roundedRect(pillX, pillY, pillW, pillH, 0.9, 0.9, 'FD');

    doc.setFont('helvetica', 'bold');
    const vText = cleanPdfText(dim.verdict.toUpperCase());
    let vFont = 5.6;
    doc.setFontSize(vFont);
    while (vFont > 4.2 && doc.getTextWidth(vText) > pillW - 1.6) {
      vFont -= 0.2;
      doc.setFontSize(vFont);
    }
    doc.text(vText, pillX + pillW / 2, pillY + 2.9, { align: 'center' });

    curY += rowH;
  }

  // Total Ashtakoot Guna Milan Score Footer Row
  if (curY + totalRowH > pageMaxY) {
    curY = onNewPage(curY);
  }
  doc.setFillColor(30, 17, 54);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.35);
  doc.rect(x, curY, width, totalRowH, 'FD');

  const span3W = colW[0] + colW[1] + colW[2];
  const tMidY = curY + totalRowH / 2 + 1.1;

  doc.setFont('times', 'bold');
  const totLabel = cleanPdfText(
    `TOTAL ASHTAKOOT GUNA MILAN SCORE (${data.groomName} & ${data.brideName}):`
  );
  let totFont = 7.2;
  doc.setFontSize(totFont);
  while (totFont > 4.8 && doc.getTextWidth(totLabel) > span3W - 4.0) {
    totFont -= 0.25;
    doc.setFontSize(totFont);
  }
  doc.setTextColor(253, 230, 138);
  doc.text(totLabel, x + span3W - 2.2, tMidY, { align: 'right' });

  // Max 36
  const c3X = x + span3W;
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.2);
  doc.line(c3X, curY, c3X, curY + totalRowH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(254, 243, 199);
  doc.text('36', c3X + colW[3] / 2, tMidY, { align: 'center' });

  // Obtained Total
  const c4X = c3X + colW[3];
  doc.line(c4X, curY, c4X, curY + totalRowH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(110, 231, 183);
  doc.text(String(data.totalPoints), c4X + colW[4] / 2, tMidY, { align: 'center' });

  // Overall Visual Guna Milan Bar
  const c5X = c4X + colW[4];
  doc.line(c5X, curY, c5X, curY + totalRowH);
  const totBarW = colW[5] - 11.5;
  const totBarH = 3.0;
  const totBarX = c5X + 1.8;
  const totBarY = curY + (totalRowH - totBarH) / 2;
  doc.setFillColor(51, 65, 85);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(totBarX, totBarY, totBarW, totBarH, 1.0, 1.0, 'FD');
  const totFillW = Math.max(2.0, (Math.min(100, Math.max(8, data.overallPercentage)) / 100) * totBarW);
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(totBarX, totBarY, totFillW, totBarH, 1.0, 1.0, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(253, 230, 138);
  doc.text(`${data.overallPercentage}%`, c5X + colW[5] - 1.4, tMidY, { align: 'right' });

  // Overall Verdict
  const c6X = c5X + colW[5];
  doc.line(c6X, curY, c6X, curY + totalRowH);
  doc.setFont('helvetica', 'bold');
  const ovVerdict = data.totalPoints >= 24 ? 'SHUBH MILAN' : 'REMEDY GUIDED';
  let ovFont = 6.0;
  doc.setFontSize(ovFont);
  while (ovFont > 4.4 && doc.getTextWidth(ovVerdict) > colW[6] - 2.0) {
    ovFont -= 0.2;
    doc.setFontSize(ovFont);
  }
  doc.setTextColor(110, 231, 183);
  doc.text(ovVerdict, c6X + colW[6] / 2, tMidY, { align: 'center' });

  return curY + totalRowH;
}

/**
 * Draws the Visual Parivar Harmony Graph Box (FINAL CONCLUSIVE RESULT • PARIVAR HARMONY GRAPH)
 * with graphical 0%-100% progress bars, KPI badges, and collective synthesis.
 */
function drawParivarHarmonyGraphBox(
  doc: jsPDF,
  x: number,
  startY: number,
  width: number,
  data: ParivarHarmonyGraphBoxData,
  pageMaxY: number,
  onNewPage: (currentY: number) => number
): number {
  const rawColW = [7, 46, 38, 44, 29, 30];
  const sumW = rawColW.reduce((a, b) => a + b, 0);
  const colW = rawColW.map((w) => (w / sumW) * width);
  const headers = [
    '#',
    'Family Member & Relation',
    'Birth & Astro Numbers',
    'Visual Parivar Harmony Graph',
    '9-Chakra Status',
    'Verdict',
  ];

  const kpiBarH = 7.4;
  const headerH = 6.8;
  const rowH = 6.8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  const synthLines = wrapPdfTextStrict(
    doc,
    `Final Conclusive Parivar Synthesis: ${data.collectiveSynthesis}`,
    width - 5.0
  );
  const synthBarH = Math.max(6.2, synthLines.length * 2.85 + 2.2);

  let curY = startY;
  if (curY + kpiBarH + headerH + rowH > pageMaxY) {
    curY = onNewPage(curY);
  }

  // 1. Top KPI Summary Banner
  doc.setFillColor(20, 27, 45);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.32);
  doc.rect(x, curY, width, kpiBarH, 'FD');

  const kpiW = width / 3;
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.2);
  doc.line(x + kpiW, curY, x + kpiW, curY + kpiBarH);
  doc.line(x + kpiW * 2, curY, x + kpiW * 2, curY + kpiBarH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.setTextColor(110, 231, 183);
  doc.text(
    cleanPdfText(`OVERALL PARIVAR HARMONY: ${data.averageFamilyHarmony}%`),
    x + kpiW / 2,
    curY + 4.7,
    { align: 'center' }
  );

  doc.setTextColor(253, 230, 138);
  const strongTxt = cleanPdfText(`STRONGEST BOND: ${data.strongestBondLabel}`);
  let stFont = 6.0;
  doc.setFontSize(stFont);
  while (stFont > 4.5 && doc.getTextWidth(strongTxt) > kpiW - 2.4) {
    stFont -= 0.2;
    doc.setFontSize(stFont);
  }
  doc.text(strongTxt, x + kpiW + kpiW / 2, curY + 4.7, { align: 'center' });

  doc.setTextColor(253, 164, 175);
  const prioTxt = cleanPdfText(`PRIORITY REMEDIES: ${data.priorityRemedyBondLabel}`);
  let prFont = 6.0;
  doc.setFontSize(prFont);
  while (prFont > 4.5 && doc.getTextWidth(prioTxt) > kpiW - 2.4) {
    prFont -= 0.2;
    doc.setFontSize(prFont);
  }
  doc.setFontSize(prFont);
  doc.text(prioTxt, x + kpiW * 2 + kpiW / 2, curY + 4.7, { align: 'center' });

  curY += kpiBarH;

  // 2. Table Header for Conclusive Graph
  const drawGraphHeader = (yPos: number): number => {
    doc.setFillColor(30, 17, 54);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.28);
    doc.rect(x, yPos, width, headerH, 'FD');

    let cx = x;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.1);
    doc.setTextColor(253, 230, 138);
    for (let c = 0; c < headers.length; c++) {
      if (c > 0) {
        doc.setDrawColor(180, 83, 9);
        doc.setLineWidth(0.16);
        doc.line(cx, yPos, cx, yPos + headerH);
      }
      doc.text(cleanPdfText(headers[c]), cx + colW[c] / 2, yPos + 4.4, { align: 'center' });
      cx += colW[c];
    }
    return yPos + headerH;
  };

  curY = drawGraphHeader(curY);

  // 3. Each Family Member Row with Graphical Progress Bar
  for (let r = 0; r < data.members.length; r++) {
    const m = data.members[r];
    if (curY + rowH > pageMaxY) {
      curY = onNewPage(curY);
      curY = drawGraphHeader(curY);
    }

    setPdfFillOpacity(doc, 0.9);
    if (r % 2 === 0) {
      doc.setFillColor(255, 253, 247);
    } else {
      doc.setFillColor(254, 246, 224);
    }
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.2);
    doc.rect(x, curY, width, rowH, 'FD');
    setPdfFillOpacity(doc, 1.0);

    let cx = x;
    for (let c = 0; c < colW.length; c++) {
      if (c > 0) {
        doc.setDrawColor(234, 179, 8);
        doc.setLineWidth(0.15);
        doc.line(cx, curY, cx, curY + rowH);
      }
      cx += colW[c];
    }

    const midY = curY + rowH / 2 + 1.0;

    // Col 0: #
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(180, 83, 9);
    doc.text(String(m.index), x + colW[0] / 2, midY, { align: 'center' });

    // Col 1: Family Member & Relation
    const c1X = x + colW[0];
    doc.setFont('times', 'bold');
    doc.setFontSize(6.7);
    doc.setTextColor(120, 53, 15);
    const nameRelStr = cleanPdfText(`${m.name} (${m.relation})`);
    doc.text(nameRelStr, c1X + 1.5, curY + 2.9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.7);
    doc.setTextColor(71, 85, 105);
    const dobLines = wrapPdfTextStrict(doc, m.dobAndPlace, colW[1] - 2.6);
    doc.text(dobLines[0] || '', c1X + 1.5, curY + 5.6);

    // Col 2: Mulank, Bhagyank & Rashi
    const c2X = c1X + colW[1];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.1);
    doc.setTextColor(30, 41, 59);
    const mbrLines = wrapPdfTextStrict(doc, m.mulankBhagyankRashi, colW[2] - 2.4);
    doc.text(mbrLines[0] || '', c2X + colW[2] / 2, midY, { align: 'center' });

    // Col 3: Visual Parivar Harmony Graph Bar + %
    const c3X = c2X + colW[2];
    const barW = colW[3] - 12.5;
    const barH = 2.8;
    const barX = c3X + 1.8;
    const barY = curY + (rowH - barH) / 2;

    doc.setFillColor(226, 232, 240);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.15);
    doc.roundedRect(barX, barY, barW, barH, 1.0, 1.0, 'FD');

    const fillW = Math.max(1.8, (Math.min(100, Math.max(8, m.harmonyScore)) / 100) * barW);
    if (m.harmonyScore >= 76) {
      doc.setFillColor(16, 185, 129);
    } else if (m.harmonyScore >= 64) {
      doc.setFillColor(245, 158, 11);
    } else {
      doc.setFillColor(225, 29, 72);
    }
    doc.roundedRect(barX, barY, fillW, barH, 1.0, 1.0, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${m.harmonyScore}%`, c3X + colW[3] - 1.5, midY, { align: 'right' });

    // Col 4: 9-Chakra Status
    const c4X = c3X + colW[3];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.9);
    doc.setTextColor(6, 95, 70);
    doc.text(
      cleanPdfText(`${m.harmoniousCount}/9 OK | ${m.needsHarmonyCount} Fix`),
      c4X + colW[4] / 2,
      midY,
      { align: 'center' }
    );

    // Col 5: Verdict Pill
    const c5X = c4X + colW[4];
    const pillW = colW[5] - 2.2;
    const pillH = 4.2;
    const pillX = c5X + 1.1;
    const pillY = curY + (rowH - pillH) / 2;

    if (m.harmonyScore >= 76) {
      doc.setFillColor(209, 250, 229);
      doc.setDrawColor(16, 185, 129);
      doc.setTextColor(6, 95, 70);
    } else if (m.harmonyScore >= 64) {
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(217, 119, 6);
      doc.setTextColor(146, 64, 14);
    } else {
      doc.setFillColor(255, 228, 230);
      doc.setDrawColor(225, 29, 72);
      doc.setTextColor(159, 18, 57);
    }
    doc.setLineWidth(0.18);
    doc.roundedRect(pillX, pillY, pillW, pillH, 0.8, 0.8, 'FD');

    doc.setFont('helvetica', 'bold');
    const vStr = cleanPdfText(m.verdict.toUpperCase());
    let vf = 5.3;
    doc.setFontSize(vf);
    while (vf > 4.0 && doc.getTextWidth(vStr) > pillW - 1.2) {
      vf -= 0.2;
      doc.setFontSize(vf);
    }
    doc.text(vStr, pillX + pillW / 2, pillY + 2.85, { align: 'center' });

    curY += rowH;
  }

  // 4. Bottom Collective Parivar Synthesis Bar
  if (curY + synthBarH > pageMaxY) {
    curY = onNewPage(curY);
  }
  doc.setFillColor(254, 249, 235);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.28);
  doc.rect(x, curY, width, synthBarH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(120, 53, 15);
  drawPdfLinesStrict(doc, synthLines, x + 2.2, curY + 3.2, 2.85);

  return curY + synthBarH;
}

const SHREE_YANTRA_PLATE_ASSET_PATH = '/assets/aistudio/wp8754154_d55216c3.jpg';

/**
 * Generates a 100% aspect-ratio-locked (360x360 1:1 Square) Sacred Plate:
 * - On all non-Islamic pages (`page.bannerKey !== 'islamic'`), renders the authentic uploaded
 *   Shree Yantra image (`/assets/aistudio/wp8754154_d55216c3.jpg`) using exact aspect-ratio-preserving
 *   `object-fit: contain` math inside a royal gold-framed square plate so 0% is stretched or cropped.
 * - On Islamic remedy pages (`page.bannerKey === 'islamic'`), NEVER uses Sri/Shree Yantra;
 *   renders Islamic Ilm-ul-Adad & Rub el Hizb 8-pointed star Noor geometry.
 */
function createUniquePageSacredMedallionDataUrl(
  physicalPageNum: number,
  loadedArtImages: (HTMLImageElement | null)[],
  page: PdfPageSpec,
  shreeYantraPlateImg?: HTMLImageElement | null,
  rawIslamicImg?: HTMLImageElement | null
): string | null {
  try {
    const size = 360;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const isIslamicPage = page.bannerKey === 'islamic';

    // 1. NON-ISLAMIC PAGES: Render Authentic Uploaded Shree Yantra Image (100% Unstretched)
    if (!isIslamicPage && shreeYantraPlateImg) {
      ctx.fillStyle = '#f6ec65';
      ctx.fillRect(0, 0, size, size);

      const pad = 10;
      const boxSize = size - pad * 2;
      const iw = shreeYantraPlateImg.naturalWidth || shreeYantraPlateImg.width || 1;
      const ih = shreeYantraPlateImg.naturalHeight || shreeYantraPlateImg.height || 1;
      const scale = Math.min(boxSize / iw, boxSize / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = pad + (boxSize - dw) / 2;
      const dy = pad + (boxSize - dh) / 2;

      ctx.drawImage(shreeYantraPlateImg, dx, dy, dw, dh);

      // Royal double gold frame around the Shree Yantra plate
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, size - 6, size - 6);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, size - 16, size - 16);

      return canvas.toDataURL('image/jpeg', 0.95);
    }

    // 2. ISLAMIC REMEDIES PAGES: Strictly Islamic Noor & Rub el Hizb Geometry (Never Sri Yantra)
    if (isIslamicPage) {
      const panX = ((physicalPageNum * 19 + page.pageNumber * 7) % 84) / 100 + 0.08;
      const panY = ((physicalPageNum * 31 + page.pageNumber * 13) % 84) / 100 + 0.08;
      if (rawIslamicImg) {
        drawImageCover(ctx, rawIslamicImg, 0, 0, size, size, panX, panY);
      } else {
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, size, size);
      }

      const radGrad = ctx.createRadialGradient(
        size / 2,
        size / 2,
        20,
        size / 2,
        size / 2,
        size * 0.65
      );
      radGrad.addColorStop(0, 'rgba(6, 78, 59, 0.56)');
      radGrad.addColorStop(1, 'rgba(15, 23, 42, 0.86)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 5;
      ctx.strokeRect(10, 10, size - 20, size - 20);
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, size - 36, size - 36);

      ctx.strokeStyle = 'rgba(167, 243, 208, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 142, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(253, 230, 138, 0.72)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, 116, 0, Math.PI * 2);
      ctx.stroke();

      // Rub el Hizb 8-pointed Star (Two overlapping squares at 45 degrees)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.6;
      const sq = 136;
      ctx.strokeRect(-sq / 2, -sq / 2, sq, sq);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = '#a7f3d0';
      ctx.strokeRect(-sq / 2, -sq / 2, sq, sq);
      ctx.restore();

      ctx.fillStyle = 'rgba(6, 78, 59, 0.94)';
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.6;
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 12px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ILM-UL-ADAD', cx, cy - 11);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText(`NOOR SEAL #${physicalPageNum}`, cx, cy + 6);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.fillText('ASMA-UL-HUSNA', cx, cy + 22);

      return canvas.toDataURL('image/jpeg', 0.92);
    }

    // 3. Fallback if shreeYantraPlateImg failed to load on non-Islamic page
    const validImgs = loadedArtImages.filter((im): im is HTMLImageElement => Boolean(im));
    const panX = ((physicalPageNum * 19 + page.pageNumber * 7) % 84) / 100 + 0.08;
    const panY = ((physicalPageNum * 31 + page.pageNumber * 13) % 84) / 100 + 0.08;

    if (validImgs.length > 0) {
      const primaryImg = validImgs[(physicalPageNum * 3 + page.pageNumber) % validImgs.length];
      drawImageCover(ctx, primaryImg, 0, 0, size, size, panX, panY);
    } else {
      ctx.fillStyle = '#1e1136';
      ctx.fillRect(0, 0, size, size);
    }

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    return canvas.toDataURL('image/jpeg', 0.92);
  } catch {
    return null;
  }
}

/**
 * Fills any remaining blank space at the bottom of an A4 page (when availH >= 9.5mm)
 * with a 100% Unstretched Centered Sacred Yantra Medallion (1:1 aspect ratio) flanked by
 * Highlighted Spiritual Insight & Prescribed Remedy Callout Boxes with scaled-up typography
 * so that every single page looks rich, balanced, clear, and completely free of blank space or stretched images.
 */
function drawContextualChapterArtFiller(
  doc: jsPDF,
  x: number,
  startY: number,
  width: number,
  maxBottomY: number,
  page: PdfPageSpec,
  medallionDataUrl: string | null,
  circularLogoDataUrl: string | null,
  ctx: PdfExportContext,
  physicalPageNum: number
): void {
  const availH = maxBottomY - startY;
  if (availH < 9.5) return;

  const boxY = startY + 0.6;
  const boxH = Math.max(8.5, availH - 1.0);
  const isIslamicPage = page.bannerKey === 'islamic';

  const headThemeMap: Record<
    string,
    {
      bannerTitle: string;
      mantraNote: string;
      leftBoxTitle: string;
      leftBoxText: string;
      rightBoxTitle: string;
      rightBoxText: string;
      bottomSutraTitle: string;
      bottomSutraText: string;
    }
  > = {
    name: {
      bannerTitle: 'SACRED VEDIC NAME, AKSHARA SOUND & SHREE YANTRA ALIGNMENT',
      mantraNote:
        'Acoustic name vibrations harmonize your personal sankalpa with cosmic planetary frequencies for career authority, wealth magnetism & public goodwill.',
      leftBoxTitle: 'KEY NAME & DESTINY VIBRATION HIGHLIGHT',
      leftBoxText:
        'Writing your aligned spelling 27 times daily in saffron or gold ink activates solar authority, executive recognition, and smooth financial inflows.',
      rightBoxTitle: 'PRESCRIBED VEDIC CAREER SANKALPA BOX',
      rightBoxText:
        'Keep your signature inclined upward at 15 degrees with no backward slash; chant your ruling Graha Beej Mantra 108 times every morning facing East.',
      bottomSutraTitle: 'GOLDEN VEDIC SUTRA FOR CAREER AUTHORITY & FINANCIAL MAGNETISM',
      bottomSutraText:
        'When your birth Mulank, Bhagyank, and spoken Name Chaldean compound vibrate in friendly harmonic resonance, obstacles dissolve automatically and high-value opportunities manifest effortlessly.',
    },
    mobile: {
      bannerTitle: 'SACRED 3x3 LO-SHU COSMIC MATRIX & SHREE YANTRA HARMONY',
      mantraNote:
        'Every mobile call and digital transaction broadcasts your 10-digit numeric wave; aligning missing Lo-Shu planes stabilizes cashflow & mental peace.',
      leftBoxTitle: '3x3 LO-SHU MATRIX BALANCE HIGHLIGHT',
      leftBoxText:
        'Your mobile digits act as a 24x7 frequency transmitter. Strengthening missing Lo-Shu numbers through elemental crystals and yantras restores complete planetary balance.',
      rightBoxTitle: 'DAILY DIGITAL & FINANCIAL REMEDY BOX',
      rightBoxText:
        'Set a Golden Pyrite / Shree Yantra wallpaper on your lock screen and initiate important banking or client calls during auspicious Choghadiya windows.',
      bottomSutraTitle: 'SACRED NUMEROLOGY DIRECTIVE FOR WEALTH & COMMUNICATION HARMONY',
      bottomSutraText:
        'Balancing the Mental (4-9-2), Emotional (3-5-7), and Practical (8-1-6) planes of your Lo-Shu Birth Chart creates an unbreakable foundation of prosperity and family peace.',
    },
    transit: {
      bannerTitle: 'NAVAGRAHA CELESTIAL MANDALA, JYOTISH DASHA & SHREE YANTRA',
      mantraNote:
        'Planetary transits, Mahadasha cycles & auspicious Choghadiya windows unlock maximum success when actions are timed with your ruling Grahas.',
      leftBoxTitle: 'RULING GRAHA & DASHA TIMING HIGHLIGHT',
      leftBoxText:
        'Aligning major career, investment, and property decisions with your favorable Antardasha and Abhijit Muhurat multiplies success and prevents hidden delays.',
      rightBoxTitle: 'PRESCRIBED 43-DAY GRAHA SHANTI REMEDY',
      rightBoxText:
        'Offer water to Surya Dev in a copper vessel at sunrise, light a pure cow-ghee diya at dusk, and perform weekly Dana for your dasha lord with devotion.',
      bottomSutraTitle: 'VEDIC JYOTISH & LAL KITAB MASTER KARMA SUTRA',
      bottomSutraText:
        'Planetary placements indicate past-life prarabdha karma, while conscious spiritual remedies, disciplined ethics, and seva empower you to elevate your present destiny.',
    },
    chakra: {
      bannerTitle: '9-CHAKRA KUNDALINI PRANIC HEALING, VEDIC YOGA & SHREE YANTRA',
      mantraNote:
        'Daily Surya Namaskar, Nadi Shodhana Pranayama & Beej Mantra meditation awaken dormant pranic energy across all 9 subtle psychic centers.',
      leftBoxTitle: 'PRANIC CHAKRA & YOGA ASANA HIGHLIGHT',
      leftBoxText:
        'Practicing your birth-chart-aligned Yoga postures for 15 minutes at Brahma Muhurta clears nadis, balances endocrine vitality, and sharpens intuition.',
      rightBoxTitle: 'DAILY PRANAYAMA & DHYANA PROTOCOL',
      rightBoxText:
        'Perform 9 rounds of Anulom Vilom followed by 11 rounds of Bhramari Pranayama and silent Beej Mantra dhyana to seal your aura against stress and fatigue.',
      bottomSutraTitle: 'VEDIC AYURVEDA, YOGA & PRANA SHAKTI TRANSFORMATION SUTRA',
      bottomSutraText:
        'Where Prana flows harmoniously, disease and anxiety cannot linger; rhythmic breathwork and mindful yogic alignment awaken the inner healer within every cell.',
    },
    islamic: {
      bannerTitle: 'SACRED ILM-UL-ADAD GEOMETRY, ASMA-UL-HUSNA & NOOR HARMONY',
      mantraNote:
        'Consistent daily Tasbih, sincere Dua at Fajr/Maghrib, and timely Sadaqah dissolve planetary obstacles and invite divine Barkat & protection.',
      leftBoxTitle: 'ABJAD ADAD & ASMA-UL-HUSNA HIGHLIGHT',
      leftBoxText:
        'Reciting the Divine Name matching your personal Abjad vibration after Fajr and Isha prayers illuminates the heart with peace, clarity, and divine grace.',
      rightBoxTitle: 'PRESCRIBED SADAQAH & BARKAT PROTOCOL',
      rightBoxText:
        'Maintain regular charitable giving (Sadaqah) on your ruling day and keep pure rose or oudh attar during prayers to attract abundant Rizq and protection.',
      bottomSutraTitle: 'SACRED SPIRITUAL HARMONY, DUA & DIVINE BARKAT DIRECTIVE',
      bottomSutraText:
        'Sincere gratitude, ethical livelihood, and daily remembrance of the Divine open unseen doors of sustenance, healing, and lasting family harmony.',
    },
    banner: {
      bannerTitle: 'TATHASTU DIVINE COSMIC ENERGY, VASTU SHASTRA & SHREE YANTRA',
      mantraNote:
        'Aligning your home and workspace directions with North-East Ishan Kon and your birth chart elements creates a permanent shield of prosperity.',
      leftBoxTitle: 'SACRED VASTU & DIRECTIONAL HIGHLIGHT',
      leftBoxText:
        'Keep the North-East (Ishan Kon) and Brahmasthan of your home and office clutter-free, well-lit, and energized with a copper Kalash or Shree Yantra.',
      rightBoxTitle: '43-DAY SPIRITUAL DISCIPLINE PROTOCOL',
      rightBoxText:
        'Follow your personalized mantra, Shree Yantra, rudraksha, and charity remedies continuously for 43 days with full faith to anchor permanent positive shifts.',
      bottomSutraTitle: 'MASTER SPIRITUAL SYNTHESIS & VASTU PROTECTION DIRECTIVE',
      bottomSutraText:
        'When your inner sankalpa, daily spiritual sadhana, and surrounding Vastu space vibrate in harmony, peace, health, and abundance flow naturally.',
    },
  };

  const theme = headThemeMap[page.bannerKey || 'banner'] || headThemeMap.banner;

  // Case 1: Compact Highlighted Callout Strip (availH between 9.5mm and 20mm)
  if (boxH < 19.0) {
    setPdfFillOpacity(doc, 0.95);
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(180, 83, 9);
    doc.setLineWidth(0.42);
    doc.roundedRect(x, boxY, width, boxH, 1.2, 1.2, 'FD');
    setPdfFillOpacity(doc, 1.0);

    doc.setFillColor(180, 83, 9);
    doc.rect(x, boxY, 3.2, boxH, 'F');
    doc.rect(x + width - 3.2, boxY, 3.2, boxH, 'F');

    doc.setFont('times', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(120, 53, 15);
    const shortLines = wrapPdfTextStrict(
      doc,
      `KEY SPIRITUAL HIGHLIGHT (${ctx.activeProfile.name.toUpperCase()}): ${theme.mantraNote}`,
      width - 11.0
    );
    const maxL = Math.max(1, Math.floor((boxH - 2.2) / 3.4));
    const drawnL = shortLines.slice(0, maxL);
    const totalTextH = drawnL.length * 3.4;
    const startTextY = boxY + Math.max(3.6, (boxH - totalTextH) / 2 + 2.6);
    for (let i = 0; i < drawnL.length; i++) {
      doc.text(drawnL[i], x + width / 2, startTextY + i * 3.4, { align: 'center' });
    }
    return;
  }

  // Outer Sacred Container Frame
  setPdfFillOpacity(doc, 0.94);
  doc.setFillColor(255, 251, 238);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.45);
  doc.roundedRect(x, boxY, width, boxH, 1.5, 1.5, 'FD');
  setPdfFillOpacity(doc, 1.0);

  // Top Royal Gold Header Strip (auto-fit font so banner title never overflows)
  const topBarH = 5.4;
  doc.setFillColor(isIslamicPage ? 6 : 180, isIslamicPage ? 95 : 83, isIslamicPage ? 70 : 9);
  doc.rect(x, boxY, width, topBarH, 'F');

  const topHeaderStr = cleanPdfText(
    isIslamicPage
      ? `${theme.bannerTitle} • ROOHANI INSIGHT #${physicalPageNum}`
      : `${theme.bannerTitle} • SHREE YANTRA PLATE #${physicalPageNum}`
  );
  let topHeaderFont = 7.4;
  doc.setFont('times', 'bold');
  doc.setFontSize(topHeaderFont);
  while (topHeaderFont > 5.2 && doc.getTextWidth(topHeaderStr) > width - 6.0) {
    topHeaderFont -= 0.3;
    doc.setFontSize(topHeaderFont);
  }
  doc.setTextColor(255, 251, 235);
  doc.text(topHeaderStr, x + width / 2, boxY + 3.8, { align: 'center' });

  const innerY = boxY + topBarH + 1.4;
  const innerH = Math.max(12.0, boxH - topBarH - 2.6);

  // Case 2: Medium Height (19mm <= boxH < 34mm) -> Centered Unstretched 1:1 Square Medallion + Highlighted Boxes
  if (boxH < 34.0) {
    const sqSize = Math.min(innerH - 1.2, 22.0);
    const centerImgX = x + (width - sqSize) / 2;
    const sideW = (width - sqSize - 8.4) / 2;

    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 2.2, innerY, sideW, innerH - 0.6, 1.0, 1.0, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(120, 53, 15);
    const lLines = wrapPdfTextStrict(doc, theme.leftBoxText, sideW - 3.6);
    const maxSideLines = Math.max(1, Math.floor((innerH - 2.2) / 3.25));
    drawPdfLinesStrict(doc, lLines.slice(0, maxSideLines), x + 4.0, innerY + 3.6, 3.25);

    if (medallionDataUrl) {
      const imgY = innerY + (innerH - 0.6 - sqSize) / 2;
      doc.addImage(
        medallionDataUrl,
        'JPEG',
        centerImgX,
        imgY,
        sqSize,
        sqSize,
        undefined,
        'FAST'
      );
      doc.setDrawColor(isIslamicPage ? 16 : 180, isIslamicPage ? 185 : 83, isIslamicPage ? 129 : 9);
      doc.setLineWidth(0.4);
      doc.rect(centerImgX, imgY, sqSize, sqSize);
    }

    const rightX = centerImgX + sqSize + 2.0;
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.3);
    doc.roundedRect(rightX, innerY, sideW, innerH - 0.6, 1.0, 1.0, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(6, 95, 70);
    const rLines = wrapPdfTextStrict(doc, theme.rightBoxText, sideW - 3.6);
    drawPdfLinesStrict(doc, rLines.slice(0, maxSideLines), rightX + 1.8, innerY + 3.6, 3.25);
    return;
  }

  // Case 3: Tall Remaining Space (boxH >= 34mm up to 170mm)
  // 100% Unstretched 1:1 Square Medallion in the CENTER + Left & Right Highlighted Boxes + Bottom Highlighted Sutra Box
  const hasBottomHighlightPanel = boxH >= 64.0;
  const bottomPanelH = hasBottomHighlightPanel ? Math.min(58.0, Math.max(22.0, innerH * 0.42)) : 0;
  const topRowH = hasBottomHighlightPanel ? innerH - bottomPanelH - 2.2 : innerH - 0.6;

  const medallionSize = Math.min(topRowH - 5.5, 50.0);
  const medallionX = x + (width - medallionSize) / 2;
  const medallionY = innerY + Math.max(0.6, (topRowH - medallionSize - 4.4) / 2);

  const sideBoxW = (width - medallionSize - 8.8) / 2;
  const leftBoxX = x + 2.4;
  const rightBoxX = medallionX + medallionSize + 2.0;

  const titleFontPt = topRowH >= 42 ? 8.5 : 7.8;
  const bodyFontPt = topRowH >= 42 ? 7.9 : 7.3;
  const bodyLineH = topRowH >= 42 ? 3.55 : 3.25;

  // 1) Left Highlighted Spiritual Insight Box
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.38);
  doc.roundedRect(leftBoxX, innerY, sideBoxW, topRowH, 1.2, 1.2, 'FD');

  doc.setFillColor(180, 83, 9);
  doc.rect(leftBoxX, innerY, sideBoxW, 4.8, 'F');
  const cleanLeftTitle = cleanPdfText(theme.leftBoxTitle);
  let leftBarFont = 7.0;
  doc.setFont('times', 'bold');
  doc.setFontSize(leftBarFont);
  while (leftBarFont > 4.6 && doc.getTextWidth(cleanLeftTitle) > sideBoxW - 3.0) {
    leftBarFont -= 0.3;
    doc.setFontSize(leftBarFont);
  }
  doc.setTextColor(255, 251, 235);
  doc.text(cleanLeftTitle, leftBoxX + sideBoxW / 2, innerY + 3.4, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(titleFontPt);
  doc.setTextColor(120, 53, 15);
  const leftLeadLines = wrapPdfTextStrict(
    doc,
    `Personal Guidance for ${ctx.activeProfile.name}:`,
    sideBoxW - 4.4
  );
  drawPdfLinesStrict(doc, leftLeadLines.slice(0, 2), leftBoxX + 2.2, innerY + 8.6, bodyLineH);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(bodyFontPt);
  doc.setTextColor(30, 41, 59);
  const leftBodyLines = wrapPdfTextStrict(
    doc,
    `${theme.leftBoxText} ${theme.mantraNote}`,
    sideBoxW - 4.4
  );
  const leftBodyStartY = innerY + 8.8 + Math.min(2, leftLeadLines.length) * bodyLineH;
  const maxLeftBodyLines = Math.max(
    1,
    Math.floor((topRowH - (leftBodyStartY - innerY) - 1.6) / bodyLineH)
  );
  drawPdfLinesStrict(
    doc,
    leftBodyLines.slice(0, maxLeftBodyLines),
    leftBoxX + 2.2,
    leftBodyStartY,
    bodyLineH
  );

  // 2) CENTER 100% Unstretched 1:1 Square Sacred Plate (Shree Yantra for Vedic/General, Ilm-ul-Adad Noor for Islamic)
  if (medallionDataUrl) {
    doc.setFillColor(isIslamicPage ? 6 : 246, isIslamicPage ? 78 : 236, isIslamicPage ? 59 : 101);
    doc.setDrawColor(isIslamicPage ? 16 : 180, isIslamicPage ? 185 : 83, isIslamicPage ? 129 : 9);
    doc.setLineWidth(0.5);
    doc.roundedRect(
      medallionX - 0.8,
      medallionY - 0.8,
      medallionSize + 1.6,
      medallionSize + 1.6,
      1.2,
      1.2,
      'FD'
    );

    doc.addImage(
      medallionDataUrl,
      'JPEG',
      medallionX,
      medallionY,
      medallionSize,
      medallionSize,
      undefined,
      'FAST'
    );

    const capY = medallionY + medallionSize + 1.1;
    if (capY + 3.6 <= innerY + topRowH + 0.6) {
      doc.setFillColor(isIslamicPage ? 6 : 120, isIslamicPage ? 95 : 53, isIslamicPage ? 70 : 15);
      doc.roundedRect(medallionX, capY, medallionSize, 3.8, 0.8, 0.8, 'F');
      const capLabel = isIslamicPage
        ? medallionSize < 26
          ? `ADAD NOOR #${physicalPageNum}`
          : `ILM-UL-ADAD NOOR #${physicalPageNum}`
        : medallionSize < 26
        ? `SHREE YANTRA #${physicalPageNum}`
        : `SHREE YANTRA PLATE #${physicalPageNum}`;
      let capFont = 5.9;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(capFont);
      while (capFont > 3.8 && doc.getTextWidth(capLabel) > medallionSize - 2.2) {
        capFont -= 0.25;
        doc.setFontSize(capFont);
      }
      doc.setTextColor(253, 230, 138);
      doc.text(capLabel, medallionX + medallionSize / 2, capY + 2.6, { align: 'center' });
    }
  }

  // 3) Right Highlighted Prescribed Remedy & Action Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.38);
  doc.roundedRect(rightBoxX, innerY, sideBoxW, topRowH, 1.2, 1.2, 'FD');

  doc.setFillColor(6, 95, 70);
  doc.rect(rightBoxX, innerY, sideBoxW, 4.8, 'F');
  const cleanRightTitle = cleanPdfText(theme.rightBoxTitle);
  let rightBarFont = 7.0;
  doc.setFont('times', 'bold');
  doc.setFontSize(rightBarFont);
  while (rightBarFont > 4.6 && doc.getTextWidth(cleanRightTitle) > sideBoxW - 3.0) {
    rightBarFont -= 0.3;
    doc.setFontSize(rightBarFont);
  }
  doc.setTextColor(236, 253, 245);
  doc.text(cleanRightTitle, rightBoxX + sideBoxW / 2, innerY + 3.4, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(titleFontPt);
  doc.setTextColor(6, 95, 70);
  const rightLeadLines = wrapPdfTextStrict(
    doc,
    `Prescribed by Healer ${ctx.healerDisplayName}:`,
    sideBoxW - 4.4
  );
  drawPdfLinesStrict(doc, rightLeadLines.slice(0, 2), rightBoxX + 2.2, innerY + 8.6, bodyLineH);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(bodyFontPt);
  doc.setTextColor(30, 41, 59);
  const rightBodyLines = wrapPdfTextStrict(
    doc,
    `${theme.rightBoxText} Practice consistently for 43 days with devotion and positive sankalpa.${
      !ctx.isHealerReport
        ? ' Visit www.tathastulight.com for 100% genuine & authentic Rudraksha, Crystals, Home Cleansing Material, Precious & Semi-Precious Stones.'
        : ''
    }`,
    sideBoxW - 4.4
  );
  const rightBodyStartY = innerY + 8.8 + Math.min(2, rightLeadLines.length) * bodyLineH;
  const maxRightBodyLines = Math.max(
    1,
    Math.floor((topRowH - (rightBodyStartY - innerY) - 1.6) / bodyLineH)
  );
  drawPdfLinesStrict(
    doc,
    rightBodyLines.slice(0, maxRightBodyLines),
    rightBoxX + 2.2,
    rightBodyStartY,
    bodyLineH
  );

  // 4) Full-Width Bottom Highlighted Sacred Sutra Callout Box (when boxH >= 64mm)
  if (hasBottomHighlightPanel && bottomPanelH > 16) {
    const botY = innerY + topRowH + 1.8;
    const botW = width - 4.8;
    const botX = x + 2.4;

    doc.setFillColor(254, 249, 195);
    doc.setDrawColor(180, 83, 9);
    doc.setLineWidth(0.42);
    doc.roundedRect(botX, botY, botW, bottomPanelH, 1.2, 1.2, 'FD');

    doc.setFillColor(146, 64, 14);
    doc.rect(botX, botY, botW, 5.0, 'F');
    const botHeaderStr = cleanPdfText(`${theme.bottomSutraTitle} • ${page.title.toUpperCase()}`);
    let botHeaderFont = 7.6;
    doc.setFont('times', 'bold');
    doc.setFontSize(botHeaderFont);
    while (botHeaderFont > 5.0 && doc.getTextWidth(botHeaderStr) > botW - 5.0) {
      botHeaderFont -= 0.25;
      doc.setFontSize(botHeaderFont);
    }
    doc.setTextColor(255, 251, 235);
    doc.text(botHeaderStr, botX + botW / 2, botY + 3.5, { align: 'center' });

    const logoPad = circularLogoDataUrl ? 18.0 : 0;
    const sutraTextW = botW - logoPad - 6.0;
    const sutraFontPt = bottomPanelH >= 32 ? 8.8 : 8.1;
    const sutraLineH = bottomPanelH >= 32 ? 3.9 : 3.5;

    doc.setFont('times', 'bold');
    doc.setFontSize(sutraFontPt);
    doc.setTextColor(120, 53, 15);
    const sutraLines = wrapPdfTextStrict(
      doc,
      `"${theme.bottomSutraText}" — Sacred Chapter Synthesis for ${ctx.activeProfile.name} (DOB: ${ctx.activeProfile.dob || 'Verified'}) under ${ctx.brandTitle}.`,
      sutraTextW
    );
    const maxSutraLines = Math.max(1, Math.floor((bottomPanelH - 7.2) / sutraLineH));
    drawPdfLinesStrict(doc, sutraLines.slice(0, maxSutraLines), botX + 3.0, botY + 9.2, sutraLineH);

    if (circularLogoDataUrl) {
      const lSize = Math.min(14.5, bottomPanelH - 7.0);
      doc.addImage(
        circularLogoDataUrl,
        'PNG',
        botX + botW - lSize - 2.4,
        botY + 5.0 + (bottomPanelH - 5.0 - lSize) / 2,
        lSize,
        lSize,
        undefined,
        'FAST'
      );
    }
  }
}

/**
 * Generates a high-resolution 1:1 square PNG illustration of a Vedic Yoga Posture (Asana)
 * so every posture in the Visual Yoga Posture Card Gallery is rendered with a crisp anatomical figure & chakra halo in the PDF.
 */
function createYogaPostureIllustrationPngDataUrl(
  diagramType: YogaPosturePrescription['diagramType'],
  chakraColor: string = '#F59E0B'
): string | null {
  const canvas = document.createElement('canvas');
  canvas.width = 220;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Deep cosmic slate card background
  const bgGrad = ctx.createRadialGradient(110, 110, 15, 110, 110, 108);
  bgGrad.addColorStop(0, '#1E1B4B');
  bgGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 220, 220);

  // Sacred Chakra Aura Rings
  ctx.save();
  ctx.strokeStyle = chakraColor || '#F59E0B';
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(110, 105, 76, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(110, 105, 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Golden Yoga Mat Base
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(28, 184);
  ctx.lineTo(192, 184);
  ctx.stroke();

  // Draw anatomical posture silhouette in luminous gold & emerald
  ctx.save();
  ctx.strokeStyle = '#FDE68A';
  ctx.fillStyle = '#F59E0B';
  ctx.lineWidth = 6.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const drawHead = (hx: number, hy: number, r: number = 13) => {
    ctx.beginPath();
    ctx.arc(hx, hy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  if (diagramType === 'surya_namaskar') {
    drawHead(110, 56);
    ctx.beginPath();
    ctx.moveTo(110, 72);
    ctx.lineTo(110, 128);
    ctx.moveTo(110, 128);
    ctx.lineTo(94, 180);
    ctx.moveTo(110, 128);
    ctx.lineTo(126, 180);
    ctx.moveTo(110, 88);
    ctx.lineTo(84, 70);
    ctx.lineTo(110, 48);
    ctx.moveTo(110, 88);
    ctx.lineTo(136, 70);
    ctx.lineTo(110, 48);
    ctx.stroke();
  } else if (diagramType === 'vrikshasana') {
    drawHead(110, 52);
    ctx.beginPath();
    ctx.moveTo(110, 68);
    ctx.lineTo(110, 126);
    ctx.lineTo(110, 180);
    ctx.moveTo(110, 126);
    ctx.lineTo(142, 145);
    ctx.lineTo(112, 148);
    ctx.moveTo(110, 82);
    ctx.lineTo(88, 52);
    ctx.lineTo(110, 26);
    ctx.moveTo(110, 82);
    ctx.lineTo(132, 52);
    ctx.lineTo(110, 26);
    ctx.stroke();
  } else if (diagramType === 'trikonasana') {
    drawHead(66, 98);
    ctx.beginPath();
    ctx.moveTo(78, 104);
    ctx.lineTo(122, 126);
    ctx.lineTo(74, 180);
    ctx.moveTo(122, 126);
    ctx.lineTo(164, 180);
    ctx.moveTo(96, 114);
    ctx.lineTo(74, 174);
    ctx.moveTo(96, 114);
    ctx.lineTo(118, 54);
    ctx.stroke();
  } else if (diagramType === 'bhujangasana') {
    drawHead(68, 86);
    ctx.beginPath();
    ctx.moveTo(74, 102);
    ctx.quadraticCurveTo(96, 152, 134, 174);
    ctx.lineTo(182, 178);
    ctx.moveTo(86, 124);
    ctx.lineTo(76, 178);
    ctx.stroke();
  } else if (diagramType === 'balasana') {
    drawHead(74, 156, 11);
    ctx.beginPath();
    ctx.moveTo(88, 158);
    ctx.quadraticCurveTo(124, 134, 156, 158);
    ctx.lineTo(116, 178);
    ctx.moveTo(84, 166);
    ctx.lineTo(44, 178);
    ctx.stroke();
  } else if (diagramType === 'setu_bandhasana') {
    drawHead(162, 168, 11);
    ctx.beginPath();
    ctx.moveTo(148, 168);
    ctx.lineTo(108, 126);
    ctx.lineTo(68, 138);
    ctx.lineTo(64, 178);
    ctx.moveTo(144, 172);
    ctx.lineTo(96, 178);
    ctx.stroke();
  } else if (diagramType === 'paschimottanasana') {
    drawHead(126, 136, 11);
    ctx.beginPath();
    ctx.moveTo(74, 174);
    ctx.lineTo(174, 174);
    ctx.moveTo(74, 174);
    ctx.quadraticCurveTo(88, 136, 116, 142);
    ctx.lineTo(166, 164);
    ctx.stroke();
  } else {
    // padmasana / vajrasana seated meditation
    drawHead(110, 66);
    ctx.beginPath();
    ctx.moveTo(110, 82);
    ctx.lineTo(110, 144);
    ctx.moveTo(110, 144);
    ctx.lineTo(68, 168);
    ctx.lineTo(124, 174);
    ctx.moveTo(110, 144);
    ctx.lineTo(152, 168);
    ctx.lineTo(96, 174);
    ctx.moveTo(110, 98);
    ctx.lineTo(76, 134);
    ctx.lineTo(68, 158);
    ctx.moveTo(110, 98);
    ctx.lineTo(144, 134);
    ctx.lineTo(152, 158);
    ctx.stroke();
  }
  ctx.restore();

  // Outer Gold Border
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 216, 216);

  return canvas.toDataURL('image/png');
}

/**
 * Renders the 2-column Visual Yoga Posture Card Gallery in the PDF with anatomical Asana diagrams,
 * chakra badges, astrological/health basis, step-by-step cues, and therapeutic benefits.
 */
function drawYogaAsanaVisualCardGallery(
  doc: jsPDF,
  x: number,
  startY: number,
  width: number,
  asanas: YogaPosturePrescription[],
  pageMaxY: number,
  onNewPage: (currentY: number) => number
): number {
  let curY = startY;
  const cols = 2;
  const gapX = 2.4;
  const gapY = 1.6;
  const cardW = (width - gapX) / 2;
  const imgSize = 21.0;
  const textOffsetX = imgSize + 4.2;
  const textMaxW = cardW - textOffsetX - 2.4;
  const numRows = Math.ceil(asanas.length / cols);

  for (let r = 0; r < numRows; r++) {
    const rowItems = [asanas[r * 2], asanas[r * 2 + 1]].filter(Boolean);
    const layouts = rowItems.map((asana, cIdx) => {
      const idxNum = r * 2 + cIdx + 1;
      doc.setFont('times', 'bold');
      doc.setFontSize(7.6);
      const titleLines = wrapPdfTextStrict(
        doc,
        `${idxNum}. ${asana.sanskritName} (${asana.englishName})`,
        textMaxW
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      const subLines = wrapPdfTextStrict(
        doc,
        `${asana.durationOrReps} | ${asana.targetChakra}`,
        textMaxW
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.6);
      const basisLines = wrapPdfTextStrict(doc, `Basis: ${asana.astrologicalReason}`, textMaxW);
      const stepLines = wrapPdfTextStrict(
        doc,
        `Steps: ${asana.stepByStepAlignment.join(' ')}`,
        cardW - 5.2
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      const benLines = wrapPdfTextStrict(
        doc,
        `Benefits: ${asana.therapeuticBenefits.join(' - ')}`,
        cardW - 5.2
      );

      const topTextH =
        titleLines.length * 3.0 + subLines.length * 2.75 + basisLines.length * 2.8 + 1.5;
      const topBlockH = Math.max(imgSize + 1.5, topTextH);
      const bottomBlockH = stepLines.length * 2.8 + benLines.length * 2.8 + 3.2;
      const cardH = topBlockH + bottomBlockH + 2.4;

      return {
        asana,
        titleLines,
        subLines,
        basisLines,
        stepLines,
        benLines,
        topBlockH,
        cardH,
      };
    });

    const rowH = Math.max(...layouts.map((l) => l.cardH), 28.0);
    if (curY + rowH > pageMaxY) {
      curY = onNewPage(curY);
    }

    for (let c = 0; c < layouts.length; c++) {
      const lay = layouts[c];
      const cx = x + c * (cardW + gapX);

      setPdfFillOpacity(doc, 0.92);
      doc.setFillColor(255, 253, 246);
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.32);
      doc.roundedRect(cx, curY, cardW, rowH, 1.2, 1.2, 'FD');
      setPdfFillOpacity(doc, 1.0);

      doc.setFillColor(180, 83, 9);
      doc.rect(cx, curY, 1.5, rowH, 'F');

      // Draw Asana Visual Posture Illustration
      const imgData = createYogaPostureIllustrationPngDataUrl(
        lay.asana.diagramType,
        lay.asana.chakraColor
      );
      if (imgData) {
        doc.addImage(
          imgData,
          'PNG',
          cx + 2.4,
          curY + 2.0,
          imgSize,
          imgSize,
          undefined,
          'FAST'
        );
      }

      const tx = cx + textOffsetX;
      let ty = curY + 3.8;

      doc.setFont('times', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(120, 53, 15);
      drawPdfLinesStrict(doc, lay.titleLines, tx, ty, 3.0);
      ty += lay.titleLines.length * 3.0;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(6, 95, 70);
      drawPdfLinesStrict(doc, lay.subLines, tx, ty, 2.75);
      ty += lay.subLines.length * 2.75 + 0.3;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.6);
      doc.setTextColor(30, 41, 59);
      drawPdfLinesStrict(doc, lay.basisLines, tx, ty, 2.8);

      let bty = curY + lay.topBlockH + 2.6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.6);
      doc.setTextColor(30, 41, 59);
      drawPdfLinesStrict(doc, lay.stepLines, cx + 2.6, bty, 2.8);
      bty += lay.stepLines.length * 2.8 + 0.6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(146, 64, 14);
      drawPdfLinesStrict(doc, lay.benLines, cx + 2.6, bty, 2.8);
    }

    curY += rowH + gapY;
  }

  return curY;
}

export interface PdfModulePageRange {
  startPage: number;
  endPage: number;
  pageCount: number;
}

const PER_MODULE_PAGE_COUNT_CACHE = new Map<
  string,
  {
    perModule: Record<keyof NonNullable<PdfExportContext['selectedSections']>, number>;
    closingSummaryPages: number;
  }
>();

/**
 * Computes the exact physical A4 PDF page count (`doc.getNumberOfPages()`) for the currently
 * selected modules (including Page 1: Index of Modules and the final 1–2 page AI Summary & Blessings)
 * as well as the exact PDF page count and starting/ending page numbers for each individual module.
 * Caches per-module measurements per profile + language so UI checkbox toggles are instantaneous.
 */
export function calculateExactPdfPageCounts(ctx: PdfExportContext): {
  totalPdfPages: number;
  modulePageCounts: Record<keyof NonNullable<PdfExportContext['selectedSections']>, number>;
  modulePageRanges: Record<
    keyof NonNullable<PdfExportContext['selectedSections']>,
    PdfModulePageRange
  >;
  closingSummaryPageRange: PdfModulePageRange;
} {
  type ModuleKey = keyof NonNullable<PdfExportContext['selectedSections']>;
  const allModuleKeys: ModuleKey[] = [
    'nameAndCareer',
    'advanceMobileAudit',
    'forecast12Months',
    'auditedCalendar12Months',
    'transitsAndMoon12Months',
    'dailyMantras',
    'yogaAndPranayama',
    'partnerMilanChakras',
    'parivarMilan',
    'festivals12Months',
    'islamicVedicRemedies',
  ];

  const famSig = (ctx.activeProfile.parivarMembers || [])
    .map((fm) => `${fm.name}:${fm.dob}:${fm.tob || ''}:${fm.relation}`)
    .join('|');
  const cacheKey = [
    ctx.activeProfile.id,
    ctx.activeProfile.name,
    ctx.activeProfile.dob,
    ctx.activeProfile.tob || '',
    ctx.activeProfile.pob || '',
    ctx.activeProfile.mobile || '',
    ctx.activeProfile.partnerName || '',
    ctx.activeProfile.partnerDob || '',
    (ctx.activeProfile.healthConcerns || []).join(','),
    famSig,
    ctx.language || 'en',
    ctx.isHealerReport ? 'H' : 'C',
    ctx.aiReportSummary?.source || 'base',
    ctx.aiReportSummary?.generatedAtIso || '',
  ].join('||');

  let cachedEntry = PER_MODULE_PAGE_COUNT_CACHE.get(cacheKey);

  if (!cachedEntry) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    installUnicodeCanvasTextRenderer(doc, true, ctx.language);

    const pageW = 210;
    const marginX = 8;
    const contentW = pageW - marginX * 2; // 194mm
    const bodyStartY = 30.8;
    const footerStartY = 275.5;
    const pageMaxY = footerStartY - 1.4; // 274.1mm

    const measurePagesList = (
      pages: PdfPageSpec[]
    ): { total: number; perModule: Record<ModuleKey, number>; closingSummaryPages: number } => {
      const perModule: Record<ModuleKey, number> = {
        nameAndCareer: 0,
        advanceMobileAudit: 0,
        forecast12Months: 0,
        auditedCalendar12Months: 0,
        transitsAndMoon12Months: 0,
        dailyMantras: 0,
        yogaAndPranayama: 0,
        partnerMilanChakras: 0,
        parivarMilan: 0,
        festivals12Months: 0,
        islamicVedicRemedies: 0,
      };
      let total = 0;
      let closingSummaryPages = 0;

      for (let pIdx = 0; pIdx < pages.length; pIdx++) {
        const page = pages[pIdx];
        const mKey: ModuleKey = page.moduleKey || 'nameAndCareer';
        const addPageForCurrentChapter = (): number => {
          total += 1;
          if (page.isClosingSummaryPage) {
            closingSummaryPages += 1;
          } else {
            perModule[mKey] = (perModule[mKey] || 0) + 1;
          }
          return bodyStartY;
        };

        let curY = addPageForCurrentChapter();

        for (let sIdx = 0; sIdx < page.sections.length; sIdx++) {
          const sec = page.sections[sIdx];

          doc.setFont('times', 'bold');
          doc.setFontSize(8.5);
          const secHeadingLines = wrapPdfTextStrict(doc, sec.heading, contentW - 8.5);

          let secSubLines: string[] = [];
          if (sec.subheading) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.8);
            secSubLines = wrapPdfTextStrict(doc, sec.subheading, contentW - 8.5);
          }

          const secHeaderH =
            2.1 +
            secHeadingLines.length * 3.45 +
            (secSubLines.length > 0 ? secSubLines.length * 2.95 + 0.8 : 0.6);

          if (curY + secHeaderH + 22 > pageMaxY && curY > bodyStartY + 2) {
            curY = addPageForCurrentChapter();
          }
          curY += secHeaderH + 1.2;

          if (sec.paragraphs && sec.paragraphs.length > 0) {
            let totalParaLines = 0;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.4);
            for (const p of sec.paragraphs) {
              totalParaLines += wrapPdfTextStrict(doc, p, contentW - 7.0).length;
            }
            const paraBoxH = totalParaLines * 3.3 + sec.paragraphs.length * 1.0 + 2.4;
            if (curY + paraBoxH > pageMaxY && curY > bodyStartY + 2) {
              curY = addPageForCurrentChapter();
            }
            curY += paraBoxH + 1.2;
          }

          if (sec.letterGridCells && sec.letterGridCells.length > 0) {
            const cleanLetters = sec.letterGridCells.filter(
              (l) => l.char && l.char.trim().length > 0
            );
            const cols = Math.min(8, Math.max(5, cleanLetters.length));
            const rows = Math.ceil(cleanLetters.length / cols);
            const estLetterGridH = rows * 10.8 + 8.6;
            if (curY + estLetterGridH > pageMaxY && curY > bodyStartY + 2) {
              curY = addPageForCurrentChapter();
            }
            curY += estLetterGridH + 1.3;
          }

          if (sec.loShuSquareMatrix) {
            if (curY + 52 > pageMaxY && curY > bodyStartY + 2) {
              curY = addPageForCurrentChapter();
            }
            const sqW = 56;
            const infoW = contentW - sqW - 11.5;
            doc.setFont('times', 'bold');
            doc.setFontSize(8.8);
            const titleLines = wrapPdfTextStrict(
              doc,
              'SACRED 3x3 VEDIC LO-SHU SQUARE MATRIX THEORY',
              infoW
            );
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.4);
            const subLines = wrapPdfTextStrict(
              doc,
              `DOB: ${sec.loShuSquareMatrix.dob} - Mulank (${sec.loShuSquareMatrix.mulank}) - Bhagyank (${sec.loShuSquareMatrix.bhagyank}) Integrated`,
              infoW
            );
            const theoryLines = [
              '1. Mental Plane (Top Row 4-9-2): Governs memory, intellectual genius, vision & authority.',
              '2. Emotional / Soul Plane (Middle Row 3-5-7): Governs family harmony, heart intuition & faith.',
              '3. Practical / Material Plane (Bottom Row 8-1-6): Governs real-estate, execution, career & luxury.',
              '4. Golden Raj Yoga (Diagonal 4-5-6) & Silver Raj Yoga (Diagonal 2-5-8): Master keys to wealth.',
              '5. Active Chart Yogas & Maha Dasha are detailed directly below this Sacred 3x3 Square Box.',
            ];
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.3);
            let totalTheoryLines = 0;
            for (const line of theoryLines) {
              totalTheoryLines += wrapPdfTextStrict(doc, line, infoW).length;
            }
            const rightContentH =
              4.2 +
              titleLines.length * 3.6 +
              subLines.length * 3.2 +
              1.2 +
              totalTheoryLines * 3.25 +
              theoryLines.length * 0.8 +
              2.6;
            const usedH = Math.max(46.5, rightContentH);
            curY += usedH + 1.3;
          }

          if (sec.parivarHarmonyGraphBox) {
            const gBox = sec.parivarHarmonyGraphBox;
            const summaryLines = wrapPdfTextStrict(
              doc,
              `Collective Parivar Synthesis & Home Vastu Remedy: ${gBox.collectiveSynthesis}`,
              contentW - 7.6
            );
            const memberRowH = 11.2;
            const totalGraphBoxH =
              15.5 +
              gBox.members.length * (memberRowH + 1.6) +
              summaryLines.length * 3.0 +
              4.2;
            if (curY + totalGraphBoxH > pageMaxY && curY > bodyStartY + 2) {
              curY = addPageForCurrentChapter();
            }
            curY += totalGraphBoxH + 1.5;
          }

          if (sec.yogaAsanaGallery && sec.yogaAsanaGallery.length > 0) {
            const asanas = sec.yogaAsanaGallery;
            const cols = 2;
            const gapX = 2.4;
            const gapY = 1.6;
            const cardW = (contentW - gapX) / 2;
            const imgSize = 21.0;
            const textOffsetX = imgSize + 4.2;
            const textMaxW = cardW - textOffsetX - 2.4;
            const numRows = Math.ceil(asanas.length / cols);
            for (let r = 0; r < numRows; r++) {
              const rowItems = [asanas[r * 2], asanas[r * 2 + 1]].filter(Boolean);
              const cardHeights = rowItems.map((asana, cIdx) => {
                const idxNum = r * 2 + cIdx + 1;
                doc.setFont('times', 'bold');
                doc.setFontSize(7.6);
                const titleLines = wrapPdfTextStrict(
                  doc,
                  `${idxNum}. ${asana.sanskritName} (${asana.englishName})`,
                  textMaxW
                );
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.5);
                const subLines = wrapPdfTextStrict(
                  doc,
                  `${asana.durationOrReps} | ${asana.targetChakra}`,
                  textMaxW
                );
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.6);
                const basisLines = wrapPdfTextStrict(
                  doc,
                  `Basis: ${asana.astrologicalReason}`,
                  textMaxW
                );
                const stepLines = wrapPdfTextStrict(
                  doc,
                  `Steps: ${asana.stepByStepAlignment.join(' ')}`,
                  cardW - 5.2
                );
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.5);
                const benLines = wrapPdfTextStrict(
                  doc,
                  `Benefits: ${asana.therapeuticBenefits.join(' - ')}`,
                  cardW - 5.2
                );
                const topTextH =
                  titleLines.length * 3.0 +
                  subLines.length * 2.75 +
                  basisLines.length * 2.8 +
                  1.5;
                const topBlockH = Math.max(imgSize + 1.5, topTextH);
                const bottomBlockH = stepLines.length * 2.8 + benLines.length * 2.8 + 3.2;
                return topBlockH + bottomBlockH + 2.4;
              });
              const rowH = Math.max(...cardHeights, 28.0);
              if (curY + rowH > pageMaxY) {
                curY = addPageForCurrentChapter();
              }
              curY += rowH + gapY;
            }
            curY += 1.0;
          }

          if (sec.ashtakootChartBox) {
            const rawColW = [8, 52, 46, 16, 18, 32, 22];
            const sumW = rawColW.reduce((a, b) => a + b, 0);
            const colW = rawColW.map((w) => (w / sumW) * contentW);
            const headerH = 8.4;
            const lineH = 2.85;
            const padX = 1.5;
            const measuredRows = sec.ashtakootChartBox.dimensions.map((dim) => {
              doc.setFont('times', 'bold');
              doc.setFontSize(6.8);
              const dimLines = wrapPdfTextStrict(doc, dim.kootaDimension, colW[1] - padX * 2);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(6.6);
              const domLines = wrapPdfTextStrict(doc, dim.maritalDomain, colW[2] - padX * 2);
              const maxLines = Math.max(1, dimLines.length, domLines.length);
              return Math.max(6.4, maxLines * lineH + 2.6);
            });
            const totalRowH = 7.8;
            if (curY + headerH + (measuredRows[0] || 7) > pageMaxY) {
              curY = addPageForCurrentChapter();
            }
            curY += headerH;
            for (let r = 0; r < measuredRows.length; r++) {
              const rowH = measuredRows[r];
              if (curY + rowH > pageMaxY) {
                curY = addPageForCurrentChapter();
                curY += headerH;
              }
              curY += rowH;
            }
            if (curY + totalRowH > pageMaxY) {
              curY = addPageForCurrentChapter();
            }
            curY += totalRowH + 1.3;
          }

          if (sec.table) {
            const table = sec.table;
            const numCols = table.headers.length;
            const colWidths =
              table.colWidths && table.colWidths.length === numCols
                ? table.colWidths.map(
                    (w) => (w / table.colWidths!.reduce((a, b) => a + b, 0)) * contentW
                  )
                : Array(numCols).fill(contentW / numCols);
            const isDenseTable = table.rows.length >= 7;
            const headerFontSize = isDenseTable ? 6.8 : 7.2;
            const cellFontSize = isDenseTable ? 6.6 : 7.0;
            const lineH = isDenseTable ? 2.95 : 3.2;
            const cellPadX = 1.9;
            const firstBaselineOffset = 3.55;
            const bottomPad = isDenseTable ? 2.1 : 2.35;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(headerFontSize);
            let maxHeaderLines = 1;
            for (let c = 0; c < numCols; c++) {
              const hMaxW = Math.max(8, colWidths[c] - cellPadX * 2 - 0.8);
              const hLines = wrapPdfTextStrict(doc, table.headers[c], hMaxW);
              if (hLines.length > maxHeaderLines) maxHeaderLines = hLines.length;
            }
            const headerH = Math.max(6.0, maxHeaderLines * 2.95 + 2.7);

            const rowHeights: number[] = [];
            for (let r = 0; r < table.rows.length; r++) {
              const row = table.rows[r];
              let maxLines = 1;
              for (let c = 0; c < numCols; c++) {
                doc.setFont('helvetica', c === 0 ? 'bold' : 'normal');
                doc.setFontSize(cellFontSize);
                const maxCellTextW = Math.max(8, colWidths[c] - cellPadX * 2 - 0.8);
                const rawCell = String(row[c] ?? '');
                const subParts = rawCell
                  .split('\n')
                  .map((p) => cleanPdfText(p))
                  .filter(Boolean);
                const lines: string[] = [];
                for (const sp of subParts) {
                  lines.push(...wrapPdfTextStrict(doc, sp, maxCellTextW));
                }
                if (lines.length === 0) lines.push('');
                if (lines.length > maxLines) maxLines = lines.length;
              }
              rowHeights.push(firstBaselineOffset + Math.max(0, maxLines - 1) * lineH + bottomPad);
            }

            const firstRowH = rowHeights[0] || 8;
            if (curY + headerH + firstRowH > pageMaxY) {
              curY = addPageForCurrentChapter();
            }
            curY += headerH;
            for (let r = 0; r < table.rows.length; r++) {
              const rowH = rowHeights[r];
              if (curY + rowH > pageMaxY) {
                curY = addPageForCurrentChapter();
                curY += headerH;
              }
              curY += rowH;
            }
            curY += 1.3;
          }

          if (sec.gridItems && sec.gridItems.length > 0) {
            const items = sec.gridItems;
            const cols = 2;
            const numRows = Math.ceil(items.length / cols);
            const gapX = 2.4;
            const gapY = 1.6;
            const cardW = (contentW - gapX) / 2;
            for (let r = 0; r < numRows; r++) {
              const leftItem = items[r * 2];
              const rightItem = items[r * 2 + 1];
              const hLeft = leftItem ? measureGridCardHeight(doc, cardW, leftItem) : 14.5;
              const hRight = rightItem ? measureGridCardHeight(doc, cardW, rightItem) : 14.5;
              const rowH = Math.max(hLeft, hRight) + 0.5;
              if (curY + rowH > pageMaxY && curY > bodyStartY + 2) {
                curY = addPageForCurrentChapter();
              }
              curY += rowH + gapY;
            }
          }

          if (sec.bullets && sec.bullets.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.3);
            let totalBulletLines = 0;
            for (const bText of sec.bullets) {
              totalBulletLines += wrapPdfTextStrict(
                doc,
                `* ${cleanPdfText(bText)}`,
                contentW - 7.0
              ).length;
            }
            const bulBoxH = totalBulletLines * 3.25 + sec.bullets.length * 0.85 + 2.8;
            if (curY + bulBoxH > pageMaxY && curY > bodyStartY + 2) {
              curY = addPageForCurrentChapter();
            }
            curY += bulBoxH + 1.2;
          }
        }

        if (page.includeClosingBlessing || page.includeQrVerification) {
          const qrSpace = 27.5;
          const textW = contentW - qrSpace - 6.0;
          const innerTextW = textW - 5.6;
          const blessingText = cleanPdfText(
            `"Om Sarve Bhavantu Sukhinah, Sarve Santu Niramayah | Tathastu Divya Jyoti Sada Sahayate ||" With deep gratitude to the Supreme Cosmic Universe, may the Nine Celestial Grahas bless ${ctx.activeProfile.name} and family with radiant health, boundless wealth, inner peace, and divine protection. Practice these sacred remedies with faith for 43 days — may every positive Sankalpa blossom into reality.`
          );
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          const bLines = wrapPdfTextStrict(doc, blessingText, innerTextW);
          doc.setFont('times', 'bold');
          doc.setFontSize(7.5);
          const slogan1Lines = wrapPdfTextStrict(
            doc,
            `Thank You for Being a Cherished Part of the TATHASTU Family — Where Ancient Wisdom Meets Divine Cosmic Light!`,
            innerTextW
          );
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.7);
          const slogan2Lines = wrapPdfTextStrict(
            doc,
            `${TATHASTU_BRAND_NAME} ("${TATHASTU_TAGLINE}") • Authorized By: ${ctx.healerDisplayName} (${ctx.healerDisplayMobile})`,
            innerTextW
          );
          const bTextH = bLines.length * 3.15 + 1.4;
          const sloganBoxH = slogan1Lines.length * 3.2 + slogan2Lines.length * 2.95 + 3.6;
          const boxH = Math.max(37.5, 7.6 + bTextH + sloganBoxH + 2.8);
          if (curY + boxH + 1.5 > pageMaxY) {
            curY = addPageForCurrentChapter();
          }
        }
      }

      return { total, perModule, closingSummaryPages };
    };

    const allSelectedCtx: PdfExportContext = {
      ...ctx,
      selectedSections: {
        nameAndCareer: true,
        advanceMobileAudit: true,
        forecast12Months: true,
        auditedCalendar12Months: true,
        transitsAndMoon12Months: true,
        dailyMantras: true,
        yogaAndPranayama: true,
        partnerMilanChakras: true,
        parivarMilan: true,
        festivals12Months: true,
        islamicVedicRemedies: true,
      },
    };
    const allPages = build18PageMasterDossier(allSelectedCtx, { skipIndexPage: true });
    const allResult = measurePagesList(allPages);
    cachedEntry = {
      perModule: allResult.perModule,
      closingSummaryPages: Math.max(1, allResult.closingSummaryPages || 2),
    };
    PER_MODULE_PAGE_COUNT_CACHE.set(cacheKey, cachedEntry);
  }

  const sel = ctx.selectedSections;
  const hasAnySelected = sel ? allModuleKeys.some((k) => sel[k]) : true;

  // Page 1 is always the dynamic 'Index of Modules' page (1 physical A4 page)
  let runningPage = 2;
  const modulePageRanges = {} as Record<ModuleKey, PdfModulePageRange>;

  for (const k of allModuleKeys) {
    const count = Math.max(1, cachedEntry.perModule[k] || 1);
    const isSelected = sel ? (hasAnySelected ? Boolean(sel[k]) : k === 'nameAndCareer') : true;
    if (isSelected) {
      modulePageRanges[k] = {
        startPage: runningPage,
        endPage: runningPage + count - 1,
        pageCount: count,
      };
      runningPage += count;
    } else {
      modulePageRanges[k] = {
        startPage: 0,
        endPage: 0,
        pageCount: count,
      };
    }
  }

  const closingCount = Math.max(1, cachedEntry.closingSummaryPages || 2);
  const closingSummaryPageRange: PdfModulePageRange = {
    startPage: runningPage,
    endPage: runningPage + closingCount - 1,
    pageCount: closingCount,
  };
  runningPage += closingCount;

  return {
    totalPdfPages: runningPage - 1,
    modulePageCounts: { ...cachedEntry.perModule },
    modulePageRanges,
    closingSummaryPageRange,
  };
}

/**
 * Generates and downloads (or prints) the A4 Portrait Spiritual Dossier PDF
 * dynamically sized and auto-extended across pages so 100% of text is shown
 * with clean box alignment and zero cut-off.
 */
export async function generateAndExport18PagePdf(
  ctx: PdfExportContext,
  mode: 'download' | 'print' | 'blob' = 'download'
): Promise<{ blob: Blob; fileName: string; signedUrl?: string | null }> {
  const logoSource =
    ctx.isHealerReport && ctx.healerAccount.healerLogoUrl
      ? ctx.healerAccount.healerLogoUrl
      : TATHASTU_LOGO_PATH;

  const isWatermarkEnabled = ctx.watermarkEnabled ?? true;
  const watermarkOpacity = ctx.watermarkOpacityPercent ?? 10;

  const [
    compositeBgDataUrl,
    watermarkSealPngDataUrl,
    circularLogoDataUrl,
    nameStripUrl,
    mobileStripUrl,
    transitStripUrl,
    islamicStripUrl,
    chakraStripUrl,
    bannerStripUrl,
    rawNameImg,
    rawMobileImg,
    rawTransitImg,
    rawIslamicImg,
    rawChakraImg,
    rawBannerImg,
    rawDivineBgImg,
    shreeYantraPlateImg,
    resolvedAiSummary,
  ] = await Promise.all([
    createCompositeA4BackgroundDataUrl(
      a4DivineEnergyBg,
      spiritualReportBanner,
      logoSource,
      isWatermarkEnabled,
      watermarkOpacity,
      ctx.brandTitle
    ),
    isWatermarkEnabled
      ? createSubtleBrandWatermarkSealPngDataUrl(logoSource, watermarkOpacity, ctx.brandTitle)
      : Promise.resolve(null),
    createCircularLogoDataUrl(logoSource),
    createIllustrationStripDataUrl(vedicNameCareerYantra),
    createIllustrationStripDataUrl(mobileLoShuGridArt),
    createIllustrationStripDataUrl(planetaryTransitsArt),
    createIllustrationStripDataUrl(islamicNoorArt),
    createIllustrationStripDataUrl(chakraHealingArt),
    createIllustrationStripDataUrl(spiritualReportBanner),
    loadHtmlImage(vedicNameCareerYantra),
    loadHtmlImage(mobileLoShuGridArt),
    loadHtmlImage(planetaryTransitsArt),
    loadHtmlImage(islamicNoorArt),
    loadHtmlImage(chakraHealingArt),
    loadHtmlImage(spiritualReportBanner),
    loadHtmlImage(a4DivineEnergyBg),
    loadHtmlImage(SHREE_YANTRA_PLATE_ASSET_PATH),
    ctx.aiReportSummary
      ? Promise.resolve(ctx.aiReportSummary)
      : fetchAiReportSummary({
          profile: ctx.activeProfile,
          healerName: ctx.healerDisplayName,
          brandTitle: ctx.brandTitle,
          language: ctx.language,
        }),
  ]);

  const loadedArtImages = [
    rawNameImg,
    rawMobileImg,
    rawTransitImg,
    rawIslamicImg,
    rawChakraImg,
    rawBannerImg,
    rawDivineBgImg,
  ];

  const stripMap: Record<string, string | null> = {
    name: nameStripUrl,
    mobile: mobileStripUrl,
    transit: transitStripUrl,
    islamic: islamicStripUrl,
    chakra: chakraStripUrl,
    banner: bannerStripUrl,
  };

  const resolvedCtx: PdfExportContext = {
    ...ctx,
    aiReportSummary: resolvedAiSummary,
  };
  const pages = build18PageMasterDossier(resolvedCtx);
  const totalChapters = pages.length;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  const flushUnicodeTextLayer = installUnicodeCanvasTextRenderer(doc, false, ctx.language);

  const pageW = 210;
  const pageH = 297;
  const marginX = 8;
  const contentW = pageW - marginX * 2; // 194mm
  const headerY = 7.0;
  const headerH = 22.5;
  const bodyStartY = 30.8;
  const footerStartY = 275.5;
  const pageMaxY = footerStartY - 1.4; // 274.1mm max body bottom before footer

  let hasFirstPage = false;
  let currentPhysicalPageNum = 0;

  const setupPhysicalA4Page = (page: PdfPageSpec, isContinuation: boolean): number => {
    if (!hasFirstPage) {
      hasFirstPage = true;
    } else {
      doc.addPage('a4', 'portrait');
    }
    currentPhysicalPageNum += 1;

    // 1. Full-Bleed Spiritual Energy Background + Sacred Mandala + Brand Watermark
    if (compositeBgDataUrl) {
      doc.addImage(compositeBgDataUrl, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
    } else {
      doc.setFillColor(255, 252, 245);
      doc.rect(0, 0, pageW, pageH, 'F');
    }

    // 2. Royal Double Sacred Frame Border
    doc.setDrawColor(180, 83, 9);
    doc.setLineWidth(0.6);
    doc.rect(5.5, 5.5, pageW - 11, pageH - 11);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.25);
    doc.rect(6.5, 6.5, pageW - 13, pageH - 13);

    // 3. Top Royal Header Banner
    const stripImg = page.bannerKey ? stripMap[page.bannerKey] : nameStripUrl;
    if (stripImg) {
      doc.addImage(stripImg, 'JPEG', marginX, headerY, contentW, headerH, undefined, 'FAST');
    } else {
      doc.setFillColor(30, 17, 54);
      doc.rect(marginX, headerY, contentW, headerH, 'F');
    }

    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.45);
    doc.rect(marginX, headerY, contentW, headerH);

    if (circularLogoDataUrl) {
      doc.addImage(
        circularLogoDataUrl,
        'PNG',
        marginX + 2.2,
        headerY + 1.9,
        18.5,
        18.5,
        undefined,
        'FAST'
      );
    }

    const headerTextX = marginX + 23.2;
    const maxHeaderTextW = contentW - 46.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(253, 230, 138);
    const brandHeaderLines = wrapPdfTextStrict(
      doc,
      `${ctx.brandTitle.toUpperCase()} - HEALER: ${ctx.healerDisplayName.toUpperCase()} (${ctx.healerDisplayMobile})`,
      maxHeaderTextW
    );
    doc.text(brandHeaderLines[0] || '', headerTextX, headerY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(254, 243, 199);
    const chapterLabel = isContinuation ? `${page.chapterTag} (CONTINUED)` : page.chapterTag;
    const chapterLines = wrapPdfTextStrict(doc, chapterLabel, maxHeaderTextW);
    doc.text(chapterLines[0] || '', headerTextX, headerY + 8.0);

    // Auto-scale title font so the full page title fits cleanly inside the header box
    const cleanTitleStr = cleanPdfText(page.title);
    let titleFontSize = 10.2;
    doc.setFont('times', 'bold');
    doc.setFontSize(titleFontSize);
    while (titleFontSize > 8.0 && doc.getTextWidth(cleanTitleStr) > maxHeaderTextW * 0.89) {
      titleFontSize -= 0.4;
      doc.setFontSize(titleFontSize);
    }
    doc.setTextColor(255, 255, 255);
    const titleLines = wrapPdfTextStrict(doc, cleanTitleStr, maxHeaderTextW);
    doc.text(titleLines[0] || '', headerTextX, headerY + 13.0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(254, 240, 138);
    const subLines = wrapPdfTextStrict(doc, page.subtitle, maxHeaderTextW).slice(0, 2);
    if (subLines.length > 1) {
      drawPdfLinesStrict(doc, subLines, headerTextX, headerY + 16.9, 2.7);
    } else {
      doc.text(subLines[0] || '', headerTextX, headerY + 18.2);
    }

    // 4. Subtle Centered TATHASTU Brand Watermark Seal (Strictly 1:1 Square 96x96mm so never stretched)
    if (isWatermarkEnabled && watermarkSealPngDataUrl) {
      const wmSize = 96;
      const wmX = (pageW - wmSize) / 2;
      const wmY = 104;
      doc.addImage(watermarkSealPngDataUrl, 'PNG', wmX, wmY, wmSize, wmSize, undefined, 'FAST');
    }

    return bodyStartY;
  };

  for (let pIdx = 0; pIdx < totalChapters; pIdx++) {
    if (pIdx > 0 && pIdx % 2 === 0) {
      await yieldToBrowser();
    }
    const page = pages[pIdx];
    let curY = setupPhysicalA4Page(page, false);
    const numSections = page.sections.length;

    const advanceToContinuationPageWithArtFiller = (usedBottomY?: number): number => {
      const fillerStartY = usedBottomY !== undefined ? usedBottomY : curY;
      const uniqueMedallion = createUniquePageSacredMedallionDataUrl(
        currentPhysicalPageNum,
        loadedArtImages,
        page,
        shreeYantraPlateImg,
        rawIslamicImg
      );
      drawContextualChapterArtFiller(
        doc,
        marginX,
        fillerStartY,
        contentW,
        pageMaxY,
        page,
        uniqueMedallion,
        circularLogoDataUrl,
        ctx,
        currentPhysicalPageNum
      );
      return setupPhysicalA4Page(page, true);
    };

    for (let sIdx = 0; sIdx < numSections; sIdx++) {
      const sec = page.sections[sIdx];

      doc.setFont('times', 'bold');
      doc.setFontSize(8.5);
      const secHeadingLines = wrapPdfTextStrict(doc, sec.heading, contentW - 8.5);

      let secSubLines: string[] = [];
      if (sec.subheading) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        secSubLines = wrapPdfTextStrict(doc, sec.subheading, contentW - 8.5);
      }

      const secHeaderH =
        2.1 +
        secHeadingLines.length * 3.45 +
        (secSubLines.length > 0 ? secSubLines.length * 2.95 + 0.8 : 0.6);

      // Ensure section header + at least 22mm of content fits on current page; otherwise extend to a new page
      if (curY + secHeaderH + 22 > pageMaxY && curY > bodyStartY + 2) {
        curY = advanceToContinuationPageWithArtFiller(curY);
      }

      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginX, curY, contentW, secHeaderH, 1.0, 1.0, 'FD');

      doc.setFillColor(180, 83, 9);
      doc.rect(marginX, curY, 2.2, secHeaderH, 'F');

      doc.setFont('times', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 53, 15);
      drawPdfLinesStrict(doc, secHeadingLines, marginX + 4.0, curY + 3.85, 3.45);

      if (secSubLines.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(146, 64, 14);
        const subStartY = curY + 3.85 + secHeadingLines.length * 3.45 - 0.1;
        drawPdfLinesStrict(doc, secSubLines, marginX + 4.0, subStartY, 2.95);
      }

      curY += secHeaderH + 1.2;

      // Optional Paragraphs (100% wrapped, auto-extends page if needed)
      if (sec.paragraphs && sec.paragraphs.length > 0) {
        const paraLinesAll: string[][] = [];
        let totalParaLines = 0;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.4);
        for (const p of sec.paragraphs) {
          const lines = wrapPdfTextStrict(doc, p, contentW - 7.0);
          paraLinesAll.push(lines);
          totalParaLines += lines.length;
        }
        const paraBoxH = totalParaLines * 3.3 + sec.paragraphs.length * 1.0 + 2.4;

        if (curY + paraBoxH > pageMaxY && curY > bodyStartY + 2) {
          curY = advanceToContinuationPageWithArtFiller(curY);
        }

        setPdfFillOpacity(doc, 0.88);
        doc.setFillColor(255, 253, 248);
        doc.setDrawColor(234, 179, 8);
        doc.setLineWidth(0.22);
        doc.roundedRect(marginX, curY, contentW, paraBoxH, 1.0, 1.0, 'FD');
        setPdfFillOpacity(doc, 1.0);

        let pyText = curY + 3.6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.4);
        doc.setTextColor(30, 41, 59);
        for (const lines of paraLinesAll) {
          drawPdfLinesStrict(doc, lines, marginX + 3.2, pyText, 3.3);
          pyText += lines.length * 3.3 + 1.0;
        }
        curY += paraBoxH + 1.2;
      }

      // Optional Custom Letter Breakdown Cell Grid
      if (sec.letterGridCells && sec.letterGridCells.length > 0) {
        const cleanLetters = sec.letterGridCells.filter((l) => l.char && l.char.trim().length > 0);
        const cols = Math.min(8, Math.max(5, cleanLetters.length));
        const rows = Math.ceil(cleanLetters.length / cols);
        const estLetterGridH = rows * 10.8 + 8.6;
        if (curY + estLetterGridH > pageMaxY && curY > bodyStartY + 2) {
          curY = advanceToContinuationPageWithArtFiller(curY);
        }
        const usedH = drawLetterBreakdownGrid(doc, marginX, curY, contentW, sec.letterGridCells);
        curY += usedH + 1.3;
      }

      // Optional Sacred 3x3 Square Lo-Shu Matrix Box
      if (sec.loShuSquareMatrix) {
        if (curY + 52 > pageMaxY && curY > bodyStartY + 2) {
          curY = advanceToContinuationPageWithArtFiller(curY);
        }
        const usedH = drawSacredLoShuSquareMatrix(
          doc,
          marginX,
          curY,
          contentW,
          sec.loShuSquareMatrix
        );
        curY += usedH + 1.3;
      }

      // Optional Visual Yoga Posture Card Gallery (with anatomical Asana illustrations)
      if (sec.yogaAsanaGallery && sec.yogaAsanaGallery.length > 0) {
        curY = drawYogaAsanaVisualCardGallery(
          doc,
          marginX,
          curY,
          contentW,
          sec.yogaAsanaGallery,
          pageMaxY,
          advanceToContinuationPageWithArtFiller
        );
        curY += 1.0;
      }

      // Optional Dedicated Visual Ashtakoot Guna Milan Chart Box (with graphical progress bars & verdicts)
      if (sec.ashtakootChartBox) {
        curY = drawAshtakootGunaMilanChartBox(
          doc,
          marginX,
          curY,
          contentW,
          sec.ashtakootChartBox,
          pageMaxY,
          advanceToContinuationPageWithArtFiller
        );
        curY += 1.3;
      }

      // Optional Dedicated Visual Parivar Harmony Graph Box (FINAL CONCLUSIVE RESULT • PARIVAR HARMONY GRAPH)
      if (sec.parivarHarmonyGraphBox) {
        curY = drawParivarHarmonyGraphBox(
          doc,
          marginX,
          curY,
          contentW,
          sec.parivarHarmonyGraphBox,
          pageMaxY,
          advanceToContinuationPageWithArtFiller
        );
        curY += 1.1;
      }

      // Optional Table (Paginated across pages automatically so zero rows are cut off or squished)
      if (sec.table) {
        curY = drawAlignedTablePaginated(
          doc,
          marginX,
          curY,
          contentW,
          sec.table,
          pageMaxY,
          advanceToContinuationPageWithArtFiller
        );
        curY += 1.3;
      }

      // Optional 2-Column Aligned Grid Cards (100% complete text & remedies, auto-extends pages row by row)
      if (sec.gridItems && sec.gridItems.length > 0) {
        const items = sec.gridItems;
        const cols = 2;
        const numRows = Math.ceil(items.length / cols);
        const gapX = 2.4;
        const gapY = 1.6;
        const cardW = (contentW - gapX) / 2;

        for (let r = 0; r < numRows; r++) {
          const leftItem = items[r * 2];
          const rightItem = items[r * 2 + 1];
          const hLeft = leftItem ? measureGridCardHeight(doc, cardW, leftItem) : 14.5;
          const hRight = rightItem ? measureGridCardHeight(doc, cardW, rightItem) : 14.5;
          const rowH = Math.max(hLeft, hRight) + 0.5;

          if (curY + rowH > pageMaxY && curY > bodyStartY + 2) {
            curY = advanceToContinuationPageWithArtFiller(curY);
          }

          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (idx >= items.length) break;
            const cx = marginX + c * (cardW + gapX);
            drawAlignedGridCard(doc, cx, curY, cardW, rowH, items[idx]);
          }
          curY += rowH + gapY;
        }
      }

      // Optional Bullets Box (100% wrapped, auto-extends page if needed)
      if (sec.bullets && sec.bullets.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.3);
        const bulletLinesAll: string[][] = [];
        let totalBulletLines = 0;
        for (const bText of sec.bullets) {
          const bLines = wrapPdfTextStrict(doc, `* ${cleanPdfText(bText)}`, contentW - 7.0);
          bulletLinesAll.push(bLines);
          totalBulletLines += bLines.length;
        }
        const bulBoxH = totalBulletLines * 3.25 + bulletLinesAll.length * 0.85 + 2.8;

        if (curY + bulBoxH > pageMaxY && curY > bodyStartY + 2) {
          curY = advanceToContinuationPageWithArtFiller(curY);
        }

        setPdfFillOpacity(doc, 0.88);
        doc.setFillColor(254, 249, 235);
        doc.setDrawColor(180, 83, 9);
        doc.setLineWidth(0.28);
        doc.roundedRect(marginX, curY, contentW, bulBoxH, 1.0, 1.0, 'FD');
        setPdfFillOpacity(doc, 1.0);

        let by = curY + 3.6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.3);
        doc.setTextColor(30, 41, 59);
        for (const bLines of bulletLinesAll) {
          drawPdfLinesStrict(doc, bLines, marginX + 3.2, by, 3.25);
          by += bLines.length * 3.25 + 0.85;
        }
        curY += bulBoxH + 1.2;
      }
    }

    // 5. Final Chapter: Sacred Closing Blessing, Gratitude to the Universe, TATHASTU Family Slogan & Dynamic QR Seal
    if (page.includeClosingBlessing || page.includeQrVerification) {
      const qrSpace = 27.5;
      const textX = marginX + 3.0;
      const textW = contentW - qrSpace - 6.0;
      const innerTextW = textW - 5.6;

      const blessingText = cleanPdfText(
        `"Om Sarve Bhavantu Sukhinah, Sarve Santu Niramayah | Tathastu Divya Jyoti Sada Sahayate ||" With deep gratitude to the Supreme Cosmic Universe, may the Nine Celestial Grahas bless ${ctx.activeProfile.name} and family with radiant health, boundless wealth, inner peace, and divine protection. Practice these sacred remedies with faith for 43 days — may every positive Sankalpa blossom into reality.`
      );
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      const bLines = wrapPdfTextStrict(doc, blessingText, innerTextW);

      doc.setFont('times', 'bold');
      doc.setFontSize(7.5);
      const slogan1Lines = wrapPdfTextStrict(
        doc,
        cleanPdfText(
          `Thank You for Being a Cherished Part of the TATHASTU Family - Where Ancient Wisdom Meets Divine Cosmic Light!`
        ),
        innerTextW
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.7);
      const slogan2Lines = wrapPdfTextStrict(
        doc,
        cleanPdfText(
          `${TATHASTU_BRAND_NAME} ("${TATHASTU_TAGLINE}") • Authorized By: ${ctx.healerDisplayName} (${ctx.healerDisplayMobile})${
            !ctx.isHealerReport
              ? ' • Visit www.tathastulight.com for 100% Genuine & Authentic Rudraksha, Crystals, Home Cleansing Material, Precious & Semi-Precious Stones'
              : ''
          }`
        ),
        innerTextW
      );

      const bTextH = bLines.length * 3.15 + 1.4;
      const sloganBoxH = slogan1Lines.length * 3.2 + slogan2Lines.length * 2.95 + 3.6;
      const boxH = Math.max(37.5, 7.6 + bTextH + sloganBoxH + 2.8);

      if (curY + boxH + 1.5 > pageMaxY) {
        curY = advanceToContinuationPageWithArtFiller(curY);
      }
      const boxY = Math.max(curY + 1.0, pageMaxY - boxH);

      // If there is remaining blank space between curY and the closing blessing box, fill it with contextual art
      if (boxY - curY >= 10.5) {
        const uniqueClosingMedallion = createUniquePageSacredMedallionDataUrl(
          currentPhysicalPageNum,
          loadedArtImages,
          page,
          shreeYantraPlateImg,
          rawIslamicImg
        );
        drawContextualChapterArtFiller(
          doc,
          marginX,
          curY,
          contentW,
          boxY - 0.8,
          page,
          uniqueClosingMedallion,
          circularLogoDataUrl,
          ctx,
          currentPhysicalPageNum
        );
      }

      doc.setFillColor(255, 250, 230);
      doc.setDrawColor(180, 83, 9);
      doc.setLineWidth(0.5);
      doc.roundedRect(marginX, boxY, contentW, boxH, 1.5, 1.5, 'FD');

      doc.setFillColor(180, 83, 9);
      doc.rect(marginX, boxY, contentW, 5.6, 'F');

      const closeHeaderStr = cleanPdfText(
        'SACRED COSMIC BLESSING, GRATITUDE TO THE UNIVERSE & TATHASTU FAMILY WELCOME'
      );
      let closeHeaderFont = 8.0;
      doc.setFont('times', 'bold');
      doc.setFontSize(closeHeaderFont);
      while (closeHeaderFont > 5.4 && doc.getTextWidth(closeHeaderStr) > contentW - 6.0) {
        closeHeaderFont -= 0.25;
        doc.setFontSize(closeHeaderFont);
      }
      doc.setTextColor(255, 251, 235);
      doc.text(closeHeaderStr, marginX + contentW / 2, boxY + 4.0, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(30, 41, 59);
      drawPdfLinesStrict(doc, bLines, textX + 1.2, boxY + 9.2, 3.15);

      // Highlighted TATHASTU Family Slogan Box
      const sloganY = boxY + 7.2 + bTextH;
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.3);
      doc.roundedRect(textX, sloganY, textW, sloganBoxH, 1.0, 1.0, 'FD');

      doc.setFont('times', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(6, 95, 70);
      drawPdfLinesStrict(doc, slogan1Lines, textX + 2.2, sloganY + 3.8, 3.2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.7);
      doc.setTextColor(120, 53, 15);
      const s2StartY = sloganY + 3.8 + slogan1Lines.length * 3.2 + 0.35;
      drawPdfLinesStrict(doc, slogan2Lines, textX + 2.2, s2StartY, 2.95);

      if (ctx.qrCodeDataUrl) {
        const qrBoxH = 27.2;
        const qx = marginX + contentW - 25.0;
        const qy = boxY + 5.6 + Math.max(1.2, (boxH - 5.6 - qrBoxH) / 2);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(0.3);
        doc.roundedRect(qx, qy, 22.0, qrBoxH, 1.0, 1.0, 'FD');
        doc.addImage(ctx.qrCodeDataUrl, 'PNG', qx + 1.5, qy + 1.2, 19.0, 19.0, undefined, 'FAST');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.2);
        doc.setTextColor(120, 53, 15);
        doc.text('SCAN QR FOR', qx + 11.0, qy + 22.6, { align: 'center' });
        doc.text('MOBILE PDF', qx + 11.0, qy + 25.3, { align: 'center' });
      }
    } else {
      // Fill any remaining blank vertical space on this page with the unique Centered Sacred Yantra Medallion & Highlighted Callout Boxes
      const uniqueEndMedallion = createUniquePageSacredMedallionDataUrl(
        currentPhysicalPageNum,
        loadedArtImages,
        page,
        shreeYantraPlateImg,
        rawIslamicImg
      );
      drawContextualChapterArtFiller(
        doc,
        marginX,
        curY,
        contentW,
        pageMaxY,
        page,
        uniqueEndMedallion,
        circularLogoDataUrl,
        ctx,
        currentPhysicalPageNum
      );
    }
  }

  // 6. FINAL PASS: Stamp Top-Right QR / Page Badge & Bottom Healer Footer with Exact Page Numbers (1..actualTotalPages)
  const actualTotalPages = doc.getNumberOfPages();
  for (let p = 1; p <= actualTotalPages; p++) {
    doc.setPage(p);

    // Top-right QR Code + Page Badge in Header
    if (ctx.qrCodeDataUrl) {
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.3);
      doc.roundedRect(pageW - marginX - 19.5, headerY + 2.0, 17.5, 20.2, 1.0, 1.0, 'FD');
      doc.addImage(
        ctx.qrCodeDataUrl,
        'PNG',
        pageW - marginX - 18.2,
        headerY + 2.8,
        14.9,
        14.9,
        undefined,
        'FAST'
      );
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.0);
      doc.setTextColor(120, 53, 15);
      doc.text(`PG ${p}/${actualTotalPages}`, pageW - marginX - 10.75, headerY + 20.6, {
        align: 'center',
      });
    } else {
      doc.setFillColor(120, 53, 15);
      doc.setDrawColor(253, 230, 138);
      doc.setLineWidth(0.3);
      doc.roundedRect(pageW - marginX - 24, headerY + 2.5, 21.5, 6.2, 1.2, 1.2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(255, 251, 235);
      doc.text(`PAGE ${p}/${actualTotalPages}`, pageW - marginX - 13.25, headerY + 6.7, {
        align: 'center',
      });
    }

    // Bottom Healer Footer (Height = 17.5mm — Auto-Fitting & Multi-Line Wrapped so ZERO text is ever cut off)
    const footerH = 17.5;
    doc.setFillColor(26, 15, 46);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.45);
    doc.roundedRect(marginX, footerStartY, contentW, footerH, 1.2, 1.2, 'FD');

    doc.setFillColor(245, 158, 11);
    doc.rect(marginX, footerStartY, contentW, 0.85, 'F');

    if (circularLogoDataUrl) {
      doc.addImage(
        circularLogoDataUrl,
        'PNG',
        marginX + 1.8,
        footerStartY + 2.6,
        12.0,
        12.0,
        undefined,
        'FAST'
      );
    }

    // Helper that auto-scales font size down to fit 100% of text on a single line without cutting off any characters
    const drawFooterLineFit = (
      rawText: string,
      x: number,
      y: number,
      maxWidth: number,
      fontName: 'times' | 'helvetica',
      fontStyle: 'normal' | 'bold',
      initialFontSize: number,
      minFontSize: number,
      align: 'left' | 'center' | 'right' = 'left'
    ) => {
      const cleaned = cleanPdfText(rawText);
      doc.setFont(fontName, fontStyle);
      let sz = initialFontSize;
      doc.setFontSize(sz);
      while (sz > minFontSize && doc.getTextWidth(cleaned) > maxWidth) {
        sz = Math.round((sz - 0.2) * 10) / 10;
        doc.setFontSize(sz);
      }
      if (doc.getTextWidth(cleaned) <= maxWidth) {
        doc.text(cleaned, x, y, { align });
      } else {
        const wrapped = doc.splitTextToSize(cleaned, maxWidth) as string[];
        doc.text(wrapped[0] || cleaned, x, y, { align });
      }
    };

    // Column geometry:
    // Left Column: x = marginX + 15.2 (23.2mm) to 104.2mm => width = 81.0mm
    // Center Column: centered at x = 122.5mm (width = 33.0mm, spanning 106.0mm to 139.0mm)
    // Right Column: right-aligned at pageW - marginX - 2.0 (199.5mm), width = 58.5mm (141.0mm to 199.5mm)
    const fLeftX = marginX + 15.2;
    const fLeftMaxW = 81.0;

    // Subtle vertical gold column dividers
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.2);
    doc.line(105.0, footerStartY + 2.0, 105.0, footerStartY + footerH - 1.8);
    doc.line(140.0, footerStartY + 2.0, 140.0, footerStartY + footerH - 1.8);

    // Line 1: Healer Name & Brand Title (auto-fitted so full name & center title never cut off)
    doc.setTextColor(253, 230, 138);
    drawFooterLineFit(
      `Healer: ${ctx.healerDisplayName} | ${ctx.brandTitle}`,
      fLeftX,
      footerStartY + 4.3,
      fLeftMaxW,
      'times',
      'bold',
      6.7,
      4.7,
      'left'
    );

    // Line 2: Tel/WhatsApp & Email (auto-fitted so full phone & email never cut off)
    doc.setTextColor(226, 232, 240);
    drawFooterLineFit(
      `Tel/WA: ${ctx.healerDisplayMobile} | Email: ${ctx.healerDisplayEmail}`,
      fLeftX,
      footerStartY + 8.1,
      fLeftMaxW,
      'helvetica',
      'normal',
      5.8,
      4.5,
      'left'
    );

    // Line 3 & 4: Full Address (supports up to 2 wrapped lines so long addresses are never truncated)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.4);
    doc.setTextColor(186, 230, 253);
    const fullAddrText = cleanPdfText(`Address: ${ctx.healerDisplayAddress}`);
    if (doc.getTextWidth(fullAddrText) <= fLeftMaxW) {
      doc.text(fullAddrText, fLeftX, footerStartY + 12.2);
    } else {
      let addrFontSize = 5.3;
      doc.setFontSize(addrFontSize);
      let addrLines = wrapPdfTextStrict(doc, fullAddrText, fLeftMaxW);
      if (addrLines.length > 2) {
        addrFontSize = 4.7;
        doc.setFontSize(addrFontSize);
        addrLines = wrapPdfTextStrict(doc, fullAddrText, fLeftMaxW);
      }
      doc.text(addrLines[0] || '', fLeftX, footerStartY + 11.6);
      if (addrLines[1]) {
        const secondLine =
          addrLines.length > 2 ? `${addrLines.slice(1).join(' ')}` : addrLines[1];
        drawFooterLineFit(
          secondLine,
          fLeftX,
          footerStartY + 14.8,
          fLeftMaxW,
          'helvetica',
          'normal',
          addrFontSize,
          4.3,
          'left'
        );
      }
    }

    // Center Column (Page Badge + Brand Name)
    const centerPageX = 122.5;
    const badgeW = 31.5;
    const badgeH = 5.8;
    const badgeY = footerStartY + 2.6;
    doc.setFillColor(120, 53, 15);
    doc.setDrawColor(253, 230, 138);
    doc.setLineWidth(0.35);
    doc.roundedRect(centerPageX - badgeW / 2, badgeY, badgeW, badgeH, 1.3, 1.3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 251, 235);
    doc.text(`Page ${p} of ${actualTotalPages}`, centerPageX, badgeY + 4.0, {
      align: 'center',
    });

    doc.setTextColor(253, 230, 138);
    drawFooterLineFit(
      TATHASTU_BRAND_NAME,
      centerPageX,
      footerStartY + 12.4,
      32.5,
      'helvetica',
      'bold',
      5.2,
      4.4,
      'center'
    );

    doc.setTextColor(167, 243, 208);
    drawFooterLineFit(
      'Vedic Astro-Numerology',
      centerPageX,
      footerStartY + 15.3,
      32.5,
      'helvetica',
      'normal',
      4.6,
      4.2,
      'center'
    );

    // Right Column (Social Handles auto-fitted to 58.5mm so IG, FB & Web never cut off)
    const fRightX = pageW - marginX - 2.2;
    const fRightMaxW = 58.5;

    doc.setTextColor(253, 230, 138);
    drawFooterLineFit(
      `IG: ${ctx.healerInstagram}`,
      fRightX,
      footerStartY + 4.6,
      fRightMaxW,
      'helvetica',
      'bold',
      5.8,
      4.5,
      'right'
    );

    doc.setTextColor(226, 232, 240);
    drawFooterLineFit(
      `FB: ${ctx.healerFacebook}`,
      fRightX,
      footerStartY + 9.2,
      fRightMaxW,
      'helvetica',
      'bold',
      5.8,
      4.5,
      'right'
    );

    doc.setTextColor(167, 243, 208);
    drawFooterLineFit(
      `Web: ${ctx.healerWebsite}`,
      fRightX,
      footerStartY + 13.8,
      fRightMaxW,
      'helvetica',
      'bold',
      5.8,
      4.5,
      'right'
    );
  }

  // Composite per-page Unicode/Devanagari text canvases onto each A4 page with event-loop yielding
  await flushUnicodeTextLayer();
  await yieldToBrowser();

  const safeName = (ctx.activeProfile.name || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Tathastu_Divine_Light_Report_${safeName}.pdf`;
  const pdfBlob = doc.output('blob');

  // Trigger download/print IMMEDIATELY before any network upload so the browser never blocks or loses user gesture
  if (mode === 'print') {
    doc.autoPrint();
    triggerCrossPlatformPdfBlobDownload(pdfBlob, fileName, null);
  } else if (mode === 'download') {
    triggerCrossPlatformPdfBlobDownload(pdfBlob, fileName, null);
  }

  // Upload generated PDF blob to Signed Server Endpoint / Firebase Storage for cross-device links
  let signedUrl: string | null = null;
  try {
    const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
    signedUrl = await uploadReportPdfAndGetSignedUrl(
      ctx.activeProfile.id || safeName,
      fileName,
      pdfBlob,
      originUrl
    );
  } catch {
    signedUrl = null;
  }

  return { blob: pdfBlob, fileName, signedUrl };
}
