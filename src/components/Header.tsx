import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Phone,
  Calendar,
  HeartHandshake,
  Compass,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Bot,
  Flame,
  Globe,
  Volume2,
  Crown,
  Users,
  Lock,
  LogOut,
  FolderOpen,
  ArrowLeft,
  Clock,
  BookOpen,
  HeartPulse,
  Menu,
} from 'lucide-react';
import { BirthProfile } from '../types';
import { calculateMulank, calculateBhagyank, getDailyPanchang, PLANETARY_PROFILES } from '../utils/numerology';
import { requestNotificationPermission, sendBrowserNotification } from '../utils/notifications';
import { useLanguage, INDIAN_LANGUAGES, SupportedLanguage } from '../utils/i18n';
import { useResponsiveViewport } from '../utils/useResponsiveViewport';
import { usePlatformMode } from '../utils/platformMode';
import {
  useTathastu,
  TATHASTU_LOGO_PATH,
  TATHASTU_APP_NAME,
  TATHASTU_BRAND_NAME,
  TATHASTU_TAGLINE,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_ADMIN_EMAIL,
} from '../utils/tathastuStore';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: BirthProfile;
  onOpenProfileModal: () => void;
  onLogout: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenProfileModal,
  onLogout,
  onOpenMobileMenu,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { isMobile } = useResponsiveViewport();
  const { isWindowsFullPage, isMobileAppMode } = usePlatformMode();
  const {
    currentAccount,
    activeProfile,
    clearActiveProfile,
    triggerAdminRestrictionPopup,
  } = useTathastu();

  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const mulankInfo = PLANETARY_PROFILES[mulank];
  const bhagyankInfo = PLANETARY_PROFILES[bhagyank];

  // Live present-time clock ticking every 1 second so Good/Bad Time & Rahu Kaal run live
  const [nowDate, setNowDate] = useState<Date>(() => new Date());
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const panchang = React.useMemo(
    () => getDailyPanchang(nowDate, mulank, bhagyank),
    [nowDate, mulank, bhagyank]
  );

  const isRahuBlockedNow =
    panchang.isRahuKaalNow || Boolean(panchang.currentChoghadiya.isRahuKaalOverlap);

  const isGoodTimeNow =
    !isRahuBlockedNow &&
    (panchang.currentChoghadiya.quality === 'Excellent' ||
      panchang.currentChoghadiya.quality === 'Good' ||
      panchang.currentChoghadiya.quality === 'Gainful');

  const isNeutralTimeNow =
    !isRahuBlockedNow && panchang.currentChoghadiya.quality === 'Neutral/Travel';

  const liveClockString = nowDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationEnabled(true);
    }
  }, []);

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
    if (granted) {
      sendBrowserNotification(`🕉️ ${TATHASTU_BRAND_NAME} — Daily Good/Bad Time Active`, {
        body: `Namaste ${profile.name}! Good/Bad Time (${panchang.currentChoghadiya.name}): ${panchang.currentChoghadiya.quality}. Rahu Kaal: ${panchang.rahuKaalWindow.start} - ${panchang.rahuKaalWindow.end}. Lucky Numbers: ${panchang.luckyNumbers.join(', ')}.`,
      });
      setNotificationToast(`6 Daily Good/Bad Time & Lucky Number Push Alerts Enabled!`);
    } else {
      setNotificationToast(`Please allow browser notifications or open 6 Daily Alerts tab.`);
    }
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handleProfileEditClick = () => {
    onOpenProfileModal();
  };

  const navItems = [
    { id: 'dashboard', label: t('tab_dashboard'), icon: Sparkles },
    { id: 'name-corrector', label: t('tab_name'), icon: Flame },
    { id: 'mobile-auditor', label: t('tab_mobile'), icon: Phone },
    { id: 'mantras', label: t('tab_mantras'), icon: Volume2 },
    { id: 'yoga-pranayama', label: t('tab_yoga', 'Yoga & Pranayama'), icon: HeartPulse },
    { id: 'compatibility', label: t('tab_compatibility'), icon: HeartHandshake },
    { id: 'parivar-milan', label: t('tab_parivar', 'Parivar Milan'), icon: Users },
    { id: 'festivals', label: t('tab_festivals'), icon: Sun },
    { id: 'notifications-hub', label: t('tab_notifications', '6 Daily Alerts & WhatsApp'), icon: Bell },
    { id: 'weekly', label: t('tab_weekly'), icon: Compass },
    { id: 'transits', label: t('tab_transits'), icon: Moon },
    { id: 'calendar', label: t('tab_calendar'), icon: Calendar },
    { id: 'islamic-remedies', label: t('tab_islamic', 'Islamic-Vedic Remedies'), icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl shadow-black/40 no-print">
      {/* Topmost Live Good/Bad Time & Rahu Kaal Real-Time Bar */}
      <div className="bg-gradient-to-r from-amber-950/60 via-indigo-950/50 to-slate-950 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs border-b border-amber-500/20 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-1.5 sm:gap-2 text-amber-200/95">
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto whitespace-nowrap py-0.5 no-scrollbar w-full sm:w-auto max-w-full">
          {/* Live Present Time Clock (IST) */}
          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-100 bg-slate-950/90 px-2 py-0.5 sm:py-1 rounded-lg border border-amber-500/35 shrink-0 text-[10.5px] sm:text-xs">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span>{liveClockString} IST</span>
          </span>

          {/* Live Good / Neutral / Bad Time according to Present IST Time (Rahu Kaal strictly overrides Choghadiya) */}
          <span
            className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-mono shrink-0 ${
              isGoodTimeNow
                ? 'bg-emerald-950/95 text-emerald-300 border border-emerald-500/50'
                : isNeutralTimeNow
                  ? 'bg-amber-950/95 text-amber-200 border border-amber-500/50'
                  : 'bg-rose-950/95 text-rose-300 border border-rose-500/50'
            }`}
          >
            <Sun className="w-3 h-3 shrink-0" />
            <span>
              {isRahuBlockedNow
                ? `BAD • Rahu Kaal (${panchang.rahuKaalWindow.start}–${panchang.rahuKaalWindow.end})`
                : `${isGoodTimeNow ? 'GOOD' : isNeutralTimeNow ? 'NEUTRAL' : 'BAD'} • ${panchang.currentChoghadiya.name} (${panchang.currentChoghadiya.startTime}–${panchang.currentChoghadiya.endTime})`}
            </span>
          </span>

          {/* Live Rahu Kaal Status according to Present IST Time */}
          {panchang.isRahuKaalNow ? (
            <span className="inline-flex items-center gap-1 text-rose-300 font-bold bg-rose-950/90 px-2 py-0.5 rounded-md border border-rose-500/50 font-mono text-[10.5px] sm:text-[11px] shrink-0">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Rahu Kaal NOW ({panchang.rahuKaalWindow.start}–{panchang.rahuKaalWindow.end} IST)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/40 font-mono text-[10.5px] sm:text-[11px] shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Rahu: {panchang.rahuKaalWindow.start}–{panchang.rahuKaalWindow.end} IST
            </span>
          )}

          <span className="text-amber-300/90 font-semibold hidden md:inline shrink-0">
            • Helpline: <span className="text-amber-200 font-mono">{TATHASTU_ADMIN_PHONE}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5 w-full sm:w-auto">
          {/* Indian Language Selection Dropdown Window */}
          <div
            data-no-translate="true"
            className="flex items-center gap-1 bg-slate-900 border border-amber-500/35 rounded-lg px-2 py-1 max-w-[135px] sm:max-w-none"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select Language (English, Hindi & All Indian Languages)"
              className="bg-slate-900 text-amber-100 text-[10.5px] sm:text-[11px] font-semibold focus:outline-none cursor-pointer pr-0.5 w-full truncate"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-950 text-amber-100">
                  {lang.nativeLabel} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleToggleNotifications}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] sm:text-xs font-semibold transition-all cursor-pointer ${
              notificationEnabled
                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                : 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40'
            }`}
            title="Toggle daily Good/Bad time & lucky number push alerts"
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">{notificationEnabled ? 'Alerts ON' : 'Alerts'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation & Tathastu Numerology branding bar */}
      <div
        className={`${
          isWindowsFullPage ? 'max-w-none px-4 xl:px-8' : 'max-w-7xl px-2.5 sm:px-6'
        } mx-auto py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4`}
      >
        {/* Left: Mobile Side-Panel Hamburger Button + Tathastu Numerology Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          {!isWindowsFullPage && (isMobile || isMobileAppMode) && onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="w-10 h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200 flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
              aria-label="Open All Modules Side Panel"
              title="Open All Modules Side Panel"
            >
              <Menu className="w-5 h-5 text-amber-300" />
            </button>
          )}

          <div
            onClick={() => {
              if (activeProfile) {
                setActiveTab('dashboard');
              } else {
                setActiveTab('profiles-portal');
              }
            }}
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-indigo-900 p-0.5 shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/50 transition-all shrink-0 overflow-hidden">
              <img
                src={TATHASTU_LOGO_PATH}
                alt={TATHASTU_BRAND_NAME}
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <h1 className="font-serif text-xs sm:text-xl font-extrabold tracking-wide bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent truncate">
                  {TATHASTU_APP_NAME}
                </h1>
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-300/90 hidden sm:inline">
                  · {TATHASTU_BRAND_NAME} ({TATHASTU_TAGLINE})
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-200/75 tracking-wider truncate">
                {isMobile || isMobileAppMode
                  ? `Helpline: ${TATHASTU_ADMIN_PHONE}`
                  : `${TATHASTU_ADMIN_EMAIL} • Helpline: ${TATHASTU_ADMIN_PHONE}`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Controls: On mobile, Saved Profiles & Portals + Logout sit cleanly side-by-side; client detail box is desktop-only since Namaste box shows it below */}
        <div className="flex items-center justify-between md:justify-end flex-wrap gap-2 w-full md:w-auto">
          {activeProfile && (
            <>
              <button
                onClick={() => {
                  clearActiveProfile();
                  setActiveTab('profiles-portal');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
                title="Close active client dashboard and return to Saved Profiles & Portals"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Saved Profiles &amp; Portals</span>
              </button>

              {/* Opened Client Profile Badge (Desktop only — hidden on mobile to keep header compact & show more report) */}
              <button
                onClick={handleProfileEditClick}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-inner group text-left cursor-pointer"
                title={
                  currentAccount?.role === 'admin'
                    ? 'Admin: Edit or Delete any profile'
                    : `Locked Profile — Contact Admin ${TATHASTU_ADMIN_PHONE} to Edit/Delete`
                }
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                  {currentAccount?.role === 'admin' ? (
                    <Crown className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-100 flex items-center gap-1.5">
                    <span>{activeProfile.name}</span>
                    <span className="text-[10px] text-amber-400 font-normal">({activeProfile.dob})</span>
                  </div>
                  <div className="text-[10px] text-amber-300/70 flex items-center gap-2 font-mono">
                    <span>M: <strong className="text-amber-200">{mulank} ({mulankInfo?.planet})</strong></span>
                    <span>•</span>
                    <span>B: <strong className="text-amber-200">{bhagyank} ({bhagyankInfo?.planet})</strong></span>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Logout Button — Sits right next to Saved Profiles & Portals on mobile when profile is open */}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-400/60 text-rose-200 hover:text-white font-bold text-xs transition-all cursor-pointer shadow-sm shrink-0 ml-auto md:ml-0"
            title="Logout and return to Login & Introduction Page"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Full-Width Desktop Grid on Windows/Desktop; Mobile/Tablet /mobile uses MobileBottomNav) */}
      {activeProfile && (isWindowsFullPage || (!isMobile && !isMobileAppMode)) && (
        <div
          className={`${
            isWindowsFullPage ? 'max-w-none px-4 xl:px-8' : 'max-w-7xl px-4 sm:px-6'
          } mx-auto pb-3`}
        >
          <nav
            className={`grid gap-1.5 sm:gap-2 ${
              isWindowsFullPage
                ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-8'
                : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6'
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'profiles-portal') {
                      clearActiveProfile();
                    }
                    setActiveTab(item.id);
                  }}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 border cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/25 text-amber-100 border-amber-400/70 shadow-md shadow-amber-500/15'
                      : 'bg-slate-900/60 border-amber-500/15 text-slate-300 hover:text-amber-200 hover:bg-slate-900 hover:border-amber-500/35'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-amber-500/60'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* In-app Toast Banner */}
      {notificationToast && (
        <div className="bg-amber-900/90 text-amber-100 px-4 py-2 text-center text-xs font-medium border-t border-amber-500/40 animate-fade-in">
          {notificationToast}
        </div>
      )}
    </header>
  );
};
