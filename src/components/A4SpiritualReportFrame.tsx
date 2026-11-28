import React, { useState, useMemo, useEffect, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  Download,
  Printer,
  Share2,
  MessageCircle,
  Lock,
  Edit3,
  Trash2,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  ShieldAlert,
  X,
  CheckCircle2,
  Bell,
  ArrowLeft,
  CheckSquare,
  Square,
  FileText,
  SlidersHorizontal,
  Eye,
  Sparkles,
  Upload,
  Mail,
  MapPin,
  Award,
  ZoomIn,
  ZoomOut,
  QrCode,
  Calendar,
  Clock,
  Columns2,
} from 'lucide-react';
import { usePlatformMode } from '../utils/platformMode';
import {
  useTathastu,
  TATHASTU_LOGO_PATH,
  TATHASTU_APP_NAME,
  TATHASTU_BRAND_NAME,
  TATHASTU_TAGLINE,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_ADMIN_EMAIL,
  resolveReportHealerAttribution,
} from '../utils/tathastuStore';
import {
  useLanguage,
  translateMultilineBlock,
  validateAndNormalizeLocaleText,
} from '../utils/i18n';
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
  UPCOMING_MOON_PHASES,
} from '../utils/numerology';
import {
  calculateVedicAstrologyFromBirth,
  calculateCareerAndAuraProfile,
  getPersonalizedIndianFestivals,
} from '../utils/astrologyAndCities';
import { generateAdvanceMobileReport } from '../utils/advanceMobileReport';
import { calculateIslamicVedicReport } from '../utils/islamicVedicRemedies';
import { getBestUpcomingEventsNext12Months } from './CosmicCalendar';
import {
  calculateGemstoneRecommendationsForProfile,
  calculateNameAndPersonalGrowthRatnaRecommendation,
  calculatePartnerMilanRatnaRecommendations,
} from './GemstoneRecommendation';
import { buildPartnerMilanHarmonyInsights } from './PartnerCompatibility';
import { LO_SHU_VEDIC_REMEDIES_DB } from './InteractiveLoShuGrid';
import { SANSKRit_BEEJ_DEVANAGARI } from './DailyMantras';
import {
  generateAndExport18PagePdf,
  generate12MonthLunarAndAstroForecast,
  calculateExactPdfPageCounts,
} from '../utils/pdfReportGenerator';
import {
  generateClientReportQrDataUrl,
  getClientReportDirectUrl,
  buildClientStatusAndAuspiciousUpdateBlock,
  dispatchWhatsAppMessage,
  sendWhatsAppSpecificEventAlert,
  sendWhatsAppFullReportShare,
  sendWhatsAppAuspiciousTimeUpdate,
} from '../utils/whatsappAndQrService';
import { formatTime12HourAmPm } from './BirthTimeAmPmInput';
import { calculateYogaPranayamaPlan } from '../utils/yogaPranayamaData';
import { YogaPostureIllustration, PranayamaIllustration } from './YogaPranayamaModule';
import { calculateParivarMilanReport, ParivarMemberRecord } from '../utils/parivarMilan';
import {
  AiReportSummaryData,
  buildClassicalFallbackSummary,
  fetchAiReportSummary,
  getCachedAiReportSummary,
} from '../utils/aiReportSummary';
import {
  db,
  auth,
  doc as firestoreDoc,
  setDoc as firestoreSetDoc,
  OperationType,
  handleFirestoreError,
  triggerCrossPlatformPdfBlobDownload,
  uploadReportPdfAndGetSignedUrl,
} from '../firebase';

import a4DivineEnergyBg from '../assets/images/a4_divine_energy_watermark_1794229222633.jpg';
import chakraHealingArt from '../assets/images/chakra_healing_meditation_art_1794229223170.jpg';
import spiritualReportBanner from '../assets/images/spiritual_energy_report_banner_1794229220638.jpg';
import vedicNameCareerYantra from '../assets/images/vedic_name_career_yantra_1794305504547.jpg';
import mobileLoShuGridArt from '../assets/images/mobile_lo_shu_cosmic_grid_1794305505049.jpg';
import planetaryTransitsArt from '../assets/images/planetary_transits_navagraha_1794305507441.jpg';
import islamicNoorArt from '../assets/images/islamic_vedic_noor_geometry_1794305507170.jpg';

interface A4SpiritualReportFrameProps {
  sectionTitle: string;
  children: React.ReactNode;
  onOpenAdminPortal?: () => void;
  onOpenEditProfileModal?: () => void;
}

export interface ReportSectionSelection {
  nameAndCareer: boolean;
  advanceMobileAudit: boolean;
  forecast12Months: boolean;
  auditedCalendar12Months: boolean;
  transitsAndMoon12Months: boolean;
  dailyMantras: boolean;
  yogaAndPranayama: boolean;
  partnerMilanChakras: boolean;
  parivarMilan: boolean;
  festivals12Months: boolean;
  islamicVedicRemedies: boolean;
}

export interface CenterWatermarkSettings {
  enabled: boolean;
  opacityPercent: number;
  sizePx: number;
  showBrandText: boolean;
}

const REPORT_SETTINGS_STORAGE_KEY = 'tathastu_a4_report_module_selection_v8';
const INCLUDE_ACTIVE_TAB_STORAGE_KEY = 'tathastu_a4_include_active_tab_v5';
const WATERMARK_SETTINGS_STORAGE_KEY = 'tathastu_a4_center_watermark_v3';

const DEFAULT_REPORT_SECTIONS: ReportSectionSelection = {
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
};

const FIXED_WATERMARK_SETTINGS: CenterWatermarkSettings = {
  enabled: true,
  opacityPercent: 11,
  sizePx: 260,
  showBrandText: true,
};

export interface ReportToolbarContextValue {
  healerDisplayName: string;
  brandTitle: string;
  healerDisplayMobile: string;
  totalPageCount: number;
  selectedCount: number;
  totalModulesCount: number;
  showExportOptionsPanel: boolean;
  toggleExportOptionsPanel: () => void;
  openPrintPreview: () => void;
  sendWhatsAppPdfReport: () => void;
  renderQuickCheckboxesPanel: () => React.ReactNode;
}

const ReportToolbarContext = createContext<ReportToolbarContextValue | null>(null);

export const useReportToolbar = (): ReportToolbarContextValue | null => {
  return useContext(ReportToolbarContext);
};

