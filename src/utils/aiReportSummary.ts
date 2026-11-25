import { AstroProfileRecord, TATHASTU_BRAND_NAME, TATHASTU_TAGLINE } from './tathastuStore';
import {
  PLANETARY_PROFILES,
  calculateMulank,
  calculateBhagyank,
  analyzeName,
  analyzeMobileNumber,
  generateNameCorrections,
  calculateLoShuGrid,
  reduceToSingleDigit,
} from './numerology';
import {
  calculateVedicAstrologyFromBirth,
  calculateCareerAndAuraProfile,
} from './astrologyAndCities';
import { calculateGemstoneRecommendationsForProfile } from '../components/GemstoneRecommendation';
import { SupportedLanguage, getCurrentLanguage } from './i18n';

export interface ParasharDashaPeriod {
  lord: string;
  sanskritLord: string;
  startYear: number;
  endYear: number;
  durationYears: number;
}

export interface Parashar10YearContext {
  startYear: number;
  endYear: number;
  birthNakshatra: string;
  birthNakshatraLord: string;
  rashi: string;
  rashiLord: string;
  sunSign: string;
  currentMahadasha: ParasharDashaPeriod;
  next10YearMahadashas: ParasharDashaPeriod[];
  mahadashaSummaryText: string;
  personalYears10: { year: number; personalYear: number; planet: string }[];
  peakYears: number[];
  cautionYears: number[];
}

export interface AiReportSummaryData {
  source: 'gemini' | 'classical-fallback';
  generatedAtIso: string;
  language: SupportedLanguage;
  startYear: number;
  endYear: number;
  parasharMahadashaLabel: string;
  next10YearDashaSummary: string;
  executiveSummaryParagraphs: string[];
  parasharVedicFoundationParagraph: string;
  withoutRemedies10YearParagraphs: string[];
  withRemedies10YearParagraphs: string[];
  simpleRemedyRoadmapParagraph: string;
  tathastuThankYouParagraph: string;
  spiritualBlessings: string[];
}

export interface AiReportSummaryRequestInput {
  profile: AstroProfileRecord;
  healerName: string;
  brandTitle: string;
  language?: SupportedLanguage;
  forceRefresh?: boolean;
}

// Classical Brihat Parashara Hora Shastra (BPHS) 120-Year Vimshottari Mahadasha Sequence
const VIMSHOTTARI_SEQUENCE: { lord: string; sanskritLord: string; years: number }[] = [
  { lord: 'Ketu', sanskritLord: 'Ketu (South Node)', years: 7 },
  { lord: 'Venus', sanskritLord: 'Shukra (Venus)', years: 20 },
  { lord: 'Sun', sanskritLord: 'Surya (Sun)', years: 6 },
  { lord: 'Moon', sanskritLord: 'Chandra (Moon)', years: 10 },
  { lord: 'Mars', sanskritLord: 'Mangal (Mars)', years: 7 },
  { lord: 'Rahu', sanskritLord: 'Rahu (North Node)', years: 18 },
  { lord: 'Jupiter', sanskritLord: 'Devaguru Brihaspati (Jupiter)', years: 16 },
  { lord: 'Saturn', sanskritLord: 'Shani (Saturn)', years: 19 },
  { lord: 'Mercury', sanskritLord: 'Budh (Mercury)', years: 17 },
];

/**
 * Computes the client's exact Brihat Parashara Hora Shastra (BPHS) Vimshottari Mahadasha
 * timeline and 10-Year Personal Year Numerology cycle starting from the current calendar year.
 */
