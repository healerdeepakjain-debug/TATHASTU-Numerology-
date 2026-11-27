import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Award,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  CELESTIAL_TRANSITS,
} from '../utils/numerology';
import { calculateVedicAstrologyFromBirth } from '../utils/astrologyAndCities';
import { generateAdvanceMobileReport } from '../utils/advanceMobileReport';

interface DailyMantrasProps {
  profile: BirthProfile;
}

interface TailoredMantraItem {
  id: string;
  phase: string;
  timeWindow: string;
  title: string;
  planetOrDeity: string;
  sanskritDevanagari: string;
  transliteration: string;
  englishMeaning: string;
  hindiMeaning: string;
  whyPrescribedForUser: string;
  recommendedMala: string;
  mudraAndDirection: string;
  soundFrequencyHz: string;
  repetitions: number;
}

export const SANSKRit_BEEJ_DEVANAGARI: Record<number, { devanagari: string; hindiMeaning: string; englishMeaning: string; mala: string; mudra: string }> = {
  1: {
    devanagari: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ॥',
    hindiMeaning: 'मैं तेजस्वी, आरोग्य और राजकीय सम्मान प्रदान करने वाले भगवान सूर्यदेव को प्रणाम करता हूँ।',
    englishMeaning: 'Salutations to the glorious Sun God (Surya), bestower of sovereign vitality, authority, and radiance.',
    mala: 'Ruby / Red Sandalwood (Lal Chandan) or 12-Mukhi Rudraksha Mala',
    mudra: 'Surya Mudra • Face East at Sunrise',
  },
  2: {
    devanagari: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः ॥',
    hindiMeaning: 'मानसिक शांति, सौम्यता और अमृत तुल्य भावनाओं के स्वामी चंद्रदेव को नमस्कार।',
    englishMeaning: 'Salutations to Lord Chandra (Moon), guardian of emotional serenity, intuition, and nectarous peace.',
    mala: 'Natural Pearl (Moti) or Sphatik (Crystal Quartz) Mala',
    mudra: 'Gyan Mudra • Face North-West',
  },
  3: {
    devanagari: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः ॥',
    hindiMeaning: 'दिव्य ज्ञान, सौभाग्य, समृद्धि और धर्म के अधिपति देवगुरु बृहस्पति को प्रणाम।',
    englishMeaning: 'Salutations to Devguru Brihaspati (Jupiter), supreme master of wisdom, dharma, expansion, and fortune.',
    mala: 'Turmeric (Haldi) or 5-Mukhi Rudraksha Mala',
    mudra: 'Chin Mudra • Face North-East (Ishanya)',
  },
  4: {
    devanagari: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ॥ ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥',
    hindiMeaning: 'राहु जनित बाधाओं के निवारण और आकस्मिक सफलता हेतु माँ दुर्गा एवं राहु बीज मंत्र का आह्वान।',
    englishMeaning: 'Invocation of Rahu Beej & Goddess Durga to dissolve sudden obstacles and unlock breakthrough success.',
    mala: '8-Mukhi Rudraksha or Tulsi / Sandalwood Mala',
    mudra: 'Prithvi Mudra • Face South-West or East',
  },
  5: {
    devanagari: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥ ॐ नमो भगवते वासुदेवाय ॥',
    hindiMeaning: 'तीव्र बुद्धि, वाणी सिद्धि और व्यापारिक उन्नति के दाता भगवान बुध एवं श्री नारायण को नमन।',
    englishMeaning: 'Salutations to Lord Budha (Mercury) and Lord Vasudeva for commercial brilliance, eloquent speech, and prosperity.',
    mala: 'Green Aventurine / Emerald Crystal or Tulsi Mala',
    mudra: 'Buddhi Mudra • Face North',
  },
  6: {
    devanagari: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ॥ ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद ॥',
    hindiMeaning: 'ऐश्वर्य, आकर्षण, दाम्पत्य सुख और महालक्ष्मी कृपा के स्वामी शुक्राचार्य को नमस्कार।',
    englishMeaning: 'Salutations to Shukracharya (Venus) and Goddess Mahalakshmi for opulence, marital harmony, and artistic grace.',
    mala: 'Sphatik (Clear Quartz) or Lotus Seed (Kamal Gatta) Mala',
    mudra: 'Shukra / Dhyana Mudra • Face South-East',
  },
  7: {
    devanagari: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः ॥ ॐ गं गणपतये नमः ॥',
    hindiMeaning: 'अंतर्ज्ञान, मोक्ष और विघ्न निवारण के स्वामी श्री गणेश एवं केतु ग्रह को प्रणाम।',
    englishMeaning: 'Salutations to Lord Ganesha and Ketu for piercing intuition, spiritual protection, and removal of hidden obstacles.',
    mala: '9-Mukhi Rudraksha or Cat’s Eye / Sphatik Mala',
    mudra: 'Ganesha / Vaayu Mudra • Face North-East',
  },
  8: {
    devanagari: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ॥ ॐ हनुमते नमः ॥',
    hindiMeaning: 'न्याय, कर्मफल, स्थायित्व और अचल संपत्ति के स्वामी भगवान शनिदेव एवं श्री हनुमान जी को नमन।',
    englishMeaning: 'Salutations to Lord Shani (Saturn) and Lord Hanuman for karmic justice, endurance, and unshakeable material stability.',
    mala: '7-Mukhi Rudraksha or Black Agate / Neelam Mala',
    mudra: 'Prana Mudra • Face West',
  },
  9: {
    devanagari: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥ ॐ अं अंगारकाय नमः ॥',
    hindiMeaning: 'साहस, पराक्रम, भूमि लाभ और विजय के दाता मंगल देव को प्रणाम।',
    englishMeaning: 'Salutations to Lord Mangala (Mars), bestower of fearless willpower, victory over rivals, and land prosperity.',
    mala: 'Red Coral (Moonga) or 3-Mukhi Rudraksha Mala',
    mudra: 'Agni / Surya Mudra • Face South',
  },
};

