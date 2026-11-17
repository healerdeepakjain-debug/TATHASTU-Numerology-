import type { SupportedLanguage } from './i18n';

/**
 * Validated Hindi spiritual, astrological, numerological & UI terminology review pack.
 * Fixes spelling mistakes, matra/anusvara inconsistencies, mixed-script leaks,
 * and awkward word-by-word phrasing across static keys, dynamic AI text, and PDF/WhatsApp reports.
 */

const NON_TRANSLATABLE_OBJECT_KEYS = new Set([
  'bannerKey',
  'key',
  'id',
  'profileId',
  'ownerUid',
  'ownerRole',
  'qrCodeDataUrl',
  'qrCodeDirectUrl',
  'healerLogoUrl',
  'postureKey',
  'pranayamaKey',
  'diagramType',
  'chakraColor',
  'char',
  'uid',
  'email',
  'mobile',
]);

const BRAHMIC_SCRIPT_BASE_MAP: Partial<Record<SupportedLanguage, number>> = {
  gu: 0x0a80,
  pa: 0x0a00,
  bn: 0x0980,
  as: 0x0980,
  or: 0x0b00,
  ta: 0x0b80,
  te: 0x0c00,
  kn: 0x0c80,
  ml: 0x0d00,
};

export interface LocaleValidationOptions {
  strictLocale?: boolean;
  context?: 'ui' | 'report' | 'ai-oracle' | 'whatsapp';
  translatorFn?: (text: string, lang: SupportedLanguage) => string;
}

export interface LocaleValidationResult {
  valid: boolean;
  sanitizedText: string;
  locale: SupportedLanguage;
  issuesFixed: string[];
  residualUntranslatedRatio: number;
}

type RegisteredTranslatorFn = (text: string, lang: SupportedLanguage) => string;
let registeredCoreTranslator: RegisteredTranslatorFn | null = null;

export function registerCoreLocaleTranslator(fn: RegisteredTranslatorFn): void {
  registeredCoreTranslator = fn;
}

/**
 * Dedicated HindiTranslationReview object mapping hardcoded keys, phrase patterns,
 * domain vocabulary, and spelling/grammar normalization rules to pure, orthographically accurate Hindi.
 */
