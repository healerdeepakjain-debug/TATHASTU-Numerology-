import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  HindiTranslationReview,
  registerCoreLocaleTranslator,
  validateAndNormalizeLocaleText,
  validateDynamicAiReportContent,
} from './hindiTranslationReview';

export {
  HindiTranslationReview,
  validateAndNormalizeLocaleText,
  validateDynamicAiReportContent,
};

export type SupportedLanguage =
  | 'en-hi'
  | 'en'
  | 'hi'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'bn'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'or'
  | 'as';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeLabel: string;
  region: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en-hi', name: 'English + Hindi (Bilingual)', nativeLabel: 'English + हिन्दी', region: 'All-India Primary' },
  { code: 'en', name: 'English', nativeLabel: 'English', region: 'Global / India' },
  { code: 'hi', name: 'Hindi', nativeLabel: 'हिन्दी', region: 'North & Central India' },
  { code: 'mr', name: 'Marathi', nativeLabel: 'मराठी', region: 'Maharashtra' },
  { code: 'gu', name: 'Gujarati', nativeLabel: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'pa', name: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'bn', name: 'Bengali', nativeLabel: 'বাংলা', region: 'West Bengal' },
  { code: 'ta', name: 'Tamil', nativeLabel: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'te', name: 'Telugu', nativeLabel: 'తెలుగు', region: 'Andhra & Telangana' },
  { code: 'kn', name: 'Kannada', nativeLabel: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeLabel: 'മലയാളം', region: 'Kerala' },
  { code: 'or', name: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'as', name: 'Assamese', nativeLabel: 'অসমীয়া', region: 'Assam' },
];

const LANGUAGE_STORAGE_KEY = 'tathastu_selected_language_v1';

function detectInitialLanguage(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') as SupportedLanguage | null;
      if (urlLang && INDIAN_LANGUAGES.some((l) => l.code === urlLang)) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, urlLang);
        return urlLang;
      }
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
      if (saved && INDIAN_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // Fallback
    }
  }
  return 'en-hi';
}

let currentGlobalLanguage: SupportedLanguage = detectInitialLanguage();

export function getCurrentLanguage(): SupportedLanguage {
  return currentGlobalLanguage;
}

export function setGlobalLanguage(lang: SupportedLanguage): void {
  currentGlobalLanguage = lang;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore storage error
    }
  }
}

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  'en-hi': {
    appTitle: 'Vedic & Chaldean Numerology • वैदिक एवं काल्डियन अंक ज्योतिष',
    appSubtitle: 'Advance Mobile Numerology • Kundali Milan • Vedic Dasha & Mantras',
    tab_dashboard: 'Vedic Dashboard • डैशबोर्ड',
    tab_name: 'Name & Career • नाम एवं व्यवसाय',
    tab_mobile: 'Advance Mobile Audit • मोबाइल अंक ज्योतिष',
    tab_mantras: 'Daily Vedic Mantras • दैनिक वैदिक मंत्र',
    tab_yoga: 'Yoga & Pranayama • योग एवं प्राणायाम',
    tab_validator: 'Numeric Verifier • अंक सत्यापन',
    tab_calendar: 'Muhurat Calendar • मुहूर्त पंचांग',
    tab_weekly: 'Daily & Weekly Forecast • दैनिक/साप्ताहिक राशिफल',
    tab_compatibility: 'Partner Milan • कुंडली एवं चक्र मिलान',
    tab_festivals: 'Indian Festivals & Puja • पर्व एवं पूजा मुहूर्त',
    tab_notifications: '6 Daily Alerts & WhatsApp • 6 दैनिक अलर्ट',
    tab_profiles: 'Saved Profiles & Portals • सेव प्रोफाइल एवं पोर्टल',
    tab_transits: 'Transits & Moon • ग्रह गोचर एवं तिथि',
    tab_islamic: 'Islamic-Vedic Remedies • इस्लामिक-वैदिक उपाय',
    tab_ai: 'Vedic Oracle • वैदिक प्रश्नोत्तर',
    groomRemedyLabel: 'Groom Must Perform (वर के लिए उपाय)',
    brideRemedyLabel: 'Bride Must Perform (वधू के लिए उपाय)',
    bothRemedyLabel: 'Both Partner Joint Remedy (वर एवं वधू दोनों के लिए संयुक्त उपाय)',
  },
  en: {
    appTitle: 'Vedic & Chaldean Numerology',
    appSubtitle: 'Advance Mobile Numerology • Kundali Milan • Vedic Dasha & Mantras',
    tab_dashboard: 'Vedic Dashboard',
    tab_name: 'Name & Career',
    tab_mobile: 'Advance Mobile Audit',
    tab_mantras: 'Daily Vedic Mantras',
    tab_yoga: 'Yoga & Pranayama',
    tab_validator: 'Numeric Verifier',
    tab_calendar: 'Muhurat Calendar',
    tab_weekly: 'Daily & Weekly Forecast',
    tab_compatibility: 'Partner Milan',
    tab_festivals: 'Indian Festivals & Puja',
    tab_notifications: '6 Daily Alerts & WhatsApp',
    tab_profiles: 'Saved Profiles & Portals',
    tab_transits: 'Transits & Moon',
    tab_islamic: 'Islamic-Vedic Remedies',
    tab_ai: 'Vedic AI Oracle',
    groomRemedyLabel: 'Remedy for Groom Only',
    brideRemedyLabel: 'Remedy for Bride Only',
    bothRemedyLabel: 'Joint Remedy for Both Partners',
  },
  hi: {
    ...HindiTranslationReview.keyMap,
    appTitle: HindiTranslationReview.keyMap.appTitle,
    appSubtitle: HindiTranslationReview.keyMap.appSubtitle,
    tab_dashboard: HindiTranslationReview.keyMap.tab_dashboard,
    tab_name: HindiTranslationReview.keyMap.tab_name,
    tab_mobile: HindiTranslationReview.keyMap.tab_mobile,
    tab_mantras: HindiTranslationReview.keyMap.tab_mantras,
    tab_yoga: HindiTranslationReview.keyMap.tab_yoga,
    tab_validator: HindiTranslationReview.keyMap.tab_validator,
    tab_calendar: HindiTranslationReview.keyMap.tab_calendar,
    tab_weekly: HindiTranslationReview.keyMap.tab_weekly,
    tab_compatibility: HindiTranslationReview.keyMap.tab_compatibility,
    tab_festivals: HindiTranslationReview.keyMap.tab_festivals,
    tab_notifications: HindiTranslationReview.keyMap.tab_notifications,
    tab_profiles: HindiTranslationReview.keyMap.tab_profiles,
    tab_transits: HindiTranslationReview.keyMap.tab_transits,
    tab_islamic: HindiTranslationReview.keyMap.tab_islamic,
    tab_ai: HindiTranslationReview.keyMap.tab_ai,
    groomRemedyLabel: HindiTranslationReview.keyMap.groomRemedyLabel,
    brideRemedyLabel: HindiTranslationReview.keyMap.brideRemedyLabel,
    bothRemedyLabel: HindiTranslationReview.keyMap.bothRemedyLabel,
  },
  mr: {
    appTitle: 'वैदिक आणि काल्डियन अंकशास्त्र',
    appSubtitle: 'मोबाईल अंकशास्त्र • कुंडली मिलन • दशा आणि वैदिक मंत्र',
    tab_dashboard: 'वैदिक डॅशबोर्ड',
    tab_name: 'नाव आणि व्यवसाय',
    tab_mobile: 'मोबाईल अंकशास्त्र',
    tab_mantras: 'दैनिक वैदिक मंत्र',
    tab_yoga: 'योग आणि प्राणायाम',
    tab_validator: 'अंक पडताळणी',
    tab_calendar: 'मुहूर्त पंचांग',
    tab_weekly: 'दैनिक व साप्ताहिक भविष्य',
    tab_compatibility: 'वधू-वर गुण मिलन',
    tab_festivals: 'भारतीय सण आणि पूजा मुहूर्त',
    tab_notifications: '६ दैनिक अलर्ट व व्हॉट्सॲप',
    tab_profiles: 'जतन केलेले प्रोफाइल व पोर्टल',
    tab_transits: 'ग्रह गोचर आणि चंद्र कला',
    tab_islamic: 'इस्लामिक-वैदिक उपाय',
    tab_ai: 'वैदिक सल्लागार',
    groomRemedyLabel: 'वरासाठी उपाय',
    brideRemedyLabel: 'वधूसाठी उपाय',
    bothRemedyLabel: 'दोघांसाठी संयुक्त उपाय',
  },
  gu: {
    appTitle: 'વૈદિક અને કાલ્ડિયન અંકશાસ્ત્ર',
    appSubtitle: 'એડવાન્સ મોબાઇલ ન્યૂમરોલોજી • કુંડળી મિલન • દશા અને મંત્ર',
    tab_dashboard: 'વૈદિક ડેશબોર્ડ',
    tab_name: 'નામ અને વ્યવસાય',
    tab_mobile: 'મોબાઇલ અંકશાસ્ત્ર',
    tab_mantras: 'દૈનિક વૈદિક મંત્ર',
    tab_yoga: 'યોગ અને પ્રાણાયામ',
    tab_validator: 'અંક ચકાસણી',
    tab_calendar: 'મુહૂર્ત પંચાંગ',
    tab_weekly: 'દૈનિક અને સાપ્તાહિક રાશિફળ',
    tab_compatibility: 'વર-કન્યા મિલન',
    tab_festivals: 'ભારતીય તહેવારો અને પૂજા',
    tab_notifications: '૬ દૈનિક એલર્ટ અને વોટ્સએપ',
    tab_profiles: 'સેવ પ્રોફાઇલ અને પોર્ટલ',
    tab_transits: 'ગ્રહ ગોચર અને ચંદ્ર',
    tab_islamic: 'ઇસ્લામિક-વૈદિક ઉપાય',
    tab_ai: 'વૈદિક જ્યોતિષ માર્ગદર્શન',
    groomRemedyLabel: 'વરરાજા માટે ઉપાય',
    brideRemedyLabel: 'કન્યા માટે ઉપાય',
    bothRemedyLabel: 'બંને માટે સંયુક્ત ઉપાય',
  },
  pa: {
    appTitle: 'ਵੈਦਿਕ ਅਤੇ ਕਾਲਡੀਅਨ ਅੰਕ ਜੋਤਿਸ਼',
    appSubtitle: 'ਮੋਬਾਈਲ ਅੰਕ ਜੋਤਿਸ਼ • ਕੁੰਡਲੀ ਮਿਲਾਨ • ਦਸ਼ਾ ਅਤੇ ਵੈਦਿਕ ਮੰਤਰ',
    tab_dashboard: 'ਵੈਦਿਕ ਡੈਸ਼ਬੋਰਡ',
    tab_name: 'ਨਾਮ ਅਤੇ ਕਾਰੋਬਾਰ',
    tab_mobile: 'ਮੋਬਾਈਲ ਅੰਕ ਜੋਤਿਸ਼',
    tab_mantras: 'ਰੋਜ਼ਾਨਾ ਵੈਦਿਕ ਮੰਤਰ',
    tab_yoga: 'ਯੋਗ ਅਤੇ ਪ੍ਰਾਣਾਯਾਮ',
    tab_validator: 'ਅੰਕ ਜਾਂਚ',
    tab_calendar: 'ਮੁਹੂਰਤ ਪੰਚਾਂਗ',
    tab_weekly: 'ਰੋਜ਼ਾਨਾ ਅਤੇ ਹਫ਼ਤਾਵਾਰੀ ਭਵਿੱਖਫਲ',
    tab_compatibility: 'ਜੀਵਨ ਸਾਥੀ ਮਿਲਾਨ',
    tab_festivals: 'ਭਾਰਤੀ ਤਿਉਹਾਰ ਅਤੇ ਪੂਜਾ',
    tab_notifications: '6 ਰੋਜ਼ਾਨਾ ਅਲਰਟ ਅਤੇ ਵਟਸਐਪ',
    tab_profiles: 'ਸੇਵ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਪੋਰਟਲ',
    tab_transits: 'ਗ੍ਰਹਿ ਗੋਚਰ ਅਤੇ ਚੰਦਰਮਾ',
    tab_islamic: 'ਇਸਲਾਮਿਕ-ਵੈਦਿਕ ਉਪਾਅ',
    tab_ai: 'ਵੈਦਿਕ ਸਲਾਹਕਾਰ',
    groomRemedyLabel: 'ਲਾੜੇ ਲਈ ਉਪਾਅ',
    brideRemedyLabel: 'ਲਾੜੀ ਲਈ ਉਪਾਅ',
    bothRemedyLabel: 'ਦੋਵਾਂ ਲਈ ਸਾਂਝੇ ਉਪਾਅ',
  },
  bn: {
    appTitle: 'বৈদিক ও ক্যালডিয়ান সংখ্যাতত্ত্ব',
    appSubtitle: 'অ্যাডভান্স মোবাইল নিউমেরোলজি • কুণ্ডলী মিলন • দশা ও মন্ত্র',
    tab_dashboard: 'বৈদিক ড্যাশবোর্ড',
    tab_name: 'নাম ও পেশা সংশোধন',
    tab_mobile: 'মোবাইল সংখ্যাতত্ত্ব',
    tab_mantras: 'দৈনিক বৈদিক মন্ত্র',
    tab_yoga: 'যোগ ও প্রাণায়াম',
    tab_validator: 'সংখ্যা যাচাই',
    tab_calendar: 'শুভ মুহূর্ত পঞ্জিকা',
    tab_weekly: 'দৈনিক ও সাপ্তাহিক রাশিফল',
    tab_compatibility: 'যোটক বিচার ও চক্র',
    tab_festivals: 'ভারতীয় উৎসব ও পূজা',
    tab_notifications: '৬টি দৈনিক অ্যালার্ট ও হোয়াটসঅ্যাপ',
    tab_profiles: 'সংরক্ষিত প্রোফাইল ও পোর্টাল',
    tab_transits: 'গ্রহ গোচর ও তিথি',
    tab_islamic: 'ইসলামিক-বৈদিক প্রতিকার',
    tab_ai: 'বৈদিক জ্যোতিষ পরামর্শ',
    groomRemedyLabel: 'বরের করণীয় প্রতিকার',
    brideRemedyLabel: 'কনের করণীয় প্রতিকার',
    bothRemedyLabel: 'উভয়ের যৌথ প্রতিকার',
  },
  ta: {
    appTitle: 'வேத மற்றும் சால்டியன் எண் கணிதம்',
    appSubtitle: 'மொபைல் எண் கணிதம் • திருமண பொருத்தம் • தசா மற்றும் மந்திரங்கள்',
    tab_dashboard: 'வேத முகப்பு',
    tab_name: 'பெயர் & தொழில் திருத்தம்',
    tab_mobile: 'மொபைல் எண் கணிதம்',
    tab_mantras: 'தினசரி வேத மந்திரங்கள்',
    tab_yoga: 'யோகா & பிராணாயாமம்',
    tab_validator: 'எண் சரிபார்ப்பு',
    tab_calendar: 'முகூர்த்த பஞ்சாங்கம்',
    tab_weekly: 'தினசரி & வார ராசிபலன்',
    tab_compatibility: 'திருமண பொருத்தம்',
    tab_festivals: 'இந்திய பண்டிகைகள் & பூஜை',
    tab_notifications: '6 தினசரி அறிவிப்புகள் & வாட்ஸ்அப்',
    tab_profiles: 'சேமித்த சுயவிவரங்கள் & போர்டல்',
    tab_transits: 'கிரக பெயர்ச்சி & திதி',
    tab_islamic: 'இஸ்லாமிய-வேத பரிகாரங்கள்',
    tab_ai: 'வேத ஜோதிட ஆலோசகர்',
    groomRemedyLabel: 'மணமகன் செய்ய வேண்டிய பரிகாரம்',
    brideRemedyLabel: 'மணமகள் செய்ய வேண்டிய பரிகாரம்',
    bothRemedyLabel: 'இருவரும் செய்ய வேண்டிய பரிகாரம்',
  },
  te: {
    appTitle: 'వేద & చాల్డియన్ సంఖ్యాశాస్త్రం',
    appSubtitle: 'మొబైల్ న్యూమరాలజీ • వివాహ పొంతన • దశ మరియు వేద మంత్రాలు',
    tab_dashboard: 'వేద డ్యాష్‌బోర్డ్',
    tab_name: 'పేరు & వ్యాపార సవరణ',
    tab_mobile: 'మొబైల్ సంఖ్యాశాస్త్రం',
    tab_mantras: 'రోజువారీ వేద మంత్రాలు',
    tab_yoga: 'యోగా & ప్రాణాయామం',
    tab_validator: 'సంఖ్య ధృవీకరణ',
    tab_calendar: 'ముహూర్త పంచాంగం',
    tab_weekly: 'రోజువారీ & వార ఫలాలు',
    tab_compatibility: 'వధూవరుల గుణ మిళనం',
    tab_festivals: 'భారతీయ పండుగలు & పూజ',
    tab_notifications: '6 రోజువారీ అలర్ట్‌లు & వాట్సాప్',
    tab_profiles: 'సేవ్ చేసిన ప్రొఫైల్స్ & పోర్టల్',
    tab_transits: 'గ్రహ సంచారం & తిథి',
    tab_islamic: 'ఇస్లామిక్-వేద పరిహారాలు',
    tab_ai: 'వేద జ్యోతిష్య సలహా',
    groomRemedyLabel: 'వరుడు చేయవలసిన పరిహారం',
    brideRemedyLabel: 'వధువు చేయవలసిన పరిహారం',
    bothRemedyLabel: 'ఇద్దరూ కలిసి చేయవలసిన పరిహారం',
  },
  kn: {
    appTitle: 'ವೇದ ಮತ್ತು ಚಾಲ್ಡಿಯನ್ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ',
    appSubtitle: 'ಮೊಬೈಲ್ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ • ಕುಂಡಲಿ ಮಿಲನ • ದಶಾ ಮತ್ತು ವೇದ ಮಂತ್ರಗಳು',
    tab_dashboard: 'ವೇದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    tab_name: 'ಹೆಸರು ಮತ್ತು ವೃತ್ತಿ',
    tab_mobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ',
    tab_mantras: 'ದೈನಂದಿನ ವೇದ ಮಂತ್ರಗಳು',
    tab_yoga: 'ಯೋಗ ಮತ್ತು ಪ್ರಾಣಾಯಾಮ',
    tab_validator: 'ಸಂಖ್ಯೆ ಪರಿಶೀಲನೆ',
    tab_calendar: 'ಮುಹೂರ್ತ ಪಂಚಾಂಗ',
    tab_weekly: 'ದೈನಂದಿನ ಮತ್ತು ವಾರ ಭವಿಷ್ಯ',
    tab_compatibility: 'ವಧು-ವರ ಗುಣ ಮಿಲನ',
    tab_festivals: 'ಭಾರತೀಯ ಹಬ್ಬಗಳು ಮತ್ತು ಪೂಜೆ',
    tab_notifications: '6 ದೈನಂದಿನ ಅಲರ್ಟ್ ಮತ್ತು ವಾಟ್ಸಾಪ್',
    tab_profiles: 'ಉಳಿಸಿದ ಪ್ರೊಫೈಲ್‌ಗಳು ಮತ್ತು ಪೋರ್ಟಲ್',
    tab_transits: 'ಗ್ರಹ ಗೋಚಾರ ಮತ್ತು ತಿಥಿ',
    tab_islamic: 'ಇಸ್ಲಾಮಿಕ್-ವೇದ ಪರಿಹಾರಗಳು',
    tab_ai: 'ವೇದ ಜ್ಯೋತಿಷ್ಯ ಸಲಹೆ',
    groomRemedyLabel: 'ವರನಿಗೆ ಪರಿಹಾರ',
    brideRemedyLabel: 'ವಧುವಿಗೆ ಪರಿಹಾರ',
    bothRemedyLabel: 'ಇಬ್ಬರಿಗೂ ಜಂಟಿ ಪರಿಹಾರ',
  },
  ml: {
    appTitle: 'വേദ & ചാൽഡിയൻ സംഖ്യാശാസ്ത്രം',
    appSubtitle: 'മൊബൈൽ ന്യൂമറോളജി • വിവാഹ പൊരുത്തം • ദശയും മന്ത്രങ്ങളും',
    tab_dashboard: 'വേദ ഡാഷ്ബോർഡ്',
    tab_name: 'പേര് & തൊഴിൽ',
    tab_mobile: 'മൊബൈൽ സംഖ്യാശാസ്ത്രം',
    tab_mantras: 'ദൈനംദിന വേദ മന്ത്രങ്ങൾ',
    tab_yoga: 'യോഗയും പ്രാണായാമവും',
    tab_validator: 'സംഖ്യ പരിശോധന',
    tab_calendar: 'മുഹൂർത്ത പഞ്ചാംഗം',
    tab_weekly: 'ദൈനംദിന & വാരഫലം',
    tab_compatibility: 'വിവാഹ പൊരുത്തം',
    tab_festivals: 'ഇന്ത്യൻ ഉത്സവങ്ങളും പൂജയും',
    tab_notifications: '6 പ്രതിദിന അലേർട്ടുകളും വാട്ട്‌സ്ആപ്പും',
    tab_profiles: 'സേവ് ചെയ്ത പ്രൊഫൈലുകളും പോർട്ടലും',
    tab_transits: 'ഗ്രഹ സംക്രമണവും തിഥിയും',
    tab_islamic: 'ഇസ്ലാമിക്-വേദ പരിഹാരങ്ങൾ',
    tab_ai: 'വേദ ജ്യോതിഷ ഉപദേശം',
    groomRemedyLabel: 'വരൻ ചെയ്യേണ്ട പരിഹാരം',
    brideRemedyLabel: 'വധു ചെയ്യേണ്ട പരിഹാരം',
    bothRemedyLabel: 'ഇരുവരും ചെയ്യേണ്ട പരിഹാരം',
  },
  or: {
    appTitle: 'ବୈଦିକ ଏବଂ କାଲ୍ଡିଆନ୍ ସଂଖ୍ୟା ଜ୍ୟୋତିଷ',
    appSubtitle: 'ମୋବାଇଲ୍ ନ୍ୟୁମେରୋଲୋଜି • କୁଣ୍ଡଳୀ ମିଳନ • ଦଶା ଏବଂ ବୈଦିକ ମନ୍ତ୍ର',
    tab_dashboard: 'ବୈଦିକ ଡ୍ୟାସବୋର୍ଡ',
    tab_name: 'ନାମ ଏବଂ ବ୍ୟବସାୟ',
    tab_mobile: 'ମୋବାଇଲ୍ ସଂଖ୍ୟା ଜ୍ୟୋତିଷ',
    tab_mantras: 'ଦୈନିକ ବୈଦିକ ମନ୍ତ୍ର',
    tab_yoga: 'ଯୋଗ ଏବଂ ପ୍ରାଣାୟାମ',
    tab_validator: 'ସଂଖ୍ୟା ଯାଞ୍ଚ',
    tab_calendar: 'ମୁହୂର୍ତ୍ତ ପଞ୍ଚାଙ୍ଗ',
    tab_weekly: 'ଦୈନିକ ଓ ସାପ୍ତାହିକ ରାଶିଫଳ',
    tab_compatibility: 'ବର-କନ୍ୟା ମିଳନ',
    tab_festivals: 'ଭାରତୀୟ ପର୍ବ ଓ ପୂଜା',
    tab_notifications: '୬ ଦୈନିକ ଆଲର୍ଟ ଓ ହ୍ୱାଟ୍ସଆପ୍',
    tab_profiles: 'ସେଭ୍ ପ୍ରୋଫାଇଲ୍ ଓ ପୋର୍ଟାଲ୍',
    tab_transits: 'ଗ୍ରହ ଗୋଚର ଓ ତିଥି',
    tab_islamic: 'ଇସଲାମିକ୍-ବୈଦିକ ପ୍ରତିକାର',
    tab_ai: 'ବୈଦିକ ପରାମର୍ଶ',
    groomRemedyLabel: 'ବର ପାଇଁ ପ୍ରତିକାର',
    brideRemedyLabel: 'କନ୍ୟା ପାଇଁ ପ୍ରତିକାର',
    bothRemedyLabel: 'ଉଭୟଙ୍କ ପାଇଁ ମିଳିତ ପ୍ରତିକାର',
  },
  as: {
    appTitle: 'বৈদিক আৰু কেলডিয়ান সংখ্যাতত্ত্ব',
    appSubtitle: 'মোবাইল সংখ্যাতত্ত্ব • কুণ্ডলী মিলন • দশা আৰু বৈদিক মন্ত্ৰ',
    tab_dashboard: 'বৈদিক ডেশ্ববৰ্ড',
    tab_name: 'নাম আৰু ব্যৱসায়',
    tab_mobile: 'মোবাইল সংখ্যাতত্ত্ব',
    tab_mantras: 'দৈনিক বৈদিক মন্ত্ৰ',
    tab_yoga: 'যোগ আৰু প্ৰাণায়াম',
    tab_validator: 'সংখ্যা পৰীক্ষা',
    tab_calendar: 'মুহূৰ্ত পঞ্জিকা',
    tab_weekly: 'দৈনিক আৰু সাপ্তাহিক ৰাশিফল',
    tab_compatibility: 'যোৰা মিলন',
    tab_festivals: 'ভাৰতীয় উৎসৱ আৰু পূজা',
    tab_notifications: '৬টা দৈনিক এলাৰ্ট আৰু হোৱাটছএপ',
    tab_profiles: 'সংৰক্ষিত প্ৰফাইল আৰু প’ৰ্টেল',
    tab_transits: 'গ্ৰহ গোচৰ আৰু তিথি',
    tab_islamic: 'ইছলামিক-বৈদিক প্ৰতিকাৰ',
    tab_ai: 'বৈদিক জ্যোতিষ পৰামৰ্শ',
    groomRemedyLabel: 'দৰাৰ বাবে প্ৰতিকাৰ',
    brideRemedyLabel: 'কইনাৰ বাবে প্ৰতিকাৰ',
    bothRemedyLabel: 'উভয়ৰে বাবে যৌথ প্ৰতিকাৰ',
  },
};

