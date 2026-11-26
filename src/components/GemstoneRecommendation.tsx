import React, { useState, useMemo, useEffect } from 'react';
import {
  Gem,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Sun,
  Moon,
  Compass,
  Scale,
  Clock,
  Calendar,
  Hand,
  Award,
  Flame,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeName,
  CELESTIAL_TRANSITS,
} from '../utils/numerology';
import {
  calculateVedicAstrologyFromBirth,
} from '../utils/astrologyAndCities';
import { useTathastu } from '../utils/tathastuStore';

interface GemstoneRecommendationProps {
  profile: BirthProfile;
}

export interface VedicRatnaDetail {
  number: number;
  planet: string;
  sanskritPlanet: string;
  primaryGem: string;
  sanskritGem: string;
  sanskritName?: string;
  upratna: string;
  substituteStone?: string;
  colorRay: string;
  chakra: string;
  metal: string;
  finger: string;
  wearingFinger?: string;
  wearingDay: string;
  auspiciousTimeWindow: string;
  wearingDayTime?: string;
  pakshaAndNakshatra: string;
  beejMantra: string;
  mantra?: string;
  purificationLiquid: string;
  coreBenefits: string[];
  benefits?: string[];
  badgeColor: string;
}

const RAW_VEDIC_RATNA_DATABASE: Record<number, VedicRatnaDetail> = {
  1: {
    number: 1,
    planet: 'Sun',
    sanskritPlanet: 'Surya (सूर्य)',
    primaryGem: 'Natural Burmese Ruby',
    sanskritGem: 'Manikya (माणिक्य)',
    upratna: 'Red Garnet (Tamda) / Red Spinel / Sunstone',
    colorRay: 'Crimson Solar Ruby Ray',
    chakra: 'Manipura (Solar Plexus) & Sahasrara (Crown)',
    metal: '22K Yellow Gold or Pure Copper (Tamra)',
    finger: 'Ring Finger (Anamika) of Right Hand',
    wearingDay: 'Sunday (Ravivar)',
    auspiciousTimeWindow: '06:15 AM – 07:30 AM (Surya Hora after Sunrise)',
    pakshaAndNakshatra: 'Shukla Paksha • Krittika, Uttara Phalguni, or Uttara Ashadha Nakshatra',
    beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः (Om Hram Hreem Hroum Sah Suryaya Namah — 108x)',
    purificationLiquid: 'Raw Cow Milk, Gangajal, Honey & Red Lotus Petals',
    coreBenefits: [
      'Amplifies leadership authority, government favor, royal charisma, and executive command.',
      'Strengthens vital immunity, heart vigor, eyesight, and willpower against career obstacles.',
      'Neutralizes solar afflictions (Pitru Dosha / weak lagna lord) and attracts high-status recognition.',
    ],
    badgeColor: 'from-amber-500/30 via-orange-600/20 to-red-700/30 border-amber-400/50 text-amber-200',
  },
  2: {
    number: 2,
    planet: 'Moon',
    sanskritPlanet: 'Chandra (चन्द्र)',
    primaryGem: 'Natural Basra / South Sea Pearl',
    sanskritGem: 'Moti / Mukta (मोती)',
    upratna: 'Natural Moonstone (Chandrakanta Mani) / White Agate',
    colorRay: 'Luminous Milky Silver-White Ray',
    chakra: 'Swadhisthana (Sacral) & Ajna (Third Eye)',
    metal: 'Pure Sterling Silver (Chandi)',
    finger: 'Little Finger (Kanishthika) of Right Hand',
    wearingDay: 'Monday (Somvar)',
    auspiciousTimeWindow: '06:30 AM – 08:00 AM or Evening Purnima/Shukla Hora (06:00 PM – 07:15 PM)',
    pakshaAndNakshatra: 'Shukla Paksha • Rohini, Hasta, or Shravana Nakshatra',
    beejMantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः (Om Shram Shreem Shroum Sah Chandramase Namah — 108x)',
    purificationLiquid: 'Unboiled Cow Milk, Gangajal, Rose Water & White Sandalwood',
    coreBenefits: [
      'Calms emotional turbulence, overthinking, anxiety, and Kemadruma / Chandra-Grahan blocks.',
      'Enhances intuition, psychic receptivity, maternal blessings, peace of mind, and liquid cash flow.',
      'Brings marital tenderness, creative imagination, and restful sleep.',
    ],
    badgeColor: 'from-slate-300/25 via-sky-400/15 to-indigo-500/25 border-sky-300/50 text-sky-100',
  },
  3: {
    number: 3,
    planet: 'Jupiter',
    sanskritPlanet: 'Guru / Brihaspati (बृहस्पति)',
    primaryGem: 'Ceylon Yellow Sapphire',
    sanskritGem: 'Pukhraj (पुखराज)',
    upratna: 'Golden Citrine (Sunela) / Yellow Topaz',
    colorRay: 'Sacred Golden-Yellow Brihaspati Ray',
    chakra: 'Manipura (Solar Plexus) & Sahasrara (Crown)',
    metal: '22K Yellow Gold or Panchdhatu',
    finger: 'Index Finger (Tarjani) of Right Hand',
    wearingDay: 'Thursday (Guruvar)',
    auspiciousTimeWindow: '06:15 AM – 07:45 AM (Morning Guru Hora)',
    pakshaAndNakshatra: 'Shukla Paksha • Punarvasu, Vishakha, or Purva Bhadrapada Nakshatra',
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः (Om Gram Greem Groum Sah Gurave Namah — 108x)',
    purificationLiquid: 'Cow Milk, Gangajal, Turmeric (Haldi), Honey & Yellow Flowers',
    coreBenefits: [
      'Unlocks divine Guru Kripa, higher wisdom, Dharmic wealth, treasury expansion, and academic mastery.',
      'Accelerates auspicious marriage yoga, progeny blessings, and spiritual protection.',
      'Stabilizes ethical judgment, advisory authority, and long-term financial prosperity.',
    ],
    badgeColor: 'from-yellow-400/30 via-amber-500/20 to-amber-700/30 border-yellow-400/50 text-yellow-100',
  },
  4: {
    number: 4,
    planet: 'Rahu (Uranus)',
    sanskritPlanet: 'Rahu (राहु)',
    primaryGem: 'Ceylon Hessonite Garnet',
    sanskritGem: 'Gomed (गोमेद)',
    upratna: 'Spessartite Orange-Brown Garnet / Black Tourmaline / Sulemani Hakik',
    colorRay: 'Smoky Honey-Cinnamon Ultraviolet Ray',
    chakra: 'Muladhara (Root Chakra)',
    metal: 'Ashtadhatu, Panchdhatu, or Pure Silver',
    finger: 'Middle Finger (Madhyama) of Right Hand',
    wearingDay: 'Saturday (Shanivar) or Wednesday Evening',
    auspiciousTimeWindow: '05:45 PM – 07:00 PM (Twilight Sandhya Hora)',
    pakshaAndNakshatra: 'Shukla Paksha • Ardra, Swati, or Shatabhisha Nakshatra',
    beejMantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः (Om Bhram Bhreem Bhroum Sah Rahave Namah — 108x)',
    purificationLiquid: 'Gangajal, Cow Urine (Gomutra), Raw Milk & Black Sesame (Til)',
    coreBenefits: [
      'Transmutes sudden Rahu illusions, mental fog, and hidden conspiracies into strategic breakthroughs.',
      'Empowers success in digital technology, foreign trade, politics, media, and unconventional ventures.',
      'Protects the aura from evil eye (Nazar Dosha), sudden financial reversals, and Kaal Sarp vibrations.',
    ],
    badgeColor: 'from-orange-700/30 via-amber-900/30 to-slate-800/40 border-orange-400/40 text-orange-200',
  },
  5: {
    number: 5,
    planet: 'Mercury',
    sanskritPlanet: 'Budha (बुध)',
    primaryGem: 'Zambian / Colombian Natural Emerald',
    sanskritGem: 'Panna (पन्ना)',
    upratna: 'Natural Peridot / Green Tourmaline / Green Jade (Marakata)',
    colorRay: 'Vibrant Pranic Emerald Green Ray',
    chakra: 'Anahata (Heart) & Vishuddha (Throat)',
    metal: '22K Gold or Sterling Silver',
    finger: 'Little Finger (Kanishthika) of Right Hand',
    wearingDay: 'Wednesday (Budhavar)',
    auspiciousTimeWindow: '06:30 AM – 08:15 AM (Budha Hora)',
    pakshaAndNakshatra: 'Shukla Paksha • Ashlesha, Jyeshtha, or Revati Nakshatra',
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः (Om Bram Breem Broum Sah Budhaya Namah — 108x)',
    purificationLiquid: 'Gangajal, Raw Cow Milk, Tulsi Leaves & Green Moong',
    coreBenefits: [
      'Sharpens commercial intelligence, banking acumen, stock/trade timing, and eloquent communication.',
      'Harmonizes the nervous system, speech clarity, analytical memory, and diplomatic negotiation.',
      'Attracts multi-stream business revenue, rapid client trust, and intellectual distinction.',
    ],
    badgeColor: 'from-emerald-500/30 via-teal-600/20 to-green-800/30 border-emerald-400/50 text-emerald-100',
  },
  6: {
    number: 6,
    planet: 'Venus',
    sanskritPlanet: 'Shukra (शुक्र)',
    primaryGem: 'Natural White Sapphire / Diamond / Opal',
    sanskritGem: 'Heera / Safed Pukhraj / Dudhiya Opal (हीरा / ओपल)',
    upratna: 'Australian Fire Opal / White Zircon (Jarkan) / Clear Quartz (Sphatik)',
    colorRay: 'Iridescent Prismatic White-Pink Shukra Ray',
    chakra: 'Swadhisthana (Sacral) & Anahata (Heart)',
    metal: 'Platinum, White Gold, or Pure Sterling Silver',
    finger: 'Middle Finger or Ring Finger of Right Hand',
    wearingDay: 'Friday (Shukravar)',
    auspiciousTimeWindow: '06:15 AM – 07:45 AM (Morning Shukra Hora)',
    pakshaAndNakshatra: 'Shukla Paksha • Bharani, Purva Phalguni, or Purva Ashadha Nakshatra',
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः (Om Dram Dreem Droum Sah Shukraya Namah — 108x)',
    purificationLiquid: 'Raw Cow Milk, Rose Water, Gangajal, Sugar Candy (Mishri) & White Flowers',
    coreBenefits: [
      'Magnetizes luxury, artistic brilliance, aesthetic magnetism, hospitality success, and material abundance.',
      'Deepens conjugal bliss, romantic harmony, partner devotion, and domestic beauty.',
      'Strengthens reproductive vitality, kidney/endocrine balance, and social grace.',
    ],
    badgeColor: 'from-pink-400/25 via-rose-500/20 to-purple-600/25 border-pink-300/50 text-pink-100',
  },
  7: {
    number: 7,
    planet: 'Ketu (Neptune)',
    sanskritPlanet: 'Ketu (केतु)',
    primaryGem: 'Chrysoberyl Cat’s Eye',
    sanskritGem: 'Lehsuniya / Vaidurya (लहसुनिया / वैदूर्य)',
    upratna: 'Golden Tiger’s Eye / Turquoise (Firoza) / Amethyst',
    colorRay: 'Mystic Chatoyant Green-Gold Ray',
    chakra: 'Ajna (Third Eye) & Sahasrara (Crown)',
    metal: 'Pure Sterling Silver or Panchdhatu',
    finger: 'Middle Finger or Little Finger of Right Hand',
    wearingDay: 'Tuesday (Mangalvar) or Thursday Evening',
    auspiciousTimeWindow: '06:30 AM – 08:00 AM or Sunset Hora (05:45 PM – 06:45 PM)',
    pakshaAndNakshatra: 'Shukla Paksha • Ashwini, Magha, or Moola Nakshatra',
    beejMantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः (Om Sram Sreem Sroum Sah Ketave Namah — 108x)',
    purificationLiquid: 'Gangajal, Raw Milk, Kusha Grass & White Sesame',
    coreBenefits: [
      'Awakens razor-sharp intuition, occult mastery, research depth, and spiritual liberation (Moksha).',
      'Shields against mysterious ailments, sudden energy drain, past-life karmic knots, and psychic attacks.',
      'Stabilizes focus for healers, doctors, scientists, strategists, and contemplative seekers.',
    ],
    badgeColor: 'from-teal-500/25 via-cyan-600/20 to-slate-700/30 border-teal-400/50 text-teal-100',
  },
  8: {
    number: 8,
    planet: 'Saturn',
    sanskritPlanet: 'Shani (शनि)',
    primaryGem: 'Ceylon Blue Sapphire (after 3-day trial) / Amethyst',
    sanskritGem: 'Neelam / Jamuniya (नीलम / कटैला)',
    upratna: 'Natural Amethyst (Jamuniya) / Iolite (Neeli) / Lapis Lazuli (Lajward)',
    colorRay: 'Deep Cosmic Indigo-Violet Shani Ray',
    chakra: 'Muladhara (Root) & Ajna (Command)',
    metal: 'Panchdhatu, Ashtadhatu, or Sterling Silver',
    finger: 'Middle Finger (Madhyama) of Right Hand',
    wearingDay: 'Saturday (Shanivar)',
    auspiciousTimeWindow: '05:30 PM – 07:00 PM (Evening Shani Hora)',
    pakshaAndNakshatra: 'Shukla Paksha • Pushya, Anuradha, or Uttara Bhadrapada Nakshatra',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः (Om Pram Preem Proum Sah Shanaishcharaya Namah — 108x)',
    purificationLiquid: 'Gangajal, Raw Cow Milk, Black Sesame Seeds (Kala Til) & Blue Aparajita Flower',
    coreBenefits: [
      'Transforms chronic delays, Sade-Sati / Dhaiya heaviness, and karmic tests into disciplined empire building.',
      'Accelerates breakthroughs in real estate, manufacturing, law, mining, infrastructure, and long-term assets.',
      'Bestows unshakeable endurance, justice, debt clearance, and protection from workplace politics.',
    ],
    badgeColor: 'from-blue-600/30 via-indigo-700/25 to-slate-900/40 border-blue-400/50 text-blue-100',
  },
  9: {
    number: 9,
    planet: 'Mars',
    sanskritPlanet: 'Mangal / Kuja (मंगल)',
    primaryGem: 'Italian / Mediterranean Red Coral',
    sanskritGem: 'Moonga / Praval (मूंगा)',
    upratna: 'Red Carnelian / Bloodstone / Red Jasper',
    colorRay: 'Fiery Vermilion Martial Ray',
    chakra: 'Muladhara (Root) & Manipura (Solar Plexus)',
    metal: '22K Gold or Pure Copper (Tamra)',
    finger: 'Ring Finger (Anamika) of Right Hand',
    wearingDay: 'Tuesday (Mangalvar)',
    auspiciousTimeWindow: '06:15 AM – 07:45 AM (Morning Mangal Hora)',
    pakshaAndNakshatra: 'Shukla Paksha • Mrigashira, Chitra, or Dhanishta Nakshatra',
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः (Om Kram Kreem Kroum Sah Bhaumaya Namah — 108x)',
    purificationLiquid: 'Raw Cow Milk, Gangajal, Honey & Red Sandalwood (Rakta Chandan)',
    coreBenefits: [
      'Ignites fearless courage, physical stamina, decisive execution, and victory over competitors/litigation.',
      'Harmonizes Mangal Dosha, blood vitality, bone marrow strength, and land/property acquisition.',
      'Empowers commanders, surgeons, athletes, engineers, and entrepreneurs to finish complex missions.',
    ],
    badgeColor: 'from-red-600/30 via-rose-700/25 to-orange-800/30 border-red-400/50 text-red-100',
  },
};

