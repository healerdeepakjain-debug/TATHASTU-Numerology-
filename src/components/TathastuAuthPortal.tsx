import React, { useState, useEffect, useRef } from 'react';
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
  Tag,
  Eye,
  EyeOff,
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
} from '../utils/tathastuStore';
import { getDailyPanchang } from '../utils/numerology';
import { signInWithGooglePopup } from '../firebase';
import { PayUPaymentModal } from './PayUPaymentModal';
import { CityAutocompleteInput } from './CityAutocompleteInput';
import { BirthTimeAmPmInput, formatTime12HourAmPm } from './BirthTimeAmPmInput';
import { HealerDeepakJainMissionShowcase } from './HealerDeepakJainMissionShowcase';
import a4DivineEnergyBg from '../assets/images/a4_divine_energy_watermark_1794229222633.jpg';
import chakraHealingArt from '../assets/images/chakra_healing_meditation_art_1794229223170.jpg';
import spiritualReportBanner from '../assets/images/spiritual_energy_report_banner_1794229220638.jpg';

interface TathastuAuthPortalProps {
  onAuthenticated?: (role?: UserRole) => void;
}

export const TathastuAuthPortal: React.FC<TathastuAuthPortalProps> = ({
  onAuthenticated,
}) => {
  const {
    accounts,
    profiles,
    plans,
    coupons,
    loginWithCredentials,
    loginWithFirebaseGoogleUser,
    registerAccountAndPrimaryProfile,
    resetPasswordByEmailAndMobile,
    changePasswordByCredentials,
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
  const isRahuBlockedNow =
    livePanchang.isRahuKaalNow || Boolean(currentChoghadiya.isRahuKaalOverlap);
  const isGoodTimeNow =
    !isRahuBlockedNow &&
    (currentChoghadiya.quality === 'Excellent' ||
      currentChoghadiya.quality === 'Good' ||
      currentChoghadiya.quality === 'Gainful');
  const isNeutralTimeNow =
    !isRahuBlockedNow && currentChoghadiya.quality === 'Neutral/Travel';
  const liveClockStr = nowDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const [showAuthWindow, setShowAuthWindow] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'change-password'>('login');
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
  const [regPlanId, setRegPlanId] = useState('client_free_1m');

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

  // Change Password state (available for Client, Healer & Master Admin)
  const [changeIdentifier, setChangeIdentifier] = useState('');
  const [changeCurrentPassword, setChangeCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clientPlans = plans
    .filter((p) => p.role === 'client')
    .sort((a, b) => a.priceInr - b.priceInr);
  const healerPlans = plans
    .filter((p) => p.role === 'healer')
    .sort((a, b) => a.priceInr - b.priceInr);

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
      const defaultClientPlan =
        clientPlans.find((p) => p.priceInr === 0) || clientPlans[0];
      setRegPlanId(defaultClientPlan?.id || 'client_free_1m');
    } else if (role === 'healer') {
      const defaultHealerPlan =
        healerPlans.find((p) => p.priceInr === 0) || healerPlans[0];
      setRegPlanId(defaultHealerPlan?.id || 'healer_free_1m');
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
        if (res.requiresRegistration && selectedRole !== 'admin') {
          if (res.googleEmail) setRegEmail(res.googleEmail);
          if (res.googleName) setRegName(res.googleName);
          const rolePlans = selectedRole === 'client' ? clientPlans : healerPlans;
          const defaultPlan = rolePlans.find((p) => p.priceInr === 0) || rolePlans[0];
          if (defaultPlan) setRegPlanId(defaultPlan.id);
          setAuthMode('register');
        }
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

  const [isPayUModalOpen, setIsPayUModalOpen] = useState(false);
  const [isAwaitingPayUConfirmation, setIsAwaitingPayUConfirmation] = useState(false);

  const executeRegistration = async (
    finalCouponCode?: string,
    payuVerificationDetails?: {
      transactionId: string;
      utrNumber?: string;
      paymentMethod: string;
      finalAmountInr: number;
    },
    overridePlanId?: string
  ) => {
    if (selectedRole === 'admin') {
      setErrorMessage('Admin account is pre-provisioned. Please switch to Login.');
      return false;
    }

    const effectivePlanId = overridePlanId || regPlanId;
    const chosenPlan =
      activePlans.find((p) => p.id === effectivePlanId) || activePlans[0];
    const isFreePlan = Boolean(chosenPlan && chosenPlan.priceInr <= 0);

    // Strictly require PayU payment confirmation for Paid plans; Free plans activate instantly
    if (!isFreePlan && !payuVerificationDetails?.transactionId) {
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
      planId: effectivePlanId,
      isFoc: false,
      couponCode: isFreePlan ? '' : (finalCouponCode ?? regCouponCode),
      ...(payuVerificationDetails?.transactionId
        ? {
            paymentVerification: {
              transactionId: payuVerificationDetails.transactionId,
              utrNumber: payuVerificationDetails.utrNumber,
              paymentMethod: payuVerificationDetails.paymentMethod,
              verifiedAmountInr: payuVerificationDetails.finalAmountInr,
            },
          }
        : {}),
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
      isFreePlan
        ? `✓ Free Trial Activated (${chosenPlan?.name || 'Free Plan'})! Redirecting to your ${
            selectedRole === 'client' ? 'Client' : 'Healer'
          } Dashboard...`
        : `PayU Payment Confirmed (${payuVerificationDetails?.transactionId})! Redirecting to your ${
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

    const duplicateSameRoleAccount = accounts.find(
      (a) =>
        a.role === selectedRole &&
        (a.email.trim().toLowerCase() === cleanEmail ||
          a.mobile.replace(/\D/g, '').slice(-10) === cleanMobile)
    );
    const duplicateClientProfile =
      selectedRole === 'client'
        ? profiles.find(
            (p) =>
              p.email.trim().toLowerCase() === cleanEmail ||
              p.mobile.replace(/\D/g, '').slice(-10) === cleanMobile
          )
        : undefined;

    if (duplicateSameRoleAccount || duplicateClientProfile) {
      setErrorMessage(
        selectedRole === 'healer'
          ? 'This Email Address or Mobile Number is already saved in the Healer block! Please use a unique Email & Mobile for a new Healer.'
          : 'This Email Address or Mobile Number is already saved in the Client Profile block! Same Email/Mobile cannot be saved twice in Client Profiles (it can be saved in another block like Healer).'
      );
      return;
    }

    // Ensure a valid plan is selected: Free plans activate immediately, Paid plans proceed to PayU
    const chosenPlan =
      activePlans.find((p) => p.id === regPlanId) || activePlans[0];
    if (chosenPlan && chosenPlan.id !== regPlanId) {
      setRegPlanId(chosenPlan.id);
    }

    if (chosenPlan && chosenPlan.priceInr <= 0) {
      await executeRegistration(undefined, undefined, chosenPlan.id);
      return;
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

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (changeNewPassword !== changeConfirmPassword) {
      setErrorMessage('New Password and Confirm New Password do not match.');
      return;
    }

    const res = await changePasswordByCredentials({
      role: selectedRole,
      identifier: changeIdentifier,
      currentPassword: changeCurrentPassword,
      newPassword: changeNewPassword,
    });
    if (!res.ok) {
      setErrorMessage(res.error || 'Could not change password.');
      return;
    }

    const updatedRole = res.role || selectedRole;
    setSelectedRole(updatedRole);
    setSuccessMessage(
      `✓ Password changed successfully for your ${updatedRole.toUpperCase()} account! Redirecting to Login...`
    );
    const savedId = changeIdentifier.trim();
    const savedPass = changeNewPassword;
    setChangeCurrentPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
    setTimeout(() => {
      setAuthMode('login');
      setLoginIdentifier(savedId);
      setLoginPassword(savedPass);
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

          {/* LIVE PRESENT TIME CLOCK (IST) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-400/40 bg-amber-500/15 text-amber-200 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>LIVE: {liveClockStr} IST</span>
          </div>

          {/* LIVE GOOD / NEUTRAL / BAD TIME (CHOGHADIYA — RAHU KAAL STRICTLY OVERRIDES) */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-semibold ${
              isGoodTimeNow
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : isNeutralTimeNow
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {isGoodTimeNow ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isNeutralTimeNow ? 'text-amber-400' : 'text-rose-400'}`} />
            )}
            <span>
              Good/Bad Time (Now):{' '}
              {isRahuBlockedNow ? (
                <>
                  <strong className="uppercase">BAD TIME • RAHU KAAL (AVOID)</strong>{' '}
                  [{livePanchang.rahuKaalWindow.start}–{livePanchang.rahuKaalWindow.end} IST]
                </>
              ) : (
                <>
                  <strong className="uppercase">
                    {isGoodTimeNow ? 'GOOD TIME' : isNeutralTimeNow ? 'NEUTRAL TIME' : 'BAD TIME'} • {currentChoghadiya.name} (
                    {currentChoghadiya.quality})
                  </strong>{' '}
                  [{currentChoghadiya.startTime}–{currentChoghadiya.endTime} IST]
                </>
              )}
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
              Rahu Kaal (Live IST):{' '}
              <strong>
                {livePanchang.rahuKaalWindow.start}–{livePanchang.rahuKaalWindow.end} IST
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

      {/* TOP SPIRITUAL HERO — CLEAN WELCOME MESSAGE & SPIRITUAL IMAGES ONLY */}
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
                    <span>Vedic • Chaldean • Pranic Energy • Aura &amp; Chakra Science</span>
                  </span>
                  <h1 className="font-serif text-2xl sm:text-4xl font-black tracking-wide bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent mt-1">
                    {TATHASTU_APP_NAME}
                  </h1>
                  <p className="text-sm sm:text-base font-serif italic text-sky-300">
                    {TATHASTU_BRAND_NAME} — {TATHASTU_TAGLINE}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                Welcome to <strong>{TATHASTU_APP_NAME}</strong> — the complete Spiritual &amp; Data-Driven Mystical Alignment Platform created by <strong>Healer Ddeepak Jain</strong>. Synchronize your Name, Mobile Number, Career Path, Marriage Compatibility, Parivar Milan, 9-Chakra Energy Centres, and Daily Auspicious Muhurat Timing through authentic Vedic Jyotish &amp; Chaldean Numerology.
              </p>
            </div>

            {/* Right Spiritual Visual Showcase */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-lg">
                <img
                  src={chakraHealingArt}
                  alt="9-Chakra Spiritual Healing"
                  className="w-full h-36 sm:h-44 object-cover"
                />
                <div className="p-3">
                  <div className="text-xs font-bold text-amber-200">9-Chakra &amp; Aura Alignment</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Post-marriage chakra challenges, pranic energy scan &amp; exact remedies.
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
                    Download, print, share &amp; send direct WhatsApp reports across all devices.
                  </p>
                </div>
              </div>
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
                    const defaultPlan = rolePlans.find((p) => p.priceInr === 0) || rolePlans[0];
                    if (defaultPlan) {
                      setRegPlanId(defaultPlan.id);
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

              <button
                type="button"
                aria-pressed={authMode === 'change-password'}
                onClick={() => {
                  setAuthMode('change-password');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  if (loginIdentifier && !changeIdentifier) {
                    setChangeIdentifier(loginIdentifier);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'change-password'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300/60'
                    : 'bg-slate-950 text-amber-200 border border-amber-500/30 hover:border-amber-400'
                }`}
              >
                Change Password
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
                {isGoogleSigningIn ? 'Signing in...' : 'Sign In with Google'}
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

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-amber-400 hover:underline font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                  <span className="text-amber-500/40 text-xs">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('change-password');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      if (loginIdentifier) setChangeIdentifier(loginIdentifier);
                    }}
                    className="text-xs text-emerald-300 hover:underline font-medium cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>

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
                        const isFree = plan.priceInr <= 0;
                        return (
                          <div
                            key={plan.id}
                            onClick={() => {
                              setRegPlanId(plan.id);
                              if (isFree) {
                                setIsAwaitingPayUConfirmation(false);
                              }
                            }}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? isFree
                                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-950/60 border-emerald-400 shadow-md'
                                  : 'bg-gradient-to-r from-amber-500/20 to-indigo-950/60 border-amber-400 shadow-md'
                                : isFree
                                ? 'bg-emerald-950/35 border-emerald-500/35 hover:border-emerald-400/70'
                                : 'bg-slate-900/90 border-amber-500/20 hover:border-amber-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-amber-100">
                                    {plan.name}
                                  </span>
                                  {isFree && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-400/50 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                                      FREE TRIAL
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] font-semibold ${
                                    isFree ? 'text-emerald-300' : 'text-amber-300'
                                  }`}
                                >
                                  {plan.badge}
                                </span>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`text-base font-black font-mono ${
                                    isFree ? 'text-emerald-400' : 'text-amber-300'
                                  }`}
                                >
                                  {isFree ? 'FREE' : `₹${plan.priceInr.toLocaleString('en-IN')}`}
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  {plan.maxProfiles} Profile{plan.maxProfiles > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
                              {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <CheckCircle2
                                    className={`w-3 h-3 shrink-0 ${
                                      isFree ? 'text-emerald-400' : 'text-amber-400'
                                    }`}
                                  />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {isAwaitingPayUConfirmation &&
                    !isPayUModalOpen &&
                    ((activePlans.find((p) => p.id === regPlanId) || activePlans[0])?.priceInr ?? 0) > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-950/85 border-2 border-amber-400/70 text-xs text-amber-100 space-y-2 mt-3">
                        <div className="font-bold text-amber-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Plan Payment Confirmation Required
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-100/90 leading-relaxed">
                          Your {selectedRole === 'client' ? 'Client' : 'Healer'} registration details are ready. Confirm your subscription plan to unlock your dashboard.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsPayUModalOpen(true)}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Confirm Plan &amp; Unlock Dashboard</span>
                        </button>
                      </div>
                    )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {((activePlans.find((p) => p.id === regPlanId) || activePlans[0])?.priceInr ?? 0) <= 0
                        ? `Start Free Plan & Register ${
                            selectedRole === 'client' ? 'Client' : 'Healer'
                          }`
                        : `Proceed to PayU & Register ${
                            selectedRole === 'client' ? 'Client' : 'Healer'
                          }`}
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

          {/* 4. CHANGE PASSWORD FORM (FOR CLIENT, HEALER & MASTER ADMIN LOGINS) */}
          {authMode === 'change-password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs text-emerald-200/90">
                Change the password for your <strong>{selectedRole.toUpperCase()}</strong> account by verifying your registered <strong>Email / 10-Digit Mobile</strong> and <strong>Current Password</strong>.
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1">
                  Registered Email Address or 10-Digit Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={changeIdentifier}
                  onChange={(e) => setChangeIdentifier(e.target.value)}
                  placeholder="Enter registered Email or 10-Digit Mobile"
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-4 py-2.5 text-sm text-amber-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={changeCurrentPassword}
                    onChange={(e) => setChangeCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-emerald-300 block mb-1">
                    New Password (Min 6 Characters) *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={changeNewPassword}
                    onChange={(e) => setChangeNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-4 py-2.5 text-sm text-amber-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-emerald-300 block mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={changeConfirmPassword}
                    onChange={(e) => setChangeConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-4 py-2.5 text-sm text-amber-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg"
              >
                Verify Current Password &amp; Change Password
              </button>
            </form>
          )}
        </div>
      )}

      {/* HEALER DDEEPAK JAIN INTRODUCTION, 6 CORE MISSION PILLARS & FAMILY BENEFITS (PUBLIC LOGIN + INTRO PAGE) */}
      <HealerDeepakJainMissionShowcase isPublicLanding />

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
                title: '4. 36-Guna Partner Milan & 9-Chakra Marriage Remedies',
                desc: 'Complete Ashtakoot Guna Milan, post-marriage 9-Chakra alignment analysis (#1 Earth Star to #9 Soul Star), and targeted spiritual remedies clearly prescribed for Groom, Bride, and Both.',
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
              a: 'Select "Client Sign-Up" or "Healer Sign-Up", fill in your details, choose your preferred subscription plan, and click Register to confirm your plan and unlock your dashboard immediately.',
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
              q: 'Q6. How do I get the official TATHASTU NUMEROLOGY App Download Link or QR Code?',
              a: `The official TATHASTU NUMEROLOGY App Download Link, QR Code & Android/iOS install kit are managed exclusively by Master Admin. Contact Healer Ddeepak Jain on +91 ${TATHASTU_ADMIN_PHONE} (${TATHASTU_ADMIN_EMAIL}) for the official app invite link.`,
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

      {/* Official PayU Hosted Payment Gateway — Auto-Redirect & Automatic Subscription Activation */}
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
          checkoutContext={{
            orderType: 'new_registration',
            payload: {
              role: selectedRole === 'healer' ? 'healer' : 'client',
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
              couponCode: regCouponCode,
              healerBrandName,
              healerLogoUrl: healerLogoUrl || TATHASTU_LOGO_PATH,
              healerInstagram,
              healerFacebook,
              healerYoutube,
              healerWebsite,
              healerAddress,
            },
          }}
          onPaymentSuccess={async ({ transactionId, utrNumber, paymentMethod, finalAmountInr, couponCode }) => {
            await executeRegistration(couponCode, {
              transactionId,
              utrNumber,
              paymentMethod,
              finalAmountInr,
            });
          }}
        />
      )}
    </div>
  );
};
