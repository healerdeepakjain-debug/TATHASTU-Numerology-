import React, { useState } from 'react';
import {
  Crown,
  Users,
  User,
  UserPlus,
  Edit3,
  Trash2,
  Lock,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  EyeOff,
  Bell,
  ArrowLeft,
  Tag,
  Sliders,
  PlusCircle,
  Send,
  TrendingUp,
  X,
  Upload,
  FolderOpen,
  QrCode,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  FileText,
  Download,
  Share2,
} from 'lucide-react';
import {
  useTathastu,
  AccountRecord,
  AstroProfileRecord,
  SubscriptionPlanOption,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_ADMIN_EMAIL,
  TATHASTU_BRAND_NAME,
  TATHASTU_LOGO_PATH,
} from '../utils/tathastuStore';
import {
  sendWhatsAppSpecificEventAlert,
  sendWhatsAppFullReportShare,
  sendWhatsAppAuspiciousTimeUpdate,
  generateClientReportQrDataUrl,
  getClientReportDirectUrl,
  loadWhatsAppApiConfig,
  saveWhatsAppApiConfig,
  WhatsAppApiConfig,
} from '../utils/whatsappAndQrService';
import { PayUPaymentModal } from './PayUPaymentModal';
import { CityAutocompleteInput } from './CityAutocompleteInput';
import { BirthTimeAmPmInput, formatTime12HourAmPm } from './BirthTimeAmPmInput';
import { HealerDeepakJainMissionShowcase } from './HealerDeepakJainMissionShowcase';

interface AdminAndProfilesPortalProps {
  onOpenProfileWorkspace: () => void;
}