export const A4SpiritualReportFrame: React.FC<A4SpiritualReportFrameProps> = ({
  sectionTitle,
  children,
  onOpenAdminPortal,
  onOpenEditProfileModal,
}) => {
  const { language, tr } = useLanguage();
  const {
    accounts,
    currentAccount,
    activeProfile,
    clearActiveProfile,
    broadcasts,
    adminUpdateAccount,
    adminUpdateProfile,
    adminDeleteProfile,
    canCurrentAccountDownloadOrShare,
    canCurrentAccountEditOrDelete,
    triggerAdminRestrictionPopup,
    restrictionModal,
    closeRestrictionModal,
  } = useTathastu();

  const [shareToast, setShareToast] = useState<string | null>(null);
  const [dismissedBroadcastId, setDismissedBroadcastId] = useState<string | null>(null);

  const [showExportOptionsPanel, setShowExportOptionsPanel] = useState<boolean>(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 56;
      if (window.innerWidth < 1024) return 78;
    }
    return 100;
  });
  const { isWindowsFullPage, isMobileAppMode } = usePlatformMode();
  const [windowsSpreadView, setWindowsSpreadView] = useState<boolean>(false);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [reportQrDataUrl, setReportQrDataUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfExportProgress, setPdfExportProgress] = useState<{ current: number; total: number } | null>(null);
  const pdfCaptureContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setViewportWidth(w);
      setIsMobileViewport(w < 768);
      if (w < 640) setPreviewScale(Math.round(Math.max(35, Math.min(100, ((w - 16) / 794) * 100))));
      else if (w < 1024) setPreviewScale(78);
      else setPreviewScale(100);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const reportQrDirectUrl = useMemo(() => {
    if (!activeProfile) return '';
    return getClientReportDirectUrl(activeProfile);
  }, [activeProfile]);

  const reportDirectDownloadLink = useMemo(() => {
    if (!reportQrDirectUrl) return '';
    return `${reportQrDirectUrl}&autoDownloadPdf=1`;
  }, [reportQrDirectUrl]);

  useEffect(() => {
    if (!activeProfile) {
      setReportQrDataUrl('');
      return;
    }
    let mounted = true;
    generateClientReportQrDataUrl(activeProfile).then((dataUrl) => {
      if (mounted) setReportQrDataUrl(dataUrl);
    });
    return () => {
      mounted = false;
    };
  }, [activeProfile]);

  const [aiReportSummary, setAiReportSummary] = useState<AiReportSummaryData | null>(null);

  useEffect(() => {
    if (!activeProfile || !currentAccount) {
      setAiReportSummary(null);
      return;
    }
    const attr = resolveReportHealerAttribution(activeProfile, accounts, currentAccount);
    const reqInput = {
      profile: activeProfile,
      healerName: attr.healerDisplayName,
      brandTitle: attr.brandTitle,
      language,
    };
    const cached = getCachedAiReportSummary(reqInput);
    if (cached) {
      setAiReportSummary(cached);
      return;
    }
    setAiReportSummary(buildClassicalFallbackSummary(reqInput));
    let mounted = true;
    fetchAiReportSummary(reqInput).then((data) => {
      if (mounted) setAiReportSummary(data);
    });
    return () => {
      mounted = false;
    };
  }, [
    activeProfile?.id,
    activeProfile?.name,
    activeProfile?.dob,
    activeProfile?.tob,
    activeProfile?.pob,
    activeProfile?.mobile,
    currentAccount?.id,
    language,
  ]);

  const [selectedSections, setSelectedSections] = useState<ReportSectionSelection>(() => {
    try {
      const saved = localStorage.getItem(REPORT_SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_REPORT_SECTIONS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_REPORT_SECTIONS;
  });

  const [includeActiveTabInPrint, setIncludeActiveTabInPrint] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(INCLUDE_ACTIVE_TAB_STORAGE_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return false;
  });

  const watermarkSettings = FIXED_WATERMARK_SETTINGS;

  useEffect(() => {
    try {
      localStorage.setItem(REPORT_SETTINGS_STORAGE_KEY, JSON.stringify(selectedSections));
    } catch {
      // Ignore storage quota errors
    }
  }, [selectedSections]);

  // Sync Partner Milan & Parivar Milan report sections with the client's opt-in checkboxes
  useEffect(() => {
    if (!activeProfile) return;
    setSelectedSections((prev) => ({
      ...prev,
      partnerMilanChakras: activeProfile.includePartnerMilan !== false,
      parivarMilan: activeProfile.includeParivarMilan !== false,
    }));
  }, [activeProfile?.id, activeProfile?.includePartnerMilan, activeProfile?.includeParivarMilan]);

  useEffect(() => {
    try {
      localStorage.setItem(INCLUDE_ACTIVE_TAB_STORAGE_KEY, JSON.stringify(includeActiveTabInPrint));
    } catch {
      // Ignore storage quota errors
    }
  }, [includeActiveTabInPrint]);

  useEffect(() => {
    try {
      localStorage.setItem(WATERMARK_SETTINGS_STORAGE_KEY, JSON.stringify(watermarkSettings));
    } catch {
      // Ignore storage quota errors
    }
  }, [watermarkSettings]);

  const reportDateRange = useMemo(() => {
    const startIso = new Date().toISOString();
    const startDate = new Date(startIso);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const formatShort = (d: Date) =>
      d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const twelveMonths: {
      monthLabel: string;
      periodRange: string;
      personalMonthNum: number;
      rulingPlanet: string;
      harmonyPercent: number;
      harmonyVerdict: string;
      challenges: string;
      remedy: string;
      forecastSummary: string;
      transitHighlight: string;
      moonPhaseDates: string;
      luckyDays: string;
    }[] = [];

    const m = activeProfile ? calculateMulank(activeProfile.dob) : 9;
    const b = activeProfile ? calculateBhagyank(activeProfile.dob) : 9;

    const monthlyChallengeByNum: Record<number, string> = {
      1: 'Ego friction with authority figures, impulsive commitments, or eye/heat fatigue if rushing decisions.',
      2: 'Emotional over-sensitivity, cashflow fluctuation, sleep disturbance, or indecision in partnerships.',
      3: 'Over-expansion, scattered focus, delayed approvals, or throat/digestive strain from excessive commitments.',
      4: 'Sudden delays, hidden misunderstandings, technical/paperwork hurdles, or restless mental overthinking.',
      5: 'Communication missteps, hasty verbal contracts, nervous fatigue, or scattered financial tracking.',
      6: 'Domestic spending spikes, relationship expectations, or complacency delaying key professional follow-ups.',
      7: 'Emotional detachment, communication gaps with family/clients, or unexpected travel/project pauses.',
      8: 'Slow karmic results, heavy workload pressure, joint/back fatigue, or delayed receivables requiring patience.',
      9: 'Tempered urgency, sudden disputes, impulsive spending, or energy burnout from over-exertion.',
    };

    const monthlyRemedyByNum: Record<number, string> = {
      1: 'Offer Copper-vessel Arghya to rising Sun daily, chant "Om Hraam Hreem Hraum Sah Suryaya Namah" (27x) & donate wheat/jaggery on Sundays.',
      2: 'Drink water from a silver glass, chant "Om Shraam Shreem Shraum Sah Chandraya Namah" (54x) & offer raw milk to Shivling on Mondays.',
      3: 'Apply saffron/turmeric tilak on forehead, chant "Om Graam Greem Graum Sah Gurave Namah" (27x) & donate yellow dal on Thursdays.',
      4: 'Keep workspace clutter-free, chant "Om Bhraam Bhreem Bhraum Sah Rahave Namah" (27x) & feed birds/stray dogs on Saturdays.',
      5: 'Wear emerald-green on Wednesdays, chant "Om Braam Breem Braum Sah Budhaya Namah" (54x) & donate green moong/spinach.',
      6: 'Use light sandal/rose fragrance, chant "Om Draam Dreem Draum Sah Shukraya Namah" (54x) & offer white sweets on Fridays.',
      7: 'Meditate 10 mins at dawn facing North-East, chant "Om Sraam Sreem Sraum Sah Ketave Namah" (27x) & donate blankets/sesame.',
      8: 'Light a mustard-oil diya under Peepal on Saturdays, chant "Om Praam Preem Praum Sah Shanaischaraya Namah" (54x) & avoid Rahu Kaal signings.',
      9: 'Recite Hanuman Chalisa on Tuesdays, chant "Om Kraam Kreem Kraum Sah Bhaumaya Namah" (27x) & donate red masoor/sweets.',
    };

    for (let i = 0; i < 12; i++) {
      const mStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());
      const mEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, startDate.getDate() - 1);
      const monthName = mStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      const rawNum = ((m + b + (mStart.getMonth() + 1) + i) % 9) || 9;
      const pInfo = PLANETARY_PROFILES[rawNum] || PLANETARY_PROFILES[1];

      const relM = getPlanetaryRelationship(m, rawNum);
      const relB = getPlanetaryRelationship(b, rawNum);
      let baseHarmony = 74;
      if (relM === 'friendly' && relB === 'friendly') baseHarmony = 92;
      else if (relM === 'friendly' && relB === 'neutral') baseHarmony = 84;
      else if (relM === 'neutral' && relB === 'friendly') baseHarmony = 82;
      else if (relM === 'neutral' && relB === 'neutral') baseHarmony = 75;
      else if (relM === 'friendly' && relB === 'inimical') baseHarmony = 68;
      else if (relM === 'inimical' && relB === 'friendly') baseHarmony = 66;
      else if (relM === 'neutral' && relB === 'inimical') baseHarmony = 61;
      else if (relM === 'inimical' && relB === 'neutral') baseHarmony = 59;
      else baseHarmony = 54;
      const harmonyPercent = Math.min(96, Math.max(50, baseHarmony + ((i % 3) - 1) * 2));
      const harmonyVerdict =
        harmonyPercent >= 82
          ? 'High Harmony'
          : harmonyPercent >= 68
          ? 'Balanced'
          : 'Caution — Remedy Advised';

      twelveMonths.push({
        monthLabel: `Month ${i + 1}: ${monthName}`,
        periodRange: `${formatShort(mStart)} – ${formatShort(mEnd)}`,
        personalMonthNum: rawNum,
        rulingPlanet: `${pInfo.planet} (${pInfo.sanskritName})`,
        harmonyPercent,
        harmonyVerdict,
        challenges: monthlyChallengeByNum[rawNum] || monthlyChallengeByNum[1],
        remedy: monthlyRemedyByNum[rawNum] || monthlyRemedyByNum[1],
        forecastSummary:
          i % 3 === 0
            ? `High career expansion, new financial opportunities, and favorable authority decisions under ${pInfo.planet}. Best for launching agreements, property bookings, and wealth investments.`
            : i % 3 === 1
            ? `Relationship harmony, family auspicious events, and network growth governed by ${pInfo.planet}. Excellent period for partnership alignment, client expansion, and spiritual sadhana.`
            : `Consolidation, health rejuvenation, debt clearance, and spiritual sadhana period under ${pInfo.planet}. Avoid impulsive speculation during Rahu Kaal and perform weekly charity.`,
        transitHighlight: `${pInfo.planet} & Guru Transit Alignment (${pInfo.element} Element Active) — Favorable Direction: East/North`,
        moonPhaseDates: `Shukla Purnima: 14th–16th • Amavasya: 28th–30th ${mStart.toLocaleDateString('en-IN', { month: 'short' })}`,
        luckyDays: pInfo.luckyDays.join(', '),
      });
    }

    return {
      startFormatted: formatShort(startDate),
      endFormatted: formatShort(endDate),
      twelveMonths,
    };
  }, [activeProfile]);

  const multiSectionReportData = useMemo(() => {
    if (!activeProfile) return null;
    const m = calculateMulank(activeProfile.dob);
    const b = calculateBhagyank(activeProfile.dob);
    const nameAnalysis = analyzeName(activeProfile.name, m, b);
    const nPlanetFallback =
      PLANETARY_PROFILES[nameAnalysis.chaldeanSingle] || PLANETARY_PROFILES[1];
    const nameSuggestions = generateNameCorrections(activeProfile.name, m, b);
    const topPerfectChoice =
      nameSuggestions.find((s) => s.harmonyScore >= 90) ||
      nameSuggestions[0] || {
        originalName: activeProfile.name,
        suggestedName: activeProfile.name,
        compoundNumber: nameAnalysis.totalChaldeanCompound,
        singleDigit: nameAnalysis.chaldeanSingle,
        compoundTitle: nameAnalysis.compoundInfo.title,
        changeExplanation: 'Current name spelling is already in auspicious cosmic harmony.',
        harmonyScore: nameAnalysis.harmonyScore,
        targetPlanet: nPlanetFallback.planet,
        planetaryBlessing: `Naturally aligned with ${nPlanetFallback.planet}.`,
        isTopPerfectChoice: true,
      };
    const mobileAnalysis = analyzeMobileNumber(activeProfile.mobile || '', m, b);
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
    const clientBodyWeightKg = activeProfile.bodyWeightKg || 65;
    const gemRecommend = calculateGemstoneRecommendationsForProfile(
      {
        id: activeProfile.id,
        name: activeProfile.name,
        dob: activeProfile.dob,
        tob: activeProfile.tob || '09:30',
        pob: activeProfile.pob || 'New Delhi, India',
        lat: activeProfile.lat ?? 28.6139,
        lng: activeProfile.lng ?? 77.209,
        mobile: activeProfile.mobile || '9876543210',
        gender: activeProfile.gender,
        bodyWeightKg: clientBodyWeightKg,
      },
      clientBodyWeightKg
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
        mobile: activeProfile.mobile || '9876543210',
        gender: activeProfile.gender,
        bodyWeightKg: clientBodyWeightKg,
      },
      activeProfile.originalName || activeProfile.name,
      clientBodyWeightKg
    );

    const triadCompound =
      m + b + nameAnalysis.totalChaldeanCompound + advMobile.mobileCompound;
    const triadSingle =
      ((m + b + nameAnalysis.chaldeanSingle + advMobile.mobileTotal - 1) % 9) + 1;
    const triadPlanet = PLANETARY_PROFILES[triadSingle] || PLANETARY_PROFILES[1];
    const relMulankMobile = getPlanetaryRelationship(m, advMobile.mobileTotal);
    const relBhagyankMobile = getPlanetaryRelationship(b, advMobile.mobileTotal);
    const relNameMobile = getPlanetaryRelationship(
      nameAnalysis.chaldeanSingle,
      advMobile.mobileTotal
    );
    const relMulankName = getPlanetaryRelationship(m, nameAnalysis.chaldeanSingle);
    const nameMobileBonus =
      relNameMobile === 'friendly' ? 20 : relNameMobile === 'neutral' ? 14 : 7;
    const combinedTriadScore = Math.min(
      99,
      Math.max(
        38,
        Math.round(
          nameAnalysis.harmonyScore * 0.35 +
            mobileAnalysis.overallScore * 0.45 +
            nameMobileBonus
        )
      )
    );
    const combinedCareerProfile = calculateCareerAndAuraProfile(
      activeProfile.name,
      m,
      b,
      triadSingle
    );

    const vehicleValidation = validateNumericEntity(
      `DL01AB${m}${b}${PLANETARY_PROFILES[m]?.friendlyNumbers[0] || m}${PLANETARY_PROFILES[b]?.friendlyNumbers[0] || b}`,
      'Vehicle',
      m,
      b
    );
    const flatValidation = validateNumericEntity(
      `${PLANETARY_PROFILES[m]?.friendlyNumbers[0] || m}0${b}`,
      'House',
      m,
      b
    );
    const businessValidation = validateNumericEntity(
      activeProfile.name,
      'Account',
      m,
      b
    );
    const mobileValidation = validateNumericEntity(
      activeProfile.mobile || '9876543210',
      'Mobile',
      m,
      b
    );

    const todayIso = new Date().toISOString();
    const reportYear = new Date(todayIso).getFullYear();
    const festivals = getPersonalizedIndianFestivals(
      activeProfile.name,
      m,
      b,
      nameAnalysis.chaldeanSingle,
      astro.rashi,
      reportYear >= 2026 && reportYear <= 2030 ? reportYear : 2026,
      todayIso,
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
      todayIso
    );
    const { groom: groomProfile, bride: brideProfile } = resolveGroomAndBrideProfiles(activeProfile);
    const partnerMilan = calculateCompatibility(groomProfile, brideProfile);
    const groomNameAnalysis = analyzeName(
      groomProfile.name,
      partnerMilan.p1Mulank,
      partnerMilan.p1Bhagyank
    );
    const brideNameAnalysis = analyzeName(
      brideProfile.name,
      partnerMilan.p2Mulank,
      partnerMilan.p2Bhagyank
    );
    const partnerRatnaRec = calculatePartnerMilanRatnaRecommendations(
      groomProfile,
      brideProfile,
      partnerMilan
    );
    const lunar12Months = generate12MonthLunarAndAstroForecast(
      todayIso,
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
    const parivarSavedMembers = ((activeProfile.parivarMembers || []) as ParivarMemberRecord[])
      .filter((fm) => fm && fm.isSaved && fm.name?.trim() && fm.dob?.trim())
      .slice(0, 5);
    const parivarReport = calculateParivarMilanReport(
      {
        name: activeProfile.name,
        dob: activeProfile.dob,
        tob: activeProfile.tob || '09:30',
        pob: activeProfile.pob || 'New Delhi, India',
        lat: activeProfile.lat ?? 28.6139,
        lng: activeProfile.lng ?? 77.209,
      },
      parivarSavedMembers
    );
    return {
      m,
      b,
      nameAnalysis,
      nameSuggestions,
      topPerfectChoice,
      mobileAnalysis,
      advMobile,
      panchang,
      loShu,
      astro,
      career,
      gemRecommend,
      nameAndGrowthRatna,
      triadCompound,
      triadSingle,
      triadPlanet,
      relMulankMobile,
      relBhagyankMobile,
      relNameMobile,
      relMulankName,
      combinedTriadScore,
      combinedCareerProfile,
      vehicleValidation,
      flatValidation,
      businessValidation,
      mobileValidation,
      festivals,
      islamicReport,
      bestEvents12M,
      groomProfile,
      brideProfile,
      groomNameAnalysis,
      brideNameAnalysis,
      partnerMilan,
      partnerRatnaRec,
      lunar12Months,
      yogaPlan,
      parivarReport,
    };
  }, [activeProfile]);

  if (!currentAccount) {
    return <>{children}</>;
  }

  const {
    isHealerReport,
    healerAccount: healerAccountForBranding,
    brandLogo,
    brandTitle,
    healerDisplayName,
    healerDisplayMobile,
    healerDisplayEmail,
    healerDisplayAddress,
    healerInstagram,
    healerFacebook,
    healerYoutube,
    healerWebsite,
    watermarkTagline,
  } = resolveReportHealerAttribution(activeProfile, accounts, currentAccount);
  const isAdmin = currentAccount.role === 'admin';

  const latestBroadcast = broadcasts.find(
    (b) =>
      b.id !== dismissedBroadcastId &&
      (b.targetAudience === 'all' || b.targetAudience === currentAccount.role)
  );

  const pdfPageCountInfo = useMemo(() => {
    if (!activeProfile) {
      return {
        totalPdfPages: 0,
        modulePageCounts: {
          nameAndCareer: 5,
          advanceMobileAudit: 5,
          forecast12Months: 3,
          auditedCalendar12Months: 2,
          transitsAndMoon12Months: 2,
          dailyMantras: 1,
          yogaAndPranayama: 2,
          partnerMilanChakras: 3,
          parivarMilan: 1,
          festivals12Months: 3,
          islamicVedicRemedies: 2,
        } as Record<keyof ReportSectionSelection, number>,
        modulePageRanges: {
          nameAndCareer: { startPage: 2, endPage: 6, pageCount: 5 },
          advanceMobileAudit: { startPage: 7, endPage: 11, pageCount: 5 },
          forecast12Months: { startPage: 12, endPage: 14, pageCount: 3 },
          auditedCalendar12Months: { startPage: 15, endPage: 16, pageCount: 2 },
          transitsAndMoon12Months: { startPage: 17, endPage: 18, pageCount: 2 },
          dailyMantras: { startPage: 19, endPage: 19, pageCount: 1 },
          yogaAndPranayama: { startPage: 20, endPage: 21, pageCount: 2 },
          partnerMilanChakras: { startPage: 22, endPage: 24, pageCount: 3 },
          parivarMilan: { startPage: 25, endPage: 25, pageCount: 1 },
          festivals12Months: { startPage: 26, endPage: 28, pageCount: 3 },
          islamicVedicRemedies: { startPage: 29, endPage: 30, pageCount: 2 },
        } as Record<keyof ReportSectionSelection, { startPage: number; endPage: number; pageCount: number }>,
        closingSummaryPageRange: { startPage: 31, endPage: 32, pageCount: 2 },
      };
    }
    return calculateExactPdfPageCounts({
      activeProfile,
      healerAccount: healerAccountForBranding,
      isHealerReport,
      brandTitle,
      healerDisplayName,
      healerDisplayMobile,
      healerDisplayEmail,
      healerDisplayAddress,
      healerInstagram,
      healerFacebook,
      healerYoutube,
      healerWebsite,
      startFormatted: reportDateRange.startFormatted,
      endFormatted: reportDateRange.endFormatted,
      twelveMonths: reportDateRange.twelveMonths,
      qrCodeDataUrl: reportQrDataUrl,
      qrCodeDirectUrl: reportQrDirectUrl,
      watermarkOpacityPercent: watermarkSettings.opacityPercent,
      watermarkEnabled: watermarkSettings.enabled,
      selectedSections,
      language,
      aiReportSummary: aiReportSummary || undefined,
    });
  }, [
    activeProfile,
    healerAccountForBranding,
    isHealerReport,
    brandTitle,
    healerDisplayName,
    healerDisplayMobile,
    healerDisplayEmail,
    healerDisplayAddress,
    healerInstagram,
    healerFacebook,
    healerYoutube,
    healerWebsite,
    reportDateRange,
    reportQrDataUrl,
    reportQrDirectUrl,
    watermarkSettings.opacityPercent,
    watermarkSettings.enabled,
    selectedSections,
    language,
    aiReportSummary,
  ]);

  const modulePageCounts = pdfPageCountInfo.modulePageCounts;
  const fmtPg = (n: number) => `${n} ${n === 1 ? 'Page' : 'Pages'}`;

  const MODULE_OPTIONS: {
    key: keyof ReportSectionSelection;
    label: string;
    shortLabel: string;
    pageCount: number;
    sub: string;
  }[] = [
    {
      key: 'nameAndCareer',
      label: tr(`1. Name, Career, Ratna & Validator (${fmtPg(modulePageCounts.nameAndCareer)})`),
      shortLabel: tr('Name, Career & Ratna'),
      pageCount: modulePageCounts.nameAndCareer,
      sub: tr('Birth Chart, Lo-Shu 8 Planes, Name Spellings, All Career Sectors, 5-Pillar Ratna & Universal Validator'),
    },
    {
      key: 'advanceMobileAudit',
      label: tr(`2. Advance Mobile, Triad, 3×3 Grid & Dasha (${fmtPg(modulePageCounts.advanceMobileAudit)})`),
      shortLabel: tr('Mobile, Grid & Dasha'),
      pageCount: modulePageCounts.advanceMobileAudit,
      sub: tr('All 9 Pairs, Combined Name+DOB+Mobile Triad, Virtual SIMs, 3×3 Grid, Present/Missing Remedies & 10-Cycle Dasha'),
    },
    {
      key: 'forecast12Months',
      label: tr(`3. 12M Monthly & 7-Day Weekly Forecast (${fmtPg(modulePageCounts.forecast12Months)})`),
      shortLabel: tr('12M & 7-Day Forecast'),
      pageCount: modulePageCounts.forecast12Months,
      sub: tr(`Per-Day Career/Love/Vitality Chants & 12-Month Summary (${reportDateRange.startFormatted} – ${reportDateRange.endFormatted})`),
    },
    {
      key: 'auditedCalendar12Months',
      label: tr(`4. Best Upcoming Muhurat Timings (${fmtPg(modulePageCounts.auditedCalendar12Months)})`),
      shortLabel: tr('12M Best Muhurats'),
      pageCount: modulePageCounts.auditedCalendar12Months,
      sub: tr('All 12 Life Events with Nakshatra Yoga, Rahu Kaal, Choghadiya, Backup Dates & Mantras'),
    },
    {
      key: 'transitsAndMoon12Months',
      label: tr(`5. Planetary Transits & 12M Moon Phases (${fmtPg(modulePageCounts.transitsAndMoon12Months)})`),
      shortLabel: tr('12M Transits & Moon'),
      pageCount: modulePageCounts.transitsAndMoon12Months,
      sub: tr('All 5 Gochar Transits & 12M Purnima/Amavasya/Ekadashi Table with Parallel Remedies'),
    },
    {
      key: 'dailyMantras',
      label: tr(`6. Daily Vedic Mantras & Navagraha (${fmtPg(modulePageCounts.dailyMantras)})`),
      shortLabel: tr('Vedic Mantras'),
      pageCount: modulePageCounts.dailyMantras,
      sub: tr('All 4 Daily Time-Phase Mantras (Mala, Mudra, Meaning) & 9-Planet Navagraha Table'),
    },
    {
      key: 'yogaAndPranayama',
      label: tr(`7. Vedic Yoga, Pranayama & 7-Day Planner (${fmtPg(modulePageCounts.yogaAndPranayama)})`),
      shortLabel: tr('Yoga & Pranayama'),
      pageCount: modulePageCounts.yogaAndPranayama,
      sub: tr('Daily Vedic Asanas with Visual Diagrams, Pranayama Breathing, Health Remedies & 7-Day Weekly Planner'),
    },
    {
      key: 'partnerMilanChakras',
      label: tr(`8. Complete Partner Milan & 9-Chakras (Opt-In • ${fmtPg(modulePageCounts.partnerMilanChakras)})`),
      shortLabel: tr('Partner Milan (Opt-In)'),
      pageCount: modulePageCounts.partnerMilanChakras,
      sub: tr('Groom/Bride Natal Table, 8-Koota Ashtakoot Chart & All 9 Chakras Complete Diagnostics/Remedies'),
    },
    {
      key: 'festivals12Months',
      label: tr(`9. Next 12M All-India Festivals (${fmtPg(modulePageCounts.festivals12Months)})`),
      shortLabel: tr('12M Festivals'),
      pageCount: modulePageCounts.festivals12Months,
      sub: tr('All 16 Festivals with Score %, 4 Puja Windows (Siddha/Punya/Bhadra/Varjya), Diya & Aura Remedies'),
    },
    {
      key: 'islamicVedicRemedies',
      label: tr(`10. Islamic-Vedic Remedies (${fmtPg(modulePageCounts.islamicVedicRemedies)})`),
      shortLabel: tr('Islamic Remedies'),
      pageCount: modulePageCounts.islamicVedicRemedies,
      sub: tr('3 Personal Asma-ul-Husna Cards, All 5 Quranic Surahs, 7-Day Schedule & 1-to-9 Adad Reference Table'),
    },
    {
      key: 'parivarMilan',
      label: tr(`11. Parivar Milan & 9-Chakra Family Report (Opt-In • ${fmtPg(modulePageCounts.parivarMilan ?? 0)})`),
      shortLabel: tr('Parivar Milan (Opt-In)'),
      pageCount: modulePageCounts.parivarMilan ?? 0,
      sub: tr('Conclusive Harmony Graph, 9-Chakra Family Diagnostics, Vedic Astrology & Gemstone/Rudraksha Remedies'),
    },
  ];

  const toggleSectionCheckbox = (key: keyof ReportSectionSelection) => {
    const nextVal = !selectedSections[key];
    setSelectedSections((prev) => ({ ...prev, [key]: nextVal }));
    if (key === 'partnerMilanChakras' && activeProfile) {
      void adminUpdateProfile({ ...activeProfile, includePartnerMilan: nextVal });
    }
    if (key === 'parivarMilan' && activeProfile) {
      void adminUpdateProfile({ ...activeProfile, includeParivarMilan: nextVal });
    }
  };

  const handleSelectAllModules = () => {
    setSelectedSections({
      ...DEFAULT_REPORT_SECTIONS,
      partnerMilanChakras: true,
      parivarMilan: true,
    });
    if (activeProfile) {
      void adminUpdateProfile({
        ...activeProfile,
        includePartnerMilan: true,
        includeParivarMilan: true,
      });
    }
  };

  const handleSelectCoreFour = () => {
    setSelectedSections({
      nameAndCareer: true,
      advanceMobileAudit: true,
      forecast12Months: true,
      auditedCalendar12Months: true,
      transitsAndMoon12Months: true,
      dailyMantras: false,
      yogaAndPranayama: true,
      partnerMilanChakras: false,
      parivarMilan: false,
      festivals12Months: false,
      islamicVedicRemedies: false,
    });
  };

  const getSelectedSectionLabels = (excludeIslamicLabel = false) => {
    const labels: string[] = [];
    if (selectedSections.nameAndCareer) labels.push(tr('Detailed Name & Career Harmony'));
    if (selectedSections.advanceMobileAudit) labels.push(tr('Advance Mobile Audit & Vedic Grid'));
    if (selectedSections.forecast12Months) labels.push(tr('12-Month & 7-Day Weekly Forecast'));
    if (selectedSections.auditedCalendar12Months) labels.push(tr('12-Month Best Upcoming Muhurat Calendar'));
    if (selectedSections.transitsAndMoon12Months) labels.push(tr('Planetary Transits & Moon Phases'));
    if (selectedSections.dailyMantras) labels.push(tr('Daily Vedic Mantras'));
    if (selectedSections.yogaAndPranayama) labels.push(tr('Vedic Yoga, Pranayama & 7-Day Planner'));
    if (selectedSections.partnerMilanChakras) labels.push(tr('Complete Partner Milan & 9-Chakras'));
    if (selectedSections.parivarMilan) labels.push(tr('Complete Parivar Milan & 9-Chakra Family Report'));
    if (selectedSections.festivals12Months) labels.push(tr('All-India 12-Month Festivals'));
    if (selectedSections.islamicVedicRemedies && !excludeIslamicLabel) {
      labels.push(tr('Islamic-Vedic Remedies'));
    }
    return labels;
  };

  const selectedCount = getSelectedSectionLabels(false).length;

  const handleOpenPrintPreview = () => {
    setIsPrintPreviewOpen(true);
  };

  useEffect(() => {
    const onOpenPrintPreview = () => {
      setIsPrintPreviewOpen(true);
    };
    window.addEventListener('tathastu:open-print-preview', onOpenPrintPreview);
    return () => {
      window.removeEventListener('tathastu:open-print-preview', onOpenPrintPreview);
    };
  }, []);

  const persistSignedPdfUrlToSharedReport = async (signedUrl: string | null | undefined) => {
    if (!signedUrl || !activeProfile?.id || !auth.currentUser) return;
    try {
      await firestoreSetDoc(
        firestoreDoc(db, 'tathastu_shared_reports', activeProfile.id),
        {
          id: activeProfile.id,
          profileId: activeProfile.id,
          ownerUid: auth.currentUser.uid,
          name: activeProfile.name,
          clientName: activeProfile.name,
          dob: activeProfile.dob,
          tob: activeProfile.tob || '12:00',
          pob: activeProfile.pob || 'New Delhi, India',
          mobile: activeProfile.mobile || '',
          signedPdfUrl: signedUrl.slice(0, 2040),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `tathastu_shared_reports/${activeProfile.id}`);
      } catch {
        // Non-blocking sync
      }
    }
  };

  const generateExactPreviewPdfBlob = async (
    mode: 'download' | 'blob'
  ): Promise<{ blob: Blob; fileName: string; signedUrl?: string | null }> => {
    if (!activeProfile) {
      throw new Error('No active profile selected.');
    }

    const safeName = (activeProfile.name || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `TATHASTU_${safeName}_Vedic_Report.pdf`;

    try {
      setIsGeneratingPdf(true);
      setPdfExportProgress({ current: 0, total: totalPageCount });

      // Wait for off-screen exact-A4 capture DOM to mount and fonts/images to settle
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const container = pdfCaptureContainerRef.current;
      const pageNodes = container
        ? (Array.from(container.querySelectorAll('.a4-sheet-page')) as HTMLElement[])
        : [];

      if (pageNodes.length === 0) {
        throw new Error('No A4 preview sheets found for WYSIWYG capture.');
      }

      // Ensure all images inside capture nodes are fully decoded before snapshot
      const imgs = Array.from(container!.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            setTimeout(done, 1500);
          });
        })
      );

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const A4_W_MM = 210;
      const A4_H_MM = 297;

      for (let idx = 0; idx < pageNodes.length; idx++) {
        const sheetEl = pageNodes[idx];
        setPdfExportProgress({ current: idx + 1, total: pageNodes.length });

        const sheetW = Math.max(sheetEl.offsetWidth || 794, 794);
        const sheetH = Math.max(sheetEl.scrollHeight || 1123, 1123);

        const dataUrl = await toJpeg(sheetEl, {
          quality: 0.88,
          pixelRatio: 1.65,
          width: sheetW,
          height: sheetH,
          backgroundColor: '#060916',
          cacheBust: false,
          skipAutoScale: true,
        });

        if (idx > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Fill A4 page canvas with cosmic dark base so edges never show white strips
        pdf.setFillColor(6, 9, 22);
        pdf.rect(0, 0, A4_W_MM, A4_H_MM, 'F');

        const aspectRatio = sheetH / sheetW;
        const a4Ratio = A4_H_MM / A4_W_MM;
        let drawW = A4_W_MM;
        let drawH = A4_W_MM * aspectRatio;
        let drawX = 0;
        let drawY = 0;

        if (aspectRatio > a4Ratio) {
          drawH = A4_H_MM;
          drawW = A4_H_MM / aspectRatio;
          drawX = (A4_W_MM - drawW) / 2;
        } else {
          drawY = (A4_H_MM - drawH) / 2;
        }

        pdf.addImage(dataUrl, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');
      }

      const blob = pdf.output('blob');

      if (mode === 'download') {
        triggerCrossPlatformPdfBlobDownload(blob, fileName);
      }

      let signedUrl: string | null = null;
      try {
        signedUrl = await uploadReportPdfAndGetSignedUrl(activeProfile.id, fileName, blob);
      } catch {
        signedUrl = null;
      }

      return { blob, fileName, signedUrl };
    } catch {
      // Seamless vector PDF fallback if browser DOM capture encounters a restriction
      return await generateAndExport18PagePdf(
        {
          activeProfile,
          healerAccount: healerAccountForBranding,
          isHealerReport,
          brandTitle,
          healerDisplayName,
          healerDisplayMobile,
          healerDisplayEmail,
          healerDisplayAddress,
          healerInstagram,
          healerFacebook,
          healerYoutube,
          healerWebsite,
          startFormatted: reportDateRange.startFormatted,
          endFormatted: reportDateRange.endFormatted,
          twelveMonths: reportDateRange.twelveMonths,
          qrCodeDataUrl: reportQrDataUrl,
          qrCodeDirectUrl: reportQrDirectUrl,
          watermarkOpacityPercent: watermarkSettings.opacityPercent,
          watermarkEnabled: watermarkSettings.enabled,
          selectedSections,
          language,
          aiReportSummary: aiReportSummary || undefined,
        },
        mode
      );
    } finally {
      setIsGeneratingPdf(false);
      setPdfExportProgress(null);
    }
  };

  const handleDownloadPdfDirectly = async () => {
    if (!canCurrentAccountDownloadOrShare()) {
      triggerAdminRestrictionPopup('Download PDF Report');
      return;
    }
    if (!activeProfile || isGeneratingPdf) return;

    const { signedUrl } = await generateExactPreviewPdfBlob('download');

    if (signedUrl) {
      void persistSignedPdfUrlToSharedReport(signedUrl);
    }

    setShareToast(
      `Exact A4 Report PDF (${activeProfile.name}) matching Print Preview downloaded!`
    );
    setTimeout(() => setShareToast(null), 4500);
  };

  // Automatically trigger PDF download when opened via Direct Download Link or QR Code (?autoDownloadPdf=1)
  useEffect(() => {
    if (!activeProfile || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoDownloadPdf') === '1') {
      params.delete('autoDownloadPdf');
      const nextQuery = params.toString();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`
      );
      const timer = setTimeout(() => {
        void handleDownloadPdfDirectly();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [activeProfile?.id]);

  const handleCopyDirectDownloadLink = async () => {
    if (!activeProfile || !reportDirectDownloadLink || isGeneratingPdf) return;
    let finalLinkToCopy = reportDirectDownloadLink;
    try {
      const { signedUrl } = await generateExactPreviewPdfBlob('blob');
      if (signedUrl && signedUrl.startsWith('https://firebasestorage.googleapis.com/')) {
        finalLinkToCopy = signedUrl;
        void persistSignedPdfUrlToSharedReport(signedUrl);
      }
    } catch {
      // Fallback to reportDirectDownloadLink
    }
    navigator.clipboard.writeText(finalLinkToCopy);
    setShareToast(
      `Signed Direct PDF Download Link for ${activeProfile.name} copied! Open on any Android/iOS browser to download without 403 error.`
    );
    setTimeout(() => setShareToast(null), 4000);
  };

  const handleWhatsAppReportLinkOnly = async () => {
    if (!canCurrentAccountDownloadOrShare()) {
      triggerAdminRestrictionPopup('WhatsApp Report Download Link');
      return;
    }
    if (!activeProfile || !reportDirectDownloadLink || isGeneratingPdf) return;
    let signedDirectPdfUrl: string | null = null;
    try {
      const { blob, fileName, signedUrl } = await generateExactPreviewPdfBlob('download');
      if (signedUrl) {
        signedDirectPdfUrl = signedUrl;
        void persistSignedPdfUrlToSharedReport(signedUrl);
      }
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [pdfFile] })
      ) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `${brandTitle} — ${activeProfile.name} PDF Report`,
            text: `🕉️ ${brandTitle} — Personalized Vedic & Chaldean Numerology PDF Report for ${activeProfile.name} (DOB: ${activeProfile.dob}). Prepared by Healer ${healerDisplayName} (${healerDisplayMobile}).`,
          });
          return;
        } catch {
          // Continue to WhatsApp message dispatch
        }
      }
    } catch {
      // Continue to WhatsApp message dispatch
    }
    const msgLines = [
      `🕉️ *${brandTitle}* — *${TATHASTU_BRAND_NAME} (${TATHASTU_TAGLINE})*`,
      `Namaste *${activeProfile.name}* Ji,`,
      ``,
      `📄 *Your Personalized PDF Report (${activeProfile.name}) has been generated & downloaded to attach directly!*`,
    ];
    if (signedDirectPdfUrl && signedDirectPdfUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      msgLines.push(`📥 *Direct Signed PDF Download Link (Android / iOS):*`, `${signedDirectPdfUrl}`, ``);
    }
    msgLines.push(
      `🌐 *Interactive Cloud Report Portal:*`,
      `${reportDirectDownloadLink}`,
      ``,
      `📅 *Report Validity (Next 12 Months):* ${reportDateRange.startFormatted} to ${reportDateRange.endFormatted}`,
      `Prepared By Healer: *${healerDisplayName}* (📞 ${healerDisplayMobile})`
    );
    await dispatchWhatsAppMessage(activeProfile.mobile, msgLines.join('\n'));
  };

  const handlePrintPdfReport = () => {
    if (!canCurrentAccountDownloadOrShare()) {
      triggerAdminRestrictionPopup('Print PDF Report');
      return;
    }
    if (!activeProfile) return;

    setTimeout(() => {
      try {
        window.print();
      } catch {
        // Fallback
      }
    }, 60);
  };

  const handleShareReport = async () => {
    if (!canCurrentAccountDownloadOrShare()) {
      triggerAdminRestrictionPopup('Share Report');
      return;
    }
    if (!activeProfile) return;
    const chosen = getSelectedSectionLabels(true).join(', ');
    const rawShareText = `🕉️ ${TATHASTU_BRAND_NAME} (${TATHASTU_TAGLINE}) — Personalized Vedic & Chaldean Numerology Report for ${activeProfile.name} (DOB: ${activeProfile.dob})\nIncluded Sections: ${chosen}\nValidity: ${reportDateRange.startFormatted} to ${reportDateRange.endFormatted}\nHealer: ${healerDisplayName} (${healerDisplayMobile}) • IG: ${healerInstagram}`;
    const shareText = translateMultilineBlock(rawShareText, language);

    try {
      const { blob, fileName } = await generateAndExport18PagePdf(
        {
          activeProfile,
          healerAccount: healerAccountForBranding,
          isHealerReport,
          brandTitle,
          healerDisplayName,
          healerDisplayMobile,
          healerDisplayEmail,
          healerDisplayAddress,
          healerInstagram,
          healerFacebook,
          healerYoutube,
          healerWebsite,
          startFormatted: reportDateRange.startFormatted,
          endFormatted: reportDateRange.endFormatted,
          twelveMonths: reportDateRange.twelveMonths,
          qrCodeDataUrl: reportQrDataUrl,
          qrCodeDirectUrl: reportQrDirectUrl,
          watermarkOpacityPercent: watermarkSettings.opacityPercent,
          watermarkEnabled: watermarkSettings.enabled,
          selectedSections,
          language,
          aiReportSummary: aiReportSummary || undefined,
        },
        'blob'
      );
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [pdfFile] })
      ) {
        await navigator.share({
          files: [pdfFile],
          title: `${brandTitle} — ${activeProfile.name} Personalized PDF Report`,
          text: shareText,
        });
        setShareToast(`PDF Report file (${fileName}) shared directly!`);
        setTimeout(() => setShareToast(null), 3500);
        return;
      }
      // Also trigger cross-platform file download if file sharing isn't supported on this browser
      triggerCrossPlatformPdfBlobDownload(blob, fileName);
    } catch {
      // Fallback to text share
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${brandTitle} — ${activeProfile.name} Personalized Report`,
          text: shareText,
          url: reportQrDirectUrl || window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(`${shareText}\nDirect Report Link: ${reportQrDirectUrl}`);
    setShareToast('Personalized PDF Report downloaded & summary copied to clipboard for sharing!');
    setTimeout(() => setShareToast(null), 3500);
  };

  const handleDirectWhatsAppReport = async () => {
    if (!canCurrentAccountDownloadOrShare()) {
      triggerAdminRestrictionPopup('Direct WhatsApp Report');
      return;
    }
    if (!activeProfile || !multiSectionReportData) return;
    const { m, b, nameAnalysis, mobileAnalysis, panchang, bestEvents12M } =
      multiSectionReportData;

    const chosen = getSelectedSectionLabels(true);
    const { reportStatusSummary, auspiciousTimeSummary, deepLinkSection } =
      buildClientStatusAndAuspiciousUpdateBlock(activeProfile);

    const lines: string[] = [
      `🕉️ *${brandTitle}*`,
      `✨ *${TATHASTU_BRAND_NAME} — ${TATHASTU_TAGLINE}*`,
      `*PERSONALIZED VEDIC & CHALDEAN NUMEROLOGY REPORT*`,
      `Client Name: *${activeProfile.name}* (DOB: ${activeProfile.dob})`,
      `Report Period (Next 12 Months): *${reportDateRange.startFormatted} to ${reportDateRange.endFormatted}*`,
      `Included Modules: ${chosen.join(' | ')}`,
      ``,
      ...reportStatusSummary,
      ``,
      ...auspiciousTimeSummary,
      ``,
    ];

    if (selectedSections.nameAndCareer) {
      lines.push(
        `🔥 *1. NAME & CAREER HARMONY:*`,
        `• Mulank: ${m} (${PLANETARY_PROFILES[m]?.planet}) | Bhagyank: ${b} (${PLANETARY_PROFILES[b]?.planet})`,
        `• Current Name Compound: ${nameAnalysis.totalChaldeanCompound} ➔ ${nameAnalysis.chaldeanSingle} (${nameAnalysis.harmonyScore}% Harmony)`,
        ``
      );
    }

    if (selectedSections.advanceMobileAudit) {
      lines.push(
        `📱 *2. ADVANCE MOBILE AUDIT (${activeProfile.mobile}):*`,
        `• Mobile Compound: ${mobileAnalysis.compoundNumber} ➔ ${mobileAnalysis.singleDigit} (Score: ${mobileAnalysis.overallScore}/100)`,
        `• Verdict: ${mobileAnalysis.verdict}`,
        ``
      );
    }

    if (selectedSections.auditedCalendar12Months && bestEvents12M.events12M[0]) {
      lines.push(
        `📅 *3. BEST UPCOMING MUHURAT (NEXT 12 MONTHS):*`,
        `• ${bestEvents12M.events12M[0].title}: *${bestEvents12M.events12M[0].bestUpcomingDate}* (${bestEvents12M.events12M[0].bestTimeWindow})`,
        ``
      );
    }

    if (selectedSections.dailyMantras) {
      lines.push(
        `🕉️ *4. DAILY VEDIC MANTRA:*`,
        `• "${panchang.todayBeejMantra}"`,
        ``
      );
    }

    if (
      selectedSections.parivarMilan &&
      multiSectionReportData.parivarReport &&
      multiSectionReportData.parivarReport.memberResults.length > 0
    ) {
      const pRep = multiSectionReportData.parivarReport;
      lines.push(
        `👨‍👩‍👧‍👦 *5. PARIVAR MILAN & 9-CHAKRA FAMILY HARMONY:*`,
        `• Overall Parivar Harmony: *${pRep.averageFamilyHarmony}%* (${pRep.familyCollectiveVerdict})`,
        ...pRep.memberResults.map(
          (mr) =>
            `• ${mr.member.name} (${mr.member.relation}): *${mr.overallHarmonyScore}%* | Rashi: ${mr.vedicAstrologyHarmony.bhakootAxisLabel.split(' ')[0]} (${mr.vedicAstrologyHarmony.rashiHarmonyScore}%) | Rudraksha: ${mr.gemstoneAndRudrakshaRemedy.familyUnityRudraksha}`
        ),
        `_${pRep.importantDisclaimer}_`,
        ``
      );
    }

    lines.push(
      ...deepLinkSection,
      ``,
      `Prepared & Energized By Healer: *${healerDisplayName}* (${brandTitle})`,
      `📞 ${healerDisplayMobile} • ✉️ ${healerDisplayEmail}`,
      `📸 IG: ${healerInstagram} • FB: ${healerFacebook} • 🌐 ${healerWebsite}`
    );

    await dispatchWhatsAppMessage(activeProfile.mobile, lines.join('\n'));
  };

  const handleEditOrDeleteAttempt = (actionLabel: 'Edit Profile' | 'Delete Profile') => {
    if (actionLabel === 'Edit Profile') {
      if (onOpenEditProfileModal) {
        onOpenEditProfileModal();
        return;
      }
      onOpenAdminPortal?.();
      return;
    }
    if (!canCurrentAccountEditOrDelete()) {
      triggerAdminRestrictionPopup(actionLabel);
      return;
    }
    if (activeProfile) {
      void adminDeleteProfile(activeProfile.id);
      clearActiveProfile();
    }
    onOpenAdminPortal?.();
  };

  const renderCenteredBrandWatermark = () => {
    if (!watermarkSettings.enabled) return null;
    const opacityValue = Math.max(0.04, Math.min(0.24, watermarkSettings.opacityPercent / 100));
    const emblemSize = watermarkSettings.sizePx;
    const haloSize = emblemSize + 76;

    return (
      <div
        className="a4-center-brand-watermark"
        style={{ opacity: opacityValue }}
        aria-hidden="true"
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: `${haloSize}px`, height: `${haloSize}px` }}
        >
          {/* Sacred Concentric Mandala & Solar Halo Around TATHASTU Watermark */}
          <svg
            viewBox="0 0 360 360"
            className="absolute inset-0 w-full h-full text-amber-400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="180" cy="180" r="174" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" />
            <circle cx="180" cy="180" r="158" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="180" cy="180" r="142" stroke="currentColor" strokeWidth="2.5" />
            {Array.from({ length: 16 }).map((_, idx) => {
              const angle = (idx * Math.PI) / 8;
              const x1 = 180 + Math.cos(angle) * 138;
              const y1 = 180 + Math.sin(angle) * 138;
              const x2 = 180 + Math.cos(angle) * 174;
              const y2 = 180 + Math.sin(angle) * 174;
              return (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              );
            })}
          </svg>

          <div
            className="relative rounded-full border-4 border-amber-400/90 p-2.5 flex items-center justify-center shadow-2xl bg-slate-950/60"
            style={{ width: `${emblemSize}px`, height: `${emblemSize}px` }}
          >
            <img
              src={TATHASTU_LOGO_PATH}
              alt={TATHASTU_BRAND_NAME}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        {watermarkSettings.showBrandText && (
          <div className="mt-2 max-w-lg px-4">
            <div className="font-serif text-base sm:text-lg font-black tracking-widest uppercase text-amber-300">
              {TATHASTU_BRAND_NAME}
            </div>
            <div className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-200 mt-0.5">
              {TATHASTU_TAGLINE}
            </div>
            {brandTitle && brandTitle !== TATHASTU_BRAND_NAME && (
              <div className="text-[10px] font-serif tracking-wider uppercase text-emerald-300 mt-0.5">
                {brandTitle} • {watermarkTagline}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderA4PageSpiritualBackground = () => (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">
      <img
        src={a4DivineEnergyBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
      />
      <img
        src={spiritualReportBanner}
        alt=""
        className="absolute top-0 left-0 right-0 w-full h-36 object-cover opacity-[0.15] mix-blend-screen"
      />
      {/* Subtle Corner TATHASTU Brand Watermark Medallions */}
      {[
        'top-16 left-8',
        'top-16 right-8',
        'bottom-20 left-8',
        'bottom-20 right-8',
      ].map((posClass, idx) => (
        <img
          key={idx}
          src={TATHASTU_LOGO_PATH}
          alt=""
          referrerPolicy="no-referrer"
          className={`absolute ${posClass} w-20 h-20 rounded-full object-cover opacity-[0.06] border border-amber-400/40`}
        />
      ))}
      <svg
        viewBox="0 0 800 1120"
        className="absolute inset-0 w-full h-full opacity-[0.10]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="400" cy="560" r="340" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="6 6" />
        <circle cx="400" cy="560" r="280" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="400" cy="560" r="220" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="400" cy="560" r="160" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
        <polygon points="400,240 675,720 125,720" stroke="#f59e0b" strokeWidth="1.1" />
        <polygon points="400,880 675,400 125,400" stroke="#f59e0b" strokeWidth="1.1" />
        <line x1="400" y1="90" x2="400" y2="1030" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3 6" />
        {[200, 320, 440, 560, 680, 800, 920].map((cy, idx) => (
          <circle key={idx} cx="400" cy={cy} r="14" stroke="#fbbf24" strokeWidth="1" />
        ))}
      </svg>

      <div className="absolute inset-[3mm] border border-amber-400/35 rounded-lg pointer-events-none" />
      <div className="absolute top-[4.5mm] left-[5.5mm] text-amber-400/60 font-serif text-xs font-bold">
        ॐ
      </div>
      <div className="absolute top-[4.5mm] right-[5.5mm] text-amber-400/60 font-serif text-xs font-bold">
        ॐ
      </div>
      <div className="absolute bottom-[4.5mm] left-[5.5mm] text-amber-400/60 font-serif text-xs font-bold">
        ✦
      </div>
      <div className="absolute bottom-[4.5mm] right-[5.5mm] text-amber-400/60 font-serif text-xs font-bold">
        ✦
      </div>
    </div>
  );

  const renderA4PageTopHeader = (
    pageSubtitle: string,
    sectionHeadImage: string,
    sectionHeadLabel: string,
    isCoverPage = false
  ) => {
    if (!activeProfile || !multiSectionReportData) return null;
    return (
      <div className="a4-page-header relative z-10 pb-1.5 mb-1.5 border-b-2 border-amber-500/45">
        <div className="flex items-center justify-between gap-2 text-[8.5px] font-serif text-amber-300/90 px-4 pb-1 mb-1.5 border-b border-amber-500/20 leading-tight">
          <span className="shrink-0">॥ श्री गणेशाय नमः • ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥</span>
          <span className="font-mono uppercase tracking-wider text-amber-400 font-bold text-center flex-1">
            {TATHASTU_APP_NAME} • {TATHASTU_BRAND_NAME} ({TATHASTU_TAGLINE})
          </span>
          <span className="shrink-0">॥ तत् त्वम् असि • तथास्तु ॥</span>
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <img
              src={brandLogo}
              alt={brandTitle}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400 shadow-lg shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[8.5px] font-bold uppercase tracking-wider text-amber-400 leading-tight">
                {TATHASTU_BRAND_NAME} — {TATHASTU_TAGLINE}
              </div>
              <h2 className="font-serif text-base font-black text-amber-100 tracking-wide leading-tight">
                {brandTitle}
              </h2>
              <div className="text-[9px] text-emerald-300 font-bold leading-tight">
                Healer Name: {healerDisplayName} • 📞 {healerDisplayMobile} • ✉️ {healerDisplayEmail}
              </div>
              <p className="text-[9.5px] text-sky-300 font-semibold leading-tight">{pageSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/90 border border-amber-500/40 rounded-xl px-2 py-1.5 shrink-0">
            <div className="relative shrink-0">
              <img
                src={sectionHeadImage}
                alt={sectionHeadLabel}
                referrerPolicy="no-referrer"
                className="w-14 h-11 rounded-lg object-cover border border-amber-400/60 shadow-md"
              />
            </div>
            <div className="text-right">
              <div className="text-[11px] font-black text-amber-100 leading-tight">{activeProfile.name}</div>
              <div className="text-[9px] font-mono text-amber-300 leading-tight">
                DOB: {activeProfile.dob} • TOB: {formatTime12HourAmPm(activeProfile.tob || '09:30')}
              </div>
              <div className="text-[8.5px] font-mono text-emerald-300 leading-tight">
                Mulank {multiSectionReportData.m} ({PLANETARY_PROFILES[multiSectionReportData.m]?.planet}) • Bhagyank {multiSectionReportData.b} ({PLANETARY_PROFILES[multiSectionReportData.b]?.planet})
              </div>
              <div className="text-[8px] font-mono text-amber-200 font-bold leading-tight">
                Healer: {healerDisplayName}
              </div>
            </div>
            {reportQrDataUrl && (
              <div className="bg-amber-100 p-1 rounded-lg border border-amber-400 shrink-0 text-center">
                <img
                  src={reportQrDataUrl}
                  alt="Scan QR for Mobile PDF Report"
                  className="w-10 h-10 object-contain mx-auto"
                />
                <span className="block text-[6px] font-mono font-black text-slate-950 leading-none mt-0.5">
                  SCAN QR PDF
                </span>
              </div>
            )}
          </div>
        </div>

        {isCoverPage && (
          <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-amber-500/25 text-[9.5px] a4-print-grid-4">
            <div className="bg-slate-950/85 border border-amber-500/30 rounded-lg px-2 py-1">
              <span className="text-slate-400 block text-[8.5px] uppercase">Birth Place</span>
              <strong className="text-amber-100 truncate block">{activeProfile.pob || 'New Delhi, India'}</strong>
            </div>
            <div className="bg-slate-950/85 border border-amber-500/30 rounded-lg px-2 py-1">
              <span className="text-slate-400 block text-[8.5px] uppercase">Vedic Moon & Sun Sign</span>
              <strong className="text-emerald-300 truncate block">
                {multiSectionReportData.astro.rashi} • {multiSectionReportData.astro.sunSign.split(' ')[0]}
              </strong>
            </div>
            <div className="bg-slate-950/85 border border-amber-500/30 rounded-lg px-2 py-1">
              <span className="text-slate-400 block text-[8.5px] uppercase">Spiritual Healer Name</span>
              <strong className="text-amber-200 truncate block">
                {healerDisplayName} ({brandTitle})
              </strong>
            </div>
            <div className="bg-slate-950/85 border border-amber-500/30 rounded-lg px-2 py-1">
              <span className="text-slate-400 block text-[8.5px] uppercase">12-Month Validity</span>
              <strong className="text-sky-300 font-mono truncate block">
                {reportDateRange.startFormatted} – {reportDateRange.endFormatted}
              </strong>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderA4PageHealerFooter = (
    pageNumber: number,
    _totalPages?: number,
    isResponsiveScreen = false
  ) => (
    <div
      className={`a4-compact-footer relative z-10 mt-auto border-t-2 border-amber-500/55 bg-slate-950/95 rounded-xl ${
        isResponsiveScreen ? 'px-3.5 py-2.5 md:px-2.5 md:py-1.5' : 'px-2 py-1'
      }`}
    >
      <div
        className={`grid items-stretch ${
          isResponsiveScreen
            ? 'grid-cols-1 md:grid-cols-[1.55fr_0.75fr_1.1fr] gap-2.5 md:gap-2 text-xs md:text-[8px] leading-snug'
            : 'grid-cols-[1.6fr_0.65fr_1.15fr] gap-1.5 text-[7.4px] leading-tight'
        }`}
      >
        {/* Left Column: Healer Emblem + Full Name, Brand, Phone, Email, Address */}
        <div
          className={`flex items-start md:items-center gap-2 min-w-0 self-stretch ${
            isResponsiveScreen
              ? 'pb-2 border-b border-amber-500/30 md:pb-0 md:border-b-0 md:pr-2 md:border-r md:border-amber-500/40'
              : 'items-center pr-1.5 border-r border-amber-500/40'
          }`}
        >
          <img
            src={brandLogo}
            alt={brandTitle}
            referrerPolicy="no-referrer"
            className={`${
              isResponsiveScreen ? 'w-10 h-10 md:w-8 md:h-8' : 'w-7 h-7'
            } rounded-lg object-cover border border-amber-400 shadow-sm shrink-0`}
          />
          <div className={`min-w-0 flex-1 break-words ${isResponsiveScreen ? 'space-y-0.5' : 'space-y-[1px]'}`}>
            <div
              className={`font-serif font-black text-amber-100 leading-tight break-words ${
                isResponsiveScreen ? 'text-sm md:text-[9px]' : 'text-[8.5px]'
              }`}
            >
              Healer: {healerDisplayName} — <span className="text-amber-300">{brandTitle}</span>
            </div>
            <div
              className={`text-slate-200 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight break-words ${
                isResponsiveScreen ? 'text-[11px] md:text-[7.5px]' : 'text-[7px]'
              }`}
            >
              <span className="inline-flex items-center gap-0.5 text-emerald-300 font-mono font-semibold">
                <Phone className={`${isResponsiveScreen ? 'w-3 h-3 md:w-2 md:h-2' : 'w-2 h-2'} shrink-0`} />{' '}
                {healerDisplayMobile}
              </span>
              <span className="text-amber-500/60">|</span>
              <span className="inline-flex items-center gap-0.5 text-amber-200 font-mono break-all">
                <Mail className={`${isResponsiveScreen ? 'w-3 h-3 md:w-2 md:h-2' : 'w-2 h-2'} shrink-0`} />{' '}
                {healerDisplayEmail}
              </span>
            </div>
            <div
              className={`text-sky-300 flex items-start gap-0.5 leading-tight break-words ${
                isResponsiveScreen ? 'text-[11px] md:text-[7.2px]' : 'text-[6.8px]'
              }`}
            >
              <MapPin className={`${isResponsiveScreen ? 'w-3 h-3 md:w-2 md:h-2' : 'w-2 h-2'} shrink-0 mt-[1px]`} />
              <span className="break-words">{healerDisplayAddress}</span>
            </div>
          </div>
        </div>

        {/* Center Column: Strictly Center-Aligned Single Page Number */}
        <div
          className={`flex items-center justify-center text-center self-stretch ${
            isResponsiveScreen
              ? 'flex-row justify-between md:flex-col md:justify-center pb-2 border-b border-amber-500/30 md:pb-0 md:border-b-0 md:px-2 md:border-r md:border-amber-500/40'
              : 'flex-col px-1.5 border-r border-amber-500/40'
          }`}
        >
          <div
            className={`inline-flex items-center justify-center px-2.5 py-[1px] rounded-md bg-amber-500/20 border border-amber-400/65 text-amber-100 font-mono font-black shadow-sm whitespace-nowrap ${
              isResponsiveScreen ? 'text-xs md:text-[9px]' : 'text-[8.5px]'
            }`}
          >
            Page {pageNumber}
          </div>
          <div
            className={`font-serif font-bold tracking-wider uppercase text-amber-300/90 leading-tight break-words ${
              isResponsiveScreen ? 'text-[10px] md:text-[6.8px] md:mt-0.5' : 'text-[6.5px] mt-0.5'
            }`}
          >
            {TATHASTU_BRAND_NAME}
          </div>
        </div>

        {/* Right Column: Compact Social Handles */}
        <div
          className={`flex min-w-0 self-stretch ${
            isResponsiveScreen
              ? 'flex-row flex-wrap md:flex-col md:items-end justify-start md:justify-center gap-1.5 md:gap-0.5 text-[10.5px] md:text-[7px] text-amber-200'
              : 'flex-col items-end justify-center gap-[2px] text-[6.6px] text-amber-200'
          }`}
        >
          <span className={`inline-flex items-center gap-1 bg-pink-950/75 border border-pink-500/40 rounded max-w-full break-all ${isResponsiveScreen ? 'px-2 py-0.5 md:px-1.5 md:py-[1px]' : 'px-1.5 py-[1px]'}`}>
            <Instagram className={`${isResponsiveScreen ? 'w-3 h-3 md:w-2 md:h-2' : 'w-2 h-2'} text-pink-400 shrink-0`} />
            <span className="font-mono break-all">{healerInstagram}</span>
          </span>
          <span className={`inline-flex items-center gap-1 bg-blue-950/75 border border-blue-500/40 rounded max-w-full break-all ${isResponsiveScreen ? 'px-2 py-0.5 md:px-1.5 md:py-[1px]' : 'px-1.5 py-[1px]'}`}>
            <Facebook className={`${isResponsiveScreen ? 'w-3 h-3 md:w-2 md:h-2' : 'w-2 h-2'} text-blue-400 shrink-0`} />
            <span className="font-mono break-all">{healerFacebook}</span>
          </span>
          <span className={`inline-flex items-center gap-1 bg-emerald-950/75 border border-emerald-500/40 rounded max-w-full break-all ${isResponsiveScreen ? 'px-2 py-0.5 md:px-1.5 md:py-[1px]' : 'px-1.5 py-[1px]'}`}>
            <Globe className={`${isResponsiveScreen ? 'w-3 h-3 md:w-2 md:h-2' : 'w-2 h-2'} text-emerald-400 shrink-0`} />
            <span className="font-mono break-all">{healerWebsite}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const buildDiscreteA4Pages = () => {
    if (!activeProfile || !multiSectionReportData) return [];

    const {
      m,
      b,
      nameAnalysis,
      nameSuggestions,
      topPerfectChoice,
      mobileAnalysis,
      advMobile,
      panchang,
      loShu,
      astro,
      career,
      gemRecommend,
      nameAndGrowthRatna,
      triadCompound,
      triadSingle,
      triadPlanet,
      relMulankMobile,
      relBhagyankMobile,
      relNameMobile,
      relMulankName,
      combinedTriadScore,
      combinedCareerProfile,
      vehicleValidation,
      flatValidation,
      businessValidation,
      mobileValidation,
      festivals,
      islamicReport,
      bestEvents12M,
      groomProfile,
      brideProfile,
      groomNameAnalysis,
      brideNameAnalysis,
      partnerMilan,
      partnerRatnaRec,
      lunar12Months,
      yogaPlan,
      parivarReport,
    } = multiSectionReportData;

    const mPlanet = PLANETARY_PROFILES[m] || PLANETARY_PROFILES[1];
    const bPlanet = PLANETARY_PROFILES[b] || PLANETARY_PROFILES[1];
    const nPlanet = PLANETARY_PROFILES[nameAnalysis.chaldeanSingle] || PLANETARY_PROFILES[1];
    const groomMulankPlanet = PLANETARY_PROFILES[partnerMilan.p1Mulank] || PLANETARY_PROFILES[1];
    const groomBhagyankPlanet = PLANETARY_PROFILES[partnerMilan.p1Bhagyank] || PLANETARY_PROFILES[1];
    const brideMulankPlanet = PLANETARY_PROFILES[partnerMilan.p2Mulank] || PLANETARY_PROFILES[2];
    const brideBhagyankPlanet = PLANETARY_PROFILES[partnerMilan.p2Bhagyank] || PLANETARY_PROFILES[6];
    const activeDasha =
      advMobile.dashaTimeline.find((d) => d.isCurrent) || advMobile.dashaTimeline[0];
    const activeDashaPlanet =
      PLANETARY_PROFILES[activeDasha?.dashaNumber || 6] || PLANETARY_PROFILES[6];
    const rashiLordPlanet =
      Object.values(PLANETARY_PROFILES).find((p) =>
        astro.rashiLord.toLowerCase().includes(p.planet.toLowerCase())
      ) || bPlanet;

    const pages: {
      title: string;
      headImg: string;
      headLabel: string;
      isCover?: boolean;
      content: React.ReactNode;
    }[] = [];

    // PAGE 1: DYNAMIC 'INDEX OF MODULES' & MASTER SPIRITUAL DOSSIER TABLE OF CONTENTS
    const activeModuleDefinitions: {
      key: keyof ReportSectionSelection;
      title: string;
      chaptersAndScope: string;
      personalizedHighlight: string;
    }[] = [
      {
        key: 'nameAndCareer',
        title: 'Name, Career, 5-Pillar Ratna & Universal Validator',
        chaptersAndScope:
          'Birth Chart, 3×3 Lo-Shu Matrix, 8 Planes, Name Spellings, All Career Sectors, 5-Pillar Ratna & Vehicle/Flat/Business Validator',
        personalizedHighlight: `Mulank ${m} (${mPlanet.planet}) | Bhagyank ${b} (${bPlanet.planet}) • Top Name: ${topPerfectChoice?.suggestedName || activeProfile.name} • Primary Gem: ${gemRecommend.lifeStone.primaryGem}`,
      },
      {
        key: 'advanceMobileAudit',
        title: 'Advance Mobile Numerology, Dasha & Lo-Shu Matrix',
        chaptersAndScope:
          '10-Digit Mobile Pair Scanner, Missing/Repeated Digits, Planetary Dasha Timeline, Remedies & Ideal Number Synthesis',
        personalizedHighlight: `Mobile: ${activeProfile.mobile || '9876543210'} → Compound ${mobileAnalysis.compoundNumber} / Root #${mobileAnalysis.singleDigit} (${mobileAnalysis.verdict})`,
      },
      {
        key: 'forecast12Months',
        title: `12-Month Vedic & Numerology Monthly Forecast (${reportDateRange.startFormatted} – ${reportDateRange.endFormatted})`,
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
        personalizedHighlight: `Target Focus: ${
          activeProfile.healthConcerns && activeProfile.healthConcerns.length > 0
            ? activeProfile.healthConcerns.join(', ')
            : 'Complete Pranic Vitality & Stress Relief'
        }`,
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
          parivarReport && parivarReport.memberResults.length > 0
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

    const selectedModuleEntries = activeModuleDefinitions.filter((mDef) =>
      selectedCount === 0 ? mDef.key === 'nameAndCareer' : Boolean(selectedSections[mDef.key])
    );

    const modRanges = pdfPageCountInfo.modulePageRanges;
    const totalCalculatedPages =
      pdfPageCountInfo.totalPdfPages > 0 ? pdfPageCountInfo.totalPdfPages : 28;

    pages.push({
      title: `Page 1: Index of Modules & Master Spiritual Dossier Guide (${selectedModuleEntries.length} Active Modules • ${totalCalculatedPages} Pages)`,
      headImg: spiritualReportBanner,
      headLabel: 'Index of Modules',
      isCover: true,
      content: (
        <div className="space-y-2 text-xs a4-section-no-break">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-950 to-indigo-950/80 border-2 border-amber-400/60 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-amber-300 font-bold block">
                MASTER DOSSIER TABLE OF CONTENTS • ACTIVE MODULE DIRECTORY
              </span>
              <h3 className="font-serif text-sm font-black text-amber-100">
                INDEX OF MODULES INCLUDED IN THIS PERSONALIZED REPORT ({selectedModuleEntries.length} ACTIVE MODULES)
              </h3>
              <p className="text-[8.5px] text-slate-200 mt-0.5">
                Prepared exclusively for <strong className="text-amber-200">{activeProfile.name}</strong> (DOB: {activeProfile.dob} • Place: {activeProfile.pob || 'New Delhi'}) — Locate every selected diagnostic module, prediction, and remedy by page number below.
              </p>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-400/50 text-right shrink-0">
              <div className="text-[7.5px] font-mono uppercase text-emerald-300 font-bold">
                Total Dossier Length
              </div>
              <div className="font-mono text-xs font-black text-amber-200">
                {totalCalculatedPages} A4 Pages
              </div>
              <div className="text-[7px] font-mono text-sky-300">
                {selectedModuleEntries.length} Selected Module(s)
              </div>
            </div>
          </div>

          {/* Active Modules Table of Contents */}
          <div className="overflow-hidden rounded-xl border border-amber-500/45 bg-slate-950/95">
            <div className="grid grid-cols-12 bg-amber-950/70 border-b border-amber-500/40 px-2.5 py-1.5 text-[7.8px] font-bold text-amber-200 uppercase">
              <div className="col-span-3 pr-1.5">Module # &amp; Active Module Name</div>
              <div className="col-span-4 px-1.5 border-l border-amber-500/25">
                Chapters, Diagnostics &amp; Remedies Included
              </div>
              <div className="col-span-3 px-1.5 border-l border-amber-500/25">
                Key Personalized Result ({activeProfile.name})
              </div>
              <div className="col-span-2 pl-1.5 border-l border-amber-500/25 text-right">
                Page No.
              </div>
            </div>
            <div className="divide-y divide-amber-500/20">
              <div className="grid grid-cols-12 px-2.5 py-1 text-[7.6px] items-center bg-slate-900/70">
                <div className="col-span-3 pr-1.5 font-bold text-amber-200">
                  00. Index of Modules &amp; Executive Charter
                </div>
                <div className="col-span-4 px-1.5 border-l border-amber-500/20 text-slate-300">
                  Master Table of Contents, Active Module Directory &amp; Core Natal/Remedy Quick Reference
                </div>
                <div className="col-span-3 px-1.5 border-l border-amber-500/20 text-emerald-300 font-mono">
                  Mulank {m} ({mPlanet.planet}) | Bhagyank {b} ({bPlanet.planet}) • {astro.rashi}
                </div>
                <div className="col-span-2 pl-1.5 border-l border-amber-500/20 text-right font-mono font-bold text-amber-300">
                  Page 1 (1p)
                </div>
              </div>
              {selectedModuleEntries.map((entry, idx) => {
                const rng = modRanges?.[entry.key];
                const pgText =
                  rng && rng.startPage > 0
                    ? rng.startPage === rng.endPage
                      ? `Page ${rng.startPage} (1p)`
                      : `Pages ${rng.startPage}–${rng.endPage} (${rng.pageCount}p)`
                    : `${modulePageCounts[entry.key] || 1}p`;
                return (
                  <div
                    key={entry.key}
                    className="grid grid-cols-12 px-2.5 py-1 text-[7.6px] items-center leading-tight"
                  >
                    <div className="col-span-3 pr-1.5 font-bold text-amber-100">
                      {String(idx + 1).padStart(2, '0')}. {entry.title}
                    </div>
                    <div className="col-span-4 px-1.5 border-l border-amber-500/20 text-slate-300">
                      {entry.chaptersAndScope}
                    </div>
                    <div className="col-span-3 px-1.5 border-l border-amber-500/20 text-emerald-200">
                      {entry.personalizedHighlight}
                    </div>
                    <div className="col-span-2 pl-1.5 border-l border-amber-500/20 text-right font-mono font-bold text-amber-300">
                      {pgText}
                    </div>
                  </div>
                );
              })}
              {(() => {
                const closingRng = pdfPageCountInfo.closingSummaryPageRange;
                const closingPgText =
                  closingRng && closingRng.startPage > 0
                    ? closingRng.startPage === closingRng.endPage
                      ? `Page ${closingRng.startPage} (1p)`
                      : `Pages ${closingRng.startPage}–${closingRng.endPage} (${closingRng.pageCount}p)`
                    : 'Final 2 Pages';
                const activeSummaryPreview =
                  aiReportSummary ||
                  buildClassicalFallbackSummary({
                    profile: activeProfile,
                    healerName: healerDisplayName,
                    brandTitle,
                    language,
                  });
                return (
                  <div className="grid grid-cols-12 px-2.5 py-1 text-[7.6px] items-center leading-tight bg-amber-950/35">
                    <div className="col-span-3 pr-1.5 font-bold text-amber-200">
                      {String(selectedModuleEntries.length + 1).padStart(2, '0')}. Complete Report Summary, 10-Year Future (With vs. Without Remedies) &amp; Tathastu Blessings
                    </div>
                    <div className="col-span-4 px-1.5 border-l border-amber-500/20 text-slate-200">
                      1–2 Page Simple Paragraph Summary (Vedic + Parashar Astrology &amp; Numerology), Next 10 Years Future Without vs. With Remedies, Thank You &amp; Spiritual Blessings
                    </div>
                    <div className="col-span-3 px-1.5 border-l border-amber-500/20 text-emerald-300">
                      Parashar Dasha: {activeSummaryPreview.parasharMahadashaLabel} • {activeSummaryPreview.startYear}–{activeSummaryPreview.endYear}
                    </div>
                    <div className="col-span-2 pl-1.5 border-l border-amber-500/20 text-right font-mono font-bold text-amber-300">
                      {closingPgText}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Executive Personalized Snapshot & Core Remedies Charter */}
          <div className="p-2.5 rounded-xl bg-slate-950/95 border border-amber-500/40 space-y-1.5">
            <div className="flex items-center justify-between border-b border-amber-500/25 pb-1">
              <span className="font-serif text-[9px] font-bold text-amber-200 uppercase">
                EXECUTIVE PERSONALIZED SNAPSHOT &amp; CORE REMEDIES AT A GLANCE ({activeProfile.name.toUpperCase()})
              </span>
              <span className="text-[7.5px] font-mono text-emerald-300">
                12-Month Validity: {reportDateRange.startFormatted} – {reportDateRange.endFormatted}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2 text-[7.8px]">
              <div className="p-2 rounded-lg bg-slate-900 border border-amber-500/30 space-y-0.5">
                <div className="font-bold text-amber-300 uppercase">
                  1. Core Numerology &amp; Vedic Natal Pillars
                </div>
                <div className="text-slate-200">
                  <strong>Mulank (Driver):</strong> #{m} ({mPlanet.planet}) • <strong>Bhagyank (Conductor):</strong> #{b} ({bPlanet.planet}) • <strong>Rashi:</strong> {astro.rashi} ({astro.nakshatra}, Pada {astro.pada})
                </div>
                <div className="text-emerald-300 font-mono">
                  Friendly Nos: {mPlanet.friendlyNumbers.join(', ')} • Lucky Days: {mPlanet.luckyDays.join(', ')} • Color: {mPlanet.luckyColor}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-amber-500/30 space-y-0.5">
                <div className="font-bold text-amber-300 uppercase">
                  2. Name &amp; Mobile Frequency Alignment
                </div>
                <div className="text-slate-200">
                  <strong>Current Name:</strong> {activeProfile.name} (#{nameAnalysis.totalChaldeanCompound} → #{nameAnalysis.chaldeanSingle}) • <strong>Best Name:</strong> {topPerfectChoice?.suggestedName || activeProfile.name} (#{topPerfectChoice?.compoundNumber ?? nameAnalysis.totalChaldeanCompound} → #{topPerfectChoice?.singleDigit ?? nameAnalysis.chaldeanSingle})
                </div>
                <div className="text-sky-300 font-mono">
                  Mobile: {activeProfile.mobile || '9876543210'} → #{mobileAnalysis.singleDigit} ({mobileAnalysis.verdict}) • Top Career: {career.perfectBusinesses[0]?.field || career.favorableProfessions[0] || 'Leadership'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-amber-500/30 space-y-0.5">
                <div className="font-bold text-amber-300 uppercase">
                  3. Primary 5-Pillar Ratna &amp; Rudraksha Shield
                </div>
                <div className="text-slate-200">
                  <strong>Primary Maharatna:</strong> {gemRecommend.lifeStone.primaryGem} ({gemRecommend.lifeStone.sanskritGem}) in {gemRecommend.lifeStone.metal} on {gemRecommend.lifeStone.finger} ({gemRecommend.lifeStone.wearingDay})
                </div>
                <div className="text-emerald-300">
                  <strong>Destiny Stone:</strong> {gemRecommend.destinyStone.primaryGem} • <strong>Growth Stone:</strong> {nameAndGrowthRatna.personalGrowthStone.ratna.primaryGem}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-amber-500/30 space-y-0.5">
                <div className="font-bold text-amber-300 uppercase">
                  4. Daily Beej Mantra, Vastu &amp; Healer Attestation
                </div>
                <div className="text-slate-200">
                  <strong>Daily Mantra:</strong> &ldquo;{bPlanet.beejMantra}&rdquo; (108x Morning) • <strong>Vastu Disha:</strong> East / North-East (Ishan Kon)
                </div>
                <div className="text-amber-200">
                  <strong>Authorized Healer:</strong> {healerDisplayName} ({brandTitle}) • 📞 {healerDisplayMobile}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    });

    // PAGES 2–6: Detailed Name Numerology, Career Harmony, Gemstone Recommendation & Universal Validator
    if (selectedSections.nameAndCareer || selectedCount === 0) {
      // PAGE 2: Executive Birth Chart, Panchang, Lo-Shu 8 Planes & Name Summary
      pages.push({
        title: 'Page 1: Executive Vedic Birth Chart, Daily Panchang, 8 Lo-Shu Planes & Name Vibration Summary',
        headImg: vedicNameCareerYantra,
        headLabel: 'Sri Yantra & Birth Chart',
        isCover: false,
        content: (
          <div className="space-y-2 text-xs">
            <div className="relative rounded-xl overflow-hidden border border-amber-500/40 min-h-[76px]">
              <img
                src={vedicNameCareerYantra}
                alt="Sacred Sri Yantra & Vedic Astrological Natal Chart"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
              <div className="relative z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 p-2.5 flex flex-col justify-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold break-words">
                  01 • EXECUTIVE VEDIC, CHALDEAN &amp; PRANIC BLUEPRINT ({activeProfile.gender === 'female' ? 'FEMALE / BRIDE' : 'MALE / GROOM'})
                </span>
                <h3 className="font-serif text-sm font-black text-amber-100 break-words leading-snug">
                  Complete Birth Chart, Daily Panchang &amp; 8 Lo-Shu Planes for {activeProfile.name}
                </h3>
                <p className="text-[9.2px] text-emerald-300 break-words leading-snug">
                  DOB: {activeProfile.dob} • TOB: {formatTime12HourAmPm(activeProfile.tob || '09:30')} • POB: {activeProfile.pob} ({(activeProfile.lat ?? 28.61).toFixed(2)}°N, {(activeProfile.lng ?? 77.21).toFixed(2)}°E) • Rashi: {astro.rashi} ({astro.rashiLord}) • Nakshatra: {astro.nakshatra} (Pada {astro.pada}, Lord: {astro.nakshatraLord})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 a4-print-grid-3">
              <div className="p-2 rounded-xl bg-slate-950/90 border border-amber-500/35 text-[9px] space-y-0.5">
                <span className="text-[8.5px] uppercase tracking-wider text-amber-400 font-bold block">
                  Psychic Number (Mulank {m})
                </span>
                <strong className="text-amber-100 text-[10.5px] block">
                  Ruler: {mPlanet.planet} ({mPlanet.sanskritName}) • Deity: {mPlanet.deity}
                </strong>
                <span className="text-slate-300 block">
                  Element: {mPlanet.element} • Color: {mPlanet.luckyColor} • Metal: {mPlanet.metal} • Stone: {mPlanet.gemstone}
                </span>
                <span className="text-emerald-300 block">
                  Friendly: {mPlanet.friendlyNumbers.join(', ')} | Neutral: {mPlanet.neutralNumbers.join(', ')} | Enemy: {mPlanet.enemyNumbers.join(', ')}
                </span>
                <span className="text-amber-200 block">Traits: {mPlanet.traits.join(', ')}</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/90 border border-emerald-500/35 text-[9px] space-y-0.5">
                <span className="text-[8.5px] uppercase tracking-wider text-emerald-400 font-bold block">
                  Destiny Number (Bhagyank {b})
                </span>
                <strong className="text-emerald-200 text-[10.5px] block">
                  Ruler: {bPlanet.planet} ({bPlanet.sanskritName}) • Deity: {bPlanet.deity}
                </strong>
                <span className="text-slate-300 block">
                  Element: {bPlanet.element} • Color: {bPlanet.luckyColor} • Metal: {bPlanet.metal} • Stone: {bPlanet.gemstone}
                </span>
                <span className="text-emerald-300 block">
                  Friendly: {bPlanet.friendlyNumbers.join(', ')} | Neutral: {bPlanet.neutralNumbers.join(', ')} | Enemy: {bPlanet.enemyNumbers.join(', ')}
                </span>
                <span className="text-amber-200 block">Lucky Days: {bPlanet.luckyDays.join(', ')}</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/90 border border-sky-500/35 text-[9px] space-y-0.5">
                <span className="text-[8.5px] uppercase tracking-wider text-sky-400 font-bold block">
                  Name Chaldean & Pythagorean + Triad
                </span>
                <strong className="text-sky-200 text-[10.5px] font-mono block">
                  Chaldean: {nameAnalysis.totalChaldeanCompound}➔{nameAnalysis.chaldeanSingle} ({nameAnalysis.harmonyScore}%)
                </strong>
                <span className="text-slate-300 block">
                  Pythagorean: {nameAnalysis.totalPythagoreanCompound}➔{nameAnalysis.pythagoreanSingle} • Verdict: {nameAnalysis.verdict}
                </span>
                <span className="text-emerald-300 block">
                  Triad (Name+DOB+Mob): {triadCompound}➔{triadSingle} ({triadPlanet.planet} • {combinedTriadScore}%)
                </span>
                <span className="text-amber-200 block">
                  Chakra: {career.primaryChakra} • Aura: {career.auraColor}
                </span>
              </div>
            </div>

            {/* Today's Live Panchang & Hora */}
            <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/35 text-[9px] space-y-0.5">
              <div className="flex items-center justify-between font-bold text-amber-200">
                <span>Today's Live Vedic Panchang, Hora & Muhurat Snapshot ({panchang.dateStr})</span>
                <span className="font-mono text-emerald-300">{panchang.tithi} • {panchang.vara}</span>
              </div>
              <div className="text-slate-200">
                <strong>Current Hora:</strong> {panchang.currentHoraPlanet} ({panchang.horaStatus}) — {panchang.horaAdvice} | <strong>Auspicious Windows:</strong> {panchang.auspiciousTimings.join(' • ')} | <strong className="text-rose-300">Avoid Rahu Kaal:</strong> {panchang.rahuKaalWindow.start} – {panchang.rahuKaalWindow.end}
              </div>
              <div className="text-amber-200">
                <strong>Today's Lucky Numbers:</strong> {panchang.todayLuckyNumbers.join(', ')} • <strong>Color:</strong> {panchang.todayLuckyColor} • <strong>Beej Mantra:</strong> {panchang.todayBeejMantra} • <strong>Affirmation:</strong> "{panchang.affirmation}"
              </div>
            </div>

            {/* All 8 Lo-Shu Planes & Raj Yoga Completion Matrix */}
            <div className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/35">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-serif text-[10.5px] font-bold text-amber-200 uppercase">
                  Complete 8 Lo-Shu Planes & Raj Yoga Completion Matrix (Present: {loShu.presentNumbers.join(', ')} | Missing: {loShu.missingNumbers.map((mItem) => mItem.number).join(', ') || 'None'})
                </h4>
                <span className="text-[8.5px] font-mono text-emerald-300">Kua Number: {loShu.kuaNumber}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 a4-print-grid-2">
                {loShu.planes.map((pl, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-900 border border-amber-500/25 text-[8px] min-w-0 break-words">
                    <div className="flex items-center justify-between gap-1 font-bold text-amber-200">
                      <span className="break-words">{pl.name} ({pl.numbers.join('-')})</span>
                      <span className={pl.completionPercentage === 100 ? 'text-emerald-300 font-mono shrink-0' : 'text-amber-400 font-mono shrink-0'}>
                        {pl.completionPercentage}%
                      </span>
                    </div>
                    <div className="text-slate-300 leading-tight break-words mt-0.5">{pl.status}: {pl.interpretation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      });

      // PAGE 2: Letter-by-Letter Chaldean Breakdown, Top Perfect Choice, All 8 Spellings & 41-Day Protocol
      pages.push({
        title: 'Page 2: Letter-by-Letter Chaldean Breakdown, Supreme Harmonic Choice & All Harmonized Spellings',
        headImg: vedicNameCareerYantra,
        headLabel: 'Name Correction & Examples',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/35 overflow-hidden">
              <h4 className="font-serif text-[11px] font-bold text-amber-200 mb-1">
                Letter-by-Letter Chaldean & Pythagorean Sound Breakdown for "{activeProfile.name}" (Compound {nameAnalysis.totalChaldeanCompound} — {nameAnalysis.compoundInfo.title})
              </h4>
              <p className="text-[9px] text-slate-300 mb-1.5 leading-snug">
                {nameAnalysis.compoundInfo.description} | <strong>Mulank Relationship:</strong> {nameAnalysis.mulankRelation} • <strong>Bhagyank Relationship:</strong> {nameAnalysis.bhagyankRelation}
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 w-full">
                {nameAnalysis.letters.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-1 py-0.5 rounded bg-slate-950 border border-amber-500/35 text-center font-mono text-[8.5px] overflow-hidden"
                  >
                    <span className="text-amber-200 font-black text-[10px] block leading-tight">
                      {item.char}
                    </span>
                    <span className="text-emerald-300 text-[7.5px] block truncate">
                      C:{item.chaldeanVal}|P:{item.pythagoreanVal}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {nameAnalysis.isAuspicious &&
            !activeProfile.selectedNameA &&
            !activeProfile.selectedNameB ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border-2 border-emerald-500/45 space-y-1 text-[9.5px]">
                <h4 className="font-serif text-[11px] font-bold text-emerald-300 uppercase">
                  ★ Perfect Name Frequency Result — No Name Change Suggestion Required
                </h4>
                <p className="text-slate-200 leading-snug">
                  Your current name spelling <strong className="text-amber-200">"{activeProfile.name}"</strong> vibrates at Chaldean Compound <strong className="text-emerald-300">{nameAnalysis.totalChaldeanCompound}</strong> ➔ Root <strong className="text-emerald-300">{nameAnalysis.chaldeanSingle} ({PLANETARY_PROFILES[nameAnalysis.chaldeanSingle]?.planet})</strong> with <strong className="text-emerald-300">{nameAnalysis.harmonyScore}% Cosmic Harmony</strong> ({nameAnalysis.compoundInfo.title}). Because your name frequency is already auspicious and in harmony with Mulank {m} and Bhagyank {b}, only your result is shown and no spelling modification is needed.
                </p>
              </div>
            ) : (
              <>
                {(() => {
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

                  return (
                    <div className="p-2 rounded-xl bg-slate-900/95 border-2 border-emerald-500/45 space-y-1.5 text-[8.5px]">
                      <div className="flex items-center justify-between border-b border-emerald-500/25 pb-1">
                        <span className="font-serif text-[10px] font-bold text-amber-200 uppercase">
                          ★ 3-Way Name Comparison: Real Name vs Selected Name A &amp; Selected Name B (Active Final Name: "{activeProfile.name}")
                        </span>
                        <span className="font-mono text-emerald-300 font-bold">
                          Losses of Real Name vs Benefits of Selected Names
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 a4-print-grid-3">
                        {[
                          {
                            tag: '1. Real / Original Name',
                            nameStr: realNameStr,
                            res: realRes,
                            isReal: true,
                          },
                          {
                            tag: '2. Selected Name A',
                            nameStr: selNameAStr,
                            res: nameARes,
                            isReal: false,
                          },
                          {
                            tag: '3. Selected Name B',
                            nameStr: selNameBStr,
                            res: nameBRes,
                            isReal: false,
                          },
                        ].map((col, cIdx) => {
                          const isActive =
                            col.nameStr.toUpperCase() === activeProfile.name.trim().toUpperCase();
                          return (
                            <div
                              key={cIdx}
                              className={`p-1.5 rounded-lg border space-y-0.5 ${
                                isActive
                                  ? 'bg-emerald-950/40 border-emerald-400'
                                  : 'bg-slate-950/90 border-amber-500/25'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-amber-200">
                                <span>{col.tag}</span>
                                {isActive && (
                                  <span className="px-1 py-0.2 rounded bg-emerald-500 text-slate-950 text-[7px] font-black">
                                    ACTIVE PROFILE
                                  </span>
                                )}
                              </div>
                              <div className="font-mono font-black text-[9.5px] text-white truncate">
                                {col.nameStr} — {col.res.totalChaldeanCompound}➔{col.res.chaldeanSingle} ({col.res.harmonyScore}%)
                              </div>
                              {col.isReal ? (
                                <p className="text-rose-200 leading-tight">
                                  <strong>Drawback / Loss:</strong>{' '}
                                  {col.res.harmonyScore < 75
                                    ? `Creates planetary friction (${col.res.mulankRelation} with Mulank ${m}), causing career delays & financial leakage.`
                                    : `Baseline vibration (${col.res.compoundInfo.title}); can be elevated for faster commercial & aura breakthroughs.`}
                                </p>
                              ) : (
                                <p className="text-emerald-200 leading-tight">
                                  <strong>Benefit / Gain:</strong> Aligns with{' '}
                                  {PLANETARY_PROFILES[col.res.chaldeanSingle]?.planet} ({col.res.compoundInfo.title}), unlocking +{Math.max(5, col.res.harmonyScore - realRes.harmonyScore)}% higher cosmic harmony, wealth &amp; recognition.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {nameSuggestions.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/35 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-amber-500/25 pb-1">
                      <h4 className="font-serif text-[11px] font-bold text-amber-200">
                        Complete List of Harmonized Name Spelling Suggestions for {activeProfile.name}
                      </h4>
                      <span className="text-[9px] font-mono text-emerald-300">
                        Friendly Roots: {mPlanet.friendlyNumbers.join(', ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
                      {nameSuggestions.map((sug, i) => (
                        <div
                          key={i}
                          className="p-1.5 rounded-lg bg-slate-950/95 border border-amber-500/25 flex items-start justify-between gap-1.5"
                        >
                          <div>
                            <div className="font-mono font-black text-[10.5px] text-amber-100">
                              {i + 1}. {sug.suggestedName}
                            </div>
                            <div className="text-[8.5px] text-slate-300 leading-snug">
                              {sug.changeExplanation} ({sug.planetaryBlessing})
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[8.5px] shrink-0">
                            {sug.compoundNumber}➔{sug.singleDigit} ({sug.harmonyScore}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/35 space-y-1 text-[9.2px]">
              <h5 className="font-serif text-[10.5px] font-bold text-emerald-300 uppercase">
                Practical Examples & 41-Day Name Vibration Activation Remedies
              </h5>
              <p className="text-slate-200">
                <strong>• Example 1 (Digital & Social Profiles):</strong> Immediately update your display name on WhatsApp, Instagram, LinkedIn, Email Signature, and Visiting Cards to <strong className="text-amber-200">"{topPerfectChoice?.suggestedName || activeProfile.name}"</strong>.
              </p>
              <p className="text-slate-200">
                <strong>• Example 2 (41-Day Sankalpa Writing Sadhana):</strong> Write your harmonized name 41 times every morning at sunrise in a dedicated notebook using a gold, green, or red ink pen while chanting <strong className="text-amber-200">"{mPlanet.beejMantra}"</strong>.
              </p>
              <p className="text-slate-200">
                <strong>• Example 3 (Ascending Signature Alignment):</strong> Sign your harmonized name at a 15° upward angle with an underline and a single dot underneath; never cut or loop backwards through the first letter.
              </p>
            </div>
          </div>
        ),
      });

      // PAGE 3: Complete Career & Business Matrix (Favorable Professions, 4 Perfect, 4 Good, 4 Hostile & All 6 Remedies)
      pages.push({
        title: 'Page 3: Complete Career & Business Matrix — Perfect, Good & Hostile Sectors + All 6 Aura Remedies',
        headImg: vedicNameCareerYantra,
        headLabel: 'Career & Fortune Remedies',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/35 text-[9px] text-slate-200">
              <strong className="text-amber-200">Top Favorable Career & Profession Streams (Mulank {m} & Bhagyank {b}):</strong>{' '}
              <span className="text-emerald-300 font-semibold">{career.favorableProfessions.join(' • ')}</span>
              <div className="mt-0.5 text-slate-300">
                <strong>Aura Diagnosis ({career.auraColor} • {career.primaryChakra} / {career.secondaryChakra}):</strong> {career.auraHealthSummary}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 a4-print-grid-3">
              <div className="p-2 rounded-xl bg-emerald-950/25 border border-emerald-500/40 space-y-1">
                <h5 className="font-serif text-[10px] font-bold text-emerald-300 uppercase">
                  1. Supreme Perfect Businesses (All 4)
                </h5>
                {career.perfectBusinesses.map((item, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-950/90 border border-emerald-500/25 text-[8.5px]">
                    <div className="flex items-center justify-between font-bold text-emerald-200">
                      <span>{item.field}</span>
                      <span className="font-mono text-emerald-400">{item.successRate}%</span>
                    </div>
                    <p className="text-slate-300 leading-tight mt-0.5">{item.reason}</p>
                  </div>
                ))}
              </div>

              <div className="p-2 rounded-xl bg-sky-950/25 border border-sky-500/40 space-y-1">
                <h5 className="font-serif text-[10px] font-bold text-sky-300 uppercase">
                  2. Good Supportive Businesses (All 4)
                </h5>
                {career.goodBusinesses.map((item, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-950/90 border border-sky-500/25 text-[8.5px]">
                    <div className="flex items-center justify-between font-bold text-sky-200">
                      <span>{item.field}</span>
                      <span className="font-mono text-sky-400">{item.successRate}%</span>
                    </div>
                    <p className="text-slate-300 leading-tight mt-0.5">{item.reason}</p>
                  </div>
                ))}
              </div>

              <div className="p-2 rounded-xl bg-rose-950/25 border border-rose-500/40 space-y-1">
                <h5 className="font-serif text-[10px] font-bold text-rose-300 uppercase">
                  3. Hostile Sectors to Avoid (All 4)
                </h5>
                {career.veryBadBusinesses.map((item, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-950/90 border border-rose-500/25 text-[8.5px]">
                    <div className="flex items-center justify-between font-bold text-rose-200">
                      <span>{item.field}</span>
                      <span className="font-mono text-rose-400">{item.conflictPlanet}</span>
                    </div>
                    <p className="text-slate-300 leading-tight mt-0.5">{item.dangerReason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/35 space-y-1.5">
              <h5 className="font-serif text-[10px] font-bold text-amber-200 uppercase">
                All 6 Prescribed Vedic, Pranic, Sound Frequency (Hz) &amp; Fortune Remedies for Career &amp; Aura Breakthrough
              </h5>
              <div className="grid grid-cols-3 gap-1.5 a4-print-grid-3 items-stretch">
                {career.fortuneReadingRemedies.map((rem, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950 border border-amber-500/25 text-[8.1px] flex flex-col justify-between gap-1 h-full text-left"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-amber-300 leading-snug text-[8.4px] border-b border-amber-500/20 pb-0.5">
                        {idx + 1}. [{rem.category}] {rem.title}
                      </div>
                      <p className="text-slate-300 leading-snug">{rem.prescription}</p>
                      <div className="text-emerald-300 font-mono text-[7.5px] leading-tight">
                        <strong>Addresses:</strong> {rem.issueAddressed}
                      </div>
                    </div>
                    <div className="mt-auto pt-1 border-t border-sky-500/25 flex items-center justify-between gap-1">
                      <span className="text-[7px] uppercase tracking-wider text-sky-400 font-bold">Sound Hz</span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-500/45 text-sky-200 font-mono text-[7.4px] font-bold">
                        🔊 {rem.frequencyHz}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {!isHealerReport && (
              <div className="p-2 rounded-xl bg-amber-950/35 border border-amber-500/45 text-[8.5px] text-amber-100 leading-snug">
                <strong className="text-amber-300 uppercase">Official Remedies Portal (www.tathastulight.com):</strong> Visit <strong className="text-emerald-300 font-mono">www.tathastulight.com</strong> for 100% genuine &amp; authentic Rudraksha, Crystals, Home Cleansing Material, Precious &amp; Semi-Precious Stones.
              </div>
            )}
          </div>
        ),
      });

      // PAGE 4: Dedicated 5-Pillar Vedic Gemstone (Ratna & Upratna) Recommendation Dossier
      pages.push({
        title: 'Page 4: Personalized 5-Pillar Vedic Gemstone (Ratna & Upratna) Recommendation & Prana-Pratishtha Vidhi',
        headImg: vedicNameCareerYantra,
        headLabel: '5-Pillar Ratna Dossier',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/40 flex items-center justify-between">
              <div>
                <h4 className="font-serif text-[11px] font-bold text-amber-200 uppercase">
                  Complete 5-Pillar Vedic Ratna Shastra Matrix for {activeProfile.name}
                </h4>
                <p className="text-[9px] text-slate-300">
                  Ideal Carat / Ratti Weight Range: <strong className="text-emerald-300">{gemRecommend.idealRattiRange}</strong> | Stones Strictly to Avoid: <strong className="text-rose-300">{gemRecommend.stonesToAvoid.map((s) => `${s.primaryGem} (${s.planet})`).join(', ') || 'Enemy Planet Gems'}</strong>
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 font-mono text-[9px] font-bold">
                Rashi: {astro.rashi}
              </span>
            </div>

            <div className="space-y-1.5">
              {[
                {
                  pillar: `1. Life Stone (Mulank ${m} — ${mPlanet.planet})`,
                  stone: gemRecommend.lifeStone,
                  extra: `Core vitality, immunity, self-confidence & physical aura shield.`,
                },
                {
                  pillar: `2. Bhagya Stone (Bhagyank ${b} — ${bPlanet.planet})`,
                  stone: gemRecommend.destinyStone,
                  extra: `Long-term wealth compounding, career elevation & destiny grace after age 30.`,
                },
                {
                  pillar: `3. Rashi & Nakshatra Stone (${astro.rashi} / ${astro.nakshatra})`,
                  stone: gemRecommend.rashiNakshatraStone,
                  extra: `Mental peace, emotional stability & protection against Chandrashtama.`,
                },
                {
                  pillar: `4. Active Gochar Transit Kavach Stone (${gemRecommend.transitStone.planet})`,
                  stone: gemRecommend.transitStone,
                  extra: gemRecommend.transitReason,
                },
                {
                  pillar: `5. Name Vibration Amplifier Stone (Namank ${nameAnalysis.chaldeanSingle} — ${nPlanet.planet})`,
                  stone: gemRecommend.nameStone,
                  extra: `Amplifies public magnetism, brand recognition & commercial success.`,
                },
              ].map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/30 text-[8.8px] space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-amber-200">
                    <span>{item.pillar}: <strong className="text-emerald-300">{item.stone.primaryGem} ({item.stone.sanskritName})</strong></span>
                    <span className="font-mono text-sky-300">Upratna: {item.stone.substituteStone}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-slate-200 a4-print-grid-2">
                    <div>
                      <strong>Metal &amp; Finger:</strong> {item.stone.metal} • {item.stone.wearingFinger} | <strong>Day/Time:</strong> {item.stone.wearingDayTime}
                    </div>
                    <div>
                      <strong>Chakra:</strong> {item.stone.chakra} | <strong>Mantra (108x):</strong> <span className="text-amber-300 font-mono">{item.stone.mantra}</span>
                    </div>
                  </div>
                  <div className="text-slate-300">
                    <strong>Benefits:</strong> {(item.stone.benefits || item.stone.coreBenefits).join(' • ')} — <span className="text-emerald-200">{item.extra}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 rounded-xl bg-emerald-950/25 border border-emerald-500/35 text-[8.8px] text-slate-200">
              <strong className="text-emerald-300 uppercase block mb-0.5">
                5-Step Vedic Ratna Prana-Pratishtha (Consecration) &amp; Wearing Vidhi:
              </strong>
              1. Dip the open-back ring/pendant in Panchamrit (raw cow milk, curd, honey, ghee &amp; Gangajal) for 21–30 minutes on the prescribed morning Hora. 2. Wash with pure Gangajal and place on a red/yellow silk cloth before your Ishta Devata. 3. Offer sandalwood paste, Akshat, incense, and a cow-ghee lamp. 4. Chant the stone&apos;s Beej Mantra 108 times facing East. 5. Wear on the prescribed finger and hand during Shukla Paksha so the stone touches your skin directly.
              {!isHealerReport && (
                <div className="mt-1 pt-1 border-t border-emerald-500/30 text-amber-200 font-semibold">
                  • Visit <strong className="text-emerald-300 font-mono">www.tathastulight.com</strong> for 100% genuine &amp; authentic Rudraksha, Crystals, Home Cleansing Material, Precious &amp; Semi-Precious Stones.
                </div>
              )}
            </div>
          </div>
        ),
      });

      // PAGE 4B: Precious Stone Recommendation — If You Do Not Want to Change Name & For Personal Growth (Complete Step-by-Step Guide)
      pages.push({
        title: 'Page 4B: Precious Stone Recommendation — If You Do Not Want to Change Name & For Personal Growth (Complete Step-by-Step Guide)',
        headImg: vedicNameCareerYantra,
        headLabel: 'No-Name-Change & Growth Ratna',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/40 flex items-center justify-between gap-2">
              <div>
                <h4 className="font-serif text-[10.5px] font-bold text-amber-200 uppercase">
                  Precious Stone Recommendation — If You Do Not Want to Change Name &amp; For Personal Growth
                </h4>
                <p className="text-[8.5px] text-slate-300">
                  For clients who prefer not to alter their existing name spelling (<strong className="text-amber-200">{activeProfile.originalName || activeProfile.name}</strong>) and for accelerated Personal Growth &amp; Career Breakthroughs, with complete wearing instructions.
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[8.5px] font-bold shrink-0">
                Weight: {nameAndGrowthRatna.noNameChangeStone.idealRattiRange} ({nameAndGrowthRatna.noNameChangeStone.idealCaratRange})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 a4-print-grid-2">
              {[nameAndGrowthRatna.noNameChangeStone, nameAndGrowthRatna.personalGrowthStone].map(
                (stoneRec, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl bg-slate-950/95 border text-[8px] space-y-1.5 ${
                      idx === 0 ? 'border-amber-500/45' : 'border-emerald-500/45'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold uppercase text-[7.5px] border ${
                          idx === 0
                            ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                        }`}
                      >
                        {stoneRec.priorityBadge}
                      </span>
                      <span className="font-mono text-amber-300 font-bold text-[7.5px]">
                        Planet: {stoneRec.ratna.planet} ({stoneRec.ratna.sanskritPlanet})
                      </span>
                    </div>

                    <div>
                      <div className="font-serif text-[9.5px] font-bold text-amber-100 leading-tight">
                        {stoneRec.purposeTitle}
                      </div>
                      <div className="text-[7.5px] text-amber-300/80">{stoneRec.purposeSubtitle}</div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900 border border-amber-500/30 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-emerald-300 text-[9px]">
                          Primary Stone: {stoneRec.ratna.primaryGem} ({stoneRec.ratna.sanskritGem})
                        </strong>
                        <span className="font-mono text-amber-200 text-[7.5px] font-bold">
                          {stoneRec.idealRattiRange}
                        </span>
                      </div>
                      <div className="text-sky-200 text-[7.8px]">
                        <strong>Substitute Stone (Upratna):</strong> {stoneRec.ratna.upratna}
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-amber-500/20 text-slate-200 leading-snug">
                      <strong className="text-amber-300 uppercase block text-[7.5px]">
                        Why Recommended According to Vedic Astrology &amp; Chaldean Numerology:
                      </strong>
                      {stoneRec.astrologicalReason}
                    </div>

                    <div className="grid grid-cols-2 gap-1 a4-print-grid-2">
                      <div className="p-1.5 rounded bg-slate-900 border border-amber-500/25">
                        <strong className="text-amber-400 uppercase block text-[7px]">
                          1. Which Finger &amp; Hand to Wear
                        </strong>
                        <span className="text-amber-100 font-bold block">{stoneRec.wearingHandAndFinger}</span>
                        <span className="text-slate-400 text-[7px]">Chakra: {stoneRec.ratna.chakra}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900 border border-amber-500/25">
                        <strong className="text-amber-400 uppercase block text-[7px]">
                          2. In Which Metal &amp; Setting
                        </strong>
                        <span className="text-amber-100 font-bold block">{stoneRec.ratna.metal}</span>
                        <span className="text-slate-400 text-[7px]">Open-back touching skin</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900 border border-amber-500/25">
                        <strong className="text-emerald-400 uppercase block text-[7px]">
                          3. Auspicious Day, Time &amp; Nakshatra
                        </strong>
                        <span className="text-emerald-200 font-bold block">{stoneRec.dayAndMuhurat}</span>
                        <span className="text-slate-400 text-[7px]">{stoneRec.pakshaAndNakshatra}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900 border border-amber-500/25">
                        <strong className="text-sky-400 uppercase block text-[7px]">
                          4. Panchamrit Purification Liquid
                        </strong>
                        <span className="text-sky-200 font-bold block">{stoneRec.purificationIngredients}</span>
                        <span className="text-slate-400 text-[7px]">Soak 21–30 mins before sunrise</span>
                      </div>
                    </div>

                    <div className="p-1.5 rounded bg-amber-950/35 border border-amber-500/35">
                      <strong className="text-amber-400 uppercase block text-[7px]">
                        5. Prana-Pratishtha Beej Mantra (Chant 108 Times Before Wearing)
                      </strong>
                      <span className="font-serif font-bold text-amber-100">{stoneRec.beejMantra}</span>
                    </div>

                    <div className="p-1.5 rounded bg-emerald-950/25 border border-emerald-500/30 space-y-0.5">
                      <strong className="text-emerald-300 uppercase block text-[7.5px]">
                        Complete Step-by-Step Wearing Ritual (Ratna Dharan Vidhi):
                      </strong>
                      {stoneRec.howToWearStepByStep.map((st, sIdx) => (
                        <div key={sIdx} className="text-slate-200 leading-tight text-[7.5px]">
                          • {st}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
            {!isHealerReport && (
              <div className="p-2 rounded-xl bg-amber-950/35 border border-amber-500/45 text-[8.5px] text-amber-100 leading-snug">
                <strong className="text-amber-300 uppercase">Official Remedies Portal (www.tathastulight.com):</strong> Visit <strong className="text-emerald-300 font-mono">www.tathastulight.com</strong> for 100% genuine &amp; authentic Rudraksha, Crystals, Home Cleansing Material, Precious &amp; Semi-Precious Stones.
              </div>
            )}
          </div>
        ),
      });

      // PAGE 5: Universal Numeric Vibration Verifier (Vehicle, Flat/House, Bank/Brand, Mobile)
      pages.push({
        title: 'Page 5: Universal Numeric Vibration Verifier — Vehicle, Flat/House, Business Brand & Mobile Benchmarks',
        headImg: vedicNameCareerYantra,
        headLabel: 'Universal Validator',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/40 text-[9px] text-slate-200">
              <strong className="text-amber-300 uppercase block">
                Universal Numeric Vibration Verifier (Personalized Benchmarks for Mulank {m} & Bhagyank {b}):
              </strong>
              Every registration plate, house/flat door number, bank account, or commercial brand name carries an active Chaldean compound and single-digit root. Align all assets to your Friendly Planetary Roots (<strong className="text-emerald-300">{mPlanet.friendlyNumbers.join(', ')}</strong>).
            </div>

            <div className="grid grid-cols-2 gap-2 a4-print-grid-2">
              {[
                { label: '1. Vehicle Registration Plate Benchmark', data: vehicleValidation },
                { label: '2. Flat / Villa / Office Door Number Benchmark', data: flatValidation },
                { label: '3. Business / Brand / Account Name Benchmark', data: businessValidation },
                { label: '4. Primary Mobile Number Benchmark', data: mobileValidation },
              ].map((card, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/30 text-[8.8px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-200">
                    <span>{card.label}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                      {card.data.compoundNumber}➔{card.data.singleDigit} ({card.data.compatibilityScore}%)
                    </span>
                  </div>
                  <div className="text-sky-300 font-mono">
                    Sample: {card.data.input} • Planet: {card.data.rulingPlanet} • Status: {card.data.status}
                  </div>
                  <div className="text-slate-200">
                    <strong>Compound Title ({card.data.compoundInfo.title}):</strong> {card.data.compoundInfo.description}
                  </div>
                  <div className="text-emerald-200 leading-snug">
                    <strong>Vedic Guidance:</strong> {card.data.recommendation}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 rounded-xl bg-slate-900/95 border border-sky-500/35 text-[8.5px] text-slate-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-sky-300 uppercase">
                <span>1. Step-by-Step Self-Calculation Formula (Calculate Your Own Vehicle, Flat &amp; Brand)</span>
                <span className="font-mono text-amber-300">Chaldean Key (1 to 8)</span>
              </div>
              <p className="leading-snug">
                <strong>Step 1 (Letters to Chaldean Values):</strong>{' '}
                <span className="font-mono text-amber-200">
                  1 = A,I,J,Q,Y • 2 = B,K,R • 3 = C,G,L,S • 4 = D,M,T • 5 = E,H,N,X • 6 = U,V,W • 7 = O,Z • 8 = F,P
                </span>{' '}
                | <strong>Step 2 (Add Digits &amp; Letters):</strong> Add every letter value + every digit to get the <strong>Compound Number</strong>, then add its digits until you get a single <strong>Root Digit (1–9)</strong>. Match with your Friendly Roots (<strong className="text-emerald-300">{mPlanet.friendlyNumbers.join(', ')}</strong>).
              </p>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/90 border border-emerald-500/35 text-[8.6px] text-slate-200 space-y-1">
              <h5 className="font-serif text-[10px] font-bold text-emerald-300 uppercase">
                2. Master Selection Rules for New Vehicles, Flats, Plots, Bank Accounts &amp; Business / Brand Names (Company &amp; Trade)
              </h5>
              <p>
                <strong>• A. Ideal Vehicle Last-4 Plate Sum &amp; Full Plate Sum:</strong> Choose registration numbers summing to <strong className="text-amber-200">{mPlanet.friendlyNumbers.join(', ')}</strong> (Compound 19, 23, 24, 27, 32, 37, 41, 45, 46). Avoid enemy roots ({mPlanet.enemyNumbers.join(', ')}).
              </p>
              <p>
                <strong>• B. Ideal Flat / House / Plot Door Number:</strong> Select door or plot numbers reducing to <strong className="text-amber-200">{bPlanet.friendlyNumbers.join(', ')}</strong>. Place a brass/copper sticker of digit <strong className="text-emerald-300">{mPlanet.friendlyNumbers[0] || m}</strong> inside the doorframe if needed.
              </p>
              <p>
                <strong>• C. Business / Brand Name (Company &amp; Trade):</strong> Ensure your company, trade, startup, or shop name sums to Compound <strong className="text-emerald-300">19 (Sun), 23 (Mercury), 24 (Venus), 32 (Mercury), 37 (Sun-Ketu), 41 (Mercury), 45 (Jupiter), or 46 (Sun)</strong> reducing to friendly roots <strong className="text-amber-200">{Array.from(new Set([m, b, ...mPlanet.friendlyNumbers])).join(', ')}</strong>.
              </p>
              <p>
                <strong>• D. Bank Account, Locker &amp; Demat Selection Rule:</strong> Prioritize bank accounts or lockers whose last 4 digits or full account sum reduce to <strong className="text-amber-200">6 (Venus), 5 (Mercury), 3 (Jupiter), or {b} (Destiny)</strong>.
              </p>
            </div>
          </div>
        ),
      });
    }

    // PAGES 6–10: Advance Mobile Audit, Combined Triad, Virtual SIMs, 3x3 Grid, Present/Missing Remedies & 10-Cycle Maha Dasha
    if (selectedSections.advanceMobileAudit) {
      // PAGE 6: Advance Mobile Audit, All 9 Pairs, Combined Pair Prediction & Concrete Examples
      pages.push({
        title: 'Page 6: Advance Mobile Numerology Audit, All 9 Sequential Digit Pairs & Concrete Examples',
        headImg: mobileLoShuGridArt,
        headLabel: 'Advance Mobile Audit',
        isCover: pages.length === 0,
        content: (
          <div className="space-y-2 text-xs">
            <div className="relative rounded-xl overflow-hidden border border-amber-500/40 min-h-[68px]">
              <img
                src={mobileLoShuGridArt}
                alt="Advance Mobile Numerology & Lo-Shu Cosmic Grid"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
              <div className="relative z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 p-2.5 flex flex-col justify-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold break-words">
                  02 • ADVANCE MOBILE NUMBER VIBRATION AUDIT ({activeProfile.mobile})
                </span>
                <h3 className="font-serif text-sm font-black text-amber-100 break-words leading-snug">
                  Compound {mobileAnalysis.compoundNumber} ➔ Root {mobileAnalysis.singleDigit} • Overall Score: {mobileAnalysis.overallScore}/100 ({mobileAnalysis.verdict})
                </h3>
                <p className="text-[9px] text-emerald-300 break-words leading-snug">
                  Lucky Colours: {advMobile.luckyColours.join(', ')} | Avoid Colours: {advMobile.unluckyColours.join(', ')} | Avoid Digits in SIM: {(advMobile.avoidNumbersInMobile || []).join(', ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 a4-print-grid-2">
              <div className="p-2 rounded-xl bg-slate-950/90 border border-amber-500/30 text-[9px] space-y-1">
                <span className="font-bold text-amber-300 uppercase block">
                  Compound {advMobile.mobileCompound} & Root {advMobile.mobileTotal} Prediction
                </span>
                <p className="text-slate-200 leading-snug">{advMobile.mobileTotalPrediction}</p>
                <p className="text-emerald-300">
                  <strong>Lucky Totals:</strong> {advMobile.recommendedMobileTotals.join(', ')} | <strong>Lucky Digits:</strong> {advMobile.luckyNumbers.join(', ')} | <strong>Unlucky:</strong> {advMobile.unluckyNumbers.join(', ')} | <strong>Neutral:</strong> {advMobile.neutralNumbers.join(', ')}
                </p>
                <p className="text-sky-200 leading-snug">
                  <strong>Combined Pair Summary:</strong> {advMobile.combinedPairPrediction}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/90 border border-amber-500/30 text-[8.5px] space-y-0.5">
                <span className="font-bold text-amber-300 uppercase block">
                  All {advMobile.mobileCombinations.length} Adjacent 2-Digit Cellular Pairs in {activeProfile.mobile}
                </span>
                <div className="space-y-0.5">
                  {advMobile.mobileCombinations.map((pa, idx) => (
                    <div key={idx} className="text-slate-200 leading-tight">
                      <strong className="font-mono text-amber-300">#{idx + 1} [{pa.pair}] ({pa.status.toUpperCase()}):</strong> {pa.prediction}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/90 border border-emerald-500/35 space-y-1 text-[9px]">
              <h5 className="font-serif text-[10.5px] font-bold text-emerald-300 uppercase">
                {advMobile.exampleRecommendedNumbers.length === 0
                  ? 'Perfect Mobile Frequency Result & Prescribed Wallpaper Remedy'
                  : 'Concrete Recommended Mobile Examples, Wallpaper Remedy & SIM Balancing Protocol'}
              </h5>
              {advMobile.exampleRecommendedNumbers.length === 0 ? (
                <p className="text-emerald-200">
                  <strong>• Perfect Mobile Frequency Result:</strong> Your mobile number <strong>{activeProfile.mobile}</strong> (Compound {advMobile.mobileCompound} ➔ Root {advMobile.mobileTotal}) already vibrates in auspicious harmony with Mulank {m} and Bhagyank {b}. No mobile number change or suggestion is required.
                </p>
              ) : (
                advMobile.exampleRecommendedNumbers.map((ex, idx) => (
                  <p key={idx} className="text-slate-200">
                    <strong>• Example {idx + 1} ({ex.number}):</strong> Compound {ex.compound} ➔ Root {ex.total} — {ex.benefit}
                  </p>
                ))
              )}
              <p className="text-amber-200">
                <strong>• Prescribed Mobile Wallpaper ({advMobile.recommendedWallpaper.title}):</strong> {advMobile.recommendedWallpaper.description} ({advMobile.recommendedWallpaper.placementAdvice})
              </p>
              {mobileAnalysis.remedies.length > 0 && (
                <div className="grid grid-cols-2 gap-1 pt-0.5 a4-print-grid-2">
                  {mobileAnalysis.remedies.map((rem, idx) => (
                    <div key={idx} className="p-1 rounded bg-slate-950 border border-amber-500/20 text-[8.5px] text-amber-100">
                      ✓ {rem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ),
      });

      // PAGE 7: Combined Name + D.O.B + Mobile Triad Synergy Audit & Virtual Lucky SIM Architect
      pages.push({
        title: 'Page 7: Combined Name + D.O.B + Mobile Triad Synergy Audit & Career Result',
        headImg: mobileLoShuGridArt,
        headLabel: 'Triad & Mobile Result',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/95 border-2 border-amber-500/45 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-[11px] font-bold text-amber-200 uppercase">
                  1. Live Combined Name + D.O.B + Mobile Triad Synergy Audit
                </h4>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-[10px]">
                  Triad {triadCompound} ➔ {triadSingle} ({triadPlanet.planet}) • {combinedTriadScore}% Synergy
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-[8.5px] a4-print-grid-2">
                <div className="p-1.5 rounded bg-slate-950 border border-amber-500/25">
                  <strong className="text-amber-300 block">Mulank ({m}) ↔ Mobile ({mobileAnalysis.singleDigit})</strong>
                  <span className="text-emerald-300 font-mono">{relMulankMobile} Relationship</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-amber-500/25">
                  <strong className="text-amber-300 block">Bhagyank ({b}) ↔ Mobile ({mobileAnalysis.singleDigit})</strong>
                  <span className="text-emerald-300 font-mono">{relBhagyankMobile} Relationship</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-amber-500/25">
                  <strong className="text-amber-300 block">Name ({nameAnalysis.chaldeanSingle}) ↔ Mobile ({mobileAnalysis.singleDigit})</strong>
                  <span className="text-emerald-300 font-mono">{relNameMobile} Relationship</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-amber-500/25">
                  <strong className="text-amber-300 block">Mulank ({m}) ↔ Name ({nameAnalysis.chaldeanSingle})</strong>
                  <span className="text-emerald-300 font-mono">{relMulankName} Relationship</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[8.8px] a4-print-grid-2">
                <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-slate-200">
                  <strong className="text-emerald-300 block">Combined Triad Supreme Career Sectors:</strong>
                  {combinedCareerProfile.perfectBusinesses.map((cb) => `${cb.field} (${cb.successRate}%)`).join(' • ')}
                </div>
                <div className="p-1.5 rounded bg-rose-950/30 border border-rose-500/30 text-slate-200">
                  <strong className="text-rose-300 block">Combined Triad Sectors to Avoid:</strong>
                  {combinedCareerProfile.veryBadBusinesses.map((vb) => `${vb.field} (${vb.conflictPlanet})`).join(' • ')}
                </div>
              </div>
            </div>

            {advMobile.exampleRecommendedNumbers.length === 0 &&
            !activeProfile.selectedMobileA &&
            !activeProfile.selectedMobileB ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border-2 border-emerald-500/45 space-y-1 text-[9.5px]">
                <h4 className="font-serif text-[11px] font-bold text-emerald-300 uppercase">
                  ★ Perfect Mobile Number Frequency Result — No SIM Change Suggestion Required
                </h4>
                <p className="text-slate-200 leading-snug">
                  Your active mobile number <strong className="text-amber-200">{activeProfile.mobile}</strong> (Compound {advMobile.mobileCompound} ➔ Root {advMobile.mobileTotal} • {mobileAnalysis.overallScore}% Cosmic Harmony) is already in auspicious planetary alignment with your Mulank {m} and Bhagyank {b}. Only your complete Triad and Mobile frequency result is displayed — no new SIM suggestions are needed.
                </p>
              </div>
            ) : (
              <>
                {(() => {
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

                  return (
                    <div className="p-2 rounded-xl bg-slate-900/95 border-2 border-amber-500/45 space-y-1 text-[8.4px]">
                      <div className="flex items-center justify-between border-b border-amber-500/25 pb-0.5">
                        <h4 className="font-serif text-[10px] font-bold text-amber-200 uppercase">
                          ★ 3-Way Mobile Comparison: Client Original Number vs Selected Number A &amp; B (Active: {activeProfile.mobile})
                        </h4>
                        <span className="font-mono text-emerald-300 font-bold">
                          Cosmic Harmony Index % &amp; Losses vs Benefits
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 a4-print-grid-3">
                        {[
                          { label: '1. Original Mobile', num: origMob, res: origMobRes, isOrig: true },
                          { label: '2. Selected Number A', num: selMobA, res: mobARes, isOrig: false },
                          { label: '3. Selected Number B', num: selMobB, res: mobBRes, isOrig: false },
                        ].map((item, idx) => {
                          const isCurrent = item.num === (activeProfile.mobile || '').trim();
                          return (
                            <div
                              key={idx}
                              className={`p-1.5 rounded-lg border space-y-0.5 ${
                                isCurrent
                                  ? 'bg-emerald-950/40 border-emerald-400'
                                  : 'bg-slate-950 border-amber-500/25'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-amber-200">
                                <span>{item.label}</span>
                                <span className="font-mono text-emerald-300">
                                  Harmony: {item.res.overallScore}%
                                </span>
                              </div>
                              <div className="font-mono font-black text-white">
                                {item.num} ({item.res.compoundNumber}➔{item.res.singleDigit})
                              </div>
                              {item.isOrig ? (
                                <p className="text-rose-200 leading-tight">
                                  <strong>Loss / Drawback:</strong>{' '}
                                  {item.res.toxicPairsFound.length > 0
                                    ? `Negative pairs (${item.res.toxicPairsFound.map((tp) => tp.pair).join(', ')}) cause payment delays & stress.`
                                    : `Root ${item.res.singleDigit} gives ${item.res.overallScore}% Cosmic Harmony Index.`}
                                </p>
                              ) : (
                                <p className="text-emerald-200 leading-tight">
                                  <strong>Benefit / Gain:</strong> Root {item.res.singleDigit} ({PLANETARY_PROFILES[item.res.singleDigit]?.planet}) boosts cashflow, authority &amp; client conversion ({item.res.overallScore}% Harmony).
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div className="p-2 rounded-xl bg-slate-900/95 border border-emerald-500/40 space-y-1">
                  <h4 className="font-serif text-[10.5px] font-bold text-emerald-300 uppercase">
                    2. Virtual Lucky SIM Architect — All 4 Life Goals Custom SIM Blueprints for {activeProfile.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 text-[8.4px] a4-print-grid-2">
                    {[
                      {
                        goal: '1. Business & Commercial Expansion SIM',
                        targetRoot: mPlanet.friendlyNumbers[0] || 5,
                        pairs: '56 • 65 • 51 • 15 • 35',
                        sample: `98${mPlanet.friendlyNumbers[0] || 5}651535${b}`,
                        benefit: 'Accelerates B2B inquiries, daily cash-flow turnover, digital marketing conversions & trade velocity.',
                      },
                      {
                        goal: '2. Wealth, Luxury & Asset Compounding SIM',
                        targetRoot: 6,
                        pairs: '69 • 96 • 61 • 16 • 56',
                        sample: `98691656${m}6`,
                        benefit: 'Attracts high-net-worth clientele, real-estate appreciation, luxury assets & Shukra-Kubera grace.',
                      },
                      {
                        goal: '3. Authority, Leadership & Government Fame SIM',
                        targetRoot: 1,
                        pairs: '19 • 91 • 13 • 31 • 15',
                        sample: `98193115${b}1`,
                        benefit: 'Strengthens Surya-Guru administrative command, executive promotions, tenders & public recognition.',
                      },
                      {
                        goal: '4. Family Peace, Healing & Spiritual Protection SIM',
                        targetRoot: 3,
                        pairs: '32 • 23 • 39 • 93 • 25',
                        sample: `98329325${m}3`,
                        benefit: 'Harmonizes domestic relationships, emotional intuition, consultation wisdom & ancestral blessings.',
                      },
                    ].map((sim, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-slate-950 border border-emerald-500/30 space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-amber-200">
                          <span>{sim.goal}</span>
                          <span className="font-mono text-emerald-300">Target Root {sim.targetRoot}</span>
                        </div>
                        <div className="text-sky-300 font-mono">
                          Power Pairs: {sim.pairs} | Blueprint: {sim.sample}
                        </div>
                        <p className="text-slate-300 leading-tight">{sim.benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ),
      });

      // PAGE 8: Sacred 3×3 Square Lo-Shu Grid, Present Number Readings (Sepharial Vedic Grid) & All Active Chart Yogas
      pages.push({
        title: 'Page 8: Sacred 3×3 Square Lo-Shu Grid, Present Number Readings & All Active Chart Yogas',
        headImg: mobileLoShuGridArt,
        headLabel: '3×3 Grid & Active Yogas',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/95 border-2 border-amber-500/45 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-48 min-h-[11rem] shrink-0 p-1.5 rounded-xl bg-slate-950 border-2 border-amber-400 shadow-xl grid grid-cols-3 grid-rows-3 gap-1 text-center font-mono">
                {[
                  { num: 4, dir: 'SE', label: 'Rahu (Wealth)' },
                  { num: 9, dir: 'S', label: 'Mangal (Fame)' },
                  { num: 2, dir: 'SW', label: 'Chandra (Mind)' },
                  { num: 3, dir: 'E', label: 'Guru (Wisdom)' },
                  { num: 5, dir: 'C', label: 'Budh (Balance)' },
                  { num: 7, dir: 'W', label: 'Ketu (Intuition)' },
                  { num: 8, dir: 'NE', label: 'Shani (Assets)' },
                  { num: 1, dir: 'N', label: 'Surya (Career)' },
                  { num: 6, dir: 'NW', label: 'Shukra (Luxury)' },
                ].map((cell) => {
                  const count = loShu.grid[cell.num] || 0;
                  return (
                    <div
                      key={cell.num}
                      className={`p-1 rounded-lg border flex flex-col items-center justify-between min-w-0 overflow-hidden ${
                        count > 0
                          ? 'bg-amber-500/25 border-amber-400 text-amber-100'
                          : 'bg-slate-900/90 border-rose-500/35 text-slate-400'
                      }`}
                    >
                      <span className="text-[7px] font-bold text-amber-300 leading-none">
                        {cell.dir} [{cell.num}]
                      </span>
                      <div className="text-xs font-black leading-none my-0.5">
                        {count > 0 ? (
                          <span className="text-emerald-300">{String(cell.num).repeat(count)}</span>
                        ) : (
                          <span className="text-rose-400 text-[7.5px]">MISSING</span>
                        )}
                      </div>
                      <div className="text-[6.4px] leading-tight break-words w-full">{cell.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 space-y-1 text-[9px]">
                <h5 className="font-serif text-[10.5px] font-bold text-amber-200 uppercase">
                  Present Numbers Repetition Impact in Birth Chart (Sepharial & Lo-Shu Analysis)
                </h5>
                {advMobile.presentNumberReadings.map((pr) => (
                  <div key={pr.number} className="p-1 rounded bg-slate-950 border border-amber-500/25">
                    <strong className="text-emerald-300">
                      {pr.heading} ({pr.count}x in Grid):
                    </strong>{' '}
                    <span className="text-slate-200">{pr.description} {pr.repetitionNote || ''}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-1">
              <h5 className="font-serif text-[10.5px] font-bold text-emerald-300 uppercase">
                All Active 2-Digit & 3-Digit Chart Combination Yogas (Directly Below Sacred 3×3 Square Grid)
              </h5>
              <div className="grid grid-cols-2 gap-1.5 text-[8.5px] a4-print-grid-2">
                {advMobile.chartCombinations.map((y, idx) => (
                  <div key={idx} className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-100">
                    <strong className="text-amber-200 block">
                      {idx + 1}. Active {y.type} ({y.combination} — {y.title}):
                    </strong>
                    <span>{y.paragraphs.join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      });

      // PAGE 9: Complete Missing Karmic Numbers Remedies (Wear, Vastu, Rituals + Interactive Lo-Shu Vedic Remedies DB)
      pages.push({
        title: 'Page 9: Complete Missing Karmic Numbers — Wear, Vastu, Sacred Rituals & Vedic Planetary Remedies',
        headImg: mobileLoShuGridArt,
        headLabel: 'Missing Digits Remedies',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/95 border border-rose-500/40 text-[9px] text-slate-200">
              <strong className="text-amber-300 uppercase">
                Complete Missing Karmic Numbers Protocol ({advMobile.missingNumberRemedies.map((mItem) => mItem.number).join(', ')}):
              </strong>{' '}
              Every missing digit in your Lo-Shu Grid represents a karmic lesson. Activate all 3 pillars (1. Wear, 2. Vastu & Feng Shui, 3. Sacred Rituals + Mantra & Charity) below.
            </div>
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
              {advMobile.missingNumberRemedies.map((mr) => {
                const dbRem = LO_SHU_VEDIC_REMEDIES_DB[mr.number];
                return (
                  <div
                    key={mr.number}
                    className="p-2 rounded-xl bg-slate-950/95 border border-rose-500/30 text-[8.3px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-bold text-amber-200">
                      <span>
                        Missing Digit {mr.number} — {mr.planet} ({dbRem?.planet || mr.planet})
                      </span>
                      <span className="font-mono text-sky-300">
                        {dbRem?.direction || ''} • {dbRem?.element || ''}
                      </span>
                    </div>
                    {dbRem && (
                      <div className="text-rose-200 leading-tight">
                        <strong>Missing Impact:</strong> {dbRem.missingImpact}
                      </div>
                    )}
                    <div className="text-slate-200 leading-tight">
                      <strong>1. Wear:</strong> {mr.wear.join(' • ')} {dbRem ? `• ${dbRem.rudrakshaAndCrystal}` : ''}
                    </div>
                    <div className="text-emerald-300 leading-tight">
                      <strong>2. Vastu & Feng Shui:</strong> {mr.vastuAndFengShui.join(' • ')}
                    </div>
                    <div className="text-amber-200 leading-tight">
                      <strong>3. Sacred Rituals:</strong> {mr.rituals.join(' • ')}
                    </div>
                    <div className="text-purple-200 font-mono leading-tight">
                      <strong>4. Sound Frequency (Hz):</strong> 🔊 {mr.soundFrequency}
                    </div>
                    {dbRem && (
                      <div className="text-sky-200 font-mono leading-tight">
                        <strong>Mantra:</strong> {dbRem.beejMantra} ({dbRem.mantraProtocol}) | <strong>Daan:</strong> {dbRem.dailyKarmaAndDaan}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {!isHealerReport && (
              <div className="p-2 rounded-xl bg-amber-950/35 border border-amber-500/45 text-[8.5px] text-amber-100 leading-snug">
                <strong className="text-amber-300 uppercase">Official Remedies Portal (www.tathastulight.com):</strong> Visit <strong className="text-emerald-300 font-mono">www.tathastulight.com</strong> for 100% genuine &amp; authentic Rudraksha, Crystals, Home Cleansing Material, Precious &amp; Semi-Precious Stones.
              </div>
            )}
          </div>
        ),
      });

      // PAGE 10: Complete Vedic Numerology & Astrological Vimshottari Maha Dasha Timeline — Starting from Present Active Cycle
      const activeVimshottari =
        advMobile.vimshottariDashaTimeline?.find((d) => d.isCurrent) ||
        advMobile.vimshottariDashaTimeline?.[0];
      pages.push({
        title: 'Page 10: Complete Vedic Astrological (120-Yr Vimshottari) & Numerology (45-Yr) Maha Dasha Timeline — Starting from Present Active Cycle',
        headImg: mobileLoShuGridArt,
        headLabel: 'Maha Dasha Timeline',
        content: (
          <div className="space-y-1.5 text-xs">
            {/* A. 120-Year Classical Parashari Vimshottari Maha Dasha (Matches AstroSage / Drik Panchang) */}
            {advMobile.janmaNakshatraSummary && advMobile.vimshottariDashaTimeline && (
              <div className="p-2 rounded-xl bg-slate-900/95 border border-emerald-500/45 text-[8.4px] text-slate-200 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <strong className="text-emerald-300 uppercase">
                    A. 120-Year Classical Parashari Vimshottari Maha Dasha (Janma Nakshatra: {advMobile.janmaNakshatraSummary.nakshatra} Pada {advMobile.janmaNakshatraSummary.pada} • Moon {advMobile.janmaNakshatraSummary.moonDegreeSidereal.toFixed(2)}° • Lord: {advMobile.janmaNakshatraSummary.birthDashaLord}):
                  </strong>
                  <span className="font-mono text-[7.8px] text-amber-300">
                    Birth Balance (Bhogya): {advMobile.janmaNakshatraSummary.birthDashaBalanceLabel}
                  </span>
                </div>
                {activeVimshottari && (
                  <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-400/60 text-emerald-100 space-y-0.5">
                    <div>
                      <strong className="text-amber-300">
                        ★ Present Active Astrological Vimshottari Maha Dasha:
                      </strong>{' '}
                      <strong>{activeVimshottari.planet} ({activeVimshottari.sanskritName})</strong> — {activeVimshottari.startDate} to {activeVimshottari.endDate} ({activeVimshottari.durationYears} Yrs) •{' '}
                      <strong className="text-emerald-300">
                        Harmony: {activeVimshottari.harmonyPercent}% ({activeVimshottari.harmonyVerdict})
                      </strong>
                      {activeVimshottari.activeAntardasha ? (
                        <span className="text-amber-200 font-semibold">
                          {' '}• Active Antardasha: {activeVimshottari.activeAntardasha}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[7.5px] text-amber-100/95">
                      <strong className="text-amber-300">Vedic Remedy:</strong> {activeVimshottari.remedy}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-1 a4-print-grid-3 text-[7.6px]">
                  {advMobile.vimshottariDashaTimeline.map((vd, vIdx) => (
                    <div
                      key={vIdx}
                      className={`p-1.5 rounded border space-y-0.5 ${
                        vd.isCurrent
                          ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                          : 'bg-slate-950 border-emerald-500/30 text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-amber-200 flex items-center justify-between gap-1">
                        <span>{vd.isCurrent ? '★ NOW: ' : `${vIdx + 1}. `}{vd.planet} (#{vd.dashaNumber})</span>
                        <span className="font-mono text-[7px] text-emerald-300">
                          {vd.harmonyPercent}% • {vd.durationYears}Y
                        </span>
                      </div>
                      <div className="font-mono text-[7px] text-sky-200">{vd.startDate} – {vd.endDate}</div>
                      <div className="text-[6.8px] text-amber-100/90 leading-tight">
                        <strong className="text-amber-300">Remedy:</strong> {vd.remedy}
                      </div>
                    </div>
                  ))}
                </div>
                {advMobile.vimshottariPastCycles && advMobile.vimshottariPastCycles.length > 0 && (
                  <div className="text-[7.5px] text-slate-300 font-mono pt-0.5">
                    <strong className="text-amber-200">Past Completed Astrological Cycles Since Birth:</strong>{' '}
                    {advMobile.vimshottariPastCycles
                      .map((p) => `${p.planet} (${p.startDate} – ${p.endDate})`)
                      .join(' • ')}
                  </div>
                )}
              </div>
            )}

            {/* B. 45-Year Vedic Numerology Progressive Maha Dasha Timeline — Starting from Present Active Cycle */}
            <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/40 text-[8.5px] text-slate-200 space-y-1">
              <div>
                <strong className="text-amber-300 uppercase">
                  B. 45-Year Vedic Numerology Progressive Maha Dasha Timeline — Starting from Present Active Cycle (DOB: {activeProfile.dob}):
                </strong>{' '}
                Begins with Mulank #{m} at birth (1→1y, 2→2y ... 9→9y = 45-Year Cycle). Starts directly from your <strong>★ Present Active Cycle</strong> (Dasha #{activeDasha?.dashaNumber} {activeDasha?.planet}, {activeDasha?.startDate} – {activeDasha?.endDate} • Harmony: {activeDasha?.harmonyPercent}%).
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[7.8px] a4-print-grid-3">
                <div className="p-1.5 rounded bg-amber-500/20 border-2 border-amber-400 text-amber-100">
                  <strong className="text-amber-300 uppercase block">★ 1. Present Active Cycle (Harmony: {activeDasha?.harmonyPercent}%):</strong>
                  Dasha #{activeDasha?.dashaNumber} {activeDasha?.planet} ({activeDasha?.startDate} – {activeDasha?.endDate})
                  {activeDasha?.activeAntardasha ? ` • ${activeDasha.activeAntardasha}` : ''}
                </div>
                <div className="p-1.5 rounded bg-emerald-950/35 border border-emerald-500/40 text-emerald-200">
                  <strong className="text-emerald-300 uppercase block">2. Upcoming Cycles (Sequential Future):</strong>
                  {advMobile.dashaTimeline
                    .filter((d) => !d.isCurrent)
                    .map((d) => `Dasha #${d.dashaNumber} (${d.harmonyPercent}% • ${d.startDate}–${d.endDate})`)
                    .join(' • ')}
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-700 text-slate-300">
                  <strong className="text-slate-200 uppercase block">3. Past Cycles (Completed Since Birth):</strong>
                  {advMobile.pastDashaCycles && advMobile.pastDashaCycles.length > 0
                    ? advMobile.pastDashaCycles
                        .map((d) => `Dasha #${d.dashaNumber} (${d.startDate}–${d.endDate})`)
                        .join(' • ')
                    : 'Birth Cycle Currently Active'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
              {advMobile.dashaTimeline.map((md, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded-xl border text-[7.8px] space-y-0.5 ${
                    md.isCurrent
                      ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-100'
                      : 'bg-slate-950/95 border-emerald-500/30 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-amber-200 gap-1">
                    <span>
                      {md.isCurrent ? '★ 1. PRESENT ACTIVE' : `Cycle ${idx + 1}`}: Dasha #{md.dashaNumber} ({md.planet} • {md.durationYears}Y)
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono text-[7px] shrink-0 ${
                        md.isCurrent
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      Harmony {md.harmonyPercent}% • {md.startDate}–{md.endDate}
                    </span>
                  </div>
                  <p className="leading-snug">{md.paragraphs.join(' ')}</p>
                  <div className="text-[7.2px] text-amber-200/95 bg-slate-900/80 px-1.5 py-0.5 rounded border border-amber-500/25">
                    <strong className="text-amber-300">Vedic Remedy ({md.harmonyVerdict}):</strong> {md.remedy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    // PAGES 11–13: 12-Month Monthly Forecast & 7-Day Weekly Per-Day Forecast with Mantra Chants
    if (selectedSections.forecast12Months) {
      pages.push({
        title: `Page 11: 12-Month Personalized Forecast — Months 1 to 6 (${reportDateRange.startFormatted} – ${reportDateRange.endFormatted})`,
        headImg: spiritualReportBanner,
        headLabel: '12M Forecast (Part 1)',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/35 text-[9px] text-slate-200 leading-snug">
              <strong className="text-amber-300 uppercase block mb-0.5">
                First 6-Month Planetary &amp; Pranic Roadmap ({reportDateRange.startFormatted} – {reportDateRange.endFormatted}):
              </strong>
              Calculated from Mulank {m} ({mPlanet.planet}) &amp; Bhagyank {b} ({bPlanet.planet}) — includes monthly planetary harmony %, key karmic challenges, auspicious windows, and personalized Vedic remedies.
            </div>
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2 items-stretch">
              {reportDateRange.twelveMonths.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/92 border border-amber-500/30 flex flex-col justify-between gap-1 text-[8px] h-full"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1 border-b border-amber-500/20 pb-0.5">
                      <span className="font-bold text-amber-200 text-[9.5px] leading-tight">{item.monthLabel}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[7.4px] font-bold shrink-0 border ${
                          item.harmonyPercent >= 82
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                            : item.harmonyPercent >= 68
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                            : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                        }`}
                      >
                        Harmony {item.harmonyPercent}% • {item.harmonyVerdict}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 text-[7.8px]">
                      <span className="text-emerald-300 font-semibold">
                        PM #{item.personalMonthNum} • {item.rulingPlanet}
                      </span>
                      <span className="font-mono text-amber-400 shrink-0">{item.periodRange}</span>
                    </div>
                    <p className="text-slate-300 leading-snug">{item.forecastSummary}</p>
                    <div className="p-1 rounded bg-rose-950/35 border border-rose-500/30 text-rose-200 leading-tight">
                      <strong className="text-rose-300">Month Challenges:</strong> {item.challenges}
                    </div>
                    <div className="p-1 rounded bg-emerald-950/35 border border-emerald-500/30 text-emerald-200 leading-tight">
                      <strong className="text-emerald-300">Monthly Remedy:</strong> {item.remedy}
                    </div>
                  </div>
                  <div className="pt-0.5 border-t border-slate-800 flex items-center justify-between gap-1 text-[7.3px] text-sky-300 font-mono">
                    <span>{item.moonPhaseDates}</span>
                    <span className="text-amber-300">Lucky: {item.luckyDays}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 rounded-xl bg-emerald-950/25 border border-emerald-500/35 text-[8.5px] text-emerald-200 leading-snug">
              <strong>Shukla Purnima &amp; Monthly Sankalpa Remedy (Months 1–6):</strong> On every Purnima window listed above, light a cow-ghee lamp in the North-East corner at sunset, chant <strong className="text-amber-200">"{mPlanet.beejMantra}"</strong> 108 times, and offer white sweets or grain charity.
            </div>
          </div>
        ),
      });

      pages.push({
        title: `Page 12: 12-Month Personalized Forecast — Months 7 to 12 (${reportDateRange.startFormatted} – ${reportDateRange.endFormatted})`,
        headImg: spiritualReportBanner,
        headLabel: '12M Forecast (Part 2)',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/35 text-[9px] text-slate-200 leading-snug">
              <strong className="text-amber-300 uppercase block mb-0.5">
                Second 6-Month Planetary &amp; Pranic Roadmap — Consolidation, Harmony &amp; Remedies:
              </strong>
              During Months 7 to 12, monitor each month&apos;s harmony %, watch for the highlighted planetary challenges, and apply the prescribed monthly Vedic remedy to protect asset growth and family peace.
            </div>
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2 items-stretch">
              {reportDateRange.twelveMonths.slice(6, 12).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/92 border border-amber-500/30 flex flex-col justify-between gap-1 text-[8px] h-full"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1 border-b border-amber-500/20 pb-0.5">
                      <span className="font-bold text-amber-200 text-[9.5px] leading-tight">{item.monthLabel}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[7.4px] font-bold shrink-0 border ${
                          item.harmonyPercent >= 82
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                            : item.harmonyPercent >= 68
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                            : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                        }`}
                      >
                        Harmony {item.harmonyPercent}% • {item.harmonyVerdict}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 text-[7.8px]">
                      <span className="text-emerald-300 font-semibold">
                        PM #{item.personalMonthNum} • {item.rulingPlanet}
                      </span>
                      <span className="font-mono text-amber-400 shrink-0">{item.periodRange}</span>
                    </div>
                    <p className="text-slate-300 leading-snug">{item.forecastSummary}</p>
                    <div className="p-1 rounded bg-rose-950/35 border border-rose-500/30 text-rose-200 leading-tight">
                      <strong className="text-rose-300">Month Challenges:</strong> {item.challenges}
                    </div>
                    <div className="p-1 rounded bg-emerald-950/35 border border-emerald-500/30 text-emerald-200 leading-tight">
                      <strong className="text-emerald-300">Monthly Remedy:</strong> {item.remedy}
                    </div>
                  </div>
                  <div className="pt-0.5 border-t border-slate-800 flex items-center justify-between gap-1 text-[7.3px] text-sky-300 font-mono">
                    <span>{item.moonPhaseDates}</span>
                    <span className="text-amber-300">Lucky: {item.luckyDays}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/35 text-[8.5px] text-amber-100 leading-snug">
              <strong>Annual Wealth &amp; Protection Siddha Protocol (Months 7–12):</strong> Keep an energized Bhojpatra or copper <strong className="text-emerald-300">{bPlanet.planet} Yantra</strong> in your locker/wallet and recite <strong className="text-amber-200">"{bPlanet.beejMantra}"</strong> + <strong className="text-emerald-300">"{mPlanet.beejMantra}"</strong> (108x) daily before starting work.
            </div>
          </div>
        ),
      });

      pages.push({
        title: `Page 13: 7-Day Weekly Per-Day Forecast (Career, Love & Vitality) with Vedic Mantra Chants`,
        headImg: spiritualReportBanner,
        headLabel: '7-Day Weekly Forecast',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-[9.5px] text-amber-100">
              <strong>7-Day Per-Day Planetary Rhythm ({reportDateRange.startFormatted} – {reportDateRange.endFormatted}):</strong> Complete Career/Wealth, Love/Family, and Health/Vitality guidance with auspicious Muhurat windows and Vedic Planetary Beej Mantras for every day of the week.
            </div>
            <div className="space-y-1.5">
              {[
                {
                  day: 'Sunday (Ravivar — Surya / Sun • Color: Ruby Gold)',
                  window: 'Shubh: 08:15 AM – 12:15 PM | Avoid Rahu: 04:30 PM – 06:00 PM',
                  career: 'Peak day for government approvals, executive authority decisions & leadership pitches.',
                  love: 'Honour father/elders; avoid ego clashes in domestic discussions.',
                  vitality: 'Solar plexus & heart vitality; practice 15 mins morning sunlight pranayama.',
                  mantra: 'Om Hram Hreem Hroum Sah Suryaya Namah (108x) • Offer Surya Arghya at Sunrise',
                },
                {
                  day: 'Monday (Somvar — Chandra / Moon • Color: Pearl White)',
                  window: 'Shubh: 09:00 AM – 11:45 AM | Avoid Rahu: 07:30 AM – 09:00 AM',
                  career: 'Auspicious for liquid cash flow, public relations, hospitality & creative planning.',
                  love: 'Deep emotional bonding, maternal blessings & domestic tranquility.',
                  vitality: 'Hydration & mental calm; drink water from a silver vessel.',
                  mantra: 'Om Shram Shreem Shroum Sah Chandraya Namah (108x) • Shiva Jalabhishek',
                },
                {
                  day: 'Tuesday (Mangalvar — Mangal / Mars • Color: Coral Red)',
                  window: 'Shubh: 10:30 AM – 01:30 PM | Avoid Rahu: 03:00 PM – 04:30 PM',
                  career: 'Ideal for land/property inspection, engineering, debt recovery & bold execution.',
                  love: 'Channel passion constructively; avoid impulsive speech with spouse.',
                  vitality: 'High muscular stamina & blood circulation; avoid spicy food at night.',
                  mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah (108x) • Recite Hanuman Chalisa',
                },
                {
                  day: 'Wednesday (Budhvar — Budh / Mercury • Color: Emerald Green)',
                  window: 'Shubh: 09:15 AM – 12:00 PM | Avoid Rahu: 12:00 PM – 01:30 PM',
                  career: 'Best day for commercial contracts, banking, accounting, IT/software & trade.',
                  love: 'Clear, joyful communication & resolving misunderstandings.',
                  vitality: 'Nervous system & throat chakra balance; walk barefoot on green grass.',
                  mantra: 'Om Bram Breem Broum Sah Budhaya Namah (108x) • Offer Durva to Lord Ganesha',
                },
                {
                  day: 'Thursday (Guruvar — Brihaspati / Jupiter • Color: Saffron Yellow)',
                  window: 'Shubh: 07:30 AM – 11:30 AM | Avoid Rahu: 01:30 PM – 03:00 PM',
                  career: 'Supreme Siddha day for gold/wealth investments, education, advisory & expansion.',
                  love: 'Auspicious for marriage talks, family rituals & mentor blessings.',
                  vitality: 'Liver & metabolic harmony; apply Kesar/Haldi tilak on forehead.',
                  mantra: 'Om Gram Greem Groum Sah Gurave Namah (108x) • Chana Dal & Yellow Cloth Daan',
                },
                {
                  day: 'Friday (Shukravar — Shukra / Venus • Color: Diamond White/Pink)',
                  window: 'Shubh: 08:30 AM – 10:30 AM | Avoid Rahu: 10:30 AM – 12:00 PM',
                  career: 'Favorable for vehicle purchase, jewelry, fashion, media & luxury commerce.',
                  love: 'Peak romantic harmony, spouse gifts & relationship healing.',
                  vitality: 'Reproductive & hormonal balance; use natural rose/sandalwood attar.',
                  mantra: 'Om Dram Dreem Droum Sah Shukraya Namah (108x) • Recite Sri Suktam at Sandhya',
                },
                {
                  day: 'Saturday (Shanivar — Shani / Saturn • Color: Royal Navy Blue)',
                  window: 'Shubh: 11:30 AM – 02:30 PM | Avoid Rahu: 09:00 AM – 10:30 AM',
                  career: 'Dedicated to machinery, long-term real estate, audits, staff welfare & discipline.',
                  love: 'Practice patience, loyalty & karmic forgiveness within the family.',
                  vitality: 'Joint, bone & grounding care; light sesame oil lamp under Peepal tree.',
                  mantra: 'Om Pram Preem Proum Sah Shanaischaraya Namah (108x) • Til Oil Deepdaan at Sunset',
                },
              ].map((d, idx) => (
                <div key={idx} className="p-1.5 rounded-lg bg-slate-950/95 border border-amber-500/25 text-[8.5px]">
                  <div className="flex items-center justify-between font-bold text-amber-200">
                    <span>{d.day}</span>
                    <span className="font-mono text-emerald-300 text-[8px]">{d.window}</span>
                  </div>
                  <div className="text-slate-200 mt-0.5">
                    <strong>Career:</strong> {d.career} | <strong>Love:</strong> {d.love} | <strong>Vitality:</strong> {d.vitality}
                  </div>
                  <div className="text-amber-300 font-mono text-[8px] mt-0.5">🕉️ {d.mantra}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    // PAGES 14–15: Audited Life Path Calendar — Best Upcoming Muhurat Timings in Next 12 Months (with Nakshatra Yoga, Rahu Kaal & Choghadiya)
    if (selectedSections.auditedCalendar12Months) {
      pages.push({
        title: `Page 14: Best Upcoming Muhurat Timings in Next 12 Months (Part 1: Events 1–6 • ${reportDateRange.startFormatted} – ${reportDateRange.endFormatted})`,
        headImg: planetaryTransitsArt,
        headLabel: '12M Muhurats (Part 1)',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-emerald-950/35 border border-emerald-500/40 text-[9px] text-emerald-100 leading-snug">
              <strong>Vedic Astrology 12-Month Event Muhurat Calendar (Part 1 — Events 1 to 6):</strong> Calculated from <strong>{reportDateRange.startFormatted}</strong> through <strong>{reportDateRange.endFormatted}</strong> for {activeProfile.name}'s Janma Rashi (<strong>{astro.rashi}</strong>), Nakshatra (<strong>{astro.nakshatra}</strong>), Mulank {m}, and Bhagyank {b}.
            </div>

            <div className="overflow-hidden rounded-xl border border-amber-500/40 bg-slate-950/95">
              <table className="w-full table-fixed border-collapse text-left text-[8px]">
                <thead>
                  <tr className="bg-amber-950/70 text-amber-200 border-b border-amber-500/40">
                    <th className="w-[20%] py-1.5 px-1.5 font-bold">Life Event &amp; Category</th>
                    <th className="w-[25%] py-1.5 px-1.5 font-bold">Best Date, Window, Choghadiya &amp; Avoid Rahu</th>
                    <th className="w-[29%] py-1.5 px-1.5 font-bold">Nakshatra Yoga &amp; Astrological Reason</th>
                    <th className="w-[26%] py-1.5 px-1.5 font-bold">Backup Dates &amp; Pre-Event Mantra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {bestEvents12M.events12M.slice(0, 6).map((ev, idx) => (
                    <tr key={ev.id} className="align-top">
                      <td className="py-1.5 px-1.5 font-bold text-amber-200 break-words">
                        <div>{idx + 1}. {ev.title}</div>
                        <div className="text-[7.5px] text-slate-400 font-normal">{ev.category}</div>
                      </td>
                      <td className="py-1.5 px-1.5 font-mono break-words space-y-0.5">
                        <div className="text-emerald-300 font-bold">{ev.bestUpcomingDate}</div>
                        <div className="text-sky-300 text-[7.5px]">{ev.bestTimeWindow}</div>
                        <div className="text-amber-200 text-[7.5px]">{ev.choghadiyaAndHora}</div>
                        <div className="text-rose-300 text-[7.5px]">Avoid Rahu: {ev.rahuKaalToAvoid}</div>
                      </td>
                      <td className="py-1.5 px-1.5 text-slate-200 leading-snug break-words">
                        <div className="text-amber-300 font-semibold text-[7.5px] mb-0.5">{ev.nakshatraYoga}</div>
                        {ev.vedicAstrologyReason}
                      </td>
                      <td className="py-1.5 px-1.5 break-words">
                        <div className="text-amber-300 font-mono text-[7.5px]">
                          <strong>Alt:</strong> {ev.secondaryUpcomingDates.join(' • ')}
                        </div>
                        <div className="text-emerald-200 text-[7.5px] mt-0.5 leading-snug">
                          <strong>Mantra:</strong> {ev.mantraAndDhikrBeforeEvent}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ),
      });

      pages.push({
        title: `Page 15: Best Upcoming Muhurat Timings in Next 12 Months (Part 2: Events 7–12 • ${reportDateRange.startFormatted} – ${reportDateRange.endFormatted})`,
        headImg: planetaryTransitsArt,
        headLabel: '12M Muhurats (Part 2)',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-emerald-950/35 border border-emerald-500/40 text-[9px] text-emerald-100 leading-snug">
              <strong>Vedic Astrology 12-Month Event Muhurat Calendar (Part 2 — Events 7 to 12):</strong> Complete remaining 6 auspicious event windows with Nakshatra Yoga, Choghadiya, and Rahu Kaal precautions for {activeProfile.name}.
            </div>

            <div className="overflow-hidden rounded-xl border border-amber-500/40 bg-slate-950/95">
              <table className="w-full table-fixed border-collapse text-left text-[8px]">
                <thead>
                  <tr className="bg-amber-950/70 text-amber-200 border-b border-amber-500/40">
                    <th className="w-[20%] py-1.5 px-1.5 font-bold">Life Event &amp; Category</th>
                    <th className="w-[25%] py-1.5 px-1.5 font-bold">Best Date, Window, Choghadiya &amp; Avoid Rahu</th>
                    <th className="w-[29%] py-1.5 px-1.5 font-bold">Nakshatra Yoga &amp; Astrological Reason</th>
                    <th className="w-[26%] py-1.5 px-1.5 font-bold">Backup Dates &amp; Pre-Event Mantra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {bestEvents12M.events12M.slice(6, 12).map((ev, idx) => (
                    <tr key={ev.id} className="align-top">
                      <td className="py-1.5 px-1.5 font-bold text-amber-200 break-words">
                        <div>{idx + 7}. {ev.title}</div>
                        <div className="text-[7.5px] text-slate-400 font-normal">{ev.category}</div>
                      </td>
                      <td className="py-1.5 px-1.5 font-mono break-words space-y-0.5">
                        <div className="text-emerald-300 font-bold">{ev.bestUpcomingDate}</div>
                        <div className="text-sky-300 text-[7.5px]">{ev.bestTimeWindow}</div>
                        <div className="text-amber-200 text-[7.5px]">{ev.choghadiyaAndHora}</div>
                        <div className="text-rose-300 text-[7.5px]">Avoid Rahu: {ev.rahuKaalToAvoid}</div>
                      </td>
                      <td className="py-1.5 px-1.5 text-slate-200 leading-snug break-words">
                        <div className="text-amber-300 font-semibold text-[7.5px] mb-0.5">{ev.nakshatraYoga}</div>
                        {ev.vedicAstrologyReason}
                      </td>
                      <td className="py-1.5 px-1.5 break-words">
                        <div className="text-amber-300 font-mono text-[7.5px]">
                          <strong>Alt:</strong> {ev.secondaryUpcomingDates.join(' • ')}
                        </div>
                        <div className="text-emerald-200 text-[7.5px] mt-0.5 leading-snug">
                          <strong>Mantra:</strong> {ev.mantraAndDhikrBeforeEvent}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ),
      });
    }

    // PAGES 16–17: All 5 Planetary Transits & Complete 12-Month Shukla Purnima / Krishna Amavasya / Ekadashi
    if (selectedSections.transitsAndMoon12Months) {
      pages.push({
        title: `Page 16: All 5 Planetary Transits & Complete 12-Month Purnima / Amavasya / Ekadashi (Part 1: Months 1–6)`,
        headImg: planetaryTransitsArt,
        headLabel: 'Gochar & Lunar (Months 1–6)',
        content: (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-indigo-500/40 space-y-1">
              <h4 className="font-serif text-[10.5px] font-bold text-amber-200 uppercase">
                1. All 5 Major Planetary Transits (Navagraha Gochar) for {astro.rashi} ({astro.nakshatra})
              </h4>
              <div className="grid grid-cols-3 gap-1.5 a4-print-grid-3">
                {CELESTIAL_TRANSITS.map((tr, idx) => (
                  <div key={idx} className="p-1.5 rounded-lg bg-slate-950 border border-indigo-500/30 text-[8px]">
                    <div className="flex items-center justify-between font-bold text-amber-200">
                      <span>{tr.planet} in {tr.sign}</span>
                      <span className="font-mono text-sky-300">{tr.impactLevel}</span>
                    </div>
                    <div className="text-[7.5px] font-mono text-slate-400">{tr.startDate} ➔ {tr.endDate}</div>
                    <p className="text-slate-300 leading-tight mt-0.5">{tr.summary}</p>
                    <div className="text-emerald-300 font-semibold mt-0.5">Remedy: {tr.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-amber-500/40 bg-slate-950/95">
              <div className="flex items-center justify-between bg-amber-950/60 px-2.5 py-1 border-b border-amber-500/35">
                <h4 className="font-serif text-[10px] font-bold text-amber-200 uppercase">
                  2. Complete 12-Month Shukla Purnima / Krishna Amavasya / Ekadashi &amp; Parallel Astro Remedies (Months 1–6)
                </h4>
                <span className="text-[8px] font-mono text-emerald-300 font-bold">
                  {reportDateRange.startFormatted} – {reportDateRange.endFormatted}
                </span>
              </div>
              <table className="w-full table-fixed border-collapse text-left text-[8px]">
                <thead>
                  <tr className="bg-slate-900 text-amber-300 border-b border-amber-500/30">
                    <th className="w-[16%] py-1 px-1.5 font-bold">Month &amp; Ruler</th>
                    <th className="w-[26%] py-1 px-1.5 font-bold">Purnima, Amavasya &amp; Ekadashi</th>
                    <th className="w-[29%] py-1 px-1.5 font-bold">Vedic Astrological Prediction</th>
                    <th className="w-[29%] py-1 px-1.5 font-bold">Parallel Vedic Remedy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {lunar12Months.slice(0, 6).map((mp) => (
                    <tr key={mp.monthIndex} className="align-top">
                      <td className="py-1 px-1.5 font-bold text-amber-200 break-words">
                        <div>{mp.monthLabel}</div>
                        <div className="text-[7.2px] font-mono text-sky-300">{mp.rulingPlanet}</div>
                      </td>
                      <td className="py-1 px-1.5 font-mono text-[7.5px] break-words space-y-0.5">
                        <div className="text-amber-100"><strong>Purnima:</strong> {mp.shuklaPurnima}</div>
                        <div className="text-rose-200"><strong>Amavasya:</strong> {mp.krishnaAmavasya}</div>
                        <div className="text-emerald-200"><strong>Ekadashi:</strong> {mp.shuklaEkadashi} • {mp.krishnaEkadashi}</div>
                      </td>
                      <td className="py-1 px-1.5 text-slate-200 leading-snug break-words">
                        {mp.astrologicalPrediction}
                      </td>
                      <td className="py-1 px-1.5 text-emerald-300 leading-snug break-words">
                        {mp.parallelRemedy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ),
      });

      pages.push({
        title: `Page 17: Complete 12-Month Shukla Purnima / Krishna Amavasya / Ekadashi & Parallel Astro Remedies (Part 2: Months 7–12)`,
        headImg: planetaryTransitsArt,
        headLabel: 'Lunar Phases (Months 7–12)',
        content: (
          <div className="space-y-2 text-xs">
            <div className="overflow-hidden rounded-xl border border-amber-500/40 bg-slate-950/95">
              <div className="flex items-center justify-between bg-amber-950/60 px-2.5 py-1.5 border-b border-amber-500/35">
                <h4 className="font-serif text-[10.5px] font-bold text-amber-200 uppercase">
                  Complete 12-Month Shukla Purnima / Krishna Amavasya / Ekadashi &amp; Parallel Astro Remedies (Months 7–12)
                </h4>
                <span className="text-[8.5px] font-mono text-emerald-300 font-bold">
                  {reportDateRange.startFormatted} – {reportDateRange.endFormatted}
                </span>
              </div>
              <table className="w-full table-fixed border-collapse text-left text-[8.2px]">
                <thead>
                  <tr className="bg-slate-900 text-amber-300 border-b border-amber-500/30">
                    <th className="w-[16%] py-1 px-1.5 font-bold">Month &amp; Ruler</th>
                    <th className="w-[26%] py-1 px-1.5 font-bold">Purnima, Amavasya &amp; Ekadashi</th>
                    <th className="w-[29%] py-1 px-1.5 font-bold">Vedic Astrological Prediction</th>
                    <th className="w-[29%] py-1 px-1.5 font-bold">Parallel Vedic Remedy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {lunar12Months.slice(6, 12).map((mp) => (
                    <tr key={mp.monthIndex} className="align-top">
                      <td className="py-1.5 px-1.5 font-bold text-amber-200 break-words">
                        <div>{mp.monthLabel}</div>
                        <div className="text-[7.5px] font-mono text-sky-300 mt-0.5">{mp.rulingPlanet}</div>
                      </td>
                      <td className="py-1.5 px-1.5 font-mono text-[7.8px] break-words space-y-0.5">
                        <div className="text-amber-100"><strong>Purnima:</strong> {mp.shuklaPurnima}</div>
                        <div className="text-rose-200"><strong>Amavasya:</strong> {mp.krishnaAmavasya}</div>
                        <div className="text-emerald-200"><strong>Ekadashi:</strong> {mp.shuklaEkadashi} • {mp.krishnaEkadashi}</div>
                      </td>
                      <td className="py-1.5 px-1.5 text-slate-200 leading-snug break-words">
                        {mp.astrologicalPrediction}
                      </td>
                      <td className="py-1.5 px-1.5 text-emerald-300 leading-snug break-words">
                        {mp.parallelRemedy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[8.8px] a4-print-grid-3">
              <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/35">
                <strong className="text-amber-300 block">Shukla Purnima Siddhi Vidhi:</strong>
                <span className="text-slate-200">
                  Offer raw milk &amp; Akshat Arghya to Chandra Dev at moonrise, light a cow-ghee lamp in North-East, and chant "{mPlanet.beejMantra}" 108x.
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/95 border border-rose-500/35">
                <strong className="text-rose-300 block">Krishna Amavasya Pitru Kavach:</strong>
                <span className="text-slate-200">
                  Perform Pitru Tarpan at noon, light a sesame oil lamp under a Peepal tree at sunset, and donate black sesame &amp; grains.
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/95 border border-emerald-500/35">
                <strong className="text-emerald-300 block">Ekadashi Sri Hari Sankalpa:</strong>
                <span className="text-slate-200">
                  Observe Sattvic diet on Shukla &amp; Krishna Ekadashi, offer Tulsi leaves to Lord Vishnu, and recite "Om Namo Bhagavate Vasudevaya" 108x.
                </span>
              </div>
            </div>
          </div>
        ),
      });
    }

    // PAGE 18: Daily Vedic Mantras (All 4 Time-Phase Mantras with Mala, Mudra & Meaning) & Complete 9-Planet Navagraha Table
    if (selectedSections.dailyMantras) {
      pages.push({
        title: 'Page 18: All 4 Daily Time-Phase Vedic Mantras (Mala, Mudra, Meaning) & 9-Planet Navagraha Reference',
        headImg: chakraHealingArt,
        headLabel: 'Daily Vedic Mantras',
        content: (
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
              {[
                {
                  slot: `1. Brahma Muhurat / Sunrise (05:30–07:30 AM) — Mulank ${m} (${mPlanet.planet})`,
                  sanskrit: SANSKRit_BEEJ_DEVANAGARI[m]?.devanagari || '',
                  mantra: mPlanet.beejMantra,
                  soundHz: mPlanet.soundFrequencyHz || '126.22 Hz & 528 Hz',
                  malaMudra: `108x • Rudraksha / Ruby Mala • Gyan or Surya Mudra • Face East`,
                  meaning: `Invokes ${mPlanet.deity} & ${mPlanet.planet} solar prana for health, authority, and decision clarity.`,
                },
                {
                  slot: `2. Midday Abhijit Muhurat (11:45 AM–12:35 PM) — Bhagyank ${b} (${bPlanet.planet})`,
                  sanskrit: SANSKRit_BEEJ_DEVANAGARI[b]?.devanagari || '',
                  mantra: bPlanet.beejMantra,
                  soundHz: bPlanet.soundFrequencyHz || '183.58 Hz & 852 Hz',
                  malaMudra: `27x or 108x • Sphatik / Tulsi Mala • Prana or Kubera Mudra • Face North-East`,
                  meaning: `Activates ${bPlanet.deity} & ${bPlanet.planet} destiny grace for commercial wealth and career breakthroughs.`,
                },
                {
                  slot: `3. Evening Sandhya Kaal (06:00–07:30 PM) — Active ${activeDasha.planet} Maha Dasha & Rashi (${astro.rashi})`,
                  sanskrit: SANSKRit_BEEJ_DEVANAGARI[activeDasha.dashaNumber]?.devanagari || '',
                  mantra: `${activeDashaPlanet.beejMantra} • ${rashiLordPlanet.beejMantra}`,
                  soundHz: activeDashaPlanet.soundFrequencyHz || '221.23 Hz & 639 Hz',
                  malaMudra: `108x • Chandan / Rudraksha Mala • Dhyana Mudra • Face North`,
                  meaning: `Harmonizes your active ${activeDasha.planet} Maha Dasha (${activeDasha.startDate}–${activeDasha.endDate}) and Janma Rashi (${astro.rashi}).`,
                },
                {
                  slot: `4. Night Shayan Kaal (09:30–10:30 PM) — Navagraha & Rahu Kaal Protection Kavach`,
                  sanskrit: `ॐ ब्रह्मा मुरारिस्त्रिपुरांतकारी भानुः शशी भूमिसुतो बुधश्च ।`,
                  mantra: `${panchang.todayBeejMantra} • Om Namo Bhagavate Vasudevaya`,
                  soundHz: `432 Hz Cosmic Tuning & 528 Hz Pranic Shield`,
                  malaMudra: `27x • Rudraksha Mala • Apana Mudra • Before Sleep`,
                  meaning: `Clears subconscious psychic fatigue, shields all 9 Chakras from Rahu Kaal (${panchang.rahuKaalWindow.start}–${panchang.rahuKaalWindow.end}) & Gochar friction.`,
                },
              ].map((mCard, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950 border border-amber-500/35 text-[8.3px] flex flex-col justify-between gap-1 h-full text-left"
                >
                  <div className="space-y-1">
                    <div className="text-[8.3px] uppercase text-amber-300 font-bold leading-snug border-b border-amber-500/25 pb-1">
                      {mCard.slot}
                    </div>
                    <div className="text-amber-100 font-serif text-[9.5px] leading-snug">{mCard.sanskrit}</div>
                    <div className="font-serif font-bold text-emerald-300 text-[9.2px] leading-snug">{mCard.mantra}</div>
                    <div className="text-sky-300 font-mono text-[7.8px] leading-snug">{mCard.malaMudra}</div>
                    <p className="text-slate-300 leading-snug">{mCard.meaning}</p>
                  </div>
                  <div className="mt-auto pt-1 border-t border-purple-500/30 flex items-center justify-between gap-1.5">
                    <span className="text-[7.2px] uppercase tracking-wider text-purple-300 font-bold">
                      Sound Frequency (Hz)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/50 text-purple-100 font-mono text-[7.5px] font-bold">
                      🔊 {mCard.soundHz}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/35 space-y-1">
              <h4 className="font-serif text-[10.5px] font-bold text-amber-200">
                Complete 9-Planet (Navagraha) Vedic Beej Mantra, Sound Frequency (Hz), Deity, Gemstone &amp; Lucky Day Table
              </h4>
              <div className="grid grid-cols-3 gap-1.5 a4-print-grid-3 items-stretch">
                {Object.values(PLANETARY_PROFILES).map((p) => (
                  <div
                    key={p.number}
                    className="p-1.5 rounded-lg bg-slate-950 border border-amber-500/25 text-[7.9px] flex flex-col justify-between gap-1 h-full"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-amber-200 leading-snug">
                        #{p.number} {p.planet} ({p.sanskritName}) • {p.deity}
                      </div>
                      <div className="text-emerald-300 font-serif leading-snug">{p.beejMantra}</div>
                      <div className="text-slate-300 leading-snug">
                        Stone: {p.gemstone} • Days: {p.luckyDays.join(', ')} • Color: {p.luckyColor}
                      </div>
                    </div>
                    <div className="mt-auto pt-0.5 border-t border-purple-500/25 text-purple-200 font-mono text-[7.3px] font-semibold">
                      🔊 {p.soundFrequencyHz || '432 Hz'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      });
    }

    // PAGES: Vedic Yoga, Pranayama, Visual Posture Diagrams & 7-Day Weekly Planner
    if (selectedSections.yogaAndPranayama) {
      const galleryAsanas = yogaPlan.dailyAsanas.slice(0, 6);
      pages.push({
        title: `Page 18A: Vedic Yoga & Pranayama Blueprint — Visual Posture Gallery, Breathing & Health Remedies`,
        headImg: chakraHealingArt,
        headLabel: 'Yoga & Pranayama',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="p-1.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-[8.3px] text-slate-200 space-y-0.5">
              <div className="flex items-center justify-between gap-2 font-bold text-amber-200">
                <span>
                  Vedic Chikitsa-Jyotish Yoga &amp; Pranayama Blueprint for {activeProfile.name}
                </span>
                <span className="font-mono text-emerald-300 shrink-0">
                  {yogaPlan.primaryChakra} • {yogaPlan.secondaryChakra}
                </span>
              </div>
              <p className="leading-snug text-slate-300">{yogaPlan.dominantDoshaConstitution}</p>
              <div className="text-amber-300 font-mono text-[7.6px]">
                <strong>Selected Health Focus:</strong>{' '}
                {yogaPlan.selectedHealthConcerns.length > 0
                  ? yogaPlan.selectedHealthConcerns.map((hc) => hc.label).join(' • ')
                  : 'General Pranic Vitality & 9-Chakra Harmony'}
              </div>
            </div>

            <div className="space-y-1">
              <h5 className="font-serif text-[9.5px] font-bold text-amber-200 uppercase">
                1. Visual Yoga Posture Card Gallery (Birth Chart &amp; Selected Health Prescriptions — All {galleryAsanas.length} Asanas)
              </h5>
              <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2 items-stretch">
                {galleryAsanas.map((asana, idx) => (
                  <div
                    key={asana.id}
                    className="p-1.5 rounded-xl bg-slate-950/95 border border-amber-500/30 text-[7.5px] flex gap-2 items-start h-full"
                  >
                    <YogaPostureIllustration
                      diagramType={asana.diagramType}
                      chakraColor={asana.chakraColor}
                      className="w-14 h-14 shrink-0"
                    />
                    <div className="space-y-0.5 min-w-0 flex-1 text-left">
                      <div className="font-bold text-amber-200 leading-tight">
                        {idx + 1}. {asana.sanskritName} ({asana.englishName})
                      </div>
                      <div className="text-emerald-300 font-mono text-[7.1px]">
                        {asana.durationOrReps} • {asana.targetChakra}
                      </div>
                      <div className="text-sky-200 leading-tight">{asana.astrologicalReason}</div>
                      <div className="text-slate-300 leading-tight">
                        <strong>Steps:</strong> {asana.stepByStepAlignment.slice(0, 2).join(' ')}
                      </div>
                      <div className="text-amber-200 leading-tight">
                        <strong>Benefits:</strong> {asana.therapeuticBenefits.join(' • ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <h5 className="font-serif text-[10px] font-bold text-emerald-300 uppercase">
                2. Prescribed Daily Pranayama Breathing &amp; Hasta Mudra Protocols
              </h5>
              <div className="grid grid-cols-3 gap-1.5 a4-print-grid-3">
                {yogaPlan.dailyPranayamas.map((prana, idx) => (
                  <div
                    key={prana.id}
                    className="p-1.5 rounded-xl bg-slate-950/95 border border-emerald-500/30 text-[8px] space-y-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <PranayamaIllustration
                        diagramType={prana.diagramType}
                        className="w-10 h-10 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-amber-200">
                          {idx + 1}. {prana.sanskritName}
                        </div>
                        <div className="text-[7.5px] text-emerald-300 font-mono">
                          {prana.roundsAndDuration}
                        </div>
                      </div>
                    </div>
                    <div className="text-sky-200 font-mono text-[7.5px]">
                      Ratio: {prana.breathingRatio} • {prana.mudraAndBandha}
                    </div>
                    <p className="text-slate-300 leading-tight">{prana.stepByStepTechnique.join(' ')}</p>
                    <div className="text-amber-300 font-mono text-[7.5px]">
                      Mantra: {prana.beejMantra}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      });

      pages.push({
        title: `Page 18B: 7-Day Weekly Vedic Yoga & Pranayama Planner (Vara-Jyotish Schedule) & Dietary Sadhana`,
        headImg: chakraHealingArt,
        headLabel: '7-Day Yoga Planner',
        content: (
          <div className="space-y-2 text-xs">
            <div className="overflow-hidden rounded-xl border border-amber-500/40 bg-slate-950/95">
              <div className="flex items-center justify-between bg-amber-950/60 px-2.5 py-1 border-b border-amber-500/35">
                <h4 className="font-serif text-[10px] font-bold text-amber-200 uppercase">
                  7-Day Weekly Yoga &amp; Pranayama Schedule (Tailored to Mulank {m}, Bhagyank {b} &amp; {astro.rashi})
                </h4>
                <span className="text-[8px] font-mono text-emerald-300 font-bold">
                  Daily Practice Tracker
                </span>
              </div>
              <table className="w-full table-fixed border-collapse text-left text-[8px]">
                <thead>
                  <tr className="bg-slate-900 text-amber-300 border-b border-amber-500/30">
                    <th className="w-[18%] py-1 px-1.5 font-bold">Day &amp; Planet</th>
                    <th className="w-[26%] py-1 px-1.5 font-bold">Morning Yoga Asanas</th>
                    <th className="w-[26%] py-1 px-1.5 font-bold">Pranayama &amp; Mudra</th>
                    <th className="w-[30%] py-1 px-1.5 font-bold">Focus Area, Mantra &amp; Synergy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {yogaPlan.weeklyPlanner.map((dayItem, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1.5 px-1.5 font-bold text-amber-200 break-words">
                        <div>☐ {dayItem.dayName}</div>
                        <div className="text-[7.2px] text-sky-300 font-mono">{dayItem.hindiDay} • {dayItem.rulingPlanet}</div>
                      </td>
                      <td className="py-1.5 px-1.5 break-words">
                        {dayItem.morningAsanas.map((ma, mIdx) => (
                          <div key={mIdx} className="text-emerald-300 font-semibold">
                            • {ma.sanskritName} ({ma.duration})
                          </div>
                        ))}
                      </td>
                      <td className="py-1.5 px-1.5 break-words">
                        <div className="font-bold text-amber-100">{dayItem.pranayamaPractice.name} ({dayItem.pranayamaPractice.rounds})</div>
                        <div className="text-[7.2px] text-sky-300">{dayItem.mudraAndMantra.mudra}</div>
                      </td>
                      <td className="py-1.5 px-1.5 break-words space-y-0.5">
                        <div className="text-slate-200">{dayItem.themeTitle} — {dayItem.personalChartSynergy}</div>
                        <div className="text-amber-300 font-mono text-[7.2px]">{dayItem.mudraAndMantra.mantra}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-2 rounded-xl bg-emerald-950/25 border border-emerald-500/35 text-[8.8px] text-slate-200 space-y-1">
              <strong className="text-emerald-300 uppercase block">
                Ayurvedic Dinacharya, Pranic Hydration &amp; Yoga Sadhana Rules for {activeProfile.name}:
              </strong>
              <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
                {yogaPlan.ayurvedicAharaTips.map((tip, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-950/90 border border-emerald-500/25 text-[8.2px]">
                    ✓ {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      });
    }

    // PAGES 19–21: Complete Partner Milan (Groom & Bride Natal Table + Visual Ashtakoot Guna Milan Chart Box + All 8 Koota Details 1-8 + All 9 Chakras Full Diagnostics & Remedies)
    if (selectedSections.partnerMilanChakras) {
      // PAGE 19: Groom & Bride Complete Natal Details + Visual Ashtakoot Guna Milan Chart Box + Marital Name Harmonizer
      pages.push({
        title: `Page 19: Partner Milan — Groom (${groomProfile.name}) & Bride (${brideProfile.name}) Details & Ashtakoot Guna Milan Chart`,
        headImg: chakraHealingArt,
        headLabel: 'Ashtakoot Milan Chart',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/40">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-serif text-[10.5px] font-bold text-amber-200 uppercase">
                  1. Groom ({groomProfile.name}) &amp; Bride ({brideProfile.name}) Complete Birth &amp; Astrological Details
                </h4>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-[9.5px]">
                  Total Ashtakoot Score: {partnerMilan.totalPoints}/36 Gunas ({partnerMilan.overallPercentage}%) • {partnerMilan.verdict}
                </span>
              </div>
              <table className="w-full table-fixed text-left border-collapse text-[8.2px]">
                <thead>
                  <tr className="bg-amber-950/60 text-amber-200 border-b border-amber-500/30">
                    <th className="w-[22%] py-1 px-1.5 font-bold">Parameter</th>
                    <th className="w-[39%] py-1 px-1.5 font-bold text-amber-300">Groom (Male): {groomProfile.name}</th>
                    <th className="w-[39%] py-1 px-1.5 font-bold text-rose-300">Bride (Female): {brideProfile.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/90 text-slate-200">
                  <tr>
                    <td className="py-0.5 px-1.5 font-semibold text-amber-400">Name &amp; Namank</td>
                    <td className="py-0.5 px-1.5 font-mono">{groomProfile.name} (Comp {groomNameAnalysis.totalChaldeanCompound} ➔ Root {groomNameAnalysis.chaldeanSingle})</td>
                    <td className="py-0.5 px-1.5 font-mono">{brideProfile.name} (Comp {brideNameAnalysis.totalChaldeanCompound} ➔ Root {brideNameAnalysis.chaldeanSingle})</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-1.5 font-semibold text-amber-400">DOB, Time &amp; Place</td>
                    <td className="py-0.5 px-1.5 font-mono">{groomProfile.dob} • {formatTime12HourAmPm(groomProfile.tob)} • {groomProfile.pob}</td>
                    <td className="py-0.5 px-1.5 font-mono">{brideProfile.dob} • {formatTime12HourAmPm(brideProfile.tob)} • {brideProfile.pob}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-1.5 font-semibold text-amber-400">Mulank &amp; Bhagyank</td>
                    <td className="py-0.5 px-1.5">Mulank {partnerMilan.p1Mulank} ({groomMulankPlanet.planet}) • Bhagyank {partnerMilan.p1Bhagyank} ({groomBhagyankPlanet.planet})</td>
                    <td className="py-0.5 px-1.5">Mulank {partnerMilan.p2Mulank} ({brideMulankPlanet.planet}) • Bhagyank {partnerMilan.p2Bhagyank} ({brideBhagyankPlanet.planet})</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 px-1.5 font-semibold text-amber-400">Rashi, Sun &amp; Nakshatra</td>
                    <td className="py-0.5 px-1.5 text-emerald-300">{partnerMilan.p1Astrology.rashi} (Sun: {partnerMilan.p1Astrology.sunSign}) • {partnerMilan.p1Astrology.nakshatra} (Pada {partnerMilan.p1Astrology.pada})</td>
                    <td className="py-0.5 px-1.5 text-emerald-300">{partnerMilan.p2Astrology.rashi} (Sun: {partnerMilan.p2Astrology.sunSign}) • {partnerMilan.p2Astrology.nakshatra} (Pada {partnerMilan.p2Astrology.pada})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Exact 7-Column Ashtakoot Guna Milan Summary Box */}
            <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/40">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-serif text-[10.5px] font-bold text-amber-200 uppercase">
                  2. Ashtakoot Koota (Dimension) + Marital Domain + Max Gunas + Obtained Gunas + Visual Guna Milan Chart + Verdict
                </h4>
                <span className="text-[8px] font-mono text-amber-300">
                  18+ Gunas = Auspicious • 24+ = Very Good • 28+ = Uttam Milan
                </span>
              </div>
              <table className="w-full table-fixed text-left border-collapse text-[8px]">
                <thead>
                  <tr className="bg-amber-950/70 text-amber-200 border-b border-amber-500/30">
                    <th className="w-[5%] py-1 px-1 font-bold text-center">#</th>
                    <th className="w-[22%] py-1 px-1.5 font-bold">Ashtakoot Koota (Dimension)</th>
                    <th className="w-[22%] py-1 px-1.5 font-bold">Marital Domain</th>
                    <th className="w-[9%] py-1 px-1 font-bold text-center">Max Gunas</th>
                    <th className="w-[11%] py-1 px-1 font-bold text-center">Obtained Gunas</th>
                    <th className="w-[18%] py-1 px-1.5 font-bold">Visual Guna Milan Chart</th>
                    <th className="w-[13%] py-1 px-1 font-bold text-center">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/90 text-slate-200">
                  {partnerMilan.dimensions.map((dim, idx) => {
                    const pct = Math.round((dim.obtainedPoints / Math.max(1, dim.maxPoints)) * 100);
                    return (
                      <tr key={idx}>
                        <td className="py-1 px-1 text-center font-mono font-bold text-amber-400">{idx + 1}</td>
                        <td className="py-1 px-1.5 font-bold text-amber-100">
                          {dim.name} <span className="text-amber-300/80 font-normal">({dim.sanskritName})</span>
                        </td>
                        <td className="py-1 px-1.5 text-slate-300">{dim.description}</td>
                        <td className="py-1 px-1 text-center font-mono text-slate-300">{dim.maxPoints}</td>
                        <td className="py-1 px-1 text-center font-mono font-extrabold text-amber-300">{dim.obtainedPoints}</td>
                        <td className="py-1 px-1.5">
                          <div className="flex items-center gap-1">
                            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 75
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                    : pct >= 50
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                    : 'bg-gradient-to-r from-rose-500 to-orange-400'
                                }`}
                                style={{ width: `${Math.max(8, pct)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[7.5px] text-amber-200 w-7 text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-1 px-1 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[7px] font-bold uppercase ${
                              dim.verdict === 'Excellent'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : dim.verdict === 'Good'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {dim.verdict}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-950/60 border-t-2 border-amber-500/40 font-bold text-amber-100">
                    <td colSpan={3} className="py-1 px-1.5 uppercase text-amber-200">
                      Total Ashtakoot Guna Milan Score ({groomProfile.name} &amp; {brideProfile.name})
                    </td>
                    <td className="py-1 px-1 text-center font-mono">36</td>
                    <td className="py-1 px-1 text-center font-mono text-emerald-300 text-[9.5px]">{partnerMilan.totalPoints}</td>
                    <td className="py-1 px-1.5">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-2.5 rounded-full bg-slate-800 overflow-hidden border border-amber-500/40">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 rounded-full"
                            style={{ width: `${Math.max(10, partnerMilan.overallPercentage)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[8px] text-amber-200 w-7 text-right">{partnerMilan.overallPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-1 px-1 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/25 border border-amber-400/50 text-amber-200 text-[7px] uppercase">
                        {partnerMilan.totalPoints >= 18 ? 'Shubh Milan' : 'Remedy Req.'}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 9-Chakra Harmony Overall Score & Chakras Needing Remedies Box (Directly below Ashtakoot Score) */}
            {(() => {
              const pInsights = buildPartnerMilanHarmonyInsights(
                partnerMilan,
                groomProfile.name,
                brideProfile.name
              );
              return (
                <div className="p-2 rounded-xl bg-purple-950/35 border border-purple-400/50 flex items-center justify-between gap-2 text-[8.2px]">
                  <div>
                    <strong className="text-purple-200 uppercase block text-[8.5px]">
                      9-Chakra Harmony Overall Score ({groomProfile.name} &amp; {brideProfile.name})
                    </strong>
                    <span className="text-slate-200">
                      {pInsights.chakrasNeedingRemediesCount > 0
                        ? `Chakras Needing Remedies (${pInsights.chakrasNeedingRemediesCount} / 9): ${pInsights.chakrasNeedingRemediesNames.join(', ')}`
                        : 'All 9 Chakras are naturally balanced and harmonious.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-1 rounded-lg bg-slate-950 border border-purple-400/50 text-amber-200 font-mono font-black text-[9.5px]">
                      {pInsights.overallNineChakraScore}% Harmony
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-400/50 text-rose-200 font-mono font-bold text-[8.5px]">
                      {pInsights.chakrasNeedingRemediesCount} / 9 Chakras Need Remedies
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Width-Wise 3-Column Marital Name Vibration Harmonizer */}
            <div className="grid grid-cols-3 gap-1.5 text-[8px] a4-print-grid-3">
              {partnerMilan.perfectNameSuggestions.slice(0, 2).map((item, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded-xl bg-slate-950/95 border text-slate-200 ${
                    idx === 0 ? 'border-amber-500/30' : 'border-rose-500/30'
                  }`}
                >
                  <strong className={`${idx === 0 ? 'text-amber-300' : 'text-rose-300'} uppercase block`}>
                    {item.partnerLabel}: {item.suggestedPerfectName}
                  </strong>
                  Natal: {item.currentName} ➔ Comp {item.compound} (Root {item.root} • {item.title}) — {item.maritalBenefit}
                </div>
              ))}
              <div className="p-1.5 rounded-xl bg-emerald-950/35 border border-emerald-500/40 text-emerald-100">
                <strong className="text-emerald-300 uppercase block">Joint Couple Resonance Verdict:</strong>
                {partnerMilan.summary}
              </div>
            </div>
          </div>
        ),
      });

      // PAGE 19B: Complete 1 to 8 Ashtakoot Koota Details (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) in Width-Wise 2-Column Layout
      pages.push({
        title: `Page 19B: Partner Milan — All 8 Ashtakoot Koota Detailed Diagnostics & Remedies (Kootas 1 to 8)`,
        headImg: chakraHealingArt,
        headLabel: '1–8 Koota Diagnostics',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="p-1.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-[8.4px] text-slate-200">
              <strong className="text-amber-300 uppercase">
                Complete 1 to 8 Ashtakoot Koota Deep Analysis &amp; Groom/Bride Remedies ({groomProfile.name} &amp; {brideProfile.name}):
              </strong>{' '}
              Includes Kootas 1 to 5 (<strong>1. Varna, 2. Vashya, 3. Tara, 4. Yoni, 5. Graha Maitri</strong>) and Kootas 6 to 8 (<strong>6. Gana, 7. Bhakoot, 8. Nadi</strong>) arranged width-wise in 2 columns with Groom, Bride, and Joint remedies.
            </div>
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
              {partnerMilan.dimensions.map((dim, idx) => {
                const pct = Math.round((dim.obtainedPoints / Math.max(1, dim.maxPoints)) * 100);
                return (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/35 text-[8px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-bold text-amber-200">
                      <span>
                        Koota {idx + 1}: {dim.name} ({dim.sanskritName})
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-200 font-mono text-[7.5px]">
                        {dim.obtainedPoints}/{dim.maxPoints} Gunas ({pct}%) • {dim.verdict}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-amber-300/90 font-semibold">
                      <span>Domain: {dim.description}</span>
                      {dim.soundFrequencyHz && (
                        <span className="text-purple-300 font-mono text-[7.5px]">🔊 {dim.soundFrequencyHz}</span>
                      )}
                    </div>
                    <p className="text-slate-200 leading-snug">{dim.detailedAnalysis}</p>
                    <div className="text-emerald-300 leading-snug">
                      <strong>Vedic Koota Remedy:</strong> {dim.remedy}
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-0.5 text-[7.6px] a4-print-grid-2">
                      <div className="p-1 rounded bg-sky-950/40 border border-sky-500/30 text-sky-200">
                        <strong className="text-sky-300">Groom ({groomProfile.name}):</strong> {dim.groomRemedy}
                      </div>
                      <div className="p-1 rounded bg-rose-950/40 border border-rose-500/30 text-rose-200">
                        <strong className="text-rose-300">Bride ({brideProfile.name}):</strong> {dim.brideRemedy}
                      </div>
                    </div>
                    <div className="p-1 rounded bg-emerald-950/35 border border-emerald-500/30 text-emerald-200 text-[7.6px]">
                      <strong className="text-emerald-300">Joint Couple Practice:</strong> {dim.bothRemedy}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ),
      });

      // PAGE 20: 9-Chakra Marital Diagnostics & Remedies (Part 1: Chakras 1 to 5 in Clean Aligned 2-Column Layout)
      pages.push({
        title: `Page 20: Partner Milan — 9-Chakra Marital Diagnostics, Aura Scan & Remedies (Part 1: Chakras 1 to 5)`,
        headImg: chakraHealingArt,
        headLabel: 'Chakras 1–5 Diagnostics',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2 items-stretch">
              {partnerMilan.chakraChallenges.slice(0, 5).map((ch, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/35 text-[7.8px] leading-snug flex flex-col justify-between gap-1 h-full text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1.5 border-b border-amber-500/25 pb-1">
                      <div className="min-w-0">
                        <div className="font-serif font-bold text-amber-200 text-[8.8px] leading-tight">
                          {idx + 1}. {ch.chakraName}
                        </div>
                        <div className="text-[7.2px] text-amber-400/90 font-mono">
                          {ch.sanskritName} • {ch.element} • Carrier: {ch.affectedPartner}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[7.2px] font-bold shrink-0 border ${
                          ch.alignmentScore >= 75
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                            : ch.alignmentScore >= 55
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                            : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                        }`}
                      >
                        {ch.alignmentScore}% • {ch.status}
                      </span>
                    </div>

                    <div className="text-slate-200 leading-snug">
                      <strong className="text-amber-300">Post-Marriage Challenge:</strong> {ch.postMarriageIssue}
                    </div>
                    <div className="text-slate-300 leading-snug">
                      <strong className="text-sky-300">Diagnosis:</strong> {ch.fortuneReadingDiagnosis}
                    </div>

                    <div className="space-y-0.5 pt-0.5 border-t border-slate-800">
                      <div className="text-slate-200">
                        <strong className="text-sky-300">Groom ({groomProfile.name}):</strong> {ch.groomChallengeDetail}
                      </div>
                      <div className="text-slate-200">
                        <strong className="text-pink-300">Bride ({brideProfile.name}):</strong> {ch.brideChallengeDetail}
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/25 space-y-0.5">
                      <div className="text-sky-200">
                        <strong>Groom Remedy:</strong> {ch.groomRemedy}
                      </div>
                      <div className="text-pink-200">
                        <strong>Bride Remedy:</strong> {ch.brideRemedy}
                      </div>
                      <div className="text-emerald-300">
                        <strong>Joint Remedy:</strong> {ch.bothRemedy}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-1 border-t border-amber-500/25 grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[7.1px] text-amber-200">
                    <div>
                      <strong className="text-purple-300">Sound:</strong> 🔊 {ch.soundFrequencyHz || '528 Hz'}
                    </div>
                    <div>
                      <strong className="text-sky-300">Crystal:</strong> {ch.healingCrystal}
                    </div>
                    <div className="col-span-2">
                      <strong className="text-emerald-300">Mantra:</strong> {ch.beejMantra}
                    </div>
                    <div className="col-span-2 text-amber-300/95">
                      <strong>Aura Scan:</strong> {ch.auraScanRemedy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });

      // PAGE 21: 9-Chakra Marital Diagnostics & Remedies (Part 2: Chakras 6 to 9 + Couple Vastu Shield in Clean Aligned 2-Column Layout)
      pages.push({
        title: `Page 21: Partner Milan — 9-Chakra Marital Diagnostics, Aura Scan & Remedies (Part 2: Chakras 6 to 9)`,
        headImg: chakraHealingArt,
        headLabel: 'Chakras 6–9 Diagnostics',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2 items-stretch">
              {partnerMilan.chakraChallenges.slice(5, 9).map((ch, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/35 text-[7.8px] leading-snug flex flex-col justify-between gap-1 h-full text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1.5 border-b border-amber-500/25 pb-1">
                      <div className="min-w-0">
                        <div className="font-serif font-bold text-amber-200 text-[8.8px] leading-tight">
                          {idx + 6}. {ch.chakraName}
                        </div>
                        <div className="text-[7.2px] text-amber-400/90 font-mono">
                          {ch.sanskritName} • {ch.element} • Carrier: {ch.affectedPartner}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[7.2px] font-bold shrink-0 border ${
                          ch.alignmentScore >= 75
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                            : ch.alignmentScore >= 55
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                            : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                        }`}
                      >
                        {ch.alignmentScore}% • {ch.status}
                      </span>
                    </div>

                    <div className="text-slate-200 leading-snug">
                      <strong className="text-amber-300">Post-Marriage Challenge:</strong> {ch.postMarriageIssue}
                    </div>
                    <div className="text-slate-300 leading-snug">
                      <strong className="text-sky-300">Diagnosis:</strong> {ch.fortuneReadingDiagnosis}
                    </div>

                    <div className="space-y-0.5 pt-0.5 border-t border-slate-800">
                      <div className="text-slate-200">
                        <strong className="text-sky-300">Groom ({groomProfile.name}):</strong> {ch.groomChallengeDetail}
                      </div>
                      <div className="text-slate-200">
                        <strong className="text-pink-300">Bride ({brideProfile.name}):</strong> {ch.brideChallengeDetail}
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/25 space-y-0.5">
                      <div className="text-sky-200">
                        <strong>Groom Remedy:</strong> {ch.groomRemedy}
                      </div>
                      <div className="text-pink-200">
                        <strong>Bride Remedy:</strong> {ch.brideRemedy}
                      </div>
                      <div className="text-emerald-300">
                        <strong>Joint Remedy:</strong> {ch.bothRemedy}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-1 border-t border-amber-500/25 grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[7.1px] text-amber-200">
                    <div>
                      <strong className="text-purple-300">Sound:</strong> 🔊 {ch.soundFrequencyHz || '852 Hz'}
                    </div>
                    <div>
                      <strong className="text-sky-300">Crystal:</strong> {ch.healingCrystal}
                    </div>
                    <div className="col-span-2">
                      <strong className="text-emerald-300">Mantra:</strong> {ch.beejMantra}
                    </div>
                    <div className="col-span-2 text-amber-300/95">
                      <strong>Aura Scan:</strong> {ch.auraScanRemedy}
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-span-2 p-2 rounded-xl bg-amber-950/25 border border-amber-500/40 text-[8.2px] text-amber-100 space-y-1 text-left">
                <strong className="text-amber-300 uppercase block border-b border-amber-500/25 pb-0.5">
                  10. Master Marital Compatibility Summary &amp; Bedroom Vastu Shield ({groomProfile.name} &amp; {brideProfile.name}):
                </strong>
                <p className="leading-snug">{partnerMilan.summary}</p>
                <p className="text-emerald-300 leading-snug">
                  <strong>Couple Vastu &amp; Crystal Prescription:</strong> Keep a pair of natural Rose Quartz and Pyrite crystals in the South-West corner of the master bedroom, sleep with heads towards South, and chant your joint Sahasrara Mantra together every Friday evening.
                </p>
              </div>
            </div>
          </div>
        ),
      });

      // PAGE 21B: Precious Stone Recommendation for Relationship Harmony (Bride & Groom) with Complete Step-by-Step Guide & Joint Couple Relationship Harmony & Bedroom Crystal Synergy
      pages.push({
        title: `Page 21B: Partner Milan — Precious Stone Recommendation for Relationship Harmony (Bride & Groom) & Complete Step-by-Step Guide`,
        headImg: chakraHealingArt,
        headLabel: 'Relationship Harmony Ratna',
        content: (
          <div className="space-y-1.5 text-xs">
            {/* Header & Who Needs To Wear For Harmony */}
            <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/40 flex items-center justify-between gap-2">
              <div>
                <h4 className="font-serif text-[10.5px] font-bold text-amber-200 uppercase">
                  Precious Stone Recommendation for Relationship Harmony (Bride &amp; Groom)
                </h4>
                <p className="text-[8px] text-slate-300">
                  Prescribed according to Vedic Sidereal Astrology (Janma Rashi, 7th House Kalatra/Mangalya Karaka, 36-Guna Ashtakoot Milan &amp; 9-Chakra Bio-Field Diagnostics).
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-serif text-[8.5px] font-bold shrink-0">
                Who Needs To Wear: {partnerRatnaRec.whoNeedsItBadge}
              </span>
            </div>

            {/* Vedic Astrological Harmony Verdict Banner */}
            <div className="p-1.5 rounded-xl bg-slate-950/90 border border-amber-500/35 text-[8px] text-slate-200 leading-snug">
              <strong className="text-amber-300 uppercase block text-[7.8px]">
                Vedic Astrological Harmony Verdict (Bride vs Groom Requirement):
              </strong>
              {partnerRatnaRec.whoNeedsItSummary}
            </div>

            {/* Groom & Bride Precious Stone Cards */}
            <div className="grid grid-cols-2 gap-2 a4-print-grid-2">
              {[
                { rec: partnerRatnaRec.groomStone, isBride: false },
                { rec: partnerRatnaRec.brideStone, isBride: true },
              ].map(({ rec, isBride }, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl bg-slate-950/95 border text-[7.8px] space-y-1 ${
                    isBride ? 'border-rose-500/45' : 'border-amber-500/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold uppercase text-[7.2px] border ${
                        isBride
                          ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                      }`}
                    >
                      {rec.priorityBadge}
                    </span>
                    <span className="font-mono text-amber-300 font-bold text-[7.2px]">
                      Planet: {rec.ratna.planet} ({rec.ratna.sanskritPlanet})
                    </span>
                  </div>

                  <div>
                    <div className="font-serif text-[9.2px] font-bold text-amber-100 leading-tight">
                      {rec.purposeTitle}
                    </div>
                    <div className="text-[7.2px] text-amber-300/80">{rec.purposeSubtitle}</div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-900 border border-amber-500/30 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-emerald-300 text-[8.8px]">
                        Primary Stone: {rec.ratna.primaryGem} ({rec.ratna.sanskritGem})
                      </strong>
                      <span className="font-mono text-amber-200 text-[7.2px] font-bold">
                        {rec.idealRattiRange} ({rec.idealCaratRange})
                      </span>
                    </div>
                    <div className="text-sky-200 text-[7.5px]">
                      <strong>Substitute Stone (Upratna):</strong> {rec.ratna.upratna}
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-900/90 border border-amber-500/20 text-slate-200 leading-tight">
                    <strong className="text-amber-300 uppercase block text-[7.2px]">
                      How It Creates Relationship &amp; Marital Harmony:
                    </strong>
                    {rec.astrologicalReason}
                  </div>

                  <div className="grid grid-cols-2 gap-1 a4-print-grid-2">
                    <div className="p-1 rounded bg-slate-900 border border-amber-500/25">
                      <strong className="text-amber-400 uppercase block text-[6.8px]">
                        1. Which Finger &amp; Hand to Wear
                      </strong>
                      <span className="text-amber-100 font-bold block">{rec.wearingHandAndFinger}</span>
                      <span className="text-slate-400 text-[6.8px]">Chakra: {rec.ratna.chakra}</span>
                    </div>
                    <div className="p-1 rounded bg-slate-900 border border-amber-500/25">
                      <strong className="text-amber-400 uppercase block text-[6.8px]">
                        2. In Which Metal &amp; Setting
                      </strong>
                      <span className="text-amber-100 font-bold block">{rec.ratna.metal}</span>
                      <span className="text-slate-400 text-[6.8px]">Open-back touching skin</span>
                    </div>
                    <div className="p-1 rounded bg-slate-900 border border-amber-500/25">
                      <strong className="text-emerald-400 uppercase block text-[6.8px]">
                        3. Auspicious Day, Time &amp; Nakshatra
                      </strong>
                      <span className="text-emerald-200 font-bold block">{rec.dayAndMuhurat}</span>
                      <span className="text-slate-400 text-[6.8px]">{rec.pakshaAndNakshatra}</span>
                    </div>
                    <div className="p-1 rounded bg-slate-900 border border-amber-500/25">
                      <strong className="text-sky-400 uppercase block text-[6.8px]">
                        4. Panchamrit Purification Liquid
                      </strong>
                      <span className="text-sky-200 font-bold block">{rec.purificationIngredients}</span>
                      <span className="text-slate-400 text-[6.8px]">Soak 21–30 mins before sunrise</span>
                    </div>
                  </div>

                  <div className="p-1 rounded bg-amber-950/35 border border-amber-500/35">
                    <strong className="text-amber-400 uppercase block text-[6.8px]">
                      5. Prana-Pratishtha Beej Mantra (Chant 108 Times Before Wearing)
                    </strong>
                    <span className="font-serif font-bold text-amber-100">{rec.beejMantra}</span>
                  </div>

                  <div className="p-1.5 rounded bg-emerald-950/25 border border-emerald-500/30 space-y-0.5">
                    <strong className="text-emerald-300 uppercase block text-[7.2px]">
                      Complete Step-by-Step Wearing Ritual (Ratna Dharan Vidhi):
                    </strong>
                    {rec.howToWearStepByStep.map((st, sIdx) => (
                      <div key={sIdx} className="text-slate-200 leading-tight text-[7.2px]">
                        • {st}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Partner Strengths, Key Karmic Frictions & Sacred Rudraksha Remedies */}
            {(() => {
              const pInsights = buildPartnerMilanHarmonyInsights(
                partnerMilan,
                groomProfile.name,
                brideProfile.name
              );
              return (
                <>
                  <div className="grid grid-cols-2 gap-1.5 text-[7.4px] a4-print-grid-2">
                    <div className="p-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-slate-200 space-y-0.5">
                      <strong className="text-emerald-300 uppercase block">
                        Key Partner Strengths ({groomProfile.name} &amp; {brideProfile.name})
                      </strong>
                      {pInsights.keyStrengths.slice(0, 3).map((s, sI) => (
                        <div key={sI}>• {s}</div>
                      ))}
                    </div>
                    <div className="p-1.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-slate-200 space-y-0.5">
                      <strong className="text-rose-300 uppercase block">
                        Key Karmic Frictions &amp; Focus Areas ({pInsights.chakrasNeedingRemediesCount}/9 Chakras Need Remedies)
                      </strong>
                      {pInsights.keyFrictions.slice(0, 3).map((f, fI) => (
                        <div key={fI}>• {f}</div>
                      ))}
                    </div>
                  </div>
                  <div className="p-1.5 rounded-xl bg-amber-950/25 border border-amber-500/40 text-[7.5px] text-amber-100 leading-tight">
                    <strong className="text-amber-300 uppercase">Sacred Rudraksha Remedies:</strong>{' '}
                    <strong>Couple Unity:</strong> {pInsights.rudrakshaRemedies.coupleUnityRudraksha} |{' '}
                    <strong>Groom:</strong> {pInsights.rudrakshaRemedies.groomRudraksha} |{' '}
                    <strong>Bride:</strong> {pInsights.rudrakshaRemedies.brideRudraksha} •{' '}
                    <span className="text-emerald-300">Mantra: {pInsights.rudrakshaRemedies.rudrakshaMantra}</span>
                  </div>
                </>
              );
            })()}

            {/* Joint Couple Relationship Harmony & Bedroom Crystal Synergy */}
            <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/45 text-[8px] text-emerald-100 leading-snug space-y-1">
              <div>
                <strong className="text-emerald-300 uppercase tracking-wider block mb-0.5">
                  Joint Couple Relationship Harmony &amp; Bedroom Crystal Synergy:
                </strong>
                {partnerRatnaRec.jointHarmonyStoneSummary}
              </div>
              {!isHealerReport && (
                <div className="pt-1 border-t border-emerald-500/30 text-amber-200 font-semibold">
                  • Visit <strong className="text-emerald-300 font-mono">www.tathastulight.com</strong> for 100% genuine &amp; authentic Rudraksha, Crystals, Home Cleansing Material, Precious &amp; Semi-Precious Stones.
                </div>
              )}
            </div>
          </div>
        ),
      });
    }

    // PAGE 21C: PARIVAR MILAN 9-CHAKRA DIAGNOSTICS, VEDIC ASTROLOGY & GEMSTONE/RUDRAKSHA (INDEPENDENT OPT-IN MODULE)
    if (selectedSections.parivarMilan && parivarReport) {
      pages.push({
        title: `Page 21C: Parivar Milan — 9-Chakra Family Harmony Graph, Vedic Astrology & Remedies (${parivarReport.memberResults.length} Saved Family Members)`,
        headImg: chakraHealingArt,
        headLabel: 'Parivar Milan 9-Chakra',
        content: (
          <div className="space-y-2 text-xs">
            {/* 1. FINAL CONCLUSIVE RESULT • PARIVAR HARMONY GRAPH */}
            <div className="p-2.5 rounded-xl bg-slate-950/95 border border-amber-500/45 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-1">
                <div>
                  <span className="text-[7.5px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                    FINAL CONCLUSIVE RESULT • PARIVAR HARMONY GRAPH
                  </span>
                  <h4 className="font-serif text-[10px] font-bold text-amber-100">
                    Comparative 9-Chakra &amp; Vedic Harmony of {activeProfile.name} with {parivarReport.memberResults.length} Family Member(s)
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-[7.8px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                    Overall Harmony: {parivarReport.averageFamilyHarmony}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {parivarReport.memberResults.map((res, rIdx) => (
                  <div key={res.member.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[7.8px]">
                      <span className="font-bold text-amber-100">
                        #{rIdx + 1} {res.member.name} ({res.member.relation}) • M:{res.memberMulank}/B:{res.memberBhagyank}/N:{res.memberNamank} • {res.memberAstrology.rashi.split(' ')[0]}
                      </span>
                      <span className="font-mono font-bold text-emerald-300">
                        {res.overallHarmonyScore}% ({res.harmonyVerdict})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          res.overallHarmonyScore >= 78
                            ? 'bg-emerald-500'
                            : res.overallHarmonyScore >= 64
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(8, Math.min(100, res.overallHarmonyScore))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[7.6px] text-amber-100 leading-snug space-y-1">
                <div>
                  <strong className="text-amber-300 uppercase">Collective Family Synthesis &amp; Home Vastu Remedy:</strong>{' '}
                  {parivarReport.collectiveHomeVastuAndParivarRemedy}
                </div>
                <div className="text-emerald-200 border-t border-amber-500/20 pt-1">
                  <strong className="text-emerald-300 uppercase">Collective Parivar Gemstone &amp; Rudraksha Harmony Plan:</strong>{' '}
                  {parivarReport.collectiveGemstoneAndRudrakshaRemedy}
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-400/50 text-[7.2px] font-bold text-amber-200 uppercase tracking-wide leading-snug">
                ⚠️ {parivarReport.importantDisclaimer}
              </div>
            </div>

            {/* 2. PER-MEMBER COMPLETE 9-CHAKRA, VEDIC ASTROLOGY & GEMSTONE/RUDRAKSHA DIAGNOSTICS (ONLY CHAKRAS NEEDING HARMONY IN BREAKDOWN) */}
            {parivarReport.memberResults.map((res, idx) => {
              const chakrasNeedingHarmony = res.nineChakraDiagnostics.filter((ch) => ch.status !== 'Harmonious');
              const allNineChakraPercentLine = res.nineChakraDiagnostics
                .map((ch) => `#${ch.chakraNumber} ${ch.chakraName.replace(' Chakra', '')}: ${ch.alignmentScore}%`)
                .join(' • ');

              return (
                <div
                  key={res.member.id}
                  className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/35 space-y-1.5 text-[7.8px]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-amber-500/25 pb-1">
                    <span className="font-serif font-bold text-amber-200 text-[9px] uppercase">
                      COMPLETE 9-CHAKRA PARIVAR DIAGNOSTICS — MEMBER #{idx + 1}: {res.member.name} ({res.member.relation})
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">
                      Harmony: {res.overallHarmonyScore}% ({res.harmonyVerdict})
                    </span>
                  </div>

                  {/* 1st Paragraph: Executive Summary + All 9 Chakras % */}
                  <p className="text-slate-200 leading-snug">
                    {res.executiveSummary}{' '}
                    <strong className="text-amber-300">All 9 Chakras Alignment % (#1 Earth Star to #9 Soul Star):</strong>{' '}
                    <span className="text-emerald-200 font-mono">{allNineChakraPercentLine}</span>
                  </p>

                  {/* Key Parivar Strengths & Key Karmic Frictions Box */}
                  <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
                    <div className="p-1.5 rounded-lg bg-emerald-950/25 border border-emerald-500/35 space-y-0.5">
                      <strong className="text-emerald-300 uppercase block text-[7.2px]">
                        Key Parivar Strengths ({res.member.name}):
                      </strong>
                      {res.keyStrengths.map((st, sIdx) => (
                        <div key={sIdx} className="text-slate-200 leading-tight">
                          • {st}
                        </div>
                      ))}
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-950/25 border border-rose-500/35 space-y-0.5">
                      <strong className="text-rose-300 uppercase block text-[7.2px]">
                        Key Karmic Frictions &amp; Focus Areas ({res.member.name}):
                      </strong>
                      {res.keyFrictions.map((fr, fIdx) => (
                        <div key={fIdx} className="text-slate-200 leading-tight">
                          • {fr}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vedic Astrology Family Harmony & Gemstone / Rudraksha Remedies */}
                  <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
                    <div className="p-1.5 rounded-lg bg-indigo-950/35 border border-indigo-400/35 space-y-0.5 leading-tight">
                      <strong className="text-indigo-200 uppercase block text-[7.2px]">
                        Vedic Astrology Family Harmony ({res.vedicAstrologyHarmony.rashiHarmonyScore}%):
                      </strong>
                      <div className="text-amber-200">
                        <strong>Bhakoot Axis:</strong> {res.vedicAstrologyHarmony.bhakootAxisLabel}
                      </div>
                      <div className="text-sky-200">
                        <strong>Tara Bala:</strong> {res.vedicAstrologyHarmony.taraBalaName} ({res.vedicAstrologyHarmony.taraBalaFavorability})
                      </div>
                      <div className="text-slate-200">
                        <strong>Rashi Lord Maitri:</strong> {res.vedicAstrologyHarmony.rashiLordMaitri} • {res.vedicAstrologyHarmony.sunSignSynergy}
                      </div>
                      <div className="text-emerald-200">
                        <strong>Vedic Remedy:</strong> {res.vedicAstrologyHarmony.vedicRemedy}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-950/25 border border-amber-500/35 space-y-0.5 leading-tight">
                      <strong className="text-amber-300 uppercase block text-[7.2px]">
                        Gemstone (Ratna) &amp; Rudraksha Remedies:
                      </strong>
                      <div className="text-amber-100">
                        <strong>Gemstone:</strong> Client: {res.gemstoneAndRudrakshaRemedy.clientGemstone} | {res.member.name}: {res.gemstoneAndRudrakshaRemedy.memberGemstone}
                      </div>
                      <div className="text-slate-200">
                        <strong>Substitute &amp; Method:</strong> {res.gemstoneAndRudrakshaRemedy.gemstoneSubstitute} • {res.gemstoneAndRudrakshaRemedy.weightAndCarat} • {res.gemstoneAndRudrakshaRemedy.metalAndFinger} ({res.gemstoneAndRudrakshaRemedy.wearingDayAndTime})
                      </div>
                      <div className="text-emerald-200">
                        <strong>Family Unity Rudraksha:</strong> {res.gemstoneAndRudrakshaRemedy.familyUnityRudraksha} • {res.gemstoneAndRudrakshaRemedy.clientRudraksha} &amp; {res.gemstoneAndRudrakshaRemedy.memberRudraksha}
                      </div>
                      <div className="text-sky-200">
                        <strong>Mantra:</strong> {res.gemstoneAndRudrakshaRemedy.rudrakshaMantra}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown: ONLY Chakras that need Harmony */}
                  {chakrasNeedingHarmony.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-[7.2px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                        Chakras Needing Harmony &amp; Remedies ({chakrasNeedingHarmony.length} of 9 — Harmonious Chakras Omitted to Save Space):
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
                        {chakrasNeedingHarmony.map((ch) => (
                          <div
                            key={ch.chakraNumber}
                            className="p-1.5 rounded-lg bg-slate-900 border border-amber-500/30 space-y-0.5 leading-tight"
                          >
                            <div className="flex items-center justify-between font-bold text-amber-100">
                              <span>
                                #{ch.chakraNumber} {ch.sanskritName} ({ch.chakraName})
                              </span>
                              <span
                                className={`font-mono ${
                                  ch.status === 'Moderate Blockage' ? 'text-amber-300' : 'text-rose-300'
                                }`}
                              >
                                {ch.alignmentScore}% ({ch.status})
                              </span>
                            </div>
                            <div className="text-rose-200/95">
                              <strong>Issue:</strong> {ch.mutualFamilyIssue}
                            </div>
                            <div className="text-amber-200">
                              <strong>1. Aura &amp; Crystal ({ch.beejMantra}):</strong> {ch.auraScanRemedy}
                            </div>
                            <div className="text-sky-200">
                              <strong>2. Client &amp; Member Action:</strong> {ch.clientRemedy} | {ch.memberRemedy}
                            </div>
                            <div className="text-emerald-200">
                              <strong>3. Joint Family Remedy:</strong> {ch.jointFamilyRemedy}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 font-semibold">
                      All 9 Chakras (#1 Earth Star to #9 Soul Star) with {res.member.name} ({res.member.relation}) are in natural harmony (78%+). Continue weekly family prayer &amp; gratitude sadhana.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ),
      });
    }

    // PAGES 22–24: Next 12 Months All-India Festivals (All 16 Festivals with Score %, All 4 Puja Windows, Diya, Aura Cleansing & Mantra)
    if (selectedSections.festivals12Months) {
      pages.push({
        title: 'Page 22: Next 12 Months All-India Festivals — Complete 4-Window Puja Muhurats & Remedies (Part 1: 1–6)',
        headImg: spiritualReportBanner,
        headLabel: 'Festivals (Part 1)',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
              {festivals.slice(0, 6).map((fest, idx) => (
                <div key={fest.id} className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/30 text-[8.3px] space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-amber-100">
                    <span>
                      {idx + 1}. {fest.name} ({fest.hindiName})
                    </span>
                    <span className="font-mono text-emerald-300">{fest.personalImpactScore}% ({fest.personalVerdictTag})</span>
                  </div>
                  <div className="text-sky-300 font-mono">
                    {fest.date} ({fest.dayOfWeek}) • {fest.vikramSamvatTithi} • Planet #{fest.governingNumber} ({fest.governingPlanet})
                  </div>
                  <p className="text-slate-300 leading-tight">{fest.howFestivalWillBeForClient}</p>
                  <div className="text-emerald-300 leading-tight">
                    <strong>1. Siddha Puja:</strong> {fest.auspiciousBestPoojaTime.window} | <strong>2. Punya Kaal:</strong> {fest.normalGoodPoojaTime.window}
                  </div>
                  <div className="text-rose-300 leading-tight">
                    <strong>3. Bhadra Caution:</strong> {fest.avoidBhadraPoojaTime.window} | <strong>4. Avoid Rahu:</strong> {fest.badPoojaTime.window}
                  </div>
                  <div className="text-amber-200 leading-tight">
                    <strong>Offerings & Diya:</strong> {fest.personalizedRitualAndAuraRemedy.offerings} • {fest.personalizedRitualAndAuraRemedy.diyaAndDirection}
                  </div>
                  <div className="text-sky-200 leading-tight">
                    <strong>Aura Tip:</strong> {fest.personalizedRitualAndAuraRemedy.auraCleansingTip} | <strong>Mantra:</strong> {fest.personalizedRitualAndAuraRemedy.mantraForClient}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });

      pages.push({
        title: 'Page 23: Next 12 Months All-India Festivals — Complete 4-Window Puja Muhurats & Remedies (Part 2: 7–12)',
        headImg: spiritualReportBanner,
        headLabel: 'Festivals (Part 2)',
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
              {festivals.slice(6, 12).map((fest, idx) => (
                <div key={fest.id} className="p-2 rounded-xl bg-slate-950/95 border border-amber-500/30 text-[8.3px] space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-amber-100">
                    <span>
                      {idx + 7}. {fest.name} ({fest.hindiName})
                    </span>
                    <span className="font-mono text-emerald-300">{fest.personalImpactScore}% ({fest.personalVerdictTag})</span>
                  </div>
                  <div className="text-sky-300 font-mono">
                    {fest.date} ({fest.dayOfWeek}) • {fest.vikramSamvatTithi} • Planet #{fest.governingNumber} ({fest.governingPlanet})
                  </div>
                  <p className="text-slate-300 leading-tight">{fest.howFestivalWillBeForClient}</p>
                  <div className="text-emerald-300 leading-tight">
                    <strong>1. Siddha Puja:</strong> {fest.auspiciousBestPoojaTime.window} | <strong>2. Punya Kaal:</strong> {fest.normalGoodPoojaTime.window}
                  </div>
                  <div className="text-rose-300 leading-tight">
                    <strong>3. Bhadra Caution:</strong> {fest.avoidBhadraPoojaTime.window} | <strong>4. Avoid Rahu:</strong> {fest.badPoojaTime.window}
                  </div>
                  <div className="text-amber-200 leading-tight">
                    <strong>Offerings & Diya:</strong> {fest.personalizedRitualAndAuraRemedy.offerings} • {fest.personalizedRitualAndAuraRemedy.diyaAndDirection}
                  </div>
                  <div className="text-sky-200 leading-tight">
                    <strong>Aura Tip:</strong> {fest.personalizedRitualAndAuraRemedy.auraCleansingTip} | <strong>Mantra:</strong> {fest.personalizedRitualAndAuraRemedy.mantraForClient}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      });

      pages.push({
        title: 'Page 24: All-India Festivals (Part 3: 13–16) + Complete Vastu Shastra & Rudraksha Blueprint',
        headImg: vedicNameCareerYantra,
        headLabel: 'Festivals & Vastu',
        content: (
          <div
            className="space-y-2.5 text-xs a4-text-box-wrap a4-section-no-break"
            style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            <div
              className="grid grid-cols-2 gap-2 a4-print-grid-2 a4-section-no-break"
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            >
              {festivals.slice(12).map((fest, idx) => (
                <div
                  key={fest.id}
                  className="p-2.5 rounded-xl bg-slate-950/95 border border-amber-500/35 text-[8.4px] space-y-1 min-w-0 break-words whitespace-normal overflow-hidden a4-section-no-break"
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 font-bold text-amber-100 break-words whitespace-normal">
                    <span style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                      {idx + 13}. {fest.name} ({fest.hindiName})
                    </span>
                    <span className="font-mono text-emerald-300" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                      {fest.personalImpactScore}% ({fest.personalVerdictTag})
                    </span>
                  </div>
                  <div className="text-sky-300 font-mono break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    {fest.date} ({fest.dayOfWeek}) • {fest.vikramSamvatTithi} • Planet #{fest.governingNumber} ({fest.governingPlanet})
                  </div>
                  <p className="text-slate-200 leading-snug break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    {fest.howFestivalWillBeForClient}
                  </p>
                  <div className="text-emerald-300 leading-snug break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    <strong>1. Siddha Puja:</strong> {fest.auspiciousBestPoojaTime.window} | <strong>2. Punya Kaal:</strong> {fest.normalGoodPoojaTime.window}
                  </div>
                  <div className="text-rose-300 leading-snug break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    <strong>3. Bhadra:</strong> {fest.avoidBhadraPoojaTime.window} | <strong>4. Avoid Rahu:</strong> {fest.badPoojaTime.window}
                  </div>
                  <div className="text-amber-200 leading-snug break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    <strong>Offerings &amp; Diya:</strong> {fest.personalizedRitualAndAuraRemedy.offerings} • {fest.personalizedRitualAndAuraRemedy.diyaAndDirection}
                  </div>
                  <div className="text-sky-200 leading-snug break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    <strong>Aura Tip:</strong> {fest.personalizedRitualAndAuraRemedy.auraCleansingTip} | <strong>Mantra:</strong> {fest.personalizedRitualAndAuraRemedy.mantraForClient}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="p-3 rounded-xl bg-slate-950/95 border border-amber-500/45 space-y-2 min-w-0 break-words whitespace-normal overflow-hidden a4-section-no-break"
              style={{
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4
                  className="font-serif text-xs font-bold text-amber-200 uppercase break-words whitespace-normal"
                  style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                >
                  Complete Home &amp; Office Vastu Shastra, Rudraksha &amp; Yantra Blueprint for {activeProfile.name}
                </h4>
                <span
                  className="text-[9.5px] font-mono text-emerald-300 font-bold break-words whitespace-normal"
                  style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                >
                  Elements: {mPlanet.element} &amp; {bPlanet.element}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[9px] a4-print-grid-2">
                <div
                  className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 min-w-0 break-words whitespace-normal overflow-hidden"
                  style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  <strong className="text-amber-300 block mb-0.5" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    Work Desk, Locker &amp; Sleep Vastu Directions:
                  </strong>
                  <span className="text-slate-200 block leading-snug" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    Face East, North-East (Ishan Kon), or North during financial signings. Keep cash locker in South-West opening North. Sleep with head towards South or East, and install an energized Shree Yantra in North-East.
                  </span>
                </div>
                <div
                  className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 min-w-0 break-words whitespace-normal overflow-hidden"
                  style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  <strong className="text-emerald-300 block mb-0.5" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    Ratna Gemstone, Rudraksha &amp; Crystal Shield:
                  </strong>
                  <span className="text-slate-200 block leading-snug" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    Wear natural {gemRecommend.lifeStone.primaryGem} ({mPlanet.planet}) + {gemRecommend.destinyStone.primaryGem} ({bPlanet.planet}) and authentic Rudraksha after chanting "{bPlanet.beejMantra}" 108x.
                    {!isHealerReport && (
                      <span className="block mt-1 text-amber-200 font-semibold">
                        Visit <strong className="text-emerald-300 font-mono">www.tathastulight.com</strong> for 100% genuine &amp; authentic Rudraksha, Crystals, Home Cleansing Material, Precious &amp; Semi-Precious Stones.
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
      });
    }

    // PAGES 25–26: Islamic-Vedic Remedies (All 3 Personal Asma Cards, All 5 Quranic Surahs, 7-Day Schedule & Complete 1-to-9 Adad Reference)
    if (selectedSections.islamicVedicRemedies) {
      pages.push({
        title: 'Page 25: Islamic-Vedic Remedies — 3 Personal Asma-ul-Husna Wazifas & All 5 Quranic Surah Remedies',
        headImg: islamicNoorArt,
        headLabel: 'Ilm-ul-Adad & Surahs',
        content: (
          <div
            className="space-y-2.5 text-xs a4-text-box-wrap a4-section-no-break"
            style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            <div
              className="relative rounded-xl overflow-hidden border border-emerald-500/45 min-h-[60px] a4-section-no-break"
              style={{
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              <img
                src={islamicNoorArt}
                alt="Islamic-Vedic Noor Sacred Geometry"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
              <div className="relative z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 p-2.5 flex flex-col justify-center">
                <span
                  className="text-[8.5px] font-mono uppercase tracking-widest text-emerald-400 font-bold break-words whitespace-normal"
                  style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                >
                  09 • ISLAMIC-VEDIC REMEDIES (ILM-UL-ADAD • ASMA-UL-HUSNA • QURANIC DUAS)
                </span>
                <h3
                  className="font-serif text-[10.2px] font-bold text-amber-100 leading-snug break-words whitespace-normal mt-0.5"
                  style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                >
                  Abjad Name Total: {islamicReport.abjadCompoundEstimate} ➔ Root {islamicReport.abjadRootNumber} • {islamicReport.personalizedSummaryParagraph}
                </h3>
              </div>
            </div>

            <div
              className="grid grid-cols-3 gap-2 a4-print-grid-3 a4-section-no-break"
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            >
              {[
                { label: `1. Psychic (Adad ${m})`, item: islamicReport.primaryAsmaRemedy },
                { label: `2. Destiny (Adad ${b})`, item: islamicReport.destinyAsmaRemedy },
                { label: `3. Name Adad (${islamicReport.abjadRootNumber})`, item: islamicReport.nameAsmaRemedy },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/35 text-[8px] space-y-1 min-w-0 break-words whitespace-normal overflow-hidden a4-section-no-break"
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}
                >
                  <span
                    className="text-[7.5px] font-bold uppercase text-emerald-400 block break-words whitespace-normal"
                    style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    {card.label} • {card.item.planetarySphere}
                  </span>
                  <div
                    className="font-serif text-[10.5px] font-bold text-amber-200 break-words whitespace-normal"
                    style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    {card.item.arabicName}
                  </div>
                  <div
                    className="font-bold text-amber-100 break-words whitespace-normal"
                    style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    {card.item.transliteration} ({card.item.meaning}) — Abjad {card.item.abjadCount}
                  </div>
                  <div
                    className="text-emerald-300 font-mono break-words whitespace-normal"
                    style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    Tasbih: {card.item.recommendedDailyCount} • {card.item.bestPrayerTime}
                  </div>
                  <p
                    className="text-slate-200 leading-snug break-words whitespace-normal"
                    style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    {card.item.spiritualBenefit}
                  </p>
                  <div
                    className="text-sky-200 leading-snug break-words whitespace-normal"
                    style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                  >
                    <strong>Solves:</strong> {card.item.specificChallengeSolved}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="space-y-1.5 min-w-0 break-words whitespace-normal a4-section-no-break"
              style={{
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              <h5
                className="font-serif text-[9.8px] font-bold text-amber-200 uppercase break-words whitespace-normal"
                style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
              >
                All 5 Prescribed Quranic Surah, Dua, Sadaqah &amp; Sunnah Stone/Attar Remedies
              </h5>
              <div className="overflow-hidden rounded-xl border border-amber-500/35 bg-slate-950/95">
                <div
                  className="grid grid-cols-12 bg-amber-950/60 border-b border-amber-500/35 px-2.5 py-1.5 text-[7.6px] font-bold text-amber-200 uppercase"
                  style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  <div className="col-span-3 pr-2 min-w-0 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    Life Area &amp; Challenge
                  </div>
                  <div className="col-span-4 px-2 border-l border-amber-500/25 min-w-0 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    Surah / Dua &amp; Transliteration
                  </div>
                  <div className="col-span-2 px-2 border-l border-amber-500/25 min-w-0 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    Protocol
                  </div>
                  <div className="col-span-3 pl-2 border-l border-amber-500/25 min-w-0 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    Sadaqah &amp; Stone/Attar
                  </div>
                </div>
                <div className="divide-y divide-amber-500/20">
                  {islamicReport.quranicRemedies.map((qr, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 px-2.5 py-1.5 text-[7.6px] leading-snug items-start a4-section-no-break"
                      style={{
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      <div
                        className="col-span-3 pr-2 min-w-0 break-words whitespace-normal overflow-hidden"
                        style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                      >
                        <div className="font-bold text-amber-200 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                          {idx + 1}. {qr.lifeArea}
                        </div>
                        <div className="text-rose-200/95 mt-0.5 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                          <strong>Challenge:</strong> {qr.planetaryChallenge}
                        </div>
                      </div>
                      <div
                        className="col-span-4 px-2 border-l border-amber-500/20 min-w-0 break-words whitespace-normal overflow-hidden space-y-0.5"
                        style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                      >
                        <div className="font-bold text-amber-100 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                          {qr.surahOrDuaName}
                        </div>
                        <div className="text-amber-200/95 font-serif text-[8px] break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                          {qr.arabicSnippet}
                        </div>
                        <div className="text-sky-200 italic break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                          "{qr.transliteration}"
                        </div>
                        <div className="text-slate-300 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                          ({qr.translationSummary})
                        </div>
                      </div>
                      <div
                        className="col-span-2 px-2 border-l border-amber-500/20 min-w-0 break-words whitespace-normal overflow-hidden text-emerald-200"
                        style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                      >
                        {qr.recitationProtocol}
                      </div>
                      <div
                        className="col-span-3 pl-2 border-l border-amber-500/20 min-w-0 break-words whitespace-normal overflow-hidden space-y-0.5"
                        style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                      >
                        <div className="text-emerald-300 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                          <strong>Sadaqah:</strong> {qr.sadaqahCharityItem}
                        </div>
                        <div className="text-amber-200 break-words whitespace-normal" style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                          <strong>Stone/Attar:</strong> {qr.halalStoneAndAttar}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ),
      });

      pages.push({
        title: 'Page 26: 7-Day Weekly Dhikr & Sadaqah Schedule, Complete 1–9 Asma Reference, QR & Healer Seal',
        headImg: islamicNoorArt,
        headLabel: 'Dhikr, 1–9 Adad & Seal',
        content: (
          <div
            className="space-y-2 text-xs a4-text-box-wrap a4-section-no-break"
            style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            <div
              className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/35 space-y-1.5 a4-section-no-break"
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            >
              <h5 className="font-serif text-[9.5px] font-bold text-emerald-300 uppercase">
                1. Complete 7-Day Daily Dhikr, Wazifa &amp; Sadaqah Harmony Schedule
              </h5>
              <div className="grid grid-cols-2 gap-1.5 a4-print-grid-2">
                {islamicReport.weeklyDhikrSchedule.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-950 border border-emerald-500/25 text-[7.9px] leading-snug min-w-0 break-words whitespace-normal"
                    style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    <strong className="text-amber-200">
                      {d.day} ({d.islamicPlanet}):
                    </strong>{' '}
                    <span className="text-emerald-300 font-bold">{d.primaryDhikr}</span> ({d.count}) — {d.benefit} | <strong className="text-sky-300">Sadaqah:</strong> {d.sadaqahAction}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/35 space-y-1.5 a4-section-no-break"
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            >
              <h5 className="font-serif text-[9.5px] font-bold text-amber-200 uppercase">
                2. Complete 1-to-9 Ilm-ul-Adad Asma-ul-Husna Reference Matrix
              </h5>
              <div className="grid grid-cols-3 gap-1.5 a4-print-grid-3">
                {islamicReport.allNineAsmaRemedies.map((asma) => (
                  <div
                    key={asma.number}
                    className="p-2 rounded bg-slate-950 border border-amber-500/25 text-[7.6px] leading-snug min-w-0 break-words whitespace-normal"
                    style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    <div className="font-bold text-amber-200 break-words whitespace-normal">
                      Adad #{asma.number} ({asma.planetarySphere.split('(')[0].trim()}) — {asma.arabicName}
                    </div>
                    <div className="text-emerald-300 break-words whitespace-normal">
                      {asma.transliteration} ({asma.meaning}) • {asma.recommendedDailyCount}
                    </div>
                    <div className="text-slate-300 break-words whitespace-normal">
                      {asma.bestPrayerTime} • {asma.spiritualBenefit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-950 to-emerald-950/70 border-2 border-amber-400/60 flex items-center justify-between gap-2.5 min-w-0 break-words whitespace-normal a4-section-no-break"
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            >
              {reportQrDataUrl && (
                <div className="p-1 rounded-xl bg-amber-100 border border-amber-400 shrink-0 text-center">
                  <img
                    src={reportQrDataUrl}
                    alt="Scan for Mobile PDF Report"
                    className="w-14 h-14 object-contain mx-auto"
                  />
                  <span className="block text-[6px] font-mono font-black text-slate-950 mt-0.5">
                    SCAN LIVE REPORT
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1 break-words whitespace-normal">
                <div className="text-[8px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  OFFICIAL SPIRITUAL DOSSIER ATTESTATION &amp; DYNAMIC QR MOBILE VERIFICATION
                </div>
                <div className="font-serif text-[11px] font-black text-amber-100 mt-0.5 break-words whitespace-normal">
                  {healerDisplayName} — {brandTitle}
                </div>
                <div className="text-[8.5px] text-emerald-300 font-mono break-words whitespace-normal">
                  📞 {healerDisplayMobile} • ✉️ {healerDisplayEmail} • 📍 {healerDisplayAddress}
                </div>
                <div className="text-[8px] text-amber-200/90 mt-0.5 break-words whitespace-normal">
                  Scan QR code with any smartphone camera for instant mobile verification of this personalized spiritual dossier.
                </div>
              </div>
              <img
                src={brandLogo}
                alt={brandTitle}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-lg shrink-0"
              />
            </div>
          </div>
        ),
      });
    }

    // FINAL CLOSING CHAPTER (1–2 PAGES): AI-Generated Complete Report Summary in Simple Paragraph Format
    // including Next 10 Years Future (Without Remedies vs. With Remedies) based on Vedic + Parashar Astrology & Numerology,
    // ending with Heartfelt Thank You & Spiritual Blessings from the TATHASTU Family.
    const closingSummary: AiReportSummaryData =
      aiReportSummary ||
      buildClassicalFallbackSummary({
        profile: activeProfile,
        healerName: healerDisplayName,
        brandTitle,
        language,
      });

    pages.push({
      title: `Final Summary (Part 1 of 2): Complete Report Summary & Next 10 Years Future (${closingSummary.startYear}–${closingSummary.endYear})`,
      headImg: spiritualReportBanner,
      headLabel: 'Complete Summary • Vedic & Parashar',
      content: (
        <div className="space-y-2.5 text-[9.5px] leading-relaxed">
          <div className="p-2.5 rounded-xl bg-amber-950/35 border border-amber-500/45 flex flex-wrap items-center justify-between gap-2 text-[8.3px]">
            <div className="font-bold text-amber-200">
              Vedic Astrology + Numerology &amp; Parashar Hora (BPHS Vimshottari Mahadasha) Synthesis
            </div>
            <div className="font-mono text-emerald-300">
              {closingSummary.parasharMahadashaLabel} • Horizon: {closingSummary.startYear}–{closingSummary.endYear}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2.5">
            <div className="border-b border-amber-500/30 pb-1.5">
              <h3 className="font-serif text-[11px] font-black text-amber-300 uppercase tracking-wide">
                1. Complete Report Summary in Simple Words ({activeProfile.name})
              </h3>
              <p className="text-[8px] text-amber-200/80 mt-0.5">
                Easy-to-understand overview combining your Vedic Kundli ({astro.rashi}, {astro.nakshatra}), Parashar Vimshottari Mahadasha, and Numerology (Mulank {m} &amp; Bhagyank {b}).
              </p>
            </div>
            <div className="space-y-2.5 text-slate-100 text-[9.6px] leading-[1.6] text-justify">
              {closingSummary.executiveSummaryParagraphs.slice(0, 2).map((para, idx) => (
                <p key={`exec-p-${idx}`}>{para}</p>
              ))}
              {closingSummary.parasharVedicFoundationParagraph && (
                <p className="text-amber-100/95">{closingSummary.parasharVedicFoundationParagraph}</p>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border-2 border-rose-500/45 space-y-2.5">
            <div className="border-b border-rose-500/30 pb-1.5">
              <h3 className="font-serif text-[11px] font-black text-rose-200 uppercase tracking-wide">
                2. Without Remedies — Where Your Future Goes in the Next 10 Years ({closingSummary.startYear} to {closingSummary.endYear})
              </h3>
              <p className="text-[8px] text-rose-200/80 mt-0.5">
                Parashar Dasha Reference: {closingSummary.next10YearDashaSummary} • Honest guidance on what happens if imbalances remain uncorrected.
              </p>
            </div>
            <div className="space-y-2.5 text-slate-100 text-[9.6px] leading-[1.6] text-justify">
              {closingSummary.withoutRemedies10YearParagraphs.slice(0, 2).map((para, idx) => (
                <p key={`without-p-${idx}`}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      ),
    });

    pages.push({
      title: `Final Summary (Part 2 of 2): Next 10 Years Future With Remedies & Tathastu Family Blessings`,
      headImg: chakraHealingArt,
      headLabel: '10-Year Remedies & Tathastu Blessings',
      content: (
        <div className="space-y-2.5 text-[9.5px] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-emerald-950/35 border-2 border-emerald-500/50 space-y-2.5">
            <div className="border-b border-emerald-500/30 pb-1.5">
              <h3 className="font-serif text-[11px] font-black text-emerald-200 uppercase tracking-wide">
                1. With Remedies — Where Your Future Reaches in the Next 10 Years ({closingSummary.startYear} to {closingSummary.endYear})
              </h3>
              <p className="text-[8px] text-emerald-200/85 mt-0.5">
                How Vedic + Parashar Astrology &amp; Numerology remedies transform your career, wealth, health, family peace, and long-term success.
              </p>
            </div>
            <div className="space-y-2.5 text-slate-100 text-[9.6px] leading-[1.6] text-justify">
              {closingSummary.withRemedies10YearParagraphs.slice(0, 2).map((para, idx) => (
                <p key={`with-p-${idx}`}>{para}</p>
              ))}
              {closingSummary.simpleRemedyRoadmapParagraph && (
                <p className="p-2.5 rounded-lg bg-slate-950/75 border border-emerald-500/30 text-emerald-100">
                  {closingSummary.simpleRemedyRoadmapParagraph}
                </p>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/55 via-slate-950 to-amber-950/45 border-2 border-amber-400/60 space-y-2.5">
            <div className="border-b border-amber-400/35 pb-1.5 flex items-center justify-between gap-2">
              <h3 className="font-serif text-[11px] font-black text-amber-300 uppercase tracking-wide">
                2. Heartfelt Thank You From The TATHASTU Family &amp; Spiritual Blessings
              </h3>
              <span className="text-[8px] font-mono text-amber-200 uppercase">
                {TATHASTU_BRAND_NAME} • {TATHASTU_TAGLINE}
              </span>
            </div>
            <p className="text-amber-50 text-[9.6px] leading-[1.6] text-justify">
              {closingSummary.tathastuThankYouParagraph}
            </p>
            <div className="space-y-1.5 pt-1">
              {closingSummary.spiritualBlessings.slice(0, 3).map((blessing, idx) => (
                <p
                  key={`blessing-${idx}`}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-950/45 border border-amber-400/35 text-amber-200 italic text-[9px] leading-snug"
                >
                  {blessing}
                </p>
              ))}
            </div>
          </div>

          <div
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-950 to-emerald-950/70 border-2 border-amber-400/60 flex items-center justify-between gap-2.5 min-w-0 break-words whitespace-normal a4-section-no-break"
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            {reportQrDataUrl && (
              <div className="p-1 rounded-xl bg-amber-100 border border-amber-400 shrink-0 text-center">
                <img
                  src={reportQrDataUrl}
                  alt="Scan for Mobile PDF Report"
                  className="w-14 h-14 object-contain mx-auto"
                />
                <span className="block text-[6px] font-mono font-black text-slate-950 mt-0.5">
                  SCAN LIVE REPORT
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1 break-words whitespace-normal">
              <div className="text-[8px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                WITH DIVINE GRATITUDE • OFFICIAL TATHASTU FAMILY ATTESTATION
              </div>
              <div className="font-serif text-[11px] font-black text-amber-100 mt-0.5 break-words whitespace-normal">
                Healer {healerDisplayName} — {brandTitle}
              </div>
              <div className="text-[8.5px] text-emerald-300 font-mono break-words whitespace-normal">
                📞 {healerDisplayMobile} • ✉️ {healerDisplayEmail} • 📍 {healerDisplayAddress}
              </div>
              <div className="text-[8px] text-amber-200/90 mt-0.5 break-words whitespace-normal">
                Om Shanti, Shanti, Shantih • Tathastu Divya Jyoti Sada Sahayate — May Divine Light Guide Your Path Always.
              </div>
            </div>
            <img
              src={brandLogo}
              alt={brandTitle}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-lg shrink-0"
            />
          </div>
        </div>
      ),
    });

    const isWhatsAppNotificationHubTab =
      sectionTitle.toLowerCase().includes('good/bad time') ||
      sectionTitle.toLowerCase().includes('whatsapp');

    if (includeActiveTabInPrint && !isWhatsAppNotificationHubTab) {
      pages.push({
        title: `Active Module View — ${sectionTitle}`,
        headImg: spiritualReportBanner,
        headLabel: sectionTitle,
        isCover: pages.length === 0,
        content: <div className="text-xs a4-section-no-break">{children}</div>,
      });
    }

    return pages;
  };

  const isWhatsAppHubActiveScreen =
    sectionTitle.toLowerCase().includes('good/bad time') ||
    sectionTitle.toLowerCase().includes('whatsapp');
  const discreteA4Pages = buildDiscreteA4Pages();
  const totalPageCount =
    pdfPageCountInfo.totalPdfPages > 0
      ? pdfPageCountInfo.totalPdfPages + (includeActiveTabInPrint && !isWhatsAppHubActiveScreen ? 1 : 0)
      : discreteA4Pages.length;

  const SHREE_YANTRA_PLATE_IMAGE_PATH = '/assets/aistudio/wp8754154_d55216c3.jpg';

  const renderContextualChapterVisualFiller = (
    headImg: string,
    headLabel: string,
    cleanTitle: string,
    pageNum: number
  ) => {
    if (!activeProfile || !multiSectionReportData) return null;
    const fillerMPlanet = PLANETARY_PROFILES[multiSectionReportData.m] || PLANETARY_PROFILES[1];
    const fillerBPlanet = PLANETARY_PROFILES[multiSectionReportData.b] || PLANETARY_PROFILES[1];
    const isIslamicPage =
      headImg === islamicNoorArt ||
      cleanTitle.toLowerCase().includes('islamic') ||
      cleanTitle.toLowerCase().includes('dhikr') ||
      headLabel.toLowerCase().includes('adad');

    const primaryAsma = multiSectionReportData.islamicReport?.primaryAsmaRemedy;

    return (
      <div
        className="a4-dynamic-page-spacer a4-section-no-break"
        style={{
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}
      >
        <div className="rounded-xl border border-amber-500/45 bg-slate-950/92 p-2.5 grid grid-cols-12 gap-2.5 items-center shadow-md">
          {/* Left Highlighted Spiritual Key Box */}
          <div className="col-span-5 p-2 rounded-lg bg-amber-950/45 border border-amber-500/35 space-y-0.5 min-w-0">
            <div className="text-[7.5px] font-mono uppercase tracking-wider text-amber-300 font-bold">
              {isIslamicPage
                ? `ILM-UL-ADAD SPIRITUAL DIRECTIVE • PAGE #${pageNum}`
                : `KEY SPIRITUAL DIRECTIVE • PAGE #${pageNum}`}
            </div>
            <div className="text-[9px] font-serif font-bold text-amber-100 leading-snug">
              {cleanTitle}
            </div>
            <div className="text-[8px] text-slate-200 leading-snug">
              {isIslamicPage ? (
                <>
                  Calibrated for <strong className="text-amber-200">{activeProfile.name}</strong> • Adad #{multiSectionReportData.m} &amp; Destiny Adad #{multiSectionReportData.b}
                </>
              ) : (
                <>
                  Calibrated for <strong className="text-amber-200">{activeProfile.name}</strong> • Mulank #{multiSectionReportData.m} ({fillerMPlanet.planet}) &amp; Bhagyank #{multiSectionReportData.b} ({fillerBPlanet.planet})
                </>
              )}
            </div>
          </div>

          {/* Center Aspect-Ratio-Locked Unstretched Sacred Yantra Plate (Shree Yantra for Vedic/General, Islamic Noor Geometry for Islamic Remedies) */}
          <div className="col-span-2 flex flex-col items-center justify-center min-w-0 overflow-hidden">
            {isIslamicPage ? (
              <>
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-emerald-400 shadow-lg shrink-0 bg-slate-900">
                  <img
                    src={islamicNoorArt}
                    alt={`Ilm-ul-Adad Noor Geometry Page ${pageNum}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
                  >
                    <rect x="22" y="22" width="56" height="56" fill="none" stroke="#6EE7B7" strokeWidth="2" />
                    <rect
                      x="22"
                      y="22"
                      width="56"
                      height="56"
                      fill="none"
                      stroke="#FDE68A"
                      strokeWidth="2"
                      transform="rotate(45 50 50)"
                    />
                    <circle cx="50" cy="50" r="16" fill="none" stroke="#FDE68A" strokeWidth="1.8" />
                  </svg>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-amber-400 shadow-lg shrink-0 bg-[#f6ec65] p-0.5 flex items-center justify-center">
                  <img
                    src={SHREE_YANTRA_PLATE_IMAGE_PATH}
                    alt={`Sacred Shree Yantra Plate Page ${pageNum}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Highlighted Remedy & Mantra Box */}
          <div className="col-span-5 p-2 rounded-lg bg-emerald-950/45 border border-emerald-500/35 space-y-0.5 min-w-0">
            {isIslamicPage ? (
              <>
                <div className="text-[7.5px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  PRESCRIBED WAZIFA &amp; SADAQAH BOX
                </div>
                <div className="text-[8.5px] font-bold text-emerald-200 leading-snug">
                  Dhikr: {primaryAsma ? `${primaryAsma.transliteration} (${primaryAsma.recommendedDailyCount})` : 'Ya Allahu Ya Rahmanu (100x Daily)'}
                </div>
                <div className="text-[8px] text-slate-200 leading-snug">
                  Best Prayer Time: {primaryAsma?.bestPrayerTime || 'After Fajr & Maghrib'} • Guided by <strong className="text-amber-200">{healerDisplayName}</strong>
                </div>
              </>
            ) : (
              <>
                <div className="text-[7.5px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  PRESCRIBED SANKALPA &amp; REMEDY BOX
                </div>
                <div className="text-[8.5px] font-bold text-emerald-200 leading-snug">
                  Mantra: &ldquo;{fillerBPlanet.beejMantra}&rdquo; (108x Daily)
                </div>
                <div className="text-[8px] text-slate-200 leading-snug">
                  Sacred Shree Yantra Direction: North-East (Ishan Kon) • Healer <strong className="text-amber-200">{healerDisplayName}</strong>
                  {!isHealerReport && (
                    <span className="block text-[7.5px] text-amber-200 mt-0.5">
                      Visit <strong className="text-emerald-300 font-mono">www.tathastulight.com</strong> for 100% genuine &amp; authentic Rudraksha, Crystals, Home Cleansing Material, Precious &amp; Semi-Precious Stones.
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSacredClosingBlessingBanner = () => {
    if (!activeProfile) return null;
    return (
      <div
        className="a4-dynamic-page-spacer a4-section-no-break"
        style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
      >
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-950/95 to-emerald-950/90 border-2 border-amber-400/75 text-center space-y-1 shadow-lg">
          <div className="text-[9px] font-serif font-bold tracking-widest text-amber-300 uppercase">
            ॥ सर्वे भवन्तु सुखिनः • सर्वे सन्तु निरामयाः • तथास्तु ॥
          </div>
          <p className="text-[9.5px] text-amber-100 leading-snug italic">
            "Infinite Gratitude to the Supreme Universe &amp; Divine Cosmic Intelligence. May the sacred vibrations of your numbers, planets, and mantras illuminate every step of <strong className="text-amber-300 not-italic">{activeProfile.name}</strong>'s life with boundless health, abundance, harmony, and spiritual grace."
          </p>
          <div className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-[9px] font-serif font-black tracking-wider text-emerald-300 uppercase">
            ✨ Thank You for Being a Cherished Part of the TATHASTU Family — One Place, Every Divine Solution! ✨
          </div>
          {!isHealerReport && (
            <div className="text-[8.5px] text-amber-200 font-semibold pt-0.5">
              Visit <strong className="text-emerald-300 font-mono">www.tathastulight.com</strong> for 100% Genuine &amp; Authentic Rudraksha, Crystals, Home Cleansing Material, Precious &amp; Semi-Precious Stones.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDiscreteA4PagesStack = (scaleFactor?: number) => {
    const useScaledSlots = typeof scaleFactor === 'number' && scaleFactor > 0 && scaleFactor < 0.999;
    return (
      <div className={useScaledSlots ? 'space-y-3 sm:space-y-5 flex flex-col items-center' : 'space-y-6 print:space-y-0'}>
        {discreteA4Pages.map((pg, idx) => {
          const cleanTitle = pg.title.replace(/^Page\s+\d+[A-Z]?:\s*/i, '');
          const dynamicTitle = `Page ${idx + 1}: ${cleanTitle}`;
          const isLastPage = idx === discreteA4Pages.length - 1;
          const sheetNode = (
            <div
              className="a4-sheet-page rounded-2xl a4-text-box-wrap"
              style={{
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {renderA4PageSpiritualBackground()}
              {renderCenteredBrandWatermark()}
              {renderA4PageTopHeader(dynamicTitle, pg.headImg, pg.headLabel, pg.isCover)}
              <div
                className="relative z-10 flex-1 my-1 a4-page-body-fill a4-text-box-wrap"
                style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                <div
                  className="a4-section-no-break space-y-2"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  {pg.content}
                </div>
                {!isLastPage &&
                  renderContextualChapterVisualFiller(pg.headImg, pg.headLabel, cleanTitle, idx + 1)}
                {isLastPage && renderSacredClosingBlessingBanner()}
              </div>
              {renderA4PageHealerFooter(idx + 1)}
            </div>
          );

          if (useScaledSlots) {
            const slotW = Math.floor(794 * scaleFactor);
            const slotH = Math.floor(1123 * scaleFactor);
            return (
              <div
                key={idx}
                className="mx-auto shrink-0 shadow-2xl"
                style={{
                  width: `${slotW}px`,
                  height: `${slotH}px`,
                  overflow: 'hidden',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    width: '794px',
                    height: '1123px',
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {sheetNode}
                </div>
              </div>
            );
          }

          return <React.Fragment key={idx}>{sheetNode}</React.Fragment>;
        })}
      </div>
    );
  };

  const renderQuickCheckboxesPanel = () => {
    if (!activeProfile || !showExportOptionsPanel) return null;
    return (
      <div className="mt-4 p-4 rounded-2xl bg-slate-950/95 border border-amber-400/50 space-y-3 animate-fade-in no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
          <div>
            <h4 className="font-serif text-sm font-bold text-amber-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>
                Select Modules for Dynamic A4 Portrait PDF / Print ({reportDateRange.startFormatted} – {reportDateRange.endFormatted})
              </span>
            </h4>
            <p className="text-[11px] text-amber-300/75">
              PDF page count automatically adjusts to your selected active modules. Centered watermark is fixed at 11% across every A4 page.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllModules}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 text-[11px] font-bold cursor-pointer"
            >
              Select All Modules
            </button>
            <button
              type="button"
              onClick={handleSelectCoreFour}
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer"
            >
              Core Modules
            </button>
            <button
              type="button"
              onClick={() => setShowExportOptionsPanel(false)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {MODULE_OPTIONS.map((item) => {
            const checked = selectedSections[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleSectionCheckbox(item.key)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                  checked
                    ? 'bg-amber-500/15 border-amber-400 text-amber-100'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-amber-500/30'
                }`}
              >
                {checked ? (
                  <CheckSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-amber-500/20">
          {!isWhatsAppHubActiveScreen ? (
            <button
              type="button"
              onClick={() => setIncludeActiveTabInPrint((prev) => !prev)}
              className="flex items-center gap-2 text-xs text-amber-200 cursor-pointer"
            >
              {includeActiveTabInPrint ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Also append currently open screen tab ({sectionTitle}) as an extra A4 page</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              Direct WhatsApp &amp; Daily Alerts Hub is a live healer service and is excluded from Report PDF.
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenPrintPreview}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF ({totalPageCount} Pages)</span>
            </button>

            <button
              type="button"
              onClick={handleDirectWhatsAppReport}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const reportToolbarContextValue: ReportToolbarContextValue = {
    healerDisplayName,
    brandTitle,
    healerDisplayMobile,
    totalPageCount,
    selectedCount,
    totalModulesCount: MODULE_OPTIONS.length,
    showExportOptionsPanel,
    toggleExportOptionsPanel: () => setShowExportOptionsPanel((prev) => !prev),
    openPrintPreview: handleOpenPrintPreview,
    sendWhatsAppPdfReport: handleDirectWhatsAppReport,
    renderQuickCheckboxesPanel,
  };

  return (
    <ReportToolbarContext.Provider value={reportToolbarContextValue}>
    <div className="w-full space-y-4">
      {latestBroadcast && latestBroadcast.category !== 'update' && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/90 via-indigo-950/90 to-slate-900 border border-amber-400/50 px-3 sm:px-4 py-2.5 flex items-start sm:items-center justify-between gap-2.5 text-xs text-amber-100 no-print">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase shrink-0">
              <Bell className="w-3 h-3" />
              <span>{latestBroadcast.category}</span>
            </span>
            <strong className="text-amber-200 break-words">{latestBroadcast.title}:</strong>
            <span className="break-words">{latestBroadcast.message}</span>
            {latestBroadcast.couponCode && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400/50 text-emerald-300 font-mono font-bold">
                Code: {latestBroadcast.couponCode}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDismissedBroadcastId(latestBroadcast.id)}
            className="text-slate-400 hover:text-amber-200 p-1 cursor-pointer shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {shareToast && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Floating Print / Download PDF button is Desktop-only; on Mobile it lives cleanly in the Side Panel & Dashboard header so it never overlaps buttons/cards */}
      {activeProfile && (
        <div className="hidden md:flex fixed right-4 bottom-6 z-40 flex-col gap-2 no-print">
          <button
            type="button"
            onClick={handleOpenPrintPreview}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Download PDF</span>
          </button>
        </div>
      )}

      {activeProfile &&
        isPrintPreviewOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9990] bg-slate-950/95 backdrop-blur-md flex flex-col animate-fade-in no-print">
            <div className="w-full bg-slate-900 border-b-2 border-amber-400/50 px-3 sm:px-6 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 sm:py-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-2 sm:gap-3 shadow-xl shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-serif text-sm sm:text-lg font-black text-amber-100 truncate">
                      <span className="sm:hidden">Print Preview — {activeProfile.name}</span>
                      <span className="hidden sm:inline">A4 Portrait Print Preview — {activeProfile.name}</span>
                    </h3>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                      {totalPageCount} A4 Pages (210mm × 297mm)
                    </span>
                  </div>
                  <p className="hidden sm:block text-[11px] text-amber-200/80">
                    Branding: <strong>{TATHASTU_BRAND_NAME} ({TATHASTU_TAGLINE})</strong> • Exact 1:1 WYSIWYG Parity across Print Preview, Print &amp; PDF Download
                  </p>
                </div>
              </div>

              {/* Zoom +/- Box: Desktop only (mobile supports native screen pinch-zoom) */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 border border-amber-500/35 rounded-xl px-2.5 py-1">
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.max(60, s - 10))}
                  className="p-1 text-amber-300 hover:text-white cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-amber-200 px-1.5">
                  {previewScale}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.min(isWindowsFullPage ? 135 : 115, s + 10))}
                  className="p-1 text-amber-300 hover:text-white cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {isWindowsFullPage && (
                  <button
                    type="button"
                    onClick={() => setWindowsSpreadView((prev) => !prev)}
                    className={`ml-1.5 px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border cursor-pointer transition-all ${
                      windowsSpreadView
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-amber-200 border-amber-500/40 hover:bg-slate-800'
                    }`}
                    title="Toggle Full-Page Single vs Side-by-Side 2-Page Spread on Windows"
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>{windowsSpreadView ? '2-Page Spread' : '1-Page Full'}</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: Clean 1-line row on mobile (Download, Print without page count, Close Preview) */}
              <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={handleDownloadPdfDirectly}
                  className="px-2 py-2 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 shadow-lg cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">
                    {isGeneratingPdf && pdfExportProgress
                      ? `PDF ${pdfExportProgress.current}/${pdfExportProgress.total}`
                      : 'Download PDF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdfReport}
                  className="px-2 py-2 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 shadow-lg cursor-pointer whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="sm:hidden">Print</span>
                  <span className="hidden sm:inline">Print All {totalPageCount} Pages</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="px-2 py-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Close Preview</span>
                </button>
              </div>
            </div>

            <div className="report-a4-preview-viewport flex-1 overflow-y-auto overflow-x-hidden px-2 py-2.5 sm:p-6 flex justify-center bg-slate-950/95">
              {isMobileViewport ? (
                <div className="w-full flex flex-col items-center">
                  {renderDiscreteA4PagesStack(Math.max(0.32, Math.min(1, (viewportWidth - 16) / 794)))}
                </div>
              ) : (
                <div
                  className={`origin-top transition-transform duration-200 ${
                    isWindowsFullPage && windowsSpreadView
                      ? '[&>div]:grid [&>div]:grid-cols-1 [&>div]:2xl:grid-cols-2 [&>div]:gap-6 [&>div]:space-y-0'
                      : ''
                  }`}
                  style={{ transform: `scale(${previewScale / 100})` }}
                >
                  {renderDiscreteA4PagesStack()}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {activeProfile && isGeneratingPdf && (
        <div
          ref={pdfCaptureContainerRef}
          aria-hidden="true"
          className="a4-pdf-capture-mode no-print"
          style={{
            position: 'fixed',
            left: '-12000px',
            top: 0,
            width: '794px',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          {renderDiscreteA4PagesStack()}
        </div>
      )}

      <div className="w-full">
        <div
          className={`no-print relative border-2 border-amber-500/35 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-900/95 shadow-2xl overflow-x-clip ${
            isWindowsFullPage ? 'rounded-2xl' : isMobileAppMode ? 'rounded-2xl' : 'rounded-3xl'
          }`}
        >
          {activeProfile && renderCenteredBrandWatermark()}

          <div
            className={`report-snap-flow relative z-10 ${
              isWindowsFullPage ? 'p-5 lg:p-8 xl:p-10' : isMobileAppMode ? 'p-3 sm:p-5' : 'p-4 sm:p-6 lg:p-8'
            }`}
          >
            {children}
          </div>

          {activeProfile && (
            <div className="relative z-10 px-3 sm:px-6 pb-4">
              {renderA4PageHealerFooter(1, undefined, true)}
            </div>
          )}
        </div>

        {activeProfile && (
          <div className="hidden print:block a4-print-root">
            {renderDiscreteA4PagesStack()}
          </div>
        )}
      </div>

      {restrictionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                    Restricted Action
                  </span>
                  <h3 className="font-serif text-lg font-bold text-amber-100">
                    {restrictionModal.actionAttempted}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={closeRestrictionModal}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              For security and data integrity, <strong>{restrictionModal.actionAttempted}</strong> requires an active plan or Master Admin authorization. Please contact Tathastu Divine Light Admin Support:
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Admin Helpline:</span>
                <a
                  href={`tel:+91${TATHASTU_ADMIN_PHONE}`}
                  className="font-mono font-bold text-amber-300 hover:underline"
                >
                  +91 {TATHASTU_ADMIN_PHONE}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Official Email:</span>
                <a
                  href={`mailto:${TATHASTU_ADMIN_EMAIL}`}
                  className="font-mono font-bold text-emerald-300 hover:underline"
                >
                  {TATHASTU_ADMIN_EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <a
                href={`https://wa.me/91${TATHASTU_ADMIN_PHONE}?text=${encodeURIComponent(
                  validateAndNormalizeLocaleText(
                    translateMultilineBlock(
                      `Namaste Admin, I need assistance with ${restrictionModal.actionAttempted} on ${TATHASTU_APP_NAME} (${currentAccount.email}).`,
                      language
                    ),
                    language,
                    { context: 'whatsapp' }
                  ).sanitizedText
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Admin</span>
              </a>
              <button
                type="button"
                onClick={closeRestrictionModal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal removed — PDF is shared directly via WhatsApp */}
    </div>
    </ReportToolbarContext.Provider>
  );
};
