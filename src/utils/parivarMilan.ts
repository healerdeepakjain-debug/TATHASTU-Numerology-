import {
  calculateMulank,
  calculateBhagyank,
  analyzeName,
  PLANETARY_PROFILES,
  getPlanetaryRelationship,
} from './numerology';
import {
  calculateVedicAstrologyFromBirth,
  VEDIC_RASHIS,
  VEDIC_NAKSHATRAS,
} from './astrologyAndCities';

export const PARIVAR_MILAN_DISCLAIMER =
  'IMPORTANT DISCLAIMER: THIS DIAGNOSE BASED ON CHAKRA/PLANETARY ALIGNMENT ONLY MAY NOT BE ALWAYS MATCH BECAUSE OF OTHER SEVERAL REASON SOMETIMES, CONTACT HEALER FOR MORE UNDERSTANDINGS.';

export type FamilyRelationType =
  | 'Father'
  | 'Mother'
  | 'Spouse / Partner'
  | 'Son'
  | 'Daughter'
  | 'Brother'
  | 'Sister'
  | 'Father-in-Law'
  | 'Mother-in-Law'
  | 'Grandfather'
  | 'Grandmother'
  | 'Uncle / Aunt'
  | 'Other Family Member';

export const FAMILY_RELATION_OPTIONS: FamilyRelationType[] = [
  'Father',
  'Mother',
  'Spouse / Partner',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Father-in-Law',
  'Mother-in-Law',
  'Grandfather',
  'Grandmother',
  'Uncle / Aunt',
  'Other Family Member',
];

export interface ParivarMemberRecord {
  id: string;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  lat: number;
  lng: number;
  relation: FamilyRelationType;
  isSaved: boolean;
}

export interface NineChakraParivarDiagnostic {
  chakraNumber: number; // 1 to 9
  chakraName: string;
  sanskritName: string;
  locationLabel: string;
  element: string;
  color: string;
  soundFrequencyHz: string;
  beejMantra: string;
  healingCrystal: string;
  rudrakshaMukhi: string;
  alignmentScore: number; // 0 to 100
  status: 'Harmonious' | 'Moderate Blockage' | 'Severe Karmic Challenge';
  affectedPerson: string;
  clientPatternDetail: string;
  memberPatternDetail: string;
  mutualFamilyIssue: string;
  astrologicalDiagnosis: string;
  auraScanRemedy: string;
  clientRemedy: string;
  memberRemedy: string;
  jointFamilyRemedy: string;
}

export interface ParivarVedicAstrologyHarmony {
  bhakootAxisLabel: string;
  rashiHarmonyScore: number;
  taraBalaName: string;
  taraBalaFavorability: 'Supremely Auspicious' | 'Balanced' | 'Needs Mantra Pacification';
  rashiLordMaitri: string;
  clientRashiLord: string;
  memberRashiLord: string;
  sunSignSynergy: string;
  vedicSummary: string;
  vedicRemedy: string;
}

export interface ParivarGemstoneAndRudraksha {
  clientGemstone: string;
  memberGemstone: string;
  gemstoneSubstitute: string;
  weightAndCarat: string;
  metalAndFinger: string;
  wearingDayAndTime: string;
  gemMantra: string;
  clientRudraksha: string;
  memberRudraksha: string;
  familyUnityRudraksha: string;
  rudrakshaWearingMethod: string;
  rudrakshaMantra: string;
  whyRecommended: string;
}

export interface ParivarMemberHarmonyResult {
  member: ParivarMemberRecord;
  clientMulank: number;
  clientBhagyank: number;
  clientNamank: number;
  memberMulank: number;
  memberBhagyank: number;
  memberNamank: number;
  clientAstrology: {
    rashi: string;
    sunSign: string;
    nakshatra: string;
    pada: number;
  };
  memberAstrology: {
    rashi: string;
    sunSign: string;
    nakshatra: string;
    pada: number;
  };
  overallHarmonyScore: number; // 0 - 100
  harmonyVerdict: 'Supremely Harmonious' | 'Good Family Harmony' | 'Moderate (Needs Balancing)' | 'Karmic Friction (Remedy Advised)';
  mulankRelation: 'friendly' | 'neutral' | 'inimical';
  bhagyankRelation: 'friendly' | 'neutral' | 'inimical';
  executiveSummary: string;
  keyStrengths: string[];
  keyFrictions: string[];
  nineChakraDiagnostics: NineChakraParivarDiagnostic[];
  vedicAstrologyHarmony: ParivarVedicAstrologyHarmony;
  gemstoneAndRudrakshaRemedy: ParivarGemstoneAndRudraksha;
}

export interface ParivarMilanCompleteReport {
  clientName: string;
  clientDob: string;
  clientMulank: number;
  clientBhagyank: number;
  averageFamilyHarmony: number;
  familyCollectiveVerdict: string;
  mostHarmoniousMember: { name: string; relation: string; score: number } | null;
  mostChallengingMember: { name: string; relation: string; score: number } | null;
  memberResults: ParivarMemberHarmonyResult[];
  collectiveHomeVastuAndParivarRemedy: string;
  collectiveGemstoneAndRudrakshaRemedy: string;
  importantDisclaimer: string;
}

interface NineChakraBlueprint {
  chakraNumber: number;
  chakraName: string;
  sanskritName: string;
  locationLabel: string;
  element: string;
  color: string;
  soundFrequencyHz: string;
  beejMantra: string;
  healingCrystal: string;
  rudrakshaMukhi: string;
  governingNumber: number;
  familyDomain: string;
}

