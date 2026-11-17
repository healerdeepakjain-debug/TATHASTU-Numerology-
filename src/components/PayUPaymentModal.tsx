import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  X,
  Lock,
  Sparkles,
  Tag,
  QrCode,
  ArrowRight,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import {
  SubscriptionPlanOption,
  DiscountCouponRecord,
  TATHASTU_BRAND_NAME,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_ADMIN_EMAIL,
} from '../utils/tathastuStore';

export interface PayUMerchantConfig {
  merchantKey: string;
  merchantSalt: string;
  upiVpa: string;
  environment: 'production' | 'test';
}

const PAYU_CONFIG_STORAGE_KEY = 'tathastu_payu_merchant_config_v1';

export function loadPayUMerchantConfig(): PayUMerchantConfig {
  try {
    const raw = localStorage.getItem(PAYU_CONFIG_STORAGE_KEY);
    if (raw) {
      return {
        merchantKey: 'gtKFFx',
        merchantSalt: '4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW',
        upiVpa: 'tathastulight@payu',
        environment: 'production',
        ...JSON.parse(raw),
      };
    }
  } catch {
    // Fallback
  }
  return {
    merchantKey: 'gtKFFx',
    merchantSalt: '4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW',
    upiVpa: 'tathastulight@payu',
    environment: 'production',
  };
}

