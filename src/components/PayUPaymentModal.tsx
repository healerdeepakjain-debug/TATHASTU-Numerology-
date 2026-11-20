import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Sparkles,
  Tag,
  ArrowRight,
  Sliders,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Radio,
} from 'lucide-react';
import {
  useTathastu,
  SubscriptionPlanOption,
  DiscountCouponRecord,
  PayUMerchantSyncConfig,
  loadLocalPayuConfig,
  TATHASTU_APP_NAME,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_ADMIN_EMAIL,
} from '../utils/tathastuStore';

export type PayUMerchantConfig = PayUMerchantSyncConfig;

export const PENDING_PAYU_ORDER_STORAGE_KEY = 'tathastu_pending_payu_order_v1';

export function loadPayUMerchantConfig(): PayUMerchantConfig {
  return loadLocalPayuConfig();
}

export function isValidUpiVpa(vpa: string): boolean {
  const clean = (vpa || '').trim().toLowerCase();
  if (!clean || clean === 'tathastulight@payu') return false;
  return /^[a-z0-9._-]{2,64}@[a-z0-9.-]{2,32}$/i.test(clean);
}

export interface PayUCheckoutContext {
  orderType: 'new_registration' | 'admin_registration' | 'plan_upgrade';
  payload: Record<string, any>;
}

interface ActivePayuSubmission {
  txnid: string;
  gatewayUrl: string;
  fields: Record<string, string>;
  orderType: PayUCheckoutContext['orderType'];
  checkoutPayload: Record<string, any>;
  amountInr: number;
}

interface PayUPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlanOption;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  coupons: DiscountCouponRecord[];
  initialCouponCode?: string;
  isCumulativeHealerUpgrade?: boolean;
  currentMaxProfiles?: number;
  checkoutContext?: PayUCheckoutContext;
  onPaymentSuccess: (details: {
    transactionId: string;
    utrNumber?: string;
    paymentMethod: string;
    finalAmountInr: number;
    couponCode?: string;
  }) => Promise<void> | void;
}

function submitOfficialPayuPostForm(
  gatewayUrl: string,
  fields: Record<string, string>,
  target: string
) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = gatewayUrl;
  form.target = target;
  form.style.display = 'none';

  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = String(v ?? '');
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  setTimeout(() => {
    try {
      document.body.removeChild(form);
    } catch {
      // ignore
    }
  }, 500);
}