export const VEDIC_RATNA_DATABASE: Record<number, VedicRatnaDetail> = Object.fromEntries(
  Object.entries(RAW_VEDIC_RATNA_DATABASE).map(([k, v]) => [
    Number(k),
    {
      ...v,
      sanskritName: v.sanskritGem,
      substituteStone: v.upratna,
      wearingFinger: v.finger,
      wearingDayTime: `${v.wearingDay} • ${v.auspiciousTimeWindow}`,
      mantra: v.beejMantra,
      benefits: v.coreBenefits,
    },
  ])
);

const PLANET_NAME_TO_NUMBER: Record<string, number> = {
  Sun: 1,
  Moon: 2,
  Jupiter: 3,
  Rahu: 4,
  Mercury: 5,
  Venus: 6,
  Ketu: 7,
  Saturn: 8,
  Mars: 9,
};

export function calculateGemstoneRecommendationsForProfile(
  profile: BirthProfile,
  bodyWeightKg: number = 68
) {
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const nameAnalysis = analyzeName(profile.name, mulank, bhagyank);
  const autoAstro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.209
  );

  // Extract Nakshatra Lord number
  const nakLordClean = (autoAstro.nakshatraLord || 'Jupiter').split(' ')[0].trim();
  const nakshatraPlanetNum = PLANET_NAME_TO_NUMBER[nakLordClean] || bhagyank;

  // Rashi Lord mapping
  const rashiText = autoAstro.rashi.toLowerCase();
  let rashiLordNum = bhagyank;
  if (rashiText.includes('mesh') || rashiText.includes('vrishchik')) rashiLordNum = 9; // Mars
  else if (rashiText.includes('vrishabh') || rashiText.includes('tula')) rashiLordNum = 6; // Venus
  else if (rashiText.includes('mithun') || rashiText.includes('kanya')) rashiLordNum = 5; // Mercury
  else if (rashiText.includes('karka')) rashiLordNum = 2; // Moon
  else if (rashiText.includes('simha')) rashiLordNum = 1; // Sun
  else if (rashiText.includes('dhanu') || rashiText.includes('meen')) rashiLordNum = 3; // Jupiter
  else if (rashiText.includes('makar') || rashiText.includes('kumbh')) rashiLordNum = 8; // Saturn

  // Calculate Transit (Gochar) Gemstone based on current CELESTIAL_TRANSITS + user's chart
  // Jupiter & Saturn are the two primary slow-moving Gochar pillars, plus Rahu-Ketu axis
  const mulankProfile = PLANETARY_PROFILES[mulank];
  const bhagyankProfile = PLANETARY_PROFILES[bhagyank];
  const enemySet = new Set([
    ...(mulankProfile?.enemyNumbers || []),
    ...(bhagyankProfile?.enemyNumbers || []),
  ]);

  // Select the most harmonious Gochar Amplifier stone that is NOT an enemy of Mulank/Bhagyank
  let transitPlanetNum = 3; // Default Jupiter (Guru Gochar in Gemini/Cancer)
  if (!enemySet.has(3)) {
    transitPlanetNum = 3;
  } else if (!enemySet.has(5)) {
    transitPlanetNum = 5; // Mercury
  } else if (!enemySet.has(6)) {
    transitPlanetNum = 6; // Venus
  } else {
    transitPlanetNum = mulank;
  }

  // Exact Ratti & Carat calculation from body weight
  // Classical Ratna-Shastra rule: 1 Ratti per 10–12 kg of body weight (minimum 4.25 Ratti, max 11.25 Ratti)
  const idealRattiMin = Math.max(4.25, Math.round((bodyWeightKg / 12) * 4) / 4);
  const idealRattiMax = Math.max(5.25, Math.round((bodyWeightKg / 10) * 4) / 4);
  const idealCaratMin = Number((idealRattiMin * 0.91).toFixed(2));
  const idealCaratMax = Number((idealRattiMax * 0.91).toFixed(2));

  const lifeStone = VEDIC_RATNA_DATABASE[mulank] || VEDIC_RATNA_DATABASE[1];
  const destinyStone = VEDIC_RATNA_DATABASE[bhagyank] || VEDIC_RATNA_DATABASE[3];
  const nameStone = VEDIC_RATNA_DATABASE[nameAnalysis.chaldeanSingle] || rashiLordNum ? VEDIC_RATNA_DATABASE[nameAnalysis.chaldeanSingle] || VEDIC_RATNA_DATABASE[5] : VEDIC_RATNA_DATABASE[5];
  const rashiNakshatraStone =
    VEDIC_RATNA_DATABASE[rashiLordNum] || VEDIC_RATNA_DATABASE[nakshatraPlanetNum] || VEDIC_RATNA_DATABASE[2];
  const transitStone = VEDIC_RATNA_DATABASE[transitPlanetNum] || VEDIC_RATNA_DATABASE[3];
  const transitReason = `During 2026–2027 Gochar (Saturn in Meena, Jupiter in Mithuna/Karka, Rahu-Ketu in Kumbha/Simha), ${transitStone.primaryGem} (${transitStone.sanskritGem}) shields your ${autoAstro.rashi} Moon sign and amplifies auspicious career & wealth opportunities.`;

  // Gemstones to avoid based on enemy planets
  const stonesToAvoid = Array.from(enemySet)
    .filter((n) => n !== mulank && n !== bhagyank)
    .map((n) => VEDIC_RATNA_DATABASE[n])
    .filter(Boolean);

  return {
    mulank,
    bhagyank,
    namank: nameAnalysis.chaldeanSingle,
    autoAstro,
    rashiLordNum,
    nakshatraPlanetNum,
    transitPlanetNum,
    idealRattiRange: `${idealRattiMin.toFixed(2)} – ${idealRattiMax.toFixed(2)} Ratti`,
    idealCaratRange: `${idealCaratMin} – ${idealCaratMax} Carats`,
    lifeStone,
    destinyStone,
    nameStone,
    rashiNakshatraStone,
    transitStone,
    transitReason,
    stonesToAvoid,
    activeTransits: CELESTIAL_TRANSITS,
  };
}

