import React, { useState, useEffect } from 'react';
import {
  Phone,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Zap,
  RefreshCw,
  Grid,
  Clock,
  FileText,
  Layers,
  Compass,
  Award,
  Gem,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeMobileNumber,
  analyzeName,
  getPlanetaryRelationship,
} from '../utils/numerology';
import { calculateCareerAndAuraProfile } from '../utils/astrologyAndCities';
import { generateAdvanceMobileReport } from '../utils/advanceMobileReport';
import { InteractiveLoShuGrid } from './InteractiveLoShuGrid';

interface MobileAuditorProps {
  profile: BirthProfile;
  onUpdateProfileMobile: (
    newMobile: string,
    comparisonMeta?: { originalMobile?: string; selectedMobileA?: string; selectedMobileB?: string }
  ) => void;
}

export const MobileAuditor: React.FC<MobileAuditorProps> = ({
  profile,
  onUpdateProfileMobile,
}) => {
  const [inputMobile, setInputMobile] = useState(profile.mobile || '8899444444');
  const [originalMobile, setOriginalMobile] = useState(
    profile.originalMobile || profile.mobile || '8899444444'
  );
  const [customDob, setCustomDob] = useState(profile.dob || '1983-02-16');
  const [customName, setCustomName] = useState(profile.name || 'Deepak Jain');
  const [activeGoal, setActiveGoal] = useState<'wealth' | 'business' | 'leadership' | 'peace'>('business');
  const [showAllDashas, setShowAllDashas] = useState(true);
  const [dashaSystemView, setDashaSystemView] = useState<'both' | 'numerology' | 'vimshottari'>('both');
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [candidateSim2, setCandidateSim2] = useState(
    profile.selectedMobileA || '9811555515'
  );
  const [candidateSim3, setCandidateSim3] = useState(
    profile.selectedMobileB || '9911666615'
  );

  useEffect(() => {
    setInputMobile(profile.mobile || '8899444444');
    setOriginalMobile(profile.originalMobile || profile.mobile || '8899444444');
    setCustomDob(profile.dob || '1983-02-16');
    setCustomName(profile.name || 'Deepak Jain');
    setCandidateSim2(profile.selectedMobileA || '9811555515');
    setCandidateSim3(profile.selectedMobileB || '9911666615');
  }, [
    profile.id,
    profile.dob,
    profile.name,
    profile.mobile,
    profile.originalMobile,
    profile.selectedMobileA,
    profile.selectedMobileB,
  ]);

  const mulank = calculateMulank(customDob);
  const bhagyank = calculateBhagyank(customDob);

  const analysis = analyzeMobileNumber(inputMobile, mulank, bhagyank);
  const advReport = generateAdvanceMobileReport(
    customDob,
    inputMobile,
    mulank,
    bhagyank,
    profile.tob || '12:00',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.2090
  );

  // Combined Name + D.O.B + Mobile Number Triad Analysis & Career Result
  const nameAnalysis = analyzeName(customName || 'Client', mulank, bhagyank);
  const namank = nameAnalysis.chaldeanSingle;
  const mobileAnk = advReport.mobileTotal;

  const relMulankMobile = getPlanetaryRelationship(mulank, mobileAnk);
  const relBhagyankMobile = getPlanetaryRelationship(bhagyank, mobileAnk);
  const relNameMobile = getPlanetaryRelationship(namank, mobileAnk);
  const relMulankName = getPlanetaryRelationship(mulank, namank);

  const triadCompound = mulank + bhagyank + namank + mobileAnk;
  const triadSingle = ((triadCompound - 1) % 9) + 1;
  const triadPlanet = PLANETARY_PROFILES[triadSingle] || PLANETARY_PROFILES[1];
  const mPlanet = PLANETARY_PROFILES[mulank] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[bhagyank] || PLANETARY_PROFILES[1];
  const nPlanet = PLANETARY_PROFILES[namank] || PLANETARY_PROFILES[1];
  const mobPlanet = PLANETARY_PROFILES[mobileAnk] || PLANETARY_PROFILES[1];

  const nameMobileBonus =
    relNameMobile === 'friendly' ? 20 : relNameMobile === 'neutral' ? 14 : 7;
  const combinedTriadScore = Math.min(
    99,
    Math.max(
      38,
      Math.round(nameAnalysis.harmonyScore * 0.35 + analysis.overallScore * 0.45 + nameMobileBonus)
    )
  );

  // Career & Fortune profile combining Name + DOB (Mulank/Bhagyank) + Mobile vibration
  const combinedCareerProfile = calculateCareerAndAuraProfile(
    customName || 'Client',
    mulank,
    bhagyank,
    triadSingle
  );

  // Multi-SIM Live Tester & Loss vs Benefit Analyzer
  const evaluateCandidateSim = (simStr: string, isOriginalSlot: boolean) => {
    const clean = simStr.replace(/\D/g, '').slice(0, 15) || '9876543210';
    const simCheck = analyzeMobileNumber(clean, mulank, bhagyank);
    const simAdv = generateAdvanceMobileReport(customDob, clean, mulank, bhagyank);
    const relNM = getPlanetaryRelationship(namank, simCheck.singleDigit);
    const bonus = relNM === 'friendly' ? 20 : relNM === 'neutral' ? 14 : 7;
    const score = Math.min(
      99,
      Math.max(38, Math.round(nameAnalysis.harmonyScore * 0.35 + simCheck.overallScore * 0.45 + bonus))
    );
    const planetName = PLANETARY_PROFILES[simCheck.singleDigit]?.planet || 'Sun';
    const maleficPairs = simAdv.mobileCombinations.filter((c) => c.status === 'Malefic');
    const beneficPairs = simAdv.mobileCombinations.filter((c) => c.status === 'Benefic');

    const losses: string[] = [];
    const benefits: string[] = [];

    if (simCheck.harmonyWithMulank === 'inimical') {
      losses.push(
        `Root ${simCheck.singleDigit} (${planetName}) clashes with Birth Mulank ${mulank} (${mPlanet.planet}), causing communication friction, delayed payments, and mental fatigue.`
      );
    }
    if (simCheck.harmonyWithBhagyank === 'inimical') {
      losses.push(
        `Root ${simCheck.singleDigit} conflicts with Destiny Bhagyank ${bhagyank} (${bPlanet.planet}), blocking high-value business conversions and career promotion.`
      );
    }
    if (maleficPairs.length > 0) {
      losses.push(
        `Contains ${maleficPairs.length} malefic adjacent pair(s) [${maleficPairs.map((m) => m.pair).join(', ')}]: ${maleficPairs[0].prediction}`
      );
    }
    if (losses.length === 0) {
      losses.push(
        isOriginalSlot
          ? `Original number operates at ${simCheck.overallScore}% Cosmic Harmony; upgrading to a friendly compound unlocks faster financial liquidity.`
          : `Maintain regular ${planetName} remedies for uninterrupted energetic flow.`
      );
    }

    if (simCheck.harmonyWithMulank === 'friendly') {
      benefits.push(
        `Friendly resonance with Mulank ${mulank} (${mPlanet.planet})—strengthens personal authority, client trust, and decisive action.`
      );
    }
    if (simCheck.harmonyWithBhagyank === 'friendly') {
      benefits.push(
        `Friendly alignment with Bhagyank ${bhagyank} (${bPlanet.planet})—accelerates wealth inflow, profitable deals, and career elevation.`
      );
    }
    if (beneficPairs.length > 0) {
      benefits.push(
        `Carries ${beneficPairs.length} auspicious pair(s) [${beneficPairs.map((b) => b.pair).join(', ')}]: ${beneficPairs[0].prediction}`
      );
    }
    benefits.push(
      `Compound ${simCheck.compoundNumber} ➔ Root ${simCheck.singleDigit} (${planetName}) achieves ${simCheck.overallScore}% Cosmic Harmony (${score}% Triad Synergy).`
    );

    return {
      clean,
      compound: simCheck.compoundNumber,
      single: simCheck.singleDigit,
      planet: planetName,
      mobileScore: simCheck.overallScore,
      triadScore: score,
      verdict: simCheck.verdict,
      mulankRes: simCheck.harmonyWithMulank,
      bhagyankRes: simCheck.harmonyWithBhagyank,
      maleficPairsCount: maleficPairs.length,
      beneficPairsCount: beneficPairs.length,
      losses,
      benefits,
    };
  };

  const sim1Eval = evaluateCandidateSim(originalMobile, true);
  const sim2Eval = evaluateCandidateSim(candidateSim2, false);
  const sim3Eval = evaluateCandidateSim(candidateSim3, false);

  const goalTargetTotals = {
    business: {
      single: [1, 5],
      compounds: [23, 24, 32, 33, 37, 41, 42, 45, 46, 50, 51],
      description: 'Sun (1) & Mercury (5): High-speed communication, persuasive deal closure, and commercial scale.',
    },
    wealth: {
      single: [6, 1],
      compounds: [24, 33, 37, 42, 46, 51, 19],
      description: 'Venus (6) & Sun (1): Luxury assets, prestige, and uninterrupted cash flow.',
    },
    leadership: {
      single: [1, 3],
      compounds: [19, 21, 23, 27, 37, 41, 51],
      description: 'Sun (1) & Jupiter (3): Executive authority, institutional respect, and high office.',
    },
    peace: {
      single: [2, 3, 7],
      compounds: [20, 24, 25, 30, 32, 42, 47],
      description: 'Moon, Jupiter & Ketu: Emotional tranquility, spiritual depth, and harmonious family.',
    },
  };

  const handleApplyToProfile = (targetMobile?: string, nextSimA?: string, nextSimB?: string) => {
    const cleanTarget = (targetMobile || inputMobile).replace(/\D/g, '').slice(0, 15);
    if (!cleanTarget) return;
    setInputMobile(cleanTarget);
    onUpdateProfileMobile(cleanTarget, {
      originalMobile,
      selectedMobileA: nextSimA ?? candidateSim2,
      selectedMobileB: nextSimB ?? candidateSim3,
    });
    setSavedToast(
      `Mobile number "${cleanTarget}" applied to your active profile! All calculations & PDF report now use ${cleanTarget}.`
    );
    setTimeout(() => setSavedToast(null), 3500);
  };

  const handleLoadReferenceReport = () => {
    setCustomName('Deepak Jain');
    setCustomDob('1983-02-16');
    setInputMobile('8899444444');
    setOriginalMobile('8899444444');
    setSavedToast('Loaded Reference Report: Deepak Jain (16-02-1983 • Mobile: 8899444444)');
    setTimeout(() => setSavedToast(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Sacred Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Mobile Frequency • Cosmic Harmony Index • 3-Way SIM Comparison • Maha Dasha</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Advance Mobile Numerology &amp; Vedic Chart Diagnostics
            </h1>
            <p className="text-sm text-amber-200/70 max-w-3xl">
              Test any mobile number frequency in real time with its <strong>Cosmic Harmony Index %</strong>, compare your <strong>Client Original Number</strong> with <strong>Selected Number A</strong> &amp; <strong>Selected Number B</strong> (Losses vs Benefits), and click <strong>Apply to My Profile</strong> to update your entire profile and A4 PDF report.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLoadReferenceReport}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Load Deepak Jain (16-02-1983) Report</span>
            </button>
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-amber-500/30">
              <div className="text-center px-2 border-r border-amber-500/20">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">Mulank</span>
                <span className="text-lg font-bold font-mono text-amber-200">{mulank}</span>
              </div>
              <div className="text-center px-2">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">Bhagyank</span>
                <span className="text-lg font-bold font-mono text-amber-200">{bhagyank}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* TEST ANY MOBILE NUMBER FREQUENCY (REAL-TIME CALCULATION & COSMIC HARMONY INDEX) */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Test Any Mobile Number Frequency (Real-Time Calculation &amp; Cosmic Harmony Index)
            </label>
            {inputMobile.trim() === (profile.mobile || '').trim() ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Currently Active on Your Profile: {profile.mobile}</span>
              </span>
            ) : (
              <span className="text-[11px] text-amber-300/80 font-mono">
                Testing Custom Mobile Number — Save as Selected Number A/B or Click &ldquo;Apply to My Profile&rdquo;
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-5 relative">
              <Phone className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={inputMobile}
                onChange={(e) => setInputMobile(e.target.value.replace(/\D/g, '').slice(0, 15))}
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl pl-10 pr-4 py-3 text-base sm:text-lg font-mono font-bold text-amber-100 tracking-wider focus:outline-none focus:border-amber-400"
                placeholder="ENTER 10-DIGIT MOBILE NUMBER TO TEST"
              />
            </div>

            <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCandidateSim2(inputMobile);
                  onUpdateProfileMobile(profile.mobile || inputMobile, {
                    originalMobile,
                    selectedMobileA: inputMobile,
                    selectedMobileB: candidateSim3,
                  });
                  setSavedToast(`Saved "${inputMobile}" as Selected Number A for Comparison!`);
                  setTimeout(() => setSavedToast(null), 2500);
                }}
                className="px-3.5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-xs cursor-pointer transition-all"
              >
                Set as Selected Number A
              </button>
              <button
                type="button"
                onClick={() => {
                  setCandidateSim3(inputMobile);
                  onUpdateProfileMobile(profile.mobile || inputMobile, {
                    originalMobile,
                    selectedMobileA: candidateSim2,
                    selectedMobileB: inputMobile,
                  });
                  setSavedToast(`Saved "${inputMobile}" as Selected Number B for Comparison!`);
                  setTimeout(() => setSavedToast(null), 2500);
                }}
                className="px-3.5 py-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 font-bold text-xs cursor-pointer transition-all"
              >
                Set as Selected Number B
              </button>
              <button
                type="button"
                onClick={() => handleApplyToProfile(inputMobile)}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply to My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomName(profile.name);
                  setCustomDob(profile.dob);
                  setInputMobile(profile.mobile || '8899444444');
                }}
                className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                title="Reset to Active Profile"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Digit-by-Digit Planetary Vibration Strip */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Digit-by-Digit Planetary Frequency Breakdown
            </span>
            <span className="text-[11px] text-amber-400/80 font-mono">
              Sum of Digits = {advReport.mobileCompound} ➔ Root {advReport.mobileTotal} ({PLANETARY_PROFILES[advReport.mobileTotal]?.planet})
            </span>
          </div>
          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-950 border border-amber-500/20">
            {advReport.mobileNumber.split('').map((digitChar, idx) => {
              const dVal = parseInt(digitChar, 10);
              const pRuler = PLANETARY_PROFILES[dVal];
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900 border border-amber-500/25 min-w-11 text-center"
                >
                  <span className="text-lg font-black font-mono text-amber-100">{digitChar}</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 w-full py-0.5 rounded border border-amber-500/30 mt-1">
                    #{idx + 1}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5 truncate max-w-12">
                    {dVal === 0 ? 'Void' : pRuler?.planet.slice(0, 5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Column Summary matching Name Corrector: Compound & Root | Cosmic Harmony Index | Core Prediction */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">
                Total Mobile Compound &amp; Root
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black font-mono bg-gradient-to-br from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {advReport.mobileCompound}
                </span>
                <div>
                  <span className="text-base font-bold text-amber-200 block">
                    Root {advReport.mobileTotal}
                  </span>
                  <span className="text-xs text-amber-300/80">
                    {PLANETARY_PROFILES[advReport.mobileTotal]?.planet} ({PLANETARY_PROFILES[advReport.mobileTotal]?.sanskritName})
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-amber-500/10 mt-3 flex justify-between text-[11px] text-slate-300">
              <span>Last 2 Digits: <strong className="text-amber-200">{analysis.endingTwoDigits}</strong></span>
              <span>Ending Quality: <strong className="text-emerald-300 uppercase">{analysis.endingVibrationQuality}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">
                Cosmic Harmony Index (Mobile Frequency)
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-3xl font-black font-mono ${
                    analysis.overallScore >= 75
                      ? 'text-emerald-400'
                      : analysis.overallScore >= 55
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {analysis.overallScore}%
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold border ${
                    analysis.overallScore >= 70
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {analysis.overallScore >= 70 ? 'Auspicious SIM' : 'Upgrade Recommended'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-500/10 mt-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Mulank {mulank} Resonance:</span>
                <span
                  className={`font-semibold capitalize ${
                    analysis.harmonyWithMulank === 'friendly'
                      ? 'text-emerald-400'
                      : analysis.harmonyWithMulank === 'neutral'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {analysis.harmonyWithMulank}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bhagyank {bhagyank} Resonance:</span>
                <span
                  className={`font-semibold capitalize ${
                    analysis.harmonyWithBhagyank === 'friendly'
                      ? 'text-emerald-400'
                      : analysis.harmonyWithBhagyank === 'neutral'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {analysis.harmonyWithBhagyank}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">
                Core Mobile Vibration Verdict (Total {advReport.mobileTotal})
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {advReport.mobileTotalPrediction}
              </p>
            </div>
            <div className="pt-2 border-t border-amber-500/10 mt-2 text-[11px] text-emerald-300 font-mono">
              Combined Name + DOB + Mobile Synergy: {combinedTriadScore}%
            </div>
          </div>
        </div>

        {/* SECTION 1: Advance Mobile Numerology Prediction Details (Exact PDF Page 2 Structure) */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100">
                Mobile Number Prediction Details — {customName} ({customDob.split('-').reverse().join('-')})
              </h2>
              <p className="text-xs text-amber-300/70">
                Ruling Planet: <strong className="text-amber-200">{advReport.rulingPlanetName}</strong> • Mulank {mulank} • Bhagyank {bhagyank}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
              Cosmic Harmony Index: {analysis.overallScore}%
            </span>
          </div>

          {/* Perfect Mobile Frequency Confirmation OR Recommended Mobile Number Total & Example */}
          {advReport.exampleRecommendedNumbers.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border-2 border-emerald-500/45 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Perfect Mobile Number Frequency Result • कोई नया नंबर सुझाव आवश्यक नहीं है</span>
                </span>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                  Compound {advReport.mobileCompound} ➔ Root {advReport.mobileTotal} ({analysis.overallScore}% Harmony)
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Your mobile number <strong className="text-amber-200">{advReport.mobileNumber}</strong> already vibrates at an auspicious frequency in harmony with your Mulank {mulank} and Bhagyank {bhagyank} with zero malefic pairs. Only your complete vibration result is shown — no mobile number change or suggestion is required.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/35 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Recommended Mobile Number Total: {advReport.recommendedMobileTotals.join(', ')}
                </span>
                <span className="text-xs font-mono text-rose-300 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-500/30">
                  Avoid Digits in Mobile if Possible: {advReport.avoidNumbersInMobile.join(', ')}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Your mobile number total should come to <strong className="text-emerald-300">{advReport.recommendedMobileTotals.join(' or ')}</strong> (add all the numbers and reduce to one digit). Make sure that numbers like <strong className="text-rose-300">{advReport.avoidNumbersInMobile.join(', ')}</strong> are minimized or avoided in your mobile number if possible.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {advReport.exampleRecommendedNumbers.map((ex, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-900/90 border border-emerald-500/25 text-xs space-y-1"
                  >
                    <div className="font-mono font-bold text-emerald-300 text-sm">
                      Example: {ex.number}
                    </div>
                    <div className="text-[11px] text-slate-300">{ex.benefit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lucky / Unlucky Colours, Lucky / Unlucky / Neutral / Missing Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                Lucky Colours
              </span>
              <span className="font-bold text-amber-100">{advReport.luckyColours.join(', ')}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30">
              <span className="text-[10px] font-bold uppercase text-rose-400 block mb-1">
                Unlucky Colours
              </span>
              <span className="font-bold text-rose-200">{advReport.unluckyColours.join(', ')}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                Lucky Numbers
              </span>
              <span className="font-mono font-bold text-emerald-300 text-sm">
                {advReport.luckyNumbers.join(', ')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30">
              <span className="text-[10px] font-bold uppercase text-rose-400 block mb-1">
                Unlucky Numbers
              </span>
              <span className="font-mono font-bold text-rose-300 text-sm">
                {advReport.unluckyNumbers.join(', ')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/20">
              <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                Neutral Numbers
              </span>
              <span className="font-mono font-bold text-slate-200 text-sm">
                {advReport.neutralNumbers.join(', ')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40">
              <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                Missing Numbers
              </span>
              <span className="font-mono font-bold text-amber-200">
                {advReport.missingNumbersFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION 1B: LIVE COMBINED NAME + D.O.B + MOBILE NUMBER SYNERGY TEST & CAREER / FORTUNE RESULT */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/30 border-2 border-amber-400/45 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/25 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Triad Synergy Audit • Name + D.O.B + Mobile Combined Result</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
              Combined Name + D.O.B + Mobile Number Synergy & Career Result
            </h2>
            <p className="text-xs text-amber-200/80 max-w-3xl">
              Synthesizes your <strong>Full Name ({customName})</strong>, <strong>Date of Birth ({customDob.split('-').reverse().join('-')})</strong>, and <strong>Mobile Number ({advReport.mobileNumber})</strong> into a unified Triad Master Vibration to reveal combined career suitability, business wealth alignment, and live multi-SIM test results.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/90 px-5 py-3 rounded-2xl border border-amber-400/50 shrink-0">
            <div className="text-center border-r border-amber-500/25 pr-4">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">
                Triad Master Root
              </span>
              <span className="text-2xl font-black font-mono text-amber-200">
                {triadCompound} ➔ {triadSingle}
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold block">
                {triadPlanet.planet} ({triadPlanet.sanskritName})
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Combined Synergy
              </span>
              <span
                className={`text-2xl font-black font-mono ${
                  combinedTriadScore >= 80
                    ? 'text-emerald-300'
                    : combinedTriadScore >= 65
                    ? 'text-amber-300'
                    : 'text-rose-300'
                }`}
              >
                {combinedTriadScore}%
              </span>
              <span className="text-[10px] text-amber-200/80 block">
                {combinedTriadScore >= 80
                  ? 'Raj-Yoga Triad'
                  : combinedTriadScore >= 65
                  ? 'Harmonious Triad'
                  : 'Remedy Advised'}
              </span>
            </div>
          </div>
        </div>

        {/* 4-Pillar Vibration Cards: DOB, Name, Mobile, Combined Triad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              1. D.O.B Vibration (Mulank & Bhagyank)
            </span>
            <div className="text-lg font-mono font-black text-amber-100">
              M: {mulank} ({mPlanet.planet}) • B: {bhagyank} ({bPlanet.planet})
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Birth Date: <strong className="text-amber-200">{customDob.split('-').reverse().join('-')}</strong> • Friendly Roots: {mPlanet.friendlyNumbers.join(', ')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-sky-500/30 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
              2. Name Chaldean Vibration (Namank)
            </span>
            <div className="text-lg font-mono font-black text-sky-200">
              Compound {nameAnalysis.totalChaldeanCompound} ➔ Root {namank} ({nPlanet.planet})
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Name-to-DOB Harmony: <strong className="text-emerald-300">{nameAnalysis.harmonyScore}%</strong> ({relMulankName.toUpperCase()} with Mulank {mulank})
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              3. Mobile Vibration (Mobile Ank)
            </span>
            <div className="text-lg font-mono font-black text-emerald-200">
              Compound {advReport.mobileCompound} ➔ Root {mobileAnk} ({mobPlanet.planet})
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Mobile-to-DOB: <strong className="text-amber-200">{relMulankMobile.toUpperCase()}</strong> (M) / <strong className="text-amber-200">{relBhagyankMobile.toUpperCase()}</strong> (B) • Mobile-to-Name: <strong className="text-emerald-300">{relNameMobile.toUpperCase()}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-400/50 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
              4. Combined (Name + DOB + Mobile) Result
            </span>
            <div className="text-lg font-mono font-black text-amber-100">
              Triad {triadSingle} — {triadPlanet.planet}
            </div>
            <p className="text-[11px] text-amber-200/90 leading-snug">
              Primary Chakra: <strong>{combinedCareerProfile.primaryChakra}</strong> • Aura: <strong>{combinedCareerProfile.auraColor}</strong>
            </p>
          </div>
        </div>

        {/* Combined Executive Synthesis */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/35 space-y-2 text-xs leading-relaxed text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
            <span className="font-serif text-sm font-bold text-amber-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Combined Name + D.O.B + Mobile Career, Business & Fortune Verdict</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-300">
              Dominant: {combinedCareerProfile.dominantPlanet} • Destiny: {combinedCareerProfile.destinyPlanet}
            </span>
          </div>
          <p>
            When your spoken Name <strong className="text-amber-200">"{customName}"</strong> (Root {namank} — {nPlanet.planet}), Birth Numbers <strong className="text-amber-200">Mulank {mulank} ({mPlanet.planet}) & Bhagyank {bhagyank} ({bPlanet.planet})</strong>, and Mobile Number <strong className="text-emerald-300">{advReport.mobileNumber}</strong> (Compound {advReport.mobileCompound} ➔ Root {mobileAnk} — {mobPlanet.planet}) operate together, they generate a combined Triad vibration of <strong className="text-amber-300">Number {triadSingle} ({triadPlanet.planet} — {triadPlanet.sanskritName})</strong> with a <strong className="text-emerald-300">{combinedTriadScore}%</strong> overall synergy score.
          </p>
          <p className="text-amber-100/90">
            <strong>Executive Career & Wealth Alignment:</strong> Governed by {triadPlanet.planet} ({triadPlanet.quality}), your combined Name + D.O.B + Mobile frequency strongly favors <strong>{combinedCareerProfile.favorableProfessions.slice(0, 5).join(', ')}</strong>.
          </p>
        </div>

        {/* Combined Career & Business Suitability Grid (Like Name & Career Module) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Supreme Perfect Businesses */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/25 pb-2">
              <h3 className="font-serif text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Supreme Combined Businesses</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">90–98% Match</span>
            </div>
            <div className="space-y-2.5">
              {combinedCareerProfile.perfectBusinesses.map((biz, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/25 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                    <span>{biz.field}</span>
                    <span className="font-mono text-emerald-400">{biz.successRate}%</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{biz.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal Job Roles & Aura Remedies */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/35 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/25 pb-2">
              <h3 className="font-serif text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Ideal Professions & Fortune Remedies</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-300 font-bold">High Stability</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {combinedCareerProfile.favorableProfessions.map((role: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-[11px] font-semibold text-amber-100"
                >
                  {role}
                </span>
              ))}
            </div>
            <div className="space-y-2 pt-1">
              {combinedCareerProfile.fortuneReadingRemedies.slice(0, 2).map((rem, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/20 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                    <span>{rem.title}</span>
                    <span className="font-mono text-[10px] text-amber-400">{rem.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{rem.prescription}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hostile Sectors to Avoid */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/25 pb-2">
              <h3 className="font-serif text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Sectors to Avoid (Triad Clash)</span>
              </h3>
              <span className="text-[10px] font-mono text-rose-300 font-bold">High Friction</span>
            </div>
            <div className="space-y-2.5">
              {combinedCareerProfile.veryBadBusinesses.map((bad, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/90 border border-rose-500/25 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-200">
                    <span>{bad.field}</span>
                    <span className="font-mono text-[10px] text-rose-400">
                      Clash: {bad.conflictPlanet}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{bad.dangerReason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3-WAY MOBILE NUMBER COMPARISON & LOSS VS BENEFIT MATRIX (Shown only when mobile is not already perfect or user has custom comparison numbers) */}
        {(advReport.exampleRecommendedNumbers.length > 0 ||
          Boolean(profile.selectedMobileA) ||
          Boolean(profile.selectedMobileB)) && (
          <div className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-500/40 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  Original Number vs 2 Selected Numbers • पुराने नंबर का नुकसान बनाम नए नंबर का फायदा
                </span>
                <h3 className="font-serif text-base sm:text-xl font-bold text-amber-100 flex items-center gap-2 mt-0.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>
                    3-Way Mobile Number Comparison: Client Original Number vs Selected Number A &amp; B
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compare your <strong>Client Original Mobile Number</strong> with <strong>Selected Number A</strong> and <strong>Selected Number B</strong>. See what loss or friction your original number caused vs. the benefits of switching, and click <strong>Apply to My Profile</strong> to update all calculations.
                </p>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 font-semibold shrink-0">
                Active Profile Mobile: <strong className="text-amber-200 font-mono">{profile.mobile}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                {
                  label: '1. Client Original Number',
                  value: originalMobile,
                  onChange: (v: string) => setOriginalMobile(v),
                  evalData: sim1Eval,
                  isOriginal: true,
                  borderClass: 'border-rose-500/40 bg-rose-950/15',
                },
                {
                  label: '2. Selected Number A (Option 1)',
                  value: candidateSim2,
                  onChange: (v: string) => setCandidateSim2(v),
                  evalData: sim2Eval,
                  isOriginal: false,
                  borderClass: 'border-amber-400/50 bg-amber-950/15',
                },
                {
                  label: '3. Selected Number B (Option 2)',
                  value: candidateSim3,
                  onChange: (v: string) => setCandidateSim3(v),
                  evalData: sim3Eval,
                  isOriginal: false,
                  borderClass: 'border-emerald-400/50 bg-emerald-950/15',
                },
              ].map((slot, idx) => {
                const isCurrentlyActive =
                  slot.evalData.clean === (profile.mobile || '').replace(/\D/g, '');
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 ${slot.borderClass}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-amber-500/30">
                          {slot.label}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${
                            slot.evalData.mobileScore >= 75
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : slot.evalData.mobileScore >= 55
                                ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                : 'bg-rose-950 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {slot.evalData.mobileScore}% Harmony
                        </span>
                      </div>

                      <input
                        type="text"
                        value={slot.value}
                        onChange={(e) => slot.onChange(e.target.value.replace(/\D/g, '').slice(0, 15))}
                        placeholder="Enter 10-digit SIM..."
                        className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-amber-100 tracking-wider focus:outline-none focus:border-amber-400"
                      />

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2 rounded-lg bg-slate-950 border border-amber-500/20">
                          <span className="text-[9px] text-slate-400 uppercase block">Compound ➔ Root</span>
                          <strong className="text-amber-200">
                            {slot.evalData.compound} ➔ {slot.evalData.single} ({slot.evalData.planet})
                          </strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950 border border-amber-500/20">
                          <span className="text-[9px] text-slate-400 uppercase block">Triad Synergy</span>
                          <strong className="text-emerald-300">
                            {slot.evalData.triadScore}% (M:{slot.evalData.mulankRes.slice(0, 3)})
                          </strong>
                        </div>
                      </div>

                      {/* Losses / Drawbacks */}
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/35 space-y-1">
                        <span className="text-[11px] font-bold text-rose-300 uppercase block">
                          {slot.isOriginal
                            ? 'Losses / Drawbacks of Original Number (पुराने नंबर का नुकसान):'
                            : 'Points to Watch / Caution:'}
                        </span>
                        {slot.evalData.losses.map((l, lIdx) => (
                          <p key={lIdx} className="text-[11px] text-rose-100/90 leading-relaxed">
                            • {l}
                          </p>
                        ))}
                      </div>

                      {/* Benefits / Gains */}
                      <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/35 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-300 uppercase block">
                          {slot.isOriginal
                            ? 'Baseline Vibration:'
                            : 'Benefits / Gains if Client Changes to This Number (नए नंबर का फायदा):'}
                        </span>
                        {slot.evalData.benefits.map((b, bIdx) => (
                          <p key={bIdx} className="text-[11px] text-emerald-100/90 leading-relaxed">
                            • {b}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-500/20 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyToProfile(slot.evalData.clean, candidateSim2, candidateSim3)}
                        className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          isCurrentlyActive
                            ? 'bg-emerald-500 text-slate-950 shadow-lg'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isCurrentlyActive
                            ? `✓ Active on Profile (${slot.evalData.clean})`
                            : `Apply ${slot.evalData.clean} to My Profile`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Adjacent 2-Digit Mobile Combinations & Combined Prediction (Page 3 of PDF) */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Mobile Combination Analysis (Adjacent 2-Digit Pairs in {advReport.mobileNumber})</span>
            </h2>
            <p className="text-xs text-amber-300/70">
              Evaluates every sequential 2-digit pair across your 10-digit mobile number to identify Benefic, Neutral, and Malefic vibrations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {advReport.mobileCombinations.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                item.status === 'Malefic'
                  ? 'bg-rose-950/25 border-rose-500/45'
                  : item.status === 'Benefic'
                  ? 'bg-emerald-950/20 border-emerald-500/35'
                  : 'bg-slate-950 border-amber-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-amber-100">
                  Pair #{idx + 1}: "{item.pair}"
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    item.status === 'Malefic'
                      ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                      : item.status === 'Benefic'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.prediction}</p>
            </div>
          ))}
        </div>

        {/* Summary Prediction Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
            Overall Mobile Combination Prediction Summary:
          </span>
          <ul className="space-y-1 text-xs text-slate-200">
            {advReport.combinedPairPrediction.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SECTION 3: Missing Number Remedies (Wear, Vastu & Feng Shui, Rituals — Page 3 of PDF) */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="border-b border-amber-500/20 pb-3">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
            <Gem className="w-5 h-5 text-amber-400" />
            <span>Missing Number Remedies (Wear • Vastu & Feng Shui • Sacred Rituals)</span>
          </h2>
          <p className="text-xs text-amber-300/70">
            Prescribed Vedic, Crystal, Vastu, and Ritual remedies to activate the missing numbers ({advReport.missingNumbersList.join(', ')}) in your birth & mobile matrix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advReport.missingNumberRemedies.map((rem) => (
            <div
              key={rem.number}
              className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                <span className="font-serif text-base font-bold text-amber-100">
                  Missing Number {rem.number} ({rem.planet})
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  MISSING NUMBER {rem.number}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-emerald-400 uppercase text-[10px] block">
                    1. Wear (Ratna / Rudraksha / Mala):
                  </span>
                  <ul className="list-disc list-inside text-slate-200 space-y-0.5 mt-0.5">
                    {rem.wear.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-amber-400 uppercase text-[10px] block">
                    2. Vastu & Feng Shui:
                  </span>
                  <ul className="list-disc list-inside text-slate-200 space-y-0.5 mt-0.5">
                    {rem.vastuAndFengShui.map((v, idx) => (
                      <li key={idx}>{v}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-purple-300 uppercase text-[10px] block">
                    3. Sacred Rituals (Upay):
                  </span>
                  <ul className="list-disc list-inside text-slate-200 space-y-0.5 mt-0.5">
                    {rem.rituals.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/35">
                  <span className="font-bold text-sky-300 uppercase text-[10px] block">
                    4. Sound Frequency Therapy (Nada Yoga Hz):
                  </span>
                  <p className="text-amber-100 font-mono text-[11px] mt-0.5">
                    🔊 {rem.soundFrequency} (Listen 15 mins daily with headphones or Tibetan singing bowl)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3B: Interactive Sacred 3×3 Lo Shu Grid & Vedic Planetary Remedies */}
      <InteractiveLoShuGrid
        dob={customDob}
        mulank={mulank}
        bhagyank={bhagyank}
        clientName={profile.name}
      />

      {/* SECTION 4: Full-Width 3×3 Vedic Grid & Comprehensive Grid Number Explanation */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-4">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
              <Grid className="w-5 h-5 text-amber-400" />
              <span>Vedic Grid (Sepharial 3×3 Natal Matrix) & Complete Number Explanation</span>
            </h3>
            <p className="text-xs text-amber-300/70">
              Classical Vedic Grid layout ([3, 1, 9] / [6, 7, 5] / [2, 8, 4]) derived from {customDob.split('-').reverse().join('-')} (Mulank {mulank}, Bhagyank {bhagyank}).
            </p>
          </div>
          <span className="text-xs font-mono text-amber-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/30">
            Standard Vedic Grid: Top (3-1-9) • Mid (6-7-5) • Bot (2-8-4)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 3x3 Vedic Grid Table */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center bg-slate-950/80 p-5 rounded-2xl border border-amber-500/30">
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] p-4 rounded-2xl bg-slate-950 border-2 border-amber-500/40 shadow-inner">
              {advReport.vedicGrid.flat().map((cell, i) => (
                <div
                  key={i}
                  className={`h-20 rounded-xl border flex flex-col items-center justify-center relative ${
                    cell.count > 0
                      ? 'bg-amber-500/15 border-amber-400 text-amber-100 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-mono text-amber-400/60 absolute top-1 left-2">
                    #{cell.positionNumber}
                  </span>
                  <span className="text-xl font-mono font-black tracking-wider">
                    {cell.displayValue || '—'}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    {PLANETARY_PROFILES[cell.positionNumber]?.planet}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-200/80 text-center mt-3">
              Present Digits in Chart: <strong>{advReport.presentNumberReadings.map((r) => `${r.number} (${r.count}x)`).join(', ')}</strong>
            </p>
          </div>

          {/* Full-Width Expanded Individual & Repetitive Number Explanations */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {advReport.presentNumberReadings.map((reading) => (
              <div
                key={reading.number}
                className="p-4 rounded-2xl bg-slate-950 border border-amber-500/25 text-xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between border-b border-amber-500/15 pb-1.5">
                    <span className="font-serif text-sm font-bold text-amber-300">
                      {reading.heading} — {PLANETARY_PROFILES[reading.number]?.planet} ({PLANETARY_PROFILES[reading.number]?.sanskritName})
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-bold">
                      Frequency: {reading.count}x
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{reading.description}</p>
                </div>

                {reading.repetitionNote && (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200/95 italic">
                    <strong className="text-amber-300 not-italic block mb-0.5">
                      Repetition Impact (Number {reading.number} Appears {reading.count} Times):
                    </strong>
                    {reading.repetitionNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: 2-Number & 3-Number Chart Combination Yogas (Pages 6–8 of PDF) */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="border-b border-amber-500/20 pb-3">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Chart Number Combination Yogas (2-Digit & 3-Digit Planetary Conjunctions)</span>
          </h2>
          <p className="text-xs text-amber-300/70">
            Detailed life, education, career, and marital predictions generated by the specific number combinations active in your Vedic Grid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advReport.chartCombinations.map((combo, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950 border border-amber-500/25 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                <h3 className="font-serif text-sm sm:text-base font-bold text-amber-200">
                  {combo.title}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                  {combo.type}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {combo.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: Complete Vedic Numerology & Astrological Vimshottari Maha Dasha Timeline (Starting from Present Active Cycle) */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>
                Complete Vedic Numerology &amp; Vimshottari Maha Dasha Timeline — Starting from Present Active Cycle
              </span>
            </h2>
            <p className="text-xs text-amber-300/75 mt-0.5">
              Verified dual-system timeline: <strong>(A) 120-Year Classical Parashari Vimshottari Maha Dasha</strong> (from Janma Nakshatra <strong>{advReport.janmaNakshatraSummary?.nakshatra} Pada {advReport.janmaNakshatraSummary?.pada}</strong>, Moon {advReport.janmaNakshatraSummary?.moonDegreeSidereal}° in {advReport.janmaNakshatraSummary?.rashi} — matches AstroSage &amp; Drik Panchang) AND <strong>(B) 45-Year Vedic Numerology Maha Dasha</strong> (Mulank {mulank} Progressive Cycle).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {([
              { id: 'both', label: 'Both Systems (Complete)' },
              { id: 'vimshottari', label: '120-Yr Astrological Vimshottari' },
              { id: 'numerology', label: '45-Yr Vedic Numerology' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDashaSystemView(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  dashaSystemView === tab.id
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-slate-950 text-amber-200 border-amber-500/30 hover:border-amber-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAllDashas(!showAllDashas)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-300 hover:border-amber-400 text-xs font-semibold transition-all cursor-pointer"
            >
              {showAllDashas ? 'Compact View' : 'Expand All Cycles'}
            </button>
          </div>
        </div>

        {/* PART A: 120-YEAR CLASSICAL ASTROLOGICAL VIMSHOTTARI MAHA DASHA (Matches AstroSage / Drik Panchang) */}
        {(dashaSystemView === 'both' || dashaSystemView === 'vimshottari') &&
          advReport.vimshottariDashaTimeline && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border-2 border-indigo-500/35 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/25 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block">
                    System A • 120-Year Classical Parashari Vimshottari Maha Dasha (Matches AstroSage / Drik Panchang)
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-amber-100 mt-0.5">
                    Janma Nakshatra: {advReport.janmaNakshatraSummary?.nakshatra} (Pada {advReport.janmaNakshatraSummary?.pada}) • Moon Rashi: {advReport.janmaNakshatraSummary?.rashi} ({advReport.janmaNakshatraSummary?.moonDegreeSidereal}°)
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-xl bg-indigo-950/80 border border-indigo-400/40 text-indigo-200 text-xs font-mono font-bold">
                  Birth Balance: {advReport.janmaNakshatraSummary?.birthDashaLord} — {advReport.janmaNakshatraSummary?.birthDashaBalanceLabel}
                </span>
              </div>

              {(() => {
                const vimPast = advReport.vimshottariPastCycles || [];
                const vimPresent =
                  advReport.vimshottariDashaTimeline.find((d) => d.isCurrent) ||
                  advReport.vimshottariDashaTimeline[0];
                const vimUpcoming = advReport.vimshottariDashaTimeline.filter((d) =>
                  d.cycleStatus.startsWith('UPCOMING')
                );
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border-2 border-emerald-400/70">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                        ★ 1. Present Active Vimshottari Maha Dasha
                      </span>
                      <strong className="text-sm font-serif text-amber-100 block mt-0.5">
                        {vimPresent?.planet} ({vimPresent?.sanskritName}) Maha Dasha — {vimPresent?.durationLabel}
                      </strong>
                      <span className="text-[11px] font-mono text-emerald-300 block mt-0.5">
                        Active: {vimPresent?.startDate} to {vimPresent?.endDate} • Harmony: {vimPresent?.harmonyPercent}% ({vimPresent?.harmonyVerdict})
                      </span>
                      {vimPresent?.activeAntardasha && (
                        <span className="text-[10px] font-mono text-amber-200 bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30 inline-block mt-1">
                          Sub-Period: {vimPresent.activeAntardasha}
                        </span>
                      )}
                      {vimPresent?.remedy && (
                        <p className="text-[10.5px] text-amber-100/90 mt-1.5 leading-snug">
                          <strong className="text-amber-300">Remedy:</strong> {vimPresent.remedy}
                        </p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-400/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                        2. Upcoming Vimshottari Maha Dashas
                      </span>
                      <strong className="text-sm font-serif text-amber-200 block mt-0.5">
                        {vimUpcoming.length} Upcoming Cycles ({vimUpcoming[0]?.startDate || ''} Onward)
                      </strong>
                      <span className="text-[11px] text-indigo-200/80 block mt-0.5">
                        Next: {vimUpcoming[0]?.planet} ({vimUpcoming[0]?.durationLabel}) from {vimUpcoming[0]?.startDate} to {vimUpcoming[0]?.endDate}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                        3. Past Completed Vimshottari Cycles (Since Birth)
                      </span>
                      <strong className="text-sm font-serif text-amber-200 block mt-0.5">
                        {vimPast.length > 0
                          ? `${vimPast.length} Completed (${vimPast.map((p) => `${p.planet} ${p.startYear}–${p.endYear}`).join(', ')})`
                          : 'Birth Maha Dasha Currently Active'}
                      </strong>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {vimPast.length > 0
                          ? `Last Completed: ${vimPast[vimPast.length - 1].planet} (${vimPast[vimPast.length - 1].startDate} to ${vimPast[vimPast.length - 1].endDate})`
                          : 'Started at Birth Date'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {(showAllDashas
                  ? advReport.vimshottariDashaTimeline
                  : advReport.vimshottariDashaTimeline.slice(0, 6)
                ).map((dasha, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      dasha.isCurrent
                        ? 'bg-gradient-to-r from-emerald-950/45 via-slate-950 to-indigo-950/35 border-2 border-emerald-400 shadow-lg'
                        : 'bg-slate-900/90 border-indigo-500/25'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/20 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 font-mono text-xs font-black">
                          {dasha.startDate} to {dasha.endDate}
                        </span>
                        <span className="font-serif text-sm sm:text-base font-bold text-amber-100">
                          {dasha.planet} ({dasha.sanskritName}) • {dasha.durationLabel || `${dasha.durationYears} Yrs`}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono font-black text-[10px] border ${
                            dasha.harmonyPercent >= 80
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                              : dasha.harmonyPercent >= 65
                                ? 'bg-amber-950 text-amber-200 border-amber-500/50'
                                : 'bg-rose-950 text-rose-200 border-rose-500/50'
                          }`}
                        >
                          Harmony: {dasha.harmonyPercent}% ({dasha.harmonyVerdict})
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider border ${
                            dasha.isCurrent
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                              : 'bg-indigo-950 text-indigo-200 border-indigo-400/50'
                          }`}
                        >
                          {dasha.isCurrent
                            ? `★ PRESENT CYCLE (Active Now • ${dasha.startYear}–${dasha.endYear})`
                            : `UPCOMING CYCLE (${dasha.startYear}–${dasha.endYear})`}
                        </span>
                      </div>
                    </div>
                    {dasha.activeAntardasha && (
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/35 text-[11px] font-mono text-emerald-200">
                        <strong>Active Bhukti / Antardasha:</strong> {dasha.activeAntardasha}
                      </div>
                    )}
                    <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                      {dasha.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-950/35 border border-amber-500/35 text-[11px] text-amber-100 leading-relaxed">
                      <strong className="text-amber-300 uppercase tracking-wide">Vedic Maha Dasha Remedy:</strong>{' '}
                      {dasha.remedy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* PART B: 45-YEAR VEDIC NUMEROLOGY PROGRESSIVE MAHA DASHA (Mulank 1–9 Cycle • Exact Birth Date Check) */}
        {(dashaSystemView === 'both' || dashaSystemView === 'numerology') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  System B • 45-Year Vedic Numerology Progressive Maha Dasha (Mulank {mulank} — {advReport.rulingPlanetName})
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-amber-100 mt-0.5">
                  Starts from Birth Date ({customDob.split('-').reverse().join('-')}) with Mulank {mulank} (1+2+3+4+5+6+7+8+9 = 45-Year Cycle)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold">
                Exact Anniversary Date-to-Date Calculation
              </span>
            </div>

            {(() => {
              const pastCycles =
                advReport.pastDashaCycles ||
                advReport.dashaTimeline.filter((d) => d.cycleStatus.startsWith('PAST'));
              const presentCycle =
                advReport.dashaTimeline.find((d) => d.isCurrent) ||
                advReport.dashaTimeline[0];
              const upcomingCycles = advReport.dashaTimeline.filter((d) =>
                d.cycleStatus.startsWith('UPCOMING')
              );

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border-2 border-emerald-400/70">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                      ★ 1. Present Active Numerology Cycle ({new Date().getFullYear()})
                    </span>
                    <strong className="text-sm font-serif text-amber-100 block mt-0.5">
                      Dasha {presentCycle?.dashaNumber} — {presentCycle?.planet} ({presentCycle?.sanskritName})
                    </strong>
                    <span className="text-[11px] font-mono text-emerald-300 block mt-0.5">
                      Active Period: {presentCycle?.startDate} to {presentCycle?.endDate} ({presentCycle?.durationYears} Yrs) • Harmony: {presentCycle?.harmonyPercent}% ({presentCycle?.harmonyVerdict})
                    </span>
                    {presentCycle?.activeAntardasha && (
                      <span className="text-[10px] font-mono text-amber-200 bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30 inline-block mt-1">
                        {presentCycle.activeAntardasha}
                      </span>
                    )}
                    {presentCycle?.remedy && (
                      <p className="text-[10.5px] text-amber-100/90 mt-1.5 leading-snug">
                        <strong className="text-amber-300">Remedy:</strong> {presentCycle.remedy}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-400/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                      2. Upcoming Cycles (Future Progression)
                    </span>
                    <strong className="text-sm font-serif text-amber-200 block mt-0.5">
                      {upcomingCycles.length} Upcoming Cycles ({upcomingCycles[0]?.startDate || ''} Onward)
                    </strong>
                    <span className="text-[11px] text-indigo-200/80 block mt-0.5">
                      Next Cycle: Dasha {upcomingCycles[0]?.dashaNumber} ({upcomingCycles[0]?.planet}) from {upcomingCycles[0]?.startDate}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      3. Past Cycles (Completed Since Birth)
                    </span>
                    <strong className="text-sm font-serif text-amber-200 block mt-0.5">
                      {pastCycles.length > 0
                        ? `${pastCycles.length} Completed (${pastCycles[0].startDate} – ${pastCycles[pastCycles.length - 1].endDate})`
                        : 'Current Cycle is First Since Birth'}
                    </strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {pastCycles.length > 0
                        ? `Completed: ${pastCycles.map((p) => `#${p.dashaNumber} ${p.planet} (${p.startYear}–${p.endYear})`).join(', ')}`
                        : 'Started at Birth Date'}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(showAllDashas ? advReport.dashaTimeline : advReport.dashaTimeline.slice(0, 6)).map((dasha, idx) => {
                const isPast = dasha.cycleStatus.startsWith('PAST');
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      dasha.isCurrent
                        ? 'bg-gradient-to-r from-amber-950/50 via-slate-950 to-emerald-950/30 border-2 border-emerald-400 shadow-lg'
                        : isPast
                          ? 'bg-slate-950/85 border-slate-700/70'
                          : 'bg-slate-900/90 border-amber-500/25'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/15 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 font-mono text-xs font-black">
                          Cycle #{idx + 1}: {dasha.startDate} to {dasha.endDate} ➔ #{dasha.dashaNumber}
                        </span>
                        <span className="font-serif text-sm sm:text-base font-bold text-amber-100">
                          {dasha.planet} ({dasha.sanskritName}) • {dasha.durationYears} Yrs
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono font-black text-[10px] border ${
                            dasha.harmonyPercent >= 80
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                              : dasha.harmonyPercent >= 65
                                ? 'bg-amber-950 text-amber-200 border-amber-500/50'
                                : 'bg-rose-950 text-rose-200 border-rose-500/50'
                          }`}
                        >
                          Harmony: {dasha.harmonyPercent}% ({dasha.harmonyVerdict})
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider border ${
                            dasha.isCurrent
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                              : isPast
                                ? 'bg-slate-800 text-slate-300 border-slate-600'
                                : 'bg-indigo-950 text-indigo-200 border-indigo-400/50'
                          }`}
                        >
                          {dasha.isCurrent
                            ? `★ PRESENT CYCLE (Active Now • ${dasha.startYear}–${dasha.endYear})`
                            : isPast
                              ? `PAST CYCLE (Completed • ${dasha.startYear}–${dasha.endYear})`
                              : `UPCOMING CYCLE (Future • ${dasha.startYear}–${dasha.endYear})`}
                        </span>
                      </div>
                    </div>
                    {dasha.activeAntardasha && (
                      <div className="px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-500/35 text-[11px] font-mono text-amber-200">
                        <strong>Active Personal Year / Antardasha:</strong> {dasha.activeAntardasha}
                      </div>
                    )}
                    <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                      {dasha.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-950/35 border border-amber-500/35 text-[11px] text-amber-100 leading-relaxed">
                      <strong className="text-amber-300 uppercase tracking-wide">Vedic Maha Dasha Remedy:</strong>{' '}
                      {dasha.remedy}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 7: Virtual Lucky SIM Architect (Only shown when mobile frequency is NOT already perfect) */}
      {advReport.exampleRecommendedNumbers.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Virtual Lucky SIM Architect & New Number Selection Guide</span>
            </h2>
            <p className="text-xs text-amber-300/70">
              Select your primary objective to reveal the ideal 10-digit compounds and terminal sequences when acquiring a new business or personal SIM.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['business', 'wealth', 'leadership', 'peace'] as const).map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setActiveGoal(goal)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeGoal === goal
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border-amber-500/20 text-slate-400 hover:text-amber-200'
                }`}
              >
                <span className="text-xs uppercase font-bold block capitalize">{goal} Expansion</span>
                <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
                  Target Roots: {goalTargetTotals[goal].single.join(' or ')}
                </span>
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 space-y-4">
            <p className="text-xs text-amber-200/90 font-medium">
              {goalTargetTotals[activeGoal].description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/15">
                <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-2">
                  Ideal 10-Digit Total Compounds
                </span>
                <div className="flex flex-wrap gap-2">
                  {goalTargetTotals[activeGoal].compounds.map((comp) => (
                    <span
                      key={comp}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-200 font-mono text-xs font-bold"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/15">
                <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-2">
                  Auspicious Terminal Pairings
                </span>
                <div className="flex flex-wrap gap-2">
                  {['...15', '...19', '...23', '...31', '...37', '...51', '...55', '...56'].map((seq) => (
                    <span
                      key={seq}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold"
                    >
                      {seq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
