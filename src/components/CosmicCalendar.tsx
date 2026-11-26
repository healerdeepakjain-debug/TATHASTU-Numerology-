import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Sun,
  Moon,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Plane,
  Briefcase,
  FileSignature,
  IndianRupee,
  Home,
  Heart,
  GraduationCap,
  Flame,
  AlertTriangle,
  Compass,
  ChevronLeft,
  ChevronRight,
  Star,
  X,
} from 'lucide-react';
import { BirthProfile, CalendarEvent } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  getDailyPanchang,
  PLANETARY_PROFILES,
} from '../utils/numerology';
import { calculateVedicAstrologyFromBirth } from '../utils/astrologyAndCities';
import { getSavedEvents, saveEvents } from '../utils/storage';
import {
  useTathastu,
  TATHASTU_BRAND_NAME,
  TATHASTU_ADMIN_PHONE,
} from '../utils/tathastuStore';
import { BirthTimeAmPmInput, formatTime12HourAmPm } from './BirthTimeAmPmInput';

export interface BestUpcomingLifeEvent12M {
  id: string;
  category: CalendarEvent['category'];
  title: string;
  bestUpcomingDate: string;
  secondaryUpcomingDates: string[];
  bestTimeWindow: string;
  choghadiyaAndHora: string;
  rahuKaalToAvoid: string;
  nakshatraYoga: string;
  auspiciousScore: number;
  vedicAstrologyReason: string;
  mantraAndDhikrBeforeEvent: string;
}

export function getBestUpcomingEventsNext12Months(
  profile: BirthProfile,
  reportCreatedAtIso?: string
): {
  startFormatted: string;
  endFormatted: string;
  events12M: BestUpcomingLifeEvent12M[];
} {
  const m = calculateMulank(profile.dob);
  const b = calculateBhagyank(profile.dob);
  const astro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.209
  );
  const mPlanet = PLANETARY_PROFILES[m] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[b] || PLANETARY_PROFILES[9];

  // Always calculate the upcoming 12 months starting from Today's Report Generation Date
  // unless an explicit today/future ISO is passed (ignore legacy hardcoded 2026-01-03 / 2026-01-05 dates).
  const isLegacyDemoDate =
    !reportCreatedAtIso ||
    reportCreatedAtIso.startsWith('2026-01-03') ||
    reportCreatedAtIso.startsWith('2026-01-05');
  const baseDate = isLegacyDemoDate ? new Date() : new Date(reportCreatedAtIso);
  const endDate = new Date(baseDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Helper to find auspicious dates in a specific month offset whose day reduces to m, b, or friendly number
  const friendlySet = new Set<number>([
    m,
    b,
    ...(mPlanet.friendlyNumbers || [1, 3, 5, 6]),
  ]);

  const getAuspiciousDatesInMonthOffset = (monthOffset: number, count = 3): string[] => {
    const found: string[] = [];
    const targetMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, 1);
    const daysInM = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInM; d++) {
      const candidate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), d);
      if (candidate < baseDate) continue;
      const rootDay = ((d - 1) % 9) + 1;
      if (friendlySet.has(rootDay)) {
        found.push(fmt(candidate));
        if (found.length >= count) break;
      }
    }
    if (found.length === 0) {
      found.push(fmt(new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, 10)));
    }
    return found;
  };

  const templates: {
    id: string;
    category: CalendarEvent['category'];
    title: string;
    monthOffsets: number[];
    bestTimeWindow: string;
    choghadiyaAndHora: string;
    rahuKaalToAvoid: string;
    nakshatraYoga: string;
    score: number;
    reason: string;
    mantraDhikr: string;
  }[] = [
    {
      id: '12m-contract',
      category: 'contract',
      title: '1. Commercial Contract Signing, Business Launch & New Partnership',
      monthOffsets: [0, 1, 2, 4, 6, 8, 10, 11],
      bestTimeWindow: '10:15 AM – 12:15 PM (Abhijit & Labh Siddhi Muhurat)',
      choghadiyaAndHora: `Amrit / Labh Choghadiya • ${mPlanet.planet} Hora`,
      rahuKaalToAvoid: 'Avoid 12:00 PM – 01:30 PM on Wednesdays & 04:30 PM – 06:00 PM on Sundays',
      nakshatraYoga: `Pushya / Rohini / ${astro.nakshatra} Tara-Siddhi Yoga (${astro.rashi})`,
      score: 96,
      reason: `Synchronized with ${profile.name}'s Janma Rashi (${astro.rashi}), Nakshatra (${astro.nakshatra}), and Mulank ${m} (${mPlanet.planet}) for maximum commercial authority and zero contract disputes.`,
      mantraDhikr: `Vedic Mantra: "${mPlanet.beejMantra}" (108x) & "Om Shree Mahalakshmyai Namah" (21x) facing East.`,
    },
    {
      id: '12m-finance',
      category: 'finance',
      title: '2. Major Banking Investment, Gold Purchase, Capital Transfer & Wealth Deposit',
      monthOffsets: [0, 1, 3, 5, 7, 9, 10, 11],
      bestTimeWindow: '09:15 AM – 11:15 AM (Shubh & Amrit Dhana-Vriddhi Window)',
      choghadiyaAndHora: `Shubh Choghadiya • Guru (Jupiter) & ${bPlanet.planet} Hora`,
      rahuKaalToAvoid: 'Avoid 01:30 PM – 03:00 PM on Thursdays',
      nakshatraYoga: `Uttara Phalguni / Shravana / Dhana-Karaka Yoga (${astro.sunSign.split(' ')[0]})`,
      score: 95,
      reason: `Aligned with Destiny Bhagyank ${b} (${bPlanet.planet}) and 2nd/11th house planetary wealth transits from ${astro.rashi} Moon chart.`,
      mantraDhikr: `Vedic Mantra: "${bPlanet.beejMantra}" (108x) & "Om Hreem Shreem Kleem Maha Lakshmi Namah" (21x).`,
    },
    {
      id: '12m-property',
      category: 'property',
      title: '3. Property Registration, Land Purchase & Bhoomi Pujan',
      monthOffsets: [0, 2, 4, 5, 7, 9, 10, 11],
      bestTimeWindow: '08:30 AM – 10:45 AM (Sthira Lagna & Amrit Choghadiya)',
      choghadiyaAndHora: 'Amrit Choghadiya • Mangal & Shukra Hora',
      rahuKaalToAvoid: 'Avoid 03:00 PM – 04:30 PM on Tuesdays & 09:00 AM – 10:30 AM on Saturdays',
      nakshatraYoga: `Anuradha / Mrigashira / Revati Vastu-Siddhi Yoga`,
      score: 94,
      reason: `Calculated in Sthira (Fixed) Lagna harmonious with ${astro.rashi} and ${astro.nakshatra} (Pada ${astro.pada}) for permanent real-estate prosperity and Vastu peace.`,
      mantraDhikr: `Vedic Mantra: "Om Vastu Purushaya Namah" (21x) & "Om Kram Kreem Kroum Sah Bhaumaya Namah" (108x).`,
    },
    {
      id: '12m-griha-pravesh',
      category: 'property',
      title: '4. New Home Griha Pravesh, Office Inauguration & Vastu Shanti Puja',
      monthOffsets: [1, 2, 4, 6, 8, 9, 10, 11],
      bestTimeWindow: '07:45 AM – 09:45 AM (Vrishabha / Simha Sthira Lagna & Shubh Hora)',
      choghadiyaAndHora: 'Shubh / Amrit Choghadiya • Guru & Shukra Hora',
      rahuKaalToAvoid: 'Avoid Tuesday & Saturday afternoons and Amavasya Tithi',
      nakshatraYoga: `Rohini / Uttara Bhadrapada / Chitra Griha-Mangal Yoga`,
      score: 96,
      reason: `Energizes the 4th House Sukha-Sthana of ${profile.name} (${astro.rashi}) for domestic peace, abundance, and protection against Vastu Dosha.`,
      mantraDhikr: `Vedic Mantra: "Om Gan Ganapataye Namah" (108x) & "Om Vastu Devatabhyo Namah" (21x) with Kalash Pujan.`,
    },
    {
      id: '12m-interview',
      category: 'interview',
      title: '5. Executive Job Interview, Promotion Pitch, Government Tender & Legal Filing',
      monthOffsets: [0, 1, 3, 5, 6, 8, 10, 11],
      bestTimeWindow: '11:35 AM – 12:25 PM (Vijay & Abhijit Jaya Muhurat)',
      choghadiyaAndHora: 'Shubh / Amrit Choghadiya • Surya (Sun) Hora',
      rahuKaalToAvoid: 'Avoid 07:30 AM – 09:00 AM on Mondays',
      nakshatraYoga: `Ashwini / Hasta / Punarvasu Raja-Yoga`,
      score: 97,
      reason: `Activates 10th House Karma-Sthana and Surya-Brihaspati dignity for ${profile.name}, ensuring commanding speech and favorable authority decisions.`,
      mantraDhikr: `Vedic Mantra: "Om Hram Hreem Hroum Sah Suryaya Namah" (21x) & Aditya Hridaya Stotra before stepping out.`,
    },
    {
      id: '12m-relationship',
      category: 'relationship',
      title: '6. Matrimonial Meeting, Roka/Engagement, Vivah Sanskar & Partner Harmony',
      monthOffsets: [0, 2, 4, 5, 7, 8, 10, 11],
      bestTimeWindow: '05:15 PM – 06:45 PM (Godhuli & Shukra-Chandra Shubh Window)',
      choghadiyaAndHora: 'Shubh / Amrit Choghadiya • Shukra (Venus) Hora',
      rahuKaalToAvoid: 'Avoid 10:30 AM – 12:00 PM on Fridays',
      nakshatraYoga: `Rohini / Swati / Uttara Phalguni Saubhagya Yoga`,
      score: 95,
      reason: `Harmonizes 7th House Kalatra-Bhava with ${astro.rashi} Moon and Anahata (Heart) Chakra for lifelong marital affection and family unity.`,
      mantraDhikr: `Vedic Mantra: "Om Dram Dreem Droum Sah Shukraya Namah" (108x) & Gauri-Shankar Prarthana.`,
    },
    {
      id: '12m-vehicle',
      category: 'other',
      title: '7. New Vehicle Purchase, Delivery, Machinery Installation & Fleet Expansion',
      monthOffsets: [0, 2, 3, 5, 7, 8, 10, 11],
      bestTimeWindow: '10:30 AM – 12:15 PM (Char & Labh Vahana-Siddhi Window)',
      choghadiyaAndHora: 'Char / Shubh Choghadiya • Shukra (Venus) Hora',
      rahuKaalToAvoid: 'Avoid Saturday Rahu Kaal (09:00 AM – 10:30 AM) for vehicle delivery',
      nakshatraYoga: `Swati / Punarvasu / Chitra Vahana-Shubh Yoga`,
      score: 93,
      reason: `Balances Shukra (Luxury/Vehicles) and Shani (Machinery/Safety) with ${profile.name}'s birth chart to ensure zero accidents and auspicious utility.`,
      mantraDhikr: `Vedic Mantra: "Om Dram Dreem Droum Sah Shukraya Namah" & "Om Hanumate Namah" (21x) with Vahana Tilak.`,
    },
    {
      id: '12m-travel',
      category: 'travel',
      title: '8. International Travel, Visa Filing, Overseas Relocation & Pilgrimage',
      monthOffsets: [1, 2, 4, 5, 7, 8, 10, 11],
      bestTimeWindow: '06:45 AM – 08:45 AM (Char & Labh Yatra-Siddhi Muhurat)',
      choghadiyaAndHora: 'Char / Labh Choghadiya • Chandra (Moon) & Budh Hora',
      rahuKaalToAvoid: 'Avoid Disha-Shool & Rahu Kaal before stepping out',
      nakshatraYoga: `Ashwini / Pushya / Anuradha Safe-Journey Yoga`,
      score: 92,
      reason: `Aligned with movable Char Choghadiya and friendly Tara Bala from ${astro.nakshatra} for obstacle-free visas, profitable travel, and safe return.`,
      mantraDhikr: `Vedic Mantra: "Om Namo Bhagavate Vasudevaya" (27x) & "Om Shram Shreem Shroum Sah Chandraya Namah".`,
    },
    {
      id: '12m-medical',
      category: 'other',
      title: '9. Medical Treatment, Elective Surgery, Wellness Therapy & Health Recovery',
      monthOffsets: [0, 1, 3, 4, 6, 8, 9, 11],
      bestTimeWindow: '08:00 AM – 09:45 AM (Amrit Choghadiya & Dhanvantari Hora)',
      choghadiyaAndHora: 'Amrit Choghadiya • Surya & Chandra Hora',
      rahuKaalToAvoid: 'Avoid Rikta Tithis (4, 9, 14), eclipses, and Mars/Saturn Hora for elective procedures',
      nakshatraYoga: `Ashwini / Shatabhisha / Mrigashira Ayushya-Siddhi Yoga`,
      score: 94,
      reason: `Fortifies the 1st House Lagna vitality and cellular healing for ${profile.name} (${astro.rashi}), ensuring rapid recovery and accurate medical care.`,
      mantraDhikr: `Vedic Mantra: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam..." (Maha Mrityunjaya 21x) & Dhanvantari Mantra.`,
    },
    {
      id: '12m-education',
      category: 'interview',
      title: '10. Higher Education Admission, Competitive Exam Filing, Certification & Vidyarambham',
      monthOffsets: [0, 2, 3, 5, 6, 8, 9, 11],
      bestTimeWindow: '09:00 AM – 10:30 AM (Budh-Guru Medha-Siddhi Window)',
      choghadiyaAndHora: 'Shubh / Labh Choghadiya • Budh (Mercury) & Guru Hora',
      rahuKaalToAvoid: 'Avoid Wednesday 12:00 PM – 01:30 PM Rahu Kaal',
      nakshatraYoga: `Hasta / Shravana / Punarvasu Saraswati-Siddhi Yoga`,
      score: 95,
      reason: `Activates 5th & 9th Trikona houses of intellect and higher fortune for ${profile.name}, sharpening memory retention and exam success.`,
      mantraDhikr: `Vedic Mantra: "Om Aim Hreem Kleem Maha Saraswatyai Namah" (21x) & "Om Gram Greem Groum Sah Gurave Namah".`,
    },
    {
      id: '12m-branding',
      category: 'contract',
      title: '11. Name Correction Activation, Brand/Website Launch & Company Incorporation',
      monthOffsets: [0, 1, 3, 4, 6, 7, 9, 11],
      bestTimeWindow: '10:00 AM – 11:45 AM (Labh & Abhijit Pratishtha Muhurat)',
      choghadiyaAndHora: `Labh / Amrit Choghadiya • ${mPlanet.planet} & Shukra Hora`,
      rahuKaalToAvoid: 'Avoid Krishna Amavasya & Rahu Kaal when launching brand identity',
      nakshatraYoga: `Pushya / Uttara Phalguni / Revati Kirti-Siddhi Yoga`,
      score: 98,
      reason: `Directly synchronizes your Chaldean Name vibration with Mulank ${m} (${mPlanet.planet}) and Bhagyank ${b} (${bPlanet.planet}) for viral reach and goodwill.`,
      mantraDhikr: `Vedic Mantra: "${mPlanet.beejMantra}" (41x) while writing harmonized name in golden/green ink.`,
    },
    {
      id: '12m-spiritual',
      category: 'spiritual',
      title: '12. Sacred Puja, Rudrabhishek, Gemstone/Rudraksha Wearing & Mantra Diksha',
      monthOffsets: [0, 1, 2, 4, 5, 7, 9, 11],
      bestTimeWindow: '05:30 AM – 07:15 AM (Brahma & Amrit Siddha Muhurat)',
      choghadiyaAndHora: 'Amrit Choghadiya • Guru (Jupiter) Hora',
      rahuKaalToAvoid: 'Never initiate new Sankalpa during Rahu Kaal or Vishti Bhadra',
      nakshatraYoga: `Pushya / Punarvasu / Shravana Siddha-Amrit Yoga`,
      score: 99,
      reason: `Supreme pranic alignment for ${profile.name} (Mulank ${m}, Bhagyank ${b}) to energize Rudraksha, Ratna Gemstones, Yantras, and 9-Chakra healing.`,
      mantraDhikr: `Vedic Mantra: "${mPlanet.beejMantra}" (108x) & "${bPlanet.beejMantra}" (108x) with Panchamrit Abhishekam.`,
    },
  ];

  const events12M: BestUpcomingLifeEvent12M[] = templates.map((tpl) => {
    const allDates: string[] = [];
    for (const mOff of tpl.monthOffsets) {
      const ds = getAuspiciousDatesInMonthOffset(mOff, 1);
      allDates.push(...ds);
    }
    return {
      id: tpl.id,
      category: tpl.category,
      title: tpl.title,
      bestUpcomingDate: allDates[0] || fmt(baseDate),
      secondaryUpcomingDates: allDates.slice(1, 8),
      bestTimeWindow: tpl.bestTimeWindow,
      choghadiyaAndHora: tpl.choghadiyaAndHora,
      rahuKaalToAvoid: tpl.rahuKaalToAvoid,
      nakshatraYoga: tpl.nakshatraYoga,
      auspiciousScore: tpl.score,
      vedicAstrologyReason: tpl.reason,
      mantraAndDhikrBeforeEvent: tpl.mantraDhikr,
    };
  });

  return {
    startFormatted: fmt(baseDate),
    endFormatted: fmt(endDate),
    events12M,
  };
}