export const NINE_CHAKRAS_MASTER_LIST: NineChakraBlueprint[] = [
  {
    chakraNumber: 1,
    chakraName: '1. Earth Star Chakra',
    sanskritName: 'Vasundhara Chakra',
    locationLabel: '12 Inches Below Feet (Sub-Personal Grounding)',
    element: 'Deep Crystalline Earth',
    color: '#78350f',
    soundFrequencyHz: '194.18 Hz',
    beejMantra: 'Om Vasundharayai Vidmahe Bhumi Devyai Dhimahi Tanno Prithvi Prachodayat',
    healingCrystal: 'Black Tourmaline & Smoky Quartz',
    rudrakshaMukhi: '8-Mukhi & 14-Mukhi Rudraksha',
    governingNumber: 8,
    familyDomain: 'Ancestral Lineage (Pitru) Roots, Shared Home Grounding & Collective Family Stability',
  },
  {
    chakraNumber: 2,
    chakraName: '2. Root Chakra',
    sanskritName: 'Muladhara Chakra',
    locationLabel: 'Base of Spine (Coccyx)',
    element: 'Earth (Prithvi)',
    color: '#ef4444',
    soundFrequencyHz: '396 Hz',
    beejMantra: 'Om Lam Muladharaya Namah',
    healingCrystal: 'Red Jasper & Natural Garnet',
    rudrakshaMukhi: '4-Mukhi & 7-Mukhi Rudraksha',
    governingNumber: 4,
    familyDomain: 'Financial Security, Shared Household Responsibilities, Property & Mutual Physical Trust',
  },
  {
    chakraNumber: 3,
    chakraName: '3. Sacral Chakra',
    sanskritName: 'Svadhishthana Chakra',
    locationLabel: 'Lower Abdomen (2 Inches Below Navel)',
    element: 'Water (Jala)',
    color: '#f97316',
    soundFrequencyHz: '417 Hz',
    beejMantra: 'Om Vam Svadhishthanaya Namah',
    healingCrystal: 'Carnelian & Natural Moonstone',
    rudrakshaMukhi: '2-Mukhi & 6-Mukhi Rudraksha',
    governingNumber: 2,
    familyDomain: 'Emotional Warmth, Domestic Adaptability, Generational Respect & Daily Joy',
  },
  {
    chakraNumber: 4,
    chakraName: '4. Solar Plexus Chakra',
    sanskritName: 'Manipura Chakra',
    locationLabel: 'Navel & Solar Plexus Center',
    element: 'Fire (Agni)',
    color: '#eab308',
    soundFrequencyHz: '528 Hz',
    beejMantra: 'Om Ram Manipuraya Namah',
    healingCrystal: 'Natural Citrine & Tiger Eye',
    rudrakshaMukhi: '3-Mukhi & 12-Mukhi Rudraksha',
    governingNumber: 9,
    familyDomain: 'Ego Balance, Family Authority, Mutual Respect of Boundaries & Decision-Making',
  },
  {
    chakraNumber: 5,
    chakraName: '5. Heart Chakra',
    sanskritName: 'Anahata Chakra',
    locationLabel: 'Center of Chest (Heart Space)',
    element: 'Air (Vayu)',
    color: '#22c55e',
    soundFrequencyHz: '639 Hz',
    beejMantra: 'Om Yam Anahataya Namah',
    healingCrystal: 'Natural Rose Quartz & Green Aventurine',
    rudrakshaMukhi: '15-Mukhi & Gauri Shankar Rudraksha',
    governingNumber: 6,
    familyDomain: 'Unconditional Family Love, Forgiveness, Empathy & Healing Past Misunderstandings',
  },
  {
    chakraNumber: 6,
    chakraName: '6. Throat Chakra',
    sanskritName: 'Vishuddha Chakra',
    locationLabel: 'Throat & Vocal Center',
    element: 'Ether (Akasha)',
    color: '#0ea5e9',
    soundFrequencyHz: '741 Hz',
    beejMantra: 'Om Ham Vishuddhaya Namah',
    healingCrystal: 'Blue Lace Agate & Aquamarine',
    rudrakshaMukhi: '5-Mukhi Rudraksha',
    governingNumber: 5,
    familyDomain: 'Respectful Speech, Open Listening, Truthful Expression & Resolving Silent Resentments',
  },
  {
    chakraNumber: 7,
    chakraName: '7. Third Eye Chakra',
    sanskritName: 'Ajna Chakra',
    locationLabel: 'Between the Eyebrows (Brow Center)',
    element: 'Cosmic Mind (Manas)',
    color: '#6366f1',
    soundFrequencyHz: '852 Hz',
    beejMantra: 'Om Sham Ajnaya Namah',
    healingCrystal: 'Natural Amethyst & Lapis Lazuli',
    rudrakshaMukhi: '9-Mukhi & 11-Mukhi Rudraksha',
    governingNumber: 7,
    familyDomain: 'Shared Long-Term Family Vision, Mature Perspective, Wisdom & Intuitive Understanding',
  },
  {
    chakraNumber: 8,
    chakraName: '8. Crown Chakra',
    sanskritName: 'Sahasrara Chakra',
    locationLabel: 'Crown of the Head (Brahmarandhra)',
    element: 'Universal Consciousness (Chit)',
    color: '#a855f7',
    soundFrequencyHz: '963 Hz',
    beejMantra: 'Om Ahava Sahasraraya Hum Phat Swaha',
    healingCrystal: 'Clear Quartz & Natural Selenite',
    rudrakshaMukhi: '1-Mukhi & 5-Mukhi Rudraksha',
    governingNumber: 3,
    familyDomain: 'Spiritual Alignment, Shared Family Dharma, Elder Blessings & Divine Grace',
  },
  {
    chakraNumber: 9,
    chakraName: '9. Soul Star Chakra',
    sanskritName: 'Vyapini / Atma-Tara Chakra',
    locationLabel: '6 Inches Above the Head (Transpersonal Soul Portal)',
    element: 'Pure Divine Light (Parama Jyoti)',
    color: '#f8fafc',
    soundFrequencyHz: '1074 Hz',
    beejMantra: 'Om Hreem Shreem Kleem Parama Jyoti Atma-Tarayai Namah',
    healingCrystal: 'White Selenite Tower & Herkimer Diamond Quartz',
    rudrakshaMukhi: 'Gauri Shankar & 14-Mukhi Rudraksha',
    governingNumber: 1,
    familyDomain: 'Past-Life Soul Contract (Runanubandha), Higher Karmic Purpose & Collective Family Ascension',
  },
];

