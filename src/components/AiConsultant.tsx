import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeName,
  generateNameCorrections,
} from '../utils/numerology';
import {
  calculateVedicAstrologyFromBirth,
  calculateCareerAndAuraProfile,
} from '../utils/astrologyAndCities';
import {
  useLanguage,
  translateMultilineBlock,
  validateAndNormalizeLocaleText,
} from '../utils/i18n';

interface AiConsultantProps {
  profile: BirthProfile;
}

export const AiConsultant: React.FC<AiConsultantProps> = ({ profile }) => {
  const { language, tr } = useLanguage();
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const mulankData = PLANETARY_PROFILES[mulank];
  const bhagyankData = PLANETARY_PROFILES[bhagyank];
  const nameAnalysis = analyzeName(profile.dob ? profile.name : 'Aarav', mulank, bhagyank);
  const nameSuggestions = generateNameCorrections(profile.name, mulank, bhagyank);
  const topName = nameSuggestions[0]?.suggestedName || profile.name;

  const autoAstro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.2090
  );

  const careerProfile = calculateCareerAndAuraProfile(
    profile.name,
    mulank,
    bhagyank,
    nameAnalysis.chaldeanSingle
  );

  const buildWelcomeRaw = () =>
    `Namaste **${profile.name}**! I am your Vedic Jyotish & Chaldean Numerology Oracle.

Your Natal & Numerological Matrix:
• **Mulank (Psychic Number)**: ${mulank} — Governed by **${mulankData?.planet} (${mulankData?.sanskritName})**
• **Bhagyank (Destiny Path)**: ${bhagyank} — Governed by **${bhagyankData?.planet} (${bhagyankData?.sanskritName})**
• **Chaldean Namank**: Compound **${nameAnalysis.totalChaldeanCompound}** (${nameAnalysis.compoundInfo.title})
• **Janma Rashi & Nakshatra**: **${autoAstro.rashi}** • **${autoAstro.nakshatra} (Pada ${autoAstro.pada})**

Select any topic below or enter your question regarding name spelling harmony, mobile vibrations, signature geometry, gemstones, enterprise suitability, or marriage compatibility.`;

  const formatForLocale = (raw: string) =>
    validateAndNormalizeLocaleText(translateMultilineBlock(raw, language), language, {
      strictLocale: true,
      context: 'ai-oracle',
    }).sanitizedText;

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; rawText?: string; timestamp: string }[]
  >(() => [
    {
      role: 'assistant',
      rawText: buildWelcomeRaw(),
      text: formatForLocale(buildWelcomeRaw()),
      timestamp: 'Ready',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.role !== 'assistant') return m;
        const source = m.rawText || m.text;
        return {
          ...m,
          rawText: source,
          text: validateAndNormalizeLocaleText(
            translateMultilineBlock(source, language),
            language,
            { strictLocale: true, context: 'ai-oracle' }
          ).sanitizedText,
        };
      })
    );
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const rawQuickPrompts = [
    'Why is my current name spelling causing delays, and how should I adjust it?',
    'What mobile number ending sequence is most auspicious for high-value business deals?',
    'Analyze my signature vibration and suggest the ideal pen ink color for my Mulank.',
    'Which Vedic gemstone or Rudraksha best balances my missing Lo-Shu grid frequencies?',
    'What are the most favorable days and industries for me to sign contracts or launch ventures?',
  ];
  const quickPrompts = rawQuickPrompts.map((qp) => ({
    raw: qp,
    label: tr(qp),
  }));

  const synthesizeInstantClientOracle = (userQuery: string): string => {
    const q = userQuery.toLowerCase();
    const friendlyStr = mulankData?.friendlyNumbers.join(', ') || '1, 3, 5, 9';
    const luckyDaysStr = mulankData?.luckyDays.join(', ') || 'Sunday, Thursday';
    const topBiz = careerProfile.perfectBusinesses
      .slice(0, 2)
      .map((b) => b.field)
      .join(' & ');

    if (q.includes('name') || q.includes('spelling') || q.includes('delay')) {
      return `### 🕉️ Chaldean Name Vibration & Phonetic Diagnosis for ${profile.name}

**1. Current Vibrational Assessment**
• **Current Name**: **${profile.name}** (Chaldean Compound **${nameAnalysis.totalChaldeanCompound}** ➔ Root **${nameAnalysis.chaldeanSingle}**)
• **Archetype**: *${nameAnalysis.compoundInfo.title}* — ${nameAnalysis.compoundInfo.description}
• **Birth Rulers**: Mulank **${mulank} (${mulankData?.planet})** & Bhagyank **${bhagyank} (${bhagyankData?.planet})**

**2. Recommended Harmonized Spelling**
• **Supreme Harmonic Spelling**: **${topName}** (Compound **${nameSuggestions[0]?.compoundNumber || 19}** — *${nameSuggestions[0]?.compoundTitle || 'The Prince of Heaven'}*)
• Adopting this phonetic adjustment aligns your spoken frequency with **${mulankData?.planet}** and **${bhagyankData?.planet}**, dissolving eleventh-hour delays in career and finances.

**3. Prescribed Daily Sadhana**
• Write **${topName}** 21 times every morning in **${mulankData?.luckyColor}** ink and recite:
> *"${mulankData?.beejMantra}"*`;
    }

    if (q.includes('mobile') || q.includes('phone') || q.includes('number')) {
      return `### 📱 Vedic & Chaldean Mobile Number Prescription for ${profile.name}

**1. Harmonious Digit Matrix**
• **Mulank ${mulank} (${mulankData?.planet})** & **Bhagyank ${bhagyank} (${bhagyankData?.planet})**
• **Most Auspicious Digits**: **${friendlyStr}**
• **Digits to Avoid in Terminal Sequence**: **${mulankData?.enemyNumbers.join(', ') || '4, 8'}**

**2. Ideal Last 4-Digit Sequences for High-Value Deals**
• Choose a mobile number ending in **1551, 3559, 1995, or 3669**, with all 10 digits summing to Compound **41 (Root 5)**, **46 (Root 1)**, or **51 (Root 6)**.
• Avoid consecutive **88, 48, 84, or 28** in the last 4 digits.

**3. Activation Protocol**
• Energize your SIM or device on **${luckyDaysStr}** during the morning Hora while chanting *"${mulankData?.beejMantra}"* 11 times.`;
    }

    if (q.includes('signature') || q.includes('ink') || q.includes('pen')) {
      return `### 🖋️ Sacred Signature & Pen Ink Prescription for ${profile.name}

**1. Grapho-Numerological Rules for Mulank ${mulank} (${mulankData?.planet})**
• **Ascending Trajectory**: Incline your signature upward at a **15°–20° angle** toward the North-East corner to invoke Jupiterian growth.
• **Unbroken Underline with 2 Bindu Dots**: Place a single ascending underline beneath your signature with two dots below it to stabilize wealth retention.
• **No Strikethroughs**: Never cross out the final stroke or loop backward through the first letter of **${profile.name}**.

**2. Prescribed Pen Ink Colors**
• **Primary Power Ink**: **${mulankData?.luckyColor}** or **Royal Blue / Gold-Trimmed Pen**.
• **Auspicious Signing Days**: **${luckyDaysStr}**.`;
    }

    if (q.includes('gem') || q.includes('rudraksha') || q.includes('stone') || q.includes('grid')) {
      return `### 💎 Ratna Shastra (Gemstone) & Rudraksha Prescription for ${profile.name}

**1. Natal Planetary & Rashi Alignment**
• **Janma Rashi**: **${autoAstro.rashi}** • **Nakshatra**: **${autoAstro.nakshatra} (Pada ${autoAstro.pada})**
• **Mulank ${mulank} (${mulankData?.planet})** • **Bhagyank ${bhagyank} (${bhagyankData?.planet})**

**2. Primary Vedic Gemstone (Ratna)**
• **Prescribed Stone**: **${mulankData?.gemstone}** (minimum 5.25 Ratti, unheated natural gem)
• **Wearing Day & Muhurat**: Wear during Shukla Paksha on **${luckyDaysStr}** within 1 hour of sunrise.

**3. Sacred Rudraksha & Mantra**
• Wear a **Nepalese 5 Mukhi + 7 Mukhi Rudraksha** combination on a red silk thread or gold chain.
• Energize with 108 recitations of:
> *"${mulankData?.beejMantra}"*`;
    }

    return `### 🔱 Personalized Vedic Jyotish & Chaldean Guidance for ${profile.name}

**1. Natal & Cosmic Synthesis**
• **Mulank ${mulank} (${mulankData?.planet})** • **Bhagyank ${bhagyank} (${bhagyankData?.planet})**
• **Janma Rashi**: **${autoAstro.rashi}** (${autoAstro.nakshatra} Nakshatra, Pada ${autoAstro.pada})
• **Dominant Bio-Field Aura**: **${careerProfile.auraColor}**

**2. Direct Guidance for Your Query**
• Your highest success and material breakthroughs manifest when you execute contracts, investments, and key ventures on dates reducing to **${friendlyStr}** and on **${luckyDaysStr}**.
• **Most Favorable Enterprise Domains**: **${topBiz}**.

**3. Prescribed Vedic & Pranic Remedy**
• Wear or carry **${mulankData?.luckyColor}**, meditate on your **${careerProfile.primaryChakra}**, and chant 27 times each morning:
> *"${mulankData?.beejMantra}"*`;
  };

  const handleSend = async (userPromptText?: string) => {
    const textToSend = (userPromptText ?? prompt).trim();
    if (!textToSend || loading) return;

    const userMessage = {
      role: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!userPromptText) setPrompt('');
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('/api/gemini/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: textToSend,
          language,
          profileData: {
            name: profile.name,
            dob: profile.dob,
            mulank,
            bhagyank,
            mulankPlanet: `${mulankData?.planet} (${mulankData?.sanskritName})`,
            bhagyankPlanet: `${bhagyankData?.planet} (${bhagyankData?.sanskritName})`,
            namank: nameAnalysis.totalChaldeanCompound,
            rashi: autoAstro.rashi,
            nakshatra: `${autoAstro.nakshatra} (Pada ${autoAstro.pada})`,
            luckyColor: mulankData?.luckyColor,
            luckyGem: mulankData?.gemstone,
            beejMantra: mulankData?.beejMantra,
            friendlyNumbers: mulankData?.friendlyNumbers.join(', '),
            luckyDays: mulankData?.luckyDays.join(', '),
            mobile: profile.mobile,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const rawAssistant =
          data?.text && data.text.trim().length > 20
            ? data.text
            : synthesizeInstantClientOracle(textToSend);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            rawText: rawAssistant,
            text: formatForLocale(rawAssistant),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        const fallbackRaw = synthesizeInstantClientOracle(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            rawText: fallbackRaw,
            text: formatForLocale(fallbackRaw),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      clearTimeout(timeoutId);
      const fallbackRaw = synthesizeInstantClientOracle(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          rawText: fallbackRaw,
          text: formatForLocale(fallbackRaw),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Sacred Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Jyotish Siddhanta & Cheiro Chaldean Synthesis</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Vedic Astro-Numerology Oracle
            </h1>
            <p className="text-sm text-amber-200/70 max-w-2xl">
              Receive instant, personalized consultations on name spelling calibration, mobile number resonance, signature geometry, Ratna Shastra gemstones, and auspicious muhurats.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-amber-500/30 text-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-amber-200 font-medium">Siddhanta Oracle Active</span>
          </div>
        </div>
      </div>

      {/* Quick Inquiry Topics */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSend(qp.raw)}
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-amber-500/15 text-amber-200 border border-amber-500/25 hover:border-amber-400 transition-all text-left disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Oracle Dialogue Container */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="max-h-[520px] overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-500/20 border border-amber-400/40 text-amber-100'
                    : 'bg-slate-950/95 border border-amber-500/25 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span className="text-[10px] text-amber-400/60 block mt-2 font-mono text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-amber-300 text-xs p-3 bg-slate-950/70 rounded-xl border border-amber-500/20">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Synthesizing natal Rashi, Nakshatra, Mulank {mulank}, and Chaldean compounds...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 pt-3 border-t border-amber-500/20"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            placeholder={tr(
              'Ask any question regarding your name spelling, mobile digits, signature, gemstone, career, or marriage...'
            )}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{tr('Consult Oracle')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
