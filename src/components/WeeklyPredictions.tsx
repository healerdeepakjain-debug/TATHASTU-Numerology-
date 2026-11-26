import React, { useState, useEffect } from 'react';
import {
  Compass,
  Briefcase,
  Heart,
  Activity,
  Star,
  Sun,
  Bell,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  reduceToSingleDigit,
  getDailyPanchang,
} from '../utils/numerology';
import {
  getAutoPushConfig,
  saveAutoPushConfig,
  requestNotificationPermission,
  sendBrowserNotification,
  checkAndDispatchDailyAutoForecast,
  detectDevicePlatform,
  AutoDailyPushConfig,
} from '../utils/notifications';

interface WeeklyPredictionsProps {
  profile: BirthProfile;
}

export const WeeklyPredictions: React.FC<WeeklyPredictionsProps> = ({ profile }) => {
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const mulankData = PLANETARY_PROFILES[mulank];

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [pushConfig, setPushConfig] = useState<AutoDailyPushConfig>(getAutoPushConfig);
  const [pushStatusToast, setPushStatusToast] = useState<string | null>(null);
  const detectedPlatform = detectDevicePlatform();

  // Generate 7 upcoming days predictions (Index 0 = Today's Daily Forecast)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayPanchang = getDailyPanchang(today, mulank, bhagyank);

  const weeklyForecast = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(today.getTime() + idx * 86400000);
    const dayName = daysOfWeek[d.getDay()];
    const dateNum = d.getDate();
    const monthName = d.toLocaleDateString(undefined, { month: 'short' });

    // Personal day number vibration
    const universalDay = reduceToSingleDigit(dateNum + (d.getMonth() + 1) + reduceToSingleDigit(d.getFullYear()));
    const personalDay = reduceToSingleDigit(universalDay + mulank + bhagyank);
    const dayPlanet = PLANETARY_PROFILES[personalDay];

    // Compute scores
    const isFriendly = mulankData?.friendlyNumbers.includes(personalDay) || personalDay === mulank;
    const baseScore = isFriendly ? 88 : personalDay === 8 || personalDay === 4 ? 62 : 75;

    const careerScore = Math.min(98, baseScore + (idx % 3) * 4);
    const loveScore = Math.min(95, baseScore + ((idx + 1) % 4) * 3);
    const healthScore = Math.min(92, baseScore + ((idx + 2) % 3) * 2);
    const decisionIndex = Math.round((careerScore + loveScore + healthScore) / 3);

    return {
      index: idx,
      dateString: `${dayName}, ${monthName} ${dateNum}`,
      shortDate: `${monthName} ${dateNum}`,
      dayName,
      personalDay,
      dayPlanet: dayPlanet?.planet || 'Sun',
      decisionIndex,
      careerScore,
      loveScore,
      healthScore,
      luckyHours: `${(8 + (idx * 2) % 6).toString().padStart(2, '0')}:30 - ${(10 + (idx * 2) % 6).toString().padStart(2, '0')}:30`,
      luckyColor: dayPlanet?.luckyColor.split(',')[0] || 'Gold',
      luckyNumbers: [personalDay, mulank, bhagyank],
      mantra: dayPlanet?.beejMantra || 'Om Namah Shivaya',
      careerAdvice:
        personalDay === 1 || personalDay === 5
          ? 'Exceptional day for executive negotiations, pitch meetings, and closing high-value commercial deals.'
          : personalDay === 3
          ? 'Wisdom flows freely. Superb for consulting, teaching, legal review, and long-term strategic planning.'
          : personalDay === 6
          ? 'Diplomacy and luxury flourish. Good for marketing, creative arts, and client hospitality.'
          : 'Focus on systematic completion of pending backlog; avoid starting risky speculative ventures.',
      loveAdvice:
        personalDay === 6 || personalDay === 2
          ? 'Deep emotional warmth and romance. Ideal for celebrating milestones with your partner.'
          : personalDay === 3 || personalDay === 9
          ? 'Generous and passionate communication. Express appreciation openly to strengthen domestic harmony.'
          : 'Calm, steady companionship. Give each other space for personal spiritual reflections.',
      vitalityAdvice:
        healthScore >= 80
          ? 'High pranic vitality. Engage in outdoor exercise and deep yogic pranayama.'
          : 'Pace your physical exertion; stay well-hydrated and favor light warm Ayurvedic meals.',
    };
  });

  const todayForecast = weeklyForecast[0];
  const peakDay = [...weeklyForecast].sort((a, b) => b.decisionIndex - a.decisionIndex)[0];
  const activeForecast = weeklyForecast[selectedDayIndex];

  // Automatically check and dispatch daily forecast push notification once per day
  useEffect(() => {
    if (pushConfig.enabled && 'Notification' in window && Notification.permission === 'granted') {
      const sent = checkAndDispatchDailyAutoForecast(
        profile.name,
        todayForecast.personalDay,
        todayForecast.dayPlanet,
        todayForecast.decisionIndex,
        todayForecast.luckyHours,
        todayForecast.luckyColor,
        todayForecast.mantra
      );
      if (sent) {
        setPushConfig(getAutoPushConfig());
      }
    }
  }, [
    pushConfig.enabled,
    profile.name,
    todayForecast.personalDay,
    todayForecast.dayPlanet,
    todayForecast.decisionIndex,
    todayForecast.luckyHours,
    todayForecast.luckyColor,
    todayForecast.mantra,
  ]);

  const handleToggleAutoDailyPush = async () => {
    const granted = await requestNotificationPermission();
    const nextConfig: AutoDailyPushConfig = {
      ...pushConfig,
      enabled: !pushConfig.enabled,
    };
    setPushConfig(nextConfig);
    saveAutoPushConfig(nextConfig);

    if (nextConfig.enabled && granted) {
      sendBrowserNotification(`🕉️ Daily & Weekly Auto-Forecast Push Enabled`, {
        body: `Namaste ${profile.name}! You will receive automatic daily forecasts at ${nextConfig.preferredTime} on Android, iOS, Windows, Desktop & Tablet. Today's Index: ${todayForecast.decisionIndex}%.`,
      });
      setPushStatusToast(
        `Automatic daily forecast push notifications enabled for ${nextConfig.preferredTime} across Android, iOS, Windows, Desktop & Tablet!`
      );
    } else if (nextConfig.enabled && !granted) {
      setPushStatusToast(
        `Daily forecast schedule saved (${nextConfig.preferredTime}). Allow browser notification permission to receive native OS alerts.`
      );
    } else {
      setPushStatusToast(`Automatic daily push notifications paused.`);
    }
    setTimeout(() => setPushStatusToast(null), 4500);
  };

  const handleSendInstantDailyPush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendBrowserNotification(
        `🕉️ Today's Vedic Forecast: ${todayForecast.dateString} (${todayForecast.decisionIndex}%)`,
        {
          body: `${profile.name}: Personal Day ${todayForecast.personalDay} (${todayForecast.dayPlanet}) • Lucky Numbers: ${todayPanchang.luckyNumbers.join(', ')} • Best Window: ${todayForecast.luckyHours} • Colour: ${todayForecast.luckyColor}`,
        }
      );
      setPushStatusToast(
        `Instant Daily + Weekly Forecast Push dispatched to your ${detectedPlatform}!`
      );
    } else {
      setPushStatusToast(
        `In-app Daily Forecast Dispatched: Personal Day ${todayForecast.personalDay} (${todayForecast.dayPlanet}) • ${todayForecast.decisionIndex}% Success Index!`
      );
    }
    setTimeout(() => setPushStatusToast(null), 4500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily & 7-Day Cosmic Decision Compass • Cross-Device Push Alerts</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Daily & Weekly Astrological & Numerological Forecast
            </h1>
            <p className="text-sm text-amber-200/70 max-w-2xl">
              Real-time Daily Panchang & Numerological Forecast paired with your 7-Day Weekly Cosmic Compass and automated daily push notifications for Android, iOS, Windows, Desktop, and Tablet.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-center shrink-0">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">Peak Power Day This Week</span>
            <span className="text-lg font-bold font-serif text-amber-100 block">
              {peakDay.dateString}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              {peakDay.decisionIndex}% Decision Index
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Device Automated Daily Push Notification Hub (Android / iOS / Windows / Desktop / Tablet) */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/15 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              <Bell className="w-3 h-3 text-emerald-400" />
              <span>Automated Daily Push Delivery</span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-100">
              Daily & Weekly Forecast Push Notification Center
            </h2>
            <p className="text-xs text-slate-300">
              Automatically dispatches your personalized Daily Forecast, Lucky Numbers ({todayPanchang.luckyNumbers.join(', ')}), Auspicious Hora ({todayPanchang.currentHora}), and Weekly Peak Reminder every morning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Daily Time:</span>
              <input
                type="time"
                value={pushConfig.preferredTime}
                onChange={(e) => {
                  const updated = { ...pushConfig, preferredTime: e.target.value };
                  setPushConfig(updated);
                  saveAutoPushConfig(updated);
                }}
                className="bg-transparent text-amber-200 font-mono font-bold focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleToggleAutoDailyPush}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                pushConfig.enabled
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400'
                  : 'bg-slate-950 text-slate-300 border-amber-500/30 hover:border-amber-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{pushConfig.enabled ? 'Auto Daily Push: ON' : 'Enable Auto Daily Push'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendInstantDailyPush}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Today's Forecast Push Now</span>
            </button>
          </div>
        </div>

        {pushStatusToast && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{pushStatusToast}</span>
          </div>
        )}
      </div>

      {/* Prominent Today's Personalized Daily Forecast Card */}
      <div className="bg-gradient-to-br from-amber-950/35 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Today's Personalized Daily Forecast ({todayForecast.dateString})</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-amber-100 mt-0.5">
              Personal Day Number {todayForecast.personalDay} ({todayForecast.dayPlanet}) • Hora: {todayPanchang.currentHora} • Choghadiya: {todayPanchang.currentChoghadiya.name}
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/30">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Today's Success Score</span>
              <span className="text-xl font-black font-mono text-emerald-400">{todayForecast.decisionIndex}%</span>
            </div>
            <div className="border-l border-amber-500/20 pl-3">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Today's Lucky Numbers</span>
              <span className="text-sm font-black font-mono text-amber-200">
                {todayPanchang.luckyNumbers.join(', ')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20">
            <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Auspicious Power Window</span>
            <span className="text-sm font-mono font-bold text-emerald-300">{todayForecast.luckyHours}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Current Hora: {todayPanchang.currentHora}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20">
            <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Rahu Kaal (Avoid)</span>
            <span className="text-sm font-mono font-bold text-rose-300">
              {todayPanchang.rahuKaalWindow.start} - {todayPanchang.rahuKaalWindow.end}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Pause new contracts in this window</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20">
            <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Lucky Colour & Direction</span>
            <span className="text-sm font-bold text-amber-100">{todayForecast.luckyColor}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Choghadiya: {todayPanchang.currentChoghadiya.name}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20">
            <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Today's Siddhi Mantra</span>
            <span className="text-xs font-serif font-bold text-amber-200">{todayForecast.mantra}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Chant 27 or 108 times</span>
          </div>
        </div>
      </div>

      {/* 7-Day Weekly Interactive Bar / Trend Visualizer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>7-Day Weekly Forecast Explorer (Click Any Day to Inspect)</span>
          </h3>
          <span className="text-xs text-amber-300/70">Day 1 = Today's Forecast</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weeklyForecast.map((day) => {
            const isSelected = selectedDayIndex === day.index;
            const isPeak = day.index === peakDay.index;
            return (
              <button
                key={day.index}
                onClick={() => setSelectedDayIndex(day.index)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 border-amber-500/20 hover:border-amber-400/40 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>{day.index === 0 ? 'TODAY' : day.shortDate}</span>
                    {isPeak && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  </div>
                  <span className="text-sm font-bold text-amber-100 block">{day.dayName.slice(0, 3)}</span>
                  <span className="text-[10px] text-amber-400/80 font-mono block mt-0.5">
                    Vibe {day.personalDay} ({day.dayPlanet.slice(0, 4)})
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-500/10">
                  <span
                    className={`text-lg font-black font-mono ${
                      day.decisionIndex >= 85
                        ? 'text-emerald-400'
                        : day.decisionIndex >= 70
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.decisionIndex}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Deep Dive */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-amber-100">
                {activeForecast.index === 0 ? `Today (${activeForecast.dateString})` : activeForecast.dateString}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                Personal Vibration {activeForecast.personalDay} • {activeForecast.dayPlanet}
              </span>
            </div>
            <p className="text-xs text-amber-300/70 mt-0.5">
              Best Power Window: <strong className="text-amber-200">{activeForecast.luckyHours}</strong> • Favorable Hue: <strong className="text-amber-200">{activeForecast.luckyColor}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Overall Success Index</span>
              <span className="text-2xl font-black font-mono text-amber-300">
                {activeForecast.decisionIndex}%
              </span>
            </div>
          </div>
        </div>

        {/* 3 Dimension Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Career & Wealth */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Career & Commerce</span>
                </span>
                <span className="text-sm font-black font-mono text-amber-200">
                  {activeForecast.careerScore}%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeForecast.careerAdvice}
              </p>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${activeForecast.careerScore}%` }} />
            </div>
          </div>

          {/* Love & Harmony */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Love & Family Bond</span>
                </span>
                <span className="text-sm font-black font-mono text-rose-300">
                  {activeForecast.loveScore}%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeForecast.loveAdvice}
              </p>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-400 h-full" style={{ width: `${activeForecast.loveScore}%` }} />
            </div>
          </div>

          {/* Health & Vitality */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Vitality & Prana</span>
                </span>
                <span className="text-sm font-black font-mono text-emerald-300">
                  {activeForecast.healthScore}%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeForecast.vitalityAdvice}
              </p>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${activeForecast.healthScore}%` }} />
            </div>
          </div>
        </div>

        {/* Daily Affirmation Mantra */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🪷</span>
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold block">
                Daily Invocation Mantra
              </span>
              <span className="text-xs font-bold text-amber-100 font-serif">
                "{activeForecast.mantra}"
              </span>
            </div>
          </div>
          <span className="text-xs text-amber-300/60 hidden sm:inline">
            Chant 11 or 108 times for sovereign balance
          </span>
        </div>
      </div>
    </div>
  );
};

