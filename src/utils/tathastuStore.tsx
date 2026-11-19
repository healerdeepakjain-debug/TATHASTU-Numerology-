import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { sendBrowserNotification } from './notifications';
import { ParivarMemberRecord } from './parivarMilan';
import healerPortraitImg from '../assets/images/healer_ddeepak_jain_portrait_opt.jpg';

export const TATHASTU_LOGO_PATH = '/assets/aistudio/tathastu_logo_small_6cf3db26.jpg';
export const HEALER_DEEPAK_JAIN_IMAGE_PATH = healerPortraitImg;
export const TATHASTU_ADMIN_PHONE = '8899444444';
export const TATHASTU_ADMIN_EMAIL = 'healer.ddeepak.jain@gmail.com';
export const TATHASTU_APP_NAME = 'TATHASTU NUMEROLOGY';
export const TATHASTU_BRAND_NAME = 'TATHASTU THE DIVINE LIGHT';
export const TATHASTU_TAGLINE = 'One place . EVERY SOLUTION';
export const TATHASTU_DEFAULT_HEALER_NAME = 'Deepak Jain';
export const TATHASTU_OFFICIAL_APP_URL =
  'https://tathastu-vedic-chaldean-numerology-harmony-108.ai.studio';

export type UserRole = 'client' | 'healer' | 'admin';

export interface SubscriptionPlanOption {
  id: string;
  role: 'client' | 'healer';
  name: string;
  durationMonths: number;
  priceInr: number;
  maxProfiles: number;
  canDownloadShare: boolean;
  badge: string;
  features: string[];
}

export interface DiscountCouponRecord {
  id: string;
  code: string;
  discountPercent: number;
  flatDiscountInr: number;
  targetRole: 'all' | 'client' | 'healer';
  expiryDate: string;
  isActive: boolean;
  createdAtIso: string;
}

export interface BroadcastNotificationRecord {
  id: string;
  title: string;
  message: string;
  category: 'update' | 'offer' | 'muhurat' | 'announcement';
  targetAudience: 'all' | 'client' | 'healer';
  couponCode?: string;
  createdAtIso: string;
}

export interface FeedbackSuggestionRecord {
  id: string;
  accountId: string;
  ownerUid: string;
  senderRole: UserRole;
  senderName: string;
  senderMobile: string;
  senderEmail: string;
  category: 'feedback' | 'suggestion' | 'appreciation' | 'support';
  rating: number;
  ratedHealerId?: string;
  ratedHealerName?: string;
  message: string;
  adminReply?: string;
  createdAtIso: string;
}

export const CLIENT_PLANS: SubscriptionPlanOption[] = [
  {
    id: 'client_free_1m',
    role: 'client',
    name: 'Plan 1: Free Trial (1 Month)',
    durationMonths: 1,
    priceInr: 0,
    maxProfiles: 2, // 1 Self + 1 Family Member (1+1)
    canDownloadShare: false,
    badge: '1 Month Free • View Only',
    features: [
      '1 Self + 1 Family Member Profile (Max 2)',
      '1 Month Full App Viewing Access',
      '6 Daily Good/Bad Time & Mantra Notifications',
      'No Report Download, Print, Share or Direct WhatsApp',
    ],
  },
  {
    id: 'client_paid_3m',
    role: 'client',
    name: 'Plan 2: Quarterly Plan (3 Months)',
    durationMonths: 3,
    priceInr: 999,
    maxProfiles: 2,
    canDownloadShare: true,
    badge: '3 Months • ₹999 • Full Download/Share',
    features: [
      '1 Self + 1 Family Member Profile (Max 2)',
      '3 Months Complete Access to All Modules',
      'Unlimited A4 Report Download, Print, Share & Direct WhatsApp',
      'All 6 Daily Good/Bad Time & Panchang Notifications',
    ],
  },
  {
    id: 'client_paid_6m',
    role: 'client',
    name: 'Plan 3: Half-Yearly Plan (6 Months)',
    durationMonths: 6,
    priceInr: 1555,
    maxProfiles: 2,
    canDownloadShare: true,
    badge: '6 Months • ₹1,555 • Popular',
    features: [
      '1 Self + 1 Family Member Profile (Max 2)',
      '6 Months Complete Access to All Modules',
      'Unlimited A4 Report Download, Print, Share & Direct WhatsApp',
      'All 6 Daily Good/Bad Time & Panchang Notifications',
    ],
  },
  {
    id: 'client_paid_12m',
    role: 'client',
    name: 'Plan 4: Annual Plan (12 Months)',
    durationMonths: 12,
    priceInr: 2999,
    maxProfiles: 2,
    canDownloadShare: true,
    badge: '12 Months • ₹2,999 • Best Value',
    features: [
      '1 Self + 1 Family Member Profile (Max 2)',
      '12 Months Complete Access to All Modules',
      'Unlimited A4 Report Download, Print, Share & Direct WhatsApp',
      'Priority Daily Good/Bad Time & Transit Notifications',
    ],
  },
];

export const HEALER_PLANS: SubscriptionPlanOption[] = [
  {
    id: 'healer_free_1m',
    role: 'healer',
    name: 'Healer Free Starter (1 Profile • 1 Month)',
    durationMonths: 1,
    priceInr: 0,
    maxProfiles: 1,
    canDownloadShare: false,
    badge: 'Free • 1 Profile • 1 Month',
    features: [
      'Add 1 Client Profile for 1 Month Free Trial',
      'Healer Branding & Spiritual A4 Reports',
      'No Report Download, Print, Share or Direct WhatsApp',
    ],
  },
  {
    id: 'healer_paid_10',
    role: 'healer',
    name: 'Healer 10 Profiles Plan',
    durationMonths: 12,
    priceInr: 3333,
    maxProfiles: 10,
    canDownloadShare: true,
    badge: '10 Profiles • ₹3,333',
    features: [
      'Add 10 Client Profiles (Cumulative Upgrade Supported)',
      'Healer Name, Logo & Social Media on All Reports',
      'Unlimited A4 Report Download, Print, Share & Direct WhatsApp',
      'Direct WhatsApp Daily Notifications to Your Clients',
    ],
  },
  {
    id: 'healer_paid_25',
    role: 'healer',
    name: 'Healer 25 Profiles Plan',
    durationMonths: 12,
    priceInr: 6999,
    maxProfiles: 25,
    canDownloadShare: true,
    badge: '25 Profiles • ₹6,999',
    features: [
      'Add 25 Client Profiles (Cumulative Upgrade Supported)',
      'Healer Name, Logo & Social Media on All Reports',
      'Unlimited A4 Report Download, Print, Share & Direct WhatsApp',
      'Direct WhatsApp Daily Notifications to Your Clients',
    ],
  },
  {
    id: 'healer_paid_50',
    role: 'healer',
    name: 'Healer 50 Profiles Plan',
    durationMonths: 12,
    priceInr: 11111,
    maxProfiles: 50,
    canDownloadShare: true,
    badge: '50 Profiles • ₹11,111',
    features: [
      'Add 50 Client Profiles (Cumulative Upgrade Supported)',
      'Healer Name, Logo & Social Media on All Reports',
      'Unlimited A4 Report Download, Print, Share & Direct WhatsApp',
      'Direct WhatsApp Daily Notifications to Your Clients',
    ],
  },
];

export interface SixDailyNotificationChannels {
  goodTimeChoghadiya: boolean;
  badTimeRahuCaution: boolean;
  dailyLuckyNumbers: boolean;
  planetaryHoraTransit: boolean;
  dailyVedicMantra: boolean;
  dailyWeeklyForecast: boolean;
}

export const DEFAULT_SIX_NOTIFICATION_CHANNELS: SixDailyNotificationChannels = {
  goodTimeChoghadiya: true,
  badTimeRahuCaution: true,
  dailyLuckyNumbers: true,
  planetaryHoraTransit: true,
  dailyVedicMantra: true,
  dailyWeeklyForecast: true,
};

export interface AccountRecord {
  id: string;
  ownerUid: string;
  role: UserRole;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  planId: string;
  planName: string;
  planPrice: number;
  isFoc: boolean;
  maxProfiles: number;
  canDownloadShare: boolean;
  subscriptionStart: string;
  subscriptionExpiry: string;
  healerBrandName?: string;
  healerLogoUrl?: string;
  healerInstagram?: string;
  healerFacebook?: string;
  healerYoutube?: string;
  healerWebsite?: string;
  healerAddress?: string;
  notificationPrefsJson?: string;
  createdAtIso: string;
}

export interface AstroProfileRecord {
  id: string;
  accountId: string;
  ownerUid: string;
  ownerRole: UserRole;
  relationTag: 'self' | 'family' | 'healer-client';
  name: string;
  dob: string;
  tob: string;
  pob: string;
  lat: number;
  lng: number;
  email: string;
  mobile: string;
  gender: 'male' | 'female' | 'other';
  isLocked: boolean;
  notificationsEnabled: boolean;
  notificationChannelsJson?: string;
  partnerName?: string;
  partnerDob?: string;
  partnerTob?: string;
  partnerPob?: string;
  partnerLat?: number;
  partnerLng?: number;
  includePartnerMilan?: boolean;
  includeParivarMilan?: boolean;
  healthConcerns?: string[];
  originalName?: string;
  selectedNameA?: string;
  selectedNameB?: string;
  originalMobile?: string;
  selectedMobileA?: string;
  selectedMobileB?: string;
  parivarMembers?: ParivarMemberRecord[];
  createdAtIso: string;
}

export interface SharedReportRecord {
  id: string;
  profileId: string;
  ownerUid: string;
  ownerRole: UserRole;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  lat: number;
  lng: number;
  gender: 'male' | 'female' | 'other';
  partnerName?: string;
  partnerDob?: string;
  partnerTob?: string;
  partnerPob?: string;
  partnerLat?: number;
  partnerLng?: number;
  includePartnerMilan?: boolean;
  includeParivarMilan?: boolean;
  healthConcerns?: string[];
  originalName?: string;
  selectedNameA?: string;
  selectedNameB?: string;
  originalMobile?: string;
  selectedMobileA?: string;
  selectedMobileB?: string;
  parivarMembers?: ParivarMemberRecord[];
  healerName?: string;
  healerBrandName?: string;
  healerMobile?: string;
  healerEmail?: string;
  createdAtIso: string;
}