function computePairChakraScore(
  chakraNum: number,
  governingNum: number,
  cMulank: number,
  cBhagyank: number,
  mMulank: number,
  mBhagyank: number,
  cNamank: number,
  mNamank: number,
  mulankRel: 'friendly' | 'neutral' | 'inimical',
  bhagyankRel: 'friendly' | 'neutral' | 'inimical'
): number {
  let base = 74;
  if (mulankRel === 'friendly') base += 10;
  else if (mulankRel === 'inimical') base -= 11;

  if (bhagyankRel === 'friendly') base += 8;
  else if (bhagyankRel === 'inimical') base -= 9;

  const cGovRel = getPlanetaryRelationship(cMulank, governingNum);
  const mGovRel = getPlanetaryRelationship(mMulank, governingNum);
  const cbGovRel = getPlanetaryRelationship(cBhagyank, governingNum);
  const mbGovRel = getPlanetaryRelationship(mBhagyank, governingNum);

  if (cGovRel === 'friendly') base += 5;
  else if (cGovRel === 'inimical') base -= 6;

  if (mGovRel === 'friendly') base += 5;
  else if (mGovRel === 'inimical') base -= 6;

  if (cbGovRel === 'friendly') base += 3;
  else if (cbGovRel === 'inimical') base -= 4;

  if (mbGovRel === 'friendly') base += 3;
  else if (mbGovRel === 'inimical') base -= 4;

  // Deterministic harmonic modulation by chakra index & names so each of the 9 chakras reflects specific natal interplay
  const delta = ((cMulank * 3 + mMulank * 5 + cBhagyank * 2 + mBhagyank * 7 + cNamank + mNamank + chakraNum * 11) % 15) - 6;
  const raw = base + delta;
  return Math.max(44, Math.min(98, Math.round(raw)));
}

// Planetary lord (1-9) mapped by Janma Rashi index (0 = Mesha .. 11 = Meena)
const RASHI_LORD_NUMBERS = [9, 6, 5, 2, 1, 5, 6, 9, 3, 8, 8, 3];
const RASHI_LORD_LABELS = [
  'Mangal (Mars)',
  'Shukra (Venus)',
  'Budh (Mercury)',
  'Chandra (Moon)',
  'Surya (Sun)',
  'Budh (Mercury)',
  'Shukra (Venus)',
  'Mangal (Mars)',
  'Guru (Jupiter)',
  'Shani (Saturn)',
  'Shani (Saturn)',
  'Guru (Jupiter)',
];

const TARA_NAMES = [
  'Janma Tara (Soul Mirror)',
  'Sampat Tara (Prosperity & Wealth)',
  'Vipat Tara (Karmic Friction)',
  'Kshema Tara (Welfare & Peace)',
  'Pratyak Tara (Ego Obstacles)',
  'Sadhaka Tara (Accomplishment & Support)',
  'Naidhana Tara (Emotional Testing)',
  'Mitra Tara (Friendly Affection)',
  'Ati-Mitra Tara (Deep Divine Bond)',
];

const PARIVAR_RATNA_BY_NUM: Record<
  number,
  {
    primaryGem: string;
    substitute: string;
    carat: string;
    metalFinger: string;
    dayTime: string;
    mantra: string;
    rudraksha: string;
  }