export function calculateParashar10YearTimeline(
  profile: AstroProfileRecord
): Parashar10YearContext {
  const dob = profile.dob || '1990-01-01';
  const tob = profile.tob || '09:30';
  const lat = Number.isFinite(profile.lat) ? profile.lat : 28.6139;
  const lng = Number.isFinite(profile.lng) ? profile.lng : 77.209;

  const astro = calculateVedicAstrologyFromBirth(dob, tob, lat, lng);
  const [birthYearRaw, birthMonthRaw, birthDayRaw] = dob.split('-').map(Number);
  const birthYear = Number.isFinite(birthYearRaw) && birthYearRaw > 1900 ? birthYearRaw : 1990;
  const birthMonth = Number.isFinite(birthMonthRaw) ? birthMonthRaw : 1;
  const birthDay = Number.isFinite(birthDayRaw) ? birthDayRaw : 1;

  const now = new Date();
  const startYear = now.getFullYear();
  const endYear = startYear + 10;

  // Exact Vimshottari balance at birth from Sidereal Moon longitude inside its Nakshatra (13°20' = 13.3333°)
  const nakshatraSpan = 360 / 27;
  const elapsedInNakshatra = astro.moonDegreeSidereal - astro.nakshatraIndex * nakshatraSpan;
  const fractionRemaining = Math.max(
    0.02,
    Math.min(0.99, 1 - elapsedInNakshatra / nakshatraSpan)
  );
  const startSeqIndex = astro.nakshatraIndex % 9;

  const allDashas: ParasharDashaPeriod[] = [];
  let cursorYear = birthYear + (birthMonth - 1) / 12 + (birthDay - 1) / 365.25;

  for (let cycle = 0; cycle < 18; cycle++) {
    const seqItem = VIMSHOTTARI_SEQUENCE[(startSeqIndex + cycle) % 9];
    const span = cycle === 0 ? seqItem.years * fractionRemaining : seqItem.years;
    const sY = Math.floor(cursorYear);
    const eY = Math.max(sY + 1, Math.round(cursorYear + span));
    allDashas.push({
      lord: seqItem.lord,
      sanskritLord: seqItem.sanskritLord,
      startYear: sY,
      endYear: eY,
      durationYears: Number(span.toFixed(1)),
    });
    cursorYear += span;
    if (cursorYear > endYear + 20) break;
  }

  const currentMahadasha =
    allDashas.find((d) => startYear >= d.startYear && startYear < d.endYear) ||
    allDashas.find((d) => d.endYear >= startYear) ||
    allDashas[0];

  const next10YearMahadashas = allDashas.filter(
    (d) => d.endYear >= startYear && d.startYear <= endYear
  );

  const m = calculateMulank(dob);
  const b = calculateBhagyank(dob);
  const mPlanet = PLANETARY_PROFILES[m] || PLANETARY_PROFILES[1];
  const friendlySet = new Set<number>([...mPlanet.friendlyNumbers, m, b]);
  const enemySet = new Set<number>(mPlanet.enemyNumbers || []);

  const personalYears10: { year: number; personalYear: number; planet: string }[] = [];
  const peakYears: number[] = [];
  const cautionYears: number[] = [];

  for (let yr = startYear; yr <= endYear; yr++) {
    const py = reduceToSingleDigit(birthDay + birthMonth + yr);
    const pObj = PLANETARY_PROFILES[py] || PLANETARY_PROFILES[1];
    personalYears10.push({ year: yr, personalYear: py, planet: pObj.planet });
    if (friendlySet.has(py)) {
      peakYears.push(yr);
    } else if (enemySet.has(py)) {
      cautionYears.push(yr);
    }
  }

  const mahadashaSummaryText = next10YearMahadashas
    .map((d) => `${d.sanskritLord} Mahadasha (${d.startYear}–${d.endYear})`)
    .join(' transitioning into ');

  return {
    startYear,
    endYear,
    birthNakshatra: `${astro.nakshatra} (Pada ${astro.pada})`,
    birthNakshatraLord: astro.nakshatraLord,
    rashi: astro.rashi,
    rashiLord: astro.rashiLord,
    sunSign: astro.sunSign,
    currentMahadasha,
    next10YearMahadashas,
    mahadashaSummaryText,
    personalYears10,
    peakYears: peakYears.slice(0, 5),
    cautionYears: cautionYears.slice(0, 4),
  };
}

/**
 * Builds the comprehensive Vedic + Parashar Astrology + Numerology payload for AI synthesis.
 */
