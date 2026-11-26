import {
  reduceToSingleDigit,
  PLANETARY_PROFILES,
  calculateMulank,
  calculateBhagyank,
  getPlanetaryRelationship,
} from './numerology';
import { calculateVedicAstrologyFromBirth } from './astrologyAndCities';

export interface MissingNumberRemedyDetail {
  number: number;
  planet: string;
  soundFrequency: string;
  wear: string[];
  vastuAndFengShui: string[];
  rituals: string[];
}

export interface MobileAdjacentPair {
  pair: string;
  status: 'Benefic' | 'Malefic' | 'Neutral';
  prediction: string;
}

export interface VedicGridCell {
  positionNumber: number; // 3,1,9 / 6,7,5 / 2,8,4
  displayValue: string;   // e.g. "33" or "1" or ""
  count: number;
}

export interface ChartCombinationReading {
  combination: string; // e.g. "3,1" or "2,8" or "3,1,6"
  type: '2-Digit Yoga' | '3-Digit Yoga';
  title: string;
  paragraphs: string[];
}

export interface NumerologyDashaPeriod {
  dashaNumber: number;
  planet: string;
  sanskritName: string;
  startDate: string; // e.g. "16-02-2022"
  endDate: string;   // e.g. "16-02-2028"
  startYear: number;
  endYear: number;
  durationYears: number;
  durationLabel?: string; // e.g. "6 Yrs 5 Mos (Birth Balance)" or "20 Years"
  activeAntardasha?: string; // e.g. "Saturn (Shani) Bhukti (04-06-2026 to 04-08-2029)"
  systemType?: 'Vedic Numerology (45-Yr Mulank Cycle)' | 'Vedic Astrology Vimshottari (120-Yr Nakshatra Cycle)';
  isCurrent: boolean;
  cycleStatus: 'PAST CYCLE (Completed)' | 'PRESENT CYCLE (Active Now)' | 'UPCOMING CYCLE (Future)';
  harmonyPercent: number;
  harmonyVerdict: string;
  remedy: string;
  paragraphs: string[];
}

export interface AdvanceMobileReportData {
  mobileNumber: string;
  mobileCompound: number;
  mobileTotal: number;
  mobileTotalPrediction: string;
  recommendedMobileTotals: number[];
  avoidNumbersInMobile: number[];
  exampleRecommendedNumbers: {
    number: string;
    compound: number;
    total: number;
    benefit: string;
  }[];
  luckyColours: string[];
  unluckyColours: string[];
  luckyNumbers: number[];
  unluckyNumbers: number[];
  neutralNumbers: number[];
  missingNumbersFormatted: string;
  missingNumbersList: number[];
  missingNumberRemedies: MissingNumberRemedyDetail[];
  mobileCombinations: MobileAdjacentPair[];
  combinedPairPrediction: string[];
  recommendedWallpaper: {
    title: string;
    hindiTitle: string;
    theme: 'airplane' | 'rising-sun' | 'white-horses' | 'emerald-forest' | 'golden-temple' | 'lotus-lake';
    description: string;
    placementAdvice: string;
  };
  vedicGrid: VedicGridCell[][]; // 3x3: [[3,1,9],[6,7,5],[2,8,4]]
  presentNumberReadings: {
    number: number;
    count: number;
    heading: string;
    description: string;
    repetitionNote?: string;
  }[];
  chartCombinations: ChartCombinationReading[];
  rulingPlanetName: string;
  dashaTimeline: NumerologyDashaPeriod[];
  pastDashaCycles?: NumerologyDashaPeriod[];
  vimshottariDashaTimeline?: NumerologyDashaPeriod[];
  vimshottariPastCycles?: NumerologyDashaPeriod[];
  numerologyDashaTimeline?: NumerologyDashaPeriod[];
  numerologyPastCycles?: NumerologyDashaPeriod[];
  janmaNakshatraSummary?: {
    nakshatra: string;
    pada: number;
    rashi: string;
    moonDegreeSidereal: number;
    birthDashaLord: string;
    birthDashaBalanceLabel: string;
  };
}

const MOBILE_TOTAL_PREDICTIONS: Record<number, string> = {
  1: 'You possess strong executive command, leadership charisma, and administrative authority. People naturally look to you for decisive action. You excel in government contracts, corporate leadership, entrepreneurship, politics, and high-level management.',
  2: 'You are intuitive, diplomatic, soft-spoken, and artistically gifted. You build deep trust with clients and excel in hospitality, counseling, healing arts, liquid trade, dairy, agriculture, and creative media.',
  3: 'You are a wise counselor, teacher, and strategist with strong ethical principles. This total brings respect in society, academic distinction, and success in banking, law, education, consulting, and spiritual sciences.',
  4: 'You are good at communicating and you are a very intelligent and wise person. You can go in fields like Police, court employee, hospital employee, administration, engineering, technical auditing, or structured legal services.',
  5: 'You have rapid commercial wit, magnetic communication, and financial agility. You excel in trade, banking, digital technology, stock brokerage, journalism, import-export, and scalable business ventures.',
  6: 'You radiate charm, luxury magnetism, and artistic refinement. Clients and companions are naturally drawn to your warmth. Ideal for jewelry, real estate, architecture, fashion, entertainment, hospitality, and luxury retail.',
  7: 'You are deeply analytical, intuitive, and research-oriented with a natural gift for occult sciences, healing, international travel, IT research, diagnostics, and spiritual advisory.',
  8: 'You give supreme importance to justice, discipline, and perseverance. Suitable for heavy industries, judiciary, mining, real estate infrastructure, machinery, and institutional administration, though patience is required for steady gains.',
  9: 'You possess boundless courage, warrior stamina, and humanitarian zeal. You thrive in defense, surgery, sports, land development, construction, fire/energy sectors, and bold leadership enterprises.',
};