function buildSharedReportPayload(
  profile: AstroProfileRecord,
  ownerUid: string,
  accountsList: AccountRecord[],
  currentAcc?: AccountRecord | null
): SharedReportRecord {
  const attribution = resolveReportHealerAttribution(profile, accountsList, currentAcc);
  const record: SharedReportRecord = {
    id: profile.id,
    profileId: profile.id,
    ownerUid,
    ownerRole: profile.ownerRole || 'client',
    name: (profile.name || 'Spiritual Seeker').slice(0, 120),
    dob: (profile.dob || '1990-01-01').slice(0, 20),
    tob: (profile.tob || '09:30').slice(0, 20),
    pob: (profile.pob || 'New Delhi, India').slice(0, 200),
    lat: Number.isFinite(profile.lat) ? profile.lat : 28.6139,
    lng: Number.isFinite(profile.lng) ? profile.lng : 77.209,
    gender:
      profile.gender === 'female' || profile.gender === 'other' ? profile.gender : 'male',
    healerName: (attribution.healerDisplayName || TATHASTU_DEFAULT_HEALER_NAME).slice(0, 120),
    healerBrandName: (attribution.brandTitle || TATHASTU_BRAND_NAME).slice(0, 150),
    healerMobile: (attribution.healerDisplayMobile || `+91 ${TATHASTU_ADMIN_PHONE}`).slice(0, 30),
    healerEmail: (attribution.healerDisplayEmail || TATHASTU_ADMIN_EMAIL).slice(0, 150),
    createdAtIso: (profile.createdAtIso || new Date().toISOString()).slice(0, 40),
  };

  if (typeof profile.partnerName === 'string') record.partnerName = profile.partnerName.slice(0, 120);
  if (typeof profile.partnerDob === 'string') record.partnerDob = profile.partnerDob.slice(0, 20);
  if (typeof profile.partnerTob === 'string') record.partnerTob = profile.partnerTob.slice(0, 20);
  if (typeof profile.partnerPob === 'string') record.partnerPob = profile.partnerPob.slice(0, 200);
  if (typeof profile.partnerLat === 'number' && Number.isFinite(profile.partnerLat)) {
    record.partnerLat = profile.partnerLat;
  }
  if (typeof profile.partnerLng === 'number' && Number.isFinite(profile.partnerLng)) {
    record.partnerLng = profile.partnerLng;
  }
  if (typeof profile.includePartnerMilan === 'boolean') {
    record.includePartnerMilan = profile.includePartnerMilan;
  }
  if (typeof profile.includeParivarMilan === 'boolean') {
    record.includeParivarMilan = profile.includeParivarMilan;
  }
  if (Array.isArray(profile.healthConcerns) && profile.healthConcerns.length <= 25) {
    record.healthConcerns = profile.healthConcerns;
  }
  if (typeof profile.originalName === 'string') record.originalName = profile.originalName.slice(0, 120);
  if (typeof profile.selectedNameA === 'string') record.selectedNameA = profile.selectedNameA.slice(0, 120);
  if (typeof profile.selectedNameB === 'string') record.selectedNameB = profile.selectedNameB.slice(0, 120);
  if (typeof profile.originalMobile === 'string') record.originalMobile = profile.originalMobile.slice(0, 30);
  if (typeof profile.selectedMobileA === 'string') record.selectedMobileA = profile.selectedMobileA.slice(0, 30);
  if (typeof profile.selectedMobileB === 'string') record.selectedMobileB = profile.selectedMobileB.slice(0, 30);
  if (Array.isArray(profile.parivarMembers) && profile.parivarMembers.length <= 5) {
    record.parivarMembers = profile.parivarMembers.slice(0, 5);
  }

  return record;
}

export interface AdminRestrictionModalState {
  isOpen: boolean;
  title: string;
  reason: string;
  actionAttempted: string;
}

const ACCOUNTS_STORAGE_KEY = 'tathastu_accounts_v3';
const PROFILES_STORAGE_KEY = 'tathastu_profiles_v3';
const PLANS_STORAGE_KEY = 'tathastu_plans_v3';
const COUPONS_STORAGE_KEY = 'tathastu_coupons_v3';
const BROADCASTS_STORAGE_KEY = 'tathastu_broadcasts_v3';
const FEEDBACKS_STORAGE_KEY = 'tathastu_feedbacks_v3';
const SESSION_ACCOUNT_ID_KEY = 'tathastu_active_account_id_v3';
const SESSION_PROFILE_ID_KEY = 'tathastu_active_profile_id_v3';
const LAST_SEEN_BROADCAST_ID_KEY = 'tathastu_last_seen_bcast_id_v1';

const INITIAL_ACCOUNTS: AccountRecord[] = [
  {
    id: 'admin_tathastu_master',
    ownerUid: 'admin_tathastu_master',
    role: 'admin',
    name: 'Deepak Jain',
    email: 'healer.ddeepak.jain@gmail.com',
    mobile: '8899444444',
    passwordHash: 'admin123',
    planId: 'admin_unlimited',
    planName: 'Master Admin Control',
    planPrice: 0,
    isFoc: true,
    maxProfiles: 99999,
    canDownloadShare: true,
    subscriptionStart: '2026-01-01',
    subscriptionExpiry: '2099-12-31',
    healerBrandName: 'TATHASTU NUMEROLOGY — TATHASTU THE DIVINE LIGHT',
    healerLogoUrl: TATHASTU_LOGO_PATH,
    healerInstagram: '@tathastu_thedivinelight',
    healerFacebook: 'facebook.com/tathastuthedivinelight',
    healerYoutube: 'youtube.com/@tathastuthedivinelight',
    healerWebsite: 'www.tathastulight.com',
    healerAddress: 'TATHASTU NUMEROLOGY • TATHASTU THE DIVINE LIGHT • healer.ddeepak.jain@gmail.com • +91 8899444444',
    notificationPrefsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
    createdAtIso: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'healer_demo_1',
    ownerUid: 'healer_demo_1',
    role: 'healer',
    name: 'Dr. Kavita Sharma',
    email: 'healer@tathastulight.com',
    mobile: '9811122233',
    passwordHash: 'healer123',
    planId: 'healer_paid_10',
    planName: 'Healer 10 Profiles Plan',
    planPrice: 3333,
    isFoc: false,
    maxProfiles: 10,
    canDownloadShare: true,
    subscriptionStart: '2026-01-01',
    subscriptionExpiry: '2027-01-01',
    healerBrandName: 'Pranic Lotus Energy Studio',
    healerLogoUrl: TATHASTU_LOGO_PATH,
    healerInstagram: '@praniclotus_healing',
    healerFacebook: 'facebook.com/praniclotushealing',
    healerYoutube: 'youtube.com/@praniclotushealing',
    healerWebsite: 'www.praniclotus.in',
    healerAddress: 'New Delhi • +91 9811122233',
    notificationPrefsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
    createdAtIso: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'client_deepak_jain',
    ownerUid: 'client_deepak_jain',
    role: 'client',
    name: 'Deepak Jain',
    email: 'deepak.jain@example.com',
    mobile: '9548135398',
    passwordHash: 'client123',
    planId: 'client_paid_12m',
    planName: 'Plan 4: Annual Plan (12 Months)',
    planPrice: 2999,
    isFoc: false,
    maxProfiles: 2,
    canDownloadShare: true,
    subscriptionStart: '2026-01-01',
    subscriptionExpiry: '2027-01-01',
    notificationPrefsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
    createdAtIso: '2026-01-03T00:00:00.000Z',
  },
];

const INITIAL_PROFILES: AstroProfileRecord[] = [
  {
    id: 'prof_deepak_self',
    accountId: 'client_deepak_jain',
    ownerUid: 'client_deepak_jain',
    ownerRole: 'client',
    relationTag: 'self',
    name: 'Deepak Jain',
    dob: '1980-09-09',
    tob: '15:25',
    pob: 'New Delhi, India',
    lat: 28.6139,
    lng: 77.2090,
    email: 'deepak.jain@example.com',
    mobile: '9548135398',
    gender: 'male',
    isLocked: true,
    notificationsEnabled: true,
    notificationChannelsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
    partnerName: 'Priyanka Sharma',
    partnerDob: '1984-11-24',
    partnerTob: '14:20',
    partnerPob: 'Mumbai, Maharashtra, India',
    partnerLat: 19.0760,
    partnerLng: 72.8777,
    createdAtIso: new Date().toISOString(),
  },
  {
    id: 'prof_healer_client_1',
    accountId: 'healer_demo_1',
    ownerUid: 'healer_demo_1',
    ownerRole: 'healer',
    relationTag: 'healer-client',
    name: 'Aarav Mehta',
    dob: '1992-05-14',
    tob: '10:15',
    pob: 'Mumbai, India',
    lat: 19.0760,
    lng: 72.8777,
    email: 'aarav.mehta@example.com',
    mobile: '9820011223',
    gender: 'male',
    isLocked: true,
    notificationsEnabled: true,
    notificationChannelsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
    partnerName: 'Ananya Verma',
    partnerDob: '1994-08-19',
    partnerTob: '11:30',
    partnerPob: 'New Delhi, Delhi, India',
    partnerLat: 28.6139,
    partnerLng: 77.2090,
    createdAtIso: new Date().toISOString(),
  },
];

const INITIAL_COUPONS: DiscountCouponRecord[] = [
  {
    id: 'coup_tathastu20',
    code: 'TATHASTU20',
    discountPercent: 20,
    flatDiscountInr: 0,
    targetRole: 'all',
    expiryDate: '2027-12-31',
    isActive: true,
    createdAtIso: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'coup_healer500',
    code: 'HEALER500',
    discountPercent: 0,
    flatDiscountInr: 500,
    targetRole: 'healer',
    expiryDate: '2027-12-31',
    isActive: true,
    createdAtIso: '2026-01-01T00:00:00.000Z',
  },
];

const INITIAL_BROADCASTS: BroadcastNotificationRecord[] = [
  {
    id: 'bcast_welcome_1',
    title: 'TATHASTU — THE DIVINE LIGHT Live Portal Active',
    message: 'Daily Good Time / Bad Time Choghadiya alerts & A4 Spiritual Reports are synced across Android, iOS, Windows, and Desktop.',
    category: 'announcement',
    targetAudience: 'all',
    couponCode: 'TATHASTU20',
    createdAtIso: '2026-01-01T09:00:00.000Z',
  },
];

const INITIAL_FEEDBACKS: FeedbackSuggestionRecord[] = [
  {
    id: 'fb_welcome_client_1',
    accountId: 'client_deepak_jain',
    ownerUid: 'client_deepak_jain',
    senderRole: 'client',
    senderName: 'Deepak Jain',
    senderMobile: '9548135398',
    senderEmail: 'deepak.jain@example.com',
    category: 'appreciation',
    rating: 5,
    ratedHealerId: 'admin_tathastu_master',
    ratedHealerName: 'Healer Ddeepak Jain (Admin)',
    message:
      'Thank you Healer Ddeepak Jain Ji for creating such an authentic, transparent Vedic & Chaldean platform that protects seekers from fraud and gives accurate life guidance.',
    adminReply:
      'Tathastu! Welcome to the TATHASTU THE DIVINE LIGHT family. May divine wisdom and stability always illuminate your path.',
    createdAtIso: '2026-01-04T10:30:00.000Z',
  },
  {
    id: 'fb_session_healer_1',
    accountId: 'client_deepak_jain',
    ownerUid: 'client_deepak_jain',
    senderRole: 'client',
    senderName: 'Aarav Mehta',
    senderMobile: '9820011223',
    senderEmail: 'aarav.mehta@example.com',
    category: 'feedback',
    rating: 5,
    ratedHealerId: 'healer_demo_1',
    ratedHealerName: 'Dr. Kavita Sharma',
    message:
      'Very accurate guidance session and chakra remedies. Felt immediate clarity and peace.',
    createdAtIso: '2026-01-05T14:15:00.000Z',
  },
];

function loadLocalAccounts(): AccountRecord[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AccountRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = parsed.map((a) => {
          if (a.id === 'admin_tathastu_master' || a.role === 'admin') {
            return {
              ...a,
              name: a.name === 'TATHASTU Master Admin' ? TATHASTU_DEFAULT_HEALER_NAME : a.name,
              email: TATHASTU_ADMIN_EMAIL,
              healerAddress:
                'TATHASTU NUMEROLOGY • TATHASTU THE DIVINE LIGHT • healer.ddeepak.jain@gmail.com • +91 8899444444',
            };
          }
          return a;
        });
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    // fallback
  }
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
  return INITIAL_ACCOUNTS;
}

/**
 * Resolves the exact Healer attribution for any Client Profile report:
 * - If created by a Healer (`ownerRole === 'healer'` or owner account role === 'healer'):
 *   returns all details of that specific Healer (Name, Brand, Logo, Mobile, Email, Address, Socials).
 * - If created by Admin OR created by the Client themselves:
 *   returns Healer Name = "Deepak Jain" along with official TATHASTU details.
 */
export const TATHASTU_AUTHENTIC_REMEDIES_STORE_NOTE =
  'Visit www.tathastulight.com for 100% Genuine & Authentic Rudraksha, Crystals, Home Cleansing Material, Precious & Semi-Precious Stones.';

