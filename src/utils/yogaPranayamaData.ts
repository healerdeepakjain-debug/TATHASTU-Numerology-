import { BirthProfile } from '../types';
import {
  calculateMulank,
  calculateBhagyank,
  PLANETARY_PROFILES,
  analyzeName,
} from './numerology';
import {
  calculateVedicAstrologyFromBirth,
  calculateCareerAndAuraProfile,
} from './astrologyAndCities';

export interface HealthConcernOption {
  id: string;
  label: string;
  hindiLabel: string;
  ayurvedicDosha: string;
  targetChakra: string;
  shortDesc: string;
}

export const HEALTH_CONCERN_OPTIONS: HealthConcernOption[] = [
  {
    id: 'stress_anxiety',
    label: 'Stress, Anxiety & Insomnia (Overthinking)',
    hindiLabel: 'मानसिक तनाव, चिंता एवं अनिद्रा',
    ayurvedicDosha: 'Vata-Rahu Aggravation',
    targetChakra: 'Ajna (Third Eye) & Sahasrara (Crown)',
    shortDesc: 'Calms hyperactive nervous system, Moon/Rahu mental restlessness, and sleep disturbances.',
  },
  {
    id: 'digestive_pitta',
    label: 'Acidity, Indigestion & Gut Heat (Pitta)',
    hindiLabel: 'एसिडिटी, पाचन विकार एवं पित्त दोष',
    ayurvedicDosha: 'Solar/Martian Pitta Excess',
    targetChakra: 'Manipura (Solar Plexus Chakra)',
    shortDesc: 'Balances Jatharagni (digestive fire), liver/gallbladder heat, and solar plexus inflammation.',
  },
  {
    id: 'back_joint_pain',
    label: 'Lower Back, Cervical & Joint Stiffness',
    hindiLabel: 'कमर दर्द, सर्वाइकल एवं जोड़ों में जकड़न',
    ayurvedicDosha: 'Shani Vata-Stiffness',
    targetChakra: 'Muladhara (Root Chakra)',
    shortDesc: 'Lubricates spinal vertebrae, relieves sciatica/cervical tension, and grounds Saturnian Vata.',
  },
  {
    id: 'bp_cardiac',
    label: 'Blood Pressure, Heart Palpitations & Circulation',
    hindiLabel: 'रक्तचाप (BP), हृदय एवं रक्त संचार',
    ayurvedicDosha: 'Vyana Vayu & Surya-Mangal Imbalance',
    targetChakra: 'Anahata (Heart Chakra)',
    shortDesc: 'Stabilizes arterial pressure, strengthens cardiac prana, and harmonizes emotional stress.',
  },
  {
    id: 'hormonal_pcos_thyroid',
    label: 'Thyroid, PCOS/PCOD & Hormonal Imbalance',
    hindiLabel: 'थायरॉइड, पीसीओडी एवं हार्मोनल असंतुलन',
    ayurvedicDosha: 'Shukra-Budha Endocrine Shift',
    targetChakra: 'Vishuddha (Throat) & Svadhisthana (Sacral)',
    shortDesc: 'Stimulates thyroid/parathyroid glands and balances reproductive & lunar endocrine cycles.',
  },
  {
    id: 'fatigue_low_prana',
    label: 'Chronic Fatigue, Low Immunity & Lethargy',
    hindiLabel: 'शारीरिक थकान, कम इम्युनिटी एवं आलस्य',
    ayurvedicDosha: 'Ojas Depletion & Kapha-Saturn Heaviness',
    targetChakra: 'Manipura & Muladhara Chakra',
    shortDesc: 'Awakens cellular Ojas, respiratory capacity, and solar vitality.',
  },
  {
    id: 'weight_metabolism',
    label: 'Weight Gain, Slow Metabolism & Water Retention',
    hindiLabel: 'मोटापा, धीमा मेटाबॉलिज्म एवं कफ वृद्धि',
    ayurvedicDosha: 'Guru-Chandra Kapha Accumulation',
    targetChakra: 'Manipura (Solar Plexus)',
    shortDesc: 'Ignites metabolic Agni, lymphatic drainage, and endocrine fat-burning.',
  },
  {
    id: 'focus_memory',
    label: 'Brain Fog, Lack of Focus & Mercurial Nervousness',
    hindiLabel: 'एकाग्रता की कमी एवं मानसिक भटकाव',
    ayurvedicDosha: 'Prana Vayu & Budha-Ketu Scatter',
    targetChakra: 'Ajna (Third Eye Chakra)',
    shortDesc: 'Synchronizes left-right brain hemispheres (Ida & Pingala Nadis) for razor-sharp memory.',
  },
];

export type PostureDiagramType =
  | 'surya_namaskar'
  | 'vrikshasana'
  | 'bhujangasana'
  | 'paschimottanasana'
  | 'setu_bandhasana'
  | 'balasana'
  | 'trikonasana'
  | 'ardha_matsyendrasana'
  | 'viparita_karani'
  | 'vajrasana_mandukasana';

export type PranayamaDiagramType =
  | 'nadi_shodhana'
  | 'bhramari'
  | 'surya_bhedana'
  | 'sheetali_sheetkari'
  | 'kapalabhati_agnisara'
  | 'ujjayi_kumbhaka';

export interface YogaPosturePrescription {
  id: string;
  sanskritName: string;
  englishName: string;
  hindiName: string;
  category: 'Core Birth Chart Asana' | 'Rashi & Nakshatra Asana' | 'Health Concern Therapeutic Asana';
  governingPlanet: string;
  targetChakra: string;
  chakraColor: string;
  diagramType: PostureDiagramType;
  durationOrReps: string;
  bestTimeAndDirection: string;
  breathingCue: string;
  stepByStepAlignment: string[];
  astrologicalReason: string;
  therapeuticBenefits: string[];
  precaution: string;
}

export interface PranayamaPrescription {
  id: string;
  sanskritName: string;
  englishName: string;
  hindiName: string;
  governingPlanet: string;
  targetNadiAndChakra: string;
  diagramType: PranayamaDiagramType;
  breathingRatio: string;
  roundsAndDuration: string;
  mudraAndBandha: string;
  beejMantra: string;
  stepByStepTechnique: string[];
  astrologicalAndHealthBenefit: string;
}

export interface WeeklyYogaDayPlan {
  dayIndex: number; // 0 = Sunday .. 6 = Saturday
  dayName: string;
  hindiDay: string;
  rulingPlanet: string;
  planetNumber: number;
  themeTitle: string;
  chakraFocus: string;
  colorTheme: string;
  morningAsanas: {
    name: string;
    sanskritName: string;
    duration: string;
    diagramType: PostureDiagramType;
    focusCue: string;
  }[];
  pranayamaPractice: {
    name: string;
    ratio: string;
    rounds: string;
  };
  mudraAndMantra: {
    mudra: string;
    mantra: string;
  };
  personalChartSynergy: string;
}

export interface PersonalizedYogaPranayamaPlan {
  mulank: number;
  bhagyank: number;
  namank: number;
  rashi: string;
  sunSign: string;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
  dominantDoshaConstitution: string;
  primaryChakra: string;
  secondaryChakra: string;
  selectedHealthConcerns: HealthConcernOption[];
  dailyAsanas: YogaPosturePrescription[];
  dailyPranayamas: PranayamaPrescription[];
  weeklyPlanner: WeeklyYogaDayPlan[];
  dailySadhanaTimetable: {
    slot: string;
    practice: string;
    purpose: string;
  }[];
  ayurvedicAharaTips: string[];
}

const PLANET_ASANA_MASTER: Record<
  number,
  {
    sanskritName: string;
    englishName: string;
    hindiName: string;
    diagramType: PostureDiagramType;
    targetChakra: string;
    chakraColor: string;
    durationOrReps: string;
    breathingCue: string;
    steps: string[];
    benefits: string[];
    precaution: string;
  }