> = {
  1: {
    primaryGem: 'Natural Ruby (Manikya)',
    substitute: 'Red Garnet / Sunstone',
    carat: '3.25 – 5.25 Ratti (3–5 Carat)',
    metalFinger: 'Gold or Copper • Ring Finger of Right Hand',
    dayTime: 'Sunday Morning (06:15 AM – 07:30 AM) in Shukla Paksha',
    mantra: 'Om Hram Hreem Hraum Sah Suryaya Namah (108x)',
    rudraksha: '1-Mukhi & 12-Mukhi Rudraksha (Surya Dignity & Harmony)',
  },
  2: {
    primaryGem: 'Natural Pearl (Moti)',
    substitute: 'White Moonstone',
    carat: '5.25 – 7.25 Ratti (4.5–6.5 Carat)',
    metalFinger: 'Pure Silver • Little Finger of Right Hand',
    dayTime: 'Monday Morning (06:15 AM – 07:30 AM) in Shukla Paksha',
    mantra: 'Om Shram Shreem Shraum Sah Chandramase Namah (108x)',
    rudraksha: '2-Mukhi & Gauri Shankar Rudraksha (Ardhanarishvara Emotional Peace)',
  },
  3: {
    primaryGem: 'Yellow Sapphire (Pukhraj)',
    substitute: 'Yellow Citrine (Sunela)',
    carat: '4.25 – 5.25 Ratti (3.8–4.8 Carat)',
    metalFinger: 'Gold or Panchdhatu • Index Finger of Right Hand',
    dayTime: 'Thursday Morning (06:15 AM – 07:30 AM) in Shukla Paksha',
    mantra: 'Om Gram Greem Graum Sah Gurave Namah (108x)',
    rudraksha: '5-Mukhi & 10-Mukhi Rudraksha (Guru Wisdom & Protection)',
  },
  4: {
    primaryGem: 'Natural Hessonite (Gomed) / Rose Quartz Harmonizer',
    substitute: 'Amber or Honey Agate',
    carat: '5.25 – 6.25 Ratti (4.5–5.5 Carat)',
    metalFinger: 'Silver or Ashtadhatu • Middle Finger of Right Hand',
    dayTime: 'Saturday Evening (After Sunset) in Shukla Paksha',
    mantra: 'Om Bhram Bhreem Bhraum Sah Rahave Namah (108x)',
    rudraksha: '8-Mukhi Rudraksha (Ganesha Obstacle-Removal)',
  },
  5: {
    primaryGem: 'Natural Emerald (Panna)',
    substitute: 'Green Peridot / Green Onyx',
    carat: '4.25 – 5.25 Ratti (3.8–4.8 Carat)',
    metalFinger: 'Gold or Silver • Little Finger of Right Hand',
    dayTime: 'Wednesday Morning (06:15 AM – 07:30 AM) in Shukla Paksha',
    mantra: 'Om Bram Breem Braum Sah Budhaya Namah (108x)',
    rudraksha: '4-Mukhi & 5-Mukhi Rudraksha (Speech Clarity & Understanding)',
  },
  6: {
    primaryGem: 'Natural White Zircon / Diamond (Heera)',
    substitute: 'White Topaz or Opal',
    carat: '3.25 – 5.25 Ratti (White Zircon) / 0.5–1.0 Carat Diamond',
    metalFinger: 'Platinum or Silver • Middle or Little Finger of Right Hand',
    dayTime: 'Friday Morning (06:15 AM – 07:30 AM) in Shukla Paksha',
    mantra: 'Om Dram Dreem Draum Sah Shukraya Namah (108x)',
    rudraksha: '6-Mukhi & Gauri Shankar Rudraksha (Domestic Love & Comfort)',
  },
  7: {
    primaryGem: 'Natural Cat’s Eye (Lehsunia) / Amethyst',
    substitute: 'Tiger Eye or Natural Amethyst',
    carat: '4.25 – 5.25 Ratti (4–5 Carat)',
    metalFinger: 'Silver • Ring or Little Finger of Right Hand',
    dayTime: 'Tuesday or Thursday Dawn in Shukla Paksha',
    mantra: 'Om Stram Streem Straum Sah Ketave Namah (108x)',
    rudraksha: '9-Mukhi Rudraksha (Durga Kavach & Spiritual Detachment)',
  },
  8: {
    primaryGem: 'Blue Sapphire (Neelam) / Natural Amethyst (Jamunia)',
    substitute: 'Natural Amethyst (Jamunia) — Safe Universal Family Stone',
    carat: '5.25 – 7.25 Ratti (Amethyst) • Wear 3-Day Trial for Neelam',
    metalFinger: 'Silver or Panchdhatu • Middle Finger of Right Hand',
    dayTime: 'Saturday Morning/Evening (06:15 AM – 07:30 AM) in Shukla Paksha',
    mantra: 'Om Pram Preem Praum Sah Shanaye Namah (108x)',
    rudraksha: '7-Mukhi & 14-Mukhi Rudraksha (Mahalakshmi Abundance & Karma Shield)',
  },
  9: {
    primaryGem: 'Natural Red Coral (Moonga)',
    substitute: 'Red Carnelian (Aqiq)',
    carat: '5.25 – 7.25 Ratti (5–6.5 Carat)',
    metalFinger: 'Copper or Gold • Ring Finger of Right Hand',
    dayTime: 'Tuesday Morning (06:15 AM – 07:30 AM) in Shukla Paksha',
    mantra: 'Om Kram Kreem Kraum Sah Bhaumaya Namah (108x)',
    rudraksha: '3-Mukhi & 11-Mukhi Rudraksha (Anger Pacification & Courage)',
  },
};