export const PayUPaymentModal: React.FC<PayUPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  customerName,
  customerEmail,
  customerMobile,
  coupons,
  initialCouponCode = '',
  isCumulativeHealerUpgrade = false,
  currentMaxProfiles = 0,
  checkoutContext,
  onPaymentSuccess,
}) => {
  const {
    payuConfig,
    adminUpdatePayuConfig,
    currentAccount,
    applyServerActivatedPayuOrder,
  } = useTathastu();
  const isAdminUser = currentAccount?.role === 'admin';

  const [couponInput, setCouponInput] = useState(initialCouponCode.toUpperCase());
  const [showCouponEditor, setShowCouponEditor] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRedirectingToPayU, setIsRedirectingToPayU] = useState(false);
  const [autoRedirectSeconds, setAutoRedirectSeconds] = useState<number>(2);
  const [autoRedirectPaused, setAutoRedirectPaused] = useState(false);
  const [showMerchantSettings, setShowMerchantSettings] = useState(false);
  const [draftConfig, setDraftConfig] = useState<PayUMerchantConfig>(payuConfig);
  const [showDraftSalt, setShowDraftSalt] = useState(false);
  const [isActivatingFreeCoupon, setIsActivatingFreeCoupon] = useState(false);

  // Live PayU real-time confirmation tracking state
  const [activeSubmission, setActiveSubmission] = useState<ActivePayuSubmission | null>(null);
  const [isCheckingStatusNow, setIsCheckingStatusNow] = useState(false);
  const [liveStatusNote, setLiveStatusNote] = useState<string>('');
  const [confirmedSuccessInfo, setConfirmedSuccessInfo] = useState<{
    txnid: string;
    mihpayid: string;
    amount: number;
  } | null>(null);

  const hasSubmittedOfficialFormRef = useRef(false);
  const activationCompletedRef = useRef(false);

  useEffect(() => {
    setDraftConfig(payuConfig);
  }, [payuConfig]);

  useEffect(() => {
    setCouponInput(initialCouponCode.toUpperCase());
  }, [initialCouponCode]);

  const discountDetails = useMemo(() => {
    const basePrice = plan.priceInr;
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      return {
        validCoupon: null as DiscountCouponRecord | null,
        discountAmount: 0,
        finalPayable: basePrice,
        message: '',
      };
    }

    const matched = coupons.find(
      (c) =>
        c.isActive &&
        c.code.toUpperCase() === cleanCode &&
        (c.targetRole === 'all' || c.targetRole === plan.role)
    );

    if (!matched) {
      return {
        validCoupon: null,
        discountAmount: 0,
        finalPayable: basePrice,
        message: 'Invalid or inactive coupon code for this role.',
      };
    }

    let discount = 0;
    if (matched.discountPercent > 0) {
      discount = Math.round((basePrice * matched.discountPercent) / 100);
    } else if (matched.flatDiscountInr > 0) {
      discount = matched.flatDiscountInr;
    }

    const finalPayable = Math.max(0, basePrice - discount);
    return {
      validCoupon: matched,
      discountAmount: discount,
      finalPayable,
      message: `Coupon ${matched.code} applied! You saved ₹${discount.toLocaleString('en-IN')}.`,
    };
  }, [plan, couponInput, coupons]);

  const hasLivePayuGatewayKeys = Boolean(
    payuConfig.merchantKey.trim() &&
      payuConfig.merchantSalt.trim() &&
      payuConfig.merchantKey.trim() !== 'gtKFFx'
  );

  // Reset modal state whenever opened
  useEffect(() => {
    if (isOpen) {
      hasSubmittedOfficialFormRef.current = false;
      activationCompletedRef.current = false;
      setErrorMessage(null);
      setIsRedirectingToPayU(false);
      setIsActivatingFreeCoupon(false);
      setAutoRedirectPaused(false);
      setShowCouponEditor(false);
      setAutoRedirectSeconds(2);
      setActiveSubmission(null);
      setLiveStatusNote('');
      setConfirmedSuccessInfo(null);
    }
  }, [isOpen, plan.id]);

  // Live server-to-server verification poller (works even if cross-site POST redirect is blocked or user paid via UPI app)
  const checkLivePayuStatus = useCallback(
    async (submission: ActivePayuSubmission, manualTrigger = false) => {
      if (activationCompletedRef.current) return;
      if (manualTrigger) setIsCheckingStatusNow(true);
      try {
        const res = await fetch(
          `/api/payu/verify-status/${encodeURIComponent(submission.txnid)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify({
              key: payuConfig.merchantKey.trim(),
              salt: payuConfig.merchantSalt.trim(),
              environment: payuConfig.environment,
              orderType: submission.orderType,
              checkoutPayload: submission.checkoutPayload,
              amount: submission.amountInr.toFixed(2),
              productinfo: plan.name,
              firstname: customerName || 'Seeker',
              email: customerEmail || TATHASTU_ADMIN_EMAIL,
              phone: customerMobile || TATHASTU_ADMIN_PHONE,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          if (manualTrigger) {
            setLiveStatusNote('Checking PayU gateway... Complete payment on the Official PayU tab.');
          }
          return;
        }

        if (data.status === 'success') {
          if (activationCompletedRef.current) return;
          activationCompletedRef.current = true;

          const verifiedTxn = data.order?.mihpayid || submission.txnid;
          const verifiedAmt = Number(data.order?.amount || submission.amountInr || 0);
          const keepAdminSession =
            submission.orderType === 'admin_registration' &&
            Boolean(submission.checkoutPayload?.keepCurrentSession);

          if (data.activatedAccount) {
            await applyServerActivatedPayuOrder({
              account: data.activatedAccount,
              profile: data.activatedProfile || null,
              keepCurrentSession: keepAdminSession,
              adminAccountId: submission.checkoutPayload?.adminAccountId,
            });
          } else {
            // Fallback to local callback if server returned success without account object
            await onPaymentSuccess({
              transactionId: verifiedTxn,
              utrNumber: data.order?.bankRefNum || verifiedTxn,
              paymentMethod: `PayU Official (${data.order?.paymentMode || 'ONLINE'})`,
              finalAmountInr: verifiedAmt,
              couponCode: submission.checkoutPayload?.couponCode || '',
            });
          }

          try {
            localStorage.removeItem(PENDING_PAYU_ORDER_STORAGE_KEY);
          } catch {
            // ignore
          }

          setConfirmedSuccessInfo({
            txnid: submission.txnid,
            mihpayid: verifiedTxn,
            amount: verifiedAmt,
          });
          setErrorMessage(null);

          // Notify App.tsx to show top green confirmation banner
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('tathastu:payu-activated', {
                detail: {
                  title:
                    submission.orderType === 'plan_upgrade'
                      ? 'Official PayU Payment Confirmed — Plan Upgraded Automatically!'
                      : 'Official PayU Payment Confirmed — Subscription Activated in Real Time!',
                  message: `₹${verifiedAmt.toLocaleString('en-IN')} verified by Official PayU (Payment ID: ${verifiedTxn}). Your ${plan.name} is now active!`,
                },
              })
            );
          }

          setTimeout(() => {
            onClose();
          }, 1200);
          return;
        }

        if (data.status === 'failure') {
          try {
            localStorage.removeItem(PENDING_PAYU_ORDER_STORAGE_KEY);
          } catch {
            // ignore
          }
          setActiveSubmission(null);
          hasSubmittedOfficialFormRef.current = false;
          setIsRedirectingToPayU(false);
          setAutoRedirectPaused(true);
          setErrorMessage(
            data.errorMessage ||
              'Payment failed or was cancelled on Official PayU. No subscription was activated. You may try again.'
          );
          return;
        }

        if (manualTrigger) {
          setLiveStatusNote(
            'Still awaiting confirmation from PayU. As soon as your UPI / Card / NetBanking payment finishes, your account activates automatically within 2–3 seconds.'
          );
        }
      } catch {
        if (manualTrigger) {
          setLiveStatusNote('Reconnecting to PayU verification service...');
        }
      } finally {
        if (manualTrigger) setIsCheckingStatusNow(false);
      }
    },
    [
      applyServerActivatedPayuOrder,
      customerEmail,
      customerMobile,
      customerName,
      onClose,
      onPaymentSuccess,
      payuConfig.environment,
      payuConfig.merchantKey,
      payuConfig.merchantSalt,
      plan.name,
    ]
  );

  // Automatic real-time polling + BroadcastChannel + postMessage + visibility focus check while PayU tab is open
  useEffect(() => {
    if (!isOpen || !activeSubmission || confirmedSuccessInfo) return;

    const interval = window.setInterval(() => {
      void checkLivePayuStatus(activeSubmission, false);
    }, 2500);

    const handleInstantTrigger = () => {
      void checkLivePayuStatus(activeSubmission, false);
    };

    const handleWindowMessage = (ev: MessageEvent) => {
      if (
        ev.data &&
        ev.data.type === 'TATHASTU_PAYU_CALLBACK' &&
        ev.data.txnid === activeSubmission.txnid
      ) {
        void checkLivePayuStatus(activeSubmission, false);
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('tathastu_payu_sync');
        bc.onmessage = (ev) => {
          if (
            ev.data &&
            ev.data.type === 'TATHASTU_PAYU_CALLBACK' &&
            ev.data.txnid === activeSubmission.txnid
          ) {
            void checkLivePayuStatus(activeSubmission, false);
          }
        };
      } catch {
        // ignore
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void checkLivePayuStatus(activeSubmission, false);
      }
    };

    window.addEventListener('message', handleWindowMessage);
    window.addEventListener('focus', handleInstantTrigger);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('message', handleWindowMessage);
      window.removeEventListener('focus', handleInstantTrigger);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (bc) {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, activeSubmission, confirmedSuccessInfo, checkLivePayuStatus]);

  // Launch Official PayU Hosted Payment Page
  const launchOfficialPayUPage = useCallback(async () => {
    if (hasSubmittedOfficialFormRef.current) return;
    setErrorMessage(null);

    if (discountDetails.finalPayable <= 0) {
      if (!discountDetails.validCoupon) {
        setErrorMessage('A valid 100% discount coupon is required for ₹0 activation.');
        return;
      }
      setIsActivatingFreeCoupon(true);
      const txnId = `PAYU_CPN_${discountDetails.validCoupon.code}_${Date.now().toString().slice(-6)}`;
      await onPaymentSuccess({
        transactionId: txnId,
        paymentMethod: 'PayU (100% Coupon)',
        finalAmountInr: 0,
        couponCode: discountDetails.validCoupon.code,
      });
      setIsActivatingFreeCoupon(false);
      onClose();
      return;
    }

    if (!hasLivePayuGatewayKeys) {
      setErrorMessage(
        `Official PayU Merchant Key & Salt are not configured yet. Master Admin must save them in Master Admin Portal (Support: +91 ${TATHASTU_ADMIN_PHONE}).`
      );
      return;
    }

    hasSubmittedOfficialFormRef.current = true;
    setIsRedirectingToPayU(true);

    try {
      const mergedPayload = {
        ...(checkoutContext?.payload || {}),
        planId: plan.id,
        planName: plan.name,
        planRole: plan.role,
        planMaxProfiles: plan.maxProfiles,
        planDurationMonths: plan.durationMonths,
        couponCode: discountDetails.validCoupon?.code || '',
        expectedAmountInr: discountDetails.finalPayable,
      };

      const orderType = checkoutContext?.orderType || 'new_registration';
      const returnOrigin = typeof window !== 'undefined' ? window.location.origin : '';

      const res = await fetch('/api/payu/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: payuConfig.merchantKey.trim(),
          salt: payuConfig.merchantSalt.trim(),
          environment: payuConfig.environment,
          orderType,
          checkoutPayload: mergedPayload,
          amount: discountDetails.finalPayable.toFixed(2),
          productinfo: plan.name,
          firstname: customerName || 'Seeker',
          email: customerEmail || TATHASTU_ADMIN_EMAIL,
          phone: customerMobile || TATHASTU_ADMIN_PHONE,
          returnOrigin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.gatewayUrl || !data?.fields) {
        hasSubmittedOfficialFormRef.current = false;
        setIsRedirectingToPayU(false);
        setErrorMessage(
          data?.error ||
            'Unable to connect to Official PayU Payment Gateway. Please verify PayU Merchant Key & Salt in Master Admin Portal.'
        );
        return;
      }

      const submission: ActivePayuSubmission = {
        txnid: String(data.fields.txnid),
        gatewayUrl: String(data.gatewayUrl),
        fields: data.fields as Record<string, string>,
        orderType,
        checkoutPayload: mergedPayload,
        amountInr: discountDetails.finalPayable,
      };

      // Persist backup copy of pending order locally so even if user closes browser, returning auto-verifies & activates
      try {
        localStorage.setItem(
          PENDING_PAYU_ORDER_STORAGE_KEY,
          JSON.stringify({
            txnid: submission.txnid,
            orderType,
            checkoutPayload: mergedPayload,
            amountInr: discountDetails.finalPayable,
            createdAt: Date.now(),
          })
        );
      } catch {
        // ignore storage quota errors
      }

      setActiveSubmission(submission);
      setIsRedirectingToPayU(false);
      setLiveStatusNote(
        'Official PayU payment page launched. Complete your payment there — this screen auto-verifies directly with PayU every 2.5 seconds and activates your subscription in real time.'
      );

      // Inside Native Android WebView (single-window), submit in _self; on Web/Preview/Mobile browsers submit in _blank
      // so the app stays live for instant real-time PayU verify_payment confirmation & never hits cross-site POST proxy blocks!
      const isNativeAndroidWebView =
        typeof window !== 'undefined' && Boolean((window as any).TathastuAndroidBridge);
      submitOfficialPayuPostForm(
        submission.gatewayUrl,
        submission.fields,
        isNativeAndroidWebView ? '_self' : '_blank'
      );
    } catch {
      hasSubmittedOfficialFormRef.current = false;
      setIsRedirectingToPayU(false);
      setErrorMessage(
        'Network error while redirecting to Official PayU Payment Page. Please try again.'
      );
    }
  }, [
    checkoutContext,
    customerEmail,
    customerMobile,
    customerName,
    discountDetails,
    hasLivePayuGatewayKeys,
    onClose,
    onPaymentSuccess,
    payuConfig.environment,
    payuConfig.merchantKey,
    payuConfig.merchantSalt,
    plan,
  ]);

  // By default automatically open the Official PayU Payment Page for paid plans once Merchant Key & Salt are configured
  useEffect(() => {
    if (
      !isOpen ||
      !hasLivePayuGatewayKeys ||
      discountDetails.finalPayable <= 0 ||
      autoRedirectPaused ||
      showCouponEditor ||
      showMerchantSettings ||
      isRedirectingToPayU ||
      activeSubmission ||
      confirmedSuccessInfo ||
      errorMessage
    ) {
      return;
    }

    if (autoRedirectSeconds <= 0) {
      launchOfficialPayUPage();
      return;
    }

    const timer = setTimeout(() => {
      setAutoRedirectSeconds((prev) => prev - 1);
    }, 850);
    return () => clearTimeout(timer);
  }, [
    isOpen,
    hasLivePayuGatewayKeys,
    discountDetails.finalPayable,
    autoRedirectPaused,
    showCouponEditor,
    showMerchantSettings,
    isRedirectingToPayU,
    activeSubmission,
    confirmedSuccessInfo,
    errorMessage,
    autoRedirectSeconds,
    launchOfficialPayUPage,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in no-print">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-emerald-400/70 shadow-2xl overflow-hidden my-auto">
        {/* Official PayU Gateway Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-5 py-4 border-b border-emerald-500/35 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm tracking-tight flex items-center gap-1.5 shadow-md">
              <ShieldCheck className="w-4 h-4" />
              <span>PayU</span>
              <span className="text-[10px] font-mono bg-slate-950 text-emerald-300 px-1.5 py-0.5 rounded">
                OFFICIAL
              </span>
            </div>
            <div>
              <h3 className="font-serif text-sm sm:text-base font-black text-white">
                {TATHASTU_APP_NAME} — Official PayU Hosted Checkout
              </h3>
              <p className="text-[10px] text-emerald-300 font-mono flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>
                  SHA-512 Signed • Live PayU Verification &amp; Real-Time Auto Activation
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminUser && (
              <button
                type="button"
                onClick={() => {
                  setAutoRedirectPaused(true);
                  setShowMerchantSettings((prev) => !prev);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 cursor-pointer"
                title="Master Admin: Configure Official PayU Merchant Key & Salt"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/70 text-slate-300 hover:text-white cursor-pointer"
              title="Close Checkout"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master Admin Inline PayU Key/Salt Config Panel */}
        {isAdminUser && showMerchantSettings && (
          <div className="bg-slate-950 border-b border-amber-500/30 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Master Admin: Official PayU Merchant Key &amp; Salt (Global Sync)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {draftConfig.environment === 'test' ? 'test.payu.in' : 'secure.payu.in'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-emerald-300 font-bold block mb-1">
                  PayU Merchant Key *
                </label>
                <input
                  type="text"
                  value={draftConfig.merchantKey}
                  onChange={(e) => setDraftConfig({ ...draftConfig, merchantKey: e.target.value })}
                  placeholder="Live PayU Key"
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-2.5 py-2 text-emerald-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-emerald-300 font-bold block mb-1">
                  PayU Merchant Salt *
                </label>
                <div className="relative">
                  <input
                    type={showDraftSalt ? 'text' : 'password'}
                    value={draftConfig.merchantSalt}
                    onChange={(e) => setDraftConfig({ ...draftConfig, merchantSalt: e.target.value })}
                    placeholder="Live PayU Salt"
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg pl-2.5 pr-12 py-2 text-emerald-100 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDraftSalt((p) => !p)}
                    className="absolute right-2 top-2 text-[10px] text-amber-300 font-bold cursor-pointer"
                  >
                    {showDraftSalt ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-amber-300 block mb-1">Gateway Mode</label>
                <select
                  value={draftConfig.environment}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      environment: e.target.value === 'test' ? 'test' : 'production',
                    })
                  }
                  className="w-full bg-slate-900 border border-amber-500/35 rounded-lg px-2.5 py-2 text-amber-100 text-xs font-bold"
                >
                  <option value="production">Production (secure.payu.in)</option>
                  <option value="test">Test / Sandbox (test.payu.in)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  adminUpdatePayuConfig(draftConfig);
                  setShowMerchantSettings(false);
                  setErrorMessage(null);
                  setAutoRedirectPaused(false);
                  setAutoRedirectSeconds(1);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                Save &amp; Launch Official PayU Page
              </button>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {/* Order & Subscription Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4">
            <div className="md:col-span-7 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                {isCumulativeHealerUpgrade
                  ? 'CUMULATIVE PLAN ADD-ON (ADDS TO EXISTING QUOTA)'
                  : `${plan.role.toUpperCase()} SUBSCRIPTION CHECKOUT`}
              </span>
              <h4 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                {plan.name}
              </h4>
              <p className="text-xs text-slate-300">
                Subscriber: <strong className="text-amber-200">{customerName || 'Valued Client'}</strong> •{' '}
                {customerEmail} • 📞 {customerMobile}
              </p>
              {isCumulativeHealerUpgrade && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Current Quota: {currentMaxProfiles} + New: {plan.maxProfiles} ={' '}
                    {currentMaxProfiles + plan.maxProfiles} Total Profiles
                  </span>
                </div>
              )}
            </div>

            <div className="md:col-span-5 flex flex-col justify-between md:items-end border-t md:border-t-0 md:border-l border-amber-500/20 pt-3 md:pt-0 md:pl-4">
              <div className="text-left md:text-right">
                <span className="text-[11px] text-slate-400 block">
                  Plan Price: ₹{plan.priceInr.toLocaleString('en-IN')}
                </span>
                {discountDetails.discountAmount > 0 && (
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    Coupon Discount: -₹{discountDetails.discountAmount.toLocaleString('en-IN')}
                  </span>
                )}
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                  ₹{discountDetails.finalPayable.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-emerald-300/80 block">
                  Total Payable on Official PayU
                </span>
              </div>
            </div>
          </div>

          {/* Optional Coupon Bar (hidden once PayU checkout is launched) */}
          {!activeSubmission && !confirmedSuccessInfo && (
            <div className="bg-slate-950/70 border border-amber-500/25 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-amber-200">Discount Coupon:</span>
              </div>
              <input
                type="text"
                value={couponInput}
                onFocus={() => {
                  setAutoRedirectPaused(true);
                  setShowCouponEditor(true);
                }}
                onChange={(e) => {
                  setAutoRedirectPaused(true);
                  setShowCouponEditor(true);
                  setCouponInput(e.target.value.toUpperCase());
                }}
                placeholder="Optional Coupon Code (e.g. TATHASTU20)"
                className="flex-1 bg-slate-900 border border-emerald-500/35 rounded-xl px-3 py-2 text-xs text-emerald-200 font-mono uppercase focus:outline-none focus:border-emerald-400"
              />
              {discountDetails.message && (
                <span
                  className={`text-[11px] font-bold ${
                    discountDetails.validCoupon ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {discountDetails.message}
                </span>
              )}
            </div>
          )}

          {/* Main PayU Status Box */}
          {confirmedSuccessInfo ? (
            <div className="rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 p-6 text-center space-y-2.5">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-serif text-xl font-black text-amber-100">
                Official PayU Payment Confirmed!
              </h4>
              <p className="text-xs text-emerald-200">
                ₹{confirmedSuccessInfo.amount.toLocaleString('en-IN')} verified (PayU ID:{' '}
                <strong className="font-mono">{confirmedSuccessInfo.mihpayid}</strong>). Opening your activated dashboard now...
              </p>
            </div>
          ) : activeSubmission ? (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/65 via-slate-950 to-indigo-950/65 border-2 border-emerald-400/70 p-5 text-center space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Auto-Verification Active (Syncing Every 2.5s)</span>
              </div>
              <h4 className="font-serif text-lg font-black text-amber-100">
                Complete Payment on the Official PayU Page
              </h4>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                {liveStatusNote ||
                  'Complete UPI QR, GPay, PhonePe, Paytm, Card, or NetBanking payment on the Official PayU tab. The moment PayU confirms payment, your Client / Healer subscription activates automatically in real time — no manual UTR needed.'}
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-[11px] font-mono text-amber-200">
                <span>
                  Order ID: <strong className="text-emerald-300">{activeSubmission.txnid}</strong>
                </span>
                <span>•</span>
                <span>
                  Amount: <strong className="text-amber-300">₹{activeSubmission.amountInr.toLocaleString('en-IN')}</strong>
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    submitOfficialPayuPostForm(
                      activeSubmission.gatewayUrl,
                      activeSubmission.fields,
                      '_blank'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open / Re-open Official PayU Page</span>
                </button>
                <button
                  type="button"
                  disabled={isCheckingStatusNow}
                  onClick={() => checkLivePayuStatus(activeSubmission, true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatusNow ? 'animate-spin' : ''}`} />
                  <span>
                    {isCheckingStatusNow ? 'Verifying with PayU...' : 'Check Payment Status Now'}
                  </span>
                </button>
              </div>
            </div>
          ) : discountDetails.finalPayable === 0 ? (
            <div className="rounded-2xl bg-emerald-950/60 border border-emerald-400/50 p-5 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-amber-100">
                100% Discount Coupon Applied — ₹0 Payable
              </h4>
              <p className="text-xs text-emerald-200">
                Click below to activate your subscription immediately.
              </p>
            </div>
          ) : !hasLivePayuGatewayKeys ? (
            <div className="rounded-2xl bg-amber-950/70 border-2 border-amber-400/70 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="font-serif text-base font-black text-amber-200">
                    Official PayU Merchant Key &amp; Salt Required
                  </h4>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    To open the official PayU Payment Page (<strong>secure.payu.in</strong> /{' '}
                    <strong>test.payu.in</strong>) with live automatic verification and real-time subscription activation, Master Admin must save the live <strong>PayU Merchant Key</strong> and <strong>PayU Salt</strong> inside <strong>Master Admin Portal → Official PayU Payment Gateway Settings</strong>.
                  </p>
                  <p className="text-xs text-emerald-300 font-semibold">
                    Support Helpline: +91 {TATHASTU_ADMIN_PHONE} • {TATHASTU_ADMIN_EMAIL}
                  </p>
                </div>
              </div>
              {isAdminUser && (
                <button
                  type="button"
                  onClick={() => setShowMerchantSettings(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Enter PayU Merchant Key &amp; Salt Now
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/55 via-slate-950 to-indigo-950/55 border border-emerald-400/45 p-5 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto">
                <RefreshCw
                  className={`w-7 h-7 text-emerald-400 ${
                    isRedirectingToPayU || !autoRedirectPaused ? 'animate-spin' : ''
                  }`}
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-black text-amber-100">
                  {isRedirectingToPayU
                    ? 'Launching Official PayU Payment Page...'
                    : autoRedirectPaused
                    ? 'Ready to Open Official PayU Payment Page'
                    : `Opening Official PayU Payment Page in ${Math.max(1, autoRedirectSeconds)}s...`}
                </h4>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Pay securely on the official PayU page using{' '}
                  <strong>UPI QR, Google Pay, PhonePe, Paytm, Debit/Credit Card, or NetBanking</strong>. Your payment is verified live with PayU and your subscription activates automatically in real time.
                </p>
              </div>
              {!isRedirectingToPayU && !autoRedirectPaused && (
                <button
                  type="button"
                  onClick={() => setAutoRedirectPaused(true)}
                  className="text-[11px] font-bold text-amber-300 hover:underline cursor-pointer"
                >
                  Pause redirect to enter a Discount Coupon
                </button>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-500/20">
            <div className="text-[10px] text-slate-400">
              Gateway:{' '}
              <strong className="text-emerald-300">
                {payuConfig.environment === 'test' ? 'test.payu.in' : 'secure.payu.in'}
              </strong>{' '}
              • Support: <strong className="text-amber-300">{TATHASTU_ADMIN_PHONE}</strong>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                {activeSubmission ? 'Close' : 'Cancel'}
              </button>
              {!activeSubmission && !confirmedSuccessInfo && (
                <button
                  type="button"
                  disabled={
                    isRedirectingToPayU ||
                    isActivatingFreeCoupon ||
                    (discountDetails.finalPayable > 0 && !hasLivePayuGatewayKeys)
                  }
                  onClick={launchOfficialPayUPage}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer"
                >
                  {isRedirectingToPayU || isActivatingFreeCoupon ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>
                        {isActivatingFreeCoupon
                          ? 'Activating Subscription...'
                          : 'Opening Official PayU...'}
                      </span>
                    </>
                  ) : discountDetails.finalPayable === 0 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Activate Subscription (₹0)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>
                        Pay ₹{discountDetails.finalPayable.toLocaleString('en-IN')} on Official PayU
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