> = {
  1: {
    sanskritName: 'Surya Namaskar & Tadasana',
    englishName: '12-Step Classical Sun Salutation',
    hindiName: 'सूर्य नमस्कार एवं ताड़ासन',
    diagramType: 'surya_namaskar',
    targetChakra: 'Manipura (Solar Plexus) & Sahasrara (Crown)',
    chakraColor: '#F59E0B',
    durationOrReps: '5 to 7 Rounds (12 Mantras) at Sunrise',
    breathingCue: 'Inhale on backward bends (chest expansion); Exhale on forward folds (core contraction).',
    steps: [
      'Stand facing East in Pranamasana (prayer pose) at chest center, visualizing a golden rising Sun at the Solar Plexus.',
      'Inhale, sweep arms overhead into Hastauttanasana, lengthening the thoracic spine.',
      'Exhale, fold forward into Padahastasana, then step back into Ashwa Sanchalanasana and Bhujangasana.',
      'Complete the 12-posture cycle chanting the 12 Aditya mantras (Om Mitraya Namah to Om Bhaskaraya Namah).',
    ],
    benefits: [
      'Supercharges Pingala (Solar) Nadi, bone density, cardiovascular vigor, and executive leadership aura.',
      'Removes lethargy, low blood pressure, and spinal stiffness.',
    ],
    precaution: 'Perform at a gentle pace if experiencing high blood pressure or acute lumbar disc slip.',
  },
  2: {
    sanskritName: 'Chandra Namaskar & Setu Bandhasana',
    englishName: 'Bridge Pose & Cooling Lunar Flow',
    hindiName: 'सेतु बंधासन एवं चंद्र नमस्कार',
    diagramType: 'setu_bandhasana',
    targetChakra: 'Svadhisthana (Sacral) & Anahata (Heart)',
    chakraColor: '#38BDF8',
    durationOrReps: '3 Holds × 45 Seconds each',
    breathingCue: 'Deep abdominal inhalation lifting the pelvis; slow cooling exhalation lowering vertebra by vertebra.',
    steps: [
      'Lie supine on your mat, bend knees with heels close to sitting bones, feet hip-width apart.',
      'Inhale deeply, press feet into the earth and lift hips toward the sky while clasping hands beneath the sacrum.',
      'Rest the chin lightly toward the sternum (Jalandhara Bandha effect), calming the thyroid and lunar mind.',
      'Hold with slow Ujjayi breaths, then exhale gently releasing the spine down.',
    ],
    benefits: [
      'Stabilizes Chandra (Moon) emotional waves, hormonal cycles, and lymphatic circulation.',
      'Relieves anxiety, lower back ache, and thyroid sluggishness.',
    ],
    precaution: 'Avoid neck rotation while in the full bridge elevation.',
  },
  3: {
    sanskritName: 'Ardha Matsyendrasana & Vajrasana',
    englishName: 'Seated Half Lord of the Fishes Spinal Twist',
    hindiName: 'अर्ध मत्स्येन्द्रासन एवं वज्रासन',
    diagramType: 'ardha_matsyendrasana',
    targetChakra: 'Manipura (Solar Plexus) & Vishuddha (Throat)',
    chakraColor: '#EAB308',
    durationOrReps: '60 Seconds per side × 2 Rounds',
    breathingCue: 'Inhale to lengthen the crown upward; Exhale to rotate deeper from the navel center.',
    steps: [
      'Sit tall with legs extended; bend the right knee and place the right foot flat outside the left thigh.',
      'Bend the left knee so the left heel rests beside the right hip, keeping both sit-bones grounded.',
      'Inhale, raise the left arm; exhale, hook the left elbow outside the right knee and twist the torso right.',
      'Gaze softly over the right shoulder while breathing calmly into the liver and pancreas zone.',
    ],
    benefits: [
      'Harmonizes Guru (Jupiter) organs—liver, pancreas, spleen, and lipid metabolism.',
      'Awakens Kundalini along Sushumna Nadi and prevents metabolic sluggishness.',
    ],
    precaution: 'Practice gently without jerking if you have severe spinal disc herniation.',
  },
  4: {
    sanskritName: 'Vrikshasana (Tree Pose)',
    englishName: 'Grounded One-Legged Cosmic Tree Posture',
    hindiName: 'वृक्षासन (राहु संतुलन आसन)',
    diagramType: 'vrikshasana',
    targetChakra: 'Muladhara (Root) & Ajna (Third Eye)',
    chakraColor: '#F97316',
    durationOrReps: '60 Seconds per leg × 3 Rounds',
    breathingCue: 'Steady 4-second nasal inhale and 6-second grounding exhale while fixing Drishti (gaze).',
    steps: [
      'Stand tall in Tadasana, rooting all four corners of the left foot firmly into the earth.',
      'Place the sole of the right foot against the inner left thigh (or calf—never directly on the knee joint).',
      'Bring palms into Anjali Mudra at the heart or extend overhead like branches, fixing your gaze (Drishti) on a still point.',
      'Breathe slowly into Muladhara Chakra to dissolve Rahu mental scatter and anchor nervous stability.',
    ],
    benefits: [
      'Neutralizes Rahu (4) restlessness, vertigo, overthinking, and scattered concentration.',
      'Strengthens ankles, calves, pelvic stability, and neuromuscular coordination.',
    ],
    precaution: 'Use wall support if experiencing vertigo or ankle injury.',
  },
  5: {
    sanskritName: 'Trikonasana & Paschimottanasana',
    englishName: 'Sacred Triangle & Seated Forward Bend',
    hindiName: 'त्रिकोणासन एवं पश्चिमोत्तानासन',
    diagramType: 'trikonasana',
    targetChakra: 'Vishuddha (Throat) & Anahata (Heart)',
    chakraColor: '#10B981',
    durationOrReps: '45 Seconds per side + 60 Seconds Forward Fold',
    breathingCue: 'Inhale expanding lateral ribcage; Exhale extending laterally and releasing nervous tension.',
    steps: [
      'Step feet 3.5 feet apart, turn right foot out 90 degrees and left foot in 15 degrees.',
      'Inhale, extend both arms parallel to the floor; exhale, reach right hand down to shin/ankle and left arm straight up.',
      'Keep both waist sides long and open the chest, gazing toward the raised left thumb.',
      'Follow with seated Paschimottanasana (forward fold) to soothe the entire cerebrospinal nervous system.',
    ],
    benefits: [
      'Tunes Budha (Mercury) central nervous system, vocal clarity, respiratory elasticity, and digestion.',
      'Relieves neck/shoulder tension from desk work and sharpens analytical reflexes.',
    ],
    precaution: 'Keep knees micro-bent during forward fold if hamstrings are tight.',
  },
  6: {
    sanskritName: 'Bhujangasana & Baddha Konasana',
    englishName: 'Royal Cobra Pose & Bound Angle Butterfly',
    hindiName: 'भुजंगासन एवं बद्ध कोणासन',
    diagramType: 'bhujangasana',
    targetChakra: 'Swadhisthana (Sacral) & Anahata (Heart)',
    chakraColor: '#EC4899',
    durationOrReps: '4 Rounds × 30 Seconds Hold',
    breathingCue: 'Inhale curling the chest upward from the heart center; Exhale softening the shoulders away from ears.',
    steps: [
      'Lie prone on the abdomen with legs extended together, tops of feet pressing into the mat.',
      'Place palms under shoulders, elbows hugged close to the ribcage.',
      'Inhale, press pubic bone down and lift head, chest, and upper abdomen using back muscles.',
      'Follow with 2 minutes of seated Baddha Konasana (Butterfly pose) to circulate prana through the pelvic basin.',
    ],
    benefits: [
      'Energizes Shukra (Venus) vitality, kidney/adrenal function, reproductive health, and radiant skin glow.',
      'Opens the Anahata Heart Chakra for emotional grace and spinal suppleness.',
    ],
    precaution: 'Avoid over-arch in the lower back; engage abdominal core gently.',
  },
  7: {
    sanskritName: 'Balasana & Viparita Karani',
    englishName: 'Child’s Surrender & Legs-Up-The-Wall Inversion',
    hindiName: 'बालासन एवं विपरीत करणी मुद्रा',
    diagramType: 'viparita_karani',
    targetChakra: 'Ajna (Third Eye) & Sahasrara (Crown)',
    chakraColor: '#14B8A6',
    durationOrReps: '3 to 5 Minutes Restorative Hold',
    breathingCue: 'Slow 4-second inhale; elongated 8-second exhale releasing all psychic and muscular knots.',
    steps: [
      'Begin in Balasana (Child’s Pose), resting the Third Eye (Ajna Chakra) gently on the mat or folded palms.',
      'Transition to Viparita Karani by lying on your back and extending both legs vertically up against a wall.',
      'Rest arms out to the sides with palms facing upward, allowing venous blood and lymph to drain effortlessly toward the heart and brain.',
      'Focus awareness between the eyebrows while mentally repeating "So-Hum".',
    ],
    benefits: [
      'Harmonizes Ketu (7) mystic sensitivity, relieves varicose veins, nervous exhaustion, and psychic fatigue.',
      'Awakens pineal/pituitary intuition and deep restorative sleep.',
    ],
    precaution: 'Practice flat on the floor without hip elevation during menstruation or glaucoma.',
  },
  8: {
    sanskritName: 'Paschimottanasana & Pawanmuktasana',
    englishName: 'Seated Posterior Stretch & Wind-Relieving Pose',
    hindiName: 'पश्चिमोत्तानासन एवं पवनमुक्तासन',
    diagramType: 'paschimottanasana',
    targetChakra: 'Muladhara (Root Chakra)',
    chakraColor: '#6366F1',
    durationOrReps: '3 Rounds × 45 Seconds each',
    breathingCue: 'Inhale lengthening the spine; Exhale folding forward from the hip crease to release Vata.',
    steps: [
      'Sit in Dandasana with legs extended straight forward and toes flexed toward you.',
      'Inhale, raise both arms overhead, creating space between every vertebra.',
      'Exhale, hinge forward from the pelvis to hold shins, ankles, or big toes while keeping the spine long.',
      'Follow with supine Pawanmuktasana (hugging knees to chest) to release trapped Apana Vayu from joints and colon.',
    ],
    benefits: [
      'Pacifies Shani (Saturn) Vata dryness, sciatica, knee/joint stiffness, and chronic constipation.',
      'Builds patience, spinal longevity, and grounded Muladhara stability.',
    ],
    precaution: 'Bend knees slightly if experiencing lower back pain or sciatica flare-up.',
  },
  9: {
    sanskritName: 'Virabhadrasana II & Vajrasana-Mandukasana',
    englishName: 'Warrior II Posture & Thunderbolt Frog Pose',
    hindiName: 'वीरभद्रासन एवं वज्रासन-मंडूकासन',
    diagramType: 'vajrasana_mandukasana',
    targetChakra: 'Manipura (Solar Plexus) & Muladhara (Root)',
    chakraColor: '#EF4444',
    durationOrReps: '45 Seconds per side + 3 Rounds Mandukasana',
    breathingCue: 'Powerful diaphragmatic breath in Warrior; Exhale completely and pull navel in during Mandukasana.',
    steps: [
      'Channel Martian courage in Virabhadrasana II (Warrior II) with front knee bent at 90° and arms extended strongly.',
      'Then kneel in Vajrasana (Thunderbolt pose), formAdi Mudra fists (thumbs tucked inside fingers) and place them either side of the navel.',
      'Inhale deeply; exhale completely, lean forward pressing the fists gently into the abdomen, looking forward.',
      'Hold for 20–30 seconds with normal shallow breathing, then inhale returning upright.',
    ],
    benefits: [
      'Channels Mangal (Mars) fiery muscular energy constructively while cooling digestive Pitta and blood sugar.',
      'Strengthens core willpower, quadriceps, and pancreas/digestive enzymes.',
    ],
    precaution: 'Avoid Mandukasana abdominal pressure after recent abdominal surgery or peptic ulcers.',
  },
};