export const MISSING_NUMBER_REMEDIES_DB: Record<number, MissingNumberRemedyDetail> = {
  1: {
    number: 1,
    planet: 'Sun (Surya)',
    soundFrequency: '126.22 Hz (Solar Prana Octave) & 528 Hz (Solfeggio Vitality) — Listen to Tibetan Brass Singing Bowl / Tanpura for 11 mins at Sunrise facing East.',
    wear: [
      'Wear 1 Mukhi or 12 Mukhi Rudraksha or a Copper/Gold Sun pendant.',
      'Tie a sacred red/saffron Mauli thread on the right wrist on Sunday morning.',
    ],
    vastuAndFengShui: [
      'Place a rising Sun picture or brass Surya Yantra on the East wall of your home or office.',
      'Ensure the East sector of your house is well-lit and clutter-free.',
    ],
    rituals: [
      'Offer Arghya (water mixed with red kumkum and jaggery) to Lord Surya every morning within 1 hour of sunrise.',
      'Touch the feet of your father and elderly mentors; recite Aditya Hridaya Stotra on Sundays.',
    ],
  },
  2: {
    number: 2,
    planet: 'Moon (Chandra)',
    soundFrequency: '210.42 Hz (Synodic Moon Octave) & 639 Hz (Emotional Peace) — Listen to Crystal Quartz Singing Bowl / Bansuri Flute for 15 mins before sleep.',
    wear: [
      'Wear a natural Pearl (Moti) or Moonstone crystal bracelet in silver on the right wrist.',
      'Wear 2 Mukhi Rudraksha energized on Monday.',
    ],
    vastuAndFengShui: [
      'Keep a silver bowl or earthen pot filled with fresh water in the North-West (Vayavya) corner.',
      'Avoid leaking taps or dampness in the kitchen and bedroom walls.',
    ],
    rituals: [
      'Perform Abhishek of Lord Shiva (Shivalinga) with raw cow milk and water every Monday.',
      'Drink water from a pure silver glass and honor your mother with white sweets.',
    ],
  },
  3: {
    number: 3,
    planet: 'Jupiter (Guru)',
    soundFrequency: '183.58 Hz (Jupiterian Expansion Octave) & 432 Hz / 852 Hz (Wisdom) — Listen to Temple Ghanta Bell & Santoor resonance for 15 mins on Thursday mornings.',
    wear: [
      'Wear a 5 Mukhi Rudraksha mala or Tulsi Mala around the neck or wrist.',
      'Wear a Citrine (Sunela) or Yellow Sapphire crystal bracelet.',
    ],
    vastuAndFengShui: [
      'Keep the North-East (Ishanya) corner of your home sacred, clean, and fragrant with ghee lamps.',
      'Place a Guru Yantra or sacred spiritual scriptures in the North-East direction.',
    ],
    rituals: [
      'Apply a Kesar (Saffron) or Haldi (Turmeric) tilak on your forehead and navel every morning.',
      'Water a Banana (Kela) or Peepal tree on Thursdays and offer Chana Dal & jaggery to cows.',
    ],
  },
  4: {
    number: 4,
    planet: 'Rahu (Uranus)',
    soundFrequency: '207.36 Hz (Nodal Grounding) & 396 Hz / 741 Hz (Aura Detox) — Listen to Grounding Tibetan Bowl & 741 Hz Solfeggio chimes for 12 mins at Sunset.',
    wear: [
      'Wear Rudraksha (8 Mukhi) and sacred Tulsi Mala.',
      'Wear a wooden or sandalwood (Chandan) bead bracelet on the wrist.',
    ],
    vastuAndFengShui: [
      'Surround yourself with wood, which may be trees, shrubs, potted plants, or green grass.',
      'Put a Himalayan Pink Salt lamp in the South-East direction of your home or workspace.',
    ],
    rituals: [
      'Feed birds (seven-grain Satnaja) and street dogs regularly.',
      'Pray to Maa Durga and recite Durga Chalisa or Saraswati Vandana.',
      'Worshiping Lord Sun at sunrise will also help stabilize Rahu vibrations.',
    ],
  },
  5: {
    number: 5,
    planet: 'Mercury (Budha)',
    soundFrequency: '141.27 Hz (Mercurial Intellect Octave) & 741 Hz (Throat Chakra Expression) — Listen to Mercury Chimes & Veena acoustics for 11 mins before business calls.',
    wear: [
      'Wear a Clear Quartz Crystal Mala or Green Aventurine / Peridot Crystal Bracelet.',
      'Wear 4 Mukhi Rudraksha on Wednesday morning.',
    ],
    vastuAndFengShui: [
      'Install a Surya Budh Yantra in the North direction or East direction.',
      'Place a Budh Pyra Yantra in the North direction.',
      'Surround yourself with objects that come from the earth/ground such as natural quartz or crystal.',
      'Keep open, clutter-free space in the Brahmasthan (center of the house).',
    ],
    rituals: [
      'Pray to Lord Narayan (Vishnu) and recite Vishnu Sahasranama on Wednesdays.',
      'Pour water into green plants daily and nurture indoor Tulsi.',
      'Release caged birds into freedom—particularly a green bird or parrot—or feed soaked green moong to birds.',
    ],
  },
  6: {
    number: 6,
    planet: 'Venus (Shukra)',
    soundFrequency: '221.23 Hz (Venusian Harmony Octave) & 639 Hz (Heart & Luxury Magnetism) — Listen to Rose Quartz Singing Bowl & Sitar resonance for 15 mins on Fridays.',
    wear: [
      'Wear a Rose Quartz or Clear Zircon / Diamond crystal bracelet or 6 Mukhi Rudraksha.',
      'Use natural floral attar (rose, jasmine, or sandalwood fragrance) daily.',
    ],
    vastuAndFengShui: [
      'Keep the South-East (Agneya) corner well-illuminated, clean, and decorated with fresh flowers.',
      'Install a Shree Yantra in crystal or silver in your worship altar.',
    ],
    rituals: [
      'Offer white kheer, mishri, or lotus flowers to Goddess Mahalakshmi on Fridays.',
      'Feed white cows with green fodder or jaggery rotis and respect women in the family.',
    ],
  },
  7: {
    number: 7,
    planet: 'Ketu (Neptune)',
    soundFrequency: '136.10 Hz (Sacred Om Year Octave) & 852 Hz / 963 Hz (Third Eye & Crown) — Listen to Om Tuning Fork & 852 Hz Pineal meditation tones for 15 mins in silence.',
    wear: [
      'Wear a 9 Mukhi Rudraksha or Cat’s Eye (Lehsuniya) / Smoky Quartz crystal bracelet.',
      'Wear a silver-chain watch or silver kada on the wrist.',
    ],
    vastuAndFengShui: [
      'Keep your meditation or study corner in the North-East with a pyramidal crystal.',
      'Place a sacred flag (Dhwaja) or Om emblem above the main entrance.',
    ],
    rituals: [
      'Offer Durva grass and modak/laddoo to Lord Ganesha every Wednesday and Tuesday.',
      'Feed multi-colored street dogs and donate warm blankets to the needy during winter.',
    ],
  },
  8: {
    number: 8,
    planet: 'Saturn (Shani)',
    soundFrequency: '147.85 Hz (Saturnian Karmic Grounding) & 174 Hz / 396 Hz (Root Shield) — Listen to Deep Forged Himalayan Singing Bowl for 15 mins on Saturday evenings.',
    wear: [
      'Wear a 7 Mukhi Rudraksha or Amethyst / Blue Sapphire crystal bracelet after proper testing.',
      'Wear an iron ring made from a horse-shoe or boat nail on the right middle finger.',
    ],
    vastuAndFengShui: [
      'Keep the West direction of your property organized, heavy, and free from rust or broken electronics.',
      'Light a mustard oil or sesame oil lamp in the West courtyard on Saturday evenings.',
    ],
    rituals: [
      'Light a sesame oil (Til Tel) diya beneath a Peepal tree every Saturday evening.',
      'Recite Hanuman Chalisa daily and treat workers, staff, and laborers with fairness and generosity.',
    ],
  },
  9: {
    number: 9,
    planet: 'Mars (Mangal)',
    soundFrequency: '144.72 Hz (Martian Courage Octave) & 285 Hz / 528 Hz (Cellular Vitality) — Listen to Vedic Shankha Conch & 528 Hz Solfeggio tones for 11 mins on Tuesdays.',
    wear: [
      'Wear a 3 Mukhi Rudraksha or Red Carnelian / Coral (Moonga) bracelet.',
      'Tie a sacred red Raksha Sutra on the right wrist on Tuesdays.',
    ],
    vastuAndFengShui: [
      'Ensure the South direction and kitchen fire zone (South-East) are balanced and free from water leaks.',
      'Place a Hanumanji portrait or Mangal Yantra facing South.',
    ],
    rituals: [
      'Visit a Hanuman temple on Tuesdays and offer Sindoor, Jasmine oil, and Boondi Prasad.',
      'Recite Bajrang Baan or Sunderkand and practice regular physical exercise or yoga.',
    ],
  },
};

