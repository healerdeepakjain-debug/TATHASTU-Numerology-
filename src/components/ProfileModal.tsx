import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Phone,
  User,
  Sparkles,
  Check,
  Search,
  Compass,
  Sun,
  Moon,
  Star,
  HeartHandshake,
  HeartPulse,
} from 'lucide-react';
import { BirthProfile, CityLocation } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeName,
  analyzeMobileNumber,
} from '../utils/numerology';
import {
  calculateVedicAstrologyFromBirth,
} from '../utils/astrologyAndCities';
import { HEALTH_CONCERN_OPTIONS } from '../utils/yogaPranayamaData';
import { CityAutocompleteInput } from './CityAutocompleteInput';
import { BirthTimeAmPmInput, formatTime12HourAmPm } from './BirthTimeAmPmInput';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BirthProfile;
  onSave: (profile: BirthProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<BirthProfile>(profile);
  const [cityQuery, setCityQuery] = useState(profile.pob || 'New Delhi, India');

  const [partnerCityQuery, setPartnerCityQuery] = useState(
    profile.partnerPob || 'Mumbai, Maharashtra, India'
  );

  useEffect(() => {
    const isFemale = profile.gender === 'female';
    const rawPartnerName = (profile.partnerName || '').trim();
    const defaultPartnerName = isFemale
      ? !rawPartnerName || rawPartnerName.toLowerCase() === 'priyanka sharma'
        ? 'Rohit Sharma'
        : rawPartnerName
      : !rawPartnerName || rawPartnerName.toLowerCase() === 'rohit sharma'
      ? 'Priyanka Sharma'
      : rawPartnerName;
    const defaultPartnerDob = isFemale
      ? !profile.partnerDob || profile.partnerDob === '1990-11-24'
        ? '1988-06-15'
        : profile.partnerDob
      : !profile.partnerDob || profile.partnerDob === '1988-06-15'
      ? '1990-11-24'
      : profile.partnerDob;

    setFormData({
      ...profile,
      gender: profile.gender || 'male',
      includePartnerMilan: Boolean(profile.includePartnerMilan),
      healthConcerns: profile.healthConcerns || [],
      partnerName: defaultPartnerName,
      partnerDob: defaultPartnerDob,
      partnerTob: profile.partnerTob || (isFemale ? '10:30' : '14:20'),
      partnerPob: profile.partnerPob || 'Mumbai, Maharashtra, India',
      partnerLat: profile.partnerLat ?? 19.076,
      partnerLng: profile.partnerLng ?? 72.8777,
    });
    setCityQuery(profile.pob || 'New Delhi, India');
    setPartnerCityQuery(profile.partnerPob || 'Mumbai, Maharashtra, India');
  }, [profile, isOpen]);

  // Automatic Astrological Ephemeris Calculation whenever DOB, TOB, Lat, or Lng changes
  const autoAstro = calculateVedicAstrologyFromBirth(
    formData.dob,
    formData.tob || '09:30',
    formData.lat ?? 28.6139,
    formData.lng ?? 77.2090
  );

  const partnerAutoAstro = calculateVedicAstrologyFromBirth(
    formData.partnerDob || '1990-11-24',
    formData.partnerTob || '14:20',
    formData.partnerLat ?? 19.0760,
    formData.partnerLng ?? 72.8777
  );

  if (!isOpen) return null;

  const currentMulank = calculateMulank(formData.dob);
  const currentBhagyank = calculateBhagyank(formData.dob);
  const mulankPlanet = PLANETARY_PROFILES[currentMulank];
  const bhagyankPlanet = PLANETARY_PROFILES[currentBhagyank];

  const nameCheck = analyzeName(formData.name, currentMulank, currentBhagyank);
  const mobileCheck = analyzeMobileNumber(formData.mobile || '', currentMulank, currentBhagyank);

  const isFemaleClient = formData.gender === 'female';
  const partnerRoleLabel = isFemaleClient ? 'Groom' : 'Bride';
  const clientRoleLabel = isFemaleClient ? 'Bride (Female)' : 'Groom (Male)';

  const handleGenderChange = (nextGender: 'male' | 'female') => {
    const nextIsFemale = nextGender === 'female';
    const currentPartner = (formData.partnerName || '').trim();
    const updatedPartnerName = nextIsFemale
      ? !currentPartner || currentPartner.toLowerCase() === 'priyanka sharma'
        ? 'Rohit Sharma'
        : currentPartner
      : !currentPartner || currentPartner.toLowerCase() === 'rohit sharma'
      ? 'Priyanka Sharma'
      : currentPartner;
    const updatedPartnerDob = nextIsFemale
      ? !formData.partnerDob || formData.partnerDob === '1990-11-24'
        ? '1988-06-15'
        : formData.partnerDob
      : !formData.partnerDob || formData.partnerDob === '1988-06-15'
      ? '1990-11-24'
      : formData.partnerDob;

    setFormData({
      ...formData,
      gender: nextGender,
      partnerName: updatedPartnerName,
      partnerDob: updatedPartnerDob,
      partnerTob:
        formData.partnerTob === '14:20' && nextIsFemale
          ? '10:30'
          : formData.partnerTob === '10:30' && !nextIsFemale
          ? '14:20'
          : formData.partnerTob || (nextIsFemale ? '10:30' : '14:20'),
    });
  };

  const toggleHealthConcern = (id: string) => {
    const list = formData.healthConcerns || [];
    const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
    setFormData({ ...formData, healthConcerns: next });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      gender: formData.gender || 'male',
      includePartnerMilan: Boolean(formData.includePartnerMilan),
      healthConcerns: formData.healthConcerns || [],
      pob: cityQuery,
      rashi: autoAstro.rashi,
      sunSign: autoAstro.sunSign,
      nakshatra: autoAstro.nakshatra,
      nakshatraPada: autoAstro.pada,
      partnerName: (
        formData.partnerName || (isFemaleClient ? 'Rohit Sharma' : 'Priyanka Sharma')
      ).trim(),
      partnerDob: formData.partnerDob || (isFemaleClient ? '1988-06-15' : '1990-11-24'),
      partnerTob: formData.partnerTob || (isFemaleClient ? '10:30' : '14:20'),
      partnerPob: partnerCityQuery || 'Mumbai, Maharashtra, India',
      partnerLat: formData.partnerLat ?? 19.0760,
      partnerLng: formData.partnerLng ?? 72.8777,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-amber-950/50 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-100">
              Edit & Save Profile, Health Concerns &amp; Partner Milan Options
            </h2>
            <p className="text-xs text-amber-300/70">
              Changes made here are immediately saved to your report and synced into the personalized A4 PDF, Yoga &amp; Pranayama module, and Partner Milan chart.
            </p>
          </div>
        </div>

        {/* Live Numerology + Automatic Astrology Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/90 border border-amber-500/20 mb-4">
          <div className="text-center p-2 rounded-lg bg-amber-950/20 border border-amber-500/10">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">Mulank (Root)</span>
            <span className="text-xl font-black font-mono text-amber-200">{currentMulank}</span>
            <span className="text-[10px] text-amber-300/80 block">{mulankPlanet?.planet}</span>
          </div>

          <div className="text-center p-2 rounded-lg bg-amber-950/20 border border-amber-500/10">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">Bhagyank (Destiny)</span>
            <span className="text-xl font-black font-mono text-amber-200">{currentBhagyank}</span>
            <span className="text-[10px] text-amber-300/80 block">{bhagyankPlanet?.planet}</span>
          </div>

          <div className="text-center p-2 rounded-lg bg-amber-950/20 border border-amber-500/10">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">Namank (Name)</span>
            <span className="text-xl font-black font-mono text-amber-200">{nameCheck.chaldeanSingle}</span>
            <span className="text-[10px] text-amber-300/80 block">Comp {nameCheck.totalChaldeanCompound}</span>
          </div>

          <div className="text-center p-2 rounded-lg bg-amber-950/20 border border-amber-500/10">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">Mobile Vibe</span>
            <span className="text-xl font-black font-mono text-amber-200">{mobileCheck.singleDigit}</span>
            <span className="text-[10px] text-amber-300/80 block">Score {mobileCheck.overallScore}%</span>
          </div>
        </div>

        {/* Auto-Calculated Vedic Astrology Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/40 border border-amber-500/30 mb-5">
          <div className="flex items-center gap-2.5 px-2">
            <Moon className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Auto Moon Sign (Rashi)</span>
              <span className="text-xs font-bold text-amber-100">{autoAstro.rashi}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2">
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Auto Sun Sign (Surya)</span>
              <span className="text-xs font-bold text-amber-100">{autoAstro.sunSign}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2">
            <Star className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Auto Nakshatra & Pada</span>
              <span className="text-xs font-bold text-amber-100">
                {autoAstro.nakshatra} (Pada {autoAstro.pada}) • {autoAstro.nakshatraLord}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECTION 1: Primary Client Details */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/25 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                1. Primary Client ({clientRoleLabel} in Partner Milan) Birth &amp; Contact Details
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 font-bold">
                {isFemaleClient
                  ? 'Female Profile ➔ Automatically Shown in Bride'
                  : 'Male Profile ➔ Automatically Shown in Groom'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-7">
                <label className="block text-xs font-medium text-amber-200/90 mb-1">
                  Full Real Name (English) — Shown in {isFemaleClient ? 'Bride' : 'Groom'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-400/60 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl pl-9 pr-3 py-2 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Deepak Jain"
                  />
                </div>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-amber-200/90 mb-1">
                  Gender (Auto-Maps to Groom / Bride) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      !isFemaleClient
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 text-amber-200 border-amber-500/30 hover:border-amber-400'
                    }`}
                  >
                    ♂ Male (Groom)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isFemaleClient
                        ? 'bg-pink-500 text-slate-950 border-pink-400 shadow-md'
                        : 'bg-slate-950 text-pink-200 border-pink-500/30 hover:border-pink-400'
                    }`}
                  >
                    ♀ Female (Bride)
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-amber-400/60 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl pl-9 pr-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">
                  Time of Birth (AM / PM) — {formatTime12HourAmPm(formData.tob || '09:30')}
                </label>
                <BirthTimeAmPmInput
                  value={formData.tob || '09:30'}
                  onChange={(newTob) => setFormData({ ...formData, tob: newTob })}
                />
              </div>
            </div>

            {/* Searchable City & Country with Auto Lat/Long (Triggers on 1st 3 Letters) */}
            <div className="relative">
              <label className="block text-xs font-medium text-amber-200/90 mb-1">
                Birth Place City, State & Country (Type 1st 3 Letters for Exact Lat/Lng)
              </label>
              <CityAutocompleteInput
                value={cityQuery}
                lat={formData.lat ?? 28.6139}
                lng={formData.lng ?? 77.2090}
                onChangeText={(txt) => setCityQuery(txt)}
                onSelectCity={(res) => {
                  setCityQuery(res.formattedPob);
                  const updatedAstro = calculateVedicAstrologyFromBirth(
                    formData.dob,
                    formData.tob || '09:30',
                    res.lat,
                    res.lng
                  );
                  setFormData({
                    ...formData,
                    pob: res.formattedPob,
                    lat: res.lat,
                    lng: res.lng,
                    rashi: updatedAstro.rashi,
                    sunSign: updatedAstro.sunSign,
                    nakshatra: updatedAstro.nakshatra,
                    nakshatraPada: updatedAstro.pada,
                  });
                }}
                placeholder="Type first 3 letters of Birth City (e.g. Del, Mum, Jai, Ujj, Lon)..."
                inputClassName="w-full bg-slate-950 border border-amber-500/30 rounded-xl pl-9 pr-8 py-2 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Latitude & Longitude Display / Manual Override */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-amber-300/80 mb-1">
                  Latitude (°N/S)
                </label>
                <div className="relative">
                  <Compass className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat ?? 28.6139}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-amber-500/25 rounded-xl pl-8 pr-2 py-1.5 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-amber-300/80 mb-1">
                  Longitude (°E/W)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng ?? 77.2090}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-amber-500/25 rounded-xl pl-8 pr-2 py-1.5 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-medium text-amber-300/80 mb-1">
                  Primary Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-950 border border-amber-500/25 rounded-xl pl-8 pr-2 py-1.5 text-xs font-mono text-amber-100 focus:outline-none focus:border-amber-400"
                    placeholder="9811234567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Current Health Concerns for Yoga & Pranayama Module */}
          <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>2. Current Health Concerns (For Daily Vedic Yoga &amp; Pranayama Module)</span>
              </div>
              <span className="text-[10px] text-emerald-200/80 font-mono">
                {(formData.healthConcerns || []).length} Selected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEALTH_CONCERN_OPTIONS.map((opt) => {
                const checked = (formData.healthConcerns || []).includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                      checked
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-100'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-emerald-500/35'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleHealthConcern(opt.id)}
                      className="mt-0.5 w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                    <div>
                      <div className="font-bold leading-snug">{opt.label}</div>
                      <div className="text-[10px] text-emerald-300/80">{opt.hindiLabel}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Partner Milan Opt-In Checkbox & Life Partner Details */}
          <div className="p-4 rounded-xl bg-pink-950/15 border border-pink-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-500/20 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-pink-400" />
                  <span>3. Partner Milan Opt-In Checkbox &amp; {partnerRoleLabel} Details</span>
                </div>
                <p className="text-[11px] text-pink-200/75 mt-0.5">
                  Partner Milan is active ONLY when checked below. Leave unchecked for clients who do not need Partner Milan.
                </p>
              </div>

              <label className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-pink-400/50 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={Boolean(formData.includePartnerMilan)}
                  onChange={(e) =>
                    setFormData({ ...formData, includePartnerMilan: e.target.checked })
                  }
                  className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
                <span className="text-xs font-extrabold text-pink-200">
                  {formData.includePartnerMilan
                    ? '✓ Partner Milan ACTIVE for Client'
                    : 'Enable Partner Milan for Client'}
                </span>
              </label>
            </div>

            {formData.includePartnerMilan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] text-pink-200/90 font-mono bg-slate-950/70 px-3 py-1.5 rounded-lg border border-pink-500/20">
                  <span>{partnerRoleLabel} Auto Ephemeris:</span>
                  <span>
                    Rashi: <strong>{partnerAutoAstro.rashi}</strong> • Nakshatra:{' '}
                    <strong>
                      {partnerAutoAstro.nakshatra} (Pada {partnerAutoAstro.pada})
                    </strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-pink-200/90 mb-1">
                    {partnerRoleLabel} / Partner Full Name (English)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-pink-400/60 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formData.partnerName || ''}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                      className="w-full bg-slate-950 border border-pink-500/30 rounded-xl pl-9 pr-3 py-2 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-pink-400"
                      placeholder={isFemaleClient ? 'e.g. Rohit Sharma' : 'e.g. Priyanka Sharma'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-pink-200/90 mb-1">
                      {partnerRoleLabel} / Partner Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-pink-400/60 absolute left-3 top-3" />
                      <input
                        type="date"
                        value={formData.partnerDob || (isFemaleClient ? '1988-06-15' : '1990-11-24')}
                        onChange={(e) => setFormData({ ...formData, partnerDob: e.target.value })}
                        className="w-full bg-slate-950 border border-pink-500/30 rounded-xl pl-9 pr-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-pink-200/90 mb-1">
                      {partnerRoleLabel} / Partner Birth Time (AM / PM) — {formatTime12HourAmPm(formData.partnerTob || (isFemaleClient ? '10:30' : '14:20'))}
                    </label>
                    <BirthTimeAmPmInput
                      value={formData.partnerTob || (isFemaleClient ? '10:30' : '14:20')}
                      onChange={(newTob) => setFormData({ ...formData, partnerTob: newTob })}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-pink-200/90 mb-1">
                    {partnerRoleLabel} / Partner Birth City, State &amp; Country (Type 1st 3 Letters)
                  </label>
                  <CityAutocompleteInput
                    value={partnerCityQuery}
                    lat={formData.partnerLat ?? 19.0760}
                    lng={formData.partnerLng ?? 72.8777}
                    onChangeText={(txt) => setPartnerCityQuery(txt)}
                    onSelectCity={(res) => {
                      setPartnerCityQuery(res.formattedPob);
                      setFormData({
                        ...formData,
                        partnerPob: res.formattedPob,
                        partnerLat: res.lat,
                        partnerLng: res.lng,
                      });
                    }}
                    placeholder={`Type first 3 letters of ${partnerRoleLabel}'s Birth City (e.g. Mum, Del, Jai, Pun)...`}
                    inputClassName="w-full bg-slate-950 border border-pink-500/30 rounded-xl pl-9 pr-8 py-2 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Partner Milan is currently <strong>OFF / Inactive</strong> for {formData.name || 'this client'}. Check the box above if this client wants Partner Milan &amp; 7-Chakra compatibility.
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile &amp; Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


