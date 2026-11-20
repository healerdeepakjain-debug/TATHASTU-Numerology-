import express, { Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ============================================================================
// REAL-TIME CROSS-DEVICE SYNC HUB (SSE + PERSISTENT SERVER STATE)
// Syncs Accounts, Profiles, Plans, Coupons, Broadcast Updates, Feedbacks & PayU Config
// across Mobile (Android/iOS), Tablet & Desktop devices in real time.
// ============================================================================
interface PayUMerchantServerConfig {
  merchantKey: string;
  merchantSalt: string;
  upiVpa: string;
  payeeName: string;
  environment: 'production' | 'test';
  updatedAt?: number;
}

interface RealtimeSyncState {
  accounts: Record<string, any>[];
  profiles: Record<string, any>[];
  plans: Record<string, any>[];
  coupons: Record<string, any>[];
  broadcasts: Record<string, any>[];
  feedbacks: Record<string, any>[];
  payuConfig?: PayUMerchantServerConfig;
  deletedIds: Record<string, number>;
  updatedAt: number;
}

const REALTIME_DB_FILE = path.resolve(__dirname, '.tathastu-realtime-db.json');

function loadRealtimeState(): RealtimeSyncState {
  try {
    if (fs.existsSync(REALTIME_DB_FILE)) {
      const raw = fs.readFileSync(REALTIME_DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const rawAccounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
        const normalizedAccounts = rawAccounts.map((acc: Record<string, any>) => {
          if (acc && (acc.id === 'admin_tathastu_master' || acc.role === 'admin')) {
            return {
              ...acc,
              email: 'healer.ddeepak.jain@gmail.com',
              healerBrandName: 'TATHASTU NUMEROLOGY — TATHASTU THE DIVINE LIGHT',
              healerAddress:
                'TATHASTU NUMEROLOGY • TATHASTU THE DIVINE LIGHT • healer.ddeepak.jain@gmail.com • +91 8899444444',
            };
          }
          return acc;
        });
        return {
          accounts: normalizedAccounts,
          profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
          plans: Array.isArray(parsed.plans) ? parsed.plans : [],
          coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [],
          broadcasts: Array.isArray(parsed.broadcasts) ? parsed.broadcasts : [],
          feedbacks: Array.isArray(parsed.feedbacks) ? parsed.feedbacks : [],
          payuConfig:
            parsed.payuConfig && typeof parsed.payuConfig === 'object'
              ? parsed.payuConfig
              : undefined,
          deletedIds:
            parsed.deletedIds && typeof parsed.deletedIds === 'object' ? parsed.deletedIds : {},
          updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
        };
      }
    }
  } catch {
    // Ignore read error
  }
  return {
    accounts: [],
    profiles: [],
    plans: [],
    coupons: [],
    broadcasts: [],
    feedbacks: [],
    payuConfig: undefined,
    deletedIds: {},
    updatedAt: Date.now(),
  };
}

let realtimeState: RealtimeSyncState = loadRealtimeState();

function persistRealtimeState(): void {
  try {
    fs.writeFileSync(REALTIME_DB_FILE, JSON.stringify(realtimeState), 'utf-8');
  } catch {
    // Ignore disk write error in read-only environments
  }
}

function mergeById(
  existingList: Record<string, any>[],
  incomingList: Record<string, any>[],
  deletedMap: Record<string, number>,
  preferIncoming = true
): Record<string, any>[] {
  const map = new Map<string, Record<string, any>>();
  for (const item of existingList) {
    if (item && typeof item.id === 'string' && !deletedMap[item.id]) {
      map.set(item.id, item);
    }
  }
  for (const item of incomingList) {
    if (item && typeof item.id === 'string' && !deletedMap[item.id]) {
      const prev = map.get(item.id);
      if (!prev || preferIncoming) {
        map.set(item.id, { ...prev, ...item });
      }
    }
  }
  return Array.from(map.values());
}

const sseClients = new Set<Response>();

function broadcastSsePayload(eventType: string, extraMeta?: Record<string, any>): void {
  const payload = JSON.stringify({
    eventType,
    extraMeta: extraMeta || null,
    state: realtimeState,
  });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send immediate snapshot on connect
  const initialPayload = JSON.stringify({
    eventType: 'initial_snapshot',
    state: realtimeState,
  });
  res.write(`data: ${initialPayload}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

app.get('/api/realtime/state', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({
    ok: true,
    state: realtimeState,
  });
});

app.post('/api/realtime/sync', (req, res) => {
  try {
    const body = req.body || {};
    const action = String(body.action || 'merge_state');
    const now = Date.now();

    // Record explicit deletions first so deleted items do not resurrect during merge
    if (Array.isArray(body.deleteIds)) {
      for (const delId of body.deleteIds) {
        if (typeof delId === 'string' && delId.trim()) {
          realtimeState.deletedIds[delId.trim()] = now;
        }
      }
    }

    const preferIncoming = action !== 'boot_seed';

    if (Array.isArray(body.accounts)) {
      realtimeState.accounts = mergeById(
        realtimeState.accounts,
        body.accounts,
        realtimeState.deletedIds,
        preferIncoming
      );
    }
    if (Array.isArray(body.profiles)) {
      realtimeState.profiles = mergeById(
        realtimeState.profiles,
        body.profiles,
        realtimeState.deletedIds,
        preferIncoming
      );
    }
    if (Array.isArray(body.plans)) {
      if (action === 'replace_plans') {
        realtimeState.plans = body.plans.filter(
          (p: any) => p && typeof p.id === 'string' && !realtimeState.deletedIds[p.id]
        );
      } else {
        realtimeState.plans = mergeById(
          realtimeState.plans,
          body.plans,
          realtimeState.deletedIds,
          preferIncoming
        );
      }
    }
    if (Array.isArray(body.coupons)) {
      realtimeState.coupons = mergeById(
        realtimeState.coupons,
        body.coupons,
        realtimeState.deletedIds,
        preferIncoming
      ).sort((a, b) => String(b.createdAtIso || '').localeCompare(String(a.createdAtIso || '')));
    }
    if (Array.isArray(body.broadcasts)) {
      realtimeState.broadcasts = mergeById(
        realtimeState.broadcasts,
        body.broadcasts,
        realtimeState.deletedIds,
        preferIncoming
      ).sort((a, b) => String(b.createdAtIso || '').localeCompare(String(a.createdAtIso || '')));
    }
    if (Array.isArray(body.feedbacks)) {
      realtimeState.feedbacks = mergeById(
        realtimeState.feedbacks,
        body.feedbacks,
        realtimeState.deletedIds,
        preferIncoming
      ).sort((a, b) => String(b.createdAtIso || '').localeCompare(String(a.createdAtIso || '')));
    }

    // Filter out any newly deleted IDs from existing arrays
    realtimeState.accounts = realtimeState.accounts.filter(
      (x) => !realtimeState.deletedIds[x.id]
    );
    realtimeState.profiles = realtimeState.profiles.filter(
      (x) => !realtimeState.deletedIds[x.id]
    );
    realtimeState.plans = realtimeState.plans.filter((x) => !realtimeState.deletedIds[x.id]);
    realtimeState.coupons = realtimeState.coupons.filter((x) => !realtimeState.deletedIds[x.id]);
    realtimeState.broadcasts = realtimeState.broadcasts.filter(
      (x) => !realtimeState.deletedIds[x.id]
    );
    realtimeState.feedbacks = realtimeState.feedbacks.filter(
      (x) => !realtimeState.deletedIds[x.id]
    );

    if (body.payuConfig && typeof body.payuConfig === 'object') {
      const incomingCfg = body.payuConfig;
      const incomingUpdatedAt =
        typeof incomingCfg.updatedAt === 'number' ? incomingCfg.updatedAt : now;
      const existingUpdatedAt = realtimeState.payuConfig?.updatedAt || 0;
      if (action === 'payu_config_sync' || !realtimeState.payuConfig || incomingUpdatedAt >= existingUpdatedAt) {
        realtimeState.payuConfig = {
          merchantKey: String(incomingCfg.merchantKey || '').trim(),
          merchantSalt: String(incomingCfg.merchantSalt || '').trim(),
          upiVpa: String(incomingCfg.upiVpa || '').trim(),
          payeeName: String(incomingCfg.payeeName || 'TATHASTU NUMEROLOGY').trim(),
          environment: incomingCfg.environment === 'test' ? 'test' : 'production',
          updatedAt: incomingUpdatedAt,
        };
      }
    }

    realtimeState.updatedAt = now;
    persistRealtimeState();
    broadcastSsePayload(action, body.meta || undefined);

    return res.json({
      ok: true,
      state: realtimeState,
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Realtime sync error',
    });
  }
});

// Signed PDF Blob Cache for cross-device mobile downloads (Android / iOS / WebViews)
interface SignedPdfRecord {
  buffer: Buffer;
  fileName: string;
  token: string;
  createdAt: number;
}
const signedPdfStore = new Map<string, SignedPdfRecord>();

app.post('/api/reports/upload-signed', (req, res) => {
  try {
    const { profileId, fileName, pdfBase64 } = req.body || {};
    if (!profileId || !pdfBase64 || typeof pdfBase64 !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing profileId or pdfBase64 payload' });
    }
    const safeProfileId = String(profileId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = String(fileName || `Tathastu_Divine_Light_Report_${safeProfileId}.pdf`).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const buffer = Buffer.from(pdfBase64, 'base64');
    const token = crypto
      .createHmac('sha256', process.env.GEMINI_API_KEY || 'tathastu-sacred-pdf-signing-key')
      .update(`${safeProfileId}:${safeFileName}:${buffer.length}`)
      .digest('hex')
      .slice(0, 32);

    signedPdfStore.set(safeProfileId, {
      buffer,
      fileName: safeFileName,
      token,
      createdAt: Date.now(),
    });

    // Prune entries older than 24 hours if cache exceeds 60 items
    if (signedPdfStore.size > 60) {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for (const [k, v] of signedPdfStore.entries()) {
        if (v.createdAt < cutoff) signedPdfStore.delete(k);
      }
    }

    const signedPath = `/api/reports/download/${encodeURIComponent(safeProfileId)}/${encodeURIComponent(safeFileName)}?token=${token}`;
    return res.json({
      ok: true,
      token,
      signedPath,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || 'Upload failed' });
  }
});

app.get('/api/reports/download/:profileId/:fileName', (req, res) => {
  const safeProfileId = String(req.params.profileId || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const record = signedPdfStore.get(safeProfileId);
  if (!record) {
    return res.status(404).send('Report PDF expired or not yet generated. Please open the interactive report link to auto-generate the PDF.');
  }
  const reqToken = String(req.query.token || '');
  if (reqToken && reqToken !== record.token) {
    return res.status(403).send('Invalid signed report token.');
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', String(record.buffer.length));
  res.setHeader('Content-Disposition', `attachment; filename="${record.fileName}"`);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(record.buffer);
});

const rawApiKey = process.env.GEMINI_API_KEY;
const hasValidKey = Boolean(
  rawApiKey &&
    rawApiKey.trim() !== '' &&
    rawApiKey !== 'MY_GEMINI_API_KEY' &&
    rawApiKey !== 'YOUR_API_KEY'
);

const ai = hasValidKey
  ? new GoogleGenAI({
      apiKey: rawApiKey!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function buildClassicalVedicResponse(prompt: string, profileData: any): string {
  const name = profileData?.name || 'Seeker';
  const mulank = Number(profileData?.mulank) || 1;
  const bhagyank = Number(profileData?.bhagyank) || 1;
  const mulankPlanet = profileData?.mulankPlanet || 'Sun (Surya)';
  const bhagyankPlanet = profileData?.bhagyankPlanet || 'Jupiter (Guru)';
  const namank = profileData?.namank || 19;
  const rashi = profileData?.rashi || 'Mesha (Aries)';
  const nakshatra = profileData?.nakshatra || 'Ashwini';
  const luckyColor = profileData?.luckyColor || 'Saffron Gold & Royal Yellow';
  const luckyGem = profileData?.luckyGem || 'Natural Burmese Ruby or Yellow Sapphire';
  const beejMantra = profileData?.beejMantra || 'Om Hram Hreem Hroum Sah Suryaya Namah';
  const friendlyNums = profileData?.friendlyNumbers || '1, 3, 5, 9';
  const luckyDays = profileData?.luckyDays || 'Sunday, Thursday, and Tuesday';

  const q = (prompt || '').toLowerCase();

  if (q.includes('signature') || q.includes('ink') || q.includes('pen') || q.includes('sign')) {
    return `### 🖋️ Sacred Signature & Grapho-Numerology Analysis for ${name}

**1. Planetary Ruling of Your Hand & Signature**
- **Mulank (Psychic Driver)**: **${mulank}** (${mulankPlanet})
- **Bhagyank (Life Path Destiny)**: **${bhagyank}** (${bhagyankPlanet})
- **Janma Rashi & Nakshatra**: **${rashi}** • **${nakshatra}**

**2. Prescribed Signature Geometry (Vedic Graphology)**
- **Ascending Angle (15° to 25° Upward Slope)**: Always incline your signature upward toward the North-East corner of the page. This activates the **Jupiterian (Guru) Ishanya Kona**, attracting continuous career elevation and administrative authority.
- **No Strikethroughs or Backward Loops**: Never cut through the letters of **${name}** or loop backward at the end of your signature—backward strokes pull past karmic debts into present agreements.
- **Supportive Underline with Two Dots**: Draw a single unbroken ascending underline beneath your name and place **two sacred bindu dots** below the line to anchor wealth retention (Dhanalakshmi) and protect against litigation.
- **First Letter Prominence**: Keep the initial capital letter of your first name approximately 1.5x taller than the rest to fortify **Manipura (Solar Plexus)** authority.

**3. Ideal Pen Ink & Instrument Vibration**
- **Primary Auspicious Ink Color**: **${luckyColor}** or **Royal Blue / Gold-Trimmed Rollerball** (harmonizes with ${mulankPlanet} & ${bhagyankPlanet}).
- **Inks to Avoid on Legal Contracts**: Avoid dull black or broken-flow pens during Rahu Kaal, as they amplify Saturn-Rahu delays.

**4. Siddhi Mantra Before Signing Major Documents**
> *"${beejMantra}"* (Chant mentally 3 times before signing any high-value contract or property deed on **${luckyDays}**).`;
  }

  if (q.includes('mobile') || q.includes('phone') || q.includes('sim') || q.includes('digit')) {
    return `### 📱 Vedic & Chaldean Mobile Number Resonance for ${name}

**1. Your Core Numerological Matrix**
- **Mulank ${mulank} (${mulankPlanet})** & **Bhagyank ${bhagyank} (${bhagyankPlanet})**
- **Harmonious Digit Family**: **${friendlyNums}**

**2. High-Wealth Terminal 4-Digit Combinations (Last 4 Digits)**
- **For Business Expansion & High-Ticket Closings**: End your mobile number with **1551, 3559, 1995, or 3669**—these pair Mercury's trade velocity (5) with Sun/Jupiter authority (1, 3, 9).
- **For Luxury, Client Magnetism & Public Fame**: End with **6556, 2466, or 1566** to channel Venusian (Shukra) attraction.
- **Total 10-Digit Sum Target**: Ensure all 10 digits sum to a Royal Chaldean Compound such as **41 (Root 5)**, **46 (Root 1)**, **37 (Root 1)**, **45 (Root 9)**, or **51 (Root 6)**.

**3. Digit Pairs to Strictly Exclude**
- Avoid consecutive **88, 48, 84, 28, or 82** in the final 4 digits, as they trigger Saturn-Rahu payment delays, chronic stress, and misunderstood communications.

**4. Pranic Activation Ritual**
- Write your chosen auspicious compound number in **saffron or gold ink** inside your phone case and chant: *"${beejMantra}"* 11 times on **${luckyDays}**.`;
  }

  if (q.includes('gem') || q.includes('stone') || q.includes('rudraksha') || q.includes('crystal') || q.includes('loshu') || q.includes('grid')) {
    return `### 💎 Ratna Shastra (Gemstone) & Rudraksha Prescription for ${name}

**1. Natal Planetary & Lo-Shu Bio-Field Diagnosis**
- **Primary Life Ruler**: **Mulank ${mulank} (${mulankPlanet})**
- **Destiny Pillar**: **Bhagyank ${bhagyank} (${bhagyankPlanet})**
- **Lunar Mansion**: **${rashi} (${nakshatra})**

**2. Prescribed Primary Ratna (Vedic Gemstone)**
- **Ratna**: **${luckyGem}**
- **Weight & Metal**: Minimum **5.25 Ratti (approx. 4.75 Carats)** set in **Panchdhatu or 22K Gold** (or Sterling Silver if Moon/Venus ruled) so the base of the stone touches the skin.
- **Finger & Wearing Muhurat**: Wear during the ascending **Shukla Paksha** on **${luckyDays}** within the first hour after sunrise (Hora of ${mulankPlanet}).

**3. Sacred Nepalese Rudraksha Combination**
- **Primary Bead**: **${mulank === 1 ? '1 Mukhi or 12 Mukhi (Surya)' : mulank === 2 ? '2 Mukhi (Ardhanareshwar)' : mulank === 3 ? '5 Mukhi (Devguru Brihaspati)' : mulank === 4 ? '8 Mukhi (Ganesha / Rahu)' : mulank === 5 ? '4 Mukhi (Budha / Brahma)' : mulank === 6 ? '6 Mukhi or 13 Mukhi (Shukra / Kartikeya)' : mulank === 7 ? '9 Mukhi (Durga / Ketu)' : mulank === 8 ? '7 Mukhi (Mahalakshmi / Shani)' : '3 Mukhi (Agni / Mangal)'} Rudraksha** paired with a **7 Mukhi Mahalakshmi bead** to balance missing Lo-Shu grid planes and stabilize cash flow.

**4. Prana Pratishtha (Energization Mantra)**
> *"${beejMantra}"* (Recite 108 times while dipping the ring/pendant in raw cow's milk and Gangajal before wearing).`;
  }

  if (q.includes('name') || q.includes('spelling') || q.includes('delay') || q.includes('compound')) {
    return `### 🕉️ Chaldean Name Vibration & Phonetic Diagnosis for ${name}

**1. Current Name Vibration Assessment**
- **Current Chaldean Compound**: **${namank}**
- **Natal Rulers**: **Mulank ${mulank} (${mulankPlanet})** • **Bhagyank ${bhagyank} (${bhagyankPlanet})**
- **Janma Rashi**: **${rashi} (${nakshatra})**

**2. Why Delays or Friction Occur**
- In Cheiro's Chaldean Kabala system, every spoken syllable projects an electromagnetic sound wave into your **Vishuddha (Throat) and Ajna (Third Eye) Chakras**. When the compound number of your name clashes with your Mulank (${mulank}) or Bhagyank (${bhagyank}), opportunities stall at the final stage of execution.

**3. Prescribed Spelling Calibration**
- Tune your full name spelling so its Chaldean compound lands on one of your **Supreme Fortunate Star Numbers**:
  - **Compound 19 (The Prince of Heaven - Sun)**: Bestows royal patronage, victory over obstacles, and continuous elevation.
  - **Compound 23 (The Royal Star of the Lion - Mercury)**: Guarantees assistance from high authorities and commercial dexterity.
  - **Compound 24 (Love, Money & Creativity - Venus)**: Magnetizes wealth, harmonious partnerships, and public admiration.
  - **Compound 37 (Good & Fortunate Friendship - Sun/Moon)**: Ideal for enduring enterprise and domestic felicity.
  - **Compound 41 or 45**: Exceptional for executive leadership and asset accumulation.

**4. Daily Name-Charging Sadhana**
- Write your harmonized name spelling **21 times every morning** in a dedicated journal using **${luckyColor}** ink while chanting:
> *"${beejMantra}"*`;
  }

  return `### 🔱 Comprehensive Vedic Jyotish & Chaldean Oracle Reading for ${name}

**1. Natal & Numerological Alignment Summary**
- **Query**: *"${prompt}"*
- **Mulank (Psychic Root)**: **${mulank}** — Governed by **${mulankPlanet}**
- **Bhagyank (Destiny Path)**: **${bhagyank}** — Governed by **${bhagyankPlanet}**
- **Chaldean Name Compound**: **${namank}**
- **Sidereal Moon Sign & Nakshatra**: **${rashi}** • **${nakshatra}**

**2. Classical Astrological & Numerological Guidance**
- The interplay between **${mulankPlanet}** (Mulank ${mulank}) and **${bhagyankPlanet}** (Bhagyank ${bhagyank}) indicates that your highest material and spiritual breakthroughs arrive when you initiate key decisions on dates reducing to **${friendlyNums}**.
- Because your Janma Rashi is **${rashi}** (${nakshatra} Nakshatra), aligning your commercial agreements, investments, and sacred sankalpas with **${luckyDays}** amplifies your natural **Manipura (Solar Plexus)** and **Ajna (Third Eye)** magnetism.

**3. Auspicious Timing & Action Protocol**
- **Most Favorable Days**: **${luckyDays}**
- **Harmonious Numbers for Pricing, Contracts & Dates**: **${friendlyNums}**
- **Power Colors for Attire & Branding**: **${luckyColor}**
- **Recommended Ratna / Crystal**: **${luckyGem}**

**4. Prescribed Vedic & Pranic Aura Remedy**
- Light a pure cow-ghee lamp facing **East / North-East** during the morning Hora on **${luckyDays}** and recite your planetary Siddhi Mantra 27 or 108 times:
> *"${beejMantra}"*`;
}

const LANGUAGE_INSTRUCTION_MAP: Record<string, string> = {
  hi: 'Standard pure Hindi in Devanagari script with accurate, orthographically correct Vedic & Chaldean terminology (no mixed English filler).',
  mr: 'Standard Marathi in Devanagari script with authentic Vedic spiritual terminology.',
  gu: 'Standard Gujarati in Gujarati script with authentic Vedic spiritual terminology.',
  pa: 'Standard Punjabi in Gurmukhi script with authentic Vedic spiritual terminology.',
  bn: 'Standard Bengali in Bengali script with authentic Vedic spiritual terminology.',
  ta: 'Standard Tamil in Tamil script with authentic Vedic spiritual terminology.',
  te: 'Standard Telugu in Telugu script with authentic Vedic spiritual terminology.',
  kn: 'Standard Kannada in Kannada script with authentic Vedic spiritual terminology.',
  ml: 'Standard Malayalam in Malayalam script with authentic Vedic spiritual terminology.',
  or: 'Standard Odia in Odia script with authentic Vedic spiritual terminology.',
  as: 'Standard Assamese in Assamese/Bengali script with authentic Vedic spiritual terminology.',
  'en-hi': 'Bilingual English with key Vedic terms in Hindi (Devanagari).',
  en: 'Clean, articulate English.',
};

// Vedic Astro-Numerology Deep AI Consultation Endpoint
app.post('/api/gemini/consult', async (req, res) => {
  const { prompt, profileData, analysisType, language = 'en-hi' } = req.body;
  const fallbackText = buildClassicalVedicResponse(prompt, profileData);
  const langDirective =
    LANGUAGE_INSTRUCTION_MAP[String(language)] || LANGUAGE_INSTRUCTION_MAP['en-hi'];

  if (!ai) {
    return res.json({
      available: true,
      source: 'classical-engine',
      text: fallbackText,
    });
  }

  try {
    const systemInstruction = `You are an enlightened master of classical Vedic Astrology (Jyotish Shastra), Chaldean Numerology (Cheiro Kabala tradition), and Vastu Shastra.
IMPORTANT LANGUAGE REQUIREMENT: Write your entire response strictly in ${langDirective}
The user is consulting you for a sacred and precise analysis regarding: ${analysisType || 'Numerological Correction & Astrological Harmony'}.
User profile details:
- Name: ${profileData?.name || 'Devotee'}
- Date of Birth: ${profileData?.dob || 'Not specified'}
- Mulank (Psychic/Root): ${profileData?.mulank || 'Calculated'} (${profileData?.mulankPlanet || ''})
- Bhagyank (Life Path): ${profileData?.bhagyank || 'Calculated'} (${profileData?.bhagyankPlanet || ''})
- Current Namank: ${profileData?.namank || 'Calculated'}
- Janma Rashi & Nakshatra: ${profileData?.rashi || ''} / ${profileData?.nakshatra || ''}
- Mobile: ${profileData?.mobile || 'Not specified'}

Provide authentic, articulate, compassionate, and precise guidance adhering to classical texts (Brihat Parashara Hora Shastra, Brihat Samhita, Cheiro Book of Numbers).
Format your response with clean markdown headings, bullet points, planetary mantra prescriptions, lucky gemstone, and auspicious action steps. Keep it focused, dignified, and grammatically spotless.`;

    const aiPromise = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents:
        prompt ||
        'Analyze my birth vibrations and provide sacred recommendations for name harmony and life path success.',
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 4500)
    );

    const response = await Promise.race([aiPromise, timeoutPromise]);

    if (response && response.text) {
      return res.json({
        available: true,
        source: 'gemini',
        text: response.text,
      });
    }

    return res.json({
      available: true,
      source: 'classical-engine',
      text: fallbackText,
    });
  } catch (error: any) {
    return res.json({
      available: true,
      source: 'classical-engine',
      text: fallbackText,
    });
  }
});

