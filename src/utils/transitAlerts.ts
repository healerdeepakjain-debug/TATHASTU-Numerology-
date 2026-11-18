import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  CELESTIAL_TRANSITS,
  UPCOMING_MOON_PHASES,
  getDailyPanchang,
  getPlanetaryRelationship,
} from './numerology';
import {
  calculateVedicAstrologyFromBirth,
  computeSiderealSunMoonAtDayJ2000,
  VEDIC_RASHIS,
  VEDIC_NAKSHATRAS,
} from './astrologyAndCities';

export interface TransitAlertItem {
  id: string;
  planet: string;
  alertTitle: string;
  windowLabel: string;
  status: 'auspicious' | 'spiritual' | 'caution';
  favorabilityScore: number;
  houseOrAspectLabel: string;
  zodiacAlignmentSummary: string;
  recommendedAction: string;
}

export interface LivePlanetaryTransitSnapshot {
  computedAtLabel: string;
  ayanamsaDeg: string;
  liveSunRashi: string;
  liveSunDegInSign: string;
  liveMoonRashi: string;
  liveMoonNakshatra: string;
  liveMoonDegInSign: string;
  natalRashi: string;
  natalSunSign: string;
  natalNakshatra: string;
  natalPada: number;
  natalMulank: number;
  natalBhagyank: number;
  moonTransitHouseFromNatal: number;
  overallWindowStatus: string;
  peakFavorabilityScore: number;
  auspiciousWindowsToday: string[];
  alerts: TransitAlertItem[];
}

const RASHI_LORDS: Record<number, number> = {
  0: 9, // Mesha - Mars
  1: 6, // Vrishabh - Venus
  2: 5, // Mithuna - Mercury
  3: 2, // Karka - Moon
  4: 1, // Simha - Sun
  5: 5, // Kanya - Mercury
  6: 6, // Tula - Venus
  7: 9, // Vrischika - Mars
  8: 3, // Dhanu - Jupiter
  9: 8, // Makara - Saturn
  10: 8, // Kumbha - Saturn
  11: 3, // Meena - Jupiter
};

function findRashiIndexByName(rashiName?: string): number {
  if (!rashiName) return 0;
  const firstWord = rashiName.split(' ')[0].toLowerCase();
  const idx = VEDIC_RASHIS.findIndex((r) => r.toLowerCase().startsWith(firstWord));
  return idx >= 0 ? idx : 0;
}

/**
 * Automatically pulls live Lahiri Sidereal planetary longitudes (Sun, Moon & Nakshatra)
 * plus active Gochar transits & Panchang muhurats, evaluating auspicious windows
 * specifically for the client's birth zodiac (Janma Rashi, Sun Sign, Nakshatra) and numbers.
 */
