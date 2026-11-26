import React, { useState, useEffect } from 'react';
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
  X,
  FolderOpen,
  Play,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import {
  UserRole,
  TATHASTU_LOGO_PATH,
  TATHASTU_APP_NAME,
  TATHASTU_BRAND_NAME,
} from '../utils/tathastuStore';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasActiveProfile: boolean;
  userRole?: UserRole;
  activeProfileName?: string;
  activeProfileDob?: string;
  onClearActiveProfile: () => void;
  onReplayIntro: () => void;
  onLogout: () => void;
  forceVisible?: boolean;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Mobile / Tablet Side Panel Navigation Drawer
 * Places ALL 15 Vedic & Chaldean modules cleanly in a slide-out side panel
 * so the mobile screen & report viewport stay 100% uncluttered and aligned.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  hasActiveProfile,
  userRole,
  activeProfileName,
  activeProfileDob,
  onClearActiveProfile,
  onReplayIntro,
  onLogout,
  forceVisible = false,
  isOpen,
  onOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);

  const drawerOpen = isOpen !== undefined ? isOpen : internalOpen;
  const openDrawer = () => {
    if (onOpen) onOpen();
    else setInternalOpen(true);
  };
  const closeDrawer = () => {
    if (onClose) onClose();
    else setInternalOpen(false);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const moduleGroups = [
    {
      title: 'Core Vedic & Numerology',
      items: [
        { id: 'dashboard', label: t('tab_dashboard'), icon: Sparkles, requiresProfile: true },
        { id: 'name-corrector', label: t('tab_name'), icon: Flame, requiresProfile: true },
        { id: 'mobile-auditor', label: t('tab_mobile'), icon: Phone, requiresProfile: true },
        {
          id: 'profiles-portal',
          label: t('tab_profiles', 'Saved Profiles & Portals'),
          icon: userRole === 'admin' ? Crown : Users,
          requiresProfile: false,
        },
      ],
    },
    {
      title: 'Daily Muhurat & Transits',
      items: [
        { id: 'calendar', label: t('tab_calendar', 'Daily Muhurat & Calendar'), icon: Calendar, requiresProfile: true },
        { id: 'weekly', label: t('tab_weekly'), icon: Compass, requiresProfile: true },
        { id: 'transits', label: t('tab_transits'), icon: Moon, requiresProfile: true },
        { id: 'festivals', label: t('tab_festivals'), icon: Sun, requiresProfile: true },
        { id: 'notifications-hub', label: t('tab_notifications', '6 Daily Alerts & WhatsApp'), icon: Bell, requiresProfile: true },
      ],
    },
    {
      title: 'Milan & Relationship Harmony',
      items: [
        { id: 'compatibility', label: t('tab_compatibility'), icon: HeartHandshake, requiresProfile: true },
        { id: 'parivar-milan', label: t('tab_parivar', 'Parivar Milan'), icon: Users, requiresProfile: true },
      ],
    },
    {
      title: 'Remedies & Spiritual Healing',
      items: [
        { id: 'mantras', label: t('tab_mantras'), icon: Volume2, requiresProfile: true },
        { id: 'yoga-pranayama', label: t('tab_yoga', 'Yoga & Pranayama'), icon: HeartPulse, requiresProfile: true },
        { id: 'islamic-remedies', label: t('tab_islamic', 'Islamic-Vedic Remedies'), icon: BookOpen, requiresProfile: true },
      ],
    },
  ];

  const selectModule = (id: string) => {
    if (id === 'profiles-portal') {
      onClearActiveProfile();
    }
    setActiveTab(id);
    closeDrawer();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Subtle Floating Left-Edge Side Panel Handle on Mobile/Tablet when a profile is active */}
      {hasActiveProfile && !drawerOpen && (
        <button
          type="button"
          onClick={openDrawer}
          aria-label="Open All Modules Side Panel"
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 ${
            forceVisible ? '' : 'md:hidden'
          } flex flex-col items-center justify-center gap-1 py-3 px-1.5 rounded-r-2xl bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 shadow-[4px_0_20px_rgba(245,158,11,0.45)] border-y border-r border-amber-300 cursor-pointer no-print`}
          title="Open All Modules Side Panel"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
            Modules
          </span>
        </button>
      )}

      {/* Slide-Out Side Panel Drawer for ALL Modules */}
      {drawerOpen && (
        <div
          className={`fixed inset-0 z-[9990] bg-slate-950/80 backdrop-blur-sm flex ${
            forceVisible ? '' : 'md:hidden'
          } no-print`}
          onClick={closeDrawer}
        >
          <aside
            aria-label="Mobile Modules Side Panel"
            className="w-[84vw] max-w-[320px] h-full bg-slate-950 border-r-2 border-amber-500/50 shadow-[12px_0_45px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Side Panel Brand Header */}
            <div className="p-4 bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 border-b border-amber-500/30 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={TATHASTU_LOGO_PATH}
                  alt={TATHASTU_BRAND_NAME}
                  className="w-10 h-10 rounded-xl border border-amber-400 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-serif text-sm font-black text-amber-200 truncate">
                    {TATHASTU_APP_NAME}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold truncate">
                    {hasActiveProfile && activeProfileName
                      ? `${activeProfileName}${activeProfileDob ? ` (${activeProfileDob})` : ''}`
                      : 'All Modules Side Panel'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/35 text-amber-200 flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Close Side Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Grouped Modules List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {!hasActiveProfile && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
                  Select or create a profile in <strong>Saved Profiles &amp; Portals</strong> to unlock all personalized numerology &amp; astrology modules.
                </div>
              )}

              {moduleGroups.map((group) => {
                const visibleItems = group.items.filter(
                  (item) => !item.requiresProfile || hasActiveProfile
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.title} className="space-y-1.5">
                    <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-amber-400/80">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {visibleItems.map((mod) => {
                        const Icon = mod.icon;
                        const active = activeTab === mod.id;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => selectModule(mod.id)}
                            className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                              active
                                ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 border-amber-400 text-amber-100 shadow-md'
                                : 'bg-slate-900/75 border-amber-500/15 text-slate-200 hover:border-amber-400/45 hover:bg-slate-900'
                            }`}
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  active ? 'text-amber-300' : 'text-amber-400/75'
                                }`}
                              />
                              <span className="text-xs font-bold leading-snug break-words">
                                {mod.label}
                              </span>
                            </span>
                            <ChevronRight
                              className={`w-3.5 h-3.5 shrink-0 ${
                                active ? 'text-amber-300' : 'text-slate-500'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Side Panel Footer Quick Actions */}
            <div className="p-3 bg-slate-900/95 border-t border-amber-500/30 grid grid-cols-3 gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
              <button
                type="button"
                onClick={() => selectModule('profiles-portal')}
                className="min-h-[40px] px-2 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Profiles</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  onReplayIntro();
                }}
                className="min-h-[40px] px-2 py-2 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Intro</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  onLogout();
                }}
                className="min-h-[40px] px-2 py-2 rounded-xl bg-rose-600/25 border border-rose-400/60 text-rose-200 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
