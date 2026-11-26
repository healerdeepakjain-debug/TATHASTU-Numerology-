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

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

const LEGACY_SEED_EVENT_IDS = new Set(['evt-1', 'evt-2', 'evt-3']);

function getEventsStorageKey(profileId?: string): string {
  const cleanId = (profileId || '').trim();
  return cleanId ? `vedic_calendar_events_v2_${cleanId}` : 'vedic_calendar_events_v2';
}

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

export function getSavedEvents(profileId?: string): CalendarEvent[] {
  try {
    const key = getEventsStorageKey(profileId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: CalendarEvent[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((evt) => evt && !LEGACY_SEED_EVENT_IDS.has(evt.id));
      }
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveEvents(events: CalendarEvent[], profileId?: string): void {
  try {
    const key = getEventsStorageKey(profileId);
    const cleaned = (events || []).filter((evt) => evt && !LEGACY_SEED_EVENT_IDS.has(evt.id));
    localStorage.setItem(key, JSON.stringify(cleaned));
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
