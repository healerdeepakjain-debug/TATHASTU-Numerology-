import { ParivarMemberRecord } from '../utils/parivarMilan';

export interface CityLocation {
  city: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  tzOffset: number; // hours from UTC, e.g. 5.5 for IST
}

export interface BirthProfile {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  tob?: string; // HH:mm
  pob?: string; // City, Country
  lat?: number;
  lng?: number;
  gender?: 'male' | 'female' | 'other';
  mobile?: string;
  rashi?: string; // Moon sign (Auto-calculated or custom)
  sunSign?: string; // Vedic Surya Rashi (Auto-calculated)
  nakshatra?: string; // Lunar mansion (Auto-calculated)
  nakshatraPada?: number;
  includePartnerMilan?: boolean; // Opt-in checkbox for Partner Milan
  includeParivarMilan?: boolean; // Opt-in checkbox for Parivar Milan in PDF/Print/Share/WhatsApp
  healthConcerns?: string[]; // Identified health concerns for Yoga & Pranayama
  partnerName?: string;
  partnerDob?: string;
  partnerTob?: string;
  partnerPob?: string;
  partnerLat?: number;
  partnerLng?: number;
  originalName?: string;
  selectedNameA?: string;
  selectedNameB?: string;
  originalMobile?: string;
  selectedMobileA?: string;
  selectedMobileB?: string;
  parivarMembers?: ParivarMemberRecord[];
}

export interface PlanetaryInfo {
  number: number;
  planet: string;
  sanskritName: string;
  deity: string;
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Ether';
  quality: string;
  gemstone: string;
  metal: string;
  luckyColor: string;
  luckyDays: string[];
  beejMantra: string;
  soundFrequencyHz?: string;
  soundTherapyProtocol?: string;
  friendlyNumbers: number[];
  neutralNumbers: number[];
  enemyNumbers: number[];
  traits: string[];
}

export interface CompoundNumberData {
  number: number;
  title: string;
  description: string;
  type: 'fortunate' | 'auspicious' | 'challenging' | 'malefic';
  lifeOutcome: string;
  remedy?: string;
}

export interface NameAnalysis {
  rawName: string;
  cleanName: string;
  letters: {
    char: string;
    chaldeanVal: number;
    pythagoreanVal: number;
  }[];
  firstNameSum: number;
  lastNameSum: number;
  totalChaldeanCompound: number;
  chaldeanSingle: number;
  totalPythagoreanCompound: number;
  pythagoreanSingle: number;
  compoundInfo: CompoundNumberData;
  mulankResonance: 'friendly' | 'neutral' | 'inimical';
  bhagyankResonance: 'friendly' | 'neutral' | 'inimical';
  mulankRelation: string;
  bhagyankRelation: string;
  isAuspicious: boolean;
  harmonyScore: number; // 0 - 100
  verdict: string;
  recommendation: string;
}

export interface NameCorrection {
  originalName: string;
  suggestedName: string;
  compoundNumber: number;
  singleDigit: number;
  compoundTitle: string;
  changeExplanation: string;
  harmonyScore: number;
  targetPlanet: string;
  planetaryBlessing: string;
  isTopPerfectChoice?: boolean;
}

export interface CareerAndAuraProfile {
  mulank: number;
  bhagyank: number;
  namank: number;
  dominantPlanet: string;
  destinyPlanet: string;
  perfectBusinesses: {
    field: string;
    reason: string;
    successRate: number;
    governingPlanet: string;
  }[];
  goodBusinesses: {
    field: string;
    reason: string;
    successRate: number;
    governingPlanet: string;
  }[];
  favorableProfessions: string[];
  veryBadBusinesses: {
    field: string;
    dangerReason: string;
    conflictPlanet: string;
  }[];
  fortuneReadingRemedies: {
    title: string;
    category: 'Aura Scan Cleansing' | 'Chakra Activation' | 'Karmic Fortune Remedy' | 'Vastu & Yantra' | 'Rudraksha & Crystal';
    issueAddressed: string;
    prescription: string;
    frequencyHz?: string;
  }[];
  auraColor: string;
  primaryChakra: string;
  secondaryChakra: string;
  auraHealthSummary: string;
}

export interface MobileAnalysis {
  mobileNumber: string;
  cleanDigits: string;
  digitSum: number;
  compoundNumber: number;
  singleDigit: number;
  endingTwoDigits: number;
  endingThreeDigits: number;
  toxicPairsFound: {
    pair: string;
    indices: number[];
    meaning: string;
    severity: 'high' | 'medium';
  }[];
  frequency: Record<number, number>;
  missingCrucialNumbers: number[];
  dominantNumber: number | null;
  harmonyWithMulank: 'friendly' | 'neutral' | 'inimical';
  harmonyWithBhagyank: 'friendly' | 'neutral' | 'inimical';
  endingVibrationQuality: 'excellent' | 'good' | 'average' | 'poor';
  overallScore: number; // 0 - 100
  verdict: string;
  suggestedEndingSequences: string[];
  remedies: string[];
}

export interface UniversalValidationResult {
  category: 'name' | 'mobile' | 'vehicle' | 'business' | 'flat';
  input: string;
  inputValue: string;
  compound: number;
  compoundNumber: number;
  singleDigit: number;
  planet: string;
  rulingPlanet: string;
  compoundInfo: CompoundNumberData;
  resonanceRating: 'A+' | 'A' | 'B' | 'C' | 'F';
  status: string;
  harmonyScore: number;
  compatibilityScore: number;
  meaning: string;
  isHarmonious: boolean;
  advice: string;
  recommendation: string;
}

