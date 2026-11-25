import {
  BirthProfile,
  PlanetaryInfo,
  CompoundNumberData,
  NameAnalysis,
  NameCorrection,
  MobileAnalysis,
  UniversalValidationResult,
  ChoghadiyaPeriod,
  CompatibilityAnalysis,
  PlanetaryTransit,
  MoonPhase,
} from '../types';
import {
  VEDIC_RASHIS,
  calculateVedicAstrologyFromBirth,
  calculatePartnerChakraChallenges,
  computeSiderealSunMoonAtDayJ2000,
  formatExactIstDateTime,
  solveElongationCrossingUtcMs,
  solveSiderealSunIngressUtcMs,
} from './astrologyAndCities';

// Chaldean letter vibration mapping (1 to 8; 9 is sacred and excluded in letter sound vibration)
export const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Pythagorean letter mapping (1 to 9) for cross-referencing
export const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

// The 9 Vedic Celestial Archetypes (Navagrahas)
export const PLANETARY_PROFILES: Record<number, PlanetaryInfo> = {
  1: {
    number: 1,
    planet: 'Sun',
    sanskritName: 'Surya',
    deity: 'Lord Shiva / Gayatri',
    element: 'Fire',
    quality: 'Radiant Leadership & Executive Power',
    gemstone: 'Ruby (Manikya)',
    metal: 'Copper / Gold',
    luckyColor: 'Ruby Red, Golden Amber, Deep Orange',
    luckyDays: ['Sunday', 'Monday', 'Thursday'],
    beejMantra: 'Om Hram Hreem Hroum Sah Suryaya Namah',
    soundFrequencyHz: '126.22 Hz (Solar Prana) & 528 Hz (Solfeggio Vitality)',
    soundTherapyProtocol: 'Listen to 126.22 Hz Solar Singing Bowl & 528 Hz Solfeggio chimes for 11 mins at Sunrise facing East.',
    friendlyNumbers: [1, 2, 3, 5, 9],
    neutralNumbers: [4, 7],
    enemyNumbers: [8, 6],
    traits: ['Independent', 'Authoritative', 'Noble', 'Pioneering', 'Dignified'],
  },
  2: {
    number: 2,
    planet: 'Moon',
    sanskritName: 'Chandra',
    deity: 'Goddess Parvati / Lord Shiva',
    element: 'Water',
    quality: 'Intuitive Empathy & Imaginative Depth',
    gemstone: 'Natural Pearl (Moti)',
    metal: 'Silver',
    luckyColor: 'Pristine White, Cream, Silver, Pale Green',
    luckyDays: ['Monday', 'Sunday', 'Friday'],
    beejMantra: 'Om Shram Shreem Shroum Sah Chandraya Namah',
    soundFrequencyHz: '210.42 Hz (Synodic Moon) & 639 Hz (Emotional Peace)',
    soundTherapyProtocol: 'Listen to 210.42 Hz Lunar Crystal Bowl & 639 Hz Bansuri flute resonance for 15 mins before sleep.',
    friendlyNumbers: [1, 2, 5],
    neutralNumbers: [3, 7, 9],
    enemyNumbers: [8, 4],
    traits: ['Sensitive', 'Diplomatic', 'Creative', 'Nuturing', 'Receptive'],
  },
  3: {
    number: 3,
    planet: 'Jupiter',
    sanskritName: 'Guru / Brihaspati',
    deity: 'Lord Brahma / Brihaspati / Lord Vishnu',
    element: 'Ether',
    quality: 'Wisdom, Expansive Fortune & Divine Counsel',
    gemstone: 'Yellow Sapphire (Pukhraj)',
    metal: 'Gold / Brass',
    luckyColor: 'Bright Yellow, Saffron, Golden Ochre',
    luckyDays: ['Thursday', 'Tuesday', 'Sunday'],
    beejMantra: 'Om Gram Greem Groum Sah Gurave Namah',
    soundFrequencyHz: '183.58 Hz (Jupiterian Grace) & 432 Hz / 852 Hz (Wisdom)',
    soundTherapyProtocol: 'Listen to 183.58 Hz Temple Ghanta Bell & 432 Hz Vedic Santoor resonance for 15 mins on Thursday mornings.',
    friendlyNumbers: [1, 2, 3, 9],
    neutralNumbers: [5, 7],
    enemyNumbers: [6, 4, 8],
    traits: ['Philosophical', 'Generous', 'Optimistic', 'Scholarly', 'Benevolent'],
  },
  4: {
    number: 4,
    planet: 'Rahu (North Node)',
    sanskritName: 'Rahu',
    deity: 'Lord Bhairava / Goddess Durga',
    element: 'Air',
    quality: 'Revolutionary Breakthroughs & Unconventional Vision',
    gemstone: 'Hessonite Garnet (Gomed)',
    metal: 'Alloy / Mixed metals',
    luckyColor: 'Electric Blue, Smoky Grey, Metallic Bronze',
    luckyDays: ['Saturday', 'Sunday', 'Monday'],
    beejMantra: 'Om Bhram Bhreem Bhroum Sah Rahave Namah',
    soundFrequencyHz: '207.36 Hz (Nodal Grounding) & 396 Hz / 741 Hz (Aura Detox)',
    soundTherapyProtocol: 'Listen to 396 Hz & 741 Hz Solfeggio Aura Detox frequencies for 12 mins at Sunset to clear Rahu mental fog.',
    friendlyNumbers: [5, 6, 7, 8],
    neutralNumbers: [1],
    enemyNumbers: [2, 9, 8],
    traits: ['Futuristic', 'Disruptive', 'Resilient', 'Strategic', 'Analytic'],
  },
  5: {
    number: 5,
    planet: 'Mercury',
    sanskritName: 'Budha',
    deity: 'Lord Vishnu / Lord Ganesha',
    element: 'Earth',
    quality: 'Eloquence, Commercial Brilliance & Speed of Thought',
    gemstone: 'Emerald (Panna)',
    metal: 'Bronze / Brass',
    luckyColor: 'Emerald Green, Mint, Jade, Turquoise',
    luckyDays: ['Wednesday', 'Friday', 'Thursday'],
    beejMantra: 'Om Bram Breem Broum Sah Budhaya Namah',
    soundFrequencyHz: '141.27 Hz (Mercurial Intellect) & 741 Hz (Throat Expression)',
    soundTherapyProtocol: 'Listen to 141.27 Hz Mercury Chimes & 741 Hz Veena acoustics for 11 mins before business calls or study.',
    friendlyNumbers: [1, 2, 3, 5, 6],
    neutralNumbers: [7, 8, 9],
    enemyNumbers: [], // Mercury is universal diplomat
    traits: ['Adaptable', 'Articulate', 'Commercial', 'Witty', 'Speedy'],
  },
  6: {
    number: 6,
    planet: 'Venus',
    sanskritName: 'Shukra',
    deity: 'Goddess Mahalakshmi',
    element: 'Water',
    quality: 'Aesthetic Elegance, Luxuries & Cosmic Harmony',
    gemstone: 'Diamond / White Zircon (Heera)',
    metal: 'Silver / Platinum',
    luckyColor: 'Diamond White, Rose Pink, Pastel Blue, Silver',
    luckyDays: ['Friday', 'Wednesday', 'Saturday'],
    beejMantra: 'Om Dram Dreem Droum Sah Shukraya Namah',
    soundFrequencyHz: '221.23 Hz (Venusian Magnetism) & 639 Hz (Heart & Luxury)',
    soundTherapyProtocol: 'Listen to 221.23 Hz Rose Quartz Bowl & 639 Hz Heart-Chakra Sitar resonance for 15 mins on Friday evenings.',
    friendlyNumbers: [5, 6, 8],
    neutralNumbers: [4, 7],
    enemyNumbers: [1, 2, 3],
    traits: ['Charming', 'Luxurious', 'Artistic', 'Harmonious', 'Magnetic'],
  },
  7: {
    number: 7,
    planet: 'Ketu (South Node)',
    sanskritName: 'Ketu',
    deity: 'Lord Ganesha / Matsya Avatar',
    element: 'Water',
    quality: 'Spiritual Clairvoyance, Deep Research & Mysticism',
    gemstone: "Cat's Eye (Vaidurya)",
    metal: 'Silver / White metals',
    luckyColor: 'Smoky Grey, Sea Green, Light Yellow, White',
    luckyDays: ['Tuesday', 'Thursday', 'Sunday'],
    beejMantra: 'Om Sram Sreem Sroum Sah Ketave Namah',
    soundFrequencyHz: '136.10 Hz (Sacred Om Year) & 852 Hz / 963 Hz (Crown Awakening)',
    soundTherapyProtocol: 'Listen to 136.10 Hz Om Tuning Fork & 852 Hz / 963 Hz Pineal Third-Eye meditation tones for 15 mins in silence.',
    friendlyNumbers: [1, 3, 5, 6],
    neutralNumbers: [2, 7],
    enemyNumbers: [8, 9],
    traits: ['Intuitive', 'Mystical', 'Analytical', 'Introverted', 'Philosophic'],
  },
  8: {
    number: 8,
    planet: 'Saturn',
    sanskritName: 'Shani Dev',
    deity: 'Lord Hanuman / Lord Shani',
    element: 'Air',
    quality: 'Karmic Discipline, Endurance & Monumental Foundations',
    gemstone: 'Blue Sapphire (Neelam) / Amethyst',
    metal: 'Iron / Dark Steel',
    luckyColor: 'Deep Navy Blue, Charcoal, Royal Purple, Black',
    luckyDays: ['Saturday', 'Friday', 'Wednesday'],
    beejMantra: 'Om Pram Preem Proum Sah Shanaischaraya Namah',
    soundFrequencyHz: '147.85 Hz (Saturnian Grounding) & 174 Hz / 396 Hz (Root Shield)',
    soundTherapyProtocol: 'Listen to 147.85 Hz Deep Himalayan Bowl & 174 Hz / 396 Hz Root Grounding frequencies for 15 mins on Saturdays.',
    friendlyNumbers: [3, 5, 6, 7],
    neutralNumbers: [4],
    enemyNumbers: [1, 2, 8, 9],
    traits: ['Disciplined', 'Tenacious', 'Patient', 'Karmic Judge', 'Builder'],
  },
  9: {
    number: 9,
    planet: 'Mars',
    sanskritName: 'Mangal / Angaraka',
    deity: 'Lord Kartikeya / Lord Hanuman',
    element: 'Fire',
    quality: 'Warrior Valour, Executive Vitality & Universal Vision',
    gemstone: 'Red Coral (Moonga)',
    metal: 'Copper',
    luckyColor: 'Crimson Red, Scarlet, Coral, Maroon',
    luckyDays: ['Tuesday', 'Sunday', 'Thursday'],
    beejMantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah',
    soundFrequencyHz: '144.72 Hz (Martian Courage) & 285 Hz / 528 Hz (Vitality Shield)',
    soundTherapyProtocol: 'Listen to 144.72 Hz Shankha Conch & 285 Hz / 528 Hz Cellular Vitality frequencies for 11 mins on Tuesday mornings.',
    friendlyNumbers: [1, 2, 3, 5],
    neutralNumbers: [7],
    enemyNumbers: [4, 8, 2],
    traits: ['Courageous', 'Pioneering', 'Passionate', 'Dynamic', 'Protector'],
  },
};

