import React, { useState, useMemo } from 'react';
import {
  Grid,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Compass,
  Gem,
  Flame,
  Volume2,
  HeartHandshake,
  RotateCcw,
  PlusCircle,
  Eye,
  Award,
  Sun,
} from 'lucide-react';
import { PLANETARY_PROFILES } from '../utils/numerology';

export interface InteractiveLoShuGridProps {
  dob: string;
  mulank: number;
  bhagyank: number;
  clientName?: string;
  namank?: number;
}

export interface DetailedLoShuNumberRemedy {
  number: number;
  planet: string;
  sanskrit: string;
  deity: string;
  direction: string;
  element: string;
  chakra: string;
  missingImpact: string;
  weakSingleImpact: string;
  strongDoubleImpact: string;
  excessTripleImpact: string;
  rudrakshaAndCrystal: string;
  vastuRemedy: string;
  beejMantra: string;
  mantraProtocol: string;
  dailyKarmaAndDaan: string;
}

export const LO_SHU_VEDIC_REMEDIES_DB: Record<number, DetailedLoShuNumberRemedy> = {
  1: {
    number: 1,
    planet: 'Sun (Surya)',
    sanskrit: 'Surya Narayan',
    deity: 'Lord Surya / Lord Shiva',
    direction: 'North (Water / Career Zone) & East (Solar Zone)',
    element: 'Water (Lo Shu) / Fire (Vedic)',
    chakra: 'Manipura (Solar Plexus Chakra)',
    missingImpact:
      'Missing Number 1 indicates suppressed self-expression, difficulty asserting authority in front of elders or bosses, hesitation in taking solo leadership, and fluctuating self-confidence during early career stages.',
    weakSingleImpact:
      'Single 1 (1x) gives balanced individuality and honest self-expression, though you may occasionally need external encouragement to step into supreme command.',
    strongDoubleImpact:
      'Double 1 (11 / 2x) bestows articulate communication, natural leadership charisma, and the ability to see both sides of any situation clearly.',
    excessTripleImpact:
      'Multiple 1s (3x+) can create high ego sensitivity, restlessness, or a tendency to dominate conversations; grounding humility is advised.',
    rudrakshaAndCrystal:
      'Wear a 1-Mukhi or 12-Mukhi Nepal Rudraksha in red thread, or a natural Red Garnet / Sunstone crystal bracelet on the right wrist. A pure copper kada also strengthens Solar prana.',
    vastuRemedy:
      'Keep the East and North sectors of your home and office well-lit and clutter-free. Place a rising sun painting or a brass Surya Yantra on the East wall, or a small water fountain in the North.',
    beejMantra: 'Om Hram Hreem Hroum Sah Suryaya Namah',
    mantraProtocol: 'Chant 108 times daily at sunrise (within 45 minutes of dawn) facing East.',
    dailyKarmaAndDaan:
      'Offer Arghya (water mixed with red kumkum and अक्षत/rice) to the rising Sun in a copper vessel every morning. Respect your father and donate wheat or jaggery (गुड़) on Sundays.',
  },
  2: {
    number: 2,
    planet: 'Moon (Chandra)',
    sanskrit: 'Chandra Dev',
    deity: 'Lord Shiva & Goddess Parvati',
    direction: 'South-West (Relationships & Earth Stability Zone)',
    element: 'Earth (Lo Shu) / Water (Vedic)',
    chakra: 'Swadhisthana (Sacral Chakra)',
    missingImpact:
      'Missing Number 2 causes emotionalguardedness, impatience with others’ sensitivity, occasional marital or partnership misunderstandings, and neglecting your own intuitive inner voice.',
    weakSingleImpact:
      'Single 2 (1x) provides healthy empathy, cooperative teamwork, and emotional warmth in family relationships.',
    strongDoubleImpact:
      'Double 2 (22 / 2x) grants razor-sharp psychic intuition, diplomatic brilliance, and the ability to read unspoken emotions effortlessly.',
    excessTripleImpact:
      'Multiple 2s (3x+) can trigger mood swings, over-sensitivity to criticism, and chronic overthinking; silver grounding is essential.',
    rudrakshaAndCrystal:
      'Wear a 2-Mukhi Rudraksha or a natural Moonstone / Mother Pearl (Moti) crystal bracelet in silver on Monday morning.',
    vastuRemedy:
      'Harmonize the South-West corner of your bedroom with a pair of Rose Quartz hearts or white marble swans. Avoid toilets or heavy water storage in the South-West.',
    beejMantra: 'Om Shram Shreem Shroum Sah Chandraya Namah',
    mantraProtocol: 'Chant 108 times on Monday evenings or during Shukla Paksha waxing moon nights.',
    dailyKarmaAndDaan:
      'Drink water from a pure silver glass daily. Touch your mother’s feet for blessings and donate white rice, milk, or sugar मिश्री on Mondays.',
  },
  3: {
    number: 3,
    planet: 'Jupiter (Guru Brihaspati)',
    sanskrit: 'Devaguru Brihaspati',
    deity: 'Lord Vishnu / Lord Dakshinamurthy',
    direction: 'East (Family, Growth & Vital Health Zone)',
    element: 'Wood (Lo Shu) / Ether-Akasha (Vedic)',
    chakra: 'Ajna & Manipura (Wisdom & Expansion)',
    missingImpact:
      'Missing Number 3 creates self-doubt in academic or advisory roles, hesitation in creative visualization, difficulty defending oneself during arguments, and delayed mentorship support.',
    weakSingleImpact:
      'Single 3 (1x) bestows a sharp memory, moral integrity, creative imagination, and steady intellectual growth.',
    strongDoubleImpact:
      'Double 3 (33 / 2x) amplifies literary talent, teaching/counseling mastery, and spiritual wisdom.',
    excessTripleImpact:
      'Multiple 3s (3x+) can make the mind overly imaginative or scattered across too many ideas at once; practical scheduling is needed.',
    rudrakshaAndCrystal:
      'Wear a 5-Mukhi Rudraksha mala/bracelet or a natural Yellow Citrine / Yellow Sapphire (Pukhraj) crystal bracelet on Thursdays.',
    vastuRemedy:
      'Place a lush green indoor plant (or Tulsi/Bamboo) in the East sector of your home/study desk. Keep religious scriptures and a brass Guru Yantra in the North-East (Ishanya) corner.',
    beejMantra: 'Om Gram Greem Groum Sah Gurave Namah',
    mantraProtocol: 'Chant 108 times on Thursday mornings during Jupiter Hora facing North-East.',
    dailyKarmaAndDaan:
      'Apply a Kesar (saffron) or Haldi (turmeric) tilak on your forehead or throat every morning. Donate Chana Dal, yellow bananas, or educational books on Thursdays.',
  },
  4: {
    number: 4,
    planet: 'Rahu (North Node)',
    sanskrit: 'Rahu Maharaj',
    deity: 'Goddess Durga / Lord Bhairava',
    direction: 'South-East (Agni / Cash Flow & Wealth Accumulation Zone)',
    element: 'Wood (Lo Shu) / Air (Vedic)',
    chakra: 'Muladhara (Root Grounding Chakra)',
    missingImpact:
      'Missing Number 4 leads to disorganization in daily routines, money slipping through the fingers despite high income, impatience with step-by-step manual processes, and delayed savings accumulation.',
    weakSingleImpact:
      'Single 4 (1x) provides practical discipline, systematic execution, and steady hands-on craftsmanship.',
    strongDoubleImpact:
      'Double 4 (44 / 2x) gives extraordinary organizational precision, technical mastery, and pragmatic wealth building.',
    excessTripleImpact:
      'Multiple 4s (3x+) can trap one in rigid materialism, workaholic stress, or sudden Rahu upheavals; spiritual meditation is vital.',
    rudrakshaAndCrystal:
      'Wear an 8-Mukhi Rudraksha or a natural Green Aventurine / Sulemani Hakik / Pyrite bracelet to stabilize cash flow and neutralize Rahu scatter.',
    vastuRemedy:
      'Keep the South-East (Agni) corner clean and energized with a red/orange bulb or salt lamp. Use a wooden pen holder on your work desk and never leave broken electronics in the house.',
    beejMantra: 'Om Bhram Bhreem Bhroum Sah Rahave Namah',
    mantraProtocol: 'Chant 108 times at sunset or during Saturday/Wednesday evening sandhya.',
    dailyKarmaAndDaan:
      'Maintain a written daily task & expense ledger. Feed seven-grain mix (सप्तधान्य) to birds every morning and donate coconuts or blue/grey blankets to sanitation workers.',
  },
  5: {
    number: 5,
    planet: 'Mercury (Budha)',
    sanskrit: 'Budha Dev',
    deity: 'Lord Ganesha / Lord Vishnu',
    direction: 'Center (Brahmasthan — Cosmic Core of the Grid)',
    element: 'Earth (Center Balance)',
    chakra: 'Vishuddha (Throat & Commercial Intelligence Chakra)',
    missingImpact:
      'Missing Number 5 leaves the very center (Brahmasthan) of the Lo Shu Grid unanchored—causing hesitation in setting bold goals, lack of commercial versatility, emotional instability under pressure, and need for constant external motivation.',
    weakSingleImpact:
      'Single 5 (1x) anchors the entire birth chart with emotional balance, business adaptability, and persuasive communication.',
    strongDoubleImpact:
      'Double 5 (55 / 2x) creates unstoppable determination, dynamic commercial drive, and magnetic public appeal.',
    excessTripleImpact:
      'Multiple 5s (3x+) can cause nervous restlessness, impulsive risk-taking, or blunt speech; pranayama breathing is recommended.',
    rudrakshaAndCrystal:
      'Wear a 4-Mukhi Rudraksha or a natural Green Jade / Peridot / Emerald (Panna) crystal bracelet on Wednesdays.',
    vastuRemedy:
      'Keep the exact center (Brahmasthan) of your home and office completely open, airy, and free from heavy pillars or clutter. Place a crystal pyramid or green aventurine sphere on your work desk.',
    beejMantra: 'Om Bram Breem Broum Sah Budhaya Namah',
    mantraProtocol: 'Chant 108 times on Wednesday mornings facing North.',
    dailyKarmaAndDaan:
      'Offer green Durva grass to Lord Ganesha and feed green fodder (हरा चारा) or soaked green moong to cows on Wednesdays. Practice 10 minutes of Anulom-Vilom pranayama daily.',
  },
  6: {
    number: 6,
    planet: 'Venus (Shukra)',
    sanskrit: 'Shukracharya',
    deity: 'Goddess Mahalakshmi',
    direction: 'North-West (Helpful Friends, Foreign Travel & Luxury Zone)',
    element: 'Metal (Lo Shu) / Water-Jala (Vedic)',
    chakra: 'Anahata & Swadhisthana (Harmony, Beauty & Magnetism)',
    missingImpact:
      'Missing Number 6 indicates a tendency to hide deep feelings from family, occasional lack of timely support from friends/mentors, domestic friction, or delays in enjoying material luxuries and foreign travel.',
    weakSingleImpact:
      'Single 6 (1x) brings deep devotion to family, artistic appreciation, domestic harmony, and natural social grace.',
    strongDoubleImpact:
      'Double 6 (66 / 2x) bestows magnetic charm, creative luxury attraction, and joyful domestic bonds.',
    excessTripleImpact:
      'Multiple 6s (3x+) can cause over-possessiveness regarding loved ones or excessive indulgence in luxury; balanced detachment is advised.',
    rudrakshaAndCrystal:
      'Wear a 6-Mukhi Rudraksha or a natural Clear Quartz / Rose Quartz / White Zircon crystal bracelet on Fridays.',
    vastuRemedy:
      'Hang a 6-rod metallic wind chime (golden or silver) in the North-West sector of your home/office to activate helpful mentors, luxury magnetism, and international opportunities.',
    beejMantra: 'Om Dram Dreem Droum Sah Shukraya Namah',
    mantraProtocol: 'Chant 108 times on Friday mornings or evenings after lighting a pure cow ghee lamp.',
    dailyKarmaAndDaan:
      'Always wear clean, well-ironed clothes and apply natural rose/sandalwood attar (इत्र) daily. Respect women in the household and donate white sweets, curd, or camphor on Fridays.',
  },
  7: {
    number: 7,
    planet: 'Ketu (South Node)',
    sanskrit: 'Ketu Maharaj',
    deity: 'Lord Ganesha / Matsya Avatar',
    direction: 'West (Creativity, Children, Research & Spiritual Liberation Zone)',
    element: 'Metal (Lo Shu) / Spiritual Fire (Vedic)',
    chakra: 'Sahasrara (Crown Chakra)',
    missingImpact:
      'Missing Number 7 causes disinterest in metaphysical or spiritual depth until life brings emotional setbacks, occasional anxiety about the future or children, and difficulty trusting gut intuition.',
    weakSingleImpact:
      'Single 7 (1x) gives deep philosophical insight, research acumen, and spiritual maturity gained through love and life experience.',
    strongDoubleImpact:
      'Double 7 (77 / 2x) awakens occult mastery, sharp analytical intuition, and detachment from superficial worldly drama.',
    excessTripleImpact:
      'Multiple 7s (3x+) can bring emotional isolation, cynicism, or repeated disappointments in partnerships; heart-centered gratitude is essential.',
    rudrakshaAndCrystal:
      'Wear a 9-Mukhi Rudraksha or a natural Amethyst / Cat’s Eye / Smoky Quartz crystal bracelet, or wear a dual-toned metallic watch.',
    vastuRemedy:
      'Keep the West sector of your home clean and place a metallic Ganesha idol or a silver/white decorative artifact there. Meditate in the North-East corner daily.',
    beejMantra: 'Om Sram Sreem Sroum Sah Ketave Namah',
    mantraProtocol: 'Chant 108 times during evening twilight (Sandhya Kaal) or on Tuesdays/Thursdays.',
    dailyKarmaAndDaan:
      'Feed stray dogs (especially multi-colored dogs) bread/milk daily. Chant Ganesha Atharvashirsha and donate warm blankets or sesame seeds to needy elders.',
  },
  8: {
    number: 8,
    planet: 'Saturn (Shani Dev)',
    sanskrit: 'Shanaischara',
    deity: 'Lord Shani Dev / Lord Hanuman',
    direction: 'North-East (Wisdom, Karmic Justice & Financial Management Zone)',
    element: 'Earth (Lo Shu) / Air-Vayu (Vedic)',
    chakra: 'Muladhara & Ajna (Karmic Discipline)',
    missingImpact:
      'Missing Number 8 leads to careless handling of large finances, trusting the wrong people in business, lack of long-term patience, and procrastination on difficult tasks.',
    weakSingleImpact:
      'Single 8 (1x) bestows methodical discipline, financial prudence, and a strong sense of karmic justice.',
    strongDoubleImpact:
      'Double 8 (88 / 2x) grants sharp organizational authority, real-estate/asset judgment, and tireless perseverance.',
    excessTripleImpact:
      'Multiple 8s (3x+) can create heavy mental brooding, stubbornness, or chronic delays; regular Hanuman worship and charity soften Shani’s intensity.',
    rudrakshaAndCrystal:
      'Wear a 7-Mukhi or 14-Mukhi Rudraksha, or a natural Amethyst / Lapis Lazuli / Black Tourmaline crystal bracelet on Saturdays.',
    vastuRemedy:
      'Keep the North-East (Ishanya) zone spotless and place a natural crystal quartz cluster or a copper Kalash filled with water there. Keep the West zone organized.',
    beejMantra: 'Om Pram Preem Proum Sah Shanaischaraya Namah',
    mantraProtocol: 'Chant 108 times on Saturday evenings after sunset facing West.',
    dailyKarmaAndDaan:
      'Light a mustard oil diya with black sesame seeds under a Peepal tree every Saturday evening. Treat employees, drivers, and laborers with utmost fairness and donate black urad dal or footwear.',
  },
  9: {
    number: 9,
    planet: 'Mars (Mangal)',
    sanskrit: 'Mangal / Angaraka',
    deity: 'Lord Hanuman / Lord Kartikeya',
    direction: 'South (Fame, Recognition, Courage & Agni Zone)',
    element: 'Fire (Agni)',
    chakra: 'Manipura & Muladhara (Vitality & Valour)',
    missingImpact:
      'Missing Number 9 (common for those born after the year 2000) results in overlooking others’ emotional needs, fluctuating physical stamina, unfinished projects due to waning enthusiasm, or delayed public recognition.',
    weakSingleImpact:
      'Single 9 (1x) gives humanitarian idealism, noble ambition, and courageous determination.',
    strongDoubleImpact:
      'Double 9 (99 / 2x) bestows high intellectual brilliance, executive command, and tireless missionary zeal.',
    excessTripleImpact:
      'Multiple 9s (3x+) can provoke impulsive anger, impatience, or friction in relationships; physical exercise and cooling pranayama are essential.',
    rudrakshaAndCrystal:
      'Wear a 3-Mukhi Rudraksha or a natural Red Carnelian / Red Coral (Moonga) / Bloodstone crystal bracelet on Tuesdays.',
    vastuRemedy:
      'Illuminate the South sector of your home/office with a warm red/amber light, a rising phoenix emblem, or a copper Hanuman / Mangal Yantra to ignite fame and recognition.',
    beejMantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah',
    mantraProtocol: 'Chant 108 times on Tuesday mornings facing South or East.',
    dailyKarmaAndDaan:
      'Recite the Hanuman Chalisa daily. Engage in 20 minutes of physical exercise to channel Mars fire constructively, and donate red masoor dal, jaggery, or Sindoor at a Hanuman temple on Tuesdays.',
  },
};

