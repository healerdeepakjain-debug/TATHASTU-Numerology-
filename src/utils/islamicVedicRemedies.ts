import { BirthProfile } from '../types';
import { calculateMulank, calculateBhagyank, analyzeName } from './numerology';

export interface AsmaUlHusnaRemedy {
  number: number;
  arabicName: string;
  transliteration: string;
  meaning: string;
  abjadCount: number;
  recommendedDailyCount: string;
  bestPrayerTime: string;
  planetarySphere: string;
  vedicPlanetEquivalent: string;
  spiritualBenefit: string;
  specificChallengeSolved: string;
}

export interface QuranicPlanetaryRemedy {
  id: string;
  lifeArea: string;
  planetaryChallenge: string;
  surahOrDuaName: string;
  arabicSnippet: string;
  transliteration: string;
  translationSummary: string;
  recitationProtocol: string;
  sadaqahCharityItem: string;
  halalStoneAndAttar: string;
}

export interface DayWiseDhikrProtocol {
  day: string;
  islamicPlanet: string;
  vedicPlanet: string;
  primaryDhikr: string;
  arabicDhikr: string;
  count: string;
  sadaqahAction: string;
  benefit: string;
}

export interface IslamicVedicProfileReport {
  mulank: number;
  bhagyank: number;
  namank: number;
  abjadCompoundEstimate: number;
  abjadRootNumber: number;
  primaryAsmaRemedy: AsmaUlHusnaRemedy;
  destinyAsmaRemedy: AsmaUlHusnaRemedy;
  nameAsmaRemedy: AsmaUlHusnaRemedy;
  allNineAsmaRemedies: AsmaUlHusnaRemedy[];
  quranicRemedies: QuranicPlanetaryRemedy[];
  weeklyDhikrSchedule: DayWiseDhikrProtocol[];
  personalizedSummaryParagraph: string;
}