// Comprehensive Compound Numbers Library (Cheiro & Vedic Tradition)
export const COMPOUND_NUMBERS_DATABASE: Record<number, CompoundNumberData> = {
  10: {
    number: 10,
    title: 'The Wheel of Fortune',
    description: 'A symbol of rise and honor. Plans are realized successfully through self-confidence and radiant focus.',
    type: 'fortunate',
    lifeOutcome: 'Honor, rising fortunes, respected leadership, overcoming setbacks with self-confidence.',
  },
  11: {
    number: 11,
    title: 'The Clenched Hand',
    description: 'A master vibration carrying intense spiritual intuition, yet accompanied by hidden trials, secret adversaries, and moral tests.',
    type: 'challenging',
    lifeOutcome: 'High psychic sensitivity, potential betrayal if misplaced trust is given. Requires spiritual grounding.',
    remedy: 'Practice clarity in agreements and avoid secretive partnerships.',
  },
  12: {
    number: 12,
    title: 'The Sacrifice / Martyrdom',
    description: 'Indicates the victim of circumstances, suffering for others, or being taken advantage of despite noble motives.',
    type: 'challenging',
    lifeOutcome: 'Anxiety from unappreciated sacrifices, delays in worldly rewards, emotional depletion.',
    remedy: 'Strengthen boundaries and avoid people who exploit generosity.',
  },
  13: {
    number: 13,
    title: 'The Phoenix / Regeneration',
    description: 'Sudden upheaval followed by total rebirth. Unpredictable power that must be handled with utmost integrity.',
    type: 'auspicious',
    lifeOutcome: 'Destruction of outmoded structures, dramatic rise after drastic transformation.',
  },
  14: {
    number: 14,
    title: 'The Magnetic Movement',
    description: 'Combines the leadership of 1 with the stability of 4, producing Mercurial 5. Excellent for commerce, financial gains, and navigation.',
    type: 'fortunate',
    lifeOutcome: 'High business acumen, successful speculation when disciplined, international communication.',
  },
  15: {
    number: 15,
    title: 'The Magician of Charisma',
    description: 'Tremendous personal magnetism, artistic eloquence, and wealth through speech, beauty, and public appeal.',
    type: 'fortunate',
    lifeOutcome: 'Prosperity, artistic fame, luxury attraction, persuasive vocal power.',
  },
  16: {
    number: 16,
    title: 'The Shattered Citadel (STRICTLY AVOID)',
    description: 'The Tower struck by lightning. Sudden catastrophe, catastrophic downfalls of ego, lawsuits, accidents, or devastating betrayals.',
    type: 'malefic',
    lifeOutcome: 'Unstable achievements that crumble suddenly. High vulnerability in marriage and financial investments.',
    remedy: 'Immediate name or mobile correction to 19, 21, 23, 24, 32, or 37 is universally advised.',
  },
  17: {
    number: 17,
    title: 'The Star of the Magi',
    description: 'The celestial Star of Immortality. The bearer rises above worldly trials and achieves lasting reputation and spiritual elevation.',
    type: 'fortunate',
    lifeOutcome: 'Immortal name, triumph over adversity, intellectual distinction, peace of mind.',
  },
  18: {
    number: 18,
    title: 'The Spiritual vs Material Conflict (STRICTLY AVOID)',
    description: 'Bitterness, deception from closest allies, family feuds, hidden conspiracies, and danger from fires, water, or legal entanglements.',
    type: 'malefic',
    lifeOutcome: 'Inner turmoil, conflict with business partners, unexpected disillusionment in relationships.',
    remedy: 'Must not be used in personal names or mobile numbers. Rebalance toward 19, 23, or 27.',
  },
  19: {
    number: 19,
    title: 'The Prince of Heaven (SUPREMELY FORTUNATE)',
    description: 'One of the most auspicious compounds in existence. Holds the pure radiant energy of the Sun. Promises triumph, fulfillment, and happiness.',
    type: 'fortunate',
    lifeOutcome: 'Universal respect, flourishing health, joyous domestic life, and steady accumulation of wealth.',
  },
  20: {
    number: 20,
    title: 'The Awakening / The Call',
    description: 'Awakening of new spiritual faculties, high purpose, yet calls for patient detachment from hasty material demands.',
    type: 'auspicious',
    lifeOutcome: 'Spiritual maturity, new callings, artistic renewal, delayed financial windfalls.',
  },
  21: {
    number: 21,
    title: 'The Crown of the Magi (SUPREMELY FORTUNATE)',
    description: 'The highest vibration of success, advancement, and honors. Victory after prolonged effort. The master achiever.',
    type: 'fortunate',
    lifeOutcome: 'Supreme victory in exams, public recognition, monumental milestones, international prominence.',
  },
  22: {
    number: 22,
    title: 'The Blindfold of Illusion',
    description: 'A pure heart living in a world of illusion, susceptible to false friends and misjudgments in business.',
    type: 'challenging',
    lifeOutcome: 'Generosity exploited by unscrupulous people. Warns against blind faith in business associates.',
    remedy: 'Exercise legal scrutiny and never sign documents under emotional pressure.',
  },
  23: {
    number: 23,
    title: 'The Royal Star of the Lion (SUPREMELY FORTUNATE)',
    description: 'A royal vibration carrying divine protection. Guarantees success, assistance from influential figures, and triumph over opponents.',
    type: 'fortunate',
    lifeOutcome: 'Protection from harm, favor of dignitaries, rapid business expansion, high social prestige.',
  },
  24: {
    number: 24,
    title: 'The Fortunate Alliance (HIGHLY FORTUNATE)',
    description: 'Governed by Venus (6). Brings unshakeable harmony, affectionate friendships, lucrative partnerships, and peaceful home life.',
    type: 'fortunate',
    lifeOutcome: 'Marital bliss, stable financial growth, supportive companions, harmonious social status.',
  },
  25: {
    number: 25,
    title: 'Wisdom Through Trials',
    description: 'Strength gained through early adversity and patient observation. Ultimate success through intellectual discernment.',
    type: 'auspicious',
    lifeOutcome: 'Late-blooming victory, scholarly reputation, profound analytical ability.',
  },
  26: {
    number: 26,
    title: 'The Karmic Burden (STRICTLY AVOID)',
    description: 'Heavy karmic debts, severe disappointments through partnerships, property disputes, and financial collapses.',
    type: 'malefic',
    lifeOutcome: 'Bad investments, betrayal by associates, endless responsibilities draining physical vitality.',
    remedy: 'Change spelling or mobile sequence immediately to an auspicious compound like 27, 32, or 37.',
  },
  27: {
    number: 27,
    title: 'The Sceptre of Authority (HIGHLY FORTUNATE)',
    description: 'Sign of creative intellect and commanding authority. Brings rewards for mental endeavors, literature, science, or public leadership.',
    type: 'fortunate',
    lifeOutcome: 'Intellectual dominance, high office, literary fame, strategic victory over rivals.',
  },
  28: {
    number: 28,
    title: 'The Trusting Lamb (STRICTLY AVOID)',
    description: 'Great promise cut short by placing blind trust in untrustworthy associates. Legal losses and business reversals.',
    type: 'malefic',
    lifeOutcome: 'Severe financial losses through trusting others, court litigations, starting over repeatedly.',
    remedy: 'Correct name spelling or phone total away from 28 to 32 or 33.',
  },
  29: {
    number: 29,
    title: 'The Wavering Tide (STRICTLY AVOID)',
    description: 'Emotional uncertainty, deception from unexpected quarters, domestic discord, and extreme mood fluctuations.',
    type: 'malefic',
    lifeOutcome: 'Rocky relationships, hidden tears, unreliable alliances, chronic second-guessing.',
    remedy: 'Alleviate by vibrating on 32, 33, or 37.',
  },
  30: {
    number: 30,
    title: 'The Intellectual Supremacy',
    description: 'Mental brilliance, philosophical depth, and scholarly influence. Material riches are secondary to intellectual legacy.',
    type: 'auspicious',
    lifeOutcome: 'Acclaimed research, teaching, writing, spiritual discernment, comfortable living.',
  },
  31: {
    number: 31,
    title: 'The Solitary Thinker',
    description: 'Deeply introspective and eccentric. Often feels isolated or misunderstood by society despite exceptional intellect.',
    type: 'challenging',
    lifeOutcome: 'Solitude, unconventional career paths, unpredictable finances, selective friendships.',
  },
  32: {
    number: 32,
    title: 'Magnetic Communication (SUPREMELY FORTUNATE)',
    description: 'Magnetic oratory, international travel, mass popularity, and quick wits. The individual thrives in media, business, and diplomacy.',
    type: 'fortunate',
    lifeOutcome: 'Rapid social ascension, wealth through communication and trade, charismatic appeal.',
  },
  33: {
    number: 33,
    title: 'The Master Healer / Divine Love',
    description: 'Supreme master vibration of selfless service, universal empathy, artistic inspiration, and spiritual authority.',
    type: 'fortunate',
    lifeOutcome: 'Spiritual reverence, healing gifts, magnetic public respect, boundless creative expression.',
  },
  34: {
    number: 34,
    title: 'Prudent Enterprise',
    description: 'Methodical hard work yields secure material gains. Good for architecture, administration, and engineering.',
    type: 'auspicious',
    lifeOutcome: 'Steady compounding wealth, structural reliability, respected professional status.',
  },
  35: {
    number: 35,
    title: 'The Fortunate Inheritor',
    description: 'Gains through partnerships, legacy, and diversified trade. Needs caution against impulsive speculative gambles.',
    type: 'auspicious',
    lifeOutcome: 'Inherited fortune, multi-source income, balanced worldly lifestyle.',
  },
  36: {
    number: 36,
    title: 'The Commander of Will',
    description: 'Forceful energy, executive power, and victory over adversaries through sheer grit and strategic courage.',
    type: 'auspicious',
    lifeOutcome: 'Leadership in high-stakes fields, military/executive glory, strong physical vitality.',
  },
  37: {
    number: 37,
    title: 'The Crown of Harmony (SUPREMELY FORTUNATE)',
    description: 'Splendid love life, harmonious friendships, happy domestic sphere, and extraordinary fortune in financial partnerships.',
    type: 'fortunate',
    lifeOutcome: 'Deep romantic fulfillment, magnetic popularity, auspicious business ventures, enduring joy.',
  },
  38: {
    number: 38,
    title: 'The False Comrades',
    description: 'Indicates disputes and friction caused by insincere friends or deceptive romantic liaisons.',
    type: 'challenging',
    lifeOutcome: 'Social misunderstandings, emotional betrayals, need for severe discernment in associates.',
  },
  39: {
    number: 39,
    title: 'The Resilient Reformer',
    description: 'Fierce intellect that fights for truth. Often clashes with conservative orthodoxy before winning ultimate recognition.',
    type: 'auspicious',
    lifeOutcome: 'Reformative legacy, public admiration, robust mental fortitude.',
  },
  40: {
    number: 40,
    title: 'The Silent Threshold',
    description: 'Solitary contemplation, withdrawal from mundane vanity, deep scientific or occult breakthroughs.',
    type: 'challenging',
    lifeOutcome: 'Material indifference, periodic periods of silence or isolation, ascetic inclinations.',
  },
  41: {
    number: 41,
    title: 'The Royal Star of Abundance (HIGHLY FORTUNATE)',
    description: 'Leadership, commercial mastery, and radiant good fortune. Brings both financial power and spiritual dignity.',
    type: 'fortunate',
    lifeOutcome: 'Large-scale enterprise success, respected mentorship, abundance in family and commerce.',
  },
  42: {
    number: 42,
    title: 'The Healer of Hearts (HIGHLY FORTUNATE)',
    description: 'Venusian sweetness, hospitality, artistic talent, and magnetic healing presence. Extremely favorable for domestic joy.',
    type: 'fortunate',
    lifeOutcome: 'Peaceful home, flourishing creative career, loving relationships, social adulation.',
  },
  43: {
    number: 43,
    title: 'The Disrupted Citadel (AVOID)',
    description: 'Symbol of friction, sudden disputes, failure of plans due to unexpected conflicts, and volatile fortune.',
    type: 'malefic',
    lifeOutcome: 'Litigation, sudden professional derailments, volatile temperaments in surroundings.',
    remedy: 'Shift vibration to 45, 46, or 51.',
  },
  44: {
    number: 44,
    title: 'Double Rahu - Extreme Volatility (AVOID)',
    description: 'Uncontrollable ups and downs, sudden losses, legal struggles, and erratic career trajectory.',
    type: 'malefic',
    lifeOutcome: 'High anxiety, abrupt falls from high positions, emotional exhaustion.',
    remedy: 'Correct spelling to 45, 46, or 50.',
  },
  45: {
    number: 45,
    title: 'Triumph Over Adversaries (HIGHLY FORTUNATE)',
    description: 'Mars and Mercury fusion producing supreme intellect, strategic invincibility, and triumphant business campaigns.',
    type: 'fortunate',
    lifeOutcome: 'Defeat of rivals, flourishing trade, sharp decision-making, wide administrative influence.',
  },
  46: {
    number: 46,
    title: 'Venusian Opulence & Distinction (FORTUNATE)',
    description: 'Brings wealth, luxury vehicles, media stardom, fine arts accolades, and affectionate companions.',
    type: 'fortunate',
    lifeOutcome: 'Affluent lifestyle, artistic recognition, pleasant social environment, harmonious partnerships.',
  },
  47: {
    number: 47,
    title: 'The Deep Intuition',
    description: 'Spiritual research, occult wisdom, sudden insights, and quiet contentment.',
    type: 'auspicious',
    lifeOutcome: 'Invaluable consulting abilities, mystical perceptions, peaceful lifestyle.',
  },
  48: {
    number: 48,
    title: 'The Struggle of Saturn & Rahu (AVOID)',
    description: 'Heavy delays, roadblocks at the eleventh hour, family misunderstandings, and physical fatigue.',
    type: 'malefic',
    lifeOutcome: 'Frustrated ambitions, endless hurdles in business, delayed payments.',
    remedy: 'Rectify total to 50, 51, or 59.',
  },
  50: {
    number: 50,
    title: 'The Radiant Intellectual',
    description: 'Luminous communication, sharp wit, international travel, and liberation from ancestral bondages.',
    type: 'fortunate',
    lifeOutcome: 'Successful publishing, widespread networking, intellectual freedom, versatile wealth.',
  },
  51: {
    number: 51,
    title: 'The Warrior of Light (SUPREMELY FORTUNATE)',
    description: 'Great warrior vibration. Invincible courage, visionary leadership, rapid rise in politics, military, or global enterprise.',
    type: 'fortunate',
    lifeOutcome: 'Magnificent achievements, triumphant conquests, high state honors, fearless authority.',
  },
  52: {
    number: 52,
    title: 'The Emotional Crossroad',
    description: 'Emotional vulnerability, shifting alliances, and need for steadfast discipline.',
    type: 'challenging',
    lifeOutcome: 'Fluctuating wealth, unpredictable moods, requires consistent spiritual focus.',
  },
  59: {
    number: 59,
    title: 'The Universal Benefactor (HIGHLY FORTUNATE)',
    description: 'High administrative rank, financial acumen, philanthropy, and lasting global respect.',
    type: 'fortunate',
    lifeOutcome: 'Enormous wealth, prestigious title, beloved by the masses.',
  },
  60: {
    number: 60,
    title: 'The Diamond Harmony',
    description: 'Peace, marital bliss, artistic mastery, and gracious hospitality.',
    type: 'fortunate',
    lifeOutcome: 'Generational comfort, cultural acclaim, harmonious surroundings.',
  },
};

// Fallback generator for unlisted compounds
export function getCompoundInfo(compound: number): CompoundNumberData {
  if (COMPOUND_NUMBERS_DATABASE[compound]) {
    return COMPOUND_NUMBERS_DATABASE[compound];
  }

  const single = reduceToSingleDigit(compound);
  const planet = PLANETARY_PROFILES[single]?.planet || 'Celestial Body';

  const isFav = [10, 14, 15, 17, 19, 21, 23, 24, 27, 32, 33, 37, 41, 42, 45, 46, 50, 51, 59, 60, 65, 68, 69, 73, 77].includes(compound);
  const isMal = [16, 18, 26, 28, 29, 43, 44, 48, 52, 62, 71].includes(compound);

  if (isFav) {
    return {
      number: compound,
      title: `Auspicious Compound of ${planet}`,
      description: `Vibration ${compound} reduces to single digit ${single} (${planet}). It promotes harmony, success, and positive life outcomes.`,
      type: 'fortunate',
      lifeOutcome: `Favorable results under ${planet}, expansion of opportunities, positive public resonance.`,
    };
  }

  if (isMal) {
    return {
      number: compound,
      title: `Challenging Compound (${compound})`,
      description: `Vibration ${compound} holds volatile planetary tensions that can bring unexpected obstacles or delays.`,
      type: 'malefic',
      lifeOutcome: 'Fluctuations and delays in fulfilling desires. Spelling or number correction advised.',
      remedy: 'Harmonize name or contact data to 19, 21, 23, 24, 32, 37, 41, or 51.',
    };
  }

  return {
    number: compound,
    title: `Cosmic Resonance ${compound} (${planet})`,
    description: `Compound ${compound} reduces to root ${single}, governed by ${planet}. Provides balanced worldly and intellectual fruits.`,
    type: 'auspicious',
    lifeOutcome: `Steady progress through perseverance and alignment with ${planet}'s cosmic qualities.`,
  };
}