export function calculateParivarVedicAstrologyHarmony(
  clientName: string,
  memberName: string,
  memberRelation: string,
  cAstro: { rashi: string; sunSign: string; nakshatra: string },
  mAstro: { rashi: string; sunSign: string; nakshatra: string }
): ParivarVedicAstrologyHarmony {
  const findRashiIdx = (r: string) =>
    Math.max(
      0,
      VEDIC_RASHIS.findIndex((vr) => vr.toLowerCase().startsWith(r.split(' ')[0].toLowerCase()))
    );
  const findNakIdx = (n: string) =>
    Math.max(
      0,
      VEDIC_NAKSHATRAS.findIndex((vn) => vn.name.toLowerCase() === n.toLowerCase())
    );

  const cRIdx = findRashiIdx(cAstro.rashi);
  const mRIdx = findRashiIdx(mAstro.rashi);
  const dist = ((mRIdx - cRIdx + 12) % 12) + 1; // 1..12 Bhakoot count

  let bhakootAxisLabel = '1-7 Samasaptak (Balanced Mirror Axis)';
  let rashiScore = 78;
  if (dist === 1) {
    bhakootAxisLabel = '1-1 Ek-Rashi (Unified Mind & Shared Home Instinct)';
    rashiScore = 88;
  } else if (dist === 5 || dist === 9) {
    bhakootAxisLabel = '5-9 Trikona (Dharmic Blessings, Wisdom & Mutual Prosperity)';
    rashiScore = 93;
  } else if (dist === 3 || dist === 11) {
    bhakootAxisLabel = '3-11 Labha-Tritya (Active Cooperation, Dialogue & Growth)';
    rashiScore = 86;
  } else if (dist === 4 || dist === 10) {
    bhakootAxisLabel = '4-10 Kendra (Domestic Duty & Mutual Responsibility)';
    rashiScore = 80;
  } else if (dist === 7) {
    bhakootAxisLabel = '1-7 Samasaptak (Complementary Perspective Axis)';
    rashiScore = 84;
  } else if (dist === 2 || dist === 12) {
    bhakootAxisLabel = '2-12 Dwirdwadash (Karmic Expenditure & Boundary Adjustment)';
    rashiScore = 62;
  } else {
    bhakootAxisLabel = '6-8 Shadashtak (Contrasting Temperament — Remedies Recommended)';
    rashiScore = 56;
  }

  const cLordNum = RASHI_LORD_NUMBERS[cRIdx] || 5;
  const mLordNum = RASHI_LORD_NUMBERS[mRIdx] || 5;
  const cLordLabel = RASHI_LORD_LABELS[cRIdx] || 'Budh (Mercury)';
  const mLordLabel = RASHI_LORD_LABELS[mRIdx] || 'Budh (Mercury)';
  const lordRel = getPlanetaryRelationship(cLordNum, mLordNum);
  const rashiLordMaitri =
    cLordNum === mLordNum
      ? `Same Lord Unity (${cLordLabel})`
      : lordRel === 'friendly'
      ? `Mitra (Friendly) — ${cLordLabel} & ${mLordLabel}`
      : lordRel === 'neutral'
      ? `Sama (Balanced) — ${cLordLabel} & ${mLordLabel}`
      : `Shatru (Contrasting Temperament) — ${cLordLabel} vs ${mLordLabel}`;

  const cNIdx = findNakIdx(cAstro.nakshatra);
  const mNIdx = findNakIdx(mAstro.nakshatra);
  const taraNum = (((mNIdx - cNIdx + 27) % 27) % 9); // 0..8
  const taraBalaName = TARA_NAMES[taraNum] || TARA_NAMES[1];
  const isMaleficTara = taraNum === 2 || taraNum === 4 || taraNum === 6;
  const taraBalaFavorability: ParivarVedicAstrologyHarmony['taraBalaFavorability'] =
    isMaleficTara
      ? 'Needs Mantra Pacification'
      : taraNum === 1 || taraNum === 3 || taraNum === 5 || taraNum === 7 || taraNum === 8
      ? 'Supremely Auspicious'
      : 'Balanced';

  if (lordRel === 'friendly') rashiScore = Math.min(97, rashiScore + 5);
  else if (lordRel === 'inimical') rashiScore = Math.max(48, rashiScore - 6);
  if (isMaleficTara) rashiScore = Math.max(46, rashiScore - 6);

  const cSunIdx = findRashiIdx(cAstro.sunSign);
  const mSunIdx = findRashiIdx(mAstro.sunSign);
  const sunElement = (idx: number) =>
    ['Fire', 'Earth', 'Air', 'Water'][idx % 4];
  const cEl = sunElement(cSunIdx);
  const mEl = sunElement(mSunIdx);
  const sunSignSynergy =
    cEl === mEl
      ? `Harmonic ${cEl}-${mEl} Sun Alignment (${cAstro.sunSign.split(' ')[0]} & ${mAstro.sunSign.split(' ')[0]})`
      : `Dynamic ${cEl} + ${mEl} Solar Polarity (${cAstro.sunSign.split(' ')[0]} & ${mAstro.sunSign.split(' ')[0]})`;

  const vedicSummary = `Janma Rashi comparison places ${clientName} (${cAstro.rashi}) and ${memberName} (${mAstro.rashi}, ${memberRelation}) on the ${bhakootAxisLabel} with ${rashiLordMaitri} and ${taraBalaName} (${taraBalaFavorability}).`;

  const vedicRemedy =
    rashiScore >= 78
      ? `Chant Guru Gayatri Mantra ("Om Brihaspataye Vidmahe...") every Thursday morning and offer water mixed with a pinch of turmeric to Tulsi / Peepal to sustain auspicious ${bhakootAxisLabel} family grace.`
      : `To harmonize the ${bhakootAxisLabel} and pacify ${taraBalaName} friction, offer white sweets/kheer to Goddess Parvati & Lord Shiva on Mondays, light a pure ghee diya in the North-East, and chant "Om Namah Shivaya" 27 times together daily.`;

  return {
    bhakootAxisLabel,
    rashiHarmonyScore: rashiScore,
    taraBalaName,
    taraBalaFavorability,
    rashiLordMaitri,
    clientRashiLord: cLordLabel,
    memberRashiLord: mLordLabel,
    sunSignSynergy,
    vedicSummary,
    vedicRemedy,
  };
}

export function calculateParivarGemstoneAndRudraksha(
  clientName: string,
  memberName: string,
  memberRelation: string,
  cMulank: number,
  cBhagyank: number,
  mMulank: number,
  mBhagyank: number,
  cRashi: string,
  mRashi: string,
  chakraDiagnostics: NineChakraParivarDiagnostic[]
): ParivarGemstoneAndRudraksha {
  const findRashiLord = (r: string) => {
    const idx = Math.max(
      0,
      VEDIC_RASHIS.findIndex((vr) => vr.toLowerCase().startsWith(r.split(' ')[0].toLowerCase()))
    );
    return RASHI_LORD_NUMBERS[idx] || 3;
  };
  const cEnemy = new Set(PLANETARY_PROFILES[cMulank]?.enemyNumbers || []);
  const mEnemy = new Set(PLANETARY_PROFILES[mMulank]?.enemyNumbers || []);

  const cLord = findRashiLord(cRashi);
  const mLord = findRashiLord(mRashi);

  // Pick safest harmony stone for client (prefer Guru 3 or Venus 6 or Moon 2 or Rashi Lord if non-inimical)
  const cPick = !cEnemy.has(cLord)
    ? cLord
    : !cEnemy.has(3)
    ? 3
    : !cEnemy.has(6)
    ? 6
    : cBhagyank;
  const mPick = !mEnemy.has(mLord)
    ? mLord
    : !mEnemy.has(3)
    ? 3
    : !mEnemy.has(2)
    ? 2
    : mBhagyank;

  const cGem = PARIVAR_RATNA_BY_NUM[cPick] || PARIVAR_RATNA_BY_NUM[3];
  const mGem = PARIVAR_RATNA_BY_NUM[mPick] || PARIVAR_RATNA_BY_NUM[3];

  const lowestChakra = [...chakraDiagnostics].sort(
    (a, b) => a.alignmentScore - b.alignmentScore
  )[0];

  const familyUnityRudraksha =
    lowestChakra && lowestChakra.alignmentScore < 72
      ? `Gauri Shankar Rudraksha + ${lowestChakra.rudrakshaMukhi} (specifically harmonizes ${lowestChakra.chakraName})`
      : 'Gauri Shankar Rudraksha & 5-Mukhi Rudraksha (Universal Parivar Unity Shield)';

  return {
    clientGemstone: `${cGem.primaryGem} (for ${clientName})`,
    memberGemstone: `${mGem.primaryGem} (for ${memberName} • ${memberRelation})`,
    gemstoneSubstitute: `${clientName}: ${cGem.substitute} | ${memberName}: ${mGem.substitute}`,
    weightAndCarat: `${cGem.carat} (Set with open-back so gem touches skin)`,
    metalAndFinger: `${clientName}: ${cGem.metalFinger} | ${memberName}: ${mGem.metalFinger}`,
    wearingDayAndTime: `${clientName}: ${cGem.dayTime} | ${memberName}: ${mGem.dayTime}`,
    gemMantra: `${cGem.mantra} & ${mGem.mantra}`,
    clientRudraksha: cGem.rudraksha,
    memberRudraksha: mGem.rudraksha,
    familyUnityRudraksha,
    rudrakshaWearingMethod:
      'Energize in Gangajal & raw cow milk on Monday morning before sunrise, apply white sandalwood tilak, and wear around the neck on a red silk thread or silver/gold capping.',
    rudrakshaMantra: 'Om Namah Shivaya (108x) + Om Gauri Shankaraya Namah (27x)',
    whyRecommended: `Calibrated for ${clientName} (${cRashi}) & ${memberName} (${mRashi}, ${memberRelation}) to dissolve ${
      lowestChakra ? `${lowestChakra.chakraName} (${lowestChakra.alignmentScore}%)` : 'subtle'
    } planetary stress and deepen lifelong family peace, emotional respect, and prosperity.`,
  };
}