interface LoShuPlaneDef {
  id: string;
  name: string;
  sanskritTitle: string;
  category: 'Horizontal Plane' | 'Vertical Arrow' | 'Diagonal Raj Yoga';
  numbers: [number, number, number];
  meaning: string;
  missingRemedySummary: string;
}

const LO_SHU_PLANES_LIST: LoShuPlaneDef[] = [
  {
    id: 'mental',
    name: 'Mental Plane (4 - 9 - 2)',
    sanskritTitle: 'Manasik & Buddhi Disha (Top Row)',
    category: 'Horizontal Plane',
    numbers: [4, 9, 2],
    meaning:
      'Governs intellectual memory, strategic planning, analytical genius, and head-level clarity.',
    missingRemedySummary:
      'Energize South-East (4), South (9), and South-West (2) with Wood, Fire, and Earth remedies.',
  },
  {
    id: 'emotional',
    name: 'Emotional / Soul Plane (3 - 5 - 7)',
    sanskritTitle: 'Bhavana & Atma Disha (Middle Row)',
    category: 'Horizontal Plane',
    numbers: [3, 5, 7],
    meaning:
      'Heart of the chart—grants golden heart empathy, spiritual intuition, artistic depth, and emotional resilience.',
    missingRemedySummary:
      'Balance East (3), Center Brahmasthan (5), and West (7) with Tulsi, Crystal Pyramid, and Ganesha sadhana.',
  },
  {
    id: 'practical',
    name: 'Practical Plane (8 - 1 - 6)',
    sanskritTitle: 'Karmic & Bhautik Disha (Bottom Row)',
    category: 'Horizontal Plane',
    numbers: [8, 1, 6],
    meaning:
      'Governs grounded execution, commercial wealth creation, physical stamina, and material foundations.',
    missingRemedySummary:
      'Strengthen North-East (8), North (1), and North-West (6) with Crystal Quartz, Surya Arghya, and Metallic Wind Chime.',
  },
  {
    id: 'thought',
    name: 'Arrow of Thought (4 - 3 - 8)',
    sanskritTitle: 'Vichar & Niti Stambha (Left Column)',
    category: 'Vertical Arrow',
    numbers: [4, 3, 8],
    meaning:
      'Bestows political/strategic foresight, deep deduction, and the ability to architect long-term empires.',
    missingRemedySummary:
      'Bridge missing numbers in 4-3-8 using wooden desk accessories, yellow saffron tilak, and Saturday charity.',
  },
  {
    id: 'will',
    name: 'Arrow of Willpower (9 - 5 - 1)',
    sanskritTitle: 'Sankalpa Shakti Stambha (Center Column)',
    category: 'Vertical Arrow',
    numbers: [9, 5, 1],
    meaning:
      'The spine of the Lo Shu Grid—unstoppable persistence, executive authority, and triumph over adversity.',
    missingRemedySummary:
      'Ignite Sankalpa Shakti with Hanuman Chalisa (9), Green Jade/Budha mantra (5), and Sunrise Surya Arghya (1).',
  },
  {
    id: 'action',
    name: 'Arrow of Action (2 - 7 - 6)',
    sanskritTitle: 'Kriya & Gati Stambha (Right Column)',
    category: 'Vertical Arrow',
    numbers: [2, 7, 6],
    meaning:
      'Rapid implementation, physical vitality, athletic/artistic spontaneity, and turning ideas into reality.',
    missingRemedySummary:
      'Activate 2-7-6 with Silver water vessel (2), Ketu meditation (7), and Venus 6-rod wind chime (6).',
  },
  {
    id: 'golden_yoga',
    name: 'Golden Raj Yoga (4 - 5 - 6)',
    sanskritTitle: 'Swarna Lakshmi Raj Yoga (Diagonal)',
    category: 'Diagonal Raj Yoga',
    numbers: [4, 5, 6],
    meaning:
      'Supreme diagonal of fortune—attracts extraordinary commercial wealth, luxury assets, and helpful patrons.',
    missingRemedySummary:
      'Bridge any missing link in 4-5-6 immediately with Pyrite/Green Aventurine (4), Emerald/Crystal Pyramid (5), and 6-Rod Metallic Wind Chime (6).',
  },
  {
    id: 'silver_yoga',
    name: 'Silver Raj Yoga (2 - 5 - 8)',
    sanskritTitle: 'Rajat Bhumi & Sampatti Yoga (Diagonal)',
    category: 'Diagonal Raj Yoga',
    numbers: [2, 5, 8],
    meaning:
      'Supreme diagonal of Earth stability—grants massive success in real estate, land, banking, and generational assets.',
    missingRemedySummary:
      'Unlock Earth stability (2-5-8) with Rose Quartz/Silver (2), Center Brahmasthan crystal (5), and Shani Peepal diya (8).',
  },
];