// Reduce any number to single digit (1 to 9)
export function reduceToSingleDigit(num: number): number {
  if (num <= 0) return 0;
  let current = Math.abs(num);
  while (current > 9) {
    current = current
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return current;
}

// Calculate Mulank (Psychic / Root number from Day of Birth)
export function calculateMulank(dobString: string): number {
  if (!dobString) return 1;
  const parts = dobString.split('-');
  const day = parseInt(parts[2] || parts[0], 10);
  if (isNaN(day) || day < 1 || day > 31) return 1;
  return reduceToSingleDigit(day);
}

// Calculate Bhagyank (Destiny / Life Path number from full Date of Birth)
export function calculateBhagyank(dobString: string): number {
  if (!dobString) return 1;
  const digits = dobString.replace(/\D/g, '');
  if (!digits) return 1;
  const sum = digits.split('').reduce((acc, ch) => acc + parseInt(ch, 10), 0);
  return reduceToSingleDigit(sum);
}

// Check relationship between two single digits in Vedic astrology (Mitra / Sama / Shatru)
export function getPlanetaryRelationship(num1: number, num2: number): 'friendly' | 'neutral' | 'inimical' {
  const p1 = PLANETARY_PROFILES[num1];
  if (!p1) return 'neutral';
  if (p1.friendlyNumbers.includes(num2)) return 'friendly';
  if (p1.enemyNumbers.includes(num2)) return 'inimical';
  return 'neutral';
}

// Calculate Chaldean Name Analysis
export function analyzeName(fullName: string, mulank: number, bhagyank: number): NameAnalysis {
  const clean = (fullName || '').toUpperCase().trim();
  const words = clean.split(/\s+/).filter(Boolean);

  let totalCompound = 0;
  const letters: NameAnalysis['letters'] = [];

  for (const char of clean) {
    if (/[A-Z]/.test(char)) {
      const cVal = CHALDEAN_MAP[char] || 0;
      const pVal = PYTHAGOREAN_MAP[char] || 0;
      totalCompound += cVal;
      letters.push({
        char,
        chaldeanVal: cVal,
        pythagoreanVal: pVal,
      });
    } else if (char === ' ') {
      letters.push({
        char: ' ',
        chaldeanVal: 0,
        pythagoreanVal: 0,
      });
    }
  }

  // Calculate first name and last name sums
  let firstNameSum = 0;
  let lastNameSum = 0;
  if (words.length > 0) {
    firstNameSum = words[0]
      .split('')
      .reduce((acc, c) => acc + (CHALDEAN_MAP[c] || 0), 0);
  }
  if (words.length > 1) {
    lastNameSum = words[words.length - 1]
      .split('')
      .reduce((acc, c) => acc + (CHALDEAN_MAP[c] || 0), 0);
  }

  const chaldeanSingle = reduceToSingleDigit(totalCompound);
  const pythagoreanCompound = letters.reduce((acc, l) => acc + l.pythagoreanVal, 0);
  const pythagoreanSingle = reduceToSingleDigit(pythagoreanCompound);

  const compoundInfo = getCompoundInfo(totalCompound);

  const mulankRes = getPlanetaryRelationship(mulank, chaldeanSingle);
  const bhagyankRes = getPlanetaryRelationship(bhagyank, chaldeanSingle);

  // Harmony score calculation (0 - 100)
  let score = 50;
  if (compoundInfo.type === 'fortunate') score += 25;
  if (compoundInfo.type === 'auspicious') score += 15;
  if (compoundInfo.type === 'challenging') score -= 15;
  if (compoundInfo.type === 'malefic') score -= 35;

  if (mulankRes === 'friendly') score += 15;
  else if (mulankRes === 'inimical') score -= 20;

  if (bhagyankRes === 'friendly') score += 15;
  else if (bhagyankRes === 'inimical') score -= 20;

  // Bonus if namank directly matches Mulank or Bhagyank
  if (chaldeanSingle === mulank || chaldeanSingle === bhagyank) score += 5;

  score = Math.max(10, Math.min(100, score));
  const isAuspicious =
    score >= 70 &&
    compoundInfo.type !== 'malefic' &&
    compoundInfo.type !== 'challenging' &&
    mulankRes !== 'inimical' &&
    bhagyankRes !== 'inimical';

  let verdict = '';
  if (score >= 85) {
    verdict = 'Celestial Masterpiece: Name vibrates in total cosmic resonance with your Soul and Destiny.';
  } else if (score >= 70) {
    verdict = 'Auspicious Alignment: Favorable harmony with your birth vibrations.';
  } else if (score >= 50) {
    verdict = 'Moderate Harmony: Minor friction with planetary rulers. Name spelling correction recommended.';
  } else {
    verdict = 'Karmic Friction: Name compound contains challenging or malefic energy. Correction strongly advised.';
  }

  const recommendation = isAuspicious
    ? `Your current spelling (${clean}) vibrates at Compound ${totalCompound} (${compoundInfo.title}), which aligns harmoniously with Mulank ${mulank} and Bhagyank ${bhagyank}. Your name frequency is already perfect — no spelling change or suggestion is required.`
    : `Your current spelling (${clean}) vibrates at Compound ${totalCompound} (${compoundInfo.title}), creating planetary friction with Mulank ${mulank} / Bhagyank ${bhagyank}. Adopt one of the Royal Corrected Name Spellings (19, 21, 23, 24, 32, 37, 41, or 51) for business, social, and signature use.`;

  return {
    rawName: fullName,
    cleanName: clean,
    letters,
    firstNameSum,
    lastNameSum,
    totalChaldeanCompound: totalCompound,
    totalPythagoreanCompound: pythagoreanCompound,
    chaldeanSingle,
    pythagoreanSingle,
    compoundInfo,
    mulankResonance: mulankRes,
    bhagyankResonance: bhagyankRes,
    mulankRelation: mulankRes,
    bhagyankRelation: bhagyankRes,
    isAuspicious,
    harmonyScore: score,
    verdict,
    recommendation,
  };
}

// Generate Name Spelling Correction Suggestions based on Vedic & Chaldean Royal Compounds
export function generateNameCorrections(
  fullName: string,
  mulank: number,
  bhagyank: number
): NameCorrection[] {
  const currentAnalysis = analyzeName(fullName, mulank, bhagyank);
  // If the name frequency is already perfect/auspicious, return zero suggestions (only result is shown)
  if (currentAnalysis.isAuspicious) {
    return [];
  }
  const words = (fullName || '').toUpperCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const firstName = words[0];
  const restOfName = words.slice(1).join(' ');
  const restCompound = restOfName
    ? restOfName.split('').reduce((acc, c) => acc + (CHALDEAN_MAP[c] || 0), 0)
    : 0;

  // Target celeberated royal fortunate compounds in Chaldean tradition
  const idealCompounds = [19, 21, 23, 24, 27, 32, 33, 37, 41, 42, 45, 46, 50, 51];

  // Pick compounds that are friendly to Mulank AND Bhagyank
  const friendlyTargets = idealCompounds.filter((comp) => {
    const single = reduceToSingleDigit(comp);
    const relM = getPlanetaryRelationship(mulank, single);
    const relB = getPlanetaryRelationship(bhagyank, single);
    return relM !== 'inimical' && relB !== 'inimical';
  });

  const validTargets = friendlyTargets.length > 0 ? friendlyTargets : idealCompounds;
  const suggestions: NameCorrection[] = [];
  const seenNames = new Set<string>();

  // Helper to add suggestion
  const addCandidate = (newFirst: string, reason: string) => {
    const fullCandidate = restOfName ? `${newFirst} ${restOfName}` : newFirst;
    if (seenNames.has(fullCandidate) || fullCandidate === fullName.toUpperCase().trim()) return;
    seenNames.add(fullCandidate);

    const candAnalysis = analyzeName(fullCandidate, mulank, bhagyank);
    const compData = candAnalysis.compoundInfo;

    // Only accept fortunate or auspicious compounds
    if (compData.type === 'fortunate' || compData.type === 'auspicious') {
      const pInfo = PLANETARY_PROFILES[candAnalysis.chaldeanSingle];
      suggestions.push({
        originalName: fullName,
        suggestedName: fullCandidate,
        compoundNumber: candAnalysis.totalChaldeanCompound,
        singleDigit: candAnalysis.chaldeanSingle,
        compoundTitle: compData.title,
        changeExplanation: reason,
        harmonyScore: candAnalysis.harmonyScore,
        targetPlanet: pInfo?.planet || 'Divine',
        planetaryBlessing: pInfo?.quality || 'Cosmic harmony and fulfillment.',
      });
    }
  };

  // Strategy 1: Vowel elongation (common Vedic pronunciation harmony, e.g. adding 'A', 'E', 'I', 'O', 'U')
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  for (let i = 0; i < firstName.length; i++) {
    const ch = firstName[i];
    if (vowels.includes(ch)) {
      // Duplicate vowel
      const mod = firstName.slice(0, i + 1) + ch + firstName.slice(i + 1);
      const total = restCompound + mod.split('').reduce((acc, c) => acc + (CHALDEAN_MAP[c] || 0), 0);
      if (validTargets.includes(total)) {
        addCandidate(mod, `Elongating the spiritual vowel '${ch}' adds sacred sound resonance.`);
      }
    }
  }

  // Strategy 2: Adding 'A' (Chaldean 1 - Sun), 'H' (Chaldean 5 - Mercury), 'I' (1 - Sun), or 'R' (2 - Moon)
  const subtleLetters = ['A', 'H', 'I', 'R', 'K', 'S'];
  for (const letter of subtleLetters) {
    // Append at end of first name
    const modEnd = firstName + letter;
    const totalEnd = restCompound + modEnd.split('').reduce((acc, c) => acc + (CHALDEAN_MAP[c] || 0), 0);
    if (validTargets.includes(totalEnd)) {
      addCandidate(modEnd, `Harmonic suffix '${letter}' stabilizes the compound energy onto ${totalEnd}.`);
    }

    // Insert 'H' after consonants like 'D' -> 'DH', 'K' -> 'KH', 'S' -> 'SH'
    for (let i = 0; i < firstName.length; i++) {
      if (['D', 'T', 'K', 'G', 'B', 'P'].includes(firstName[i])) {
        const modH = firstName.slice(0, i + 1) + 'H' + firstName.slice(i + 1);
        const totalH = restCompound + modH.split('').reduce((acc, c) => acc + (CHALDEAN_MAP[c] || 0), 0);
        if (validTargets.includes(totalH)) {
          addCandidate(modH, `Softening with Vedic 'H' infuses Mercury's business intelligence.`);
        }
      }
    }
  }

  // Strategy 3: Double consonant (e.g., 'N' -> 'NN', 'M' -> 'MM', 'L' -> 'LL', 'S' -> 'SS')
  for (let i = 0; i < firstName.length; i++) {
    const ch = firstName[i];
    if (['N', 'M', 'L', 'S', 'R', 'T'].includes(ch)) {
      const mod = firstName.slice(0, i + 1) + ch + firstName.slice(i + 1);
      const total = restCompound + mod.split('').reduce((acc, c) => acc + (CHALDEAN_MAP[c] || 0), 0);
      if (validTargets.includes(total)) {
        addCandidate(mod, `Doubling consonant '${ch}' anchors the vibration firmly into royal compound ${total}.`);
      }
    }
  }

  // Strategy 4: Ensure at least 6 to 8 distinct auspicious name variations for any input name
  if (suggestions.length < 8) {
    // Try single-letter additions from sacred phonetic letters
    const phoneticPool = ['A', 'E', 'I', 'H', 'R', 'K', 'N', 'S', 'V', 'Y', 'M', 'T'];
    for (const target of validTargets) {
      const neededDiff = target - currentAnalysis.totalChaldeanCompound;
      if (neededDiff > 0 && neededDiff <= 8) {
        const matchingLetters = Object.keys(CHALDEAN_MAP).filter(
          (k) => CHALDEAN_MAP[k] === neededDiff
        );
        for (const matchLetter of matchingLetters) {
          addCandidate(
            firstName + matchLetter,
            `Infusing sacred syllable '${matchLetter}' (Chaldean ${neededDiff}) elevates the total onto Royal Compound ${target}.`
          );
          if (firstName.length >= 2) {
            const midMod =
              firstName.slice(0, 2) + matchLetter + firstName.slice(2);
            addCandidate(
              midMod,
              `Internal phonetic placement of '${matchLetter}' harmonizes the sound wave onto Compound ${target}.`
            );
          }
        }
      }
    }

    // Try 2-letter harmonic combinations (e.g. AA, AH, HA, II, RA, SH, NA) if still under 7 suggestions
    const twoLetterHarmony = ['AA', 'AH', 'HA', 'EE', 'IA', 'RA', 'NA', 'SA', 'KA', 'AN'];
    for (const pair of twoLetterHarmony) {
      if (suggestions.length >= 8) break;
      const mod = firstName + pair;
      const total =
        restCompound +
        mod.split('').reduce((acc, c) => acc + (CHALDEAN_MAP[c] || 0), 0);
      const single = reduceToSingleDigit(total);
      if (
        validTargets.includes(total) ||
        getPlanetaryRelationship(mulank, single) === 'friendly' ||
        single === mulank ||
        single === bhagyank
      ) {
        addCandidate(
          mod,
          `Phonetic suffix '${pair}' tunes the name frequency to ${PLANETARY_PROFILES[single]?.planet || 'auspicious'} resonance (Compound ${total}).`
        );
      }
    }

    // Try modifying or elongating surname if present and still under 6 suggestions
    if (suggestions.length < 6) {
      for (const ch of phoneticPool) {
        if (suggestions.length >= 8) break;
        const mod = firstName + ch;
        const fullCandidate = restOfName ? `${mod} ${restOfName}` : mod;
        if (!seenNames.has(fullCandidate)) {
          seenNames.add(fullCandidate);
          const candAnalysis = analyzeName(fullCandidate, mulank, bhagyank);
          const single = candAnalysis.chaldeanSingle;
          if (single !== 8 && single !== 4) {
            const pInfo = PLANETARY_PROFILES[single];
            suggestions.push({
              originalName: fullName,
              suggestedName: fullCandidate,
              compoundNumber: candAnalysis.totalChaldeanCompound,
              singleDigit: single,
              compoundTitle: candAnalysis.compoundInfo.title,
              changeExplanation: `Adding '${ch}' shifts the name root to ${single} (${pInfo?.planet}), harmonizing with your birth chart.`,
              harmonyScore: Math.max(76, candAnalysis.harmonyScore),
              targetPlanet: pInfo?.planet || 'Sun',
              planetaryBlessing: pInfo?.quality || 'Auspicious alignment and progress.',
            });
          }
        }
      }
    }
  }

  // Sort by highest harmony score and return 6 to 8 top options
  const sorted = suggestions.sort((a, b) => b.harmonyScore - a.harmonyScore).slice(0, 8);
  if (sorted.length > 0) {
    sorted[0].isTopPerfectChoice = true;
  }
  return sorted;
}

// Real-Time Mobile Number Vibration & Toxic Pairs Audit
export const TOXIC_MOBILE_PAIRS = [
  { pair: '28', name: 'Vish Yoga (Moon-Saturn)', meaning: 'Mental melancholy, emotional depression, chronic delays in projects.', severity: 'high' as const },
  { pair: '82', name: 'Inverted Vish Yoga', meaning: 'Emotional blockages, sudden sorrow or delays in receiving payments.', severity: 'high' as const },
  { pair: '48', name: 'Rahu-Saturn Toxic Pair', meaning: 'Severe legal hurdles, unexpected court cases, property disputes, and sudden losses.', severity: 'high' as const },
  { pair: '84', name: 'Saturn-Rahu Obstacle Axis', meaning: 'Extreme friction, roadblocks at final stages, chronic fatigue.', severity: 'high' as const },
  { pair: '18', name: 'Surya-Shani Conflict', meaning: 'Authority friction, ego clashes with superiors or father figure, stagnation in leadership.', severity: 'medium' as const },
  { pair: '81', name: 'Shani-Surya Resistance', meaning: 'Loss of reputation through abrupt pride or stubborn decisions.', severity: 'medium' as const },
  { pair: '44', name: 'Double Rahu Axis', meaning: 'Phantom illusions, chaotic lifestyle, volatile fluctuations in savings.', severity: 'medium' as const },
];

export function analyzeMobileNumber(mobile: string, mulank: number, bhagyank: number): MobileAnalysis {
  const cleanDigits = (mobile || '').replace(/\D/g, '');
  const digitsArr = cleanDigits.split('').map((d) => parseInt(d, 10));

  const digitSum = digitsArr.reduce((acc, d) => acc + d, 0);
  const compoundNumber = digitSum;
  const singleDigit = reduceToSingleDigit(digitSum);

  // Ending 2 and 3 digits
  const last2 = cleanDigits.slice(-2);
  const last3 = cleanDigits.slice(-3);
  const endingTwoDigits = parseInt(last2, 10) || 0;
  const endingThreeDigits = parseInt(last3, 10) || 0;

  // Toxic pair search
  const toxicPairsFound: MobileAnalysis['toxicPairsFound'] = [];
  for (const item of TOXIC_MOBILE_PAIRS) {
    let index = cleanDigits.indexOf(item.pair);
    const indices: number[] = [];
    while (index !== -1) {
      indices.push(index);
      index = cleanDigits.indexOf(item.pair, index + 1);
    }
    if (indices.length > 0) {
      toxicPairsFound.push({
        pair: item.pair,
        indices,
        meaning: item.meaning,
        severity: item.severity,
      });
    }
  }

  // Check ending zeros (draining void)
  const endsWithZero = cleanDigits.endsWith('0');

  // Frequency analysis
  const frequency: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const d of digitsArr) {
    frequency[d] = (frequency[d] || 0) + 1;
  }

  // Dominant number
  let dominantNumber: number | null = null;
  let maxCount = 0;
  for (let num = 1; num <= 9; num++) {
    if (frequency[num] > maxCount && frequency[num] >= 3) {
      maxCount = frequency[num];
      dominantNumber = num;
    }
  }

  // Crucial missing digits in mobile for harmony
  const missingCrucialNumbers: number[] = [];
  // 5 (Mercury) and 6 (Venus) are universally prosperous in business & modern communication
  if (frequency[5] === 0) missingCrucialNumbers.push(5);
  if (frequency[6] === 0) missingCrucialNumbers.push(6);
  if (frequency[1] === 0) missingCrucialNumbers.push(1);

  // Harmonic relationships with Mulank and Bhagyank
  const harmonyWithMulank = getPlanetaryRelationship(mulank, singleDigit);
  const harmonyWithBhagyank = getPlanetaryRelationship(bhagyank, singleDigit);

  // Ending vibration quality
  let endingQuality: MobileAnalysis['endingVibrationQuality'] = 'good';
  const favorableEndings = [19, 21, 23, 24, 27, 32, 33, 37, 41, 42, 45, 46, 51, 55, 66, 73, 99];
  const toxicEndings = [16, 18, 26, 28, 48, 82, 84, 40, 80, 0];

  if (toxicEndings.includes(endingTwoDigits) || endsWithZero) {
    endingQuality = 'poor';
  } else if (favorableEndings.includes(endingTwoDigits) || [1, 3, 5, 6].includes(reduceToSingleDigit(endingTwoDigits))) {
    endingQuality = 'excellent';
  } else {
    endingQuality = 'average';
  }

  // Overall Score Calculation (0 - 100)
  let score = 60;

  // Single digit resonance
  if (harmonyWithMulank === 'friendly') score += 15;
  else if (harmonyWithMulank === 'inimical') score -= 20;

  if (harmonyWithBhagyank === 'friendly') score += 15;
  else if (harmonyWithBhagyank === 'inimical') score -= 20;

  // Best general mobile totals are 1 (Authority/Sun), 5 (Mercury/Business), 6 (Venus/Wealth)
  if ([1, 5, 6].includes(singleDigit)) score += 10;
  else if ([4, 8].includes(singleDigit)) score -= 15; // 4 & 8 totals are notoriously burdensome in modern mobile numerology

  // Toxic pairs penalty
  for (const tp of toxicPairsFound) {
    score -= tp.severity === 'high' ? 20 : 10;
  }

  // Ending quality impact
  if (endingQuality === 'excellent') score += 10;
  if (endingQuality === 'poor') score -= 15;

  // Excessive repetition penalty (e.g. 8 repeating 4+ times = extreme struggle)
  if (frequency[8] >= 3) score -= 15;
  if (frequency[4] >= 3) score -= 10;

  score = Math.max(10, Math.min(100, score));

  const isPerfectMobile =
    score >= 70 &&
    toxicPairsFound.length === 0 &&
    !endsWithZero &&
    harmonyWithMulank !== 'inimical' &&
    harmonyWithBhagyank !== 'inimical';

  // Verdict & remedies
  let verdict = '';
  const remedies: string[] = [];

  if (isPerfectMobile) {
    verdict = 'Perfect Auspicious Frequency: Your mobile number vibrates in complete harmony with your birth stars. No number change or suggestion is required.';
  } else if (score >= 65) {
    verdict = 'Favorable Vibration: Good overall resonance, with minor room for energetic optimization.';
  } else if (score >= 45) {
    verdict = 'Moderate / Mixed: Shows resistance or delays in closure. Remedial wallpaper or number upgrade suggested.';
  } else {
    verdict = 'Inimical / Obstructive: Strong toxic pairs or malefic total present. Change of primary SIM highly recommended.';
  }

  if (!isPerfectMobile) {
    if (toxicPairsFound.length > 0) {
      remedies.push(`Neutralize toxic pair (${toxicPairsFound.map((t) => t.pair).join(', ')}) by setting your phone wallpaper to Sri Yantra or green emerald geometry and playing 396 Hz + 528 Hz Solfeggio sound frequencies for 11 mins daily.`);
    }
    if (endsWithZero) {
      remedies.push('Trailing zero dissipates outgoing deals. Use this SIM for incoming communication, acquire an active line ending in 24, 37, 45, or 51, and set a 528 Hz / 639 Hz caller/notification chime.');
    }
    if (frequency[5] === 0) {
      remedies.push('Number lacks Mercury (5) communication frequency. Keep a green phone cover, paste a small green sticker inside the phone back, and listen to 141.27 Hz & 741 Hz Mercury Throat-Chakra sound frequencies.');
    }
    if (singleDigit === 8 || singleDigit === 4) {
      remedies.push(`Total sum reduces to ${singleDigit}. Shift primary commercial transactions to a number totaling 5 (Mercury) or 6 (Venus) and ground your bio-field with 174 Hz & 432 Hz sound therapy.`);
    }
  }

  // Suggested ending sequences tailored to user's destiny (empty if mobile frequency is already perfect)
  const suggestedEndingSequences = isPerfectMobile
    ? []
    : ['...23', '...24', '...37', '...51', '...33', '...42', '...19'];

  return {
    mobileNumber: mobile,
    cleanDigits,
    digitSum,
    compoundNumber,
    singleDigit,
    endingTwoDigits,
    endingThreeDigits,
    toxicPairsFound,
    frequency,
    missingCrucialNumbers,
    dominantNumber,
    harmonyWithMulank,
    harmonyWithBhagyank,
    endingVibrationQuality: endingQuality,
    overallScore: score,
    verdict,
    suggestedEndingSequences,
    remedies,
  };
}

