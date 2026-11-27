import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Info,
  ShieldCheck,
  Star,
  Briefcase,
  ShieldAlert,
  Crown,
  Gem,
  Compass,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeName,
  generateNameCorrections,
} from '../utils/numerology';
import {
  calculateCareerAndAuraProfile,
  calculateVedicAstrologyFromBirth,
} from '../utils/astrologyAndCities';
import { calculateNameAndPersonalGrowthRatnaRecommendation } from './GemstoneRecommendation';
import vedicNameCareerYantra from '../assets/images/vedic_name_career_yantra_1794305504547.jpg';

interface NameCorrectorProps {
  profile: BirthProfile;
  onUpdateProfileName: (
    newName: string,
    comparisonMeta?: { originalName?: string; selectedNameA?: string; selectedNameB?: string }
  ) => void;
}

export const NameCorrector: React.FC<NameCorrectorProps> = ({
  profile,
  onUpdateProfileName,
}) => {
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const mulankInfo = PLANETARY_PROFILES[mulank];
  const bhagyankInfo = PLANETARY_PROFILES[bhagyank];

  const [inputName, setInputName] = useState(profile.name);
  const [realOriginalName, setRealOriginalName] = useState(
    profile.originalName || profile.name
  );
  const initialSuggestions = generateNameCorrections(
    profile.originalName || profile.name,
    mulank,
    bhagyank
  );
  const [selectedNameA, setSelectedNameA] = useState(
    profile.selectedNameA || initialSuggestions[0]?.suggestedName || `${profile.name}A`
  );
  const [selectedNameB, setSelectedNameB] = useState(
    profile.selectedNameB || initialSuggestions[1]?.suggestedName || `${profile.name}I`
  );
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // Sync active profile name for downstream sections so applying a name updates everything immediately
  const activeFinalName = profile.name || inputName;
  const currentAnalysis = analyzeName(inputName, mulank, bhagyank);
  const activeProfileAnalysis = analyzeName(activeFinalName, mulank, bhagyank);
  const suggestions = generateNameCorrections(realOriginalName, mulank, bhagyank);

  const realNameAnalysis = analyzeName(realOriginalName, mulank, bhagyank);
  const nameAAnalysis = analyzeName(selectedNameA || inputName, mulank, bhagyank);
  const nameBAnalysis = analyzeName(selectedNameB || inputName, mulank, bhagyank);

  const describeNameLossAndBenefit = (
    analysis: ReturnType<typeof analyzeName>,
    isOriginal: boolean
  ) => {
    const planetName = PLANETARY_PROFILES[analysis.chaldeanSingle]?.planet || 'Sun';
    const losses: string[] = [];
    const benefits: string[] = [];

    if (analysis.compoundInfo.type === 'malefic' || analysis.compoundInfo.type === 'challenging') {
      losses.push(
        `Compound ${analysis.totalChaldeanCompound} (${analysis.compoundInfo.title}) creates recurring obstacles, delayed rewards, and mental stress.`
      );
    }
    if (analysis.mulankResonance === 'inimical') {
      losses.push(
        `Root ${analysis.chaldeanSingle} (${planetName}) clashes with your Birth Mulank ${mulank} (${mulankInfo?.planet}), causing self-doubt, health drain, and struggle in personal execution.`
      );
    }
    if (analysis.bhagyankResonance === 'inimical') {
      losses.push(
        `Root ${analysis.chaldeanSingle} conflicts with your Destiny Bhagyank ${bhagyank} (${bhagyankInfo?.planet}), blocking fortune consolidation and career stability.`
      );
    }
    if (losses.length === 0) {
      losses.push(
        isOriginal
          ? `Original spelling vibrates at ${analysis.harmonyScore}% Cosmic Harmony (Compound ${analysis.totalChaldeanCompound}), leaving untapped potential in executive speed and financial magnetism.`
          : `Requires consistent alignment with ${planetName} remedies for peak manifestation.`
      );
    }

    if (analysis.mulankResonance === 'friendly') {
      benefits.push(
        `Harmonizes directly with Birth Mulank ${mulank} (${mulankInfo?.planet}), boosting confidence, leadership clarity, and daily vitality.`
      );
    }
    if (analysis.bhagyankResonance === 'friendly') {
      benefits.push(
        `Locks into Destiny Bhagyank ${bhagyank} (${bhagyankInfo?.planet}), accelerating career breakthroughs, wealth retention, and institutional support.`
      );
    }
    benefits.push(
      `Compound ${analysis.totalChaldeanCompound} (${analysis.compoundInfo.title}) activates ${planetName} blessings (${analysis.harmonyScore}% Cosmic Harmony): ${analysis.compoundInfo.lifeOutcome}`
    );

    return { losses, benefits };
  };

  // Career, Vocation & Aura Remedies dynamically follow the active profile name (or currently tested name)
  const careerAndAura = calculateCareerAndAuraProfile(
    activeFinalName,
    mulank,
    bhagyank,
    activeProfileAnalysis.chaldeanSingle
  );

  const autoAstro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.2090
  );

  const nameAndGrowthRatna = calculateNameAndPersonalGrowthRatnaRecommendation(
    profile,
    realOriginalName || activeFinalName,
    profile.bodyWeightKg || 65
  );

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const handleApply = (name: string, nextNameA?: string, nextNameB?: string) => {
    const cleanTarget = name.trim().toUpperCase();
    if (!cleanTarget) return;
    onUpdateProfileName(cleanTarget, {
      originalName: realOriginalName,
      selectedNameA: nextNameA ?? selectedNameA,
      selectedNameB: nextNameB ?? selectedNameB,
    });
    setInputName(cleanTarget);
    setAppliedToast(
      `Profile name updated to "${cleanTarget}"! Entire profile, Career Alignment, Aura Remedies & PDF Report now use "${cleanTarget}".`
    );
    setTimeout(() => setAppliedToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Chaldean Sound Frequency • 3-Way Name Comparison • Career &amp; Aura Blueprint</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Chaldean Name Harmonizer &amp; Enterprise Vocation Blueprint
            </h1>
            <p className="text-sm text-amber-200/70 max-w-2xl">
              Manually test any name spelling in real time, compare your <strong>Real Name</strong> with <strong>Selected Name A</strong> &amp; <strong>Selected Name B</strong> (Losses vs Benefits), and click <strong>Apply to My Profile</strong> to update your entire profile, vocation domains, aura remedies, and A4 PDF report.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-2xl border border-amber-500/30">
            <div className="text-center px-3 border-r border-amber-500/20">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Mulank</span>
              <span className="text-xl font-bold font-mono text-amber-200">{mulank}</span>
              <span className="text-[10px] text-slate-400 block">{mulankInfo?.planet}</span>
            </div>
            <div className="text-center px-3 border-r border-amber-500/20">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Bhagyank</span>
              <span className="text-xl font-bold font-mono text-amber-200">{bhagyank}</span>
              <span className="text-[10px] text-slate-400 block">{bhagyankInfo?.planet}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Rashi</span>
              <span className="text-xs font-bold text-amber-100 block">{autoAstro.rashi.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-400 block">{autoAstro.nakshatra}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Toast */}
      {appliedToast && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 text-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{appliedToast}</span>
          </span>
        </div>
      )}

      {/* Interactive Name Input & Live Breakdown */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Type or Test Any Name Spelling (Real-Time Chaldean &amp; Vedic Verification)
            </label>
            {inputName.trim().toUpperCase() === profile.name.trim().toUpperCase() ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Currently Active on Your Profile: {profile.name}</span>
              </span>
            ) : (
              <span className="text-[11px] text-amber-300/80 font-mono">
                Testing Custom Spelling — Save as Selected Name A/B or Click &ldquo;Apply to My Profile&rdquo;
              </span>
            )}
          </div>
          <div className="flex flex-col lg:flex-row gap-3">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="flex-1 bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-base sm:text-lg font-serif font-bold text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 uppercase tracking-wider"
              placeholder="ENTER FULL NAME TO TEST OR APPLY"
            />
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={!inputName.trim()}
                onClick={() => {
                  const val = inputName.trim().toUpperCase();
                  setSelectedNameA(val);
                  onUpdateProfileName(profile.name, {
                    originalName: realOriginalName,
                    selectedNameA: val,
                    selectedNameB,
                  });
                  setAppliedToast(`Saved "${val}" as Selected Name A for Comparison!`);
                  setTimeout(() => setAppliedToast(null), 2500);
                }}
                className="px-3.5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-xs cursor-pointer transition-all"
              >
                Set as Selected Name A
              </button>
              <button
                type="button"
                disabled={!inputName.trim()}
                onClick={() => {
                  const val = inputName.trim().toUpperCase();
                  setSelectedNameB(val);
                  onUpdateProfileName(profile.name, {
                    originalName: realOriginalName,
                    selectedNameA,
                    selectedNameB: val,
                  });
                  setAppliedToast(`Saved "${val}" as Selected Name B for Comparison!`);
                  setTimeout(() => setAppliedToast(null), 2500);
                }}
                className="px-3.5 py-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 font-bold text-xs cursor-pointer transition-all"
              >
                Set as Selected Name B
              </button>
              <button
                type="button"
                disabled={!inputName.trim()}
                onClick={() => inputName.trim() && handleApply(inputName.trim().toUpperCase())}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Select and apply this typed/searched name spelling to your active profile"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply to My Profile</span>
              </button>
              <button
                type="button"
                disabled={!inputName.trim()}
                onClick={() => inputName.trim() && handleCopy(inputName.trim().toUpperCase())}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs transition-all cursor-pointer"
                title="Copy tested name spelling"
              >
                {copiedName === inputName.trim().toUpperCase() ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setInputName(profile.name)}
                className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                title="Reset to current profile name"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Letter by Letter Sound Vibration Visualizer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Letter-by-Letter Chaldean Sound Frequencies
            </span>
            <span className="text-[11px] text-amber-400/80 font-mono">
              Chaldean System (Sacred 1-8 Vibrational Key)
            </span>
          </div>

          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-950 border border-amber-500/20 overflow-x-auto">
            {currentAnalysis.letters.map((item, idx) => {
              if (item.char === ' ') {
                return (
                  <div key={idx} className="w-4 flex items-center justify-center text-slate-600">
                    •
                  </div>
                );
              }
              const pRuler = PLANETARY_PROFILES[item.chaldeanVal];
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900 border border-amber-500/20 min-w-10 text-center"
                >
                  <span className="text-lg font-bold font-serif text-amber-100">{item.char}</span>
                  <span className="text-xs font-black font-mono text-amber-400 bg-amber-950/60 w-full py-0.5 rounded border border-amber-500/30 mt-1">
                    {item.chaldeanVal}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5 truncate max-w-12">
                    {pRuler?.planet.slice(0, 4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compound Analysis Verdict Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">
                Total Chaldean Compound
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black font-mono bg-gradient-to-br from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {currentAnalysis.totalChaldeanCompound}
                </span>
                <div>
                  <span className="text-base font-bold text-amber-200 block">
                    Root {currentAnalysis.chaldeanSingle}
                  </span>
                  <span className="text-xs text-amber-300/80">
                    {PLANETARY_PROFILES[currentAnalysis.chaldeanSingle]?.planet} ({PLANETARY_PROFILES[currentAnalysis.chaldeanSingle]?.sanskritName})
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-500/10 mt-3 flex justify-between text-[11px] text-slate-300">
              <span>First Name: <strong className="text-amber-200">{currentAnalysis.firstNameSum}</strong></span>
              <span>Last Name: <strong className="text-amber-200">{currentAnalysis.lastNameSum}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">
                Cosmic Harmony Index
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-3xl font-black font-mono ${
                    currentAnalysis.harmonyScore >= 75
                      ? 'text-emerald-400'
                      : currentAnalysis.harmonyScore >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {currentAnalysis.harmonyScore}%
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold border ${
                    currentAnalysis.isAuspicious
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {currentAnalysis.isAuspicious ? 'Auspicious Name' : 'Correction Recommended'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-500/10 mt-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Mulank {mulank} Resonance:</span>
                <span
                  className={`font-semibold capitalize ${
                    currentAnalysis.mulankResonance === 'friendly'
                      ? 'text-emerald-400'
                      : currentAnalysis.mulankResonance === 'neutral'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {currentAnalysis.mulankResonance}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bhagyank {bhagyank} Resonance:</span>
                <span
                  className={`font-semibold capitalize ${
                    currentAnalysis.bhagyankResonance === 'friendly'
                      ? 'text-emerald-400'
                      : currentAnalysis.bhagyankResonance === 'neutral'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {currentAnalysis.bhagyankResonance}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              currentAnalysis.compoundInfo.type === 'fortunate'
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : currentAnalysis.compoundInfo.type === 'malefic'
                ? 'bg-rose-950/30 border-rose-500/50'
                : 'bg-slate-950 border-amber-500/20'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {currentAnalysis.compoundInfo.type === 'fortunate' ? (
                  <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                ) : currentAnalysis.compoundInfo.type === 'malefic' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Info className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-xs font-bold text-amber-200">
                  {currentAnalysis.compoundInfo.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentAnalysis.compoundInfo.description}
              </p>
            </div>

            {currentAnalysis.compoundInfo.remedy && (
              <p className="text-[11px] text-rose-300/90 font-medium mt-2 pt-2 border-t border-rose-500/20">
                Remedy: {currentAnalysis.compoundInfo.remedy}
              </p>
            )}
          </div>
        </div>

        {/* Direct Action Bar to Select & Apply the Searched / Tested Name to Profile */}
        {inputName.trim() && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-amber-950/35 to-emerald-950/35 border border-amber-500/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-200">
              <span className="text-amber-300 font-bold uppercase tracking-wider mr-2">
                Tested Name Selection:
              </span>
              <strong className="font-serif text-sm text-amber-100 tracking-wide">
                {inputName.trim().toUpperCase()}
              </strong>{' '}
              <span className="font-mono text-emerald-300">
                (Compound {currentAnalysis.totalChaldeanCompound} ➔ Root {currentAnalysis.chaldeanSingle} • {currentAnalysis.harmonyScore}% Harmony)
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={() => handleApply(inputName.trim().toUpperCase())}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply &ldquo;{inputName.trim().toUpperCase()}&rdquo; to My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(inputName.trim().toUpperCase())}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs transition-all cursor-pointer"
                title="Copy tested spelling to clipboard"
              >
                {copiedName === inputName.trim().toUpperCase() ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Perfect Frequency Confirmation OR 3-Way Comparison & Spelling Suggestions */}
      {currentAnalysis.isAuspicious &&
      realNameAnalysis.isAuspicious &&
      !profile.selectedNameA &&
      !profile.selectedNameB ? (
        <div className="bg-emerald-950/30 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300 block">
              Perfect Name Frequency Result • कोई नाम परिवर्तन सुझाव आवश्यक नहीं है
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100">
              Your Name &ldquo;{inputName.trim().toUpperCase()}&rdquo; Already Vibrates at Perfect Cosmic Frequency ({currentAnalysis.harmonyScore}% Harmony)
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Chaldean Compound <strong>{currentAnalysis.totalChaldeanCompound}</strong> ➔ Root <strong>{currentAnalysis.chaldeanSingle} ({PLANETARY_PROFILES[currentAnalysis.chaldeanSingle]?.planet})</strong> — {currentAnalysis.compoundInfo.title}. Because your name frequency is already auspicious and in harmony with Mulank {mulank} and Bhagyank {bhagyank}, only your result is displayed and no spelling change suggestions are required.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* 3-WAY NAME COMPARISON & LOSS VS BENEFIT MATRIX (Real Name vs Selected Name A vs Selected Name B) */}
          <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  Real Name vs 2 Selected Names Comparison • पुराने नाम का नुकसान बनाम नए चुने गए नाम का फायदा
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 mt-0.5">
                  3-Way Name Comparison: Real Name vs Selected Name A &amp; Selected Name B
                </h2>
                <p className="text-xs text-amber-200/80 mt-1">
                  Compare your <strong>Real / Original Name</strong> alongside <strong>Selected Name A</strong> and <strong>Selected Name B</strong>. See what drawbacks your real name had and what benefits each new spelling brings, then click <strong>Apply Final Name to My Profile</strong> to update your entire profile and PDF report.
                </p>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 font-semibold shrink-0">
                Active Profile Name: <strong className="text-amber-200 font-serif">{activeFinalName}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {[
                {
                  slotKey: 'real',
                  badge: '1. Real / Original Name',
                  title: realOriginalName,
                  value: realOriginalName,
                  onChange: (v: string) => setRealOriginalName(v.toUpperCase()),
                  analysis: realNameAnalysis,
                  isOriginal: true,
                  accentBorder: 'border-rose-500/40 bg-rose-950/15',
                },
                {
                  slotKey: 'nameA',
                  badge: '2. Selected Name A (Option 1)',
                  title: selectedNameA,
                  value: selectedNameA,
                  onChange: (v: string) => setSelectedNameA(v.toUpperCase()),
                  analysis: nameAAnalysis,
                  isOriginal: false,
                  accentBorder: 'border-amber-400/50 bg-amber-950/15',
                },
                {
                  slotKey: 'nameB',
                  badge: '3. Selected Name B (Option 2)',
                  title: selectedNameB,
                  value: selectedNameB,
                  onChange: (v: string) => setSelectedNameB(v.toUpperCase()),
                  analysis: nameBAnalysis,
                  isOriginal: false,
                  accentBorder: 'border-emerald-400/50 bg-emerald-950/15',
                },
              ].map((col) => {
                const lb = describeNameLossAndBenefit(col.analysis, col.isOriginal);
                const isCurrentlyApplied =
                  col.value.trim().toUpperCase() === activeFinalName.trim().toUpperCase();
                const planetName =
                  PLANETARY_PROFILES[col.analysis.chaldeanSingle]?.planet || 'Sun';

                return (
                  <div
                    key={col.slotKey}
                    className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 ${col.accentBorder}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-amber-500/30">
                          {col.badge}
                        </span>
                        <span
                          className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg border ${
                            col.analysis.harmonyScore >= 75
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : col.analysis.harmonyScore >= 55
                                ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                : 'bg-rose-950 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {col.analysis.harmonyScore}% Harmony
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                          {col.isOriginal ? 'Client Original Name (Editable)' : 'Type or Customize Spelling'}
                        </label>
                        <input
                          type="text"
                          value={col.value}
                          onChange={(e) => col.onChange(e.target.value)}
                          className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3.5 py-2 text-sm font-serif font-bold text-amber-100 uppercase tracking-wider focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20">
                          <span className="text-[10px] text-slate-400 block">Compound ➔ Root</span>
                          <strong className="text-amber-200 text-sm">
                            {col.analysis.totalChaldeanCompound} ➔ {col.analysis.chaldeanSingle} ({planetName})
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20">
                          <span className="text-[10px] text-slate-400 block">Mulank / Bhagyank</span>
                          <strong className="text-emerald-300 text-xs capitalize">
                            M: {col.analysis.mulankResonance} • B: {col.analysis.bhagyankResonance}
                          </strong>
                        </div>
                      </div>

                      {/* Drawbacks / Losses */}
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/35 space-y-1">
                        <span className="text-[11px] font-bold text-rose-300 uppercase block">
                          {col.isOriginal
                            ? 'Drawbacks / Losses of Real Name (पुराने नाम का नुकसान):'
                            : 'Points to Watch / Caution:'}
                        </span>
                        {lb.losses.map((l, idx) => (
                          <p key={idx} className="text-[11px] text-rose-100/90 leading-relaxed">
                            • {l}
                          </p>
                        ))}
                      </div>

                      {/* Benefits / Gains */}
                      <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/35 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-300 uppercase block">
                          {col.isOriginal
                            ? 'Existing Baseline Strengths:'
                            : 'Benefits / Gains of Selected Name (नए नाम का फायदा):'}
                        </span>
                        {lb.benefits.map((b, idx) => (
                          <p key={idx} className="text-[11px] text-emerald-100/90 leading-relaxed">
                            • {b}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-500/20 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApply(col.value, selectedNameA, selectedNameB)}
                        className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          isCurrentlyApplied
                            ? 'bg-emerald-500 text-slate-950 shadow-lg'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isCurrentlyApplied
                            ? `✓ Active on Profile (${col.value})`
                            : `Apply "${col.value}" to My Profile`}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Auspicious Spelling Corrections (Only rendered when Name is NOT already perfect) */}
          {!currentAnalysis.isAuspicious && suggestions.length > 0 && (
            <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Auspicious Phonetic &amp; Chaldean Spelling Variations</span>
                  </h2>
                  <p className="text-xs text-amber-300/70">
                    Calibrated to Royal Fortunate Star numbers (19, 21, 23, 24, 27, 32, 33, 37, 41, 45, 51) matching your birth rulers. You can set any suggestion as Selected Name A/B or Apply directly to your profile.
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-mono px-2 py-1 rounded bg-slate-950 border border-amber-500/20">
                  {suggestions.length} Auspicious Options
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl bg-slate-950 border transition-all flex flex-col justify-between space-y-4 group ${
                      sug.isTopPerfectChoice
                        ? 'border-amber-400 ring-1 ring-amber-400/40'
                        : 'border-amber-500/20 hover:border-amber-400/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-serif font-black tracking-wide text-amber-200 group-hover:text-amber-100">
                            {sug.suggestedName}
                          </span>
                          {sug.isTopPerfectChoice && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase">
                              High Resonance
                            </span>
                          )}
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                          Comp {sug.compoundNumber} ➔ {sug.singleDigit}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-amber-400 mb-1">
                        {sug.compoundTitle}
                      </div>

                      <p className="text-xs text-slate-300/90 mb-2">
                        {sug.changeExplanation}
                      </p>

                      <div className="text-[11px] text-amber-300/70 bg-amber-950/20 p-2 rounded-lg border border-amber-500/10">
                        Planetary Resonance: <strong className="text-amber-200">{sug.targetPlanet}</strong> • {sug.planetaryBlessing}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-amber-500/15">
                      <button
                        type="button"
                        onClick={() => setSelectedNameA(sug.suggestedName)}
                        className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-200 text-[11px] font-bold cursor-pointer"
                      >
                        Set Name A
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedNameB(sug.suggestedName)}
                        className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-indigo-200 text-[11px] font-bold cursor-pointer"
                      >
                        Set Name B
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply(sug.suggestedName)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Apply to My Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(sug.suggestedName)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 text-amber-300 text-xs transition-all cursor-pointer"
                        title="Copy spelling to clipboard"
                      >
                        {copiedName === sug.suggestedName ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Precious Stone (Ratna) Recommendation If Client Does Not Want to Change Name & For Personal Growth */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/25 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              <span>Vedic Ratna-Shastra • No-Name-Change Harmony &amp; Personal Growth Precious Stones</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
              Precious Stone Recommendation — If You Do Not Want to Change Name &amp; For Personal Growth
            </h2>
            <p className="text-xs text-amber-200/80 max-w-3xl leading-relaxed">
              If a client prefers <strong>not to change their existing name spelling</strong> in documents or social use, or seeks accelerated <strong>Personal Growth &amp; Career Breakthroughs</strong>, Vedic Astrology prescribes these consecrated Precious Stones (Ratna &amp; Upratna) with complete wearing instructions (Metal, Finger, Hand, Day/Time, Purification &amp; Mantra). Automatically included in your PDF Report.
            </p>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-amber-500/35 text-xs text-amber-200 shrink-0">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">Prescribed Stone Weight</span>
            <strong className="text-sm font-mono text-emerald-300">
              {nameAndGrowthRatna.noNameChangeStone.idealRattiRange}
            </strong>
            <span className="text-[10px] text-slate-400 block">
              ({nameAndGrowthRatna.noNameChangeStone.idealCaratRange})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[nameAndGrowthRatna.noNameChangeStone, nameAndGrowthRatna.personalGrowthStone].map(
            (stoneRec, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-5 space-y-4 flex flex-col justify-between ${
                  idx === 0
                    ? 'bg-slate-950/95 border-amber-500/45 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/95 border-emerald-500/45 shadow-lg shadow-emerald-500/5'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badge & Title */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        idx === 0
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {stoneRec.priorityBadge}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-200 bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-500/25">
                      Planet: {stoneRec.ratna.planet} ({stoneRec.ratna.sanskritPlanet})
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-amber-100 leading-snug">
                      {stoneRec.purposeTitle}
                    </h3>
                    <p className="text-xs text-amber-300/80 mt-0.5">{stoneRec.purposeSubtitle}</p>
                  </div>

                  {/* Primary Gem & Upratna Highlight Box */}
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-r ${stoneRec.ratna.badgeColor} border space-y-1.5`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 block">
                          Primary Precious Stone (Maharatna)
                        </span>
                        <div className="text-base sm:text-lg font-serif font-black text-white">
                          {stoneRec.ratna.primaryGem} ({stoneRec.ratna.sanskritGem})
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/20 text-xs font-mono font-bold text-amber-200">
                        {stoneRec.idealRattiRange}
                      </span>
                    </div>
                    <div className="text-xs text-slate-100 pt-1 border-t border-white/15">
                      <strong>Substitute Stone (Upratna):</strong> {stoneRec.ratna.upratna}
                    </div>
                  </div>

                  {/* Astrological Reason */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs text-slate-200 leading-relaxed">
                    <strong className="text-amber-300 uppercase text-[10px] tracking-wider block mb-1">
                      Why Recommended According to Vedic Astrology &amp; Chaldean Numerology:
                    </strong>
                    {stoneRec.astrologicalReason}
                  </div>

                  {/* Complete Wearing Details Grid (Finger, Metal, Day/Time, Purification) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25">
                      <span className="text-[10px] font-bold uppercase text-amber-400 block mb-0.5">
                        1. Which Finger &amp; Hand to Wear
                      </span>
                      <strong className="text-amber-100 block">{stoneRec.wearingHandAndFinger}</strong>
                      <span className="text-[11px] text-slate-400">
                        Activates {stoneRec.ratna.chakra}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25">
                      <span className="text-[10px] font-bold uppercase text-amber-400 block mb-0.5">
                        2. In Which Metal &amp; Setting
                      </span>
                      <strong className="text-amber-100 block">{stoneRec.ratna.metal}</strong>
                      <span className="text-[11px] text-slate-400">
                        Open-back ring/pendant touching skin
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-0.5">
                        3. Auspicious Day, Time &amp; Nakshatra
                      </span>
                      <strong className="text-emerald-200 block">{stoneRec.dayAndMuhurat}</strong>
                      <span className="text-[11px] text-slate-400">
                        {stoneRec.pakshaAndNakshatra}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25">
                      <span className="text-[10px] font-bold uppercase text-sky-400 block mb-0.5">
                        4. Panchamrit Purification Liquid
                      </span>
                      <strong className="text-sky-200 block text-[11px]">
                        {stoneRec.purificationIngredients}
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        Soak 21–30 mins before sunrise
                      </span>
                    </div>
                  </div>

                  {/* Energization Mantra Box */}
                  <div className="p-3 rounded-xl bg-amber-950/35 border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-400 block">
                        5. Prana-Pratishtha Beej Mantra (Chant 108 Times Before Wearing)
                      </span>
                      <span className="text-xs font-serif font-bold text-amber-100">
                        {stoneRec.beejMantra}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(stoneRec.beejMantra)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-200 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedName === stoneRec.beejMantra ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Mantra</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step-by-Step How to Wear Vidhi */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                      Complete Step-by-Step Wearing Ritual (Ratna Dharan Vidhi):
                    </span>
                    {stoneRec.howToWearStepByStep.map((step, sIdx) => (
                      <p key={sIdx} className="text-[11px] text-slate-200 leading-relaxed">
                        • {step}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Vocation, Enterprise & Industry Alignment (Dynamically Synced to Final Selected Profile Name) */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <span>Vocation, Enterprise &amp; Commercial Domain Alignment for &ldquo;{activeFinalName}&rdquo;</span>
            </h2>
            <p className="text-xs text-amber-300/70 mt-0.5">
              Synthesized from Active Selected Name <strong>{activeFinalName}</strong> (Compound {activeProfileAnalysis.totalChaldeanCompound} ➔ Namank {activeProfileAnalysis.chaldeanSingle}), Mulank {mulank} ({careerAndAura.dominantPlanet}), and Bhagyank {bhagyank} ({careerAndAura.destinyPlanet}).
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200">
            Pranic Bio-Field: <strong className="text-amber-400">{careerAndAura.auraColor}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auspicious & High-Yield Enterprise Domains */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Auspicious &amp; High-Yield Enterprise Domains</span>
            </div>

            <div className="space-y-3">
              {careerAndAura.perfectBusinesses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5">
                    <span className="font-bold text-sm text-amber-100 leading-snug break-words min-w-0">
                      {item.field}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0 self-start">
                      {item.successRate}% Resonance
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed break-words">{item.reason}</p>
                  <span className="text-[10px] text-emerald-400/90 font-mono block break-words">
                    Planetary Patron: {item.governingPlanet}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20">
              <span className="text-[11px] font-bold text-amber-400 uppercase block mb-2">
                Favorable Executive &amp; Professional Roles for &ldquo;{activeFinalName}&rdquo;
              </span>
              <div className="flex flex-wrap gap-1.5">
                {careerAndAura.favorableProfessions.map((prof, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 font-medium"
                  >
                    {prof}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dissonant & High-Risk Sectors (Advised to Avoid) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Dissonant &amp; Inimical Sectors (Advised to Avoid)</span>
            </div>

            <div className="space-y-3">
              {careerAndAura.veryBadBusinesses.map((bad, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-rose-950/25 border border-rose-500/40 space-y-1.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5">
                    <span className="font-bold text-sm text-rose-200 leading-snug break-words min-w-0">
                      {bad.field}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 shrink-0 self-start">
                      Planetary Friction: {bad.conflictPlanet}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed break-words">{bad.dangerReason}</p>
                </div>
              ))}
            </div>

            {/* Pranic Aura & Vedic Remedial Prescriptions Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-start sm:items-center gap-1.5 min-w-0">
                  <Gem className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <span className="break-words">Pranic Aura &amp; Vedic Remedial Prescriptions ({activeFinalName})</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 shrink-0">{careerAndAura.primaryChakra}</span>
              </div>

              <div className="space-y-2.5">
                {careerAndAura.fortuneReadingRemedies.map((rem, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/15 text-xs space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-bold text-amber-200">{rem.title}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/90 text-purple-200 border border-purple-500/35">
                          🔊 {rem.frequencyHz}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {rem.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{rem.prescription}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED EXECUTIVE NAME NUMEROLOGY SUMMARY, PRACTICAL EXAMPLES & MULTI-FAITH REMEDIES */}
      <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
              Detailed Name Vibration Dossier • Multi-Tradition Remedies &amp; Practical Examples
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
              In-Depth Name Vibration Summary &amp; Multi-Faith Remedy Blueprint for &ldquo;{activeFinalName}&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              In Chaldean and Vedic Sound Science (Nada Brahma), every spoken and written syllable of <strong>&ldquo;{activeFinalName}&rdquo;</strong> generates a continuous electromagnetic and pranic wave. Your First Name vibrates at <strong>{activeProfileAnalysis.firstNameSum}</strong> (representing your personal social projection and immediate opportunities), while your Full Name sums to the Compound Number <strong>{activeProfileAnalysis.totalChaldeanCompound} ({activeProfileAnalysis.compoundInfo.title})</strong>, reducing to Root Digit <strong>{activeProfileAnalysis.chaldeanSingle} ({PLANETARY_PROFILES[activeProfileAnalysis.chaldeanSingle]?.planet})</strong>.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>Compound {activeProfileAnalysis.totalChaldeanCompound} Deep Interpretation:</strong> {activeProfileAnalysis.compoundInfo.description} {activeProfileAnalysis.compoundInfo.lifeOutcome} Because your Birth Mulank is <strong>{mulank} ({mulankInfo?.planet})</strong> and Destiny Bhagyank is <strong>{bhagyank} ({bhagyankInfo?.planet})</strong>, aligning your profile to <strong>{activeFinalName} ({activeProfileAnalysis.totalChaldeanCompound} ➔ {activeProfileAnalysis.chaldeanSingle})</strong> synchronizes your daily effort with planetary grace.
            </p>
          </div>

          <div className="lg:col-span-4 rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-slate-950 shadow-xl">
            <img
              src={vedicNameCareerYantra}
              alt="Sacred Chaldean & Vedic Name Sri Yantra"
              className="w-full h-44 object-cover"
            />
            <div className="p-3 text-center">
              <div className="text-xs font-bold text-amber-200">
                Sacred Nada-Brahma, Chaldean &amp; Vedic Resonance
              </div>
              <div className="text-[11px] text-emerald-300 font-mono">
                Chaldean: {activeProfileAnalysis.totalChaldeanCompound}➔{activeProfileAnalysis.chaldeanSingle} • Pythagorean Root: {activeProfileAnalysis.pythagoreanSingle} ({activeProfileAnalysis.harmonyScore}% Harmony)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Practical Name Activation Examples */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs">
            <h3 className="font-serif text-sm font-bold text-amber-300">
              1. Practical Name Activation Examples (No Legal Change Needed)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              You do <strong>not</strong> need to change your Aadhaar, Passport, or Past Academic Degrees immediately. Activate your harmonized spelling <strong>&ldquo;{activeFinalName}&rdquo;</strong> through:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>
                <strong>Example 1 (Digital &amp; Social):</strong> Update WhatsApp Profile Name, Instagram/LinkedIn Display Name, and Email Signature to <strong>{activeFinalName}</strong>.
              </li>
              <li>
                <strong>Example 2 (Daily Writing Sankalpa):</strong> Write <strong>{activeFinalName}</strong> 21 times every morning in a dedicated diary with saffron/green/gold ink during Shubh Choghadiya.
              </li>
              <li>
                <strong>Example 3 (Business &amp; Visiting Cards):</strong> Print your visiting card and office nameplate with the harmonized spelling and an ascending 45° signature without cutting through letters.
              </li>
            </ul>
          </div>

          {/* Vedic & Pranic Sound Remedy */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2 text-xs">
            <h3 className="font-serif text-sm font-bold text-emerald-300">
              2. Vedic Mantra, Sound Frequency (Hz) &amp; Rudraksha Energization
            </h3>
            <p className="text-slate-300 leading-relaxed">
              To energize your Name Vibration ({currentAnalysis.chaldeanSingle}) with your Mulank {mulank} ({mulankInfo?.planet}) and Bhagyank {bhagyank} ({bhagyankInfo?.planet}):
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/25 text-amber-200 font-serif space-y-1">
              <div>"{mulankInfo?.beejMantra}" (108 times at Sunrise)</div>
              <div className="text-[11px] font-mono text-purple-300">
                🔊 Sound Frequency: {mulankInfo?.soundFrequencyHz || '126.22 Hz & 528 Hz'}
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Gemstone &amp; Sound Protocol:</strong> Wear {mulankInfo?.gemstone} in {mulankInfo?.metal} on {mulankInfo?.luckyDays[0]} morning, and {mulankInfo?.soundTherapyProtocol || 'listen to planetary sound frequencies for 15 mins daily.'}
            </p>
          </div>

          {/* Pranic Aura, Chakra & Vastu Signature Remedy */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-2 text-xs">
            <h3 className="font-serif text-sm font-bold text-sky-300">
              3. Pranic Aura, Chakra &amp; Sound Frequency Alignment
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Your name vibration activates your <strong>{careerAndAura.primaryChakra}</strong> and radiates a <strong>{careerAndAura.auraColor}</strong> bio-plasmic aura field. For career authority and financial attraction:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/25 text-center space-y-0.5">
              <div className="font-serif text-sm font-bold text-amber-200">
                "{bhagyankInfo?.beejMantra}"
              </div>
              <div className="font-bold text-emerald-300">
                Destiny Planet: {bhagyankInfo?.planet} ({bhagyankInfo?.sanskritName})
              </div>
              <div className="text-[11px] font-mono text-purple-300">
                🔊 Destiny Sound: {bhagyankInfo?.soundFrequencyHz || '183.58 Hz & 852 Hz'}
              </div>
              <div className="text-[10px] text-slate-400">
                Chant 108x during Abhijit Muhurat facing East or North-East
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Vastu &amp; Signature Practice:</strong> Always sign official documents facing East or North with an ascending 15° underline and a single dot beneath your harmonized name.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