export const ASMA_UL_HUSNA_BY_NUMBER: Record<number, AsmaUlHusnaRemedy> = {
  1: {
    number: 1,
    arabicName: 'يَا حَيُّ يَا قَيُّومُ • يَا مَلِكُ',
    transliteration: 'Ya Hayyu Ya Qayyum • Ya Maliku',
    meaning: 'The Ever-Living, The Self-Subsisting • The Sovereign Lord',
    abjadCount: 174,
    recommendedDailyCount: '111 times or 174 times daily',
    bestPrayerTime: 'Immediately after Fajr Namaz at Sunrise facing Qibla',
    planetarySphere: 'Shams (Sun Sphere — Authority, Dignity & Leadership)',
    vedicPlanetEquivalent: 'Surya (Sun — Number 1)',
    spiritualBenefit:
      'Bestows commanding leadership, government favor, high self-esteem, fatherly blessings, and protection from public humiliation.',
    specificChallengeSolved:
      'Overcomes career stagnation, ego clashes with superiors, weak vitality, and delays in official approvals.',
  },
  2: {
    number: 2,
    arabicName: 'يَا رَحْمٰنُ يَا رَحِيمُ • يَا لَطِيفُ',
    transliteration: 'Ya Rahmanu Ya Rahimu • Ya Latifu',
    meaning: 'The Most Compassionate, The Most Merciful • The Subtle & Gentle',
    abjadCount: 129,
    recommendedDailyCount: '129 times or 298 times daily',
    bestPrayerTime: 'After Fajr and Isha prayers in a calm state of wudu',
    planetarySphere: 'Qamar (Moon Sphere — Peace of Heart, Intuition & Emotional Harmony)',
    vedicPlanetEquivalent: 'Chandra (Moon — Number 2)',
    spiritualBenefit:
      'Calms anxiety, overthinking, and emotional turbulence; brings deep sukoon (tranquility), marital affection, and intuitive clarity.',
    specificChallengeSolved:
      'Heals mood swings, sleep disturbances, mother-related worries, and liquid cash flow fluctuations.',
  },
  3: {
    number: 3,
    arabicName: 'يَا عَلِيمُ يَا حَكِيمُ • يَا وَهَّابُ',
    transliteration: 'Ya Aleemu Ya Hakeemu • Ya Wahhabu',
    meaning: 'The All-Knowing, The All-Wise • The Supreme Bestower',
    abjadCount: 228,
    recommendedDailyCount: '114 times or 228 times daily',
    bestPrayerTime: 'After Fajr and Asr prayers (Especially potent on Thursdays / Jumuah Eve)',
    planetarySphere: 'Mushtari (Jupiter Sphere — Higher Wisdom, Barkat & Spiritual Grace)',
    vedicPlanetEquivalent: 'Guru / Brihaspati (Jupiter — Number 3)',
    spiritualBenefit:
      'Opens doors of Ilm (knowledge), halal Rizq (sustenance), mentorship, higher education success, and respect in society.',
    specificChallengeSolved:
      'Removes debt burdens, poor financial judgment, liver/digestive weakness, and obstacles in children’s progress.',
  },
  4: {
    number: 4,
    arabicName: 'يَا فَتَّاحُ يَا نُورُ • يَا مُهَيْمِنُ',
    transliteration: 'Ya Fattahu Ya Nooru • Ya Muhayminu',
    meaning: 'The Supreme Opener of Locked Doors • The Divine Light & Guardian',
    abjadCount: 489,
    recommendedDailyCount: '489 times (or 79 times after every Fard prayer)',
    bestPrayerTime: 'After Fajr prayer with hands placed over the heart',
    planetarySphere: 'falak-ul-Uqdah (North Node — Sudden Breakthroughs & Protection from Confusion)',
    vedicPlanetEquivalent: 'Rahu (North Node — Number 4)',
    spiritualBenefit:
      'Shatters unseen blockages, sudden misunderstandings, Nazar (evil eye), and opens locked doors of livelihood and foreign success.',
    specificChallengeSolved:
      'Protects against sudden reversals, legal traps, digital/technical losses, and restless mental fog.',
  },
  5: {
    number: 5,
    arabicName: 'يَا سَلَامُ يَا وَكِيلُ • يَا سَمِيعُ',
    transliteration: 'Ya Salamu Ya Wakeelu • Ya Sameeu',
    meaning: 'The Source of Peace & Safety • The Ultimate Trustee & All-Hearing',
    abjadCount: 131,
    recommendedDailyCount: '131 times or 66 times daily',
    bestPrayerTime: 'After Zuhr or Asr prayer before business negotiations',
    planetarySphere: 'Utarid (Mercury Sphere — Commerce, Eloquence & Swift Intellect)',
    vedicPlanetEquivalent: 'Budh (Mercury — Number 5)',
    spiritualBenefit:
      'Sharpens commercial intelligence, persuasive speech, trade profits, memory power, and nervous system balance.',
    specificChallengeSolved:
      'Prevents contract disputes, partnership betrayal, skin/nerve stress, and mercantile losses.',
  },
  6: {
    number: 6,
    arabicName: 'يَا وَدُودُ يَا غَنِيُّ يَا مُغْنِي',
    transliteration: 'Ya Wadudu Ya Ghaniyyu Ya Mughni',
    meaning: 'The Most Loving • The Self-Sufficient Bestower of Abundance',
    abjadCount: 1000,
    recommendedDailyCount: '100 times Ya Wadudu + 111 times Ya Ghaniyyu daily',
    bestPrayerTime: 'After Maghrib or Isha prayer (Especially blessed on Fridays)',
    planetarySphere: 'Zuhra (Venus Sphere — Love, Nikah Harmony, Beauty & Prosperity)',
    vedicPlanetEquivalent: 'Shukra (Venus — Number 6)',
    spiritualBenefit:
      'Creates magnetic personal charm, deep love between spouses (Mohabbat & Mawaddah), luxury, comfort, and debt-free prosperity.',
    specificChallengeSolved:
      'Resolves marital coldness, delayed Nikah/marriage, domestic discord, and luxury-related financial drains.',
  },
  7: {
    number: 7,
    arabicName: 'يَا هَادِي يَا خَبِيرُ • يَا بَاطِنُ',
    transliteration: 'Ya Hadi Ya Khabeeru • Ya Batinu',
    meaning: 'The Supreme Guide • The All-Aware of Inner Realities',
    abjadCount: 832,
    recommendedDailyCount: '101 times or 200 times daily',
    bestPrayerTime: 'At Tahajjud or quiet contemplation after Isha prayer',
    planetarySphere: 'Falak-ul-Zanab (South Node — Spiritual Kashf, Intuition & Detachment)',
    vedicPlanetEquivalent: 'Ketu (South Node — Number 7)',
    spiritualBenefit:
      'Awakens spiritual insight (Basirat), true dreams, research mastery, healing power, and protection from hidden enemies.',
    specificChallengeSolved:
      'Heals unexplained isolation, betrayal by trusted people, chronic undiagnosed fatigue, and spiritual restlessness.',
  },
  8: {
    number: 8,
    arabicName: 'يَا رَزَّاقُ يَا صَبُورُ • يَا عَدْلُ',
    transliteration: 'Ya Razzaqu Ya Sabooru • Ya Adlu',
    meaning: 'The Supreme Provider • The Infinitely Patient & Just',
    abjadCount: 308,
    recommendedDailyCount: '308 times daily (or 100 times before breakfast)',
    bestPrayerTime: 'Early morning after Fajr facing all 4 corners of the house',
    planetarySphere: 'Zuhal (Saturn Sphere — Justice, Hard-Earned Assets, Land & Endurance)',
    vedicPlanetEquivalent: 'Shani (Saturn — Number 8)',
    spiritualBenefit:
      'Transforms prolonged struggle into permanent real-estate wealth, industrial success, judicial victory, and steadfast patience (Sabr).',
    specificChallengeSolved:
      'Relieves heavy karmic delays, court cases, joint/bone pain, labor disputes, and financial hardship.',
  },
  9: {
    number: 9,
    arabicName: 'يَا قَوِيُّ يَا مَتِينُ • يَا حَفِيظُ',
    transliteration: 'Ya Qawiyyu Ya Mateenu • Ya Hafeezu',
    meaning: 'The Possessor of All Strength, The Firm • The All-Preserving Guardian',
    abjadCount: 998,
    recommendedDailyCount: '116 times Ya Qawiyyu + 99 times Ya Hafeezu daily',
    bestPrayerTime: 'After Zuhr or Asr prayer (Especially on Tuesdays)',
    planetarySphere: 'Mirrikh (Mars Sphere — Courage, Victory, Vitality & Shielding)',
    vedicPlanetEquivalent: 'Mangal (Mars — Number 9)',
    spiritualBenefit:
      'Grants fearless courage, physical stamina, victory over competitors, blood vitality, and an impenetrable spiritual shield.',
    specificChallengeSolved:
      'Calms explosive anger, sibling/property disputes, surgical/accident risks, and blood pressure imbalances.',
  },
};