export const AdminAndProfilesPortal: React.FC<AdminAndProfilesPortalProps> = ({
  onOpenProfileWorkspace,
}) => {
  const {
    accounts,
    profiles,
    plans,
    coupons,
    broadcasts,
    feedbacks,
    currentAccount,
    selectActiveProfile,
    addNewProfileUnderAccount,
    registerAccountAndPrimaryProfile,
    upgradeAccountPlan,
    adminUpdateProfile,
    adminDeleteProfile,
    adminUpdateAccount,
    adminDeleteAccount,
    adminSavePlan,
    adminDeletePlan,
    adminCreateCoupon,
    adminToggleCoupon,
    adminDeleteCoupon,
    adminSendBroadcastNotification,
    adminDeleteBroadcast,
    adminReplyToFeedback,
    adminDeleteFeedback,
    triggerAdminRestrictionPopup,
    canCurrentAccountDownloadOrShare,
  } = useTathastu();

  // Top-level Post-Login Portal View:
  // 'saved-profiles' | 'new-profile' | 'plan-upgrade' | 'client-portal' | 'healer-portal' | 'master-admin-portal'
  const [activeView, setActiveView] = useState<
    'saved-profiles' | 'new-profile' | 'plan-upgrade' | 'client-portal' | 'healer-portal' | 'master-admin-portal'
  >('saved-profiles');

  // Selected Client or Healer in Admin's Client Portal / Healer Portal for full drill-down
  const [selectedClientAccId, setSelectedClientAccId] = useState<string | null>(null);
  const [selectedHealerAccId, setSelectedHealerAccId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminSavedProfileFilter, setAdminSavedProfileFilter] = useState<
    'all' | 'admin-self' | 'client' | 'healer'
  >('all');
  const [feedbackReplyDrafts, setFeedbackReplyDrafts] = useState<Record<string, string>>({});

  // Blank-by-default New Profile / Report Form state
  const [targetAccountForNewProfile, setTargetAccountForNewProfile] = useState<string>('');
  const [newRelationTag, setNewRelationTag] = useState<'self' | 'family' | 'healer-client'>('family');
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newTob, setNewTob] = useState('09:30');
  const [newPob, setNewPob] = useState('');
  const [newLat, setNewLat] = useState<number>(28.6139);
  const [newLng, setNewLng] = useState<number>(77.2090);
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('male');
  const [newIncludePartnerMilan, setNewIncludePartnerMilan] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');

  // Admin Edit Profile Modal State
  const [editingProfile, setEditingProfile] = useState<AstroProfileRecord | null>(null);
  // Admin Edit Account Modal State
  const [editingAccount, setEditingAccount] = useState<AccountRecord | null>(null);

  // Master Admin Portal: Register New Client or New Healer
  const [adminRegRole, setAdminRegRole] = useState<'client' | 'healer'>('client');
  const [adminRegName, setAdminRegName] = useState('');
  const [adminRegDob, setAdminRegDob] = useState('');
  const [adminRegTob, setAdminRegTob] = useState('09:30');
  const [adminRegPob, setAdminRegPob] = useState('');
  const [adminRegLat, setAdminRegLat] = useState<number>(28.6139);
  const [adminRegLng, setAdminRegLng] = useState<number>(77.2090);
  const [adminRegGender, setAdminRegGender] = useState<'male' | 'female' | 'other'>('male');
  const [adminRegEmail, setAdminRegEmail] = useState('');
  const [adminRegMobile, setAdminRegMobile] = useState('');
  const [adminRegPassword, setAdminRegPassword] = useState('tathastu123');
  const [showAdminRegPass, setShowAdminRegPass] = useState(false);
  const [adminRegPlanId, setAdminRegPlanId] = useState('client_paid_12m');
  const [adminRegIsFoc, setAdminRegIsFoc] = useState(false);
  const [adminRegHealerBrand, setAdminRegHealerBrand] = useState('');
  const [adminRegHealerLogo, setAdminRegHealerLogo] = useState('');
  const [adminRegHealerInsta, setAdminRegHealerInsta] = useState('');
  const [adminRegHealerFb, setAdminRegHealerFb] = useState('');
  const [adminRegHealerYt, setAdminRegHealerYt] = useState('');
  const [adminRegHealerAddress, setAdminRegHealerAddress] = useState('');

  // Master Admin Portal: Broadcast Push Notification / Offer state
  const [bcastTitle, setBcastTitle] = useState('');
  const [bcastMessage, setBcastMessage] = useState('');
  const [bcastCategory, setBcastCategory] = useState<'update' | 'offer' | 'muhurat' | 'announcement'>('offer');
  const [bcastAudience, setBcastAudience] = useState<'all' | 'client' | 'healer'>('all');
  const [bcastCoupon, setBcastCoupon] = useState('');

  // Master Admin Portal: Discount Coupon Generator state
  const [couponCode, setCouponCode] = useState('');
  const [couponPercent, setCouponPercent] = useState<number>(20);
  const [couponFlat, setCouponFlat] = useState<number>(0);
  const [couponRole, setCouponRole] = useState<'all' | 'client' | 'healer'>('all');
  const [couponExpiry, setCouponExpiry] = useState('2027-12-31');

  // Master Admin Portal: Plan Editor / New Plan state
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanOption | null>(null);
  const [newPlanRole, setNewPlanRole] = useState<'client' | 'healer'>('healer');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState<number>(4999);
  const [newPlanProfiles, setNewPlanProfiles] = useState<number>(15);
  const [newPlanMonths, setNewPlanMonths] = useState<number>(12);

  // Upgrade Coupon for Client/Healer
  const [upgradeCouponCode, setUpgradeCouponCode] = useState('');

  // PayU Payment Modal State (Upgrades & New Client/Healer Registration)
  const [payUCheckoutPlan, setPayUCheckoutPlan] = useState<SubscriptionPlanOption | null>(null);
  const [adminRegPayUPlan, setAdminRegPayUPlan] = useState<SubscriptionPlanOption | null>(null);
  const [adminRegCouponCode, setAdminRegCouponCode] = useState('');
  const [adminRegSwitchToAccountAfterPayU, setAdminRegSwitchToAccountAfterPayU] = useState(true);

  // Dynamic QR Code Preview Modal State
  const [qrPreviewProfile, setQrPreviewProfile] = useState<AstroProfileRecord | null>(null);
  const [qrPreviewDataUrl, setQrPreviewDataUrl] = useState<string>('');

  // Direct WhatsApp API Connection Hub State
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppApiConfig>(loadWhatsAppApiConfig);
  const [selectedWaClientProfileId, setSelectedWaClientProfileId] = useState<string>('');

  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!currentAccount) return null;

  const isAdmin = currentAccount.role === 'admin';
  const isHealer = currentAccount.role === 'healer';
  const isClient = currentAccount.role === 'client';

  const clientAccounts = accounts.filter((a) => a.role === 'client');
  const healerAccounts = accounts.filter((a) => a.role === 'healer');
  const myProfiles = isAdmin
    ? profiles
    : profiles.filter((p) => p.accountId === currentAccount.id);

  // Open a Client Profile & transition directly to the Complete Vedic Dashboard for that Client ONLY
  const handleClickClientNameToOpenVedicDashboard = (profId: string) => {
    selectActiveProfile(profId);
    onOpenProfileWorkspace();
  };

  const handleOpenBlankProfileTab = (accountId?: string, defaultTag?: 'self' | 'family' | 'healer-client') => {
    const resolvedAccId = accountId || currentAccount.id;
    const targetAcc = accounts.find((a) => a.id === resolvedAccId) || currentAccount;
    const existingForTarget = profiles.filter((p) => p.accountId === targetAcc.id).length;

    // When Client or Healer has completed their current plan profile quota, automatically transfer to Plan Upgrade Add-On Page
    if (!isAdmin && existingForTarget >= targetAcc.maxProfiles) {
      setStatusFeedback({
        type: 'error',
        text: `Your current plan profile quota (${existingForTarget}/${targetAcc.maxProfiles} Profiles) is complete! You have been transferred to the Plan Upgrade & Add-On Page. Purchase any plan below to add more profiles into your account and continue creating new profiles.`,
      });
      setActiveView('plan-upgrade');
      return;
    }

    setTargetAccountForNewProfile(resolvedAccId);
    setNewRelationTag(
      defaultTag || (isClient ? (myProfiles.length === 0 ? 'self' : 'family') : 'healer-client')
    );
    setNewName('');
    setNewDob('');
    setNewTob('');
    setNewPob('');
    setNewLat(28.6139);
    setNewLng(77.2090);
    setNewGender('male');
    setNewIncludePartnerMilan(false);
    setNewEmail('');
    setNewMobile('');
    setStatusFeedback(null);
    setActiveView('new-profile');
  };

  const handleAddProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusFeedback(null);

    const res = await addNewProfileUnderAccount({
      targetAccountId: targetAccountForNewProfile || currentAccount.id,
      relationTag: newRelationTag,
      name: newName,
      dob: newDob,
      tob: newTob || '09:30',
      pob: newPob || 'New Delhi, Delhi, India',
      lat: newLat,
      lng: newLng,
      gender: newGender,
      includePartnerMilan: newIncludePartnerMilan,
      email: newEmail,
      mobile: newMobile,
    });

    if (!res.ok) {
      setStatusFeedback({ type: 'error', text: res.error || 'Could not add profile.' });
      return;
    }

    setNewName('');
    setNewDob('');
    setNewTob('');
    setNewPob('');
    setNewLat(28.6139);
    setNewLng(77.2090);
    setNewIncludePartnerMilan(false);
    setNewEmail('');
    setNewMobile('');

    if (res.profile) {
      selectActiveProfile(res.profile.id);
      onOpenProfileWorkspace();
    }
  };

  const executeAdminRegistrationAfterPayUOrFoc = async (
    couponUsed?: string,
    payuTxnId?: string,
    paidAmount?: number
  ) => {
    const res = await registerAccountAndPrimaryProfile({
      role: adminRegRole,
      name: adminRegName,
      dob: adminRegRole === 'client' ? adminRegDob : undefined,
      tob: adminRegRole === 'client' ? adminRegTob || '09:30' : undefined,
      pob: adminRegRole === 'client' ? adminRegPob || 'New Delhi, Delhi, India' : undefined,
      lat: adminRegLat,
      lng: adminRegLng,
      gender: adminRegGender,
      email: adminRegEmail,
      mobile: adminRegMobile,
      password: adminRegPassword,
      planId: adminRegPlanId,
      isFoc: adminRegIsFoc,
      couponCode: couponUsed || adminRegCouponCode,
      keepCurrentSession: !adminRegSwitchToAccountAfterPayU,
      healerBrandName: adminRegHealerBrand,
      healerLogoUrl: adminRegHealerLogo || TATHASTU_LOGO_PATH,
      healerInstagram: adminRegHealerInsta,
      healerFacebook: adminRegHealerFb,
      healerYoutube: adminRegHealerYt,
      healerAddress: adminRegHealerAddress,
    });

    if (!res.ok) {
      setStatusFeedback({ type: 'error', text: res.error || 'Registration failed.' });
      return false;
    }

    const chosenPlan = plans.find((p) => p.id === adminRegPlanId);
    const createdRole = adminRegRole;
    const createdName = adminRegName;

    setAdminRegName('');
    setAdminRegDob('');
    setAdminRegTob('09:30');
    setAdminRegPob('');
    setAdminRegEmail('');
    setAdminRegMobile('');
    setAdminRegHealerBrand('');
    setAdminRegCouponCode('');

    setStatusFeedback({
      type: 'success',
      text: payuTxnId
        ? `PayU Payment Verified (${payuTxnId} — ₹${paidAmount?.toLocaleString('en-IN')})! Registered & activated ${createdRole.toUpperCase()} "${createdName}" on ${chosenPlan?.name || 'Selected Plan'}.`
        : `Registered & activated new ${createdRole.toUpperCase()} account "${createdName}" on ${chosenPlan?.name || 'Selected Plan'}!`,
    });

    if (adminRegSwitchToAccountAfterPayU) {
      if (createdRole === 'client') {
        onOpenProfileWorkspace();
      } else {
        setActiveView('healer-portal');
      }
    }
    return true;
  };

  const handleAdminRegisterNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusFeedback(null);

    const cleanEmail = adminRegEmail.trim().toLowerCase();
    const cleanMobile = adminRegMobile.replace(/\D/g, '').slice(-10);

    if (!adminRegName.trim()) {
      setStatusFeedback({ type: 'error', text: 'Full Name is required.' });
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatusFeedback({ type: 'error', text: 'A valid Email Address is required.' });
      return;
    }
    if (cleanMobile.length < 10) {
      setStatusFeedback({ type: 'error', text: 'A valid 10-digit Mobile Number is required.' });
      return;
    }
    if (adminRegRole === 'client' && !adminRegDob.trim()) {
      setStatusFeedback({
        type: 'error',
        text: 'Date of Birth is mandatory for Client registration.',
      });
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
      setStatusFeedback({
        type: 'error',
        text: 'This Email Address or 10-digit Mobile Number is already registered! Please use a unique Email and Mobile.',
      });
      return;
    }

    const paidRolePlan =
      plans.find((p) => p.id === adminRegPlanId && p.priceInr > 0) ||
      plans.find((p) => p.role === adminRegRole && p.priceInr > 0);
    const anyRolePlan =
      plans.find((p) => p.id === adminRegPlanId) ||
      paidRolePlan ||
      plans.find((p) => p.role === adminRegRole);

    if (!adminRegIsFoc) {
      if (!paidRolePlan) {
        setStatusFeedback({
          type: 'error',
          text: 'Please select a paid subscription plan or tick the F.O.C. checkbox for Free Admin Registration.',
        });
        return;
      }
      if (paidRolePlan.id !== adminRegPlanId) {
        setAdminRegPlanId(paidRolePlan.id);
      }
      // Force transition to PayU Payment Gateway Portal when F.O.C. is NOT ticked
      setAdminRegPayUPlan(paidRolePlan);
      return;
    }

    if (anyRolePlan && anyRolePlan.id !== adminRegPlanId) {
      setAdminRegPlanId(anyRolePlan.id);
    }
    await executeAdminRegistrationAfterPayUOrFoc(adminRegCouponCode);
  };

  const handleHealerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAdminRegHealerLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenQrModalForProfile = async (prof: AstroProfileRecord) => {
    setQrPreviewProfile(prof);
    const url = await generateClientReportQrDataUrl(prof);
    setQrPreviewDataUrl(url);
  };

  const handleWhatsAppAction = async (
    prof: AstroProfileRecord,
    actionType: 'event' | 'report' | 'goodtime'
  ) => {
    if (!canCurrentAccountDownloadOrShare()) {
      triggerAdminRestrictionPopup('Direct WhatsApp API Messaging to Client');
      return;
    }
    if (actionType === 'event') {
      const res = await sendWhatsAppSpecificEventAlert(prof, currentAccount);
      setStatusFeedback({
        type: 'success',
        text: `Dispatched Upcoming Vedic Event Muhurat (${res.eventTitle}) to ${prof.name} on WhatsApp!`,
      });
    } else if (actionType === 'report') {
      await sendWhatsAppFullReportShare(prof, currentAccount);
      setStatusFeedback({
        type: 'success',
        text: `Dispatched Full Report Summary & Mobile QR Link to ${prof.name} on WhatsApp!`,
      });
    } else {
      await sendWhatsAppAuspiciousTimeUpdate(prof, currentAccount);
      setStatusFeedback({
        type: 'success',
        text: `Dispatched Live Auspicious Time & Rahu Kaal Update to ${prof.name} on WhatsApp!`,
      });
    }
  };

  const handlePlanActivationOrPayU = async (plan: SubscriptionPlanOption) => {
    setPayUCheckoutPlan(plan);
  };

  // Reusable Table Header for Saved Client Profiles List
  const renderSavedProfilesTableHeader = () => (
    <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-amber-500/25 text-[11px] font-bold uppercase tracking-wider text-amber-400">
      <div className="md:col-span-4">Client Name (Click to Open Vedic Dashboard)</div>
      <div className="md:col-span-2">Mobile Number</div>
      <div className="md:col-span-2">Report Date</div>
      <div className="md:col-span-4 text-right">Actions</div>
    </div>
  );

  // Render a 1-line row in the Saved Client Profiles list (Click Client Name -> Opens Complete Vedic Dashboard for that Client)
  const renderSavedClientRow = (prof: AstroProfileRecord) => {
    const regDate = (prof.createdAtIso || new Date().toISOString()).slice(0, 10);
    const ownerAcc = accounts.find((a) => a.id === prof.accountId);
    const creatorBadgeLabel =
      ownerAcc?.role === 'healer'
        ? `Healer: ${ownerAcc.name}`
        : ownerAcc?.role === 'admin'
        ? 'Healer: Deepak Jain (Admin)'
        : `Healer: Deepak Jain (Client ${prof.relationTag === 'family' ? 'Family' : 'Self'})`;
    return (
      <div
        key={prof.id}
        className="grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-3 items-center px-4 py-3.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-amber-500/25 hover:border-amber-400 transition-all"
      >
        {/* Col 1-4: Clickable Client Name */}
        <div
          onClick={() => handleClickClientNameToOpenVedicDashboard(prof.id)}
          className="md:col-span-4 min-w-0 flex items-center gap-2.5 cursor-pointer group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-sm text-amber-100 group-hover:text-amber-300 group-hover:underline truncate">
                {prof.name}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  prof.gender === 'female'
                    ? 'bg-pink-500/20 text-pink-200 border-pink-400/50'
                    : 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                }`}
              >
                {prof.gender === 'female' ? '♀ Female (Bride)' : '♂ Male (Groom)'}
              </span>
              <span className="text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-950/90 text-indigo-200 border border-indigo-400/40">
                {creatorBadgeLabel}
              </span>
              {prof.includePartnerMilan && (
                <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-400/40">
                  💑 Milan Active
                </span>
              )}
            </div>
            <span className="text-[11px] text-amber-300/75 font-mono block truncate">
              DOB: {prof.dob} • TOB: {formatTime12HourAmPm(prof.tob)} • {prof.pob}
            </span>
          </div>
        </div>

        {/* Col 5-6: Mobile Number (Strictly aligned under Mobile Number header) */}
        <div className="md:col-span-2 flex md:block items-center justify-between border-t md:border-t-0 border-amber-500/10 pt-1.5 md:pt-0">
          <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Mobile Number
          </span>
          <span className="font-mono text-xs font-semibold text-amber-200 whitespace-nowrap">
            📞 {prof.mobile || '—'}
          </span>
        </div>

        {/* Col 7-8: Report Date (Strictly aligned under Report Date header) */}
        <div className="md:col-span-2 flex md:block items-center justify-between border-t md:border-t-0 border-amber-500/10 pt-1.5 md:pt-0">
          <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Report Date
          </span>
          <span className="font-mono text-xs font-semibold text-slate-200 whitespace-nowrap">
            📅 {regDate}
          </span>
        </div>

        {/* Col 9-12: Actions (Strictly aligned under Actions header) */}
        <div className="md:col-span-4 flex flex-wrap items-center justify-start md:justify-end gap-1.5 border-t md:border-t-0 border-amber-500/10 pt-2 md:pt-0">
          <button
            type="button"
            onClick={() => handleClickClientNameToOpenVedicDashboard(prof.id)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
          >
            Open Report →
          </button>

          <button
            type="button"
            onClick={() => handleOpenQrModalForProfile(prof)}
            className="px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            title="Dynamic QR Code for Instant Mobile PDF Report"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>QR</span>
          </button>

          {(isHealer || isAdmin) && (
            <>
              <button
                type="button"
                onClick={() => handleWhatsAppAction(prof, 'event')}
                className="px-2 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                title="1-Click WhatsApp: Best Upcoming Vedic Event Muhurat"
              >
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>WA Event</span>
              </button>

              <button
                type="button"
                onClick={() => handleWhatsAppAction(prof, 'report')}
                className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                title="1-Click WhatsApp: Share Full Report Summary & Mobile QR Link"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WA Report</span>
              </button>

              <button
                type="button"
                onClick={() => handleWhatsAppAction(prof, 'goodtime')}
                className="px-2 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                title="1-Click WhatsApp: Live Good/Bad Time & Rahu Kaal Update"
              >
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>WA Time</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setEditingProfile(prof)}
            className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            title="Edit Report Birth Time (AM/PM), Birth City & Contact"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isAdmin) {
                adminDeleteProfile(prof.id);
              } else {
                triggerAdminRestrictionPopup('Delete Profile');
              }
            }}
            className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs cursor-pointer"
            title="Delete Profile"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {statusFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            statusFeedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusFeedback(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =====================================================================
          POST-LOGIN NAVIGATION HEADER:
          ONLY SAVED PROFILE, NEW PROFILE, CLIENT PORTAL, HEALER PORTAL & MASTER ADMIN PORTAL
         ===================================================================== */}
      <div className="rounded-3xl bg-slate-900/95 border-2 border-amber-400/50 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">
              {currentAccount.role.toUpperCase()} ACCOUNT • {currentAccount.planName}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-black text-amber-100">
              Welcome, {currentAccount.name}
            </h2>
            <p className="text-xs text-amber-300/80">
              Select <strong>Saved Profiles</strong> and click on a Client Name to open their Complete Vedic Dashboard, or click <strong>+ New Profile</strong>.
            </p>
          </div>
        </div>

        {/* Navigation Buttons:
            - For Client & Healer: ONLY Saved Profiles & + New Profile (Client Portal & Healer Portal are strictly Admin-only)
            - For Admin: Saved Profiles | + New Profile | Client Portal | Healer Portal | Master Admin Portal */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-2'
          } gap-2.5`}
        >
          <button
            type="button"
            onClick={() => setActiveView('saved-profiles')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              activeView === 'saved-profiles'
                ? 'bg-gradient-to-r from-amber-500/25 to-slate-900 border-amber-400 shadow-lg'
                : 'bg-slate-950/90 border-amber-500/20 hover:border-amber-500/40'
            }`}
          >
            <FolderOpen className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-serif font-bold text-xs sm:text-sm text-amber-100">
                Saved Profiles ({myProfiles.length}
                {!isAdmin ? ` / ${currentAccount.maxProfiles}` : ''})
              </div>
              <div className="text-[10px] text-amber-300/75">
                {isAdmin
                  ? 'Admin Self & All Saved Client Profiles'
                  : 'Click profile name to open report'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenBlankProfileTab()}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              activeView === 'new-profile' || activeView === 'plan-upgrade'
                ? 'bg-gradient-to-r from-amber-500/25 to-slate-900 border-amber-400 shadow-lg'
                : 'bg-slate-950/90 border-amber-500/20 hover:border-amber-500/40'
            }`}
          >
            <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-serif font-bold text-xs sm:text-sm text-amber-100">
                + New Profile
              </div>
              <div className="text-[10px] text-emerald-300/75">
                {!isAdmin && myProfiles.length >= currentAccount.maxProfiles
                  ? `Quota Full (${myProfiles.length}/${currentAccount.maxProfiles}) → Tap to Add-On Plan`
                  : 'Create new profile & 12-month report'}
              </div>
            </div>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveView('client-portal');
                setSelectedClientAccId(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeView === 'client-portal'
                  ? 'bg-gradient-to-r from-amber-500/25 to-slate-900 border-amber-400 shadow-lg'
                  : 'bg-slate-950/90 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <User className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-serif font-bold text-xs sm:text-sm text-amber-100">
                  Client Portal (Admin Only)
                </div>
                <div className="text-[10px] text-amber-300/75">
                  {clientAccounts.length} Registered Clients (Live Sync)
                </div>
              </div>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveView('healer-portal');
                setSelectedHealerAccId(null);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeView === 'healer-portal'
                  ? 'bg-gradient-to-r from-emerald-500/25 to-slate-900 border-emerald-400 shadow-lg'
                  : 'bg-slate-950/90 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <Users className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-serif font-bold text-xs sm:text-sm text-amber-100">
                  Healer Portal (Admin Only)
                </div>
                <div className="text-[10px] text-emerald-300/75">
                  {healerAccounts.length} Registered Healers (Live Sync)
                </div>
              </div>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveView('master-admin-portal')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeView === 'master-admin-portal'
                  ? 'bg-gradient-to-r from-amber-400/30 to-indigo-950/70 border-amber-300 shadow-lg'
                  : 'bg-slate-950/90 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <Crown className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <div className="font-serif font-bold text-xs sm:text-sm text-amber-100">
                  Master Admin Portal
                </div>
                <div className="text-[10px] text-amber-300/75">
                  Register • Push • Coupons • Feedback ({feedbacks.length})
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Plan Quota & Quick Add-On Banner for Client / Healer */}
        {!isAdmin && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/20 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-amber-200">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 font-mono font-bold">
                Profiles Used: {myProfiles.length} / {currentAccount.maxProfiles}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300 font-mono">
                Valid Till: {(currentAccount.subscriptionExpiry || '').slice(0, 10)}
              </span>
              {myProfiles.length >= currentAccount.maxProfiles && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-500/40 text-rose-200 font-bold">
                  Quota Complete — Purchase Add-On Plan to Add More Profiles
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveView('plan-upgrade')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Upgrade / Add-On Plan</span>
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          VIEW 1: SAVED PROFILES (ALL SAVED CLIENTS IN LIST VIEW — CLICK NAME TO OPEN VEDIC DASHBOARD)
         ===================================================================== */}
      {activeView === 'saved-profiles' && (
        <div className="space-y-5">
          {/* Healer Custom Brand Logo & Watermark Bar inside Healer's Saved Profiles View */}
          {isHealer && (
            <div className="rounded-3xl bg-slate-900/95 border border-emerald-500/35 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentAccount.healerLogoUrl || TATHASTU_LOGO_PATH}
                  alt={currentAccount.healerBrandName || currentAccount.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 bg-slate-950 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                    HEALER WHITE-LABEL REPORT BRANDING
                  </span>
                  <h4 className="font-serif text-base font-bold text-white">
                    {currentAccount.healerBrandName || currentAccount.name}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Your custom brand name & logo appear on all 25-page client PDF reports and watermarks.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Healer Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        if (typeof reader.result === 'string') {
                          await adminUpdateAccount({
                            ...currentAccount,
                            healerLogoUrl: reader.result,
                          });
                          setStatusFeedback({
                            type: 'success',
                            text: 'Your Healer Brand Logo & Report Watermark has been updated!',
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-slate-900/95 border border-amber-500/30 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100">
                  {isAdmin
                    ? `Admin Self & All Saved Client Profiles (${myProfiles.length} Real-Time Synced)`
                    : `Saved Profiles List (${myProfiles.length} / ${currentAccount.maxProfiles})`}
                </h3>
                <p className="text-xs text-amber-300/75">
                  Click on any Profile Name below to open the Complete Vedic & Chaldean Dashboard exclusively for that profile.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-amber-400/60 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved client name or mobile..."
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBlankProfileTab()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ New Profile</span>
                </button>
              </div>
            </div>

            {/* Admin Quick Filter Bar for Saved Profiles */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2 pb-1">
                {[
                  { id: 'all', label: `All Saved Profiles (${myProfiles.length})` },
                  {
                    id: 'admin-self',
                    label: `Admin Self Profile (${
                      myProfiles.filter((p) => p.accountId === currentAccount.id).length
                    })`,
                  },
                  {
                    id: 'client',
                    label: `Client Portal Profiles (${
                      myProfiles.filter((p) => p.ownerRole === 'client').length
                    })`,
                  },
                  {
                    id: 'healer',
                    label: `Healer Client Profiles (${
                      myProfiles.filter((p) => p.ownerRole === 'healer').length
                    })`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setAdminSavedProfileFilter(
                        tab.id as 'all' | 'admin-self' | 'client' | 'healer'
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      adminSavedProfileFilter === tab.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-amber-200 border-amber-500/30 hover:border-amber-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* 1-Line Table Header */}
            {renderSavedProfilesTableHeader()}

            {myProfiles.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm text-slate-300">No saved client profiles yet.</p>
                <button
                  type="button"
                  onClick={() => handleOpenBlankProfileTab()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
                >
                  + Add First Client Profile
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {myProfiles
                  .filter((p) => {
                    if (!isAdmin || adminSavedProfileFilter === 'all') return true;
                    if (adminSavedProfileFilter === 'admin-self')
                      return p.accountId === currentAccount.id;
                    if (adminSavedProfileFilter === 'client') return p.ownerRole === 'client';
                    if (adminSavedProfileFilter === 'healer') return p.ownerRole === 'healer';
                    return true;
                  })
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.mobile.includes(searchQuery)
                  )
                  .map((prof) => renderSavedClientRow(prof))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 1B: PLAN UPGRADE & ADD-ON PAGE (AUTO-OPENED WHEN QUOTA IS COMPLETE)
         ===================================================================== */}
      {activeView === 'plan-upgrade' && (
        <div className="rounded-3xl bg-slate-900/95 border-2 border-amber-400 p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/25 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                Plan Upgrade & Cumulative Profile Add-On Portal
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-black text-white">
                Upgrade / Add-On Plan to Create More Profiles
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/85 mt-1">
                Your current plan (<strong className="text-white">{currentAccount.planName}</strong>) has used{' '}
                <strong className="text-amber-300">
                  {myProfiles.length} of {currentAccount.maxProfiles} Profiles
                </strong>
                . Select any plan below — after purchase, its profile quota will be{' '}
                <strong className="text-emerald-300">added-on cumulatively</strong> to your account and you will immediately be able to create your new profile!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={upgradeCouponCode}
                onChange={(e) => setUpgradeCouponCode(e.target.value.toUpperCase())}
                placeholder="Promo Coupon Code"
                className="bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-amber-100 font-mono uppercase w-44"
              />
              <button
                type="button"
                onClick={() => setActiveView('saved-profiles')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                ← Back to Saved Profiles
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans
              .filter(
                (pl) =>
                  (isAdmin ? true : pl.role === currentAccount.role) && pl.priceInr > 0
              )
              .map((pl) => {
                const newCumulativeTotal = currentAccount.maxProfiles + pl.maxProfiles;
                return (
                  <div
                    key={pl.id}
                    className="rounded-2xl bg-slate-950/90 border-2 border-amber-500/35 hover:border-amber-400 p-5 flex flex-col justify-between gap-4 shadow-xl transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase">
                          {pl.badge}
                        </span>
                        <span className="text-xs font-mono text-emerald-300 font-bold">
                          +{pl.maxProfiles} Add-On Profiles
                        </span>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-white">{pl.name}</h4>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-mono text-amber-400">
                          ₹{pl.priceInr.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400">
                          / +{pl.durationMonths} Months Validity
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/35 text-xs text-emerald-200 space-y-1">
                        <div className="font-bold text-emerald-300">
                          ✦ Instant Add-On Calculation:
                        </div>
                        <div className="font-mono">
                          Current Quota ({currentAccount.maxProfiles}) + Plan ({pl.maxProfiles}) ={' '}
                          <strong className="text-white">{newCumulativeTotal} Total Profiles</strong>
                        </div>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                        {pl.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlanActivationOrPayU(pl)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        Buy & Add-On +{pl.maxProfiles} Profiles (₹
                        {pl.priceInr.toLocaleString('en-IN')})
                      </span>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: + NEW PROFILE (BLANK FORM BY DEFAULT)
         ===================================================================== */}
      {activeView === 'new-profile' && (
        <div className="rounded-3xl bg-slate-900/95 border border-amber-500/35 p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <h3 className="font-serif text-lg font-black text-amber-100">
                Create New Client Profile & Generate 12-Month Report (Blank Form)
              </h3>
              <p className="text-xs text-amber-300/75">
                Once saved, Main Name & Date of Birth are permanently locked and the Complete Vedic Dashboard will open for this client.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Client Full Name (Locked After Save) *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter client full name"
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3.5 py-2.5 text-xs text-amber-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Gender (Auto-Maps Groom / Bride) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGender('male')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      newGender !== 'female'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 text-amber-200 border-amber-500/35 hover:border-amber-400'
                    }`}
                  >
                    ♂ Male (Groom)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGender('female')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      newGender === 'female'
                        ? 'bg-pink-500 text-slate-950 border-pink-400 shadow-md'
                        : 'bg-slate-950 text-pink-200 border-pink-500/35 hover:border-pink-400'
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
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3.5 py-2.5 text-xs text-amber-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Birth Time (AM / PM) — {formatTime12HourAmPm(newTob || '09:30')}
                </label>
                <BirthTimeAmPmInput
                  value={newTob || '09:30'}
                  onChange={(val) => setNewTob(val)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Birth Place City, State & Country (Type 1st 3 Letters) *
                </label>
                <CityAutocompleteInput
                  value={newPob}
                  lat={newLat}
                  lng={newLng}
                  onChangeText={(txt) => setNewPob(txt)}
                  onSelectCity={(res) => {
                    setNewPob(res.formattedPob);
                    setNewLat(res.lat);
                    setNewLng(res.lng);
                  }}
                  placeholder="Type 1st 3 letters (e.g. Del, Mum, Jai)..."
                  inputClassName="w-full bg-slate-950 border border-amber-500/35 rounded-xl pl-9 pr-8 py-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Unique Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3.5 py-2.5 text-xs text-amber-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Unique 10-Digit Mobile *
                </label>
                <input
                  type="tel"
                  required
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3.5 py-2.5 text-xs text-amber-100"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-pink-500/35 flex items-center justify-between gap-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newIncludePartnerMilan}
                  onChange={(e) => setNewIncludePartnerMilan(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-pink-200 block">
                    Enable Partner Milan &amp; 36-Guna Compatibility Module for this Client
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Check this box only if the client requires Partner Milan / Marriage Compatibility in their dashboard and spiritual report.
                  </span>
                </div>
              </label>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                  newIncludePartnerMilan
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-700'
                }`}
              >
                {newIncludePartnerMilan ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveView('saved-profiles')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
              >
                Save Profile & Open Vedic Dashboard →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: CLIENT PORTAL (For Admin: All Registered Clients; For Client: My 1-Line Summary & Plan Upgrade)
         ===================================================================== */}
      {activeView === 'client-portal' && (
        <div className="rounded-3xl bg-slate-900/95 border border-amber-500/30 p-5 sm:p-6 shadow-xl space-y-5">
          {isAdmin ? (
            !selectedClientAccId ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-amber-100">
                      1) Client Portal — Registered Clients (Click Client Name to Open Profile & Reports)
                    </h3>
                    <p className="text-xs text-amber-300/70">
                      1-Line View: Client Name • Mobile Number • Date of Registration • Profiles Used/Max (e.g. 1/2)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminRegRole('client');
                      setAdminRegPlanId('client_paid_12m');
                      setAdminRegIsFoc(false);
                      setActiveView('master-admin-portal');
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Register New Client (PayU)</span>
                  </button>
                </div>

                <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-amber-500/25 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  <div className="md:col-span-4">Client Name (Click to Open)</div>
                  <div className="md:col-span-3">Mobile Number</div>
                  <div className="md:col-span-2">Registration Date</div>
                  <div className="md:col-span-2">Profiles (Used/Max)</div>
                  <div className="md:col-span-1 text-right">Action</div>
                </div>

                <div className="space-y-2">
                  {clientAccounts.map((clientAcc) => {
                    const usedCount = profiles.filter((p) => p.accountId === clientAcc.id).length;
                    const maxCount = clientAcc.maxProfiles || 2;
                    return (
                      <div
                        key={clientAcc.id}
                        onClick={() => setSelectedClientAccId(clientAcc.id)}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center px-4 py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-amber-500/25 hover:border-amber-400 transition-all cursor-pointer"
                      >
                        <div className="md:col-span-4 min-w-0 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="font-bold text-sm text-amber-100 hover:underline truncate">
                            {clientAcc.name}
                          </span>
                        </div>
                        <div className="md:col-span-3 flex md:block items-center justify-between font-mono text-xs text-amber-200">
                          <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-amber-400 font-sans">
                            Mobile Number
                          </span>
                          <span>📞 {clientAcc.mobile}</span>
                        </div>
                        <div className="md:col-span-2 flex md:block items-center justify-between font-mono text-xs text-slate-300">
                          <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-amber-400 font-sans">
                            Registration Date
                          </span>
                          <span>📅 {clientAcc.subscriptionStart || clientAcc.createdAtIso.slice(0, 10)}</span>
                        </div>
                        <div className="md:col-span-2 flex md:block items-center justify-between">
                          <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            Profiles (Used/Max)
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-200 font-mono text-xs font-bold">
                            {usedCount}/{maxCount}
                          </span>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <span className="text-xs font-bold text-amber-400">Open →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              (() => {
                const selectedClient = accounts.find((a) => a.id === selectedClientAccId);
                if (!selectedClient) return null;
                const clientProfs = profiles.filter((p) => p.accountId === selectedClient.id);
                return (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                      <button
                        type="button"
                        onClick={() => setSelectedClientAccId(null)}
                        className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to All Clients</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenBlankProfileTab(selectedClient.id, 'family')}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Add Profile for {selectedClient.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAccount(selectedClient)}
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Client Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            adminDeleteAccount(selectedClient.id);
                            setSelectedClientAccId(null);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Client</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-serif text-base font-bold text-amber-100">
                        Saved Profiles & Reports of {selectedClient.name} (Click Name to Open Vedic Dashboard)
                      </h4>
                      {renderSavedProfilesTableHeader()}
                      {clientProfs.map((prof) => renderSavedClientRow(prof))}
                    </div>
                  </div>
                );
              })()
            )
          ) : (
            /* CLIENT'S OWN 1-LINE SUMMARY & UPGRADE */
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 px-4 py-3.5 rounded-2xl bg-slate-950 border border-amber-500/35 items-center text-xs">
                <div>
                  <span className="text-[10px] uppercase text-amber-400 font-bold block">
                    Client Name
                  </span>
                  <strong className="text-amber-100 text-sm">{currentAccount.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-amber-400 font-bold block">
                    Mobile Number
                  </span>
                  <strong className="text-amber-200 font-mono">📞 {currentAccount.mobile}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-amber-400 font-bold block">
                    Date of Registration
                  </span>
                  <strong className="text-slate-200 font-mono">
                    📅 {currentAccount.subscriptionStart || currentAccount.createdAtIso.slice(0, 10)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                    Profiles Left to Generate
                  </span>
                  <strong className="text-emerald-300 font-mono text-sm">
                    {myProfiles.length}/{currentAccount.maxProfiles}
                  </strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <h4 className="font-serif text-base font-bold text-amber-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Add / Upgrade Client Plan via PayU (Profiles &amp; Validity Add Into Existing Plan)</span>
                </h4>
                <input
                  type="text"
                  value={upgradeCouponCode}
                  onChange={(e) => setUpgradeCouponCode(e.target.value.toUpperCase())}
                  placeholder="Promo Coupon (e.g. TATHASTU20)"
                  className="bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-200 font-mono uppercase w-56"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {plans
                  .filter((p) => p.role === 'client' && p.priceInr > 0)
                  .map((pl) => (
                    <div
                      key={pl.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className="text-xs font-bold text-amber-100 block">{pl.name}</span>
                        <span className="text-lg font-black font-mono text-amber-300 block mt-1">
                          ₹{pl.priceInr.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-emerald-300 font-semibold block mt-1">
                          +{pl.maxProfiles} Profiles (New Total: {currentAccount.maxProfiles + pl.maxProfiles})
                        </span>
                        <span className="text-[10px] text-amber-200/80 block mt-0.5">
                          +{pl.durationMonths} Months Validity Added
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlanActivationOrPayU(pl)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Pay via PayU (+{pl.maxProfiles} Profiles)</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 4: HEALER PORTAL (For Admin: All Registered Healers; For Healer: 1-Line Summary & Cumulative Plan Upgrade)
         ===================================================================== */}
      {activeView === 'healer-portal' && (
        <div className="rounded-3xl bg-slate-900/95 border border-emerald-500/30 p-5 sm:p-6 shadow-xl space-y-5">
          {isAdmin ? (
            !selectedHealerAccId ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-amber-100">
                      2) Healer Portal — Registered Healers (Click Healer Name to View Healer Profile & Healer's Reports)
                    </h3>
                    <p className="text-xs text-emerald-300/80">
                      1-Line View: Healer Name • Mobile Number • Date of Registration • Profiles Used/Max (e.g. 3/10)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminRegRole('healer');
                      setAdminRegPlanId('healer_paid_10');
                      setAdminRegIsFoc(false);
                      setActiveView('master-admin-portal');
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Register New Healer (PayU)</span>
                  </button>
                </div>

                <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/25 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <div className="md:col-span-4">Healer Name (Click to Open)</div>
                  <div className="md:col-span-3">Mobile Number</div>
                  <div className="md:col-span-2">Registration Date</div>
                  <div className="md:col-span-2">Profiles (Used/Max)</div>
                  <div className="md:col-span-1 text-right">Action</div>
                </div>

                <div className="space-y-2">
                  {healerAccounts.map((healerAcc) => {
                    const usedCount = profiles.filter((p) => p.accountId === healerAcc.id).length;
                    const maxCount = healerAcc.maxProfiles || 10;
                    return (
                      <div
                        key={healerAcc.id}
                        onClick={() => setSelectedHealerAccId(healerAcc.id)}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center px-4 py-3 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-emerald-500/25 hover:border-emerald-400 transition-all cursor-pointer"
                      >
                        <div className="md:col-span-4 min-w-0 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-amber-100 hover:underline block truncate">
                              {healerAcc.name}
                            </span>
                            {healerAcc.healerBrandName && (
                              <span className="text-[10px] text-emerald-300/80 block truncate">
                                {healerAcc.healerBrandName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-3 flex md:block items-center justify-between font-mono text-xs text-amber-200">
                          <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-sans">
                            Mobile Number
                          </span>
                          <span>📞 {healerAcc.mobile}</span>
                        </div>
                        <div className="md:col-span-2 flex md:block items-center justify-between font-mono text-xs text-slate-300">
                          <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-sans">
                            Registration Date
                          </span>
                          <span>📅 {healerAcc.subscriptionStart || healerAcc.createdAtIso.slice(0, 10)}</span>
                        </div>
                        <div className="md:col-span-2 flex md:block items-center justify-between">
                          <span className="md:hidden text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            Profiles (Used/Max)
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-200 font-mono text-xs font-bold">
                            {usedCount}/{maxCount}
                          </span>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <span className="text-xs font-bold text-emerald-400">Open →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              (() => {
                const selectedHealer = accounts.find((a) => a.id === selectedHealerAccId);
                if (!selectedHealer) return null;
                const healerProfs = profiles.filter((p) => p.accountId === selectedHealer.id);
                return (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                      <button
                        type="button"
                        onClick={() => setSelectedHealerAccId(null)}
                        className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to All Healers</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenBlankProfileTab(selectedHealer.id, 'healer-client')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Add Client Report Under {selectedHealer.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAccount(selectedHealer)}
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Healer Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            adminDeleteAccount(selectedHealer.id);
                            setSelectedHealerAccId(null);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Healer</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-serif text-base font-bold text-amber-100">
                        Client Reports Generated by {selectedHealer.name} (Click Client Name to Open Vedic Dashboard)
                      </h4>
                      {healerProfs.length === 0 ? (
                        <p className="text-xs text-slate-400">No client reports generated by this Healer yet.</p>
                      ) : (
                        <>
                          {renderSavedProfilesTableHeader()}
                          {healerProfs.map((prof) => renderSavedClientRow(prof))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })()
            )
          ) : (
            /* HEALER'S OWN 1-LINE SUMMARY, CUSTOM LOGO / WATERMARK BRANDING & CUMULATIVE PLAN UPGRADE */
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 px-4 py-3.5 rounded-2xl bg-slate-950 border border-emerald-500/35 items-center text-xs">
                <div>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                    Healer Name
                  </span>
                  <strong className="text-amber-100 text-sm">{currentAccount.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                    Mobile Number
                  </span>
                  <strong className="text-amber-200 font-mono">📞 {currentAccount.mobile}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                    Date of Registration
                  </span>
                  <strong className="text-slate-200 font-mono">
                    📅 {currentAccount.subscriptionStart || currentAccount.createdAtIso.slice(0, 10)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                    Profiles Left to Generate
                  </span>
                  <strong className="text-emerald-300 font-mono text-sm">
                    {myProfiles.length}/{currentAccount.maxProfiles}
                  </strong>
                </div>
              </div>

              {/* HEALER CUSTOM LOGO & A4 CENTER WATERMARK BRANDING STUDIO */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-amber-100">
                      Your Healer Logo & A4 Report Center Watermark
                    </h4>
                    <p className="text-xs text-emerald-300/80">
                      Your uploaded Healer Logo and Center Brand Name automatically appear as both the top report logo and the centered A4 watermark on every client report you generate.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900 px-3 py-2 rounded-xl border border-emerald-500/30 shrink-0">
                    <img
                      src={currentAccount.healerLogoUrl || TATHASTU_LOGO_PATH}
                      alt={currentAccount.healerBrandName || currentAccount.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-amber-400"
                    />
                    <div className="text-xs">
                      <span className="text-[10px] uppercase text-emerald-400 font-bold block">
                        Active Report Watermark & Logo
                      </span>
                      <strong className="text-amber-100 block">
                        {currentAccount.healerBrandName || currentAccount.name}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
                  <div>
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                      Healer Center / Brand Name (Shown on Report & Watermark)
                    </label>
                    <input
                      type="text"
                      value={currentAccount.healerBrandName || ''}
                      onChange={(e) =>
                        adminUpdateAccount({
                          ...currentAccount,
                          healerBrandName: e.target.value,
                        })
                      }
                      placeholder="e.g. Pranic Lotus Healing Studio"
                      className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                      Healer Logo Image URL (or Upload File →)
                    </label>
                    <input
                      type="text"
                      value={currentAccount.healerLogoUrl || ''}
                      onChange={(e) =>
                        adminUpdateAccount({
                          ...currentAccount,
                          healerLogoUrl: e.target.value,
                        })
                      }
                      placeholder="Paste logo URL or upload image"
                      className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload My Healer Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              adminUpdateAccount({
                                ...currentAccount,
                                healerLogoUrl: reader.result,
                              });
                              setStatusFeedback({
                                type: 'success',
                                text: 'Your Healer Logo & A4 Center Watermark have been updated for all your client reports!',
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* DIRECT WHATSAPP API CONNECTION HUB FOR HEALER PORTAL */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-emerald-200 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>Direct WhatsApp API Connection Hub (1-Click Client Messaging)</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      Send one-click WhatsApp messages to your clients for Specific Vedic Events, Full Report Sharing with QR Link, and Live Auspicious Time Updates.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-bold">
                    WHATSAPP API CONNECTED
                  </span>
                </div>

                {myProfiles.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/25">
                    <div className="lg:col-span-4">
                      <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                        Select Client for 1-Click WhatsApp Dispatch
                      </label>
                      <select
                        value={selectedWaClientProfileId || myProfiles[0]?.id || ''}
                        onChange={(e) => setSelectedWaClientProfileId(e.target.value)}
                        className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-amber-100"
                      >
                        {myProfiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (📞 {p.mobile} • DOB: {p.dob})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const target =
                            myProfiles.find((p) => p.id === selectedWaClientProfileId) ||
                            myProfiles[0];
                          if (target) handleWhatsAppAction(target, 'event');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-400/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>1-Click Event Muhurat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const target =
                            myProfiles.find((p) => p.id === selectedWaClientProfileId) ||
                            myProfiles[0];
                          if (target) handleWhatsAppAction(target, 'report');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>1-Click Report + QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const target =
                            myProfiles.find((p) => p.id === selectedWaClientProfileId) ||
                            myProfiles[0];
                          if (target) handleWhatsAppAction(target, 'goodtime');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>1-Click Auspicious Time</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-serif text-base font-bold text-emerald-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Upgrade Healer Plan via PayU (Purchased Profiles Add Into Existing Quota)</span>
                  </h4>
                  <input
                    type="text"
                    value={upgradeCouponCode}
                    onChange={(e) => setUpgradeCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon Code (e.g. HEALER500)"
                    className="bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-200 font-mono uppercase w-52"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {plans
                    .filter((p) => p.role === 'healer' && p.priceInr > 0)
                    .map((pl) => (
                      <div
                        key={pl.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <span className="text-xs font-bold text-amber-100 block">{pl.name}</span>
                          <span className="text-lg font-black font-mono text-amber-300 block mt-1">
                            ₹{pl.priceInr.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-emerald-300 font-semibold block mt-1">
                            +{pl.maxProfiles} Profiles (New Total: {currentAccount.maxProfiles + pl.maxProfiles})
                          </span>
                          <span className="text-[10px] text-amber-200/80 block mt-0.5">
                            +{pl.durationMonths} Months Validity Added
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlanActivationOrPayU(pl)}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Pay via PayU (+{pl.maxProfiles} Profiles)</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 5: MASTER ADMIN PORTAL (Registration, Broadcast Push, Coupons, Plan Editor)
         ===================================================================== */}
      {isAdmin && activeView === 'master-admin-portal' && (
        <div className="space-y-6 animate-fade-in">
          {/* A. Register New Client or New Healer */}
          <div className="rounded-3xl bg-slate-900/95 border border-amber-500/35 p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <span>1. Register New Client or New Healer Account</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminRegRole('client');
                    setAdminRegPlanId('client_paid_12m');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    adminRegRole === 'client'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-amber-200 border border-amber-500/30'
                  }`}
                >
                  + New Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminRegRole('healer');
                    setAdminRegPlanId('healer_paid_10');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    adminRegRole === 'healer'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-emerald-200 border border-emerald-500/30'
                  }`}
                >
                  + New Healer
                </button>
              </div>
            </div>

            <form onSubmit={handleAdminRegisterNewAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-amber-300 block mb-1">
                    {adminRegRole === 'client' ? 'Client Full Name *' : 'Healer Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={adminRegName}
                    onChange={(e) => setAdminRegName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  />
                </div>

                {adminRegRole === 'client' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        Gender (Auto Groom / Bride) *
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAdminRegGender('male')}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            adminRegGender !== 'female'
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 text-amber-200 border-amber-500/35'
                          }`}
                        >
                          ♂ Male (Groom)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminRegGender('female')}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            adminRegGender === 'female'
                              ? 'bg-pink-500 text-slate-950 border-pink-400'
                              : 'bg-slate-950 text-pink-200 border-pink-500/35'
                          }`}
                        >
                          ♀ Female (Bride)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={adminRegDob}
                        onChange={(e) => setAdminRegDob(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        Birth Time (AM / PM) — {formatTime12HourAmPm(adminRegTob || '09:30')}
                      </label>
                      <BirthTimeAmPmInput
                        value={adminRegTob || '09:30'}
                        onChange={(val) => setAdminRegTob(val)}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        Birth City, State & Country (Type 1st 3 Letters)
                      </label>
                      <CityAutocompleteInput
                        value={adminRegPob}
                        lat={adminRegLat}
                        lng={adminRegLng}
                        onChangeText={(txt) => setAdminRegPob(txt)}
                        onSelectCity={(res) => {
                          setAdminRegPob(res.formattedPob);
                          setAdminRegLat(res.lat);
                          setAdminRegLng(res.lng);
                        }}
                        placeholder="Type 1st 3 letters (e.g. Del, Mum, Jai)..."
                        inputClassName="w-full bg-slate-950 border border-amber-500/35 rounded-xl pl-9 pr-8 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] font-bold text-amber-300 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={adminRegEmail}
                    onChange={(e) => setAdminRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-amber-300 block mb-1">
                    10-Digit Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={adminRegMobile}
                    onChange={(e) => setAdminRegMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-amber-300 block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminRegPass ? 'text' : 'password'}
                      required
                      value={adminRegPassword}
                      onChange={(e) => setAdminRegPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/35 rounded-xl pl-3 pr-16 py-2 text-xs text-amber-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminRegPass((prev) => !prev)}
                      className="absolute right-2 top-1.5 px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showAdminRegPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-amber-300 block mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={adminRegPlanId}
                    onChange={(e) => setAdminRegPlanId(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  >
                    {plans
                      .filter((p) => p.role === adminRegRole && (adminRegIsFoc || p.priceInr > 0))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({adminRegIsFoc ? 'F.O.C. FREE' : `₹${p.priceInr}`} • {p.maxProfiles} Profiles)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {adminRegRole === 'healer' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-amber-500/15">
                  <div>
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                      Healer Clinic / Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminRegHealerBrand}
                      onChange={(e) => setAdminRegHealerBrand(e.target.value)}
                      placeholder="Center Name"
                      className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                      Healer Logo Upload / URL
                    </label>
                    <div className="flex items-center gap-1.5">
                      <label className="px-2.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHealerLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={adminRegHealerLogo}
                        onChange={(e) => setAdminRegHealerLogo(e.target.value)}
                        placeholder="Logo URL"
                        className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                      Instagram / Social Handle
                    </label>
                    <input
                      type="text"
                      value={adminRegHealerInsta}
                      onChange={(e) => setAdminRegHealerInsta(e.target.value)}
                      placeholder="@handle"
                      className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                      Address / Website
                    </label>
                    <input
                      type="text"
                      value={adminRegHealerAddress}
                      onChange={(e) => setAdminRegHealerAddress(e.target.value)}
                      placeholder="City & Website"
                      className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-amber-500/15">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-emerald-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminRegIsFoc}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAdminRegIsFoc(checked);
                        if (!checked) {
                          const currentPlan = plans.find((p) => p.id === adminRegPlanId);
                          if (!currentPlan || currentPlan.priceInr <= 0) {
                            const firstPaid = plans.find(
                              (p) => p.role === adminRegRole && p.priceInr > 0
                            );
                            if (firstPaid) setAdminRegPlanId(firstPaid.id);
                          }
                        }
                      }}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>Activate Free of Cost (F.O.C. — Skip PayU)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-amber-200 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminRegSwitchToAccountAfterPayU}
                      onChange={(e) => setAdminRegSwitchToAccountAfterPayU(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span>
                      Redirect &amp; Open New {adminRegRole.toUpperCase()}'s Activated Plan After Payment
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {!adminRegIsFoc &&
                    (plans.find((p) => p.id === adminRegPlanId)?.priceInr ?? 0) > 0
                      ? `Register ${adminRegRole.toUpperCase()} Account → Proceed to PayU (₹${plans
                          .find((p) => p.id === adminRegPlanId)
                          ?.priceInr.toLocaleString('en-IN')})`
                      : `Register ${adminRegRole.toUpperCase()} Account`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* A2. Direct WhatsApp API Connection Hub & Cloud API Configuration (Master Admin) */}
          <div className="rounded-3xl bg-slate-900/95 border border-emerald-500/40 p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Direct WhatsApp API Connection Hub (1-Click Events, Reports & Auspicious Time)</span>
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Instantly dispatch 1-click WhatsApp updates to any client or configure Meta WhatsApp Business Cloud API credentials.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={whatsAppConfig.mode}
                  onChange={(e) => {
                    const updated: WhatsAppApiConfig = {
                      ...whatsAppConfig,
                      mode: e.target.value as 'direct_web_api' | 'cloud_business_api',
                    };
                    setWhatsAppConfig(updated);
                    saveWhatsAppApiConfig(updated);
                  }}
                  className="bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-200 font-bold"
                >
                  <option value="direct_web_api">Mode: Direct 1-Click WhatsApp API (Instant)</option>
                  <option value="cloud_business_api">Mode: Meta WhatsApp Cloud Business API</option>
                </select>
              </div>
            </div>

            {whatsAppConfig.mode === 'cloud_business_api' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30">
                <div>
                  <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                    WhatsApp Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={whatsAppConfig.phoneNumberId}
                    onChange={(e) => {
                      const updated = { ...whatsAppConfig, phoneNumberId: e.target.value };
                      setWhatsAppConfig(updated);
                      saveWhatsAppApiConfig(updated);
                    }}
                    placeholder="e.g. 109283746512345"
                    className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                    Meta Permanent Access Token
                  </label>
                  <input
                    type="password"
                    value={whatsAppConfig.accessToken}
                    onChange={(e) => {
                      const updated = { ...whatsAppConfig, accessToken: e.target.value };
                      setWhatsAppConfig(updated);
                      saveWhatsAppApiConfig(updated);
                    }}
                    placeholder="EAAGm0PX4ZCps..."
                    className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                    Business Sender Name
                  </label>
                  <input
                    type="text"
                    value={whatsAppConfig.businessDisplayName}
                    onChange={(e) => {
                      const updated = { ...whatsAppConfig, businessDisplayName: e.target.value };
                      setWhatsAppConfig(updated);
                      saveWhatsAppApiConfig(updated);
                    }}
                    placeholder="TATHASTU THE DIVINE LIGHT"
                    className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  />
                </div>
              </div>
            )}

            {profiles.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end bg-slate-950 p-4 rounded-2xl border border-emerald-500/30">
                <div className="lg:col-span-4">
                  <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                    Select Any Client Profile for 1-Click WhatsApp Dispatch
                  </label>
                  <select
                    value={selectedWaClientProfileId || profiles[0]?.id || ''}
                    onChange={(e) => setSelectedWaClientProfileId(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-amber-100"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (📞 {p.mobile} • DOB: {p.dob})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target =
                        profiles.find((p) => p.id === selectedWaClientProfileId) || profiles[0];
                      if (target) handleWhatsAppAction(target, 'event');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-400/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1-Click Event Muhurat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target =
                        profiles.find((p) => p.id === selectedWaClientProfileId) || profiles[0];
                      if (target) handleWhatsAppAction(target, 'report');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>1-Click Report + QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target =
                        profiles.find((p) => p.id === selectedWaClientProfileId) || profiles[0];
                      if (target) handleWhatsAppAction(target, 'goodtime');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>1-Click Auspicious Time</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* B. Broadcast Push Notification & Discount Coupons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-slate-900/95 border border-amber-500/35 p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>2. Push Notification &amp; App Update Broadcast</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    adminSendBroadcastNotification({
                      title: 'New App Update v4.8 Live (No Uninstall Needed)',
                      message:
                        'Full Multi-Page PDF Engine, Vedic Yoga & 7-Day Planner, and Opt-In Partner Milan are now live! Tap "Apply App Update Now (No Uninstall)" to refresh in 1 click.',
                      category: 'update',
                      targetAudience: 'all',
                    });
                    setStatusFeedback({
                      type: 'success',
                      text: 'Live App Update pushed to all Client & Healer devices (in-place update without uninstall)!',
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Send className="w-3 h-3" />
                  <span>1-Click Push App Update</span>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!bcastTitle.trim() || !bcastMessage.trim()) return;
                  adminSendBroadcastNotification({
                    title: bcastTitle,
                    message: bcastMessage,
                    category: bcastCategory,
                    targetAudience: bcastAudience,
                    couponCode: bcastCoupon || undefined,
                  });
                  setBcastTitle('');
                  setBcastMessage('');
                  setBcastCoupon('');
                  setStatusFeedback({
                    type: 'success',
                    text: 'Push notification broadcasted in real time to all users!',
                  });
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={bcastCategory}
                    onChange={(e) =>
                      setBcastCategory(
                        e.target.value as 'update' | 'offer' | 'muhurat' | 'announcement'
                      )
                    }
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  >
                    <option value="offer">Special Offer / Discount</option>
                    <option value="update">App Update</option>
                    <option value="muhurat">Auspicious Muhurat Alert</option>
                    <option value="announcement">General Announcement</option>
                  </select>

                  <select
                    value={bcastAudience}
                    onChange={(e) =>
                      setBcastAudience(e.target.value as 'all' | 'client' | 'healer')
                    }
                    className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  >
                    <option value="all">All Users (Clients + Healers)</option>
                    <option value="client">Clients Only</option>
                    <option value="healer">Healers Only</option>
                  </select>
                </div>

                <input
                  type="text"
                  required
                  value={bcastTitle}
                  onChange={(e) => setBcastTitle(e.target.value)}
                  placeholder="Notification Title"
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />

                <textarea
                  rows={2}
                  required
                  value={bcastMessage}
                  onChange={(e) => setBcastMessage(e.target.value)}
                  placeholder="Enter update or offer message..."
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={bcastCoupon}
                    onChange={(e) => setBcastCoupon(e.target.value.toUpperCase())}
                    placeholder="Attach Coupon (Optional)"
                    className="bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100 font-mono uppercase flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Push</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-3 border-t border-amber-500/20 max-h-40 overflow-y-auto">
                {broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-200">{b.title}</span>
                      <p className="text-[11px] text-slate-400">{b.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminDeleteBroadcast(b.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* C. Discount Coupon Generator */}
            <div className="rounded-3xl bg-slate-900/95 border border-emerald-500/35 p-6 shadow-xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                <span>3. Discount Coupon Generator</span>
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!couponCode.trim()) return;
                  adminCreateCoupon({
                    code: couponCode,
                    discountPercent: couponPercent,
                    flatDiscountInr: couponFlat,
                    targetRole: couponRole,
                    expiryDate: couponExpiry,
                    isActive: true,
                  });
                  setCouponCode('');
                  setStatusFeedback({
                    type: 'success',
                    text: `Discount coupon "${couponCode.toUpperCase()}" created!`,
                  });
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon Code (e.g. DIVINE25)"
                    className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-emerald-200 font-mono uppercase"
                  />

                  <select
                    value={couponRole}
                    onChange={(e) =>
                      setCouponRole(e.target.value as 'all' | 'client' | 'healer')
                    }
                    className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  >
                    <option value="all">All (Clients & Healers)</option>
                    <option value="client">Clients Only</option>
                    <option value="healer">Healers Only</option>
                  </select>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={couponPercent}
                    onChange={(e) => setCouponPercent(Number(e.target.value))}
                    placeholder="Discount %"
                    className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  />

                  <input
                    type="number"
                    min={0}
                    value={couponFlat}
                    onChange={(e) => setCouponFlat(Number(e.target.value))}
                    placeholder="Flat ₹ Discount"
                    className="w-full bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="date"
                    value={couponExpiry}
                    onChange={(e) => setCouponExpiry(e.target.value)}
                    className="bg-slate-950 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    + Generate Coupon
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-3 border-t border-emerald-500/20 max-h-40 overflow-y-auto">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/25 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-mono font-black text-emerald-300">{c.code}</span>
                      <span className="text-slate-300 ml-2">
                        ({c.discountPercent > 0 ? `${c.discountPercent}% OFF` : `₹${c.flatDiscountInr} OFF`})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adminToggleCoupon(c.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          c.isActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Paused'}
                      </button>
                      <button
                        type="button"
                        onClick={() => adminDeleteCoupon(c.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* D. Subscription Plans Manager */}
          <div className="rounded-3xl bg-slate-900/95 border border-amber-500/35 p-6 shadow-xl space-y-5">
            <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>4. Subscription Plans Manager (Edit Price / Profiles or Add New Plan)</span>
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPlanName.trim()) return;
                const created: SubscriptionPlanOption = {
                  id: `${newPlanRole}_custom_${Date.now()}`,
                  role: newPlanRole,
                  name: newPlanName.trim(),
                  durationMonths: newPlanMonths,
                  priceInr: newPlanPrice,
                  maxProfiles: newPlanProfiles,
                  canDownloadShare: newPlanPrice > 0,
                  badge: `${newPlanProfiles} Profiles • ₹${newPlanPrice}`,
                  features: [
                    `Up to ${newPlanProfiles} Profiles / Reports`,
                    `${newPlanMonths} Months Access`,
                    newPlanPrice > 0
                      ? 'Full A4 Report Download, Print, Share & Direct WhatsApp'
                      : 'View Only Trial Plan',
                  ],
                };
                adminSavePlan(created);
                setNewPlanName('');
                setStatusFeedback({
                  type: 'success',
                  text: `Added new ${newPlanRole.toUpperCase()} plan "${created.name}"!`,
                });
              }}
              className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
            >
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Role
                </label>
                <select
                  value={newPlanRole}
                  onChange={(e) => setNewPlanRole(e.target.value as 'client' | 'healer')}
                  className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                >
                  <option value="client">Client Plan</option>
                  <option value="healer">Healer Plan</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="e.g. Healer 100 Profiles Plan"
                  className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Max Profiles
                </label>
                <input
                  type="number"
                  min={1}
                  value={newPlanProfiles}
                  onChange={(e) => setNewPlanProfiles(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  + Add Plan
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {plans.map((pl) => (
                <div
                  key={pl.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-amber-500/25 flex flex-col justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {pl.role.toUpperCase()}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-amber-100 mt-1.5">
                      {pl.name}
                    </h4>
                    <div className="text-base font-black font-mono text-amber-300 mt-1">
                      ₹{pl.priceInr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Max Profiles: <strong>{pl.maxProfiles}</strong> • {pl.durationMonths} Months
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-amber-500/15">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(pl)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => adminDeletePlan(pl.id)}
                      className="py-1.5 px-2.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* E. Real-Time Client & Healer Feedback & Suggestions Inbox (Live Synced to Admin Dashboard) */}
          <div className="rounded-3xl bg-slate-900/95 border-2 border-amber-500/40 p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-amber-400" />
                  <span>
                    5. Real-Time Client &amp; Healer Feedback &amp; Suggestions Inbox ({feedbacks.length})
                  </span>
                </h3>
                <p className="text-xs text-amber-300/80">
                  Every feedback, suggestion, or appreciation submitted by any Client or Healer appears here in real time.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </span>
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No feedback or suggestions submitted yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-amber-200">{fb.senderName}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-[10px] font-bold uppercase">
                          {fb.senderRole}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase">
                          {fb.category}
                        </span>
                        <span className="text-amber-400 text-xs font-bold">
                          {'★'.repeat(fb.rating)} ({fb.rating}/5)
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          📞 {fb.senderMobile} • {fb.senderEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {(fb.createdAtIso || '').slice(0, 16).replace('T', ' ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => adminDeleteFeedback(fb.id)}
                          className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 cursor-pointer"
                          title="Delete Feedback"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      {fb.message}
                    </p>

                    {fb.adminReply && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200">
                        <strong className="text-emerald-400">Your Reply: </strong>
                        {fb.adminReply}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={feedbackReplyDrafts[fb.id] ?? ''}
                        onChange={(e) =>
                          setFeedbackReplyDrafts((prev) => ({
                            ...prev,
                            [fb.id]: e.target.value,
                          }))
                        }
                        placeholder="Write direct reply from Healer Ddeepak Jain (synced live to user)..."
                        className="flex-1 bg-slate-900 border border-amber-500/35 rounded-xl px-3 py-1.5 text-xs text-amber-100"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const txt = (feedbackReplyDrafts[fb.id] || '').trim();
                          if (!txt) return;
                          await adminReplyToFeedback(fb.id, txt);
                          setFeedbackReplyDrafts((prev) => ({ ...prev, [fb.id]: '' }));
                          setStatusFeedback({
                            type: 'success',
                            text: `Reply sent in real time to ${fb.senderName}!`,
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          HEALER DDEEPAK JAIN INTRODUCTION, MISSION, ANTI-FRAUD SHIELD,
          APP MOTIVE VISUALS, TATHASTU FAMILY THANKS & REAL-TIME FEEDBACK HUB
          (Always visible for Client & Healer; also shown on Saved Profiles for Admin)
         ===================================================================== */}
      {(isClient || isHealer || activeView === 'saved-profiles') && (
        <HealerDeepakJainMissionShowcase />
      )}

      {/* =====================================================================
          MODAL: ADMIN EDIT PROFILE
         ===================================================================== */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-black text-amber-100">
                Edit &amp; Save Report + {editingProfile.gender === 'female' ? 'Groom' : 'Bride'} / Partner Details ({editingProfile.name})
              </h3>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  editingProfile.gender === 'female'
                    ? 'bg-pink-500/20 text-pink-200 border-pink-400/50'
                    : 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                }`}
              >
                {editingProfile.gender === 'female'
                  ? '♀ Female Profile ➔ Auto-Shown in Bride'
                  : '♂ Male Profile ➔ Auto-Shown in Groom'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Client ({editingProfile.gender === 'female' ? 'Bride' : 'Groom'}) Full Name
                </label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Gender (Auto-Maps to Groom / Bride) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const curPartner = (editingProfile.partnerName || '').trim();
                      setEditingProfile({
                        ...editingProfile,
                        gender: 'male',
                        partnerName:
                          !curPartner || curPartner.toLowerCase() === 'rohit sharma'
                            ? 'Priyanka Sharma'
                            : curPartner,
                        partnerDob:
                          !editingProfile.partnerDob || editingProfile.partnerDob === '1988-06-15'
                            ? '1990-11-24'
                            : editingProfile.partnerDob,
                      });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editingProfile.gender !== 'female'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 text-amber-200 border-amber-500/35'
                    }`}
                  >
                    ♂ Male (Groom)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const curPartner = (editingProfile.partnerName || '').trim();
                      setEditingProfile({
                        ...editingProfile,
                        gender: 'female',
                        partnerName:
                          !curPartner || curPartner.toLowerCase() === 'priyanka sharma'
                            ? 'Rohit Sharma'
                            : curPartner,
                        partnerDob:
                          !editingProfile.partnerDob || editingProfile.partnerDob === '1990-11-24'
                            ? '1988-06-15'
                            : editingProfile.partnerDob,
                      });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editingProfile.gender === 'female'
                        ? 'bg-pink-500 text-slate-950 border-pink-400 shadow-md'
                        : 'bg-slate-950 text-pink-200 border-pink-500/35'
                    }`}
                  >
                    ♀ Female (Bride)
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={editingProfile.dob}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, dob: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Birth Time (AM / PM) — {formatTime12HourAmPm(editingProfile.tob || '09:30')}
                </label>
                <BirthTimeAmPmInput
                  value={editingProfile.tob || '09:30'}
                  onChange={(newTob) =>
                    setEditingProfile({ ...editingProfile, tob: newTob })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Birth Place City, State &amp; Country (Type 1st 3 Letters for Exact Lat/Lng)
                </label>
                <CityAutocompleteInput
                  value={editingProfile.pob}
                  lat={editingProfile.lat}
                  lng={editingProfile.lng}
                  onChangeText={(txt) =>
                    setEditingProfile({ ...editingProfile, pob: txt })
                  }
                  onSelectCity={(res) =>
                    setEditingProfile({
                      ...editingProfile,
                      pob: res.formattedPob,
                      lat: res.lat,
                      lng: res.lng,
                    })
                  }
                  placeholder="Type 1st 3 letters (e.g. Del, Mum, Jai)..."
                  inputClassName="w-full bg-slate-950 border border-amber-500/35 rounded-xl pl-9 pr-8 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">Email</label>
                <input
                  type="email"
                  value={editingProfile.email}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, email: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">Mobile</label>
                <input
                  type="text"
                  value={editingProfile.mobile}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, mobile: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>

              {/* Partner 2 Section (Bride if Client is Male; Groom if Client is Female) */}
              <div className="sm:col-span-2 pt-3 border-t border-rose-500/25 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block">
                    {editingProfile.gender === 'female' ? 'Groom' : 'Bride'} / Life Partner Details (For Partner Milan &amp; PDF Report)
                  </span>
                  <label className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-pink-500/40 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProfile.includePartnerMilan)}
                      onChange={(e) =>
                        setEditingProfile({
                          ...editingProfile,
                          includePartnerMilan: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-pink-200">
                      Include Partner Milan in Dashboard &amp; PDF Report
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-rose-300 block mb-1">
                  {editingProfile.gender === 'female' ? 'Groom' : 'Bride'} / Partner Full Name
                </label>
                <input
                  type="text"
                  value={
                    editingProfile.partnerName ||
                    (editingProfile.gender === 'female' ? 'Rohit Sharma' : 'Priyanka Sharma')
                  }
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, partnerName: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-rose-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                  placeholder={`Enter ${editingProfile.gender === 'female' ? 'Groom' : 'Bride'} Full Name`}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-rose-300 block mb-1">
                  {editingProfile.gender === 'female' ? 'Groom' : 'Bride'} / Partner Date of Birth
                </label>
                <input
                  type="date"
                  value={
                    editingProfile.partnerDob ||
                    (editingProfile.gender === 'female' ? '1988-06-15' : '1990-11-24')
                  }
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, partnerDob: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-rose-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-rose-300 block mb-1">
                  {editingProfile.gender === 'female' ? 'Groom' : 'Bride'} Birth Time (AM / PM) — {formatTime12HourAmPm(editingProfile.partnerTob || (editingProfile.gender === 'female' ? '10:30' : '14:20'))}
                </label>
                <BirthTimeAmPmInput
                  value={editingProfile.partnerTob || (editingProfile.gender === 'female' ? '10:30' : '14:20')}
                  onChange={(newTob) =>
                    setEditingProfile({ ...editingProfile, partnerTob: newTob })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-rose-300 block mb-1">
                  {editingProfile.gender === 'female' ? 'Groom' : 'Bride'} Birth Place City, State &amp; Country (Type 1st 3 Letters)
                </label>
                <CityAutocompleteInput
                  value={editingProfile.partnerPob || 'Mumbai, Maharashtra, India'}
                  lat={editingProfile.partnerLat ?? 19.0760}
                  lng={editingProfile.partnerLng ?? 72.8777}
                  onChangeText={(txt) =>
                    setEditingProfile({ ...editingProfile, partnerPob: txt })
                  }
                  onSelectCity={(res) =>
                    setEditingProfile({
                      ...editingProfile,
                      partnerPob: res.formattedPob,
                      partnerLat: res.lat,
                      partnerLng: res.lng,
                    })
                  }
                  placeholder={`Type 1st 3 letters of ${editingProfile.gender === 'female' ? 'Groom' : 'Bride'} Birth City...`}
                  inputClassName="w-full bg-slate-950 border border-rose-500/35 rounded-xl pl-9 pr-8 py-2 text-xs text-amber-100 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await adminUpdateProfile(editingProfile);
                  if (!res.ok) {
                    setStatusFeedback({
                      type: 'error',
                      text: res.error || 'Could not update profile.',
                    });
                    return;
                  }
                  setEditingProfile(null);
                  setStatusFeedback({
                    type: 'success',
                    text: 'Report & Bride / Partner details saved and synced to PDF!',
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer shadow-lg"
              >
                Save Report & Bride Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADMIN EDIT ACCOUNT
         ===================================================================== */}
      {isAdmin && editingAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-black text-amber-100">
              Admin Override: Edit {editingAccount.role.toUpperCase()} Account ({editingAccount.name})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">Name</label>
                <input
                  type="text"
                  value={editingAccount.name}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">Mobile</label>
                <input
                  type="text"
                  value={editingAccount.mobile}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, mobile: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">Email</label>
                <input
                  type="email"
                  value={editingAccount.email}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, email: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Max Profiles Quota
                </label>
                <input
                  type="number"
                  value={editingAccount.maxProfiles}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      maxProfiles: Number(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-emerald-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAccount.canDownloadShare}
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        canDownloadShare: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span>Enable Report Download, Print, Share & Direct WhatsApp</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await adminUpdateAccount(editingAccount);
                  if (!res.ok) {
                    setStatusFeedback({
                      type: 'error',
                      text: res.error || 'Could not update account.',
                    });
                    return;
                  }
                  setEditingAccount(null);
                  setStatusFeedback({
                    type: 'success',
                    text: 'Account updated by Admin in real time.',
                  });
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer"
              >
                Save Account Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADMIN EDIT SUBSCRIPTION PLAN
         ===================================================================== */}
      {isAdmin && editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-black text-amber-100">
              Edit Plan: {editingPlan.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Plan Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingPlan.priceInr}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, priceInr: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Number of Profiles Allowed
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingPlan.maxProfiles}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, maxProfiles: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-xs text-amber-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  adminSavePlan({
                    ...editingPlan,
                    badge: `${editingPlan.maxProfiles} Profiles • ₹${editingPlan.priceInr}`,
                  });
                  setEditingPlan(null);
                  setStatusFeedback({
                    type: 'success',
                    text: 'Subscription plan updated in real time!',
                  });
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: PAYU PAYMENT GATEWAY CHECKOUT (CLIENT & HEALER UPGRADES)
         ===================================================================== */}
      {payUCheckoutPlan && (
        <PayUPaymentModal
          isOpen={!!payUCheckoutPlan}
          onClose={() => setPayUCheckoutPlan(null)}
          plan={payUCheckoutPlan}
          customerName={currentAccount.name}
          customerEmail={currentAccount.email}
          customerMobile={currentAccount.mobile}
          coupons={coupons}
          initialCouponCode={upgradeCouponCode}
          isCumulativeHealerUpgrade={true}
          currentMaxProfiles={currentAccount.maxProfiles}
          onPaymentSuccess={async ({ transactionId, finalAmountInr, couponCode }) => {
            const res = await upgradeAccountPlan(
              currentAccount.id,
              payUCheckoutPlan.id,
              couponCode || upgradeCouponCode
            );
            if (res.ok) {
              setStatusFeedback({
                type: 'success',
                text: `PayU Payment Verified (${transactionId} — ₹${finalAmountInr})! Added +${payUCheckoutPlan.maxProfiles} Profiles & +${payUCheckoutPlan.durationMonths} Months from ${payUCheckoutPlan.name} into your existing plan. You can now create your new profile below!`,
              });
              // Automatically transition to + New Profile blank form after plan add-on purchase
              setTargetAccountForNewProfile(currentAccount.id);
              setNewRelationTag(isClient ? 'family' : 'healer-client');
              setNewName('');
              setNewDob('');
              setNewTob('09:30');
              setNewPob('');
              setActiveView('new-profile');
            } else {
              setStatusFeedback({
                type: 'error',
                text: res.error || 'Could not upgrade plan.',
              });
            }
          }}
        />
      )}

      {/* =====================================================================
          MODAL: PAYU PAYMENT GATEWAY FOR NEW CLIENT / HEALER REGISTRATION
         ===================================================================== */}
      {adminRegPayUPlan && (
        <PayUPaymentModal
          isOpen={!!adminRegPayUPlan}
          onClose={() => setAdminRegPayUPlan(null)}
          plan={adminRegPayUPlan}
          customerName={adminRegName}
          customerEmail={adminRegEmail}
          customerMobile={adminRegMobile}
          coupons={coupons}
          initialCouponCode={adminRegCouponCode}
          isCumulativeHealerUpgrade={false}
          currentMaxProfiles={0}
          onPaymentSuccess={async ({ transactionId, finalAmountInr, couponCode }) => {
            await executeAdminRegistrationAfterPayUOrFoc(
              couponCode,
              transactionId,
              finalAmountInr
            );
          }}
        />
      )}

      {/* =====================================================================
          MODAL: DYNAMIC QR CODE FOR MOBILE PDF REPORT ACCESS
         ===================================================================== */}
      {qrPreviewProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-amber-500/25 pb-3">
              <div className="flex items-center gap-2 text-left">
                <QrCode className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif text-base font-black text-amber-100">
                    Dynamic Report QR — {qrPreviewProfile.name}
                  </h3>
                  <p className="text-[10px] text-emerald-300 font-mono">
                    Quick Mobile Access to Full Personalized PDF Report
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrPreviewProfile(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {qrPreviewDataUrl && (
              <div className="p-4 rounded-2xl bg-amber-100 border-2 border-amber-400 inline-block mx-auto shadow-xl">
                <img
                  src={qrPreviewDataUrl}
                  alt={`QR Code for ${qrPreviewProfile.name}`}
                  className="w-48 h-48 object-contain mx-auto"
                />
                <span className="block text-[10px] font-mono font-black text-slate-950 mt-1.5">
                  SCAN FOR MOBILE PDF REPORT
                </span>
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed">
              This dynamic QR code is automatically embedded on <strong className="text-amber-200">{qrPreviewProfile.name}</strong>'s printed A4 report. Scanning it with any phone opens the personalized PDF report on mobile.
            </p>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-[10px] text-sky-300 break-all text-left">
              {getClientReportDirectUrl(qrPreviewProfile)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`${getClientReportDirectUrl(qrPreviewProfile)}&autoDownloadPdf=1`}
                onClick={(e) => {
                  e.preventDefault();
                  const profId = qrPreviewProfile.id;
                  setQrPreviewProfile(null);
                  window.history.replaceState(
                    {},
                    '',
                    `${window.location.pathname}?reportProfileId=${encodeURIComponent(profId)}&autoDownloadPdf=1`
                  );
                  handleClickClientNameToOpenVedicDashboard(profId);
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF via Link</span>
              </a>

              <button
                type="button"
                onClick={() => handleWhatsAppAction(qrPreviewProfile, 'report')}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Download Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const linkUrl = `${getClientReportDirectUrl(qrPreviewProfile)}&autoDownloadPdf=1`;
                  navigator.clipboard.writeText(linkUrl);
                  setStatusFeedback({
                    type: 'success',
                    text: `Direct PDF Download Link copied for ${qrPreviewProfile.name}!`,
                  });
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Download Link</span>
              </button>

              {qrPreviewDataUrl && (
                <a
                  href={qrPreviewDataUrl}
                  download={`Tathastu_QR_${qrPreviewProfile.name.replace(/\s+/g, '_')}.png`}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save QR Image</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
