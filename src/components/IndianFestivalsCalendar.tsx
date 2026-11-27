import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Crown,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  analyzeName,
} from '../utils/numerology';
import {
  getPersonalizedIndianFestivals,
  calculateVedicAstrologyFromBirth,
} from '../utils/astrologyAndCities';
import { useTathastu } from '../utils/tathastuStore';

interface IndianFestivalsCalendarProps {
  profile: BirthProfile;
}

export const IndianFestivalsCalendar: React.FC<IndianFestivalsCalendarProps> = ({
  profile,
}) => {
  const { activeProfile } = useTathastu();
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const nameAnalysis = analyzeName(profile.name, mulank, bhagyank);
  const namank = nameAnalysis.chaldeanSingle;

  const autoAstro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.2090
  );

  // Default to 'next12m' (Next 12 Months from Client Profile Save Date — no past months!)
  const [selectedHorizon, setSelectedHorizon] = useState<'next12m' | number>('next12m');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'raj-yoga'>('all');

  const registrationIso =
    activeProfile?.createdAtIso &&
    !activeProfile.createdAtIso.startsWith('2026-01-03') &&
    !activeProfile.createdAtIso.startsWith('2026-01-05')
      ? activeProfile.createdAtIso
      : new Date().toISOString();
  const regDateObj = new Date(registrationIso);
  const regEndObj = new Date(regDateObj);
  regEndObj.setFullYear(regEndObj.getFullYear() + 1);

  const fmtShort = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const horizonRangeLabel = `${fmtShort(regDateObj)} – ${fmtShort(regEndObj)}`;

  const selectedYear =
    typeof selectedHorizon === 'number' ? selectedHorizon : regDateObj.getFullYear();

  const festivals = getPersonalizedIndianFestivals(
    profile.name,
    mulank,
    bhagyank,
    namank,
    autoAstro.rashi,
    selectedYear,
    registrationIso,
    typeof selectedHorizon === 'number'
  );

  const [expandedFestivalId, setExpandedFestivalId] = useState<string | null>(
    festivals[0]?.id || null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFestivals = festivals.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.hindiName.includes(searchQuery) ||
      f.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.date.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'raj-yoga') return f.personalImpactScore >= 88;
    return true;
  });

  const handleToggleFestival = (id: string) => {
    setExpandedFestivalId((prev) => (prev === id ? null : id));
  };

  const handleCopyMantra = (e: React.MouseEvent, id: string, mantra: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mantra);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const FIVE_YEAR_OPTIONS = [
    { year: 2026, samvat: 2083, label: '2026 (VS 2083)' },
    { year: 2027, samvat: 2084, label: '2027 (VS 2084)' },
    { year: 2028, samvat: 2085, label: '2028 (VS 2085)' },
    { year: 2029, samvat: 2086, label: '2029 (VS 2086)' },
    { year: 2030, samvat: 2087, label: '2030 (VS 2087)' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Sacred Banner */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {selectedHorizon === 'next12m'
                  ? `Next 12 Months from Profile Save Date (${horizonRangeLabel})`
                  : `Sanatan Vikram Samvat Panchang (${selectedYear})`}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              All-India Sacred Festivals & Personal Puja Muhurat (
              {selectedHorizon === 'next12m'
                ? `Next 12 Months: ${horizonRangeLabel}`
                : selectedYear}
              )
            </h1>
            <p className="text-sm text-amber-200/70 max-w-3xl">
              Calculated strictly for the <strong>Next 12 Months from the Date Client Profile Was Saved ({horizonRangeLabel})</strong> — past elapsed months are never shown and automatically advance to their next upcoming festival dates for{' '}
              <strong>{profile.name}</strong> ({autoAstro.rashi}, {autoAstro.nakshatra}, Mulank {mulank}, Bhagyank {bhagyank}).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 bg-slate-950/90 p-3.5 rounded-2xl border border-amber-500/30 shrink-0 text-center">
            <div className="px-2.5 py-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Mulank / Bhagyank</span>
              <span className="text-base font-black font-mono text-amber-100">
                {mulank} & {bhagyank}
              </span>
            </div>
            <div className="px-2.5 py-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Chaldean Namank</span>
              <span className="text-base font-black font-mono text-amber-100">
                {nameAnalysis.totalChaldeanCompound} ➔ {namank}
              </span>
            </div>
            <div className="px-2.5 py-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Janma Rashi</span>
              <span className="text-xs font-bold text-amber-100">{autoAstro.rashi}</span>
            </div>
            <div className="px-2.5 py-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Nakshatra</span>
              <span className="text-xs font-bold text-amber-100">
                {autoAstro.nakshatra} (P-{autoAstro.pada})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Next 12 Months / 5-Years Dropdown Window & Filter Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-amber-500/20">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/30 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              placeholder="Search festival by name, deity, or month (e.g. Diwali, Dhanteras, Shivratri, Navratri, Holi)..."
            />
          </div>

          {/* Horizon Dropdown Window Next to Search Bar */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-2 w-full sm:w-auto max-w-full min-w-0 overflow-hidden">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase text-amber-300 tracking-wider shrink-0">
              Horizon:
            </span>
            <select
              value={String(selectedHorizon)}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedHorizon(v === 'next12m' ? 'next12m' : Number(v));
              }}
              aria-label="Select Festival Horizon"
              className="flex-1 min-w-0 w-full max-w-full bg-slate-950 text-amber-100 font-mono text-xs font-bold focus:outline-none cursor-pointer truncate"
            >
              <option value="next12m" className="bg-slate-950 text-emerald-300">
                Next 12 Months ({horizonRangeLabel})
              </option>
              {FIVE_YEAR_OPTIONS.map((opt) => (
                <option key={opt.year} value={String(opt.year)} className="bg-slate-950 text-amber-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filterMode === 'all'
                ? 'bg-amber-500/20 text-amber-200 border-amber-400'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-amber-200'
            }`}
          >
            All Pan-India Festivals ({festivals.length})
          </button>
          <button
            onClick={() => setFilterMode('raj-yoga')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              filterMode === 'raj-yoga'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Supreme Raj-Yoga Alignment</span>
          </button>
        </div>
      </div>

      {/* Interactive Accordion List View of All Indian Festivals */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-3xl overflow-hidden shadow-2xl divide-y divide-amber-500/15">
        {filteredFestivals.map((fest, index) => {
          const isExpanded = expandedFestivalId === fest.id;
          return (
            <div
              key={fest.id}
              className={`transition-colors ${
                isExpanded ? 'bg-slate-900' : 'bg-slate-950/60 hover:bg-slate-900/70'
              }`}
            >
              {/* Clickable Festival List Row */}
              <button
                type="button"
                onClick={() => handleToggleFestival(fest.id)}
                className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 border transition-all ${
                      isExpanded
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-amber-400 border-amber-500/30 group-hover:border-amber-400'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base sm:text-lg font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                        {fest.name}
                      </span>
                      <span className="text-sm text-amber-400/90 font-normal">
                        ({fest.hindiName})
                      </span>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {fest.date}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{fest.vikramSamvatTithi}</span>
                      <span>•</span>
                      <span>
                        Deity: <strong className="text-amber-200/90">{fest.deity}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Ruler: <strong className="text-amber-300">{fest.governingPlanet} ({fest.governingNumber})</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pl-11 sm:pl-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-[11px] font-bold block ${
                        fest.personalImpactScore >= 88
                          ? 'text-emerald-400'
                          : fest.personalImpactScore >= 75
                          ? 'text-amber-300'
                          : 'text-rose-300'
                      }`}
                    >
                      {fest.personalVerdictTag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Resonance: {fest.personalImpactScore}%
                    </span>
                  </div>

                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                      isExpanded
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-amber-500/20 text-slate-400 group-hover:text-amber-200'
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Collapsible Detail Panel (Opens ONLY for the selected festival) */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 pt-2 space-y-5 border-t border-amber-500/20 bg-slate-950/90 animate-fade-in">
                  {/* Significance & Personal Astrological Forecast */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/35 via-slate-900 to-slate-950 border border-amber-500/30 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Personal Astrological & Numerological Alignment for {profile.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
                        Spiritual Essence: {fest.significance}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed">
                      {fest.howFestivalWillBeForClient}
                    </p>
                  </div>

                  {/* 4 Personalized Pooja & Ritual Muhurat Windows */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* 1. Siddha & Amrit Muhurat (Optimal Worship Window) */}
                    <div className="p-4 rounded-2xl bg-emerald-950/25 border-2 border-emerald-500/50 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                            ★ Supreme Siddha Muhurat
                          </span>
                          <Crown className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-sm font-mono font-black text-emerald-200 mt-1.5">
                          {fest.auspiciousBestPoojaTime.window}
                        </div>
                        <div className="text-[11px] font-bold text-amber-300 mt-0.5">
                          {fest.auspiciousBestPoojaTime.muhuratName}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed pt-2 border-t border-emerald-500/20">
                        {fest.auspiciousBestPoojaTime.whyBestForClient}
                      </p>
                    </div>

                    {/* 2. Shastra-Approved Punya Kaal Window */}
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                            ✓ Favorable Punya Kaal
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-sm font-mono font-bold text-amber-100 mt-1.5">
                          {fest.sahiPoojaTime.window}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed pt-2 border-t border-amber-500/20">
                        {fest.sahiPoojaTime.description}
                      </p>
                    </div>

                    {/* 3. Inauspicious Vishti / Bhadra Window */}
                    <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/40 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 bg-orange-950 px-2 py-0.5 rounded border border-orange-500/30">
                            ⚠ Vishti / Bhadra Caution
                          </span>
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="text-sm font-mono font-bold text-orange-200 mt-1.5">
                          {fest.badPoojaTime.window}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed pt-2 border-t border-orange-500/20">
                        {fest.badPoojaTime.reason}
                      </p>
                    </div>

                    {/* 4. Prohibited Rahu Kaal & Dissonant Hora */}
                    <div className="p-4 rounded-2xl bg-rose-950/30 border-2 border-rose-500/50 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/40">
                            ✕ Prohibited Varjya Kaal
                          </span>
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="text-sm font-mono font-black text-rose-200 mt-1.5">
                          {fest.worstPoojaTime.window}
                        </div>
                      </div>
                      <p className="text-[11px] text-rose-200/90 leading-relaxed pt-2 border-t border-rose-500/20">
                        {fest.worstPoojaTime.reason}
                      </p>
                    </div>
                  </div>

                  {/* Sacred Altar Protocol, Offerings & Siddhi Mantra */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                        Sacred Lamp (Diya) & Altar Direction
                      </span>
                      <p className="text-slate-200 font-medium">
                        {fest.personalizedRitualAndAuraRemedy.diyaAndDirection}
                      </p>
                      <span className="text-[10px] font-bold uppercase text-amber-400 block mt-2 mb-0.5">
                        Prescribed Offerings (Puja Samagri):
                      </span>
                      <p className="text-slate-300">{fest.personalizedRitualAndAuraRemedy.offerings}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                        Pranic Aura & Chakra Harmonization
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {fest.personalizedRitualAndAuraRemedy.auraCleansingTip}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between bg-slate-950 p-3 rounded-xl border border-amber-500/20">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                          Prescribed Festival Siddhi Mantra
                        </span>
                        <p className="font-serif text-amber-100 font-semibold">
                          "{fest.personalizedRitualAndAuraRemedy.mantraForClient}"
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) =>
                          handleCopyMantra(
                            e,
                            fest.id,
                            fest.personalizedRitualAndAuraRemedy.mantraForClient
                          )
                        }
                        className="mt-2 self-end flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-all"
                      >
                        {copiedId === fest.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === fest.id ? 'Copied' : 'Copy Mantra'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