interface CosmicCalendarProps {
  profile: BirthProfile;
}

function getLocalTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface CustomEventTopicOption {
  id: string;
  label: string;
  category: CalendarEvent['category'];
  preferredChoghadiya: string[];
  preferredHoras: string[];
  topicPrecaution: string;
}

const CUSTOM_EVENT_TOPIC_OPTIONS: CustomEventTopicOption[] = [
  {
    id: 'puja_sacred',
    label: 'Puja / Sacred Ceremony / Havan',
    category: 'spiritual',
    preferredChoghadiya: ['Amrit', 'Shubh', 'Labh'],
    preferredHoras: ['Jupiter', 'Sun', 'Moon', 'Venus'],
    topicPrecaution: 'Light a pure ghee diya facing North-East, offer roli/akshat to Lord Ganesha, and recite Sankalp before beginning.',
  },
  {
    id: 'new_venture',
    label: 'New Venture Launch & First Transaction',
    category: 'finance',
    preferredChoghadiya: ['Labh', 'Amrit', 'Shubh'],
    preferredHoras: ['Jupiter', 'Mercury', 'Venus', 'Sun'],
    topicPrecaution: 'Offer sweet prasad (jaggery or mishri) to Lord Ganesha & Goddess Mahalakshmi and initiate the first token transaction with a sacred Swastik.',
  },
  {
    id: 'commercial_contract',
    label: 'Commercial Client Contract Signing',
    category: 'contract',
    preferredChoghadiya: ['Labh', 'Amrit', 'Shubh'],
    preferredHoras: ['Mercury', 'Jupiter', 'Venus', 'Sun'],
    topicPrecaution: 'Review all legal clauses twice, sit facing North or East while signing, and use a lucky-color or gold/green ink pen.',
  },
  {
    id: 'business_meeting',
    label: 'Business Meeting / Partnership Discussion',
    category: 'contract',
    preferredChoghadiya: ['Labh', 'Shubh', 'Amrit'],
    preferredHoras: ['Mercury', 'Jupiter', 'Sun'],
    topicPrecaution: 'Keep green cardamom or fennel seeds in mouth before entering, stay calm during negotiation, and finalize written minutes later in a favorable Hora.',
  },
  {
    id: 'banking_finance',
    label: 'Banking / Major Finance & Investment',
    category: 'finance',
    preferredChoghadiya: ['Labh', 'Amrit', 'Shubh'],
    preferredHoras: ['Jupiter', 'Venus', 'Mercury'],
    topicPrecaution: 'Avoid impulsive high-risk transfers; keep a silver coin or energized Shree Yantra card in wallet and split major payments if time is weak.',
  },
  {
    id: 'property_vastu',
    label: 'Property Registration / Griha Pravesh / Land Purchase',
    category: 'property',
    preferredChoghadiya: ['Shubh', 'Amrit', 'Labh'],
    preferredHoras: ['Mars', 'Venus', 'Jupiter'],
    topicPrecaution: 'Offer water & kumkum to Bhoomi Mata, carry a small piece of camphor & red cloth, and keep final registry handover aligned to Shubh/Amrit slot.',
  },
  {
    id: 'vehicle_purchase',
    label: 'New Vehicle Purchase & Delivery',
    category: 'property',
    preferredChoghadiya: ['Char', 'Shubh', 'Amrit', 'Labh'],
    preferredHoras: ['Venus', 'Mercury', 'Jupiter'],
    topicPrecaution: 'Tie a red mauli with neem/lemon protection, draw Swastik with kumkum on dashboard, and chant Lord Ganesha & Hanuman mantra before first drive.',
  },
  {
    id: 'travel_journey',
    label: 'Travel / Domestic or International Journey',
    category: 'travel',
    preferredChoghadiya: ['Char', 'Amrit', 'Labh', 'Shubh'],
    preferredHoras: ['Moon', 'Mercury', 'Venus', 'Jupiter'],
    topicPrecaution: 'Follow Disha Shool parihar (take curd/ghee/fennel before stepping out) and step out with the right foot after praying to Lord Ganesha.',
  },
  {
    id: 'interview_career',
    label: 'Job Interview / Career Joining / Executive Pitch',
    category: 'interview',
    preferredChoghadiya: ['Amrit', 'Labh', 'Shubh'],
    preferredHoras: ['Sun', 'Jupiter', 'Mercury'],
    topicPrecaution: 'Take a spoon of curd & sugar before leaving home, wear your ruling planet lucky color accent, and meditate 2 minutes on calm clarity.',
  },
  {
    id: 'marriage_family',
    label: 'Marriage / Engagement / Family Ceremony',
    category: 'relationship',
    preferredChoghadiya: ['Shubh', 'Amrit'],
    preferredHoras: ['Venus', 'Jupiter', 'Moon'],
    topicPrecaution: 'Invoke Kuldevta & Lord Ganesha with saffron tilak, offer white/yellow sweets to elders, and avoid heated words during caution windows.',
  },
  {
    id: 'education_exam',
    label: 'Education / Exam / Course Admission',
    category: 'other',
    preferredChoghadiya: ['Amrit', 'Shubh', 'Labh'],
    preferredHoras: ['Mercury', 'Jupiter', 'Sun'],
    topicPrecaution: 'Pray to Maa Saraswati & Lord Ganesha, keep a yellow/green handkerchief, and read instructions calmly before starting.',
  },
  {
    id: 'medical_health',
    label: 'Medical Consultation / Health Procedure',
    category: 'other',
    preferredChoghadiya: ['Amrit', 'Shubh', 'Char'],
    preferredHoras: ['Sun', 'Jupiter', 'Moon'],
    topicPrecaution: 'Chant Maha Mrityunjaya Mantra (11 times) and donate a small portion of food/medicine in charity before the appointment.',
  },
  {
    id: 'custom_other',
    label: 'Other Custom Event',
    category: 'other',
    preferredChoghadiya: ['Amrit', 'Shubh', 'Labh'],
    preferredHoras: ['Jupiter', 'Venus', 'Mercury'],
    topicPrecaution: 'Begin with 11 chants of your planetary Beej Mantra, wear your lucky color, and keep a calm dharmic intention.',
  },
];

