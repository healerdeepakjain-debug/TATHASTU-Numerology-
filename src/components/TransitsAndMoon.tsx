import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Send,
  Calendar,
  Layers,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  CELESTIAL_TRANSITS,
  UPCOMING_MOON_PHASES,
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
} from '../utils/numerology';
import {
  requestNotificationPermission,
  sendBrowserNotification,
} from '../utils/notifications';
import { calculateVedicAstrologyFromBirth } from '../utils/astrologyAndCities';
import { generate12MonthLunarAndAstroForecast } from '../utils/pdfReportGenerator';
import { useTathastu } from '../utils/tathastuStore';

interface TransitsAndMoonProps {
  profile: BirthProfile;
}

export const TransitsAndMoon: React.FC<TransitsAndMoonProps> = ({ profile }) => {
  const { activeProfile } = useTathastu();
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const astro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.209
  );
  const registrationIso =
    activeProfile?.createdAtIso &&
    !activeProfile.createdAtIso.startsWith('2026-01-03') &&
    !activeProfile.createdAtIso.startsWith('2026-01-05')
      ? activeProfile.createdAtIso
      : new Date().toISOString();
  const lunar12Months = generate12MonthLunarAndAstroForecast(
    registrationIso,
    astro.rashi,
    astro.nakshatra,
    mulank,
    bhagyank
  );

  const [notificationGranted, setNotificationGranted] = useState(false);
  const [transitAlerts, setTransitAlerts] = useState(true);
  const [moonAlerts, setMoonAlerts] = useState(true);
  const [dailyLuckyAlerts, setDailyLuckyAlerts] = useState(true);
  const [rahuAlerts, setRahuAlerts] = useState(true);
  const [testNotificationToast, setTestNotificationToast] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationGranted(true);
    }
  }, []);

  const handleEnablePermissions = async () => {
    const granted = await requestNotificationPermission();
    setNotificationGranted(granted);
    if (granted) {
      setTestNotificationToast('Push notification permissions activated!');
      sendBrowserNotification('🕉️ Vedic Transit Alerts Active', {
        body: `Namaste ${profile.name}! You will receive notifications for major transits and moon phases.`,
      });
    } else {
      setTestNotificationToast('Please enable notifications in your browser permissions.');
    }
    setTimeout(() => setTestNotificationToast(null), 3000);
  };

  const handleTriggerTestAlert = (title: string, body: string) => {
    const success = sendBrowserNotification(title, { body });
    if (!success) {
      setTestNotificationToast(`Alert Triggered: "${title} - ${body}"`);
    } else {
      setTestNotificationToast(`Browser push alert sent successfully!`);
    }
    setTimeout(() => setTestNotificationToast(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Celestial Transits & Lunar Phase Tracker</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Major Planetary Transits & Moon Phases
            </h1>
            <p className="text-sm text-amber-200/70 max-w-2xl">
              Track major Gochar shifts (Saturn Sade Sati cycle, Jupiter blessings, Rahu-Ketu nodal shifts) alongside Purnima & Amavasya lunar timings with automated alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEnablePermissions}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-lg ${
                notificationGranted
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{notificationGranted ? 'Push Alerts Enabled' : 'Enable Push Notifications'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Toast */}
      {testNotificationToast && (
        <div className="p-3 bg-amber-950/90 border border-amber-500 text-amber-100 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {testNotificationToast}
          </span>
        </div>
      )}

      {/* Push Notification Controls & Test Triggers */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Automated Alert Channels</span>
            </h2>
            <p className="text-xs text-amber-300/70">
              Toggle specific astrological triggers. Click "Test Alert" to simulate immediate browser push notifications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Daily Lucky Numbers */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-200">Daily Lucky Numbers</span>
                <input
                  type="checkbox"
                  checked={dailyLuckyAlerts}
                  onChange={(e) => setDailyLuckyAlerts(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Morning 07:00 AM dispatch of your lucky numbers and ruling Hora.
              </p>
            </div>
            <button
              onClick={() =>
                handleTriggerTestAlert(
                  '🕉️ Morning Vedic Dispatch',
                  `Namaste ${profile.name}! Your lucky numbers today are ${mulank}, ${bhagyank}, 5, 9. Current Hora: Sun.`
                )
              }
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/25 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Test Morning Alert</span>
            </button>
          </div>

          {/* Rahu Kaal Warning */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-200">Rahu Kaal Alert</span>
                <input
                  type="checkbox"
                  checked={rahuAlerts}
                  onChange={(e) => setRahuAlerts(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                15-minute prior warning before daily malefic period commences.
              </p>
            </div>
            <button
              onClick={() =>
                handleTriggerTestAlert(
                  '⚠️ Rahu Kaal Commencing',
                  'Inauspicious window begins in 15 minutes. Avoid signing contracts or starting major journeys.'
                )
              }
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/25 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Test Rahu Alert</span>
            </button>
          </div>

          {/* Moon Phase Reminders */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-200">Moon Phase (Tithi)</span>
                <input
                  type="checkbox"
                  checked={moonAlerts}
                  onChange={(e) => setMoonAlerts(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Reminders for Purnima (Full Moon) and Amavasya (New Moon) meditation.
              </p>
            </div>
            <button
              onClick={() =>
                handleTriggerTestAlert(
                  '🌕 Purnima Tithi Manifestation',
                  'Tonight is the Full Moon of Illumination. Excellent for water charging and moon meditation.'
                )
              }
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/25 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Test Moon Alert</span>
            </button>
          </div>

          {/* Major Transits */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-200">Planetary Ingress</span>
                <input
                  type="checkbox"
                  checked={transitAlerts}
                  onChange={(e) => setTransitAlerts(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Major Saturn, Jupiter, and Mercury retrograde entry notices.
              </p>
            </div>
            <button
              onClick={() =>
                handleTriggerTestAlert(
                  '🪐 Major Planetary Transit Alert',
                  'Saturn in Pisces & Jupiter ingress into Gemini active. Review your spiritual goals.'
                )
              }
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/25 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Test Transit Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Major Planetary Transits (Active & Upcoming with Exact Start & End Date/Time) */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>Major Planetary Transits (Exact Gochar Start & End Dates & Times)</span>
          </h2>
          <span className="text-xs font-mono text-amber-400/80">Sidereal Lahiri Ephemeris (IST)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CELESTIAL_TRANSITS.map((transit) => (
            <div
              key={transit.id}
              className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {transit.planet}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      transit.impactType === 'favorable'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : transit.impactType === 'caution'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                        : 'bg-amber-950 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {transit.sign}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-amber-100 mb-2">
                  {transit.transitName}
                </h3>

                {/* Exact Start & End Date + Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900 border border-amber-500/25 mb-3 text-xs font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-emerald-400 font-bold block">
                      Transit Starts (Date & Time):
                    </span>
                    <span className="text-amber-100 font-semibold">{transit.startDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-rose-400 font-bold block">
                      Transit Ends (Date & Time):
                    </span>
                    <span className="text-amber-100 font-semibold">{transit.endDate}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {transit.summary}
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/15 text-xs text-amber-200">
                  <strong className="text-amber-400 block mb-0.5">Vedic & Aura Scan Remedy:</strong>
                  {transit.recommendation}
                </div>
              </div>

              <div className="pt-2 border-t border-amber-500/10 text-[11px] text-slate-400 font-mono flex justify-between">
                <span>{transit.dateRange}</span>
                <span className="text-emerald-400 font-semibold">{transit.isCurrent ? '● Active Transit' : 'Upcoming'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Moon Phases (Lunar Celebrations & Tithis with Exact Start & End Timings) */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
          <Moon className="w-5 h-5 text-amber-400" />
          <span>Sacred Lunar Phases & Tithi Timings (Start & End IST)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {UPCOMING_MOON_PHASES.map((moon, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{moon.illumination === 100 ? '🌕' : moon.illumination === 0 ? '🌑' : '🌔'}</span>
                  <span className="text-xs font-mono text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    {moon.tithi}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-amber-100 mb-1">
                  {moon.name}
                </h3>

                <span className="text-[11px] text-amber-400 font-medium block mb-2">
                  {moon.paksha}
                </span>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/20 mb-2.5 text-[11px] font-mono space-y-1">
                  <div>
                    <span className="text-emerald-400 font-bold">Starts: </span>
                    <span className="text-amber-100">{moon.startTime}</span>
                  </div>
                  <div>
                    <span className="text-rose-400 font-bold">Ends: </span>
                    <span className="text-amber-100">{moon.endTime}</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-300/90 mb-3 font-medium">
                  {moon.auspiciousness}
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/15 text-xs text-slate-300">
                  <strong className="text-amber-300 block mb-0.5">Recommended Ritual:</strong>
                  {moon.recommendedRitual}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete 12-Month Shukla Purnima / Krishna Amavasya / Ekadashi Calendar from Registration Date + Parallel Astro Predictions & Remedies */}
      <div className="bg-slate-900/95 border-2 border-amber-500/35 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/25 pb-3">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-amber-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>
                12-Month Shukla Purnima, Krishna Amavasya & Ekadashi Moon Phases + Parallel Astro Predictions
              </span>
            </h2>
            <p className="text-xs text-emerald-300 mt-0.5">
              Calculated for 12 Consecutive Months from Registration Date for{' '}
              <strong>{profile.name}</strong> ({astro.rashi} • {astro.nakshatra})
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 font-mono text-xs font-bold self-start sm:self-auto">
            12-Month Complete Lunar & Gochar Ledger
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {lunar12Months.map((mp) => (
            <div
              key={mp.monthIndex}
              className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-1.5">
                  <span className="font-serif font-bold text-sm text-amber-200">
                    {mp.monthLabel} ({mp.periodRange})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-400/40 text-indigo-200 font-mono text-[11px]">
                    {mp.rulingPlanet}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30">
                    <div className="text-amber-300 font-bold">🌕 Shukla Purnima:</div>
                    <div className="text-amber-100">{mp.shuklaPurnima}</div>
                    <div className="text-rose-300 font-bold mt-1">🌑 Krishna Amavasya:</div>
                    <div className="text-amber-100">{mp.krishnaAmavasya}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <div className="text-emerald-300 font-bold">✨ Shukla Ekadashi:</div>
                    <div className="text-amber-100">{mp.shuklaEkadashi}</div>
                    <div className="text-sky-300 font-bold mt-1">🙏 Krishna Ekadashi:</div>
                    <div className="text-amber-100">{mp.krishnaEkadashi}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/25">
                    <strong className="text-amber-300 block mb-0.5 uppercase text-[10px] tracking-wider">
                      Vedic Astrology Prediction ({astro.rashi.split(' ')[0]}):
                    </strong>
                    <p className="text-slate-200 leading-relaxed">{mp.astrologicalPrediction}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/25 border border-emerald-500/35">
                    <strong className="text-emerald-300 block mb-0.5 uppercase text-[10px] tracking-wider">
                      Parallel Spiritual Remedy:
                    </strong>
                    <p className="text-emerald-100 leading-relaxed">{mp.parallelRemedy}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