/**
 * Exact UI & Report Phrase Map for Standard Hindi ('hi') — 100% orthographically verified
 */
const HINDI_EXACT_MAP: Record<string, string> = {
  'VEDIC & CHALDEAN SPIRITUAL DASHBOARD': 'वैदिक एवं काल्डियन आध्यात्मिक डैशबोर्ड',
  'ADVANCE NAME & CAREER HARMONY': 'एडवांस नाम एवं करियर सामंजस्य विश्लेषण',
  'ADVANCE MOBILE NUMEROLOGY AUDIT': 'एडवांस मोबाइल अंक ज्योतिष ऑडिट',
  'DAILY VEDIC MANTRAS & SOUND REMEDIES': 'दैनिक वैदिक मंत्र एवं ध्वनि आवृत्ति उपाय',
  'VEDIC YOGA, PRANAYAMA & 7-DAY SADHANA PLANNER': 'वैदिक योग, प्राणायाम एवं 7-दिवसीय साधना योजना',
  'PARTNER MILAN & 7-CHAKRA CHALLENGES': 'वर-वधू अष्टकूट मिलान एवं 7-चक्र निदान',
  'ALL-INDIA FESTIVALS & PUJA MUHURAT (2026–2030)': 'अखिल भारतीय पर्व एवं पूजा शुभ मुहूर्त (2026–2030)',
  '6 DAILY GOOD/BAD TIME & WHATSAPP ALERTS': '6 दैनिक शुभ/अशुभ समय एवं व्हाट्सएप अलर्ट',
  'CLIENT, HEALER & MASTER ADMIN PORTAL': 'क्लाइंट, हीलर एवं मास्टर एडमिन पोर्टल',
  'DAILY & WEEKLY FORECAST': 'दैनिक एवं साप्ताहिक राशिफल व भविष्यफल',
  'PLANETARY TRANSITS & MOON PHASES': 'ग्रह गोचर एवं 12-माह चंद्र कला पंचांग',
  'PERSONALIZED COSMIC CALENDAR & 12-MONTH MUHURATS': 'व्यक्तिगत पंचांग एवं आगामी 12-माह शुभ मुहूर्त',
  'ISLAMIC-VEDIC REMEDIES, ILM-UL-ADAD & DAILY DHIKR': 'इस्लामिक-वैदिक रूहानी उपाय, इल्म-उल-अदद एवं दैनिक ज़िक्र',
  'AUSPICIOUS NUMERIC VALIDATOR': 'शुभ अंक सत्यापन (वाहन, बैंक खाता, मकान एवं मूल्य)',
  'VEDIC AI ORACLE': 'वैदिक ज्योतिष एवं काल्डियन परामर्श',
  'SPIRITUAL & NUMEROLOGY REPORT': 'आध्यात्मिक एवं वैदिक अंक ज्योतिष रिपोर्ट',
  'Good/Bad Time (Now):': 'शुभ/अशुभ समय (अभी):',
  'GOOD TIME': 'शुभ समय',
  'BAD TIME': 'अशुभ समय',
  'Rahu Kaal (Live):': 'राहु काल (लाइव):',
  'Alerts ON': 'अलर्ट चालू',
  'Enable Alerts': 'अलर्ट चालू करें',
  'Saved Profiles & Portals': 'सेव प्रोफाइल एवं पोर्टल',
  'Switch Login': 'लॉगिन बदलें',
  'Switch Login / Register Account': 'लॉगिन बदलें / नया पंजीकरण',
  'Return to Saved Profiles & Portals': 'सेव प्रोफाइल एवं पोर्टल पर वापस जाएं',
  'Saved Profiles': 'सेव प्रोफाइल',
  'Edit Profile': 'प्रोफाइल संपादित करें',
  'Delete Profile': 'प्रोफाइल हटाएं',
  'Print Preview': 'प्रिंट प्रीव्यू',
  'Download PDF Report': 'पीडीएफ रिपोर्ट डाउनलोड करें',
  'Download PDF': 'पीडीएफ डाउनलोड करें',
  'Print Report': 'रिपोर्ट प्रिंट करें',
  'Print PDF': 'प्रिंट करें',
  'Share Report': 'रिपोर्ट शेयर करें',
  'Share': 'शेयर करें',
  'WhatsApp Full Report': 'व्हाट्सएप पूर्ण रिपोर्ट',
  'Direct WhatsApp': 'व्हाट्सएप पर भेजें',
  'WhatsApp Link': 'व्हाट्सएप लिंक भेजें',
  'Copy Link': 'लिंक कॉपी करें',
  'Copy Direct Download Link': 'डायरेक्ट डाउनलोड लिंक कॉपी करें',
  'Select All 10 Modules': 'सभी 10 मॉड्यूल चुनें',
  'Core Modules Only': 'मुख्य मॉड्यूल चुनें',
  'Center Watermark': 'सेंटर वॉटरमार्क',
  'Watermark ON': 'वॉटरमार्क चालू',
  'Watermark OFF': 'वॉटरमार्क बंद',
  'MISSING': 'अनुपस्थित',
  'SHUBH MILAN': 'शुभ मिलान',
  'REMEDY GUIDED': 'उपाय निर्देशित',
  'SCAN QR FOR': 'क्यूआर स्कैन करें',
  'MOBILE PDF': 'मोबाइल पीडीएफ',
};

/**
 * Multi-Word Phrase, Mantra & Sentence Pattern Replacements for Standard Pure Hindi ('hi')
 */