export interface DetailedRatnaPrescription {
  purposeTitle: string;
  purposeSubtitle: string;
  neededForLabel: string;
  priorityBadge: string;
  ratna: VedicRatnaDetail;
  idealRattiRange: string;
  idealCaratRange: string;
  wearingHandAndFinger: string;
  metalAndSetting: string;
  dayAndMuhurat: string;
  pakshaAndNakshatra: string;
  purificationIngredients: string;
  beejMantra: string;
  howToWearStepByStep: string[];
  astrologicalReason: string;
  coreBenefits: string[];
}

/**
 * Calculates Precious Stone (Ratna & Upratna) recommendations specifically for:
 * 1. Clients who DO NOT want to change their existing name spelling (No-Name-Change Vibrational Harmonizer Stone)
 * 2. Personal Growth, Self-Elevation & Career Breakthrough (Personal Growth & Fortune Ratna)
 */
export function calculateNameAndPersonalGrowthRatnaRecommendation(
  profile: BirthProfile,
  activeNameOverride?: string,
  bodyWeightKg: number = 68
): {
  mulank: number;
  bhagyank: number;
  namank: number;
  rashi: string;
  nakshatra: string;
  isNameAlreadyHarmonious: boolean;
  noNameChangeStone: DetailedRatnaPrescription;
  personalGrowthStone: DetailedRatnaPrescription;
} {
  const base = calculateGemstoneRecommendationsForProfile(profile, bodyWeightKg);
  const targetName = (activeNameOverride || profile.name || 'SEEKER').trim();
  const nameAnalysis = analyzeName(targetName, base.mulank, base.bhagyank);

  const mulankProfile = PLANETARY_PROFILES[base.mulank] || PLANETARY_PROFILES[1];
  const bhagyankProfile = PLANETARY_PROFILES[base.bhagyank] || PLANETARY_PROFILES[3];
  const namankProfile = PLANETARY_PROFILES[nameAnalysis.chaldeanSingle] || PLANETARY_PROFILES[1];

  const enemySet = new Set([
    ...(mulankProfile.enemyNumbers || []),
    ...(bhagyankProfile.enemyNumbers || []),
  ]);

  // 1. Select the best stone if the client DOES NOT want to change their name:
  // If the current name root (Namank) is friendly and not an enemy of Mulank/Bhagyank, use a bridge between Mulank/Rashi/Namank.
  // If the current name has friction or malefic compound, select the supreme Bridge Planet Stone (friendly to Mulank & Bhagyank)
  // that neutralizes the name's vibrational deficit without requiring any spelling modification.
  let bridgePlanetNum = base.mulank;
  const mutualFriends = (mulankProfile.friendlyNumbers || []).filter(
    (n) => (bhagyankProfile.friendlyNumbers || []).includes(n) && !enemySet.has(n)
  );

  if (!nameAnalysis.isAuspicious || enemySet.has(nameAnalysis.chaldeanSingle)) {
    if (!enemySet.has(base.rashiLordNum)) {
      bridgePlanetNum = base.rashiLordNum;
    } else if (mutualFriends.length > 0) {
      bridgePlanetNum = mutualFriends[0];
    } else {
      bridgePlanetNum = base.mulank;
    }
  } else {
    if (!enemySet.has(nameAnalysis.chaldeanSingle)) {
      bridgePlanetNum = nameAnalysis.chaldeanSingle;
    } else {
      bridgePlanetNum = base.mulank;
    }
  }

  const noChangeRatna = VEDIC_RATNA_DATABASE[bridgePlanetNum] || base.lifeStone;
  const handLabel = profile.gender === 'female' ? 'Right Hand (or Left Hand for Females if preferred)' : 'Right (Working) Hand';

  const noNameChangeStone: DetailedRatnaPrescription = {
    purposeTitle: '1. Precious Stone If You Do Not Want to Change Your Name (No-Name-Change Harmony Ratna)',
    purposeSubtitle: `Harmonizes Existing Name "${targetName}" (Compound ${nameAnalysis.totalChaldeanCompound} ➔ Root ${nameAnalysis.chaldeanSingle}) with Mulank ${base.mulank} & Bhagyank ${base.bhagyank}`,
    neededForLabel: `For ${targetName} (Without Changing Spelling in Documents or Daily Use)`,
    priorityBadge: nameAnalysis.isAuspicious
      ? 'Locks & Amplifies Existing Name Vibration'
      : 'Essential Remedy If Keeping Original Name Spelling',
    ratna: noChangeRatna,
    idealRattiRange: base.idealRattiRange,
    idealCaratRange: base.idealCaratRange,
    wearingHandAndFinger: `${noChangeRatna.finger.replace('of Right Hand', '')} of ${handLabel}`,
    metalAndSetting: `${noChangeRatna.metal} (Open-back Prana-Sparsa ring/pendant setting so the stone touches your skin directly)`,
    dayAndMuhurat: `${noChangeRatna.wearingDay} • ${noChangeRatna.auspiciousTimeWindow}`,
    pakshaAndNakshatra: noChangeRatna.pakshaAndNakshatra,
    purificationIngredients: noChangeRatna.purificationLiquid,
    beejMantra: noChangeRatna.beejMantra,
    howToWearStepByStep: [
      `Step 1 (Metal & Ring Crafting): Set a natural, unheated ${noChangeRatna.primaryGem} (${noChangeRatna.sanskritGem}) of ${base.idealRattiRange} (${base.idealCaratRange}) in ${noChangeRatna.metal} with an open back so solar/cosmic rays enter through the stone into your skin.`,
      `Step 2 (Panchamrit Shuddhikaran): On ${noChangeRatna.wearingDay} morning during Shukla Paksha, dip the ring for 21–30 minutes in a clean silver/copper bowl containing ${noChangeRatna.purificationLiquid}.`,
      `Step 3 (Gangajal Rinse & Puja): Rinse with pure Gangajal, wipe with a clean silk cloth, light a cow-ghee lamp and incense before your Ishta Devata, and offer yellow/white flowers.`,
      `Step 4 (Prana-Pratishtha Mantra): Hold the ring in your right palm facing East and chant "${noChangeRatna.beejMantra}" 108 times with a mental Sankalpa to harmonize your name "${targetName}" without changing its spelling.`,
      `Step 5 (Wearing Finger & Time): Wear the ring on the ${noChangeRatna.finger.replace('of Right Hand', '')} of your ${handLabel} between ${noChangeRatna.auspiciousTimeWindow}.`,
    ],
    astrologicalReason: !nameAnalysis.isAuspicious
      ? `Your current name "${targetName}" vibrates at Compound ${nameAnalysis.totalChaldeanCompound} (Root ${nameAnalysis.chaldeanSingle} — ${namankProfile.planet}), which creates vibrational friction with Mulank ${base.mulank} (${mulankProfile.planet}) and Bhagyank ${base.bhagyank} (${bhagyankProfile.planet}). If you do not wish to alter your name spelling, wearing ${noChangeRatna.primaryGem} (${noChangeRatna.sanskritGem}) creates an astrological frequency bridge across your ${noChangeRatna.chakra}, neutralizing name-compound obstacles and aligning your aura with ${noChangeRatna.planet} grace.`
      : `Your name "${targetName}" (Compound ${nameAnalysis.totalChaldeanCompound} ➔ Root ${nameAnalysis.chaldeanSingle}) is already in positive resonance. Wearing ${noChangeRatna.primaryGem} (${noChangeRatna.sanskritGem}) seals and magnifies your existing name's authority without any need for spelling changes.`,
    coreBenefits: [
      `Eliminates Chaldean name-compound friction while keeping your existing official & social name "${targetName}" unchanged.`,
      ...noChangeRatna.coreBenefits,
    ],
  };

  // 2. Select the Personal Growth, Career & Self-Elevation Stone:
  // Combines Bhagyank (Destiny/Karma Lord) and Mulank/Rashi Lord to unlock maximum personal growth, wealth, confidence & career elevation.
  let growthPlanetNum = base.bhagyank;
  if (growthPlanetNum === bridgePlanetNum) {
    // Pick the other primary pillar (Mulank or Rashi Lord or Jupiter #3 if friendly) so client gets a distinct Personal Growth stone
    if (base.mulank !== bridgePlanetNum && !enemySet.has(base.mulank)) {
      growthPlanetNum = base.mulank;
    } else if (base.rashiLordNum !== bridgePlanetNum && !enemySet.has(base.rashiLordNum)) {
      growthPlanetNum = base.rashiLordNum;
    } else if (!enemySet.has(3)) {
      growthPlanetNum = 3;
    }
  }
  const growthRatna = VEDIC_RATNA_DATABASE[growthPlanetNum] || base.destinyStone;

  const personalGrowthStone: DetailedRatnaPrescription = {
    purposeTitle: '2. Precious Stone for Personal Growth, Career Authority & Self-Elevation (Atma-Unnati Ratna)',
    purposeSubtitle: `Powered by Destiny Bhagyank ${base.bhagyank} (${bhagyankProfile.planet}), Mulank ${base.mulank} (${mulankProfile.planet}) & ${base.autoAstro.rashi}`,
    neededForLabel: `For Personal Growth, Financial Stability, Confidence & Career Breakthrough`,
    priorityBadge: 'Supreme Personal Growth & Fortune Catalyst',
    ratna: growthRatna,
    idealRattiRange: base.idealRattiRange,
    idealCaratRange: base.idealCaratRange,
    wearingHandAndFinger: `${growthRatna.finger.replace('of Right Hand', '')} of ${handLabel}`,
    metalAndSetting: `${growthRatna.metal} (Open-back skin-contact ring or throat/heart pendant)`,
    dayAndMuhurat: `${growthRatna.wearingDay} • ${growthRatna.auspiciousTimeWindow}`,
    pakshaAndNakshatra: growthRatna.pakshaAndNakshatra,
    purificationIngredients: growthRatna.purificationLiquid,
    beejMantra: growthRatna.beejMantra,
    howToWearStepByStep: [
      `Step 1 (Metal & Weight): Craft a natural ${growthRatna.primaryGem} (${growthRatna.sanskritGem}) of ${base.idealRattiRange} (${base.idealCaratRange}) in ${growthRatna.metal} with an open bottom setting.`,
      `Step 2 (Panchamrit Purification): Immerse the ring for 21–30 minutes on ${growthRatna.wearingDay} morning in ${growthRatna.purificationLiquid}.`,
      `Step 3 (Sacred Energization): Wash with Gangajal, offer sandalwood tilak, incense, and a ghee diya before your Ishta Devata.`,
      `Step 4 (Mantra Siddhi): Chant "${growthRatna.beejMantra}" 108 times facing East/North-East during Shukla Paksha.`,
      `Step 5 (Wearing Finger & Time): Wear on the ${growthRatna.finger.replace('of Right Hand', '')} of your ${handLabel} during ${growthRatna.auspiciousTimeWindow}.`,
    ],
    astrologicalReason: `For continuous self-growth, financial stability, executive decision-making, and spiritual protection, Vedic Ratna-Shastra prescribes ${growthRatna.primaryGem} (${growthRatna.sanskritGem}) governed by ${growthRatna.sanskritPlanet}. It directly strengthens your ${growthRatna.chakra}, activates your ${base.autoAstro.rashi} (${base.autoAstro.nakshatra}) birth chart potential, and accelerates career & business compounding.`,
    coreBenefits: [
      `Accelerates holistic personal growth, self-confidence, mental clarity, and career/business elevation.`,
      ...growthRatna.coreBenefits,
    ],
  };

  return {
    mulank: base.mulank,
    bhagyank: base.bhagyank,
    namank: nameAnalysis.chaldeanSingle,
    rashi: base.autoAstro.rashi,
    nakshatra: base.autoAstro.nakshatra,
    isNameAlreadyHarmonious: nameAnalysis.isAuspicious,
    noNameChangeStone,
    personalGrowthStone,
  };
}