// Daily transit & personalized cosmic horoscope forecast endpoint
app.post('/api/gemini/daily-horoscope', async (req, res) => {
  try {
    const { profileData, date, language = 'en-hi' } = req.body;
    const langDirective =
      LANGUAGE_INSTRUCTION_MAP[String(language)] || LANGUAGE_INSTRUCTION_MAP['en-hi'];
    if (!ai) {
      return res.status(503).json({
        available: false,
        message: 'Built-in classical ephemeris calculation active.',
      });
    }

    const prompt = `Generate a daily Vedic horoscope and numerological forecast for ${date || 'Today'}.
Write the entire response in ${langDirective}
User details:
- Name: ${profileData?.name}
- Mulank: ${profileData?.mulank} (Ruler: ${profileData?.mulankPlanet})
- Bhagyank: ${profileData?.bhagyank} (Ruler: ${profileData?.bhagyankPlanet})
- Moon Sign / Rashi: ${profileData?.rashi || 'Mesh / Aries'}
- Nakshatra: ${profileData?.nakshatra || 'Ashwini'}

Include:
1. Daily Cosmic Vibration (Score out of 100)
2. Career & Money outlook
3. Love & Family harmony
4. Best Auspicious Hora / Time Window to make decisions
5. Today's Beej Mantra and Lucky Color`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are an authentic Vedic Jyotishi and Numerology oracle. Respond in ${langDirective} with high spiritual precision, grammatical accuracy, and warmth.`,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    return res.json({
      available: true,
      text: response.text,
    });
  } catch (error: any) {
    return res.status(500).json({ available: false, error: error.message });
  }
});

// Native Android Container Project Export Endpoint (Generates self-extracting Android Studio + Capacitor setup kit)
app.get('/api/android/export-bundle', (_req, res) => {
  try {
    const androidFiles = [
      'capacitor.config.ts',
      'ANDROID_BUILD_GUIDE.md',
      'scripts/sync-android-assets.mjs',
      'android/settings.gradle',
      'android/build.gradle',
      'android/gradle.properties',
      'android/app/build.gradle',
      'android/app/proguard-rules.pro',
      'android/app/src/main/AndroidManifest.xml',
      'android/app/src/main/java/com/tathastulight/numerology/MainActivity.java',
      'android/app/src/main/res/values/strings.xml',
      'android/app/src/main/res/values/colors.xml',
      'android/app/src/main/res/values/styles.xml',
      'android/app/src/main/res/xml/network_security_config.xml',
      'android/app/src/main/res/xml/file_paths.xml',
    ];

    const payload: Record<string, string> = {};
    for (const relPath of androidFiles) {
      const fullPath = path.resolve(__dirname, relPath);
      if (fs.existsSync(fullPath)) {
        payload[relPath] = fs.readFileSync(fullPath, 'utf-8');
      }
    }

    const installerScript = [
      '#!/usr/bin/env node',
      '/**',
      ' * TATHASTU NUMEROLOGY — Native Android Container Project Extractor',
      ' * App Creator & Master Admin: Healer Ddeepak Jain (healer.ddeepak.jain@gmail.com)',
      ' * Usage: Place inside your exported project root and run:',
      ' *   node Tathastu_Numerology_Android_Container_Setup.mjs',
      ' * Then run `npm run android:sync` and open `./android` in Android Studio to build APK / AAB.',
      ' */',
      "import fs from 'fs';",
      "import path from 'path';",
      '',
      `const FILES = ${JSON.stringify(payload, null, 2)};`,
      '',
      'for (const [relPath, content] of Object.entries(FILES)) {',
      '  const target = path.resolve(process.cwd(), relPath);',
      '  fs.mkdirSync(path.dirname(target), { recursive: true });',
      "  fs.writeFileSync(target, content, 'utf-8');",
      '  console.log("✓ Wrote", relPath);',
      '}',
      'console.log("\\n✅ TATHASTU NUMEROLOGY Android Studio container files extracted!");',
      'console.log("Next steps:");',
      'console.log("  1. npm install");',
      'console.log("  2. npm run build && node scripts/sync-android-assets.mjs");',
      'console.log("  3. Open ./android in Android Studio -> Build -> Build APK(s) / Generate Signed AAB");',
    ].join('\n');

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Tathastu_Numerology_Android_Container_Setup.mjs"'
    );
    return res.send(installerScript);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to export Android bundle' });
  }
});

// ============================================================================
// OFFICIAL PAYU INDIA HOSTED CHECKOUT (STANDARD REDIRECT + AUTO-ACTIVATION)
// 1. POST /api/payu/initiate  -> Saves pending order & computes SHA-512 hash
// 2. Browser submits official POST form directly to https://secure.payu.in/_payment
// 3. POST /api/payu/callback  -> Verifies reverse SHA-512 hash, marks order verified,
//                                shows PayU Payment Confirmation & auto-redirects to app
// 4. GET  /api/payu/order/:txnid -> App verifies & auto-activates subscription
// ============================================================================
interface PayuOrderRecord {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  orderType: 'new_registration' | 'admin_registration' | 'plan_upgrade';
  checkoutPayload: Record<string, any>;
  status: 'pending' | 'success' | 'failure';
  hashVerified: boolean;
  mihpayid?: string;
  bankRefNum?: string;
  paymentMode?: string;
  errorMessage?: string;
  consumed?: boolean;
  createdAt: number;
  verifiedAt?: number;
}

const PAYU_ORDERS_DB_FILE = path.resolve(__dirname, '.tathastu-payu-orders.json');

function loadPayuOrders(): Record<string, PayuOrderRecord> {
  try {
    if (fs.existsSync(PAYU_ORDERS_DB_FILE)) {
      const raw = fs.readFileSync(PAYU_ORDERS_DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, PayuOrderRecord>;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

let payuOrdersStore: Record<string, PayuOrderRecord> = loadPayuOrders();

function persistPayuOrders(): void {
  try {
    // Prune orders older than 7 days to keep file compact
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const key of Object.keys(payuOrdersStore)) {
      if ((payuOrdersStore[key]?.createdAt || 0) < cutoff) {
        delete payuOrdersStore[key];
      }
    }
    fs.writeFileSync(PAYU_ORDERS_DB_FILE, JSON.stringify(payuOrdersStore), 'utf-8');
  } catch {
    // ignore read-only disk error
  }
}

function resolveActivePayuCredentials(body?: Record<string, any>) {
  const cfg = realtimeState.payuConfig;
  const rawKey = String(body?.key || cfg?.merchantKey || process.env.PAYU_MERCHANT_KEY || '').trim();
  const rawSalt = String(body?.salt || cfg?.merchantSalt || process.env.PAYU_MERCHANT_SALT || '').trim();
  const environment: 'production' | 'test' =
    body?.environment === 'test' || cfg?.environment === 'test' ? 'test' : 'production';
  const gatewayUrl =
    environment === 'test'
      ? 'https://test.payu.in/_payment'
      : 'https://secure.payu.in/_payment';
  return { key: rawKey, salt: rawSalt, environment, gatewayUrl };
}

function escapeHtmlSafe(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.post('/api/payu/initiate', (req, res) => {
  try {
    const body = req.body || {};
    const { key, salt, environment, gatewayUrl } = resolveActivePayuCredentials(body);

    if (!key || !salt) {
      return res.status(400).json({
        ok: false,
        error:
          'Official PayU Merchant Key & Salt are not configured yet. Master Admin must save PayU Merchant Key & Salt inside Master Admin Portal.',
      });
    }

    const numericAmount = Number(body.amount || 0);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'Valid payable amount (> ₹0) is required to launch Official PayU Checkout.',
      });
    }

    const amount = numericAmount.toFixed(2);
    const txnid =
      String(body.txnid || '').trim() ||
      `TN${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    const productinfo =
      String(body.productinfo || 'Tathastu Subscription Plan')
        .replace(/[^a-zA-Z0-9 ._-]/g, ' ')
        .trim()
        .slice(0, 80) || 'Tathastu Plan';
    const firstname =
      String(body.firstname || 'Seeker')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .slice(0, 50) || 'Seeker';
    const email = String(body.email || 'healer.ddeepak.jain@gmail.com').trim();
    const phone =
      String(body.phone || '8899444444')
        .replace(/\D/g, '')
        .slice(-10) || '8899444444';

    const orderType: PayuOrderRecord['orderType'] =
      body.orderType === 'plan_upgrade'
        ? 'plan_upgrade'
        : body.orderType === 'admin_registration'
        ? 'admin_registration'
        : 'new_registration';

    const udf1 = orderType;
    const udf2 = String(body.udf2 || '').trim();
    const udf3 = String(body.udf3 || '').trim();
    const udf4 = String(body.udf4 || '').trim();
    const udf5 = String(body.udf5 || '').trim();

    // Official PayU SHA-512 Request Hash:
    // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const forwardedProto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https')
      .split(',')[0]
      .trim();
    const host = String(req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`)
      .split(',')[0]
      .trim();
    const serverOrigin =
      typeof body.returnOrigin === 'string' && /^https?:\/\//i.test(body.returnOrigin)
        ? body.returnOrigin.replace(/\/+$/, '')
        : `${forwardedProto}://${host}`;

    const callbackUrl = `${serverOrigin}/api/payu/callback`;

    payuOrdersStore[txnid] = {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      orderType,
      checkoutPayload:
        body.checkoutPayload && typeof body.checkoutPayload === 'object'
          ? body.checkoutPayload
          : {},
      status: 'pending',
      hashVerified: false,
      consumed: false,
      createdAt: Date.now(),
    };
    persistPayuOrders();

    return res.json({
      ok: true,
      gatewayUrl,
      environment,
      fields: {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone,
        surl: callbackUrl,
        furl: callbackUrl,
        curl: callbackUrl,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        hash,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Failed to initiate Official PayU payment session.',
    });
  }
});

app.post('/api/payu/hash', (req, res) => {
  try {
    const body = req.body || {};
    const { key, salt, environment, gatewayUrl } = resolveActivePayuCredentials(body);

    if (!key || !salt) {
      return res.status(400).json({
        ok: false,
        error: 'PayU Merchant Key and Salt are not configured in Master Admin Portal.',
      });
    }

    const txnid = String(body.txnid || '').trim();
    const amount = Number(body.amount || 0).toFixed(2);
    const productinfo = String(body.productinfo || 'Tathastu Subscription Plan').trim();
    const firstname = String(body.firstname || 'Seeker').trim();
    const email = String(body.email || 'healer.ddeepak.jain@gmail.com').trim();
    const udf1 = String(body.udf1 || '').trim();
    const udf2 = String(body.udf2 || '').trim();
    const udf3 = String(body.udf3 || '').trim();
    const udf4 = String(body.udf4 || '').trim();
    const udf5 = String(body.udf5 || '').trim();

    if (!txnid || Number(amount) <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'Valid transaction ID and payable amount (> 0) are required.',
      });
    }

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    return res.json({
      ok: true,
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      gatewayUrl,
      environment,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Failed to compute PayU SHA-512 hash.',
    });
  }
});

function renderPayuConfirmationRedirectHtml(params: {
  isSuccess: boolean;
  txnid: string;
  mihpayid: string;
  amount: string;
  mode: string;
  productinfo: string;
  reason?: string;
  redirectUrl: string;
}): string {
  const accent = params.isSuccess ? '#10b981' : '#f43f5e';
  const badgeText = params.isSuccess
    ? 'OFFICIAL PAYU PAYMENT CONFIRMED'
    : 'PAYU PAYMENT NOT COMPLETED';
  const heading = params.isSuccess
    ? `₹${escapeHtmlSafe(params.amount)} Payment Successful!`
    : 'Payment Cancelled or Failed';
  const subText = params.isSuccess
    ? 'Your payment has been cryptographically verified by PayU. Redirecting you back to TATHASTU NUMEROLOGY to automatically activate your subscription...'
    : escapeHtmlSafe(
        params.reason ||
          'Your payment could not be completed. No subscription or profile was created. Redirecting back to TATHASTU NUMEROLOGY...'
      );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PayU Payment Confirmation — TATHASTU NUMEROLOGY</title>
  <meta http-equiv="refresh" content="2;url=${escapeHtmlSafe(params.redirectUrl)}" />
  <style>
    body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#020617; color:#f8fafc; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; padding:20px; }
    .card { max-width:460px; width:100%; background:#0f172a; border:2px solid ${accent}; border-radius:24px; padding:32px 26px; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.65); }
    .badge { display:inline-block; font-size:11px; font-weight:800; letter-spacing:0.08em; padding:6px 14px; border-radius:999px; background:rgba(16,185,129,0.15); color:${accent}; border:1px solid ${accent}; }
    h1 { font-size:24px; margin:16px 0 8px; color:#fef3c7; }
    p { font-size:13px; line-height:1.6; color:#cbd5e1; margin:0 0 18px; }
    .meta { background:#020617; border:1px solid rgba(245,158,11,0.3); border-radius:16px; padding:14px; text-align:left; font-size:12px; color:#e2e8f0; margin-bottom:20px; }
    .meta div { display:flex; justify-content:space-between; gap:12px; padding:4px 0; }
    .meta span { color:#94a3b8; }
    .btn { display:inline-block; padding:12px 22px; border-radius:12px; background:linear-gradient(90deg,#10b981,#f59e0b); color:#020617; font-weight:900; font-size:13px; text-decoration:none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${badgeText}</div>
    <h1>${heading}</h1>
    <p>${subText}</p>
    <div class="meta">
      <div><span>Plan:</span><strong>${escapeHtmlSafe(params.productinfo || 'TATHASTU Subscription')}</strong></div>
      <div><span>Order ID:</span><strong>${escapeHtmlSafe(params.txnid || '—')}</strong></div>
      ${params.mihpayid ? `<div><span>PayU Payment ID:</span><strong>${escapeHtmlSafe(params.mihpayid)}</strong></div>` : ''}
      ${params.mode ? `<div><span>Payment Mode:</span><strong>${escapeHtmlSafe(params.mode)}</strong></div>` : ''}
    </div>
    <a class="btn" href="${escapeHtmlSafe(params.redirectUrl)}">Return to TATHASTU NUMEROLOGY &amp; Activate</a>
  </div>
  <script>
    setTimeout(function () {
      window.location.replace(${JSON.stringify(params.redirectUrl)});
    }, 1800);
  </script>
</body>
</html>`;
}

app.all('/api/payu/callback', (req, res) => {
  try {
    const body = req.method === 'POST' ? req.body || {} : req.query || {};
    const { salt } = resolveActivePayuCredentials();
    const status = String(body.status || 'failure').toLowerCase();
    const txnid = String(body.txnid || '').trim();
    const mihpayid = String(body.mihpayid || '').trim();
    const bankRefNum = String(body.bank_ref_num || '').trim();
    const paymentMode = String(body.mode || 'ONLINE').trim();
    const amount = String(body.amount || '0').trim();
    const productinfo = String(body.productinfo || '').trim();
    const firstname = String(body.firstname || '').trim();
    const email = String(body.email || '').trim();
    const key = String(body.key || '').trim();
    const postedHash = String(body.hash || '').trim();
    const additionalCharges = String(body.additionalCharges || '').trim();
    const errorMessage = String(body.error_Message || body.field9 || '').trim();
    const udf1 = String(body.udf1 || '').trim();
    const udf2 = String(body.udf2 || '').trim();
    const udf3 = String(body.udf3 || '').trim();
    const udf4 = String(body.udf4 || '').trim();
    const udf5 = String(body.udf5 || '').trim();

    let hashVerified = false;
    if (salt && postedHash) {
      const baseReverse = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
      const reverseString = additionalCharges ? `${additionalCharges}|${baseReverse}` : baseReverse;
      const expectedHash = crypto.createHash('sha512').update(reverseString).digest('hex');
      hashVerified = expectedHash.toLowerCase() === postedHash.toLowerCase();
    }

    const isSuccess = status === 'success' && hashVerified;

    if (txnid && payuOrdersStore[txnid]) {
      payuOrdersStore[txnid] = {
        ...payuOrdersStore[txnid],
        status: isSuccess ? 'success' : 'failure',
        hashVerified,
        mihpayid: mihpayid || payuOrdersStore[txnid].mihpayid,
        bankRefNum: bankRefNum || payuOrdersStore[txnid].bankRefNum,
        paymentMode,
        errorMessage: isSuccess ? undefined : errorMessage || 'Payment cancelled or hash mismatch',
        verifiedAt: Date.now(),
      };
      persistPayuOrders();
    }

    const params = new URLSearchParams({
      payuCallback: '1',
      noIntro: '1',
      status: isSuccess ? 'success' : 'failure',
      txnid,
      mihpayid,
      amount,
      ...(isSuccess ? {} : { reason: errorMessage || 'Payment was cancelled or failed on PayU.' }),
    });
    const redirectUrl = `/?${params.toString()}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(
      renderPayuConfirmationRedirectHtml({
        isSuccess,
        txnid,
        mihpayid,
        amount,
        mode: paymentMode,
        productinfo,
        reason: errorMessage,
        redirectUrl,
      })
    );
  } catch {
    return res.redirect('/?payuCallback=1&noIntro=1&status=failure');
  }
});

app.get('/api/payu/order/:txnid', (req, res) => {
  const txnid = String(req.params.txnid || '').trim();
  const order = payuOrdersStore[txnid];
  if (!order) {
    return res.status(404).json({ ok: false, error: 'PayU order record not found.' });
  }
  return res.json({ ok: true, order });
});

app.post('/api/payu/order/:txnid/consume', (req, res) => {
  const txnid = String(req.params.txnid || '').trim();
  if (payuOrdersStore[txnid]) {
    payuOrdersStore[txnid].consumed = true;
    persistPayuOrders();
  }
  return res.json({ ok: true });
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vedic Numerology server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
