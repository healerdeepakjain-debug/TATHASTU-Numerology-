import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  User,
  Users,
  Crown,
  Lock,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Globe,
  Instagram,
  Youtube,
  Facebook,
  Upload,
  Flame,
  HeartHandshake,
  Bell,
  Sun,
  Volume2,
  ArrowRight,
  Tag,
  Eye,
  EyeOff,
  Play,
} from 'lucide-react';
import {
  useTathastu,
  UserRole,
  TATHASTU_LOGO_PATH,
  TATHASTU_APP_NAME,
  TATHASTU_BRAND_NAME,
  TATHASTU_TAGLINE,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_ADMIN_EMAIL,
  TATHASTU_OFFICIAL_APP_URL,
} from '../utils/tathastuStore';
import { getDailyPanchang } from '../utils/numerology';
import { signInWithGooglePopup } from '../firebase';
import { getPublicAppOriginUrl } from '../utils/whatsappAndQrService';
import {
  getCurrentLanguage,
  translateMultilineBlock,
  validateAndNormalizeLocaleText,
} from '../utils/i18n';
import { PWAInstallButton } from './PWAInstallButton';
import { PayUPaymentModal } from './PayUPaymentModal';
import { CityAutocompleteInput } from './CityAutocompleteInput';
import { BirthTimeAmPmInput, formatTime12HourAmPm } from './BirthTimeAmPmInput';
import a4DivineEnergyBg from '../assets/images/a4_divine_energy_watermark_1794229222633.jpg';
import chakraHealingArt from '../assets/images/chakra_healing_meditation_art_1794229223170.jpg';
import spiritualReportBanner from '../assets/images/spiritual_energy_report_banner_1794229220638.jpg';

interface TathastuAuthPortalProps {
  onAuthenticated?: (role?: UserRole) => void;
  onReplayIntro?: () => void;
}

