/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NameCorrector } from './components/NameCorrector';
import { MobileAuditor } from './components/MobileAuditor';
import { DailyMantras } from './components/DailyMantras';
import { NumericValidator } from './components/NumericValidator';
import { CosmicCalendar } from './components/CosmicCalendar';
import { WeeklyPredictions } from './components/WeeklyPredictions';
import { PartnerCompatibility } from './components/PartnerCompatibility';
import { ParivarMilan } from './components/ParivarMilan';
import { IndianFestivalsCalendar } from './components/IndianFestivalsCalendar';
import { TransitsAndMoon } from './components/TransitsAndMoon';
import { AiConsultant } from './components/AiConsultant';
import { ProfileModal } from './components/ProfileModal';
import { TathastuAuthPortal } from './components/TathastuAuthPortal';
import { A4SpiritualReportFrame } from './components/A4SpiritualReportFrame';
import { DailySixNotificationsCenter } from './components/DailySixNotificationsCenter';
import { AdminAndProfilesPortal } from './components/AdminAndProfilesPortal';
import { IslamicVedicRemedies } from './components/IslamicVedicRemedies';
import { YogaPranayamaModule } from './components/YogaPranayamaModule';
import { OfflineIndicator } from './components/PWAInstallButton';
import { GlobalTapFeedback } from './components/GlobalTapFeedback';
import { TathastuIntroSplash } from './components/TathastuIntroSplash';
import { MobileBottomNav } from './components/MobileBottomNav';
import { useResponsiveViewport, isMobileDeviceDetected } from './utils/useResponsiveViewport';
import { BirthProfile } from './types';
import { getSavedProfile } from './utils/storage';
import { LanguageProvider, useLanguage, INDIAN_LANGUAGES, SupportedLanguage } from './utils/i18n';
import {
  TathastuProvider,
  useTathastu,
  TATHASTU_APP_NAME,
  TATHASTU_BRAND_NAME,
  TATHASTU_TAGLINE,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_ADMIN_EMAIL,
  TATHASTU_LOGO_PATH,
} from './utils/tathastuStore';
import { PENDING_PAYU_ORDER_STORAGE_KEY } from './components/PayUPaymentModal';
import { X, Globe, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'VEDIC & CHALDEAN SPIRITUAL DASHBOARD',
  'name-corrector': 'ADVANCE NAME & CAREER HARMONY',
  'mobile-auditor': 'ADVANCE MOBILE NUMEROLOGY AUDIT',
  mantras: 'DAILY VEDIC MANTRAS & SOUND REMEDIES',
  'yoga-pranayama': 'VEDIC YOGA, PRANAYAMA & 7-DAY SADHANA PLANNER',
  compatibility: 'PARTNER MILAN & 9-CHAKRA CHALLENGES',
  'parivar-milan': 'PARIVAR MILAN & 9-CHAKRA FAMILY DIAGNOSTICS',
  festivals: 'ALL-INDIA FESTIVALS & PUJA MUHURAT (2026–2030)',
  'notifications-hub': '6 DAILY GOOD/BAD TIME & WHATSAPP ALERTS',
  'profiles-portal': 'CLIENT, HEALER & MASTER ADMIN PORTAL',
  weekly: 'DAILY & WEEKLY FORECAST',
  transits: 'PLANETARY TRANSITS & MOON PHASES',
  calendar: 'PERSONALIZED COSMIC CALENDAR & 12-MONTH MUHURATS',
  'islamic-remedies': 'ISLAMIC-VEDIC REMEDIES, ILM-UL-ADAD & DAILY DHIKR',
  validator: 'AUSPICIOUS NUMERIC VALIDATOR',
  'ai-consultant': 'VEDIC AI ORACLE',
};

