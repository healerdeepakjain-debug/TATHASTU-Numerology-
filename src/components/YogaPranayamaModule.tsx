import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  HeartPulse,
  Wind,
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  ShieldCheck,
  Clock,
  Compass,
  Info,
  RotateCcw,
  Award,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { BirthProfile } from '../types';
import {
  HEALTH_CONCERN_OPTIONS,
  calculateYogaPranayamaPlan,
  PostureDiagramType,
  PranayamaDiagramType,
  YogaPosturePrescription,
} from '../utils/yogaPranayamaData';

interface YogaPranayamaModuleProps {
  profile: BirthProfile;
  onUpdateProfile?: (updated: BirthProfile) => void;
}

/**
 * Custom High-Precision Illustrative SVG Posture Diagram Component
 * Renders clear anatomical posture geometry, glowing Chakra focal point, and Prana breath vectors
 */
export const YogaPostureIllustration: React.FC<{
  diagramType: PostureDiagramType;
  chakraColor?: string;
  className?: string;
  lightMode?: boolean;
}> = ({ diagramType, chakraColor = '#F59E0B', className = 'w-full h-40', lightMode = false }) => {
  const strokeMain = lightMode ? '#78350F' : '#FDE68A';
  const strokeAccent = lightMode ? '#B45309' : '#F59E0B';
  const matColor = lightMode ? '#D97706' : '#92400E';
  const bgAura = lightMode ? '#FEF3C7' : '#451A03';

  return (
    <svg
      viewBox="0 0 220 145"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sacred Geometric Aura Mandala in Background */}
      <circle
        cx="110"
        cy="72"
        r="54"
        fill={bgAura}
        fillOpacity={lightMode ? '0.45' : '0.28'}
        stroke={strokeAccent}
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx="110"
        cy="72"
        r="40"
        stroke={chakraColor}
        strokeOpacity="0.4"
        strokeWidth="1"
      />

      {/* Ground / Kusha Yoga Mat */}
      <line
        x1="28"
        y1="126"
        x2="192"
        y2="126"
        stroke={matColor}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {diagramType === 'surya_namaskar' && (
        <g>
          {/* Rising Solar Orb */}
          <circle cx="170" cy="34" r="13" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Standing Arching Figure (Hastauttanasana / Pranamasana) */}
          <circle cx="104" cy="40" r="8" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          {/* Spine curving gracefully back */}
          <path
            d="M104 48 Q112 75 106 94"
            stroke={strokeMain}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Raised Arms in Solar Salutation */}
          <path
            d="M106 54 Q96 28 84 18 M106 54 Q118 28 128 20"
            stroke={strokeAccent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Grounded Legs */}
          <path
            d="M106 94 L98 125 M106 94 L114 125"
            stroke={strokeMain}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Glowing Manipura Solar Chakra */}
          <circle cx="108" cy="70" r="6" fill={chakraColor} />
          <circle cx="108" cy="70" r="11" stroke={chakraColor} strokeWidth="1.5" strokeDasharray="2 2" />
        </g>
      )}

      {diagramType === 'vrikshasana' && (
        <g>
          {/* Crown Anjali Mudra Hands Overhead */}
          <path
            d="M110 14 L103 28 L108 46 M110 14 L117 28 L112 46"
            stroke={strokeAccent}
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Head */}
          <circle cx="110" cy="36" r="7.5" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          {/* Vertical Spine */}
          <line x1="110" y1="44" x2="110" y2="88" stroke={strokeMain} strokeWidth="3.2" strokeLinecap="round" />
          {/* Standing Left Leg */}
          <line x1="110" y1="88" x2="110" y2="125" stroke={strokeMain} strokeWidth="3.2" strokeLinecap="round" />
          {/* Bent Right Leg in Tree Pose */}
          <path
            d="M110 88 L134 98 L112 103"
            stroke={strokeMain}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ajna & Muladhara Chakra Glow */}
          <circle cx="110" cy="34" r="4" fill={chakraColor} />
          <circle cx="110" cy="88" r="5.5" fill="#EF4444" />
        </g>
      )}

      {diagramType === 'bhujangasana' && (
        <g>
          {/* Cobra Pose Arching Torso */}
          <circle cx="152" cy="48" r="8" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          {/* Spine curving from pelvis on mat up to chest */}
          <path
            d="M52 122 L102 122 Q132 120 146 58"
            stroke={strokeMain}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Supporting Arms pressing into mat */}
          <path
            d="M140 72 L136 102 L144 124"
            stroke={strokeAccent}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Heart & Sacral Chakra Glow */}
          <circle cx="141" cy="74" r="6" fill={chakraColor} />
          <circle cx="106" cy="118" r="5" fill="#F97316" />
        </g>
      )}

      {diagramType === 'setu_bandhasana' && (
        <g>
          {/* Supine Head & Shoulders on Mat */}
          <circle cx="62" cy="116" r="7.5" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          {/* Elevated Bridge Pelvis & Spine */}
          <path
            d="M72 120 L118 76 L152 86 L154 124"
            stroke={strokeMain}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Clasped Arms flat on mat */}
          <line x1="74" y1="122" x2="132" y2="122" stroke={strokeAccent} strokeWidth="2.5" strokeLinecap="round" />
          {/* Vishuddha Throat Lock & Sacral Chakra */}
          <circle cx="74" cy="115" r="5" fill="#38BDF8" />
          <circle cx="118" cy="76" r="6" fill={chakraColor} />
        </g>
      )}

      {diagramType === 'paschimottanasana' && (
        <g>
          {/* Extended Legs Flat on Mat */}
          <line x1="78" y1="120" x2="158" y2="120" stroke={strokeMain} strokeWidth="3.2" strokeLinecap="round" />
          {/* Toes flexed up */}
          <line x1="158" y1="120" x2="158" y2="108" stroke={strokeMain} strokeWidth="2.8" strokeLinecap="round" />
          {/* Forward Folding Torso & Reaching Arms */}
          <path
            d="M78 120 Q74 88 120 92"
            stroke={strokeMain}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="128" cy="95" r="7.5" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          <line x1="96" y1="96" x2="156" y2="112" stroke={strokeAccent} strokeWidth="2.5" strokeLinecap="round" />
          {/* Muladhara Root & Spine Chakra */}
          <circle cx="78" cy="118" r="6" fill={chakraColor} />
        </g>
      )}

      {diagramType === 'balasana' && (
        <g>
          {/* Folded Legs in Child's Pose */}
          <path
            d="M68 122 L104 122 L74 106"
            stroke={strokeMain}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Rounded Surrendering Back */}
          <path
            d="M74 106 Q104 82 136 114"
            stroke={strokeMain}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Head resting on Mat (Ajna Third Eye) */}
          <circle cx="143" cy="116" r="7.5" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          {/* Extended Arms */}
          <line x1="128" y1="112" x2="174" y2="122" stroke={strokeAccent} strokeWidth="2.5" strokeLinecap="round" />
          {/* Third Eye Chakra Glow */}
          <circle cx="146" cy="121" r="5.5" fill={chakraColor} />
        </g>
      )}

      {diagramType === 'trikonasana' && (
        <g>
          {/* Wide Triangle Stance Legs */}
          <path
            d="M76 124 L110 78 L146 124"
            stroke={strokeMain}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lateral Tilted Torso */}
          <line x1="110" y1="78" x2="138" y2="68" stroke={strokeMain} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="148" cy="64" r="7.5" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          {/* Vertical Arm Axis */}
          <line x1="136" y1="30" x2="142" y2="118" stroke={strokeAccent} strokeWidth="2.6" strokeLinecap="round" />
          {/* Heart & Solar Plexus Glow */}
          <circle cx="132" cy="70" r="6" fill={chakraColor} />
        </g>
      )}

      {diagramType === 'ardha_matsyendrasana' && (
        <g>
          {/* Seated Crossed Twist Base */}
          <path
            d="M84 122 L136 122 M96 122 L118 94 L132 122"
            stroke={strokeMain}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Erect Twisting Spine */}
          <line x1="110" y1="120" x2="110" y2="54" stroke={strokeMain} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="110" cy="42" r="8" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          {/* Twisting Arms */}
          <path
            d="M90 82 L110 66 L132 92"
            stroke={strokeAccent}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Manipura Navel Twist Chakra */}
          <circle cx="110" cy="88" r="6.5" fill={chakraColor} />
        </g>
      )}

      {diagramType === 'viparita_karani' && (
        <g>
          {/* Vertical Support Wall Line */}
          <line x1="152" y1="24" x2="152" y2="126" stroke={strokeAccent} strokeWidth="2" strokeDasharray="4 3" />
          {/* Supine Torso on Mat */}
          <circle cx="74" cy="116" r="7.5" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          <line x1="84" y1="120" x2="144" y2="120" stroke={strokeMain} strokeWidth="3.2" strokeLinecap="round" />
          {/* Legs Elevated Vertically Up Wall */}
          <line x1="144" y1="120" x2="144" y2="38" stroke={strokeMain} strokeWidth="3.4" strokeLinecap="round" />
          {/* Downward Prana Flow Arrow */}
          <path d="M134 52 L134 96 M130 90 L134 96 L138 90" stroke={chakraColor} strokeWidth="1.8" strokeLinecap="round" />
          {/* Anahata & Ajna Chakra Glow */}
          <circle cx="106" cy="118" r="5.5" fill={chakraColor} />
          <circle cx="74" cy="114" r="4.5" fill="#6366F1" />
        </g>
      )}

      {diagramType === 'vajrasana_mandukasana' && (
        <g>
          {/* Kneeling Thunderbolt Base */}
          <path
            d="M78 122 L132 122 L106 106 Z"
            stroke={strokeMain}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Upright Spine & Head */}
          <line x1="108" y1="106" x2="108" y2="54" stroke={strokeMain} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="108" cy="42" r="8" stroke={strokeMain} strokeWidth="2.5" fill={bgAura} />
          {/* Hands in Adi Mudra at Navel */}
          <path
            d="M108 64 L94 84 L108 88 L122 84 Z"
            stroke={strokeAccent}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {/* Glowing Manipura Navel Fire */}
          <circle cx="108" cy="88" r="6.5" fill={chakraColor} />
        </g>
      )}
    </svg>
  );
};