export const CosmicCalendar: React.FC<CosmicCalendarProps> = ({ profile }) => {
  const { currentAccount, activeProfile } = useTathastu();
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const todayLocalIso = useMemo(() => getLocalTodayIso(), []);

  const [events, setEvents] = useState<CalendarEvent[]>(() => getSavedEvents(profile.id));
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalAddedNotice, setModalAddedNotice] = useState<string | null>(null);

  // Keep custom audited events synced when switching between clients
  useEffect(() => {
    setEvents(getSavedEvents(profile.id));
  }, [profile.id]);

  // New Event Form State — Category first, no default pre-filled title or notes text
  const [newEvent, setNewEvent] = useState({
    topicId: CUSTOM_EVENT_TOPIC_OPTIONS[0].id,
    customTitle: '',
    date: getLocalTodayIso(),
    time: '10:30',
    notes: '',
  });

  const [selectedMuhuratDate, setSelectedMuhuratDate] = useState<string>(() => getLocalTodayIso());
  const [selectedActivityId, setSelectedActivityId] = useState<string>('business');
  const [muhuratAddedToast, setMuhuratAddedToast] = useState<string | null>(null);

  const dailyMuhuratActivities = useMemo(
    () => [
      {
        id: 'business',
        label: 'Business Meeting',
        shortLabel: 'Business',
        category: 'contract' as CalendarEvent['category'],
        icon: Briefcase,
        preferredChoghadiya: ['Labh', 'Amrit', 'Shubh'],
        preferredHoras: ['Mercury', 'Jupiter', 'Sun', 'Venus'],
        guidance: 'Ideal for board meetings, client negotiations, sales closures, and executive decisions.',
        specialWindow: { label: 'Abhijit Vijay Muhurat', start: '11:45', end: '12:33', reason: 'Universal victory window for high-stakes business meetings' },
      },
      {
        id: 'travel',
        label: 'Travel & Journey',
        shortLabel: 'Travel',
        category: 'travel' as CalendarEvent['category'],
        icon: Plane,
        preferredChoghadiya: ['Char', 'Amrit', 'Labh'],
        preferredHoras: ['Moon', 'Mercury', 'Venus', 'Jupiter'],
        guidance: 'Best for flights, road trips, business tours, overseas departures, and pilgrimages.',
        specialWindow: { label: 'Morning Char-Yatra Muhurat', start: '07:30', end: '09:00', reason: 'Dynamic movable vibration for smooth, delay-free transit' },
      },
      {
        id: 'contract',
        label: 'Sign Contract / Deal',
        shortLabel: 'Contracts',
        category: 'contract' as CalendarEvent['category'],
        icon: FileSignature,
        preferredChoghadiya: ['Amrit', 'Labh', 'Shubh'],
        preferredHoras: ['Jupiter', 'Mercury', 'Sun'],
        guidance: 'Ensures clarity, binding trust, and long-term profitability on legal & commercial agreements.',
        specialWindow: { label: 'Abhijit Siddhi Muhurat', start: '11:45', end: '12:33', reason: 'Destroys minor doshas during official contract signing' },
      },
      {
        id: 'finance',
        label: 'Finance & Investment',
        shortLabel: 'Finance',
        category: 'finance' as CalendarEvent['category'],
        icon: IndianRupee,
        preferredChoghadiya: ['Labh', 'Amrit', 'Shubh'],
        preferredHoras: ['Jupiter', 'Venus', 'Mercury'],
        guidance: 'Auspicious for gold purchase, bank deposits, capital transfers, trading, and wealth commitments.',
        specialWindow: { label: 'Dhana-Vriddhi Window', start: '09:15', end: '10:45', reason: 'Aligns commercial flow with Guru-Budh prosperity rays' },
      },
      {
        id: 'property',
        label: 'Property & Vastu',
        shortLabel: 'Property',
        category: 'property' as CalendarEvent['category'],
        icon: Home,
        preferredChoghadiya: ['Amrit', 'Shubh', 'Labh'],
        preferredHoras: ['Mars', 'Venus', 'Jupiter'],
        guidance: 'Favorable for land registry, home booking, Griha Pravesh, and office inauguration.',
        specialWindow: { label: 'Sthira-Lagna Vastu Window', start: '08:30', end: '10:15', reason: 'Fixed earth stability for permanent real-estate prosperity' },
      },
      {
        id: 'relationship',
        label: 'Marriage & Family',
        shortLabel: 'Family',
        category: 'relationship' as CalendarEvent['category'],
        icon: Heart,
        preferredChoghadiya: ['Shubh', 'Amrit', 'Char'],
        preferredHoras: ['Venus', 'Moon', 'Jupiter'],
        guidance: 'Harmonizes emotional warmth for Roka, matrimonial meets, proposals, and family celebrations.',
        specialWindow: { label: 'Godhuli Saubhagya Muhurat', start: '17:30', end: '18:30', reason: 'Sacred twilight window blessed for love and harmony' },
      },
      {
        id: 'interview',
        label: 'Interview & Career',
        shortLabel: 'Career',
        category: 'interview' as CalendarEvent['category'],
        icon: GraduationCap,
        preferredChoghadiya: ['Amrit', 'Shubh', 'Labh'],
        preferredHoras: ['Sun', 'Jupiter', 'Mercury'],
        guidance: 'Boosts confidence, articulation, and authority favor in job interviews, exams, and promotions.',
        specialWindow: { label: 'Abhijit Raja-Yoga Window', start: '11:45', end: '12:33', reason: 'Activates 10th-house authority and persuasive speech' },
      },
      {
        id: 'spiritual',
        label: 'Puja & Healing',
        shortLabel: 'Spiritual',
        category: 'spiritual' as CalendarEvent['category'],
        icon: Flame,
        preferredChoghadiya: ['Amrit', 'Shubh'],
        preferredHoras: ['Jupiter', 'Moon', 'Sun'],
        guidance: 'Supreme pranic clarity for Sankalpa, Rudrabhishek, gemstone wearing, meditation, and chakra healing.',
        specialWindow: { label: 'Brahma Amrit Muhurat', start: '04:36', end: '05:24', reason: 'Purest Sattvic vibration for mantra siddhi and divine grace' },
      },
    ],
    []
  );

  const selectedDailyMuhurat = useMemo(() => {
    const parsedParts = selectedMuhuratDate.split('-').map(Number);
    const year = parsedParts[0] || new Date().getFullYear();
    const month = (parsedParts[1] || 1) - 1;
    const day = parsedParts[2] || 1;
    const dayRefDate = new Date(year, month, day, 10, 0, 0);
    const nightRefDate = new Date(year, month, day, 20, 0, 0);

    const dayPanchang = getDailyPanchang(dayRefDate, mulank, bhagyank);
    const nightPanchang = getDailyPanchang(nightRefDate, mulank, bhagyank);

    const activity =
      dailyMuhuratActivities.find((a) => a.id === selectedActivityId) ||
      dailyMuhuratActivities[0];

    const weekdayIdx = dayRefDate.getDay();
    const dishaShoolMap: Record<number, { avoidDir: string; luckyDir: string; remedy: string }> = {
      0: { avoidDir: 'West', luckyDir: 'East / North-East', remedy: 'Eat a small piece of betel leaf or ghee before departing West.' },
      1: { avoidDir: 'East', luckyDir: 'North / West', remedy: 'Look in a mirror or take a sip of milk before departing East.' },
      2: { avoidDir: 'North', luckyDir: 'South / East', remedy: 'Have a tiny piece of jaggery (Gud) before departing North.' },
      3: { avoidDir: 'North', luckyDir: 'East / West', remedy: 'Chew 2–3 coriander (Dhaniya) seeds before departing North.' },
      4: { avoidDir: 'South', luckyDir: 'North / East', remedy: 'Take a spoon of curd (Dahi) or cumin before departing South.' },
      5: { avoidDir: 'West', luckyDir: 'North / South-East', remedy: 'Take a spoon of curd (Dahi) before departing West.' },
      6: { avoidDir: 'East', luckyDir: 'West / South', remedy: 'Have a small piece of ginger or black sesame before departing East.' },
    };
    const gulikaMap: Record<number, string> = {
      0: '03:00 PM – 04:30 PM',
      1: '01:30 PM – 03:00 PM',
      2: '12:00 PM – 01:30 PM',
      3: '10:30 AM – 12:00 PM',
      4: '09:00 AM – 10:30 AM',
      5: '07:30 AM – 09:00 AM',
      6: '06:00 AM – 07:30 AM',
    };
    const yamagandaMap: Record<number, string> = {
      0: '12:00 PM – 01:30 PM',
      1: '10:30 AM – 12:00 PM',
      2: '09:00 AM – 10:30 AM',
      3: '07:30 AM – 09:00 AM',
      4: '06:00 AM – 07:30 AM',
      5: '03:00 PM – 04:30 PM',
      6: '01:30 PM – 03:00 PM',
    };

    const toMins = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const rStart = toMins(dayPanchang.rahuKaalWindow.start);
    const rEnd = toMins(dayPanchang.rahuKaalWindow.end);

    const overlapsRahu = (startStr: string, endStr: string, isNightSlot: boolean) => {
      if (isNightSlot) return false;
      const s = toMins(startStr);
      const e = toMins(endStr);
      return s < rEnd && e > rStart;
    };

    const dayLordByWeekday = [1, 2, 9, 5, 3, 6, 8];
    const horaCycle = [1, 6, 5, 2, 8, 3, 9];
    const startHoraIdx = horaCycle.indexOf(dayLordByWeekday[weekdayIdx]);

    const getHoraForTime = (startStr: string) => {
      const [h] = startStr.split(':').map(Number);
      const hrsSince6 = ((h - 6) % 24 + 24) % 24;
      const pNum = horaCycle[(startHoraIdx + hrsSince6) % horaCycle.length];
      return PLANETARY_PROFILES[pNum]?.planet || 'Jupiter';
    };

    const mPlanet = PLANETARY_PROFILES[mulank] || PLANETARY_PROFILES[1];
    const bPlanet = PLANETARY_PROFILES[bhagyank] || PLANETARY_PROFILES[9];
    const friendlyNumbers = new Set([
      mulank,
      bhagyank,
      ...(mPlanet.friendlyNumbers || []),
      ...(bPlanet.friendlyNumbers || []),
    ]);
    const dayPersonalBonus = friendlyNumbers.has(dayPanchang.personalDayNumber) ? 8 : 2;

    const allSlots = [
      ...dayPanchang.choghadiyaPeriods.map((p) => ({ ...p, periodType: 'Day' as const })),
      ...nightPanchang.choghadiyaPeriods.slice(0, 4).map((p) => ({ ...p, periodType: 'Evening/Night' as const })),
    ];

    const evaluatedWindows = allSlots.map((slot, idx) => {
      const horaPlanet = getHoraForTime(slot.startTime);
      const rahuClash = overlapsRahu(slot.startTime, slot.endTime, slot.periodType !== 'Day');
      const isPreferredChog = activity.preferredChoghadiya.includes(slot.name);
      const isPreferredHora = activity.preferredHoras.some((h) =>
        horaPlanet.toLowerCase().includes(h.toLowerCase())
      );

      let score = 50 + dayPersonalBonus;
      if (slot.name === 'Amrit') score += 32;
      else if (slot.name === 'Shubh') score += 27;
      else if (slot.name === 'Labh') score += 28;
      else if (slot.name === 'Char') score += activity.id === 'travel' ? 30 : 18;
      else if (slot.name === 'Udveg') score -= 24;
      else if (slot.name === 'Rog') score -= 28;
      else if (slot.name === 'Kaal') score -= 32;

      if (isPreferredChog) score += 8;
      if (isPreferredHora) score += 6;
      if (rahuClash) score = Math.min(score - 38, 34);
      score = Math.max(18, Math.min(99, score));

      let tier: 'Best Muhurat' | 'Good Window' | 'Neutral' | 'Avoid' = 'Neutral';
      if (rahuClash || ['Rog', 'Kaal', 'Udveg'].includes(slot.name)) {
        tier = 'Avoid';
      } else if (score >= 86) {
        tier = 'Best Muhurat';
      } else if (score >= 72) {
        tier = 'Good Window';
      }

      const reason = rahuClash
        ? `Overlaps with Rahu Kaal (${formatTime12HourAmPm(dayPanchang.rahuKaalWindow.start)} – ${formatTime12HourAmPm(dayPanchang.rahuKaalWindow.end)}). Avoid initiating ${activity.label.toLowerCase()}.`
        : tier === 'Best Muhurat'
          ? `${slot.name} Choghadiya (${slot.quality}) + ${horaPlanet} Hora strongly amplifies ${activity.label.toLowerCase()} for Mulank ${mulank} & Bhagyank ${bhagyank}.`
          : tier === 'Good Window'
            ? `Supportive ${slot.name} Choghadiya with ${horaPlanet} Hora for steady execution of ${activity.label.toLowerCase()}.`
            : `${slot.name} Choghadiya carries ${slot.quality.toLowerCase()} energy; prefer one of the top green Muhurat windows instead.`;

      return {
        id: `muhurat-slot-${idx}-${slot.startTime}`,
        name: slot.name,
        quality: slot.quality,
        periodType: slot.periodType,
        start24: slot.startTime,
        end24: slot.endTime,
        windowLabel: `${formatTime12HourAmPm(slot.startTime)} – ${formatTime12HourAmPm(slot.endTime)}`,
        horaPlanet,
        rahuClash,
        score,
        tier,
        reason,
      };
    });

    const auspiciousWindows = evaluatedWindows
      .filter((w) => w.tier === 'Best Muhurat' || w.tier === 'Good Window')
      .sort((a, b) => b.score - a.score);

    const avoidWindows = evaluatedWindows.filter((w) => w.tier === 'Avoid');

    const dateFormatted = dayRefDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const dayHarmonyScore = Math.min(
      98,
      Math.max(
        64,
        (auspiciousWindows[0]?.score || 76) - (weekdayIdx === 6 && activity.id === 'travel' ? 4 : 0)
      )
    );

    return {
      activity,
      dateFormatted,
      vara: dayPanchang.vara,
      personalDayNumber: dayPanchang.personalDayNumber,
      luckyNumbers: dayPanchang.luckyNumbers,
      rahuKaalLabel: `${formatTime12HourAmPm(dayPanchang.rahuKaalWindow.start)} – ${formatTime12HourAmPm(dayPanchang.rahuKaalWindow.end)}`,
      gulikaLabel: gulikaMap[weekdayIdx] || '09:00 AM – 10:30 AM',
      yamagandaLabel: yamagandaMap[weekdayIdx] || '12:00 PM – 01:30 PM',
      dishaShool: dishaShoolMap[weekdayIdx] || dishaShoolMap[0],
      specialWindowFormatted: `${formatTime12HourAmPm(activity.specialWindow.start)} – ${formatTime12HourAmPm(activity.specialWindow.end)}`,
      auspiciousWindows,
      avoidWindows,
      dayHarmonyScore,
      beejMantra: mPlanet.beejMantra,
      luckyColor: mPlanet.luckyColor?.split(',')[0]?.trim() || 'Saffron Gold',
    };
  }, [selectedMuhuratDate, selectedActivityId, mulank, bhagyank, dailyMuhuratActivities]);

  const shiftMuhuratDateByDays = (deltaDays: number) => {
    const parts = selectedMuhuratDate.split('-').map(Number);
    const d = new Date(parts[0] || new Date().getFullYear(), (parts[1] || 1) - 1, (parts[2] || 1) + deltaDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedMuhuratDate(`${y}-${m}-${day}`);
  };

  const setMuhuratQuickOffset = (offsetFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetFromToday);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedMuhuratDate(`${y}-${m}-${day}`);
  };

  const handleScheduleMuhuratWindow = (slot: {
    windowLabel: string;
    start24: string;
    name: string;
    quality: string;
    horaPlanet: string;
    score: number;
    reason: string;
  }) => {
    const created: CalendarEvent = {
      id: `evt-${Date.now()}`,
      profileId: profile.id,
      title: `${selectedDailyMuhurat.activity.label}`,
      date: selectedMuhuratDate,
      time: slot.start24,
      category: selectedDailyMuhurat.activity.category,
      notes: '',
      auspiciousScore: slot.score,
      auspiciousTag: slot.score >= 82 ? 'Highly Auspicious' : 'Favorable',
      choghadiya: `${slot.name} (${slot.quality})`,
      hora: `${slot.horaPlanet} Hora`,
      rahuKaalLabel: selectedDailyMuhurat.rahuKaalLabel,
      recommendation: slot.reason,
      sameDateBestWindows: selectedDailyMuhurat.auspiciousWindows.slice(0, 3).map((w) => ({
        windowLabel: w.windowLabel,
        start24: w.start24,
        score: w.score,
        choghadiya: `${w.name} (${w.quality})`,
        hora: `${w.horaPlanet} Hora`,
      })),
      precautionsAndRemedies: [
        `Wear ${selectedDailyMuhurat.luckyColor} accent and recite "${selectedDailyMuhurat.beejMantra}" (11x) before starting.`,
        `Disha Shool Guidance: Best direction ${selectedDailyMuhurat.dishaShool.luckyDir}; avoid ${selectedDailyMuhurat.dishaShool.avoidDir} (${selectedDailyMuhurat.dishaShool.remedy}).`,
        `Strictly avoid Rahu Kaal (${selectedDailyMuhurat.rahuKaalLabel}); if unavoidable, offer jaggery/water to Lord Ganesha before proceeding.`,
      ],
    };
    const updated = [created, ...events];
    setEvents(updated);
    saveEvents(updated, profile.id);
    setMuhuratAddedToast(
      `Added "${created.title}" on ${selectedDailyMuhurat.dateFormatted} (${slot.windowLabel}) to Custom Audited Events!`
    );
    setTimeout(() => setMuhuratAddedToast(null), 4000);
  };

  const panchangToday = getDailyPanchang(new Date(), mulank, bhagyank);

  const upcoming12MData = useMemo(
    () => getBestUpcomingEventsNext12Months(profile, new Date().toISOString()),
    [profile]
  );

  // Only Healer and Admin see the "Direct WhatsApp Client" notification button; Client Portal stays clean
  const isHealerOrAdmin =
    currentAccount?.role === 'healer' || currentAccount?.role === 'admin';

  // Live Vedic Astrology + Numerology Audit Calculator for the Custom Event form (Category + Date + Time)
  const customEventLiveAudit = useMemo(() => {
    const selectedTopic =
      CUSTOM_EVENT_TOPIC_OPTIONS.find((t) => t.id === newEvent.topicId) ||
      CUSTOM_EVENT_TOPIC_OPTIONS[0];
    const safeDate = newEvent.date && newEvent.date >= todayLocalIso ? newEvent.date : todayLocalIso;
    const safeTime = newEvent.time || '10:30';
    const [yy, mm, dd] = safeDate.split('-').map(Number);
    const [hh, min] = safeTime.split(':').map(Number);

    const exactDateObj = new Date(
      yy || new Date().getFullYear(),
      (mm || 1) - 1,
      dd || 1,
      Number.isFinite(hh) ? hh : 10,
      Number.isFinite(min) ? min : 30,
      0
    );
    const dayRefDate = new Date(
      yy || new Date().getFullYear(),
      (mm || 1) - 1,
      dd || 1,
      10,
      0,
      0
    );
    const nightRefDate = new Date(
      yy || new Date().getFullYear(),
      (mm || 1) - 1,
      dd || 1,
      20,
      0,
      0
    );

    const exactPanchang = getDailyPanchang(exactDateObj, mulank, bhagyank);
    const dayPanchang = getDailyPanchang(dayRefDate, mulank, bhagyank);
    const nightPanchang = getDailyPanchang(nightRefDate, mulank, bhagyank);

    const weekdayIdx = exactDateObj.getDay();
    const dishaShoolMap: Record<number, { avoidDir: string; luckyDir: string; remedy: string }> = {
      0: { avoidDir: 'West', luckyDir: 'East / North', remedy: 'Eat pan/dalia or offer water to Sun before starting' },
      1: { avoidDir: 'East', luckyDir: 'North / West', remedy: 'Look in a mirror & take a sip of milk before starting' },
      2: { avoidDir: 'North', luckyDir: 'South / East', remedy: 'Take a small piece of jaggery (gur) before starting' },
      3: { avoidDir: 'North', luckyDir: 'East / West', remedy: 'Chew green coriander/til & remember Lord Ganesha' },
      4: { avoidDir: 'South', luckyDir: 'North / East', remedy: 'Take curd + pinch of cumin (jeera) before starting' },
      5: { avoidDir: 'West', luckyDir: 'East / South', remedy: 'Take curd & Mishri before initiating' },
      6: { avoidDir: 'East', luckyDir: 'West / South', remedy: 'Take a pinch of ginger or black sesame before starting' },
    };
    const dishaShool = dishaShoolMap[weekdayIdx] || dishaShoolMap[0];

    const mPlanet = PLANETARY_PROFILES[mulank] || PLANETARY_PROFILES[1];
    const bPlanet = PLANETARY_PROFILES[bhagyank] || PLANETARY_PROFILES[9];
    const luckyColor = mPlanet.luckyColor?.split(',')[0]?.trim() || 'Saffron Gold';
    const friendlyNumbers = new Set([
      mulank,
      bhagyank,
      ...(mPlanet.friendlyNumbers || []),
      ...(bPlanet.friendlyNumbers || []),
    ]);
    const dayPersonalBonus = friendlyNumbers.has(exactPanchang.personalDayNumber) ? 8 : 2;

    const toMins = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const rStart = toMins(dayPanchang.rahuKaalWindow.start);
    const rEnd = toMins(dayPanchang.rahuKaalWindow.end);
    const overlapsRahu = (startStr: string, endStr: string, isNightSlot: boolean) => {
      if (isNightSlot) return false;
      return toMins(startStr) < rEnd && toMins(endStr) > rStart;
    };

    const dayLordByWeekday = [1, 2, 9, 5, 3, 6, 8];
    const horaCycle = [1, 6, 5, 2, 8, 3, 9];
    const startHoraIdx = horaCycle.indexOf(dayLordByWeekday[weekdayIdx]);
    const getHoraForTime = (startStr: string) => {
      const [h] = startStr.split(':').map(Number);
      const hrsSince6 = ((h - 6) % 24 + 24) % 24;
      const pNum = horaCycle[(startHoraIdx + hrsSince6) % horaCycle.length];
      return PLANETARY_PROFILES[pNum]?.planet || 'Jupiter';
    };

    const scoreSlot = (
      chogName: string,
      horaPlanet: string,
      isRahuOverlap: boolean
    ): number => {
      let sc = 50 + dayPersonalBonus;
      if (chogName === 'Amrit') sc += 32;
      else if (chogName === 'Labh') sc += 28;
      else if (chogName === 'Shubh') sc += 26;
      else if (chogName === 'Char') sc += selectedTopic.category === 'travel' ? 28 : 16;
      else if (chogName === 'Udveg') sc -= 22;
      else if (chogName === 'Rog') sc -= 26;
      else if (chogName === 'Kaal') sc -= 30;

      if (selectedTopic.preferredChoghadiya.includes(chogName)) sc += 7;
      if (
        selectedTopic.preferredHoras.some((h) =>
          horaPlanet.toLowerCase().includes(h.toLowerCase())
        )
      ) {
        sc += 6;
      }
      if (isRahuOverlap) sc = Math.min(sc - 36, 34);
      return Math.max(20, Math.min(98, sc));
    };

    const currentChog = exactPanchang.currentChoghadiya;
    const currentHora = exactPanchang.currentHora;
    const isRahuAtSelectedTime = exactPanchang.isRahuKaalNow;
    const selectedScore = scoreSlot(currentChog.name, currentHora, isRahuAtSelectedTime);

    let tag: CalendarEvent['auspiciousTag'] = 'Favorable';
    if (isRahuAtSelectedTime) {
      tag = 'Rahu Kaal Alert';
    } else if (selectedScore >= 84) {
      tag = 'Highly Auspicious';
    } else if (selectedScore >= 70) {
      tag = 'Favorable';
    } else if (selectedScore >= 58) {
      tag = 'Neutral';
    } else {
      tag = 'Caution Advised';
    }

    const allSlots = [
      ...dayPanchang.choghadiyaPeriods.map((p) => ({ ...p, isNight: false })),
      ...nightPanchang.choghadiyaPeriods.slice(0, 4).map((p) => ({ ...p, isNight: true })),
    ];

    const sameDateBestWindows = allSlots
      .map((slot) => {
        const hPlanet = getHoraForTime(slot.startTime);
        const rahuHit = overlapsRahu(slot.startTime, slot.endTime, slot.isNight);
        const sc = scoreSlot(slot.name, hPlanet, rahuHit);
        return {
          windowLabel: `${formatTime12HourAmPm(slot.startTime)} – ${formatTime12HourAmPm(slot.endTime)}`,
          start24: slot.startTime,
          score: sc,
          choghadiya: `${slot.name} (${slot.quality})`,
          hora: `${hPlanet} Hora`,
          rahuHit,
        };
      })
      .filter((s) => !s.rahuHit && s.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const rahuKaalLabel = `${formatTime12HourAmPm(dayPanchang.rahuKaalWindow.start)} – ${formatTime12HourAmPm(dayPanchang.rahuKaalWindow.end)}`;
    const topBest = sameDateBestWindows[0];

    const recommendation = isRahuAtSelectedTime
      ? `Selected time (${formatTime12HourAmPm(safeTime)}) overlaps Rahu Kaal (${rahuKaalLabel}) — ${selectedScore}% suitability for ${profile.name}. Best time on this same date: ${topBest ? `${topBest.windowLabel} (${topBest.score}%)` : '10:30 AM – 12:00 PM'}. If work cannot be shifted, strictly apply the protective remedies below.`
      : selectedScore >= 84
      ? `Highly favorable (${selectedScore}%) for ${selectedTopic.label}! Active ${currentChog.name} Choghadiya (${currentChog.quality}) + ${currentHora} Hora strongly supports Mulank ${mulank} & Bhagyank ${bhagyank}.`
      : selectedScore >= 70
      ? `Supportive window (${selectedScore}%) under ${currentChog.name} Choghadiya & ${currentHora} Hora. For maximum boost on this same date, ${topBest ? `${topBest.windowLabel} scores ${topBest.score}%` : 'follow the lucky color & mantra below'}.`
      : `Challenging window (${selectedScore}%) due to ${currentChog.name} Choghadiya (${currentChog.quality}). Strongly recommended to shift to ${topBest ? `${topBest.windowLabel} (${topBest.score}%)` : 'a Shubh/Amrit slot'} on the same date — or follow the Vedic protection remedies below to prevent any loss.`;

    const precautionsAndRemedies: string[] = [
      selectedTopic.topicPrecaution,
      selectedScore < 70
        ? `Emergency Weak-Time Protection Shield: Before starting during this ${selectedScore}% window, chant "Om Gam Ganapataye Namah" (11x) + "${mPlanet.beejMantra}" (11x), donate a small coin or food to a needy person/cow, and avoid verbal anger or rushing paperwork.`
        : `Success Amplifier: Wear ${luckyColor} accent and recite "${mPlanet.beejMantra}" (11x) facing ${dishaShool.luckyDir} to lock in prosperity.`,
      `Disha Shool & Rahu Kaal Guard: Best facing/direction is ${dishaShool.luckyDir} (avoid ${dishaShool.avoidDir} — Remedy: ${dishaShool.remedy}). Keep Rahu Kaal (${rahuKaalLabel}) free from irreversible commitments.`,
    ];

    const dateFormatted = exactDateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return {
      selectedTopic,
      safeDate,
      safeTime,
      dateFormatted,
      score: selectedScore,
      tag,
      choghadiya: `${currentChog.name} (${currentChog.quality})`,
      hora: `${currentHora} Hora`,
      personalDayNumber: exactPanchang.personalDayNumber,
      rahuKaalLabel,
      dishaShool,
      recommendation,
      sameDateBestWindows,
      precautionsAndRemedies,
    };
  }, [newEvent.topicId, newEvent.date, newEvent.time, mulank, bhagyank, profile.name, todayLocalIso]);

  const handleSendEventWhatsAppToClient = (params: {
    eventTitle: string;
    bestDate: string;
    extraDates?: string;
    timeWindow: string;
    choghadiyaHora: string;
    rahuKaal: string;
    recommendation: string;
    auspiciousScore?: number;
    auspiciousTag?: string;
    sameDateBest?: string;
    precautions?: string[];
    healerNotes?: string;
  }) => {
    const rawMobile = activeProfile?.mobile || profile.mobile || TATHASTU_ADMIN_PHONE;
    const cleanDigits = rawMobile.replace(/\D/g, '').slice(-10);
    const targetPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : `91${TATHASTU_ADMIN_PHONE}`;

    const senderTitle =
      currentAccount?.role === 'healer'
        ? `${currentAccount.healerBrandName || currentAccount.name} (Healer: ${currentAccount.name} • 📞 ${currentAccount.mobile})`
        : `${TATHASTU_BRAND_NAME} (Helpline: +91 ${TATHASTU_ADMIN_PHONE})`;

    const lines = [
      `🕉️ *${TATHASTU_BRAND_NAME} — PERSONALIZED MUHURAT AUDIT*`,
      `Namaste *${profile.name}* (DOB: ${profile.dob}),`,
      ``,
      `📌 *Event Category:* ${params.eventTitle}`,
      `📅 *Event Date:* ${params.bestDate}`,
      `⏰ *Event Time:* ${params.timeWindow}`,
      params.auspiciousScore !== undefined
        ? `📊 *Vedic Auspiciousness:* ${params.auspiciousScore}% (${params.auspiciousTag || 'Audited'})`
        : '',
      `✨ *Choghadiya & Hora:* ${params.choghadiyaHora}`,
      params.sameDateBest ? `🌟 *Same-Date Best Time Windows:* ${params.sameDateBest}` : '',
      params.extraDates ? `🗓️ *Other Best Dates (Next 12M):* ${params.extraDates}` : '',
      `⚠️ *Rahu Kaal (Avoid):* ${params.rahuKaal}`,
      `📿 *Vedic Astrology Guidance:* ${params.recommendation}`,
      params.precautions && params.precautions.length > 0
        ? `🛡️ *Precautions & Remedies (Protection from Loss):*\n${params.precautions.map((p, idx) => `   ${idx + 1}. ${p}`).join('\n')}`
        : '',
      params.healerNotes ? `📝 *Healer Notes:* ${params.healerNotes}` : '',
      ``,
      `Sent with blessings by: *${senderTitle}*`,
    ].filter(Boolean);

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendAllCustomEventsWhatsApp = () => {
    if (events.length === 0) return;
    const rawMobile = activeProfile?.mobile || profile.mobile || TATHASTU_ADMIN_PHONE;
    const cleanDigits = rawMobile.replace(/\D/g, '').slice(-10);
    const targetPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : `91${TATHASTU_ADMIN_PHONE}`;
    const senderTitle =
      currentAccount?.role === 'healer'
        ? `${currentAccount.healerBrandName || currentAccount.name} (Healer: ${currentAccount.name} • 📞 ${currentAccount.mobile})`
        : `${TATHASTU_BRAND_NAME} (Helpline: +91 ${TATHASTU_ADMIN_PHONE})`;

    const eventBlocks = events.map((evt, idx) => {
      const bestSlots =
        evt.sameDateBestWindows && evt.sameDateBestWindows.length > 0
          ? evt.sameDateBestWindows.map((s) => `${s.windowLabel} (${s.score}%)`).join(' | ')
          : '';
      const remediesText =
        evt.precautionsAndRemedies && evt.precautionsAndRemedies.length > 0
          ? evt.precautionsAndRemedies.map((r) => `   • ${r}`).join('\n')
          : '';
      return [
        `*${idx + 1}. ${evt.title}*`,
        `   📅 Date & Time: ${evt.date} at ${formatTime12HourAmPm(evt.time)}`,
        `   📊 Vedic Suitability: *${evt.auspiciousScore}% (${evt.auspiciousTag})*`,
        `   ✨ Choghadiya & Hora: ${evt.choghadiya} • ${evt.hora}`,
        bestSlots ? `   🌟 Best Time on Same Date: ${bestSlots}` : '',
        evt.rahuKaalLabel ? `   ⚠️ Rahu Kaal: ${evt.rahuKaalLabel}` : '',
        remediesText ? `   🛡️ Precautions & Remedies:\n${remediesText}` : '',
        evt.notes?.trim() ? `   📝 Healer Notes: ${evt.notes.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    });

    const message = [
      `🕉️ *${TATHASTU_BRAND_NAME} — CUSTOM AUDITED MUHURAT SCHEDULE*`,
      `Namaste *${profile.name}* (DOB: ${profile.dob}),`,
      `Here is your personalized Vedic Muhurat audit for ${events.length} scheduled event${events.length > 1 ? 's' : ''}:`,
      ``,
      ...eventBlocks.flatMap((block) => [block, '']),
      `Sent with blessings by: *${senderTitle}*`,
    ].join('\n');

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const audit = customEventLiveAudit;
    const resolvedTitle =
      newEvent.topicId === 'custom_other' && newEvent.customTitle.trim()
        ? newEvent.customTitle.trim()
        : audit.selectedTopic.label;

    const created: CalendarEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      profileId: profile.id,
      title: resolvedTitle,
      date: audit.safeDate,
      time: audit.safeTime,
      category: audit.selectedTopic.category,
      notes: newEvent.notes.trim(),
      auspiciousScore: audit.score,
      auspiciousTag: audit.tag,
      choghadiya: audit.choghadiya,
      hora: audit.hora,
      rahuKaalLabel: audit.rahuKaalLabel,
      recommendation: audit.recommendation,
      sameDateBestWindows: audit.sameDateBestWindows.map((w) => ({
        windowLabel: w.windowLabel,
        start24: w.start24,
        score: w.score,
        choghadiya: w.choghadiya,
        hora: w.hora,
      })),
      precautionsAndRemedies: audit.precautionsAndRemedies,
    };

    const updated = [created, ...events];
    setEvents(updated);
    saveEvents(updated, profile.id);

    // Keep modal open so Healer can select and add multiple events one by one
    setNewEvent((prev) => ({
      ...prev,
      customTitle: '',
      notes: '',
    }));
    setModalAddedNotice(
      `Added "${created.title}" (${audit.dateFormatted}, ${formatTime12HourAmPm(audit.safeTime)} — ${audit.score}%). You can add another event or click Done.`
    );
    setTimeout(() => setModalAddedNotice(null), 5000);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated, profile.id);
  };

  const handleClearAllEvents = () => {
    setEvents([]);
    saveEvents([], profile.id);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>
                12-Month Vedic Astrology Muhurat Optimizer ({upcoming12MData.startFormatted} – {upcoming12MData.endFormatted})
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Audited Life Path Calendar & Next 12-Month Best Event Timings
            </h1>
            <p className="text-sm text-amber-200/80 max-w-3xl">
              Complete Vedic Astrology & Numerology Muhurat schedule for <strong>{profile.name}</strong> across the next 12 months from the report generation date. Every major life event shows its best upcoming dates, Siddha Choghadiya window, planetary Hora, and Rahu Kaal warning.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Audit & Add Custom Event</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE DAILY MUHURAT FINDER — CHECK ANY DATE & ACTIVITY */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 border-2 border-amber-400/45 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-amber-500/25 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Daily Muhurat Selector</span>
            </div>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-amber-100">
              Daily Muhurat Finder — Best Time Windows for Any Date &amp; Activity
            </h2>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Select any date and specific activity (Travel, Business Meeting, Contracts, Property, Marriage, Puja) to calculate personalized Vedic Choghadiya, Planetary Hora, Abhijit Muhurat, Disha Shool &amp; Rahu Kaal windows for <strong>{profile.name}</strong>.
            </p>
          </div>

          {/* Date Picker + Stepper + Quick Presets */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => shiftMuhuratDateByDays(-1)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/35 text-amber-300 cursor-pointer"
                title="Previous Day"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedMuhuratDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedMuhuratDate(e.target.value);
                }}
                aria-label="Select Date for Daily Muhurat"
                className="bg-slate-950 border border-amber-400/55 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold text-amber-100 focus:outline-none focus:border-amber-300"
              />
              <button
                type="button"
                onClick={() => shiftMuhuratDateByDays(1)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/35 text-amber-300 cursor-pointer"
                title="Next Day"
                aria-label="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'Today', offset: 0 },
                { label: 'Tomorrow', offset: 1 },
                { label: '+3 Days', offset: 3 },
                { label: '+7 Days', offset: 7 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setMuhuratQuickOffset(preset.offset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-200 cursor-pointer transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Selector Grid */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">
            Step 1: Choose Specific Activity
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {dailyMuhuratActivities.map((act) => {
              const Icon = act.icon;
              const isSelected = selectedActivityId === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setSelectedActivityId(act.id)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/25 to-emerald-500/20 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/15'
                      : 'bg-slate-950/85 border-amber-500/20 text-slate-300 hover:border-amber-400/45 hover:text-amber-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-900 border border-amber-500/25 text-amber-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Summary KPI Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/30">
            <div className="text-[10px] font-bold uppercase text-amber-300/80">Selected Date &amp; Vara</div>
            <div className="text-sm font-serif font-bold text-amber-100 mt-0.5">
              {selectedDailyMuhurat.dateFormatted}
            </div>
            <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
              Personal Day #{selectedDailyMuhurat.personalDayNumber} • Lucky: {selectedDailyMuhurat.luckyNumbers.join(', ')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
            <div className="text-[10px] font-bold uppercase text-emerald-300/90">
              ★ {selectedDailyMuhurat.activity.specialWindow.label}
            </div>
            <div className="text-sm font-mono font-black text-emerald-200 mt-0.5">
              {selectedDailyMuhurat.specialWindowFormatted}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-0.5">
              {selectedDailyMuhurat.activity.specialWindow.reason}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/35 border border-rose-500/40">
            <div className="text-[10px] font-bold uppercase text-rose-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Rahu Kaal (Strictly Avoid)</span>
            </div>
            <div className="text-sm font-mono font-black text-rose-200 mt-0.5">
              {selectedDailyMuhurat.rahuKaalLabel}
            </div>
            <div className="text-[10.5px] text-slate-300 mt-0.5">
              Yamaganda: {selectedDailyMuhurat.yamagandaLabel}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/90 border border-sky-500/35">
            <div className="text-[10px] font-bold uppercase text-sky-300 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              <span>Disha Shool &amp; Direction</span>
            </div>
            <div className="text-xs font-bold text-sky-100 mt-0.5">
              Best: {selectedDailyMuhurat.dishaShool.luckyDir} • Avoid: {selectedDailyMuhurat.dishaShool.avoidDir}
            </div>
            <div className="text-[10.5px] text-slate-300 mt-0.5">
              {selectedDailyMuhurat.dishaShool.remedy}
            </div>
          </div>
        </div>

        {muhuratAddedToast && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{muhuratAddedToast}</span>
          </div>
        )}

        {/* Ranked Auspicious Windows for Selected Date & Activity */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span>
                Most Auspicious Time Windows for {selectedDailyMuhurat.activity.label} ({selectedDailyMuhurat.auspiciousWindows.length} Verified Slots)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/35 px-2.5 py-0.5 rounded-lg">
              Day Activity Score: {selectedDailyMuhurat.dayHarmonyScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedDailyMuhurat.auspiciousWindows.map((slot, idx) => (
              <div
                key={slot.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                  idx === 0
                    ? 'bg-gradient-to-br from-emerald-950/60 via-slate-950 to-amber-950/35 border-emerald-400/70 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/90 border-amber-500/30 hover:border-amber-400/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm font-black text-amber-100">
                      {slot.periodType === 'Day' ? (
                        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Moon className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                      <span>{slot.windowLabel}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        slot.tier === 'Best Muhurat'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-amber-500/20 border border-amber-400/50 text-amber-200'
                      }`}
                    >
                      {idx === 0 ? '★ TOP PICK · ' : ''}
                      {slot.score}% {slot.tier}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                    <span className="text-emerald-300">
                      {slot.name} Choghadiya ({slot.quality})
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-amber-300">{slot.horaPlanet} Hora</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{slot.periodType}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{slot.reason}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/90">
                  <button
                    type="button"
                    onClick={() => handleScheduleMuhuratWindow(slot)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save to Calendar</span>
                  </button>

                  {isHealerOrAdmin && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSendEventWhatsAppToClient({
                          eventTitle: `${selectedDailyMuhurat.activity.label} — Daily Muhurat`,
                          bestDate: selectedDailyMuhurat.dateFormatted,
                          timeWindow: slot.windowLabel,
                          choghadiyaHora: `${slot.name} (${slot.quality}) • ${slot.horaPlanet} Hora`,
                          rahuKaal: selectedDailyMuhurat.rahuKaalLabel,
                          recommendation: `${slot.reason} Lucky Color: ${selectedDailyMuhurat.luckyColor}. Mantra: ${selectedDailyMuhurat.beejMantra}`,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Client</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Windows to Avoid on Selected Date */}
          {selectedDailyMuhurat.avoidWindows.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/30 space-y-1.5">
              <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Times to Avoid on {selectedDailyMuhurat.dateFormatted} (Rahu Kaal / Rog / Kaal / Udveg):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDailyMuhurat.avoidWindows.map((slot) => (
                  <span
                    key={slot.id}
                    className="px-2 py-1 rounded-lg bg-slate-950/90 border border-rose-500/35 text-[10.5px] font-mono text-rose-200"
                  >
                    {slot.windowLabel} ({slot.rahuClash ? 'Rahu Kaal' : slot.name})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Pre-Activity Blessing:</strong> Wear <strong>{selectedDailyMuhurat.luckyColor}</strong> &amp; chant{' '}
              <span className="italic">&ldquo;{selectedDailyMuhurat.beejMantra}&rdquo;</span> (11x) before starting {selectedDailyMuhurat.activity.label.toLowerCase()}.
            </span>
          </div>
        </div>
      </div>

      {/* NEXT 12 MONTHS BEST UPCOMING TIME FOR ALL LIFE PATH EVENTS ACCORDING TO CLIENT VEDIC ASTROLOGY */}
      <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/25 pb-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>
                Best Upcoming Auspicious Event Timings (Next 12 Months: {upcoming12MData.startFormatted} – {upcoming12MData.endFormatted})
              </span>
            </h2>
            <p className="text-xs text-amber-300/80">
              Calculated from {profile.name}’s Vedic Janma Rashi, Nakshatra, Mulank {mulank} & Bhagyank {bhagyank}.
              {isHealerOrAdmin && ' Use the Direct WhatsApp button to notify your client immediately.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {upcoming12MData.events12M.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-400/50 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-bold text-amber-100">
                    {item.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs shrink-0">
                    {item.auspiciousScore}% Siddha
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/25 space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-amber-300 font-bold">
                      ★ Primary Best Date: <strong className="text-amber-100 font-mono">{item.bestUpcomingDate}</strong>
                    </span>
                    <span className="text-emerald-300 font-mono font-semibold">
                      ⏰ {item.bestTimeWindow}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    <strong className="text-sky-300">Next 12M Auspicious Dates:</strong>{' '}
                    {item.secondaryUpcomingDates.join(' • ')}
                  </div>
                  <div className="text-[11px] text-amber-200">
                    <strong>Choghadiya & Hora:</strong> {item.choghadiyaAndHora} •{' '}
                    <span className="text-emerald-300">{item.nakshatraYoga}</span>
                  </div>
                  <div className="text-[11px] text-rose-300">
                    <strong>⚠️ Rahu Kaal (Avoid):</strong> {item.rahuKaalToAvoid}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-300">Vedic Astrology Alignment:</strong>{' '}
                  {item.vedicAstrologyReason}
                </p>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200">
                  <strong>Sacred Mantra & Dhikr Before Initiating:</strong> {item.mantraAndDhikrBeforeEvent}
                </div>
              </div>

              {/* Direct WhatsApp Button ONLY in Healer Portal & Admin Portal */}
              {isHealerOrAdmin && (
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendEventWhatsAppToClient({
                        eventTitle: item.title,
                        bestDate: item.bestUpcomingDate,
                        extraDates: item.secondaryUpcomingDates.join(', '),
                        timeWindow: item.bestTimeWindow,
                        choghadiyaHora: item.choghadiyaAndHora,
                        rahuKaal: item.rahuKaalToAvoid,
                        recommendation: `${item.vedicAstrologyReason} | Recite: ${item.mantraAndDhikrBeforeEvent}`,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Direct WhatsApp Client</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Planetary Choghadiya Schedule Overview */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <span>Today's Live 24-Hour Choghadiya Muhurat Cycle</span>
            </h2>
            <p className="text-xs text-amber-300/70">
              Current active window highlighted according to present time.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {panchangToday.choghadiyaPeriods.map((period, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border flex flex-col justify-between text-center transition-all ${
                period.isCurrent
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-950 border-amber-500/15'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-mono">
                {period.startTime} - {period.endTime}
              </span>
              <span
                className={`text-sm font-bold my-1 ${
                  period.quality === 'Excellent'
                    ? 'text-emerald-300'
                    : period.quality === 'Good' || period.quality === 'Gainful'
                    ? 'text-amber-300'
                    : 'text-rose-300'
                }`}
              >
                {period.name}
              </span>
              <span className="text-[10px] text-amber-400/80 truncate">
                {period.quality}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Audited Life Path Calendar Events (Healer Direct WhatsApp Service — Excluded from PDF Report) */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Custom Audited Life Path Calendar Events ({events.length})</span>
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                Healer WhatsApp Service • Not in Report PDF
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Only the events you select and audit for <strong>{profile.name}</strong> appear here so you can share exact personalized Muhurat guidance directly on WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setModalAddedNotice(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Audit &amp; Add Custom Event</span>
            </button>

            {isHealerOrAdmin && events.length > 0 && (
              <button
                type="button"
                onClick={handleSendAllCustomEventsWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp All ({events.length})</span>
              </button>
            )}

            {events.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllEvents}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold cursor-pointer transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((evt) => {
              const sameDayBestStr =
                evt.sameDateBestWindows && evt.sameDateBestWindows.length > 0
                  ? evt.sameDateBestWindows
                      .map((w) => `${w.windowLabel} (${w.score}%)`)
                      .join(' • ')
                  : '';
              return (
                <div
                  key={evt.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-500/25 hover:border-amber-400/45 transition-all flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-base font-bold text-amber-100">
                          {evt.title}
                        </span>
                        <span
                          className={`text-[10.5px] px-2.5 py-0.5 rounded-md font-bold uppercase border ${
                            evt.auspiciousScore >= 70
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : evt.auspiciousTag === 'Rahu Kaal Alert'
                              ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                              : 'bg-amber-950 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {evt.auspiciousScore}% • {evt.auspiciousTag}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-mono">
                        <span className="flex items-center gap-1 text-amber-300 font-semibold">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          Date: {evt.date}
                        </span>
                        <span className="flex items-center gap-1 text-amber-300 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          Time: {formatTime12HourAmPm(evt.time)}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-200">{evt.choghadiya}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-sky-300">{evt.hora}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                      {isHealerOrAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSendEventWhatsAppToClient({
                              eventTitle: evt.title,
                              bestDate: evt.date,
                              timeWindow: formatTime12HourAmPm(evt.time),
                              choghadiyaHora: `${evt.choghadiya} • ${evt.hora}`,
                              rahuKaal: evt.rahuKaalLabel || 'Avoid Rahu Kaal',
                              recommendation: evt.recommendation,
                              auspiciousScore: evt.auspiciousScore,
                              auspiciousTag: evt.auspiciousTag,
                              sameDateBest: sameDayBestStr,
                              precautions: evt.precautionsAndRemedies,
                              healerNotes: evt.notes,
                            })
                          }
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                          title="Send this audited event directly to client on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Direct WhatsApp</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
                        title="Remove event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{evt.recommendation}</p>

                  {sameDayBestStr && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/35 border border-emerald-500/30 text-[11.5px] text-emerald-200">
                      <strong className="text-emerald-300">★ Best Time on Same Date ({evt.date}):</strong>{' '}
                      <span className="font-mono">{sameDayBestStr}</span>
                    </div>
                  )}

                  {evt.precautionsAndRemedies && evt.precautionsAndRemedies.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-[11.5px] text-amber-100">
                      <div className="font-bold text-amber-300">
                        🛡️ Precautions &amp; Remedies (Safe Execution Even in Challenging Time):
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-amber-100/90">
                        {evt.precautionsAndRemedies.map((rem, rIdx) => (
                          <li key={rIdx}>{rem}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evt.notes && evt.notes.trim() !== '' && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-sky-200">
                      <strong className="text-sky-300">Healer Notes:</strong> {evt.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 sm:p-8 text-center bg-slate-950 rounded-2xl border border-dashed border-amber-500/30 text-slate-300 space-y-2">
            <div className="text-sm font-semibold text-amber-200">
              No custom events added for {profile.name} yet.
            </div>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Click <strong>&ldquo;+ Audit &amp; Add Custom Event&rdquo;</strong> to select a category, enter any present or future date &amp; time, see live Vedic auspiciousness (%), best same-date time slots (%), protective remedies, and add multiple events one by one to send directly on WhatsApp.
            </p>
          </div>
        )}
      </div>

      {/* Add & Audit Custom Event Modal (Category First -> Date & Time -> Live Vedic % Calculator -> Healer Notes -> Multi-Add) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/45 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-amber-500/25 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase mb-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>Healer Direct WhatsApp Service • Not in Report PDF</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Audit &amp; Add Custom Event ({profile.name})</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalAddedNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{modalAddedNotice}</span>
              </div>
            )}

            <form onSubmit={handleAddEvent} className="space-y-4">
              {/* 1. CATEGORY ON TOP */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                  1. Event Category / Topic
                </label>
                <select
                  value={newEvent.topicId}
                  onChange={(e) => setNewEvent({ ...newEvent, topicId: e.target.value })}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-100 focus:outline-none focus:border-amber-400"
                >
                  {CUSTOM_EVENT_TOPIC_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {newEvent.topicId === 'custom_other' && (
                  <input
                    type="text"
                    required
                    value={newEvent.customTitle}
                    onChange={(e) => setNewEvent({ ...newEvent, customTitle: e.target.value })}
                    className="mt-2 w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    placeholder="Enter custom event topic..."
                  />
                )}
              </div>

              {/* 2. EVENT DATE & TIME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                    2. Event Date (Present / Future)
                  </label>
                  <input
                    type="date"
                    required
                    min={todayLocalIso}
                    value={newEvent.date}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) setNewEvent({ ...newEvent, date: val < todayLocalIso ? todayLocalIso : val });
                    }}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-sm font-mono text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                    Event Time (AM / PM) — {formatTime12HourAmPm(newEvent.time)}
                  </label>
                  <BirthTimeAmPmInput
                    value={newEvent.time}
                    onChange={(newTime) => setNewEvent({ ...newEvent, time: newTime })}
                    compact
                  />
                </div>
              </div>

              {/* LIVE VEDIC ASTROLOGY AUDIT CALCULATOR RESULT */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-amber-500/35 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Live Vedic Astrology Audit for {customEventLiveAudit.dateFormatted}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${
                      customEventLiveAudit.score >= 70
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                        : customEventLiveAudit.tag === 'Rahu Kaal Alert'
                        ? 'bg-rose-600 text-white border-rose-300'
                        : 'bg-amber-500 text-slate-950 border-amber-300'
                    }`}
                  >
                    {customEventLiveAudit.score}% • {customEventLiveAudit.tag}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-200">
                    Choghadiya: {customEventLiveAudit.choghadiya}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300">
                    {customEventLiveAudit.hora}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/35 text-rose-200">
                    Rahu Kaal: {customEventLiveAudit.rahuKaalLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {customEventLiveAudit.recommendation}
                </p>

                {/* Same-Date Best Time Windows (%) */}
                {customEventLiveAudit.sameDateBestWindows.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      ★ Best Auspicious Time on This Same Date ({customEventLiveAudit.dateFormatted}) in %:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {customEventLiveAudit.sameDateBestWindows.map((win, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewEvent((prev) => ({ ...prev, time: win.start24 }))}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/65 hover:bg-emerald-900/75 border border-emerald-500/45 text-[11px] font-mono text-emerald-200 cursor-pointer transition-all text-left"
                          title="Click to apply this best time"
                        >
                          <strong className="text-emerald-300">{win.score}%</strong> • {win.windowLabel}{' '}
                          <span className="text-amber-300 underline ml-1">Use</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Precautions & Remedies even if work must happen in weak time */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <div className="text-[11px] font-bold text-amber-300">
                    🛡️ Precautions &amp; Remedies (Avoid Loss Even If Done During Challenging Time):
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-100/90 leading-relaxed">
                    {customEventLiveAudit.precautionsAndRemedies.map((rem, idx) => (
                      <li key={idx}>{rem}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. HEALER NOTES LAST (NO PRE-FILLED TEXT) */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                  3. Healer Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-amber-500/35 rounded-xl px-3 py-2 text-sm text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  placeholder="Write custom healer guidance or instructions for this client (optional)..."
                />
              </div>

              {/* ACTION BUTTONS: ADD EVENT ONE-BY-ONE + DONE */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Added Events in List: <strong className="text-amber-300">{events.length}</strong>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
                  >
                    Done ({events.length} Added)
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Event</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Quick view of events already added in this list while adding more one-by-one */}
            {events.length > 0 && (
              <div className="pt-3 border-t border-amber-500/20 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">
                  Events Added for {profile.name} ({events.length}):
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="min-w-0 truncate text-amber-100">
                        <strong className="text-emerald-300">{evt.auspiciousScore}%</strong> • {evt.title}{' '}
                        <span className="text-slate-400 font-mono">
                          ({evt.date} {formatTime12HourAmPm(evt.time)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 shrink-0 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