export function buildAiReportSummaryPayload(input: AiReportSummaryRequestInput) {
  const { profile, healerName, brandTitle } = input;
  const language = input.language || getCurrentLanguage();
  const dob = profile.dob || '1990-01-01';
  const tob = profile.tob || '09:30';
  const lat = Number.isFinite(profile.lat) ? profile.lat : 28.6139;
  const lng = Number.isFinite(profile.lng) ? profile.lng : 77.209;

  const m = calculateMulank(dob);
  const b = calculateBhagyank(dob);
  const mPlanet = PLANETARY_PROFILES[m] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[b] || PLANETARY_PROFILES[1];
  const nameAnalysis = analyzeName(profile.name || 'Seeker', m, b);
  const nPlanet = PLANETARY_PROFILES[nameAnalysis.chaldeanSingle] || PLANETARY_PROFILES[1];
  const nameSuggestions = generateNameCorrections(profile.name || 'Seeker', m, b);
  const topName = nameSuggestions[0]?.suggestedName || profile.name;
  const mobileAnalysis = analyzeMobileNumber(profile.mobile || '9876543210', m, b);
  const loShu = calculateLoShuGrid(dob, m, b, profile.gender);
  const astro = calculateVedicAstrologyFromBirth(dob, tob, lat, lng);
  const career = calculateCareerAndAuraProfile(
    profile.name || 'Seeker',
    m,
    b,
    nameAnalysis.chaldeanSingle
  );
  const gems = calculateGemstoneRecommendationsForProfile(profile);
  const parashar = calculateParashar10YearTimeline(profile);

  return {
    name: profile.name || 'Seeker',
    dob,
    tob,
    pob: profile.pob || 'New Delhi, India',
    gender: profile.gender || 'male',
    mobile: profile.mobile || '',
    mulank: m,
    mulankPlanet: `${mPlanet.planet} (${mPlanet.sanskritName})`,
    bhagyank: b,
    bhagyankPlanet: `${bPlanet.planet} (${bPlanet.sanskritName})`,
    namank: nameAnalysis.chaldeanSingle,
    nameCompound: nameAnalysis.totalChaldeanCompound,
    namePlanet: nPlanet.planet,
    recommendedName: topName,
    mobileRoot: mobileAnalysis.singleDigit,
    mobileVerdict: mobileAnalysis.verdict,
    rashi: astro.rashi,
    rashiLord: astro.rashiLord,
    sunSign: astro.sunSign,
    nakshatra: `${astro.nakshatra} (Pada ${astro.pada})`,
    nakshatraLord: astro.nakshatraLord,
    missingLoShuNumbers: loShu.missingNumbers,
    presentLoShuNumbers: loShu.presentNumbers,
    careerDomains: career.favorableProfessions.slice(0, 5),
    lifeStone: `${gems.lifeStone.primaryGem} (${gems.lifeStone.sanskritGem})`,
    destinyStone: `${gems.destinyStone.primaryGem} (${gems.destinyStone.sanskritGem})`,
    beejMantra: bPlanet.beejMantra,
    deity: bPlanet.deity,
    luckyDays: mPlanet.luckyDays.join(', '),
    luckyColor: mPlanet.luckyColor,
    friendlyNumbers: mPlanet.friendlyNumbers.join(', '),
    startYear: parashar.startYear,
    endYear: parashar.endYear,
    currentMahadasha: `${parashar.currentMahadasha.sanskritLord} (${parashar.currentMahadasha.startYear}–${parashar.currentMahadasha.endYear})`,
    next10YearDashaSummary: parashar.mahadashaSummaryText,
    peakYears: parashar.peakYears,
    cautionYears: parashar.cautionYears,
    healerName,
    brandTitle,
    language,
  };
}

/**
 * Rich, simple, easy-to-understand classical Vedic + Parashar Astrology + Numerology
 * paragraph summary used immediately while live AI loads or if offline.
 */