/**
 * Custom Illustrative SVG Diagram for Pranayama & Nadi Channels
 */
export const PranayamaIllustration: React.FC<{
  diagramType: PranayamaDiagramType;
  className?: string;
  lightMode?: boolean;
}> = ({ diagramType, className = 'w-full h-32', lightMode = false }) => {
  const strokeMain = lightMode ? '#78350F' : '#FDE68A';
  const idaColor = '#38BDF8'; // Lunar Left Nadi
  const pingalaColor = '#F59E0B'; // Solar Right Nadi
  const sushumnaColor = '#10B981'; // Central Channel

  return (
    <svg viewBox="0 0 220 125" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Meditating Padmasana Silhouette */}
      <circle cx="110" cy="30" r="10" stroke={strokeMain} strokeWidth="2.2" />
      <path
        d="M92 52 Q110 44 128 52 L142 96 L78 96 Z"
        stroke={strokeMain}
        strokeWidth="2"
        strokeOpacity="0.65"
      />
      {/* Crossed Lotus Legs */}
      <path d="M68 106 Q110 92 152 106 Q110 116 68 106 Z" stroke={strokeMain} strokeWidth="2.2" />

      {/* Central Sushumna Nadi */}
      <line x1="110" y1="24" x2="110" y2="104" stroke={sushumnaColor} strokeWidth="2.2" strokeDasharray="3 2" />

      {/* Ida (Lunar Left) & Pingala (Solar Right) Helical Waves */}
      {(diagramType === 'nadi_shodhana' || diagramType === 'ujjayi_kumbhaka') && (
        <g>
          <path
            d="M110 102 Q86 84 110 66 Q134 48 110 30"
            stroke={idaColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M110 102 Q134 84 110 66 Q86 48 110 30"
            stroke={pingalaColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="110" cy="30" r="4.5" fill="#A855F7" />
          <circle cx="110" cy="66" r="4.5" fill="#10B981" />
          <circle cx="110" cy="102" r="4.5" fill="#EF4444" />
        </g>
      )}

      {diagramType === 'bhramari' && (
        <g>
          {/* Concentric Acoustic Sound Waves from Ajna/Crown */}
          <circle cx="110" cy="30" r="18" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="110" cy="30" r="28" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="110" cy="30" r="38" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="2 4" />
          <circle cx="110" cy="30" r="5" fill="#818CF8" />
        </g>
      )}

      {diagramType === 'surya_bhedana' && (
        <g>
          {/* Right Pingala Solar Channel Highlighted */}
          <path
            d="M110 102 Q138 78 122 32"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="110" cy="76" r="8" fill="#F59E0B" fillOpacity="0.6" />
          <circle cx="166" cy="30" r="12" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
        </g>
      )}

      {diagramType === 'sheetali_sheetkari' && (
        <g>
          {/* Cooling Lunar Stream Descending to Navel */}
          <path
            d="M110 36 L110 82"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="110" cy="52" r="6" fill="#38BDF8" />
          <circle cx="110" cy="82" r="7" fill="#38BDF8" fillOpacity="0.5" stroke="#38BDF8" strokeWidth="1.5" />
        </g>
      )}

      {diagramType === 'kapalabhati_agnisara' && (
        <g>
          {/* Radiant Manipura Navel Fire Pulse */}
          <circle cx="110" cy="80" r="14" fill="#EF4444" fillOpacity="0.25" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="110" cy="80" r="6.5" fill="#F59E0B" />
          <path d="M110 72 L110 26" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 2" />
        </g>
      )}
    </svg>
  );
};

export const YogaPranayamaModule: React.FC<YogaPranayamaModuleProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [activeSubView, setActiveSubView] = useState<'gallery' | 'pranayama' | 'weekly_planner'>('gallery');
  const [selectedAsanaId, setSelectedAsanaId] = useState<string | null>(null);

  const yogaPlan = useMemo(() => calculateYogaPranayamaPlan(profile), [profile]);

  // Persistent 7-Day Weekly Planner completion state keyed by profile name/DOB
  const storageKey = useMemo(
    () => `tathastu_yoga_planner_v1_${(profile.name || 'user').toLowerCase().replace(/\s+/g, '_')}_${profile.dob}`,
    [profile.name, profile.dob]
  );

  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedItems(JSON.parse(saved));
      } else {
        setCompletedItems({});
      }
    } catch {
      setCompletedItems({});
    }
  }, [storageKey]);

  const togglePlannerItem = (itemKey: string) => {
    setCompletedItems((prev) => {
      const next = { ...prev, [itemKey]: !prev[itemKey] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  const toggleFullDayCompletion = (dayIdx: number) => {
    const keys = [
      `day-${dayIdx}-asana-0`,
      `day-${dayIdx}-asana-1`,
      `day-${dayIdx}-pranayama`,
      `day-${dayIdx}-mantra`,
    ];
    const allDone = keys.every((k) => Boolean(completedItems[k]));
    setCompletedItems((prev) => {
      const next = { ...prev };
      for (const k of keys) {
        next[k] = !allDone;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetWeeklyTracker = () => {
    setCompletedItems({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  // Toggle Health Concern in Profile
  const handleToggleHealthConcern = (concernId: string) => {
    if (!onUpdateProfile) return;
    const current =
      profile.healthConcerns !== undefined
        ? profile.healthConcerns
        : yogaPlan.selectedHealthConcerns.map((s) => s.id);
    const exists = current.includes(concernId);
    const updatedList = exists
      ? current.filter((c) => c !== concernId)
      : [...current, concernId];
    onUpdateProfile({
      ...profile,
      healthConcerns: updatedList,
    });
  };

  const totalWeeklyTasks = 7 * 4; // 4 practices per day across 7 days = 28 items
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const weeklyProgressPct = Math.min(100, Math.round((completedCount / totalWeeklyTasks) * 100));
  const completedDaysCount = [0, 1, 2, 3, 4, 5, 6].filter((dIdx) =>
    [`day-${dIdx}-asana-0`, `day-${dIdx}-asana-1`, `day-${dIdx}-pranayama`, `day-${dIdx}-mantra`].every(
      (k) => Boolean(completedItems[k])
    )
  ).length;

  const focusedAsana: YogaPosturePrescription =
    yogaPlan.dailyAsanas.find((a) => a.id === selectedAsanaId) || yogaPlan.dailyAsanas[0];

  const todayWeekdayIdx = new Date().getDay();

  return (
    <div className="space-y-6">
      {/* Top Hero Banner: Birth Chart Pranic Constitution & Health Concerns Selector */}
      <div className="bg-slate-900/85 border border-amber-500/35 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-amber-500/20 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vedic Yoga-Chikitsa & Prana-Jyotish Sadhana Engine</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Personalized Vedic Yoga & Pranayama Sadhana
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Calibrated for <strong className="text-amber-300">{profile.name}</strong> • Mulank{' '}
              <strong className="text-amber-200">{yogaPlan.mulank}</strong> • Bhagyank{' '}
              <strong className="text-amber-200">{yogaPlan.bhagyank}</strong> • Janma Rashi:{' '}
              <strong className="text-emerald-300">{yogaPlan.rashi}</strong> ({yogaPlan.nakshatra} Pada{' '}
              {yogaPlan.pada})
            </p>
          </div>

          {/* Sub-navigation switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/90 p-1.5 rounded-xl border border-amber-500/30 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubView('gallery')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'gallery'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-amber-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Visual Posture Gallery ({yogaPlan.dailyAsanas.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('pranayama')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'pranayama'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-amber-200 hover:bg-slate-900'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Pranayama & Mudras ({yogaPlan.dailyPranayamas.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('weekly_planner')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'weekly_planner'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-emerald-200 hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7-Day Weekly Planner ({weeklyProgressPct}%)</span>
            </button>
          </div>
        </div>

        {/* 3 Birth-Chart Pranic Summary Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 relative z-10">
          <div className="p-3.5 rounded-xl bg-slate-950/85 border border-amber-500/25">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Ayurvedic & Planetary Prana Prakriti
            </span>
            <p className="text-xs font-semibold text-amber-100 leading-snug">
              {yogaPlan.dominantDoshaConstitution}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/85 border border-emerald-500/25">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Primary & Secondary Chakra Axis
            </span>
            <p className="text-xs font-semibold text-emerald-100 leading-snug">
              Primary: {yogaPlan.primaryChakra}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Secondary: {yogaPlan.secondaryChakra}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/85 border border-sky-500/25">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
              Active Health Concerns Targeted
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {yogaPlan.selectedHealthConcerns.map((hc) => (
                <span
                  key={hc.id}
                  className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/35 text-sky-200 text-[10px] font-semibold"
                >
                  {hc.label.split('(')[0].trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Health Concerns Selector */}
        <div className="bg-slate-950/90 border border-amber-500/25 rounded-xl p-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Current Health Concerns (For Daily Vedic Yoga &amp; Pranayama Module)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Click any health concern below to tailor your daily therapeutic Yoga postures and breathing ratios:
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-md shrink-0">
              {yogaPlan.selectedHealthConcerns.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {HEALTH_CONCERN_OPTIONS.map((opt) => {
              const isSelected =
                profile.healthConcerns !== undefined
                  ? profile.healthConcerns.includes(opt.id)
                  : yogaPlan.selectedHealthConcerns.some((s) => s.id === opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => handleToggleHealthConcern(opt.id)}
                  className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-400 text-amber-100 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-amber-500/35 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-slate-950 border-slate-600 text-transparent'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 opacity-0" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-snug truncate">{opt.label}</div>
                    <div className="text-[10px] text-amber-300/80 font-medium">{opt.hindiLabel}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{opt.ayurvedicDosha}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* VIEW 1: VISUAL POSTURE CARD GALLERY & STEP-BY-STEP ALIGNMENT */}
      {activeSubView === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Visual Yoga Posture Card Gallery (Birth Chart & Health Prescriptions)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Each posture card includes an anatomical alignment diagram, glowing Chakra focal point, and breathing cue. Click any card for full step-by-step instructions.
              </p>
            </div>
          </div>

          {/* Visual Card Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {yogaPlan.dailyAsanas.map((asana, idx) => {
              const isSelected = focusedAsana.id === asana.id;
              return (
                <div
                  key={asana.id}
                  onClick={() => setSelectedAsanaId(asana.id)}
                  className={`rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : 'bg-slate-900/85 border-amber-500/25 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    {/* Top Category & Planet Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          asana.category === 'Core Birth Chart Asana'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : asana.category === 'Rashi & Nakshatra Asana'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {idx + 1}. {asana.category}
                      </span>
                      <span className="text-[10px] font-mono text-amber-200/80">
                        {asana.durationOrReps.split('(')[0].trim()}
                      </span>
                    </div>

                    {/* Visual SVG Posture Illustration Frame */}
                    <div className="rounded-xl bg-slate-950/90 border border-amber-500/20 p-3 mb-3 relative overflow-hidden">
                      <YogaPostureIllustration
                        diagramType={asana.diagramType}
                        chakraColor={asana.chakraColor}
                        className="w-full h-36"
                      />
                      <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80">
                        <span className="text-amber-300 font-semibold">
                          Chakra: {asana.targetChakra.split('&')[0].trim()}
                        </span>
                        <span className="text-emerald-300 font-mono">
                          {asana.governingPlanet.split('(')[0].trim()}
                        </span>
                      </div>
                    </div>

                    {/* Posture Titles */}
                    <h4 className="font-serif text-base font-bold text-amber-100 leading-snug">
                      {asana.sanskritName}
                    </h4>
                    <div className="text-xs font-semibold text-amber-300/90 mt-0.5">
                      {asana.englishName} • <span className="text-amber-200">{asana.hindiName}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {asana.astrologicalReason}
                    </p>
                  </div>

                  {/* Breathing Cue & Alignment Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-800/90 space-y-2">
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/25 text-[11px] text-emerald-200">
                      <strong className="text-emerald-400 uppercase text-[10px] block">
                        Prana Breathing Cue:
                      </strong>
                      {asana.breathingCue}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                      <span>Click to view {asana.stepByStepAlignment.length}-step alignment</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep Step-by-Step Alignment & Benefits Panel for Selected Posture */}
          <div className="bg-slate-900/90 border border-amber-500/35 rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 bg-slate-950/90 border border-amber-500/30 rounded-xl p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                  ACTIVE POSTURE BLUEPRINT
                </span>
                <h4 className="font-serif text-lg font-bold text-amber-100 mb-1">
                  {focusedAsana.sanskritName}
                </h4>
                <p className="text-xs text-amber-300 mb-3">{focusedAsana.hindiName}</p>
                <YogaPostureIllustration
                  diagramType={focusedAsana.diagramType}
                  chakraColor={focusedAsana.chakraColor}
                  className="w-full h-44 mx-auto"
                />
                <div className="mt-3 pt-3 border-t border-slate-800 text-left space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ruling Graha:</span>
                    <span className="text-amber-200 font-semibold">{focusedAsana.governingPlanet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Chakra:</span>
                    <span className="text-emerald-300 font-semibold">{focusedAsana.targetChakra}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Hold:</span>
                    <span className="text-amber-300 font-mono font-bold">{focusedAsana.durationOrReps}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Step-by-Step Vedic Alignment Instructions
                  </span>
                  <div className="space-y-2">
                    {focusedAsana.stepByStepAlignment.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/15 text-xs text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5">
                      Therapeutic & Pranic Benefits
                    </span>
                    <ul className="space-y-1.5">
                      {focusedAsana.therapeuticBenefits.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-xs text-slate-200">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/30 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                        Best Direction & Hora Timing
                      </span>
                      <p className="text-xs text-amber-100 font-semibold mb-3">
                        {focusedAsana.bestTimeAndDirection}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-amber-500/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block mb-0.5">
                        Safety & Precaution:
                      </span>
                      <p className="text-[11px] text-slate-300">{focusedAsana.precaution}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PRANAYAMA, MUDRA & BANDHA PROTOCOLS */}
      {activeSubView === 'pranayama' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
              <Wind className="w-5 h-5 text-emerald-400" />
              <span>Daily Vedic Pranayama, Mudra & Mantra Breathing Protocols</span>
            </h3>
            <p className="text-xs text-slate-400">
              Specifically calibrated to balance your Ida (Lunar), Pingala (Solar), and Sushumna Nadis according to Mulank {yogaPlan.mulank} and Bhagyank {yogaPlan.bhagyank}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {yogaPlan.dailyPranayamas.map((prana, idx) => (
              <div
                key={prana.id}
                className="bg-slate-900/85 border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                      Pranayama #{idx + 1} • {prana.governingPlanet}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-300">
                      {prana.roundsAndDuration.split('(')[0].trim()}
                    </span>
                  </div>

                  {/* SVG Nadi Illustration */}
                  <div className="rounded-xl bg-slate-950/90 border border-emerald-500/20 p-3 mb-3">
                    <PranayamaIllustration diagramType={prana.diagramType} className="w-full h-32" />
                    <div className="text-center text-[10px] text-emerald-300 font-semibold pt-2 border-t border-slate-800">
                      {prana.targetNadiAndChakra}
                    </div>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-amber-100">{prana.sanskritName}</h4>
                  <p className="text-xs text-amber-300 font-medium mb-3">
                    {prana.englishName} • {prana.hindiName}
                  </p>

                  {/* Breath Ratio & Mudra Box */}
                  <div className="grid grid-cols-1 gap-2 mb-3">
                    <div className="p-2.5 rounded-lg bg-slate-950/90 border border-amber-500/25">
                      <span className="text-[10px] font-bold uppercase text-amber-400 block">
                        Prescribed Breath Ratio (Puraka : Kumbhaka : Rechaka)
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-100">
                        {prana.breathingRatio}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/90 border border-emerald-500/25">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                        Hasta Mudra & Bandha Lock
                      </span>
                      <span className="text-xs font-semibold text-emerald-100">
                        {prana.mudraAndBandha}
                      </span>
                    </div>
                  </div>

                  {/* Technique Steps */}
                  <div className="space-y-1.5 mb-3">
                    {prana.stepByStepTechnique.map((st, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold">{sIdx + 1}.</span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block">
                      Synchronized Beej Mantra:
                    </span>
                    <span className="font-serif font-bold text-amber-200">{prana.beejMantra}</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    <strong className="text-emerald-400">Pranic Outcome:</strong>{' '}
                    {prana.astrologicalAndHealthBenefit}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Sadhana Timetable & Ayurvedic Ahara */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-slate-900/85 border border-amber-500/30 rounded-2xl p-5">
              <h4 className="font-serif text-base font-bold text-amber-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Ideal Daily Vedic Dinacharya (Yoga & Pranayama Timetable)</span>
              </h4>
              <div className="space-y-2.5">
                {yogaPlan.dailySadhanaTimetable.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/85 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-300 block">
                        {row.slot}
                      </span>
                      <span className="text-xs font-semibold text-amber-100 block mt-0.5">
                        {row.practice}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{row.purpose}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900/85 border border-emerald-500/30 rounded-2xl p-5">
              <h4 className="font-serif text-base font-bold text-emerald-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Ayurvedic Ahara (Dietary & Pranic Tips)</span>
              </h4>
              <ul className="space-y-2.5">
                {yogaPlan.ayurvedicAharaTips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/85 border border-emerald-500/20 text-xs text-slate-200 flex items-start gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: 7-DAY WEEKLY YOGA & PRANAYAMA PLANNER WITH COMPLETION TRACKER */}
      {activeSubView === 'weekly_planner' && (
        <div className="space-y-6">
          {/* Weekly Progress Tracker Header */}
          <div className="bg-slate-900/90 border border-emerald-500/35 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>7-Day Vara-Jyotish Planetary Yoga & Pranayama Schedule</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-amber-100">
                  Weekly Yoga & Pranayama Planner for {profile.name}
                </h3>
                <p className="text-xs text-slate-300">
                  Synchronized with the 7 Planetary Weekdays (Ravivar to Shanivar) and tailored to Mulank {yogaPlan.mulank}, Bhagyank {yogaPlan.bhagyank}, and {yogaPlan.rashi}.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block">
                    Weekly Sadhana Completion
                  </span>
                  <span className="text-lg font-mono font-extrabold text-amber-200">
                    {completedCount}/{totalWeeklyTasks} Tasks ({weeklyProgressPct}%)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {completedDaysCount} / 7 Full Days Completed
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetWeeklyTracker}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  title="Reset Weekly Completion Checkboxes"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Week</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-emerald-500/30">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${weeklyProgressPct}%` }}
              />
            </div>
          </div>

          {/* 7-Day Schedule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {yogaPlan.weeklyPlanner.map((dayPlan) => {
              const isToday = dayPlan.dayIndex === todayWeekdayIdx;
              const dayKeys = [
                `day-${dayPlan.dayIndex}-asana-0`,
                `day-${dayPlan.dayIndex}-asana-1`,
                `day-${dayPlan.dayIndex}-pranayama`,
                `day-${dayPlan.dayIndex}-mantra`,
              ];
              const dayDoneCount = dayKeys.filter((k) => Boolean(completedItems[k])).length;
              const isFullDayDone = dayDoneCount === dayKeys.length;

              return (
                <div
                  key={dayPlan.dayIndex}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    isFullDayDone
                      ? 'bg-emerald-950/35 border-emerald-400/60 shadow-lg shadow-emerald-500/10'
                      : isToday
                      ? 'bg-gradient-to-b from-amber-950/50 to-slate-900 border-amber-400 ring-1 ring-amber-400/40'
                      : 'bg-slate-900/85 border-slate-800 hover:border-amber-500/35'
                  }`}
                >
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif text-sm font-extrabold text-amber-100">
                            {dayPlan.dayName}
                          </span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase">
                              Today
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-300/90 font-semibold block">
                          {dayPlan.hindiDay}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFullDayCompletion(dayPlan.dayIndex)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isFullDayDone
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-amber-200'
                        }`}
                        title={isFullDayDone ? 'Mark Day Incomplete' : 'Mark Full Day Complete'}
                      >
                        {isFullDayDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Ruling Planet Badge */}
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${dayPlan.colorTheme} border mb-2.5`}
                    >
                      <div className="text-[10px] font-extrabold uppercase tracking-wider">
                        Lord: {dayPlan.rulingPlanet}
                      </div>
                      <div className="text-[10px] opacity-90 truncate">{dayPlan.themeTitle}</div>
                    </div>

                    {/* Mini Posture Illustration */}
                    <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-1.5 mb-2.5">
                      <YogaPostureIllustration
                        diagramType={dayPlan.morningAsanas[0].diagramType}
                        className="w-full h-24"
                      />
                    </div>

                    {/* Checkable Daily Items */}
                    <div className="space-y-2 text-xs">
                      {dayPlan.morningAsanas.map((asItem, aIdx) => {
                        const key = `day-${dayPlan.dayIndex}-asana-${aIdx}`;
                        const checked = Boolean(completedItems[key]);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => togglePlannerItem(key)}
                            className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-start gap-2 ${
                              checked
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 line-through opacity-85'
                                : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-amber-500/35'
                            }`}
                          >
                            {checked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold leading-snug">{asItem.name}</div>
                              <div className="text-[10px] text-amber-300/80 font-mono">
                                {asItem.duration}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Pranayama Check Item */}
                      {(() => {
                        const key = `day-${dayPlan.dayIndex}-pranayama`;
                        const checked = Boolean(completedItems[key]);
                        return (
                          <button
                            type="button"
                            onClick={() => togglePlannerItem(key)}
                            className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-start gap-2 ${
                              checked
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 line-through opacity-85'
                                : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-500/35'
                            }`}
                          >
                            {checked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <div className="text-[10px] font-extrabold uppercase text-emerald-400">
                                Pranayama
                              </div>
                              <div className="text-[11px] font-bold leading-snug">
                                {dayPlan.pranayamaPractice.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {dayPlan.pranayamaPractice.rounds}
                              </div>
                            </div>
                          </button>
                        );
                      })()}

                      {/* Mudra & Mantra Check Item */}
                      {(() => {
                        const key = `day-${dayPlan.dayIndex}-mantra`;
                        const checked = Boolean(completedItems[key]);
                        return (
                          <button
                            type="button"
                            onClick={() => togglePlannerItem(key)}
                            className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-start gap-2 ${
                              checked
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 line-through opacity-85'
                                : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-amber-500/35'
                            }`}
                          >
                            {checked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <div className="text-[10px] font-extrabold uppercase text-amber-400">
                                Mudra & Japa
                              </div>
                              <div className="text-[11px] font-semibold leading-snug">
                                {dayPlan.mudraAndMantra.mudra}
                              </div>
                            </div>
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Footer Synergy */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {dayPlan.personalChartSynergy}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Progress:</span>
                      <span className={isFullDayDone ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                        {dayDoneCount}/4 Done
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