/**
 * Calculates Vedic Astrology Precious Stone (Ratna & Upratna) recommendations for Partner Milan
 * (Bride & Groom Relationship Harmony), identifying who needs the stone (Groom, Bride, or Both)
 * and providing complete wearing instructions (Finger, Hand, Metal, Day/Time, Purification, Mantra).
 */
export function calculatePartnerMilanRatnaRecommendations(
  groomInput: { name: string; dob: string; tob?: string; pob?: string; lat?: number; lng?: number },
  brideInput: { name: string; dob: string; tob?: string; pob?: string; lat?: number; lng?: number },
  analysis: {
    totalPoints: number;
    overallPercentage: number;
    p1Mulank: number;
    p1Bhagyank: number;
    p2Mulank: number;
    p2Bhagyank: number;
    p1Astrology: { rashi: string; sunSign: string; nakshatra: string; pada: number; nakshatraLord?: string };
    p2Astrology: { rashi: string; sunSign: string; nakshatra: string; pada: number; nakshatraLord?: string };
    dimensions: Array<{ name: string; sanskritName: string; obtainedPoints: number; maxPoints: number; verdict: string }>;
    chakraChallenges: Array<{ chakraName: string; status: string; affectedPartner: string }>;
  }
): {
  whoNeedsItSummary: string;
  whoNeedsItBadge: 'Both Groom & Bride' | 'Primarily Groom (Supported by Bride)' | 'Primarily Bride (Supported by Groom)';
  groomStone: DetailedRatnaPrescription;
  brideStone: DetailedRatnaPrescription;
  jointHarmonyStoneSummary: string;
} {
  const groomName = (groomInput.name || 'Groom').trim();
  const brideName = (brideInput.name || 'Bride').trim();

  const groomBase = calculateGemstoneRecommendationsForProfile(
    {
      id: 'groom_milan',
      name: groomName,
      dob: groomInput.dob || '1990-01-01',
      tob: groomInput.tob || '09:30',
      pob: groomInput.pob || 'New Delhi, India',
      lat: groomInput.lat ?? 28.6139,
      lng: groomInput.lng ?? 77.209,
      gender: 'male',
    },
    72
  );

  const brideBase = calculateGemstoneRecommendationsForProfile(
    {
      id: 'bride_milan',
      name: brideName,
      dob: brideInput.dob || '1992-01-01',
      tob: brideInput.tob || '09:30',
      pob: brideInput.pob || 'New Delhi, India',
      lat: brideInput.lat ?? 28.6139,
      lng: brideInput.lng ?? 77.209,
      gender: 'female',
    },
    58
  );

  const groomMulankProf = PLANETARY_PROFILES[analysis.p1Mulank] || PLANETARY_PROFILES[1];
  const groomBhagyankProf = PLANETARY_PROFILES[analysis.p1Bhagyank] || PLANETARY_PROFILES[3];
  const brideMulankProf = PLANETARY_PROFILES[analysis.p2Mulank] || PLANETARY_PROFILES[2];
  const brideBhagyankProf = PLANETARY_PROFILES[analysis.p2Bhagyank] || PLANETARY_PROFILES[6];

  const groomEnemySet = new Set([
    ...(groomMulankProf.enemyNumbers || []),
    ...(groomBhagyankProf.enemyNumbers || []),
  ]);
  const brideEnemySet = new Set([
    ...(brideMulankProf.enemyNumbers || []),
    ...(brideBhagyankProf.enemyNumbers || []),
  ]);

  // Count chakra challenges attributed to Groom vs Bride vs Both
  let groomChallengeCount = 0;
  let brideChallengeCount = 0;
  let bothChallengeCount = 0;
  for (const ch of analysis.chakraChallenges || []) {
    if (ch.status !== 'Harmonious') {
      if (ch.affectedPartner === 'Groom') groomChallengeCount++;
      else if (ch.affectedPartner === 'Bride') brideChallengeCount++;
      else if (ch.affectedPartner === 'Both') bothChallengeCount++;
    }
  }

  // Select Groom's Vedic Relationship Harmony Stone:
  // In Vedic marriage astrology, Venus (#6 Shukra - Kalatra Karaka for Groom), Rashi Lord, or Jupiter (#3 Guru - Dharma & Wisdom)
  // are supreme for marital harmony, provided they do not conflict with the Groom's Mulank/Bhagyank.
  let groomStoneNum = groomBase.rashiLordNum;
  if (groomEnemySet.has(groomStoneNum)) {
    if (!groomEnemySet.has(6)) groomStoneNum = 6; // Venus (Kalatra Karaka for Groom)
    else if (!groomEnemySet.has(3)) groomStoneNum = 3; // Jupiter
    else if (!groomEnemySet.has(2)) groomStoneNum = 2; // Moon (Emotional peace)
    else groomStoneNum = analysis.p1Bhagyank;
  } else if (!groomEnemySet.has(6) && (analysis.totalPoints < 24 || groomChallengeCount > 0)) {
    // If Venus is friendly to Groom, Venus or Rashi Lord harmonizes 7th house conjugal peace
    groomStoneNum = groomBase.rashiLordNum;
  }
  const groomRatna = VEDIC_RATNA_DATABASE[groomStoneNum] || groomBase.rashiNakshatraStone;

  // Select Bride's Vedic Relationship Harmony Stone:
  // In Vedic marriage astrology for a Bride, Jupiter (#3 Brihaspati - Pati/Sauharda Karaka), Rashi Lord, Moon (#2), or Venus (#6)
  // govern marital bliss, longevity, and emotional security.
  let brideStoneNum = brideBase.rashiLordNum;
  if (brideEnemySet.has(brideStoneNum)) {
    if (!brideEnemySet.has(3)) brideStoneNum = 3; // Jupiter (Sowbhagya & Husband Karaka for Bride)
    else if (!brideEnemySet.has(6)) brideStoneNum = 6; // Venus (Love & Conjugal Harmony)
    else if (!brideEnemySet.has(2)) brideStoneNum = 2; // Moon (Emotional Harmony)
    else brideStoneNum = analysis.p2Bhagyank;
  }
  const brideRatna = VEDIC_RATNA_DATABASE[brideStoneNum] || brideBase.rashiNakshatraStone;

  let whoNeedsItBadge: 'Both Groom & Bride' | 'Primarily Groom (Supported by Bride)' | 'Primarily Bride (Supported by Groom)' =
    'Both Groom & Bride';
  if (groomChallengeCount > brideChallengeCount + 1) {
    whoNeedsItBadge = 'Primarily Groom (Supported by Bride)';
  } else if (brideChallengeCount > groomChallengeCount + 1) {
    whoNeedsItBadge = 'Primarily Bride (Supported by Groom)';
  }

  const lowKootas = (analysis.dimensions || [])
    .filter((d) => d.obtainedPoints / Math.max(1, d.maxPoints) < 0.6)
    .map((d) => d.name);
  const kootaText =
    lowKootas.length > 0
      ? `to pacify ${lowKootas.join(', ')} Koota dosha and harmonize the ${analysis.totalPoints}/36 Guna chart`
      : `to lock in and elevate your auspicious ${analysis.totalPoints}/36 Guna (${analysis.overallPercentage}%) marital resonance`;

  const whoNeedsItSummary =
    whoNeedsItBadge === 'Primarily Groom (Supported by Bride)'
      ? `Vedic Astrological Assessment: Based on Janma Rashi (${analysis.p1Astrology.rashi} & ${analysis.p2Astrology.rashi}), Ashtakoot (${analysis.totalPoints}/36 Gunas), and 9-Chakra diagnostics (${groomChallengeCount} Groom-carried vs ${brideChallengeCount} Bride-carried patterns), it is ESSENTIAL for Groom (${groomName}) to wear ${groomRatna.primaryGem} (${groomRatna.sanskritGem}) ${kootaText}, while Bride (${brideName}) wearing ${brideRatna.primaryGem} (${brideRatna.sanskritGem}) provides supportive emotional and domestic bliss.`
      : whoNeedsItBadge === 'Primarily Bride (Supported by Groom)'
      ? `Vedic Astrological Assessment: Based on Janma Rashi (${analysis.p1Astrology.rashi} & ${analysis.p2Astrology.rashi}), Ashtakoot (${analysis.totalPoints}/36 Gunas), and 9-Chakra diagnostics (${brideChallengeCount} Bride-carried vs ${groomChallengeCount} Groom-carried patterns), it is ESSENTIAL for Bride (${brideName}) to wear ${brideRatna.primaryGem} (${brideRatna.sanskritGem}) ${kootaText}, while Groom (${groomName}) wearing ${groomRatna.primaryGem} (${groomRatna.sanskritGem}) anchors mutual stability and protection.`
      : `Vedic Astrological Assessment: Based on Janma Rashi (${analysis.p1Astrology.rashi} & ${analysis.p2Astrology.rashi}), Ashtakoot (${analysis.totalPoints}/36 Gunas), and ${bothChallengeCount + groomChallengeCount + brideChallengeCount} shared bio-field dynamics, BOTH Groom (${groomName}) and Bride (${brideName}) are advised to wear their respective Rashi-Harmonizing Precious Stones ${kootaText}.`;

  const groomStone: DetailedRatnaPrescription = {
    purposeTitle: `Groom’s Relationship Harmony Precious Stone — ${groomName}`,
    purposeSubtitle: `Janma Rashi: ${analysis.p1Astrology.rashi} (${analysis.p1Astrology.nakshatra} Pada ${analysis.p1Astrology.pada}) • Mulank ${analysis.p1Mulank} / Bhagyank ${analysis.p1Bhagyank}`,
    neededForLabel:
      whoNeedsItBadge === 'Primarily Bride (Supported by Groom)'
        ? `Supportive Relationship & Career Stability Stone for Groom (${groomName})`
        : `Essential Marital Harmony & Koota-Pacifying Stone for Groom (${groomName})`,
    priorityBadge:
      whoNeedsItBadge === 'Primarily Bride (Supported by Groom)'
        ? 'Supportive Harmony Ratna for Groom'
        : 'Essential for Groom — High Priority',
    ratna: groomRatna,
    idealRattiRange: groomBase.idealRattiRange,
    idealCaratRange: groomBase.idealCaratRange,
    wearingHandAndFinger: `${groomRatna.finger.replace('of Right Hand', '')} of Right Hand (Working Hand for Groom)`,
    metalAndSetting: `${groomRatna.metal} (Open-back ring setting so the bottom of the stone touches the finger skin directly)`,
    dayAndMuhurat: `${groomRatna.wearingDay} • ${groomRatna.auspiciousTimeWindow}`,
    pakshaAndNakshatra: groomRatna.pakshaAndNakshatra,
    purificationIngredients: groomRatna.purificationLiquid,
    beejMantra: groomRatna.beejMantra,
    howToWearStepByStep: [
      `Step 1 (Metal & Finger): Cast a natural ${groomRatna.primaryGem} (${groomRatna.sanskritGem}) of ${groomBase.idealRattiRange} (${groomBase.idealCaratRange}) in ${groomRatna.metal} with an open back for the ${groomRatna.finger.replace('of Right Hand', '')} of the Groom's Right Hand.`,
      `Step 2 (Panchamrit Purification): On ${groomRatna.wearingDay} morning during Shukla Paksha, soak the ring for 21–30 minutes in ${groomRatna.purificationLiquid}.`,
      `Step 3 (Sacred Wash & Puja): Wash with pure Gangajal, light a cow-ghee lamp, and offer white/yellow flowers before Lord Shiva & Parvati (or Lakshmi-Narayan).`,
      `Step 4 (Prana-Pratishtha Mantra): Chant "${groomRatna.beejMantra}" 108 times praying for lifelong marital peace, understanding, and prosperity with ${brideName}.`,
      `Step 5 (Wearing Time): Wear on the ${groomRatna.finger.replace('of Right Hand', '')} of the Right Hand between ${groomRatna.auspiciousTimeWindow}.`,
    ],
    astrologicalReason: `Aligns Groom (${groomName} — ${analysis.p1Astrology.rashi}, Mulank ${analysis.p1Mulank}) with Bride (${brideName} — ${analysis.p2Astrology.rashi}, Mulank ${analysis.p2Mulank}). Wearing ${groomRatna.primaryGem} (${groomRatna.sanskritGem}) pacifies ${groomRatna.planet} afflictions in the 7th house of marriage, dissolves ego/communication friction, and strengthens emotional devotion and financial stability in married life.`,
    coreBenefits: [
      `Balances Groom's ${groomRatna.chakra} for calm communication, mutual respect, and marital devotion with ${brideName}.`,
      ...groomRatna.coreBenefits,
    ],
  };

  const brideStone: DetailedRatnaPrescription = {
    purposeTitle: `Bride’s Relationship Harmony Precious Stone — ${brideName}`,
    purposeSubtitle: `Janma Rashi: ${analysis.p2Astrology.rashi} (${analysis.p2Astrology.nakshatra} Pada ${analysis.p2Astrology.pada}) • Mulank ${analysis.p2Mulank} / Bhagyank ${analysis.p2Bhagyank}`,
    neededForLabel:
      whoNeedsItBadge === 'Primarily Groom (Supported by Bride)'
        ? `Supportive Emotional Bliss & Sowbhagya Stone for Bride (${brideName})`
        : `Essential Marital Harmony & Koota-Pacifying Stone for Bride (${brideName})`,
    priorityBadge:
      whoNeedsItBadge === 'Primarily Groom (Supported by Bride)'
        ? 'Supportive Harmony Ratna for Bride'
        : 'Essential for Bride — High Priority',
    ratna: brideRatna,
    idealRattiRange: brideBase.idealRattiRange,
    idealCaratRange: brideBase.idealCaratRange,
    wearingHandAndFinger: `${brideRatna.finger.replace('of Right Hand', '')} of Left Hand (or Right Working Hand for Bride)`,
    metalAndSetting: `${brideRatna.metal} (Open-back ring or sacred Mangalsutra/Heart pendant touching skin)`,
    dayAndMuhurat: `${brideRatna.wearingDay} • ${brideRatna.auspiciousTimeWindow}`,
    pakshaAndNakshatra: brideRatna.pakshaAndNakshatra,
    purificationIngredients: brideRatna.purificationLiquid,
    beejMantra: brideRatna.beejMantra,
    howToWearStepByStep: [
      `Step 1 (Metal & Finger): Cast a natural ${brideRatna.primaryGem} (${brideRatna.sanskritGem}) of ${brideBase.idealRattiRange} (${brideBase.idealCaratRange}) in ${brideRatna.metal} with an open back for the ${brideRatna.finger.replace('of Right Hand', '')} of the Bride's Left Hand (or Right Working Hand).`,
      `Step 2 (Panchamrit Purification): On ${brideRatna.wearingDay} morning during Shukla Paksha, soak the ring for 21–30 minutes in ${brideRatna.purificationLiquid}.`,
      `Step 3 (Sacred Wash & Puja): Wash with pure Gangajal, offerkumkum/haldi, incense, and a cow-ghee lamp before Maa Gauri-Shankar or Lakshmi-Narayan.`,
      `Step 4 (Prana-Pratishtha Mantra): Chant "${brideRatna.beejMantra}" 108 times invoking Akhanda Sowbhagya, emotional security, and deep harmony with ${groomName}.`,
      `Step 5 (Wearing Time): Wear on the ${brideRatna.finger.replace('of Right Hand', '')} between ${brideRatna.auspiciousTimeWindow}.`,
    ],
    astrologicalReason: `Harmonizes Bride (${brideName} — ${analysis.p2Astrology.rashi}, Mulank ${analysis.p2Mulank}) with Groom (${groomName} — ${analysis.p1Astrology.rashi}, Mulank ${analysis.p1Mulank}). Wearing ${brideRatna.primaryGem} (${brideRatna.sanskritGem}) strengthens ${brideRatna.planet} blessings over the 7th & 8th houses (Mangalya & Grihastha Sukha), protecting emotional peace, mutual affection, and family prosperity.`,
    coreBenefits: [
      `Harmonizes Bride's ${brideRatna.chakra} for emotional security, affectionate bonding, and domestic happiness with ${groomName}.`,
      ...brideRatna.coreBenefits,
    ],
  };

  const jointHarmonyStoneSummary = `For Joint Couple Aura Protection: In addition to Groom (${groomName}) wearing ${groomRatna.primaryGem} (${groomRatna.metal}, ${groomRatna.finger.replace('of Right Hand', '')}, ${groomRatna.wearingDay}) and Bride (${brideName}) wearing ${brideRatna.primaryGem} (${brideRatna.metal}, ${brideRatna.finger.replace('of Right Hand', '')}, ${brideRatna.wearingDay}), keep a natural Rose Quartz + Sphatik (Clear Quartz) pair in the South-West corner of the master bedroom to maintain 528 Hz & 639 Hz Anahata (Heart Chakra) marital harmony.`;

  return {
    whoNeedsItSummary,
    whoNeedsItBadge,
    groomStone,
    brideStone,
    jointHarmonyStoneSummary,
  };
}

