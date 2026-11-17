import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Sun,
  Clock,
  Sparkles,
  Volume2,
  Compass,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  getDailyPanchang,
  PLANETARY_PROFILES,
  reduceToSingleDigit,
} from '../utils/numerology';
import {
  useTathastu,
  SixDailyNotificationChannels,
  DEFAULT_SIX_NOTIFICATION_CHANNELS,
  TATHASTU_BRAND_NAME,
  TATHASTU_ADMIN_PHONE,
} from '../utils/tathastuStore';
import { requestNotificationPermission, sendBrowserNotification } from '../utils/notifications';

interface DailySixNotificationsCenterProps {
  profile: BirthProfile;
}

export const DailySixNotificationsCenter: React.FC<DailySixNotificationsCenterProps> = ({
  profile,
}) => {
  const {
    currentAccount,
    activeProfile,
    updateProfileNotificationSettings,
    canCurrentAccountDownloadOrShare,
    triggerAdminRestrictionPopup,
  } = useTathastu();

  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const mulankInfo = PLANETARY_PROFILES[mulank];
  const today = new Date();
  const panchang = getDailyPanchang(today, mulank, bhagyank);

  const universalDay = reduceToSingleDigit(
    today.getDate() + (today.getMonth() + 1) + reduceToSingleDigit(today.getFullYear())
  );
  const personalDay = reduceToSingleDigit(universalDay + mulank + bhagyank);
  const personalDayInfo = PLANETARY_PROFILES[personalDay];

  const initialChannels: SixDailyNotificationChannels = React.useMemo(() => {
    if (activeProfile?.notificationChannelsJson) {
      try {
        return {
          ...DEFAULT_SIX_NOTIFICATION_CHANNELS,
          ...JSON.parse(activeProfile.notificationChannelsJson),
        };
      } catch {
        // fallback
      }
    }
    return DEFAULT_SIX_NOTIFICATION_CHANNELS;
  }, [activeProfile?.notificationChannelsJson]);

  const [masterEnabled, setMasterEnabled] = useState<boolean>(
    activeProfile ? activeProfile.notificationsEnabled : true
  );
  const [channels, setChannels] = useState<SixDailyNotificationChannels>(initialChannels);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const goodWindows = panchang.choghadiyaPeriods.filter(
    (c) => c.quality === 'Excellent' || c.quality === 'Good' || c.quality === 'Gainful'
  );
  const badWindows = panchang.choghadiyaPeriods.filter(
    (c) => c.quality === 'Inauspicious' || c.quality === 'Loss/Avoid' || c.quality === 'Anxiety/Avoid'
  );

  const sixNotifications = [
    {
      key: 'goodTimeChoghadiya' as keyof SixDailyNotificationChannels,
      number: 1,
      title: '1. Auspicious Good Time (Shubh Choghadiya & Abhijit Muhurat) Alert',
      category: 'Good Time of the Day',
      icon: CheckCircle2,
      accent: 'emerald',
      message: `✅ GOOD TIME TODAY for ${profile.name}: Best Auspicious Windows are ${goodWindows
        .map((g) => `${g.name} (${g.startTime}-${g.endTime})`)
        .join(', ')}. Abhijit Siddha Window: 11:48 AM - 12:36 PM. Ideal for signing contracts, wealth transactions, and prayers.`,
    },
    {
      key: 'badTimeRahuCaution' as keyof SixDailyNotificationChannels,
      number: 2,
      title: '2. Inauspicious Bad Time (Rahu Kaal & Varjya Choghadiya) Caution Alert',
      category: 'Bad Time Caution',
      icon: ShieldAlert,
      accent: 'rose',
      message: `⚠️ BAD TIME CAUTION TODAY for ${profile.name}: Avoid new investments or risky travel during Rahu Kaal (${panchang.rahuKaalWindow.start} - ${panchang.rahuKaalWindow.end}) and Inauspicious Choghadiya windows: ${badWindows
        .map((b) => `${b.name} (${b.startTime}-${b.endTime})`)
        .join(', ')}.`,
    },
    {
      key: 'dailyLuckyNumbers' as keyof SixDailyNotificationChannels,
      number: 3,
      title: '3. Daily Lucky Numbers, Lucky Colour & Personal Vibration Alert',
      category: 'Morning Numerology',
      icon: Sparkles,
      accent: 'amber',
      message: `🔢 DAILY LUCKY VIBRATION for ${profile.name} (Mulank ${mulank}, Bhagyank ${bhagyank}): Today's Personal Day Number is ${personalDay} (${personalDayInfo?.planet}). Lucky Numbers Today: ${panchang.luckyNumbers.join(
        ', '
      )} • Favorable Colour: ${personalDayInfo?.luckyColor}.`,
    },
    {
      key: 'planetaryHoraTransit' as keyof SixDailyNotificationChannels,
      number: 4,
      title: '4. Live Planetary Hora & Gochar Transit Alert',
      category: 'Planetary Transit',
      icon: Sun,
      accent: 'sky',
      message: `🪐 PLANETARY HORA & GOCHAR for ${profile.name}: Current Ruling Hora is ${panchang.currentHora} • Active Choghadiya: ${panchang.currentChoghadiya.name} (${panchang.currentChoghadiya.quality}). Align your high-focus tasks with ${mulankInfo?.planet} and ${personalDayInfo?.planet} hours.`,
    },
    {
      key: 'dailyVedicMantra' as keyof SixDailyNotificationChannels,
      number: 5,
      title: '5. Daily Personalized Vedic Siddhi Mantra & 108 Japa Reminder',
      category: 'Sacred Mantra',
      icon: Volume2,
      accent: 'purple',
      message: `📿 DAILY VEDIC MANTRA for ${profile.name}: Chant "${personalDayInfo?.beejMantra}" and "${mulankInfo?.beejMantra}" 108 times today during Brahma Muhurat or Sandhya Kaal for protection and prosperity.`,
    },
    {
      key: 'dailyWeeklyForecast' as keyof SixDailyNotificationChannels,
      number: 6,
      title: '6. Daily & Weekly Cosmic Decision Forecast Summary',
      category: 'Daily Forecast',
      icon: Compass,
      accent: 'amber',
      message: `🌟 DAILY FORECAST SUMMARY for ${profile.name}: Today's Cosmic Harmony Score is ${panchang.auspiciousVibrationScore}%. Focus on ${personalDayInfo?.planet}-governed decisions and wear ${personalDayInfo?.luckyColor.split(',')[0]} for maximum success.`,
    },
  ];

  const handleToggleMaster = async () => {
    const next = !masterEnabled;
    setMasterEnabled(next);
    if (activeProfile) {
      await updateProfileNotificationSettings(activeProfile.id, next, channels);
    }
    if (next) {
      await requestNotificationPermission();
      setToastMsg(`Daily notifications turned ON for ${profile.name}!`);
    } else {
      setToastMsg(`Daily notifications paused for ${profile.name}. You can re-enable them anytime.`);
    }
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleSingleChannel = async (key: keyof SixDailyNotificationChannels) => {
    const updated = { ...channels, [key]: !channels[key] };
    setChannels(updated);
    if (activeProfile) {
      await updateProfileNotificationSettings(activeProfile.id, masterEnabled, updated);
    }
    setToastMsg(`Notification preference updated for ${profile.name}.`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleTriggerBrowserAlert = async (title: string, body: string) => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendBrowserNotification(`🕉️ ${title}`, { body });
    }
    setToastMsg(`${title} dispatched to device notification bar!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSendWhatsAppNotification = (title: string, messageBody: string) => {
    if (!canCurrentAccountDownloadOrShare()) {
      triggerAdminRestrictionPopup('Direct WhatsApp Notification');
      return;
    }
    const cleanPhone = (activeProfile?.mobile || profile.mobile || TATHASTU_ADMIN_PHONE)
      .replace(/\D/g, '')
      .slice(-10);
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : `91${TATHASTU_ADMIN_PHONE}`;
    const senderSignature =
      currentAccount?.role === 'healer'
        ? `${currentAccount.name} (${currentAccount.healerBrandName || TATHASTU_BRAND_NAME}) • +91 ${currentAccount.mobile}`
        : `${TATHASTU_BRAND_NAME} • +91 ${TATHASTU_ADMIN_PHONE}`;

    const text = encodeURIComponent(
      `🕉️ *${senderSignature}*\n*${title}*\n\nNamaste *${profile.name}* Ji,\n${messageBody}\n\n— *${TATHASTU_BRAND_NAME}*`
    );
    const link = document.createElement('a');
    link.href = `https://wa.me/${targetPhone}?text=${text}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendAllSixOnWhatsApp = () => {
    if (!canCurrentAccountDownloadOrShare()) {
      triggerAdminRestrictionPopup('Direct WhatsApp Complete 6-Service Digest');
      return;
    }
    const combinedBody = sixNotifications.map((n) => `• ${n.message}`).join('\n\n');
    handleSendWhatsAppNotification(
      `Complete 6-Point Daily Good/Bad Time & Vedic Digest (${today.toLocaleDateString()})`,
      combinedBody
    );
  };

  return (
    <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header & Client Master Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>
              6-Point Daily Notification Engine • Full-Day Good Time vs. Bad Time Tracker
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
            Daily Good Time / Bad Time Notifications & Healer Direct WhatsApp Hub
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl">
            Notifies <strong>{profile.name}</strong> throughout the day about exact Auspicious Good Times and Inauspicious Bad Times. Clients can toggle notifications ON/OFF in their profile anytime, and Healers can dispatch all 6 alerts directly to their client's WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleMaster}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
              masterEnabled
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400'
                : 'bg-rose-950/60 text-rose-200 border-rose-500/40'
            }`}
          >
            {masterEnabled ? (
              <>
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Profile Notifications: ON (Click to Turn OFF)</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 text-rose-400" />
                <span>Profile Notifications: OFF (Click to Turn ON)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendAllSixOnWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send All 6 Alerts on Client WhatsApp</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Full-Day Good Time vs Bad Time Schedule Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Good Times Throughout the Day */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Today's Auspicious Good Times (Shubh / Amrit / Labh)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              Best for Work, Puja & Decisions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {goodWindows.map((gw, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-emerald-200 block">
                    {gw.name} ({gw.quality})
                  </span>
                  <span className="text-[10px] text-slate-400">Ruler: {gw.ruler}</span>
                </div>
                <span className="font-mono font-bold text-amber-200">
                  {gw.startTime} - {gw.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bad Times Throughout the Day */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Today's Inauspicious Bad Times (Rahu Kaal & Rog / Kaal / Udveg)</span>
            </span>
            <span className="text-[11px] font-mono text-rose-400 font-bold">
              Avoid New Ventures
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-between text-xs sm:col-span-2">
              <div>
                <span className="font-black text-rose-200 block">
                  Rahu Kaal (Primary Prohibited Window)
                </span>
                <span className="text-[10px] text-rose-300/80">
                  Strictly pause new contracts & major purchases
                </span>
              </div>
              <span className="font-mono font-black text-rose-200 text-sm">
                {panchang.rahuKaalWindow.start} - {panchang.rahuKaalWindow.end}
              </span>
            </div>

            {badWindows.map((bw, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/90 border border-rose-500/30 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-rose-200 block">{bw.name} (Caution)</span>
                  <span className="text-[10px] text-slate-400">Ruler: {bw.ruler}</span>
                </div>
                <span className="font-mono font-bold text-rose-300">
                  {bw.startTime} - {bw.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All 6 Daily Notification Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sixNotifications.map((item) => {
          const Icon = item.icon;
          const isChannelActive = masterEnabled && channels[item.key];
          return (
            <div
              key={item.key}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                isChannelActive
                  ? 'bg-slate-950 border-amber-500/35'
                  : 'bg-slate-950/50 border-slate-800 opacity-75'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-300 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        {item.category}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-amber-100">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Individual Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleSingleChannel(item.key)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all shrink-0 ${
                      isChannelActive
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isChannelActive ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-amber-500/15">
                  {item.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-500/15">
                <button
                  type="button"
                  onClick={() => handleTriggerBrowserAlert(item.title, item.message)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Push Notification Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendWhatsAppNotification(item.title, item.message)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Direct WhatsApp ({activeProfile?.mobile || profile.mobile})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