// Standard Sacred Lo Shu Square 3x3 Layout:
// Row 1: 4 | 9 | 2
// Row 2: 3 | 5 | 7
// Row 3: 8 | 1 | 6
const SACRED_LO_SHU_MATRIX: number[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export const InteractiveLoShuGrid: React.FC<InteractiveLoShuGridProps> = ({
  dob,
  mulank,
  bhagyank,
  clientName,
  namank,
}) => {
  // Parse birth digits and track exact sources for each number 1..9
  const placementBreakdown = useMemo(() => {
    const rawDigits = (dob || '')
      .replace(/\D/g, '')
      .split('')
      .map((d) => parseInt(d, 10))
      .filter((d) => d >= 1 && d <= 9);

    const dobCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (const d of rawDigits) {
      dobCount[d] = (dobCount[d] || 0) + 1;
    }

    const totalNatalCount: Record<number, number> = { ...dobCount };
    if (mulank >= 1 && mulank <= 9) {
      totalNatalCount[mulank] = (totalNatalCount[mulank] || 0) + 1;
    }
    if (bhagyank >= 1 && bhagyank <= 9) {
      totalNatalCount[bhagyank] = (totalNatalCount[bhagyank] || 0) + 1;
    }

    return {
      dobCount,
      totalNatalCount,
    };
  }, [dob, mulank, bhagyank]);

  // Allow user/healer to simulate remedial activation of missing numbers or overlay Namank
  const [simulatedRemedialNumbers, setSimulatedRemedialNumbers] = useState<number[]>([]);
  const [includeNamankOverlay, setIncludeNamankOverlay] = useState<boolean>(false);
  const [selectedPlaneId, setSelectedPlaneId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'missing' | 'present'>('all');

  // Default selected cell: first missing number if any, else Mulank
  const firstMissingNumber = useMemo(() => {
    for (let i = 1; i <= 9; i++) {
      if (placementBreakdown.totalNatalCount[i] === 0) return i;
    }
    return mulank || 1;
  }, [placementBreakdown, mulank]);

  const [selectedNumber, setSelectedNumber] = useState<number>(firstMissingNumber);

  // Active grid counts including optional simulated remedies & Namank overlay
  const activeGridCounts = useMemo(() => {
    const counts: Record<number, number> = { ...placementBreakdown.totalNatalCount };
    if (includeNamankOverlay && namank && namank >= 1 && namank <= 9) {
      counts[namank] = (counts[namank] || 0) + 1;
    }
    for (const num of simulatedRemedialNumbers) {
      counts[num] = (counts[num] || 0) + 1;
    }
    return counts;
  }, [placementBreakdown, includeNamankOverlay, namank, simulatedRemedialNumbers]);

  const missingNatalNumbers = useMemo(() => {
    const arr: number[] = [];
    for (let n = 1; n <= 9; n++) {
      if (placementBreakdown.totalNatalCount[n] === 0) arr.push(n);
    }
    return arr;
  }, [placementBreakdown]);

  const presentNatalNumbers = useMemo(() => {
    const arr: number[] = [];
    for (let n = 1; n <= 9; n++) {
      if (placementBreakdown.totalNatalCount[n] > 0) arr.push(n);
    }
    return arr;
  }, [placementBreakdown]);

  const toggleSimulatedRemedy = (num: number) => {
    setSimulatedRemedialNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const selectedPlane = useMemo(
    () => LO_SHU_PLANES_LIST.find((p) => p.id === selectedPlaneId) || null,
    [selectedPlaneId]
  );

  const selectedRemedyData = LO_SHU_VEDIC_REMEDIES_DB[selectedNumber] || LO_SHU_VEDIC_REMEDIES_DB[1];
  const selectedPlanetInfo = PLANETARY_PROFILES[selectedNumber];
  const selectedNatalCount = placementBreakdown.totalNatalCount[selectedNumber] || 0;
  const selectedActiveCount = activeGridCounts[selectedNumber] || 0;
  const isRemedySimulated = simulatedRemedialNumbers.includes(selectedNumber);

  return (
    <div className="bg-slate-900/95 border-2 border-amber-500/35 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/25 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Sacred 3×3 Lo Shu Grid & Vedic Planetary Remedies</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-black text-amber-100">
            Sacred Lo Shu Square Matrix & Missing Number Vedic Remedies
          </h2>
          <p className="text-xs text-amber-200/80">
            Click any cell (1–9) or any Sacred Plane / Raj Yoga below to inspect birth number placements ({dob.split('-').reverse().join('-')}, Mulank {mulank}, Bhagyank {bhagyank}) and activate Vedic planetary remedies.
          </p>
        </div>

        {/* Interactive Controls: Simulate All Remedies / Namank Overlay / Reset */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {namank && (
            <button
              type="button"
              onClick={() => setIncludeNamankOverlay((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                includeNamankOverlay
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                  : 'bg-slate-950 text-amber-200 border-amber-500/35 hover:border-amber-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{includeNamankOverlay ? `Namank #${namank} Active` : `+ Overlay Namank (#${namank})`}</span>
            </button>
          )}

          {missingNatalNumbers.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (simulatedRemedialNumbers.length === missingNatalNumbers.length) {
                  setSimulatedRemedialNumbers([]);
                } else {
                  setSimulatedRemedialNumbers([...missingNatalNumbers]);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                simulatedRemedialNumbers.length > 0
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg'
                  : 'bg-amber-500/15 text-amber-200 border-amber-400/50 hover:bg-amber-500/25'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>
                {simulatedRemedialNumbers.length === missingNatalNumbers.length
                  ? 'Remedies Simulated (100% Grid)'
                  : `Simulate All ${missingNatalNumbers.length} Missing Remedies`}
              </span>
            </button>
          )}

          {(simulatedRemedialNumbers.length > 0 || includeNamankOverlay || selectedPlaneId) && (
            <button
              type="button"
              onClick={() => {
                setSimulatedRemedialNumbers([]);
                setIncludeNamankOverlay(false);
                setSelectedPlaneId(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Layout: Left = Sacred Square 3x3 Lo Shu Matrix + Planes | Right = Interactive Planetary Diagnostic & 4-Pillar Vedic Remedy Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 cols): Sacred 3x3 Square Lo Shu Matrix & Legend */}
        <div className="lg:col-span-5 flex flex-col items-center bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="w-full flex items-center justify-between text-xs border-b border-amber-500/20 pb-2.5">
            <span className="font-serif font-bold text-amber-200 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Sacred 3×3 Square Lo Shu Matrix</span>
            </span>
            <span className="font-mono text-[11px] text-amber-300">
              Present: {presentNatalNumbers.length}/9 • Missing: {missingNatalNumbers.length}/9
            </span>
          </div>

          {/* 3x3 SQUARE BOX GRID */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[330px] aspect-square p-3.5 rounded-2xl bg-slate-950 border-2 border-amber-400/60 shadow-2xl">
            {SACRED_LO_SHU_MATRIX.flat().map((cellNum) => {
              const natalCount = placementBreakdown.totalNatalCount[cellNum] || 0;
              const dobCount = placementBreakdown.dobCount[cellNum] || 0;
              const isMulank = mulank === cellNum;
              const isBhagyank = bhagyank === cellNum;
              const isSimulated = simulatedRemedialNumbers.includes(cellNum);
              const isNamankAdded = includeNamankOverlay && namank === cellNum;
              const activeCount = activeGridCounts[cellNum] || 0;

              const isSelected = selectedNumber === cellNum;
              const isPlaneHighlighted = selectedPlane ? selectedPlane.numbers.includes(cellNum) : false;

              const pInfo = PLANETARY_PROFILES[cellNum];
              const repeatedDigits = activeCount > 0 ? Array(activeCount).fill(cellNum).join('') : '—';

              // Visual Styling based on Placement Strength
              let cellColorClasses = '';
              if (activeCount === 0) {
                cellColorClasses =
                  'bg-rose-950/25 border-rose-500/40 border-dashed text-rose-300/80 hover:border-rose-400';
              } else if (isSimulated && natalCount === 0) {
                cellColorClasses =
                  'bg-sky-950/50 border-sky-400 text-sky-100 shadow-lg shadow-sky-500/15';
              } else if (activeCount === 1) {
                cellColorClasses =
                  'bg-amber-500/15 border-amber-400/70 text-amber-100 shadow-md shadow-amber-500/10';
              } else if (activeCount === 2) {
                cellColorClasses =
                  'bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-md shadow-emerald-500/15';
              } else {
                cellColorClasses =
                  'bg-purple-500/25 border-purple-400 text-purple-100 shadow-lg shadow-purple-500/20';
              }

              return (
                <button
                  key={cellNum}
                  type="button"
                  onClick={() => setSelectedNumber(cellNum)}
                  className={`aspect-square rounded-2xl border-2 p-2 flex flex-col items-center justify-between relative transition-all cursor-pointer select-none ${cellColorClasses} ${
                    isSelected
                      ? 'ring-2 ring-amber-300 scale-[1.03] z-10'
                      : isPlaneHighlighted
                      ? 'ring-2 ring-emerald-400/80'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* Top Row: Cell Number & Frequency Badge */}
                  <div className="w-full flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold opacity-85">#{cellNum}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-black text-[9px] ${
                        activeCount === 0
                          ? 'bg-rose-500/25 text-rose-300'
                          : isSimulated && natalCount === 0
                          ? 'bg-sky-500/30 text-sky-200'
                          : activeCount === 1
                          ? 'bg-amber-500/30 text-amber-200'
                          : activeCount === 2
                          ? 'bg-emerald-500/30 text-emerald-200'
                          : 'bg-purple-500/35 text-purple-200'
                      }`}
                    >
                      {activeCount === 0
                        ? 'MISSING'
                        : isSimulated && natalCount === 0
                        ? '+REMEDY'
                        : `${activeCount}x`}
                    </span>
                  </div>

                  {/* Center: Repeated Number Display */}
                  <div className="font-mono text-xl sm:text-2xl font-black tracking-widest leading-none my-0.5">
                    {repeatedDigits}
                  </div>

                  {/* Bottom Row: Planet Name & Birth Source Tags */}
                  <div className="w-full text-center space-y-0.5">
                    <div className="text-[9px] font-semibold truncate opacity-90">
                      {pInfo?.planet.split(' ')[0]}
                    </div>
                    <div className="flex items-center justify-center gap-0.5 flex-wrap">
                      {dobCount > 0 && (
                        <span className="px-1 rounded bg-slate-900/90 text-[8px] font-mono text-amber-200 border border-amber-500/30">
                          DOB
                        </span>
                      )}
                      {isMulank && (
                        <span className="px-1 rounded bg-amber-500 text-slate-950 text-[8px] font-mono font-black">
                          M
                        </span>
                      )}
                      {isBhagyank && (
                        <span className="px-1 rounded bg-emerald-400 text-slate-950 text-[8px] font-mono font-black">
                          B
                        </span>
                      )}
                      {isNamankAdded && (
                        <span className="px-1 rounded bg-indigo-400 text-slate-950 text-[8px] font-mono font-black">
                          N
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Placement Source Legend */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] pt-1">
            <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-center">
              <strong className="block font-mono">0x Missing</strong>
              <span className="text-[9px] opacity-80">Needs Vedic Remedy</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-center">
              <strong className="block font-mono">1x Balanced</strong>
              <span className="text-[9px] opacity-80">Single Placement</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-center">
              <strong className="block font-mono">2x Strong</strong>
              <span className="text-[9px] opacity-80">Double Power</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200 text-center">
              <strong className="block font-mono">3x+ Amplified</strong>
              <span className="text-[9px] opacity-80">Needs Grounding</span>
            </div>
          </div>

          {/* Quick Number Selector Pills (Missing vs Present) */}
          <div className="w-full space-y-2 pt-2 border-t border-amber-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Quick Inspect Number (1–9):
              </span>
              <div className="flex items-center gap-1">
                {(['all', 'missing', 'present'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterMode(mode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                      filterMode === mode
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-amber-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9]
                .filter((n) => {
                  if (filterMode === 'missing') return placementBreakdown.totalNatalCount[n] === 0;
                  if (filterMode === 'present') return placementBreakdown.totalNatalCount[n] > 0;
                  return true;
                })
                .map((num) => {
                  const isMissing = placementBreakdown.totalNatalCount[num] === 0;
                  const active = selectedNumber === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedNumber(num)}
                      className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        active
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                          : isMissing
                          ? 'bg-rose-950/40 text-rose-200 border-rose-500/40 hover:border-rose-400'
                          : 'bg-slate-900 text-emerald-200 border-emerald-500/35 hover:border-emerald-400'
                      }`}
                    >
                      <span>#{num}</span>
                      <span className="text-[10px] opacity-80">
                        ({placementBreakdown.totalNatalCount[num]}x)
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Selected Number Vedic Planetary Diagnostic & 4-Pillar Remedy Prescription */}
        <div className="lg:col-span-7 bg-slate-950/90 border border-amber-500/35 rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Selected Number Header & Remedy Simulation Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 font-mono font-black ${
                  selectedNatalCount === 0
                    ? 'bg-rose-950/50 border-rose-400 text-rose-200'
                    : 'bg-amber-500/20 border-amber-400 text-amber-200'
                }`}
              >
                <span className="text-2xl leading-none">{selectedNumber}</span>
                <span className="text-[9px] uppercase mt-0.5">
                  {selectedNatalCount === 0 ? 'Missing' : `${selectedNatalCount}x Natal`}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-lg sm:text-xl font-black text-amber-100">
                    Number {selectedNumber} — {selectedRemedyData.planet} ({selectedRemedyData.sanskrit})
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      selectedNatalCount === 0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : selectedNatalCount === 1
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                        : selectedNatalCount === 2
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                        : 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                    }`}
                  >
                    {selectedNatalCount === 0
                      ? 'Missing Number (Karmic Remedy Required)'
                      : selectedNatalCount === 1
                      ? 'Balanced Single Placement (1x)'
                      : selectedNatalCount === 2
                      ? 'Strong Double Placement (2x)'
                      : `Amplified Placement (${selectedNatalCount}x)`}
                  </span>
                </div>
                <p className="text-xs text-amber-300/80 mt-1">
                  Deity: <strong>{selectedRemedyData.deity}</strong> • Vastu Zone:{' '}
                  <strong>{selectedRemedyData.direction}</strong> • Chakra:{' '}
                  <strong>{selectedRemedyData.chakra}</strong>
                </p>
              </div>
            </div>

            {selectedNatalCount === 0 && (
              <button
                type="button"
                onClick={() => toggleSimulatedRemedy(selectedNumber)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isRemedySimulated
                    ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-lg'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isRemedySimulated
                    ? `Remedy #${selectedNumber} Active in Grid`
                    : `Test #${selectedNumber} Remedy in Grid`}
                </span>
              </button>
            )}
          </div>

          {/* Birth Placement Breakdown & Diagnostic Reading */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/25 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Birth Chart Placement Analysis for {clientName || 'Client'} (Number {selectedNumber})
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-amber-500/30 text-amber-200">
                  DOB Digits: {placementBreakdown.dobCount[selectedNumber] || 0}x
                </span>
                {mulank === selectedNumber && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400 text-amber-200 font-bold">
                    +1 Mulank (Driver)
                  </span>
                )}
                {bhagyank === selectedNumber && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-bold">
                    +1 Bhagyank (Destiny)
                  </span>
                )}
                {selectedActiveCount > selectedNatalCount && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400 text-sky-200 font-bold">
                    +1 Simulated Remedy
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {selectedNatalCount === 0
                ? selectedRemedyData.missingImpact
                : selectedNatalCount === 1
                ? selectedRemedyData.weakSingleImpact
                : selectedNatalCount === 2
                ? selectedRemedyData.strongDoubleImpact
                : selectedRemedyData.excessTripleImpact}
            </p>
          </div>

          {/* 4-PILLAR VEDIC PLANETARY REMEDIES FOR SELECTED NUMBER */}
          <div className="space-y-2.5">
            <h4 className="font-serif text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>
                Corresponding Vedic Planetary Remedies for Number {selectedNumber} ({selectedRemedyData.planet})
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Pillar 1: Sacred Rudraksha, Gemstone & Crystal */}
              <div className="p-4 rounded-2xl bg-slate-900/85 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Gem className="w-3.5 h-3.5 text-amber-400" />
                    <span>1. Rudraksha, Gemstone & Crystal</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/90">
                    {selectedPlanetInfo?.metal}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedRemedyData.rudrakshaAndCrystal}
                </p>
                <div className="pt-1 text-[10px] text-amber-300/80 font-mono">
                  Primary Ratna: {selectedPlanetInfo?.gemstone} • Colors: {selectedPlanetInfo?.luckyColor}
                </div>
              </div>

              {/* Pillar 2: Vastu & Directional Activation */}
              <div className="p-4 rounded-2xl bg-slate-900/85 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Vastu & Directional Remedy</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400/90">
                    {selectedRemedyData.element.split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedRemedyData.vastuRemedy}
                </p>
                <div className="pt-1 text-[10px] text-emerald-300/80 font-mono">
                  Zone: {selectedRemedyData.direction}
                </div>
              </div>

              {/* Pillar 3: Tantric / Vedic Beej Mantra */}
              <div className="p-4 rounded-2xl bg-slate-900/85 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>3. Vedic Beej Mantra Sadhana</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/90">108 Beads</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-amber-500/30 font-serif text-xs font-bold text-amber-200">
                  “{selectedRemedyData.beejMantra}”
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedRemedyData.mantraProtocol}
                </p>
              </div>

              {/* Pillar 4: Daily Karmic Ritual & Daan (Charity) */}
              <div className="p-4 rounded-2xl bg-slate-900/85 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                    <span>4. Daily Karmic Ritual & Daan</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400/90">
                    {selectedPlanetInfo?.luckyDays[0]}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedRemedyData.dailyKarmaAndDaan}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Active Chart Yogas, 8 Sacred Planes of Expression & Missing Plane Remedies */}
      <div className="pt-3 border-t border-amber-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-amber-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>
                Active Chart Yogas & 8 Sacred Lo Shu Planes (Click Any Plane to Highlight in 3×3 Grid)
              </span>
            </h3>
            <p className="text-xs text-amber-300/75">
              Shows completed Raj Yogas (100%) and partial/missing planes with the exact missing numbers required to complete each axis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LO_SHU_PLANES_LIST.map((plane) => {
            const presentInPlane = plane.numbers.filter((n) => (activeGridCounts[n] || 0) > 0);
            const missingInPlane = plane.numbers.filter((n) => (activeGridCounts[n] || 0) === 0);
            const percent = Math.round((presentInPlane.length / 3) * 100);
            const isComplete = presentInPlane.length === 3;
            const isPlaneSelected = selectedPlaneId === plane.id;

            return (
              <div
                key={plane.id}
                onClick={() => {
                  setSelectedPlaneId(isPlaneSelected ? null : plane.id);
                  if (missingInPlane.length > 0) {
                    setSelectedNumber(missingInPlane[0]);
                  } else {
                    setSelectedNumber(plane.numbers[0]);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  isPlaneSelected
                    ? 'bg-amber-500/20 border-2 border-amber-300 shadow-lg'
                    : isComplete
                    ? 'bg-emerald-950/35 border-emerald-500/45 hover:border-emerald-400'
                    : 'bg-slate-950/90 border-amber-500/20 hover:border-amber-500/45'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {plane.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                        isComplete
                          ? 'bg-emerald-500 text-slate-950'
                          : presentInPlane.length === 2
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isComplete ? '★ 100% ACTIVE' : `${percent}% (${presentInPlane.length}/3)`}
                    </span>
                  </div>

                  <h4 className="font-serif text-xs sm:text-sm font-bold text-amber-100">
                    {plane.name}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-snug">{plane.meaning}</p>
                </div>

                {/* Number pills inside plane */}
                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {plane.numbers.map((num) => {
                      const hasNum = (activeGridCounts[num] || 0) > 0;
                      return (
                        <span
                          key={num}
                          className={`w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center border ${
                            hasNum
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          {num}
                        </span>
                      );
                    })}
                  </div>

                  {missingInPlane.length > 0 ? (
                    <span className="text-[10px] font-mono text-rose-300 font-semibold">
                      Remedy #{missingInPlane.join(', #')} →
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary of All Missing Numbers & 1-Line Actionable Vedic Prescriptions */}
        {missingNatalNumbers.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-rose-500/35 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <h4 className="font-serif text-sm sm:text-base font-bold text-amber-100">
                  Complete Summary of Missing Lo Shu Numbers ({missingNatalNumbers.map((n) => `#${n}`).join(', ')}) — Click Any Row to Open Full Remedy
                </h4>
              </div>
              <span className="text-[11px] font-mono text-rose-300">
                {missingNatalNumbers.length} Missing Karmic Energies Identified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {missingNatalNumbers.map((mNum) => {
                const rem = LO_SHU_VEDIC_REMEDIES_DB[mNum];
                const isSelected = selectedNumber === mNum;
                return (
                  <div
                    key={mNum}
                    onClick={() => setSelectedNumber(mNum)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-md'
                        : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-rose-300">
                        Missing #{mNum} • {rem.planet}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300">
                        {rem.direction.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      <strong className="text-emerald-300">Remedy:</strong> {rem.rudrakshaAndCrystal}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