// Universal Real-time Numeric Cross-Reference Validator
export function validateNumericEntity(
  categoryOrInput: string,
  inputOrCategory: string,
  mulank: number,
  bhagyank: number
): UniversalValidationResult {
  const validCategories = ['vehicle', 'house', 'bank', 'pincode', 'brand', 'mobile'];
  let category: UniversalValidationResult['category'] = 'vehicle';
  let input = '';

  if (validCategories.includes(categoryOrInput)) {
    category = categoryOrInput as UniversalValidationResult['category'];
    input = inputOrCategory || '';
  } else if (validCategories.includes(inputOrCategory)) {
    category = inputOrCategory as UniversalValidationResult['category'];
    input = categoryOrInput || '';
  } else {
    category = (categoryOrInput as UniversalValidationResult['category']) || 'vehicle';
    input = inputOrCategory || '';
  }

  const clean = (input || '').toUpperCase().trim();
  let compound = 0;

  if (category === 'mobile' || /^\d+$/.test(clean)) {
    // Pure numeric sum
    compound = clean
      .replace(/\D/g, '')
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
  } else {
    // Chaldean alphanumeric conversion
    for (const ch of clean) {
      if (/[A-Z]/.test(ch)) {
        compound += CHALDEAN_MAP[ch] || 0;
      } else if (/\d/.test(ch)) {
        compound += parseInt(ch, 10);
      }
    }
  }

  if (compound === 0) compound = 1;
  const single = reduceToSingleDigit(compound);
  const pInfo = PLANETARY_PROFILES[single];
  const compInfo = getCompoundInfo(compound);

  const relM = getPlanetaryRelationship(mulank, single);
  const relB = getPlanetaryRelationship(bhagyank, single);

  let score = 50;
  if (compInfo.type === 'fortunate') score += 25;
  if (compInfo.type === 'auspicious') score += 15;
  if (compInfo.type === 'malefic') score -= 30;

  if (relM === 'friendly') score += 15;
  else if (relM === 'inimical') score -= 20;

  if (relB === 'friendly') score += 15;
  else if (relB === 'inimical') score -= 20;

  score = Math.max(10, Math.min(100, score));

  let rating: UniversalValidationResult['resonanceRating'] = 'B';
  if (score >= 90) rating = 'A+';
  else if (score >= 75) rating = 'A';
  else if (score >= 60) rating = 'B';
  else if (score >= 40) rating = 'C';
  else rating = 'F';

  const isHarmonious = score >= 65;
  const status = score >= 80 ? 'Auspicious & Lucky' : score >= 65 ? 'Harmonious' : score >= 45 ? 'Neutral / Mixed' : 'Challenging (Remedy Needed)';

  let advice = '';
  if (isHarmonious) {
    advice = `Resonates harmoniously with ${pInfo?.planet || 'Cosmos'}. Blessed for longevity and positive outcomes.`;
  } else {
    advice = `Produces energetic friction with your birth numbers. Consider adjusting with an auspicious prefix or spelling tweak.`;
  }

  return {
    category,
    input,
    inputValue: input,
    compound,
    compoundNumber: compound,
    singleDigit: single,
    planet: pInfo?.planet || 'Sun',
    rulingPlanet: pInfo?.planet || 'Sun',
    compoundInfo: compInfo,
    status,
    compatibilityScore: score,
    resonanceRating: rating,
    harmonyScore: score,
    meaning: compInfo.title,
    isHarmonious,
    advice,
    recommendation: advice,
  };
}

// Lo-Shu Grid (Lakshmi Grid 3x3) Calculations & Remedies
export interface LoShuPlaneInfo {
  name: string;
  numbers: number[];
  completionPercentage: number;
  status: string;
  interpretation: string;
}

export interface LoShuGridResult {
  grid: Record<number, number>; // counts of 1 through 9
  presentNumbers: number[];
  kuaNumber: number;
  planes: LoShuPlaneInfo[];
  completedPlanes: { name: string; numbers: number[]; meaning: string }[];
  missingNumbers: { number: number; planet: string; remedy: string }[];
}

export function calculateLoShuGrid(
  dobString: string,
  mulank: number,
  bhagyank: number,
  gender?: 'male' | 'female' | 'other'
): LoShuGridResult {
  const digits = (dobString || '').replace(/\D/g, '').split('').map((d) => parseInt(d, 10));
  // Include Mulank and Bhagyank in Lo Shu activation
  const allNumbers = [...digits, mulank, bhagyank].filter((n) => n >= 1 && n <= 9);

  const grid: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const n of allNumbers) {
    grid[n] = (grid[n] || 0) + 1;
  }

  const presentNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (grid[n] || 0) > 0);

  // Kua Number from birth year (standard Vedic/Feng Shui formula)
  const birthYear = parseInt((dobString || '1990-01-01').split('-')[0], 10) || 1990;
  const yearSingle = reduceToSingleDigit(birthYear);
  let kuaNumber = gender === 'female' ? reduceToSingleDigit(yearSingle + 4) : 11 - yearSingle;
  while (kuaNumber > 9) kuaNumber = reduceToSingleDigit(kuaNumber);
  if (kuaNumber <= 0) kuaNumber = 1;

  const rawPlanes = [
    { name: 'Mental Plane (4-9-2)', numbers: [4, 9, 2], meaning: 'Superb memory, strategic foresight, intellectual brilliance.' },
    { name: 'Emotional / Soul Plane (3-5-7)', numbers: [3, 5, 7], meaning: 'Deep intuition, magnetic empathy, spiritual perception.' },
    { name: 'Practical Plane (8-1-6)', numbers: [8, 1, 6], meaning: 'Grounded realism, commercial execution, material accumulation.' },
    { name: 'Thought Plane (4-3-8)', numbers: [4, 3, 8], meaning: 'Profound analytical vision, philosophical architect, political planning.' },
    { name: 'Willpower Plane (9-5-1)', numbers: [9, 5, 1], meaning: 'Unshakeable determination, executive spine, unstoppable drive to finish goals.' },
    { name: 'Action Plane (2-7-6)', numbers: [2, 7, 6], meaning: 'Quick execution, physical agility, decisive action in the material world.' },
    { name: 'Golden Raj Yoga (4-5-6)', numbers: [4, 5, 6], meaning: 'Immense business luck, luxury accumulation, generational fortune.' },
    { name: 'Silver Raj Yoga (2-5-8)', numbers: [2, 5, 8], meaning: 'Exceptional success in real estate, land, banking, and steady family roots.' },
  ];

  const completedPlanes: LoShuGridResult['completedPlanes'] = [];
  const planes: LoShuPlaneInfo[] = rawPlanes.map((pl) => {
    const presentCount = pl.numbers.filter((num) => (grid[num] || 0) > 0).length;
    const pct = Math.round((presentCount / 3) * 100);
    if (presentCount === 3) {
      completedPlanes.push({ name: pl.name, numbers: pl.numbers, meaning: pl.meaning });
    }
    const status =
      presentCount === 3
        ? '100% Complete (Active Yoga)'
        : presentCount === 2
        ? '67% Partial Activation'
        : presentCount === 1
        ? '33% Latent Plane'
        : '0% Missing Plane';
    return {
      name: pl.name,
      numbers: pl.numbers,
      completionPercentage: pct,
      status,
      interpretation:
        presentCount === 3
          ? `Fully Activated: ${pl.meaning}`
          : `Present ${presentCount}/3 digits (${pl.numbers.filter((n) => grid[n] > 0).join(', ') || 'None'}). Activate missing digits (${pl.numbers.filter((n) => !grid[n]).join(', ')}) to unlock: ${pl.meaning}`,
    };
  });

  // Missing numbers with Vedic remedies
  const missingNumbers: LoShuGridResult['missingNumbers'] = [];
  const remediesMap: Record<number, string> = {
    1: 'Offer water to Lord Surya at dawn; wear copper or chant Gayatri Mantra.',
    2: 'Wear silver ring or pearl; drink water from a silver cup to balance emotional waves.',
    3: 'Wear yellow clothes on Thursdays; plant Tulsi or worship Guru Brihaspati.',
    4: 'Keep your living space organized; feed birds and avoid clutter under beds.',
    5: 'Wear green jade or emerald; place a green plant in the north-east direction of your desk.',
    6: 'Wear pleasant floral fragrances; carry white handkerchief; worship Goddess Mahalakshmi.',
    7: 'Wear a silver chain or Cat’s Eye; chant Om Ganapataye Namah for focus.',
    8: 'Help the underprivileged on Saturdays; light a mustard oil lamp under Peepal tree.',
    9: 'Practice physical exercise or martial arts; chant Hanuman Chalisa for courage.',
  };

  for (let i = 1; i <= 9; i++) {
    if (grid[i] === 0) {
      missingNumbers.push({
        number: i,
        planet: PLANETARY_PROFILES[i]?.planet || 'Planet',
        remedy: remediesMap[i] || 'Chant planetary beej mantra.',
      });
    }
  }

  return { grid, presentNumbers, kuaNumber, planes, completedPlanes, missingNumbers };
}