export function computeLiveTransitAlerts(
  profile: BirthProfile,
  nowDate: Date = new Date()
): LivePlanetaryTransitSnapshot {
  const m = calculateMulank(profile.dob || '1990-01-01');
  const b = calculateBhagyank(profile.dob || '1990-01-01');
  const mPlanet = PLANETARY_PROFILES[m] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[b] || PLANETARY_PROFILES[3];

  const natalAstro = calculateVedicAstrologyFromBirth(
    profile.dob || '1990-01-01',
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.209
  );
  const natalRashi = profile.rashi || natalAstro.rashi;
  const natalSunSign = profile.sunSign || natalAstro.sunSign;
  const natalNakshatra = profile.nakshatra || natalAstro.nakshatra;
  const natalPada = profile.nakshatraPada || natalAstro.pada || 1;

  const dNow = (nowDate.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;
  const { ayanamsa, sunSidereal, moonSidereal } = computeSiderealSunMoonAtDayJ2000(dNow);

  const liveSunRashiIdx = Math.floor(sunSidereal / 30) % 12;
  const liveMoonRashiIdx = Math.floor(moonSidereal / 30) % 12;
  const liveMoonNakIdx = Math.floor(moonSidereal / (360 / 27)) % 27;

  const liveSunRashi = VEDIC_RASHIS[liveSunRashiIdx] || VEDIC_RASHIS[0];
  const liveMoonRashi = VEDIC_RASHIS[liveMoonRashiIdx] || VEDIC_RASHIS[0];
  const liveMoonNakshatra = VEDIC_NAKSHATRAS[liveMoonNakIdx]?.name || 'Ashwini';

  const liveSunDegInSign = `${(sunSidereal % 30).toFixed(1)}°`;
  const liveMoonDegInSign = `${(moonSidereal % 30).toFixed(1)}°`;

  const natalMoonRashiIdx = findRashiIndexByName(natalRashi);
  const natalSunRashiIdx = findRashiIndexByName(natalSunSign);

  // Vedic Chandra-Bala (Transit Moon House counted 1..12 from Natal Janma Rashi)
  const moonHouse = ((liveMoonRashiIdx - natalMoonRashiIdx + 12) % 12) + 1;
  // Good Chandra-Bala houses: 1, 3, 6, 7, 10, 11
  const isFavorableChandraBala = [1, 3, 6, 7, 10, 11].includes(moonHouse);
  const isNeutralChandraBala = [2, 5, 9].includes(moonHouse);
  const moonScore = isFavorableChandraBala ? 92 : isNeutralChandraBala ? 78 : 58;

  const sunHouseFromNatal = ((liveSunRashiIdx - natalMoonRashiIdx + 12) % 12) + 1;
  const isFavorableSuryaGochar = [3, 6, 10, 11, 1, 5, 9].includes(sunHouseFromNatal);
  const sunScore = isFavorableSuryaGochar ? 90 : 72;

  const panchang = getDailyPanchang(nowDate, m, b);
  const goodChoghadiyaSlots = panchang.choghadiyaPeriods.filter(
    (p) => p.quality === 'Excellent' || p.quality === 'Good' || p.quality === 'Gainful'
  );
  const auspiciousWindowsToday = [
    `Abhijit Muhurat: 11:45 AM – 12:33 PM`,
    ...goodChoghadiyaSlots.slice(0, 3).map((s) => `${s.name} (${s.startTime}–${s.endTime})`),
  ];

  const liveMoonLord = RASHI_LORDS[liveMoonRashiIdx] || 2;
  const moonBirthRel = getPlanetaryRelationship(m, liveMoonLord);

  const alerts: TransitAlertItem[] = [];

  // 1. Live Chandra Gochar Alert (personalized to Natal Janma Rashi)
  alerts.push({
    id: 'live-chandra-gochar',
    planet: `Chandra (Moon) in ${liveMoonRashi.split(' ')[0]}`,
    alertTitle: isFavorableChandraBala
      ? `Auspicious Chandra-Bala Window (${moonHouse}th House from ${natalRashi.split(' ')[0]})`
      : isNeutralChandraBala
      ? `Balanced Mind Window (${moonHouse}th House Transit)`
      : `Chandrashtama / Mind-Calmness Window (${moonHouse}th House)`,
    windowLabel: `Live Now (${liveMoonNakshatra} Nakshatra • ${liveMoonDegInSign})`,
    status: isFavorableChandraBala ? 'auspicious' : isNeutralChandraBala ? 'spiritual' : 'caution',
    favorabilityScore: moonScore,
    houseOrAspectLabel: `House ${moonHouse} Gochar • ${moonBirthRel === 'friendly' ? 'Mitra Rashi' : 'Active Gochar'}`,
    zodiacAlignmentSummary: `Moon currently transits ${liveMoonRashi} (${liveMoonNakshatra}), which falls in the ${moonHouse}${
      moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'
    } house from your birth Moon sign ${natalRashi}. ${
      isFavorableChandraBala
        ? `Highly supportive for financial decisions, family discussions, and new starts.`
        : isNeutralChandraBala
        ? `Steady energy for routine planning, learning, and spiritual contemplation.`
        : `Avoid impulsive arguments or speculative risks; prioritize mantra meditation & hydration.`
    }`,
    recommendedAction: isFavorableChandraBala
      ? `Execute key meetings during ${goodChoghadiyaSlots[0]?.name || 'Amrit'} Choghadiya (${goodChoghadiyaSlots[0]?.startTime || '09:00'}–${goodChoghadiyaSlots[0]?.endTime || '10:30'}) wearing ${panchang.luckyColor}.`
      : `Chant "${mPlanet.beejMantra}" (27x) and avoid Rahu Kaal (${panchang.rahuKaalWindow.start}–${panchang.rahuKaalWindow.end}).`,
  });

  // 2. Live Surya Gochar Alert
  alerts.push({
    id: 'live-surya-gochar',
    planet: `Surya (Sun) in ${liveSunRashi.split(' ')[0]}`,
    alertTitle: isFavorableSuryaGochar
      ? `Solar Authority & Career Boost (${sunHouseFromNatal}th from Janma Rashi)`
      : `Solar Karmic Discipline Window (${sunHouseFromNatal}th Transit)`,
    windowLabel: `Sidereal ${liveSunRashi} (${liveSunDegInSign})`,
    status: isFavorableSuryaGochar ? 'auspicious' : 'spiritual',
    favorabilityScore: sunScore,
    houseOrAspectLabel: `Natal Sun: ${natalSunSign.split(' ')[0]} • Abhijit 11:45–12:33`,
    zodiacAlignmentSummary: `Sun transits ${liveSunRashi}, activating the ${sunHouseFromNatal}th house from your natal ${natalRashi} and harmonizing with your Sun sign ${natalSunSign} (Elemental distance ${Math.abs(liveSunRashiIdx - natalSunRashiIdx)} signs).`,
    recommendedAction: `Best daily solar peak is Abhijit Muhurat (11:45 AM – 12:33 PM). Offer copper-vessel Suryodaya Arghya for Mulank ${m} & Bhagyank ${b} empowerment.`,
  });

  // 3. Today's Birth-Number Synchronized Golden Window (Choghadiya + Hora)
  alerts.push({
    id: 'daily-birth-muhurat',
    planet: `Panchang & Hora (${panchang.currentHora})`,
    alertTitle: panchang.isRahuKaalNow
      ? `Caution: Active Rahu Kaal (${panchang.rahuKaalWindow.start}–${panchang.rahuKaalWindow.end})`
      : `Peak Daily Muhurat: ${panchang.currentChoghadiya.name} Choghadiya`,
    windowLabel: panchang.isRahuKaalNow
      ? `Next Shubh Slot: ${goodChoghadiyaSlots[0]?.startTime || '12:00'}–${goodChoghadiyaSlots[0]?.endTime || '13:30'}`
      : `${panchang.currentChoghadiya.startTime}–${panchang.currentChoghadiya.endTime} • ${panchang.horaStatus.split('(')[0].trim()}`,
    status: panchang.isRahuKaalNow
      ? 'caution'
      : panchang.auspiciousVibrationScore >= 78
      ? 'auspicious'
      : 'spiritual',
    favorabilityScore: panchang.auspiciousVibrationScore,
    houseOrAspectLabel: `Mulank ${m} (${mPlanet.planet}) • Bhagyank ${b} (${bPlanet.planet})`,
    zodiacAlignmentSummary: `Calculated live for ${profile.name} (${natalNakshatra} Pada ${natalPada}, Mulank ${m}, Bhagyank ${b}). Today's lucky numbers: ${panchang.luckyNumbers.join(', ')}. Avoid starting contracts during Rahu Kaal (${panchang.rahuKaalWindow.start}–${panchang.rahuKaalWindow.end}).`,
    recommendedAction: `Use lucky numbers [${panchang.luckyNumbers.join(', ')}] and chant "${panchang.todayBeejMantra}" before pivotal calls.`,
  });

  // 4. Nearest Active Major Planetary Gochar & Upcoming Moon Phase
  const topTransit = CELESTIAL_TRANSITS[1] || CELESTIAL_TRANSITS[0];
  const nextMoon = UPCOMING_MOON_PHASES[0];
  if (topTransit) {
    alerts.push({
      id: `major-${topTransit.id}`,
      planet: topTransit.planet,
      alertTitle: `${topTransit.transitName}${nextMoon ? ` & ${nextMoon.name}` : ''}`,
      windowLabel: `${topTransit.startDate.split('(')[0].trim()} → ${topTransit.endDate.split('(')[0].trim()}`,
      status:
        topTransit.impactType === 'favorable'
          ? 'auspicious'
          : topTransit.impactType === 'caution'
          ? 'caution'
          : 'spiritual',
      favorabilityScore:
        topTransit.impactType === 'favorable' ? 91 : topTransit.impactType === 'caution' ? 68 : 84,
      houseOrAspectLabel: `Aligned for ${natalRashi.split(' ')[0]} & Bhagyank ${b}`,
      zodiacAlignmentSummary: `${topTransit.summary}${
        nextMoon ? ` Upcoming Lunar Portal: ${nextMoon.name} (${nextMoon.tithi}) on ${nextMoon.date}.` : ''
      }`,
      recommendedAction: topTransit.recommendation,
    });
  }

  const peakFavorabilityScore = Math.max(...alerts.map((a) => a.favorabilityScore));
  const overallWindowStatus = panchang.isRahuKaalNow
    ? 'Caution Window Active (Hold New Ventures Until Rahu Kaal Ends)'
    : isFavorableChandraBala && panchang.auspiciousVibrationScore >= 78
    ? 'Golden Auspicious Window Open for Birth Chart'
    : 'Balanced Cosmic Flow (Use Abhijit / Amrit Slots)';

  return {
    computedAtLabel: nowDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    ayanamsaDeg: `${ayanamsa.toFixed(2)}°`,
    liveSunRashi,
    liveSunDegInSign,
    liveMoonRashi,
    liveMoonNakshatra,
    liveMoonDegInSign,
    natalRashi,
    natalSunSign,
    natalNakshatra,
    natalPada,
    natalMulank: m,
    natalBhagyank: b,
    moonTransitHouseFromNatal: moonHouse,
    overallWindowStatus,
    peakFavorabilityScore,
    auspiciousWindowsToday,
    alerts,
  };
}