const HEALTH_CONCERN_THERAPEUTIC_MAP: Record<
  string,
  {
    asana: YogaPosturePrescription;
    pranayama: PranayamaPrescription;
    aharaTip: string;
  }
> = {
  stress_anxiety: {
    asana: {
      id: 'hc-balasana-stress',
      sanskritName: 'Shashankasana / Balasana & Viparita Karani',
      englishName: 'Moon-Hare Child’s Pose & Restorative Inversion',
      hindiName: 'शशांकासन / बालासन (तनाव एवं अनिद्रा निवारण)',
      category: 'Health Concern Therapeutic Asana',
      governingPlanet: 'Moon (Chandra) & Ketu',
      targetChakra: 'Ajna (Third Eye) & Sahasrara (Crown)',
      chakraColor: '#818CF8',
      diagramType: 'balasana',
      durationOrReps: '3 to 5 Minutes before bedtime',
      bestTimeAndDirection: 'Evening Sandhya or Pre-Sleep • Facing East or North',
      breathingCue: '4-second nasal inhale • 8-second slow vagus-nerve exhale.',
      stepByStepAlignment: [
        'Kneel on a soft mat, sit back on heels, and widen knees slightly to allow effortless belly breathing.',
        'Exhale and fold torso forward, resting the forehead (Ajna Chakra) on the mat or a bolster.',
        'Extend arms gently forward or rest them alongside the body with palms up in total mental surrender.',
      ],
      astrologicalReason:
        'Specifically prescribed for your profile concern (Stress, Anxiety & Insomnia) to ground hyperactive Vata-Rahu air currents and soothe the Lunar mental body (Manomaya Kosha).',
      therapeuticBenefits: [
        'Activates the parasympathetic vagus nerve within 90 seconds, lowering cortisol and heart rate.',
        'Relieves tension headaches, overthinking loops, and midnight awakening.',
      ],
      precaution: 'Place a cushion under the hips if knee flexion feels tight.',
    },
    pranayama: {
      id: 'hc-bhramari',
      sanskritName: 'Bhramari Pranayama (Shanmukhi Mudra)',
      englishName: 'Humming Black Bee Sonic Breath',
      hindiName: 'भ्रामरी प्राणायाम (षण्मुखी मुद्रा सहित)',
      governingPlanet: 'Moon (Chandra) & Venus (Shukra)',
      targetNadiAndChakra: 'Ida Nadi • Ajna & Vishuddha Chakra',
      diagramType: 'bhramari',
      breathingRatio: '4s Inhale : 10s Humming Exhale ("Mmmmm")',
      roundsAndDuration: '9 to 11 Rounds (Morning & Before Sleep)',
      mudraAndBandha: 'Shanmukhi Mudra or Gyan Mudra',
      beejMantra: 'Om Shreem Chandramase Namah',
      stepByStepTechnique: [
        'Sit comfortably with spine erect; gently close ear tragus flaps with thumbs and rest fingers lightly over eyes and face.',
        'Inhale deeply through both nostrils into the upper chest and crown.',
        'Exhale slowly making a steady, resonant honey-bee humming sound ("Hmmmmm"), feeling acoustic nitric-oxide vibration across the hypothalamus and pineal gland.',
      ],
      astrologicalAndHealthBenefit:
        'Dissolves Rahu-Moon anxiety, lowers high blood pressure, cures insomnia, and bathes the brain in calming alpha-theta waves.',
    },
    aharaTip:
      'For Stress & Insomnia: Drink warm cow milk (or almond milk) with a pinch of nutmeg (Jaiphal) and cardamom 45 minutes before sleep, and massage soles of feet with warm sesame/ghee.',
  },
  digestive_pitta: {
    asana: {
      id: 'hc-vajrasana-pitta',
      sanskritName: 'Vajrasana & Mandukasana',
      englishName: 'Diamond Thunderbolt Pose & Frog Digestive Press',
      hindiName: 'वज्रासन एवं मंडूकासन (पाचन एवं पित्त शांति)',
      category: 'Health Concern Therapeutic Asana',
      governingPlanet: 'Jupiter (Guru) & Mars (Mangal)',
      targetChakra: 'Manipura (Solar Plexus Chakra)',
      chakraColor: '#F59E0B',
      diagramType: 'vajrasana_mandukasana',
      durationOrReps: '5–10 Mins Vajrasana after meals + 3 Rounds Mandukasana morning',
      bestTimeAndDirection: 'Vajrasana immediately after lunch/dinner; Mandukasana empty stomach morning',
      breathingCue: 'Slow diaphragmatic breaths into the navel center.',
      stepByStepAlignment: [
        'Fold both knees and sit between the heels with big toes touching behind you and spine naturally upright.',
        'Rest palms on knees in Chinmaya Mudra; this is the only Vedic asana practiced immediately after meals.',
        'In the morning on an empty stomach, add 3 rounds of Mandukasana gentle navel compression.',
      ],
      astrologicalReason:
        'Directly targets your selected digestive/acidity concern by redirecting blood flow to the splanchnic pelvic/digestive nerves governed by Manipura Chakra.',
      therapeuticBenefits: [
        'Eliminates hyperacidity, bloating, acid reflux, and sluggish liver/pancreas enzyme secretion.',
        'Prevents post-meal lethargy and stabilizes blood glucose.',
      ],
      precaution: 'Place a rolled towel under ankles if ankle joints feel stiff.',
    },
    pranayama: {
      id: 'hc-sheetali',
      sanskritName: 'Sheetali & Sheetkari Pranayama',
      englishName: 'Cooling Lunar Tongue Breath',
      hindiName: 'शीतली एवं शीतकारी प्राणायाम',
      governingPlanet: 'Moon (Chandra)',
      targetNadiAndChakra: 'Chandra (Ida) Nadi • Manipura & Vishuddha',
      diagramType: 'sheetali_sheetkari',
      breathingRatio: '4s Rolled-Tongue Inhale : 4s Hold : 6s Nasal Exhale',
      roundsAndDuration: '9 Rounds during midday or after morning asanas',
      mudraAndBandha: 'Apana Vayu Mudra + Jalandhara Bandha',
      beejMantra: 'Om Vam स्वाधिष्ठानाय नमः',
      stepByStepTechnique: [
        'Sit tall, roll the sides of the tongue into a tube (or gently clench teeth in Sheetkari if tongue doesn’t roll).',
        'Inhale cool air slowly through the wet tongue tube as if sipping through a straw.',
        'Close the mouth, hold for 4 seconds, and exhale warm air slowly through both nostrils.',
      ],
      astrologicalAndHealthBenefit:
        'Instantly cools excess Martian/Solar Pitta heat, heals acid reflux, mouth ulcers, skin inflammation, and fiery irritability.',
    },
    aharaTip:
      'For Acidity & Pitta: Sip coriander-fennel (Dhaniya-Saunf) infused water during the day, include 1 tsp pure A2 cow ghee in lunch, and avoid sour/fermented foods at night.',
  },
  back_joint_pain: {
    asana: {
      id: 'hc-bhujanga-back',
      sanskritName: 'Shalabhasana & Bhujangasana (Spinal Therapy)',
      englishName: 'Gentle Cobra & Locust Lumbar Strengthening',
      hindiName: 'भुजंगासन एवं मार्जरी-बितिलासन (कमर एवं जोड़ रक्षा)',
      category: 'Health Concern Therapeutic Asana',
      governingPlanet: 'Saturn (Shani) & Sun (Surya)',
      targetChakra: 'Muladhara (Root) & Swadhisthana',
      chakraColor: '#EF4444',
      diagramType: 'bhujangasana',
      durationOrReps: '5 Slow Rounds × 20 Seconds Hold',
      bestTimeAndDirection: 'Morning • Facing East on a padded mat',
      breathingCue: 'Inhale lifting chest gently; Exhale releasing lumbar tension.',
      stepByStepAlignment: [
        'Warm up with 7 rounds of Marjaryasana-Bitilasana (Cat-Cow spinal waves) on hands and knees.',
        'Lie prone, place forearms on the mat (Sphinx / Ardha Bhujangasana) to decompress L4-L5-S1 discs safely.',
        'Inhale, draw shoulder blades back and lengthen the neck without crunching the lower back.',
      ],
      astrologicalReason:
        'Counteracts Shani (Saturn) Vata dryness in the synovial joints and strengthens Surya (Sun) spinal column vitality.',
      therapeuticBenefits: [
        'Rehydrates intervertebral discs, relieves sciatica, cervical spondylosis, and lower back stiffness.',
        'Corrects slumped desk posture and strengthens paraspinal muscles.',
      ],
      precaution: 'Never force deep forward bends with straight knees when lower back is inflamed.',
    },
    pranayama: {
      id: 'hc-ujjayi-joint',
      sanskritName: 'Ujjayi Pranayama with Vayu Mudra',
      englishName: 'Victorious Ocean Breath with Wind-Relieving Mudra',
      hindiName: 'उज्जायी प्राणायाम (वायु मुद्रा सहित)',
      governingPlanet: 'Saturn (Shani) & Jupiter (Guru)',
      targetNadiAndChakra: 'Sushumna Nadi • Muladhara to Vishuddha',
      diagramType: 'ujjayi_kumbhaka',
      breathingRatio: '5s Inhale : 2s Pause : 7s Ocean Exhale',
      roundsAndDuration: '11 Rounds (Morning & Evening)',
      mudraAndBandha: 'Vayu Mudra (Index finger folded at base of thumb)',
      beejMantra: 'Om Lam Namah',
      stepByStepTechnique: [
        'Fold the index finger to touch the mound of the thumb and press lightly with the thumb (Vayu Mudra).',
        'Slightly constrict the glottis at the back of the throat to create a soft, warming ocean wave sound on both inhale and exhale.',
        'Direct the warm prana mentally into the lower back, knees, and cervical spine.',
      ],
      astrologicalAndHealthBenefit:
        'Vayu Mudra + Ujjayi breath expels trapped Vata air from joints, increases blood oxygenation, and reduces chronic musculoskeletal pain.',
    },
    aharaTip:
      'For Back & Joint Pain: Consume 5 soaked almonds + 1 walnut + 2 black dates in the morning, cook with a pinch of Asafoetida (Hing) and Fenugreek (Methi), and avoid ice-cold water.',
  },
  bp_cardiac: {
    asana: {
      id: 'hc-viparita-bp',
      sanskritName: 'Supta Baddha Konasana & Shavasana Yoga Nidra',
      englishName: 'Reclined Heart Opener & Conscious Yogic Rest',
      hindiName: 'सुप्त बद्ध कोणासन एवं योग निद्रा (हृदय एवं रक्तचाप संतुलन)',
      category: 'Health Concern Therapeutic Asana',
      governingPlanet: 'Sun (Surya) & Moon (Chandra)',
      targetChakra: 'Anahata (Heart Chakra)',
      chakraColor: '#10B981',
      diagramType: 'viparita_karani',
      durationOrReps: '5 to 8 Minutes Daily',
      bestTimeAndDirection: 'Morning or Evening • Head toward East',
      breathingCue: 'Effortless diaphragmatic breathing without any breath retention (No Kumbhaka).',
      stepByStepAlignment: [
        'Lie back over a lengthwise bolster or folded blanket supporting the thoracic spine and head.',
        'Bring soles of feet together or extend legs comfortably wide, resting arms 45 degrees from the torso.',
        'Scan the body from toes to crown, consciously softening arterial resistance around the heart center.',
      ],
      astrologicalReason:
        'Balances Surya (heart pump) and Chandra (blood fluids) in the Anahata Chakra, preventing pressure spikes.',
      therapeuticBenefits: [
        'Regulates baroreceptors, lowers systolic/diastolic blood pressure, and relieves cardiac palpitations.',
        'Opens the chest and intercostal muscles for effortless oxygenation.',
      ],
      precaution: 'Strictly avoid head-below-heart inversions (Shirshasana) and rapid breath holding.',
    },
    pranayama: {
      id: 'hc-chandra-bhedana-bp',
      sanskritName: 'Chandra Anulom Vilom & Apana Vayu Mudra',
      englishName: 'Left-Nostril Cooling Heart Breath (No Retention)',
      hindiName: 'चंद्र अनुलोम-विलोम (हृदय मुद्रा सहित)',
      governingPlanet: 'Moon (Chandra) & Venus',
      targetNadiAndChakra: 'Ida Nadi • Anahata (Heart Chakra)',
      diagramType: 'nadi_shodhana',
      breathingRatio: '4s Inhale : 0s Hold : 6s Exhale (Strict Zero Retention)',
      roundsAndDuration: '12 Slow Rounds',
      mudraAndBandha: 'Apana Vayu / Hridaya Mudra (Index at thumb base; middle & ring tips touch thumb tip)',
      beejMantra: 'Om Yam Namah',
      stepByStepTechnique: [
        'Hold Hridaya (Apana Vayu) Mudra in the left hand—known in Ayurveda as the natural cardiac shield.',
        'Close the right nostril with right thumb; inhale slowly through the left (Chandra) nostril for 4 seconds.',
        'Without holding the breath, close left nostril and exhale smoothly through the right nostril for 6 seconds.',
      ],
      astrologicalAndHealthBenefit:
        'Dilates coronary vessels, calms sympathetic adrenaline surges, and maintains healthy blood pressure.',
    },
    aharaTip:
      'For BP & Heart Health: Replace refined white salt with Sendha Namak (Himalayan rock salt) in moderation, drink hibiscus or Arjun bark herbal tea, and take a 20-minute evening stroll.',
  },
  hormonal_pcos_thyroid: {
    asana: {
      id: 'hc-setu-hormone',
      sanskritName: 'Setu Bandhasana & Baddha Konasana (Butterfly)',
      englishName: 'Bridge Thyroid Lock & Pelvic Butterfly Flow',
      hindiName: 'सेतु बंधासन एवं तितली आसन (थायरॉइड एवं हार्मोन संतुलन)',
      category: 'Health Concern Therapeutic Asana',
      governingPlanet: 'Venus (Shukra) & Mercury (Budha)',
      targetChakra: 'Vishuddha (Throat) & Svadhisthana (Sacral)',
      chakraColor: '#EC4899',
      diagramType: 'setu_bandhasana',
      durationOrReps: '3 Bridge Holds (40s) + 100 Butterfly Flaps',
      bestTimeAndDirection: 'Morning empty stomach • Facing East or North',
      breathingCue: 'Rhythmic Ujjayi breath massaging the throat and pelvic floor.',
      stepByStepAlignment: [
        'Perform Setu Bandhasana (Bridge Pose), allowing the sternum to gently meet the chin to compress and flush the thyroid gland with fresh arterial blood.',
        'Sit upright in Baddha Konasana (Cobbler/Butterfly pose), holding both feet with hands and fluttering knees gently up and down.',
        'Finish with a gentle forward fold over the feet to stimulate ovarian/adrenal circulation.',
      ],
      astrologicalReason:
        'Synchronizes Budha (Vishuddha thyroid center) and Shukra/Chandra (Svadhisthana reproductive axis).',
      therapeuticBenefits: [
        'Regulates TSH/T3/T4 thyroid hormones, relieves PCOS/PCOD pelvic congestion, and balances menstrual/endocrine rhythms.',
      ],
      precaution: 'Keep spine tall during Butterfly pose rather than rounding the upper back.',
    },
    pranayama: {
      id: 'hc-ujjayi-thyroid',
      sanskritName: 'Simhasana & Ujjayi Throat Pranayama',
      englishName: 'Victorious Thyroid Breath & Endocrine Balance',
      hindiName: 'उज्जायी प्राणायाम एवं सिंहासन',
      governingPlanet: 'Mercury (Budha) & Jupiter',
      targetNadiAndChakra: 'Vishuddha (Throat Chakra)',
      diagramType: 'ujjayi_kumbhaka',
      breathingRatio: '5s Ujjayi Inhale : 3s Jalandhara Chin Lock : 6s Exhale',
      roundsAndDuration: '11 Rounds Daily',
      mudraAndBandha: 'Shankha (Conch) Mudra or Udana Mudra + Jalandhara Bandha',
      beejMantra: 'Om Ham Vishuddhaya Namah',
      stepByStepTechnique: [
        'Hold Shankha Mudra (encircle left thumb with right fingers, touch right thumb to left middle finger) at the throat level.',
        'Breathe with a soft Ujjayi frictional sound in the throat, creating micro-vibrations directly over the thyroid and parathyroid glands.',
        'Chant "Hum" 7 times at the end of the session.',
      ],
      astrologicalAndHealthBenefit:
        'Directly stimulates Vishuddha Chakra and pituitary-thyroid-gonadal hormonal feedback loops.',
    },
    aharaTip:
      'For Thyroid & Hormonal Balance: Drink overnight-soaked coriander seed (Sabut Dhaniya) water on an empty stomach each morning, and include pumpkin/sunflower/flax seeds.',
  },
  fatigue_low_prana: {
    asana: {
      id: 'hc-surya-prana',
      sanskritName: 'Surya Namaskar & Ustrasana (Camel Pose)',
      englishName: 'Dynamic Sun Salutation & Heart-Opening Camel',
      hindiName: 'सूर्य नमस्कार एवं उष्ट्रासन (प्राण शक्ति वर्धक)',
      category: 'Health Concern Therapeutic Asana',
      governingPlanet: 'Sun (Surya) & Mars (Mangal)',
      targetChakra: 'Manipura (Solar Plexus) & Anahata',
      chakraColor: '#F97316',
      diagramType: 'surya_namaskar',
      durationOrReps: '5 Rounds Surya Namaskar + 2 × 30s Ustrasana',
      bestTimeAndDirection: 'Sunrise (06:00–07:30 AM) • Facing East',
      breathingCue: 'Deep thoracic expansion on inhalations to maximize lung volume.',
      stepByStepAlignment: [
        'Complete 5 invigorating rounds of Surya Namaskar in morning sunlight to absorb solar prana.',
        'Kneel hip-width apart for Ustrasana (Camel Pose), press shins down, support lower back with hands or reach for heels while lifting the sternum skyward.',
        'Breathe deeply into the ribcage to flush adrenal fatigue.',
      ],
      astrologicalReason:
        'Ignites Surya-Agni vitality and clears Kapha/Saturnian pranic stagnation across all 72,000 Nadis.',
      therapeuticBenefits: [
        'Boosts mitochondrial energy, hemoglobin oxygenation, adrenal resilience, and thymus immunity.',
      ],
      precaution: 'Keep hands on the lower back in Ustrasana if full heel reach strains the lumbar spine.',
    },
    pranayama: {
      id: 'hc-surya-bhedana-prana',
      sanskritName: 'Surya Bhedana & Bhastrika Pranayama',
      englishName: 'Right-Nostril Solar Vitality & Bellows Breath',
      hindiName: 'सूर्य भेदन एवं भस्त्रिका प्राणायाम (प्राण मुद्रा सहित)',
      governingPlanet: 'Sun (Surya)',
      targetNadiAndChakra: 'Pingala (Solar) Nadi • Manipura Chakra',
      diagramType: 'surya_bhedana',
      breathingRatio: '4s Right Inhale : 4s Hold : 6s Left Exhale',
      roundsAndDuration: '11 Rounds in the Morning',
      mudraAndBandha: 'Prana Mudra (Ring & Little finger tips touch thumb tip)',
      beejMantra: 'Om Ram अग्निदेवतायै नमः',
      stepByStepTechnique: [
        'Hold Prana Mudra in your left hand to activate dormant cellular vitality and immunity.',
        'Inhale exclusively through the Right (Pingala/Sun) nostril for 4 seconds, filling lungs completely.',
        'Hold gently for 4 seconds, then exhale through the Left (Ida) nostril for 6 seconds. Repeat 11 times.',
      ],
      astrologicalAndHealthBenefit:
        'Awakens Solar Pingala Nadi, banishes morning grogginess, low immunity, and cold extremities.',
    },
    aharaTip:
      'For Vitality & Immunity: Take 1 tsp Chyawanprash or soaked raisins + saffron in the morning, and get 15 minutes of early morning sunlight on the spine.',
  },
  weight_metabolism: {
    asana: {
      id: 'hc-trikona-weight',
      sanskritName: 'Utkatasana, Trikonasana & Naukasana',
      englishName: 'Fierce Chair, Triangle & Core Boat Sequence',
      hindiName: 'त्रिकोणासन एवं नौकासन (मेटाबॉलिज्म एवं मेद क्षय)',
      category: 'Health Concern Therapeutic Asana',
      governingPlanet: 'Mars (Mangal) & Sun (Surya)',
      targetChakra: 'Manipura (Solar Plexus Chakra)',
      chakraColor: '#EAB308',
      diagramType: 'trikonasana',
      durationOrReps: '3 Sets × 40 Seconds per posture',
      bestTimeAndDirection: 'Morning Empty Stomach • Facing East',
      breathingCue: 'Active core engagement (Uddiyana tone) on every exhalation.',
      stepByStepAlignment: [
        'Flow dynamically through Trikonasana (Triangle Pose) right and left to trim waist obliques and stimulate liver metabolism.',
        'Transition to seated Naukasana (Boat Pose), lifting legs and torso to a 45° V-shape while keeping the spine straight.',
        'Breathe steadily into the navel fire (Manipura) for 30 seconds.',
      ],
      astrologicalReason:
        'Kindles Jatharagni (digestive/metabolic fire) to dissolve excess Jupiter/Moon Kapha accumulation.',
      therapeuticBenefits: [
        'Accelerates basal metabolic rate, reduces visceral abdominal fat, and improves insulin sensitivity.',
      ],
      precaution: 'Keep knees bent in Boat Pose if lower back rounds.',
    },
    pranayama: {
      id: 'hc-kapalabhati-weight',
      sanskritName: 'Kapalabhati & Agnisara Kriya',
      englishName: 'Skull-Shining Metabolic Breath &urya Mudra',
      hindiName: 'कपालभाति प्राणायाम (सूर्य मुद्रा सहित)',
      governingPlanet: 'Sun (Surya) & Mars (Mangal)',
      targetNadiAndChakra: 'Pingala Nadi • Manipura (Navel Fire)',
      diagramType: 'kapalabhati_agnisara',
      breathingRatio: 'Active Abdominal Exhale (1 stroke/sec) + Passive Inhale',
      roundsAndDuration: '3 Rounds × 40 Strokes (Morning Empty Stomach)',
      mudraAndBandha: 'Surya Mudra (Ring finger folded to thumb base, pressed by thumb)',
      beejMantra: 'Om Hram Suryaya Namah',
      stepByStepTechnique: [
        'Sit tall in Sukhasana or Vajrasana holding Surya Mudra (which reduces Earth/Kapha element and increases Fire/Agni).',
        'Focus only on sharp, rhythmic abdominal exhalations through the nose while allowing inhalation to happen passively.',
        'Rest for 30 seconds between rounds observing the warm glow in the Solar Plexus.',
      ],
      astrologicalAndHealthBenefit:
        'Ignites cellular fat oxidation, clears Kapha phlegm/toxins (Ama), and sharpens liver/thyroid metabolism.',
    },
    aharaTip:
      'For Weight & Metabolism: Drink warm water with lemon and a pinch of ginger/cinnamon in the morning, finish dinner before sunset (7:30 PM), and practice Surya Mudra for 15 minutes daily.',
  },
  focus_memory: {
    asana: {
      id: 'hc-vriksha-focus',
      sanskritName: 'Vrikshasana & Padmasana Trataka',
      englishName: 'One-Pointed Tree Balance & Lotus Gaze',
      hindiName: 'वृक्षासन एवं पद्मासन त्राटक (एकाग्रता एवं स्मरण शक्ति)',
      category: 'Health Concern Therapeutic Asana',
      governingPlanet: 'Mercury (Budha) & Jupiter (Guru)',
      targetChakra: 'Ajna (Third Eye Chakra)',
      chakraColor: '#6366F1',
      diagramType: 'vrikshasana',
      durationOrReps: '60 Seconds per leg + 3 Mins Candle/Bindu Trataka',
      bestTimeAndDirection: 'Brahma Muhurta or Morning • Facing North-East (Ishaan)',
      breathingCue: 'Even, silent nasal breathing (1:1 ratio).',
      stepByStepAlignment: [
        'Practice Vrikshasana (Tree Pose) while locking your Drishti (visual focus) on a single point at eye level without blinking.',
        'Sit in Ardha-Padmasana or Sukhasana with spine erect and neck aligned.',
        'Practice 2 minutes of gentle Trataka (steady gaze) on a ghee lamp flame or Om symbol to unify scattered mental rays.',
      ],
      astrologicalReason:
        'Aligns Budha (analytical intellect) and Guru (wisdom retention) at the Ajna Chakra.',
      therapeuticBenefits: [
        'Elimates brain fog, digital distraction, and memory lapses while synchronizing cerebral hemispheres.',
      ],
      precaution: 'Close and palm the eyes gently after Trataka gazing.',
    },
    pranayama: {
      id: 'hc-nadi-focus',
      sanskritName: 'Nadi Shodhana & Hakini / Gyan Mudra',
      englishName: 'Alternate Nostril Brain-Hemisphere Synchronization',
      hindiName: 'नाड़ी शोधन प्राणायाम (ज्ञान एवं हाकिनी मुद्रा)',
      governingPlanet: 'Mercury (Budha)',
      targetNadiAndChakra: 'Ida, Pingala & Sushumna • Ajna Chakra',
      diagramType: 'nadi_shodhana',
      breathingRatio: '4s Inhale : 4s Hold : 6s Exhale',
      roundsAndDuration: '11 Rounds before study or deep work',
      mudraAndBandha: 'Gyan Mudra or Hakini Mudra (All fingertips touching)',
      beejMantra: 'Om Aim Saraswatyai Namah / Om Bum Budhaya Namah',
      stepByStepTechnique: [
        'Use Vishnu Mudra with the right hand to alternate nostrils, and Gyan Mudra in the left hand.',
        'Inhale Left (4s) → Hold gently (4s) → Exhale Right (6s) → Inhale Right (4s) → Hold (4s) → Exhale Left (6s).',
        'Visualize silver and golden pranic streams crossing at the Ajna Third Eye center.',
      ],
      astrologicalAndHealthBenefit:
        'Balances left (logical) and right (creative) brain hemispheres, supercharging memory, exam/business focus, and intuition.',
    },
    aharaTip:
      'For Focus & Memory: Consume 4 soaked peeled almonds + 2 walnut halves + Brahmi/Shankhpushpi or Tulsi tea in the morning, and study/work facing East or North.',
  },
};