const HINDI_PHRASE_PAIRS: [RegExp, string][] = [
  // Authentic Sanskrit Navagraha Beej Mantras & Vedic Mantras
  [/Om Hram Hreem Hroum Sah Suryaya Namah/gi, 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः'],
  [/Om Shram Shreem Shroum Sah Chandraya Namah/gi, 'ॐ श्रां श्रीं श्रौं सः चंद्राय नमः'],
  [/Om Gram Greem Groum Sah Gurave Namah/gi, 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः'],
  [/Om Bhram Bhreem Bhroum Sah Rahave Namah/gi, 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः'],
  [/Om Bram Breem Broum Sah Budhaya Namah/gi, 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः'],
  [/Om Dram Dreem Droum Sah Shukraya Namah/gi, 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः'],
  [/Om Sram Sreem Sroum Sah Ketave Namah/gi, 'ॐ स्रां स्रीं स्रौं सः केतवे नमः'],
  [/Om Pram Preem Proum Sah Shanaischaraya Namah/gi, 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः'],
  [/Om Kram Kreem Kroum Sah Bhaumaya Namah/gi, 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः'],
  [/Om Som Somaya Namah/gi, 'ॐ सों सोमाय नमः'],
  [/Om Bum Budhaya Namah/gi, 'ॐ बुं बुधाय नमः'],
  [/Om Namo Bhagavate Vasudevaya/gi, 'ॐ नमो भगवते वासुदेवाय'],
  [/Om Namah Shivaya/gi, 'ॐ नमः शिवाय'],
  [/Om Gan Ganapataye Namah/gi, 'ॐ गं गणपतये नमः'],
  [/Om Dum Durgayei Namaha?/gi, 'ॐ दुं दुर्गायै नमः'],
  [/Om Shreem Hreem Kleem Mahalakshmyai Namah/gi, 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः'],
  [/Om Sarve Bhavantu Sukhinah,?\s*Sarve Santu Niramayah/gi, 'ॐ सर्वे भवन्तु सुखिनः, सर्वे सन्तु निरामयाः'],
  [/Tathastu Divya Jyoti Sada Sahayate/gi, 'तथास्तु दिव्य ज्योति सदा सहायते'],
  [/Aditya Hridaya Stotra/gi, 'आदित्य हृदय स्तोत्र'],
  [/Vishnu Sahasranama/gi, 'विष्णु सहस्रनाम'],
  [/Hanuman Chalisa/gi, 'हनुमान चालीसा'],
  [/Satyanarayan Puja/gi, 'सत्यनारायण पूजा'],
  [/Sri Suktam/gi, 'श्री सूक्तम'],
  [/Shree Suktam/gi, 'श्री सूक्तम'],
  [/Dasaratha Shani Stotra/gi, 'दशरथ कृत शनि स्तोत्र'],
  [/Durga Argala Stotra/gi, 'दुर्गा अर्गला स्तोत्र'],
  [/Ganapati Atharvashirsha/gi, 'गणपति अथर्वशीर्ष'],
  [/Mahalakshmi Ashtakam/gi, 'महालक्ष्मी अष्टकम'],
  [/Maha Mrityunjaya Mantra/gi, 'महामृत्युंजय मंत्र'],
  [/Bhagavad Gita Adhyaya/gi, 'श्रीमद्भगवद्गीता अध्याय'],

  // UI & Report Module Headers
  [/Detailed A4 Dossier\s*\((\d+)\s*Pages?\)/gi, 'विस्तृत A4 वैदिक रिपोर्ट ($1 पृष्ठ)'],
  [/Active Report Modules\s*\((\d+)\s*Pages?\)/gi, 'सक्रिय रिपोर्ट मॉड्यूल ($1 पृष्ठ)'],
  [/\(Opt-In\s*•\s*(\d+)\s*Pages?\)/gi, '(वैकल्पिक • $1 पृष्ठ)'],
  [/\((\d+)\s*Pages?\)/gi, '($1 पृष्ठ)'],
  [/Page\s+(\d+)\s+of\s+(\d+)/gi, 'पृष्ठ $1 / $2'],
  [/PAGE\s+(\d+)\/(\d+)/gi, 'पृष्ठ $1/$2'],
  [/PG\s+(\d+)\/(\d+)/gi, 'पृष्ठ $1/$2'],
  [/CHAPTER\s+(\d+)/gi, 'अध्याय $1'],
  [/\(CONTINUED\)/gi, '(जारी)'],
  [/Month\s+(\d+)\s*\(([^)]+)\)/gi, 'माह $1 ($2)'],
  [/Select Report Modules to Include in Preview, Print, PDF Download & WhatsApp:?/gi, 'प्रीव्यू, प्रिंट, पीडीएफ डाउनलोड एवं व्हाट्सएप में शामिल करने हेतु रिपोर्ट मॉड्यूल चुनें:'],
  [/1\.\s*Name,\s*Career,\s*Ratna\s*&\s*Validator/gi, '1. नाम, करियर, रत्न शास्त्र एवं अंक सत्यापन'],
  [/2\.\s*Advance Mobile,\s*Triad,\s*3×3 Grid\s*&\s*Dasha/gi, '2. एडवांस मोबाइल, त्रिकोण सामंजस्य, 3×3 ग्रिड एवं महादशा'],
  [/3\.\s*12M Monthly\s*&\s*7-Day Weekly Forecast/gi, '3. 12-माह मासिक एवं 7-दिवसीय साप्ताहिक भविष्यफल'],
  [/4\.\s*Best Upcoming Muhurat Timings/gi, '4. आगामी 12-माह सर्वश्रेष्ठ शुभ मुहूर्त पंचांग'],
  [/5\.\s*Planetary Transits\s*&\s*12M Moon Phases/gi, '5. ग्रह गोचर एवं 12-माह पूर्णिमा/अमावस्या/एकादशी पंचांग'],
  [/6\.\s*Daily Vedic Mantras\s*&\s*Navagraha/gi, '6. दैनिक वैदिक मंत्र एवं नवग्रह ध्वनि आवृत्ति'],
  [/7\.\s*Vedic Yoga,\s*Pranayama\s*&\s*7-Day Planner/gi, '7. वैदिक योग, प्राणायाम एवं 7-दिवसीय साधना योजना'],
  [/8\.\s*Complete Partner Milan\s*&\s*7-Chakras/gi, '8. संपूर्ण वर-वधू अष्टकूट मिलान एवं 7-चक्र निदान'],
  [/9\.\s*Next 12M All-India Festivals/gi, '9. आगामी 12-माह अखिल भारतीय पर्व एवं पूजा मुहूर्त'],
  [/10\.\s*Islamic-Vedic Remedies/gi, '10. इस्लामिक-वैदिक रूहानी उपाय एवं इल्म-उल-अदद'],
  [/Birth Chart,\s*Lo-Shu 8 Planes,\s*Name Spellings,\s*All Career Sectors,\s*5-Pillar Ratna\s*&\s*Universal Validator/gi, 'जन्म कुंडली, लो-शू 8 राजयोग, नाम स्पेलिंग सुधार, करियर क्षेत्र, 5-स्तंभ रत्न एवं अंक सत्यापन'],
  [/All 9 Pairs,\s*Combined Name\+DOB\+Mobile Triad,\s*Virtual SIMs,\s*3×3 Grid,\s*Present\/Missing Remedies\s*&\s*10-Cycle Dasha/gi, 'सभी 9 मोबाइल अंक युग्म, नाम+जन्मतिथि+मोबाइल त्रिकोण, शुभ सिम संयोजन, 3×3 ग्रिड उपाय एवं 10-दशा चक्र'],
  [/Per-Day Career\/Love\/Vitality Chants\s*&\s*12-Month Summary/gi, 'प्रतिदिन करियर/प्रेम/स्वास्थ्य मंत्र एवं 12-माह मासिक भविष्यफल सारांश'],
  [/All 12 Life Events with Nakshatra Yoga,\s*Rahu Kaal,\s*Choghadiya,\s*Backup Dates\s*&\s*Mantras/gi, 'सभी 12 शुभ संस्कारों हेतु नक्षत्र योग, राहु काल, चौघड़िया, वैकल्पिक तिथियां एवं मंत्र'],
  [/All 5 Gochar Transits\s*&\s*12M Purnima\/Amavasya\/Ekadashi Table with Parallel Remedies/gi, 'सभी 5 प्रमुख ग्रह गोचर एवं 12-माह पूर्णिमा/अमावस्या/एकादशी तालिका व समानांतर उपाय'],
  [/All 4 Daily Time-Phase Mantras\s*\(Mala,\s*Mudra,\s*Meaning\)\s*&\s*9-Planet Navagraha Table/gi, 'सभी 4 दैनिक प्रहर मंत्र (माला, मुद्रा, भावार्थ) एवं 9-ग्रह नवग्रह तालिका'],
  [/Daily Vedic Asanas with Visual Diagrams,\s*Pranayama Breathing,\s*Health Remedies\s*&\s*7-Day Weekly Planner/gi, 'सचित्र दैनिक योगासन, प्राणायाम श्वास विधि, स्वास्थ्य उपाय एवं 7-दिवसीय साप्ताहिक योजना'],
  [/Groom\/Bride Natal Table,\s*8-Koota Ashtakoot Chart\s*&\s*All 7 Chakras Complete Diagnostics\/Remedies/gi, 'वर/वधू जन्म तालिका, 8-कूट अष्टकूट गुण मिलान एवं सभी 7 चक्रों का संपूर्ण निदान व उपाय'],
  [/All 16 Festivals with Score %,\s*4 Puja Windows\s*\(Siddha\/Punya\/Bhadra\/Varjya\),\s*Diya\s*&\s*Aura Remedies/gi, 'सभी 16 प्रमुख भारतीय पर्व, 4 पूजा मुहूर्त (सिद्ध/पुण्य/भद्रा/वर्ज्य), दीपक एवं आभामंडल उपाय'],
  [/3 Personal Asma-ul-Husna Cards,\s*All 5 Quranic Surahs,\s*7-Day Schedule\s*&\s*1-to-9 Adad Reference Table/gi, '3 व्यक्तिगत अस्मा-उल-हुस्ना कार्ड, 5 कुरानिक सूरह, 7-दिवसीय वज़ीफ़ा एवं 1-से-9 अदद तालिका'],
  [/Name,\s*Career\s*&\s*Ratna/gi, 'नाम, करियर एवं रत्न'],
  [/Mobile,\s*Grid\s*&\s*Dasha/gi, 'मोबाइल, ग्रिड एवं दशा'],
  [/12M\s*&\s*7-Day Forecast/gi, '12-माह एवं साप्ताहिक फल'],
  [/12M Best Muhurats/gi, '12-माह शुभ मुहूर्त'],
  [/12M Transits\s*&\s*Moon/gi, 'ग्रह गोचर एवं चंद्र कला'],
  [/Vedic Mantras/gi, 'वैदिक मंत्र'],
  [/Yoga\s*&\s*Pranayama/gi, 'योग एवं प्राणायाम'],
  [/Partner Milan\s*\(Opt-In\)/gi, 'कुंडली मिलान (वैकल्पिक)'],
  [/12M Festivals/gi, '12-माह भारतीय पर्व'],
  [/Islamic Remedies/gi, 'इस्लामिक-वैदिक उपाय'],

  // Planets, Deities, Gemstones & Rashis
  [/Lord Shiva\s*\/\s*Gayatri/gi, 'भगवान शिव / मां गायत्री'],
  [/Goddess Parvati\s*\/\s*Lord Shiva/gi, 'मां पार्वती / भगवान शिव'],
  [/Lord Brahma\s*\/\s*Brihaspati\s*\/\s*Lord Vishnu/gi, 'भगवान ब्रह्मा / बृहस्पति / भगवान विष्णु'],
  [/Lord Bhairava\s*\/\s*Goddess Durga/gi, 'भगवान भैरव / मां दुर्गा'],
  [/Lord Vishnu\s*\/\s*Lord Ganesha/gi, 'भगवान विष्णु / भगवान गणेश'],
  [/Goddess Mahalakshmi/gi, 'मां महालक्ष्मी'],
  [/Lord Ganesha\s*\/\s*Matsya Avatar/gi, 'भगवान गणेश / मत्स्य अवतार'],
  [/Lord Hanuman\s*\/\s*Lord Shani/gi, 'भगवान हनुमान / शनि देव'],
  [/Lord Kartikeya\s*\/\s*Lord Hanuman/gi, 'भगवान कार्तिकेय / भगवान हनुमान'],
  [/Ruby\s*\(Manikya\)/gi, 'माणिक्य (रूबी)'],
  [/Natural Pearl\s*\(Moti\)/gi, 'प्राकृतिक मोती'],
  [/Yellow Sapphire\s*\(Pukhraj\)/gi, 'पुखराज'],
  [/Hessonite Garnet\s*\(Gomed\)/gi, 'गोमेद'],
  [/Emerald\s*\(Panna\)/gi, 'पन्ना'],
  [/Diamond\s*\/\s*White Zircon\s*\(Heera\)/gi, 'हीरा / सफेद जरकन'],
  [/Cat's Eye\s*\(Vaidurya\)/gi, 'लहसुनिया (वैदूर्य)'],
  [/Blue Sapphire\s*\(Neelam\)\s*\/\s*Amethyst/gi, 'नीलम / जामुनिया'],
  [/Red Coral\s*\(Moonga\)/gi, 'लाल मूंगा'],
  [/Sun\s*\(Surya\)/gi, 'सूर्य'],
  [/Surya\s*\(Sun\)/gi, 'सूर्य'],
  [/Moon\s*\(Chandra\)/gi, 'चंद्र'],
  [/Chandra\s*\(Moon\)/gi, 'चंद्र'],
  [/Jupiter\s*\(Guru\)/gi, 'बृहस्पति (गुरु)'],
  [/Guru\s*\(Jupiter\)/gi, 'गुरु (बृहस्पति)'],
  [/Guru\s*\/\s*Brihaspati/gi, 'गुरु / बृहस्पति'],
  [/Mangal\s*\/\s*Angaraka/gi, 'मंगल / अंगारक'],
  [/Rahu\s*\(Uranus\)/gi, 'राहु'],
  [/Rahu\s*\(North Node\)/gi, 'राहु'],
  [/Mercury\s*\(Budha?\)/gi, 'बुध'],
  [/Budha?\s*\(Mercury\)/gi, 'बुध'],
  [/Venus\s*\(Shukra\)/gi, 'शुक्र'],
  [/Shukra\s*\(Venus\)/gi, 'शुक्र'],
  [/Ketu\s*\(Neptune\)/gi, 'केतु'],
  [/Ketu\s*\(South Node\)/gi, 'केतु'],
  [/Saturn\s*\(Shani\)/gi, 'शनि'],
  [/Shani\s*\(Saturn\)/gi, 'शनि'],
  [/Shani Dev/gi, 'शनि देव'],
  [/Mars\s*\(Mangal\)/gi, 'मंगल'],
  [/Mangal\s*\(Mars\)/gi, 'मंगल'],
  [/Mesha\s*\(Aries\)/gi, 'मेष राशि'],
  [/Vrishabha\s*\(Taurus\)/gi, 'वृषभ राशि'],
  [/Mithuna\s*\(Gemini\)/gi, 'मिथुन राशि'],
  [/Karka\s*\(Cancer\)/gi, 'कर्क राशि'],
  [/Simha\s*\(Leo\)/gi, 'सिंह राशि'],
  [/Kanya\s*\(Virgo\)/gi, 'कन्या राशि'],
  [/Tula\s*\(Libra\)/gi, 'तुला राशि'],
  [/Vrishchika\s*\(Scorpio\)/gi, 'वृश्चिक राशि'],
  [/Dhanu\s*\(Sagittarius\)/gi, 'धनु राशि'],
  [/Makara\s*\(Capricorn\)/gi, 'मकर राशि'],
  [/Kumbha\s*\(Aquarius\)/gi, 'कुंभ राशि'],
  [/Meena\s*\(Pisces\)/gi, 'मीन राशि'],

  // PDF Chapter Titles, Section Headings & Table Headers
  [/EXECUTIVE VEDIC,\s*CHALDEAN\s*&\s*PRANIC MASTER BLUEPRINT/gi, 'वैदिक, काल्डियन एवं प्राणिक मुख्य जन्म विवरण'],
  [/EXECUTIVE BIRTH CHART,\s*PANCHANG\s*&\s*8 LO-SHU PLANES/gi, 'जन्म कुंडली, पंचांग एवं 8 लो-शू राजयोग विश्लेषण'],
  [/CLIENT BIRTH,\s*ASTROLOGY\s*&\s*SPIRITUAL REGISTRATION LEDGER/gi, 'साधक जन्म विवरण, ज्योतिष एवं आध्यात्मिक पंजीकरण तालिका'],
  [/DEEP THEORETICAL EXPLANATION OF MULANK,\s*BHAGYANK\s*&\s*DAILY PANCHANG RESONANCE/gi, 'मूलांक, भाग्यांक एवं दैनिक पंचांग सामंजस्य का विस्तृत शास्त्रीय विश्लेषण'],
  [/COMPLETE 8 LO-SHU PLANES\s*&\s*RAJ YOGA COMPLETION MATRIX\s*\(FROM DASHBOARD\)/gi, 'संपूर्ण 8 लो-शू योग एवं राजयोग पूर्णता तालिका'],
  [/CHALDEAN\s*&\s*PYTHAGOREAN NAME NUMEROLOGY AUDIT\s*&\s*3-WAY COMPARISON/gi, 'काल्डियन एवं पाइथागोरियन नाम अंक ज्योतिष परीक्षण व त्रि-स्तरीय तुलना'],
  [/LETTER-BY-LETTER NAME BREAKDOWN\s*&\s*3-WAY COMPARISON/gi, 'अक्षर-दर-अक्षर नाम ध्वनि विश्लेषण एवं नाम तुलना'],
  [/LETTER-BY-LETTER CHALDEAN\s*\(C\)\s*&\s*PYTHAGOREAN\s*\(P\)\s*ACOUSTIC FREQUENCY CELL MATRIX:?/gi, 'अक्षर-दर-अक्षर काल्डियन (C) एवं पाइथागोरियन (P) ध्वनि आवृत्ति तालिका:'],
  [/PERFECT NAME FREQUENCY RESULT\s*[-—]\s*NO SPELLING SUGGESTION REQUIRED/gi, 'उत्तम नाम ध्वनि आवृत्ति परिणाम — स्पेलिंग परिवर्तन की आवश्यकता नहीं'],
  [/3-WAY NAME COMPARISON:\s*REAL NAME VS SELECTED NAME A\s*&\s*SELECTED NAME B/gi, 'त्रि-स्तरीय नाम तुलना: मूल नाम बनाम चयनित नाम A एवं चयनित नाम B'],
  [/COMPLETE HARMONIZED NAME SPELLING SUGGESTIONS\s*&\s*41-DAY ACTIVATION PROTOCOL/gi, 'संपूर्ण शुभ नाम स्पेलिंग सुझाव एवं 41-दिवसीय सक्रियण विधि'],
  [/COMPLETE CAREER,\s*BUSINESS\s*&\s*6-PILLAR AURA REMEDIES/gi, 'संपूर्ण करियर, व्यापार एवं 6-स्तंभ आभामंडल उपाय'],
  [/COMPLETE CAREER,\s*BUSINESS\s*&\s*6-PILLAR REMEDIES/gi, 'संपूर्ण करियर, व्यापार एवं 6-स्तंभ उपाय'],
  [/IDEAL PROFESSIONS,\s*ALL 4 SUPREME BUSINESSES\s*&\s*ALL 4 SUPPORTIVE BUSINESS SECTORS/gi, 'आदर्श व्यवसाय, 4 सर्वोच्च व्यापार एवं 4 सहायक व्यापारिक क्षेत्र'],
  [/SACRED 3x3 VEDIC LO-SHU SQUARE MATRIX THEORY/gi, 'पवित्र 3x3 वैदिक लो-शू वर्ग यंत्र सिद्धांत'],
  [/PERSONALIZED VEDIC\s*&\s*CHALDEAN NUMEROLOGY REPORT/gi, 'व्यक्तिगत वैदिक एवं काल्डियन अंक ज्योतिष महा-रिपोर्ट'],
  [/MASTER SPIRITUAL DOSSIER/gi, 'दिव्य आध्यात्मिक एवं ज्योतिषीय महा-रिपोर्ट'],
  [/SACRED COSMIC BLESSING,\s*GRATITUDE TO THE UNIVERSE\s*&\s*TATHASTU FAMILY WELCOME/gi, 'दिव्य ब्रह्मांडीय आशीर्वाद, कृतज्ञता एवं तथास्तु परिवार में आपका स्वागत'],
  [/Thank You for Being a Cherished Part of the TATHASTU Family\s*[-—]\s*Where Ancient Wisdom Meets Divine Cosmic Light!/gi, 'तथास्तु परिवार का अनमोल हिस्सा बनने के लिए हार्दिक धन्यवाद — जहां प्राचीन वैदिक ज्ञान और दिव्य ज्योति का संगम होता है!'],
  [/Complete Vedic Numerology Maha Dasha Timeline\s*[-—]\s*Starting from Present Active Cycle/gi, 'संपूर्ण वैदिक अंक ज्योतिष महादशा कालचक्र — वर्तमान सक्रिय दशा से प्रारंभ'],
  [/Major Planetary Transits\s*\(Exact Gochar Start\s*&\s*End Dates\s*&\s*Times\)/gi, 'प्रमुख ग्रह गोचर (सटीक गोचर प्रारंभ एवं समाप्ति तिथि व समय)'],
  [/12-Month Lunar Phase Calendar\s*\(Purnima,\s*Amavasya\s*&\s*Ekadashi\)/gi, '12-माह चंद्र कला पंचांग (पूर्णिमा, अमावस्या एवं एकादशी तिथि व उपाय)'],
  [/Ashtakoot Koota\s*\(Dimension\)/gi, 'अष्टकूट मिलान आयाम (कूट)'],
  [/8-Koota Ashtakoot Compatibility Table/gi, 'अष्टकूट (8-कूट / 36-गुण) वर-वधू मिलान तालिका'],
  [/TOTAL ASHTAKOOT GUNA MILAN SCORE/gi, 'कुल अष्टकूट गुण मिलान स्कोर'],
  [/Groom\s*&\s*Bride Natal Comparison/gi, 'वर एवं वधू जन्म कुंडली तुलनात्मक विवरण'],
  [/All 7 Chakras Complete Diagnostics\s*&\s*Remedies/gi, 'संपूर्ण 7-चक्र ऊर्जा निदान एवं उपचार उपाय'],
  [/5-Pillar Ratna Shastra\s*\(Gemstone\)\s*&\s*Up-Ratna Prescription/gi, '5-स्तंभ रत्न शास्त्र (महारत्न एवं उपरत्न) व रुद्राक्ष परामर्श'],
  [/Lo-Shu Grid\s*\(3x3 Sacred Square\)/gi, 'लो-शू ग्रिड (3x3 दिव्य अंक यंत्र)'],
  [/8 Lo-Shu Planes Analysis/gi, 'लो-शू ग्रिड के 8 योग एवं राजयोग विश्लेषण'],
  [/Chaldean Name Spelling Harmonization/gi, 'काल्डियन नाम स्पेलिंग सामंजस्य एवं सुधार'],
  [/Advance Mobile Number Audit/gi, 'एडवांस मोबाइल नंबर अंक ज्योतिष विश्लेषण'],
  [/Combined Name\s*\+\s*DOB\s*\+\s*Mobile Triad/gi, 'नाम + जन्मतिथि + मोबाइल नंबर त्रिकोण सामंजस्य'],
  [/Client Full Name\s*&\s*Gender/gi, 'साधक का पूरा नाम एवं लिंग'],
  [/Date\s*&\s*Time of Birth/gi, 'जन्म तिथि एवं जन्म समय'],
  [/Birth Place\s*&\s*Coordinates/gi, 'जन्म स्थान एवं अक्षांश-देशांतर'],
  [/Mobile Number\s*&\s*Triad/gi, 'मोबाइल नंबर एवं त्रिकोण'],
  [/Vedic Janma Rashi\s*&\s*Sun/gi, 'वैदिक जन्म राशि एवं सूर्य राशि'],
  [/Janma Nakshatra\s*&\s*Pada/gi, 'जन्म नक्षत्र एवं चरण'],
  [/Today Panchang\s*&\s*Hora/gi, 'आज का पंचांग एवं होरा'],
  [/Primary Chakra\s*&\s*Aura/gi, 'मुख्य चक्र एवं आभामंडल'],
  [/Spiritual Healer Name/gi, 'आध्यात्मिक हीलर का नाम'],
  [/Healer Contact\s*&\s*Details/gi, 'हीलर संपर्क एवं विवरण'],
  [/Psychic Number\s*\(Mulank\)/gi, 'मूलांक (जन्म अंक)'],
  [/Destiny Number\s*\(Bhagyank\)/gi, 'भाग्यांक (भाग्य अंक)'],
  [/Name Chaldean\s*&\s*Pythagorean/gi, 'नाम काल्डियन एवं पाइथागोरियन अंक'],
  [/Mobile\s*&\s*Combined Triad/gi, 'मोबाइल एवं संयुक्त त्रिकोण'],
  [/Vedic\s*\/\s*Numerology Pillar/gi, 'वैदिक / अंक ज्योतिष स्तंभ'],
  [/Client Record/gi, 'साधक विवरण'],
  [/Cosmic Parameter/gi, 'ज्योतिषीय मापदंड'],
  [/Calculated Vibration/gi, 'गणना परिणाम'],
  [/Female\s*\/\s*Bride/gi, 'महिला / वधू'],
  [/Male\s*\/\s*Groom/gi, 'पुरुष / वर'],
  [/Friendly Numbers/gi, 'मित्र अंक'],
  [/Enemy\/Avoid/gi, 'शत्रु / वर्जित अंक'],
  [/Lucky Days/gi, 'शुभ वार'],
  [/Lucky Numbers/gi, 'शुभ अंक'],
  [/Lucky Color/gi, 'शुभ रंग'],
  [/Core Traits/gi, 'प्रमुख गुण'],
  [/Beej Mantra/gi, 'बीज मंत्र'],
  [/Daily Affirmation/gi, 'दैनिक शुभ संकल्प'],
  [/Auspicious Windows/gi, 'शुभ चौघड़िया मुहूर्त'],
  [/Avoid Rahu Kaal/gi, 'राहु काल (वर्जित)'],
  [/ACTIVE IN PROFILE/gi, 'प्रोफाइल में सक्रिय'],
  [/ACTIVE IN CHART/gi, 'कुंडली में सक्रिय'],
  [/SUPREME PERFECT/gi, 'सर्वोच्च अनुकूल'],
  [/Top Priority/gi, 'प्रथम प्राथमिकता'],
  [/GOOD SUPPORTIVE/gi, 'उत्तम सहायक'],
  [/HOSTILE SECTOR/gi, 'प्रतिकूल क्षेत्र'],
  [/Strictly Avoid/gi, 'पूर्णतः वर्जित'],
  [/ACTIVE NOW\s*[-—]\s*AVOID/gi, 'अभी सक्रिय — शुभ कार्य वर्जित'],
  [/ACTIVE NOW/gi, 'वर्तमान में सक्रिय'],
  [/Safe Now/gi, 'अभी सुरक्षित (शुभ)'],
  [/North-East/gi, 'ईशान कोण (उत्तर-पूर्व)'],
  [/South-East/gi, 'आग्नेय कोण (दक्षिण-पूर्व)'],
  [/North-West/gi, 'वायव्य कोण (उत्तर-पश्चिम)'],
  [/South-West/gi, 'नैऋत्य कोण (दक्षिण-पश्चिम)'],
  [/Ring Finger/gi, 'अनामिका उंगली'],
  [/Middle Finger/gi, 'मध्यमा उंगली'],
  [/Index Finger/gi, 'तर्जनी उंगली'],
  [/Little Finger/gi, 'कनिष्ठिका उंगली'],
  [/Right Hand/gi, 'दाहिना हाथ'],
  [/Left Hand/gi, 'बायां हाथ'],
  [/Shukla Paksha/gi, 'शुक्ल पक्ष'],
  [/Krishna Paksha/gi, 'कृष्ण पक्ष'],
  [/Shukla Purnima/gi, 'शुक्ल पूर्णिमा'],
  [/Krishna Amavasya/gi, 'कृष्ण अमावस्या'],
  [/Shukla Ekadashi/gi, 'शुक्ल एकादशी'],
  [/Krishna Ekadashi/gi, 'कृष्ण एकादशी'],
  [/Rahu Kaal/gi, 'राहु काल'],
  [/Maha Dasha/gi, 'महादशा'],
  [/Mental Plane/gi, 'मानसिक योग'],
  [/Emotional Plane/gi, 'भावनात्मक योग'],
  [/Emotional\s*\/\s*Soul Plane/gi, 'भावनात्मक / आत्मा योग'],
  [/Practical\s*\/\s*Material Plane/gi, 'व्यावहारिक / भौतिक योग'],
  [/Soul Plane/gi, 'आत्मा योग'],
  [/Practical Plane/gi, 'व्यावहारिक योग'],
  [/Thought Plane/gi, 'विचार योग'],
  [/Will Plane/gi, 'इच्छाशक्ति योग'],
  [/Action Plane/gi, 'कर्म योग'],
  [/Golden Raj Yoga?/gi, 'स्वर्णिम राजयोग'],
  [/Golden Yoga?/gi, 'स्वर्णिम राजयोग'],
  [/Silver Raj Yoga?/gi, 'रजत राजयोग'],
  [/Silver Yoga?/gi, 'रजत राजयोग'],
  [/New Delhi,\s*India/gi, 'नई दिल्ली, भारत'],
  [/Uttar Pradesh,\s*India/gi, 'उत्तर प्रदेश, भारत'],
  [/Practice consistently for 43 days with devotion and positive sankalpa/gi, 'श्रद्धा एवं शुभ संकल्प के साथ 43 दिनों तक नियमित रूप से यह उपाय करें'],
  [/Prescribed by Healer/gi, 'आध्यात्मिक हीलर द्वारा निर्धारित'],
  [/Personal Guidance for/gi, 'व्यक्तिगत आध्यात्मिक मार्गदर्शन —'],
  [/Authorized By/gi, 'द्वारा प्रमाणित'],
];

/**
 * Comprehensive, 100% Orthographically Verified English-to-Hindi Dictionary (Zero Hyphens, Standard Devanagari)
 */
const HINDI_WORD_LEXICON: Record<string, string> = {
  // Astrological, Vedic & Numerological Core
  vedic: 'वैदिक',
  chaldean: 'काल्डियन',
  pythagorean: 'पाइथागोरियन',
  pyth: 'पाइथागोरियन',
  numerology: 'अंक ज्योतिष',
  astrology: 'ज्योतिष',
  astrological: 'ज्योतिषीय',
  numerological: 'अंक ज्योतिषीय',
  spiritual: 'आध्यात्मिक',
  spirituality: 'आध्यात्मिकता',
  cosmic: 'ब्रह्मांडीय',
  divine: 'दिव्य',
  sacred: 'पवित्र',
  blessing: 'आशीर्वाद',
  blessings: 'आशीर्वाद',
  gratitude: 'कृतज्ञता',
  universe: 'ब्रह्मांड',
  family: 'परिवार',
  welcome: 'स्वागत',
  mulank: 'मूलांक',
  bhagyank: 'भाग्यांक',
  namank: 'नामांक',
  kua: 'कुआ अंक',
  psychic: 'जन्म',
  destiny: 'भाग्य',
  driver: 'मूलांक स्वामी',
  conductor: 'भाग्यांक स्वामी',
  lifepath: 'जीवन पथ',
  root: 'मूलांक',
  compound: 'संयुक्त अंक',
  single: 'एकल',
  digit: 'अंक',
  digits: 'अंक',
  number: 'अंक',
  numbers: 'अंक',
  numeric: 'अंकीय',
  grid: 'ग्रिड',
  matrix: 'यंत्र तालिका',
  square: 'वर्ग',
  plane: 'योग स्तंभ',
  planes: 'योग स्तंभ',
  mental: 'मानसिक',
  emotional: 'भावनात्मक',
  soul: 'आत्मा',
  practical: 'व्यावहारिक',
  material: 'भौतिक',
  thought: 'विचार',
  will: 'इच्छाशक्ति',
  action: 'कर्म',
  actions: 'कर्म',
  golden: 'स्वर्णिम',
  silver: 'चांदी',
  missing: 'अनुपस्थित',
  present: 'उपस्थित',
  repeated: 'पुनरावृत्त',
  remedy: 'उपाय',
  remedies: 'उपाय',
  prescription: 'परामर्श',
  prescriptions: 'परामर्श',
  prescribed: 'निर्धारित',
  recommended: 'अनुशंसित',
  recommendation: 'परामर्श',
  recommendations: 'परामर्श',
  planet: 'ग्रह',
  planets: 'ग्रह',
  planetary: 'ग्रहीय',
  graha: 'ग्रह',
  grahas: 'ग्रह',
  navagraha: 'नवग्रह',
  navagrahas: 'नवग्रह',
  lord: 'स्वामी',
  ruler: 'अधिपति',
  ruling: 'स्वामी',
  deity: 'इष्ट देव',
  sun: 'सूर्य',
  surya: 'सूर्य',
  solar: 'सौर',
  moon: 'चंद्र',
  chandra: 'चंद्र',
  lunar: 'चंद्र',
  mars: 'मंगल',
  mangal: 'मंगल',
  angaraka: 'अंगारक',
  bhaumaya: 'भौमाय',
  mercury: 'बुध',
  budh: 'बुध',
  budha: 'बुध',
  jupiter: 'बृहस्पति',
  guru: 'गुरु',
  brihaspati: 'बृहस्पति',
  devaguru: 'देवगुरु',
  venus: 'शुक्र',
  shukra: 'शुक्र',
  venusian: 'शुक्र',
  saturn: 'शनि',
  shani: 'शनि',
  saturnian: 'शनि',
  rahu: 'राहु',
  ketu: 'केतु',
  uranus: 'राहु',
  neptune: 'केतु',
  rashi: 'राशि',
  rashis: 'राशियां',
  zodiac: 'राशि',
  sign: 'राशि',
  lagna: 'लग्न',
  ascendant: 'लग्न',
  mesha: 'मेष',
  aries: 'मेष',
  vrishabha: 'वृषभ',
  taurus: 'वृषभ',
  mithuna: 'मिथुन',
  gemini: 'मिथुन',
  karka: 'कर्क',
  cancer: 'कर्क',
  simha: 'सिंह',
  leo: 'सिंह',
  kanya: 'कन्या',
  virgo: 'कन्या',
  tula: 'तुला',
  libra: 'तुला',
  vrishchika: 'वृश्चिक',
  scorpio: 'वृश्चिक',
  dhanu: 'धनु',
  sagittarius: 'धनु',
  makara: 'मकर',
  capricorn: 'मकर',
  kumbha: 'कुंभ',
  aquarius: 'कुंभ',
  meena: 'मीन',
  pisces: 'मीन',

  // All 27 Nakshatras (Exact Standard Hindi Spelling)
  nakshatra: 'नक्षत्र',
  nakshatras: 'नक्षत्र',
  constellation: 'नक्षत्र',
  pada: 'चरण',
  charan: 'चरण',
  ashwini: 'अश्विनी',
  bharani: 'भरणी',
  krittika: 'कृत्तिका',
  rohini: 'रोहिणी',
  mrigashira: 'मृगशिरा',
  ardra: 'आर्द्रा',
  punarvasu: 'पुनर्वसु',
  pushya: 'पुष्य',
  ashlesha: 'आश्लेषा',
  magha: 'मघा',
  purvaphalguni: 'पूर्वाफाल्गुनी',
  uttaraphalguni: 'उत्तराफाल्गुनी',
  hasta: 'हस्त',
  chitra: 'चित्रा',
  swati: 'स्वाति',
  vishakha: 'विशाखा',
  anuradha: 'अनुराधा',
  jyeshtha: 'ज्येष्ठा',
  mula: 'मूल',
  moola: 'मूल',
  purvashadha: 'पूर्वाषाढ़ा',
  uttarashadha: 'उत्तराषाढ़ा',
  shravana: 'श्रवण',
  dhanishta: 'धनिष्ठा',
  dhanishtha: 'धनिष्ठा',
  shatabhisha: 'शतभिषा',
  purvabhadrapada: 'पूर्वाभाद्रपद',
  uttarabhadrapada: 'उत्तराभाद्रपद',
  revati: 'रेवती',

  // Panchang, Tithi, Dasha, Transit & Muhurat
  panchang: 'पंचांग',
  tithi: 'तिथि',
  paksha: 'पक्ष',
  shukla: 'शुक्ल',
  krishna: 'कृष्ण',
  purnima: 'पूर्णिमा',
  amavasya: 'अमावस्या',
  ekadashi: 'एकादशी',
  pratipada: 'प्रतिपदा',
  dwitiya: 'द्वितीया',
  tritiya: 'तृतीया',
  chaturthi: 'चतुर्थी',
  panchami: 'पंचमी',
  shashthi: 'षष्ठी',
  saptami: 'सप्तमी',
  ashtami: 'अष्टमी',
  navami: 'नवमी',
  dashami: 'दशमी',
  dwadashi: 'द्वादशी',
  trayodashi: 'त्रयोदशी',
  chaturdashi: 'चतुर्दशी',
  vara: 'वार',
  karana: 'करण',
  hora: 'होरा',
  choghadiya: 'चौघड़िया',
  muhurat: 'मुहूर्त',
  muhurta: 'मुहूर्त',
  muhurats: 'मुहूर्त',
  abhijit: 'अभिजित',
  brahma: 'ब्रह्म',
  amrit: 'अमृत',
  shubh: 'शुभ',
  labh: 'लाभ',
  char: 'चर',
  udveg: 'उद्वेग',
  rog: 'रोग',
  kaal: 'काल',
  dasha: 'दशा',
  mahadasha: 'महादशा',
  antardasha: 'अंतर्दशा',
  pratyantardasha: 'प्रत्यंतर्दशा',
  timeline: 'कालचक्र',
  cycle: 'चक्र',
  cycles: 'चक्र',
  transit: 'गोचर',
  transits: 'गोचर',
  gochar: 'गोचर',
  phase: 'कला',
  phases: 'कलाएं',
  kundali: 'कुंडली',
  milan: 'मिलान',
  ashtakoot: 'अष्टकूट',
  koota: 'कूट',
  guna: 'गुण',
  gunas: 'गुण',
  varna: 'वर्ण',
  vashya: 'वश्य',
  tara: 'तारा',
  yoni: 'योनि',
  graha_maitri: 'ग्रह मैत्री',
  maitri: 'मैत्री',
  gana: 'गण',
  bhakoot: 'भकूट',
  nadi: 'नाड़ी',
  groom: 'वर',
  bride: 'वधू',
  partner: 'जीवनसाथी',
  partners: 'वर-वधू',
  marriage: 'विवाह',
  marital: 'वैवाहिक',
  compatibility: 'अनुकूलता',
  natal: 'जन्म',
  karma: 'कर्म',
  karmic: 'कार्मिक',
  prarabdha: 'प्रारब्ध',
  sankalpa: 'संकल्प',
  vastu: 'वास्तु',
  shastra: 'शास्त्र',
  jyotish: 'ज्योतिष',
  ishan: 'ईशान',
  kon: 'कोण',
  brahmasthan: 'ब्रह्मस्थान',
  kalash: 'कलश',

  // Gemstones, Metals, Mantras & Remedies
  ratna: 'रत्न',
  maharatna: 'महारत्न',
  upratna: 'उपरत्न',
  gemstone: 'रत्न',
  gemstones: 'रत्न',
  gem: 'रत्न',
  crystal: 'क्रिस्टल',
  crystals: 'क्रिस्टल',
  bracelet: 'ब्रेसलेट',
  pendant: 'लॉकेट',
  ring: 'अंगूठी',
  ruby: 'माणिक्य',
  manikya: 'माणिक्य',
  pearl: 'मोती',
  moti: 'मोती',
  coral: 'मूंगा',
  moonga: 'मूंगा',
  emerald: 'पन्ना',
  panna: 'पन्ना',
  sapphire: 'पुखराज/नीलम',
  pukhraj: 'पुखराज',
  diamond: 'हीरा',
  heera: 'हीरा',
  zircon: 'जरकन',
  neelam: 'नीलम',
  amethyst: 'जामुनिया',
  gomed: 'गोमेद',
  hessonite: 'गोमेद',
  garnet: 'गोमेद',
  vaidurya: 'लहसुनिया',
  lehsunia: 'लहसुनिया',
  pyrite: 'पाइराइट',
  quartz: 'स्फटिक',
  sphatik: 'स्फटिक',
  citrine: 'सुनहला',
  turquoise: 'फिरोजा',
  firoza: 'फिरोजा',
  carat: 'कैरेट',
  carats: 'कैरेट',
  ratti: 'रत्ती',
  weight: 'वजन',
  minimum: 'न्यूनतम',
  maximum: 'अधिकतम',
  metal: 'धातु',
  metals: 'धातु',
  alloy: 'मिश्र धातु',
  gold: 'स्वर्ण',
  copper: 'तांबा',
  brass: 'पीतल',
  bronze: 'कांसा',
  iron: 'लोहा',
  steel: 'स्टील',
  platinum: 'प्लैटिनम',
  panchdhatu: 'पंचधातु',
  ashtadhatu: 'अष्टधातु',
  finger: 'उंगली',
  hand: 'हाथ',
  wear: 'धारण करें',
  wearing: 'धारण',
  energize: 'अभिमंत्रित करें',
  energized: 'अभिमंत्रित',
  purification: 'शुद्धिकरण',
  activation: 'सक्रियण',
  mantra: 'मंत्र',
  mantras: 'मंत्र',
  beej: 'बीज',
  gayatri: 'गायत्री',
  stotra: 'स्तोत्र',
  chalisa: 'चालीसा',
  suktam: 'सूक्तम',
  ashtakam: 'अष्टकम',
  chant: 'जाप करें',
  chanting: 'जाप',
  chants: 'मंत्र जाप',
  recite: 'पाठ करें',
  recitation: 'पाठ',
  japa: 'जप',
  mala: 'माला',
  mudra: 'मुद्रा',
  rudraksha: 'रुद्राक्ष',
  mukhi: 'मुखी',
  bead: 'मनका',
  beads: 'मनके',
  yantra: 'यंत्र',
  yantras: 'यंत्र',
  shree: 'श्री',
  sri: 'श्री',
  puja: 'पूजा',
  archana: 'अर्चना',
  abhishek: 'अभिषेक',
  rudrabhishek: 'रुद्राभिषेक',
  havan: 'हवन',
  vrat: 'व्रत',
  fasting: 'उपवास',
  daan: 'दान',
  dana: 'दान',
  charity: 'दान पुण्य',
  charitable: 'दानशील',
  donate: 'दान करें',
  offer: 'अर्पित करें',
  light: 'प्रज्वलित करें',
  diya: 'दीपक',
  lamp: 'दीपक',
  ghee: 'घी',
  oil: 'तेल',
  sesame: 'तिल',
  til: 'तिल',
  mustard: 'सरसों',
  camphor: 'कपूर',
  clove: 'लौंग',
  saffron: 'केसर',
  kesar: 'केसर',
  turmeric: 'हल्दी',
  haldi: 'हल्दी',
  sandalwood: 'चंदन',
  chandan: 'चंदन',
  sindoor: 'सिंदूर',
  tulsi: 'तुलसी',
  peepal: 'पीपल',
  durva: 'दूर्वा',
  lotus: 'कमल',
  rose: 'गुलाब',
  flowers: 'पुष्प',
  flower: 'पुष्प',
  fruits: 'फल',
  fruit: 'फल',
  banana: 'केला',
  bananas: 'केले',
  coconut: 'नारियल',
  milk: 'दूध',
  honey: 'शहद',
  jaggery: 'गुड़',
  wheat: 'गेहूं',
  rice: 'चावल',
  grains: 'अनाज',
  satnaja: 'सतनाजा',
  water: 'जल',
  vessel: 'पात्र',
  lota: 'लोटा',
  temple: 'मंदिर',
  cows: 'गौ माता',
  cow: 'गाय',
  birds: 'पक्षी',
  dogs: 'श्वान',
  needy: 'जरूरतमंद',
  poor: 'निर्धन',
  ancestors: 'पितर',
  ancestral: 'पैतृक',
  pitru: 'पितृ',
  tarpan: 'तर्पण',
  arghya: 'अर्घ्य',
  tilak: 'तिलक',
  parikrama: 'परिक्रमा',
  seva: 'सेवा',

  // Yoga, Pranayama, Asanas, Chakras & Health (Exact Sanskrit/Hindi Spellings)
  yoga: 'योग',
  yogic: 'यौगिक',
  asana: 'आसन',
  asanas: 'योगासन',
  posture: 'योगासन',
  postures: 'योगासन',
  tadasana: 'ताड़ासन',
  vrikshasana: 'वृक्षासन',
  trikonasana: 'त्रिकोणासन',
  bhujangasana: 'भुजंगासन',
  balasana: 'बालासन',
  setubandhasana: 'सेतुबंधासन',
  paschimottanasana: 'पश्चिमोत्तानासन',
  padmasana: 'पद्मासन',
  vajrasana: 'वज्रासन',
  shavasana: 'शवासन',
  sukhasana: 'सुखासन',
  siddhasana: 'सिद्धासन',
  gomukhasana: 'गोमुखासन',
  ardhamatsyendrasana: 'अर्धमत्स्येंद्रासन',
  dhanurasana: 'धनुरासन',
  ustrasana: 'उष्ट्रासन',
  halasana: 'हलासन',
  sarvangasana: 'सर्वांगासन',
  pawanmuktasana: 'पवनमुक्तासन',
  marjaryasana: 'मार्जरीआसन',
  bitilasana: 'बितिलासन',
  namaskar: 'नमस्कार',
  pranayama: 'प्राणायाम',
  kapalbhati: 'कपालभाति',
  anulom: 'अनुलोम',
  vilom: 'विलोम',
  bhramari: 'भ्रामरी',
  bhastrika: 'भस्त्रिका',
  ujjayi: 'उज्जायी',
  sheetali: 'शीतली',
  sheetkari: 'शीतकारी',
  shodhana: 'शोधन',
  nadishodhana: 'नाड़ी शोधन',
  nadis: 'नाड़ियां',
  breathing: 'श्वास क्रिया',
  breath: 'श्वास',
  breathwork: 'प्राणायाम',
  inhale: 'श्वास लें',
  exhale: 'श्वास छोड़ें',
  hold: 'रोकें',
  nostril: 'नासिका',
  meditation: 'ध्यान',
  dhyana: 'ध्यान',
  sadhana: 'साधना',
  chakra: 'चक्र',
  chakras: 'चक्र',
  kundalini: 'कुंडलिनी',
  muladhara: 'मूलाधार',
  svadhishthana: 'स्वाधिष्ठान',
  manipura: 'मणिपूर',
  anahata: 'अनाहत',
  vishuddha: 'विशुद्ध',
  ajna: 'आज्ञा',
  sahasrara: 'सहस्रार',
  sacral: 'स्वाधिष्ठान',
  plexus: 'मणिपूर',
  heart: 'हृदय',
  throat: 'कंठ',
  crown: 'सहस्रार',
  pineal: 'आज्ञा चक्र',
  aura: 'आभामंडल',
  prana: 'प्राण ऊर्जा',
  pranic: 'प्राणिक',
  shakti: 'शक्ति',
  energy: 'ऊर्जा',
  vibration: 'स्पंदन',
  vibrations: 'स्पंदन',
  vibrates: 'स्पंदित होता है',
  vibrate: 'स्पंदित होते हैं',
  frequency: 'आवृत्ति',
  frequencies: 'आवृत्तियां',
  acoustic: 'ध्वनि',
  acoustics: 'ध्वनि तरंगें',
  sound: 'ध्वनि',
  resonance: 'अनुनाद',
  resonates: 'सामंजस्य बनाता है',
  harmony: 'सामंजस्य',
  harmonious: 'सामंजस्यपूर्ण',
  harmonize: 'संतुलित करें',
  harmonized: 'संतुलित',
  alignment: 'संतुलन',
  aligned: 'संतुलित',
  aligns: 'संतुलित करता है',
  aligning: 'संतुलित करना',
  balance: 'संतुलन',
  balanced: 'संतुलित',
  balancing: 'संतुलन',
  health: 'स्वास्थ्य',
  healthy: 'स्वस्थ',
  vitality: 'प्राण शक्ति',
  immunity: 'रोग प्रतिरोधक क्षमता',
  therapeutic: 'उपचारात्मक',
  healing: 'उपचार',
  healer: 'हीलर',
  ayurveda: 'आयुर्वेद',
  vata: 'वात',
  pitta: 'पित्त',
  kapha: 'कफ',
  dosha: 'दोष',
  spine: 'रीढ़',
  neck: 'गर्दन',
  shoulder: 'कंधा',
  shoulders: 'कंधे',
  chest: 'वक्ष',
  lungs: 'फेफड़े',
  abdomen: 'उदर',
  stomach: 'पेट',
  digestion: 'पाचन',
  digestive: 'पाचन संबंधी',
  blood: 'रक्त',
  pressure: 'रक्तचाप',
  stress: 'तनाव',
  anxiety: 'चिंता',
  fatigue: 'थकान',
  sleep: 'निद्रा',
  insomnia: 'अनिद्रा',
  mind: 'मन',
  peace: 'शांति',
  calm: 'शांत',
  clarity: 'स्पष्टता',
  intuition: 'अंतर्ज्ञान',
  intuitive: 'अंतर्ज्ञानी',
  memory: 'स्मरण शक्ति',
  intellect: 'बुद्धि',
  intellectual: 'बौद्धिक',
  wisdom: 'ज्ञान',
  courage: 'साहस',
  courageous: 'साहसी',
  confidence: 'आत्मविश्वास',
  empathetic: 'संवेदनशील',
  empathy: 'संवेदनशीलता',

  // Career, Business, Finance, Traits & General Report Vocabulary
  name: 'नाम',
  names: 'नाम',
  spelling: 'स्पेलिंग',
  spellings: 'स्पेलिंग',
  letter: 'अक्षर',
  letters: 'अक्षर',
  signature: 'हस्ताक्षर',
  mobile: 'मोबाइल',
  phone: 'फ़ोन',
  pair: 'अंक युग्म',
  pairs: 'अंक युग्म',
  triad: 'त्रिकोण',
  virtual: 'वर्चुअल',
  sim: 'सिम',
  sims: 'सिम',
  career: 'करियर',
  profession: 'व्यवसाय',
  professions: 'व्यवसाय',
  occupation: 'आजीविका',
  sector: 'क्षेत्र',
  sectors: 'क्षेत्र',
  field: 'क्षेत्र',
  industry: 'उद्योग',
  industries: 'उद्योग',
  business: 'व्यापार',
  businesses: 'व्यापार',
  commercial: 'व्यापारिक',
  commerce: 'वाणिज्य',
  trade: 'व्यापार',
  trading: 'ट्रेडिंग',
  enterprise: 'एंटरप्राइजेज',
  enterprises: 'एंटरप्राइजेज',
  job: 'नौकरी',
  employment: 'रोजगार',
  promotion: 'पदोन्नति',
  leadership: 'नेतृत्व',
  authority: 'अधिकार',
  authoritative: 'प्रभावशाली',
  executive: 'प्रशासनिक',
  management: 'प्रबंधन',
  administration: 'प्रशासन',
  government: 'सरकारी',
  recognition: 'सम्मान',
  prestige: 'प्रतिष्ठा',
  honor: 'सम्मान',
  fame: 'यश',
  goodwill: 'ख्याति',
  magnetism: 'आकर्षण शक्ति',
  magnetic: 'आकर्षक',
  success: 'सफलता',
  successful: 'सफल',
  victory: 'विजय',
  growth: 'उन्नति',
  expansion: 'विस्तार',
  elevation: 'उन्नति',
  breakthrough: 'बड़ी सफलता',
  breakthroughs: 'बड़ी सफलताएं',
  wealth: 'धन संपत्ति',
  wealthy: 'समृद्ध',
  dhana: 'धन',
  fortune: 'सौभाग्य',
  fortunes: 'सौभाग्य',
  prosperity: 'समृद्धि',
  abundance: 'प्रचुरता',
  abundant: 'प्रचुर',
  finance: 'वित्त',
  financial: 'आर्थिक',
  money: 'धन',
  cashflow: 'धन प्रवाह',
  liquidity: 'नकदी प्रवाह',
  liquid: 'तरल',
  income: 'आय',
  inflows: 'धन आगमन',
  leakage: 'धन हानि',
  profit: 'लाभ',
  gains: 'लाभ',
  gain: 'लाभ',
  return: 'प्रतिफल',
  banking: 'बैंकिंग',
  bank: 'बैंक',
  account: 'खाता',
  accounts: 'खाते',
  investment: 'निवेश',
  investments: 'निवेश',
  asset: 'संपत्ति',
  assets: 'संपत्ति',
  consolidation: 'सुदृढ़ीकरण',
  property: 'संपत्ति',
  land: 'भूमि',
  home: 'गृह',
  house: 'भाव/गृह',
  houses: 'भाव',
  flat: 'फ्लैट',
  vehicle: 'वाहन',
  luxury: 'ऐश्वर्य',
  luxuries: 'सुख-सुविधाएं',
  luxurious: 'ऐश्वर्यपूर्ण',
  creative: 'रचनात्मक',
  artistic: 'कलात्मक',
  legal: 'कानूनी',
  law: 'कानून',
  contract: 'अनुबंध',
  contracts: 'अनुबंध',
  agreement: 'समझौता',
  agreements: 'समझौते',
  debt: 'ऋण',
  debts: 'ऋण',
  clearance: 'मुक्ति',
  obstacle: 'बाधा',
  obstacles: 'बाधाएं',
  block: 'रुकावट',
  blocks: 'रुकावटें',
  delay: 'विलंब',
  delays: 'विलंब',
  friction: 'संघर्ष',
  conflict: 'विरोध',
  drawback: 'कमी',
  drawbacks: 'कमियां',
  losses: 'हानि',
  loss: 'हानि',
  caution: 'सावधानी',
  avoid: 'वर्जित',
  exclude: 'वर्जित रखें',
  favorable: 'अनुकूल',
  auspicious: 'शुभ',
  auspiciousness: 'शुभता',
  inauspicious: 'अशुभ',
  lucky: 'शुभ',
  friendly: 'मित्र',
  neutral: 'सम',
  enemy: 'शत्रु',
  hostile: 'प्रतिकूल',
  supportive: 'सहायक',
  supreme: 'सर्वोच्च',
  priority: 'प्राथमिकता',
  secondary: 'द्वितीयक',
  positive: 'सकारात्मक',
  negative: 'नकारात्मक',
  excellent: 'सर्वोत्तम',
  good: 'उत्तम',
  bad: 'अशुभ',
  strong: 'प्रबल',
  weak: 'कमजोर',
  active: 'सक्रिय',
  upcoming: 'आगामी',
  completed: 'संपन्न',
  current: 'वर्तमान',
  presently: 'वर्तमान में',
  starting: 'प्रारंभ',
  start: 'प्रारंभ',
  end: 'समाप्ति',
  duration: 'अवधि',
  period: 'अवधि',
  validity: 'वैधता',
  age: 'आयु',
  range: 'सीमा',
  score: 'स्कोर',
  index: 'सूचकांक',
  match: 'मिलान',
  total: 'कुल',
  overall: 'संपूर्ण',
  status: 'स्थिति',
  verdict: 'निष्कर्ष',
  summary: 'सारांश',
  analysis: 'विश्लेषण',
  audit: 'ऑडिट',
  audited: 'सत्यापित',
  report: 'रिपोर्ट',
  dossier: 'महा-रिपोर्ट',
  module: 'मॉड्यूल',
  modules: 'मॉड्यूल',
  section: 'अनुभाग',
  sections: 'अनुभाग',
  chapter: 'अध्याय',
  page: 'पृष्ठ',
  pages: 'पृष्ठ',
  table: 'तालिका',
  chart: 'कुंडली',
  calendar: 'पंचांग',
  planner: 'योजना',
  schedule: 'समय सारणी',
  forecast: 'भविष्यफल',
  prediction: 'फलादेश',
  predictions: 'फलादेश',
  horoscope: 'राशिफल',
  interpretation: 'व्याख्या',
  explanation: 'व्याख्या',
  theoretical: 'शास्त्रीय',
  theory: 'सिद्धांत',
  meaning: 'भावार्थ',
  significance: 'महत्व',
  benefits: 'लाभ',
  benefit: 'लाभ',
  precaution: 'सावधानी',
  precautions: 'सावधानियां',
  steps: 'चरण',
  step: 'चरण',
  method: 'विधि',
  protocol: 'विधि',
  directive: 'दिशा-निर्देश',
  sutra: 'सूत्र',
  synthesis: 'सार',
  instructions: 'निर्देश',
  advice: 'परामर्श',
  guidance: 'मार्गदर्शन',
  insight: 'अंतर्दृष्टि',
  highlight: 'मुख्य बिंदु',
  highlights: 'मुख्य बिंदु',
  basis: 'आधार',
  reason: 'कारण',
  execution: 'क्रियान्वयन',
  scientific: 'वैज्ञानिक',
  classical: 'शास्त्रीय',
  ancient: 'प्राचीन',
  complete: 'संपूर्ण',
  completion: 'पूर्णता',
  detailed: 'विस्तृत',
  personalized: 'व्यक्तिगत',
  personal: 'व्यक्तिगत',
  universal: 'सार्वभौमिक',
  validator: 'सत्यापनकर्ता',
  verifier: 'सत्यापन',
  verified: 'सत्यापित',
  verification: 'सत्यापन',
  client: 'साधक',
  seeker: 'साधक',
  admin: 'एडमिन',
  master: 'मास्टर',
  profile: 'प्रोफाइल',
  profiles: 'प्रोफाइल',
  portal: 'पोर्टल',
  portals: 'पोर्टल',
  dashboard: 'डैशबोर्ड',
  ledger: 'पंजिका',
  record: 'विवरण',
  parameter: 'मापदंड',
  calculated: 'गणनाकृत',
  pillar: 'स्तंभ',
  pillars: 'स्तंभ',
  gender: 'लिंग',
  male: 'पुरुष',
  female: 'महिला',
  birth: 'जन्म',
  date: 'तिथि',
  dates: 'तिथियां',
  time: 'समय',
  timings: 'समय',
  window: 'समयावधि',
  windows: 'समयावधि',
  place: 'स्थान',
  coordinates: 'निर्देशांक',
  city: 'शहर',
  state: 'राज्य',
  direction: 'दिशा',
  directional: 'दिशात्मक',
  east: 'पूर्व',
  west: 'पश्चिम',
  north: 'उत्तर',
  south: 'दक्षिण',
  center: 'केंद्र',
  color: 'रंग',
  colors: 'रंग',
  red: 'लाल',
  crimson: 'गहरा लाल',
  scarlet: 'सिंदूरी लाल',
  maroon: 'मैरून',
  yellow: 'पीला',
  ochre: 'गेरुआ',
  amber: 'सुनहरा पीला',
  white: 'सफेद',
  pristine: 'शुद्ध',
  black: 'काला',
  charcoal: 'गहरा स्लेटी',
  grey: 'स्लेटी',
  smoky: 'धूम्र',
  green: 'हरा',
  mint: 'हल्का हरा',
  jade: 'हरित मणि',
  blue: 'नीला',
  navy: 'गहरा नीला',
  pastel: 'हल्का',
  orange: 'नारंगी',
  pink: 'गुलाबी',
  purple: 'बैंगनी',
  brown: 'भूरा',
  cream: 'क्रीम',
  metallic: 'धात्विक',
  element: 'तत्व',
  elemental: 'तत्वीय',
  fire: 'अग्नि',
  earth: 'पृथ्वी',
  air: 'वायु',
  ether: 'आकाश',
  quality: 'गुण',
  traits: 'विशेषताएं',
  independent: 'स्वतंत्र',
  noble: 'श्रेष्ठ',
  pioneering: 'अग्रणी',
  dignified: 'गरिमामय',
  sensitive: 'संवेदनशील',
  diplomatic: 'कूटनीतिक',
  nurturing: 'पोषणकर्ता',
  receptive: 'ग्रहणशील',
  philosophical: 'दार्शनिक',
  philosophic: 'दार्शनिक',
  generous: 'उदार',
  optimistic: 'आशावादी',
  scholarly: 'विद्वान',
  benevolent: 'परोपकारी',
  futuristic: 'दूरदर्शी',
  resilient: 'दृढ़',
  strategic: 'रणनीतिक',
  analytic: 'विश्लेषणात्मक',
  analytical: 'विश्लेषणात्मक',
  adaptable: 'अनुकूलनशील',
  articulate: 'वाक्पटु',
  witty: 'कुशाग्र',
  speedy: 'तीव्र',
  charming: 'आकर्षक',
  mystical: 'रहस्यमयी',
  introverted: 'अंतर्मुखी',
  disciplined: 'अनुशासित',
  tenacious: 'अडिग',
  patient: 'धैर्यवान',
  builder: 'निर्माता',
  passionate: 'उत्साही',
  dynamic: 'गतिशील',
  protector: 'रक्षक',
  protection: 'रक्षा',
  shield: 'कवच',

  // Days, Months, Time & Festivals
  day: 'दिन',
  days: 'दिन',
  daily: 'दैनिक',
  week: 'सप्ताह',
  weekly: 'साप्ताहिक',
  month: 'माह',
  months: 'माह',
  monthly: 'मासिक',
  year: 'वर्ष',
  years: 'वर्ष',
  annual: 'वार्षिक',
  sunday: 'रविवार',
  monday: 'सोमवार',
  tuesday: 'मंगलवार',
  wednesday: 'बुधवार',
  thursday: 'गुरुवार',
  friday: 'शुक्रवार',
  saturday: 'शनिवार',
  january: 'जनवरी',
  february: 'फरवरी',
  march: 'मार्च',
  april: 'अप्रैल',
  may: 'मई',
  june: 'जून',
  july: 'जुलाई',
  august: 'अगस्त',
  september: 'सितंबर',
  october: 'अक्टूबर',
  november: 'नवंबर',
  december: 'दिसंबर',
  jan: 'जनवरी',
  feb: 'फरवरी',
  mar: 'मार्च',
  apr: 'अप्रैल',
  jun: 'जून',
  jul: 'जुलाई',
  aug: 'अगस्त',
  sep: 'सितंबर',
  oct: 'अक्टूबर',
  nov: 'नवंबर',
  dec: 'दिसंबर',
  morning: 'प्रातःकाल',
  mornings: 'प्रातःकाल',
  afternoon: 'दोपहर',
  evening: 'सायंकाल',
  evenings: 'सायंकाल',
  night: 'रात्रि',
  overnight: 'रात भर',
  sunrise: 'सूर्योदय',
  sunset: 'सूर्यास्त',
  dusk: 'गोधूलि बेला',
  noon: 'मध्याह्न',
  today: 'आज',
  now: 'अभी',
  live: 'लाइव',
  festival: 'पर्व',
  festivals: 'पर्व',
  event: 'शुभ संस्कार',
  events: 'शुभ संस्कार',
  pilgrimage: 'तीर्थयात्रा',
  ceremonies: 'शुभ अनुष्ठान',

  // Islamic-Vedic Terms
  islamic: 'इस्लामिक',
  roohani: 'रूहानी',
  quranic: 'कुरानिक',
  surah: 'सूरह',
  surahs: 'सूरह',
  adad: 'अदद',
  abjad: 'अबजद',
  wazifa: 'वज़ीफ़ा',
  dhikr: 'ज़िक्र',
  tasbih: 'तस्बीह',
  dua: 'दुआ',
  sadaqah: 'सदक़ा',
  noor: 'नूर',
  barkat: 'बरकत',
  shifa: 'शिफ़ा',
  rizq: 'रिज़्क़',
  fajr: 'फ़ज्र',
  dhuhr: 'ज़ुहर',
  asr: 'अस्र',
  maghrib: 'मग़रिब',
  isha: 'ईशा',
  attar: 'इत्र',
  oudh: 'ऊद',
  prayer: 'प्रार्थना/नमाज़',
  prayers: 'प्रार्थना/नमाज़',

  // Common Grammar, Verbs & UI Controls
  and: 'एवं',
  or: 'या',
  vs: 'बनाम',
  with: 'के साथ',
  without: 'के बिना',
  for: 'हेतु',
  from: 'से',
  to: 'तक',
  in: 'में',
  into: 'में',
  on: 'पर',
  at: 'पर',
  by: 'द्वारा',
  of: 'का',
  after: 'के बाद',
  before: 'से पूर्व',
  during: 'के दौरान',
  between: 'के मध्य',
  near: 'के पास',
  under: 'के अंतर्गत',
  above: 'के ऊपर',
  below: 'नीचे',
  across: 'सभी में',
  while: 'करते हुए',
  when: 'जब',
  where: 'जहां',
  all: 'सभी',
  every: 'प्रत्येक',
  each: 'प्रत्येक',
  both: 'दोनों',
  only: 'केवल',
  your: 'आपका',
  you: 'आप',
  this: 'यह',
  that: 'वह',
  these: 'ये',
  those: 'वे',
  none: 'कोई नहीं',
  no: 'नहीं',
  not: 'नहीं',
  already: 'पहले से ही',
  immediately: 'तुरंत',
  continuously: 'निरंतर',
  consistently: 'नियमित रूप से',
  automatically: 'स्वतः',
  effortlessly: 'सहजता से',
  naturally: 'स्वाभाविक रूप से',
  new: 'नया',
  old: 'पुराना',
  original: 'मूल',
  real: 'मूल',
  official: 'आधिकारिक',
  digital: 'डिजिटल',
  social: 'सामाजिक',
  domestic: 'पारिवारिक',
  foreign: 'विदेशी',
  interstate: 'अंतरराज्यीय',
  public: 'सार्वजनिक',
  high: 'उच्च',
  higher: 'उच्चतर',
  low: 'निम्न',
  best: 'सर्वश्रेष्ठ',
  top: 'शीर्ष',
  ideal: 'आदर्श',
  perfect: 'पूर्णतः शुभ',
  pure: 'शुद्ध',
  raw: 'कच्चा',
  soaked: 'भीगा हुआ',
  natural: 'प्राकृतिक',
  royal: 'राजकीय',
  permanent: 'स्थायी',
  sudden: 'आकस्मिक',
  steady: 'स्थिर',
  deep: 'गहन',
  bold: 'साहसिक',
  structured: 'सुनियोजित',
  grounded: 'संतुलित',
  radiant: 'तेजस्वी',
  boundless: 'असीम',
  inner: 'आंतरिक',
  CHERISHED: 'अनमोल',
  cherished: 'अनमोल',
  part: 'हिस्सा',
  faith: 'श्रद्धा',
  devotion: 'भक्ति',
  effort: 'परिश्रम',
  efforts: 'प्रयास',
  planning: 'योजना',
  decision: 'निर्णय',
  decisions: 'निर्णय',
  communication: 'संवाद',
  speech: 'वाणी',
  support: 'सहयोग',
  supports: 'सहायक है',
  activates: 'सक्रिय करता है',
  strengthen: 'मजबूत करें',
  strengthens: 'मजबूत करता है',
  accelerates: 'तीव्र करता है',
  enhances: 'बढ़ाता है',
  rewards: 'फल देता है',
  blesses: 'आशीर्वाद देता है',
  bless: 'आशीर्वाद दें',
  favor: 'अनुकूल है',
  favors: 'अनुकूल है',
  governs: 'नियंत्रित करता है',
  creates: 'निर्मित करता है',
  unlocking: 'प्रदान करता है',
  strengthening: 'मजबूत करते हुए',
  resolving: 'समाधान हेतु',
  dissolution: 'निवारण',
  dissolve: 'दूर होते हैं',
  practice: 'अभ्यास करें',
  maintain: 'बनाए रखें',
  perform: 'संपन्न करें',
  observe: 'पालन करें',
  apply: 'लगाएं',
  feed: 'खिलाएं',
  keep: 'रखें',
  write: 'लिखें',
  writing: 'लेखन',
  read: 'पढ़ें',
  listen: 'सुनें',
  continue: 'जारी रखें',
  using: 'उपयोग',
  update: 'अपडेट करें',
  open: 'खोलें',
  close: 'बंद करें',
  save: 'सेव करें',
  saved: 'सेव किए गए',
  edit: 'संपादित करें',
  delete: 'हटाएं',
  download: 'डाउनलोड',
  downloaded: 'डाउनलोड हो गया',
  print: 'प्रिंट',
  share: 'शेयर',
  copy: 'कॉपी',
  copied: 'कॉपी हो गया',
  select: 'चुनें',
  selected: 'चयनित',
  choice: 'विकल्प',
  suggestion: 'सुझाव',
  suggestions: 'सुझाव',
  required: 'आवश्यक',
  change: 'परिवर्तन',
  include: 'शामिल करें',
  included: 'शामिल',
  preview: 'प्रीव्यू',
  watermark: 'वॉटरमार्क',
  opacity: 'पारदर्शिता',
  login: 'लॉगिन',
  register: 'पंजीकरण',
  registration: 'पंजीकरण',
  password: 'पासवर्ड',
  forgot: 'भूल गए',
  payment: 'भुगतान',
  plan: 'प्लान',
  plans: 'प्लान',
  free: 'निःशुल्क',
  contact: 'संपर्क',
  details: 'विवरण',
  address: 'पता',
  email: 'ईमेल',
  website: 'वेबसाइट',
  times: 'बार',
  mins: 'मिनट',
  minutes: 'मिनट',
  rounds: 'चक्र',
  ink: 'स्याही',
  facing: 'दिशा की ओर मुख करके',

  // Common Indian Names, Surnames, Cities & States (100% Verified Standard Devanagari)
  om: 'ॐ',
  namah: 'नमः',
  namo: 'नमो',
  swaha: 'स्वाहा',
  ji: 'जी',
  namaste: 'नमस्ते',
  tathastu: 'तथास्तु',
  india: 'भारत',
  indian: 'भारतीय',
  deepak: 'दीपक',
  ddeepak: 'दीपक',
  jain: 'जैन',
  priyanka: 'प्रियंका',
  sharma: 'शर्मा',
  verma: 'वर्मा',
  varma: 'वर्मा',
  gupta: 'गुप्ता',
  agrawal: 'अग्रवाल',
  agarwal: 'अग्रवाल',
  kumar: 'कुमार',
  kumari: 'कुमारी',
  singh: 'सिंह',
  mishra: 'मिश्रा',
  tiwari: 'तिवारी',
  pandey: 'पांडेय',
  dubey: 'दुबे',
  joshi: 'जोशी',
  trivedi: 'त्रिवेदी',
  chaturvedi: 'चतुर्वेदी',
  dwivedi: 'द्विवेदी',
  patel: 'पटेल',
  shah: 'शाह',
  mehta: 'मेहता',
  desai: 'देसाई',
  kulkarni: 'कुलकर्णी',
  patil: 'पाटिल',
  pawar: 'पवार',
  yadav: 'यादव',
  chauhan: 'चौहान',
  rajput: 'राजपूत',
  rathore: 'राठौड़',
  choudhary: 'चौधरी',
  chaudhary: 'चौधरी',
  bansal: 'बंसल',
  mittal: 'मित्तल',
  garg: 'गर्ग',
  goyal: 'गोयल',
  goel: 'गोयल',
  khandelwal: 'खंडेलवाल',
  maheshwari: 'माहेश्वरी',
  soni: 'सोनी',
  sahu: 'साहू',
  modi: 'मोदी',
  kapoor: 'कपूर',
  khanna: 'खन्ना',
  malhotra: 'मल्होत्रा',
  arora: 'अरोड़ा',
  bhatia: 'भाटिया',
  chopra: 'चोपड़ा',
  saxena: 'सक्सेना',
  srivastava: 'श्रीवास्तव',
  shrivastava: 'श्रीवास्तव',
  mathur: 'माथुर',
  kaur: 'कौर',
  gill: 'गिल',
  khan: 'खान',
  ali: 'अली',
  ahmed: 'अहमद',
  ansari: 'अंसारी',
  sheikh: 'शेख',
  syed: 'सैयद',
  reddy: 'रेड्डी',
  rao: 'राव',
  nair: 'नायर',
  menon: 'मेनन',
  iyer: 'अय्यर',
  das: 'दास',
  bose: 'बोस',
  sen: 'सेन',
  ghosh: 'घोष',
  roy: 'रॉय',
  mukherjee: 'मुखर्जी',
  banerjee: 'बनर्जी',
  chatterjee: 'चटर्जी',
  rahul: 'राहुल',
  amit: 'अमित',
  sumit: 'सुमित',
  rohit: 'रोहित',
  mohit: 'मोहित',
  ankit: 'अंकित',
  vikas: 'विकास',
  vishal: 'विशाल',
  vivek: 'विवेक',
  vinay: 'विनय',
  vijay: 'विजय',
  ajay: 'अजय',
  sanjay: 'संजय',
  manoj: 'मनोज',
  rajesh: 'राजेश',
  ramesh: 'रमेश',
  suresh: 'सुरेश',
  mahesh: 'महेश',
  dinesh: 'दिनेश',
  mukesh: 'मुकेश',
  rakesh: 'राकेश',
  naresh: 'नरेश',
  yogesh: 'योगेश',
  lokesh: 'लोकेश',
  hitesh: 'हितेश',
  ritesh: 'रितेश',
  nitesh: 'नितेश',
  nikhil: 'निखिल',
  akhil: 'अखिल',
  sachin: 'सचिन',
  nitin: 'नितिन',
  vipin: 'विपिन',
  kapil: 'कपिल',
  sunil: 'सुनील',
  anil: 'अनिल',
  ashok: 'अशोक',
  alok: 'आलोक',
  manish: 'मनीष',
  harish: 'हरीश',
  girish: 'गिरीश',
  satish: 'सतीश',
  ashish: 'आशीष',
  gaurav: 'गौरव',
  saurabh: 'सौरभ',
  vaibhav: 'वैभव',
  abhinav: 'अभिनव',
  anurag: 'अनुराग',
  chirag: 'चिराग',
  parag: 'पराग',
  pradeep: 'प्रदीप',
  sandeep: 'संदीप',
  kuldeep: 'कुलदीप',
  mandeep: 'मनदीप',
  hardeep: 'हरदीप',
  navdeep: 'नवदीप',
  pankaj: 'पंकज',
  neeraj: 'नीरज',
  dheeraj: 'धीरज',
  suraj: 'सूरज',
  pawan: 'पवन',
  aman: 'अमन',
  naman: 'नमन',
  chaman: 'चमन',
  raman: 'रमन',
  karan: 'करण',
  arjun: 'अर्जुन',
  varun: 'वरुण',
  tarun: 'तरुण',
  arun: 'अरुण',
  dev: 'देव',
  harsh: 'हर्ष',
  utkarsh: 'उत्कर्ष',
  adarsh: 'आदर्श',
  akash: 'आकाश',
  prakash: 'प्रकाश',
  subhash: 'सुभाष',
  vikram: 'विक्रम',
  shivam: 'शिवम',
  satyam: 'सत्यम',
  shubham: 'शुभम',
  poonam: 'पूनम',
  sonam: 'सोनम',
  pooja: 'पूजा',
  arti: 'आरती',
  bharti: 'भारती',
  preeti: 'प्रीति',
  kriti: 'कृति',
  smriti: 'स्मृति',
  shruti: 'श्रुति',
  jyoti: 'ज्योति',
  pragati: 'प्रगति',
  aditi: 'अदिति',
  nidhi: 'निधि',
  vidhi: 'विधि',
  riddhi: 'रिद्धि',
  siddhi: 'सिद्धि',
  rakhi: 'राखी',
  mansi: 'मानसी',
  khushi: 'खुशी',
  sakshi: 'साक्षी',
  meenakshi: 'मीनाक्षी',
  sonakshi: 'सोनाक्षी',
  anita: 'अनीता',
  sunita: 'सुनीता',
  kavita: 'कविता',
  savita: 'सविता',
  mamta: 'ममता',
  ekta: 'एकता',
  namrata: 'नम्रता',
  shweta: 'श्वेता',
  geeta: 'गीता',
  seeta: 'सीता',
  sita: 'सीता',
  reeta: 'रीता',
  neeta: 'नीता',
  reena: 'रीना',
  teena: 'टीना',
  heena: 'हीना',
  veena: 'वीना',
  leena: 'लीना',
  neha: 'नेहा',
  sneha: 'स्नेहा',
  rekha: 'रेखा',
  surekha: 'सुरेखा',
  shikha: 'शिखा',
  barkha: 'बरखा',
  alka: 'अलका',
  kala: 'कला',
  asha: 'आशा',
  usha: 'ऊषा',
  nisha: 'निशा',
  disha: 'दिशा',
  manisha: 'मनीषा',
  amisha: 'अमीषा',
  tanisha: 'तनिषा',
  trisha: 'त्रिशा',
  radha: 'राधा',
  sudha: 'सुधा',
  medha: 'मेधा',
  shraddha: 'श्रद्धा',
  richa: 'ऋचा',
  divya: 'दिव्या',
  kavya: 'काव्या',
  navya: 'नव्या',
  bhavya: 'भव्या',
  pragya: 'प्रज्ञा',
  priya: 'प्रिया',
  supriya: 'सुप्रिया',
  riya: 'रिया',
  siya: 'सिया',
  jiya: 'जिया',
  sonia: 'सोनिया',
  tania: 'तानिया',
  sania: 'सानिया',
  anjali: 'अंजलि',
  sonali: 'सोनाली',
  monali: 'मोनाली',
  rupali: 'रूपाली',
  deepali: 'दीपाली',
  vaishali: 'वैशाली',
  shefali: 'शेफाली',
  pallavi: 'पल्लवी',
  madhavi: 'माधवी',
  janhvi: 'जान्हवी',
  tanvi: 'तन्वी',
  manvi: 'मानवी',
  sanvi: 'सान्वी',
  vandana: 'वंदना',
  aradhana: 'आराधना',
  rachana: 'रचना',
  kalpana: 'कल्पना',
  sapna: 'सपना',
  bhavna: 'भावना',
  chetna: 'चेतना',
  meghna: 'मेघना',
  anjana: 'अंजना',
  ranjana: 'रंजना',
  sanjana: 'संजना',
  kiran: 'किरण',
  simran: 'सिमरन',
  suman: 'सुमन',
  kusum: 'कुसुम',
  anu: 'अनु',
  tanu: 'तनु',
  manu: 'मनु',
  renu: 'रेणु',
  meenu: 'मीनू',
  rashmi: 'रश्मि',
  lakshmi: 'लक्ष्मी',
  laxmi: 'लक्ष्मी',
  saraswati: 'सरस्वती',
  parvati: 'पार्वती',
  durga: 'दुर्गा',
  gauri: 'गौरी',
  agra: 'आगरा',
  delhi: 'दिल्ली',
  mumbai: 'मुंबई',
  maharashtra: 'महाराष्ट्र',
  uttar: 'उत्तर',
  pradesh: 'प्रदेश',
  rajasthan: 'राजस्थान',
  gujarat: 'गुजरात',
  punjab: 'पंजाब',
  haryana: 'हरियाणा',
  bihar: 'बिहार',
  madhya: 'मध्य',
  karnataka: 'कर्नाटक',
  kerala: 'केरल',
  tamil: 'तमिल',
  nadu: 'नाडु',
  bengal: 'बंगाल',
  assam: 'असम',
  odisha: 'ओडिशा',
  hyderabad: 'हैदराबाद',
  bengaluru: 'बेंगलुरु',
  chennai: 'चेन्नई',
  kolkata: 'कोलकाता',
  jaipur: 'जयपुर',
  lucknow: 'लखनऊ',
  varanasi: 'वाराणसी',
  indore: 'इंदौर',
  bhopal: 'भोपाल',
  pune: 'पुणे',
  ahmedabad: 'अहमदाबाद',
  surat: 'सूरत',
  chandigarh: 'चंडीगढ़',
  noida: 'नोएडा',
  gurgaon: 'गुरुग्राम',
  gurugram: 'गुरुग्राम',
  mathura: 'मथुरा',
  vrindavan: 'वृंदावन',
  ayodhya: 'अयोध्या',
  prayagraj: 'प्रयागराज',
  allahabad: 'प्रयागराज',
  kanpur: 'कानपुर',
  meerut: 'मेरठ',
  bareilly: 'बरेली',
  aligarh: 'अलीगढ़',
  moradabad: 'मुरादाबाद',
  saharanpur: 'सहारनपुर',
  gorakhpur: 'गोरखपुर',
  jhansi: 'झांसी',
  dehradun: 'देहरादून',
  haridwar: 'हरिद्वार',
  rishikesh: 'ऋषिकेश',
  patna: 'पटना',
  ranchi: 'रांची',
  raipur: 'रायपुर',
  nagpur: 'नागपुर',
  nashik: 'नाशिक',
  thane: 'ठाणे',
  vadodara: 'वडोदरा',
  rajkot: 'राजकोट',
  udaipur: 'उदयपुर',
  jodhpur: 'जोधपुर',
  kota: 'कोटा',
  ajmer: 'अजमेर',
  bikaner: 'बीकानेर',
  amritsar: 'अमृतसर',
  ludhiana: 'लुधियाना',
  jalandhar: 'जालंधर',
  patiala: 'पटियाला',
  faridabad: 'फरीदाबाद',
  ghaziabad: 'गाजियाबाद',
  gwalior: 'ग्वालियर',
  jabalpur: 'जबलपुर',
  ujjain: 'उज्जैन',
  hz: 'हर्ट्ज़',
  ist: 'भा.मा.स.',
  am: 'प्रातः',
  pm: 'सायं',
  dob: 'जन्म तिथि',
  tob: 'जन्म समय',
  pob: 'जन्म स्थान',
  pdf: 'पीडीएफ',
  qr: 'क्यूआर',
  ig: 'इंस्टा',
  fb: 'फेसबुक',
  web: 'वेब',
};

/**
 * Unicode Brahmic Script Offset Map (ISCII-aligned Unicode blocks U+0900..U+0D7F)
 */
const BRAHMIC_SCRIPT_BASE: Partial<Record<SupportedLanguage, number>> = {
  gu: 0x0a80, // Gujarati
  pa: 0x0a00, // Gurmukhi (Punjabi)
  bn: 0x0980, // Bengali
  as: 0x0980, // Assamese
  or: 0x0b00, // Odia
  ta: 0x0b80, // Tamil
  te: 0x0c00, // Telugu
  kn: 0x0c80, // Kannada
  ml: 0x0d00, // Malayalam
};

function convertDevanagariToRegionalScript(text: string, targetLang: SupportedLanguage): string {
  const targetBase = BRAHMIC_SCRIPT_BASE[targetLang];
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
}

const TRANSLATION_MEMO_CACHE = new Map<string, string>();

function lookupWordInHindiLexicon(rawWord: string): string | null {
  const lower = rawWord.toLowerCase();
  if (HINDI_WORD_LEXICON[lower]) return HINDI_WORD_LEXICON[lower];

  // Strip plural/inflection suffixes (-ies, -es, -s, -ing, -ed, -ly)
  if (lower.endsWith('ies') && lower.length > 4) {
    const stem = `${lower.slice(0, -3)}y`;
    if (HINDI_WORD_LEXICON[stem]) return HINDI_WORD_LEXICON[stem];
  }
  if (lower.endsWith('es') && lower.length > 4) {
    const stem = lower.slice(0, -2);
    if (HINDI_WORD_LEXICON[stem]) return HINDI_WORD_LEXICON[stem];
  }
  if (lower.endsWith('s') && lower.length > 3) {
    const stem = lower.slice(0, -1);
    if (HINDI_WORD_LEXICON[stem]) return HINDI_WORD_LEXICON[stem];
  }
  if (lower.endsWith('ing') && lower.length > 5) {
    const stem = lower.slice(0, -3);
    if (HINDI_WORD_LEXICON[stem]) return HINDI_WORD_LEXICON[stem];
    if (HINDI_WORD_LEXICON[`${stem}e`]) return HINDI_WORD_LEXICON[`${stem}e`];
  }
  if (lower.endsWith('ed') && lower.length > 4) {
    const stem = lower.slice(0, -2);
    if (HINDI_WORD_LEXICON[stem]) return HINDI_WORD_LEXICON[stem];
    if (HINDI_WORD_LEXICON[`${stem}e`]) return HINDI_WORD_LEXICON[`${stem}e`];
  }
  if (lower.endsWith('ly') && lower.length > 4) {
    const stem = lower.slice(0, -2);
    if (HINDI_WORD_LEXICON[stem]) return HINDI_WORD_LEXICON[stem];
  }
  return null;
}

/**
 * Translates any string or sentence into the target `SupportedLanguage` using 100% verified
 * dictionary & phrase mappings so Hindi spelling is always accurate and natural.
 */
export function translateTextForLanguage(
  rawText: string,
  lang: SupportedLanguage = currentGlobalLanguage
): string {
  if (!rawText || typeof rawText !== 'string') return rawText || '';
  const trimmed = rawText.trim();
  if (!trimmed) return rawText;

  // Never alter pure URLs, emails, or pure numeric/symbol strings
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ||
    /^[0-9+\-*/().,:%•|—–\s]+$/.test(trimmed)
  ) {
    return rawText;
  }

  // English-only mode: strip bilingual "• हिन्दी" suffixes if present
  if (lang === 'en') {
    if (trimmed.includes('•')) {
      const parts = trimmed.split('•').map((p) => p.trim());
      const englishParts = parts.filter((p) => !/[\u0900-\u0DFF]/.test(p));
      if (englishParts.length > 0 && englishParts.length < parts.length) {
        return englishParts.join(' • ');
      }
    }
    return rawText;
  }

  // Bilingual mode ('en-hi'): keep as-is
  if (lang === 'en-hi') {
    return rawText;
  }

  const cacheKey = `${lang}::${rawText}`;
  const cached = TRANSLATION_MEMO_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  // 1. Check exact table in TRANSLATIONS[lang]
  const langTable = TRANSLATIONS[lang];
  if (langTable) {
    for (const [k, enVal] of Object.entries(TRANSLATIONS.en)) {
      if (trimmed === enVal || trimmed === TRANSLATIONS['en-hi'][k]) {
        const mapped = langTable[k];
        if (mapped) {
          TRANSLATION_MEMO_CACHE.set(cacheKey, mapped);
          return mapped;
        }
      }
    }
  }

  // 2. Protect embedded URLs and email addresses with numeric-only placeholders
  const protectedTokens: string[] = [];
  let working = rawText.replace(
    /(https?:\/\/[^\s)]+|[^\s@]+@[^\s@]+\.[^\s@]+)/gi,
    (match) => {
      const idx = protectedTokens.length;
      protectedTokens.push(match);
      return `@@${idx}@@`;
    }
  );

  // 3. Exact match in HINDI_EXACT_MAP or HindiTranslationReview.exactMap
  const exactHit = HINDI_EXACT_MAP[trimmed] || HindiTranslationReview.exactMap[trimmed];
  if (exactHit) {
    working = rawText.replace(trimmed, exactHit);
  } else {
    // 4. Apply ordered multi-word phrase replacements (Review pack first, then core pairs)
    for (const [pattern, replacement] of HindiTranslationReview.phrasePairs) {
      working = working.replace(pattern, replacement);
    }
    for (const [pattern, replacement] of HINDI_PHRASE_PAIRS) {
      working = working.replace(pattern, replacement);
    }

    // 5. Translate English words via verified HINDI_WORD_LEXICON + HindiTranslationReview.wordLexicon
    working = working.replace(/\b([A-Za-z][A-Za-z']*)\b/g, (word) => {
      // Keep single letters (e.g., letter grid cells 'A', 'D', 'E', 'C:1', 'P:1') intact
      if (word.length === 1 && word === word.toUpperCase()) {
        return word;
      }
      const cleanWord = word.replace(/'s$/i, '');
      const dictHit =
        HindiTranslationReview.wordLexicon[cleanWord.toLowerCase()] ||
        lookupWordInHindiLexicon(cleanWord);
      if (dictHit) return dictHit;
      return word;
    });

    // Clean up duplicate parentheticals & Hindi spelling/grammar mistakes via HindiTranslationReview
    working = HindiTranslationReview.applySpellingFixes(working).text;
  }

  // 6. If a non-Devanagari regional Indian language is selected, convert Devanagari into that regional script
  if (lang !== 'hi' && lang !== 'mr' && BRAHMIC_SCRIPT_BASE[lang]) {
    working = convertDevanagariToRegionalScript(working, lang);
  }

  // 7. Restore protected URLs and emails
  working = working.replace(/@@(\d+)@@/g, (_, idxStr) => {
    return protectedTokens[Number(idxStr)] || '';
  });

  if (TRANSLATION_MEMO_CACHE.size > 8000) {
    TRANSLATION_MEMO_CACHE.clear();
  }
  TRANSLATION_MEMO_CACHE.set(cacheKey, working);
  return working;
}

registerCoreLocaleTranslator(translateTextForLanguage);

/**
 * Translates a multi-line message (such as WhatsApp share text or AI consultation output)
 * line by line into the active language while preserving URLs and formatting.
 */
export function translateMultilineBlock(
  block: string,
  lang: SupportedLanguage = currentGlobalLanguage
): string {
  if (!block || lang === 'en-hi') return block;
  return block
    .split('\n')
    .map((line) => translateTextForLanguage(line, lang))
    .join('\n');
}

/**
 * Recursively translates all string fields of a report data structure (such as PdfPageSpec[])
 * into the selected language before PDF rendering or sharing, skipping internal keys like bannerKey or data URLs.
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
]);

export function deepTranslateReportPayload<T>(
  payload: T,
  lang: SupportedLanguage = currentGlobalLanguage
): T {
  if (!payload || lang === 'en-hi') return payload;
  if (typeof payload === 'string') {
    if (
      payload.startsWith('data:image/') ||
      payload.startsWith('http://') ||
      payload.startsWith('https://')
    ) {
      return payload;
    }
    return translateTextForLanguage(payload, lang) as unknown as T;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => deepTranslateReportPayload(item, lang)) as unknown as T;
  }
  if (typeof payload === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(payload as Record<string, any>)) {
      if (NON_TRANSLATABLE_OBJECT_KEYS.has(k)) {
        out[k] = v;
      } else {
        out[k] = deepTranslateReportPayload(v, lang);
      }
    }
    return out as T;
  }
  return payload;
}

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  tr: (text: string) => string;
  currentLanguageMeta: LanguageOption;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: currentGlobalLanguage,
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  tr: (text) => text,
  currentLanguageMeta: INDIAN_LANGUAGES[0],
});

// WeakMaps to track original React text nodes so switching between ANY languages is 100% reversible
const originalNodeTextMap = new WeakMap<Text, string>();
const lastTranslatedNodeTextMap = new WeakMap<Text, string>();
const originalElementAttrMap = new WeakMap<Element, { placeholder?: string; title?: string }>();

function applyDomTreeTranslation(root: Node, lang: SupportedLanguage): void {
  if (typeof document === 'undefined' || !root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (
        tag === 'SCRIPT' ||
        tag === 'STYLE' ||
        tag === 'NOSCRIPT' ||
        tag === 'OPTION' ||
        tag === 'TEXTAREA' ||
        parent.closest('[data-no-translate="true"]')
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode() as Text | null;
  while (currentNode) {
    const currentVal = currentNode.nodeValue || '';
    if (currentVal.trim()) {
      const lastTranslated = lastTranslatedNodeTextMap.get(currentNode);
      let sourceText = originalNodeTextMap.get(currentNode);

      if (sourceText === undefined || (lastTranslated !== undefined && currentVal !== lastTranslated)) {
        sourceText = currentVal;
        originalNodeTextMap.set(currentNode, sourceText);
      }

      const nextVal = translateTextForLanguage(sourceText, lang);
      if (nextVal !== currentVal) {
        currentNode.nodeValue = nextVal;
      }
      lastTranslatedNodeTextMap.set(currentNode, nextVal);
    }
    currentNode = walker.nextNode() as Text | null;
  }

  if (root instanceof Element || root instanceof Document) {
    const elements = root.querySelectorAll('[placeholder], [title]');
    elements.forEach((el) => {
      if (el.closest('[data-no-translate="true"]')) return;
      let saved = originalElementAttrMap.get(el);
      if (!saved) {
        saved = {
          placeholder: el.getAttribute('placeholder') || undefined,
          title: el.getAttribute('title') || undefined,
        };
        originalElementAttrMap.set(el, saved);
      }
      if (saved.placeholder) {
        const nextPh = translateTextForLanguage(saved.placeholder, lang);
        if (el.getAttribute('placeholder') !== nextPh) {
          el.setAttribute('placeholder', nextPh);
        }
      }
      if (saved.title) {
        const nextTitle = translateTextForLanguage(saved.title, lang);
        if (el.getAttribute('title') !== nextTitle) {
          el.setAttribute('title', nextTitle);
        }
      }
    });
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => detectInitialLanguage());

  const setLanguage = useCallback((nextLang: SupportedLanguage) => {
    setGlobalLanguage(nextLang);
    setLanguageState(nextLang);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const val = TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || fallback || key;
      return translateTextForLanguage(val, language);
    },
    [language]
  );

  const tr = useCallback(
    (text: string): string => {
      return translateTextForLanguage(text, language);
    },
    [language]
  );

  useEffect(() => {
    setGlobalLanguage(language);
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language === 'en-hi' ? 'hi' : language;

    let isApplying = false;
    let rafId: number | null = null;

    const observer = new MutationObserver(() => {
      if (isApplying || rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        isApplying = true;
        observer.disconnect();
        try {
          applyDomTreeTranslation(document.body, language);
        } finally {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
          isApplying = false;
        }
      });
    });

    isApplying = true;
    try {
      applyDomTreeTranslation(document.body, language);
    } finally {
      isApplying = false;
    }

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [language]);

  const currentLanguageMeta =
    INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tr, currentLanguageMeta }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