function TathastuMainApp() {
  const { language, setLanguage, t } = useLanguage();
  const {
    profiles,
    payuConfig,
    currentAccount,
    activeProfile,
    latestLiveBroadcastAlert,
    dismissLiveBroadcastAlert,
    selectActiveProfile,
    clearActiveProfile,
    logout,
    quickSwitchRoleAccount,
    restoreAccountSessionById,
    applyServerActivatedPayuOrder,
    registerAccountAndPrimaryProfile,
    upgradeAccountPlan,
    adminUpdateProfile,
    triggerAdminRestrictionPopup,
  } = useTathastu();

  const [payuReturnBanner, setPayuReturnBanner] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);
  const payuCallbackProcessedRef = React.useRef(false);

  const handleLogout = () => {
    logout();
    setIsAuthPortalOpen(false);
    setActiveTab('profiles-portal');
    if (typeof window !== 'undefined') {
      if (window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reportProfileId') || params.get('clientName') || params.get('qrAccess')) {
        return params.get('tab') || 'dashboard';
      }
    } catch {
      // Ignore URL parse error
    }
    return 'profiles-portal';
  });
  const { isMobile } = useResponsiveViewport();
  const [showIntroSplash, setShowIntroSplash] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('autoDownloadPdf') === '1' ||
        params.get('noIntro') === '1' ||
        params.get('payuCallback') === '1'
      ) {
        return false;
      }
    } catch {
      // Ignore URL parse error
    }
    return true;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthPortalOpen, setIsAuthPortalOpen] = useState(false);

  // Listen for instant real-time PayU activation events dispatched by PayUPaymentModal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPayuActivated = (ev: Event) => {
      const detail = (ev as CustomEvent)?.detail;
      setIsAuthPortalOpen(false);
      setActiveTab('profiles-portal');
      setPayuReturnBanner({
        type: 'success',
        title: detail?.title || 'Official PayU Payment Confirmed — Subscription Activated!',
        message:
          detail?.message ||
          'Your PayU payment has been verified and your subscription is now live in real time.',
      });
    };
    window.addEventListener('tathastu:payu-activated', onPayuActivated);
    return () => window.removeEventListener('tathastu:payu-activated', onPayuActivated);
  }, []);

  // Automatic Subscription Activation when redirected back from Official PayU Confirmation Page
  // OR when returning to the app after completing UPI/Card payment on PayU (auto-resume pending order)
  useEffect(() => {
    if (typeof window === 'undefined' || payuCallbackProcessedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const isDirectCallback = params.get('payuCallback') === '1';

    let localPending: {
      txnid?: string;
      orderType?: string;
      checkoutPayload?: Record<string, any>;
      amountInr?: number;
      createdAt?: number;
    } | null = null;
    try {
      const rawLocal = localStorage.getItem(PENDING_PAYU_ORDER_STORAGE_KEY);
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (parsed?.txnid && Date.now() - Number(parsed.createdAt || 0) < 2 * 60 * 60 * 1000) {
          localPending = parsed;
        } else {
          localStorage.removeItem(PENDING_PAYU_ORDER_STORAGE_KEY);
        }
      }
    } catch {
      // ignore
    }

    if (!isDirectCallback && !localPending?.txnid) return;

    payuCallbackProcessedRef.current = true;
    const status = (params.get('status') || '').toLowerCase();
    const txnid = (params.get('txnid') || localPending?.txnid || '').trim();
    const mihpayid = (params.get('mihpayid') || '').trim();
    const reason = (params.get('reason') || '').trim();

    const cleanUrl = () => {
      if (!isDirectCallback) return;
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        // ignore
      }
    };

    if (isDirectCallback && status !== 'success' && !txnid) {
      cleanUrl();
      setPayuReturnBanner({
        type: 'error',
        title: 'PayU Payment Not Completed',
        message:
          reason ||
          'Payment was cancelled or could not be verified on Official PayU. No account or subscription was activated.',
      });
      return;
    }

    if (!txnid) return;

    (async () => {
      try {
        const res = await fetch(`/api/payu/verify-status/${encodeURIComponent(txnid)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            key: payuConfig.merchantKey.trim(),
            salt: payuConfig.merchantSalt.trim(),
            environment: payuConfig.environment,
            ...(localPending?.checkoutPayload
              ? {
                  orderType: localPending.orderType,
                  checkoutPayload: localPending.checkoutPayload,
                  amount: localPending.amountInr,
                }
              : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          if (isDirectCallback) {
            cleanUrl();
            setPayuReturnBanner({
              type: 'error',
              title: 'PayU Verification Notice',
              message:
                data?.error ||
                'Could not verify PayU order record on server. Please contact Master Admin.',
            });
          }
          return;
        }

        if (data.status === 'pending') {
          if (isDirectCallback) {
            cleanUrl();
            setPayuReturnBanner({
              type: 'error',
              title: 'PayU Payment Still Pending',
              message:
                'Your PayU transaction is still pending bank/UPI confirmation. Once completed, reload the app and it will activate automatically.',
            });
          }
          return;
        }

        if (data.status !== 'success') {
          try {
            localStorage.removeItem(PENDING_PAYU_ORDER_STORAGE_KEY);
          } catch {
            // ignore
          }
          cleanUrl();
          if (isDirectCallback) {
            setPayuReturnBanner({
              type: 'error',
              title: 'PayU Payment Not Completed',
              message:
                data.errorMessage ||
                reason ||
                'Payment was cancelled or failed on Official PayU. No account or subscription was activated.',
            });
          }
          return;
        }

        const order = data.order || {};
        const payload: Record<string, any> =
          order.checkoutPayload || localPending?.checkoutPayload || {};
        const verifiedTxn = order.mihpayid || mihpayid || txnid;
        const verifiedAmount = Number(order.amount || payload.expectedAmountInr || 0);
        const keepAdminSession =
          order.orderType === 'admin_registration' && Boolean(payload.keepCurrentSession);

        if (data.activatedAccount) {
          await applyServerActivatedPayuOrder({
            account: data.activatedAccount,
            profile: data.activatedProfile || null,
            keepCurrentSession: keepAdminSession,
            adminAccountId: payload.adminAccountId,
          });
        } else if (order.orderType === 'plan_upgrade' && payload.accountId && payload.planId) {
          await upgradeAccountPlan(payload.accountId, payload.planId, payload.couponCode || '');
          restoreAccountSessionById(payload.accountId);
        } else {
          await registerAccountAndPrimaryProfile({
            role: payload.role === 'healer' ? 'healer' : 'client',
            name: payload.name || order.firstname || 'Divine Seeker',
            dob: payload.role === 'client' ? payload.dob : undefined,
            tob: payload.role === 'client' ? payload.tob || '09:30' : undefined,
            pob: payload.role === 'client' ? payload.pob || 'New Delhi, Delhi, India' : undefined,
            lat: payload.lat,
            lng: payload.lng,
            gender: payload.gender || 'male',
            email: payload.email || order.email,
            mobile: payload.mobile || order.phone,
            password: payload.password || 'tathastu123',
            planId: payload.planId,
            isFoc: false,
            couponCode: payload.couponCode || '',
            keepCurrentSession: keepAdminSession,
            paymentVerification: {
              transactionId: verifiedTxn,
              utrNumber: order.bankRefNum || verifiedTxn,
              paymentMethod: `PayU Official (${order.paymentMode || 'ONLINE'})`,
              verifiedAmountInr: verifiedAmount,
            },
            healerBrandName: payload.healerBrandName,
            healerLogoUrl: payload.healerLogoUrl,
            healerInstagram: payload.healerInstagram,
            healerFacebook: payload.healerFacebook,
            healerYoutube: payload.healerYoutube,
            healerWebsite: payload.healerWebsite,
            healerAddress: payload.healerAddress,
          });
          if (keepAdminSession && payload.adminAccountId) {
            restoreAccountSessionById(payload.adminAccountId);
          }
        }

        try {
          localStorage.removeItem(PENDING_PAYU_ORDER_STORAGE_KEY);
        } catch {
          // ignore
        }
        cleanUrl();
        setIsAuthPortalOpen(false);
        setActiveTab('profiles-portal');
        setPayuReturnBanner({
          type: 'success',
          title:
            order.orderType === 'plan_upgrade'
              ? 'Official PayU Payment Confirmed — Plan Upgraded Automatically!'
              : 'Official PayU Payment Confirmed — Subscription Activated Automatically!',
          message: `₹${verifiedAmount.toLocaleString('en-IN')} verified by PayU (Payment ID: ${verifiedTxn}). Your ${String(
            payload.role || data.activatedAccount?.role || 'client'
          ).toUpperCase()} account (${payload.planName || data.activatedAccount?.planName || 'Paid Plan'}) is now live!`,
        });
      } catch {
        if (isDirectCallback) {
          cleanUrl();
          setPayuReturnBanner({
            type: 'error',
            title: 'PayU Callback Error',
            message: 'Network error while verifying your PayU payment. Please contact Master Admin.',
          });
        }
      }
    })();
  }, [
    applyServerActivatedPayuOrder,
    payuConfig.environment,
    payuConfig.merchantKey,
    payuConfig.merchantSalt,
    registerAccountAndPrimaryProfile,
    restoreAccountSessionById,
    upgradeAccountPlan,
  ]);

  // Forced mobile-viewport adjustment script: enforces mobile viewport meta & adds 'tathastu-mobile-view' to document.body
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const applyForcedMobileViewport = () => {
      const mobileDetected = isMobileDeviceDetected() || isMobile;

      let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
      }
      const targetContent =
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover';
      if (viewportMeta.getAttribute('content') !== targetContent) {
        viewportMeta.setAttribute('content', targetContent);
      }

      if (mobileDetected) {
        document.body.classList.add('tathastu-mobile-view');
        document.body.classList.remove('tathastu-desktop-view');
        document.documentElement.dataset.viewMode = 'mobile';
      } else {
        document.body.classList.remove('tathastu-mobile-view');
        document.body.classList.add('tathastu-desktop-view');
        document.documentElement.dataset.viewMode = 'desktop';
      }
    };

    applyForcedMobileViewport();
    window.addEventListener('resize', applyForcedMobileViewport, { passive: true });
    window.addEventListener('orientationchange', applyForcedMobileViewport, { passive: true });

    return () => {
      window.removeEventListener('resize', applyForcedMobileViewport);
      window.removeEventListener('orientationchange', applyForcedMobileViewport);
    };
  }, [isMobile]);

  // Detect scanned QR code or shared report parameters (?reportProfileId=... or ?qrAccess=mobile_pdf) for instant mobile report access
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qrProfileId = params.get('reportProfileId');
      const qrClientName = params.get('clientName');
      const targetTab = params.get('tab') || 'dashboard';
      if (!qrProfileId && !qrClientName) return;

      const matchedProfile =
        profiles.find((p) => p.id === qrProfileId) ||
        (qrClientName
          ? profiles.find((p) => p.name.toLowerCase() === qrClientName.toLowerCase())
          : undefined) ||
        profiles[0];

      if (matchedProfile) {
        if (!currentAccount) {
          quickSwitchRoleAccount(
            matchedProfile.ownerRole === 'healer' ? 'healer' : 'client'
          );
        }
        selectActiveProfile(matchedProfile.id);
        setActiveTab(targetTab);
      }
    } catch {
      // Ignore URL parse error
    }
  }, [profiles, currentAccount, selectActiveProfile, quickSwitchRoleAccount]);

  const fallbackProfile = useMemo(() => getSavedProfile(), []);

  // Derive BirthProfile strictly from the currently opened personalized AstroProfileRecord
  const profile: BirthProfile = useMemo(() => {
    if (!activeProfile) return fallbackProfile;
    return {
      id: activeProfile.id,
      name: activeProfile.name,
      dob: activeProfile.dob,
      tob: activeProfile.tob || '15:25',
      pob: activeProfile.pob || 'New Delhi, India',
      lat: activeProfile.lat ?? 28.6139,
      lng: activeProfile.lng ?? 77.209,
      mobile: activeProfile.mobile,
      gender: activeProfile.gender || 'male',
      includePartnerMilan: Boolean(activeProfile.includePartnerMilan),
      includeParivarMilan: activeProfile.includeParivarMilan !== false,
      healthConcerns: activeProfile.healthConcerns || [],
      partnerName:
        activeProfile.partnerName === 'Rohit Sharma' ||
        activeProfile.partnerName === 'Priyanka Sharma'
          ? ''
          : activeProfile.partnerName || '',
      partnerDob:
        activeProfile.partnerDob === '1988-06-15' ||
        activeProfile.partnerDob === '1990-11-24'
          ? ''
          : activeProfile.partnerDob || '',
      partnerTob: activeProfile.partnerTob || '09:30',
      partnerPob:
        activeProfile.partnerPob === 'Mumbai, Maharashtra, India' &&
        (!activeProfile.partnerName ||
          activeProfile.partnerName === 'Rohit Sharma' ||
          activeProfile.partnerName === 'Priyanka Sharma')
          ? ''
          : activeProfile.partnerPob || '',
      partnerLat: activeProfile.partnerLat ?? 28.6139,
      partnerLng: activeProfile.partnerLng ?? 77.209,
      originalName: activeProfile.originalName || activeProfile.name,
      selectedNameA: activeProfile.selectedNameA,
      selectedNameB: activeProfile.selectedNameB,
      originalMobile: activeProfile.originalMobile || activeProfile.mobile,
      selectedMobileA: activeProfile.selectedMobileA,
      selectedMobileB: activeProfile.selectedMobileB,
      parivarMembers: activeProfile.parivarMembers || [],
    };
  }, [activeProfile, fallbackProfile]);

  const handleUpdateProfile = async (updated: BirthProfile) => {
    if (activeProfile) {
      await adminUpdateProfile({
        ...activeProfile,
        name: updated.name,
        dob: updated.dob,
        tob: updated.tob || activeProfile.tob,
        pob: updated.pob || activeProfile.pob,
        lat: updated.lat ?? activeProfile.lat,
        lng: updated.lng ?? activeProfile.lng,
        mobile: updated.mobile || activeProfile.mobile,
        gender: updated.gender || activeProfile.gender,
        includePartnerMilan:
          updated.includePartnerMilan !== undefined
            ? updated.includePartnerMilan
            : activeProfile.includePartnerMilan,
        includeParivarMilan:
          updated.includeParivarMilan !== undefined
            ? updated.includeParivarMilan
            : activeProfile.includeParivarMilan,
        healthConcerns: updated.healthConcerns ?? activeProfile.healthConcerns,
        partnerName: updated.partnerName ?? activeProfile.partnerName,
        partnerDob: updated.partnerDob ?? activeProfile.partnerDob,
        partnerTob: updated.partnerTob ?? activeProfile.partnerTob,
        partnerPob: updated.partnerPob ?? activeProfile.partnerPob,
        partnerLat: updated.partnerLat ?? activeProfile.partnerLat,
        partnerLng: updated.partnerLng ?? activeProfile.partnerLng,
        originalName: updated.originalName ?? activeProfile.originalName ?? activeProfile.name,
        selectedNameA: updated.selectedNameA ?? activeProfile.selectedNameA,
        selectedNameB: updated.selectedNameB ?? activeProfile.selectedNameB,
        originalMobile: updated.originalMobile ?? activeProfile.originalMobile ?? activeProfile.mobile,
        selectedMobileA: updated.selectedMobileA ?? activeProfile.selectedMobileA,
        selectedMobileB: updated.selectedMobileB ?? activeProfile.selectedMobileB,
        parivarMembers: updated.parivarMembers ?? activeProfile.parivarMembers,
      });
    }
  };

  const handleUpdateProfileName = async (
    newName: string,
    comparisonMeta?: { originalName?: string; selectedNameA?: string; selectedNameB?: string }
  ) => {
    if (activeProfile) {
      await adminUpdateProfile({
        ...activeProfile,
        originalName:
          comparisonMeta?.originalName || activeProfile.originalName || activeProfile.name,
        selectedNameA: comparisonMeta?.selectedNameA ?? activeProfile.selectedNameA,
        selectedNameB: comparisonMeta?.selectedNameB ?? activeProfile.selectedNameB,
        name: newName,
      });
    }
  };

  const handleUpdateProfileMobile = async (
    newMobile: string,
    comparisonMeta?: { originalMobile?: string; selectedMobileA?: string; selectedMobileB?: string }
  ) => {
    if (activeProfile) {
      await adminUpdateProfile({
        ...activeProfile,
        originalMobile:
          comparisonMeta?.originalMobile || activeProfile.originalMobile || activeProfile.mobile,
        selectedMobileA: comparisonMeta?.selectedMobileA ?? activeProfile.selectedMobileA,
        selectedMobileB: comparisonMeta?.selectedMobileB ?? activeProfile.selectedMobileB,
        mobile: newMobile,
      });
    }
  };

  const currentSectionTitle = SECTION_TITLES[activeTab] || 'SPIRITUAL & NUMEROLOGY REPORT';

  return (
    <>
      {showIntroSplash && (
        <TathastuIntroSplash onComplete={() => setShowIntroSplash(false)} />
      )}

      {/* Official PayU Return Confirmation / Automatic Subscription Activation Banner */}
      {payuReturnBanner && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[10000] w-[94%] max-w-2xl no-print animate-fade-in">
          <div
            className={`rounded-2xl border-2 p-4 shadow-2xl flex items-start justify-between gap-3 ${
              payuReturnBanner.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100'
                : 'bg-rose-950/95 border-rose-400 text-rose-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {payuReturnBanner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-serif text-sm font-black">{payuReturnBanner.title}</div>
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{payuReturnBanner.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPayuReturnBanner(null)}
              className="p-1 rounded-lg bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!currentAccount || isAuthPortalOpen ? (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          <div className="bg-slate-900/95 border-b border-amber-500/30 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
              <span>{t('appTitle')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                data-no-translate="true"
                className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/35 rounded-lg px-2.5 py-1"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  aria-label="Select Language"
                  className="bg-slate-950 text-amber-100 text-[11px] font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {INDIAN_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-950 text-amber-100">
                      {lang.nativeLabel} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <TathastuAuthPortal
            onReplayIntro={() => setShowIntroSplash(true)}
            onAuthenticated={() => {
              setIsAuthPortalOpen(false);
              setActiveTab('profiles-portal');
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
          {/* Sacred Top Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profile={profile}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onLogout={handleLogout}
            onReplayIntro={() => setShowIntroSplash(true)}
          />

          {/* Live Cross-Device Master Admin Broadcast / App Update Alert Banner */}
          {latestLiveBroadcastAlert && (
            <div className="max-w-7xl w-full mx-auto px-2 sm:px-4 pt-3 no-print animate-fade-in">
              <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-950/90 to-slate-900 border-2 border-amber-400 p-3.5 sm:p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                      LIVE ADMIN {latestLiveBroadcastAlert.category.toUpperCase()}
                    </span>
                    <span className="font-serif font-bold text-sm text-amber-100">
                      {latestLiveBroadcastAlert.title}
                    </span>
                    {latestLiveBroadcastAlert.couponCode && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-xs font-black">
                        COUPON: {latestLiveBroadcastAlert.couponCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {latestLiveBroadcastAlert.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {latestLiveBroadcastAlert.category === 'update' && (
                    <button
                      type="button"
                      onClick={() => {
                        dismissLiveBroadcastAlert();
                        window.location.reload();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
                    >
                      Apply App Update Now (No Uninstall)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={dismissLiveBroadcastAlert}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    title="Dismiss Notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Viewport Full-Width Aligned with Header */}
          <main
            className={`flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 pt-3 sm:pt-4 a4-print-main-reset ${
              isMobile ? 'pb-24' : 'pb-10'
            }`}
          >
        {!activeProfile || activeTab === 'profiles-portal' ? (
          /* Post-Login Home: Saved Profiles (role-isolated), + New Profile, and for Admin: Client Portal, Healer Portal & Master Admin Portal */
          <AdminAndProfilesPortal
            onOpenProfileWorkspace={() => setActiveTab('dashboard')}
            onLogout={handleLogout}
          />
        ) : (
          /* Opened Client Complete Vedic Dashboard & Modules (with Print PDF / Download / Share / Edit / Delete / Direct WhatsApp & 12-Month Section Checkboxes) */
          <A4SpiritualReportFrame
            sectionTitle={currentSectionTitle}
            onOpenAdminPortal={() => {
              clearActiveProfile();
              setActiveTab('profiles-portal');
            }}
            onOpenEditProfileModal={() => setIsProfileModalOpen(true)}
          >
            {activeTab === 'dashboard' && (
              <Dashboard
                profile={profile}
                setActiveTab={setActiveTab}
                onOpenProfileModal={() => setIsProfileModalOpen(true)}
              />
            )}

            {activeTab === 'name-corrector' && (
              <NameCorrector
                profile={profile}
                onUpdateProfileName={handleUpdateProfileName}
              />
            )}

            {activeTab === 'mobile-auditor' && (
              <MobileAuditor
                profile={profile}
                onUpdateProfileMobile={handleUpdateProfileMobile}
              />
            )}

            {activeTab === 'mantras' && (
              <DailyMantras profile={profile} />
            )}

            {activeTab === 'yoga-pranayama' && (
              <YogaPranayamaModule
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'notifications-hub' && (
              <DailySixNotificationsCenter profile={profile} />
            )}

            {activeTab === 'validator' && (
              <NumericValidator profile={profile} />
            )}

            {activeTab === 'calendar' && (
              <CosmicCalendar profile={profile} />
            )}

            {activeTab === 'weekly' && (
              <WeeklyPredictions profile={profile} />
            )}

            {activeTab === 'compatibility' && (
              <PartnerCompatibility profile={profile} />
            )}

            {activeTab === 'parivar-milan' && (
              <ParivarMilan
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'festivals' && (
              <IndianFestivalsCalendar profile={profile} />
            )}

            {activeTab === 'transits' && (
              <TransitsAndMoon profile={profile} />
            )}

            {activeTab === 'islamic-remedies' && (
              <IslamicVedicRemedies profile={profile} />
            )}

            {activeTab === 'ai-consultant' && (
              <AiConsultant profile={profile} />
            )}
          </A4SpiritualReportFrame>
        )}
      </main>

          <OfflineIndicator />

          {isMobile && (
            <MobileBottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              hasActiveProfile={Boolean(activeProfile)}
              userRole={currentAccount?.role}
              onClearActiveProfile={clearActiveProfile}
              onReplayIntro={() => setShowIntroSplash(true)}
              onLogout={handleLogout}
            />
          )}

          {/* Admin-only Profile Edit Modal */}
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            profile={profile}
            onSave={handleUpdateProfile}
          />

          {/* Sacred TATHASTU Vedic Footer */}
          <footer className="mt-auto border-t border-amber-500/20 bg-slate-950 py-8 px-4 text-center text-xs text-amber-200/70 no-print">
            <div className="max-w-7xl mx-auto space-y-3">
              <div className="flex items-center justify-center gap-3">
                <img
                  src={TATHASTU_LOGO_PATH}
                  alt={TATHASTU_BRAND_NAME}
                  className="w-8 h-8 rounded-lg object-cover border border-amber-500/40"
                />
                <span className="text-amber-300 font-serif font-extrabold text-sm tracking-wide">
                  {TATHASTU_APP_NAME} • {TATHASTU_BRAND_NAME} — {TATHASTU_TAGLINE}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 text-amber-400 font-serif font-bold text-xs">
                <span>ॐ</span>
                <span>सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः</span>
                <span>ॐ</span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-2xl mx-auto">
                <strong>{TATHASTU_APP_NAME}</strong> by <strong>{TATHASTU_BRAND_NAME}</strong>. App Creator &amp; Admin: <strong className="text-amber-200">Healer Ddeepak Jain</strong> • Email: <strong className="text-amber-300 font-mono">{TATHASTU_ADMIN_EMAIL}</strong> • Helpline: <strong className="text-amber-300 font-mono">{TATHASTU_ADMIN_PHONE}</strong>.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-4 pt-2 text-[11px] text-amber-400/80">
                <button
                  onClick={() => {
                    clearActiveProfile();
                    setActiveTab('profiles-portal');
                  }}
                  className="hover:underline cursor-pointer"
                >
                  {currentAccount?.role === 'admin' ? 'Saved Profiles & Admin Portals' : 'My Saved Profiles'}
                </button>
                <span>•</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200 font-bold hover:underline cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout &amp; Return to Login Page</span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <TathastuProvider>
        <GlobalTapFeedback />
        <TathastuMainApp />
      </TathastuProvider>
    </LanguageProvider>
  );
}
