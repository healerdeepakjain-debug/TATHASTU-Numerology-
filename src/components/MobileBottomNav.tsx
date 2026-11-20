import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Phone,
  Volume2,
  HeartPulse,
  HeartHandshake,
  Sun,
  Bell,
  Users,
  Crown,
  Compass,
  Moon,
  Calendar,
  BookOpen,
  Bot,
  LayoutGrid,
  X,
  FolderOpen,
  Play,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { UserRole } from '../utils/tathastuStore';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasActiveProfile: boolean;
  userRole?: UserRole;
  onClearActiveProfile: () => void;
  onReplayIntro: () => void;
  onLogout: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  hasActiveProfile,
  userRole,
  onClearActiveProfile,
  onReplayIntro,
  onLogout,
}) => {
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!hasActiveProfile) {
    return null;
  }

  const allModules = [
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
    { id: 'ai-consultant', label: t('tab_ai'), icon: Bot },
    {
      id: 'profiles-portal',
      label: t('tab_profiles', 'Saved Profiles & Portals'),
      icon: userRole === 'admin' ? Crown : Users,
    },
  ];

  const primaryDockItems = [
    { id: 'dashboard', shortLabel: 'Home', icon: Sparkles },
    { id: 'name-corrector', shortLabel: 'Name', icon: Flame },
    { id: 'mobile-auditor', shortLabel: 'Mobile', icon: Phone },
    { id: 'ai-consultant', shortLabel: 'Oracle', icon: Bot },
  ];

  const selectModule = (id: string) => {
    if (id === 'profiles-portal') {
      onClearActiveProfile();
    }
    setActiveTab(id);
    setDrawerOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Bottom Sheet Drawer for All 14 Spiritual Modules on Mobile */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end md:hidden no-print"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full max-h-[84vh] overflow-y-auto rounded-t-3xl bg-slate-900 border-t-2 border-amber-400/60 p-4 pb-8 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div>
                <h3 className="font-serif text-base font-black text-amber-100">
                  All Vedic &amp; Chaldean Modules
                </h3>
                <p className="text-[11px] text-amber-300/80">
                  Tap any spiritual module to switch view
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 text-amber-200 flex items-center justify-center border border-amber-500/30 cursor-pointer"
                aria-label="Close Modules Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {allModules.map((mod) => {
                const Icon = mod.icon;
                const active = activeTab === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => selectModule(mod.id)}
                    className={`min-h-[52px] p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md'
                        : 'bg-slate-950/85 border-amber-500/20 text-slate-200 hover:border-amber-400/50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-amber-300' : 'text-amber-400/75'
                      }`}
                    />
                    <span className="text-xs font-bold leading-snug line-clamp-2">{mod.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-500/20">
              <button
                type="button"
                onClick={() => selectModule('profiles-portal')}
                className="min-h-[44px] px-2.5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span>Profiles</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onReplayIntro();
                }}
                className="min-h-[44px] px-2.5 py-2.5 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Play className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Intro</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onLogout();
                }}
                className="min-h-[44px] px-2.5 py-2.5 rounded-xl bg-rose-600/25 border border-rose-400/60 text-rose-200 font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-300 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Thumb-Friendly Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-lg border-t border-amber-500/35 px-1.5 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.75)] no-print"
      >
        <div className="grid grid-cols-5 gap-1">
          {primaryDockItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectModule(item.id)}
                className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              drawerOpen || !primaryDockItems.some((i) => i.id === activeTab)
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Modules</span>
          </button>
        </div>
      </nav>
    </>
  );
};
