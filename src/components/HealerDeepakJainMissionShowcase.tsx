import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Compass,
  Award,
  CheckCircle2,
  Star,
  MessageSquarePlus,
  Send,
  TrendingUp,
  AlertTriangle,
  Flame,
  Crown,
  BookOpen,
  Clock,
  Heart,
  PhoneCall,
  Mail,
  Users,
} from 'lucide-react';
import {
  useTathastu,
  HEALER_DEEPAK_JAIN_IMAGE_PATH,
  TATHASTU_ADMIN_EMAIL,
  TATHASTU_ADMIN_PHONE,
  TATHASTU_APP_NAME,
  FeedbackSuggestionRecord,
} from '../utils/tathastuStore';
import { useLanguage } from '../utils/i18n';

import spiritualBannerImg from '../assets/images/spiritual_energy_report_banner_1794229220638.jpg';
import chakraMeditationImg from '../assets/images/chakra_healing_meditation_art_1794229223170.jpg';
import vedicYantraImg from '../assets/images/vedic_name_career_yantra_1794305504547.jpg';
import loShuCosmicImg from '../assets/images/mobile_lo_shu_cosmic_grid_1794305505049.jpg';
import navagrahaImg from '../assets/images/planetary_transits_navagraha_1794305507441.jpg';
import noorGeometryImg from '../assets/images/islamic_vedic_noor_geometry_1794305507170.jpg';

interface HealerDeepakJainMissionShowcaseProps {
  isPublicLanding?: boolean;
}

