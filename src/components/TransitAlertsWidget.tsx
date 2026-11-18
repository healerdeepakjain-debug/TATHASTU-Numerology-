import React, { useMemo, useState } from 'react';
import {
  Bell,
  Compass,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Orbit,
} from 'lucide-react';
import { BirthProfile } from '../types';
import { computeLiveTransitAlerts } from '../utils/transitAlerts';
import {
  requestNotificationPermission,
  sendBrowserNotification,
} from '../utils/notifications';

interface TransitAlertsWidgetProps {
  profile: BirthProfile;
  onOpenFullTransits: () => void;
}

export const TransitAlertsWidget: React.FC<TransitAlertsWidgetProps> = ({
  profile,
  onOpenFullTransits,
}) => {
  const snapshot = useMemo(() => computeLiveTransitAlerts(profile, new Date()), [profile]);
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  const handleEnableTransitPush = async () => {
    const granted = await requestNotificationPermission();
    const topAlert = snapshot.alerts[0];
    if (granted && topAlert) {
      sendBrowserNotification(
        `🕉️ Transit Alert for ${profile.name} (${snapshot.natalRashi.split(' ')[0]})`,
        {
          body: `${topAlert.alertTitle} • Live Moon in ${snapshot.liveMoonRashi.split(' ')[0]} (${snapshot.liveMoonNakshatra}) • ${topAlert.recommendedAction}`,
        }
      );
      setAlertFeedback('Live Transit Alert sent & active for your zodiac/birth chart!');
    } else {
      setAlertFeedback(
        'Personalized Transit Alerts active right here on your Dashboard (enable browser notifications to receive push alerts).'
      );
    }
    setTimeout(() => setAlertFeedback(null), 5000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/35 to-slate-950 border-2 border-amber-500/35 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
            <Orbit className="w-3.5 h-3.5 text-amber-400" />
            <span>Transit Alerts • Live Lahiri Sidereal Planetary Positions</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
            Live Gochar Transit Alerts &amp; Personalized Auspicious Windows
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Automatically pulls current planetary positions (Sun in{' '}
            <strong className="text-amber-200">{snapshot.liveSunRashi} {snapshot.liveSunDegInSign}</strong>, Moon in{' '}
            <strong className="text-emerald-300">
              {snapshot.liveMoonRashi} • {snapshot.liveMoonNakshatra} {snapshot.liveMoonDegInSign}
            </strong>
            ) and alerts <strong className="text-amber-200">{profile.name}</strong> about auspicious windows calibrated to{' '}
            <strong className="text-sky-300">
              {snapshot.natalRashi} • {snapshot.natalNakshatra} (Pada {snapshot.natalPada}) • Mulank {snapshot.natalMulank} / Bhagyank {snapshot.natalBhagyank}
            </strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleEnableTransitPush}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
          >
            <Bell className="w-4 h-4" />
            <span>Push Transit Alert</span>
          </button>

          <button
            type="button"
            onClick={onOpenFullTransits}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-500/40 font-bold text-xs cursor-pointer transition-all"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>All 12M Transits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {alertFeedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{alertFeedback}</span>
        </div>
      )}

      {/* Live Ephemeris Strip & Today's Top Auspicious Windows */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/25">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">
            Current Sidereal Sun (Surya)
          </span>
          <div className="text-sm font-serif font-bold text-amber-100 mt-0.5">
            {snapshot.liveSunRashi}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Degree: {snapshot.liveSunDegInSign} • Ayanamsa {snapshot.ayanamsaDeg}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">
            Current Sidereal Moon (Chandra)
          </span>
          <div className="text-sm font-serif font-bold text-emerald-200 mt-0.5">
            {snapshot.liveMoonRashi}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {snapshot.liveMoonNakshatra} • House {snapshot.moonTransitHouseFromNatal} from Birth
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-sky-500/30 md:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Today’s Auspicious Windows ({snapshot.computedAtLabel})</span>
            </span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
              Peak {snapshot.peakFavorabilityScore}%
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {snapshot.auspiciousWindowsToday.map((win, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/25 text-[11px] font-mono text-amber-200"
              >
                {win}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Transit Alert Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {snapshot.alerts.map((alert) => {
          const badgeStyle =
            alert.status === 'auspicious'
              ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
              : alert.status === 'spiritual'
              ? 'bg-amber-500/15 border-amber-400/50 text-amber-300'
              : 'bg-rose-500/15 border-rose-400/50 text-rose-300';

          const cardBorder =
            alert.status === 'auspicious'
              ? 'border-emerald-500/35'
              : alert.status === 'spiritual'
              ? 'border-amber-500/35'
              : 'border-rose-500/40';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl bg-slate-950/90 border ${cardBorder} space-y-2.5`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {alert.status === 'caution' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-mono font-bold uppercase text-amber-300">
                    {alert.planet}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${badgeStyle}`}>
                  {alert.favorabilityScore}% Alignment • {alert.windowLabel}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                  {alert.alertTitle}
                </h3>
                <span className="text-[11px] font-mono text-sky-300 block">
                  {alert.houseOrAspectLabel}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {alert.zodiacAlignmentSummary}
              </p>

              <div className="p-2.5 rounded-xl bg-amber-950/25 border border-amber-500/25 text-[11px] text-amber-100 leading-relaxed">
                <strong className="text-amber-300 uppercase">Window Guidance:</strong>{' '}
                {alert.recommendedAction}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