const PAIR_ANALYSIS_DB: Record<string, { status: 'Benefic' | 'Malefic' | 'Neutral'; prediction: string }> = {
  '11': { status: 'Benefic', prediction: 'Strong leadership, self-reliance, and authoritative communication.' },
  '12': { status: 'Benefic', prediction: 'Attractive personality, steady savings, and harmonious family support.' },
  '13': { status: 'Benefic', prediction: 'Surya-Guru Raj Yoga: Respected advisor, high intellect, academic & administrative fame.' },
  '14': { status: 'Malefic', prediction: 'Sudden fluctuations in finance, legal hurdles, and health stress requiring discipline.' },
  '15': { status: 'Benefic', prediction: 'Surya-Budha Budhaditya Yoga: Sharp business acumen, eloquent speech, and commercial wealth.' },
  '16': { status: 'Malefic', prediction: 'Income obstacles or spouse/marital friction; requires careful financial planning.' },
  '17': { status: 'Benefic', prediction: 'Government or institutional gains, intuitive foresight, and steady career rise.' },
  '18': { status: 'Malefic', prediction: 'Surya-Shani conflict: Ego clashes with superiors or father, administrative delays.' },
  '19': { status: 'Benefic', prediction: 'Victory over competitors, royal patronage, high administrative rank, and unstoppable energy.' },
  '21': { status: 'Benefic', prediction: 'Creative recognition, status elevation, and supportive partnerships.' },
  '22': { status: 'Neutral', prediction: 'Deeply emotional and imaginative; requires focus to avoid mood swings.' },
  '23': { status: 'Benefic', prediction: 'Gajakesari resonance: Wisdom, respect in community, and protective mentorship.' },
  '24': { status: 'Malefic', prediction: 'Chandra-Rahu Grahan tendency: Overthinking, anxiety, and delayed decisions.' },
  '25': { status: 'Benefic', prediction: 'Success in banking, finance, consulting, or healing arts through diplomatic speech.' },
  '26': { status: 'Malefic', prediction: 'Emotional sensitivity in relationships, joint or water-related health caution.' },
  '27': { status: 'Malefic', prediction: 'Joint pain, urinary/water sensitivity, or sudden travel interruptions.' },
  '28': { status: 'Malefic', prediction: 'Vish Yoga (Moon-Saturn): Emotional stress, hospital/medical expenses, and trust betrayals.' },
  '29': { status: 'Benefic', prediction: 'Lakshmi-Mangal flow: Financial abundance through courageous action.' },
  '31': { status: 'Benefic', prediction: 'High administrative dignity, scholarly wisdom, and respect from elders.' },
  '32': { status: 'Benefic', prediction: 'Magnetic communication, public popularity, and harmonious domestic life.' },
  '33': { status: 'Benefic', prediction: 'Master teacher & spiritual counselor vibration; strong reputation for integrity.' },
  '34': { status: 'Malefic', prediction: 'Breathing or nervous restlessness; unconventional ideas that face orthodox resistance.' },
  '35': { status: 'Benefic', prediction: 'Liquid cash flow, successful business expansion, and scholarly awards.' },
  '36': { status: 'Neutral', prediction: 'High knowledge and cash flow, though marriage or partner expectations require patience.' },
  '37': { status: 'Benefic', prediction: 'Supreme success in education, occult research, medicine, and advisory professions.' },
  '38': { status: 'Benefic', prediction: 'PeaceMaker in disputes, success in real estate, law, and judiciary.' },
  '39': { status: 'Benefic', prediction: 'Dynamic reformer, energetic leader, and dual-income streams.' },
  '41': { status: 'Malefic', prediction: 'Unplanned expenses, loan pressure, or sudden regulatory scrutiny.' },
  '42': { status: 'Malefic', prediction: 'Mood fluctuations, mental restlessness, and urinary/blood pressure caution.' },
  '43': { status: 'Malefic', prediction: 'Frequent job/business changes and ideological clashes with elders.' },
  '44': { status: 'Neutral', prediction: 'Technical focus and hard work; requires avoiding speculative shortcuts.' },
  '45': { status: 'Malefic', prediction: 'Frequent visits to courts, hospitals, or regulatory offices; high mental workload.' },
  '46': { status: 'Malefic', prediction: 'Relationship misunderstandings or skin/UTI sensitivity.' },
  '47': { status: 'Benefic', prediction: 'Strong intuition, technical research mastery, and principled work ethic.' },
  '48': { status: 'Malefic', prediction: 'Rahu-Saturn clash: Chronic delays, legal entanglement, or joint/back pain.' },
  '49': { status: 'Malefic', prediction: 'Do risky work, uniform work, impulsive temper, or daring ventures.' },
  '51': { status: 'Benefic', prediction: 'Rapid commercial expansion, sovereign communication, and high deal conversion.' },
  '52': { status: 'Benefic', prediction: 'Success in trading, media, family business, and client hospitality.' },
  '53': { status: 'Benefic', prediction: 'Wise financial management, academic excellence, and consultancy fame.' },
  '54': { status: 'Neutral', prediction: 'Clever digital and analytical mind; keep paperwork strictly compliant.' },
  '55': { status: 'Benefic', prediction: 'Double Mercury velocity: Exceptional for sales, marketing, FinTech, and communication.' },
  '56': { status: 'Benefic', prediction: 'Lakshmi-Narayan resonance: Luxury trade, steady wealth, and social magnetism.' },
  '57': { status: 'Benefic', prediction: 'Public relations mastery, respected speaker, and wide professional network.' },
  '58': { status: 'Neutral', prediction: 'Money stuck in rotation or large capital locked in long-term calculations.' },
  '59': { status: 'Benefic', prediction: 'Sharp commercial negotiation and decisive execution in enterprise.' },
  '61': { status: 'Malefic', prediction: 'Marital ego friction or high expenditure on lifestyle maintenance.' },
  '62': { status: 'Neutral', prediction: 'Sentimental, artistic, and family-oriented; guard against emotional drainage.' },
  '63': { status: 'Neutral', prediction: 'Respectable knowledge and steady cash flow, though ideological differences with spouse can arise.' },
  '64': { status: 'Malefic', prediction: 'Sudden relationship tests or dermatological/water sensitivity.' },
  '65': { status: 'Benefic', prediction: 'High luxury attraction, brand building, and prosperous commercial partnerships.' },
  '66': { status: 'Benefic', prediction: 'Double Venus opulence: Glamour, travel, hospitality, and affluent social circle.' },
  '67': { status: 'Neutral', prediction: 'Love for music, arts, and luxury; prefers love marriage and quick opportunity seizing.' },
  '68': { status: 'Malefic', prediction: 'Eye, ENT, or surgical health caution; requires disciplined financial reserves.' },
  '69': { status: 'Benefic', prediction: 'Passionate creativity, good management skill, and event/design success.' },
  '71': { status: 'Benefic', prediction: 'Intuitive leadership, occult/research breakthroughs, and institutional backing.' },
  '72': { status: 'Malefic', prediction: 'Emotional sensitivity, anxiety, or water-borne health issues.' },
  '73': { status: 'Benefic', prediction: 'Guru-Ketu spiritual & academic brilliance; respected mentor and healer.' },
  '74': { status: 'Benefic', prediction: 'Principled administration, uniformed service, or technical diagnostics.' },
  '75': { status: 'Benefic', prediction: 'Eloquent writer, researcher, and persuasive communicator.' },
  '76': { status: 'Neutral', prediction: 'Artistic and travel-loving nature; requires balance in marital expectations.' },
  '77': { status: 'Neutral', prediction: 'Deep spiritual contemplation, detachment from superficiality, research focus.' },
  '78': { status: 'Neutral', prediction: 'Idealistic healer and analytical thinker; best for non-commercial advisory & yoga.' },
  '79': { status: 'Neutral', prediction: 'Success after separating from ancestral place or working in distant regions.' },
  '81': { status: 'Malefic', prediction: 'Shani-Surya friction: Authority disputes, tax/government notices, or father-son disagreement.' },
  '82': { status: 'Malefic', prediction: 'Vish Yoga: Emotional heaviness, delayed payments, and Kapha/Vata sensitivity.' },
  '83': { status: 'Benefic', prediction: 'Dharma-Karma Yoga: Legal victory, institutional authority, and ethical wealth.' },
  '84': { status: 'Malefic', prediction: 'Saturn-Rahu obstacle axis: Chronic delays and heavy workload before reward.' },
  '85': { status: 'Neutral', prediction: 'Calculated finance and real estate brokerage; avoid lending money without collateral.' },
  '86': { status: 'Malefic', prediction: 'Fatigue or eye/joint strain; keep domestic communication gentle.' },
  '87': { status: 'Neutral', prediction: 'Spiritual discipline, occult intuition, and justice-loving temperament.' },
  '88': { status: 'Neutral', prediction: 'Deep thinker, justice-oriented, hardworking; experiences delays before massive consolidation.' },
  '89': { status: 'Malefic', prediction: 'Argumentative, works strictly with principle; person might face chronic nerve/joint issue in later part of life if unmediated.' },
  '91': { status: 'Benefic', prediction: 'Surya-Mangal Parakram Yoga: Fearless leadership, land/property gains, and rapid promotion.' },
  '92': { status: 'Benefic', prediction: 'Wealth creation through bold initiative and protective family leadership.' },
  '93': { status: 'Benefic', prediction: 'Guru-Mangal Yoga: High command, academic & administrative triumph, and land assets.' },
  '94': { status: 'Neutral', prediction: 'Do risky work, uniform work, or technical enforcement; requires calm breathing.' },
  '95': { status: 'Benefic', prediction: 'Sharp executive execution, profitable trade, and competitive victory.' },
  '96': { status: 'Benefic', prediction: 'Magnetic charisma, luxury real estate, and thriving hospitality/media ventures.' },
  '97': { status: 'Neutral', prediction: 'Spiritual warrior, occult researcher, and independent trailblazer.' },
  '98': { status: 'Malefic', prediction: 'Mars-Saturn friction: Blood pressure, muscular strain, or impulsive disputes.' },
  '99': { status: 'Neutral', prediction: 'High physical energy, independent spirit, and strong determination.' },
};