export const HealerDeepakJainMissionShowcase: React.FC<HealerDeepakJainMissionShowcaseProps> = ({
  isPublicLanding = false,
}) => {
  const { accounts, currentAccount, submitFeedbackSuggestion } = useTathastu();
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  // Healers & Admin list for guidance session rating
  const guidanceProviders = React.useMemo(() => {
    const adminOption = {
      id: 'admin_tathastu_master',
      name: 'Healer Ddeepak Jain (Founder & Master Admin)',
    };
    const healers = accounts
      .filter((a) => a.role === 'healer')
      .map((h) => ({
        id: h.id,
        name: `${h.name}${h.healerBrandName ? ` — ${h.healerBrandName}` : ''} (Healer)`,
      }));
    return [adminOption, ...healers];
  }, [accounts]);

  const [selectedHealerId, setSelectedHealerId] = useState<string>('admin_tathastu_master');
  const [fbCategory, setFbCategory] = useState<FeedbackSuggestionRecord['category']>('feedback');
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbMessage, setFbMessage] = useState<string>('');
  const [fbStatus, setFbStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingLabels: Record<number, { hi: string; en: string }> = {
    1: { hi: '१ स्टार — सुधार आवश्यक', en: '1 Star — Needs Improvement' },
    2: { hi: '२ स्टार — सामान्य', en: '2 Stars — Fair' },
    3: { hi: '३ स्टार — अच्छा', en: '3 Stars — Good Experience' },
    4: { hi: '४ स्टार — बहुत अच्छा', en: '4 Stars — Very Good Guidance' },
    5: { hi: '५ स्टार — उत्कृष्ट एवं दिव्य मार्गदर्शन', en: '5 Stars — Excellent Divine Guidance' },
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFbStatus(null);
    const chosenProvider =
      guidanceProviders.find((p) => p.id === selectedHealerId) || guidanceProviders[0];
    const res = await submitFeedbackSuggestion({
      category: fbCategory,
      rating: fbRating,
      ratedHealerId: chosenProvider.id,
      ratedHealerName: chosenProvider.name,
      message: fbMessage,
    });
    setIsSubmitting(false);
    if (res.ok) {
      setFbMessage('');
      setFbStatus({
        type: 'success',
        msg: isHindi
          ? `धन्यवाद! आपकी ${fbRating}-स्टार रेटिंग और अनुभव सफलतापूर्वक दर्ज कर लिया गया है।`
          : `Thank you! Your ${fbRating}-Star guidance session rating has been recorded.`,
      });
    } else {
      setFbStatus({ type: 'error', msg: res.error || 'Could not submit rating.' });
    }
  };

  const fivePillars = [
    {
      icon: HeartHandshake,
      badge: isHindi ? 'संकल्प १ • समाज सेवा' : 'Pillar 1 • Positive Social Service',
      titleHi: 'समाज को सकारात्मक सेवा और सही आध्यात्मिक दिशा देना',
      titleEn: 'Serving Society Positively with Authentic Spiritual Wisdom',
      descHi:
        'हीलर दीपक जैन का प्रथम उद्देश्य समाज के हर वर्ग तक शुद्ध वैदिक एवं कैल्डियन अंक ज्योतिष, चक्र हीलिंग और ऊर्जा विज्ञान पहुँचाना है ताकि हर परिवार में सुख, शांति और सकारात्मकता का विस्तार हो।',
      descEn:
        'Bringing authentic Vedic & Chaldean Numerology, Chakra Healing, and sacred energy science to every household so society thrives in peace, clarity, and positive consciousness.',
      color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/40 text-amber-300',
    },
    {
      icon: TrendingUp,
      badge: isHindi ? 'संकल्प २ • स्थिर एवं योग्य जीवन' : 'Pillar 2 • Life Stability & Self-Worth',
      titleHi: 'सबको अपने जीवन में स्थिर (Stable), आत्मनिर्भर और योग्य (Worthy) बनाना',
      titleEn: 'Making Every Individual Stable, Self-Reliant & Worthy in Life',
      descHi:
        'हर इंसान के भीतर अनंत दिव्य क्षमता है। अपने मूलांक, भाग्यांक, नाम की स्पेलिंग और सही कर्म-दिशा को समझकर हर व्यक्ति आर्थिक, मानसिक और पारिवारिक रूप से स्थिर (Stable) और योग्य (Worthy) बन सकता है।',
      descEn:
        'Helping every person recognize their innate cosmic blueprint—Mulank, Bhagyank, Name Vibration, and Career alignment—to build lasting financial, emotional, and personal stability.',
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/40 text-emerald-300',
    },
    {
      icon: ShieldCheck,
      badge: isHindi ? 'संकल्प ३ • फ्रॉड दुनिया से सुरक्षा' : 'Pillar 3 • Protection from Fraud',
      titleHi: 'आज की इस फ्रॉड दुनिया के फ्रॉड और ढोंगी लोगों से आपको बचाना',
      titleEn: 'Protecting People from Today’s Fraud World & Fake Practitioners',
      descHi:
        'आज आध्यात्म और ज्योतिष के नाम पर डर दिखाकर लोगों को लूटने वाले फ्रॉड लोगों की भरमार है। तथास्तु द डिवाइन लाइट का मिशन है आपको अंधविश्वास, डर और महंगे नकली उपायों से बचाकर १००% पारदर्शी, प्रमाणित और सरल वैदिक समाधान देना।',
      descEn:
        'In today’s world full of fear-mongering and fraudulent practitioners, Tathastu stands as a shield of truth—delivering transparent, logical, fear-free, and genuinely effective spiritual guidance.',
      color: 'from-rose-500/20 to-red-600/10 border-rose-500/40 text-rose-300',
    },
    {
      icon: Compass,
      badge: isHindi ? 'संकल्प ४ • हर क्लाइंट की सेल्फ-ग्रोथ' : 'Pillar 4 • Client Self-Growth',
      titleHi: 'हर क्लाइंट की सेल्फ-ग्रोथ (Self-Growth) और आत्म-उन्नति में सच्ची मदद करना',
      titleEn: 'Empowering Every Client for Holistic Self-Growth & Success',
      descHi:
        'यह ऐप केवल भविष्य बताने के लिए नहीं, बल्कि हर क्लाइंट को प्रतिदिन के शुभ-अशुभ समय, मंत्र, प्राणायाम, चक्र संतुलन और सटीक रेमेडीज़ द्वारा निरंतर सेल्फ-ग्रोथ (Self-Growth) दिलाने के लिए बनाया गया है।',
      descEn:
        'More than predictions, this platform empowers every client with daily auspicious timings, sacred mantras, yoga/pranayama, and personalized remedies for continuous self-growth.',
      color: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40 text-cyan-300',
    },
    {
      icon: Award,
      badge: isHindi ? 'संकल्प ५ • हीलर्स को संपूर्ण सपोर्ट' : 'Pillar 5 • Empowering Fellow Healers',
      titleHi:
        'हीलर्स को अपनी हीलिंग और गाइडेंस को बेहतर बनाने में सपोर्ट करना ताकि वे अपने क्लाइंट्स की सर्वोत्तम सेवा कर सकें',
      titleEn:
        'Supporting Healers to Elevate Their Healing & Guidance to Serve Clients Better',
      descHi:
        'हमारे सभी जुड़े हुए हीलर्स, टैरो रीडर्स, रेकी मास्टर्स और न्यूमरोलॉजिस्ट्स को सटीक गणना, प्रीमियम कस्टम ब्रांडेड रिपोर्ट्स और आध्यात्मिक टूल्स प्रदान करना—ताकि उनका समय बचे और वे अपने क्लाइंट्स को उच्चतम स्तर की हीलिंग व गाइडेंस दे सकें।',
      descEn:
        'Equipping fellow Healers, Numerologists, Tarot Readers, and Spiritual Coaches with instant, zero-error calculations and white-labeled dossiers so they can focus deeply on healing and guiding their clients.',
      color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/40 text-purple-300',
    },
    {
      icon: Users,
      badge: isHindi ? 'संकल्प ६ • पारिवारिक सामंजस्य एवं ९-चक्र मिलान' : 'Pillar 6 • Family Harmony & 9-Chakra Parivar Milan',
      titleHi:
        'हर परिवार के सदस्यों के बीच ९-चक्र ऊर्जा संतुलन और अटूट पारिवारिक प्रेम स्थापित करना',
      titleEn:
        'Harmonizing Every Family Bond Through 9-Chakra Parivar Milan & Sacred Remedies',
      descHi:
        'परिवार की सुख-शांति ही सच्ची समृद्धि की नींव है। अर्थ स्टार और सोल स्टार सहित संपूर्ण ९ चक्रों के निदान एवं शुद्ध वैदिक उपायों द्वारा माता-पिता, जीवनसाथी, संतान और भाई-बहनों के बीच आपसी सामंजस्य, समझ और प्रेम को मजबूत करना।',
      descEn:
        'True prosperity begins with peace at home. Diagnosing all 9 Chakras—including Earth Star and Soul Star—between family members to heal generational blocks and nurture lifelong love, unity, and mutual respect.',
      color: 'from-indigo-500/20 to-violet-600/10 border-indigo-500/40 text-indigo-300',
    },
  ];

  const appModulesVisuals = [
    {
      img: vedicYantraImg,
      titleHi: 'वैदिक एवं कैल्डियन नाम और करियर सामंजस्य',
      titleEn: 'Vedic & Chaldean Name & Career Harmony',
      descHi:
        'आपके नाम के अक्षरों की ऊर्जा को मूलांक और भाग्यांक के साथ संतुलित कर करियर, व्यापार और मान-सम्मान में वृद्धि।',
      descEn:
        'Aligns your name vibration with your birth numbers to unlock career breakthroughs, business prosperity, and recognition.',
    },
    {
      img: loShuCosmicImg,
      titleHi: 'मोबाइल अंक ज्योतिष एवं लो-शू ग्रिड विश्लेषण',
      titleEn: 'Mobile Numerology & Lo Shu Cosmic Grid',
      descHi:
        'मोबाइल नंबर के अंकों के जोड़े (Pairs), मिसिंग नंबर्स और रिपीटेड नंबर्स का गहरा विश्लेषण व तुरंत प्रभावी उपाय।',
      descEn:
        'Decodes mobile digit pairs, missing Lo Shu planes, and karmic strengths with practical remedies.',
    },
    {
      img: chakraMeditationImg,
      titleHi: '९-चक्र ऊर्जा निदान, मंत्र एवं योग-प्राणायाम',
      titleEn: '9-Chakra Healing, Vedic Mantras & Pranayama',
      descHi:
        'शरीर के सभी नौ चक्रों (अर्थ स्टार से सोल स्टार तक) की स्थिति, बीज मंत्र जाप, मुद्राएं और प्राणायाम से मानसिक शांति व शारीरिक स्वास्थ्य।',
      descEn:
        'Diagnoses all 9 energy centers (Earth Star to Soul Star) and prescribes seed mantras, mudras, and pranayama for complete mind-body balance.',
    },
    {
      img: navagrahaImg,
      titleHi: 'प्रतिदिन ६ शुभ-अशुभ समय अलर्ट एवं पंचांग',
      titleEn: '6 Daily Good/Bad Time Alerts & Planetary Transits',
      descHi:
        'राहु काल, अभिजीत मुहूर्त और आपके मूलांक के अनुसार प्रतिदिन ६ बार लाइव समय अलर्ट ताकि हर महत्वपूर्ण कार्य शुभ समय पर हो।',
      descEn:
        'Live daily auspicious & caution windows tailored to your birth numbers so you take key actions at the right cosmic hour.',
    },
    {
      img: noorGeometryImg,
      titleHi: 'पार्टनर मिलान एवं पारिवारिक सामंजस्य',
      titleEn: 'Partner Milan & Parivar Family Harmony',
      descHi:
        'जीवनसाथी एवं परिवार के सदस्यों के साथ ३६-गुण, मूलांक-भाग्यांक और ९-चक्र कम्पैटिबिलिटी का सटीक मिलान।',
      descEn:
        'Deep compatibility analysis combining Vedic 36-Guna, Chaldean numbers, and 9-Chakra emotional resonance.',
    },
    {
      img: spiritualBannerImg,
      titleHi: 'आध्यात्मिक मास्टर डोज़ियर (Spiritual Master Dossier)',
      titleEn: 'Spiritual Master Dossier',
      descHi:
        'भविष्यवाणी, ईष्ट देव, रुद्राक्ष, क्रिस्टल और दैनिक दिनचर्या के साथ संपूर्ण व्यक्तिगत आध्यात्मिक मास्टर डोज़ियर।',
      descEn:
        'Complete personalized spiritual blueprint with multi-year forecast, remedies, and sacred guidance.',
    },
  ];

  const familyBenefits = [
    {
      titleHi: '१००% प्रामाणिक और भय-मुक्त मार्गदर्शन',
      titleEn: '100% Authentic & Fear-Free Guidance',
      descHi:
        'कोई डराने वाली बात नहीं, कोई अंधविश्वास नहीं—केवल तर्कसंगत और सकारात्मक ऊर्जा बढ़ाने वाले उपाय।',
      descEn:
        'Zero fear-mongering or superstition—only empowering, logical, and positive vibration remedies.',
    },
    {
      titleHi: 'जीवनभर काम आने वाली सेल्फ-ग्रोथ गाइड',
      titleEn: 'Lifelong Self-Growth Companion',
      descHi:
        'आपकी सेव की गई प्रोफाइल हमेशा सुरक्षित रहती है; जब चाहें अपनी रिपोर्ट, शुभ समय और रेमेडीज़ देखें व डाउनलोड करें।',
      descEn:
        'Your saved profiles stay secure—access your reports, daily timings, and remedies anytime.',
    },
    {
      titleHi: 'हीलर्स के लिए कस्टम ब्रांडिंग और क्लाइंट ग्रोथ',
      titleEn: 'Custom Branding & Client Trust for Healers',
      descHi:
        'हीलर्स अपने खुद के लोगो और नाम के साथ क्लाइंट्स को प्रीमियम रिपोर्ट दे सकते हैं, जिससे उनकी प्रैक्टिस और सम्मान बढ़ता है।',
      descEn:
        'Healers can generate white-labeled reports with their own brand logo and share instant links with clients.',
    },
    {
      titleHi: 'सीधा हीलर दीपक जैन से जुड़ाव',
      titleEn: 'Direct Connection with Healer Ddeepak Jain',
      descHi:
        'नीचे दिए गए फ़ीडबैक और सुझाव बॉक्स के माध्यम से आप अपने विचार और सुझाव सीधे हीलर दीपक जैन के साथ साझा कर सकते हैं।',
      descEn:
        'Share your valuable feedback and suggestions directly with Healer Ddeepak Jain for continuous guidance and support.',
    },
  ];

  return (
    <div className="space-y-8 mt-8">
      {/* SECTION 1: HEALER DDEEPAK JAIN INTRODUCTION & MISSION */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-[#160d29] via-[#0d0818] to-[#1a1008] p-6 md:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Portrait Column — Clean Unobstructed Image with Name Card Below */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 opacity-75 blur-md group-hover:opacity-100 transition duration-500" />
              <div className="relative w-64 h-80 sm:w-72 sm:h-88 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-slate-950">
                <img
                  src={HEALER_DEEPAK_JAIN_IMAGE_PATH}
                  alt="Healer Ddeepak Jain — Founder, Tathastu The Divine Light"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Name & Title Card Placed Cleanly Below the Portrait (Never Over the Face) */}
            <div className="mt-4 w-64 sm:w-72 rounded-2xl bg-slate-950/95 border border-amber-400/50 px-4 py-3 text-center shadow-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-bold uppercase tracking-widest mb-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                App Creator, Founder &amp; Master Admin
              </span>
              <h3 className="text-xl font-serif font-bold text-white tracking-wide">
                HEALER DDEEPAK JAIN
              </h3>
              <p className="text-xs text-amber-300/95 font-bold mt-0.5">
                {TATHASTU_APP_NAME} • TATHASTU THE DIVINE LIGHT
              </p>
              <p className="text-[11px] text-cyan-300 font-mono mt-1 break-all">
                {TATHASTU_ADMIN_EMAIL}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                ✦ Vedic & Chaldean Numerologist
              </span>
              <span className="px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                ✦ Spiritual Healer & Life Coach
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                ✦ Mentor for Healers & Seekers
              </span>
            </div>
          </div>

          {/* Introduction & Vision Column */}
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isHindi
                ? 'हीलर दीपक जैन का परिचय एवं समाज सेवा का पवित्र संकल्प'
                : 'Introduction of Healer Ddeepak Jain & Sacred Social Mission'}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
              {isHindi
                ? '“मेरा लक्ष्य हर व्यक्ति को अपने जीवन में स्थिर (Stable) और योग्य (Worthy) बनाना, आज की इस फ्रॉड दुनिया के फ्रॉड लोगों से बचाना और हर क्लाइंट व हीलर की सच्ची उन्नति में साथ खड़ा रहना है।”'
                : '“My mission is to make everyone Stable & Worthy in life, protect seekers from today’s fraud world, empower every Client’s self-growth, and support fellow Healers to serve better.”'}
            </h2>

            <div className="space-y-3 text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-amber-500/20">
              <p>
                <strong className="text-amber-400">
                  {isHindi ? 'प्रणाम एवं दिव्य आशीर्वाद! ' : 'Divine Blessings & Warm Welcome! '}
                </strong>
                {isHindi
                  ? 'मैं हीलर दीपक जैन (संस्थापक — तथास्तु द डिवाइन लाइट) आपका इस पवित्र आध्यात्मिक परिवार में हृदय से स्वागत करता हूँ। वर्षों की आध्यात्मिक साधना, वैदिक-कैल्डियन अंक ज्योतिष और ऊर्जा हीलिंग के अनुभव से मैंने देखा है कि आज के समय में बहुत से भोले-भाले लोग अपने जीवन की समस्याओं के कारण डरे हुए हैं और आज की इस फ्रॉड दुनिया में कई नकली व फ्रॉड लोग उनके डर का फायदा उठाकर उन्हें गुमराह करते हैं।'
                  : 'I am Healer Ddeepak Jain, Founder of TATHASTU THE DIVINE LIGHT. Through years of dedicated practice in Vedic & Chaldean Numerology, Chakra Healing, and Spiritual Guidance, I witnessed how countless sincere seekers are misled and exploited through fear by fraudulent practitioners in today’s fraud-filled world.'}
              </p>
              <p>
                {isHindi
                  ? 'इसीलिए मैंने "तथास्तु द डिवाइन लाइट" का निर्माण एक पवित्र मिशन के रूप में किया है—ताकि समाज को सकारात्मक सेवा (Positive Service) मिल सके, हर व्यक्ति अंधविश्वास और फ्रॉड लोगों के जाल से सुरक्षित रहे, अपने स्वयं के अंकों व कर्म-ऊर्जा को पहचानकर जीवन में स्थिर (Stable) और योग्य (Worthy) बने, तथा हमारे सभी साथी हीलर्स (Healers) को ऐसा सशक्त माध्यम मिले जिससे वे अपने हीलिंग कार्य और गाइडेंस को और अधिक प्रभावशाली बनाकर अपने क्लाइंट्स की सर्वोत्तम सेवा कर सकें।'
                  : 'That is why TATHASTU THE DIVINE LIGHT was created as a sacred mission: to serve society positively, shield every person from fraudulent traps, empower every Client to become stable and worthy through authentic self-growth, and support fellow Healers with world-class spiritual tools so they can elevate their healing work and guide their clients with excellence.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/30">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isHindi
                    ? '१००% पारदर्शी • अंधविश्वास और फ्रॉड से मुक्त आध्यात्मिक विज्ञान'
                    : '100% Transparent • Fraud-Free & Fear-Free Spiritual Science'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/30">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Helpline / WhatsApp: {TATHASTU_ADMIN_PHONE}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-300 bg-cyan-500/10 px-3.5 py-2 rounded-xl border border-cyan-500/30">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Admin &amp; App Creator Email: {TATHASTU_ADMIN_EMAIL}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 SACRED MISSION PILLARS */}
        <div className="relative z-10 mt-8 pt-8 border-t border-amber-500/20">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-400 mb-5 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            {isHindi
              ? 'हीलर दीपक जैन के ६ मुख्य संकल्प (Our 6 Core Mission Pillars)'
              : 'Healer Ddeepak Jain’s 6 Core Mission Pillars'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fivePillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border bg-gradient-to-br ${pillar.color} p-5 flex flex-col justify-between shadow-lg`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-black/40 border border-white/10 text-[11px] font-bold uppercase tracking-wider">
                        {pillar.badge}
                      </span>
                      <IconComp className="w-5 h-5 opacity-90 shrink-0" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-2 leading-snug">
                      {isHindi ? pillar.titleHi : pillar.titleEn}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
                      {isHindi ? pillar.descHi : pillar.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: WHAT IS THE MOTIVE OF THIS APP & SPIRITUAL VISUAL SHOWCASE */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[#0f1126] via-[#0c0d1b] to-[#140e24] p-6 md:p-8 shadow-2xl">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            {isHindi
              ? 'इस ऐप का मुख्य उद्देश्य (Motive of This App for Every Client & Healer)'
              : 'Motive of This App — How It Helps Every Client & Healer Grow'}
          </div>
          <h3 className="text-2xl font-serif font-bold text-white mb-2">
            {isHindi
              ? 'यह ऐप हर क्लाइंट की सेल्फ-ग्रोथ (Self-Growth) और हीलर्स के मार्गदर्शन में कैसे मदद करता है?'
              : 'How Tathastu Numerology Empowers Every Client’s Self-Growth & Healer’s Practice'}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {isHindi
              ? 'इस ऐप का उद्देश्य केवल अंक बताना नहीं है, बल्कि आपके जीवन के हर पहलू—नाम, मोबाइल नंबर, करियर, स्वास्थ्य, रिश्ते और दैनिक समय—को ब्रह्मांडीय ऊर्जा के साथ जोड़कर आपको आत्मनिर्भर, सफल और जागृत बनाना है।'
              : 'The motive of this app is to provide a complete, scientific, and practical spiritual toolkit that aligns your name, mobile number, chakras, relationships, and daily actions for measurable life transformation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {appModulesVisuals.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/50 bg-slate-950/80 flex flex-col transition-all duration-300 shadow-lg"
            >
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={item.img}
                  alt={isHindi ? item.titleHi : item.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Module {idx + 1}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-amber-300 mb-1.5">
                    {isHindi ? item.titleHi : item.titleEn}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isHindi ? item.descHi : item.descEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: HEARTFELT THANKS & BENEFITS OF JOINING TATHASTU THE DIVINE LIGHT FAMILY */}
      <div className="rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#0b1f1a] via-[#0c141d] to-[#161024] p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              {isHindi
                ? 'तथास्तु द डिवाइन लाइट परिवार में आपका अभिनंदन'
                : 'Welcome to the Tathastu The Divine Light Family'}
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">
              {isHindi
                ? '“तथास्तु द डिवाइन लाइट” परिवार से जुड़ने के लिए आपका हृदय से धन्यवाद'
                : 'Heartfelt Thanks for Joining the “TATHASTU THE DIVINE LIGHT” Family'}
            </h3>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shrink-0">
            {currentAccount ? (
              <span>
                ✦ {isHindi ? 'सम्मानित सदस्य:' : 'Honored Member:'}{' '}
                <strong className="text-white">{currentAccount.name}</strong> (
                {currentAccount.role.toUpperCase()})
              </span>
            ) : (
              <span>✦ TATHASTU THE DIVINE LIGHT FAMILY</span>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-200 leading-relaxed">
          {isHindi
            ? 'आप केवल एक ऐप के यूज़र नहीं हैं, बल्कि आप "तथास्तु द डिवाइन लाइट" के आध्यात्मिक परिवार के एक महत्वपूर्ण सदस्य हैं। इस परिवार से जुड़ने पर आपको जीवनभर सकारात्मक ऊर्जा, सच्चा मार्गदर्शन और फ्रॉड-मुक्त आध्यात्मिक सुरक्षा मिलती है:'
            : 'You are not just using an application—you are an honored member of the TATHASTU THE DIVINE LIGHT spiritual family. Here is how being part of this family benefits your life and practice:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {familyBenefits.map((benefit, i) => (
            <div
              key={i}
              className="rounded-2xl bg-slate-950/75 border border-emerald-500/25 p-4 space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                0{i + 1}
              </div>
              <h4 className="text-sm font-bold text-emerald-300">
                {isHindi ? benefit.titleHi : benefit.titleEn}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHindi ? benefit.descHi : benefit.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: GUIDANCE SESSION STAR-RATING & FEEDBACK BOX (Shown only after login) */}
      {!isPublicLanding && currentAccount && (
      <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-[#191229] via-[#110d1c] to-[#1c130a] p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <MessageSquarePlus className="w-4 h-4 text-amber-400" />
              {isHindi
                ? 'गाइडेंस सेशन स्टार-रेटिंग एवं सुझाव केंद्र'
                : 'Guidance Session Star-Rating & Feedback'}
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">
              {isHindi
                ? 'अपने गाइडेंस सेशन को स्टार-रेटिंग दें और अपना अनुभव साझा करें'
                : 'Rate Your Guidance Session Experience (1 to 5 Stars)'}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isHindi
                ? 'आपका हर अनुभव और स्टार-रेटिंग हमारे लिए अमूल्य है। गाइडेंस सेशन के बाद कृपया अपने हीलर या एडमिन को स्टार-रेटिंग दें ताकि हर क्लाइंट को सर्वोत्तम स्तर की आध्यात्मिक सेवा मिल सके।'
                : 'After your guidance or healing session, please rate your experience with your Healer or Admin using the 5-star system below so we can continually uphold the highest standard of spiritual service.'}
            </p>

            <div className="rounded-2xl bg-slate-950/90 border border-amber-500/25 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isHindi
                    ? 'गोपनीय सेवा गुणवत्ता ट्रैकिंग'
                    : 'Confidential Service Quality Tracking'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHindi
                  ? 'आपकी स्टार-रेटिंग और फ़ीडबैक पूर्णतः गोपनीय रहते हैं और केवल मास्टर एडमिन को दिखाई देते हैं ताकि प्रत्येक हीलर और एडमिन की सेवा गुणवत्ता की निगरानी की जा सके।'
                  : 'Your star rating and feedback are kept strictly confidential and are visible only to the Admin on their portal to track the service quality of every Healer and Admin.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleFeedbackSubmit}
              className="rounded-2xl bg-slate-950/85 border border-amber-500/30 p-5 sm:p-6 space-y-4"
            >
              {/* Select Healer or Admin for Session Rating */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                  {isHindi
                    ? '१. किसके मार्गदर्शन सेशन के लिए रेटिंग दे रहे हैं? (Select Healer / Admin)'
                    : '1. Select Healer or Admin Who Guided Your Session'}
                </label>
                <select
                  value={selectedHealerId}
                  onChange={(e) => setSelectedHealerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-white text-sm focus:border-amber-400 outline-none"
                >
                  {guidanceProviders.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interactive 1-5 Star Rating Selector */}
              <div className="rounded-2xl bg-slate-900/90 border border-amber-500/35 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {isHindi
                      ? '२. गाइडेंस सेशन स्टार-रेटिंग चुनें (Tap Stars to Rate)'
                      : '2. Tap Stars to Rate Your Guidance Session'}
                  </label>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                    {isHindi ? ratingLabels[fbRating]?.hi : ratingLabels[fbRating]?.en}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= fbRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbRating(star)}
                        className={`flex-1 sm:flex-initial px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          active
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <Star
                          className="w-5 h-5"
                          fill={active ? 'currentColor' : 'none'}
                        />
                        <span className="text-xs font-black">{star}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {isHindi ? '३. संदेश की श्रेणी (Category)' : '3. Feedback Category'}
                  </label>
                  <select
                    value={fbCategory}
                    onChange={(e) =>
                      setFbCategory(e.target.value as FeedbackSuggestionRecord['category'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                  >
                    <option value="feedback">
                      {isHindi ? 'गाइडेंस सेशन अनुभव (Session Experience)' : 'Guidance Session Experience'}
                    </option>
                    <option value="appreciation">
                      {isHindi ? 'आभार / प्रशंसा (Appreciation)' : 'Gratitude / Appreciation'}
                    </option>
                    <option value="suggestion">
                      {isHindi ? 'नया सुझाव (Suggestion)' : 'New Suggestion / Idea'}
                    </option>
                    <option value="support">
                      {isHindi ? 'सहायता / मार्गदर्शन (Support)' : 'Guidance / Support Request'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {isHindi ? 'आपकी चयनित रेटिंग (Selected Rating)' : 'Selected Star Score'}
                  </label>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5">
                    <span className="text-amber-400 font-bold text-sm tracking-widest">
                      {'★'.repeat(fbRating)}
                      {'☆'.repeat(5 - fbRating)}
                    </span>
                    <span className="text-xs font-black text-amber-200">
                      {fbRating} / 5 Stars
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {isHindi
                    ? '४. अपना अनुभव या सुझाव लिखें (वैकल्पिक / Optional)'
                    : '4. Share Your Session Experience or Suggestion (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'यहाँ अपना गाइडेंस सेशन अनुभव या सुझाव लिखें (या सीधे स्टार-रेटिंग सबमिट करें)...'
                      : 'Write a few words about your guidance session experience, or submit your star rating directly...'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {fbStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    fbStatus.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {fbStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{fbStatus.msg}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting
                    ? isHindi
                      ? 'दर्ज किया जा रहा है...'
                      : 'Submitting Rating...'
                    : isHindi
                    ? `${fbRating}★ रेटिंग एवं अनुभव सबमिट करें`
                    : `Submit ${fbRating}★ Session Rating`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