export const TathastuAuthPortal: React.FC<TathastuAuthPortalProps> = ({
  onAuthenticated,
  onReplayIntro,
}) => {
  const {
    accounts,
    profiles,
    plans,
    coupons,
    loginWithCredentials,
    loginWithFirebaseGoogleUser,
    quickSwitchRoleAccount,
    registerAccountAndPrimaryProfile,
    resetPasswordByEmailAndMobile,
  } = useTathastu();

  const [nowDate, setNowDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const livePanchang = getDailyPanchang(nowDate, 9, 9);
  const currentChoghadiya = livePanchang.currentChoghadiya;
  const isGoodTimeNow =
    !livePanchang.isRahuKaalNow &&
    (currentChoghadiya.quality === 'Excellent' ||
      currentChoghadiya.quality === 'Good' ||
      currentChoghadiya.quality === 'Gainful' ||
      currentChoghadiya.quality === 'Neutral/Travel');
  const liveClockStr = nowDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const [showAuthWindow, setShowAuthWindow] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const authWindowRef = useRef<HTMLDivElement | null>(null);
  const loginIdentifierInputRef = useRef<HTMLInputElement | null>(null);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regTob, setRegTob] = useState('09:30');
  const [regPob, setRegPob] = useState('New Delhi, Delhi, India');
  const [regLat, setRegLat] = useState<number>(28.6139);
  const [regLng, setRegLng] = useState<number>(77.2090);
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('male');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCouponCode, setRegCouponCode] = useState('');
  const [regPlanId, setRegPlanId] = useState('client_paid_12m');

  // Healer Branding & Social Media state (No DOB, TOB, or POB required)
  const [healerBrandName, setHealerBrandName] = useState('');
  const [healerLogoUrl, setHealerLogoUrl] = useState('');
  const [healerInstagram, setHealerInstagram] = useState('');
  const [healerFacebook, setHealerFacebook] = useState('');
  const [healerYoutube, setHealerYoutube] = useState('');
  const [healerWebsite, setHealerWebsite] = useState('');
  const [healerAddress, setHealerAddress] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clientPlans = plans.filter((p) => p.role === 'client' && p.priceInr > 0);
  const healerPlans = plans.filter((p) => p.role === 'healer' && p.priceInr > 0);

  const [copiedAppLink, setCopiedAppLink] = useState(false);
  const [appQrDataUrl, setAppQrDataUrl] = useState<string>('');
  const appShareUrl = getPublicAppOriginUrl() || TATHASTU_OFFICIAL_APP_URL;

  useEffect(() => {
    QRCode.toDataURL(appShareUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => setAppQrDataUrl(dataUrl))
      .catch(() => {});
  }, [appShareUrl]);

  const handleCopyAppPortalLink = async () => {
    try {
      await navigator.clipboard.writeText(appShareUrl);
      setCopiedAppLink(true);
      setTimeout(() => setCopiedAppLink(false), 2500);
    } catch {
      setCopiedAppLink(false);
    }
  };

  const handleShareAppOnWhatsApp = () => {
    const activeLang = getCurrentLanguage();
    const rawText =
      `*${TATHASTU_BRAND_NAME}* (${TATHASTU_APP_NAME})\n` +
      `_${TATHASTU_TAGLINE}_\n\n` +
      `Access your personalized Vedic & Chaldean Numerology Report, Name & Mobile Frequency Verifier, 7-Chakra Aura Remedies, Yoga Sadhana & Daily Good/Bad Time Muhurat App:\n` +
      `${appShareUrl}`;
    const text = validateAndNormalizeLocaleText(
      translateMultilineBlock(rawText, activeLang),
      activeLang,
      { context: 'whatsapp' }
    ).sanitizedText;
    const link = document.createElement('a');
    link.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenRoleLogin = (
    role: UserRole,
    mode: 'login' | 'register' = 'login',
    shouldScroll = true
  ) => {
    setSelectedRole(role);
    setAuthMode(role === 'admin' ? 'login' : mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    // Keep email/mobile and password clean when switching portals
    if (role !== selectedRole) {
      setLoginIdentifier('');
      setLoginPassword('');
    }
    if (role === 'client') {
      const defaultPaidClientPlan =
        clientPlans.find((p) => p.priceInr > 0) || clientPlans[0];
      setRegPlanId(defaultPaidClientPlan?.id || 'client_paid_12m');
    } else if (role === 'healer') {
      const defaultPaidHealerPlan =
        healerPlans.find((p) => p.priceInr > 0) || healerPlans[0];
      setRegPlanId(defaultPaidHealerPlan?.id || 'healer_paid_10');
    }
    setShowAuthWindow(true);
    if (shouldScroll) {
      setTimeout(() => {
        authWindowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mode === 'login' || role === 'admin') {
          loginIdentifierInputRef.current?.focus({ preventScroll: true });
        }
      }, 60);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setHealerLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = loginWithCredentials(selectedRole, loginIdentifier, loginPassword);
    if (!res.ok) {
      setErrorMessage(res.error || 'Authentication failed.');
      return;
    }
    const targetRole = res.role || selectedRole;
    setSelectedRole(targetRole);
    setSuccessMessage(
      `✓ Login Successful! Entering your ${targetRole.toUpperCase()} Dashboard...`
    );
    setTimeout(() => {
      onAuthenticated?.(targetRole);
    }, 160);
  };

  const handleGoogleCloudSyncLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleSigningIn(true);
    try {
      const credential = await signInWithGooglePopup();
      if (!credential?.user) {
        setErrorMessage('Google Sign-In was cancelled or blocked by popup blocker.');
        return;
      }
      const res = await loginWithFirebaseGoogleUser(credential.user, selectedRole);
      if (!res.ok) {
        setErrorMessage(res.error || 'Unable to sign in with Google.');
        return;
      }
      const actualRole = res.role || selectedRole;
      setSuccessMessage(
        `✓ Google Sign-In Successful (${credential.user.email})! Entering ${actualRole.toUpperCase()} Portal...`
      );
      setTimeout(() => {
        onAuthenticated?.(actualRole);
      }, 160);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Google Sign-In popup failed or was dismissed.';
      setErrorMessage(msg);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleQuickEnterPortal = (role: UserRole) => {
    quickSwitchRoleAccount(role);
    onAuthenticated?.(role);
  };

  const [isPayUModalOpen, setIsPayUModalOpen] = useState(false);
  const [isAwaitingPayUConfirmation, setIsAwaitingPayUConfirmation] = useState(false);

  const executeRegistration = async (
    finalCouponCode?: string,
    payuVerificationDetails?: {
      transactionId: string;
      paymentMethod: string;
      finalAmountInr: number;
    }
  ) => {
    if (selectedRole === 'admin') {
      setErrorMessage('Admin account is pre-provisioned. Please switch to Login.');
      return false;
    }

    // Strictly require PayU payment confirmation before activating account & unlocking dashboard
    if (!payuVerificationDetails?.transactionId) {
      setIsAwaitingPayUConfirmation(true);
      setIsPayUModalOpen(true);
      return false;
    }

    const res = await registerAccountAndPrimaryProfile({
      role: selectedRole,
      name: regName,
      dob: selectedRole === 'client' ? regDob : undefined,
      tob: selectedRole === 'client' ? regTob : undefined,
      pob: selectedRole === 'client' ? regPob : undefined,
      lat: regLat,
      lng: regLng,
      gender: regGender,
      email: regEmail,
      mobile: regMobile,
      password: regPassword,
      planId: regPlanId,
      isFoc: false,
      couponCode: finalCouponCode ?? regCouponCode,
      healerBrandName,
      healerLogoUrl: healerLogoUrl || TATHASTU_LOGO_PATH,
      healerInstagram,
      healerFacebook,
      healerYoutube,
      healerWebsite,
      healerAddress,
    });

    if (!res.ok) {
      setErrorMessage(res.error || 'Registration failed.');
      return false;
    }

    setIsAwaitingPayUConfirmation(false);
    setSuccessMessage(
      `PayU Payment Confirmed (${payuVerificationDetails.transactionId})! Redirecting to your ${
        selectedRole === 'client' ? 'Client' : 'Healer'
      } Dashboard...`
    );
    onAuthenticated?.(selectedRole);
    return true;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedRole === 'admin') {
      setErrorMessage('Admin account is pre-provisioned. Please switch to Login.');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanMobile = regMobile.replace(/\D/g, '').slice(-10);

    if (!regName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('A valid Email Address is required.');
      return;
    }
    if (cleanMobile.length < 10) {
      setErrorMessage('A valid 10-digit Mobile Number is required.');
      return;
    }
    if (selectedRole === 'client' && !regDob.trim()) {
      setErrorMessage('Date of Birth is mandatory for Client registration.');
      return;
    }

    const duplicateAccount = accounts.find(
      (a) =>
        a.email.trim().toLowerCase() === cleanEmail ||
        a.mobile.replace(/\D/g, '').slice(-10) === cleanMobile
    );
    const duplicateProfile = profiles.find(
      (p) =>
        p.email.trim().toLowerCase() === cleanEmail ||
        p.mobile.replace(/\D/g, '').slice(-10) === cleanMobile
    );

    if (duplicateAccount || duplicateProfile) {
      setErrorMessage(
        'Only 1 profile/account can be created per Email Address or Mobile Number! This Email or Mobile Number is already registered.'
      );
      return;
    }

    // Ensure a valid plan is selected and force transition to the PayU Payment Portal
    // for both Clients and Healers before allowing access to the dashboard
    const chosenPlan =
      activePlans.find((p) => p.id === regPlanId) ||
      activePlans.find((p) => p.priceInr > 0) ||
      activePlans[0];
    if (chosenPlan && chosenPlan.id !== regPlanId) {
      setRegPlanId(chosenPlan.id);
    }

    setIsAwaitingPayUConfirmation(true);
    setIsPayUModalOpen(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await resetPasswordByEmailAndMobile(forgotEmail, forgotMobile, forgotNewPassword);
    if (!res.ok) {
      setErrorMessage(res.error || 'Password reset failed.');
      return;
    }
    if (res.role) {
      setSelectedRole(res.role);
    }
    setSuccessMessage(
      `Password updated for your ${(res.role || selectedRole).toUpperCase()} account! Redirecting to login...`
    );
    setTimeout(() => {
      if (res.role) {
        setSelectedRole(res.role);
      }
      setAuthMode('login');
      setLoginIdentifier(forgotEmail.trim());
      setLoginPassword(forgotNewPassword);
    }, 900);
  };

  const activePlans = selectedRole === 'client' ? clientPlans : healerPlans;

  const matchedCoupon = regCouponCode.trim()
    ? coupons.find(
        (c) =>
          c.isActive &&
          c.code.toUpperCase() === regCouponCode.trim().toUpperCase() &&
          (c.targetRole === 'all' || c.targetRole === selectedRole)
      )
    : undefined;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* SABSE UPER: LIVE PRESENT TIME GOOD / BAD TIME & RAHU KAAL TICKER BAR */}
      <div className="rounded-2xl border border-amber-500/40 bg-slate-950/95 px-3 sm:px-4 py-2.5 shadow-xl flex items-center justify-between gap-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar whitespace-nowrap w-full xl:w-auto">
          <div className="inline-flex items-center gap-2 pr-2 border-r border-amber-500/20">
            <img
              src={TATHASTU_LOGO_PATH}
              alt="Tathastu Numerology"
              className="w-6 h-6 rounded-lg object-cover border border-amber-400"
            />
            <span className="font-serif font-black tracking-wide text-amber-300">
              {TATHASTU_BRAND_NAME}
            </span>
          </div>

          {/* LIVE PRESENT TIME CLOCK */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-400/40 bg-amber-500/15 text-amber-200 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>LIVE: {liveClockStr}</span>
          </div>

          {/* LIVE GOOD / BAD TIME (CHOGHADIYA) */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-semibold ${
              isGoodTimeNow
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {isGoodTimeNow ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            )}
            <span>
              Good/Bad Time (Now):{' '}
              <strong className="uppercase">
                {isGoodTimeNow ? 'GOOD TIME' : 'BAD TIME'} • {currentChoghadiya.name} (
                {currentChoghadiya.quality})
              </strong>{' '}
              [{currentChoghadiya.startTime}–{currentChoghadiya.endTime}]
            </span>
          </div>

          {/* LIVE RAHU KAAL */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-semibold ${
              livePanchang.isRahuKaalNow
                ? 'bg-red-950/90 border-red-500/60 text-red-200 animate-pulse'
                : 'bg-slate-900/90 border-amber-500/25 text-amber-200/90'
            }`}
          >
            <AlertTriangle
              className={`w-3.5 h-3.5 shrink-0 ${
                livePanchang.isRahuKaalNow ? 'text-red-400' : 'text-amber-400'
              }`}
            />
            <span>
              Rahu Kaal (Live):{' '}
              <strong>
                {livePanchang.rahuKaalWindow.start}–{livePanchang.rahuKaalWindow.end}
              </strong>{' '}
              ({livePanchang.isRahuKaalNow ? 'ACTIVE NOW — AVOID' : 'Safe Now'})
            </span>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-amber-200/80">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Active Hora:{' '}
            <strong className="text-emerald-300">
              {livePanchang.currentHora}
            </strong>
          </span>
        </div>
      </div>

      {/* TOP SPIRITUAL HERO & COMPLETE APP INTRODUCTION */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900 shadow-2xl">
        <div
          className="absolute inset-0 opacity-35 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url(${spiritualReportBanner})`,
          }}
        />
        <div className="relative z-10 p-6 sm:p-10 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/90">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={TATHASTU_LOGO_PATH}
                  alt={TATHASTU_BRAND_NAME}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/25"
                />
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vedic • Chaldean • Pranic Energy • Aura & Chakra Science</span>
                  </span>
                  <h1 className="font-serif text-2xl sm:text-4xl font-black tracking-wide bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent mt-1">
                    {TATHASTU_BRAND_NAME}
                  </h1>
                  <p className="text-sm sm:text-base font-serif italic text-sky-300">
                    {TATHASTU_TAGLINE}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                Welcome to the complete Spiritual & Data-Driven Mystical Alignment Platform. Synchronize your Name, Mobile Number, Career Path, Marriage Compatibility, 7-Chakra Energy Centres, and Daily Auspicious Muhurat Timing through authentic Vedic Jyotish & Chaldean Numerology.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenRoleLogin(selectedRole, 'login', true)}
                  className="min-h-[44px] px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Login / Sign-Up (Client • Healer • Admin)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <PWAInstallButton />

                {onReplayIntro && (
                  <button
                    type="button"
                    onClick={onReplayIntro}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-400/50 hover:border-amber-300 text-amber-200 hover:text-amber-100 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Brand Intro Video</span>
                  </button>
                )}

                <div className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 text-xs text-amber-200 font-mono max-w-full break-words">
                  App: <strong>{TATHASTU_APP_NAME}</strong> • Helpline: <strong>{TATHASTU_ADMIN_PHONE}</strong> • <strong>{TATHASTU_ADMIN_EMAIL}</strong>
                </div>
              </div>
            </div>

            {/* Right Spiritual Visual Showcase */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-lg">
                <img
                  src={chakraHealingArt}
                  alt="7-Chakra Spiritual Healing"
                  className="w-full h-36 sm:h-44 object-cover"
                />
                <div className="p-3">
                  <div className="text-xs font-bold text-amber-200">7-Chakra & Aura Alignment</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Post-marriage chakra challenges, pranic energy scan & exact remedies.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-lg">
                <img
                  src={a4DivineEnergyBg}
                  alt="Sacred Vedic & Chaldean Yantra"
                  className="w-full h-36 sm:h-44 object-cover"
                />
                <div className="p-3">
                  <div className="text-xs font-bold text-amber-200">A4 Spiritual Dossiers</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Download, print, share & send direct WhatsApp reports across all devices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CENTERED APP LINK, QR CODE, WHATSAPP SHARE & DIRECT APP DOWNLOAD HUB BOX */}
      <div className="max-w-4xl mx-auto w-full rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-amber-500/15 text-center space-y-5">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official App Download, Direct Link &amp; QR Share Hub</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <img
              src={TATHASTU_LOGO_PATH}
              alt={TATHASTU_BRAND_NAME}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h2 className="font-serif text-xl sm:text-2xl font-black text-amber-100">
                Download &amp; Share {TATHASTU_APP_NAME} App
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/85 mt-0.5 max-w-xl">
                Install directly on Android, iOS (iPhone/iPad), Laptop, or Desktop, copy the official app link, or share via WhatsApp &amp; QR Code with your clients and family.
              </p>
            </div>
          </div>
        </div>

        {/* Centered App Link Box + Copy + WhatsApp + Direct Install */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-950/90 border border-amber-500/35 rounded-2xl p-4 sm:p-5">
          <div className="md:col-span-8 space-y-3 text-center md:text-left">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5">
                Direct Official App Link (Click to Copy or Share)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appShareUrl}
                  className="flex-1 bg-slate-900 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-amber-100 font-mono text-center sm:text-left focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyAppPortalLink}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-all shrink-0"
                >
                  {copiedAppLink ? '✓ Link Copied!' : 'Copy App Link'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              <PWAInstallButton />
              <button
                type="button"
                onClick={handleShareAppOnWhatsApp}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>Share App Link on WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-amber-500/20 pt-4 md:pt-0 md:pl-4">
            <div className="bg-white p-2.5 rounded-2xl border-2 border-amber-400 shadow-md">
              {appQrDataUrl ? (
                <img
                  src={appQrDataUrl}
                  alt="Scan QR to Open & Download Tathastu App"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-[10px] font-bold text-slate-700">
                  QR Loading...
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-amber-300 mt-1.5">
              Scan QR to Open / Install App
            </span>
          </div>
        </div>
      </div>

      {/* 3 LOGIN PORTALS SELECTOR CARDS (1: CLIENT PERSONAL, 2: HEALERS, 3: ADMIN) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
              Select Your Login or Registration Portal
            </h2>
            <p className="text-xs text-amber-300/75">
              Choose between 1) Client Personal Login, 2) Healers Practice Login, or 3) Master Admin Portal. Enter your registered Email or Mobile Number and Password to sign in.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. CLIENT PERSONAL LOGIN CARD */}
          <div className="rounded-3xl border border-amber-500/35 bg-slate-900/95 p-6 flex flex-col justify-between shadow-xl hover:border-amber-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30">
                  1. Client Personal
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-amber-100">
                1) Client Personal Portal (Max 2 Profiles)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Register 1 Self + 1 Family Member profile. Receive 6 daily Good/Bad time notifications, personalized Name &amp; Mobile corrections, Partner Milan, and Festival Muhurats.
              </p>
              <div className="text-[11px] text-amber-300/80 space-y-1 pt-1">
                <div>• Free Plan (1 Month) • 3M (₹999) • 6M (₹1,555) • 12M (₹2,999)</div>
                <div>• Login with your Registered Email/Mobile &amp; Password</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-5 mt-4 border-t border-amber-500/15">
              <button
                type="button"
                onClick={() => handleOpenRoleLogin('client', 'login')}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-all"
              >
                Client Login
              </button>
              <button
                type="button"
                onClick={() => handleOpenRoleLogin('client', 'register')}
                className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-xs cursor-pointer transition-all"
              >
                Client Sign-Up
              </button>
            </div>
          </div>

          {/* 2. HEALERS LOGIN CARD */}
          <div className="rounded-3xl border border-emerald-500/35 bg-slate-900/95 p-6 flex flex-col justify-between shadow-xl hover:border-emerald-400 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  2. Healers Portal
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-amber-100">
                2) Spiritual Healers &amp; Consultants Portal
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Register with your Clinic/Brand Name, Logo, and Social Media Handles. Generate A4 spiritual reports for your clients and send daily WhatsApp Good/Bad time alerts.
              </p>
              <div className="text-[11px] text-emerald-300/80 space-y-1 pt-1">
                <div>• Free (1 Profile) • 10 (₹3,333) • 25 (₹6,999) • 50 (₹11,111)</div>
                <div>• Cumulative Plan Upgrade (New plan adds to existing profiles)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-5 mt-4 border-t border-emerald-500/15">
              <button
                type="button"
                onClick={() => handleOpenRoleLogin('healer', 'login')}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer transition-all"
              >
                Healer Login
              </button>
              <button
                type="button"
                onClick={() => handleOpenRoleLogin('healer', 'register')}
                className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-200 font-bold text-xs cursor-pointer transition-all"
              >
                Healer Sign-Up
              </button>
            </div>
          </div>

          {/* 3. ADMIN PORTAL LOGIN CARD */}
          <div className="rounded-3xl border border-amber-400/50 bg-slate-900/95 p-6 flex flex-col justify-between shadow-xl hover:border-amber-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300">
                  <Crown className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/40">
                  3. Master Admin
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-amber-100">
                3) Master Admin Portal
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete real-time control over Client Portal, Healer Portal, and Master Admin Portal. Edit/delete any profile or report, manage plans, generate discount coupons, and broadcast notifications.
              </p>
              <div className="text-[11px] text-amber-300 font-mono space-y-1 pt-1">
                <div>• Authorized Master Admin Access Only</div>
                <div>• Helpline: {TATHASTU_ADMIN_PHONE}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-5 mt-4 border-t border-amber-500/15">
              <button
                type="button"
                onClick={() => handleOpenRoleLogin('admin', 'login')}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-all"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN & SIGN-UP INTERACTIVE WINDOW */}
      {showAuthWindow && (
        <div
          ref={authWindowRef}
          id="tathastu-auth-window"
          className="rounded-3xl border-2 border-amber-400/60 bg-slate-900/95 p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in scroll-mt-6"
        >
          {/* Role Switcher Tabs inside Auth Window */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                role: 'client' as UserRole,
                title: '1) Client Personal Login',
                subtitle: 'Max 2 Profiles • 4 Plans',
                icon: User,
              },
              {
                role: 'healer' as UserRole,
                title: '2) Healers Portal Login',
                subtitle: '1 / 10 / 25 / 50 Profiles • Cumulative Upgrade',
                icon: Users,
              },
              {
                role: 'admin' as UserRole,
                title: '3) Master Admin Login',
                subtitle: 'Authorized Admin Credentials Required',
                icon: Crown,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = selectedRole === tab.role;
              return (
                  <button
                    key={tab.role}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleOpenRoleLogin(tab.role, 'login', false)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-br from-amber-500/25 via-amber-900/30 to-slate-900 border-amber-400 shadow-lg ring-2 ring-amber-400/40'
                        : 'bg-slate-950/80 border-amber-500/20 hover:border-amber-500/40'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        active
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-amber-100">{tab.title}</div>
                      <div className="text-[11px] text-amber-300/75 mt-0.5">{tab.subtitle}</div>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Mode Toggle: Login / Register / Forgot Password */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={authMode === 'login'}
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setTimeout(() => {
                    loginIdentifierInputRef.current?.focus({ preventScroll: true });
                  }, 40);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300/60'
                    : 'bg-slate-950 text-amber-200 border border-amber-500/30 hover:border-amber-400'
                }`}
              >
                Login ({selectedRole.toUpperCase()})
              </button>

              {selectedRole !== 'admin' && (
                <button
                  type="button"
                  aria-pressed={authMode === 'register'}
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    const rolePlans = selectedRole === 'client' ? clientPlans : healerPlans;
                    const paidPlan = rolePlans.find((p) => p.priceInr > 0) || rolePlans[0];
                    if (paidPlan) {
                      setRegPlanId(paidPlan.id);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300/60'
                      : 'bg-slate-950 text-amber-200 border border-amber-500/30 hover:border-amber-400'
                  }`}
                >
                  New {selectedRole === 'client' ? 'Client' : 'Healer'} Sign-Up
                </button>
              )}

              <button
                type="button"
                aria-pressed={authMode === 'forgot'}
                onClick={() => {
                  setAuthMode('forgot');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'forgot'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300/60'
                    : 'bg-slate-950 text-amber-200 border border-amber-500/30 hover:border-amber-400'
                }`}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="button"
              disabled={isGoogleSigningIn}
              onClick={handleGoogleCloudSyncLogin}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-950/90 hover:bg-indigo-900 disabled:opacity-60 text-indigo-200 border border-indigo-400/40 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>
                {isGoogleSigningIn
                  ? 'Connecting Google Sync...'
                  : 'Connect Cloud Real-Time Sync'}
              </span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM — Clean Email/Mobile & Password Input (No Credentials Displayed or Pre-filled) */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5 max-w-xl mx-auto">
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/25 text-xs text-amber-200/90">
                Enter your registered <strong>Email Address</strong> or <strong>10-Digit Mobile Number</strong> and <strong>Password</strong> below to sign in to the <strong>{selectedRole.toUpperCase()}</strong> portal.
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1.5">
                  Registered Email Address or 10-Digit Mobile Number *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3" />
                  <input
                    ref={loginIdentifierInputRef}
                    type="text"
                    required
                    autoComplete="username"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your registered Email or 10-Digit Mobile Number"
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl pl-10 pr-4 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your password"
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl pl-10 pr-24 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 px-2 py-0.5 rounded-lg bg-slate-900 border border-amber-500/30 text-[11px] font-bold text-amber-300 hover:text-amber-100 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-xs text-amber-400 hover:underline font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Login to {selectedRole.toUpperCase()} Dashboard</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM (Client vs Healer — Healer has NO DOB, Birth Time, or Birth City) */}
          {authMode === 'register' && selectedRole !== 'admin' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Account Details */}
                <div className="lg:col-span-6 space-y-4 bg-slate-950/70 p-5 rounded-2xl border border-amber-500/25">
                  <h3 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>
                      {selectedRole === 'client'
                        ? '1. Client Personal Details (Name & DOB Locked After Save)'
                        : '1. Healer Account & Practice Details'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className={selectedRole === 'healer' ? 'sm:col-span-2' : ''}>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        {selectedRole === 'client' ? 'Full Name (Locked After Save) *' : 'Healer Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={selectedRole === 'client' ? 'e.g. Deepak Jain' : 'e.g. Acharya Kavita Sharma'}
                        className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3.5 py-2 text-xs text-amber-100"
                      />
                    </div>

                    {/* Birth Details ONLY for Client Registration (NOT for Healer Registration) */}
                    {selectedRole === 'client' && (
                      <>
                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Gender (Auto-Maps Groom / Bride) *
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRegGender('male')}
                              className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                regGender !== 'female'
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                                  : 'bg-slate-900 text-amber-200 border-amber-500/30 hover:border-amber-400'
                              }`}
                            >
                              ♂ Male (Groom)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRegGender('female')}
                              className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                regGender === 'female'
                                  ? 'bg-pink-500 text-slate-950 border-pink-400 shadow-md'
                                  : 'bg-slate-900 text-pink-200 border-pink-500/30 hover:border-pink-400'
                              }`}
                            >
                              ♀ Female (Bride)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Date of Birth (Locked After Save) *
                          </label>
                          <input
                            type="date"
                            required
                            value={regDob}
                            onChange={(e) => setRegDob(e.target.value)}
                            className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3.5 py-2 text-xs text-amber-100"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Birth Time (AM / PM) — {formatTime12HourAmPm(regTob)}
                          </label>
                          <BirthTimeAmPmInput
                            value={regTob}
                            onChange={(newTob) => setRegTob(newTob)}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Birth Place City, State & Country (Type 1st 3 Letters) *
                          </label>
                          <CityAutocompleteInput
                            value={regPob}
                            lat={regLat}
                            lng={regLng}
                            onChangeText={(txt) => setRegPob(txt)}
                            onSelectCity={(res) => {
                              setRegPob(res.formattedPob);
                              setRegLat(res.lat);
                              setRegLng(res.lng);
                            }}
                            placeholder="Type 1st 3 letters (e.g. Del, Mum, Jai)..."
                            inputClassName="w-full bg-slate-900 border border-amber-500/35 rounded-xl pl-9 pr-8 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        Email Address (Required & Unique) *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-slate-900 border border-amber-500/35 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        10-Digit Mobile (Required & Unique) *
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          placeholder="9876543210"
                          className="w-full bg-slate-900 border border-amber-500/35 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        Create Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full bg-slate-900 border border-amber-500/35 rounded-xl pl-3.5 pr-20 py-2 text-xs text-amber-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2 top-1.5 px-2 py-0.5 rounded bg-slate-950 border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                        Discount Coupon Code (Optional)
                      </label>
                      <div className="relative">
                        <Tag className="w-3.5 h-3.5 text-emerald-400/70 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={regCouponCode}
                          onChange={(e) => setRegCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. TATHASTU20"
                          className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl pl-9 pr-3 py-2 text-xs text-emerald-200 uppercase font-mono"
                        />
                      </div>
                      {matchedCoupon && (
                        <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                          ✓ Coupon {matchedCoupon.code} Applied ({matchedCoupon.discountPercent > 0 ? `${matchedCoupon.discountPercent}% OFF` : `₹${matchedCoupon.flatDiscountInr} OFF`})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Healer Branding & Social Media Fields */}
                  {selectedRole === 'healer' && (
                    <div className="pt-4 border-t border-amber-500/20 space-y-3">
                      <h4 className="font-serif text-sm font-bold text-emerald-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Healer Report Branding (Shown on All Your Client Reports)</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Healer Clinic / Center / Brand Name *
                          </label>
                          <input
                            type="text"
                            required={selectedRole === 'healer'}
                            value={healerBrandName}
                            onChange={(e) => setHealerBrandName(e.target.value)}
                            placeholder="e.g. Divine Pranic & Astro Healing Center"
                            className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3.5 py-2 text-xs text-amber-100"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Upload Healer Logo Image (or Paste Logo URL)
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold cursor-pointer hover:bg-amber-500/30 shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Logo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoFileUpload}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={healerLogoUrl}
                              onChange={(e) => setHealerLogoUrl(e.target.value)}
                              placeholder="Or paste logo URL"
                              className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Instagram Handle
                          </label>
                          <div className="relative">
                            <Instagram className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={healerInstagram}
                              onChange={(e) => setHealerInstagram(e.target.value)}
                              placeholder="@yourhealinghandle"
                              className="w-full bg-slate-900 border border-amber-500/35 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Facebook Page
                          </label>
                          <div className="relative">
                            <Facebook className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={healerFacebook}
                              onChange={(e) => setHealerFacebook(e.target.value)}
                              placeholder="facebook.com/yourpage"
                              className="w-full bg-slate-900 border border-amber-500/35 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            YouTube Channel
                          </label>
                          <div className="relative">
                            <Youtube className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={healerYoutube}
                              onChange={(e) => setHealerYoutube(e.target.value)}
                              placeholder="youtube.com/@yourchannel"
                              className="w-full bg-slate-900 border border-amber-500/35 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-300 block mb-1">
                            Website / Center Address
                          </label>
                          <div className="relative">
                            <Globe className="w-3.5 h-3.5 text-amber-400/60 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={healerAddress}
                              onChange={(e) => setHealerAddress(e.target.value)}
                              placeholder="City, State & Website"
                              className="w-full bg-slate-900 border border-amber-500/35 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Subscription Plan Selection */}
                <div className="lg:col-span-6 space-y-4 bg-slate-950/70 p-5 rounded-2xl border border-amber-500/25 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>
                        2. Select {selectedRole === 'client' ? 'Client' : 'Healer'} Subscription Plan
                      </span>
                    </h3>

                    <div className="space-y-2.5">
                      {activePlans.map((plan) => {
                        const isSelected = regPlanId === plan.id;
                        return (
                          <div
                            key={plan.id}
                            onClick={() => setRegPlanId(plan.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-amber-500/20 to-indigo-950/60 border-amber-400 shadow-md'
                                : 'bg-slate-900/90 border-amber-500/20 hover:border-amber-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="text-xs font-bold text-amber-100 block">
                                  {plan.name}
                                </span>
                                <span className="text-[10px] text-amber-300 font-semibold">
                                  {plan.badge}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-base font-black font-mono text-amber-300">
                                  {plan.priceInr === 0 ? 'FREE' : `₹${plan.priceInr.toLocaleString('en-IN')}`}
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  {plan.maxProfiles} Profile{plan.maxProfiles > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
                              {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {isAwaitingPayUConfirmation && !isPayUModalOpen && (
                    <div className="p-3.5 rounded-2xl bg-amber-950/85 border-2 border-amber-400/70 text-xs text-amber-100 space-y-2 mt-3">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Mandatory PayU Payment Gateway Confirmation Required
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-100/90 leading-relaxed">
                        Your {selectedRole === 'client' ? 'Client' : 'Healer'} registration details are staged. Dashboard access is unlocked only after completing payment confirmation on the PayU Payment Portal.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsPayUModalOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Open PayU Payment Portal &amp; Confirm Plan to Unlock Dashboard</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {`Register ${
                        selectedRole === 'client' ? 'Client' : 'Healer'
                      } Account → Proceed to PayU Payment Portal`}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/25 text-xs text-amber-200/80">
                Verify both your registered <strong>Email Address</strong> and <strong>10-digit Mobile Number</strong> to reset your password, or contact Admin on <strong>{TATHASTU_ADMIN_PHONE}</strong> ({TATHASTU_ADMIN_EMAIL}).
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter registered email"
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-4 py-2.5 text-sm text-amber-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1">
                  Registered 10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={forgotMobile}
                  onChange={(e) => setForgotMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-4 py-2.5 text-sm text-amber-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl pl-4 pr-24 py-2.5 text-sm text-amber-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 px-2 py-0.5 rounded-lg bg-slate-900 border border-amber-500/30 text-[11px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm cursor-pointer"
              >
                Verify & Update Password
              </button>
            </form>
          )}
        </div>
      )}

      {/* 1. WHAT YOU WILL GET IN THIS APP (COMPLETE USES & 18-CHAPTER SPIRITUAL MODULES) */}
      <div className="space-y-4">
        <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Complete App Uses &amp; Spiritual Capabilities • इस ऐप में आपको क्या-क्या मिलेगा
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 mt-0.5">
                What You Will Get Inside {TATHASTU_BRAND_NAME}
              </h2>
              <p className="text-xs text-amber-200/80 mt-1">
                Every profile receives real-time Vedic &amp; Chaldean calculations, a complete 38-page A4 printable spiritual report, and daily Good/Bad time notifications across Mobile, Tablet, Laptop, and Desktop.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Flame,
                title: '1. Real-Time Name Spelling Verifier & 3-Way Comparison',
                desc: 'Test any name spelling in real time, compare your Original Name vs Selected Name A & Selected Name B (Losses vs Benefits), and apply the chosen name across your entire profile & career blueprint.',
              },
              {
                icon: Phone,
                title: '2. Advance Mobile Number Frequency & Triad Audit',
                desc: 'Test any 10-digit mobile number with real-time Cosmic Harmony Index %, compare Original Number vs Selected Number A & B (Losses vs Gains), and audit all 9 adjacent digit pairs.',
              },
              {
                icon: Sparkles,
                title: '3. Universal Numeric Verifier & Self-Calculation Guide',
                desc: 'Step-by-step Chaldean & digit calculation formula so clients can self-calculate and verify their best Vehicle Number, Flat/House/Plot Number, Bank Account & Business/Brand Name.',
              },
              {
                icon: HeartHandshake,
                title: '4. 36-Guna Partner Milan & 7-Chakra Marriage Remedies',
                desc: 'Complete Ashtakoot Guna Milan, post-marriage 7-Chakra alignment analysis, and targeted spiritual remedies clearly prescribed for Groom, Bride, and Both.',
              },
              {
                icon: Bell,
                title: '5. Complete Vedic Maha Dasha Timeline (Past, Present & Future)',
                desc: 'Exact planetary Maha Dasha cycles from Birth Year onward—clearly highlighting Completed Past Cycles, Active Present Cycle, and Upcoming Future Cycles with detailed life predictions.',
              },
              {
                icon: Sun,
                title: '6. Personalized Yoga Asanas, Pranayama & Multi-Faith Remedies',
                desc: 'Visual Yoga Posture Card Gallery tailored to your birth chart & selected health concerns, plus Vedic, Lal Kitab, Jain, Islamic, Christian, Sikh & Buddhist remedial blueprints.',
              },
              {
                icon: Calendar,
                title: '7. All-India Festivals (2026–2030) & Daily Choghadiya Muhurat',
                desc: '5-year Vikram Samvat pan-India festival directory with personalized Best Puja Muhurat, Bhadra/Rahu Kaal avoidance windows, and 6 daily push/WhatsApp alerts.',
              },
              {
                icon: Volume2,
                title: '8. Daily Personalized Vedic Mantras & Planetary Transits',
                desc: 'Tailored Beej & Vedic mantras with audio pronunciation & japa counter, calibrated to your Mulank, Bhagyank, and live Gochar planetary transits.',
              },
              {
                icon: ShieldCheck,
                title: '9. 38-Page A4 Spiritual Dossier (PDF Download & WhatsApp Share)',
                desc: 'Generate a print-ready 38-page A4 Spiritual PDF Report with Sacred Shree Yantra plates, Healer white-label branding, zero blank space, and 1-click WhatsApp sharing.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-amber-500/25 bg-slate-950/90 p-4 space-y-2 shadow-md"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-amber-100">{feature.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. WHY THIS APP IS IMPORTANT FOR CLIENTS & SPIRITUAL HEALERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-amber-500/40 bg-slate-900/95 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase">
            <User className="w-4 h-4" />
            <span>Why This App Is Important for Clients &amp; Families</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100">
            How Clients Benefit in Daily Life, Career, Health &amp; Finance
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            In Vedic and Chaldean science, every letter of your name and every digit of your mobile, vehicle, house, and brand emits a specific planetary frequency. When these vibrations clash with your birth Mulank (Driver) and Bhagyank (Conductor), you face repeated delays, financial blockages, health stress, or relationship friction.
          </p>
          <ul className="space-y-2 text-xs text-amber-100/90">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Identify Hidden Losses &amp; Unlock Benefits:</strong> Clearly see what drawbacks your original name or mobile number carried and how Selected Name A/B or Mobile A/B transforms your career, business, and peace of mind.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Self-Calculate Before You Buy or Register:</strong> Use the built-in step-by-step Chaldean formula to verify any new car number, flat/plot number, bank account, or company brand name yourself.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Daily Auspicious Timing &amp; Health Sadhana:</strong> Act only during your personalized Shubh Choghadiya &amp; Hora, avoid Rahu Kaal, and practice visual Yoga Asanas &amp; Pranayama tailored to your health concerns.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase">
            <Users className="w-4 h-4" />
            <span>Why This App Is Important for Spiritual Healers &amp; Consultants</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100">
            How Healers Scale Their Practice with 100% White-Label Branding
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Preparing a comprehensive numerology, astro-vastu, mobile audit, 7-chakra marriage, and yoga remedy dossier manually takes hours per client. This platform automates the entire calculation and report generation process in seconds with complete mathematical precision.
          </p>
          <ul className="space-y-2 text-xs text-emerald-100/90">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Your Own Healer Name, Clinic Logo &amp; Social Media on Reports:</strong> Every client profile created by a Healer displays that Healer’s Name, Brand/Clinic Name, Logo, Contact &amp; Social Handles across the A4 report header and footer.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Instant 38-Page A4 PDF Dossiers &amp; 1-Click WhatsApp Delivery:</strong> Generate high-resolution, print-ready spiritual reports and send daily personalized Good/Bad time alerts directly to your clients on WhatsApp.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Cumulative Profile Plans:</strong> Upgrade seamlessly from 10 to 25 or 50+ profiles—new plan quotas automatically add to your existing client profiles without losing any saved data.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. GENERAL QUESTIONS & ANSWERS (FAQ) FOR BETTER UNDERSTANDING OF HEALERS & CLIENTS */}
      <div className="rounded-3xl border border-amber-500/35 bg-slate-900/95 p-6 sm:p-8 space-y-5 shadow-xl">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            General Questions &amp; Answers (FAQ) • हीलर और क्लाइंट के सामान्य प्रश्न एवं उत्तर
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 mt-0.5">
            Frequently Asked Questions for Clients &amp; Spiritual Healers
          </h2>
          <p className="text-xs text-amber-200/80 mt-1">
            Everything you need to know about registration, payment plans, name &amp; mobile selection, healer branding, and A4 PDF report downloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: 'Q1. How do I register and activate my Client or Healer account?',
              a: 'Select "Client Sign-Up" or "Healer Sign-Up", fill in your details, choose your preferred subscription plan, and click Register. You will be redirected to the PayU Payment Portal to confirm your plan payment, after which your dashboard unlocks immediately.',
            },
            {
              q: 'Q2. How does the Real-Time Name Spelling & 3-Way Comparison work?',
              a: 'Inside the Name Corrector module, you can type and test any name spelling in real time. Save up to two candidate spellings (Selected Name A & Selected Name B) to view a side-by-side comparison with your Original Name (showing what loss the old spelling caused vs. what benefits the new spelling brings). Clicking "Apply to My Profile" updates your entire profile, career alignment, aura remedies, and PDF report to the newly selected name.',
            },
            {
              q: 'Q3. Can I also test and compare different Mobile Numbers before changing my SIM?',
              a: 'Yes! In the Mobile Number Auditor, you can test any 10-digit mobile number frequency in real time with its Cosmic Harmony Index %, compare your Original Mobile Number with Selected Number A and Selected Number B (Losses vs Benefits), and apply the final selected number to update all calculations across your report.',
            },
            {
              q: 'Q4. Whose Healer Name and contact details appear on the exported A4 PDF Report?',
              a: 'If a Spiritual Healer creates a client profile under their Healer Portal, that Healer’s own Name, Clinic Brand, Logo, and Contact/Social details appear on every page and footer of the report. If a Client creates their own profile directly or if Master Admin creates it, the default Master Healer name (Deepak Jain • Tathastu The Divine Light) is displayed.',
            },
            {
              q: 'Q5. How can a Client calculate their own Lucky Vehicle, Flat, Plot, or Brand Number?',
              a: 'The Universal Numeric Verifier includes a complete step-by-step Chaldean Letter-to-Number Chart (1 to 8) and digit reduction guide. Clients can see the exact letter + digit addition formula and test unlimited vehicle plates, house/flat numbers, bank account numbers, and business/brand names.',
            },
            {
              q: 'Q6. Can I install this app on my Android phone, iPhone, or Laptop?',
              a: 'Yes! Use the centered "Download & Share App" box above to install the app directly on Android, iOS (Safari Share → Add to Home Screen), Windows, or Mac, or scan the QR code / share the official link on WhatsApp.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-amber-500/25 bg-slate-950/90 p-4 space-y-2"
            >
              <h4 className="font-serif text-sm font-bold text-amber-200">{faq.q}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PayU Payment Gateway Modal — Mandatory Payment Confirmation Before Dashboard Access */}
      {isPayUModalOpen && (activePlans.find((p) => p.id === regPlanId) || activePlans[0]) && (
        <PayUPaymentModal
          isOpen={isPayUModalOpen}
          onClose={() => setIsPayUModalOpen(false)}
          plan={(activePlans.find((p) => p.id === regPlanId) || activePlans[0])!}
          customerName={regName}
          customerEmail={regEmail}
          customerMobile={regMobile}
          coupons={coupons}
          initialCouponCode={regCouponCode}
          onPaymentSuccess={async ({ transactionId, paymentMethod, finalAmountInr, couponCode }) => {
            await executeRegistration(couponCode, {
              transactionId,
              paymentMethod,
              finalAmountInr,
            });
          }}
        />
      )}
    </div>
  );
};