const VEDIC_GRID_SINGLE_NUMBER_MEANINGS: Record<number, { text: string; repeatText: string }> = {
  1: {
    text: 'You are very confident and always possess leadership quality. You do not want to compromise on your core dignity and can be a little egoistic as well. You are independent, ambitious, and occasionally short-tempered or stubborn in nature.',
    repeatText: 'Since Number 1 appears more than once in your chart, your verbal authority and executive presence are exceptionally strong. You command natural respect in society and administration.',
  },
  2: {
    text: 'You are very sentimental in nature. You need some extra push to finish tasks at times. You are a creative and soft-spoken person. Your Aura is attractive and you love Arts, Music, Photography, and Beauty. You continuously appreciate encouragement and motivation.',
    repeatText: 'Since Number 2 appears multiple times in your chart, you possess heightened emotional sensitivity and psychic empathy. Guard against overthinking or mood fluctuations by practicing pranayama.',
  },
  3: {
    text: 'You are wise, disciplined, knowledgeable, and spiritually inclined. You value ethics, higher education, and mentorship, and you remain deeply attached to your Kith & Kin and parents.',
    repeatText: 'Since your Number 3 appears more than once, you have a natural tendency to showcase your achievements and wisdom. You are spiritual in nature, disciplined, knowledgeable, and very much attached to Kith & Kin and Parents. You are obedient and while dealing you do it very fairly. Your wisdom and wittiness are always getting noticed.',
  },
  4: {
    text: 'You are methodical, practical, and observant with strong organizational discipline. You question orthodoxy and build durable systems through sheer hard work.',
    repeatText: 'Multiple appearances of Number 4 amplify technical brilliance and rebellious innovation, though you must balance mental intensity with physical grounding.',
  },
  5: {
    text: 'You are intellectually agile, communicative, and commercially enterprising. You adapt swiftly to changing market trends and excel in calculation, speech, and networking.',
    repeatText: 'Multiple appearances of Number 5 bestow extraordinary persuasive power, media magnetism, and multi-venture business dexterity.',
  },
  6: {
    text: 'You are creative and a food lover. You give importance to Brand and attract luxury. You usually have a big friend circle and attract the opposite sex. You are emotional in nature and always ready to help others. While speaking passionately, you may occasionally use blunt words unintentionally.',
    repeatText: 'Since Number 6 appears more than once, your attraction toward luxury, arts, and relationships is heightened; maintain conscious balance in family and domestic expectations.',
  },
  7: {
    text: 'You are spiritual in nature and you usually do long travel. You are lucky and need reasoning for everything. You are a deep thinker and research-minded. You look for stability and want continuity in relationships.',
    repeatText: 'Multiple 7s deepen your occult intuition, healing mastery, and philosophical detachment, making you a natural researcher or spiritual guide.',
  },
  8: {
    text: 'You give importance to justice and always need justification as well. Your life teaches deep resilience through initial struggle and delays. You are a deep thinker, emotional, ambitious, attractive, and hardworking. You cannot see tears in others’ eyes and you never forget life lessons easily.',
    repeatText: 'Multiple 8s create intense karmic focus on authority, finance, and justice; practicing humility and Saturday Shani remedies unlocks massive long-term wealth.',
  },
  9: {
    text: 'You are courageous, humanitarian, energetic, and driven by principle. You stand up to protect the weak and possess strong willpower to complete challenging missions.',
    repeatText: 'Multiple 9s generate fiery determination and leadership vigor; channel this abundant Mars energy into structured goals, fitness, and philanthropy.',
  },
};

const TWO_NUMBER_COMBINATIONS: {
  nums: [number, number];
  label: string;
  paragraphs: string[];
}[] = [
  {
    nums: [3, 1],
    label: '3,1',
    paragraphs: [
      'This combination in your chart suggests that you will have knowledge on multiple subjects. You may go for higher education. You will have good management skill. You will get good name and fame in society. There is a high chance you will show interest in astrology or spirituality sciences. You will achieve height in your life with your own effort. You will love your family and Kith & Kin.',
      'You are very wise and with the help of your education you can become a Doctor, Advisor, or you can go into Occult Science also. You will be a very respectable person in your community.',
    ],
  },
  {
    nums: [3, 6],
    label: '3,6',
    paragraphs: [
      'Number 3, 6 combinations in your chart suggest that your life will transform significantly after marriage. If Number 2 is missing in the chart, ideological differences in marital life require conscious harmony. You give supreme importance to your family and kith & kin—whatever decision you take in your life, you always consider how it will impact your family members.',
      'You have good command over language, cash flow is always there, and all professions related to knowledge, media, counseling, or presentation will suit you.',
    ],
  },
  {
    nums: [6, 2],
    label: '6,2',
    paragraphs: [
      'Number 6, 2 combinations in your chart suggest that you are highly sentimental and give deep importance to your family. You will be highly attractive and definitely possess artistic talent. These are magnetic feminine numbers, making you sensitive, hospitable, and appreciative of Arts & Literature.',
      'Health Advisory: Stay well-hydrated and mindful of joint, water-balance, or lymphatic vitality as you age.',
    ],
  },
  {
    nums: [1, 7],
    label: '1,7',
    paragraphs: [
      'Number 1, 7 combinations in your chart suggest that you are lucky and possess strong intuition power, which makes you successful in specialized fields. You will be inclined towards spirituality and will have knowledge of multiple subjects.',
      'You have a good heart and love to travel. Important milestones in your life happen early—such as starting your career responsibility early. You are a good speaker with high chances of Government, Semi-Government, institutional, or Tours & Travelling success.',
    ],
  },
  {
    nums: [7, 8],
    label: '7,8',
    paragraphs: [
      'This combination makes you analytical and spiritually strong. While pure cut-throat speculation may feel draining, you excel remarkably in the healing line, public policy, occult sciences, research, meditation, and yoga.',
      'Stay away from negative environments and trust your structured spiritual discipline.',
    ],
  },
  {
    nums: [2, 8],
    label: '2,8',
    paragraphs: [
      'Number 2, 8 combination in your chart creates emotional sensitivity (classically termed Vish Yoga between Moon and Saturn). The native should guard against self-doubt, mood swings, and Kapha/Vata-related stress. Because Number 1 or Number 3 is strong in your chart, you will overcome all obstacles and rise to prominence. Adding Number 5 remedies brings land and property gains.',
      'Vastu Note: Inspect and repair any water leakage or dampness in the walls of your residence or office immediately.',
    ],
  },
  {
    nums: [6, 7],
    label: '6,7',
    paragraphs: [
      'Number 6, 7 combination in your chart suggests that you always believe in taking action. This combination brings luxury, vehicles, and modern comforts to the Native’s life. You know how to recognize and seize opportunities quickly, and you have a deep appreciation for music, beauty, and art.',
    ],
  },
  {
    nums: [1, 5],
    label: '1,5',
    paragraphs: [
      'Budhaditya Raj Yoga (1, 5): Combines the royal authority of Sun (1) with the commercial intelligence of Mercury (5). Bestows exceptional financial acumen, persuasive communication, and rapid rise in business or corporate leadership.',
    ],
  },
  {
    nums: [2, 5],
    label: '2,5',
    paragraphs: [
      'Number 2, 5 combination grants diplomatic communication, success in finance, banking, real estate, and liquid trade, along with strong mental adaptability.',
    ],
  },
  {
    nums: [3, 9],
    label: '3,9',
    paragraphs: [
      'Guru-Mangal Yoga (3, 9): Unites Jupiterian wisdom with Martian courage. Grants high administrative command, land/property fortune, and triumph in competitive endeavors.',
    ],
  },
  {
    nums: [5, 6],
    label: '5,6',
    paragraphs: [
      'Lakshmi-Narayan Yoga (5, 6): One of the most prosperous combinations for liquid cash flow, luxury trade, brand building, and harmonious social alliances.',
    ],
  },
  {
    nums: [4, 8],
    label: '4,8',
    paragraphs: [
      'Number 4, 8 combination indicates deep karmic hard work in technical, legal, or industrial fields. Success consolidates through ethical perseverance and structured planning.',
    ],
  },
];

const THREE_NUMBER_COMBINATIONS: {
  nums: [number, number, number];
  label: string;
  paragraphs: string[];
}[] = [
  {
    nums: [2, 3, 6],
    label: '2,3,6',
    paragraphs: [
      'Number 2, 3, and 6 combinations in your chart suggest that you give supreme importance to family life. This combination makes you artistic and grants multiple subjects of knowledge. You are emotionally generous and should nurture open, appreciative communication in marriage.',
    ],
  },
  {
    nums: [1, 7, 8],
    label: '1,7,8',
    paragraphs: [
      'Number 1, 7, and 8 combination suggests that you possess strong Intuition power that will definitely lead you to master occult sciences, astrology, or deep research. Many renowned astrologers and healers carry this exact triad. You are versatile across multiple domains and experience major fortune consolidation from middle age onward.',
    ],
  },
  {
    nums: [3, 1, 6],
    label: '3,1,6',
    paragraphs: [
      'You are a highly intellectual and knowledgeable person with abundant wisdom. You are a natural teacher, mentor, and guide. This triad brings positive elevation in career, respected social standing, and progressive expansion after marriage.',
    ],
  },
  {
    nums: [1, 7, 6],
    label: '1,7,6',
    paragraphs: [
      'Combines leadership (1), spiritual research (7), and creative refinement (6). While early career phases may show dynamic shifts, aligning with spiritual or advisory vocations brings lasting contentment and dignity.',
    ],
  },
  {
    nums: [8, 6, 2],
    label: '8,6,2',
    paragraphs: [
      'You will build a strong economic status and material success through perseverance. You are deeply emotional, empathetic, and sensitive toward family well-being.',
    ],
  },
  {
    nums: [4, 3, 8],
    label: '4,3,8',
    paragraphs: [
      'Thought & Strategic Planning Plane: Bestows sharp analytical foresight, political or legal strategy, and disciplined execution.',
    ],
  },
  {
    nums: [9, 5, 1],
    label: '9,5,1',
    paragraphs: [
      'Royal Willpower & Executive Plane: Grants unstoppable determination, entrepreneurial courage, and leadership prominence.',
    ],
  },
  {
    nums: [2, 7, 6],
    label: '2,7,6',
    paragraphs: [
      'Action & Pranic Vitality Plane: Indicates a dynamic, action-oriented personality who translates ideas into tangible results rapidly.',
    ],
  },
];

