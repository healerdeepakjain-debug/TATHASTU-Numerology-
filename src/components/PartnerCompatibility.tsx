import React, { useState, useEffect, useRef } from 'react';
import {
  HeartHandshake,
  Heart,
  Award,
  Users,
  MapPin,
  Search,
  Clock,
  Flame,
  Gem,
  ShieldAlert,
  Crown,
  Sparkles,
  Check,
  Save,
  BarChart3,
} from 'lucide-react';
import { BirthProfile, CompatibilityAnalysis, CityLocation } from '../types';
import {
  calculateCompatibility,
  PLANETARY_PROFILES,
  analyzeName,
} from '../utils/numerology';
import { searchCityGeocode } from '../utils/astrologyAndCities';
import { CityAutocompleteInput } from './CityAutocompleteInput';
import { BirthTimeAmPmInput, formatTime12HourAmPm } from './BirthTimeAmPmInput';
import { calculatePartnerMilanRatnaRecommendations } from './GemstoneRecommendation';
import { useTathastu } from '../utils/tathastuStore';

interface PartnerCompatibilityProps {
  profile: BirthProfile;
}

export interface PartnerMilanHarmonyInsights {
  overallNineChakraScore: number;
  chakrasNeedingRemediesCount: number;
  chakrasNeedingRemediesNames: string[];
  harmoniousChakrasCount: number;
  keyStrengths: string[];
  keyFrictions: string[];
  rudrakshaRemedies: {
    coupleUnityRudraksha: string;
    groomRudraksha: string;
    brideRudraksha: string;
    wearingMethod: string;
    rudrakshaMantra: string;
  };
}

const RUDRAKSHA_BY_MULANK: Record<number, string> = {
  1: '1-Mukhi or 12-Mukhi (Surya — Authority, Clarity & Warmth)',
  2: '2-Mukhi (Ardhanareshwar — Emotional Union & Marital Peace)',
  3: '5-Mukhi (Devguru Brihaspati — Wisdom, Grace & Trust)',
  4: '8-Mukhi (Lord Ganesha — Dissolving Sudden Obstacles)',
  5: '4-Mukhi (Lord Brahma / Budha — Clear Communication & Speech)',
  6: '6-Mukhi or 13-Mukhi (Shukra / Kartikeya — Love, Romance & Luxury)',
  7: '9-Mukhi (Maa Durga — Intuition & Spiritual Protection)',
  8: '7-Mukhi (Maa Mahalakshmi — Financial Stability & Patience)',
  9: '3-Mukhi (Agni / Mangal — Courage & Anger Neutralization)',
};

export function buildPartnerMilanHarmonyInsights(
  analysis: CompatibilityAnalysis,
  groomName: string,
  brideName: string
): PartnerMilanHarmonyInsights {
  const totalChakras = Math.max(1, analysis.chakraChallenges.length);
  const overallNineChakraScore = Math.round(
    analysis.chakraChallenges.reduce((sum, ch) => sum + ch.alignmentScore, 0) / totalChakras
  );
  const needRemedies = analysis.chakraChallenges.filter(
    (ch) => ch.status !== 'Harmonious' || ch.alignmentScore < 75
  );
  const harmonious = analysis.chakraChallenges.filter(
    (ch) => ch.status === 'Harmonious' && ch.alignmentScore >= 75
  );

  const topKootas = [...analysis.dimensions]
    .sort((a, b) => b.obtainedPoints / Math.max(1, b.maxPoints) - a.obtainedPoints / Math.max(1, a.maxPoints))
    .slice(0, 3);
  const weakKootas = [...analysis.dimensions]
    .sort((a, b) => a.obtainedPoints / Math.max(1, a.maxPoints) - b.obtainedPoints / Math.max(1, b.maxPoints))
    .slice(0, 3);

  const keyStrengths: string[] = [
    ...topKootas.map(
      (k) =>
        `Strong ${k.name} (${k.sanskritName} • ${k.obtainedPoints}/${k.maxPoints} Gunas): ${k.description} naturally binds ${groomName} & ${brideName}.`
    ),
    ...(harmonious.length > 0
      ? [
          `${harmonious.length} of 9 Chakras naturally harmonious (${harmonious
            .slice(0, 3)
            .map((c) => c.chakraName)
            .join(', ')}), creating steady emotional & spiritual bonding.`,
        ]
      : [
          `Shared Moon-Rashi & Numerology bridge (${analysis.p1Astrology.rashi} & ${analysis.p2Astrology.rashi}) supports conscious mutual growth.`,
        ]),
  ];

  const keyFrictions: string[] = [
    ...(needRemedies.length > 0
      ? [
          `${needRemedies.length} of 9 Chakras require remedial balancing: ${needRemedies
            .slice(0, 4)
            .map((c) => `${c.chakraName} (${c.alignmentScore}%)`)
            .join(', ')}.`,
        ]
      : [
          `All 9 Chakras are well balanced; focus on maintaining gentle communication during planetary transit peaks.`,
        ]),
    ...weakKootas
      .filter((k) => k.obtainedPoints / Math.max(1, k.maxPoints) < 0.75)
      .slice(0, 2)
      .map(
        (k) =>
          `${k.name} (${k.sanskritName} • ${k.obtainedPoints}/${k.maxPoints} Gunas): Needs conscious empathy & Vedic harmonization for ${k.description.toLowerCase()}.`
      ),
  ];

  const coupleUnityRudraksha =
    needRemedies.length >= 4 || analysis.totalPoints < 22
      ? 'Gauri-Shankar Rudraksha (Sacred Conjoined Shiva-Parvati Bead for Unbreakable Marital Union)'
      : '2-Mukhi Ardhanareshwar Rudraksha + Gauri-Shankar Rudraksha (Marital Harmony & Emotional Resonance)';

  return {
    overallNineChakraScore,
    chakrasNeedingRemediesCount: needRemedies.length,
    chakrasNeedingRemediesNames: needRemedies.map((c) => c.chakraName),
    harmoniousChakrasCount: harmonious.length,
    keyStrengths,
    keyFrictions,
    rudrakshaRemedies: {
      coupleUnityRudraksha,
      groomRudraksha: RUDRAKSHA_BY_MULANK[analysis.p1Mulank] || RUDRAKSHA_BY_MULANK[1],
      brideRudraksha: RUDRAKSHA_BY_MULANK[analysis.p2Mulank] || RUDRAKSHA_BY_MULANK[2],
      wearingMethod:
        'Energize on Monday or Friday morning in raw milk & Gangajal, touch to Shiva-Parvati altar, and wear in red silk thread or silver pendant.',
      rudrakshaMantra: 'Om Namah Shivaya • Om Gauri Shankaraya Namah (108x)',
    },
  };
}

