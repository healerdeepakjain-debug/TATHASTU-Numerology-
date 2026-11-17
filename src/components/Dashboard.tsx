import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Flame,
  Phone,
  Calendar,
  HeartHandshake,
  ShieldAlert,
  ArrowRight,
  Award,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  Bot,
  FolderOpen,
  ArrowLeft,
  HeartPulse,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeName,
  analyzeMobileNumber,
  getDailyPanchang,
  calculateLoShuGrid,
} from '../utils/numerology';
import { useTathastu } from '../utils/tathastuStore';
import { InteractiveLoShuGrid } from './InteractiveLoShuGrid';
import { GemstoneRecommendation } from './GemstoneRecommendation';

interface DashboardProps {
  profile: BirthProfile;
  setActiveTab: (tab: string) => void;
  onOpenProfileModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  setActiveTab,
  onOpenProfileModal,
}) => {
  const { clearActiveProfile } = useTathastu();

  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const mulankData = PLANETARY_PROFILES[mulank];
  const bhagyankData = PLANETARY_PROFILES[bhagyank];

  const nameAnalysis = analyzeName(profile.name, mulank, bhagyank);
  const mobileAnalysis = analyzeMobileNumber(profile.mobile || '', mulank, bhagyank);
  const panchang = getDailyPanchang(new Date(), mulank, bhagyank);
  const loShu = calculateLoShuGrid(profile.dob, mulank, bhagyank);

  const [copiedMantra, setCopiedMantra] = useState(false);

  const copyMantra = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMantra(true);
    setTimeout(() => setCopiedMantra(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Sacred Client Cosmic Status Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-950/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  clearActiveProfile();
                  setActiveTab('profiles-portal');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer transition-all no-print"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Saved Profiles List</span>
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Complete Vedic & Chaldean Report: {profile.name}</span>
              </div>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-100 tracking-tight">
              Namaste, <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">{profile.name}</span>
            </h1>
            <p className="text-sm text-amber-200/70 max-w-2xl">
              Born under the vibration of <strong className="text-amber-200">{mulankData?.planet} ({mulankData?.sanskritName})</strong>, guided by the karmic destiny of <strong className="text-amber-200">{bhagyankData?.planet} ({bhagyankData?.sanskritName})</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-amber-300/90 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-amber-500/30">
                Moon Sign: <strong className="text-amber-100">{profile.rashi || 'Kanya (Virgo)'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-amber-500/30">
                Sun Sign: <strong className="text-amber-100">{profile.sunSign || 'Simha (Leo)'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-emerald-500/30 text-emerald-300">
                Nakshatra: <strong>{profile.nakshatra || 'Hasta'} (Pada {profile.nakshatraPada || 2})</strong>
              </span>
              {profile.pob && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-amber-500/20 text-slate-300">
                  📍 {profile.pob}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Edit & Save Report / Bride Details</span>
            </button>
            <button
              onClick={() => setActiveTab('name-corrector')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Name & Business Guide</span>
            </button>
            <button
              onClick={() => setActiveTab('yoga-pranayama')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Yoga & Pranayama Planner</span>
            </button>
            <button
              onClick={() => setActiveTab('festivals')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-amber-200 border border-amber-500/40 transition-all cursor-pointer"
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Indian Festivals & Puja</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Trinity Cards: Mulank, Bhagyank, Namank */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Mulank Card */}
        <div className="relative group bg-slate-900/80 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-5 shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Mulank (Psychic / Root)
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              Day {profile.dob.split('-')[2]}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-extrabold font-mono bg-gradient-to-br from-amber-100 to-amber-400 bg-clip-text text-transparent">
              {mulank}
            </span>
            <div>
              <span className="text-lg font-bold text-amber-200 block">
                {mulankData?.planet} ({mulankData?.sanskritName})
              </span>
              <span className="text-xs text-amber-300/60">{mulankData?.element} Element • {mulankData?.quality}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300/80 line-clamp-2 mb-3">
            Governs your core subconscious identity, natural demeanor, youth years, and instinctual decisions.
          </p>

          <div className="pt-3 border-t border-amber-500/10 text-[11px] text-amber-300/80 flex justify-between items-center">
            <span>Lucky Gem: <strong className="text-amber-200">{mulankData?.gemstone}</strong></span>
            <span>Metal: <strong className="text-amber-200">{mulankData?.metal}</strong></span>
          </div>
        </div>

        {/* Bhagyank Card */}
        <div className="relative group bg-slate-900/80 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-5 shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Bhagyank (Destiny / Life Path)
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              Full DOB Sum
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-extrabold font-mono bg-gradient-to-br from-amber-100 to-amber-400 bg-clip-text text-transparent">
              {bhagyank}
            </span>
            <div>
              <span className="text-lg font-bold text-amber-200 block">
                {bhagyankData?.planet} ({bhagyankData?.sanskritName})
              </span>
              <span className="text-xs text-amber-300/60">{bhagyankData?.element} Element • Karmic Mission</span>
            </div>
          </div>

          <p className="text-xs text-slate-300/80 line-clamp-2 mb-3">
            Governs your worldly destiny, career fulfillment, mid-to-late life triumphs, and public reputation.
          </p>

          <div className="pt-3 border-t border-amber-500/10 text-[11px] text-amber-300/80 flex justify-between items-center">
            <span>Friendly: <strong className="text-amber-200">{bhagyankData?.friendlyNumbers.join(', ')}</strong></span>
            <span>Avoid: <strong className="text-rose-300">{bhagyankData?.enemyNumbers.length ? bhagyankData?.enemyNumbers.join(', ') : 'None'}</strong></span>
          </div>
        </div>

        {/* Namank (Chaldean Name) Card */}
        <div className="relative group bg-slate-900/80 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-5 shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Namank (Chaldean Compound)
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                nameAnalysis.harmonyScore >= 75
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              }`}
            >
              {nameAnalysis.harmonyScore}% Harmony
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-extrabold font-mono bg-gradient-to-br from-amber-100 to-amber-400 bg-clip-text text-transparent">
              {nameAnalysis.totalChaldeanCompound}
            </span>
            <div>
              <span className="text-lg font-bold text-amber-200 block">
                Root {nameAnalysis.chaldeanSingle} ({PLANETARY_PROFILES[nameAnalysis.chaldeanSingle]?.planet})
              </span>
              <span className="text-xs text-amber-300/80 font-medium">
                {nameAnalysis.compoundInfo.title}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300/80 line-clamp-2 mb-3">
            {nameAnalysis.compoundInfo.description}
          </p>

          <div className="pt-3 border-t border-amber-500/10 flex items-center justify-between text-xs">
            <span className="text-amber-300/80">Spelling Resonance:</span>
            <button
              onClick={() => setActiveTab('name-corrector')}
              className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Harmonize</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Auspiciousness & Real-Time Decision Optimizer Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Vibration & Muhurat Window */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <span>Today's Daily Celestial Decision Guide</span>
              </h2>
              <p className="text-xs text-amber-300/70">
                Panchang & Planetary Hora synchronized with your birth numbers for optimal timing.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/20 text-xs">
              <span className="text-slate-400">Cosmic Auspiciousness:</span>
              <span className="font-bold text-amber-300 font-mono">{panchang.auspiciousVibrationScore}%</span>
            </div>
          </div>

          {/* Progress bar of day vibration */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-amber-500/20 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                panchang.auspiciousVibrationScore >= 80
                  ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                  : panchang.auspiciousVibrationScore >= 60
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${panchang.auspiciousVibrationScore}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Lucky Numbers Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-amber-400/80 uppercase font-semibold block mb-1">
                  Personalized Lucky Numbers
                </span>
                <div className="flex items-center gap-2 font-mono text-xl font-black text-amber-200">
                  {panchang.luckyNumbers.map((n, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-amber-300/60 mt-2">
                Use for deal signing or sequence choices.
              </p>
            </div>

            {/* Lucky Color & Direction */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-amber-400/80 uppercase font-semibold block mb-1">
                  Auspicious Attire & Color
                </span>
                <span className="text-sm font-bold text-amber-200 block">
                  {panchang.luckyColor}
                </span>
              </div>
              <p className="text-[11px] text-amber-300/60 mt-2">
                Wear this hue for positive alignment.
              </p>
            </div>

            {/* Active Choghadiya Window */}
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-amber-400/80 uppercase font-semibold block mb-1">
                  Active Choghadiya Muhurat
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm px-2 py-0.5 rounded ${
                      panchang.currentChoghadiya.quality === 'Excellent'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {panchang.currentChoghadiya.name}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {panchang.currentChoghadiya.startTime} - {panchang.currentChoghadiya.endTime}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-amber-300/60 mt-2">
                Ruler: {panchang.currentChoghadiya.ruler}
              </p>
            </div>
          </div>

          {/* Today's Planetary Mantra */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
                Today's Protective Vedic Beej Mantra
              </span>
              <p className="text-sm font-serif font-bold text-amber-100 tracking-wide mt-0.5">
                "{panchang.todayBeejMantra}"
              </p>
            </div>
            <button
              onClick={() => copyMantra(panchang.todayBeejMantra)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all cursor-pointer"
            >
              {copiedMantra ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMantra ? 'Copied' : 'Copy Mantra'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Mobile SIM Health Quick Audit */}
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-amber-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Mobile SIM Vibration</span>
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono border ${
                  mobileAnalysis.overallScore >= 75
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}
              >
                {mobileAnalysis.overallScore}/100
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/15 mb-3 font-mono text-sm flex items-center justify-between">
              <span className="text-slate-300">{profile.mobile || 'No Mobile Registered'}</span>
              <span className="text-amber-400 font-bold">Sum {mobileAnalysis.compoundNumber} ➔ {mobileAnalysis.singleDigit}</span>
            </div>

            {mobileAnalysis.toxicPairsFound.length > 0 ? (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 mb-3 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Negative Pair ({mobileAnalysis.toxicPairsFound.map((t) => t.pair).join(', ')})</span>
                </div>
                <p className="text-[11px] text-rose-300/80">
                  {mobileAnalysis.toxicPairsFound[0].meaning}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No negative pairs detected. Clean harmonic flow.</span>
              </div>
            )}

            <p className="text-xs text-slate-300/70">
              {mobileAnalysis.verdict}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('mobile-auditor')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 transition-all cursor-pointer"
          >
            <span>Full Mobile Audit & SIM Finder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Sacred 3x3 Lo-Shu Grid & Vedic Planetary Remedies */}
      <InteractiveLoShuGrid
        dob={profile.dob}
        mulank={mulank}
        bhagyank={bhagyank}
        clientName={profile.name}
        namank={nameAnalysis.chaldeanSingle}
      />

      {/* Auspicious Gemstone Recommendation (Birth Chart + Planetary Transits) */}
      <GemstoneRecommendation profile={profile} />

      {/* Quick Launchpad to Other Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('validator')}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-400/50 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-amber-100 mb-1">
            Universal Numeric Verifier
          </h4>
          <p className="text-xs text-slate-400">
            Real-time validation for vehicle plates, flat numbers, and company brands.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('calendar')}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-400/50 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-amber-100 mb-1">
            Cosmic Muhurat Calendar
          </h4>
          <p className="text-xs text-slate-400">
            Audit upcoming contract signings, purchases, or travel dates.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('compatibility')}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-400/50 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-amber-100 mb-1">
            Ashtakoot Partner Milan
          </h4>
          <p className="text-xs text-slate-400">
            36-point Guna Milan, 7-Chakra challenges & Bride/Groom remedies.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('ai-consultant')}
          className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-400/50 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-amber-100 mb-1">
            Vedic AI Cosmic Oracle
          </h4>
          <p className="text-xs text-slate-400">
            Ask detailed questions regarding signatures, baby names, or remedies.
          </p>
        </div>
      </div>
    </div>
  );
};