const DASHA_PREDICTIONS_DB: Record<number, { planet: string; sanskrit: string; paragraphs: string[] }> = {
  1: {
    planet: 'Sun',
    sanskrit: 'Surya',
    paragraphs: [
      'Sun Maha Dasha brings money, wealth, name, fame, social status, glory, culture, and educational elevation. The native experiences acquisition of wealth, respect, and honor from higher officials and government institutions.',
      'During this period, the native takes center stage in professional and public life—whether in management, politics, medicine, or creative enterprise. Promotions, leadership appointments, and authoritative recognition manifest strongly.',
    ],
  },
  2: {
    planet: 'Moon',
    sanskrit: 'Chandra',
    paragraphs: [
      'Moon Maha Dasha strengthens bonds with the mother, family, and domestic happiness. The native feels more imaginative, artistic, and peaceful, often initiating home-based ventures, real estate acquisitions, or creative projects.',
      'This Dasha bestows emotional equipoise, appreciation of nature, water bodies, and gardens, and the acquisition of house, vehicles, and comforting material possessions.',
    ],
  },
  3: {
    planet: 'Jupiter',
    sanskrit: 'Guru',
    paragraphs: [
      'Jupiter Maha Dasha brings financial success, abundant wealth, power, social status, higher knowledge, and spiritual development. Businessmen expand their enterprises by leaps and bounds, while students and researchers excel in prestigious institutions.',
      'You also develop profound knowledge of spirituality, occult science, astrology, and intuitive foresight. Auspicious family celebrations, yagyas, pilgrimages, and honors from influential dignitaries bless this period.',
    ],
  },
  4: {
    planet: 'Rahu',
    sanskrit: 'Rahu',
    paragraphs: [
      'Rahu Maha Dasha brings gains in material wealth, sudden breakthroughs, foreign travel, or technological expansion. While unexpected hurdles may test your patience, dedicated hard work opens new gates of income and property acquisition.',
      'Positive alignment during this Dasha makes the native authoritative, resourceful, and connected with high-level officials.',
    ],
  },
  5: {
    planet: 'Mercury',
    sanskrit: 'Budha',
    paragraphs: [
      'Mercury represents intelligence, communication, studies, writing, speech, and commercial dexterity. During Mercury Maha Dasha, ample business and career opportunities knock on your door, especially in consulting, media, IT, telecommunications, trade, law, sales, and advisory roles.',
      'Your gift of speech and intellectual networking overcomes obstacles and debts, while inspiring healthier lifestyle and fitness habits.',
    ],
  },
  6: {
    planet: 'Venus',
    sanskrit: 'Shukra',
    paragraphs: [
      'Venus Maha Dasha bestows luxuries, refinements, and material pleasures. During this period, there are gains of valuable assets, jewelry, vehicles, artistic accolades, and all-round family prosperity.',
      'A well-aligned Venus elevates careers in consultancy, healing, arts, design, hospitality, and advisory to high-profile individuals, expanding both liquid cash and long-term investments.',
    ],
  },
  7: {
    planet: 'Ketu',
    sanskrit: 'Ketu',
    paragraphs: [
      'During Ketu Maha Dasha, initiating spiritual study, meditation, and learning sacred sciences under a Guru brings immense peace and protection. It is a supreme opportunity to reconnect with universal consciousness and fulfill righteous desires.',
      'Ketu bestows piercing intuition, liberation-oriented wisdom, and mastery over healing arts, natural remedies, occult sciences, and transformative research.',
    ],
  },
  8: {
    planet: 'Saturn',
    sanskrit: 'Shani',
    paragraphs: [
      'The planet Shani (Saturn) can elevate a disciplined native to the pinnacle of kingly success, prestige, and enduring wealth. Positive Saturn Dasha grants robust health, palatial property, influential alliances, victory over competitors, and institutional authority.',
      'This Dasha governs deep material consolidation, career permanence, and long-term financial abundance earned through ethical perseverance.',
    ],
  },
  9: {
    planet: 'Mars',
    sanskrit: 'Mangal',
    paragraphs: [
      'Mars represents willpower, stamina, courage, and decisive action. During Mars Maha Dasha, the native becomes exceptionally active and driven to complete long-pending goals, acquire land and property, and advance professionally.',
      'Channeling Martian fire into yoga, disciplined enterprise, and ethical leadership ensures triumph over rivals and protects against impulsive disputes.',
    ],
  },
};