export const QURANIC_PLANETARY_REMEDIES: QuranicPlanetaryRemedy[] = [
  {
    id: 'rizq-barkat',
    lifeArea: 'Career Growth, Business Barkat & Debt Relief (Jupiter / Saturn / Mercury Harmony)',
    planetaryChallenge: 'Financial blockages, delayed payments, business stagnation, or heavy loan pressure',
    surahOrDuaName: 'Surah Al-Waqiah (Chapter 56) & Dua-e-Qarz',
    arabicSnippet: 'إِنَّ هَٰذَا لَرِزْقُنَا مَا لَهُ مِن نَّفَادٍ • اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ',
    transliteration: 'Inna haza larizquna ma lahu min nafad • Allahummak-fini bihalalika an haramika wa aghnini bifadlika amman siwak',
    translationSummary: 'Indeed, this is Our provision for you which will never be exhausted. O Allah, suffice me with Your Halal sustenance and make me independent by Your grace.',
    recitationProtocol: 'Recite Surah Al-Waqiah once every night after Maghrib or Isha prayer, and recite the Dua 7 times after every Fard Namaz.',
    sadaqahCharityItem: 'Feed birds (grain/millet) in the morning and donate yellow grains, chana dal, or meals to the needy on Thursdays and Fridays.',
    halalStoneAndAttar: 'Yemeni Aqeeq (Carnelian) in a silver ring + Pure Oud or Saffron (Zafran) non-alcoholic Attar.',
  },
  {
    id: 'nikah-marriage-harmony',
    lifeArea: 'Marriage Compatibility, Spousal Love (Mohabbat) & Domestic Peace (Venus / Moon Harmony)',
    planetaryChallenge: 'Post-marriage misunderstandings, ego clashes between husband & wife, or delayed marriage',
    surahOrDuaName: 'Surah Ar-Rum (Ayah 21), Surah Al-Furqan (Ayah 74) & Ya Wadudu Wazifa',
    arabicSnippet: 'وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً • رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
    transliteration: 'Wa ja’ala baynakum mawaddatan wa rahmah • Rabbana hablana min azwajina wa dhurriyyatina qurrata a’yunin',
    translationSummary: 'And He placed between you deep affection and mercy. Our Lord, grant us from among our spouses and offspring comfort to our eyes.',
    recitationProtocol: 'Recite "Ya Wadudu" 101 times with Durood-e-Ibrahimi 3 times before and after, then blow gently over drinking water shared by both spouses.',
    sadaqahCharityItem: 'Donate white items (milk, rice, sugar, or white clothes) on Fridays to orphans or widows.',
    halalStoneAndAttar: 'Natural Pearl (Moti) or White Dur-e-Najaf in silver + White Musk (Mushk-e-Abyad) or Rose (Gulab) Attar.',
  },
  {
    id: 'nazar-hasad-protection',
    lifeArea: 'Protection from Nazar-e-Bad (Evil Eye), Hasad (Envy) & Unseen Rahu/Ketu Obstacles',
    planetaryChallenge: 'Sudden unexplained losses, health drops after public praise, or heavy negative aura in the home',
    surahOrDuaName: 'Ayat-ul-Kursi (2:255) & The Three Quls (Surah Al-Ikhlas, Al-Falaq, An-Nas)',
    arabicSnippet: 'فَاللَّهُ خَيْرٌ حَافِظًا وَهُوَ أَرْحَمُ الرَّاحِمِينَ • وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: 'Fallahu khayrun hafizaw-wa Huwa Arhamur-Rahimeen • Wa min sharri hasidin idha hasad',
    translationSummary: 'But Allah is the Best Guardian, and He is the Most Merciful of the merciful. And from the evil of an envier when he envies.',
    recitationProtocol: 'Recite Ayat-ul-Kursi once after every Fard prayer and 3 times each of Surah Ikhlas, Surah Falaq, and Surah Nas morning and evening (cupping hands and wiping over the body).',
    sadaqahCharityItem: 'Give black grains, dates (Khajoor), or iron/blanket charity to laborers on Saturdays.',
    halalStoneAndAttar: 'Nishapuri Feroza (Turquoise) or Sulemani Hakik in silver + Sandalwood or Amber Attar.',
  },
  {
    id: 'career-authority-victory',
    lifeArea: 'Leadership, Heart Strength, Exam Success & Overcoming Obstacles (Sun / Mars Harmony)',
    planetaryChallenge: 'Lack of confidence, court/legal disputes, opposition from rivals, or fear before major meetings',
    surahOrDuaName: 'Surah Yaseen (Heart of the Quran) & Dua of Prophet Musa (Surah Taha 20:25-28)',
    arabicSnippet: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
    transliteration: 'Rabbish-rah li sadri, wa yassir li amri, wahlul uqdatan min lisani, yafqahu qawli',
    translationSummary: 'My Lord, expand for me my chest [with assurance], ease for me my task, and untie the knot from my tongue that they may understand my speech.',
    recitationProtocol: 'Recite Surah Yaseen after Fajr for daily barakah, and recite "Rabbish-rah li sadri..." 21 times before interviews, pitches, or official signings.',
    sadaqahCharityItem: 'Donate wheat, jaggery, pomegranates, or clean drinking water on Sundays and Tuesdays.',
    halalStoneAndAttar: 'Red Yemeni Aqeeq (Marjan/Coral alternative) + Majmua or Hina Attar.',
  },
  {
    id: 'shifa-health-chakra',
    lifeArea: 'Complete Physical & Spiritual Shifa (Healing) & 7-Lataif / Chakra Purification',
    planetaryChallenge: 'Chronic stress, psychosomatic illness, low pranic energy, or heart restlessness',
    surahOrDuaName: 'Surah Al-Fatihah (Ash-Shafiyah) & Six Ayahs of Shifa (Ayat-ush-Shifa)',
    arabicSnippet: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ • اللَّهُمَّ اشْفِ أَنْتَ الشَّافِي',
    transliteration: 'Wa nunazzilu minal-Qur’ani ma huwa shifa’un wa rahmatul-lil-mu’mineen • Allahummash-fi Antash-Shafi',
    translationSummary: 'And We send down of the Quran that which is a healing and a mercy for the believers. O Allah, grant complete healing, for You are the Ultimate Healer.',
    recitationProtocol: 'Recite Surah Al-Fatihah 7 times with Durood Shareef before and after, blow on Zamzam or pure filtered water, and drink facing Qibla.',
    sadaqahCharityItem: 'Sponsor medicine or meals for a sick indigent person.',
    halalStoneAndAttar: 'Green Jade / Emerald-toned Aqeeq + Kasturi or Ruh Khus (Vetiver) Attar.',
  },
];