function buildInitialGroomAndBrideForm(prof: BirthProfile) {
  const isFemale = prof.gender === 'female';
  const rawPartnerName = (prof.partnerName || '').trim();
  const isDummyPartner =
    !rawPartnerName ||
    rawPartnerName.toLowerCase() === 'rohit sharma' ||
    rawPartnerName.toLowerCase() === 'priyanka sharma';

  const cleanPartnerName = isDummyPartner ? '' : rawPartnerName;
  const cleanPartnerDob =
    isDummyPartner ||
    !prof.partnerDob ||
    prof.partnerDob === '1988-06-15' ||
    prof.partnerDob === '1990-11-24'
      ? ''
      : prof.partnerDob;
  const cleanPartnerTob = prof.partnerTob || '09:30';
  const cleanPartnerPob =
    isDummyPartner || prof.partnerPob === 'Mumbai, Maharashtra, India'
      ? ''
      : prof.partnerPob || '';

  // Auto-fill Bride details when client is Female, and auto-fill Groom details when client is Male
  if (isFemale) {
    return {
      groom: {
        name: cleanPartnerName,
        dob: cleanPartnerDob,
        tob: cleanPartnerTob,
        pob: cleanPartnerPob,
        lat: prof.partnerLat ?? 28.6139,
        lng: prof.partnerLng ?? 77.209,
      },
      bride: {
        name: prof.name || '',
        dob: prof.dob || '',
        tob: prof.tob || '09:30',
        pob: prof.pob || '',
        lat: prof.lat ?? 28.6139,
        lng: prof.lng ?? 77.209,
      },
    };
  }

  return {
    groom: {
      name: prof.name || '',
      dob: prof.dob || '',
      tob: prof.tob || '09:30',
      pob: prof.pob || '',
      lat: prof.lat ?? 28.6139,
      lng: prof.lng ?? 77.209,
    },
    bride: {
      name: cleanPartnerName,
      dob: cleanPartnerDob,
      tob: cleanPartnerTob,
      pob: cleanPartnerPob,
      lat: prof.partnerLat ?? 28.6139,
      lng: prof.partnerLng ?? 77.209,
    },
  };
}

