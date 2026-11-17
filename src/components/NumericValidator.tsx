import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Car,
  Home,
  Building,
  Phone,
  User,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react';
import { BirthProfile, UniversalValidationResult } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  validateNumericEntity,
} from '../utils/numerology';

interface NumericValidatorProps {
  profile: BirthProfile;
}

export const NumericValidator: React.FC<NumericValidatorProps> = ({ profile }) => {
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const mulankInfo = PLANETARY_PROFILES[mulank];
  const bhagyankInfo = PLANETARY_PROFILES[bhagyank];

  const [activeCategory, setActiveCategory] = useState<UniversalValidationResult['category']>('vehicle');
  const [inputValue, setInputValue] = useState('DL 03 CD 2437');

  const result = validateNumericEntity(activeCategory, inputValue, mulank, bhagyank);

  const categories = [
    { id: 'vehicle', label: 'Vehicle Number', icon: Car, placeholder: 'e.g. MH 02 AB 1923 or NY 7842' },
    { id: 'flat', label: 'Flat / Villa / House', icon: Home, placeholder: 'e.g. Flat 304 or Villa 24' },
    { id: 'business', label: 'Business / Brand', icon: Building, placeholder: 'e.g. JAIN CONSULTING or AURA LABS' },
    { id: 'mobile', label: 'Mobile / Telephone', icon: Phone, placeholder: 'e.g. 9811234567' },
    { id: 'name', label: 'Any Name / Alias', icon: User, placeholder: 'e.g. AARAV or PRIYA' },
  ] as const;

  const handleCategoryChange = (cat: UniversalValidationResult['category']) => {
    setActiveCategory(cat);
    if (cat === 'vehicle') setInputValue('DL 03 CD 2437');
    else if (cat === 'flat') setInputValue('Flat 402');
    else if (cat === 'business') setInputValue('VEDIC HARMONY ENTERPRISE');
    else if (cat === 'mobile') setInputValue('9811234567');
    else if (cat === 'name') setInputValue('DEEPAK JAIN');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Numeric Cross-Referencing Engine</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Universal Numeric Vibration Verifier
            </h1>
            <p className="text-sm text-amber-200/70 max-w-2xl">
              Cross-reference any numeric or alphanumeric value—including Vehicle Registration Plates, Flat & House Numbers, Company Brand Names, or Contact Lines—against your Mulank ({mulank}) and Bhagyank ({bhagyank}) for real-time verification of auspicious alignment.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-2xl border border-amber-500/30">
            <div className="text-center px-3 border-r border-amber-500/20">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Mulank</span>
              <span className="text-xl font-bold font-mono text-amber-200">{mulank}</span>
              <span className="text-[10px] text-slate-400 block">{mulankInfo?.planet}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Bhagyank</span>
              <span className="text-xl font-bold font-mono text-amber-200">{bhagyank}</span>
              <span className="text-[10px] text-slate-400 block">{bhagyankInfo?.planet}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-amber-500/20 text-slate-400 hover:text-amber-200 hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Input & Live Result */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
            Enter Value to Verify ({activeCategory.toUpperCase()})
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-lg sm:text-xl font-mono font-bold text-amber-100 tracking-wider focus:outline-none focus:border-amber-400 uppercase"
            placeholder={categories.find((c) => c.id === activeCategory)?.placeholder}
          />
        </div>

        {/* Validation Result Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Compound & Planet */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">
                Calculated Vibration
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black font-mono bg-gradient-to-br from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {result.compound}
                </span>
                <span className="text-slate-500 text-sm">➔</span>
                <div>
                  <span className="text-2xl font-bold font-mono text-amber-200 block">
                    Root {result.singleDigit}
                  </span>
                  <span className="text-xs text-amber-300/80">
                    Governed by {result.planet}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-500/10 mt-3 text-xs text-slate-300">
              Vedic Meaning: <strong className="text-amber-200">{result.meaning}</strong>
            </div>
          </div>

          {/* Resonance Grade */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">
                Vibrational Compatibility Grade
              </span>
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-3xl font-black shadow-lg ${
                    result.resonanceRating === 'A+' || result.resonanceRating === 'A'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20'
                      : result.resonanceRating === 'B'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-amber-500/20'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-rose-500/20'
                  }`}
                >
                  {result.resonanceRating}
                </div>

                <div>
                  <span className="text-xl font-bold font-mono text-amber-100 block">
                    {result.harmonyScore}% Harmony
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      result.isHarmonious ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.isHarmonious ? 'Auspicious Resonance' : 'Energetic Dissonance'}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full ${
                  result.harmonyScore >= 70 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${result.harmonyScore}%` }}
              />
            </div>
          </div>

          {/* Practical Advice & Remedy */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-amber-400 uppercase font-semibold block mb-1">
                Practical Guidance & Fix
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {result.advice}
              </p>
            </div>

            <div className="pt-3 border-t border-amber-500/10 mt-3 text-[11px] text-amber-300/80">
              {activeCategory === 'vehicle' && 'Add an auspicious sticker (e.g. Swastika, Om, or 786) to adjust energetic totals.'}
              {activeCategory === 'flat' && 'Place a copper sun or Vastu crystal pyramid above the entrance threshold.'}
              {activeCategory === 'business' && 'Adjust brand spelling to compound 23, 24, 32, 37, 41, or 51.'}
            </div>
          </div>
        </div>

        {/* STEP-BY-STEP SELF-CALCULATION BREAKDOWN & CHALDEAN KEY TABLE */}
        {(() => {
          const CHALDEAN_MAP: Record<string, number> = {
            A: 1, I: 1, J: 1, Q: 1, Y: 1,
            B: 2, K: 2, R: 2,
            C: 3, G: 3, L: 3, S: 3,
            D: 4, M: 4, T: 4,
            E: 5, H: 5, N: 5, X: 5,
            U: 6, V: 6, W: 6,
            O: 7, Z: 7,
            F: 8, P: 8,
          };
          const cleanChars = (inputValue || '')
            .toUpperCase()
            .split('')
            .filter((ch) => /[A-Z0-9]/.test(ch));
          const charSteps = cleanChars.map((ch) => {
            const isDigit = /[0-9]/.test(ch);
            const val = isDigit ? parseInt(ch, 10) : CHALDEAN_MAP[ch] || 0;
            return { ch, val, type: isDigit ? 'Digit' : 'Letter' };
          });
          const rawDigitsOnly = cleanChars.filter((ch) => /[0-9]/.test(ch));
          const last4VehicleDigits = rawDigitsOnly.slice(-4);
          const last4Sum = last4VehicleDigits.reduce((acc, d) => acc + parseInt(d, 10), 0);
          const last4Root = last4Sum > 0 ? ((last4Sum - 1) % 9) + 1 : 0;

          return (
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/35 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                    1. Live Step-by-Step Calculation Formula (Learn How to Calculate Yourself)
                  </h3>
                  <p className="text-xs text-amber-300/75">
                    Every letter is converted using the Sacred Chaldean 1–8 Key and added to the numeric digits to obtain the Compound Number and Single Root.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 font-mono text-xs font-bold">
                  Formula: Sum of Values = {result.compound} ➔ Root {result.singleDigit}
                </span>
              </div>

              {/* Character-by-character addition chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                  Character-by-Character Value Addition for &ldquo;{inputValue.toUpperCase()}&rdquo;:
                </span>
                <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/25">
                  {charSteps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-amber-500/35 text-center min-w-[44px]">
                        <span className="text-sm font-serif font-black text-amber-100 block">
                          {step.ch}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-300 block">
                          +{step.val}
                        </span>
                      </div>
                      {idx < charSteps.length - 1 && (
                        <span className="text-amber-400 font-mono font-bold text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                  <span className="text-amber-400 font-mono font-black text-sm px-1">=</span>
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-100 font-mono text-xs font-black">
                    Compound {result.compound} ➔ {String(result.compound).split('').join(' + ')} = Root {result.singleDigit} ({result.planet})
                  </div>
                </div>
              </div>

              {activeCategory === 'vehicle' && last4VehicleDigits.length > 0 && (
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-400/40 text-xs text-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-indigo-300 uppercase tracking-wider mr-2">
                      RTO Last 4 Digits Check ({last4VehicleDigits.join('')}):
                    </strong>
                    <span>
                      {last4VehicleDigits.join(' + ')} = <strong>{last4Sum}</strong> ➔ Single Root{' '}
                      <strong className="text-emerald-300">{last4Root}</strong> ({PLANETARY_PROFILES[last4Root]?.planet})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-300">
                    Full Alphanumeric Plate Total: {result.compound} ➔ Root {result.singleDigit}
                  </span>
                </div>
              )}

              {/* Chaldean 1-8 Reference Key so client can self-calculate anytime */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                  Sacred Chaldean Letter-to-Number Key (1 to 8) for Self-Calculation:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {[
                    { num: 1, planet: 'Sun', letters: 'A, I, J, Q, Y' },
                    { num: 2, planet: 'Moon', letters: 'B, K, R' },
                    { num: 3, planet: 'Jupiter', letters: 'C, G, L, S' },
                    { num: 4, planet: 'Rahu', letters: 'D, M, T' },
                    { num: 5, planet: 'Mercury', letters: 'E, H, N, X' },
                    { num: 6, planet: 'Venus', letters: 'U, V, W' },
                    { num: 7, planet: 'Ketu', letters: 'O, Z' },
                    { num: 8, planet: 'Saturn', letters: 'F, P' },
                  ].map((item) => (
                    <div
                      key={item.num}
                      className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/25 text-center"
                    >
                      <div className="text-sm font-mono font-black text-amber-300">
                        Value {item.num} ({item.planet})
                      </div>
                      <div className="text-xs font-serif font-bold text-amber-100 mt-1">
                        {item.letters}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 2. MASTER SELECTION RULES FOR NEW VEHICLES, FLATS, PLOTS, BANK ACCOUNTS & BUSINESS / BRAND NAMES */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="border-b border-amber-500/20 pb-3">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>
              2. Master Selection Rules for New Vehicles, Flats, Plots, Bank Accounts &amp; Business / Brand Names (Company &amp; Trade)
            </span>
          </h2>
          <p className="text-xs text-amber-300/75 mt-1">
            Personalized for <strong>{profile.name}</strong> (Mulank {mulank} — {mulankInfo?.planet} • Bhagyank {bhagyank} — {bhagyankInfo?.planet}). Use these rules whenever selecting a new Vehicle, Flat/Plot, Business/Brand Name, or Bank Account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span>A. Vehicle Registration Plate (Car / Two-Wheeler / Fleet)</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                Best Roots: {(mulankInfo?.friendlyNumbers || [1, 3, 5, 6]).slice(0, 4).join(', ')}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Check both the <strong>Last 4 Digits</strong> (e.g., 2437 = 2+4+3+7 = 16 ➔ 7) and the <strong>Full Alphanumeric Plate</strong>. Prioritize Single Roots <strong>{(mulankInfo?.friendlyNumbers || [1, 3, 5, 6]).slice(0, 4).join(', ')}</strong> or Bhagyank <strong>{bhagyank}</strong>. Strictly avoid Root 8 (Saturn) and Root 4 (Rahu) for daily travel vehicles to prevent mechanical breakdowns or road hurdles.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" />
                <span>B. Flat, Villa, House &amp; Commercial Plot Number</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                Ideal Roots: {mulank}, {bhagyank}, 3, 6
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Add the block letter (if any) and digits of your Flat/Plot (e.g., B-402 = 2+4+0+2 = 8). For peaceful domestic prosperity and Vastu protection, choose totals reducing to <strong>{(mulankInfo?.friendlyNumbers || [1, 3, 5, 6]).slice(0, 3).join(', ')}</strong> or <strong>6 (Venus)</strong>. If an existing house number is inimical, install a brass numeral plate inside a green/golden frame to neutralize the clash.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/35 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm sm:text-base font-bold text-emerald-200 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>C. Business / Brand Name (Company &amp; Trade)</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                Power Compounds: 19, 23, 24, 32, 37, 41, 45, 46, 51
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your <strong>Business / Brand Name (Company &amp; Trade)</strong> governs commercial magnetism, customer trust, and turnover velocity. Calculate the Chaldean sum of the trading brand name (excluding Pvt Ltd/LLP unless printed prominently in the logo) and align it to Royal Compounds <strong>19 (Sun), 23 (Mercury), 24 (Venus), 32 (Mercury), 37 (Sun), 41 (Mercury), 45 (Mars), 46 (Sun), or 51 (Mars)</strong> harmonizing with Mulank <strong>{mulank}</strong> &amp; Bhagyank <strong>{bhagyank}</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>D. Bank Account, Locker &amp; Financial Folio Number</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                Wealth Roots: 1, 3, 5, 6
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Add all digits of your primary savings or current Bank Account number. Totals reducing to <strong>1 (Sun), 3 (Jupiter), 5 (Mercury), or 6 (Venus)</strong>—or matching your Bhagyank <strong>{bhagyank}</strong>—accelerate capital accumulation, timely payment recovery, and compounding wealth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