export const WEEKLY_DHIKR_SCHEDULE: DayWiseDhikrProtocol[] = [
  {
    day: 'Sunday (Yawm al-Ahad)',
    islamicPlanet: 'Shams (Sun)',
    vedicPlanet: 'Surya (Sun)',
    primaryDhikr: 'Ya Hayyu Ya Qayyum',
    arabicDhikr: 'يَا حَيُّ يَا قَيُّومُ',
    count: '174 times after Fajr',
    sadaqahAction: 'Donate wheat, dates, or warm food to the needy.',
    benefit: 'Elevates authority, vitality, government favor, and career leadership.',
  },
  {
    day: 'Monday (Yawm al-Ithnayn)',
    islamicPlanet: 'Qamar (Moon)',
    vedicPlanet: 'Chandra (Moon)',
    primaryDhikr: 'Ya Rahmanu Ya Rahimu',
    arabicDhikr: 'يَا رَحْمٰنُ يَا رَحِيمُ',
    count: '100 times after Fajr & Isha',
    sadaqahAction: 'Donate milk, rice, or clean drinking water.',
    benefit: 'Brings emotional peace (Sukoon-e-Qalb), mental clarity, and family harmony.',
  },
  {
    day: 'Tuesday (Yawm ath-Thulatha)',
    islamicPlanet: 'Mirrikh (Mars)',
    vedicPlanet: 'Mangal (Mars)',
    primaryDhikr: 'Ya Qawiyyu Ya Hafeezu',
    arabicDhikr: 'يَا قَوِيُّ يَا حَفِيظُ',
    count: '116 times after Zuhr',
    sadaqahAction: 'Donate red lentils (masoor), jaggery, or support someone in distress.',
    benefit: 'Grants courage, protection from accidents/disputes, and victory over rivals.',
  },
  {
    day: 'Wednesday (Yawm al-Arbi’a)',
    islamicPlanet: 'Utarid (Mercury)',
    vedicPlanet: 'Budh (Mercury)',
    primaryDhikr: 'Ya Aleemu Ya Wakeelu',
    arabicDhikr: 'يَا عَلِيمُ يَا وَكِيلُ',
    count: '150 times before work',
    sadaqahAction: 'Donate books, stationery, or green fruits/vegetables to students.',
    benefit: 'Sharpens business acumen, communication, trade profits, and intellect.',
  },
  {
    day: 'Thursday (Yawm al-Khamis)',
    islamicPlanet: 'Mushtari (Jupiter)',
    vedicPlanet: 'Guru / Brihaspati (Jupiter)',
    primaryDhikr: 'Ya Razzaqu Ya Wahhabu',
    arabicDhikr: 'يَا رَزَّاقُ يَا وَهَّابُ',
    count: '308 times after Fajr / Maghrib',
    sadaqahAction: 'Feed the hungry, give yellow sweets/grains, and send abundant Durood Shareef.',
    benefit: 'Attracts immense Barkat in wealth, spiritual wisdom, and auspicious marriage.',
  },
  {
    day: 'Friday (Yawm al-Jumu’ah)',
    islamicPlanet: 'Zuhra (Venus)',
    vedicPlanet: 'Shukra (Venus)',
    primaryDhikr: 'Ya Wadudu Ya Ghaniyyu + Surah Al-Kahf',
    arabicDhikr: 'يَا وَدُودُ يَا غَنِيُّ',
    count: '100 times + Durood Shareef 100 times',
    sadaqahAction: 'Apply Halal Attar, wear clean attire, and give Friday charity before Jumuah prayer.',
    benefit: 'Magnetizes spousal love, luxury, beauty, social grace, and divine acceptance.',
  },
  {
    day: 'Saturday (Yawm as-Sabt)',
    islamicPlanet: 'Zuhal (Saturn)',
    vedicPlanet: 'Shani (Saturn)',
    primaryDhikr: 'Ya Fattahu Ya Sabooru + Astaghfirullah',
    arabicDhikr: 'يَا فَتَّاحُ يَا صَبُورُ • أَسْتَغْفِرُ اللّٰهَ',
    count: '100 times Istighfar + 79 times Ya Fattahu',
    sadaqahAction: 'Help manual workers, elderly, or underprivileged families with food/clothing.',
    benefit: 'Clears heavy karmic blockages, protects from Nazar/Hasad, and stabilizes property/assets.',
  },
];