export const DailyMantras: React.FC<DailyMantrasProps> = ({ profile }) => {
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const mulankInfo = PLANETARY_PROFILES[mulank] || PLANETARY_PROFILES[1];
  const bhagyankInfo = PLANETARY_PROFILES[bhagyank] || PLANETARY_PROFILES[3];

  const autoAstro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.2090
  );

  const advReport = generateAdvanceMobileReport(
    profile.dob,
    profile.mobile || '8899444444',
    mulank,
    bhagyank
  );

  const activeDasha =
    advReport.dashaTimeline.find((d) => d.isCurrent) || advReport.dashaTimeline[0];
  const dashaNum = activeDasha?.dashaNumber || 6;
  const dashaDevanagari = SANSKRit_BEEJ_DEVANAGARI[dashaNum] || SANSKRit_BEEJ_DEVANAGARI[6];
  const mulankDevanagari = SANSKRit_BEEJ_DEVANAGARI[mulank] || SANSKRit_BEEJ_DEVANAGARI[1];
  const bhagyankDevanagari = SANSKRit_BEEJ_DEVANAGARI[bhagyank] || SANSKRit_BEEJ_DEVANAGARI[3];

  const today = new Date();
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentWeekday = weekdayNames[today.getDay()];

  const tailoredMantras: TailoredMantraItem[] = [
    {
      id: 'brahma-natal',
      phase: '1. Morning Brahma Muhurat & Sunrise Invocation',
      timeWindow: '05:30 AM – 07:30 AM (Pratah Sandhya)',
      title: `Natal Soul & Janma Rashi Siddhi Mantra (${mulankInfo.planet})`,
      planetOrDeity: `${mulankInfo.planet} (${mulankInfo.sanskritName}) • Deity: ${mulankInfo.deity}`,
      sanskritDevanagari: mulankDevanagari.devanagari,
      transliteration: mulankInfo.beejMantra,
      englishMeaning: mulankDevanagari.englishMeaning,
      hindiMeaning: mulankDevanagari.hindiMeaning,
      whyPrescribedForUser: `Tailored to your Birth Chart Mulank ${mulank} (${mulankInfo.planet}), Janma Rashi (${autoAstro.rashi}), and Nakshatra (${autoAstro.nakshatra}, Pada ${autoAstro.pada}) to ignite morning pranic vitality.`,
      recommendedMala: mulankDevanagari.mala,
      mudraAndDirection: mulankDevanagari.mudra,
      soundFrequencyHz: mulankInfo.soundFrequencyHz || '126.22 Hz (Planetary) & 528 Hz (Solfeggio)',
      repetitions: 108,
    },
    {
      id: 'active-dasha',
      phase: '2. Active Maha Dasha Empowerment Mantra',
      timeWindow: '08:15 AM – 10:30 AM (Morning Work Initiation)',
      title: `Active ${activeDasha.planet} (${activeDasha.sanskritName}) Maha Dasha Mantra (${activeDasha.startYear}–${activeDasha.endYear})`,
      planetOrDeity: `Dasha Lord: ${activeDasha.planet} (${activeDasha.sanskritName})`,
      sanskritDevanagari: dashaDevanagari.devanagari,
      transliteration: PLANETARY_PROFILES[dashaNum]?.beejMantra || mulankInfo.beejMantra,
      englishMeaning: dashaDevanagari.englishMeaning,
      hindiMeaning: dashaDevanagari.hindiMeaning,
      whyPrescribedForUser: `You are currently running the Numerological Maha Dasha of ${activeDasha.planet} (${activeDasha.startDate} to ${activeDasha.endYear} => ${dashaNum}). Chanting this mantra unlocks the highest wealth, luxury, and career blessings of your active Dasha cycle.`,
      recommendedMala: dashaDevanagari.mala,
      mudraAndDirection: dashaDevanagari.mudra,
      soundFrequencyHz: PLANETARY_PROFILES[dashaNum]?.soundFrequencyHz || '221.23 Hz & 639 Hz',
      repetitions: 27,
    },
    {
      id: 'transit-shield',
      phase: '3. Planetary Transit (Gochar) Protection & Alignment Mantra',
      timeWindow: '12:00 PM – 01:30 PM or Before Major Meetings',
      title: 'Gochar Shani-Guru-Rahu Harmonization & Navagraha Kavach Mantra',
      planetOrDeity: 'Saturn in Pisces • Jupiter in Gemini • Rahu-Ketu Nodal Axis',
      sanskritDevanagari:
        'ॐ ब्रह्मा मुरारिस्त्रिपुरांतकारी भानुः शशी भूमिसुतो बुधश्च । गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम् ॥',
      transliteration:
        'Om Brahma Muraris Tripurantakari Bhanuh Shashi Bhumisuto Budhashcha | Gurushcha Shukrah Shani Rahu Ketavah Kurvantu Sarve Mama Suprabhatam ||',
      englishMeaning:
        'May Brahma, Vishnu, Shiva, and all nine celestial grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu) harmonize their current transits to bless my life with auspiciousness.',
      hindiMeaning:
        'ब्रह्मा, विष्णु, महेश एवं सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु और केतु—ये सभी नवग्रह वर्तमान गोचर में मेरे जीवन को परम शुभ और मंगलमय बनाएं।',
      whyPrescribedForUser: `Specifically balances the active 2026 Gochar transits (${CELESTIAL_TRANSITS[0]?.transitName} & ${CELESTIAL_TRANSITS[1]?.transitName}) relative to your Natal Moon in ${autoAstro.rashi}.`,
      recommendedMala: '5-Mukhi Rudraksha or Navratna / Tulsi Mala',
      mudraAndDirection: 'Anjali / Abhaya Mudra • Face East or North-East',
      soundFrequencyHz: '432 Hz (Cosmic Tuning) & 528 Hz (Pranic Shield)',
      repetitions: 11,
    },
    {
      id: 'sandhya-destiny',
      phase: '4. Evening Sandhya Destiny & Missing Grid Activator',
      timeWindow: '06:00 PM – 07:45 PM (Godhuli / Evening Lamp Lighting)',
      title: `Bhagyank ${bhagyank} (${bhagyankInfo.planet}) & Missing Number (${advReport.missingNumbersList.slice(0, 2).join(', ') || '4, 5'}) Siddhi Mantra`,
      planetOrDeity: `${bhagyankInfo.planet} (${bhagyankInfo.sanskritName}) & Lord Narayana / Mahalakshmi`,
      sanskritDevanagari: bhagyankDevanagari.devanagari,
      transliteration: bhagyankInfo.beejMantra,
      englishMeaning: bhagyankDevanagari.englishMeaning,
      hindiMeaning: bhagyankDevanagari.hindiMeaning,
      whyPrescribedForUser: `Harmonizes your Life Path Bhagyank ${bhagyank} (${bhagyankInfo.planet}) and fills the missing vibrational planes (${advReport.missingNumbersList.join(', ')}) in your Vedic Grid.`,
      recommendedMala: bhagyankDevanagari.mala,
      mudraAndDirection: bhagyankDevanagari.mudra,
      soundFrequencyHz: bhagyankInfo.soundFrequencyHz || '183.58 Hz & 852 Hz',
      repetitions: 54,
    },
  ];

  const [japaCount, setJapaCount] = useState(0);
  const [malaCompleted, setMalaCompleted] = useState(0);
  const [selectedMantraId, setSelectedMantraId] = useState(tailoredMantras[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeJapaMantra =
    tailoredMantras.find((m) => m.id === selectedMantraId) || tailoredMantras[0];

  const handleIncrementJapa = () => {
    if (japaCount + 1 >= 108) {
      setJapaCount(0);
      setMalaCompleted((prev) => prev + 1);
    } else {
      setJapaCount((prev) => prev + 1);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Sacred Banner */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Personalized Mantra Shastra • Birth Chart + Active Gochar Transits</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Daily Vedic Mantras Tailored to Your Birth Chart & Transits
            </h1>
            <p className="text-sm text-amber-200/70 max-w-3xl">
              Prescribed daily sound vibrations calibrated specifically for <strong>{profile.name}</strong> by cross-referencing your Natal Rashi (<strong>{autoAstro.rashi}</strong>), Nakshatra (<strong>{autoAstro.nakshatra}</strong>), Mulank (<strong>{mulank}</strong>), Bhagyank (<strong>{bhagyank}</strong>), Active Maha Dasha (<strong>{activeDasha.planet}</strong>), and current 2026 Planetary Gochar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 bg-slate-950/90 p-3.5 rounded-2xl border border-amber-500/30 shrink-0 text-center">
            <div className="px-2.5 py-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Active Maha Dasha</span>
              <span className="text-xs font-bold text-amber-100">
                {activeDasha.planet} ({activeDasha.startYear}–{activeDasha.endYear})
              </span>
            </div>
            <div className="px-2.5 py-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Today's Day & Rashi</span>
              <span className="text-xs font-bold text-emerald-300">
                {currentWeekday} • {autoAstro.rashi.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 108-Bead Rudraksha Japa Mala Counter */}
      <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Interactive 108-Bead Vedic Japa Sadhana Counter</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tailoredMantras.map((m, idx) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMantraId(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedMantraId === m.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-amber-300 border-amber-500/30 hover:border-amber-400'
                    }`}
                  >
                    Mantra #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
              <div className="text-xs font-semibold text-amber-300">{activeJapaMantra.title}</div>
              <div className="text-lg sm:text-xl font-serif font-bold text-amber-100 leading-relaxed">
                {activeJapaMantra.sanskritDevanagari}
              </div>
              <div className="text-xs font-mono text-emerald-300">
                "{activeJapaMantra.transliteration}"
              </div>
              <div className="text-xs text-slate-300 pt-1 border-t border-amber-500/15">
                <strong>र्थ (Meaning):</strong> {activeJapaMantra.hindiMeaning} —{' '}
                <em>{activeJapaMantra.englishMeaning}</em>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 text-center">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Current Bead
                </span>
                <span className="text-3xl font-mono font-black text-amber-100">
                  {japaCount} <span className="text-sm text-slate-400">/ 108</span>
                </span>
              </div>
              <div className="h-8 w-px bg-amber-500/20" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Malas Done
                </span>
                <span className="text-3xl font-mono font-black text-emerald-300">
                  {malaCompleted}
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-amber-500/20">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-150"
                style={{ width: `${(japaCount / 108) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-2 w-full pt-1">
              <button
                type="button"
                onClick={handleIncrementJapa}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
              >
                +1 Chant Bead (जप करें)
              </button>
              <button
                type="button"
                onClick={() => setJapaCount(0)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 transition-all cursor-pointer"
                title="Reset Bead Counter"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Tailored Daily Mantra Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tailoredMantras.map((mantra) => (
          <div
            key={mantra.id}
            className="p-6 rounded-2xl bg-slate-900/95 border border-amber-500/30 hover:border-amber-400/60 shadow-xl flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {mantra.phase}
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {mantra.timeWindow}
                </span>
              </div>

              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                  {mantra.title}
                </h2>
                <p className="text-xs text-amber-300/80 mt-0.5">{mantra.planetOrDeity}</p>
              </div>

              {/* Sanskrit & Transliteration Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
                <div className="text-base sm:text-lg font-serif font-bold text-amber-200 leading-relaxed">
                  {mantra.sanskritDevanagari}
                </div>
                <div className="text-xs font-mono text-emerald-300">
                  "{mantra.transliteration}"
                </div>
              </div>

              {/* Bilingual Meaning */}
              <div className="space-y-1.5 text-xs">
                <p className="text-amber-100/90">
                  <strong className="text-amber-400">हिंदी भावार्थ:</strong> {mantra.hindiMeaning}
                </p>
                <p className="text-slate-300">
                  <strong className="text-amber-400">English Meaning:</strong> {mantra.englishMeaning}
                </p>
              </div>

              {/* Why Prescribed for User's Chart & Transits */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed">
                <strong className="text-emerald-400 uppercase text-[10px] tracking-wider block mb-0.5">
                  Astrological & Transit Prescription Basis:
                </strong>
                {mantra.whyPrescribedForUser}
              </div>
            </div>

            <div className="pt-3 border-t border-amber-500/15 space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div>
                  <strong className="text-amber-400 block">Prescribed Mala:</strong>
                  {mantra.recommendedMala}
                </div>
                <div>
                  <strong className="text-amber-400 block">Mudra &amp; Direction:</strong>
                  {mantra.mudraAndDirection}
                </div>
                <div>
                  <strong className="text-purple-300 block">Sound Frequency (Hz):</strong>
                  <span className="font-mono text-purple-200">🔊 {mantra.soundFrequencyHz}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-amber-500/10">
                <span className="text-[11px] font-mono text-amber-300">
                  Recommended Count: <strong>{mantra.repetitions}x Daily</strong>
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedMantraId(mantra.id)}
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-bold transition-all cursor-pointer text-center"
                  >
                    Load in Japa Counter
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        mantra.id,
                        `${mantra.sanskritDevanagari}\n${mantra.transliteration}`
                      )
                    }
                    className="px-3.5 py-2 sm:py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/35 text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copiedId === mantra.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{copiedId === mantra.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