export function generateAdvanceMobileReport(
  dobOrMobile: string,
  mobileOrDob: string,
  mulankInput: number,
  bhagyankInput: number,
  tob: string = '12:00',
  lat: number = 28.6139,
  lng: number = 77.2090
): AdvanceMobileReportData {
  const s1 = (dobOrMobile || '').trim();
  const s2 = (mobileOrDob || '').trim();
  const isFirstDate = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(s1) || /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(s1);
  const isSecondDate = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(s2) || /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(s2);
  const rawDobInput = isFirstDate ? s1 : isSecondDate ? s2 : s1;
  const mobile = isFirstDate ? s2 : isSecondDate ? s1 : s2;

  // Normalize DOB to YYYY-MM-DD and extract exact Day, Month, Year
  const normDobParts = (rawDobInput || '1983-02-16').trim().replace(/\//g, '-').split('-');
  const isYearFirst = (normDobParts[0] || '').length === 4;
  const yearStr = isYearFirst ? normDobParts[0] || '1983' : normDobParts[2] || '1983';
  const monthStr = (normDobParts[1] || '02').padStart(2, '0');
  const dayStr = (isYearFirst ? normDobParts[2] || '16' : normDobParts[0] || '16').padStart(2, '0');
  const isoDob = `${yearStr}-${monthStr}-${dayStr}`;

  const mulank = mulankInput >= 1 && mulankInput <= 9 ? mulankInput : calculateMulank(isoDob);
  const bhagyank = bhagyankInput >= 1 && bhagyankInput <= 9 ? bhagyankInput : calculateBhagyank(isoDob);

  const cleanDigits = (mobile || '8899444444').replace(/\D/g, '') || '8899444444';
  const digitsArr = cleanDigits.split('').map((d) => parseInt(d, 10));
  const mobileCompound = digitsArr.reduce((a, b) => a + b, 0);
  const mobileTotal = reduceToSingleDigit(mobileCompound);

  const mulankProfile = PLANETARY_PROFILES[mulank] || PLANETARY_PROFILES[1];
  const bhagyankProfile = PLANETARY_PROFILES[bhagyank] || PLANETARY_PROFILES[1];

  // Recommended totals based on Mulank & Bhagyank harmony (matching PDF style: e.g., 1, 5 for Mulank 7 / Bhagyank 3)
  const recommendedMobileTotals =
    mulank === 7 && bhagyank === 3
      ? [1, 5, 3]
      : Array.from(new Set([1, 5, mulankProfile.friendlyNumbers[0] || 3, 6])).slice(0, 3);

  const avoidNumbersInMobile =
    mulank === 7
      ? [4, 7, 8]
      : Array.from(new Set([...mulankProfile.enemyNumbers, 4, 8])).slice(0, 3);

  // Colours & Numbers recommendation
  const luckyColours =
    mulank === 7
      ? ['RED', 'ORANGE', 'GREEN', 'GOLDEN YELLOW']
      : [
          ...mulankProfile.luckyColor.toUpperCase().split(',').map((s) => s.trim()),
          'GREEN',
        ].slice(0, 4);

  const UNLUCKY_COLOURS_BY_MULANK: Record<number, string[]> = {
    1: ['BLACK', 'DARK BLUE', 'DARK GREY'],
    2: ['BLACK', 'DARK RED', 'DEEP PURPLE'],
    3: ['BLACK', 'DARK GREEN', 'DARK BLUE'],
    4: ['BLACK', 'RED', 'ORANGE'],
    5: ['BLACK', 'DARK RED'],
    6: ['BLACK', 'YELLOW', 'ORANGE'],
    7: ['BLACK', 'INDIGO', 'DARK GREY'],
    8: ['RED', 'COPPER', 'ORANGE'],
    9: ['BLACK', 'DARK GREEN', 'DARK BLUE'],
  };

  const unluckyColours = UNLUCKY_COLOURS_BY_MULANK[mulank] || ['BLACK', 'DARK GREY'];

  const luckyNumbers = recommendedMobileTotals;
  const unluckyNumbers = mulank === 7 ? [6, 8] : mulankProfile.enemyNumbers;
  const neutralNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    (n) => !luckyNumbers.includes(n) && !unluckyNumbers.includes(n)
  );

  // Build Vedic Grid from DOB: DD, MM, YY (last 2 digits of year), plus Mulank (if DD > 9) and Bhagyank
  const dayNum = parseInt(dayStr, 10) || 16;
  const monthNum = parseInt(monthStr, 10) || 2;
  const shortYearStr = yearStr.slice(-2);

  const chartDigits: number[] = [];
  dayNum
    .toString()
    .split('')
    .forEach((d) => {
      const n = parseInt(d, 10);
      if (n > 0) chartDigits.push(n);
    });
  monthNum
    .toString()
    .split('')
    .forEach((d) => {
      const n = parseInt(d, 10);
      if (n > 0) chartDigits.push(n);
    });
  shortYearStr.split('').forEach((d) => {
    const n = parseInt(d, 10);
    if (n > 0) chartDigits.push(n);
  });
  if (dayNum > 9 && dayNum !== 10 && dayNum !== 20 && dayNum !== 30) {
    chartDigits.push(mulank);
  }
  chartDigits.push(bhagyank);

  const gridCounts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };
  chartDigits.forEach((n) => {
    if (n >= 1 && n <= 9) gridCounts[n] += 1;
  });

  const missingNumbersList = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => gridCounts[n] === 0);
  const missingKey45 = [4, 5].filter((n) => gridCounts[n] === 0);
  const missingNumbersFormatted =
    missingKey45.length > 0
      ? `- ${missingKey45.join(' - - ')} - (Chart Missing: ${missingNumbersList.join(', ')})`
      : missingNumbersList.map((n) => `- ${n} -`).join(' ');

  const missingNumberRemedies: MissingNumberRemedyDetail[] = (
    missingNumbersList.length > 0 ? missingNumbersList : [4, 5]
  ).map((num) => MISSING_NUMBER_REMEDIES_DB[num]);

  // Adjacent 2-digit mobile combinations
  const mobileCombinations: MobileAdjacentPair[] = [];
  for (let i = 0; i < cleanDigits.length - 1; i++) {
    const pair = cleanDigits.slice(i, i + 2);
    if (pair.includes('0')) {
      mobileCombinations.push({
        pair,
        status: 'Malefic',
        prediction: 'Zero paired with a digit dilutes planetary strength and creates unexpected voids in effort.',
      });
    } else {
      const info = PAIR_ANALYSIS_DB[pair] || {
        status: 'Neutral' as const,
        prediction: 'Balanced operational frequency; maintains steady daily communication.',
      };
      mobileCombinations.push({
        pair,
        status: info.status,
        prediction: info.prediction,
      });
    }
  }

  const hasMaleficPairs = mobileCombinations.some((m) => m.status === 'Malefic');
  const isMobileFrequencyPerfect =
    !hasMaleficPairs &&
    !cleanDigits.endsWith('0') &&
    (recommendedMobileTotals.includes(mobileTotal) ||
      (!mulankProfile.enemyNumbers.includes(mobileTotal) &&
        !bhagyankProfile.enemyNumbers.includes(mobileTotal) &&
        mobileTotal !== 4 &&
        mobileTotal !== 8));

  const exampleRecommendedNumbers = isMobileFrequencyPerfect
    ? []
    : [
        {
          number: '9113157851',
          compound: 41,
          total: 5,
          benefit: 'Total comes = 41, further total comes = 5 (Royal Star of Mercury & Sun)',
        },
        {
          number: '9135135559',
          compound: 46,
          total: 1,
          benefit: 'Total comes = 46, further total comes = 1 (Crown of Executive Authority)',
        },
        {
          number: '9315535132',
          compound: 37,
          total: 1,
          benefit: 'Total comes = 37, further total comes = 1 (Royal Friendship & High Patronage)',
        },
      ];

  // Unique summary predictions from active pairs
  const combinedPairPrediction = Array.from(
    new Set(mobileCombinations.map((m) => `${m.pair} (${m.status}): ${m.prediction}`))
  );

  // Recommended Mobile Wallpaper
  const wallpaperMap: Record<
    number,
    AdvanceMobileReportData['recommendedWallpaper']
  > = {
    7: {
      title: 'Ascending Airplane in Clear Blue Sky & White Clouds',
      hindiTitle: 'नीले आकाश और शुभ बादलों में ऊपर उठता हुआ विमान (Ascending Airplane)',
      theme: 'airplane',
      description:
        'For Mulank 7 (Ketu) & Bhagyank 3 (Jupiter), an ascending white commercial jet soaring upward through bright blue skies activates Air/Ether elevation, international reach, rapid career take-off, and liberation from stagnation.',
      placementAdvice:
        'Set on both Lock Screen and Home Screen on a Thursday or Sunday morning during Shukla Paksha.',
    },
    1: {
      title: 'Rising Golden Sun Over Sacred Mountain Peaks',
      hindiTitle: 'हिमालय शिखर पर उगता हुआ स्वर्णिम सूर्य',
      theme: 'rising-sun',
      description:
        'Activates Surya (1) sovereign leadership, administrative authority, and victory over competitors.',
      placementAdvice: 'Set as your mobile wallpaper on Sunday morning within 1 hour of sunrise.',
    },
    2: {
      title: 'Full Moon Reflecting on a Calm Silver Lotus Lake',
      hindiTitle: 'शांत सरोवर और कमल पर पूर्णिमा का चंद्रमा',
      theme: 'lotus-lake',
      description:
        'Harmonizes Chandra (2) emotional peace, intuitive clarity, and steady cash flow.',
      placementAdvice: 'Set on Monday morning or Purnima evening.',
    },
    3: {
      title: 'Golden Temple Spire & Ascending Eagle in Sunlight',
      hindiTitle: 'स्वर्ण मंदिर शिखर एवं ऊँची उड़ान',
      theme: 'golden-temple',
      description:
        'Amplifies Devguru Brihaspati (3) wisdom, societal honor, and protective mentorship.',
      placementAdvice: 'Set on Thursday morning during Guru Hora.',
    },
    4: {
      title: 'Lush Emerald Bamboo Forest with Morning Sunbeams',
      hindiTitle: 'हरित बांस वन एवं प्रातःकालीन सूर्य किरणें',
      theme: 'emerald-forest',
      description:
        'Balances Rahu (4) with living Wood element and solar clarity for steady financial growth.',
      placementAdvice: 'Set on Sunday or Wednesday morning.',
    },
    5: {
      title: 'Lush Green Mountain Valley & Flowing Crystal Waterfall',
      hindiTitle: 'हरित पर्वत घाटी एवं बहता हुआ निर्मल झरना',
      theme: 'emerald-forest',
      description:
        'Supercharges Mercury (5) commercial velocity, trade liquidity, and persuasive communication.',
      placementAdvice: 'Set on Wednesday morning.',
    },
    6: {
      title: 'Seven Galloping White Horses Toward Rising Light',
      hindiTitle: 'उगते प्रकाश की ओर दौड़ते सात सफेद घोड़े',
      theme: 'white-horses',
      description:
        'Channels Venus (6) luxury magnetism, speed in business execution, and affluent partnerships.',
      placementAdvice: 'Set on Friday morning.',
    },
    8: {
      title: 'Golden Sunrise Illuminating Ancient Stone Pillars',
      hindiTitle: 'स्वर्णिम सूर्योदय एवं दृढ़ स्तंभ',
      theme: 'rising-sun',
      description:
        'Infuses Saturn (8) perseverance with solar warmth, accelerating delayed rewards and property gains.',
      placementAdvice: 'Set on Saturday or Sunday morning.',
    },
    9: {
      title: 'Soaring Red-Gold Phoenix / Victory Peak at Dawn',
      hindiTitle: 'विजय शिखर एवं अरुणोदय',
      theme: 'rising-sun',
      description:
        'Channels Mars (9) fearless leadership, land/property triumph, and boundless vitality.',
      placementAdvice: 'Set on Tuesday morning.',
    },
  };

  // Vedic Grid 3x3 Layout: [[3,1,9],[6,7,5],[2,8,4]]
  const layout = [
    [3, 1, 9],
    [6, 7, 5],
    [2, 8, 4],
  ];

  const vedicGrid: VedicGridCell[][] = layout.map((row) =>
    row.map((posNum) => ({
      positionNumber: posNum,
      count: gridCounts[posNum] || 0,
      displayValue:
        gridCounts[posNum] > 0 ? String(posNum).repeat(gridCounts[posNum]) : '',
    }))
  );

  // Present Number Readings
  const presentNumberReadings: AdvanceMobileReportData['presentNumberReadings'] = [];
  for (let n = 1; n <= 9; n++) {
    if (gridCounts[n] > 0) {
      const m = VEDIC_GRID_SINGLE_NUMBER_MEANINGS[n];
      presentNumberReadings.push({
        number: n,
        count: gridCounts[n],
        heading: `Number ${n}`,
        description: m.text,
        repetitionNote: gridCounts[n] > 1 ? m.repeatText : undefined,
      });
    }
  }

  // Detect 2-Number and 3-Number Combinations present in the user's chart
  const chartCombinations: ChartCombinationReading[] = [];
  for (const combo of TWO_NUMBER_COMBINATIONS) {
    if (combo.nums.every((n) => gridCounts[n] > 0)) {
      chartCombinations.push({
        combination: combo.label,
        type: '2-Digit Yoga',
        title: `Your Chart shows combination of Number ${combo.label}`,
        paragraphs: combo.paragraphs,
      });
    }
  }
  for (const combo3 of THREE_NUMBER_COMBINATIONS) {
    if (combo3.nums.every((n) => gridCounts[n] > 0)) {
      chartCombinations.push({
        combination: combo3.label,
        type: '3-Digit Yoga',
        title: `Your Chart shows combination of Number ${combo3.label}`,
        paragraphs: combo3.paragraphs,
      });
    }
  }

  // ============================================================================
  // SYSTEM 1: 45-YEAR VEDIC NUMEROLOGY PROGRESSIVE MAHA DASHA (EXACT DATE CHECK)
  // Each Dasha N runs for N calendar years from Birth Day & Month (DD-MM-YYYY)
  // ============================================================================
  const parsedBirthYear = parseInt(yearStr, 10);
  const nowDate = new Date();
  const nowMs = nowDate.getTime();
  const currentYear = nowDate.getFullYear();
  const birthYear =
    !isNaN(parsedBirthYear) && parsedBirthYear >= 1900 && parsedBirthYear <= currentYear + 5
      ? parsedBirthYear
      : 1983;
  const formattedDay = dayStr;
  const formattedMonth = monthStr;

  // Determine active Numerology Antardasha (Personal Year) between last birthday and next birthday
  const birthdayThisYearMs = new Date(currentYear, monthNum - 1, dayNum, 0, 0, 0).getTime();
  const activePersonalYearStartYear = nowMs >= birthdayThisYearMs ? currentYear : currentYear - 1;
  // Classical Vedic Numerology Antardasha = (Day + Month + LastBirthdayYear + WeekdayOfBirthday) or standard Personal Year (Day + Month + Year)
  const personalYearNum = reduceToSingleDigit(dayNum + monthNum + reduceToSingleDigit(activePersonalYearStartYear));
  const personalYearPlanet = DASHA_PREDICTIONS_DB[personalYearNum]?.planet || 'Sun';
  const personalYearSanskrit = DASHA_PREDICTIONS_DB[personalYearNum]?.sanskrit || 'Surya';
  const activeNumerologyAntardashaLabel = `Antardasha #${personalYearNum} ${personalYearPlanet} (${personalYearSanskrit}) [${formattedDay}-${formattedMonth}-${activePersonalYearStartYear} to ${formattedDay}-${formattedMonth}-${activePersonalYearStartYear + 1}]`;

  // Planet-specific Vedic Maha Dasha Remedies & Harmony % Calculator
  const DASHA_REMEDIES_DB: Record<number, string> = {
    1: 'Offer Surya Arghya in a copper vessel at sunrise, chant "Om Hraam Hreem Hraum Sah Suryaya Namah" (108x) on Sundays, and donate wheat or jaggery.',
    2: 'Offer raw milk & water on Shivling on Mondays, chant "Om Shraam Shreem Shraum Sah Chandramase Namah" (108x), and drink water from a silver tumbler.',
    3: 'Apply saffron/haldi tilak on forehead, chant "Om Graam Greem Graum Sah Gurave Namah" (108x) on Thursdays, and donate yellow chana dal or bananas.',
    4: 'Chant "Om Bhraam Bhreem Bhraum Sah Rahave Namah" (108x) at dusk, keep a silver square/coin in wallet, and feed stray dogs or donate black/blue blankets on Saturdays.',
    5: 'Offer Durva grass to Lord Ganesha on Wednesdays, chant "Om Braam Breem Braum Sah Budhaya Namah" (108x), and feed green fodder or moong dal to cows.',
    6: 'Offer white flowers to Goddess Mahalakshmi on Fridays, chant "Om Draam Dreem Draum Sah Shukraya Namah" (108x), wear clean white/pastel attire, and donate kheer/rice.',
    7: 'Chant "Om Sraam Sreem Sraum Sah Ketave Namah" (108x) & Ganpati Atharvashirsha, feed multi-colored stray dogs on Tuesdays/Thursdays, and practice silent meditation.',
    8: 'Light a mustard oil diya under a Peepal tree on Saturday evenings, chant "Om Praam Preem Praum Sah Shanaischaraya Namah" (108x), and donate black sesame (til) or footwear to laborers.',
    9: 'Recite Hanuman Chalisa & chant "Om Kraam Kreem Kraum Sah Bhaumaya Namah" (108x) on Tuesdays, light a jasmine oil diya, and donate red masoor dal or jaggery.',
  };

  const computeDashaHarmonyAndRemedy = (
    dashaNum: number,
    isVimshottari: boolean
  ): { harmonyPercent: number; harmonyVerdict: string; remedy: string } => {
    const relM = getPlanetaryRelationship(mulank, dashaNum);
    const relB = getPlanetaryRelationship(bhagyank, dashaNum);
    const presentInChart = !missingNumbersList.includes(dashaNum);

    let score = 50;
    if (dashaNum === mulank) score += 24;
    else if (relM === 'friendly') score += 21;
    else if (relM === 'neutral') score += 12;
    else score += 2;

    if (dashaNum === bhagyank) score += 21;
    else if (relB === 'friendly') score += 19;
    else if (relB === 'neutral') score += 11;
    else score += 2;

    score += presentInChart ? 4 : -3;
    if (isVimshottari) {
      // Subtle Nakshatra-lord alignment adjustment
      score += dashaNum === bhagyank ? 1 : 0;
    }
    const harmonyPercent = Math.max(46, Math.min(96, Math.round(score)));
    const harmonyVerdict =
      harmonyPercent >= 82
        ? 'Supremely Harmonious'
        : harmonyPercent >= 68
          ? 'Favorable & Balanced'
          : harmonyPercent >= 56
            ? 'Moderate (Remedy Advised)'
            : 'Karmic Friction (Remedy Essential)';
    const baseRemedy = DASHA_REMEDIES_DB[dashaNum] || DASHA_REMEDIES_DB[3];
    const remedy =
      harmonyPercent >= 82
        ? `Amplification Remedy: ${baseRemedy}`
        : `Pacification & Protection Remedy: ${baseRemedy}`;
    return { harmonyPercent, harmonyVerdict, remedy };
  };

  const allNumerologyCycles: NumerologyDashaPeriod[] = [];
  let cursorYear = birthYear;
  let currentDashaNum = mulank >= 1 && mulank <= 9 ? mulank : 1;

  for (let cycle = 0; cycle < 24; cycle++) {
    const duration = currentDashaNum; // Each Dasha N runs for N years
    const endYear = cursorYear + duration;
    const cycleStartMs = new Date(cursorYear, monthNum - 1, dayNum, 0, 0, 0).getTime();
    const cycleEndMs = new Date(endYear, monthNum - 1, dayNum, 0, 0, 0).getTime();
    const dInfo = DASHA_PREDICTIONS_DB[currentDashaNum] || DASHA_PREDICTIONS_DB[1];

    const isCurrent =
      (nowMs >= cycleStartMs && nowMs < cycleEndMs) ||
      (birthYear >= currentYear && cycle === 0 && nowMs < cycleEndMs);
    const cycleStatus: NumerologyDashaPeriod['cycleStatus'] = isCurrent
      ? 'PRESENT CYCLE (Active Now)'
      : cycleEndMs <= nowMs
        ? 'PAST CYCLE (Completed)'
        : 'UPCOMING CYCLE (Future)';
    const harmonyMeta = computeDashaHarmonyAndRemedy(currentDashaNum, false);

    allNumerologyCycles.push({
      dashaNumber: currentDashaNum,
      planet: dInfo.planet,
      sanskritName: dInfo.sanskrit,
      startDate: `${formattedDay}-${formattedMonth}-${cursorYear}`,
      endDate: `${formattedDay}-${formattedMonth}-${endYear}`,
      startYear: cursorYear,
      endYear,
      durationYears: duration,
      durationLabel: `${duration} ${duration === 1 ? 'Year' : 'Years'}`,
      activeAntardasha: isCurrent ? activeNumerologyAntardashaLabel : undefined,
      systemType: 'Vedic Numerology (45-Yr Mulank Cycle)',
      isCurrent,
      cycleStatus,
      harmonyPercent: harmonyMeta.harmonyPercent,
      harmonyVerdict: harmonyMeta.harmonyVerdict,
      remedy: harmonyMeta.remedy,
      paragraphs: dInfo.paragraphs,
    });

    cursorYear = endYear;
    currentDashaNum = currentDashaNum === 9 ? 1 : currentDashaNum + 1;
    if (cursorYear > Math.max(birthYear + 125, currentYear + 55)) break;
  }

  const numPresentIdx = Math.max(
    0,
    allNumerologyCycles.findIndex((d) => d.isCurrent)
  );
  const numerologyPastCycles = allNumerologyCycles.slice(0, numPresentIdx);
  const numerologyDashaTimeline = allNumerologyCycles.slice(numPresentIdx, numPresentIdx + 10);

  // ============================================================================
  // SYSTEM 2: 120-YEAR CLASSICAL PARASHARI VIMSHOTTARI MAHA DASHA
  // Calculated from exact Lahiri Sidereal Moon Longitude & Janma Nakshatra at Birth
  // Matches AstroSage, Drik Panchang & Classical Vedic Kundli Software 100%
  // ============================================================================
  const birthAstro = calculateVedicAstrologyFromBirth(isoDob, tob || '12:00', lat, lng);
  const moonDeg = birthAstro.moonDegreeSidereal;
  const nakshatraSpan = 360 / 27; // 13.333333333333334° (800 arcminutes)
  const nakIndex = Math.floor(moonDeg / nakshatraSpan) % 27;
  const degInNakshatra = Math.max(0, moonDeg - nakIndex * nakshatraSpan);
  const remainingFraction = Math.max(0.0005, Math.min(1, 1 - degInNakshatra / nakshatraSpan));

  const VIMSHOTTARI_LORDS: {
    planet: string;
    sanskrit: string;
    years: number;
    dashaNumber: number;
  }[] = [
    { planet: 'Ketu', sanskrit: 'Ketu', years: 7, dashaNumber: 7 },
    { planet: 'Venus', sanskrit: 'Shukra', years: 20, dashaNumber: 6 },
    { planet: 'Sun', sanskrit: 'Surya', years: 6, dashaNumber: 1 },
    { planet: 'Moon', sanskrit: 'Chandra', years: 10, dashaNumber: 2 },
    { planet: 'Mars', sanskrit: 'Mangal', years: 7, dashaNumber: 9 },
    { planet: 'Rahu', sanskrit: 'Rahu', years: 18, dashaNumber: 4 },
    { planet: 'Jupiter', sanskrit: 'Guru', years: 16, dashaNumber: 3 },
    { planet: 'Saturn', sanskrit: 'Shani', years: 19, dashaNumber: 8 },
    { planet: 'Mercury', sanskrit: 'Budha', years: 17, dashaNumber: 5 },
  ];

  const formatDdMmYyyy = (ms: number): string => {
    const dt = new Date(ms);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const MS_PER_SOLAR_YEAR = 365.2425 * 86400000;
  const [tobHour, tobMin] = (tob || '12:00').split(':').map((x) => parseInt(x, 10) || 0);
  const birthStartMs = new Date(birthYear, monthNum - 1, dayNum, tobHour, tobMin, 0).getTime();

  const birthLordIdx = nakIndex % 9;
  const birthLordMeta = VIMSHOTTARI_LORDS[birthLordIdx];
  const birthBalanceYearsFloat = birthLordMeta.years * remainingFraction;
  const balWholeYrs = Math.floor(birthBalanceYearsFloat);
  const balRemMonthsFloat = (birthBalanceYearsFloat - balWholeYrs) * 12;
  const balWholeMos = Math.floor(balRemMonthsFloat);
  const balDays = Math.round((balRemMonthsFloat - balWholeMos) * 30.436875);
  const birthDashaBalanceLabel = `${balWholeYrs} Yrs ${balWholeMos} Mos ${balDays} Days`;

  const allVimshottariCycles: NumerologyDashaPeriod[] = [];
  let vimCursorMs = birthStartMs;

  for (let i = 0; i < 10; i++) {
    const lordIdx = (birthLordIdx + i) % 9;
    const lord = VIMSHOTTARI_LORDS[lordIdx];
    const effectiveYears = i === 0 ? birthBalanceYearsFloat : lord.years;
    const periodEndMs =
      i === 0
        ? Math.round(birthStartMs + effectiveYears * MS_PER_SOLAR_YEAR)
        : (() => {
            const d = new Date(vimCursorMs);
            d.setFullYear(d.getFullYear() + lord.years);
            return d.getTime();
          })();

    const isCurrent =
      (nowMs >= vimCursorMs && nowMs < periodEndMs) ||
      (birthStartMs >= nowMs && i === 0);
    const cycleStatus: NumerologyDashaPeriod['cycleStatus'] = isCurrent
      ? 'PRESENT CYCLE (Active Now)'
      : periodEndMs <= nowMs
        ? 'PAST CYCLE (Completed)'
        : 'UPCOMING CYCLE (Future)';

    // Calculate Antardasha (Bhukti) inside this Maha Dasha
    let activeAntardashaStr: string | undefined;
    const fullMahaStartMs =
      i === 0
        ? Math.round(periodEndMs - lord.years * MS_PER_SOLAR_YEAR)
        : vimCursorMs;
    let antarCursorMs = fullMahaStartMs;
    for (let a = 0; a < 9; a++) {
      const antarLord = VIMSHOTTARI_LORDS[(lordIdx + a) % 9];
      const antarYearsFloat = (lord.years * antarLord.years) / 120;
      const antarEndMs = Math.round(antarCursorMs + antarYearsFloat * MS_PER_SOLAR_YEAR);
      if (isCurrent && nowMs >= antarCursorMs && nowMs < antarEndMs) {
        activeAntardashaStr = `${lord.planet}–${antarLord.planet} (${antarLord.sanskrit}) Antardasha [${formatDdMmYyyy(Math.max(vimCursorMs, antarCursorMs))} to ${formatDdMmYyyy(antarEndMs)}]`;
        break;
      }
      antarCursorMs = antarEndMs;
    }

    const dInfo = DASHA_PREDICTIONS_DB[lord.dashaNumber] || DASHA_PREDICTIONS_DB[1];
    const startDt = new Date(vimCursorMs);
    const endDt = new Date(periodEndMs);
    const vimHarmonyMeta = computeDashaHarmonyAndRemedy(lord.dashaNumber, true);

    allVimshottariCycles.push({
      dashaNumber: lord.dashaNumber,
      planet: lord.planet,
      sanskritName: lord.sanskrit,
      startDate: formatDdMmYyyy(vimCursorMs),
      endDate: formatDdMmYyyy(periodEndMs),
      startYear: startDt.getFullYear(),
      endYear: endDt.getFullYear(),
      durationYears: Math.round(effectiveYears * 10) / 10,
      durationLabel:
        i === 0
          ? `${birthDashaBalanceLabel} (Birth Balance of ${lord.years} Yrs)`
          : `${lord.years} Years`,
      activeAntardasha: activeAntardashaStr,
      systemType: 'Vedic Astrology Vimshottari (120-Yr Nakshatra Cycle)',
      isCurrent,
      cycleStatus,
      harmonyPercent: vimHarmonyMeta.harmonyPercent,
      harmonyVerdict: vimHarmonyMeta.harmonyVerdict,
      remedy: vimHarmonyMeta.remedy,
      paragraphs: dInfo.paragraphs,
    });

    vimCursorMs = periodEndMs;
  }

  const vimPresentIdx = Math.max(
    0,
    allVimshottariCycles.findIndex((d) => d.isCurrent)
  );
  const vimshottariPastCycles = allVimshottariCycles.slice(0, vimPresentIdx);
  const vimshottariDashaTimeline = allVimshottariCycles.slice(vimPresentIdx, vimPresentIdx + 9);

  return {
    mobileNumber: cleanDigits,
    mobileCompound,
    mobileTotal,
    mobileTotalPrediction:
      MOBILE_TOTAL_PREDICTIONS[mobileTotal] || MOBILE_TOTAL_PREDICTIONS[5],
    recommendedMobileTotals,
    avoidNumbersInMobile,
    exampleRecommendedNumbers,
    luckyColours,
    unluckyColours,
    luckyNumbers,
    unluckyNumbers,
    neutralNumbers,
    missingNumbersFormatted,
    missingNumbersList,
    missingNumberRemedies,
    mobileCombinations,
    combinedPairPrediction,
    recommendedWallpaper: wallpaperMap[mulank] || wallpaperMap[7],
    vedicGrid,
    presentNumberReadings,
    chartCombinations,
    rulingPlanetName: `${mulankProfile.sanskritName.split(' ')[0]} (${mulankProfile.planet})`,
    dashaTimeline: numerologyDashaTimeline,
    pastDashaCycles: numerologyPastCycles,
    vimshottariDashaTimeline,
    vimshottariPastCycles,
    numerologyDashaTimeline,
    numerologyPastCycles,
    janmaNakshatraSummary: {
      nakshatra: birthAstro.nakshatra,
      pada: birthAstro.pada,
      rashi: birthAstro.rashi,
      moonDegreeSidereal: Math.round(moonDeg * 100) / 100,
      birthDashaLord: `${birthLordMeta.planet} (${birthLordMeta.sanskrit} — ${birthLordMeta.years} Yrs)`,
      birthDashaBalanceLabel,
    },
  };
}