export function buildClassicalFallbackSummary(
  input: AiReportSummaryRequestInput
): AiReportSummaryData {
  const payload = buildAiReportSummaryPayload(input);
  const {
    name,
    mulank,
    mulankPlanet,
    bhagyank,
    bhagyankPlanet,
    nameCompound,
    namank,
    recommendedName,
    mobileRoot,
    mobileVerdict,
    rashi,
    rashiLord,
    nakshatra,
    nakshatraLord,
    missingLoShuNumbers,
    careerDomains,
    lifeStone,
    destinyStone,
    beejMantra,
    deity,
    luckyDays,
    luckyColor,
    friendlyNumbers,
    startYear,
    endYear,
    currentMahadasha,
    next10YearDashaSummary,
    peakYears,
    cautionYears,
    healerName,
    brandTitle,
    language,
  } = payload;

  const missingLabel =
    missingLoShuNumbers.length > 0
      ? missingLoShuNumbers.join(', ')
      : 'none (naturally balanced Lo-Shu grid)';
  const peakYearsLabel =
    peakYears.length > 0 ? peakYears.join(', ') : `${startYear + 2}, ${startYear + 5}, ${startYear + 8}`;
  const cautionYearsLabel =
    cautionYears.length > 0 ? cautionYears.join(', ') : `${startYear + 1}, ${startYear + 4}`;
  const topDomains = careerDomains.slice(0, 3).join(', ');
  const nameNeedsTuning = recommendedName.trim().toLowerCase() !== name.trim().toLowerCase();

  return {
    source: 'classical-fallback',
    generatedAtIso: new Date().toISOString(),
    language,
    startYear,
    endYear,
    parasharMahadashaLabel: currentMahadasha,
    next10YearDashaSummary,
    executiveSummaryParagraphs: [
      `Dear ${name}, this complete spiritual report brings together the timeless wisdom of Vedic Astrology, Maharishi Parashara's Jyotish Shastra, and Vedic-Chaldean Numerology to give you a clear mirror of your life journey. Your birth chart is guided by Mulank ${mulank} (${mulankPlanet}), which shapes your everyday personality and confidence, and Bhagyank ${bhagyank} (${bhagyankPlanet}), which leads your long-term destiny and wealth path. Under Vedic Astrology, your Moon resides in ${rashi} ruled by ${rashiLord} within ${nakshatra} Nakshatra (ruled by ${nakshatraLord}), gifting you natural inner strength, sincere intentions, and strong potential in fields like ${topDomains}.`,
      `Your current name carries Chaldean Compound #${nameCompound} (Root #${namank}), and your mobile vibration reduces to Root #${mobileRoot} (${mobileVerdict}). While your birth chart carries genuine blessings for respect and steady progress, missing Lo-Shu numbers (${missingLabel}) and planetary timing cycles can sometimes create avoidable delays right when success is close. The good news in this entire report is simple: your destiny has strong upward energy waiting to be unlocked through easy, practical alignment of your name spelling${nameNeedsTuning ? ` (such as "${recommendedName}")` : ''}, daily prayer, supportive colors (${luckyColor}), and balanced planetary remedies.`,
    ],
    parasharVedicFoundationParagraph: `According to Maharishi Parashara's classical Brihat Parashara Hora Shastra (Vimshottari Dasha system) combined with your 10-year Numerology Personal Year cycle from ${startYear} to ${endYear}, you are moving through ${next10YearDashaSummary}. In simple words, a Mahadasha acts like the weather season of your life, while your yearly numerology numbers act like the open windows of opportunity. Your naturally strong breakthrough years in this decade are ${peakYearsLabel}, while ${cautionYearsLabel} are years where patience, calm decision-making, and spiritual protection will save you from unnecessary stress or financial leakage.`,
    withoutRemedies10YearParagraphs: [
      `If you move through the next 10 years (${startYear}–${endYear}) without following the remedies in this report, your life will still move forward through hard work, yet progress may feel slower and heavier than it needs to be. Because the missing numbers in your birth grid (${missingLabel}) and unharmonized name or mobile vibrations stay uncorrected, you may repeatedly notice good deals getting delayed at the last moment, money coming in but slipping away on unexpected expenses, or recognition going to others even when you put in the most effort.`,
      `During the testing phases around ${cautionYearsLabel} and planetary shifts inside ${next10YearDashaSummary}, leaving planetary imbalances unaddressed can invite mental restlessness, sleep disturbance, overthinking, or small misunderstandings within family and business partnerships. Instead of enjoying smooth expansion over the next decade, you may spend precious years fixing preventable setbacks and feeling that you are working twice as hard for half the reward that your birth chart actually promises.`,
    ],
    withRemedies10YearParagraphs: [
      `When you lovingly apply the simple remedies recommended in this report over the next 10 years (${startYear}–${endYear}), your Parashari Dasha energy and Numerology vibrations begin working together like wind behind your sails. In the first 1 to 3 years, daily chanting of your planetary Beej Mantra, using auspicious days (${luckyDays}) and numbers (${friendlyNumbers}), and harmonizing your name${nameNeedsTuning ? ` toward "${recommendedName}"` : ''} and mobile energy gradually clear hidden blocks, calm your mind, and stop unnecessary financial leaks so your confidence and cash flow stabilize.`,
      `Across Years 4 to 7 — especially around your golden growth windows (${peakYearsLabel}) — aligned planetary grace from ${mulankPlanet}, ${bhagyankPlanet}, and ${rashiLord} opens doors to career promotions, trusted business expansion, stronger assets or property stability, and deeper respect in society. By Years 8 to 10 (approaching ${endYear}), consistent faith and planetary balance help you stand in a much higher place of financial security, healthier vitality, peaceful family harmony, and true spiritual fulfillment.`,
    ],
    simpleRemedyRoadmapParagraph: `You do not need complicated rituals to see real change — start gently from tomorrow morning. First, recite your sacred mantra "${beejMantra}" (27 or 108 times) facing East or North-East while remembering ${deity}, and keep your work desk and home North-East corner clean and bright. Second, start important conversations, signings, and savings on your lucky days (${luckyDays}) using friendly numbers (${friendlyNumbers}) and shades of ${luckyColor}. Third, consider wearing your verified primary Ratna (${lifeStone} or ${destinyStone}) after proper consultation with Healer ${healerName}, and gradually align your signature, name spelling, and mobile vibration with your favorable numbers.`,
    tathastuThankYouParagraph: `From the bottom of our hearts, thank you, dear ${name}, for choosing ${TATHASTU_BRAND_NAME} ("${TATHASTU_TAGLINE}") and becoming a cherished member of the TATHASTU Family. It has been an honor for Healer ${healerName} and the entire ${brandTitle} family to prepare this sacred roadmap for your next decade. Remember that planets show the path, remedies remove the stones, and your own pure karma and devotion create miracles — we are always here beside you whenever you need guidance.`,
    spiritualBlessings: [
      `May the Supreme Divine Light ("Tathastu Divya Jyoti") remove every hidden obstacle from your path and turn every honest effort of ${name} into lasting prosperity and peace.`,
      `May all Nine Celestial Grahas (Navagraha) — led by ${mulankPlanet}, ${bhagyankPlanet}, and ${rashiLord} — shower abundant health, happy family bonding, and fearless wisdom upon your home.`,
      `Om Sarve Bhavantu Sukhinah, Sarve Santu Niramayah | May your home always stay filled with happiness, good health, gratitude, and sacred blessings. Tathastu!`,
    ],
  };
}