export function resolveReportHealerAttribution(
  profile: AstroProfileRecord | null | undefined,
  accounts: AccountRecord[],
  currentAccount?: AccountRecord | null
) {
  const ownerAcc =
    (profile && accounts.find((a) => a.id === profile.accountId)) || null;

  const isCreatedByHealer =
    ownerAcc?.role === 'healer' ||
    profile?.ownerRole === 'healer' ||
    profile?.relationTag === 'healer-client' ||
    (!ownerAcc && !profile?.ownerRole && currentAccount?.role === 'healer');

  const healerAcc =
    ownerAcc?.role === 'healer'
      ? ownerAcc
      : currentAccount?.role === 'healer' && isCreatedByHealer
      ? currentAccount
      : accounts.find((a) => a.role === 'admin') || INITIAL_ACCOUNTS[0];

  if (isCreatedByHealer && healerAcc) {
    const hName = healerAcc.name?.trim() || TATHASTU_DEFAULT_HEALER_NAME;
    const hBrand = healerAcc.healerBrandName?.trim() || hName;
    const hLogo = healerAcc.healerLogoUrl?.trim() || TATHASTU_LOGO_PATH;
    const hMobile = healerAcc.mobile?.trim()
      ? healerAcc.mobile.startsWith('+91')
        ? healerAcc.mobile
        : `+91 ${healerAcc.mobile}`
      : `+91 ${TATHASTU_ADMIN_PHONE}`;
    const hEmail = healerAcc.email?.trim() || TATHASTU_ADMIN_EMAIL;
    const hAddress =
      healerAcc.healerAddress?.trim() ||
      healerAcc.healerWebsite?.trim() ||
      `${hBrand} • ${hMobile}`;
    const hInsta = healerAcc.healerInstagram?.trim() || `@${hName.toLowerCase().replace(/\s+/g, '')}`;
    const hFb = healerAcc.healerFacebook?.trim() || `fb.com/${hName.toLowerCase().replace(/\s+/g, '')}`;
    const hYt = healerAcc.healerYoutube?.trim() || `youtube.com/@${hName.toLowerCase().replace(/\s+/g, '')}`;
    const hWeb =
      healerAcc.healerWebsite?.trim() &&
      healerAcc.healerWebsite.trim().toLowerCase() !== 'www.tathastulight.com'
        ? healerAcc.healerWebsite.trim()
        : hBrand;

    return {
      isHealerReport: true,
      healerAccount: healerAcc,
      brandLogo: hLogo,
      brandTitle: hBrand,
      healerDisplayName: hName,
      healerDisplayMobile: hMobile,
      healerDisplayEmail: hEmail,
      healerDisplayAddress: hAddress,
      healerInstagram: hInsta,
      healerFacebook: hFb,
      healerYoutube: hYt,
      healerWebsite: hWeb,
      watermarkTagline: `Healer: ${hName} • 📞 ${hMobile}`,
    };
  }

  // Created by Admin OR created by Client themselves -> Healer Name is always "Deepak Jain"
  const adminAcc = accounts.find((a) => a.role === 'admin') || INITIAL_ACCOUNTS[0];
  return {
    isHealerReport: false,
    healerAccount: adminAcc,
    brandLogo: TATHASTU_LOGO_PATH,
    brandTitle: TATHASTU_BRAND_NAME,
    healerDisplayName: TATHASTU_DEFAULT_HEALER_NAME,
    healerDisplayMobile: `+91 ${TATHASTU_ADMIN_PHONE}`,
    healerDisplayEmail: TATHASTU_ADMIN_EMAIL,
    healerDisplayAddress:
      'TATHASTU — THE DIVINE LIGHT • Vedic, Chaldean & Pranic Energy Healing Center',
    healerInstagram: '@tathastudivinelight',
    healerFacebook: 'fb.com/tathastudivinelight',
    healerYoutube: 'youtube.com/@tathastudivinelight',
    healerWebsite: 'www.tathastulight.com',
    watermarkTagline: `Healer: ${TATHASTU_DEFAULT_HEALER_NAME} • ${TATHASTU_TAGLINE}`,
  };
}

function loadLocalProfiles(): AstroProfileRecord[] {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AstroProfileRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const nowIso = new Date().toISOString();
        const migrated = parsed.map((p) => {
          if (
            !p.createdAtIso ||
            p.createdAtIso.startsWith('2026-01-03') ||
            p.createdAtIso.startsWith('2026-01-05')
          ) {
            return { ...p, createdAtIso: nowIso };
          }
          return p;
        });
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    // fallback
  }
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(INITIAL_PROFILES));
  return INITIAL_PROFILES;
}

function loadLocalPlans(): SubscriptionPlanOption[] {
  const defaultPlans = [...CLIENT_PLANS, ...HEALER_PLANS];
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SubscriptionPlanOption[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(defaultPlans));
  return defaultPlans;
}

