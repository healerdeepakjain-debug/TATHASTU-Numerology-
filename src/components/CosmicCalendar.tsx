import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Sun,
  Sparkles,
  MessageCircle,
  ShieldCheck,
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

export const CosmicCalendar: React.FC<CosmicCalendarProps> = ({ profile }) => {
  const { currentAccount, activeProfile } = useTathastu();
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);

  const [events, setEvents] = useState<CalendarEvent[]>(getSavedEvents);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: 'New Venture Launch & First Transaction',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    category: 'finance' as CalendarEvent['category'],
    notes: 'Initiating transfer and signing contract.',
  });

  const panchangToday = getDailyPanchang(new Date(), mulank, bhagyank);

  const upcoming12MData = useMemo(
    () => getBestUpcomingEventsNext12Months(profile, new Date().toISOString()),
    [profile]
  );

  // Only Healer and Admin see the "Direct WhatsApp Client" notification button; Client Portal stays clean
  const isHealerOrAdmin =
    currentAccount?.role === 'healer' || currentAccount?.role === 'admin';

  const handleSendEventWhatsAppToClient = (params: {
    eventTitle: string;
    bestDate: string;
    extraDates?: string;
    timeWindow: string;
    choghadiyaHora: string;
    rahuKaal: string;
    recommendation: string;
  }) => {
    const rawMobile = activeProfile?.mobile || profile.mobile || TATHASTU_ADMIN_PHONE;
    const cleanDigits = rawMobile.replace(/\D/g, '').slice(-10);
    const targetPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : `91${TATHASTU_ADMIN_PHONE}`;

    const senderTitle =
      currentAccount?.role === 'healer'
        ? `${currentAccount.healerBrandName || currentAccount.name} (Healer: ${currentAccount.name} • 📞 ${currentAccount.mobile})`
        : `${TATHASTU_BRAND_NAME} (Helpline: +91 ${TATHASTU_ADMIN_PHONE})`;

    const lines = [
      `🕉️ *${TATHASTU_BRAND_NAME} — AUDITED LIFE PATH MUHURAT ALERT*`,
      `Namaste *${profile.name}* (DOB: ${profile.dob}),`,
      ``,
      `📌 *Event:* ${params.eventTitle}`,
      `📅 *Best Upcoming Auspicious Date:* ${params.bestDate}`,
      params.extraDates ? `🗓️ *Other Best Dates (Next 12 Months):* ${params.extraDates}` : '',
      `⏰ *Best Auspicious Time Window:* ${params.timeWindow}`,
      `✨ *Choghadiya & Hora:* ${params.choghadiyaHora}`,
      `⚠️ *Rahu Kaal (Time to Avoid):* ${params.rahuKaal}`,
      `📿 *Astrological Guidance:* ${params.recommendation}`,
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

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventDate = new Date(`${newEvent.date}T${newEvent.time}:00`);
    const panchangForEvent = getDailyPanchang(eventDate, mulank, bhagyank);

    let score = 70;
    let tag: CalendarEvent['auspiciousTag'] = 'Favorable';
    let recommendation = 'Auspicious time window for steady growth.';

    if (panchangForEvent.isRahuKaalNow) {
      score = 35;
      tag = 'Rahu Kaal Alert';
      recommendation = `Falls inside Rahu Kaal (${panchangForEvent.rahuKaalWindow.start} - ${panchangForEvent.rahuKaalWindow.end}). Strongly advised to shift to ${upcoming12MData.events12M[0]?.bestTimeWindow || '10:15 AM – 12:15 PM'}.`;
    } else if (panchangForEvent.currentChoghadiya.quality === 'Excellent') {
      score = 95;
      tag = 'Highly Auspicious';
      recommendation = `Aligned with Amrit Choghadiya & ${panchangForEvent.currentHora} Hora. Highly recommended for contracts, ventures, and long-term commitments.`;
    } else if (
      panchangForEvent.currentChoghadiya.quality === 'Good' ||
      panchangForEvent.currentChoghadiya.quality === 'Gainful'
    ) {
      score = 85;
      tag = 'Highly Auspicious';
      recommendation = `Shubh/Labh Choghadiya active. Favorable for financial transactions and client negotiations.`;
    } else {
      score = 55;
      tag = 'Caution Advised';
      recommendation = `Moderate vibration. Best upcoming alternative window: ${upcoming12MData.events12M[0]?.bestUpcomingDate} (${upcoming12MData.events12M[0]?.bestTimeWindow}).`;
    }

    const created: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      category: newEvent.category,
      notes: newEvent.notes,
      auspiciousScore: score,
      auspiciousTag: tag,
      choghadiya: `${panchangForEvent.currentChoghadiya.name} (${panchangForEvent.currentChoghadiya.quality})`,
      hora: `${panchangForEvent.currentHora} Hora`,
      recommendation,
    };

    const updated = [created, ...events];
    setEvents(updated);
    saveEvents(updated);
    setShowAddModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
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

      {/* NEXT 12 MONTHS BEST UPCOMING TIME FOR ALL LIFE PATH EVENTS ACCORDING TO CLIENT VEDIC ASTROLOGY */}
      <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-6 shadow-xl space-y-4">
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

      {/* Custom Audited Life Path Calendar Events */}
      <div className="bg-slate-900/90 border border-amber-500/25 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Custom Audited Life Path Calendar Events ({events.length})</span>
        </h2>

        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((evt) => {
              const matchedCategoryBest =
                upcoming12MData.events12M.find((e) => e.category === evt.category) ||
                upcoming12MData.events12M[0];
              return (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 hover:border-amber-400/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base font-bold text-amber-100">
                        {evt.title}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${
                          evt.auspiciousTag === 'Highly Auspicious' || evt.auspiciousTag === 'Favorable'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : evt.auspiciousTag === 'Rahu Kaal Alert'
                            ? 'bg-rose-950 text-rose-300 border-rose-500/40 animate-pulse'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {evt.auspiciousTag} ({evt.auspiciousScore}%)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-amber-300">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Scheduled: {evt.date}
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime12HourAmPm(evt.time)}
                      </span>
                      <span>•</span>
                      <span className="text-amber-200 font-semibold">{evt.choghadiya}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{evt.hora}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {evt.recommendation}
                    </p>

                    {matchedCategoryBest && (
                      <div className="text-[11px] text-emerald-300 font-mono pt-1">
                        ★ Best Upcoming 12-Month Vedic Muhurat for this Category:{' '}
                        <strong>
                          {matchedCategoryBest.bestUpcomingDate} ({matchedCategoryBest.bestTimeWindow})
                        </strong>{' '}
                        • Other Best Dates: {matchedCategoryBest.secondaryUpcomingDates.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Direct WhatsApp Button ONLY for Healer & Admin (Sync iCal removed as requested) */}
                    {isHealerOrAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSendEventWhatsAppToClient({
                            eventTitle: evt.title,
                            bestDate: `${evt.date} at ${evt.time} (Best 12M Vedic Date: ${matchedCategoryBest?.bestUpcomingDate || evt.date})`,
                            extraDates: matchedCategoryBest?.secondaryUpcomingDates.join(', '),
                            timeWindow: matchedCategoryBest?.bestTimeWindow || evt.time,
                            choghadiyaHora: `${evt.choghadiya} • ${evt.hora}`,
                            rahuKaal: matchedCategoryBest?.rahuKaalToAvoid || 'Avoid Rahu Kaal',
                            recommendation: evt.recommendation,
                          })
                        }
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                        title="Inform client directly on WhatsApp about this event & best 12-month Muhurat"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Direct WhatsApp</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-amber-500/20 text-slate-400">
            No custom events added yet. Click "Audit & Add Custom Event" above to evaluate a specific date.
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-amber-100 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <span>Schedule & Audit Auspicious Event</span>
            </h3>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Sign Property Deed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">
                    Scheduled Time (AM / PM) — {formatTime12HourAmPm(newEvent.time)}
                  </label>
                  <BirthTimeAmPmInput
                    value={newEvent.time}
                    onChange={(newTime) => setNewEvent({ ...newEvent, time: newTime })}
                    compact
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">
                  Category
                </label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as CalendarEvent['category'] })}
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="contract">Commercial Contract / Partnership</option>
                  <option value="finance">Banking / Major Investment</option>
                  <option value="property">Property Registration / Land Purchase</option>
                  <option value="travel">International Travel / Journey</option>
                  <option value="interview">Job Interview / Executive Pitch</option>
                  <option value="relationship">First Date / Matrimonial Meeting</option>
                  <option value="spiritual">Puja / Sacred Ceremony</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-200/90 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  placeholder="Key people present, specific goals..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Calculate Muhurat & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