const CLIENT_SUMMARY_CACHE = new Map<string, AiReportSummaryData>();

function buildCacheKey(input: AiReportSummaryRequestInput): string {
  const lang = input.language || getCurrentLanguage();
  return [
    input.profile.id || '',
    input.profile.name || '',
    input.profile.dob || '',
    input.profile.tob || '',
    input.profile.pob || '',
    input.profile.mobile || '',
    input.healerName || '',
    lang,
  ].join('||');
}

export function getCachedAiReportSummary(
  input: AiReportSummaryRequestInput
): AiReportSummaryData | null {
  return CLIENT_SUMMARY_CACHE.get(buildCacheKey(input)) || null;
}

/**
 * Fetches the AI-generated 1-to-2 page Complete Report Summary, 10-Year Future Comparison
 * (With Remedies vs. Without Remedies) based on Vedic + Parashar Astrology + Numerology,
 * and Tathastu Family Thank You + Spiritual Blessings via the server-side Gemini endpoint.
 */
export async function fetchAiReportSummary(
  input: AiReportSummaryRequestInput
): Promise<AiReportSummaryData> {
  const key = buildCacheKey(input);
  if (!input.forceRefresh) {
    const cached = CLIENT_SUMMARY_CACHE.get(key);
    if (cached && cached.source === 'gemini') {
      return cached;
    }
  }

  const fallback = buildClassicalFallbackSummary(input);
  const payload = buildAiReportSummaryPayload(input);

  const controller = new AbortController();
  const timeoutId =
    typeof window !== 'undefined' ? window.setTimeout(() => controller.abort(), 18000) : null;

  try {
    const res = await fetch('/api/gemini/report-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileSummary: payload,
        forceRefresh: Boolean(input.forceRefresh),
      }),
      signal: controller.signal,
    });

    if (res.ok) {
      const json = await res.json();
      const s = json?.summary;
      if (
        s &&
        Array.isArray(s.executiveSummaryParagraphs) &&
        s.executiveSummaryParagraphs.length > 0 &&
        Array.isArray(s.withoutRemedies10YearParagraphs) &&
        s.withoutRemedies10YearParagraphs.length > 0 &&
        Array.isArray(s.withRemedies10YearParagraphs) &&
        s.withRemedies10YearParagraphs.length > 0
      ) {
        const normalized: AiReportSummaryData = {
          source: json.source === 'gemini' ? 'gemini' : 'classical-fallback',
          generatedAtIso: new Date().toISOString(),
          language: payload.language,
          startYear: payload.startYear,
          endYear: payload.endYear,
          parasharMahadashaLabel: payload.currentMahadasha,
          next10YearDashaSummary: payload.next10YearDashaSummary,
          executiveSummaryParagraphs: s.executiveSummaryParagraphs
            .map((p: unknown) => String(p || '').trim())
            .filter(Boolean)
            .slice(0, 2),
          parasharVedicFoundationParagraph:
            String(s.parasharVedicFoundationParagraph || '').trim() ||
            fallback.parasharVedicFoundationParagraph,
          withoutRemedies10YearParagraphs: s.withoutRemedies10YearParagraphs
            .map((p: unknown) => String(p || '').trim())
            .filter(Boolean)
            .slice(0, 2),
          withRemedies10YearParagraphs: s.withRemedies10YearParagraphs
            .map((p: unknown) => String(p || '').trim())
            .filter(Boolean)
            .slice(0, 2),
          simpleRemedyRoadmapParagraph:
            String(s.simpleRemedyRoadmapParagraph || '').trim() ||
            fallback.simpleRemedyRoadmapParagraph,
          tathastuThankYouParagraph:
            String(s.tathastuThankYouParagraph || '').trim() ||
            fallback.tathastuThankYouParagraph,
          spiritualBlessings:
            Array.isArray(s.spiritualBlessings) && s.spiritualBlessings.length > 0
              ? s.spiritualBlessings
                  .map((b: unknown) => String(b || '').trim())
                  .filter(Boolean)
                  .slice(0, 4)
              : fallback.spiritualBlessings,
        };
        CLIENT_SUMMARY_CACHE.set(key, normalized);
        return normalized;
      }
    }
  } catch {
    // Offline or timeout -> graceful classical fallback
  } finally {
    if (timeoutId !== null && typeof window !== 'undefined') {
      window.clearTimeout(timeoutId);
    }
  }

  CLIENT_SUMMARY_CACHE.set(key, fallback);
  return fallback;
}