export function calculateParivarMilanReport(
  clientProfile: {
    name: string;
    dob: string;
    tob?: string;
    pob?: string;
    lat?: number;
    lng?: number;
  },
  familyMembers: ParivarMemberRecord[]
): ParivarMilanCompleteReport {
  const cMulank = calculateMulank(clientProfile.dob || '1990-01-01');
  const cBhagyank = calculateBhagyank(clientProfile.dob || '1990-01-01');
  const cNameAnalysis = analyzeName(clientProfile.name || 'Client', cMulank, cBhagyank);
  const cNamank = cNameAnalysis.chaldeanSingle;
  const cPlanet = PLANETARY_PROFILES[cMulank] || PLANETARY_PROFILES[1];
  const cbPlanet = PLANETARY_PROFILES[cBhagyank] || PLANETARY_PROFILES[1];
  const cAstro = calculateVedicAstrologyFromBirth(
    clientProfile.dob || '1990-01-01',
    clientProfile.tob || '09:30',
    clientProfile.lat ?? 28.6139,
    clientProfile.lng ?? 77.209
  );

  const validMembers = familyMembers.filter((m) => m.name.trim() && m.dob.trim());

  const memberResults: ParivarMemberHarmonyResult[] = validMembers.map((member) => {
    const mMulank = calculateMulank(member.dob);
    const mBhagyank = calculateBhagyank(member.dob);
    const mNameAnalysis = analyzeName(member.name, mMulank, mBhagyank);
    const mNamank = mNameAnalysis.chaldeanSingle;
    const mPlanet = PLANETARY_PROFILES[mMulank] || PLANETARY_PROFILES[1];
    const mbPlanet = PLANETARY_PROFILES[mBhagyank] || PLANETARY_PROFILES[1];
    const mAstro = calculateVedicAstrologyFromBirth(
      member.dob,
      member.tob || '09:30',
      member.lat ?? 28.6139,
      member.lng ?? 77.209
    );

    const mulankRel = getPlanetaryRelationship(cMulank, mMulank);
    const bhagyankRel = getPlanetaryRelationship(cBhagyank, mBhagyank);

    const nineChakraDiagnostics: NineChakraParivarDiagnostic[] = NINE_CHAKRAS_MASTER_LIST.map(
      (bp) => {
        const score = computePairChakraScore(
          bp.chakraNumber,
          bp.governingNumber,
          cMulank,
          cBhagyank,
          mMulank,
          mBhagyank,
          cNamank,
          mNamank,
          mulankRel,
          bhagyankRel
        );

        const status: 'Harmonious' | 'Moderate Blockage' | 'Severe Karmic Challenge' =
          score >= 76
            ? 'Harmonious'
            : score >= 62
            ? 'Moderate Blockage'
            : 'Severe Karmic Challenge';

        const cGovRel = getPlanetaryRelationship(cMulank, bp.governingNumber);
        const mGovRel = getPlanetaryRelationship(mMulank, bp.governingNumber);

        const affectedPerson =
          status === 'Harmonious'
            ? `Mutually Balanced (${clientProfile.name} & ${member.name})`
            : cGovRel === 'inimical' && mGovRel !== 'inimical'
            ? `${clientProfile.name} (Client)`
            : mGovRel === 'inimical' && cGovRel !== 'inimical'
            ? `${member.name} (${member.relation})`
            : `Both ${clientProfile.name} & ${member.name} (${member.relation})`;

        const clientPatternDetail = `Governed by Mulank ${cMulank} (${cPlanet.planet}) & Bhagyank ${cBhagyank} (${cbPlanet.planet}) in ${cAstro.rashi}, ${clientProfile.name} approaches ${bp.familyDomain.toLowerCase()} through ${cPlanet.element.toLowerCase()}-element ${cPlanet.traits.slice(0, 2).join(' and ').toLowerCase()}.`;

        const memberPatternDetail = `As ${clientProfile.name}'s ${member.relation}, ${member.name} (Mulank ${mMulank} ${mPlanet.planet}, Bhagyank ${mBhagyank} ${mbPlanet.planet}, ${mAstro.rashi}) expresses ${bp.sanskritName} energy through ${mPlanet.element.toLowerCase()}-element ${mPlanet.traits.slice(0, 2).join(' and ').toLowerCase()}.`;

        let mutualFamilyIssue = '';
        let astrologicalDiagnosis = '';

        if (bp.chakraNumber === 1) {
          // Earth Star Chakra (Vasundhara)
          mutualFamilyIssue =
            status === 'Harmonious'
              ? `Strong ancestral and home grounding between ${clientProfile.name} and ${member.name} (${member.relation}). Both anchor peace and stability in the household.`
              : `Unresolved ancestral (Pitru) expectations or differences in household routines between ${clientProfile.name} and ${member.name} (${member.relation}) create subtle restlessness in the home aura.`;
          astrologicalDiagnosis = `Earth Star (${bp.sanskritName}) links ${cPlanet.planet} (${cAstro.nakshatra}) with ${mPlanet.planet} (${mAstro.nakshatra}) across generational roots (${score}% resonance).`;
        } else if (bp.chakraNumber === 9) {
          // Soul Star Chakra (Vyapini / Atma-Tara)
          mutualFamilyIssue =
            status === 'Harmonious'
              ? `A deeply auspicious past-life Runanubandha (soul contract) unites ${clientProfile.name} and ${member.name} (${member.relation}) for mutual spiritual elevation and family fortune.`
              : `Past-life karmic debt (Runanubandha) between ${clientProfile.name} and ${member.name} (${member.relation}) triggers unspoken expectations until conscious gratitude and spiritual forgiveness are practiced.`;
          astrologicalDiagnosis = `Soul Star (${bp.sanskritName}) reflects the transpersonal destiny bridge between Bhagyank ${cBhagyank} (${cbPlanet.planet}) and Bhagyank ${mBhagyank} (${mbPlanet.planet}).`;
        } else {
          mutualFamilyIssue =
            status === 'Harmonious'
              ? `Natural synergy in ${bp.familyDomain.toLowerCase()}. ${clientProfile.name} and ${member.name} (${member.relation}) intuitively support each other's emotional and practical growth.`
              : status === 'Moderate Blockage'
              ? `Occasional wavelength differences in ${bp.familyDomain.toLowerCase()} when ${cPlanet.planet} (Mulank ${cMulank}) and ${mPlanet.planet} (Mulank ${mMulank}) react under stress or transit pressure.`
              : `Recurring sensitivity and friction in ${bp.familyDomain.toLowerCase()} due to contrasting planetary temperaments between ${cPlanet.planet} (${clientProfile.name}) and ${mPlanet.planet} (${member.name}).`;
          astrologicalDiagnosis = `${bp.chakraName} (${bp.sanskritName}) is governed by ${PLANETARY_PROFILES[bp.governingNumber]?.planet || 'Navagraha'} (#${bp.governingNumber}), interacting with ${cAstro.rashi} and ${mAstro.rashi} (${score}% alignment).`;
        }

        const auraScanRemedy = `Cleanse the ${bp.chakraName} aura centre using ${bp.healingCrystal}, wear/keep ${bp.rudrakshaMukhi}, and play ${bp.soundFrequencyHz} sacred sound frequency for 11 minutes in the family living space.`;

        const clientRemedy = `Chant "${cPlanet.beejMantra}" (27x) and "${bp.beejMantra}" (27x) every morning; hold ${bp.healingCrystal.split('&')[0].trim()} in the right hand for 5 minutes while sending positive vibrations to ${member.name}.`;

        const memberRemedy = `Encourage ${member.name} (${member.relation}) to wear ${mPlanet.luckyColor} accents on ${mPlanet.luckyDays[0] || 'Thursday'} and keep energized ${bp.healingCrystal} or ${bp.rudrakshaMukhi} near their bedside or study/work table.`;

        const jointFamilyRemedy = `Keep ${bp.healingCrystal} in the ${bp.chakraNumber <= 3 ? 'South-West' : bp.chakraNumber <= 6 ? 'North-East' : 'Center (Brahmasthan)'} of the family home, light a pure cow-ghee lamp on Shukla Purnima, and listen to ${bp.soundFrequencyHz} together for 10 minutes.`;

        return {
          chakraNumber: bp.chakraNumber,
          chakraName: bp.chakraName,
          sanskritName: bp.sanskritName,
          locationLabel: bp.locationLabel,
          element: bp.element,
          color: bp.color,
          soundFrequencyHz: bp.soundFrequencyHz,
          beejMantra: bp.beejMantra,
          healingCrystal: bp.healingCrystal,
          rudrakshaMukhi: bp.rudrakshaMukhi,
          alignmentScore: score,
          status,
          affectedPerson,
          clientPatternDetail,
          memberPatternDetail,
          mutualFamilyIssue,
          astrologicalDiagnosis,
          auraScanRemedy,
          clientRemedy,
          memberRemedy,
          jointFamilyRemedy,
        };
      }
    );

    const avgChakraScore = Math.round(
      nineChakraDiagnostics.reduce((acc, ch) => acc + ch.alignmentScore, 0) /
        nineChakraDiagnostics.length
    );

    const harmonyVerdict: ParivarMemberHarmonyResult['harmonyVerdict'] =
      avgChakraScore >= 80
        ? 'Supremely Harmonious'
        : avgChakraScore >= 70
        ? 'Good Family Harmony'
        : avgChakraScore >= 60
        ? 'Moderate (Needs Balancing)'
        : 'Karmic Friction (Remedy Advised)';

    const strongChakras = nineChakraDiagnostics
      .filter((c) => c.alignmentScore >= 75)
      .slice(0, 3)
      .map((c) => `${c.chakraName} (${c.alignmentScore}%)`);

    const weakChakras = nineChakraDiagnostics
      .filter((c) => c.alignmentScore < 70)
      .slice(0, 3)
      .map((c) => `${c.chakraName} (${c.alignmentScore}%)`);

    const executiveSummary = `${clientProfile.name} (Mulank ${cMulank} ${cPlanet.planet}, Bhagyank ${cBhagyank} ${cbPlanet.planet}, ${cAstro.rashi}) shares a ${avgChakraScore}% 9-Chakra Parivar Harmony with ${member.name} (${member.relation} • Mulank ${mMulank} ${mPlanet.planet}, Bhagyank ${mBhagyank} ${mbPlanet.planet}, ${mAstro.rashi}). ${
      strongChakras.length > 0
        ? `Strongest energetic bonds flow through ${strongChakras.join(', ')}. `
        : ''
    }${
      weakChakras.length > 0
        ? `Targeted chakra remedies are recommended for ${weakChakras.join(', ')} to ensure lifelong peace, respect, and prosperity.`
        : 'All 9 chakras vibrate in supportive family alignment.'
    }`;

    const vedicAstrologyHarmony = calculateParivarVedicAstrologyHarmony(
      clientProfile.name,
      member.name,
      member.relation,
      cAstro,
      mAstro
    );

    const gemstoneAndRudrakshaRemedy = calculateParivarGemstoneAndRudraksha(
      clientProfile.name,
      member.name,
      member.relation,
      cMulank,
      cBhagyank,
      mMulank,
      mBhagyank,
      cAstro.rashi,
      mAstro.rashi,
      nineChakraDiagnostics
    );

    return {
      member,
      clientMulank: cMulank,
      clientBhagyank: cBhagyank,
      clientNamank: cNamank,
      memberMulank: mMulank,
      memberBhagyank: mBhagyank,
      memberNamank: mNamank,
      clientAstrology: {
        rashi: cAstro.rashi,
        sunSign: cAstro.sunSign,
        nakshatra: cAstro.nakshatra,
        pada: cAstro.pada,
      },
      memberAstrology: {
        rashi: mAstro.rashi,
        sunSign: mAstro.sunSign,
        nakshatra: mAstro.nakshatra,
        pada: mAstro.pada,
      },
      overallHarmonyScore: avgChakraScore,
      harmonyVerdict,
      mulankRelation: mulankRel,
      bhagyankRelation: bhagyankRel,
      executiveSummary,
      keyStrengths:
        strongChakras.length > 0
          ? strongChakras
          : ['Shared family commitment & protective ancestral grace'],
      keyFrictions:
        weakChakras.length > 0
          ? weakChakras
          : ['Minor communication pacing during planetary retrogrades'],
      nineChakraDiagnostics,
      vedicAstrologyHarmony,
      gemstoneAndRudrakshaRemedy,
    };
  });

  const averageFamilyHarmony =
    memberResults.length > 0
      ? Math.round(
          memberResults.reduce((acc, r) => acc + r.overallHarmonyScore, 0) /
            memberResults.length
        )
      : 0;

  const sortedByScore = [...memberResults].sort(
    (a, b) => b.overallHarmonyScore - a.overallHarmonyScore
  );

  const mostHarmoniousMember =
    sortedByScore.length > 0
      ? {
          name: sortedByScore[0].member.name,
          relation: sortedByScore[0].member.relation,
          score: sortedByScore[0].overallHarmonyScore,
        }
      : null;

  const mostChallengingMember =
    sortedByScore.length > 0
      ? {
          name: sortedByScore[sortedByScore.length - 1].member.name,
          relation: sortedByScore[sortedByScore.length - 1].member.relation,
          score: sortedByScore[sortedByScore.length - 1].overallHarmonyScore,
        }
      : null;

  const familyCollectiveVerdict =
    averageFamilyHarmony >= 80
      ? 'Supremely Auspicious & Unified Parivar Aura'
      : averageFamilyHarmony >= 70
      ? 'Harmonious & Supportive Family Vibration'
      : averageFamilyHarmony >= 60
      ? 'Moderate Family Resonance — Chakra Balancing Advised'
      : 'Sensitive Karmic Family Matrix — Daily Parivar Remedies Essential';

  const collectiveHomeVastuAndParivarRemedy = `To harmonize all ${memberResults.length || 1} family members with ${clientProfile.name}, place a natural White Selenite Tower (Soul Star Chakra) and Rose Quartz cluster (Heart Chakra) in the North-East (Ishan Kon) prayer altar, keep Black Tourmaline / Himalayan Rock Salt in the South-West (Earth Star grounding), mop the home with sea-salt water every Saturday, and chant "Om Sarve Bhavantu Sukhinah" + "${cbPlanet.beejMantra}" (27x) together on Shukla Purnima.`;

  const collectiveGemstoneAndRudrakshaRemedy = `Complete Family Ratna & Rudraksha Protocol: Keep an energized Gauri Shankar Rudraksha & 5-Mukhi Rudraksha mala in the North-East prayer altar (puja ghar) alongside a Natural Yellow Sapphire / Citrine & Rose Quartz crystal sphere to bless ${clientProfile.name} and all ${memberResults.length || 1} family members with unconditional harmony. Each member may wear their individually prescribed Rashi Gemstone & Rudraksha after Gangajal-Panchamrit purification on a Shukla Paksha Monday/Thursday morning.`;

  return {
    clientName: clientProfile.name,
    clientDob: clientProfile.dob,
    clientMulank: cMulank,
    clientBhagyank: cBhagyank,
    averageFamilyHarmony,
    familyCollectiveVerdict,
    mostHarmoniousMember,
    mostChallengingMember,
    memberResults,
    collectiveHomeVastuAndParivarRemedy,
    collectiveGemstoneAndRudrakshaRemedy,
    importantDisclaimer: PARIVAR_MILAN_DISCLAIMER,
  };
}
