import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Smartphone,
  Share,
  CheckCircle2,
  X,
  QrCode,
  Copy,
  MessageCircle,
  ExternalLink,
  Sparkles,
  WifiOff,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  TATHASTU_LOGO_PATH,
  TATHASTU_BRAND_NAME,
  TATHASTU_TAGLINE,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_OFFICIAL_APP_URL,
} from '../utils/tathastuStore';
import { getPublicAppOriginUrl } from '../utils/whatsappAndQrService';
import {
  getCurrentLanguage,
  translateMultilineBlock,
  validateAndNormalizeLocaleText,
} from '../utils/i18n';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((fn) => fn(globalDeferredPrompt));
  });
  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((fn) => fn(null));
  });
}

interface PWAInstallButtonProps {
  compact?: boolean;
  className?: string;
}

async function getLogoBase64DataUrl(logoPath: string): Promise<string> {
  try {
    const res = await fetch(logoPath);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : logoPath);
      reader.onerror = () => resolve(logoPath);
      reader.readAsDataURL(blob);
    });
  } catch {
    return logoPath;
  }
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  className = '',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadedLauncher, setDownloadedLauncher] = useState(false);
  const [sharedAppFile, setSharedAppFile] = useState(false);

  const liveAppUrl = getPublicAppOriginUrl() || TATHASTU_OFFICIAL_APP_URL;
  const publicSharedUrl = TATHASTU_OFFICIAL_APP_URL;

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const android = /android/.test(ua);
    setIsIOS(ios);
    setIsAndroid(android);

    const listener = (p: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(p);
      if (!p) setIsInstalled(true);
    };
    promptListeners.add(listener);

    QRCode.toDataURL(liveAppUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#1e1136',
        light: '#fffbeb',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});

    return () => {
      promptListeners.delete(listener);
    };
  }, [liveAppUrl]);

  const generateStandaloneMobileAppHtml = async (): Promise<{ blob: Blob; fileName: string }> => {
    const absLogo = await getLogoBase64DataUrl(TATHASTU_LOGO_PATH);
    let savedProfilesJson = '[]';
    try {
      const raw = localStorage.getItem('tathastu_profiles_v3');
      if (raw) savedProfilesJson = raw;
    } catch {
      // Fallback
    }

    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
  <meta name="theme-color" content="#030712" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Tathastu" />
  <title>${TATHASTU_BRAND_NAME} — Mobile App (${TATHASTU_TAGLINE})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: radial-gradient(circle at top, #1e1136 0%, #030712 75%);
      color: #fef3c7;
      min-height: 100vh;
      padding: 12px 12px 84px 12px;
    }
    .container { max-width: 680px; margin: 0 auto; }
    .header {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      background: rgba(15, 23, 42, 0.95); border: 1.5px solid rgba(245, 158, 11, 0.55);
      border-radius: 18px; padding: 12px 14px; margin-bottom: 12px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.6);
    }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .logo {
      width: 48px; height: 48px; border-radius: 50%; border: 2px solid #fbbf24;
      object-fit: cover; flex-shrink: 0;
    }
    .brand-title { font-family: Georgia, serif; font-size: 15px; font-weight: 900; color: #fde68a; letter-spacing: 0.04em; }
    .brand-sub { font-size: 10px; color: #6ee7b7; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .badge {
      background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.5);
      color: #a7f3d0; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 8px;
      text-align: right;
    }
    .card {
      background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(245, 158, 11, 0.38);
      border-radius: 16px; padding: 14px; margin-bottom: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    }
    .card-title {
      font-family: Georgia, serif; font-size: 14px; font-weight: 800; color: #fde68a;
      margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(245, 158, 11, 0.25); padding-bottom: 6px;
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
    @media (max-width: 480px) { .form-grid { grid-template-columns: 1fr; } }
    label { display: block; font-size: 10px; font-weight: 700; color: #fcd34d; text-transform: uppercase; margin-bottom: 3px; }
    input, select {
      width: 100%; padding: 9px 10px; border-radius: 10px; border: 1px solid rgba(245, 158, 11, 0.45);
      background: #090d16; color: #fffbeb; font-size: 13px; font-weight: 600;
    }
    .btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .btn {
      flex: 1; min-width: 135px; padding: 10px 12px; border-radius: 11px; border: none;
      font-weight: 800; font-size: 12px; cursor: pointer; text-align: center;
      background: linear-gradient(90deg, #f59e0b, #d97706); color: #090d16;
    }
    .btn-emerald {
      background: linear-gradient(90deg, #10b981, #059669); color: #022c22;
    }
    .btn-outline {
      background: rgba(30, 41, 59, 0.9); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.45);
    }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
    .kpi-box {
      background: #090d16; border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 12px;
      padding: 8px; text-align: center;
    }
    .kpi-num { font-family: Georgia, serif; font-size: 22px; font-weight: 900; color: #fbbf24; }
    .kpi-lbl { font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; }
    .kpi-sub { font-size: 10px; color: #6ee7b7; margin-top: 2px; font-weight: 600; }
    .loshu-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
      max-width: 270px; margin: 10px auto;
    }
    .loshu-cell {
      background: #090d16; border: 1.5px solid rgba(245, 158, 11, 0.5); border-radius: 10px;
      padding: 8px 4px; text-align: center; min-height: 62px; display: flex; flex-direction: column; justify-content: center;
    }
    .loshu-cell.present { background: rgba(16, 185, 129, 0.16); border-color: #10b981; }
    .loshu-cell.missing { background: rgba(225, 29, 72, 0.12); border-color: rgba(244, 63, 94, 0.45); }
    .table-wrap { overflow-x: auto; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    th, td { border: 1px solid rgba(245, 158, 11, 0.3); padding: 7px 8px; text-align: left; vertical-align: top; }
    th { background: rgba(30, 17, 54, 0.95); color: #fde68a; font-weight: 800; font-size: 10.5px; text-transform: uppercase; }
    td { background: rgba(9, 13, 22, 0.85); color: #e2e8f0; }
    .bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0; background: rgba(9, 13, 22, 0.98);
      border-top: 1.5px solid rgba(245, 158, 11, 0.5); display: flex; justify-content: space-around;
      padding: 6px 4px 10px 4px; z-index: 999;
    }
    .nav-btn {
      background: none; border: none; color: #94a3b8; font-size: 10px; font-weight: 800;
      padding: 6px 8px; border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px;
    }
    .nav-btn.active { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.45); }
    .pill { display: inline-block; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 800; }
    .pill-good { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid #10b981; }
    .pill-warn { background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid #f59e0b; }
    .pill-bad { background: rgba(225, 29, 72, 0.2); color: #fda4af; border: 1px solid #f43f5e; }
    @media print {
      .bottom-nav, .no-print { display: none !important; }
      body { background: #fff; color: #000; padding: 0; }
      .card, .header, .kpi-box, td, th { background: #fff !important; color: #000 !important; border-color: #b45309 !important; box-shadow: none !important; }
      .brand-title, .card-title, .kpi-num, th { color: #78350f !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <img class="logo" src="${absLogo}" alt="Tathastu Logo" />
        <div>
          <div class="brand-title">${TATHASTU_BRAND_NAME}</div>
          <div class="brand-sub">${TATHASTU_TAGLINE} • Vedic &amp; Chaldean App</div>
        </div>
      </div>
      <div class="badge">✓ 100% READY<br/>NO 403 / OFFLINE OK</div>
    </div>

    <!-- Profile Selector & Live Editor -->
    <div class="card no-print">
      <div class="card-title">
        <span>1. ACTIVE CLIENT PROFILE &amp; INSTANT CALCULATOR</span>
        <select id="profileSelector" style="width:auto; max-width:210px; padding:4px 8px; font-size:11px;" onchange="onSelectSavedProfile(this.value)">
          <option value="">-- Select Saved Profile --</option>
        </select>
      </div>
      <div class="form-grid">
        <div>
          <label>Client Full Name (Chaldean)</label>
          <input id="inpName" type="text" value="DEEPAK JAIN" oninput="recalcAll()" />
        </div>
        <div>
          <label>Date of Birth (YYYY-MM-DD)</label>
          <input id="inpDob" type="date" value="1983-02-16" onchange="recalcAll()" />
        </div>
        <div>
          <label>10-Digit Mobile Number</label>
          <input id="inpMobile" type="tel" maxlength="10" value="8899444444" oninput="recalcAll()" />
        </div>
        <div>
          <label>Birth Time &amp; Gender</label>
          <div style="display:flex; gap:6px;">
            <input id="inpTob" type="time" value="16:15" onchange="recalcAll()" />
            <select id="inpGender" onchange="recalcAll()">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn" onclick="saveCurrentProfileLocal()">💾 Save Profile on Phone</button>
        <button class="btn btn-emerald" onclick="window.print()">🖨️ Print / Save Full PDF</button>
        <button class="btn btn-outline" onclick="shareOnWhatsApp()">💬 Share on WhatsApp</button>
      </div>
    </div>

    <!-- Section 1: Birth Chart & 3x3 Lo-Shu Grid -->
    <div id="secChart" class="card">
      <div class="card-title">
        <span>🕉️ NATAL BIRTH CHART &amp; 3×3 VEDIC LO-SHU MATRIX</span>
        <span id="lblClientTag" style="font-size:11px; color:#6ee7b7;"></span>
      </div>
      <div class="kpi-grid" id="kpiGrid"></div>
      <div class="loshu-grid" id="loshuMatrix"></div>
      <div class="table-wrap" id="missingRemediesWrap"></div>
    </div>

    <!-- Section 2: Real-Time Name & Mobile Number Verifier + 3-Way Comparison -->
    <div id="secNameMobile" class="card">
      <div class="card-title">
        <span>✨ REAL-TIME NAME &amp; MOBILE FREQUENCY VERIFIER</span>
        <span style="font-size:10px; color:#fcd34d;">Chaldean &amp; 9-Pair Scanner</span>
      </div>
      <div class="form-grid no-print" style="margin-bottom:8px;">
        <div>
          <label>Test Option A Name / Spelling</label>
          <input id="inpNameA" type="text" placeholder="Type Option A Name" oninput="recalcAll()" />
        </div>
        <div>
          <label>Test Option B Name / Spelling</label>
          <input id="inpNameB" type="text" placeholder="Type Option B Name" oninput="recalcAll()" />
        </div>
        <div>
          <label>Test Option A Mobile (10 Digits)</label>
          <input id="inpMobA" type="tel" maxlength="10" placeholder="Option A Mobile" oninput="recalcAll()" />
        </div>
        <div>
          <label>Test Option B Mobile (10 Digits)</label>
          <input id="inpMobB" type="tel" maxlength="10" placeholder="Option B Mobile" oninput="recalcAll()" />
        </div>
      </div>
      <div class="table-wrap" id="nameComparisonWrap"></div>
      <div class="table-wrap" id="mobileComparisonWrap" style="margin-top:10px;"></div>
    </div>

    <!-- Section 3: Complete Vedic Numerology Maha Dasha Timeline (Present, Upcoming & Past) -->
    <div id="secDasha" class="card">
      <div class="card-title">
        <span>⏳ COMPLETE VEDIC NUMEROLOGY MAHA DASHA TIMELINE</span>
        <span style="font-size:10px; color:#6ee7b7;">Starts from ★ Present Active Cycle</span>
      </div>
      <div id="dashaSummaryBanner" style="margin-bottom:8px; font-size:11.5px; line-height:1.45;"></div>
      <div class="table-wrap" id="dashaTableWrap"></div>
    </div>

    <!-- Section 4: Universal Numeric Verifier (Vehicle, Flat, Brand & Bank) + Daily Panchang -->
    <div id="secVerifier" class="card">
      <div class="card-title">
        <span>🚗 UNIVERSAL VERIFIER (VEHICLE, FLAT &amp; BRAND) &amp; PANCHANG</span>
      </div>
      <div class="form-grid no-print" style="margin-bottom:8px;">
        <div>
          <label>Enter Vehicle / Flat / Brand / Account</label>
          <input id="inpEntity" type="text" value="DL01AB1983" oninput="recalcAll()" />
        </div>
        <div>
          <label>Entity Category</label>
          <select id="inpEntityType" onchange="recalcAll()">
            <option value="Vehicle">Vehicle Registration Number</option>
            <option value="Flat">Flat / House / Plot Number</option>
            <option value="Brand">Business / Brand Name</option>
            <option value="Account">Bank Account Number</option>
          </select>
        </div>
      </div>
      <div id="verifierResultWrap"></div>
      <div id="panchangResultWrap" style="margin-top:10px;"></div>
    </div>

    <div class="card" style="text-align:center; font-size:11px; color:#cbd5e1;">
      <strong style="color:#fde68a;">${TATHASTU_BRAND_NAME} (${TATHASTU_TAGLINE})</strong><br/>
      Healer Deepak Jain • Support &amp; Admin WhatsApp: <strong>+91 ${TATHASTU_ADMIN_PHONE}</strong>
    </div>
  </div>

  <!-- Mobile Bottom Navigation -->
  <div class="bottom-nav no-print">
    <button class="nav-btn active" onclick="scrollToSec('secChart', this)"><span>🕉️</span><span>Birth &amp; Grid</span></button>
    <button class="nav-btn" onclick="scrollToSec('secNameMobile', this)"><span>✨</span><span>Name &amp; Mobile</span></button>
    <button class="nav-btn" onclick="scrollToSec('secDasha', this)"><span>⏳</span><span>Maha Dasha</span></button>
    <button class="nav-btn" onclick="scrollToSec('secVerifier', this)"><span>🚗</span><span>Verifier</span></button>
    <button class="nav-btn" onclick="window.print()"><span>📄</span><span>Save PDF</span></button>
  </div>

  <script>
    const PLANETS = {
      1: { name: 'Surya (Sun)', traits: 'Leadership, Authority, Royal Grace', color: 'Ruby Gold / Orange', days: 'Sun, Mon', gem: 'Ruby (Manikya)', hz: '126.22 Hz', mantra: 'Om Hram Hreem Hroum Sah Suryaya Namah', friends: [1,2,3,5,9], enemies: [6,8] },
      2: { name: 'Chandra (Moon)', traits: 'Intuition, Harmony, Liquid Cashflow', color: 'Pearl White / Silver', days: 'Mon, Fri', gem: 'Natural Pearl (Moti)', hz: '210.42 Hz', mantra: 'Om Shram Shreem Shroum Sah Chandraya Namah', friends: [1,2,3,5], enemies: [4,8,9] },
      3: { name: 'Guru (Jupiter)', traits: 'Wisdom, Wealth Expansion, Dharma', color: 'Saffron Yellow / Gold', days: 'Thu, Tue, Sun', gem: 'Yellow Sapphire (Pukhraj)', hz: '183.58 Hz', mantra: 'Om Gram Greem Groum Sah Gurave Namah', friends: [1,2,3,9], enemies: [5,6] },
      4: { name: 'Rahu (Uranus)', traits: 'Innovation, Sudden Breakthrough, Tech', color: 'Electric Blue / Grey', days: 'Sat, Sun', gem: 'Hessonite (Gomed)', hz: '432 Hz', mantra: 'Om Bhram Bhreem Bhroum Sah Rahave Namah', friends: [5,6,7,8], enemies: [1,2,9] },
      5: { name: 'Budh (Mercury)', traits: 'Commerce, Banking, Speed, Trade', color: 'Emerald Green', days: 'Wed, Fri', gem: 'Emerald (Panna)', hz: '141.27 Hz', mantra: 'Om Bram Breem Broum Sah Budhaya Namah', friends: [1,4,5,6], enemies: [2] },
      6: { name: 'Shukra (Venus)', traits: 'Luxury, Magnetism, Assets, Harmony', color: 'Diamond White / Pink', days: 'Fri, Tue, Thu', gem: 'Diamond / White Zircon', hz: '221.23 Hz', mantra: 'Om Dram Dreem Droum Sah Shukraya Namah', friends: [4,5,6,8,9], enemies: [1,2] },
      7: { name: 'Ketu (Neptune)', traits: 'Spiritual Insight, Research, Healing', color: 'Light Yellow / Pastel', days: 'Sun, Mon', gem: 'Cat’s Eye (Lehsuniya)', hz: '852 Hz', mantra: 'Om Sram Sreem Sroum Sah Ketave Namah', friends: [2,4,6,7], enemies: [1,9] },
      8: { name: 'Shani (Saturn)', traits: 'Real Estate, Justice, Long-Term Wealth', color: 'Royal Blue / Black', days: 'Sat, Fri, Wed', gem: 'Blue Sapphire (Neelam)', hz: '147.85 Hz', mantra: 'Om Pram Preem Proum Sah Shanaischaraya Namah', friends: [4,5,6,8], enemies: [1,2,9] },
      9: { name: 'Mangal (Mars)', traits: 'Courage, Victory, Land, Administration', color: 'Coral Red / Crimson', days: 'Tue, Thu, Sun', gem: 'Red Coral (Moonga)', hz: '144.72 Hz', mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah', friends: [1,2,3,6,9], enemies: [4,5] }
    };

    const CHALDEAN = {
      A:1, I:1, J:1, Q:1, Y:1,
      B:2, K:2, R:2,
      C:3, G:3, L:3, S:3,
      D:4, M:4, T:4,
      E:5, H:5, N:5, X:5,
      U:6, V:6, W:6,
      O:7, Z:7,
      F:8, P:8
    };

    let savedProfiles = ${savedProfilesJson};
    try {
      const localProfs = localStorage.getItem('tathastu_standalone_profiles_v1');
      if (localProfs) {
        const parsed = JSON.parse(localProfs);
        if (Array.isArray(parsed) && parsed.length > 0) savedProfiles = parsed;
      }
    } catch(e) {}

    function reduceSingle(n) {
      let v = Math.abs(parseInt(n, 10) || 0);
      while (v > 9) {
        v = String(v).split('').reduce((a, b) => a + parseInt(b, 10), 0);
      }
      return v || 9;
    }

    function getRelation(n1, n2) {
      if (n1 === n2) return 'Friendly';
      const p = PLANETS[n1];
      if (!p) return 'Neutral';
      if (p.friends.includes(n2)) return 'Friendly';
      if (p.enemies.includes(n2)) return 'Hostile';
      return 'Neutral';
    }

    function analyzeChaldeanStr(str, m, b) {
      const clean = String(str || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      let sum = 0;
      const breakdown = [];
      for (const ch of clean) {
        const val = /[0-9]/.test(ch) ? parseInt(ch, 10) : (CHALDEAN[ch] || 0);
        sum += val;
        if (val > 0) breakdown.push(ch + '(' + val + ')');
      }
      const root = sum > 0 ? reduceSingle(sum) : m;
      const relM = getRelation(m, root);
      const relB = getRelation(b, root);
      let score = 68;
      if (relM === 'Friendly') score += 14; else if (relM === 'Hostile') score -= 14;
      if (relB === 'Friendly') score += 14; else if (relB === 'Hostile') score -= 12;
      if ([19,23,24,27,32,33,37,41,42,45,46,50,51].includes(sum)) score += 6;
      score = Math.min(99, Math.max(35, score));
      return { clean, compound: sum, root, relM, relB, score, breakdown: breakdown.join(' + ') };
    }

    function populateProfileSelector() {
      const sel = document.getElementById('profileSelector');
      if (!sel) return;
      sel.innerHTML = '<option value="">-- Select Saved Profile (' + savedProfiles.length + ') --</option>';
      savedProfiles.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = String(idx);
        opt.textContent = (p.name || 'Client') + ' (' + (p.dob || '') + ')';
        sel.appendChild(opt);
      });
      if (savedProfiles.length > 0) {
        onSelectSavedProfile('0');
        sel.value = '0';
      } else {
        recalcAll();
      }
    }

    function onSelectSavedProfile(idxStr) {
      if (idxStr === '') return;
      const p = savedProfiles[parseInt(idxStr, 10)];
      if (!p) return;
      document.getElementById('inpName').value = p.name || 'DEEPAK JAIN';
      document.getElementById('inpDob').value = p.dob || '1983-02-16';
      document.getElementById('inpMobile').value = p.mobile || '8899444444';
      document.getElementById('inpTob').value = p.tob || '16:15';
      document.getElementById('inpGender').value = p.gender || 'male';
      recalcAll();
    }

    function saveCurrentProfileLocal() {
      const p = {
        name: document.getElementById('inpName').value.trim() || 'CLIENT',
        dob: document.getElementById('inpDob').value || '1983-02-16',
        mobile: document.getElementById('inpMobile').value.trim() || '8899444444',
        tob: document.getElementById('inpTob').value || '16:15',
        gender: document.getElementById('inpGender').value || 'male'
      };
      const existingIdx = savedProfiles.findIndex(x => x.name.toUpperCase() === p.name.toUpperCase() && x.dob === p.dob);
      if (existingIdx >= 0) savedProfiles[existingIdx] = p;
      else savedProfiles.unshift(p);
      try { localStorage.setItem('tathastu_standalone_profiles_v1', JSON.stringify(savedProfiles)); } catch(e) {}
      populateProfileSelector();
    }

    function recalcAll() {
      const name = document.getElementById('inpName').value.trim() || 'DEEPAK JAIN';
      const dob = document.getElementById('inpDob').value || '1983-02-16';
      const mobile = document.getElementById('inpMobile').value.replace(/\\D/g, '').slice(-10) || '8899444444';
      const gender = document.getElementById('inpGender').value || 'male';

      const parts = dob.split('-');
      const yyyy = parseInt(parts[0] || '1983', 10);
      const mm = parseInt(parts[1] || '2', 10);
      const dd = parseInt(parts[2] || '16', 10);

      const m = reduceSingle(dd);
      const b = reduceSingle( String(dd) + String(mm) + String(yyyy) );
      const ySum = reduceSingle(yyyy);
      let kua = gender === 'female' ? reduceSingle(ySum + 4) : reduceSingle(11 - ySum);

      document.getElementById('lblClientTag').textContent = name.toUpperCase() + ' • DOB: ' + dob;

      const mPlan = PLANETS[m];
      const bPlan = PLANETS[b];
      const kPlan = PLANETS[kua];

      document.getElementById('kpiGrid').innerHTML = [
        '<div class="kpi-box"><div class="kpi-lbl">Mulank (Psychic)</div><div class="kpi-num">' + m + '</div><div class="kpi-sub">' + mPlan.name + '</div></div>',
        '<div class="kpi-box"><div class="kpi-lbl">Bhagyank (Destiny)</div><div class="kpi-num">' + b + '</div><div class="kpi-sub">' + bPlan.name + '</div></div>',
        '<div class="kpi-box"><div class="kpi-lbl">Sacred Kua Angel</div><div class="kpi-num">' + kua + '</div><div class="kpi-sub">' + kPlan.name + '</div></div>'
      ].join('');

      // 3x3 Lo-Shu Grid
      const rawDigits = (String(dd).padStart(2,'0') + String(mm).padStart(2,'0') + String(yyyy)).split('').map(Number).filter(n => n > 0);
      rawDigits.push(m, b, kua);
      const counts = {};
      for (let i=1; i<=9; i++) counts[i] = 0;
      rawDigits.forEach(d => { counts[d] = (counts[d] || 0) + 1; });

      const order = [4,9,2, 3,5,7, 8,1,6];
      const dirs = {4:'SE • Wealth',9:'S • Fame',2:'SW • Marriage',3:'E • Wisdom',5:'Center • Prana',7:'W • Children',8:'NE • Knowledge',1:'N • Career',6:'NW • Friends'};
      document.getElementById('loshuMatrix').innerHTML = order.map(num => {
        const c = counts[num] || 0;
        const cls = c > 0 ? 'loshu-cell present' : 'loshu-cell missing';
        return '<div class="' + cls + '">' +
          '<div style="font-size:9px; color:#fcd34d; font-weight:700;">' + dirs[num] + ' [' + num + ']</div>' +
          '<div style="font-size:18px; font-weight:900; margin:2px 0; color:' + (c > 0 ? '#6ee7b7' : '#fda4af') + ';">' + (c > 0 ? String(num).repeat(c) : 'MISSING') + '</div>' +
          '<div style="font-size:9px; color:#cbd5e1;">' + PLANETS[num].name + '</div>' +
        '</div>';
      }).join('');

      const missingNums = [1,2,3,4,5,6,7,8,9].filter(n => !counts[n]);
      document.getElementById('missingRemediesWrap').innerHTML = missingNums.length === 0
        ? '<div style="color:#6ee7b7; font-size:12px; font-weight:700; text-align:center;">★ All 9 Lo-Shu Digits Are Present in Your Chart!</div>'
        : '<table><thead><tr><th>Missing # &amp; Graha</th><th>Lucky Gem &amp; Color</th><th>Sound Freq (Hz) &amp; Vedic Beej Mantra</th></tr></thead><tbody>' +
          missingNums.map(n => '<tr><td><strong>Missing #' + n + '</strong><br/>' + PLANETS[n].name + '</td><td>' + PLANETS[n].gem + '<br/>Color: ' + PLANETS[n].color + '</td><td><strong>' + PLANETS[n].hz + '</strong><br/>' + PLANETS[n].mantra + '</td></tr>').join('') +
          '</tbody></table>';

      // Name & Mobile Comparison
      const defaultOptA = name + ' ' + (Object.keys(CHALDEAN).find(k => CHALDEAN[k] === mPlan.friends[0]) || 'A');
      const defaultOptB = name + (Object.keys(CHALDEAN).find(k => CHALDEAN[k] === bPlan.friends[0]) || 'S');
      const nameAVal = document.getElementById('inpNameA').value.trim() || defaultOptA;
      const nameBVal = document.getElementById('inpNameB').value.trim() || defaultOptB;

      const nOrig = analyzeChaldeanStr(name, m, b);
      const nA = analyzeChaldeanStr(nameAVal, m, b);
      const nB = analyzeChaldeanStr(nameBVal, m, b);

      const nRows = nOrig.score >= 88
        ? [ { lbl: '★ Natal / Active Name (Perfect Resonance)', str: name, res: nOrig, note: 'PERFECT FREQUENCY: Your current name is already in high harmony with Mulank ' + m + ' & Bhagyank ' + b + '. No spelling modification required.' } ]
        : [
            { lbl: '1. Original Name', str: name, res: nOrig, note: 'Mulank Relation: ' + nOrig.relM + ' | Bhagyank Relation: ' + nOrig.relB },
            { lbl: '2. Selected Option A', str: nameAVal, res: nA, note: 'Benefit: Aligns with ' + PLANETS[nA.root].name + ' (' + nA.score + '% Cosmic Harmony Index)' },
            { lbl: '3. Selected Option B', str: nameBVal, res: nB, note: 'Benefit: Aligns with ' + PLANETS[nB.root].name + ' (' + nB.score + '% Cosmic Harmony Index)' }
          ];

      document.getElementById('nameComparisonWrap').innerHTML =
        '<table><thead><tr><th>Name Spelling Tier</th><th>Compound ➔ Root</th><th>Harmony Index</th><th>Letter Breakdown &amp; Verdict</th></tr></thead><tbody>' +
        nRows.map(r => '<tr><td><strong>' + r.lbl + '</strong><br/>"' + r.str + '"</td><td><strong>' + r.res.compound + ' ➔ ' + r.res.root + '</strong><br/>' + PLANETS[r.res.root].name + '</td><td><span class="pill ' + (r.res.score>=82?'pill-good':r.res.score>=65?'pill-warn':'pill-bad') + '">' + r.res.score + '%</span></td><td>' + r.res.breakdown + '<br/><span style="color:#fcd34d;">' + r.note + '</span></td></tr>').join('') +
        '</tbody></table>';

      const mobAVal = document.getElementById('inpMobA').value.replace(/\\D/g, '').slice(-10) || (mobile.slice(0, 8) + String(m) + String(b));
      const mobBVal = document.getElementById('inpMobB').value.replace(/\\D/g, '').slice(-10) || (mobile.slice(0, 8) + '15');
      const mOrig = analyzeChaldeanStr(mobile, m, b);
      const mA = analyzeChaldeanStr(mobAVal, m, b);
      const mB = analyzeChaldeanStr(mobBVal, m, b);

      const mRows = mOrig.score >= 88
        ? [ { lbl: '★ Active Mobile (Perfect Resonance)', str: mobile, res: mOrig } ]
        : [
            { lbl: '1. Current Mobile', str: mobile, res: mOrig },
            { lbl: '2. Selected Mobile A', str: mobAVal, res: mA },
            { lbl: '3. Selected Mobile B', str: mobBVal, res: mB }
          ];

      document.getElementById('mobileComparisonWrap').innerHTML =
        '<table><thead><tr><th>Mobile Number Tier</th><th>Compound ➔ Root</th><th>Cosmic Harmony</th><th>9 Adjacent Pairs &amp; Alignment</th></tr></thead><tbody>' +
        mRows.map(r => {
          const pairs = [];
          for (let i=0; i<r.str.length-1; i++) pairs.push(r.str.slice(i, i+2));
          return '<tr><td><strong>' + r.lbl + '</strong><br/>' + r.str + '</td><td><strong>' + r.res.compound + ' ➔ ' + r.res.root + '</strong><br/>' + PLANETS[r.res.root].name + '</td><td><span class="pill ' + (r.res.score>=82?'pill-good':r.res.score>=65?'pill-warn':'pill-bad') + '">' + r.res.score + '%</span></td><td>Pairs: ' + pairs.join(' • ') + '<br/>M:' + r.res.relM + ' | B:' + r.res.relB + '</td></tr>';
        }).join('') + '</tbody></table>';

      // 45-Year Vedic Numerology Maha Dasha Timeline (Starting from Present Active Cycle)
      const nowYear = new Date().getFullYear();
      let curYear = yyyy;
      let dNum = m;
      const allCycles = [];
      while (curYear < nowYear + 55) {
        const endY = curYear + dNum;
        allCycles.push({
          dashaNumber: dNum,
          planet: PLANETS[dNum].name,
          startDate: String(dd).padStart(2,'0') + '/' + String(mm).padStart(2,'0') + '/' + curYear,
          endDate: String(dd).padStart(2,'0') + '/' + String(mm).padStart(2,'0') + '/' + endY,
          startYear: curYear,
          endYear: endY,
          duration: dNum,
          isCurrent: nowYear >= curYear && nowYear < endY,
          isPast: endY <= nowYear
        });
        curYear = endY;
        dNum = (dNum % 9) + 1;
      }
      const pastCycles = allCycles.filter(c => c.isPast);
      const presentAndFuture = allCycles.filter(c => !c.isPast).slice(0, 9);
      const activeCycle = presentAndFuture[0] || allCycles[0];

      document.getElementById('dashaSummaryBanner').innerHTML =
        '<div style="padding:8px 10px; border-radius:10px; background:rgba(245,158,11,0.16); border:1px solid #f59e0b;">' +
        '<strong style="color:#fde68a;">★ 1. PRESENT ACTIVE CYCLE:</strong> Dasha #' + activeCycle.dashaNumber + ' ' + activeCycle.planet + ' (' + activeCycle.startDate + ' to ' + activeCycle.endDate + ' • ' + activeCycle.duration + ' Yrs)<br/>' +
        '<strong style="color:#6ee7b7;">2. PAST COMPLETED CYCLES SINCE BIRTH:</strong> ' + (pastCycles.length > 0 ? pastCycles.map(p => '#' + p.dashaNumber + ' (' + p.startYear + '-' + p.endYear + ')').join(' • ') : 'Current Cycle is First Since Birth') +
        '</div>';

      document.getElementById('dashaTableWrap').innerHTML =
        '<table><thead><tr><th>Cycle &amp; Dasha Lord</th><th>Start Date ➔ End Date</th><th>Status</th><th>Planetary Guidance &amp; Remedy</th></tr></thead><tbody>' +
        presentAndFuture.map((c, idx) => '<tr><td><strong>' + (c.isCurrent ? '★ NOW: ' : (idx+1)+'. ') + 'Dasha #' + c.dashaNumber + '</strong><br/>' + c.planet + '</td><td>' + c.startDate + ' ➔ ' + c.endDate + '<br/>(' + c.duration + ' Years)</td><td><span class="pill ' + (c.isCurrent ? 'pill-good' : 'pill-warn') + '">' + (c.isCurrent ? '★ PRESENT ACTIVE' : 'UPCOMING') + '</span></td><td>' + PLANETS[c.dashaNumber].traits + '<br/><span style="color:#fcd34d;">Mantra: ' + PLANETS[c.dashaNumber].mantra + '</span></td></tr>').join('') +
        '</tbody></table>';

      // Universal Numeric Verifier
      const entityStr = document.getElementById('inpEntity').value.trim() || 'DL01AB1983';
      const entityType = document.getElementById('inpEntityType').value;
      const eRes = analyzeChaldeanStr(entityStr, m, b);
      document.getElementById('verifierResultWrap').innerHTML =
        '<div style="padding:10px; border-radius:12px; background:#090d16; border:1px solid rgba(16,185,129,0.45); font-size:12px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
          '<strong>' + entityType + ': "' + entityStr + '"</strong>' +
          '<span class="pill ' + (eRes.score>=80?'pill-good':eRes.score>=65?'pill-warn':'pill-bad') + '">' + eRes.score + '% Harmony</span>' +
        '</div>' +
        '<div><strong>Step-by-Step Calculation:</strong> ' + eRes.breakdown + ' = <strong>Compound ' + eRes.compound + ' ➔ Root ' + eRes.root + ' (' + PLANETS[eRes.root].name + ')</strong></div>' +
        '<div style="color:#6ee7b7; margin-top:4px;">Mulank ' + m + ' Relation: <strong>' + eRes.relM + '</strong> • Bhagyank ' + b + ' Relation: <strong>' + eRes.relB + '</strong> • Best Lucky Roots for You: <strong>' + mPlan.friends.join(', ') + '</strong></div>' +
        '</div>';

      // Daily Panchang
      const today = new Date();
      const dayIdx = today.getDay();
      const dayRulers = [1, 2, 9, 5, 3, 6, 8];
      const rahuWindows = ['04:30 PM - 06:00 PM','07:30 AM - 09:00 AM','03:00 PM - 04:30 PM','12:00 PM - 01:30 PM','01:30 PM - 03:00 PM','10:30 AM - 12:00 PM','09:00 AM - 10:30 AM'];
      const shubhWindows = ['08:15 AM - 12:15 PM','09:00 AM - 11:45 AM','10:30 AM - 01:30 PM','09:15 AM - 12:00 PM','07:30 AM - 11:30 AM','08:30 AM - 10:30 AM','11:30 AM - 02:30 PM'];
      const todayPlanet = PLANETS[dayRulers[dayIdx]];
      document.getElementById('panchangResultWrap').innerHTML =
        '<div style="padding:10px; border-radius:12px; background:rgba(30,17,54,0.85); border:1px solid rgba(245,158,11,0.4); font-size:11.5px;">' +
        '<strong style="color:#fde68a;">📅 TODAY’S VEDIC PANCHANG &amp; MUHURAT (' + today.toLocaleDateString('en-IN', { weekday:'long', day:'2-digit', month:'short', year:'numeric' }) + '):</strong><br/>' +
        '• <strong>Day Lord:</strong> ' + todayPlanet.name + ' • <strong>Shubh Hora:</strong> <span style="color:#6ee7b7;">' + shubhWindows[dayIdx] + '</span> • <strong>Avoid Rahu Kaal:</strong> <span style="color:#fda4af;">' + rahuWindows[dayIdx] + '</span><br/>' +
        '• <strong>Today’s Beej Mantra:</strong> <span style="color:#fcd34d;">' + todayPlanet.mantra + ' (108x)</span>' +
        '</div>';
    }

    function scrollToSec(id, btn) {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function shareOnWhatsApp() {
      const name = document.getElementById('inpName').value.trim() || 'Client';
      const dob = document.getElementById('inpDob').value || '';
      const mobile = document.getElementById('inpMobile').value.replace(/\\D/g, '').slice(-10);
      const parts = dob.split('-');
      const m = reduceSingle(parts[2] || 1);
      const b = reduceSingle((parts[2]||'')+(parts[1]||'')+(parts[0]||''));
      const nRes = analyzeChaldeanStr(name, m, b);
      const mRes = analyzeChaldeanStr(mobile, m, b);
      const msg = [
        '🕉️ *${TATHASTU_BRAND_NAME} (${TATHASTU_TAGLINE})*',
        '*Personalized Vedic & Chaldean Numerology Summary*',
        'Client: *' + name + '* (DOB: ' + dob + ')',
        '• Mulank: *' + m + '* (' + PLANETS[m].name + ') | Bhagyank: *' + b + '* (' + PLANETS[b].name + ')',
        '• Name Vibration: *' + nRes.compound + ' ➔ ' + nRes.root + '* (' + nRes.score + '% Cosmic Harmony)',
        '• Mobile Vibration (' + mobile + '): *' + mRes.compound + ' ➔ ' + mRes.root + '* (' + mRes.score + '% Harmony)',
        '• Daily Beej Mantra: *' + PLANETS[m].mantra + '*',
        'Prepared by Healer Deepak Jain (+91 ${TATHASTU_ADMIN_PHONE})'
      ].join('\\n');
      const waPhone = mobile.length === 10 ? '91' + mobile : '91${TATHASTU_ADMIN_PHONE}';
      window.open('https://wa.me/' + waPhone + '?text=' + encodeURIComponent(msg), '_blank');
    }

    populateProfileSelector();
  </script>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    return { blob, fileName: 'Tathastu_Divine_Light_Mobile_App.html' };
  };

  const handleDownloadAndroidStandaloneApp = async () => {
    const { blob, fileName } = await generateStandaloneMobileAppHtml();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setDownloadedLauncher(true);
    setTimeout(() => setDownloadedLauncher(false), 5000);
  };

  const handleShareStandaloneMobileAppFile = async () => {
    const { blob, fileName } = await generateStandaloneMobileAppHtml();
    const appFile = new File([blob], fileName, { type: 'text/html' });
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [appFile] })
    ) {
      try {
        await navigator.share({
          files: [appFile],
          title: `${TATHASTU_BRAND_NAME} — Mobile App`,
          text: `🕉️ ${TATHASTU_BRAND_NAME} (${TATHASTU_TAGLINE}) — Open this Mobile App file directly in Android Chrome or iOS Safari (Works 100% Offline & Online with Zero 403/404 Error!).`,
        });
        setSharedAppFile(true);
        setTimeout(() => setSharedAppFile(false), 5000);
        return;
      } catch {
        // Fallback to download
      }
    }
    await handleDownloadAndroidStandaloneApp();
    setSharedAppFile(true);
    setTimeout(() => setSharedAppFile(false), 5000);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          setIsInstalled(true);
          return;
        }
      } catch {
        // Fallback to centered modal + standalone download
      }
    }
    setShowModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleWhatsAppAppLink = () => {
    const activeLang = getCurrentLanguage();
    const rawText = [
      `🕉️ *${TATHASTU_BRAND_NAME} (${TATHASTU_TAGLINE})*`,
      `📲 *Official Vedic & Chaldean Numerology Mobile & Desktop App*`,
      ``,
      `👉 *Official Live App Link:*`,
      `${TATHASTU_OFFICIAL_APP_URL}`,
      ``,
      `✨ *Install & Open on Android, iPhone & Desktop:*`,
      `• *Official Cloud Link:* Open ${TATHASTU_OFFICIAL_APP_URL} in Chrome (Android/Desktop) or Safari (iOS) and tap *"Add to Home screen"* / *"Install App"*.`,
      `• *Offline Standalone Option:* You can also share the *Tathastu_Divine_Light_Mobile_App.html* file via WhatsApp for 100% offline mobile access.`,
      ``,
      `📞 Support / Admin: +91 ${TATHASTU_ADMIN_PHONE}`,
    ].join('\n');
    const text = validateAndNormalizeLocaleText(
      translateMultilineBlock(rawText, activeLang),
      activeLang,
      { context: 'whatsapp' }
    ).sanitizedText;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalPortal =
    showModal && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative my-auto w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-500/60 p-4 sm:p-6 shadow-[0_0_70px_rgba(245,158,11,0.35)] text-left max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-3 pr-8">
                <img
                  src={TATHASTU_LOGO_PATH}
                  alt={TATHASTU_BRAND_NAME}
                  className="w-13 h-13 rounded-2xl border-2 border-amber-400 shadow-lg object-cover shrink-0"
                />
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    <Sparkles className="w-3 h-3" /> Android, iOS &amp; Desktop Ready
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-amber-200 leading-tight">
                    Download &amp; Install {TATHASTU_BRAND_NAME}
                  </h3>
                  <p className="text-[11px] text-amber-300/90 font-medium">{TATHASTU_TAGLINE}</p>
                </div>
              </div>

              {/* PRIMARY SOLUTION: 100% Self-Contained Mobile App File (Fixes Google 403 & 404 Permanently!) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/90 border-2 border-emerald-400/70 mb-3.5 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    Direct Mobile App Download (100% Fixes Error 403 &amp; 404)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9.5px] uppercase">
                    Works on Every Phone
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  Google AI Studio blocks unauthenticated phones with <strong>Error 403</strong> on private developer URLs. Click below to download or share the <strong>Full Standalone Mobile App File (<code className="text-amber-300">Tathastu_Divine_Light_Mobile_App.html</code>)</strong> — it runs <strong>100% directly on Android &amp; iPhone with all calculators &amp; profiles embedded (Zero 403 Error &amp; Works Offline!)</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadAndroidStandaloneApp}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <FileDown className="w-4 h-4 shrink-0" />
                    {downloadedLauncher
                      ? '✓ Mobile App Downloaded!'
                      : '1. Download Full Mobile App'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareStandaloneMobileAppFile}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Share className="w-4 h-4 shrink-0" />
                    {sharedAppFile
                      ? '✓ App File Ready to Send!'
                      : '2. Send App File to Phone / WA'}
                  </button>
                </div>
              </div>

              {/* Native Browser PWA Prompt (if supported on current browser) */}
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full mb-3.5 py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  Install Native Home Screen App on This Device Now
                </button>
              )}

              {/* Centered QR Code & Cloud Link Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-amber-500/40 mb-3.5 flex flex-col items-center text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center justify-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  Cloud Portal QR &amp; Direct Link
                </div>

                {qrDataUrl && (
                  <div className="p-2 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-md mb-2.5">
                    <img
                      src={qrDataUrl}
                      alt="Scan QR to Open App"
                      className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                    />
                  </div>
                )}

                <div className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-amber-200 break-all mb-2.5 select-all">
                  {liveAppUrl}
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Cloud Link
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppAppLink}
                    className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Link
                  </button>
                </div>
              </div>

              {/* Official Cloud App Link & Home Screen Install Guide */}
              <div className="space-y-2 text-xs text-slate-300 bg-slate-950/90 p-3.5 rounded-2xl border border-amber-500/30 mb-3.5">
                <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  Official App URL &amp; Mobile Home Screen Guide:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-200 leading-relaxed">
                  <li>
                    <strong className="text-emerald-300">Official Published App Link:</strong> Share or open{' '}
                    <code className="text-emerald-300 break-all">{publicSharedUrl}</code>{' '}
                    directly on any Android, iOS, or Desktop browser, or scan the QR code above.
                  </li>
                  <li>
                    <strong className="text-amber-200">Offline Mobile App Package:</strong> Tap{' '}
                    <strong>&ldquo;1. Download Full Mobile App&rdquo;</strong> above to save{' '}
                    <code className="text-amber-300">Tathastu_Divine_Light_Mobile_App.html</code>{' '}
                    for 100% offline numerology calculations on Android &amp; iPhone.
                  </li>
                  <li>
                    <strong className="text-sky-300">Add to Mobile Home Screen:</strong> On Android Chrome tap <strong>⋮ Menu → Add to Home screen</strong>; on iPhone Safari tap <strong>Share → Add to Home Screen</strong>.
                  </li>
                </ol>
              </div>

              <div className="flex items-center justify-between gap-2">
                <a
                  href={liveAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  if (compact) {
    return (
      <>
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
            title="Download / Install App on Android, iOS or Desktop (Zero 403)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstalled ? 'App Link / QR' : 'Install App'}</span>
          </button>
        </div>
        {modalPortal}
      </>
    );
  }

  return (
    <>
      <div className={`w-full flex flex-col items-center justify-center ${className}`}>
        <div className="w-full max-w-xl mx-auto p-4 rounded-2xl bg-slate-900/95 border-2 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.2)] flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <img
              src={TATHASTU_LOGO_PATH}
              alt={TATHASTU_BRAND_NAME}
              className="w-10 h-10 rounded-xl border border-amber-400 object-cover"
            />
            <div className="text-left">
              <div className="text-xs font-serif font-bold text-amber-200 uppercase tracking-wider">
                {TATHASTU_BRAND_NAME} — Mobile &amp; Desktop App
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold">
                Direct Android &amp; iOS Mobile App Download (Zero 403 Error • Works Offline &amp; Online)
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
            <button
              type="button"
              onClick={handleDownloadAndroidStandaloneApp}
              className="flex-1 min-w-[185px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>
                {downloadedLauncher
                  ? '✓ Mobile App Downloaded!'
                  : 'Download Android / iOS App'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-200 border border-amber-500/45 font-bold text-xs transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>App QR &amp; Share File</span>
            </button>

            <button
              type="button"
              onClick={handleShareStandaloneMobileAppFile}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/45 font-bold text-xs transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Send App to Phone</span>
            </button>
          </div>
        </div>
      </div>

      {modalPortal}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/95 border border-amber-500/50 text-amber-200 text-xs font-bold shadow-xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Offline Mode Active — All Vedic &amp; Chaldean Calculations Work Locally</span>
    </div>
  );
};