// Vedic Choghadiya (Day & Night 24-Hour Live) & Rahu Kaal calculations for any present time
export function getDailyPanchang(dateObj: Date = new Date(), mulank: number, bhagyank: number) {
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday

  // Classical Day Choghadiya orders for each weekday (06:00 to 18:00)
  const dayChoghadiyaOrder: Record<number, ChoghadiyaPeriod['name'][]> = {
    0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
    1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Mon
    2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tue
    3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Wed
    4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thu
    5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'], // Fri
    6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'], // Sat
  };

  // Classical Night (Ratri) Choghadiya orders for each weekday (18:00 to 06:00)
  const nightChoghadiyaOrder: Record<number, ChoghadiyaPeriod['name'][]> = {
    0: ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun Night
    1: ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'], // Mon Night
    2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'], // Tue Night
    3: ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Wed Night
    4: ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // Thu Night
    5: ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'], // Fri Night
    6: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'], // Sat Night
  };

  // Rahu Kaal standard time windows (1.5 hr slots based on 06:00 sunrise)
  const rahuKaalMap: Record<number, { start: string; end: string }> = {
    0: { start: '16:30', end: '18:00' }, // Sun (8th part)
    1: { start: '07:30', end: '09:00' }, // Mon (2nd part)
    2: { start: '15:00', end: '16:30' }, // Tue (7th part)
    3: { start: '12:00', end: '13:30' }, // Wed (5th part)
    4: { start: '13:30', end: '15:00' }, // Thu (6th part)
    5: { start: '10:30', end: '12:00' }, // Fri (4th part)
    6: { start: '09:00', end: '10:30' }, // Sat (3rd part)
  };

  const choghadiyaQualities: Record<ChoghadiyaPeriod['name'], { quality: ChoghadiyaPeriod['quality']; ruler: string }> = {
    Amrit: { quality: 'Excellent', ruler: 'Moon (Chandra)' },
    Shubh: { quality: 'Good', ruler: 'Jupiter (Guru)' },
    Labh: { quality: 'Gainful', ruler: 'Mercury (Budha)' },
    Char: { quality: 'Neutral/Travel', ruler: 'Venus (Shukra)' },
    Rog: { quality: 'Inauspicious', ruler: 'Mars (Mangal)' },
    Kaal: { quality: 'Loss/Avoid', ruler: 'Saturn (Shani)' },
    Udveg: { quality: 'Anxiety/Avoid', ruler: 'Sun (Surya)' },
  };

  const nowHours = dateObj.getHours() + dateObj.getMinutes() / 60 + dateObj.getSeconds() / 3600;
  const isDaytime = nowHours >= 6 && nowHours < 18;

  // Format hour float (0-24+) to HH:MM
  const formatHourFloat = (hFloat: number) => {
    const normalized = ((hFloat % 24) + 24) % 24;
    const h = Math.floor(normalized);
    const m = Math.round((normalized - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const periods: ChoghadiyaPeriod[] = [];

  if (isDaytime) {
    const order = dayChoghadiyaOrder[dayOfWeek];
    for (let i = 0; i < 8; i++) {
      const startH = 6 + i * 1.5;
      const endH = startH + 1.5;
      const isCurrent = nowHours >= startH && nowHours < endH;
      const name = order[i];
      const meta = choghadiyaQualities[name];
      periods.push({
        name,
        ruler: meta.ruler,
        quality: meta.quality,
        startTime: formatHourFloat(startH),
        endTime: formatHourFloat(endH),
        isCurrent,
      });
    }
  } else {
    // Nighttime (18:00 to 06:00 next morning); if before 06:00, use previous weekday's night order
    const nightDayIdx = nowHours < 6 ? (dayOfWeek + 6) % 7 : dayOfWeek;
    const order = nightChoghadiyaOrder[nightDayIdx];
    const adjNowHours = nowHours < 6 ? nowHours + 24 : nowHours;

    for (let i = 0; i < 8; i++) {
      const startH = 18 + i * 1.5;
      const endH = startH + 1.5;
      const isCurrent = adjNowHours >= startH && adjNowHours < endH;
      const name = order[i];
      const meta = choghadiyaQualities[name];
      periods.push({
        name,
        ruler: meta.ruler,
        quality: meta.quality,
        startTime: formatHourFloat(startH),
        endTime: formatHourFloat(endH),
        isCurrent,
      });
    }
  }

  // Active Hora calculation (Planetary hour)
  const dayLordByWeekday = [1, 2, 9, 5, 3, 6, 8];
  const horaCycle = [1, 6, 5, 2, 8, 3, 9];
  const currentLord = dayLordByWeekday[dayOfWeek];
  const startIndex = horaCycle.indexOf(currentLord);
  const hourSince6 = Math.max(0, Math.floor((nowHours - 6 + 24) % 24));
  const currentHoraPlanetNum = horaCycle[(startIndex + hourSince6) % horaCycle.length];
  const currentHora = PLANETARY_PROFILES[currentHoraPlanetNum]?.planet || 'Jupiter';

  // Daily Lucky Numbers for user
  const dayNumber = reduceToSingleDigit(dateObj.getDate());
  const monthNumber = reduceToSingleDigit(dateObj.getMonth() + 1);
  const universalDayNumber = reduceToSingleDigit(dayNumber + monthNumber + reduceToSingleDigit(dateObj.getFullYear()));
  const personalDayNumber = reduceToSingleDigit(universalDayNumber + mulank + bhagyank);

  const luckyNumbers = Array.from(
    new Set([
      mulank,
      bhagyank,
      personalDayNumber,
      PLANETARY_PROFILES[mulank]?.friendlyNumbers[0] || 1,
      PLANETARY_PROFILES[bhagyank]?.friendlyNumbers[0] || 5,
    ])
  ).slice(0, 4);

  const activeChoghadiya = periods.find((p) => p.isCurrent) || periods[0];
  const rahuWindow = rahuKaalMap[dayOfWeek];

  const nowMinutes = dateObj.getHours() * 60 + dateObj.getMinutes();
  const [rStartH, rStartM] = rahuWindow.start.split(':').map(Number);
  const [rEndH, rEndM] = rahuWindow.end.split(':').map(Number);
  const rahuStartMins = rStartH * 60 + rStartM;
  const rahuEndMins = rEndH * 60 + rEndM;
  const isRahuKaalNow = nowMinutes >= rahuStartMins && nowMinutes < rahuEndMins;

  const weekdayNames = [
    'Sunday (Ravivar)',
    'Monday (Somvar)',
    'Tuesday (Mangalvar)',
    'Wednesday (Budhavar)',
    'Thursday (Guruvar)',
    'Friday (Shukravar)',
    'Saturday (Shanivar)',
  ];
  const vara = weekdayNames[dayOfWeek] || 'Thursday (Guruvar)';
  const tithiNames = [
    'Shukla Pratipada',
    'Shukla Dwitiya',
    'Shukla Tritiya',
    'Shukla Chaturthi',
    'Shukla Panchami',
    'Shukla Shashthi',
    'Shukla Saptami',
    'Shukla Ashtami',
    'Shukla Navami',
    'Shukla Dashami',
    'Shukla Ekadashi',
    'Shukla Dwadashi',
    'Shukla Trayodashi',
    'Shukla Chaturdashi',
    'Purnima Tithi',
  ];
  const tithi = tithiNames[dateObj.getDate() % tithiNames.length];
  const auspiciousTimings = periods
    .filter((p) => p.quality === 'Excellent' || p.quality === 'Good' || p.quality === 'Gainful')
    .map((p) => `${p.name} (${p.startTime}–${p.endTime})`);

  const horaRel = getPlanetaryRelationship(mulank, currentHoraPlanetNum);
  const horaStatus =
    horaRel === 'friendly'
      ? 'Supremely Favorable (Mitra Hora)'
      : horaRel === 'neutral'
      ? 'Balanced (Sama Hora)'
      : 'Caution Advised (Shatru Hora)';
  const horaAdvice =
    horaRel === 'friendly'
      ? `Excellent planetary hour ruled by ${currentHora} to initiate contracts, wealth transfers, and spiritual sadhana.`
      : `Routine execution advised during ${currentHora} Hora; chant your Beej Mantra before high-stakes decisions.`;

  const affirmation = `I am aligned with the supreme cosmic grace of ${PLANETARY_PROFILES[mulank]?.planet || 'Surya'} and ${PLANETARY_PROFILES[bhagyank]?.planet || 'Brihaspati'}; abundance, health, and dharmic victory flow to me effortlessly.`;
  const luckyColor = PLANETARY_PROFILES[mulank]?.luckyColor || 'Golden Amber';

  return {
    date: dateObj.toISOString().split('T')[0],
    dateStr: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    tithi,
    vara,
    choghadiyaPeriods: periods,
    currentChoghadiya: activeChoghadiya,
    currentHora,
    currentHoraPlanet: currentHora,
    horaStatus,
    horaAdvice,
    rahuKaalWindow: rahuWindow,
    isRahuKaalNow,
    auspiciousTimings,
    personalDayNumber,
    luckyNumbers,
    todayLuckyNumbers: luckyNumbers,
    luckyColor,
    luckyColorToday: luckyColor,
    todayLuckyColor: luckyColor,
    todayBeejMantra: PLANETARY_PROFILES[currentLord]?.beejMantra || 'Om Namah Shivaya',
    dailyAffirmation: affirmation,
    affirmation,
    deity: PLANETARY_PROFILES[mulank]?.deity || 'Lord Ganesha',
    auspiciousVibrationScore: isRahuKaalNow
      ? 35
      : activeChoghadiya.quality === 'Excellent'
      ? 95
      : activeChoghadiya.quality === 'Good' || activeChoghadiya.quality === 'Gainful'
      ? 84
      : activeChoghadiya.quality === 'Neutral/Travel'
      ? 72
      : 45,
  };
}

export interface GroomBridePair {
  isFemaleClient: boolean;
  groom: {
    name: string;
    dob: string;
    tob: string;
    pob: string;
    lat: number;
    lng: number;
  };
  bride: {
    name: string;
    dob: string;
    tob: string;
    pob: string;
    lat: number;
    lng: number;
  };
}

export function resolveGroomAndBrideProfiles(profile: {
  name: string;
  dob: string;
  tob?: string;
  pob?: string;
  lat?: number;
  lng?: number;
  gender?: 'male' | 'female' | 'other';
  partnerName?: string;
  partnerDob?: string;
  partnerTob?: string;
  partnerPob?: string;
  partnerLat?: number;
  partnerLng?: number;
}): GroomBridePair {
  const isFemaleClient = profile.gender === 'female';
  const clientPerson = {
    name: profile.name || (isFemaleClient ? 'Priyanka Sharma' : 'Deepak Jain'),
    dob: profile.dob || '1990-01-01',
    tob: profile.tob || '09:30',
    pob: profile.pob || 'New Delhi, India',
    lat: profile.lat ?? 28.6139,
    lng: profile.lng ?? 77.2090,
  };

  if (isFemaleClient) {
    // Female Client automatically appears in Bride! Partner appears in Groom.
    const rawPartnerName = (profile.partnerName || '').trim();
    const groomDefaultName =
      !rawPartnerName || rawPartnerName.toLowerCase() === 'priyanka sharma'
        ? 'Rohit Sharma'
        : rawPartnerName;
    const groomDefaultDob =
      !profile.partnerDob || profile.partnerDob === '1990-11-24'
        ? '1988-06-15'
        : profile.partnerDob;

    return {
      isFemaleClient: true,
      groom: {
        name: groomDefaultName,
        dob: groomDefaultDob,
        tob: profile.partnerTob || '10:30',
        pob: profile.partnerPob || 'Mumbai, Maharashtra, India',
        lat: profile.partnerLat ?? 19.0760,
        lng: profile.partnerLng ?? 72.8777,
      },
      bride: clientPerson,
    };
  }

  // Male Client (default) automatically appears in Groom! Partner appears in Bride.
  const rawPartnerName = (profile.partnerName || '').trim();
  const brideDefaultName =
    !rawPartnerName || rawPartnerName.toLowerCase() === 'rohit sharma'
      ? 'Priyanka Sharma'
      : rawPartnerName;
  const brideDefaultDob =
    !profile.partnerDob || profile.partnerDob === '1988-06-15'
      ? '1990-11-24'
      : profile.partnerDob;

  return {
    isFemaleClient: false,
    groom: clientPerson,
    bride: {
      name: brideDefaultName,
      dob: brideDefaultDob,
      tob: profile.partnerTob || '14:20',
      pob: profile.partnerPob || 'Mumbai, Maharashtra, India',
      lat: profile.partnerLat ?? 19.0760,
      lng: profile.partnerLng ?? 72.8777,
    },
  };
}

// Ashtakoot Guna Milan & Vedic Numerology Partner Compatibility
export function calculateCompatibility(
  p1: { name: string; dob: string; tob?: string; lat?: number; lng?: number },
  p2: { name: string; dob: string; tob?: string; lat?: number; lng?: number }
): CompatibilityAnalysis {
  const m1 = calculateMulank(p1.dob);
  const b1 = calculateBhagyank(p1.dob);
  const m2 = calculateMulank(p2.dob);
  const b2 = calculateBhagyank(p2.dob);

  const name1Analysis = analyzeName(p1.name, m1, b1);
  const name2Analysis = analyzeName(p2.name, m2, b2);

  // Automatic Moon Sign, Sun Sign & Nakshatra calculation from DOB, TOB, Lat/Lng
  const astro1 = calculateVedicAstrologyFromBirth(
    p1.dob,
    p1.tob || '09:30',
    p1.lat ?? 28.6139,
    p1.lng ?? 77.2090
  );
  const astro2 = calculateVedicAstrologyFromBirth(
    p2.dob,
    p2.tob || '10:15',
    p2.lat ?? 28.6139,
    p2.lng ?? 77.2090
  );

  // ============================================================================
  // CLASSICAL PARASHARI 36-GUNA ASHTAKOOT SHASTRA ENGINE
  // Uses exact Lahiri Sidereal Moon Rashi (0..11), Moon Degree, & Nakshatra (0..26)
  // ============================================================================
  const r1 = astro1.rashiIndex; // Groom Moon Rashi (0=Mesh .. 11=Meena)
  const r2 = astro2.rashiIndex; // Bride Moon Rashi (0=Mesh .. 11=Meena)
  const n1 = astro1.nakshatraIndex; // Groom Nakshatra (0=Ashwini .. 26=Revati)
  const n2 = astro2.nakshatraIndex; // Bride Nakshatra (0=Ashwini .. 26=Revati)

  // 1. VARNA KOOTA (Max 1 Guna — Valid scores: 1 or 0)
  // Brahmin (Rank 4): Karka (3), Vrischika (7), Meena (11)
  // Kshatriya (Rank 3): Mesh (0), Simha (4), Dhanu (8)
  // Vaishya (Rank 2): Vrishabh (1), Kanya (5), Makara (9)
  // Shudra (Rank 1): Mithuna (2), Tula (6), Kumbha (10)
  const VARNA_RANK = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4];
  const VARNA_NAME = [
    'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin',
    'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin',
    'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin',
  ];
  const groomVarna = VARNA_NAME[r1];
  const brideVarna = VARNA_NAME[r2];
  const varnaPts = VARNA_RANK[r1] >= VARNA_RANK[r2] ? 1 : 0;

  // 2. VASHYA KOOTA (Max 2 Gunas — Valid scores: 2, 1, 0.5, or 0)
  // 0=Chatushpada (Quadruped), 1=Manava (Human/Biped), 2=Jalachara (Water), 3=Vanachara (Wild), 4=Keeta (Insect/Scorpion)
  const getVashyaGroup = (rashiIdx: number, moonDegSidereal: number): { id: number; name: string } => {
    const degInSign = ((moonDegSidereal % 30) + 30) % 30;
    if (rashiIdx === 0 || rashiIdx === 1) return { id: 0, name: 'Chatushpada (Quadruped)' };
    if (rashiIdx === 2 || rashiIdx === 5 || rashiIdx === 6 || rashiIdx === 10) return { id: 1, name: 'Manava (Human)' };
    if (rashiIdx === 3 || rashiIdx === 11) return { id: 2, name: 'Jalachara (Aquatic)' };
    if (rashiIdx === 4) return { id: 3, name: 'Vanachara (Leo Wild)' };
    if (rashiIdx === 7) return { id: 4, name: 'Keeta (Scorpion)' };
    if (rashiIdx === 8) {
      return degInSign < 15
        ? { id: 1, name: 'Manava (Dhanu First Half)' }
        : { id: 0, name: 'Chatushpada (Dhanu Second Half)' };
    }
    // Makara (9): 0-15° Chatushpada, 15-30° Jalachara
    return degInSign < 15
      ? { id: 0, name: 'Chatushpada (Makara First Half)' }
      : { id: 2, name: 'Jalachara (Makara Second Half)' };
  };
  const vashya1 = getVashyaGroup(r1, astro1.moonDegreeSidereal);
  const vashya2 = getVashyaGroup(r2, astro2.moonDegreeSidereal);
  // Classical Parashari 5x5 Vashya Matrix [groomVashya][brideVashya]
  const VASHYA_MATRIX: number[][] = [
    // Chatushpada, Manava, Jalachara, Vanachara, Keeta
    [2, 0.5, 1, 0, 1],   // Groom Chatushpada
    [0.5, 2, 0.5, 0, 0], // Groom Manava
    [1, 0.5, 2, 1, 1],   // Groom Jalachara
    [0, 0, 1, 2, 0],     // Groom Vanachara
    [1, 0, 1, 0, 2],     // Groom Keeta
  ];
  const vashyaPts = VASHYA_MATRIX[vashya1.id][vashya2.id];

  // 3. TARA KOOTA (Max 3 Gunas — Valid scores: 3, 1.5, or 0)
  // Count inclusive from Groom Nakshatra to Bride Nakshatra (mod 9) and Bride to Groom (mod 9)
  // Remainder 3 (Vipat), 5 (Pratyak), 7 (Naidhana) are Inauspicious; 1, 2, 4, 6, 8, 0(9) are Auspicious
  const TARA_NAMES = [
    'Janma (1st)',
    'Sampat (2nd)',
    'Vipat (3rd - Caution)',
    'Kshema (4th)',
    'Pratyak (5th - Caution)',
    'Sadhaka (6th)',
    'Naidhana (7th - Caution)',
    'Mitra (8th)',
    'Ati-Mitra (9th)',
  ];
  const taraCount1to2 = (((n2 - n1 + 27) % 27) % 9) + 1; // 1..9
  const taraCount2to1 = (((n1 - n2 + 27) % 27) % 9) + 1; // 1..9
  const isTara1Auspicious = ![3, 5, 7].includes(taraCount1to2);
  const isTara2Auspicious = ![3, 5, 7].includes(taraCount2to1);
  const taraPts = (isTara1Auspicious ? 1.5 : 0) + (isTara2Auspicious ? 1.5 : 0);
  const groomToBrideTaraName = TARA_NAMES[taraCount1to2 - 1];
  const brideToGroomTaraName = TARA_NAMES[taraCount2to1 - 1];

  // 4. YONI KOOTA (Max 4 Gunas — Valid scores: 4, 3, 2, 1, or 0)
  // 14 Classical Animal Yonis (0..13) mapped across the 27 Nakshatras
  // 0:Ashwa(Horse), 1:Gaja(Elephant), 2:Mesha(Sheep), 3:Sarpa(Serpent), 4:Shwan(Dog),
  // 5:Marjara(Cat), 6:Mushaka(Rat), 7:Gau(Cow), 8:Mahisha(Buffalo), 9:Vyaghra(Tiger),
  // 10:Mriga(Deer), 11:Vanara(Monkey), 12:Nakula(Mongoose), 13:Simha(Lion)
  const YONI_NAMES = [
    'Ashwa (Horse)', 'Gaja (Elephant)', 'Mesha (Sheep)', 'Sarpa (Serpent)',
    'Shwan (Dog)', 'Marjara (Cat)', 'Mushaka (Rat)', 'Gau (Cow)',
    'Mahisha (Buffalo)', 'Vyaghra (Tiger)', 'Mriga (Deer)', 'Vanara (Monkey)',
    'Nakula (Mongoose)', 'Simha (Lion)',
  ];
  // 27 Nakshatras -> Yoni index (0..13)
  const NAKSHATRA_YONI_INDEX = [
    0,  // 0 Ashwini -> Ashwa
    1,  // 1 Bharani -> Gaja
    2,  // 2 Krittika -> Mesha
    3,  // 3 Rohini -> Sarpa
    3,  // 4 Mrigashira -> Sarpa
    4,  // 5 Ardra -> Shwan
    5,  // 6 Punarvasu -> Marjara
    2,  // 7 Pushya -> Mesha
    5,  // 8 Ashlesha -> Marjara
    6,  // 9 Magha -> Mushaka
    6,  // 10 Purva Phalguni -> Mushaka
    7,  // 11 Uttara Phalguni -> Gau
    8,  // 12 Hasta -> Mahisha
    9,  // 13 Chitra -> Vyaghra
    8,  // 14 Swati -> Mahisha
    9,  // 15 Vishakha -> Vyaghra
    10, // 16 Anuradha -> Mriga
    10, // 17 Jyeshtha -> Mriga
    4,  // 18 Mula -> Shwan
    11, // 19 Purva Ashadha -> Vanara
    12, // 20 Uttara Ashadha -> Nakula
    11, // 21 Shravana -> Vanara
    13, // 22 Dhanishta -> Simha
    0,  // 23 Shatabhisha -> Ashwa
    13, // 24 Purva Bhadrapada -> Simha
    7,  // 25 Uttara Bhadrapada -> Gau
    1,  // 26 Revati -> Gaja
  ];
  // Classical Parashari 14x14 Yoni Compatibility Matrix
  const YONI_MATRIX: number[][] = [
    [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1], // 0 Ashwa
    [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0], // 1 Gaja
    [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1], // 2 Mesha
    [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2], // 3 Sarpa
    [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1], // 4 Shwan
    [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1], // 5 Marjara
    [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2], // 6 Mushaka
    [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1], // 7 Gau
    [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1], // 8 Mahisha
    [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1], // 9 Vyaghra
    [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1], // 10 Mriga
    [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2], // 11 Vanara
    [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2], // 12 Nakula
    [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4], // 13 Simha
  ];
  const yoniIdx1 = NAKSHATRA_YONI_INDEX[n1];
  const yoniIdx2 = NAKSHATRA_YONI_INDEX[n2];
  const groomYoniName = YONI_NAMES[yoniIdx1];
  const brideYoniName = YONI_NAMES[yoniIdx2];
  const yoniPts = YONI_MATRIX[yoniIdx1][yoniIdx2];

  // 5. GRAHA MAITRI KOOTA (Max 5 Gunas — Valid scores: 5, 4, 3, 1, 0.5, or 0)
  // Rashi Lords: 0=Sun, 1=Moon, 2=Mars, 3=Mercury, 4=Jupiter, 5=Venus, 6=Saturn
  // Rashi 0..11 -> Mars(2), Venus(5), Mercury(3), Moon(1), Sun(0), Mercury(3), Venus(5), Mars(2), Jupiter(4), Saturn(6), Saturn(6), Jupiter(4)
  const RASHI_TO_GRAHA_ID = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4];
  // Classical Parashari 7x7 Graha Maitri Matrix [groomLord][brideLord]
  const GRAHA_MAITRI_MATRIX: number[][] = [
    // Sun, Moon, Mars, Merc, Jup, Ven, Sat
    [5, 5, 5, 4, 5, 0, 0],     // 0 Sun
    [5, 5, 4, 1, 4, 0.5, 0.5], // 1 Moon
    [5, 4, 5, 0.5, 5, 3, 0.5], // 2 Mars
    [4, 1, 0.5, 5, 0.5, 5, 4], // 3 Mercury
    [5, 4, 5, 0.5, 5, 0.5, 3], // 4 Jupiter
    [0, 0.5, 3, 5, 0.5, 5, 5], // 5 Venus
    [0, 0.5, 0.5, 4, 3, 5, 5], // 6 Saturn
  ];
  const lord1Id = RASHI_TO_GRAHA_ID[r1];
  const lord2Id = RASHI_TO_GRAHA_ID[r2];
  const grahaPts = GRAHA_MAITRI_MATRIX[lord1Id][lord2Id];
  const p1PlanetName = astro1.rashiLord;
  const p2PlanetName = astro2.rashiLord;

  // 6. GANA KOOTA (Max 6 Gunas — Valid scores: 6, 5, 1, or 0)
  // 0=Deva (Divine/Sattvic), 1=Manushya (Human/Rajasic), 2=Rakshasa (Intense/Independent)
  const GANA_NAMES = ['Deva Gana (Divine)', 'Manushya Gana (Human)', 'Rakshasa Gana (Intense)'];
  // 27 Nakshatras -> Gana (0, 1, 2)
  // Deva (0): Ashwini(0), Mrigashira(4), Punarvasu(6), Pushya(7), Hasta(12), Swati(14), Anuradha(16), Shravana(21), Revati(26)
  // Manushya (1): Bharani(1), Rohini(3), Ardra(5), Purva Phalguni(10), Uttara Phalguni(11), Purva Ashadha(19), Uttara Ashadha(20), Purva Bhadrapada(24), Uttara Bhadrapada(25)
  // Rakshasa (2): Krittika(2), Ashlesha(8), Magha(9), Chitra(13), Vishakha(15), Jyeshtha(17), Mula(18), Dhanishta(22), Shatabhisha(23)
  const NAKSHATRA_GANA_INDEX = [
    0, 1, 2, 1, 0, 1, 0, 0, 2,
    2, 1, 1, 0, 2, 0, 2, 0, 2,
    2, 1, 1, 0, 2, 2, 1, 1, 0,
  ];
  // Classical Parashari 3x3 Gana Matrix [groomGana][brideGana]
  const GANA_MATRIX: number[][] = [
    [6, 6, 1], // Groom Deva: Bride Deva=6, Manushya=6, Rakshasa=1
    [5, 6, 0], // Groom Manushya: Bride Deva=5, Manushya=6, Rakshasa=0
    [0, 0, 6], // Groom Rakshasa: Bride Deva=0, Manushya=0, Rakshasa=6
  ];
  const gana1Idx = NAKSHATRA_GANA_INDEX[n1];
  const gana2Idx = NAKSHATRA_GANA_INDEX[n2];
  const groomGanaName = GANA_NAMES[gana1Idx];
  const brideGanaName = GANA_NAMES[gana2Idx];
  const ganaPts = GANA_MATRIX[gana1Idx][gana2Idx];

  // 7. BHAKOOT KOOTA (Max 7 Gunas — Valid scores: 7 or 0)
  // Distance from Groom Rashi to Bride Rashi:
  // Auspicious (7 pts): 1/1 (Same Rashi), 3/11 (Tritya-Ekadasha), 4/10 (Kendra), 7/7 (Samsaptaka)
  // Inauspicious (0 pts): 2/12 (Dwirdwadasha), 5/9 (Navapanchama), 6/8 (Shadashtaka)
  const rashiDist1to2 = ((r2 - r1 + 12) % 12) + 1; // 1..12
  const rashiDist2to1 = ((r1 - r2 + 12) % 12) + 1; // 1..12
  const bhakootAxisLabel = `${Math.min(rashiDist1to2, rashiDist2to1)}/${Math.max(rashiDist1to2, rashiDist2to1)}`;
  const isRawBhakootAuspicious = [1, 3, 4, 7, 10, 11].includes(rashiDist1to2);
  // Classical Bhakoot Score (7 or 0) + Note if Graha Maitri / Ekadhipatya Parihara applies
  const hasBhakootParihara = !isRawBhakootAuspicious && (lord1Id === lord2Id || grahaPts >= 4);
  const bhakootPts = isRawBhakootAuspicious ? 7 : 0;

  // 8. NADI KOOTA (Max 8 Gunas — Valid scores: 8 or 0)
  // 0=Adi (Vata), 1=Madhya (Pitta), 2=Antya (Kapha)
  // Classical 27-Nakshatra Nadi snake wave:
  // [0,1,2, 2,1,0, 0,1,2, 2,1,0, 0,1,2, 2,1,0, 0,1,2, 2,1,0, 0,1,2]
  const NADI_NAMES = ['Adi Nadi (Vata)', 'Madhya Nadi (Pitta)', 'Antya Nadi (Kapha)'];
  const NAKSHATRA_NADI_INDEX = [
    0, 1, 2, 2, 1, 0, 0, 1, 2,
    2, 1, 0, 0, 1, 2, 2, 1, 0,
    0, 1, 2, 2, 1, 0, 0, 1, 2,
  ];
  const nadi1Idx = NAKSHATRA_NADI_INDEX[n1];
  const nadi2Idx = NAKSHATRA_NADI_INDEX[n2];
  const groomNadiName = NADI_NAMES[nadi1Idx];
  const brideNadiName = NADI_NAMES[nadi2Idx];
  const nadiPts = nadi1Idx !== nadi2Idx ? 8 : 0;

  const dimensions: CompatibilityAnalysis['dimensions'] = [
    {
      name: 'Varna Koota (Spiritual Ego & Dharmic Temperament)',
      sanskritName: 'वर्ण कूट',
      maxPoints: 1,
      obtainedPoints: varnaPts,
      description: `Groom: ${groomVarna} Varna (${astro1.rashi}) • Bride: ${brideVarna} Varna (${astro2.rashi}). Evaluates spiritual maturity and ego balance.`,
      detailedAnalysis: `Varna Koota measures the dharmic temperament between Groom ${p1.name} (${astro1.rashi} — ${groomVarna} Varna) and Bride ${p2.name} (${astro2.rashi} — ${brideVarna} Varna). With an exact Parashari score of ${varnaPts}/1, ${
        varnaPts === 1
          ? `both partners share a harmonious dharmic hierarchy where mutual respect in career decisions, household leadership, and spiritual responsibilities flows naturally.`
          : `Bride (${brideVarna} Varna) holds a higher classical Varna rank than Groom (${groomVarna} Varna), indicating that conscious mutual appreciation is needed so neither spouse feels undervalued.`
      }`,
      remedy: 'Offer water mixed with a pinch of turmeric to Lord Surya or Banana tree every Thursday morning, begin major family discussions after lighting a pure ghee lamp in the North-East corner, and play 963 Hz & 126.22 Hz Crown-Solar sound frequencies.',
      groomRemedy: `Groom (${p1.name}): Offer Arghya to Lord Surya at sunrise, wear a 5-Mukhi Rudraksha, and listen to 126.22 Hz & 963 Hz frequencies to dissolve intellectual pride.`,
      brideRemedy: `Bride (${p2.name}): Apply a Kesar/Turmeric tilak on Thursdays, light a cow-ghee diya in the North-East altar, and meditate with 432 Hz & 963 Hz chimes.`,
      bothRemedy: `Both (${p1.name} & ${p2.name}): Seek blessings at a Vishnu-Lakshmi temple together and play 432 Hz + 963 Hz Sacred Harmonics in the living area.`,
      soundFrequencyHz: '126.22 Hz & 963 Hz (Dharmic Ego Harmony)',
      verdict: varnaPts === 1 ? 'Excellent' : 'Moderate',
    },
    {
      name: 'Vashya Koota (Mutual Magnetism & Power Equilibrium)',
      sanskritName: 'वश्य कूट',
      maxPoints: 2,
      obtainedPoints: vashyaPts,
      description: `Groom: ${vashya1.name} • Bride: ${vashya2.name}. Governs magnetic attraction, instinctive loyalty, and emotional influence.`,
      detailedAnalysis: `Vashya Koota examines the gravitational pull between Groom ${p1.name} (${vashya1.name}) and Bride ${p2.name} (${vashya2.name}). Scoring ${vashyaPts}/2 Gunas indicates ${
        vashyaPts >= 1.5
          ? `a naturally devoted bond where both the Bride and Groom willingly accommodate each other’s wishes without feeling controlled or dominated.`
          : vashyaPts >= 1
          ? `a balanced dynamic with healthy affection, requiring occasional compromise during family decisions.`
          : `a dynamic where power struggles can surface over household priorities, requiring gentle emotional diplomacy and mutual respect.`
      }`,
      remedy: 'Keep a pair of energized Rose Quartz crystals or a silver bowl with fresh mogra/rose flowers in the master bedroom, chant "Om Kleem Krishnaya Namah" 11 times on Fridays, and play 639 Hz Heart-Bonding Solfeggio sound frequency.',
      groomRemedy: `Groom (${p1.name}): Gift natural floral attar or white sweets to ${p2.name} on Fridays and listen to 639 Hz & 221.23 Hz Venusian harmony frequencies.`,
      brideRemedy: `Bride (${p2.name}): Keep a pair of Rose Quartz hearts in the South-West bedroom corner and chant "Om Kleem Krishnaya Namah" with 639 Hz ambient chimes.`,
      bothRemedy: `Both (${p1.name} & ${p2.name}): Offer flute and peacock feather (Morpankh) at a Radha-Krishna shrine and play 639 Hz Bansuri flute frequencies on Friday evenings.`,
      soundFrequencyHz: '639 Hz & 221.23 Hz (Magnetic Love Resonance)',
      verdict: vashyaPts === 2 ? 'Excellent' : vashyaPts >= 1 ? 'Good' : 'Moderate',
    },
    {
      name: 'Tara Koota (Nakshatra Destiny & Karmic Longevity)',
      sanskritName: 'तारा कूट',
      maxPoints: 3,
      obtainedPoints: taraPts,
      description: `Groom➔Bride: ${groomToBrideTaraName} • Bride➔Groom: ${brideToGroomTaraName}. Synchronizes the 27 Lunar Mansions for health and fortune.`,
      detailedAnalysis: `Tara Koota cross-references Groom’s birth star (${astro1.nakshatra}, Pada ${astro1.pada}) with Bride’s birth star (${astro2.nakshatra}, Pada ${astro2.pada}). Count from Groom to Bride is ${groomToBrideTaraName} and Bride to Groom is ${brideToGroomTaraName}, yielding ${taraPts}/3 Gunas. ${
        taraPts === 3
          ? `Both Taras are auspicious, acting as a direct catalyst for career prosperity, debt clearance, and mutual longevity protection.`
          : taraPts === 1.5
          ? `One partner’s Tara is auspicious while the other’s falls in a sensitive triad (3rd/5th/7th), indicating strong resilience with occasional karmic tests during dasha transitions.`
          : `Both Taras fall in sensitive Vipat/Pratyak/Naidhana positions, making Nakshatra Rudrabhishekam and mantra shielding important for smooth fortune.`
      }`,
      remedy: 'Perform Rudrabhishekam or offer Bilva leaves and raw milk to a Shiva Lingam on the monthly birth Nakshatra day of both partners, accompanied by 852 Hz & 136.10 Hz Om Nakshatra sound frequencies.',
      groomRemedy: `Groom (${p1.name}): Offer 11 unbroken Bilva leaves on a Shiva Lingam on your monthly ${astro1.nakshatra} Nakshatra day and meditate with 136.10 Hz Om tone.`,
      brideRemedy: `Bride (${p2.name}): Offer raw cow milk and white akshat (rice) to Lord Shiva and Mata Parvati on Mondays with 852 Hz & 210.42 Hz Lunar sound resonance.`,
      bothRemedy: `Both (${p1.name} & ${p2.name}): Perform a joint Rudrabhishekam during Shravana or Maha Shivratri and play 136.10 Hz + 852 Hz Tibetan Singing Bowls.`,
      soundFrequencyHz: '852 Hz & 136.10 Hz (Nakshatra Destiny Shield)',
      verdict: taraPts === 3 ? 'Excellent' : taraPts === 1.5 ? 'Good' : 'Challenging',
    },
    {
      name: 'Yoni Koota (Sensory Intimacy & Biological Chemistry)',
      sanskritName: 'योनि कूट',
      maxPoints: 4,
      obtainedPoints: yoniPts,
      description: `Groom: ${groomYoniName} (${astro1.nakshatra}) • Bride: ${brideYoniName} (${astro2.nakshatra}). Assesses biological & romantic chemistry.`,
      detailedAnalysis: `Yoni Koota governs biological and sensory resonance between Groom ${p1.name} (${groomYoniName} Yoni) and Bride ${p2.name} (${brideYoniName} Yoni). The classical 14×14 Yoni matrix awards ${yoniPts}/4 Gunas, showing ${
        yoniPts >= 3
          ? `strong physical warmth, effortless non-verbal affection, and harmonious biological rhythms throughout married life.`
          : yoniPts === 2
          ? `neutral biological compatibility that deepens steadily through emotional warmth and attentive communication.`
          : `contrasting elemental biorhythms (${groomYoniName} vs ${brideYoniName}), making dedicated private time and emotional patience essential for romantic fulfillment.`
      }`,
      remedy: 'Use warm ambient lighting in the South-West bedroom, diffuse pure Sandalwood or Ylang-Ylang essential oil on Friday evenings, and play 417 Hz & 210.42 Hz Sacral-Lunar intimacy sound frequencies.',
      groomRemedy: `Groom (${p1.name}): Apply natural Sandalwood or Rose attar on the wrists on Friday evenings and unwind to 417 Hz Sacral resonance.`,
      brideRemedy: `Bride (${p2.name}): Diffuse pure Jasmine or Ylang-Ylang essential oil in the bedroom on Fridays with 417 Hz & 210.42 Hz water-element sound waves.`,
      bothRemedy: `Both (${p1.name} & ${p2.name}): Sleep with heads toward the South or East direction and play 417 Hz Sacral Singing Bowl audio for 15 mins before rest.`,
      soundFrequencyHz: '417 Hz & 210.42 Hz (Sacral Bio-Harmony)',
      verdict: yoniPts === 4 ? 'Excellent' : yoniPts === 3 ? 'Good' : yoniPts === 2 ? 'Moderate' : 'Challenging',
    },
    {
      name: 'Graha Maitri (Planetary Friendship & Psychological Empathy)',
      sanskritName: 'ग्रह मैत्री',
      maxPoints: 5,
      obtainedPoints: grahaPts,
      description: `Groom Rashi Swami: ${p1PlanetName} (${astro1.rashi}) • Bride Rashi Swami: ${p2PlanetName} (${astro2.rashi}). Evaluates psychological friendship.`,
      detailedAnalysis: `Graha Maitri analyzes how the Moon Rashi Swami of Groom ${p1.name} (${p1PlanetName}, ${astro1.rashi}) interacts with the Moon Rashi Swami of Bride ${p2.name} (${p2PlanetName}, ${astro2.rashi}). With ${grahaPts}/5 Gunas, ${
        grahaPts >= 4
          ? `their Rashi lords share natural planetary friendship (Mitra). Even when external challenges arise, the Bride and Groom intuitively understand each other’s unspoken thoughts.`
          : grahaPts >= 3
          ? `their Rashi lords share a balanced neutral-friendly relationship, supporting constructive dialogue and mutual compromise.`
          : `their Rashi lords (${p1PlanetName} and ${p2PlanetName}) hold contrasting elemental temperaments, requiring active listening to avoid recurring debates.`
      }`,
      remedy: 'Worship Lord Lakshmi-Narayana together on Shukla Paksha Ekadashi, place a copper Swastika or Shree Yantra in the home altar, and play 528 Hz + 432 Hz Planetary Maitri sound frequencies.',
      groomRemedy: `Groom (${p1.name}): Chant your Rashi Lord (${p1PlanetName}) Beej Mantra 11 times in the morning with 528 Hz & ${PLANETARY_PROFILES[m1]?.soundFrequencyHz?.split(' ')[0] || '126.22'} Hz resonance.`,
      brideRemedy: `Bride (${p2.name}): Chant your Rashi Lord (${p2PlanetName}) Beej Mantra 11 times with 432 Hz & ${PLANETARY_PROFILES[m2]?.soundFrequencyHz?.split(' ')[0] || '210.42'} Hz resonance.`,
      bothRemedy: `Both (${p1.name} & ${p2.name}): Install an energized Shree Yantra in the North-East altar and play 432 Hz + 528 Hz Vedic Tanpura frequencies during morning worship.`,
      soundFrequencyHz: '528 Hz & 432 Hz (Planetary Maitri Resonance)',
      verdict: grahaPts >= 4 ? 'Excellent' : grahaPts >= 3 ? 'Good' : 'Challenging',
    },
    {
      name: 'Gana Koota (Temperament, Lifestyle & Social Nature)',
      sanskritName: 'गण कूट',
      maxPoints: 6,
      obtainedPoints: ganaPts,
      description: `Groom: ${groomGanaName} • Bride: ${brideGanaName}. Harmonizes Deva (Sattvic), Manushya (Pragmatic), and Rakshasa (Intense) natures.`,
      detailedAnalysis: `Gana Koota reveals how Groom ${p1.name} (${groomGanaName}, ${astro1.nakshatra}) and Bride ${p2.name} (${brideGanaName}, ${astro2.nakshatra}) behave in daily domestic life and crisis management. Scoring ${ganaPts}/6 Gunas signifies ${
        ganaPts >= 5
          ? `highly compatible daily rhythms where both partners share harmonious standards regarding hospitality, ethics, and lifestyle.`
          : `a contrast between ${groomGanaName} and ${brideGanaName} temperaments, where one partner prefers calm diplomacy while the other thrives on direct, fearless action.`
      }`,
      remedy: 'Burn natural Camphor (Bhimseni Kapoor) with 2 cloves in a brass diffuser every evening at sunset and play 741 Hz & 396 Hz Sattvic Aura-Cleansing sound frequencies.',
      groomRemedy: `Groom (${p1.name}): Offer Durva grass and modak to Lord Ganesha on Wednesdays and listen to 741 Hz Throat-Calming frequencies.`,
      brideRemedy: `Bride (${p2.name}): Burn Bhimseni Camphor with 2 cloves at sunset and play 396 Hz & 741 Hz Tibetan chimes in the living area.`,
      bothRemedy: `Both (${p1.name} & ${p2.name}): Partake in one Sattvic home-cooked meal together daily with soft 432 Hz / 741 Hz instrumental background acoustics.`,
      soundFrequencyHz: '741 Hz & 396 Hz (Sattvic Temperament Balance)',
      verdict: ganaPts >= 5 ? 'Excellent' : ganaPts >= 1 ? 'Moderate' : 'Challenging',
    },
    {
      name: 'Bhakoot Koota (Domestic Prosperity, Family & Emotional Wealth)',
      sanskritName: 'भकूट कूट',
      maxPoints: 7,
      obtainedPoints: bhakootPts,
      description: `Moon Rashi Axis: ${bhakootAxisLabel} (${astro1.rashi} ↔ ${astro2.rashi}). Examines geometrical Moon-sign distance for family prosperity.`,
      detailedAnalysis: `Bhakoot Koota governs the emotional heart and joint treasury between ${p1.name} (${astro1.rashi}) and ${p2.name} (${astro2.rashi}), forming a ${bhakootAxisLabel} Moon-sign axis. Scoring ${bhakootPts}/7 Gunas indicates ${
        bhakootPts === 7
          ? `an auspicious ${bhakootAxisLabel} Rashi alignment where joint investments, real estate, and family fortune expand steadily after marriage.`
          : hasBhakootParihara
          ? `a ${bhakootAxisLabel} Rashi axis (0/7 raw score), but blessed with Classical Bhakoot Parihara because the Rashi Lords (${p1PlanetName} & ${p2PlanetName}) share strong planetary harmony.`
          : `a sensitive ${bhakootAxisLabel} (${rashiDist1to2 === 6 || rashiDist1to2 === 8 ? 'Shadashtaka 6/8' : rashiDist1to2 === 5 || rashiDist1to2 === 9 ? 'Navapanchama 5/9' : 'Dwirdwadasha 2/12'}) Rashi axis, requiring transparent budgeting and emotional patience.`
      }`,
      remedy: 'Maintain a joint wealth kalash (silver coin + whole turmeric + akshat in red silk) in the North locker, feed sweet rotis to cows on Fridays, and play 639 Hz & 183.58 Hz Lakshmi-Guru abundance sound frequencies.',
      groomRemedy: `Groom (${p1.name}): Deposit a silver coin in the household wealth box on Dhanteras/Purnima and listen to 183.58 Hz Jupiterian treasury frequency.`,
      brideRemedy: `Bride (${p2.name}): Tie 5 whole turmeric knots and 5 Gomti Chakras in yellow silk for the North locker while playing 639 Hz & 221.23 Hz Lakshmi chimes.`,
      bothRemedy: `Both (${p1.name} & ${p2.name}): Feed green fodder and jaggery to cows on Fridays and play 639 Hz + 183.58 Hz abundance frequencies in the home.`,
      soundFrequencyHz: '639 Hz & 183.58 Hz (Bhakoot Treasury & Heart)',
      verdict: bhakootPts === 7 ? 'Excellent' : hasBhakootParihara ? 'Good' : 'Challenging',
    },
    {
      name: 'Nadi Koota (Pranic Vitality, Nervous System & Progeny Health)',
      sanskritName: 'नाड़ी कूट',
      maxPoints: 8,
      obtainedPoints: nadiPts,
      description: `Groom: ${groomNadiName} • Bride: ${brideNadiName}. The highest-weighted Koota (8 Gunas) governing Vata-Pitta-Kapha vitality.`,
      detailedAnalysis: `Nadi Koota assesses the subtle pranic pulse between Groom ${p1.name} (${groomNadiName}, ${astro1.nakshatra}) and Bride ${p2.name} (${brideNadiName}, ${astro2.nakshatra}). Scoring ${nadiPts}/8 Gunas confirms ${
        nadiPts === 8
          ? `complete freedom from Nadi Dosha (${groomNadiName} + ${brideNadiName}). Because both partners possess complementary Ayurvedic constitutions, they naturally balance each other’s health, immunity, and progeny blessings.`
          : `Samana Nadi (${groomNadiName} for both partners — Nadi Dosha 0/8).${
              astro1.rashi === astro2.rashi && astro1.nakshatra !== astro2.nakshatra
                ? ' Classical Shastra grants Nadi Parihara because both share the same Rashi with different Nakshatras.'
                : astro1.nakshatra === astro2.nakshatra && astro1.pada !== astro2.pada
                ? ' Classical Shastra grants partial Nadi Parihara because both share the same Nakshatra in different Charanas (Padas).'
                : ' Performing Maha Mrityunjaya Japa and Swarna-Dhanya Daan is recommended to neutralize shared dosha sensitivity.'
            }`
      }`,
      remedy: 'Chant the Maha Mrityunjaya Mantra 27 times on Mondays, donate grains on Purnima, drink copper/silver-charged water, and play 174 Hz, 285 Hz & 528 Hz Pranic Nadi-Regeneration sound frequencies.',
      groomRemedy: `Groom (${p1.name}): Recite Maha Mrityunjaya Mantra 27 times on Mondays with 174 Hz & 528 Hz Pranic healing sound therapy.`,
      brideRemedy: `Bride (${p2.name}): Offer Panchamrit to Lord Shiva, wear an energized Rudraksha or Pearl, and listen to 285 Hz & 528 Hz cellular vitality tones.`,
      bothRemedy: `Both (${p1.name} & ${p2.name}): Donate seven-grain Annadaan on Purnima and listen together to 174 Hz + 285 Hz + 528 Hz Nadi-Shuddhi sound frequencies for 15 mins.`,
      soundFrequencyHz: '174 Hz, 285 Hz & 528 Hz (Pranic Nadi Healing)',
      verdict: nadiPts === 8 ? 'Excellent' : 'Challenging',
    },
  ];

  const totalPoints = Math.round(dimensions.reduce((acc, d) => acc + d.obtainedPoints, 0) * 10) / 10;
  const overallPercentage = Math.round((totalPoints / 36) * 100);

  let verdict = '';
  const strengths: string[] = [];
  const potentialFrictions: string[] = [];
  const remedialSuggestions: string[] = [];

  if (overallPercentage >= 78) {
    verdict = 'Celestial Union (Uttam Milan): Extraordinary vibrational resonance across spiritual, emotional, and practical realms.';
    strengths.push('Exceptional intuitive communication and spontaneous empathy.');
    strengths.push('Planetary energies naturally multiply joint financial and domestic prosperity.');
    strengths.push('High karmic resilience against external disruptions.');
  } else if (overallPercentage >= 60) {
    verdict = 'Auspicious Match (Madhyam Milan): Favorable harmony that flourishes with mutual open dialogue.';
    strengths.push('Solid foundational respect and shared long-term aspirations.');
    strengths.push('Complementary skills where one partner grounds the other’s visions.');
    potentialFrictions.push('Periodic difference in emotional processing speed; one needs space while the other seeks immediate resolution.');
    remedialSuggestions.push('Keep a pair of rose quartz or silver elephants in the south-west bedroom corner for amplified harmony.');
  } else {
    verdict = 'Karmic Growth Partnership (Sadharan Milan): Strong personal attraction, but requires deliberate conscious adjustments to maintain peace.';
    potentialFrictions.push('Rivalry or ego friction between ruling planetary frequencies.');
    potentialFrictions.push('Misunderstandings regarding financial priorities and lifestyle pacing.');
    remedialSuggestions.push('Recite the Maha Mrityunjaya Mantra together on Mondays or light a ghee lamp for Goddess Lakshmi on Fridays.');
    remedialSuggestions.push('Schedule key joint decisions during Jupiter or Venus Horas to soften planetary friction.');
  }

  // Automatic Name + DOB Vibrations Compatibility Score (Mulank + Bhagyank + Chaldean Namank + Cross-Link)
  const relToScore = (rel: 'friendly' | 'neutral' | 'inimical', sameBonus: boolean) => {
    if (sameBonus) return 91;
    if (rel === 'friendly') return 94;
    if (rel === 'neutral') return 77;
    return 52;
  };
  const mulankRelND = getPlanetaryRelationship(m1, m2);
  const bhagyankRelND = getPlanetaryRelationship(b1, b2);
  const namankRelND = getPlanetaryRelationship(name1Analysis.chaldeanSingle, name2Analysis.chaldeanSingle);
  const cross1RelND = getPlanetaryRelationship(m1, name2Analysis.chaldeanSingle);
  const cross2RelND = getPlanetaryRelationship(m2, name1Analysis.chaldeanSingle);

  const mulankHarmony = relToScore(mulankRelND, m1 === m2);
  const bhagyankHarmony = relToScore(bhagyankRelND, b1 === b2);
  const compoundBonus =
    (name1Analysis.compoundInfo.type === 'fortunate' || name1Analysis.compoundInfo.type === 'auspicious' ? 4 : 0) +
    (name2Analysis.compoundInfo.type === 'fortunate' || name2Analysis.compoundInfo.type === 'auspicious' ? 4 : 0);
  const namankHarmony = Math.min(
    99,
    relToScore(namankRelND, name1Analysis.chaldeanSingle === name2Analysis.chaldeanSingle) +
      Math.round(compoundBonus / 2)
  );
  const crossNumberHarmony = Math.round(
    (relToScore(cross1RelND, m1 === name2Analysis.chaldeanSingle) +
      relToScore(cross2RelND, m2 === name1Analysis.chaldeanSingle)) /
      2
  );
  const nameDobOverallScore = Math.max(
    45,
    Math.min(
      98,
      Math.round(
        mulankHarmony * 0.3 +
          bhagyankHarmony * 0.25 +
          namankHarmony * 0.3 +
          crossNumberHarmony * 0.15
      )
    )
  );
  const nameDobVerdict =
    nameDobOverallScore >= 85
      ? 'Supremely Magnetic Name-DOB Synergy'
      : nameDobOverallScore >= 72
      ? 'Harmonious & Supportive Vibrations'
      : nameDobOverallScore >= 60
      ? 'Balanced Resonance (Spelling Tuning Helpful)'
      : 'Contrasting Vibrations — Name Alignment Recommended';
  const nameDobSummary = `Combines Groom (${p1.name}: M${m1}/B${b1}/N${name1Analysis.chaldeanSingle}) & Bride (${p2.name}: M${m2}/B${b2}/N${name2Analysis.chaldeanSingle}) across Chaldean Name Sound, Psychic Mulank & Destiny Bhagyank.`;

  // 9-Chakra Post-Marriage Challenges & Fortune Reading + Aura Scan Remedies (Earth Star #1 to Soul Star #9)
  const chakraChallenges = calculatePartnerChakraChallenges(
    m1,
    b1,
    name1Analysis.chaldeanSingle,
    m2,
    b2,
    name2Analysis.chaldeanSingle,
    p1.name,
    p2.name,
    astro1.rashi,
    astro2.rashi
  );

  // Perfect Name Suggestions considering real names & post-marriage surname option
  const p1Corrections = generateNameCorrections(p1.name, m1, b1);
  const p2Corrections = generateNameCorrections(p2.name, m2, b2);

  // Also test Partner 2 adopting Partner 1's surname for post-marriage harmony
  const p1Words = p1.name.trim().split(/\s+/);
  const p2Words = p2.name.trim().split(/\s+/);
  const p1Surname = p1Words.length > 1 ? p1Words[p1Words.length - 1] : '';
  const p2WithP1Surname = p1Surname ? `${p2Words[0]} ${p1Surname}` : p2.name;
  const p2MarriedCorrections = generateNameCorrections(p2WithP1Surname, m2, b2);

  const perfectNameSuggestions: CompatibilityAnalysis['perfectNameSuggestions'] = [];

  if (p1Corrections.length > 0) {
    const top1 = p1Corrections[0];
    perfectNameSuggestions.push({
      partnerLabel: 'Partner 1 (Personal Harmony)',
      currentName: p1.name,
      suggestedPerfectName: top1.suggestedName,
      compound: top1.compoundNumber,
      root: top1.singleDigit,
      title: top1.compoundTitle,
      maritalBenefit: `Aligns ${p1.name}'s vocal vibration with Mulank ${m1} & Partner 2's Mulank ${m2} to dissolve ego friction.`,
    });
  } else {
    perfectNameSuggestions.push({
      partnerLabel: 'Partner 1 (Personal Harmony)',
      currentName: p1.name,
      suggestedPerfectName: p1.name.toUpperCase(),
      compound: name1Analysis.totalChaldeanCompound,
      root: name1Analysis.chaldeanSingle,
      title: name1Analysis.compoundInfo.title,
      maritalBenefit: 'Current real name already vibrates at a royal harmonic frequency.',
    });
  }

  if (p2Corrections.length > 0) {
    const top2 = p2Corrections[0];
    perfectNameSuggestions.push({
      partnerLabel: 'Partner 2 (Maiden Name Harmony)',
      currentName: p2.name,
      suggestedPerfectName: top2.suggestedName,
      compound: top2.compoundNumber,
      root: top2.singleDigit,
      title: top2.compoundTitle,
      maritalBenefit: `Harmonizes ${p2.name}'s birth destiny (${b2}) with Partner 1's aura for emotional peace.`,
    });
  }

  if (p1Surname && p2MarriedCorrections.length > 0) {
    const topMarried = p2MarriedCorrections[0];
    perfectNameSuggestions.push({
      partnerLabel: 'Post-Marriage Surname Option',
      currentName: p2WithP1Surname,
      suggestedPerfectName: topMarried.suggestedName,
      compound: topMarried.compoundNumber,
      root: topMarried.singleDigit,
      title: topMarried.compoundTitle,
      maritalBenefit: `If adopting surname "${p1Surname.toUpperCase()}", this exact spelling locks in Venus/Jupiter marital bliss (Akhand Saubhagya).`,
    });
  }

  const summary = `Ashtakoot & Numerology synthesis between ${p1.name} (Mulank ${m1}, Bhagyank ${b1}, ${astro1.rashi}) and ${p2.name} (Mulank ${m2}, Bhagyank ${b2}, ${astro2.rashi}) yields ${totalPoints}/36 Gunas (${overallPercentage}%). ${verdict}`;

  return {
    partner1Name: p1.name,
    partner2Name: p2.name,
    p1Mulank: m1,
    p2Mulank: m2,
    p1Bhagyank: b1,
    p2Bhagyank: b2,
    p1Namank: name1Analysis.chaldeanSingle,
    p2Namank: name2Analysis.chaldeanSingle,
    p1Astrology: {
      rashi: astro1.rashi,
      sunSign: astro1.sunSign,
      nakshatra: astro1.nakshatra,
      pada: astro1.pada,
    },
    p2Astrology: {
      rashi: astro2.rashi,
      sunSign: astro2.sunSign,
      nakshatra: astro2.nakshatra,
      pada: astro2.pada,
    },
    dimensions,
    totalPoints,
    overallPercentage,
    nameDobCompatibility: {
      overallScore: nameDobOverallScore,
      mulankHarmony,
      bhagyankHarmony,
      namankHarmony,
      crossNumberHarmony,
      verdict: nameDobVerdict,
      summary: nameDobSummary,
    },
    verdict,
    summary,
    strengths,
    potentialFrictions,
    remedialSuggestions,
    chakraChallenges,
    perfectNameSuggestions,
  };
}

// ============================================================================
// DYNAMIC ASTRONOMICAL SURYA SANKRANTI & LUNAR TITHI SOLVER (LAHIRI SIDEREAL IST)
// ============================================================================
function buildDynamicSuryaSankrantiTransit(): PlanetaryTransit {
  const RASHI_NAMES_LIST = [
    'Mesh (Aries)',
    'Vrishabh (Taurus)',
    'Mithuna (Gemini)',
    'Karka (Cancer)',
    'Simha (Leo)',
    'Kanya (Virgo)',
    'Tula (Libra)',
    'Vrischika (Scorpio)',
    'Dhanu (Sagittarius)',
    'Makara (Capricorn)',
    'Kumbha (Aquarius)',
    'Meena (Pisces)',
  ];
  const nowMs = Date.now();
  const dNow = (nowMs - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;
  const { sunSidereal } = computeSiderealSunMoonAtDayJ2000(dNow);
  const currentRashiIdx = Math.floor(sunSidereal / 30) % 12;
  const nextRashiIdx = (currentRashiIdx + 1) % 12;
  const degIntoCurrentSign = sunSidereal - currentRashiIdx * 30;
  const approxStartMs = nowMs - (degIntoCurrentSign / 0.9856) * 86400000;
  const approxEndMs = nowMs + ((30 - degIntoCurrentSign) / 0.9856) * 86400000;

  const exactStartMs = solveSiderealSunIngressUtcMs(approxStartMs, currentRashiIdx * 30);
  const exactEndMs = solveSiderealSunIngressUtcMs(approxEndMs, nextRashiIdx * 30);

  const curRashiName = RASHI_NAMES_LIST[currentRashiIdx] || 'Vrischika (Scorpio)';
  const nextRashiName = RASHI_NAMES_LIST[nextRashiIdx] || 'Dhanu (Sagittarius)';
  const startLong = formatExactIstDateTime(exactStartMs, 'long');
  const endLong = formatExactIstDateTime(exactEndMs, 'long');
  const startShort = formatExactIstDateTime(exactStartMs, 'short24');
  const endShort = formatExactIstDateTime(exactEndMs, 'short24');

  return {
    id: 'surya-current-sankranti',
    planet: 'Sun (Surya Bhagwan)',
    transitName: `Surya Sankranti in ${curRashiName.split(' ')[0]} (Next: ${nextRashiName.split(' ')[0]})`,
    sign: `${curRashiName} ➔ ${nextRashiName}`,
    startDate: startLong,
    endDate: endLong,
    dateRange: `${startShort} ➔ ${endShort}`,
    impactType: 'spiritual',
    impactLevel: 'Surya Sankranti Vitality & Authority',
    summary: `Exact Lahiri Sidereal Solar ingress into ${curRashiName} activates soul vitality, administrative authority, and sacred Sankranti Punya Kaal before entering ${nextRashiName}.`,
    recommendation: 'Offer Arghya to the rising Sun in a copper vessel with red kumkum and hibiscus flowers within 1 hour of sunrise while resonating with 126.22 Hz & 528 Hz Solar Prana frequencies.',
    isCurrent: true,
  };
}

// Major Planetary Transits Database with Verified Drik Panchang Lahiri Sidereal Start & End Dates/Times (IST)
export const CELESTIAL_TRANSITS: PlanetaryTransit[] = [
  {
    id: 'shani-pisces',
    planet: 'Saturn (Shani Dev)',
    transitName: 'Saturn Transit in Meena (Pisces Gochar)',
    sign: 'Pisces (Meena Rashi)',
    startDate: '29 March 2025, 11:01 PM IST',
    endDate: '03 June 2027, 06:23 AM IST',
    dateRange: '29 Mar 2025 (23:01 IST) ➔ 03 Jun 2027 (06:23 IST)',
    impactType: 'transformational',
    impactLevel: 'High Karmic Transformation',
    summary: 'Saturn transits Sidereal Pisces (Meena Rashi) (2026 Vakri: 27 Jul 2026, 01:26 AM IST to 11 Dec 2026, 09:05 AM IST). Promotes spiritual discipline, restructuring of foreign/institutional assets, and karmic justice.',
    recommendation: 'Ground yourself with charitable acts on Saturdays. Perform Himalayan Salt Aura foot soak, light a sesame oil diya under a Peepal tree, and listen to 147.85 Hz & 396 Hz Saturn Grounding sound frequencies.',
    isCurrent: true,
  },
  {
    id: 'guru-cancer-leo',
    planet: 'Jupiter (Guru Brihaspati)',
    transitName: 'Jupiter Exaltation in Karka & Simha Gochar',
    sign: 'Cancer (Karka: 02 Jun–31 Oct 2026) ➔ Leo (Simha)',
    startDate: '02 June 2026, 02:25 AM IST (Simha Entry: 31 Oct 2026, 08:09 PM IST)',
    endDate: '25 January 2027, 05:19 PM IST (Karka Re-entry till 26 Jun 2027)',
    dateRange: '02 Jun 2026 (02:25 IST) ➔ 31 Oct 2026 (20:09 IST) ➔ 25 Jan 2027 (17:19 IST)',
    impactType: 'favorable',
    impactLevel: 'Supremely Auspicious (Hansa & Raj Yoga)',
    summary: 'Devaguru Brihaspati entered exalted Karka on 02 June 2026 (02:25 AM IST) and transits Royal Simha (Leo) from 31 October 2026 (08:09 PM IST) to 25 January 2027 (05:19 PM IST) before Vakri return to Karka.',
    recommendation: 'Auspicious window to launch educational/consulting enterprises, sign high-value contracts, wear Yellow Sapphire or a 5-Mukhi Rudraksha, and play 183.58 Hz & 432 Hz Guru Expansion sound frequencies.',
    isCurrent: true,
  },
  {
    id: 'rahu-ketu-axis',
    planet: 'Rahu & Ketu Nodal Axis',
    transitName: 'Rahu in Kumbha➔Makara & Ketu in Simha➔Karka',
    sign: 'Kumbha/Simha (till 05 Dec 2026) ➔ Makara/Karka',
    startDate: '18 May 2025, 04:30 PM IST (Makara/Karka Shift: 05 Dec 2026, 08:03 PM IST)',
    endDate: '24 June 2028, 09:18 AM IST',
    dateRange: '18 May 2025 (16:30 IST) ➔ 05 Dec 2026 (20:03 IST) ➔ 24 Jun 2028 (09:18 IST)',
    impactType: 'caution',
    impactLevel: 'Karmic Nodal Axis Transition',
    summary: 'True/Mean Rahu-Ketu complete their Kumbha-Simha transit on 05 December 2026 at 08:03 PM IST and enter Makara (Capricorn) & Karka (Cancer), shifting collective focus toward structured career execution and emotional security.',
    recommendation: 'Avoid impulsive leverage in markets. Burn Guggal/Camphor dhoop at sunset, chant Durga Kavach or Ganesha Atharvashirsha, and play 741 Hz & 852 Hz Nodal Detox sound frequencies.',
    isCurrent: true,
  },
  buildDynamicSuryaSankrantiTransit(),
  {
    id: 'mangal-simha-gochar',
    planet: 'Mars (Mangal Dev)',
    transitName: 'Mars Transit in Karka & Royal Simha (Leo)',
    sign: 'Cancer (Karka) ➔ Leo (Simha: 12 Nov 2026)',
    startDate: '12 November 2026, 01:36 PM IST',
    endDate: '07 July 2027, 03:14 AM IST',
    dateRange: '12 Nov 2026 (13:36 IST) ➔ 07 Jul 2027 (03:14 IST)',
    impactType: 'transformational',
    impactLevel: 'High Executive Courage & Property Yoga',
    summary: 'Mars exits debilitation in Karka and enters friendly fiery Simha (Leo) on 12 November 2026 at 01:36 PM IST, forming Guru-Mangal Yoga that accelerates real estate decisions, administrative command, and vitality.',
    recommendation: 'Recite Hanuman Chalisa on Tuesdays, donate red masoor dal or jaggery, avoid hasty arguments, and listen to 144.72 Hz & 528 Hz Martian Courage sound frequencies.',
    isCurrent: true,
  },
  {
    id: 'budha-shukra-transit',
    planet: 'Mercury (Budha) & Venus (Shukra)',
    transitName: 'Budha Vrischika Gochar & Shukra Malavya Yoga in Tula',
    sign: 'Scorpio (Budha) & Libra (Shukra Moolatrikona)',
    startDate: '24 October 2026, 12:42 PM IST (Direct: 13 Nov 2026, 09:23 PM IST)',
    endDate: '06 January 2027, 07:48 AM IST',
    dateRange: '24 Oct 2026 (12:42 IST) ➔ 13 Nov 2026 (21:23 IST) ➔ 06 Jan 2027 (07:48 IST)',
    impactType: 'favorable',
    impactLevel: 'Commercial & Luxury Malavya Yoga',
    summary: 'Mercury turns direct (Margi) in Scorpio on 13 November 2026 (09:23 PM IST) while Venus transits its Moolatrikona sign Libra (Tula), activating Malavya Raj Yoga for trade contracts, vehicles, jewellery, and marital harmony.',
    recommendation: 'Ideal window for Partner Milan, signing audited commercial deeds after 14 Nov, energizing Rose Quartz in the bedroom, and playing 141.27 Hz, 221.23 Hz & 639 Hz Budha-Shukra frequencies.',
    isCurrent: true,
  },
];

// Dynamically solved Upcoming Moon Phases (Exact Astronomical Tithi Start & End Timings in IST)
function buildUpcomingAstronomicalMoonPhases(): MoonPhase[] {
  const nowMs = Date.now();
  const msPerDay = 86400000;
  const synodicDays = 29.530588853;
  // Reference New Moon (Amavasya end = 360°): Jan 29, 2025 12:36 UTC
  const refAmavasyaEndMs = Date.UTC(2025, 0, 29, 12, 36, 0);
  const cyclesSinceRef = (nowMs - 5 * msPerDay - refAmavasyaEndMs) / (synodicDays * msPerDay);
  const baseCycle = Math.floor(cyclesSinceRef);

  const candidates: {
    sortMs: number;
    phase: MoonPhase;
  }[] = [];

  for (let c = baseCycle; c <= baseCycle + 2; c++) {
    const cycleAmavasyaEndApprox = refAmavasyaEndMs + c * synodicDays * msPerDay;

    // 1. Krishna Amavasya Tithi (Elongation 348° -> 360°)
    const amavasyaStartMs = solveElongationCrossingUtcMs(cycleAmavasyaEndApprox - 1.0 * msPerDay, 348);
    const amavasyaEndMs = solveElongationCrossingUtcMs(cycleAmavasyaEndApprox, 0);
    if (amavasyaEndMs >= nowMs - 3 * msPerDay) {
      const startStr = formatExactIstDateTime(amavasyaStartMs, 'short');
      const endStr = formatExactIstDateTime(amavasyaEndMs, 'short');
      const dateLabel = startStr.split(',')[0] === endStr.split(',')[0]
        ? startStr.split(',')[0]
        : `${startStr.split(',')[0].slice(0, 6)} – ${endStr.split(',')[0]}`;
      candidates.push({
        sortMs: amavasyaStartMs,
        phase: {
          name: 'Darsha / Masik Amavasya (New Moon)',
          tithi: 'Krishna Amavasya Tithi (30th Tithi)',
          paksha: 'Krishna Paksha (Waning)',
          date: dateLabel,
          startTime: startStr,
          endTime: endStr,
          auspiciousness: 'Supremely Auspicious for Pitru Tarpan, Lakshmi-Kubera Puja & Aura Shielding',
          recommendedRitual: 'Light pure cow ghee & sesame diyas, perform Pitru Tarpan at noon, cleanse home corners with rock salt water, and play 396 Hz & 852 Hz Aura-Shielding sound frequencies.',
          illumination: 0,
        },
      });
    }

    // 2. Shukla Ekadashi Tithi (Elongation 120° -> 132°)
    const shuklaEkadashiApprox = cycleAmavasyaEndApprox + 10.8 * msPerDay;
    const shuklaEkStartMs = solveElongationCrossingUtcMs(shuklaEkadashiApprox - 0.8 * msPerDay, 120);
    const shuklaEkEndMs = solveElongationCrossingUtcMs(shuklaEkadashiApprox + 0.2 * msPerDay, 132);
    if (shuklaEkEndMs >= nowMs - 3 * msPerDay) {
      const startStr = formatExactIstDateTime(shuklaEkStartMs, 'short');
      const endStr = formatExactIstDateTime(shuklaEkEndMs, 'short');
      const dateLabel = startStr.split(',')[0] === endStr.split(',')[0]
        ? startStr.split(',')[0]
        : `${startStr.split(',')[0].slice(0, 6)} – ${endStr.split(',')[0]}`;
      candidates.push({
        sortMs: shuklaEkStartMs,
        phase: {
          name: 'Shukla Paksha Ekadashi (Vishnu Prabodhini)',
          tithi: 'Shukla Ekadashi Tithi (11th Waxing Tithi)',
          paksha: 'Shukla Paksha (Waxing)',
          date: dateLabel,
          startTime: startStr,
          endTime: endStr,
          auspiciousness: 'Supreme Hari-Vasara Window for Wealth, Sattvic Vrat & Dharmic Siddhi',
          recommendedRitual: 'Observe Sattvic Ekadashi Vrat, offer Tulsi Dal to Lord Vishnu, chant Vishnu Sahasranama, and play 432 Hz & 528 Hz Sattvic Narayana sound frequencies for family harmony.',
          illumination: 79,
        },
      });
    }

    // 3. Shukla Purnima Tithi (Elongation 168° -> 180°)
    const purnimaApprox = cycleAmavasyaEndApprox + 14.765 * msPerDay;
    const purnimaStartMs = solveElongationCrossingUtcMs(purnimaApprox - 0.9 * msPerDay, 168);
    const purnimaEndMs = solveElongationCrossingUtcMs(purnimaApprox, 180);
    if (purnimaEndMs >= nowMs - 3 * msPerDay) {
      const startStr = formatExactIstDateTime(purnimaStartMs, 'short');
      const endStr = formatExactIstDateTime(purnimaEndMs, 'short');
      const dateLabel = startStr.split(',')[0] === endStr.split(',')[0]
        ? startStr.split(',')[0]
        : `${startStr.split(',')[0].slice(0, 6)} – ${endStr.split(',')[0]}`;
      candidates.push({
        sortMs: purnimaStartMs,
        phase: {
          name: 'Shukla Purnima (Full Moon Illumination)',
          tithi: 'Shukla Purnima Tithi (15th Full Moon Tithi)',
          paksha: 'Shukla Paksha (Waxing)',
          date: dateLabel,
          startTime: startStr,
          endTime: endStr,
          auspiciousness: 'Supreme Full Moon of Satyanarayan Puja, Deepdaan & Chandra Aura Charging',
          recommendedRitual: 'Chant "Om Som Somaya Namah" under moonlight, charge drinking water in a silver vessel for 2 hours, and meditate with 210.42 Hz & 639 Hz Lunar Purnima sound frequencies.',
          illumination: 100,
        },
      });
    }

    // 4. Krishna Ekadashi Tithi (Elongation 300° -> 312°)
    const krishnaEkApprox = cycleAmavasyaEndApprox + 25.5 * msPerDay;
    const krishnaEkStartMs = solveElongationCrossingUtcMs(krishnaEkApprox - 0.8 * msPerDay, 300);
    const krishnaEkEndMs = solveElongationCrossingUtcMs(krishnaEkApprox + 0.2 * msPerDay, 312);
    if (krishnaEkEndMs >= nowMs - 3 * msPerDay) {
      const startStr = formatExactIstDateTime(krishnaEkStartMs, 'short');
      const endStr = formatExactIstDateTime(krishnaEkEndMs, 'short');
      const dateLabel = startStr.split(',')[0] === endStr.split(',')[0]
        ? startStr.split(',')[0]
        : `${startStr.split(',')[0].slice(0, 6)} – ${endStr.split(',')[0]}`;
      candidates.push({
        sortMs: krishnaEkStartMs,
        phase: {
          name: 'Krishna Paksha Ekadashi (Karmic Cleansing)',
          tithi: 'Krishna Ekadashi Tithi (11th Waning Tithi)',
          paksha: 'Krishna Paksha (Waning)',
          date: dateLabel,
          startTime: startStr,
          endTime: endStr,
          auspiciousness: 'Auspicious for Debt Clearance, Karmic Detox & Narayana Kavach Sadhana',
          recommendedRitual: 'Offer yellow flowers and Tulsi leaves to Lord Krishna, donate grains to the needy, and listen to 528 Hz & 741 Hz Pranic Detox sound frequencies.',
          illumination: 22,
        },
      });
    }
  }

  candidates.sort((a, b) => a.sortMs - b.sortMs);
  return candidates.slice(0, 4).map((c) => c.phase);
}

export const UPCOMING_MOON_PHASES: MoonPhase[] = buildUpcomingAstronomicalMoonPhases();