export const PartnerCompatibility: React.FC<PartnerCompatibilityProps> = ({ profile }) => {
  const { activeProfile, adminUpdateProfile } = useTathastu();
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const initialPair = buildInitialGroomAndBrideForm(profile);
  const [partner1, setPartner1] = useState(initialPair.groom);
  const [partner2, setPartner2] = useState(initialPair.bride);
  const lastProfileIdRef = useRef<string | undefined>(profile.id);

  const isFemaleClient = (activeProfile?.gender || profile.gender) === 'female';

  // Only re-initialize form fields when switching to a different profile ID so typing is never interrupted
  useEffect(() => {
    if (lastProfileIdRef.current !== profile.id) {
      lastProfileIdRef.current = profile.id;
      const resolved = buildInitialGroomAndBrideForm(profile);
      setPartner1(resolved.groom);
      setPartner2(resolved.bride);
    }
  }, [profile]);

  const [p1CitySuggestions, setP1CitySuggestions] = useState<CityLocation[]>([]);
  const [p2CitySuggestions, setP2CitySuggestions] = useState<CityLocation[]>([]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (partner1.pob.trim().length >= 2) {
        const res = await searchCityGeocode(partner1.pob);
        if (active) setP1CitySuggestions(res);
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [partner1.pob]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (partner2.pob.trim().length >= 2) {
        const res = await searchCityGeocode(partner2.pob);
        if (active) setP2CitySuggestions(res);
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [partner2.pob]);

  const handleSwitchProfileGender = async (newGender: 'male' | 'female') => {
    if (!activeProfile) return;
    const currentGender = activeProfile.gender === 'female' ? 'female' : 'male';
    if (currentGender === newGender) return;

    const partnerData = currentGender === 'female' ? partner1 : partner2;
    const clientData = {
      name: activeProfile.name || '',
      dob: activeProfile.dob || '',
      tob: activeProfile.tob || '09:30',
      pob: activeProfile.pob || '',
      lat: activeProfile.lat ?? 28.6139,
      lng: activeProfile.lng ?? 77.209,
    };

    if (newGender === 'female') {
      setPartner2(clientData);
      setPartner1(partnerData);
    } else {
      setPartner1(clientData);
      setPartner2(partnerData);
    }

    await adminUpdateProfile({
      ...activeProfile,
      gender: newGender,
      partnerName: partnerData.name.trim(),
      partnerDob: partnerData.dob,
      partnerTob: partnerData.tob || '09:30',
      partnerPob: partnerData.pob,
      partnerLat: partnerData.lat ?? 28.6139,
      partnerLng: partnerData.lng ?? 77.209,
    });

    setSaveSuccessMessage(
      newGender === 'female'
        ? `Profile role set to Female (Bride). Bride details auto-filled from client profile.`
        : `Profile role set to Male (Groom). Groom details auto-filled from client profile.`
    );
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleSavePartnerMilanToReport = async () => {
    if (!activeProfile) return;
    if (activeProfile.gender === 'female') {
      await adminUpdateProfile({
        ...activeProfile,
        name: partner2.name.trim() || activeProfile.name,
        dob: partner2.dob || activeProfile.dob,
        tob: partner2.tob || activeProfile.tob,
        pob: partner2.pob || activeProfile.pob,
        lat: partner2.lat ?? activeProfile.lat,
        lng: partner2.lng ?? activeProfile.lng,
        partnerName: partner1.name.trim(),
        partnerDob: partner1.dob,
        partnerTob: partner1.tob || '09:30',
        partnerPob: partner1.pob,
        partnerLat: partner1.lat ?? 28.6139,
        partnerLng: partner1.lng ?? 77.209,
        includePartnerMilan: true,
      });
    } else {
      await adminUpdateProfile({
        ...activeProfile,
        name: partner1.name.trim() || activeProfile.name,
        dob: partner1.dob || activeProfile.dob,
        tob: partner1.tob || activeProfile.tob,
        pob: partner1.pob || activeProfile.pob,
        lat: partner1.lat ?? activeProfile.lat,
        lng: partner1.lng ?? activeProfile.lng,
        partnerName: partner2.name.trim(),
        partnerDob: partner2.dob,
        partnerTob: partner2.tob || '09:30',
        partnerPob: partner2.pob,
        partnerLat: partner2.lat ?? 28.6139,
        partnerLng: partner2.lng ?? 77.209,
        includePartnerMilan: true,
      });
    }
    setSaveSuccessMessage(
      `Saved Groom & Bride details to the Report!`
    );
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  const isPartnerMilanActive = (activeProfile?.includePartnerMilan ?? profile.includePartnerMilan) !== false;

  const handleTogglePartnerMilanCheckbox = async (checked: boolean) => {
    if (!activeProfile) return;
    await adminUpdateProfile({
      ...activeProfile,
      includePartnerMilan: checked,
    });
    setSaveSuccessMessage(
      checked
        ? `Partner Milan Activated for ${activeProfile.name}.`
        : `Partner Milan Deactivated for ${activeProfile.name}.`
    );
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const safePartner1 = {
    ...partner1,
    name: partner1.name.trim() || (!isFemaleClient ? profile.name || 'Groom' : 'Groom'),
    dob: partner1.dob || (!isFemaleClient ? profile.dob || '1990-01-01' : '1990-01-01'),
    tob: partner1.tob || '09:30',
    pob: partner1.pob || (!isFemaleClient ? profile.pob || 'New Delhi, India' : 'New Delhi, India'),
  };

  const safePartner2 = {
    ...partner2,
    name: partner2.name.trim() || (isFemaleClient ? profile.name || 'Bride' : 'Bride'),
    dob: partner2.dob || (isFemaleClient ? profile.dob || '1992-01-01' : '1992-01-01'),
    tob: partner2.tob || '09:30',
    pob: partner2.pob || (isFemaleClient ? profile.pob || 'New Delhi, India' : 'New Delhi, India'),
  };

  const analysis: CompatibilityAnalysis = calculateCompatibility(safePartner1, safePartner2);

  const p1MulankData = PLANETARY_PROFILES[analysis.p1Mulank];
  const p2MulankData = PLANETARY_PROFILES[analysis.p2Mulank];
  const p1BhagyankData = PLANETARY_PROFILES[analysis.p1Bhagyank];
  const p2BhagyankData = PLANETARY_PROFILES[analysis.p2Bhagyank];
  const p1NameData = analyzeName(safePartner1.name, analysis.p1Mulank, analysis.p1Bhagyank);
  const p2NameData = analyzeName(safePartner2.name, analysis.p2Mulank, analysis.p2Bhagyank);
  const partnerRatnaRec = calculatePartnerMilanRatnaRecommendations(
    safePartner1,
    safePartner2,
    analysis
  );
  const partnerInsights = buildPartnerMilanHarmonyInsights(
    analysis,
    safePartner1.name,
    safePartner2.name
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Sacred Banner + Partner Milan Opt-In Checkbox */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>Ashtakoot Guna Milan • 9-Chakra Marital Diagnostics • Pranic Remedies</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Vedic Partner Milan & Ashtakoot Milan Chart
            </h1>
            <p className="text-sm text-amber-200/70 max-w-2xl">
              Synthesizes Sidereal Moon Sign (Rashi), Sun Sign, and Nakshatra from birth coordinates with 36-point Ashtakoot Guna Milan and Bride/Groom 9-Chakra bio-field compatibility (#1 Earth Star to #9 Soul Star).
            </p>

            {/* Partner Milan Activation Checkbox + Gender Role Switcher */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <label
                className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                  isPartnerMilanActive
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 border-rose-400/50 text-rose-200 hover:border-amber-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isPartnerMilanActive}
                  onChange={(e) => handleTogglePartnerMilanCheckbox(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span>
                  {isPartnerMilanActive
                    ? `✓ Partner Milan Active for ${profile.name}`
                    : `Enable Partner Milan for ${profile.name}`}
                </span>
              </label>

              <span className="text-[11px] font-bold text-slate-300">
                Client Role ({profile.name}):
              </span>
              <button
                type="button"
                onClick={() => handleSwitchProfileGender('male')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                  !isFemaleClient
                    ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ♂ Male (Groom)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchProfileGender('female')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                  isFemaleClient
                    ? 'bg-rose-500/25 border-rose-400 text-rose-200 shadow'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ♀ Female (Bride)
              </button>
            </div>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2.5 shrink-0">
            {isPartnerMilanActive && (
              <button
                type="button"
                onClick={handleSavePartnerMilanToReport}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Groom & Bride Details</span>
              </button>
            )}

            <div className="bg-slate-950/90 px-5 py-3 rounded-2xl border border-amber-500/35 text-center min-w-[205px]">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Ashtakoot Score</span>
              <span className="text-2xl font-black font-mono text-amber-200">
                {analysis.totalPoints} / 36
              </span>
              <span className="text-xs text-emerald-400 font-bold block">
                {analysis.overallPercentage}% Resonance
              </span>
            </div>

            {/* 9-Chakra Harmony Overall Score Box directly below Ashtakoot Score */}
            <div className="bg-slate-950/90 px-5 py-3 rounded-2xl border border-purple-400/45 text-center min-w-[205px]">
              <span className="text-[10px] text-purple-300 uppercase font-bold block">
                9-Chakra Harmony Overall Score
              </span>
              <span className="text-2xl font-black font-mono text-amber-100">
                {partnerInsights.overallNineChakraScore}%
              </span>
              <span
                className={`text-[11px] font-extrabold block mt-0.5 ${
                  partnerInsights.chakrasNeedingRemediesCount === 0
                    ? 'text-emerald-300'
                    : partnerInsights.chakrasNeedingRemediesCount <= 3
                    ? 'text-amber-300'
                    : 'text-rose-300'
                }`}
              >
                {partnerInsights.chakrasNeedingRemediesCount} / 9 Chakras Need Remedies
              </span>
            </div>
          </div>
        </div>

        {saveSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {!isPartnerMilanActive ? (
        <div className="bg-slate-900/90 border-2 border-dashed border-amber-500/40 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 mx-auto">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
            Partner Milan for {profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Enable Partner Milan below to enter Groom &amp; Bride details and calculate 36-Guna Ashtakoot Compatibility.
          </p>
          <div className="pt-2">
            <label className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl cursor-pointer hover:from-amber-400 hover:to-orange-500 transition-all">
              <input
                type="checkbox"
                checked={isPartnerMilanActive}
                onChange={(e) => handleTogglePartnerMilanCheckbox(e.target.checked)}
                className="w-4 h-4 accent-slate-950 rounded cursor-pointer"
              />
              <span>Activate Partner Milan for {profile.name}</span>
            </label>
          </div>
        </div>
      ) : (
        <>
          {/* Groom & Bride Birth Profiles with City Coordinates & Sidereal Astrology */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Groom Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/25 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/15 pb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Groom / Partner 1 Profile</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setPartner1({
                    name: profile.name || '',
                    dob: profile.dob || '',
                    tob: profile.tob || '09:30',
                    pob: profile.pob || '',
                    lat: profile.lat ?? 28.6139,
                    lng: profile.lng ?? 77.209,
                  })
                }
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-950/90 hover:bg-sky-900 border border-sky-400/50 text-sky-200 cursor-pointer"
              >
                Fill Client Details
              </button>
              <button
                type="button"
                onClick={() =>
                  setPartner1({
                    name: '',
                    dob: '',
                    tob: '09:30',
                    pob: '',
                    lat: 28.6139,
                    lng: 77.209,
                  })
                }
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-300">
                Mulank: <strong>{analysis.p1Mulank}</strong> ({p1MulankData?.planet}) • Bhagyank: <strong>{analysis.p1Bhagyank}</strong>
              </span>
              <button
                type="button"
                onClick={handleSavePartnerMilanToReport}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[11px] font-bold transition-all cursor-pointer"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 truncate">
                Groom Full Name
              </label>
              <input
                type="text"
                value={partner1.name}
                onChange={(e) => setPartner1((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter Groom Full Name..."
                className="w-full h-[38px] bg-slate-950 border border-amber-500/30 rounded-xl px-3 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 truncate">
                Groom Date of Birth
              </label>
              <input
                type="date"
                value={partner1.dob}
                onChange={(e) => setPartner1((prev) => ({ ...prev, dob: e.target.value }))}
                className="w-full h-[38px] bg-slate-950 border border-amber-500/30 rounded-xl px-3 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 truncate">
                Groom Birth Time ({formatTime12HourAmPm(partner1.tob)})
              </label>
              <BirthTimeAmPmInput
                value={partner1.tob}
                onChange={(newTob) => setPartner1((prev) => ({ ...prev, tob: newTob }))}
                compact
              />
            </div>
            <div className="relative">
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 truncate">
                Groom Birth City
              </label>
              <CityAutocompleteInput
                value={partner1.pob}
                lat={partner1.lat}
                lng={partner1.lng}
                onChangeText={(txt) => setPartner1((prev) => ({ ...prev, pob: txt }))}
                onSelectCity={(res) =>
                  setPartner1((prev) => ({
                    ...prev,
                    pob: res.formattedPob,
                    lat: res.lat,
                    lng: res.lng,
                  }))
                }
                placeholder="Enter Groom Birth City..."
                inputClassName="w-full h-[38px] bg-slate-950 border border-amber-500/30 rounded-xl pl-9 pr-8 text-xs text-amber-100"
              />
            </div>
          </div>

          {/* Groom Auto-Calculated Moon Sign, Sun Sign, Nakshatra */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950 border border-amber-500/20 text-center">
            <div>
              <span className="text-[9px] text-amber-400 uppercase font-bold block">Janma Rashi (Moon)</span>
              <span className="text-xs font-bold text-amber-100">{analysis.p1Astrology.rashi}</span>
            </div>
            <div>
              <span className="text-[9px] text-amber-400 uppercase font-bold block">Surya Rashi (Sun)</span>
              <span className="text-xs font-bold text-amber-100">{analysis.p1Astrology.sunSign}</span>
            </div>
            <div>
              <span className="text-[9px] text-emerald-400 uppercase font-bold block">Janma Nakshatra</span>
              <span className="text-xs font-bold text-emerald-300">
                {analysis.p1Astrology.nakshatra} (P-{analysis.p1Astrology.pada})
              </span>
            </div>
          </div>
        </div>

        {/* Bride Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Bride / Partner 2 Profile</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setPartner2({
                    name: profile.name || '',
                    dob: profile.dob || '',
                    tob: profile.tob || '09:30',
                    pob: profile.pob || '',
                    lat: profile.lat ?? 28.6139,
                    lng: profile.lng ?? 77.209,
                  })
                }
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/90 hover:bg-rose-900 border border-rose-400/50 text-rose-200 cursor-pointer"
              >
                Fill Client Details
              </button>
              <button
                type="button"
                onClick={() =>
                  setPartner2({
                    name: '',
                    dob: '',
                    tob: '09:30',
                    pob: '',
                    lat: 28.6139,
                    lng: 77.209,
                  })
                }
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 hover:bg-slate-800 border border-rose-500/30 text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-300">
                Mulank: <strong>{analysis.p2Mulank}</strong> ({p2MulankData?.planet}) • Bhagyank: <strong>{analysis.p2Bhagyank}</strong>
              </span>
              <button
                type="button"
                onClick={handleSavePartnerMilanToReport}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold transition-all cursor-pointer shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
            <div>
              <label className="block text-[11px] font-medium text-rose-200/90 mb-1.5 truncate">
                Bride Full Name
              </label>
              <input
                type="text"
                value={partner2.name}
                onChange={(e) => setPartner2((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full h-[38px] bg-slate-950 border border-rose-500/35 rounded-xl px-3 text-xs text-amber-100 focus:outline-none focus:border-rose-400"
                placeholder="Enter Bride Full Name..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-rose-200/90 mb-1.5 truncate">
                Bride Date of Birth
              </label>
              <input
                type="date"
                value={partner2.dob}
                onChange={(e) => setPartner2((prev) => ({ ...prev, dob: e.target.value }))}
                className="w-full h-[38px] bg-slate-950 border border-rose-500/35 rounded-xl px-3 text-xs text-amber-100 focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-rose-200/90 mb-1.5 truncate">
                Bride Birth Time ({formatTime12HourAmPm(partner2.tob)})
              </label>
              <BirthTimeAmPmInput
                value={partner2.tob}
                onChange={(newTob) => setPartner2((prev) => ({ ...prev, tob: newTob }))}
                compact
                className="border-rose-500/35"
              />
            </div>
            <div className="relative">
              <label className="block text-[11px] font-medium text-rose-200/90 mb-1.5 truncate">
                Bride Birth City
              </label>
              <CityAutocompleteInput
                value={partner2.pob}
                lat={partner2.lat}
                lng={partner2.lng}
                onChangeText={(txt) => setPartner2((prev) => ({ ...prev, pob: txt }))}
                onSelectCity={(res) =>
                  setPartner2((prev) => ({
                    ...prev,
                    pob: res.formattedPob,
                    lat: res.lat,
                    lng: res.lng,
                  }))
                }
                placeholder="Enter Bride Birth City..."
                inputClassName="w-full h-[38px] bg-slate-950 border border-rose-500/35 rounded-xl pl-9 pr-8 text-xs text-amber-100"
              />
            </div>
          </div>

          {/* Bride Auto-Calculated Moon Sign, Sun Sign, Nakshatra */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950 border border-rose-500/25 text-center">
            <div>
              <span className="text-[9px] text-rose-300 uppercase font-bold block">Janma Rashi (Moon)</span>
              <span className="text-xs font-bold text-amber-100">{analysis.p2Astrology.rashi}</span>
            </div>
            <div>
              <span className="text-[9px] text-rose-300 uppercase font-bold block">Surya Rashi (Sun)</span>
              <span className="text-xs font-bold text-amber-100">{analysis.p2Astrology.sunSign}</span>
            </div>
            <div>
              <span className="text-[9px] text-emerald-400 uppercase font-bold block">Janma Nakshatra</span>
              <span className="text-xs font-bold text-emerald-300">
                {analysis.p2Astrology.nakshatra} (P-{analysis.p2Astrology.pada})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AUTOMATIC NAME + DOB VIBRATIONS COMPATIBILITY SCORE GAUGE GRAPHIC */}
      {analysis.nameDobCompatibility && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950/35 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Prominent SVG Semi-Circular Dial Gauge Graphic */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">
                Automatic Name &amp; DOB Compatibility Score
              </div>
              {(() => {
                const score = Math.max(0, Math.min(100, analysis.nameDobCompatibility.overallScore));
                const needleDeg = -90 + (score / 100) * 180;
                const arcLen = 314.16; // pi * 100 radius semi-circle
                const dashOffset = arcLen * (1 - score / 100);
                const scoreColor =
                  score >= 80
                    ? '#10b981'
                    : score >= 68
                    ? '#f59e0b'
                    : '#f43f5e';
                return (
                  <div className="relative w-full max-w-[280px] flex flex-col items-center">
                    <svg viewBox="0 0 260 150" className="w-full h-auto overflow-visible" aria-label={`Compatibility Score Gauge ${score}%`}>
                      <defs>
                        <linearGradient id="compatGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      {/* Background Track Arc */}
                      <path
                        d="M 30 130 A 100 100 0 0 1 230 130"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      {/* Colored Spectrum Arc */}
                      <path
                        d="M 30 130 A 100 100 0 0 1 230 130"
                        fill="none"
                        stroke="url(#compatGaugeGrad)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={arcLen}
                        strokeDashoffset={dashOffset}
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                      {/* Scale Labels */}
                      <text x="18" y="146" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">0%</text>
                      <text x="130" y="18" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">50%</text>
                      <text x="242" y="146" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">100%</text>

                      {/* Calibrated Gauge Needle */}
                      <g transform={`translate(130, 130) rotate(${needleDeg})`} style={{ transition: 'transform 0.6s ease' }}>
                        <polygon points="-4,0 0,-84 4,0" fill="#fde68a" />
                        <circle cx="0" cy="0" r="8" fill={scoreColor} stroke="#fef3c7" strokeWidth="2.5" />
                      </g>
                    </svg>

                    <div className="-mt-2 text-center">
                      <div className="text-4xl font-black font-mono text-white">
                        {score}%
                      </div>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-[11px] font-black uppercase border ${
                          score >= 80
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                            : score >= 68
                            ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                            : 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                        }`}
                      >
                        {analysis.nameDobCompatibility.verdict}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right: 4 Name + DOB Vibration Sub-Meters & Narrative Summary */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Chaldean Name + Mulank/Bhagyank DOB Vibration Engine</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                  Name &amp; Birth-Number Compatibility Breakdown
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {analysis.nameDobCompatibility.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: `Mulank Psychic Resonance (${analysis.p1Mulank} vs ${analysis.p2Mulank})`,
                    val: analysis.nameDobCompatibility.mulankHarmony,
                  },
                  {
                    label: `Bhagyank Destiny Synergy (${analysis.p1Bhagyank} vs ${analysis.p2Bhagyank})`,
                    val: analysis.nameDobCompatibility.bhagyankHarmony,
                  },
                  {
                    label: `Chaldean Namank Harmony (${p1NameData.chaldeanSingle} vs ${p2NameData.chaldeanSingle})`,
                    val: analysis.nameDobCompatibility.namankHarmony,
                  },
                  {
                    label: 'Cross Name-to-Birth Resonance',
                    val: analysis.nameDobCompatibility.crossNumberHarmony,
                  },
                ].map((metric, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-3 rounded-xl bg-slate-950/85 border border-amber-500/25 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-200">{metric.label}</span>
                      <span className="font-mono font-black text-emerald-300">{metric.val}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          metric.val >= 80
                            ? 'bg-emerald-500'
                            : metric.val >= 65
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(8, Math.min(100, metric.val))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Groom vs Bride Complete Natal & Astrological Details Ledger + Visual Ashtakoot Milan Chart */}
      <div className="bg-slate-900/90 border border-amber-500/35 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Complete Groom & Bride Natal Comparison + 36-Guna Ashtakoot Milan Chart</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-amber-100">
              Ashtakoot Milan Chart: {partner1.name} (Groom) &amp; {partner2.name} (Bride)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              This complete Groom &amp; Bride comparison and 8-Koota Ashtakoot Milan chart is automatically included in your personalized A4 PDF Report.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSavePartnerMilanToReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save to PDF Report</span>
          </button>
        </div>

        {/* Groom vs Bride Complete Natal & Astrological Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-amber-500/25">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-amber-950/50 border-b border-amber-500/30 text-amber-200 uppercase text-[11px]">
                <th className="py-2.5 px-3 font-bold">Astro-Numerology Parameter</th>
                <th className="py-2.5 px-3 font-bold text-amber-300">
                  Groom / Partner 1: {partner1.name}
                </th>
                <th className="py-2.5 px-3 font-bold text-rose-300">
                  Bride / Partner 2: {partner2.name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/90 text-slate-200">
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-400/90">Full Name &amp; Chaldean Namank</td>
                <td className="py-2 px-3 font-mono">
                  <strong>{partner1.name}</strong> (Compound {p1NameData.totalChaldeanCompound} ➔ Root {p1NameData.chaldeanSingle})
                </td>
                <td className="py-2 px-3 font-mono">
                  <strong>{partner2.name}</strong> (Compound {p2NameData.totalChaldeanCompound} ➔ Root {p2NameData.chaldeanSingle})
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-400/90">Date &amp; Time of Birth (AM/PM)</td>
                <td className="py-2 px-3 font-mono">
                  {partner1.dob} • {formatTime12HourAmPm(partner1.tob)}
                </td>
                <td className="py-2 px-3 font-mono">
                  {partner2.dob} • {formatTime12HourAmPm(partner2.tob)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-400/90">Birth Place &amp; Geodesic Coordinates</td>
                <td className="py-2 px-3">
                  {partner1.pob} ({partner1.lat.toFixed(2)}°N, {partner1.lng.toFixed(2)}°E)
                </td>
                <td className="py-2 px-3">
                  {partner2.pob} ({partner2.lat.toFixed(2)}°N, {partner2.lng.toFixed(2)}°E)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-400/90">Mulank (Psychic) &amp; Ruling Planet</td>
                <td className="py-2 px-3">
                  <strong>Mulank {analysis.p1Mulank}</strong> — {p1MulankData?.planet} ({p1MulankData?.sanskritName})
                </td>
                <td className="py-2 px-3">
                  <strong>Mulank {analysis.p2Mulank}</strong> — {p2MulankData?.planet} ({p2MulankData?.sanskritName})
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-400/90">Bhagyank (Destiny) &amp; Ruling Planet</td>
                <td className="py-2 px-3">
                  <strong>Bhagyank {analysis.p1Bhagyank}</strong> — {p1BhagyankData?.planet} ({p1BhagyankData?.sanskritName})
                </td>
                <td className="py-2 px-3">
                  <strong>Bhagyank {analysis.p2Bhagyank}</strong> — {p2BhagyankData?.planet} ({p2BhagyankData?.sanskritName})
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-400/90">Sidereal Moon Sign (Janma Rashi)</td>
                <td className="py-2 px-3 font-semibold text-amber-200">{analysis.p1Astrology.rashi}</td>
                <td className="py-2 px-3 font-semibold text-rose-200">{analysis.p2Astrology.rashi}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-400/90">Sidereal Sun Sign (Surya Rashi)</td>
                <td className="py-2 px-3">{analysis.p1Astrology.sunSign}</td>
                <td className="py-2 px-3">{analysis.p2Astrology.sunSign}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-amber-400/90">Janma Nakshatra &amp; Pada</td>
                <td className="py-2 px-3 text-emerald-300 font-semibold">
                  {analysis.p1Astrology.nakshatra} (Pada {analysis.p1Astrology.pada})
                </td>
                <td className="py-2 px-3 text-emerald-300 font-semibold">
                  {analysis.p2Astrology.nakshatra} (Pada {analysis.p2Astrology.pada})
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Visual 8-Koota Ashtakoot Milan Chart & Table */}
        <div className="overflow-x-auto rounded-xl border border-amber-500/30">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-b border-amber-500/30 text-amber-200 uppercase text-[11px]">
                <th className="py-2.5 px-3 font-bold">#</th>
                <th className="py-2.5 px-3 font-bold">Ashtakoot Koota (Dimension)</th>
                <th className="py-2.5 px-3 font-bold">Marital Domain</th>
                <th className="py-2.5 px-3 font-bold text-center">Max Gunas</th>
                <th className="py-2.5 px-3 font-bold text-center">Obtained Gunas</th>
                <th className="py-2.5 px-3 font-bold w-48">Visual Guna Milan Chart</th>
                <th className="py-2.5 px-3 font-bold text-center">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/90">
              {analysis.dimensions.map((dim, idx) => {
                const pct = Math.round((dim.obtainedPoints / Math.max(1, dim.maxPoints)) * 100);
                return (
                  <tr key={idx} className="hover:bg-slate-900/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-amber-100">
                      {dim.name} <span className="text-amber-400/80 font-normal">({dim.sanskritName})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{dim.description}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">{dim.maxPoints}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-amber-300">
                      {dim.obtainedPoints}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 75
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : pct >= 50
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : 'bg-gradient-to-r from-rose-500 to-orange-500'
                            }`}
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 w-9 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          dim.verdict === 'Excellent'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : dim.verdict === 'Good'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {dim.verdict}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-amber-950/40 border-t-2 border-amber-500/40 font-bold text-amber-100">
                <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                  Total Ashtakoot Guna Milan Score ({partner1.name} &amp; {partner2.name}):
                </td>
                <td className="py-3 px-3 text-center font-mono text-sm">36</td>
                <td className="py-3 px-3 text-center font-mono text-base text-emerald-300 font-black">
                  {analysis.totalPoints}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden border border-amber-500/40">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400"
                        style={{ width: `${analysis.overallPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-amber-200 font-bold">
                      {analysis.overallPercentage}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center text-emerald-300 uppercase text-xs">
                  {analysis.totalPoints >= 24 ? 'Shubh Milan' : 'Remedy Guided'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Vedic Astrology Precious Stone (Ratna) Recommendation for Relationship Harmony (Groom & Bride) */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/20 to-rose-950/20 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/25 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              <span>Vedic Astrology Relationship Harmony Ratna-Shastra • Groom &amp; Bride Prescription</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
              Precious Stone Recommendation for Relationship Harmony (Bride &amp; Groom)
            </h2>
            <p className="text-xs text-amber-200/80 max-w-3xl leading-relaxed">
              Prescribed according to Vedic Sidereal Astrology (Janma Rashi, 7th House Kalatra/Mangalya Karaka, 36-Guna Ashtakoot Milan, and 9-Chakra Bio-Field Diagnostics) with complete wearing instructions (Which Finger, Hand, Metal, Day/Time, Purification &amp; Mantra). Automatically included in your PDF Report.
            </p>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 shrink-0">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">
              Who Needs To Wear For Harmony
            </span>
            <strong className="text-sm font-serif text-amber-200 block">
              {partnerRatnaRec.whoNeedsItBadge}
            </strong>
          </div>
        </div>

        {/* Vedic Astrological Assessment Banner: Who Needs It & Why */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/35 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Vedic Astrological Harmony Verdict (Bride vs Groom Requirement):</span>
          </div>
          <p>{partnerRatnaRec.whoNeedsItSummary}</p>
        </div>

        {/* Groom & Bride Precious Stone Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { rec: partnerRatnaRec.groomStone, isBride: false },
            { rec: partnerRatnaRec.brideStone, isBride: true },
          ].map(({ rec, isBride }, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-5 space-y-4 flex flex-col justify-between ${
                isBride
                  ? 'bg-slate-950/95 border-rose-500/45 shadow-lg shadow-rose-500/5'
                  : 'bg-slate-950/95 border-amber-500/45 shadow-lg shadow-amber-500/5'
              }`}
            >
              <div className="space-y-4">
                {/* Priority Badge & Planet */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      isBride
                        ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                    }`}
                  >
                    {rec.priorityBadge}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-200 bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-500/25">
                    Planet: {rec.ratna.planet} ({rec.ratna.sanskritPlanet})
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-amber-100 leading-snug">
                    {rec.purposeTitle}
                  </h3>
                  <p className="text-xs text-amber-300/80 mt-0.5">{rec.purposeSubtitle}</p>
                </div>

                {/* Primary Gem & Upratna Highlight Box */}
                <div
                  className={`p-4 rounded-xl bg-gradient-to-r ${rec.ratna.badgeColor} border space-y-1.5`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 block">
                        Primary Precious Stone (Maharatna)
                      </span>
                      <div className="text-base sm:text-lg font-serif font-black text-white">
                        {rec.ratna.primaryGem} ({rec.ratna.sanskritGem})
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/20 text-xs font-mono font-bold text-amber-200">
                      {rec.idealRattiRange} ({rec.idealCaratRange})
                    </span>
                  </div>
                  <div className="text-xs text-slate-100 pt-1 border-t border-white/15">
                    <strong>Substitute Stone (Upratna):</strong> {rec.ratna.upratna}
                  </div>
                </div>

                {/* Astrological Reason for Relationship Harmony */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs text-slate-200 leading-relaxed">
                  <strong className="text-amber-300 uppercase text-[10px] tracking-wider block mb-1">
                    How It Creates Relationship &amp; Marital Harmony:
                  </strong>
                  {rec.astrologicalReason}
                </div>

                {/* 4-Box Wearing Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block mb-0.5">
                      1. Which Finger &amp; Hand to Wear
                    </span>
                    <strong className="text-amber-100 block">{rec.wearingHandAndFinger}</strong>
                    <span className="text-[11px] text-slate-400">
                      Chakra: {rec.ratna.chakra}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block mb-0.5">
                      2. In Which Metal &amp; Setting
                    </span>
                    <strong className="text-amber-100 block">{rec.ratna.metal}</strong>
                    <span className="text-[11px] text-slate-400">
                      Open-back ring/pendant touching skin
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-0.5">
                      3. Auspicious Day, Time &amp; Nakshatra
                    </span>
                    <strong className="text-emerald-200 block">{rec.dayAndMuhurat}</strong>
                    <span className="text-[11px] text-slate-400">
                      {rec.pakshaAndNakshatra}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25">
                    <span className="text-[10px] font-bold uppercase text-sky-400 block mb-0.5">
                      4. Panchamrit Purification Liquid
                    </span>
                    <strong className="text-sky-200 block text-[11px]">
                      {rec.purificationIngredients}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      Soak 21–30 mins before sunrise
                    </span>
                  </div>
                </div>

                {/* Energization Beej Mantra */}
                <div className="p-3 rounded-xl bg-amber-950/35 border border-amber-500/35">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">
                    5. Prana-Pratishtha Beej Mantra (Chant 108 Times Before Wearing)
                  </span>
                  <span className="text-xs font-serif font-bold text-amber-100">
                    {rec.beejMantra}
                  </span>
                </div>

                {/* Step-by-Step How to Wear Vidhi */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    Complete Step-by-Step Wearing Ritual (Ratna Dharan Vidhi):
                  </span>
                  {rec.howToWearStepByStep.map((step, sIdx) => (
                    <p key={sIdx} className="text-[11px] text-slate-200 leading-relaxed">
                      • {step}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Partner Strengths & Key Karmic Frictions & Focus Areas (Mirroring Parivar Milan) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/35 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Key Partner Strengths ({safePartner1.name} &amp; {safePartner2.name})</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside leading-relaxed">
              {partnerInsights.keyStrengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-rose-950/30 border border-rose-500/35 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-300">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>Key Karmic Frictions &amp; Focus Areas ({partnerInsights.chakrasNeedingRemediesCount}/9 Chakras Need Remedies)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside leading-relaxed">
              {partnerInsights.keyFrictions.map((fr, i) => (
                <li key={i}>{fr}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sacred Rudraksha Remedies for Partner Harmony */}
        <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/40 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
            <span className="font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-amber-400" />
              <span>Sacred Rudraksha Remedies for Marital &amp; 9-Chakra Harmony</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 font-bold text-[10px]">
              INCLUDED IN REPORT PDF
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-slate-200">
            <div className="p-2.5 rounded-xl bg-slate-950/85 border border-amber-500/25">
              <strong className="text-amber-300 block uppercase text-[10px]">Couple Unity Rudraksha</strong>
              {partnerInsights.rudrakshaRemedies.coupleUnityRudraksha}
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/85 border border-sky-500/25">
              <strong className="text-sky-300 block uppercase text-[10px]">Groom ({safePartner1.name}) Rudraksha</strong>
              {partnerInsights.rudrakshaRemedies.groomRudraksha}
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/85 border border-rose-500/25">
              <strong className="text-rose-300 block uppercase text-[10px]">Bride ({safePartner2.name}) Rudraksha</strong>
              {partnerInsights.rudrakshaRemedies.brideRudraksha}
            </div>
          </div>
          <div className="text-[11px] text-emerald-200">
            <strong className="text-emerald-300">Wearing Method &amp; Mantra:</strong>{' '}
            {partnerInsights.rudrakshaRemedies.wearingMethod} ({partnerInsights.rudrakshaRemedies.rudrakshaMantra})
          </div>
        </div>

        {/* Joint Couple Harmony Stone Note */}
        <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 text-xs text-emerald-100 leading-relaxed">
          <strong className="text-emerald-300 uppercase tracking-wider block mb-0.5">
            Joint Couple Relationship Harmony &amp; Bedroom Crystal Synergy:
          </strong>
          {partnerRatnaRec.jointHarmonyStoneSummary}
        </div>
      </div>

      {/* 9-Chakra Post-Marriage Life Challenges (Bride vs Groom Attribution) & Remedies */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Bio-Energetic Marital Diagnostics • Bride & Groom Attribution</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-amber-100">
              9-Chakra Post-Marriage Life Challenges & Remedial Prescriptions
            </h2>
            <p className="text-xs text-amber-300/70">
              Pinpoints the specific karmic challenges carried by the Groom ({partner1.name}) and the Bride ({partner2.name}) across all 9 Chakras (#1 Earth Star to #9 Soul Star) after marriage, with targeted Pranic Aura & Crystal remedies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {analysis.chakraChallenges.map((chakra, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-slate-950 border space-y-4 ${
                chakra.status === 'Severe Karmic Challenge'
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : chakra.status === 'Moderate Blockage'
                  ? 'border-amber-500/35'
                  : 'border-emerald-500/30'
              }`}
            >
              {/* Top Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/15 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-md"
                    style={{ backgroundColor: chakra.color }}
                  />
                  <h3 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                    {chakra.chakraName}
                  </h3>
                  <span className="text-xs text-amber-400/90 font-medium">
                    ({chakra.sanskritName} • {chakra.element})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-200 font-semibold">
                    Primary Carrier: <strong>{chakra.affectedPartner}</strong>
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                      chakra.status === 'Severe Karmic Challenge'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                        : chakra.status === 'Moderate Blockage'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {chakra.status} ({chakra.alignmentScore}%)
                  </span>
                </div>
              </div>

              {/* Separate Groom & Bride Challenge Attribution Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-900/95 border border-amber-500/25 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Groom's Karmic Pattern ({partner1.name})</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Mulank {analysis.p1Mulank} • {analysis.p1Astrology.rashi.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {chakra.groomChallengeDetail}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/95 border border-rose-500/25 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Bride's Karmic Pattern ({partner2.name})</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Mulank {analysis.p2Mulank} • {analysis.p2Astrology.rashi.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {chakra.brideChallengeDetail}
                  </p>
                </div>
              </div>

              {/* Combined Marital Dynamic & Remedy */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-rose-950/15 border border-rose-500/25 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Joint Marital Manifestation & Astrological Diagnosis</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{chakra.postMarriageIssue}</p>
                  <p className="text-[11px] text-amber-300/80 italic pt-1">
                    {chakra.fortuneReadingDiagnosis}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                      <Gem className="w-3.5 h-3.5" />
                      <span>Prescribed Pranic Aura & Crystal Summary</span>
                    </span>
                    <p className="text-slate-200 leading-relaxed">{chakra.auraScanRemedy}</p>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 pt-2 text-[11px] font-mono text-amber-300 border-t border-emerald-500/20">
                    <span>Crystal: <strong>{chakra.healingCrystal}</strong></span>
                    <span>Siddhi Mantra: <strong>{chakra.beejMantra}</strong></span>
                    {chakra.soundFrequencyHz && (
                      <span className="text-purple-300">Sound: <strong>🔊 {chakra.soundFrequencyHz}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Explicit Remedy Attribution: Groom vs Bride vs Both Partners */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/35 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-black text-amber-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Remedy for Groom ({partner1.name})</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{chakra.groomRemedy}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/35 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-black text-rose-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remedy for Bride ({partner2.name})</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{chakra.brideRemedy}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/40 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-black text-emerald-300 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Joint Remedy for Both Partners</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{chakra.bothRemedy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*Elaborated 8 Vedic Dimensions (Ashtakoot Koota) with Detailed Paragraphs & Remedies */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Brihat Parashara Hora Shastra • Comprehensive 36-Guna Exposition</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>The 8 Vedic Dimensions (Ashtakoot Milan — {analysis.totalPoints} / 36 Gunas)</span>
            </h2>
            <p className="text-xs text-amber-200/80 mt-0.5">{analysis.verdict}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {analysis.dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950 border border-amber-500/25 hover:border-amber-400/50 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/15 pb-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                    {dim.name}
                  </h3>
                  <span className="text-xs font-serif text-amber-400/90">
                    ({dim.sanskritName})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {dim.soundFrequencyHz && (
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/35 text-purple-200">
                      🔊 {dim.soundFrequencyHz}
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-100">
                    Score: {dim.obtainedPoints} / {dim.maxPoints} Gunas
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      dim.verdict === 'Excellent'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : dim.verdict === 'Good'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {dim.verdict}
                  </span>
                </div>
              </div>

              {/* Detailed Multi-Sentence Paragraph Elaborating the Dimension */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <p>{dim.detailedAnalysis}</p>
              </div>

              {/* Dedicated Vedic & Aura Remedy for this Dimension */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prescribed Shastra & Pranic Harmonization Overview ({dim.sanskritName})</span>
                </span>
                <p className="text-slate-200 leading-relaxed">{dim.remedy}</p>
              </div>

              {/* Groom vs Bride vs Both Remedy Breakdown for each Ashtakoot Dimension */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>Groom Remedy ({partner1.name})</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{dim.groomRemedy}</p>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
                  <span className="text-[10px] font-black uppercase text-rose-300 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span>Bride Remedy ({partner2.name})</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{dim.brideRemedy}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/35 text-xs space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-300 flex items-center gap-1">
                    <HeartHandshake className="w-3 h-3 text-emerald-400" />
                    <span>Both Partners Joint Remedy</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{dim.bothRemedy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marital Name Resonance Harmonizer */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Marital Name Vibration Harmonizer</span>
          </h3>
          <p className="text-xs text-amber-300/70">
            Calibrates both partners' Chaldean name compounds to foster domestic peace, emotional intimacy, and shared prosperity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.perfectNameSuggestions.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block mb-1">
                  {item.partnerLabel}
                </span>
                <div className="text-xs text-slate-400 mb-1">
                  Natal Spelling: <span className="line-through">{item.currentName}</span>
                </div>
                <div className="text-lg font-serif font-black text-amber-100 tracking-wide">
                  {item.suggestedPerfectName}
                </div>
                <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Compound {item.compound} ➔ Root {item.root} ({item.title})
                </span>
              </div>
              <p className="text-xs text-slate-300 border-t border-amber-500/15 pt-2">
                {item.maritalBenefit}
              </p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
};