export const GemstoneRecommendation: React.FC<GemstoneRecommendationProps> = ({ profile }) => {
  const { activeProfile, adminUpdateProfile } = useTathastu();
  const initialWeight = activeProfile?.bodyWeightKg || profile.bodyWeightKg || 65;
  const [bodyWeightInput, setBodyWeightInput] = useState<string>(String(initialWeight));
  const [copiedMantraKey, setCopiedMantraKey] = useState<string | null>(null);
  const [selectedCardKey, setSelectedCardKey] = useState<'life' | 'destiny' | 'rashi' | 'transit'>('life');

  useEffect(() => {
    const nextW = activeProfile?.bodyWeightKg || profile.bodyWeightKg || 65;
    setBodyWeightInput(String(nextW));
  }, [profile.id]);

  const parsedWeight = Number(bodyWeightInput);
  const effectiveBodyWeightKg =
    Number.isFinite(parsedWeight) && parsedWeight >= 10 && parsedWeight <= 250
      ? parsedWeight
      : 65;

  const gemData = useMemo(
    () => calculateGemstoneRecommendationsForProfile(profile, effectiveBodyWeightKg),
    [profile, effectiveBodyWeightKg]
  );

  const handleWeightChange = (rawVal: string) => {
    const cleaned = rawVal.replace(/[^\d.]/g, '');
    setBodyWeightInput(cleaned);
    const num = Number(cleaned);
    if (
      cleaned !== '' &&
      Number.isFinite(num) &&
      num >= 10 &&
      num <= 250 &&
      activeProfile &&
      activeProfile.id === profile.id
    ) {
      adminUpdateProfile({
        ...activeProfile,
        bodyWeightKg: Math.round(num * 10) / 10,
      });
    }
  };

  const handleCopyMantra = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMantraKey(key);
    setTimeout(() => setCopiedMantraKey(null), 2000);
  };

  const recommendationCards = [
    {
      key: 'life' as const,
      roleBadge: '1. PRIMARY LIFE STONE (JANMA / MULANK RATNA)',
      subtitle: `Ruled by Mulank ${gemData.mulank} (${gemData.lifeStone.sanskritPlanet}) • Core Soul & Vitality Pillar`,
      ratna: gemData.lifeStone,
      astroReason: `Born on day vibration ${gemData.mulank}, your physical vitality, immunity, personal magnetism, and self-confidence are directly governed by ${gemData.lifeStone.planet}. Wearing ${gemData.lifeStone.primaryGem} (${gemData.lifeStone.sanskritGem}) strengthens your Natal Lagna/Sun aura.`,
      isConflict: false,
    },
    {
      key: 'destiny' as const,
      roleBadge: '2. SUPREME DESTINY STONE (BHAGYANK / KARMA RATNA)',
      subtitle: `Ruled by Bhagyank ${gemData.bhagyank} (${gemData.destinyStone.sanskritPlanet}) • Career & Fortune Pillar`,
      ratna: gemData.destinyStone,
      astroReason: `Your complete Date of Birth (${profile.dob}) reduces to Destiny Number ${gemData.bhagyank} (${gemData.destinyStone.planet}). ${gemData.destinyStone.primaryGem} unlocks long-term wealth accumulation, career promotion, and karmic protection after age 28.`,
      isConflict: false,
    },
    {
      key: 'rashi' as const,
      roleBadge: '3. CHANDRA RASHI & NAKSHATRA RATNA (BIRTH CHART MOON STONE)',
      subtitle: `${gemData.autoAstro.rashi} • ${gemData.autoAstro.nakshatra} (Pada ${gemData.autoAstro.pada})`,
      ratna: gemData.rashiNakshatraStone,
      astroReason: `Based on your Sidereal Birth Chart (${gemData.autoAstro.rashi}, ${gemData.autoAstro.nakshatra} Pada ${gemData.autoAstro.pada}, Lord: ${gemData.autoAstro.nakshatraLord}), ${gemData.rashiNakshatraStone.primaryGem} stabilizes mental peace, emotional harmony, and lunar mansion fortune.`,
      isConflict: false,
    },
    {
      key: 'transit' as const,
      roleBadge: '4. PLANETARY TRANSIT (GOCHAR) AMPLIFIER & KAVACH STONE',
      subtitle: `2026–2027 Gochar Alignment • ${gemData.transitStone.sanskritPlanet} Transit Shield`,
      ratna: gemData.transitStone,
      astroReason: `During current planetary transits (Saturn in Pisces Meena, Jupiter in Gemini/Cancer, and Rahu-Ketu in Aquarius/Leo), wearing ${gemData.transitStone.upratna} (or ${gemData.transitStone.primaryGem}) acts as an active Gochar Kavach—filtering malefic transit radiation while accelerating auspicious opportunities.`,
      isConflict: false,
    },
  ];

  const activeDetailCard =
    recommendationCards.find((c) => c.key === selectedCardKey) || recommendationCards[0];

  return (
    <div className="bg-slate-900/80 border border-amber-500/35 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative Sacred Glow */}
      <div className="absolute -right-12 -top-12 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Interactive Body Weight Ratti Calculator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-6 border-b border-amber-500/20 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Gem className="w-3.5 h-3.5 text-amber-400" />
            <span>Vedic Ratna-Shastra • Birth Chart & Planetary Transit (Gochar) Engine</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 flex items-center gap-2.5">
            <span>Auspicious Gemstone (Ratna & Upratna) Recommendation</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Personalized for <strong className="text-amber-300">{profile.name}</strong> • Mulank{' '}
            <strong className="text-amber-200">{gemData.mulank}</strong> • Bhagyank{' '}
            <strong className="text-amber-200">{gemData.bhagyank}</strong> • Moon Sign:{' '}
            <strong className="text-emerald-300">{gemData.autoAstro.rashi}</strong> (
            {gemData.autoAstro.nakshatra} Pada {gemData.autoAstro.pada})
          </p>
        </div>

        {/* Interactive Body Weight -> Ratti/Carat Calculator Box */}
        <div className="bg-slate-950/90 border border-amber-500/35 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
                Your Body Weight (kg)
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <input
                  type="text"
                  inputMode="decimal"
                  value={bodyWeightInput}
                  placeholder="e.g. 65"
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-20 bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-100 focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-slate-400">kg</span>
              </div>
            </div>
          </div>

          <div className="sm:border-l border-amber-500/20 sm:pl-3.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block">
              Prescribed Gemstone Weight
            </span>
            <span className="text-sm font-mono font-extrabold text-amber-200 block">
              {gemData.idealRattiRange}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block">
              ({gemData.idealCaratRange} Metric)
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Birth Chart & Transit Gemstone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        {recommendationCards.map((item) => {
          const isSelected = selectedCardKey === item.key;
          return (
            <div
              key={item.key}
              onClick={() => setSelectedCardKey(item.key)}
              className={`rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                  : 'bg-slate-950/80 border-amber-500/20 hover:border-amber-500/45'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 leading-tight">
                    {item.roleBadge}
                  </span>
                  <Gem
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                </div>

                <div
                  className={`p-2.5 rounded-lg bg-gradient-to-r ${item.ratna.badgeColor} border mb-3`}
                >
                  <div className="text-sm font-serif font-extrabold leading-snug">
                    {item.ratna.primaryGem}
                  </div>
                  <div className="text-[11px] font-bold opacity-90 mt-0.5">
                    {item.ratna.sanskritGem} • {item.ratna.sanskritPlanet}
                  </div>
                </div>

                <p className="text-[11px] text-amber-200/80 font-medium mb-2">{item.subtitle}</p>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  {item.astroReason}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Upratna (Sub-Stone):</span>
                  <span className="text-emerald-300 font-semibold text-right">
                    {item.ratna.upratna.split('/')[0].trim()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Metal & Finger:</span>
                  <span className="text-amber-200 font-semibold text-right">
                    {item.ratna.metal.split('or')[0].trim()} •{' '}
                    {item.ratna.finger.replace('of Right Hand', '')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Wearing Day:</span>
                  <span className="text-amber-300 font-bold">{item.ratna.wearingDay}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Gemstone Deep Wearing Ritual (Ratna Dharan Vidhi) & Transit Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 relative z-10">
        {/* Left 7 Cols: Complete Vedic Wearing Protocol for Selected Stone */}
        <div className="lg:col-span-7 bg-slate-950/90 border border-amber-500/30 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-amber-500/20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                {activeDetailCard.roleBadge} — COMPLETE VEDIC VIDHI
              </span>
              <h4 className="font-serif text-lg font-bold text-amber-100">
                {activeDetailCard.ratna.primaryGem} ({activeDetailCard.ratna.sanskritGem}) Wearing
                Protocol
              </h4>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              {gemData.idealRattiRange}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/15">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Prescribed Metal & Setting</span>
              </div>
              <p className="text-xs font-semibold text-amber-100">{activeDetailCard.ratna.metal}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Open-back setting so the bottom cullet of the stone touches the skin directly.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/15">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400 mb-1">
                <Hand className="w-3.5 h-3.5" />
                <span>Finger, Day & Hora Muhurat</span>
              </div>
              <p className="text-xs font-semibold text-amber-100">
                {activeDetailCard.ratna.finger} • {activeDetailCard.ratna.wearingDay}
              </p>
              <p className="text-[11px] text-emerald-300 mt-0.5">
                Time: {activeDetailCard.ratna.auspiciousTimeWindow}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/15">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Paksha, Nakshatra & Chakra</span>
              </div>
              <p className="text-xs font-semibold text-amber-100">
                {activeDetailCard.ratna.pakshaAndNakshatra}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Activates: {activeDetailCard.ratna.chakra}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/15">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400 mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Panchamrit Shuddhikaran (Purification)</span>
              </div>
              <p className="text-xs font-semibold text-amber-100">
                Soak for 24 mins before Sunrise in:
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {activeDetailCard.ratna.purificationLiquid}
              </p>
            </div>
          </div>

          {/* Prana-Pratishtha Mantra Box */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                Prana-Pratishtha Energization Beej Mantra (Chant 108 Times Before Wearing)
              </span>
              <p className="text-xs sm:text-sm font-serif font-bold text-amber-200">
                {activeDetailCard.ratna.beejMantra}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopyMantra(activeDetailCard.key, activeDetailCard.ratna.beejMantra)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all shrink-0 cursor-pointer"
            >
              {copiedMantraKey === activeDetailCard.key ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Mantra</span>
                </>
              )}
            </button>
          </div>

          {/* Key Benefits */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              Specific Astrological & Pranic Benefits for {profile.name}:
            </span>
            <ul className="space-y-1.5">
              {activeDetailCard.ratna.coreBenefits.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right 5 Cols: Active Planetary Transits (Gochar) Impact + Enemy Stones to Avoid */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Active Planetary Transit (Gochar) Alignment Box */}
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-amber-400" />
              <h4 className="font-serif text-sm font-bold text-amber-100 uppercase tracking-wider">
                Current Planetary Transits (Gochar) & Ratna Synergy
              </h4>
            </div>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {gemData.activeTransits.slice(0, 4).map((tr, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-amber-300">
                      {tr.transitName} → {tr.sign}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/50 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      {tr.dateRange}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-1">{tr.summary}</p>
                  <p className="text-[10px] text-amber-200/80 font-medium">
                    <strong>Gochar Remedy:</strong> {tr.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Enemy Gemstones to Strictly Avoid */}
          <div className="bg-rose-950/25 border border-rose-500/35 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <h4 className="font-serif text-sm font-bold text-rose-200 uppercase tracking-wider">
                Inimical Gemstones to Strictly Avoid
              </h4>
            </div>
            <p className="text-[11px] text-rose-200/80 mb-2.5">
              Based on anti-numbers of Mulank {gemData.mulank} and Bhagyank {gemData.bhagyank}, do
              not wear primary gemstones of enemy planets as they create pranic friction:
            </p>
            {gemData.stonesToAvoid.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gemData.stonesToAvoid.map((enemyRatna) => (
                  <span
                    key={enemyRatna.number}
                    className="px-2.5 py-1 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-200 text-[11px] font-semibold"
                  >
                    Avoid {enemyRatna.primaryGem} ({enemyRatna.sanskritGem} — {enemyRatna.planet} #
                    {enemyRatna.number})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-300 font-medium">
                Your Mulank and Bhagyank share universal neutral/friendly planetary resonance.
                Always test Blue Sapphire (Neelam) or Cat’s Eye for 72 hours under your pillow
                before permanent casting.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
