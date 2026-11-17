import { BirthProfile, CalendarEvent } from '../types';
import { calculateVedicAstrologyFromBirth } from './astrologyAndCities';

const defaultAstro = calculateVedicAstrologyFromBirth('1988-08-18', '09:30', 28.6139, 77.2090);

export const DEFAULT_PROFILE: BirthProfile = {
  id: 'default-profile-1',
  name: 'Deepak Jain',
  dob: '1988-08-18', // Mulank 9 (Mars), Bhagyank 7 (Ketu)
  tob: '09:30',
  pob: 'New Delhi, India',
  lat: 28.6139,
  lng: 77.2090,
  gender: 'male',
  mobile: '9811234567',
  rashi: defaultAstro.rashi,
  sunSign: defaultAstro.sunSign,
  nakshatra: defaultAstro.nakshatra,
  nakshatraPada: defaultAstro.pada,
};

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Commercial Client Contract Signing',
    date: new Date().toISOString().split('T')[0],
    time: '11:15',
    category: 'contract',
    notes: 'Signing high-value software partnership agreement.',
    auspiciousScore: 92,
    auspiciousTag: 'Highly Auspicious',
    choghadiya: 'Shubh / Labh (Gainful)',
    hora: 'Jupiter Hora (Guru)',
    recommendation: 'Supremely favorable. Sign with green or gold ink facing North-East.',
  },
  {
    id: 'evt-2',
    title: 'New Vehicle Delivery & Puja',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:00',
    category: 'property',
    notes: 'Taking delivery of family vehicle.',
    auspiciousScore: 88,
    auspiciousTag: 'Favorable',
    choghadiya: 'Amrit (Nectar)',
    hora: 'Venus Hora (Shukra)',
    recommendation: 'Perform Ganesha and Hanuman Puja before driving out.',
  },
  {
    id: 'evt-3',
    title: 'Property Investment Discussion',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    time: '14:30',
    category: 'property',
    notes: 'Meeting real estate developers.',
    auspiciousScore: 45,
    auspiciousTag: 'Caution Advised',
    choghadiya: 'Rog / Kaal',
    hora: 'Saturn Hora',
    recommendation: 'Overlaps with challenging planetary period. Reschedule to morning 10:30 or ensure legal scrutiny on documents.',
  },
];

export function getSavedProfile(): BirthProfile {
  try {
    const raw = localStorage.getItem('vedic_user_profile');
    if (raw) {
      const parsed: BirthProfile = JSON.parse(raw);
      const astro = calculateVedicAstrologyFromBirth(
        parsed.dob || DEFAULT_PROFILE.dob,
        parsed.tob || '09:30',
        parsed.lat ?? 28.6139,
        parsed.lng ?? 77.2090
      );
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        rashi: astro.rashi,
        sunSign: astro.sunSign,
        nakshatra: astro.nakshatra,
        nakshatraPada: astro.pada,
      };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: BirthProfile): void {
  try {
    localStorage.setItem('vedic_user_profile', JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function getSavedEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem('vedic_calendar_events');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_CALENDAR_EVENTS;
}

export function saveEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem('vedic_calendar_events', JSON.stringify(events));
  } catch (e) {
    console.error(e);
  }
}

export function generateIcsCalendar(event: CalendarEvent): string {
  const [year, month, day] = event.date.split('-').map(Number);
  const [hours, minutes] = event.time.split(':').map(Number);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(hours + 1)}${pad(minutes)}00`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vedic Astro Numerology//Muhurat Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}@vedicnumerology.app
DTSTAMP:${dtStart}Z
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${event.title} [Muhurat Auspiciousness: ${event.auspiciousScore}%]
DESCRIPTION:Auspicious Tag: ${event.auspiciousTag}\\nChoghadiya: ${event.choghadiya}\\nHora: ${event.hora}\\nRecommendation: ${event.recommendation}\\nNotes: ${event.notes || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}