export const HindiTranslationReview = {
  version: '2026.11-review-1',

  keyMap: {
    appTitle: 'वैदिक एवं काल्डियन अंक ज्योतिष',
    appSubtitle: 'एडवांस मोबाइल अंक ज्योतिष • कुंडली मिलान • दशा एवं वैदिक मंत्र',
    tab_dashboard: 'वैदिक डैशबोर्ड',
    tab_name: 'नाम एवं व्यवसाय सुधार',
    tab_mobile: 'एडवांस मोबाइल अंक ज्योतिष',
    tab_mantras: 'दैनिक वैदिक मंत्र',
    tab_yoga: 'वैदिक योग एवं प्राणायाम',
    tab_validator: 'अंक सत्यापन',
    tab_calendar: 'शुभ मुहूर्त पंचांग',
    tab_weekly: 'दैनिक एवं साप्ताहिक भविष्यफल',
    tab_compatibility: 'वर-वधू मिलान एवं चक्र',
    tab_festivals: 'भारतीय पर्व एवं पूजा मुहूर्त',
    tab_notifications: '6 दैनिक अलर्ट एवं व्हाट्सएप',
    tab_profiles: 'सेव प्रोफाइल एवं पोर्टल',
    tab_transits: 'ग्रह गोचर एवं चंद्र कला',
    tab_islamic: 'इस्लामिक-वैदिक रूहानी उपाय',
    tab_ai: 'वैदिक ज्योतिष परामर्श',
    groomRemedyLabel: 'वर द्वारा किए जाने वाले उपाय',
    brideRemedyLabel: 'वधू द्वारा किए जाने वाले उपाय',
    bothRemedyLabel: 'वर एवं वधू दोनों के लिए संयुक्त उपाय',
    authHeroTagline: 'वैदिक • काल्डियन • प्राणिक ऊर्जा • आभामंडल एवं चक्र विज्ञान',
    authLoginHeading: 'लॉगिन या पंजीकरण पोर्टल चुनें',
    authClientLogin: 'क्लाइंट लॉगिन',
    authClientSignUp: 'नया क्लाइंट पंजीकरण',
    authHealerLogin: 'हीलर लॉगिन',
    authHealerSignUp: 'नया हीलर पंजीकरण',
    authAdminLogin: 'मास्टर एडमिन लॉगिन',
    authForgotPassword: 'पासवर्ड भूल गए?',
    installApp: 'ऐप इंस्टॉल करें',
    installAppLinkQr: 'ऐप लिंक / क्यूआर',
    copyAppLink: 'ऐप लिंक कॉपी करें',
    linkCopied: 'लिंक कॉपी हो गया!',
    shareAppWhatsApp: 'व्हाट्सएप पर ऐप लिंक शेयर करें',
    loginSuccess: 'लॉगिन सफल रहा! आपके डैशबोर्ड पर जा रहे हैं...',
    aiOracleGreeting: 'नमस्ते! मैं आपका वैदिक ज्योतिष एवं काल्डियन अंक ज्योतिष परामर्शदाता हूं।',
    aiOracleAskPlaceholder: 'नाम सुधार, मोबाइल नंबर, रत्न, शुभ मुहूर्त या भविष्यफल के बारे में पूछें...',
    aiOracleConsultButton: 'परामर्श प्राप्त करें',
  } as Record<string, string>,

  exactMap: {
    'Client Personal Portal': 'क्लाइंट व्यक्तिगत पोर्टल',
    'Spiritual Healers & Consultants Portal': 'आध्यात्मिक हीलर एवं परामर्शदाता पोर्टल',
    'Master Admin Portal': 'मास्टर एडमिन पोर्टल',
    'Select Your Login or Registration Portal': 'अपना लॉगिन या पंजीकरण पोर्टल चुनें',
    'Login / Sign-Up (Client • Healer • Admin)': 'लॉगिन / नया पंजीकरण (क्लाइंट • हीलर • एडमिन)',
    'Connect Cloud Real-Time Sync': 'क्लाउड रीयल-टाइम सिंक जोड़ें',
    'Copy App Link': 'ऐप लिंक कॉपी करें',
    'Share App Link on WhatsApp': 'व्हाट्सएप पर ऐप लिंक शेयर करें',
    'Scan QR to Open / Install App': 'ऐप खोलने / इंस्टॉल करने हेतु क्यूआर स्कैन करें',
    'Direct Official App Link (Click to Copy or Share)': 'आधिकारिक ऐप लिंक (कॉपी या शेयर करने हेतु क्लिक करें)',
    'Download Android / iOS App': 'एंड्रॉइड / आईओएस ऐप डाउनलोड करें',
    'App QR & Share File': 'ऐप क्यूआर एवं फाइल शेयर',
    'Send App to Phone': 'फोन पर ऐप भेजें',
    'Forgot Password?': 'पासवर्ड भूल गए?',
    'Official App Download, Direct Link & QR Share Hub': 'आधिकारिक ऐप डाउनलोड, डायरेक्ट लिंक एवं क्यूआर शेयर केंद्र',
  } as Record<string, string>,

  /**
   * Ordered phrase rules evaluated BEFORE word-level translation to preserve natural Hindi syntax.
   */
  phrasePairs: [
    [/Access your personalized Vedic & Chaldean Numerology Report,?[^:\n]*:/gi, 'अपनी व्यक्तिगत वैदिक एवं काल्डियन अंक ज्योतिष रिपोर्ट, नाम व मोबाइल आवृत्ति परीक्षण, 7-चक्र आभामंडल उपाय, योग साधना तथा दैनिक शुभ/अशुभ मुहूर्त ऐप यहां से खोलें:'],
    [/Welcome to the complete Spiritual & Data-Driven Mystical Alignment Platform\.?/gi, 'संपूर्ण आध्यात्मिक एवं प्रामाणिक वैदिक-काल्डियन जीवन संतुलन मंच में आपका हार्दिक स्वागत है।'],
    [/Your Natal & Numerological Matrix:/gi, 'आपकी जन्म कुंडली एवं अंक ज्योतिषीय तालिका:'],
    [/Select any topic below or enter your question regarding[^.]+./gi, 'नीचे दिए गए किसी भी विषय को चुनें अथवा नाम स्पेलिंग सुधार, मोबाइल अंक, हस्ताक्षर, रत्न, व्यापार या विवाह अनुकूलता के संबंध में अपना प्रश्न पूछें।'],
    [/Why is my current name spelling causing delays, and how should I adjust it\?/gi, 'मेरे वर्तमान नाम की स्पेलिंग से कार्यों में देरी क्यों हो रही है, और मुझे इसमें क्या सुधार करना चाहिए?'],
    [/What mobile number ending sequence is most auspicious for high-value business deals\?/gi, 'बड़े व्यापारिक सौदों और आर्थिक उन्नति के लिए मोबाइल नंबर के अंतिम 4 अंक कौन से सर्वाधिक शुभ हैं?'],
    [/Analyze my signature vibration and suggest the ideal pen ink color for my Mulank\./gi, 'मेरे हस्ताक्षर की ऊर्जा का विश्लेषण करें और मेरे मूलांक के अनुसार श्रेष्ठ पेन की स्याही का रंग बताएं।'],
    [/Which Vedic gemstone or Rudraksha best balances my missing Lo-Shu grid frequencies\?/gi, 'मेरे लो-शू ग्रिड के अनुपस्थित अंकों को संतुलित करने के लिए कौन सा वैदिक रत्न या रुद्राक्ष सर्वोत्तम है?'],
    [/What are the most favorable days and industries for me to sign contracts or launch ventures\?/gi, 'अनुबंध हस्ताक्षर करने या नया व्यवसाय आरंभ करने के लिए मेरे सबसे शुभ दिन और कार्यक्षेत्र कौन से हैं?'],
    [/Ask anything about your name, signature, mobile digits, business, love, or remedies\.\.\./gi, 'नाम, हस्ताक्षर, मोबाइल अंक, व्यवसाय, विवाह या वैदिक उपायों के बारे में अपना प्रश्न यहां लिखें...'],
    [/Chaldean Name Vibration & Phonetic Diagnosis for/gi, 'काल्डियन नाम ध्वनि आवृत्ति एवं सुधार विश्लेषण —'],
    [/Vedic & Chaldean Mobile Number Prescription for/gi, 'वैदिक एवं काल्डियन मोबाइल नंबर परामर्श —'],
    [/Sacred Signature & Pen Ink Prescription for/gi, 'शुभ हस्ताक्षर एवं पेन की स्याही का रंग परामर्श —'],
    [/Ratna Shastra \(Gemstone\) & Rudraksha Prescription for/gi, 'रत्न शास्त्र एवं रुद्राक्ष परामर्श —'],
    [/Personalized Vedic Jyotish & Chaldean Guidance for/gi, 'व्यक्तिगत वैदिक ज्योतिष एवं काल्डियन मार्गदर्शन —'],
    [/Current Vibrational Assessment/gi, 'वर्तमान ध्वनि एवं ऊर्जा मूल्यांकन'],
    [/Recommended Harmonized Spelling/gi, 'अनुशंसित शुभ नाम स्पेलिंग'],
    [/Prescribed Daily Sadhana/gi, 'दैनिक आध्यात्मिक साधना विधि'],
    [/Harmonious Digit Matrix/gi, 'शुभ अंक तालिका'],
    [/Ideal Last 4-Digit Sequences for High-Value Deals/gi, 'उच्च व्यावसायिक सफलता हेतु अंतिम 4 शुभ अंक संयोजन'],
    [/Activation Protocol/gi, 'ऊर्जा सक्रियण विधि'],
    [/Grapho-Numerological Rules for Mulank/gi, 'मूलांक के अनुसार हस्ताक्षर विज्ञान के नियम —'],
    [/Prescribed Pen Ink Colors/gi, 'अनुशंसित पेन की स्याही के रंग'],
    [/Natal Planetary & Rashi Alignment/gi, 'जन्म ग्रह एवं राशि समन्वय'],
    [/Primary Vedic Gemstone \(Ratna\)/gi, 'मुख्य वैदिक रत्न (महारत्न)'],
    [/Sacred Rudraksha & Mantra/gi, 'पवित्र रुद्राक्ष एवं मंत्र साधना'],
    [/Natal & Cosmic Synthesis/gi, 'जन्म कुंडली एवं ब्रह्मांडीय विश्लेषण'],
    [/Direct Guidance for Your Query/gi, 'आपके प्रश्न हेतु सटीक ज्योतिषीय मार्गदर्शन'],
    [/Prescribed Vedic & Pranic Remedy/gi, 'निर्धारित वैदिक एवं प्राणिक उपाय'],
    [/Vedic AI Oracle/gi, 'वैदिक ज्योतिष एवं काल्डियन परामर्श'],
    [/Classical Ephemeris & Cheiro Analysis/gi, 'प्रामाणिक वैदिक एवं काल्डियन गणना सक्रिय'],
    [/Install Native Home Screen App on This Device Now/gi, 'इस डिवाइस की होम स्क्रीन पर ऐप इंस्टॉल करें'],
    [/Download & Install TATHASTU THE DIVINE LIGHT/gi, 'तथास्तु दिव्य ज्योति ऐप डाउनलोड एवं इंस्टॉल करें'],
    [/All-India Primary/gi, 'अखिल भारतीय प्रमुख'],
    [/Works Offline & Online/gi, 'ऑनलाइन एवं ऑफलाइन दोनों में कार्यशील'],
    [/No Login Needed/gi, 'लॉगिन की आवश्यकता नहीं'],
    [/Add to Mobile Home Screen/gi, 'मोबाइल होम स्क्रीन पर जोड़ें'],
    [/Open in New Tab/gi, 'नए टैब में खोलें'],
    [/PERSONALIZED VEDIC & CHALDEAN REPORT STATUS, AUSPICIOUS TIMINGS & DEEP LINK/gi, 'व्यक्तिगत वैदिक एवं काल्डियन रिपोर्ट स्थिति, शुभ समय एवं डायरेक्ट लिंक'],
    [/UPCOMING VEDIC MUHURAT, REPORT STATUS & AUSPICIOUS TIME ALERT/gi, 'आगामी वैदिक शुभ मुहूर्त, रिपोर्ट स्थिति एवं शुभ समय अलर्ट'],
    [/LIVE AUSPICIOUS TIME, RAHU KAAL & REPORT STATUS/gi, 'लाइव शुभ समय, राहु काल एवं रिपोर्ट स्थिति'],
    [/CLIENT REPORT STATUS:/gi, 'साधक रिपोर्ट स्थिति:'],
    [/VERIFIED & ENERGIZED \(Personalized A4 Spiritual Dossier Ready\)/gi, 'सत्यापित एवं अभिमंत्रित (व्यक्तिगत A4 आध्यात्मिक रिपोर्ट तैयार है)'],
    [/12-Month Validity:/gi, '12-माह वैधता अवधि:'],
    [/Name Harmony Score:/gi, 'नाम सामंजस्य स्कोर:'],
    [/Mobile Audit Status:/gi, 'मोबाइल परीक्षण स्थिति:'],
    [/LIVE AUSPICIOUS TIME & RAHU KAAL UPDATE/gi, 'लाइव शुभ समय एवं राहु काल अपडेट'],
    [/Good Time \(Shubh\/Amrit\/Labh\):/gi, 'शुभ समय (शुभ/अमृत/लाभ चौघड़िया):'],
    [/Bad Time to Avoid \(Rahu Kaal\):/gi, 'वर्जित समय (राहु काल — सावधानी रखें):'],
    [/Active Planetary Hora:/gi, 'वर्तमान ग्रह होरा:'],
    [/Daily Vedic Planetary Mantra:/gi, 'दैनिक वैदिक ग्रह मंत्र:'],
    [/Personal Mulank & Bhagyank Mantra:/gi, 'व्यक्तिगत मूलांक एवं भाग्यांक मंत्र:'],
    [/DIRECT DEEP LINK TO YOUR PERSONALIZED REPORT VIEW & PDF:/gi, 'आपकी व्यक्तिगत रिपोर्ट एवं पीडीएफ देखने हेतु डायरेक्ट लिंक:'],
    [/Warm Spiritual Blessings,/gi, 'हार्दिक आध्यात्मिक आशीर्वाद सहित,'],
    [/Prepared & Energized By Healer:/gi, 'आध्यात्मिक हीलर द्वारा तैयार एवं अभिमंत्रित:'],
    [/CORE BIRTH VIBRATION:/gi, 'मुख्य जन्म अंक एवं ग्रह विवरण:'],
  ] as [RegExp, string][],

  /**
   * Additional verified spiritual, UI & AI report terms complementing i18n's word dictionary.
   */
  wordLexicon: {
    namaste: 'नमस्ते',
    oracle: 'परामर्शदाता',
    consultation: 'परामर्श',
    diagnosis: 'निदान',
    assessment: 'मूल्यांकन',
    phonetic: 'ध्वन्यात्मक',
    syllable: 'अक्षर',
    vibration: 'स्पंदन',
    vibrations: 'स्पंदन',
    signature: 'हस्ताक्षर',
    underline: 'अधोरेखा',
    ascending: 'ऊर्ध्वगामी',
    trajectory: 'दिशा',
    ink: 'स्याही',
    pen: 'कलम',
    journal: 'डायरी',
    minimum: 'न्यूनतम',
    maximum: 'अधिकतम',
    carats: 'कैरेट',
    ratti: 'रत्ती',
    nepalese: 'नेपाली',
    thread: 'धागा',
    silk: 'रेशमी',
    contracts: 'अनुबंध',
    investments: 'निवेश',
    ventures: 'व्यावसायिक उपक्रम',
    breakthroughs: 'उल्लेखनीय सफलताएं',
    biofield: 'जैव-ऊर्जा क्षेत्र',
    auric: 'आभामंडल संबंधी',
    pranayama: 'प्राणायाम',
    asana: 'आसन',
    asanas: 'योगासन',
    portal: 'पोर्टल',
    dashboard: 'डैशबोर्ड',
    login: 'लॉगिन',
    register: 'पंजीकरण',
    password: 'पासवर्ड',
    mobile: 'मोबाइल',
    email: 'ईमेल',
    profile: 'प्रोफाइल',
    profiles: 'प्रोफाइल',
    healer: 'हीलर',
    client: 'क्लाइंट',
    admin: 'एडमिन',
    install: 'इंस्टॉल करें',
    download: 'डाउनलोड करें',
    share: 'शेयर करें',
    print: 'प्रिंट करें',
    preview: 'प्रीव्यू',
    close: 'बंद करें',
    done: 'पूर्ण',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    verified: 'सत्यापित',
    auspicious: 'शुभ',
    inauspicious: 'अशुभ',
    remedy: 'उपाय',
    remedies: 'उपाय',
    blessing: 'आशीर्वाद',
    blessings: 'आशीर्वाद',
    mantra: 'मंत्र',
    mantras: 'मंत्र',
    gemstone: 'रत्न',
    gemstones: 'रत्न',
    direction: 'दिशा',
    east: 'पूर्व',
    west: 'पश्चिम',
    north: 'उत्तर',
    south: 'दक्षिण',
  } as Record<string, string>,

  /**
   * Ordered orthographic & grammatical normalization rules for Devanagari Hindi.
   */
  spellingCorrections: [
    // Reported & audited Hindi spelling fixes
    [/हरा चरा/g, 'हरा चारा'],
    [/मर्जरी-बितिलासन/g, 'मार्जरी-बितिलासन'],
    [/मर्जरी/g, 'मार्जरी'],
    [/नक्ष्त्र/g, 'नक्षत्र'],
    [/प्रणायाम/g, 'प्राणायाम'],
    [/काल्डीयन/g, 'काल्डियन'],
    [/कैल्डियन/g, 'काल्डियन'],
    [/ज्योतीष/g, 'ज्योतिष'],
    [/मूहूर्त/g, 'मुहूर्त'],
    [/आध्यत्मिक/g, 'आध्यात्मिक'],
    [/अध्यात्मिक/g, 'आध्यात्मिक'],
    [/लक्ष्म्यै\s+नमह/g, 'लक्ष्म्यै नमः'],
    [/स्वास्थय/g, 'स्वास्थ्य'],
    [/सामांजस्य/g, 'सामंजस्य'],
    [/अश्वनी/g, 'अश्विनी'],
    [/आर्दरा/g, 'आर्द्रा'],
    [/मृगशीर्ष/g, 'मृगशिरा'],
    [/पुर्वाफाल्गुनी/g, 'पूर्वाफाल्गुनी'],
    [/पुर्वाषाढा/g, 'पूर्वाषाढ़ा'],
    [/पूर्वाषाढा/g, 'पूर्वाषाढ़ा'],
    [/उत्तराषाढा/g, 'उत्तराषाढ़ा'],
    [/जयेष्ठा/g, 'ज्येष्ठा'],
    [/लहसुनिया/g, 'लहसुनिया'],
    [/लहसूनिया/g, 'लहसुनिया'],
    // Modern consistent anusvara normalization
    [/चन्द्र/g, 'चंद्र'],
    [/मंगलवार/g, 'मंगलवार'],
    [/कुण्डली/g, 'कुंडली'],
    [/अंकशाष्त्र/g, 'अंकशास्त्र'],
    [/बृहस्पती/g, 'बृहस्पति'],
    // Fix stray Gujarati 'म' or Devanagari mixing inside Marathi/Hindi contexts
    [/प्राणायाम/g, 'प्राणायाम'],
    // Clean up duplicate parenthetical echoes produced by partial translation: e.g. "सूर्य (सूर्य)" -> "सूर्य"
    [/([\u0900-\u097F]+)\s*\(\1\)/g, '$1'],
    // Clean redundant English/Hindi spaces around punctuation
    [/\s+([,।?!:;])/g, '$1'],
    [/[ ]{2,}/g, ' '],
  ] as [RegExp, string][],

  applySpellingFixes(text: string): { text: string; fixes: string[] } {
    let working = text.normalize('NFC');
    const fixes: string[] = [];

    // Guard against orphaned combining marks at start of string
    if (/^[\u0901-\u0903\u093A-\u094F\u0951-\u0957\u0962-\u0963]+/.test(working)) {
      working = working.replace(/^[\u0901-\u0903\u093A-\u094F\u0951-\u0957\u0962-\u0963]+/, '');
      fixes.push('removed_orphaned_combining_mark');
    }

    for (const [pattern, replacement] of HindiTranslationReview.spellingCorrections) {
      const next = working.replace(pattern, replacement);
      if (next !== working) {
        fixes.push(`spelling_fix:${replacement}`);
        working = next;
      }
    }

    return { text: working, fixes };
  },

  convertDevanagariToRegionalScript(text: string, targetLang: SupportedLanguage): string {
    const targetBase = BRAHMIC_SCRIPT_BASE_MAP[targetLang];
    if (!targetBase) return text;
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 0x0901 && code <= 0x096f) {
        const offset = code - 0x0900;
        out += String.fromCharCode(targetBase + offset);
      } else {
        out += text[i];
      }
    }
    return out;
  },
};