// Traditional Abjad Letter Mapping for English Transliterated Letters
const ABJAD_ENGLISH_MAP: Record<string, number> = {
  A: 1,
  B: 2,
  G: 3,
  D: 4,
  H: 5,
  W: 6,
  U: 6,
  V: 6,
  Z: 7,
  K: 20,
  L: 30,
  M: 40,
  N: 50,
  S: 60,
  O: 70,
  F: 80,
  P: 80,
  Q: 100,
  R: 200,
  C: 300,
  T: 400,
  E: 5,
  I: 10,
  J: 3,
  Y: 10,
  X: 60,
};

export function calculateIslamicVedicReport(profile: BirthProfile): IslamicVedicProfileReport {
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const nameRes = analyzeName(profile.name, mulank, bhagyank);
  const namank = nameRes.chaldeanSingle;

  const cleanUpper = profile.name.toUpperCase().replace(/[^A-Z]/g, '');
  let abjadSum = 0;
  for (const ch of cleanUpper) {
    abjadSum += ABJAD_ENGLISH_MAP[ch] || 1;
  }
  if (abjadSum === 0) abjadSum = 110;

  let abjadRoot = abjadSum % 9;
  if (abjadRoot === 0) abjadRoot = 9;

  const primaryAsmaRemedy = ASMA_UL_HUSNA_BY_NUMBER[mulank] || ASMA_UL_HUSNA_BY_NUMBER[1];
  const destinyAsmaRemedy = ASMA_UL_HUSNA_BY_NUMBER[bhagyank] || ASMA_UL_HUSNA_BY_NUMBER[9];
  const nameAsmaRemedy = ASMA_UL_HUSNA_BY_NUMBER[namank] || ASMA_UL_HUSNA_BY_NUMBER[5];

  const personalizedSummaryParagraph = `According to Ilm-ul-Adad (Sacred Islamic Numerology) and Vedic-Chaldean Planetary Science, ${profile.name} carries a Birth Driver (Mulank) of ${mulank} governed by ${primaryAsmaRemedy.planetarySphere} and a Life Path Destiny (Bhagyank) of ${bhagyank} governed by ${destinyAsmaRemedy.planetarySphere}. The estimated Abjad numerical resonance of the name "${profile.name}" is ${abjadSum} (Root ${abjadRoot}). To align your spiritual Lataif (subtle energy centers) and attract abundant halal Rizq, Barkat, marital harmony, and protection from Nazar-e-Bad, your primary supreme Dhikr is "${primaryAsmaRemedy.transliteration}" (${primaryAsmaRemedy.arabicName}) recited ${primaryAsmaRemedy.recommendedDailyCount}, paired with your destiny Wazifa "${destinyAsmaRemedy.transliteration}" (${destinyAsmaRemedy.arabicName}).`;

  return {
    mulank,
    bhagyank,
    namank,
    abjadCompoundEstimate: abjadSum,
    abjadRootNumber: abjadRoot,
    primaryAsmaRemedy,
    destinyAsmaRemedy,
    nameAsmaRemedy,
    allNineAsmaRemedies: Object.values(ASMA_UL_HUSNA_BY_NUMBER),
    quranicRemedies: QURANIC_PLANETARY_REMEDIES,
    weeklyDhikrSchedule: WEEKLY_DHIKR_SCHEDULE,
    personalizedSummaryParagraph,
  };
}