export interface ChoghadiyaPeriod {
  name: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
  ruler: string;
  quality: 'Excellent' | 'Good' | 'Gainful' | 'Neutral/Travel' | 'Inauspicious' | 'Loss/Avoid' | 'Anxiety/Avoid';
  startTime: string;
  endTime: string;
  isCurrent: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: 'contract' | 'finance' | 'property' | 'travel' | 'interview' | 'relationship' | 'spiritual' | 'other';
  notes?: string;
  auspiciousScore: number; // 0 - 100
  auspiciousTag: 'Highly Auspicious' | 'Favorable' | 'Neutral' | 'Caution Advised' | 'Rahu Kaal Alert';
  choghadiya: string;
  hora: string;
  recommendation: string;
}

export interface ChakraMaritalChallenge {
  chakraNumber?: number;
  locationLabel?: string;
  chakraName: string;
  sanskritName: string;
  element: string;
  color: string;
  alignmentScore: number; // 0 - 100
  status: 'Harmonious' | 'Moderate Blockage' | 'Severe Karmic Challenge';
  affectedPartner: string;
  primaryCarrierName?: string;
  groomChallengeDetail: string;
  brideChallengeDetail: string;
  postMarriageIssue: string;
  fortuneReadingDiagnosis: string;
  auraScanRemedy: string;
  groomRemedy: string;
  brideRemedy: string;
  bothRemedy: string;
  healingCrystal: string;
  beejMantra: string;
  soundFrequencyHz?: string;
}

export interface CompatibilityAnalysis {
  partner1Name: string;
  partner2Name: string;
  p1Mulank: number;
  p2Mulank: number;
  p1Bhagyank: number;
  p2Bhagyank: number;
  p1Namank: number;
  p2Namank: number;
  p1Astrology: {
    rashi: string;
    sunSign: string;
    nakshatra: string;
    pada: number;
  };
  p2Astrology: {
    rashi: string;
    sunSign: string;
    nakshatra: string;
    pada: number;
  };
  dimensions: {
    name: string;
    sanskritName: string;
    maxPoints: number;
    obtainedPoints: number;
    description: string;
    detailedAnalysis: string;
    remedy: string;
    groomRemedy: string;
    brideRemedy: string;
    bothRemedy: string;
    soundFrequencyHz?: string;
    verdict: 'Excellent' | 'Good' | 'Moderate' | 'Challenging';
  }[];
  totalPoints: number; // out of 36
  overallPercentage: number;
  nameDobCompatibility?: {
    overallScore: number; // 0 - 100 automatic score based on Name + DOB vibrations
    mulankHarmony: number;
    bhagyankHarmony: number;
    namankHarmony: number;
    crossNumberHarmony: number;
    verdict: string;
    summary: string;
  };
  verdict: string;
  summary: string;
  strengths: string[];
  potentialFrictions: string[];
  remedialSuggestions: string[];
  chakraChallenges: ChakraMaritalChallenge[];
  perfectNameSuggestions: {
    partnerLabel: string;
    currentName: string;
    suggestedPerfectName: string;
    compound: number;
    root: number;
    title: string;
    maritalBenefit: string;
  }[];
}

export interface PlanetaryTransit {
  id: string;
  planet: string;
  transitName: string;
  sign: string;
  startDate: string; // e.g. "29 March 2025, 23:01 IST"
  endDate: string;   // e.g. "03 June 2027, 06:24 IST"
  dateRange: string;
  impactType: 'favorable' | 'transformational' | 'caution' | 'spiritual';
  impactLevel?: string;
  summary: string;
  recommendation: string;
  isCurrent: boolean;
}

export interface MoonPhase {
  name: string;
  tithi: string;
  paksha: 'Shukla Paksha (Waxing)' | 'Krishna Paksha (Waning)';
  date: string;
  startTime: string;
  endTime: string;
  auspiciousness: string;
  recommendedRitual: string;
  illumination: number; // 0 - 100%
}

export interface IndianFestivalPersonalized {
  id: string;
  name: string;
  hindiName: string;
  date: string;
  dayOfWeek: string;
  vikramSamvatTithi: string;
  deity: string;
  governingPlanet: string;
  governingNumber: number;
  significance: string;
  // Personalized for Client:
  personalImpactScore: number; // 0-100
  personalVerdictTag: 'Supremely Auspicious (Raj Yoga)' | 'Highly Favorable (Shubh)' | 'Balanced & Transformative' | 'Karmic Caution (Remedy Advised)';
  howFestivalWillBeForClient: string;
  auspiciousBestPoojaTime: {
    window: string;
    muhuratName: string;
    whyBestForClient: string;
  };
  sahiPoojaTime: {
    window: string;
    description: string;
  };
  normalGoodPoojaTime: {
    window: string;
    description: string;
  };
  badPoojaTime: {
    window: string;
    reason: string;
  };
  avoidBhadraPoojaTime: {
    window: string;
    reason: string;
  };
  worstPoojaTime: {
    window: string;
    reason: string;
  };
  personalizedRitualAndAuraRemedy: {
    offerings: string;
    diyaAndDirection: string;
    mantraForClient: string;
    auraCleansingTip: string;
    soundFrequencyHz?: string;
  };
}