function computeUntranslatedLatinRatio(text: string): number {
  const words = text.match(/[A-Za-z]{3,}/g) || [];
  if (words.length === 0) return 0;
  const totalWords = (text.match(/[\p{L}]{2,}/gu) || []).length;
  if (totalWords === 0) return 0;
  return Number((words.length / totalWords).toFixed(3));
}

/**
 * Validation & normalization layer for dynamic AI-generated text, report text, and UI strings.
 * Ensures proper script normalization, Hindi orthographic accuracy, and preservation of URLs/emails.
 */
export function validateAndNormalizeLocaleText(
  rawText: string,
  targetLang: SupportedLanguage,
  options: LocaleValidationOptions = {}
): LocaleValidationResult {
  if (!rawText || typeof rawText !== 'string') {
    return {
      valid: true,
      sanitizedText: rawText || '',
      locale: targetLang,
      issuesFixed: [],
      residualUntranslatedRatio: 0,
    };
  }

  const trimmed = rawText.trim();
  if (
    !trimmed ||
    trimmed.startsWith('data:image/') ||
    /^https?:\/\/\S+$/i.test(trimmed) ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ||
    /^[0-9+\-*/().,:%•|—–\s]+$/.test(trimmed)
  ) {
    return {
      valid: true,
      sanitizedText: rawText,
      locale: targetLang,
      issuesFixed: [],
      residualUntranslatedRatio: 0,
    };
  }

  const issuesFixed: string[] = [];
  let working = rawText.normalize('NFC');

  // Protect URLs and emails before linguistic normalization
  const protectedTokens: string[] = [];
  working = working.replace(/(https?:\/\/[^\s)]+|[^\s@]+@[^\s@]+\.[^\s@]+)/gi, (match) => {
    const idx = protectedTokens.length;
    protectedTokens.push(match);
    return `@@${idx}@@`;
  });

  if (targetLang !== 'en' && targetLang !== 'en-hi') {
    // 1. Apply verified phrase pairs from HindiTranslationReview first
    if (HindiTranslationReview.exactMap[trimmed]) {
      working = HindiTranslationReview.exactMap[trimmed];
      issuesFixed.push('exact_review_map');
    } else {
      for (const [pattern, replacement] of HindiTranslationReview.phrasePairs) {
        const next = working.replace(pattern, replacement);
        if (next !== working) {
          issuesFixed.push('review_phrase_pair');
          working = next;
        }
      }
    }

    // 2. Apply main translator (which covers phrase maps & comprehensive word lexicon)
    const translator = options.translatorFn || registeredCoreTranslator;
    if (translator) {
      const lines = working.split('\n');
      const translatedLines = lines.map((line) => translator(line, targetLang));
      const joined = translatedLines.join('\n');
      if (joined !== working) {
        issuesFixed.push('core_locale_translation');
        working = joined;
      }
    }

    // 3. Apply HindiTranslationReview extra word lexicon for any remaining standalone words
    const afterExtraWords = working.replace(/\b([A-Za-z][A-Za-z']*)\b/g, (word) => {
      if (word.length === 1 && word === word.toUpperCase()) return word;
      const lower = word.toLowerCase().replace(/'s$/, '');
      const hit = HindiTranslationReview.wordLexicon[lower];
      if (hit) {
        return BRAHMIC_SCRIPT_BASE_MAP[targetLang]
          ? HindiTranslationReview.convertDevanagariToRegionalScript(hit, targetLang)
          : hit;
      }
      return word;
    });
    if (afterExtraWords !== working) {
      issuesFixed.push('review_lexicon_match');
      working = afterExtraWords;
    }

    // 4. For Devanagari Hindi/Marathi or before regional conversion, run spelling review
    if (targetLang === 'hi' || targetLang === 'mr') {
      const spellRes = HindiTranslationReview.applySpellingFixes(working);
      working = spellRes.text;
      issuesFixed.push(...spellRes.fixes);
    } else if (BRAHMIC_SCRIPT_BASE_MAP[targetLang]) {
      // Ensure any residual Devanagari characters injected by phrase rules are converted to target script
      if (/[\u0901-\u096f]/.test(working)) {
        const spellFirst = HindiTranslationReview.applySpellingFixes(working);
        working = HindiTranslationReview.convertDevanagariToRegionalScript(
          spellFirst.text,
          targetLang
        );
        issuesFixed.push('script_consistency_transliteration');
      }
    }
  } else {
    // Even in 'en' or 'en-hi', still normalize any embedded Hindi spelling mistakes
    if (/[\u0900-\u097F]/.test(working)) {
      const spellRes = HindiTranslationReview.applySpellingFixes(working);
      working = spellRes.text;
      issuesFixed.push(...spellRes.fixes);
    }
  }

  // Restore protected URLs and emails
  working = working.replace(/@@(\d+)@@/g, (_, idxStr) => {
    return protectedTokens[Number(idxStr)] || '';
  });

  const residualRatio = computeUntranslatedLatinRatio(working);
  const valid =
    targetLang === 'en' ||
    targetLang === 'en-hi' ||
    !options.strictLocale ||
    residualRatio < 0.35;

  return {
    valid,
    sanitizedText: working,
    locale: targetLang,
    issuesFixed: Array.from(new Set(issuesFixed)),
    residualUntranslatedRatio: residualRatio,
  };
}

/**
 * Recursively validates and normalizes all dynamic string fields inside an AI or PDF report payload
 * before rendering or exporting, preserving internal identifiers, URLs, and data URIs.
 */
export function validateDynamicAiReportContent<T>(
  payload: T,
  targetLang: SupportedLanguage,
  options: LocaleValidationOptions = {}
): T {
  if (!payload) return payload;
  if (typeof payload === 'string') {
    return validateAndNormalizeLocaleText(payload, targetLang, {
      context: 'report',
      ...options,
    }).sanitizedText as unknown as T;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) =>
      validateDynamicAiReportContent(item, targetLang, options)
    ) as unknown as T;
  }
  if (typeof payload === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
      if (NON_TRANSLATABLE_OBJECT_KEYS.has(k)) {
        out[k] = v;
      } else {
        out[k] = validateDynamicAiReportContent(v, targetLang, options);
      }
    }
    return out as T;
  }
  return payload;
}