export function calculateYogaPranayamaPlan(profile: BirthProfile): PersonalizedYogaPranayamaPlan {
  const mulank = calculateMulank(profile.dob);
  const bhagyank = calculateBhagyank(profile.dob);
  const nameAnalysis = analyzeName(profile.name, mulank, bhagyank);
  const namank = nameAnalysis.chaldeanSingle;

  const autoAstro = calculateVedicAstrologyFromBirth(
    profile.dob,
    profile.tob || '09:30',
    profile.lat ?? 28.6139,
    profile.lng ?? 77.209
  );
  const careerAura = calculateCareerAndAuraProfile(profile.name, mulank, bhagyank, namank);

  const mPlanet = PLANETARY_PROFILES[mulank] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[bhagyank] || PLANETARY_PROFILES[3];

  // Determine Rashi Lord number
  const rashiLower = autoAstro.rashi.toLowerCase();
  let rashiPlanetNum = bhagyank;
  if (rashiLower.includes('mesh') || rashiLower.includes('vrischik')) rashiPlanetNum = 9;
  else if (rashiLower.includes('vrishabh') || rashiLower.includes('tula')) rashiPlanetNum = 6;
  else if (rashiLower.includes('mithun') || rashiLower.includes('kanya')) rashiPlanetNum = 5;
  else if (rashiLower.includes('karka')) rashiPlanetNum = 2;
  else if (rashiLower.includes('simha')) rashiPlanetNum = 1;
  else if (rashiLower.includes('dhanu') || rashiLower.includes('meen')) rashiPlanetNum = 3;
  else if (rashiLower.includes('makar') || rashiLower.includes('kumbh')) rashiPlanetNum = 8;

  // Determine Ayurvedic Dosha constitution from Mulank, Bhagyank & Rashi
  let dominantDoshaConstitution = 'Tridoshic Balanced (Sama-Prakriti)';
  if ([1, 9].includes(mulank) || [1, 9].includes(bhagyank)) {
    dominantDoshaConstitution = 'Pitta-Predominant (Agni / Solar-Martian Constitution — Needs Cooling & Grounding)';
  } else if ([4, 7, 8].includes(mulank) || [4, 8].includes(bhagyank)) {
    dominantDoshaConstitution = 'Vata-Predominant (Vayu / Air-Ether Constitution — Needs Warmth, Joint Lubrication & Nadi Calming)';
  } else if ([2, 3, 6].includes(mulank)) {
    dominantDoshaConstitution = 'Kapha-Pitta / Lunar-Jovial Constitution (Needs Dynamic Pranic Flow & Metabolic Agni)';
  } else {
    dominantDoshaConstitution = 'Vata-Pitta Mercurial Constitution (Needs Nervous System Equilibrium & Pranic Grounding)';
  }

  // Resolve selected health concerns (or intelligent birth-chart defaults if none selected yet)
  const rawConcernIds =
    profile.healthConcerns && profile.healthConcerns.length > 0
      ? profile.healthConcerns
      : [
          [4, 7, 2].includes(mulank) ? 'stress_anxiety' : [1, 9].includes(mulank) ? 'digestive_pitta' : 'fatigue_low_prana',
          [8, 4].includes(bhagyank) ? 'back_joint_pain' : [3, 6].includes(bhagyank) ? 'weight_metabolism' : 'focus_memory',
        ];

  const selectedHealthConcerns = rawConcernIds
    .map((id) => HEALTH_CONCERN_OPTIONS.find((opt) => opt.id === id))
    .filter((x): x is HealthConcernOption => Boolean(x));

  // Build Daily Asanas list (1. Mulank Asana, 2. Bhagyank Asana, 3. Rashi/Nakshatra Asana, + Health Concern Asanas)
  const dailyAsanas: YogaPosturePrescription[] = [];
  const usedAsanaNames = new Set<string>();

  const mulankMaster = PLANET_ASANA_MASTER[mulank] || PLANET_ASANA_MASTER[1];
  dailyAsanas.push({
    id: `mulank-asana-${mulank}`,
    sanskritName: mulankMaster.sanskritName,
    englishName: mulankMaster.englishName,
    hindiName: mulankMaster.hindiName,
    category: 'Core Birth Chart Asana',
    governingPlanet: `${mPlanet.planet} (Mulank ${mulank} — ${mPlanet.sanskritName})`,
    targetChakra: mulankMaster.targetChakra,
    chakraColor: mulankMaster.chakraColor,
    diagramType: mulankMaster.diagramType,
    durationOrReps: mulankMaster.durationOrReps,
    bestTimeAndDirection: `Morning ${mPlanet.planet} Hora • Face East or North-East`,
    breathingCue: mulankMaster.breathingCue,
    stepByStepAlignment: mulankMaster.steps,
    astrologicalReason: `Primary Soul Posture for Mulank ${mulank} (${mPlanet.planet}). Directly strengthens your physical constitution, ${mulankMaster.targetChakra}, and personal aura.`,
    therapeuticBenefits: mulankMaster.benefits,
    precaution: mulankMaster.precaution,
  });
  usedAsanaNames.add(mulankMaster.sanskritName);

  const bhagyankEffectiveNum = bhagyank === mulank ? ((bhagyank % 9) + 1) : bhagyank;
  const bhagyankMaster = PLANET_ASANA_MASTER[bhagyankEffectiveNum] || PLANET_ASANA_MASTER[3];
  const bEffectivePlanet = PLANETARY_PROFILES[bhagyank] || bPlanet;
  dailyAsanas.push({
    id: `bhagyank-asana-${bhagyank}`,
    sanskritName: bhagyankMaster.sanskritName,
    englishName: bhagyankMaster.englishName,
    hindiName: bhagyankMaster.hindiName,
    category: 'Core Birth Chart Asana',
    governingPlanet: `${bEffectivePlanet.planet} (Bhagyank ${bhagyank} — ${bEffectivePlanet.sanskritName})`,
    targetChakra: bhagyankMaster.targetChakra,
    chakraColor: bhagyankMaster.chakraColor,
    diagramType: bhagyankMaster.diagramType,
    durationOrReps: bhagyankMaster.durationOrReps,
    bestTimeAndDirection: `Morning or Evening Sandhya • Face North or East`,
    breathingCue: bhagyankMaster.breathingCue,
    stepByStepAlignment: bhagyankMaster.steps,
    astrologicalReason: `Supreme Destiny Posture for Bhagyank ${bhagyank} (${bEffectivePlanet.planet}). Removes karmic pranic blockages in career endurance and long-term vitality.`,
    therapeuticBenefits: bhagyankMaster.benefits,
    precaution: bhagyankMaster.precaution,
  });
  usedAsanaNames.add(bhagyankMaster.sanskritName);

  // 3. Janma Rashi & Nakshatra Asana
  const rashiEffectiveNum =
    usedAsanaNames.has(PLANET_ASANA_MASTER[rashiPlanetNum]?.sanskritName)
      ? [2, 5, 6, 3, 7].find((n) => !usedAsanaNames.has(PLANET_ASANA_MASTER[n].sanskritName)) || 2
      : rashiPlanetNum;
  const rashiMaster = PLANET_ASANA_MASTER[rashiEffectiveNum] || PLANET_ASANA_MASTER[2];
  dailyAsanas.push({
    id: `rashi-asana-${rashiEffectiveNum}`,
    sanskritName: rashiMaster.sanskritName,
    englishName: rashiMaster.englishName,
    hindiName: rashiMaster.hindiName,
    category: 'Rashi & Nakshatra Asana',
    governingPlanet: `${autoAstro.rashi} • ${autoAstro.nakshatra} (Pada ${autoAstro.pada})`,
    targetChakra: rashiMaster.targetChakra,
    chakraColor: rashiMaster.chakraColor,
    diagramType: rashiMaster.diagramType,
    durationOrReps: rashiMaster.durationOrReps,
    bestTimeAndDirection: `Daily Morning/Evening • Aligned with ${autoAstro.nakshatra} Star`,
    breathingCue: rashiMaster.breathingCue,
    stepByStepAlignment: rashiMaster.steps,
    astrologicalReason: `Tailored to your Sidereal Moon Sign (${autoAstro.rashi}) and Birth Star (${autoAstro.nakshatra}, Lord: ${autoAstro.nakshatraLord}) to harmonize emotional and cellular prana.`,
    therapeuticBenefits: rashiMaster.benefits,
    precaution: rashiMaster.precaution,
  });
  usedAsanaNames.add(rashiMaster.sanskritName);

  // 4. Add Therapeutic Asanas & Pranayamas for each selected Health Concern
  const dailyPranayamas: PranayamaPrescription[] = [
    {
      id: 'core-nadi-shodhana',
      sanskritName: 'Nadi Shodhana (Anulom Vilom) Pranayama',
      englishName: 'Alternate Nostril Ida-Pingala Purification',
      hindiName: 'नाड़ी शोधन / अनुलोम-विलोम प्राणायाम',
      governingPlanet: `${mPlanet.planet} (${mulank}) & ${bPlanet.planet} (${bhagyank})`,
      targetNadiAndChakra: `Ida, Pingala & Sushumna • ${careerAura.primaryChakra}`,
      diagramType: 'nadi_shodhana',
      breathingRatio: '4s Puraka (Inhale) : 4s Antara Kumbhaka (Hold) : 6s Rechaka (Exhale)',
      roundsAndDuration: '11 to 21 Rounds Daily (Morning)',
      mudraAndBandha: 'Vishnu Mudra (Right Hand) + Gyan/Prana Mudra (Left Hand)',
      beejMantra: mPlanet.beejMantra,
      stepByStepTechnique: [
        'Sit in Sukhasana, Siddhasana, or Vajrasana with head, neck, and spine in one vertical line.',
        'Close the right nostril with the right thumb and inhale smoothly through the left nostril for 4 seconds.',
        'Retain gently for 4 seconds (skip retention if BP is high), then close left nostril with ring finger and exhale through the right nostril for 6 seconds.',
        'Inhale through the right nostril (4s), retain (4s), and exhale through the left nostril (6s) to complete 1 Vedic round.',
      ],
      astrologicalAndHealthBenefit: `Purifies all 72,000 Nadis, harmonizes planetary friction between Mulank ${mulank} (${mPlanet.planet}) and Bhagyank ${bhagyank} (${bPlanet.planet}), and oxygenates the brain and heart.`,
    },
  ];

  const ayurvedicAharaTips: string[] = [
    `Drink warm water stored overnight in a ${[1, 3, 9].includes(mulank) ? 'pure Copper (Tamra)' : [2, 6].includes(mulank) ? 'pure Silver (Chandi) or Earthen' : 'Copper or Brass'} vessel upon waking to charge your ${careerAura.primaryChakra}.`,
  ];

  for (const hc of selectedHealthConcerns) {
    const mapped = HEALTH_CONCERN_THERAPEUTIC_MAP[hc.id];
    if (mapped) {
      if (!usedAsanaNames.has(mapped.asana.sanskritName)) {
        dailyAsanas.push(mapped.asana);
        usedAsanaNames.add(mapped.asana.sanskritName);
      }
      if (!dailyPranayamas.some((p) => p.sanskritName === mapped.pranayama.sanskritName)) {
        dailyPranayamas.push(mapped.pranayama);
      }
      ayurvedicAharaTips.push(mapped.aharaTip);
    }
  }

  // Ensure the Visual Yoga Posture Card Gallery always has 6 distinct balanced Asanas (2x3 grid)
  const planetaryFallbackOrder = [3, 5, 6, 1, 2, 7, 8, 9, 4];
  for (const pNum of planetaryFallbackOrder) {
    if (dailyAsanas.length >= 6) break;
    const extraMaster = PLANET_ASANA_MASTER[pNum];
    if (!extraMaster || usedAsanaNames.has(extraMaster.sanskritName)) continue;
    const extraPlanet = PLANETARY_PROFILES[pNum] || mPlanet;
    dailyAsanas.push({
      id: `balance-asana-${pNum}`,
      sanskritName: extraMaster.sanskritName,
      englishName: extraMaster.englishName,
      hindiName: extraMaster.hindiName,
      category: 'Core Birth Chart Asana',
      governingPlanet: `${extraPlanet.planet} (Graha #${pNum} — ${extraPlanet.sanskritName})`,
      targetChakra: extraMaster.targetChakra,
      chakraColor: extraMaster.chakraColor,
      diagramType: extraMaster.diagramType,
      durationOrReps: extraMaster.durationOrReps,
      bestTimeAndDirection: `Daily Morning Sadhana • Face East or North-East`,
      breathingCue: extraMaster.breathingCue,
      stepByStepAlignment: extraMaster.steps,
      astrologicalReason: `Complementary Navagraha balancing posture activating ${extraMaster.targetChakra} and supporting Mulank ${mulank} (${mPlanet.planet}) & Bhagyank ${bhagyank} (${bPlanet.planet}) pranic harmony.`,
      therapeuticBenefits: extraMaster.benefits,
      precaution: extraMaster.precaution,
    });
    usedAsanaNames.add(extraMaster.sanskritName);
  }

  // Ensure at least 3 distinct Pranayamas
  if (dailyPranayamas.length < 3) {
    const fallbackKey = [1, 9].includes(mulank) ? 'digestive_pitta' : 'stress_anxiety';
    const extraP = HEALTH_CONCERN_THERAPEUTIC_MAP[fallbackKey].pranayama;
    if (!dailyPranayamas.some((p) => p.id === extraP.id)) {
      dailyPranayamas.push(extraP);
    }
  }

  // Build 7-Day Weekly Yoga & Pranayama Planner (Vara-Jyotish Planetary Schedule)
  const weeklyPlanner: WeeklyYogaDayPlan[] = [
    {
      dayIndex: 0,
      dayName: 'Sunday',
      hindiDay: 'रविवार (Ravivar)',
      rulingPlanet: 'Sun (Surya Dev)',
      planetNumber: 1,
      themeTitle: 'Solar Vitality, Spine & Manipura Agni Awakening',
      chakraFocus: 'Manipura (Solar Plexus) & Sahasrara',
      colorTheme: 'from-amber-500/25 to-orange-600/20 border-amber-500/40 text-amber-200',
      morningAsanas: [
        {
          name: 'Surya Namaskar (Sun Salutation)',
          sanskritName: 'सूर्य नमस्कार (12 Steps)',
          duration: '7 Rounds (12 mins)',
          diagramType: 'surya_namaskar',
          focusCue: 'Chant the 12 Surya Names facing East at sunrise.',
        },
        {
          name: 'Bhujangasana (Cobra Pose)',
          sanskritName: 'भुजंगासन',
          duration: '3 × 30 sec holds',
          diagramType: 'bhujangasana',
          focusCue: 'Expand thoracic heart and strengthen spinal vitality.',
        },
      ],
      pranayamaPractice: {
        name: 'Surya Bhedana + Nadi Shodhana',
        ratio: '4 : 4 : 6 Ratio',
        rounds: '11 Rounds each',
      },
      mudraAndMantra: {
        mudra: 'Surya Mudra / Prana Mudra',
        mantra: 'Om Hram Hreem Hroum Sah Suryaya Namah (27x)',
      },
      personalChartSynergy:
        mulank === 1 || bhagyank === 1
          ? `Peak Power Day for your birth chart! Sunday directly amplifies your Natal Sun (1) leadership and immunity.`
          : `Charges your Solar Plexus and bone vitality for the week ahead.`,
    },
    {
      dayIndex: 1,
      dayName: 'Monday',
      hindiDay: 'सोमवार (Somvar)',
      rulingPlanet: 'Moon (Chandra Dev)',
      planetNumber: 2,
      themeTitle: 'Lunar Cooling, Emotional Peace & Lymphatic Flow',
      chakraFocus: 'Svadhisthana (Sacral) & Ajna (Third Eye)',
      colorTheme: 'from-sky-400/25 to-indigo-600/20 border-sky-400/40 text-sky-100',
      morningAsanas: [
        {
          name: 'Setu Bandhasana (Bridge Pose)',
          sanskritName: 'सेतु बंधासन',
          duration: '3 × 45 sec holds',
          diagramType: 'setu_bandhasana',
          focusCue: 'Soothe the mind, thyroid, and sacral water element.',
        },
        {
          name: 'Balasana (Restorative Child’s Pose)',
          sanskritName: 'बालासन / शशांकासन',
          duration: '3 mins hold',
          diagramType: 'balasana',
          focusCue: 'Rest the Third Eye on the mat to dissolve emotional stress.',
        },
      ],
      pranayamaPractice: {
        name: 'Chandra Bhedana & Bhramari (Humming Bee)',
        ratio: '4s Inhale : 8s Humming Exhale',
        rounds: '11 Rounds',
      },
      mudraAndMantra: {
        mudra: 'Varun Mudra & Gyan Mudra',
        mantra: 'Om Shram Shreem Shroum Sah Chandramase Namah (27x)',
      },
      personalChartSynergy: `Harmonizes your ${autoAstro.rashi} Moon Sign and ${autoAstro.nakshatra} Nakshatra for deep mental serenity.`,
    },
    {
      dayIndex: 2,
      dayName: 'Tuesday',
      hindiDay: 'मंगलवार (Mangalvar)',
      rulingPlanet: 'Mars (Mangal / Angaraka)',
      planetNumber: 9,
      themeTitle: 'Martian Core Strength, Blood Vigor & Pitta Balance',
      chakraFocus: 'Muladhara (Root) & Manipura (Solar Plexus)',
      colorTheme: 'from-red-500/25 to-rose-700/20 border-red-500/40 text-red-100',
      morningAsanas: [
        {
          name: 'Vajrasana-Mandukasana & Warrior Flow',
          sanskritName: 'वीरभद्रासन एवं मंडूकासन',
          duration: '45s per side + 3 Rounds',
          diagramType: 'vajrasana_mandukasana',
          focusCue: 'Channel muscular stamina and regulate digestive Agni.',
        },
        {
          name: 'Trikonasana (Sacred Triangle)',
          sanskritName: 'त्रिकोणासन',
          duration: '45s Left & Right',
          diagramType: 'trikonasana',
          focusCue: 'Root heels firmly to ground excess Martian heat.',
        },
      ],
      pranayamaPractice: {
        name: 'Kapalabhati (40 strokes) followed by Cooling Sheetali',
        ratio: 'Active Exhale + Cooling Sip',
        rounds: '3 Sets + 9 Cooling Breaths',
      },
      mudraAndMantra: {
        mudra: 'Prithvi Mudra & Apana Mudra',
        mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah (27x)',
      },
      personalChartSynergy:
        mulank === 9 || bhagyank === 9
          ? `Direct Mangal Power Day for your chart—channels warrior drive into disciplined execution.`
          : `Strengthens muscular stamina, hemoglobin, and digestive fire while preventing anger/acidity.`,
    },
    {
      dayIndex: 3,
      dayName: 'Wednesday',
      hindiDay: 'बुधवार (Budhavar)',
      rulingPlanet: 'Mercury (Budha Dev)',
      planetNumber: 5,
      themeTitle: 'Cerebrospinal Alignment, Nervous System & Focus',
      chakraFocus: 'Vishuddha (Throat) & Ajna (Third Eye)',
      colorTheme: 'from-emerald-500/25 to-teal-700/20 border-emerald-500/40 text-emerald-100',
      morningAsanas: [
        {
          name: 'Trikonasana (Triangle Lateral Stretch)',
          sanskritName: 'त्रिकोणासन',
          duration: '2 × 45 sec per side',
          diagramType: 'trikonasana',
          focusCue: 'Open intercostal ribs and spinal nerves.',
        },
        {
          name: 'Vrikshasana (One-Pointed Tree Balance)',
          sanskritName: 'वृक्षासन',
          duration: '60 sec per leg',
          diagramType: 'vrikshasana',
          focusCue: 'Fix Drishti gaze to sharpen Mercurial memory and focus.',
        },
      ],
      pranayamaPractice: {
        name: 'Nadi Shodhana (Alternate Nostril Balance)',
        ratio: '4 : 4 : 6 Balanced Ratio',
        rounds: '15 Rounds',
      },
      mudraAndMantra: {
        mudra: 'Gyan Mudra & Hakini Mudra',
        mantra: 'Om Bram Breem Broum Sah Budhaya Namah (27x)',
      },
      personalChartSynergy: `Synchronizes left-right brain hemispheres and harmonizes Namank ${namank} speech and commercial clarity.`,
    },
    {
      dayIndex: 4,
      dayName: 'Thursday',
      hindiDay: 'गुरुवार (Guruvar)',
      rulingPlanet: 'Jupiter (Guru Brihaspati)',
      planetNumber: 3,
      themeTitle: 'Spinal Twist Detox, Liver/Pancreas & Sattvic Wisdom',
      chakraFocus: 'Manipura, Anahata & Sahasrara (Crown)',
      colorTheme: 'from-yellow-400/25 to-amber-600/20 border-yellow-400/40 text-yellow-100',
      morningAsanas: [
        {
          name: 'Ardha Matsyendrasana (Seated Spinal Twist)',
          sanskritName: 'अर्ध मत्स्येन्द्रासन',
          duration: '60 sec Left & Right',
          diagramType: 'ardha_matsyendrasana',
          focusCue: 'Massage liver, spleen, and pancreas while lengthening spine.',
        },
        {
          name: 'Bhujangasana (Sattvic Heart Expansion)',
          sanskritName: 'भुजंगासन',
          duration: '3 × 30 sec holds',
          diagramType: 'bhujangasana',
          focusCue: 'Open the chest to invite Guru Kripa and optimism.',
        },
      ],
      pranayamaPractice: {
        name: 'Ujjayi Pranayama + Omkar Udgeeth Japa',
        ratio: '5s Inhale : 3s Hold : 8s "Ommm"',
        rounds: '11 Rounds',
      },
      mudraAndMantra: {
        mudra: 'Chinmaya Mudra / Kubera Mudra',
        mantra: 'Om Gram Greem Groum Sah Gurave Namah (27x)',
      },
      personalChartSynergy: `Activates Devguru Brihaspati’s protection over your health, liver metabolism, and dharmic prosperity.`,
    },
    {
      dayIndex: 5,
      dayName: 'Friday',
      hindiDay: 'शुक्रवार (Shukravar)',
      rulingPlanet: 'Venus (Shukra Dev)',
      planetNumber: 6,
      themeTitle: 'Pelvic/Endocrine Vitality, Heart Opening & Ojas Glow',
      chakraFocus: 'Anahata (Heart) & Svadhisthana (Sacral)',
      colorTheme: 'from-pink-400/25 to-rose-600/20 border-pink-400/40 text-pink-100',
      morningAsanas: [
        {
          name: 'Setu Bandhasana & Baddha Konasana (Butterfly)',
          sanskritName: 'सेतु बंधासन एवं बद्ध कोणासन',
          duration: '3 mins combined flow',
          diagramType: 'setu_bandhasana',
          focusCue: 'Circulate prana through kidneys, adrenals, and heart center.',
        },
        {
          name: 'Bhujangasana (Graceful Cobra)',
          sanskritName: 'भुजंगासन',
          duration: '3 × 30 sec holds',
          diagramType: 'bhujangasana',
          focusCue: 'Awaken Shukra Ojas and radiant aura.',
        },
      ],
      pranayamaPractice: {
        name: 'Bhramari + Sheetkari Pranic Glow Breath',
        ratio: '4s Inhale : 8s Soft Exhale',
        rounds: '11 Rounds',
      },
      mudraAndMantra: {
        mudra: 'Shukra / Yoni Mudra & Padma (Lotus) Mudra',
        mantra: 'Om Dram Dreem Droum Sah Shukraya Namah (27x)',
      },
      personalChartSynergy: `Replenishes cellular Ojas, hormonal harmony, and Anahata relationship magnetism.`,
    },
    {
      dayIndex: 6,
      dayName: 'Saturday',
      hindiDay: 'शनिवार (Shanivar)',
      rulingPlanet: 'Saturn (Shani Dev) & Rahu-Ketu',
      planetNumber: 8,
      themeTitle: 'Deep Vata Release, Sciatica/Joint Care & Yoga Nidra',
      chakraFocus: 'Muladhara (Root) & Ajna (Third Eye)',
      colorTheme: 'from-indigo-500/25 to-purple-800/20 border-indigo-400/40 text-indigo-100',
      morningAsanas: [
        {
          name: 'Paschimottanasana & Pawanmuktasana',
          sanskritName: 'पश्चिमोत्तानासन एवं पवनमुक्तासन',
          duration: '3 × 45 sec holds',
          diagramType: 'paschimottanasana',
          focusCue: 'Release accumulated Vata stiffness from hamstrings, hips, and lower back.',
        },
        {
          name: 'Viparita Karani (Legs-Up-The-Wall Restorative)',
          sanskritName: 'विपरीत करणी एवं योग निद्रा',
          duration: '5 mins restorative',
          diagramType: 'viparita_karani',
          focusCue: 'Drain lower-limb fatigue and ground Muladhara Chakra.',
        },
      ],
      pranayamaPractice: {
        name: 'Slow Nadi Shodhana + So-Hum Yoga Nidra',
        ratio: '4s Inhale : 8s Deep Exhale',
        rounds: '15 Rounds + 5 Min Relaxation',
      },
      mudraAndMantra: {
        mudra: 'Vayu Mudra & Prithvi Mudra',
        mantra: 'Om Pram Preem Proum Sah Shanaishcharaya Namah (27x)',
      },
      personalChartSynergy: `Clears weekly karmic fatigue, Vata joint stiffness, and Saturn/Rahu stress from your bio-field.`,
    },
  ];

  const dailySadhanaTimetable = [
    {
      slot: '06:00 AM – 06:15 AM (Usha Kaal)',
      practice: 'Usha Paan (Copper/Silver charged water) + Sukshma Vyayama (Joint rotations)',
      purpose: 'Flushes digestive Ama (toxins) and lubricates synovial joints before asana.',
    },
    {
      slot: '06:15 AM – 06:35 AM (Pratah Hora)',
      practice: `Core Birth Chart & Therapeutic Asanas (${dailyAsanas.slice(0, 3).map((a) => a.sanskritName.split('&')[0].trim()).join(', ')})`,
      purpose: `Aligns physical spine and endocrine glands with ${mPlanet.planet} (${mulank}) & ${bPlanet.planet} (${bhagyank}).`,
    },
    {
      slot: '06:35 AM – 06:50 AM (Prana Sadhana)',
      practice: `${dailyPranayamas.map((p) => p.sanskritName.split('(')[0].trim()).join(' + ')} with Mudra & Beej Mantra`,
      purpose: `Purifies Ida & Pingala Nadis and activates ${careerAura.primaryChakra}.`,
    },
    {
      slot: '09:30 PM – 09:40 PM (Ratri Vishrama)',
      practice: '5 Mins Vajrasana (post-dinner) + 9 Rounds Bhramari / Viparita Karani before sleep',
      purpose: 'Ensures effortless digestion and restorative delta-wave sleep.',
    },
  ];

  return {
    mulank,
    bhagyank,
    namank,
    rashi: autoAstro.rashi,
    sunSign: autoAstro.sunSign,
    nakshatra: autoAstro.nakshatra,
    nakshatraLord: autoAstro.nakshatraLord,
    pada: autoAstro.pada,
    dominantDoshaConstitution,
    primaryChakra: careerAura.primaryChakra,
    secondaryChakra: careerAura.secondaryChakra || 'Anahata (Heart) & Ajna (Third Eye)',
    selectedHealthConcerns,
    dailyAsanas,
    dailyPranayamas,
    weeklyPlanner,
    dailySadhanaTimetable,
    ayurvedicAharaTips,
  };
}