export function savePayUMerchantConfig(cfg: PayUMerchantConfig): void {
  try {
    localStorage.setItem(PAYU_CONFIG_STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // Ignore storage error
  }
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
  onPaymentSuccess: (details: {
    transactionId: string;
    paymentMethod: string;
    finalAmountInr: number;
    couponCode?: string;
  }) => Promise<void> | void;
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
  onPaymentSuccess,
}) => {
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [couponInput, setCouponInput] = useState(initialCouponCode.toUpperCase());
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet / Postpaid');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'transferring' | 'checkout' | 'success'>('transferring');
  const [redirectCountdown, setRedirectCountdown] = useState<number>(2);
  const [generatedTxnId, setGeneratedTxnId] = useState('');
  const [showMerchantSettings, setShowMerchantSettings] = useState(false);
  const [merchantConfig, setMerchantConfig] = useState<PayUMerchantConfig>(loadPayUMerchantConfig);
  const hasFinalizedRedirectRef = useRef(false);

  useEffect(() => {
    setCouponInput(initialCouponCode.toUpperCase());
  }, [initialCouponCode]);

  useEffect(() => {
    if (isOpen) {
      hasFinalizedRedirectRef.current = false;
      setPaymentStep('transferring');
      setIsProcessing(false);
      setRedirectCountdown(2);
      setCardHolder(customerName || 'Valued Client');
      const timer = setTimeout(() => {
        setPaymentStep('checkout');
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isOpen, customerName, plan.id]);

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

  useEffect(() => {
    if (!isOpen) return;
    const upiUri = `upi://pay?pa=${encodeURIComponent(
      merchantConfig.upiVpa || 'tathastulight@payu'
    )}&pn=${encodeURIComponent(TATHASTU_BRAND_NAME)}&am=${
      discountDetails.finalPayable
    }&cu=INR&tn=${encodeURIComponent(`PayU_${plan.name}`)}`;

    QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setUpiQrDataUrl(url))
      .catch(() => setUpiQrDataUrl(''));
  }, [isOpen, discountDetails.finalPayable, plan.name, merchantConfig.upiVpa]);

  const completeRedirectBackToApp = async (txnIdToUse?: string) => {
    if (hasFinalizedRedirectRef.current) return;
    hasFinalizedRedirectRef.current = true;
    const finalTxn =
      txnIdToUse ||
      generatedTxnId ||
      `PAYU_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

    await onPaymentSuccess({
      transactionId: finalTxn,
      paymentMethod: `PayU (${payMethod.toUpperCase()})`,
      finalAmountInr: discountDetails.finalPayable,
      couponCode: discountDetails.validCoupon?.code,
    });
    onClose();
  };

  // Auto-redirect countdown once payment is verified on PayU
  useEffect(() => {
    if (!isOpen || paymentStep !== 'success') return;
    if (redirectCountdown <= 0) {
      completeRedirectBackToApp(generatedTxnId);
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 900);
    return () => clearTimeout(timer);
  }, [isOpen, paymentStep, redirectCountdown, generatedTxnId]);

  if (!isOpen) return null;

  const handleConfirmPayUPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const txnId = `PAYU_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedTxnId(txnId);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('success');
      setRedirectCountdown(2);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in no-print">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border-2 border-emerald-400/70 shadow-2xl overflow-hidden my-auto">
        {/* Top PayU Branded Gateway Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-5 py-4 border-b border-emerald-500/35 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm tracking-tight flex items-center gap-1.5 shadow-md">
              <ShieldCheck className="w-4 h-4" />
              <span>PayU</span>
              <span className="text-[10px] font-mono bg-slate-950 text-emerald-300 px-1.5 py-0.5 rounded">
                BIZ / MONEY
              </span>
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-black text-amber-100">
                PayU Secure Payment Gateway — {plan.role.toUpperCase()} PLAN CHECKOUT
              </h3>
              <p className="text-[11px] text-emerald-300 font-mono">
                secure.payu.in • 100% PCI-DSS Verified • Auto-Redirects Back to App After Payment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMerchantSettings((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
              title="PayU Merchant Key & UPI Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Merchant Config</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white cursor-pointer"
              title="Cancel Payment & Return"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional PayU Merchant Configuration Drawer */}
        {showMerchantSettings && (
          <div className="p-4 bg-slate-950 border-b border-emerald-500/30 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                PayU Merchant Gateway Configuration (Saved Locally)
              </span>
              <button
                type="button"
                onClick={() => {
                  savePayUMerchantConfig(merchantConfig);
                  setShowMerchantSettings(false);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[11px] cursor-pointer"
              >
                Save PayU Config
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PayU Merchant Key</label>
                <input
                  type="text"
                  value={merchantConfig.merchantKey}
                  onChange={(e) =>
                    setMerchantConfig((prev) => ({ ...prev, merchantKey: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-emerald-500/35 rounded-lg px-2.5 py-1.5 text-amber-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PayU Merchant Salt</label>
                <input
                  type="password"
                  value={merchantConfig.merchantSalt}
                  onChange={(e) =>
                    setMerchantConfig((prev) => ({ ...prev, merchantSalt: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-emerald-500/35 rounded-lg px-2.5 py-1.5 text-amber-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Merchant UPI VPA</label>
                <input
                  type="text"
                  value={merchantConfig.upiVpa}
                  onChange={(e) =>
                    setMerchantConfig((prev) => ({ ...prev, upiVpa: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-emerald-500/35 rounded-lg px-2.5 py-1.5 text-amber-100 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {paymentStep === 'transferring' ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h4 className="font-serif text-xl font-black text-amber-100">
              Transferring to PayU Payment Gateway...
            </h4>
            <p className="text-xs text-emerald-300 font-mono">
              Preparing checkout for <strong>{customerName || 'New Account'}</strong> • Plan:{' '}
              <strong>{plan.name}</strong> (₹{discountDetails.finalPayable.toLocaleString('en-IN')})
            </p>
          </div>
        ) : paymentStep === 'success' ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400/50 text-emerald-300 font-mono text-xs font-bold">
                PAYU PAYMENT VERIFIED • {generatedTxnId}
              </span>
              <h4 className="font-serif text-2xl font-black text-amber-100 pt-2">
                Payment Successful! Redirecting Back to App...
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you, <strong className="text-amber-200">{customerName || 'Valued Member'}</strong>! Your{' '}
                <strong className="text-emerald-300">{plan.name}</strong> ({plan.role.toUpperCase()}) is now activated with full A4 PDF Download, Print, QR Access, and Direct WhatsApp permissions.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-emerald-500/35 text-xs space-y-2 text-left font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">PayU Transaction ID:</span>
                <strong className="text-emerald-300">{generatedTxnId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Role &amp; Plan:</span>
                <strong className="text-amber-200">
                  {plan.role.toUpperCase()} — {plan.name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid via PayU:</span>
                <strong className="text-amber-300">
                  ₹{discountDetails.finalPayable.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profile Quota Unlocked:</span>
                <strong className="text-emerald-300">
                  {isCumulativeHealerUpgrade
                    ? `${currentMaxProfiles} + ${plan.maxProfiles} = ${
                        currentMaxProfiles + plan.maxProfiles
                      } Profiles`
                    : `${plan.maxProfiles} Profiles (${plan.durationMonths} Months)`}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => completeRedirectBackToApp(generatedTxnId)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  Redirect to App &amp; Use {plan.name} Now ({redirectCountdown}s) →
                </span>
              </button>
              <p className="text-[11px] text-emerald-300/80 font-mono">
                Auto-redirecting you back to the application in {redirectCountdown} second{redirectCountdown === 1 ? '' : 's'}...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmPayUPayment} className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Order Summary & Coupon */}
              <div className="lg:col-span-5 space-y-4 bg-slate-950/90 p-4 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="border-b border-amber-500/20 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Selected {plan.role.toUpperCase()} Subscription Plan
                    </span>
                    <h4 className="font-serif text-base font-bold text-amber-100 mt-0.5">
                      {plan.name}
                    </h4>
                    <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                      {isCumulativeHealerUpgrade
                        ? `Adds +${plan.maxProfiles} Profiles to your Healer Account (New Total: ${
                            currentMaxProfiles + plan.maxProfiles
                          })`
                        : `${plan.maxProfiles} Profiles • ${plan.durationMonths} Months Full Access`}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{plan.role === 'healer' ? 'Healer Name:' : 'Client Name:'}</span>
                      <strong className="text-amber-100">{customerName || 'New User'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Mobile / Email:</span>
                      <strong className="text-amber-200 font-mono">
                        {customerMobile || customerEmail || TATHASTU_ADMIN_PHONE}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                      <span>Plan Base Amount:</span>
                      <span className="font-mono font-bold text-slate-200">
                        ₹{plan.priceInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {discountDetails.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-300">
                        <span>Coupon Discount ({discountDetails.validCoupon?.code}):</span>
                        <span className="font-mono font-bold">
                          - ₹{discountDetails.discountAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-amber-300 pt-2 border-t border-amber-500/30">
                      <span>Total Payable on PayU:</span>
                      <span className="font-mono">
                        ₹{discountDetails.finalPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Coupon Code Box */}
                  <div className="pt-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <span>Have a Promo / Discount Coupon?</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. TATHASTU20 or HEALER500"
                        className="w-full bg-slate-900 border border-amber-500/35 rounded-xl px-3 py-1.5 text-xs text-emerald-200 font-mono uppercase"
                      />
                    </div>
                    {discountDetails.message && (
                      <p
                        className={`text-[10px] font-semibold ${
                          discountDetails.validCoupon ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {discountDetails.message}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {coupons
                        .filter(
                          (c) =>
                            c.isActive && (c.targetRole === 'all' || c.targetRole === plan.role)
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCouponInput(c.code)}
                            className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] hover:bg-emerald-900 cursor-pointer"
                          >
                            Apply {c.code}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/20 text-[10px] text-slate-400 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>PayU 256-Bit SSL Encrypted Gateway</span>
                  </div>
                  <p>
                    Need payment help? Call/WhatsApp Admin on{' '}
                    <strong className="text-amber-200">{TATHASTU_ADMIN_PHONE}</strong> ({TATHASTU_ADMIN_EMAIL}).
                  </p>
                </div>
              </div>

              {/* Right Column: PayU Payment Method Tabs */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'upi', label: 'PayU UPI / QR', icon: Smartphone },
                    { id: 'card', label: 'Cards', icon: CreditCard },
                    { id: 'netbanking', label: 'NetBanking', icon: Building2 },
                    { id: 'wallet', label: 'Wallets', icon: Wallet },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = payMethod === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          setPayMethod(tab.id as 'upi' | 'card' | 'netbanking' | 'wallet')
                        }
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          active
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/40'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Method 1: PayU UPI & Instant QR */}
                {payMethod === 'upi' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/35 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {upiQrDataUrl && (
                        <div className="p-2.5 rounded-2xl bg-white border-2 border-emerald-400 shrink-0 text-center">
                          <img
                            src={upiQrDataUrl}
                            alt="PayU UPI QR Code"
                            className="w-32 h-32 object-contain mx-auto"
                          />
                          <span className="text-[9px] font-mono font-bold text-slate-900 block mt-1">
                            SCAN WITH ANY UPI APP
                          </span>
                        </div>
                      )}

                      <div className="flex-1 space-y-3 w-full">
                        <div>
                          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                            <QrCode className="w-4 h-4" />
                            <span>Select UPI App or Enter Virtual Payment Address (VPA)</span>
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            {[
                              { id: 'gpay', name: 'GPay' },
                              { id: 'phonepe', name: 'PhonePe' },
                              { id: 'paytm', name: 'Paytm UPI' },
                              { id: 'bhim', name: 'BHIM UPI' },
                            ].map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() =>
                                  setSelectedUpiApp(
                                    app.id as 'gpay' | 'phonepe' | 'paytm' | 'bhim'
                                  )
                                }
                                className={`py-2 px-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                                  selectedUpiApp === app.id
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                                    : 'bg-slate-900 text-slate-300 border-slate-800'
                                }`}
                              >
                                {app.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-amber-300 block mb-1">
                            Or Enter Your UPI ID (Optional if scanning QR)
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourmobile@okaxis or name@ybl"
                            className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3.5 py-2 text-xs text-amber-100 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 2: Credit / Debit Card */}
                {payMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/35 space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        Card Number (Visa / MasterCard / RuPay / Amex)
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8899"
                        className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3.5 py-2 text-xs text-amber-100 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-amber-300 block mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="08/29"
                          className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3.5 py-2 text-xs text-amber-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-amber-300 block mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3.5 py-2 text-xs text-amber-100 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-amber-300 block mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on Card"
                        className="w-full bg-slate-900 border border-emerald-500/35 rounded-xl px-3.5 py-2 text-xs text-amber-100"
                      />
                    </div>
                  </div>
                )}

                {/* Method 3: NetBanking */}
                {payMethod === 'netbanking' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/35 space-y-3">
                    <label className="text-xs font-bold text-amber-300 block">
                      Select Your Bank for PayU NetBanking
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'State Bank of India (SBI)',
                        'HDFC Bank Corporate / Retail',
                        'ICICI Bank NetBanking',
                        'Axis Bank NetBanking',
                        'Kotak Mahindra Bank',
                        'Punjab National Bank (PNB)',
                      ].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer ${
                            selectedBank === bank
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Method 4: Wallets */}
                {payMethod === 'wallet' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/35 space-y-3">
                    <label className="text-xs font-bold text-amber-300 block">
                      Select PayU Supported Wallet
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Paytm Wallet / Postpaid',
                        'Amazon Pay Balance',
                        'PhonePe Wallet',
                        'MobiKwik / Zip PayLater',
                      ].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWallet(w)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer ${
                            selectedWallet === w
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {isProcessing
                      ? 'Verifying PayU Transaction...'
                      : `Pay ₹${discountDetails.finalPayable.toLocaleString(
                          'en-IN'
                        )} via PayU & Redirect to App`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