function loadLocalCoupons(): DiscountCouponRecord[] {
  try {
    const raw = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DiscountCouponRecord[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(INITIAL_COUPONS));
  return INITIAL_COUPONS;
}

function loadLocalBroadcasts(): BroadcastNotificationRecord[] {
  try {
    const raw = localStorage.getItem(BROADCASTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BroadcastNotificationRecord[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(INITIAL_BROADCASTS));
  return INITIAL_BROADCASTS;
}

function loadLocalFeedbacks(): FeedbackSuggestionRecord[] {
  try {
    const raw = localStorage.getItem(FEEDBACKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FeedbackSuggestionRecord[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
  return INITIAL_FEEDBACKS;
}

async function pushServerRealtimeSync(payload: {
  action?: string;
  accounts?: AccountRecord[];
  profiles?: AstroProfileRecord[];
  plans?: SubscriptionPlanOption[];
  coupons?: DiscountCouponRecord[];
  broadcasts?: BroadcastNotificationRecord[];
  feedbacks?: FeedbackSuggestionRecord[];
  deleteIds?: string[];
  meta?: Record<string, any>;
}): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/realtime/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Offline or local-only fallback
  }
}

interface TathastuContextValue {
  accounts: AccountRecord[];
  profiles: AstroProfileRecord[];
  plans: SubscriptionPlanOption[];
  coupons: DiscountCouponRecord[];
  broadcasts: BroadcastNotificationRecord[];
  feedbacks: FeedbackSuggestionRecord[];
  latestLiveBroadcastAlert: BroadcastNotificationRecord | null;
  dismissLiveBroadcastAlert: () => void;
  currentAccount: AccountRecord | null;
  activeProfile: AstroProfileRecord | null;
  firebaseUser: FirebaseUser | null;
  restrictionModal: AdminRestrictionModalState;
  closeRestrictionModal: () => void;
  triggerAdminRestrictionPopup: (actionAttempted: string, customReason?: string) => void;
  loginWithCredentials: (
    role: UserRole,
    identifier: string,
    password: string
  ) => { ok: boolean; error?: string; role?: UserRole };
  loginWithFirebaseGoogleUser: (
    user: FirebaseUser,
    preferredRole?: UserRole
  ) => Promise<{ ok: boolean; role?: UserRole; error?: string }>;
  quickSwitchRoleAccount: (role: UserRole) => void;
  logout: () => void;
  registerAccountAndPrimaryProfile: (params: {
    role: 'client' | 'healer';
    name: string;
    dob?: string;
    tob?: string;
    pob?: string;
    lat?: number;
    lng?: number;
    gender?: 'male' | 'female' | 'other';
    email: string;
    mobile: string;
    password: string;
    planId: string;
    isFoc: boolean;
    couponCode?: string;
    keepCurrentSession?: boolean;
    healerBrandName?: string;
    healerLogoUrl?: string;
    healerInstagram?: string;
    healerFacebook?: string;
    healerYoutube?: string;
    healerWebsite?: string;
    healerAddress?: string;
  }) => Promise<{ ok: boolean; error?: string; account?: AccountRecord }>;
  upgradeAccountPlan: (
    accountId: string,
    newPlanId: string,
    couponCode?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  resetPasswordByEmailAndMobile: (
    email: string,
    mobile: string,
    newPassword: string
  ) => Promise<{ ok: boolean; error?: string; role?: UserRole }>;
  selectActiveProfile: (profileId: string) => void;
  clearActiveProfile: () => void;
  addNewProfileUnderAccount: (params: {
    targetAccountId?: string;
    relationTag: 'self' | 'family' | 'healer-client';
    name: string;
    dob: string;
    tob: string;
    pob: string;
    lat: number;
    lng: number;
    gender: 'male' | 'female' | 'other';
    email: string;
    mobile: string;
    partnerName?: string;
    partnerDob?: string;
    partnerTob?: string;
    partnerPob?: string;
    partnerLat?: number;
    partnerLng?: number;
    includePartnerMilan?: boolean;
    healthConcerns?: string[];
  }) => Promise<{ ok: boolean; error?: string; profile?: AstroProfileRecord }>;
  updateProfileNotificationSettings: (
    profileId: string,
    notificationsEnabled: boolean,
    channels: SixDailyNotificationChannels
  ) => Promise<void>;
  adminUpdateProfile: (
    updatedProfile: AstroProfileRecord
  ) => Promise<{ ok: boolean; error?: string }>;
  adminDeleteProfile: (profileId: string) => Promise<void>;
  adminUpdateAccount: (
    updatedAccount: AccountRecord
  ) => Promise<{ ok: boolean; error?: string }>;
  adminDeleteAccount: (accountId: string) => Promise<void>;
  adminSavePlan: (plan: SubscriptionPlanOption) => void;
  adminDeletePlan: (planId: string) => void;
  adminCreateCoupon: (coupon: Omit<DiscountCouponRecord, 'id' | 'createdAtIso'>) => void;
  adminToggleCoupon: (couponId: string) => void;
  adminDeleteCoupon: (couponId: string) => void;
  adminSendBroadcastNotification: (params: {
    title: string;
    message: string;
    category: 'update' | 'offer' | 'muhurat' | 'announcement';
    targetAudience: 'all' | 'client' | 'healer';
    couponCode?: string;
  }) => void;
  adminDeleteBroadcast: (broadcastId: string) => void;
  submitFeedbackSuggestion: (params: {
    category: 'feedback' | 'suggestion' | 'appreciation' | 'support';
    rating: number;
    message?: string;
    ratedHealerId?: string;
    ratedHealerName?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  adminReplyToFeedback: (feedbackId: string, replyText: string) => Promise<void>;
  adminDeleteFeedback: (feedbackId: string) => Promise<void>;
  canCurrentAccountDownloadOrShare: () => boolean;
  canCurrentAccountEditOrDelete: () => boolean;
}

const TathastuContext = createContext<TathastuContextValue | undefined>(undefined);

export const TathastuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<AccountRecord[]>(loadLocalAccounts);
  const [profiles, setProfiles] = useState<AstroProfileRecord[]>(loadLocalProfiles);
  const [plans, setPlans] = useState<SubscriptionPlanOption[]>(loadLocalPlans);
  const [coupons, setCoupons] = useState<DiscountCouponRecord[]>(loadLocalCoupons);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotificationRecord[]>(loadLocalBroadcasts);
  const [feedbacks, setFeedbacks] = useState<FeedbackSuggestionRecord[]>(loadLocalFeedbacks);
  const [latestLiveBroadcastAlert, setLatestLiveBroadcastAlert] =
    useState<BroadcastNotificationRecord | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Start on the Spiritual Landing + 3 Login Portal page by default until logged in
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_ACCOUNT_ID_KEY) || null;
  });

  // Start with no active profile open after login; user selects from Saved Profiles or creates New Profile
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  const [restrictionModal, setRestrictionModal] = useState<AdminRestrictionModalState>({
    isOpen: false,
    title: '',
    reason: '',
    actionAttempted: '',
  });

  const dismissLiveBroadcastAlert = useCallback(() => {
    setLatestLiveBroadcastAlert((prev) => {
      if (prev?.id) {
        try {
          localStorage.setItem(LAST_SEEN_BROADCAST_ID_KEY, prev.id);
        } catch {
          // ignore
        }
      }
      return null;
    });
  }, []);

  // Apply remote state snapshot from SSE or REST /api/realtime/state
  const applyRemoteRealtimeState = useCallback(
    (remoteState: any, eventType?: string) => {
      if (!remoteState || typeof remoteState !== 'object') return;
      const deletedMap: Record<string, number> =
        remoteState.deletedIds && typeof remoteState.deletedIds === 'object'
          ? remoteState.deletedIds
          : {};

      if (Array.isArray(remoteState.accounts) && remoteState.accounts.length > 0) {
        setAccounts((prev) => {
          const map = new Map<string, AccountRecord>();
          prev.forEach((a) => {
            if (!deletedMap[a.id]) map.set(a.id, a);
          });
          remoteState.accounts.forEach((ra: AccountRecord) => {
            if (ra && ra.id && !deletedMap[ra.id]) {
              const normalized =
                ra.id === 'admin_tathastu_master' || ra.role === 'admin'
                  ? {
                      ...ra,
                      email: TATHASTU_ADMIN_EMAIL,
                      healerAddress:
                        'TATHASTU NUMEROLOGY • TATHASTU THE DIVINE LIGHT • healer.ddeepak.jain@gmail.com • +91 8899444444',
                    }
                  : ra;
              map.set(ra.id, normalized);
            }
          });
          const merged = Array.from(map.values());
          const serialized = JSON.stringify(merged);
          if (serialized === JSON.stringify(prev)) return prev;
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, serialized);
          return merged;
        });
      }

      if (Array.isArray(remoteState.profiles) && remoteState.profiles.length > 0) {
        setProfiles((prev) => {
          const map = new Map<string, AstroProfileRecord>();
          prev.forEach((p) => {
            if (!deletedMap[p.id]) map.set(p.id, p);
          });
          remoteState.profiles.forEach((rp: AstroProfileRecord) => {
            if (rp && rp.id && !deletedMap[rp.id]) map.set(rp.id, rp);
          });
          const merged = Array.from(map.values());
          const serialized = JSON.stringify(merged);
          if (serialized === JSON.stringify(prev)) return prev;
          localStorage.setItem(PROFILES_STORAGE_KEY, serialized);
          return merged;
        });
      }

      if (Array.isArray(remoteState.plans) && remoteState.plans.length > 0) {
        setPlans((prev) => {
          const map = new Map<string, SubscriptionPlanOption>();
          prev.forEach((pl) => {
            if (!deletedMap[pl.id]) map.set(pl.id, pl);
          });
          remoteState.plans.forEach((rpl: SubscriptionPlanOption) => {
            if (rpl && rpl.id && !deletedMap[rpl.id]) map.set(rpl.id, rpl);
          });
          const merged = Array.from(map.values());
          const serialized = JSON.stringify(merged);
          if (serialized === JSON.stringify(prev)) return prev;
          localStorage.setItem(PLANS_STORAGE_KEY, serialized);
          return merged;
        });
      }

      if (Array.isArray(remoteState.coupons) && remoteState.coupons.length > 0) {
        setCoupons((prev) => {
          const map = new Map<string, DiscountCouponRecord>();
          prev.forEach((c) => {
            if (!deletedMap[c.id]) map.set(c.id, c);
          });
          remoteState.coupons.forEach((rc: DiscountCouponRecord) => {
            if (rc && rc.id && !deletedMap[rc.id]) map.set(rc.id, rc);
          });
          const merged = Array.from(map.values()).sort((a, b) =>
            String(b.createdAtIso || '').localeCompare(String(a.createdAtIso || ''))
          );
          const serialized = JSON.stringify(merged);
          if (serialized === JSON.stringify(prev)) return prev;
          localStorage.setItem(COUPONS_STORAGE_KEY, serialized);
          return merged;
        });
      }

      if (Array.isArray(remoteState.feedbacks)) {
        setFeedbacks((prev) => {
          const map = new Map<string, FeedbackSuggestionRecord>();
          prev.forEach((f) => {
            if (!deletedMap[f.id]) map.set(f.id, f);
          });
          remoteState.feedbacks.forEach((rf: FeedbackSuggestionRecord) => {
            if (rf && rf.id && !deletedMap[rf.id]) map.set(rf.id, rf);
          });
          const merged = Array.from(map.values()).sort((a, b) =>
            String(b.createdAtIso || '').localeCompare(String(a.createdAtIso || ''))
          );
          const serialized = JSON.stringify(merged);
          if (serialized === JSON.stringify(prev)) return prev;
          localStorage.setItem(FEEDBACKS_STORAGE_KEY, serialized);
          return merged;
        });
      }

      if (Array.isArray(remoteState.broadcasts) && remoteState.broadcasts.length > 0) {
        setBroadcasts((prev) => {
          const map = new Map<string, BroadcastNotificationRecord>();
          prev.forEach((b) => {
            if (!deletedMap[b.id]) map.set(b.id, b);
          });
          remoteState.broadcasts.forEach((rb: BroadcastNotificationRecord) => {
            if (rb && rb.id && !deletedMap[rb.id]) map.set(rb.id, rb);
          });
          const merged = Array.from(map.values()).sort((a, b) =>
            String(b.createdAtIso || '').localeCompare(String(a.createdAtIso || ''))
          );
          localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(merged));

          const newest = merged[0];
          const lastSeenId = localStorage.getItem(LAST_SEEN_BROADCAST_ID_KEY);
          if (
            newest &&
            newest.id !== 'bcast_welcome_1' &&
            (newest.id !== prev[0]?.id ||
              eventType === 'broadcast_push' ||
              (lastSeenId !== newest.id && eventType !== 'initial_snapshot'))
          ) {
            localStorage.setItem(LAST_SEEN_BROADCAST_ID_KEY, newest.id);
            setLatestLiveBroadcastAlert(newest);
            sendBrowserNotification(`🕉️ ${TATHASTU_BRAND_NAME}: ${newest.title}`, {
              body: `${newest.message}${newest.couponCode ? ` | Code: ${newest.couponCode}` : ''}`,
              tag: `tathastu-bcast-${newest.id}`,
            });
          }
          return merged;
        });
      }
    },
    []
  );

  // Sync across browser tabs & across Mobile / Tablet / Desktop devices via SSE + Polling + BroadcastChannel
  useEffect(() => {
    const bc =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel('tathastu_realtime_sync_channel')
        : null;

    const handleStorageOrBroadcast = (ev?: MessageEvent | StorageEvent) => {
      setAccounts(loadLocalAccounts());
      setProfiles(loadLocalProfiles());
      setPlans(loadLocalPlans());
      setCoupons(loadLocalCoupons());
      setFeedbacks(loadLocalFeedbacks());
      const latestBroadcasts = loadLocalBroadcasts();
      setBroadcasts((prev) => {
        if (latestBroadcasts.length > 0 && latestBroadcasts[0]?.id !== prev[0]?.id) {
          const newest = latestBroadcasts[0];
          setLatestLiveBroadcastAlert(newest);
          sendBrowserNotification(`🕉️ ${TATHASTU_BRAND_NAME}: ${newest.title}`, {
            body: `${newest.message}${newest.couponCode ? ` | Code: ${newest.couponCode}` : ''}`,
          });
        }
        return latestBroadcasts;
      });
      void ev;
    };

    if (bc) {
      bc.onmessage = handleStorageOrBroadcast;
    }
    window.addEventListener('storage', handleStorageOrBroadcast);

    // 1. Seed server with current device's initial data so server has complete baseline
    pushServerRealtimeSync({
      action: 'boot_seed',
      accounts: loadLocalAccounts(),
      profiles: loadLocalProfiles(),
      plans: loadLocalPlans(),
      coupons: loadLocalCoupons(),
      broadcasts: loadLocalBroadcasts(),
      feedbacks: loadLocalFeedbacks(),
    });

    // 2. Connect to real-time Server-Sent Events (/api/realtime/stream)
    let eventSource: EventSource | null = null;
    if (typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource('/api/realtime/stream');
        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed && parsed.state) {
              applyRemoteRealtimeState(parsed.state, parsed.eventType);
            }
          } catch {
            // Ignore malformed message
          }
        };
      } catch {
        // Fallback to polling below
      }
    }

    // 3. Resilient 4-second background state poll for mobile networks that buffer SSE
    const pollInterval = window.setInterval(async () => {
      try {
        const res = await fetch('/api/realtime/state', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.state) {
            applyRemoteRealtimeState(data.state, 'poll_sync');
          }
        }
      } catch {
        // Ignore network poll error
      }
    }, 4000);

    return () => {
      if (bc) bc.close();
      if (eventSource) eventSource.close();
      window.clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageOrBroadcast);
    };
  }, [applyRemoteRealtimeState]);

  const broadcastSync = useCallback(
    (
      nextAccounts: AccountRecord[],
      nextProfiles: AstroProfileRecord[],
      deleteIds?: string[]
    ) => {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(nextAccounts));
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(nextProfiles));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('tathastu_realtime_sync_channel');
        bc.postMessage({ updatedAt: Date.now(), type: 'profiles_accounts_sync' });
        bc.close();
      }
      pushServerRealtimeSync({
        action: 'accounts_profiles_sync',
        accounts: nextAccounts,
        profiles: nextProfiles,
        deleteIds,
      });
    },
    []
  );

  const notifyRealtimeChannel = useCallback(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('tathastu_realtime_sync_channel');
      bc.postMessage({ updatedAt: Date.now(), type: 'admin_push_sync' });
      bc.close();
    }
  }, []);

  // Track Firebase Auth state and attach Firestore onSnapshot listeners when authenticated
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Public Shared Report Resolver for external mobile browsers (?reportProfileId=... or ?qrAccess=mobile_pdf)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qrProfileId = params.get('reportProfileId')?.trim() || '';
      const qrClientName = params.get('clientName')?.trim() || '';
      const qrAccess = params.get('qrAccess')?.trim() || '';
      if (!qrProfileId && !qrClientName && !qrAccess) return;

      const fallbackId = qrProfileId || `prof_shared_${Date.now()}`;
      const urlDob = params.get('dob')?.trim() || '1990-01-01';
      const urlTob = params.get('tob')?.trim() || '09:30';
      const urlPob = params.get('pob')?.trim() || 'New Delhi, India';
      const urlMobile = params.get('mobile')?.trim() || '';
      const urlGenderRaw = params.get('gender')?.trim();
      const urlGender: 'male' | 'female' | 'other' =
        urlGenderRaw === 'female' || urlGenderRaw === 'other' ? urlGenderRaw : 'male';
      const urlLat = Number(params.get('lat'));
      const urlLng = Number(params.get('lng'));

      // Ensure external mobile browser has an active viewer session so it never hits the login wall
      setCurrentAccountId((prevAccId) => {
        if (prevAccId) return prevAccId;
        const guestAccId = 'client_deepak_jain';
        localStorage.setItem(SESSION_ACCOUNT_ID_KEY, guestAccId);
        return guestAccId;
      });

      // Immediately construct or update local profile from URL params if not already present
      if (qrClientName && qrProfileId) {
        setProfiles((prev) => {
          if (prev.some((p) => p.id === qrProfileId)) return prev;
          const synthesized: AstroProfileRecord = {
            id: qrProfileId,
            accountId: 'client_deepak_jain',
            ownerUid: 'client_deepak_jain',
            ownerRole: 'client',
            relationTag: 'self',
            name: qrClientName,
            dob: urlDob,
            tob: urlTob,
            pob: urlPob,
            lat: Number.isFinite(urlLat) && urlLat !== 0 ? urlLat : 28.6139,
            lng: Number.isFinite(urlLng) && urlLng !== 0 ? urlLng : 77.209,
            email: 'client@tathastulight.com',
            mobile: urlMobile || TATHASTU_ADMIN_PHONE,
            gender: urlGender,
            isLocked: true,
            notificationsEnabled: true,
            notificationChannelsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
            includePartnerMilan: params.get('includePartnerMilan') === '1',
            includeParivarMilan: params.get('includeParivarMilan') !== '0',
            partnerName: params.get('partnerName') || 'Priyanka Sharma',
            partnerDob: params.get('partnerDob') || '1990-11-24',
            partnerTob: params.get('partnerTob') || '14:20',
            partnerPob: params.get('partnerPob') || 'Mumbai, Maharashtra, India',
            partnerLat: 19.076,
            partnerLng: 72.8777,
            originalName: params.get('originalName') || qrClientName,
            selectedNameA: params.get('selectedNameA') || undefined,
            selectedNameB: params.get('selectedNameB') || undefined,
            originalMobile: params.get('originalMobile') || urlMobile || undefined,
            selectedMobileA: params.get('selectedMobileA') || undefined,
            selectedMobileB: params.get('selectedMobileB') || undefined,
            createdAtIso: new Date().toISOString(),
          };
          const next = [...prev, synthesized];
          localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
        setActiveProfileId(qrProfileId);
        localStorage.setItem(SESSION_PROFILE_ID_KEY, qrProfileId);
      }

      // Fetch public SharedReportRecord from Firestore (/tathastu_shared_reports/{reportId})
      // which allows unauthenticated `get` in firestore.rules
      if (qrProfileId && qrProfileId.length <= 128) {
        getDoc(doc(db, 'tathastu_shared_reports', qrProfileId))
          .then((snap) => {
            if (!snap.exists()) return;
            const shared = snap.data() as SharedReportRecord;
            setProfiles((prev) => {
              const existing = prev.find((p) => p.id === qrProfileId);
              const mergedProfile: AstroProfileRecord = {
                id: qrProfileId,
                accountId: existing?.accountId || 'client_deepak_jain',
                ownerUid: shared.ownerUid || existing?.ownerUid || 'client_deepak_jain',
                ownerRole: shared.ownerRole || existing?.ownerRole || 'client',
                relationTag: existing?.relationTag || 'self',
                name: shared.name || existing?.name || qrClientName || 'Spiritual Seeker',
                dob: shared.dob || existing?.dob || urlDob,
                tob: shared.tob || existing?.tob || urlTob,
                pob: shared.pob || existing?.pob || urlPob,
                lat: typeof shared.lat === 'number' ? shared.lat : existing?.lat ?? 28.6139,
                lng: typeof shared.lng === 'number' ? shared.lng : existing?.lng ?? 77.209,
                email: existing?.email || 'client@tathastulight.com',
                mobile: existing?.mobile || urlMobile || TATHASTU_ADMIN_PHONE,
                gender: shared.gender || existing?.gender || urlGender,
                isLocked: true,
                notificationsEnabled: true,
                notificationChannelsJson:
                  existing?.notificationChannelsJson ||
                  JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
                partnerName: shared.partnerName ?? existing?.partnerName,
                partnerDob: shared.partnerDob ?? existing?.partnerDob,
                partnerTob: shared.partnerTob ?? existing?.partnerTob,
                partnerPob: shared.partnerPob ?? existing?.partnerPob,
                partnerLat: shared.partnerLat ?? existing?.partnerLat,
                partnerLng: shared.partnerLng ?? existing?.partnerLng,
                includePartnerMilan:
                  shared.includePartnerMilan ?? existing?.includePartnerMilan,
                includeParivarMilan:
                  shared.includeParivarMilan ?? existing?.includeParivarMilan,
                healthConcerns: shared.healthConcerns ?? existing?.healthConcerns,
                originalName: shared.originalName ?? existing?.originalName,
                selectedNameA: shared.selectedNameA ?? existing?.selectedNameA,
                selectedNameB: shared.selectedNameB ?? existing?.selectedNameB,
                originalMobile: shared.originalMobile ?? existing?.originalMobile,
                selectedMobileA: shared.selectedMobileA ?? existing?.selectedMobileA,
                selectedMobileB: shared.selectedMobileB ?? existing?.selectedMobileB,
                createdAtIso:
                  shared.createdAtIso || existing?.createdAtIso || new Date().toISOString(),
              };
              const map = new Map(prev.map((p) => [p.id, p]));
              map.set(qrProfileId, mergedProfile);
              const next = Array.from(map.values());
              localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(next));
              return next;
            });
            setActiveProfileId(qrProfileId);
            localStorage.setItem(SESSION_PROFILE_ID_KEY, qrProfileId);
          })
          .catch((error) => {
            try {
              handleFirestoreError(
                error,
                OperationType.GET,
                `tathastu_shared_reports/${fallbackId}`
              );
            } catch {
              // Ignore if offline or falls back to URL query parameters
            }
          });
      }
    } catch {
      // Ignore URL parse error
    }
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    const userEmailLower = (firebaseUser.email || '').toLowerCase();
    const isAdminEmail = userEmailLower === 'healer.ddeepak.jain@gmail.com';
    const accountsRef = collection(db, 'tathastu_accounts');
    const profilesRef = collection(db, 'tathastu_profiles');

    const accQuery = isAdminEmail
      ? accountsRef
      : query(accountsRef, where('ownerUid', '==', firebaseUser.uid));
    const profQuery = isAdminEmail
      ? profilesRef
      : query(profilesRef, where('ownerUid', '==', firebaseUser.uid));

    const unsubAcc = onSnapshot(
      accQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteAccs = snapshot.docs.map((d) => d.data() as AccountRecord);
          setAccounts((prev) => {
            const map = new Map(prev.map((a) => [a.id, a]));
            remoteAccs.forEach((ra) => map.set(ra.id, ra));
            const merged = Array.from(map.values());
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'tathastu_accounts');
        } catch {
          // Handled
        }
      }
    );

    const unsubProf = onSnapshot(
      profQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteProfs = snapshot.docs.map((d) => d.data() as AstroProfileRecord);
          setProfiles((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            remoteProfs.forEach((rp) => map.set(rp.id, rp));
            const merged = Array.from(map.values());
            localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'tathastu_profiles');
        } catch {
          // Handled
        }
      }
    );

    const unsubBcast = onSnapshot(
      collection(db, 'tathastu_broadcasts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteBcasts = snapshot.docs.map(
            (d) => d.data() as BroadcastNotificationRecord
          );
          setBroadcasts((prev) => {
            const map = new Map(prev.map((b) => [b.id, b]));
            remoteBcasts.forEach((rb) => map.set(rb.id, rb));
            const merged = Array.from(map.values()).sort((a, b) =>
              String(b.createdAtIso || '').localeCompare(String(a.createdAtIso || ''))
            );
            localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'tathastu_broadcasts');
        } catch {
          // Handled
        }
      }
    );

    // Only Admin can read/list guidance session ratings & feedbacks from Firestore
    const unsubFb = isAdminEmail
      ? onSnapshot(
          collection(db, 'tathastu_feedbacks'),
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteFbs = snapshot.docs.map((d) => d.data() as FeedbackSuggestionRecord);
              setFeedbacks((prev) => {
                const map = new Map(prev.map((f) => [f.id, f]));
                remoteFbs.forEach((rf) => map.set(rf.id, rf));
                const merged = Array.from(map.values()).sort((a, b) =>
                  String(b.createdAtIso || '').localeCompare(String(a.createdAtIso || ''))
                );
                localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(merged));
                return merged;
              });
            }
          },
          (error) => {
            try {
              handleFirestoreError(error, OperationType.GET, 'tathastu_feedbacks');
            } catch {
              // Handled
            }
          }
        )
      : () => {};

    return () => {
      unsubAcc();
      unsubProf();
      unsubBcast();
      unsubFb();
    };
  }, [firebaseUser]);

  const currentAccount = accounts.find((a) => a.id === currentAccountId) || null;

  // Ensure activeProfile belongs to currentAccount (or any profile if Admin, or fallback if Healer has 0 profiles yet)
  const visibleProfiles = React.useMemo(() => {
    if (!currentAccount) return [];
    if (currentAccount.role === 'admin') return profiles;
    return profiles.filter((p) => p.accountId === currentAccount.id);
  }, [currentAccount, profiles]);

  const activeProfile = activeProfileId
    ? visibleProfiles.find((p) => p.id === activeProfileId) ||
      profiles.find((p) => p.id === activeProfileId) ||
      null
    : null;

  const closeRestrictionModal = () => {
    setRestrictionModal((prev) => ({ ...prev, isOpen: false }));
  };

  const triggerAdminRestrictionPopup = (actionAttempted: string, customReason?: string) => {
    const isFreePlan = currentAccount && !currentAccount.canDownloadShare && currentAccount.role !== 'admin';
    const reasonText =
      customReason ||
      (actionAttempted.toLowerCase().includes('edit') || actionAttempted.toLowerCase().includes('delete')
        ? `Main Name & Date of Birth are permanently locked after registration so a profile cannot be modified or reused for another person. Only Admin can edit or delete profiles. Please contact Admin — ${TATHASTU_BRAND_NAME} on ${TATHASTU_ADMIN_PHONE} (${TATHASTU_ADMIN_EMAIL}).`
        : isFreePlan
        ? `Your current Free Plan (${currentAccount?.planName}) allows viewing services for 1 month but does not permit Report Download, Print, Share, or Direct WhatsApp. Please contact Admin — ${TATHASTU_BRAND_NAME} on ${TATHASTU_ADMIN_PHONE} or upgrade to a Paid Plan.`
        : `To perform "${actionAttempted}", please contact Admin — ${TATHASTU_BRAND_NAME} on ${TATHASTU_ADMIN_PHONE} (${TATHASTU_ADMIN_EMAIL}).`);

    setRestrictionModal({
      isOpen: true,
      title: `Contact Admin — ${TATHASTU_BRAND_NAME} (${TATHASTU_ADMIN_PHONE})`,
      reason: reasonText,
      actionAttempted,
    });
  };

  const loginWithCredentials = (
    role: UserRole,
    identifier: string,
    password: string
  ): { ok: boolean; error?: string; role?: UserRole } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanMobile = identifier.replace(/\D/g, '').slice(-10);
    const cleanPass = password.trim();

    if (!cleanId) {
      return {
        ok: false,
        error: 'Please enter your registered Email Address or 10-digit Mobile Number.',
      };
    }
    if (!cleanPass) {
      return {
        ok: false,
        error: 'Please enter your account password.',
      };
    }

    const matchesIdentifier = (acc: AccountRecord) => {
      const emailMatch = acc.email.trim().toLowerCase() === cleanId;
      const mobileDigits = acc.mobile.replace(/\D/g, '').slice(-10);
      const mobileMatch = cleanMobile.length === 10 && mobileDigits === cleanMobile;
      if (
        acc.role === 'admin' &&
        (cleanId === 'healer.ddeepak.jain@gmail.com' ||
          cleanMobile === '8899444444')
      ) {
        return true;
      }
      return emailMatch || mobileMatch;
    };

    const passwordMatches = (acc: AccountRecord) =>
      acc.passwordHash === password || acc.passwordHash.trim() === cleanPass;

    // 1. Prefer exact role + identifier match
    let matched = accounts.find((acc) => acc.role === role && matchesIdentifier(acc));

    // 2. If user clicked generic Login (defaulting to client) with Healer/Admin credentials,
    // gracefully resolve the matching account when both identifier & password verify cleanly.
    if (!matched) {
      const crossRoleExact = accounts.find(
        (acc) => matchesIdentifier(acc) && passwordMatches(acc)
      );
      if (crossRoleExact) {
        matched = crossRoleExact;
      } else {
        const crossRoleCandidate = accounts.find((acc) => matchesIdentifier(acc));
        if (crossRoleCandidate) {
          return {
            ok: false,
            error: `This Email/Mobile belongs to the ${crossRoleCandidate.role.toUpperCase()} portal, or your password is incorrect. Please check your password or select the ${crossRoleCandidate.role.toUpperCase()} Login tab.`,
          };
        }
      }
    }

    if (!matched) {
      return {
        ok: false,
        error: `No registered ${role.toUpperCase()} account found with that Email or 10-digit Mobile Number. Please register and complete payment first.`,
      };
    }

    if (!passwordMatches(matched)) {
      return {
        ok: false,
        error: 'Incorrect password. Please try again or use Forgot Password.',
      };
    }

    setCurrentAccountId(matched.id);
    localStorage.setItem(SESSION_ACCOUNT_ID_KEY, matched.id);
    // Do NOT auto-open an active profile on login; show Saved Profiles / New Profile / Portal first
    setActiveProfileId(null);
    localStorage.removeItem(SESSION_PROFILE_ID_KEY);

    return { ok: true, role: matched.role };
  };

  const loginWithFirebaseGoogleUser = async (
    user: FirebaseUser,
    preferredRole: UserRole = 'client'
  ): Promise<{ ok: boolean; role?: UserRole; error?: string }> => {
    const emailLower = (user.email || '').trim().toLowerCase();
    if (!emailLower) {
      return {
        ok: false,
        error: 'Google account did not return a verified email address.',
      };
    }

    const isOwnerAdmin = emailLower === 'healer.ddeepak.jain@gmail.com';

    let matched = isOwnerAdmin
      ? accounts.find((a) => a.role === 'admin') || INITIAL_ACCOUNTS[0]
      : accounts.find((a) => a.email.trim().toLowerCase() === emailLower);

    if (!matched) {
      const targetRole: 'client' | 'healer' =
        preferredRole === 'healer' ? 'healer' : 'client';
      const defaultPlan =
        plans.find((p) => p.role === targetRole && p.priceInr === 0) ||
        plans.find((p) => p.role === targetRole) ||
        CLIENT_PLANS[0];
      const nowIso = new Date().toISOString();
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (defaultPlan?.durationMonths || 1));

      matched = {
        id: `acc_google_${user.uid.slice(0, 10)}_${Date.now()}`,
        ownerUid: user.uid,
        role: targetRole,
        name: user.displayName || emailLower.split('@')[0] || 'Divine Seeker',
        email: emailLower,
        mobile: TATHASTU_ADMIN_PHONE,
        passwordHash: user.uid,
        planId: defaultPlan?.id || 'client_free_1m',
        planName: defaultPlan?.name || 'Plan 1: Free Trial (1 Month)',
        planPrice: defaultPlan?.priceInr || 0,
        isFoc: false,
        maxProfiles: defaultPlan?.maxProfiles || 2,
        canDownloadShare: defaultPlan?.canDownloadShare || false,
        subscriptionStart: nowIso,
        subscriptionExpiry: expiry.toISOString(),
        createdAtIso: nowIso,
      };

      const nextAccounts = [matched, ...accounts];
      setAccounts(nextAccounts);
      broadcastSync(nextAccounts, profiles);
      try {
        await setDoc(doc(db, 'tathastu_accounts', matched.id), matched);
      } catch {
        // Local & server persistence already updated
      }
    }

    setCurrentAccountId(matched.id);
    localStorage.setItem(SESSION_ACCOUNT_ID_KEY, matched.id);
    setActiveProfileId(null);
    localStorage.removeItem(SESSION_PROFILE_ID_KEY);
    return { ok: true, role: matched.role };
  };

  const quickSwitchRoleAccount = (role: UserRole) => {
    const target =
      accounts.find((a) => a.role === role) ||
      INITIAL_ACCOUNTS.find((a) => a.role === role) ||
      INITIAL_ACCOUNTS[0];

    setCurrentAccountId(target.id);
    localStorage.setItem(SESSION_ACCOUNT_ID_KEY, target.id);
    // Do NOT auto-open an active profile on login; show Saved Profiles / New Profile / Portal first
    setActiveProfileId(null);
    localStorage.removeItem(SESSION_PROFILE_ID_KEY);
  };

  const logout = () => {
    setCurrentAccountId(null);
    setActiveProfileId(null);
    localStorage.removeItem(SESSION_ACCOUNT_ID_KEY);
    localStorage.removeItem(SESSION_PROFILE_ID_KEY);
  };

  const registerAccountAndPrimaryProfile: TathastuContextValue['registerAccountAndPrimaryProfile'] = async (
    params
  ) => {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanMobile = params.mobile.replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: 'A valid Email Address is required.' };
    }
    if (cleanMobile.length < 10) {
      return { ok: false, error: 'A valid 10-digit Mobile Number is required.' };
    }
    if (!params.name.trim()) {
      return { ok: false, error: 'Full Name is required.' };
    }
    if (params.role === 'client' && (!params.dob || !params.dob.trim())) {
      return { ok: false, error: 'Date of Birth is mandatory for Client registration and cannot be changed after saving.' };
    }

    // Check uniqueness: 1 mobile number or 1 email address can only create 1 account/profile
    const duplicateAccount = accounts.find(
      (a) =>
        a.email.trim().toLowerCase() === cleanEmail ||
        a.mobile.replace(/\D/g, '').slice(-10) === cleanMobile
    );
    const duplicateProfile = profiles.find(
      (p) =>
        p.email.trim().toLowerCase() === cleanEmail ||
        p.mobile.replace(/\D/g, '').slice(-10) === cleanMobile
    );

    if (duplicateAccount || duplicateProfile) {
      return {
        ok: false,
        error:
          'Only 1 profile/account can be created per Email Address or Mobile Number! This Email or Mobile Number is already registered.',
      };
    }

    // Only Master Admin can register an account Free of Cost (F.O.C.)
    const effectiveIsFoc = currentAccount?.role === 'admin' && Boolean(params.isFoc);

    const paidFallbackPlan =
      plans.find((pl) => pl.role === params.role && pl.priceInr > 0) ||
      (params.role === 'client' ? CLIENT_PLANS[1] : HEALER_PLANS[1]);

    const selectedPlan =
      plans.find((pl) => pl.id === params.planId) || paidFallbackPlan;

    if (!effectiveIsFoc && (!selectedPlan || selectedPlan.priceInr <= 0)) {
      return {
        ok: false,
        error:
          'Registration without payment is not permitted. Please select a paid subscription plan (or ask Admin to enable F.O.C.).',
      };
    }

    let finalPrice = effectiveIsFoc ? 0 : selectedPlan.priceInr;
    if (!effectiveIsFoc && params.couponCode) {
      const cleanCoupon = params.couponCode.trim().toUpperCase();
      const matchedCoupon = coupons.find(
        (c) =>
          c.isActive &&
          c.code.toUpperCase() === cleanCoupon &&
          (c.targetRole === 'all' || c.targetRole === params.role)
      );
      if (matchedCoupon) {
        if (matchedCoupon.discountPercent > 0) {
          finalPrice = Math.max(
            0,
            Math.round(finalPrice * (1 - matchedCoupon.discountPercent / 100))
          );
        } else if (matchedCoupon.flatDiscountInr > 0) {
          finalPrice = Math.max(0, finalPrice - matchedCoupon.flatDiscountInr);
        }
      }
    }

    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + selectedPlan.durationMonths);

    const newAccountId = `acc_${Date.now()}`;
    const ownerUid = firebaseUser?.uid || newAccountId;

    const newAccount: AccountRecord = {
      id: newAccountId,
      ownerUid,
      role: params.role,
      name: params.name.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      passwordHash: params.password,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      planPrice: finalPrice,
      isFoc: effectiveIsFoc,
      maxProfiles: selectedPlan.maxProfiles,
      canDownloadShare: effectiveIsFoc ? true : selectedPlan.canDownloadShare || selectedPlan.priceInr > 0,
      subscriptionStart: now.toISOString().slice(0, 10),
      subscriptionExpiry: expiry.toISOString().slice(0, 10),
      healerBrandName: params.healerBrandName?.trim() || '',
      healerLogoUrl: params.healerLogoUrl?.trim() || TATHASTU_LOGO_PATH,
      healerInstagram: params.healerInstagram?.trim() || '',
      healerFacebook: params.healerFacebook?.trim() || '',
      healerYoutube: params.healerYoutube?.trim() || '',
      healerWebsite: params.healerWebsite?.trim() || '',
      healerAddress: params.healerAddress?.trim() || '',
      notificationPrefsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
      createdAtIso: now.toISOString(),
    };

    const nextAccounts = [...accounts, newAccount];
    let nextProfiles = [...profiles];
    let createdProfileId: string | null = null;

    // Only create primary self birth profile for Client registration (Healer does NOT need DOB/TOB/POB at registration)
    if (params.role === 'client' && params.dob) {
      const newProfileId = `prof_${Date.now()}`;
      createdProfileId = newProfileId;
      const newProfile: AstroProfileRecord = {
        id: newProfileId,
        accountId: newAccountId,
        ownerUid,
        ownerRole: 'client',
        relationTag: 'self',
        name: params.name.trim(),
        dob: params.dob,
        tob: params.tob || '09:30',
        pob: params.pob || 'New Delhi, India',
        lat: params.lat ?? 28.6139,
        lng: params.lng ?? 77.2090,
        email: cleanEmail,
        mobile: cleanMobile,
        gender: params.gender || 'male',
        isLocked: true,
        notificationsEnabled: true,
        notificationChannelsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
        partnerName: '',
        partnerDob: '',
        partnerTob: '09:30',
        partnerPob: '',
        partnerLat: 28.6139,
        partnerLng: 77.2090,
        createdAtIso: now.toISOString(),
      };
      nextProfiles = [...profiles, newProfile];

      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'tathastu_profiles', newProfileId), newProfile);
          const sharedPayload = buildSharedReportPayload(
            newProfile,
            firebaseUser.uid,
            nextAccounts,
            newAccount
          );
          await setDoc(doc(db, 'tathastu_shared_reports', newProfileId), sharedPayload);
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.CREATE, 'tathastu_profiles');
          } catch {
            // Handled
          }
        }
      }
    }

    setAccounts(nextAccounts);
    setProfiles(nextProfiles);
    broadcastSync(nextAccounts, nextProfiles);

    if (!params.keepCurrentSession) {
      setCurrentAccountId(newAccountId);
      localStorage.setItem(SESSION_ACCOUNT_ID_KEY, newAccountId);
      if (createdProfileId) {
        setActiveProfileId(createdProfileId);
        localStorage.setItem(SESSION_PROFILE_ID_KEY, createdProfileId);
      }
    }

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_accounts', newAccountId), newAccount);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.CREATE, 'tathastu_accounts');
        } catch {
          // Handled
        }
      }
    }

    return { ok: true, account: newAccount };
  };

  const upgradeAccountPlan: TathastuContextValue['upgradeAccountPlan'] = async (
    accountId,
    newPlanId,
    couponCode
  ) => {
    const targetAcc = accounts.find((a) => a.id === accountId);
    if (!targetAcc) {
      return { ok: false, error: 'Account not found.' };
    }
    const selectedPlan = plans.find((p) => p.id === newPlanId);
    if (!selectedPlan) {
      return { ok: false, error: 'Selected plan not found.' };
    }

    if (selectedPlan.priceInr <= 0 && currentAccount?.role !== 'admin') {
      return {
        ok: false,
        error: 'Please select a paid subscription plan to add to your existing plan via PayU.',
      };
    }

    let finalPrice = selectedPlan.priceInr;
    if (couponCode) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const matchedCoupon = coupons.find(
        (c) =>
          c.isActive &&
          c.code.toUpperCase() === cleanCoupon &&
          (c.targetRole === 'all' || c.targetRole === targetAcc.role)
      );
      if (matchedCoupon) {
        if (matchedCoupon.discountPercent > 0) {
          finalPrice = Math.max(
            0,
            Math.round(finalPrice * (1 - matchedCoupon.discountPercent / 100))
          );
        } else if (matchedCoupon.flatDiscountInr > 0) {
          finalPrice = Math.max(0, finalPrice - matchedCoupon.flatDiscountInr);
        }
      }
    }

    const now = new Date();
    const existingExpiryMs = targetAcc.subscriptionExpiry
      ? new Date(targetAcc.subscriptionExpiry).getTime()
      : 0;
    const baseExpiryDate =
      existingExpiryMs > now.getTime() ? new Date(existingExpiryMs) : new Date(now);
    baseExpiryDate.setMonth(baseExpiryDate.getMonth() + selectedPlan.durationMonths);

    // Both Clients and Healers can purchase any plan and add its profiles & validity cumulatively into their existing plan!
    const nextMaxProfiles = (targetAcc.maxProfiles || 0) + selectedPlan.maxProfiles;

    const updatedAccount: AccountRecord = {
      ...targetAcc,
      planId: selectedPlan.id,
      planName: `${selectedPlan.name} (Total Quota: ${nextMaxProfiles} Profiles)`,
      planPrice: finalPrice,
      maxProfiles: nextMaxProfiles,
      canDownloadShare:
        selectedPlan.canDownloadShare || targetAcc.canDownloadShare || selectedPlan.priceInr > 0,
      subscriptionStart: targetAcc.subscriptionStart || now.toISOString().slice(0, 10),
      subscriptionExpiry: baseExpiryDate.toISOString().slice(0, 10),
    };

    const nextAccounts = accounts.map((a) => (a.id === accountId ? updatedAccount : a));
    setAccounts(nextAccounts);
    broadcastSync(nextAccounts, profiles);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_accounts', accountId), updatedAccount);
      } catch {
        // Handled
      }
    }

    return { ok: true };
  };

  const resetPasswordByEmailAndMobile = async (
    email: string,
    mobile: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string; role?: UserRole }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: 'Please enter a valid registered Email Address.' };
    }
    if (cleanMobile.length !== 10) {
      return { ok: false, error: 'Please enter your registered 10-digit Mobile Number.' };
    }
    if (!newPassword || newPassword.trim().length < 4) {
      return { ok: false, error: 'New Password must be at least 4 characters long.' };
    }

    const target = accounts.find(
      (a) =>
        a.email.trim().toLowerCase() === cleanEmail &&
        a.mobile.replace(/\D/g, '').slice(-10) === cleanMobile
    );

    if (!target) {
      return {
        ok: false,
        error: 'No account matched both the registered Email Address and 10-digit Mobile Number.',
      };
    }

    const updatedAccount: AccountRecord = {
      ...target,
      passwordHash: newPassword,
    };

    const nextAccounts = accounts.map((a) => (a.id === target.id ? updatedAccount : a));
    setAccounts(nextAccounts);
    broadcastSync(nextAccounts, profiles);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_accounts', updatedAccount.id), updatedAccount);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.UPDATE, `tathastu_accounts/${updatedAccount.id}`);
        } catch {
          // Handled
        }
      }
    }

    return { ok: true, role: target.role };
  };

  const selectActiveProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    localStorage.setItem(SESSION_PROFILE_ID_KEY, profileId);
  };

  const clearActiveProfile = () => {
    setActiveProfileId(null);
    localStorage.removeItem(SESSION_PROFILE_ID_KEY);
  };

  const addNewProfileUnderAccount: TathastuContextValue['addNewProfileUnderAccount'] = async (
    params
  ) => {
    const targetAccId = params.targetAccountId || currentAccount?.id;
    const targetAcc = accounts.find((a) => a.id === targetAccId);
    if (!targetAcc) {
      return { ok: false, error: 'Active account not found.' };
    }

    const existingForAccount = profiles.filter((p) => p.accountId === targetAcc.id);
    if (currentAccount?.role !== 'admin' && existingForAccount.length >= targetAcc.maxProfiles) {
      return {
        ok: false,
        error:
          targetAcc.role === 'client'
            ? `Client accounts are limited to 1 Self + 1 Family Member (2 profiles maximum). Contact Admin TATHASTU on ${TATHASTU_ADMIN_PHONE}.`
            : `Your Healer plan (${targetAcc.planName}) limit of ${targetAcc.maxProfiles} profile(s) is reached. Please upgrade your plan to add more profiles or contact Admin on ${TATHASTU_ADMIN_PHONE}.`,
      };
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const cleanMobile = params.mobile.replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: 'Email Address is required for every profile.' };
    }
    if (cleanMobile.length < 10) {
      return { ok: false, error: 'Valid 10-digit Mobile Number is required for every profile.' };
    }

    // Uniqueness rule: 1 mobile number or 1 email address can never be used on a 2nd profile or another account
    const duplicateProfile = profiles.find(
      (p) =>
        p.email.trim().toLowerCase() === cleanEmail ||
        p.mobile.replace(/\D/g, '').slice(-10) === cleanMobile
    );
    if (duplicateProfile) {
      return {
        ok: false,
        error: `This Email Address or Mobile Number is already linked to profile "${duplicateProfile.name}". 1 Email Address & 1 Mobile Number cannot be used on a second profile!`,
      };
    }

    const isSelfForTargetAcc =
      params.relationTag === 'self' && existingForAccount.length === 0;
    const duplicateAccount = accounts.find((a) => {
      if (isSelfForTargetAcc && a.id === targetAcc.id) return false;
      return (
        a.email.trim().toLowerCase() === cleanEmail ||
        a.mobile.replace(/\D/g, '').slice(-10) === cleanMobile
      );
    });
    if (duplicateAccount) {
      return {
        ok: false,
        error: `This Email Address or Mobile Number is already registered to account "${duplicateAccount.name}". Each profile must have a unique Email Address & 10-digit Mobile Number!`,
      };
    }

    const now = new Date();
    const newProfileId = `prof_${Date.now()}`;
    const newProfile: AstroProfileRecord = {
      id: newProfileId,
      accountId: targetAcc.id,
      ownerUid: targetAcc.ownerUid,
      ownerRole: targetAcc.role,
      relationTag: params.relationTag,
      name: params.name.trim(),
      dob: params.dob,
      tob: params.tob || '09:30',
      pob: params.pob || 'New Delhi, India',
      lat: params.lat ?? 28.6139,
      lng: params.lng ?? 77.2090,
      email: cleanEmail,
      mobile: cleanMobile,
      gender: params.gender || 'male',
      isLocked: true,
      notificationsEnabled: true,
      notificationChannelsJson: JSON.stringify(DEFAULT_SIX_NOTIFICATION_CHANNELS),
      partnerName: params.partnerName?.trim() || '',
      partnerDob: params.partnerDob || '',
      partnerTob: params.partnerTob || '09:30',
      partnerPob: params.partnerPob || '',
      partnerLat: params.partnerLat ?? 28.6139,
      partnerLng: params.partnerLng ?? 77.2090,
      includePartnerMilan: Boolean(params.includePartnerMilan),
      includeParivarMilan: true,
      healthConcerns: params.healthConcerns || [],
      createdAtIso: now.toISOString(),
    };

    const nextProfiles = [...profiles, newProfile];
    setProfiles(nextProfiles);
    broadcastSync(accounts, nextProfiles);
    setActiveProfileId(newProfileId);
    localStorage.setItem(SESSION_PROFILE_ID_KEY, newProfileId);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_profiles', newProfileId), newProfile);
        const sharedPayload = buildSharedReportPayload(
          newProfile,
          firebaseUser.uid,
          accounts,
          currentAccount
        );
        await setDoc(doc(db, 'tathastu_shared_reports', newProfileId), sharedPayload);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.CREATE, 'tathastu_profiles');
        } catch {
          // Handled
        }
      }
    }

    return { ok: true, profile: newProfile };
  };

  const updateProfileNotificationSettings = async (
    profileId: string,
    notificationsEnabled: boolean,
    channels: SixDailyNotificationChannels
  ) => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    const updated: AstroProfileRecord = {
      ...target,
      notificationsEnabled,
      notificationChannelsJson: JSON.stringify(channels),
    };

    const nextProfiles = profiles.map((p) => (p.id === profileId ? updated : p));
    setProfiles(nextProfiles);
    broadcastSync(accounts, nextProfiles);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_profiles', profileId), updated);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.UPDATE, `tathastu_profiles/${profileId}`);
        } catch {
          // Handled
        }
      }
    }
  };

  const adminUpdateProfile = async (
    updatedProfile: AstroProfileRecord
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = updatedProfile.email.trim().toLowerCase();
    const cleanMobile = updatedProfile.mobile.replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: 'A valid Email Address is required.' };
    }
    if (cleanMobile.length !== 10) {
      return { ok: false, error: 'A valid 10-digit Mobile Number is required.' };
    }

    const duplicateProfile = profiles.find(
      (p) =>
        p.id !== updatedProfile.id &&
        (p.email.trim().toLowerCase() === cleanEmail ||
          p.mobile.replace(/\D/g, '').slice(-10) === cleanMobile)
    );
    if (duplicateProfile) {
      return {
        ok: false,
        error: `Email or Mobile Number is already used by profile "${duplicateProfile.name}". 1 Email & 1 Mobile cannot be shared across profiles!`,
      };
    }

    const duplicateAccount = accounts.find(
      (a) =>
        a.id !== updatedProfile.accountId &&
        (a.email.trim().toLowerCase() === cleanEmail ||
          a.mobile.replace(/\D/g, '').slice(-10) === cleanMobile)
    );
    if (duplicateAccount) {
      return {
        ok: false,
        error: `Email or Mobile Number is already used by account "${duplicateAccount.name}".`,
      };
    }

    const sanitizedProfile: AstroProfileRecord = {
      ...updatedProfile,
      email: cleanEmail,
      mobile: cleanMobile,
    };

    const nextProfiles = profiles.map((p) =>
      p.id === sanitizedProfile.id ? sanitizedProfile : p
    );
    setProfiles(nextProfiles);
    broadcastSync(accounts, nextProfiles);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_profiles', sanitizedProfile.id), sanitizedProfile);
        const sharedPayload = buildSharedReportPayload(
          sanitizedProfile,
          firebaseUser.uid,
          accounts,
          currentAccount
        );
        await setDoc(doc(db, 'tathastu_shared_reports', sanitizedProfile.id), sharedPayload);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.UPDATE, `tathastu_profiles/${sanitizedProfile.id}`);
        } catch {
          // Handled
        }
      }
    }
    return { ok: true };
  };

  const adminDeleteProfile = async (profileId: string) => {
    if (currentAccount?.role !== 'admin') {
      triggerAdminRestrictionPopup('Delete Profile');
      return;
    }
    const nextProfiles = profiles.filter((p) => p.id !== profileId);
    setProfiles(nextProfiles);
    broadcastSync(accounts, nextProfiles, [profileId]);

    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'tathastu_profiles', profileId));
        await deleteDoc(doc(db, 'tathastu_shared_reports', profileId));
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.DELETE, `tathastu_profiles/${profileId}`);
        } catch {
          // Handled
        }
      }
    }
  };

  const adminUpdateAccount = async (
    updatedAccount: AccountRecord
  ): Promise<{ ok: boolean; error?: string }> => {
    const isSelfHealerUpdate =
      currentAccount?.role === 'healer' && currentAccount.id === updatedAccount.id;
    if (currentAccount?.role !== 'admin' && !isSelfHealerUpdate) {
      triggerAdminRestrictionPopup('Edit Account');
      return { ok: false, error: 'Only Admin can edit account details.' };
    }

    const cleanEmail = updatedAccount.email.trim().toLowerCase();
    const cleanMobile = updatedAccount.mobile.replace(/\D/g, '').slice(-10);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { ok: false, error: 'A valid Email Address is required.' };
    }
    if (cleanMobile.length !== 10) {
      return { ok: false, error: 'A valid 10-digit Mobile Number is required.' };
    }

    const duplicateAccount = accounts.find(
      (a) =>
        a.id !== updatedAccount.id &&
        (a.email.trim().toLowerCase() === cleanEmail ||
          a.mobile.replace(/\D/g, '').slice(-10) === cleanMobile)
    );
    if (duplicateAccount) {
      return {
        ok: false,
        error: `Email or Mobile Number is already registered to account "${duplicateAccount.name}".`,
      };
    }

    const duplicateProfile = profiles.find(
      (p) =>
        p.accountId !== updatedAccount.id &&
        (p.email.trim().toLowerCase() === cleanEmail ||
          p.mobile.replace(/\D/g, '').slice(-10) === cleanMobile)
    );
    if (duplicateProfile) {
      return {
        ok: false,
        error: `Email or Mobile Number is already linked to profile "${duplicateProfile.name}".`,
      };
    }

    const sanitizedAccount: AccountRecord = {
      ...updatedAccount,
      email: cleanEmail,
      mobile: cleanMobile,
    };

    const nextAccounts = accounts.map((a) =>
      a.id === sanitizedAccount.id ? sanitizedAccount : a
    );
    setAccounts(nextAccounts);
    broadcastSync(nextAccounts, profiles);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_accounts', sanitizedAccount.id), sanitizedAccount);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.UPDATE, `tathastu_accounts/${sanitizedAccount.id}`);
        } catch {
          // Handled
        }
      }
    }
    return { ok: true };
  };

  const adminDeleteAccount = async (accountId: string) => {
    if (currentAccount?.role !== 'admin') {
      triggerAdminRestrictionPopup('Delete Account');
      return;
    }
    const removedProfileIds = profiles
      .filter((p) => p.accountId === accountId)
      .map((p) => p.id);
    const nextAccounts = accounts.filter((a) => a.id !== accountId);
    const nextProfiles = profiles.filter((p) => p.accountId !== accountId);
    setAccounts(nextAccounts);
    setProfiles(nextProfiles);
    broadcastSync(nextAccounts, nextProfiles, [accountId, ...removedProfileIds]);

    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'tathastu_accounts', accountId));
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.DELETE, `tathastu_accounts/${accountId}`);
        } catch {
          // Handled
        }
      }
    }
  };

  const adminSavePlan = (plan: SubscriptionPlanOption) => {
    if (currentAccount?.role !== 'admin') return;
    const exists = plans.some((p) => p.id === plan.id);
    const nextPlans = exists
      ? plans.map((p) => (p.id === plan.id ? plan : p))
      : [...plans, plan];
    setPlans(nextPlans);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(nextPlans));
    notifyRealtimeChannel();
    pushServerRealtimeSync({
      action: 'replace_plans',
      plans: nextPlans,
    });
  };

  const adminDeletePlan = (planId: string) => {
    if (currentAccount?.role !== 'admin') return;
    const nextPlans = plans.filter((p) => p.id !== planId);
    setPlans(nextPlans);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(nextPlans));
    notifyRealtimeChannel();
    pushServerRealtimeSync({
      action: 'replace_plans',
      plans: nextPlans,
      deleteIds: [planId],
    });
  };

  const adminCreateCoupon = (coupon: Omit<DiscountCouponRecord, 'id' | 'createdAtIso'>) => {
    if (currentAccount?.role !== 'admin') return;
    const newCoupon: DiscountCouponRecord = {
      ...coupon,
      id: `coup_${Date.now()}`,
      code: coupon.code.trim().toUpperCase(),
      createdAtIso: new Date().toISOString(),
    };
    const nextCoupons = [newCoupon, ...coupons];
    setCoupons(nextCoupons);
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(nextCoupons));
    notifyRealtimeChannel();
    pushServerRealtimeSync({
      action: 'coupon_sync',
      coupons: nextCoupons,
    });
  };

  const adminToggleCoupon = (couponId: string) => {
    if (currentAccount?.role !== 'admin') return;
    const nextCoupons = coupons.map((c) =>
      c.id === couponId ? { ...c, isActive: !c.isActive } : c
    );
    setCoupons(nextCoupons);
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(nextCoupons));
    notifyRealtimeChannel();
    pushServerRealtimeSync({
      action: 'coupon_sync',
      coupons: nextCoupons,
    });
  };

  const adminDeleteCoupon = (couponId: string) => {
    if (currentAccount?.role !== 'admin') return;
    const nextCoupons = coupons.filter((c) => c.id !== couponId);
    setCoupons(nextCoupons);
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(nextCoupons));
    notifyRealtimeChannel();
    pushServerRealtimeSync({
      action: 'coupon_sync',
      coupons: nextCoupons,
      deleteIds: [couponId],
    });
  };

  const adminSendBroadcastNotification: TathastuContextValue['adminSendBroadcastNotification'] = (
    params
  ) => {
    if (currentAccount?.role !== 'admin') return;
    const newBroadcast: BroadcastNotificationRecord = {
      id: `bcast_${Date.now()}`,
      title: params.title.trim().slice(0, 160),
      message: params.message.trim().slice(0, 1200),
      category: params.category,
      targetAudience: params.targetAudience,
      couponCode: params.couponCode?.trim().toUpperCase() || undefined,
      createdAtIso: new Date().toISOString(),
    };
    const nextBroadcasts = [newBroadcast, ...broadcasts];
    setBroadcasts(nextBroadcasts);
    setLatestLiveBroadcastAlert(newBroadcast);
    localStorage.setItem(LAST_SEEN_BROADCAST_ID_KEY, newBroadcast.id);
    localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(nextBroadcasts));
    notifyRealtimeChannel();

    // Push immediately to Server SSE Hub so all mobile & desktop devices receive it in real time
    pushServerRealtimeSync({
      action: 'broadcast_push',
      broadcasts: nextBroadcasts,
      meta: { broadcastId: newBroadcast.id },
    });

    if (firebaseUser) {
      const firestorePayload: Record<string, any> = {
        id: newBroadcast.id,
        title: newBroadcast.title,
        message: newBroadcast.message,
        category: newBroadcast.category,
        targetAudience: newBroadcast.targetAudience,
        createdAtIso: newBroadcast.createdAtIso,
      };
      if (newBroadcast.couponCode) {
        firestorePayload.couponCode = newBroadcast.couponCode;
      }
      setDoc(doc(db, 'tathastu_broadcasts', newBroadcast.id), firestorePayload).catch((err) => {
        try {
          handleFirestoreError(err, OperationType.CREATE, `tathastu_broadcasts/${newBroadcast.id}`);
        } catch {
          // Handled
        }
      });
    }

    sendBrowserNotification(`🕉️ ${TATHASTU_BRAND_NAME}: ${newBroadcast.title}`, {
      body: `${newBroadcast.message}${newBroadcast.couponCode ? ` | Use Code: ${newBroadcast.couponCode}` : ''}`,
      tag: `tathastu-bcast-${newBroadcast.id}`,
    });
  };

  const adminDeleteBroadcast = (broadcastId: string) => {
    if (currentAccount?.role !== 'admin') return;
    const nextBroadcasts = broadcasts.filter((b) => b.id !== broadcastId);
    setBroadcasts(nextBroadcasts);
    localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(nextBroadcasts));
    notifyRealtimeChannel();
    pushServerRealtimeSync({
      action: 'broadcast_delete',
      broadcasts: nextBroadcasts,
      deleteIds: [broadcastId],
    });
    if (firebaseUser) {
      deleteDoc(doc(db, 'tathastu_broadcasts', broadcastId)).catch(() => {});
    }
  };

  const submitFeedbackSuggestion: TathastuContextValue['submitFeedbackSuggestion'] = async (
    params
  ) => {
    if (!currentAccount) {
      return { ok: false, error: 'Please log in to submit your rating or feedback.' };
    }
    const rawMsg = (params.message || '').trim();
    const cleanMessage = (rawMsg.length >= 2 ? rawMsg : `Guidance Session Rated ${params.rating}/5 Stars`).slice(
      0,
      1500
    );
    const cleanHealerId = (params.ratedHealerId || 'admin_tathastu_master').trim().slice(0, 128);
    const cleanHealerName = (params.ratedHealerName || 'Healer Ddeepak Jain (Admin)')
      .trim()
      .slice(0, 120);

    const newFb: FeedbackSuggestionRecord = {
      id: `fb_${Date.now()}`,
      accountId: currentAccount.id,
      ownerUid: firebaseUser?.uid || currentAccount.ownerUid || currentAccount.id,
      senderRole: currentAccount.role,
      senderName: (currentAccount.name || 'Divine Seeker').slice(0, 120),
      senderMobile: (currentAccount.mobile || TATHASTU_ADMIN_PHONE).slice(0, 24),
      senderEmail: (currentAccount.email || 'seeker@tathastulight.com').slice(0, 160),
      category: params.category,
      rating: Math.max(1, Math.min(5, Number(params.rating) || 5)),
      ratedHealerId: cleanHealerId,
      ratedHealerName: cleanHealerName,
      message: cleanMessage,
      createdAtIso: new Date().toISOString(),
    };

    const nextFeedbacks = [newFb, ...feedbacks];
    setFeedbacks(nextFeedbacks);
    localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(nextFeedbacks));
    notifyRealtimeChannel();
    await pushServerRealtimeSync({
      action: 'feedback_submitted',
      feedbacks: nextFeedbacks,
    });

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_feedbacks', newFb.id), newFb);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.CREATE, `tathastu_feedbacks/${newFb.id}`);
        } catch {
          // Handled
        }
      }
    }

    return { ok: true };
  };

  const adminReplyToFeedback = async (feedbackId: string, replyText: string) => {
    if (currentAccount?.role !== 'admin') return;
    const target = feedbacks.find((f) => f.id === feedbackId);
    if (!target) return;
    const updated: FeedbackSuggestionRecord = {
      ...target,
      adminReply: replyText.trim().slice(0, 1000),
    };
    const nextFeedbacks = feedbacks.map((f) => (f.id === feedbackId ? updated : f));
    setFeedbacks(nextFeedbacks);
    localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(nextFeedbacks));
    notifyRealtimeChannel();
    await pushServerRealtimeSync({
      action: 'feedback_reply',
      feedbacks: nextFeedbacks,
    });

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'tathastu_feedbacks', feedbackId), updated);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.UPDATE, `tathastu_feedbacks/${feedbackId}`);
        } catch {
          // Handled
        }
      }
    }
  };

  const adminDeleteFeedback = async (feedbackId: string) => {
    if (currentAccount?.role !== 'admin') return;
    const nextFeedbacks = feedbacks.filter((f) => f.id !== feedbackId);
    setFeedbacks(nextFeedbacks);
    localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(nextFeedbacks));
    notifyRealtimeChannel();
    await pushServerRealtimeSync({
      action: 'feedback_delete',
      feedbacks: nextFeedbacks,
      deleteIds: [feedbackId],
    });
    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'tathastu_feedbacks', feedbackId));
      } catch {
        // Handled
      }
    }
  };

  const canCurrentAccountDownloadOrShare = () => {
    if (!currentAccount) return false;
    if (currentAccount.role === 'admin') return true;
    return currentAccount.canDownloadShare || currentAccount.isFoc;
  };

  const canCurrentAccountEditOrDelete = () => {
    if (!currentAccount) return false;
    return currentAccount.role === 'admin';
  };

  return (
    <TathastuContext.Provider
      value={{
        accounts,
        profiles,
        plans,
        coupons,
        broadcasts,
        feedbacks,
        latestLiveBroadcastAlert,
        dismissLiveBroadcastAlert,
        currentAccount,
        activeProfile,
        firebaseUser,
        restrictionModal,
        closeRestrictionModal,
        triggerAdminRestrictionPopup,
        loginWithCredentials,
        loginWithFirebaseGoogleUser,
        quickSwitchRoleAccount,
        logout,
        registerAccountAndPrimaryProfile,
        upgradeAccountPlan,
        resetPasswordByEmailAndMobile,
        selectActiveProfile,
        clearActiveProfile,
        addNewProfileUnderAccount,
        updateProfileNotificationSettings,
        adminUpdateProfile,
        adminDeleteProfile,
        adminUpdateAccount,
        adminDeleteAccount,
        adminSavePlan,
        adminDeletePlan,
        adminCreateCoupon,
        adminToggleCoupon,
        adminDeleteCoupon,
        adminSendBroadcastNotification,
        adminDeleteBroadcast,
        submitFeedbackSuggestion,
        adminReplyToFeedback,
        adminDeleteFeedback,
        canCurrentAccountDownloadOrShare,
        canCurrentAccountEditOrDelete,
      }}
    >
      {children}
    </TathastuContext.Provider>
  );
};

export function useTathastu() {
  const ctx = useContext(TathastuContext);
  if (!ctx) {
    throw new Error('useTathastu must be used inside TathastuProvider');
  }
  return ctx;
}
