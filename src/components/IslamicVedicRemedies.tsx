import React, { useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  ShieldCheck,
  HeartHandshake,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  Gem,
} from 'lucide-react';
import { BirthProfile } from '../types';
import { calculateIslamicVedicReport } from '../utils/islamicVedicRemedies';
import islamicNoorArt from '../assets/images/islamic_vedic_noor_geometry_1794305507170.jpg';

interface IslamicVedicRemediesProps {
  profile: BirthProfile;
}

export const IslamicVedicRemedies: React.FC<IslamicVedicRemediesProps> = ({ profile }) => {
  const report = useMemo(() => calculateIslamicVedicReport(profile), [profile]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Hero Banner with Islamic-Vedic Noor Geometry Artwork */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900 shadow-2xl">
        <img
          src={islamicNoorArt}
          alt="Sacred Islamic-Vedic Noor Geometry"
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        />
        <div className="relative z-10 p-6 sm:p-8 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-emerald-950/85">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ilm-ul-Adad (Quranic Numerology) • Asma-ul-Husna Dhikr • Roohani Remedies</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-amber-100">
                Islamic-Vedic Spiritual Remedies & Daily Dhikr Blueprint
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                {report.personalizedSummaryParagraph}
              </p>
            </div>

            <div className="lg:col-span-4 rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-slate-950 shadow-xl">
              <img
                src={islamicNoorArt}
                alt="Sacred Noor Geometry"
                className="w-full h-40 object-cover"
              />
              <div className="p-3 text-center bg-slate-950">
                <div className="text-xs font-bold text-amber-200">
                  Abjad Resonance: {report.abjadCompoundEstimate} ➔ Root {report.abjadRootNumber}
                </div>
                <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                  Mulank {report.mulank} • Bhagyank {report.bhagyank} • Namank {report.namank}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Top 3 Asma-ul-Husna (99 Names of Allah) Wazifa Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            badge: `Birth Driver (Mulank ${report.mulank}) Primary Dhikr`,
            data: report.primaryAsmaRemedy,
            border: 'border-amber-500/45',
            accent: 'text-amber-300',
          },
          {
            badge: `Life Path Destiny (Bhagyank ${report.bhagyank}) Wazifa`,
            data: report.destinyAsmaRemedy,
            border: 'border-emerald-500/45',
            accent: 'text-emerald-300',
          },
          {
            badge: `Name Vibration (Namank ${report.namank}) Roohani Shield`,
            data: report.nameAsmaRemedy,
            border: 'border-sky-500/45',
            accent: 'text-sky-300',
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-slate-900/95 border ${card.border} shadow-xl space-y-3 flex flex-col justify-between`}
          >
            <div className="space-y-2.5">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${card.accent} block`}>
                {card.badge}
              </span>
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-center space-y-1">
                <div className="text-xl sm:text-2xl font-serif font-bold text-amber-200">
                  {card.data.arabicName}
                </div>
                <div className="text-sm font-black text-emerald-300">
                  {card.data.transliteration}
                </div>
                <div className="text-[11px] text-slate-300 italic">"{card.data.meaning}"</div>
              </div>

              <div className="text-xs space-y-1.5 text-slate-200">
                <div>
                  <strong className="text-amber-300">Planetary Sphere:</strong> {card.data.planetarySphere}
                </div>
                <div>
                  <strong className="text-emerald-300">Daily Tasbeeh Count:</strong>{' '}
                  <span className="font-mono font-bold">{card.data.recommendedDailyCount}</span> (Abjad Value: {card.data.abjadCount})
                </div>
                <div>
                  <strong className="text-sky-300">Best Time:</strong> {card.data.bestPrayerTime}
                </div>
                <p className="text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                  <strong className="text-amber-200">Barkat & Benefit:</strong> {card.data.spiritualBenefit}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200">
              <strong>Challenge Resolved:</strong> {card.data.specificChallengeSolved}
            </div>
          </div>
        ))}
      </div>

      {/* Quranic Surah & Dua Remedies for Planetary & Life Challenges */}
      <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-500/25 pb-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Quranic Surah, Dua, Sadaqah & Halal Gemstone Remedies for Life Challenges</span>
            </h2>
            <p className="text-xs text-slate-400">
              Specific Roohani prescriptions for Career/Rizq, Nikah/Marriage Harmony, Protection from Nazar-e-Bad, Victory, and Complete Shifa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.quranicRemedies.map((rem) => (
            <div
              key={rem.id}
              className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-amber-200">
                    {rem.lifeArea}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-rose-300">
                  <strong>Issue Addressed:</strong> {rem.planetaryChallenge}
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/25 space-y-1">
                  <div className="text-xs font-bold text-emerald-300">{rem.surahOrDuaName}</div>
                  <div className="text-base font-serif text-amber-100 text-right dir-rtl">
                    {rem.arabicSnippet}
                  </div>
                  <div className="text-xs font-semibold text-amber-300 italic">
                    "{rem.transliteration}"
                  </div>
                  <div className="text-[11px] text-slate-300">{rem.translationSummary}</div>
                </div>

                <div className="text-xs text-slate-200 space-y-1">
                  <div>
                    <strong className="text-amber-300">Recitation Method:</strong> {rem.recitationProtocol}
                  </div>
                  <div>
                    <strong className="text-emerald-300">Sadaqah (Charity):</strong> {rem.sadaqahCharityItem}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                <Gem className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Sunnah Stone & Attar:</strong> {rem.halalStoneAndAttar}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Weekly Planetary Dhikr & Sadaqah Schedule */}
      <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>7-Day Weekly Dhikr, Wazifa & Sadaqah Schedule (Sunday – Saturday)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Daily alignment of Asma-ul-Husna and Sadaqah with the 7 classical planetary spheres.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {report.weeklyDhikrSchedule.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950 border border-amber-500/25 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="text-xs font-black text-amber-300">{item.day}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {item.islamicPlanet} • {item.vedicPlanet}
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-emerald-500/30 text-center">
                  <div className="text-base font-serif text-amber-200">{item.arabicDhikr}</div>
                  <div className="text-xs font-bold text-emerald-300">{item.primaryDhikr}</div>
                  <div className="text-[10px] font-mono text-amber-300">{item.count}</div>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  <strong className="text-amber-200">Sadaqah:</strong> {item.sadaqahAction}
                </p>
              </div>
              <div className="text-[11px] text-emerald-300 pt-1.5 border-t border-slate-800 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item.benefit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete 1-to-9 Ilm-ul-Adad Reference Table */}
      <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="font-serif text-lg font-bold text-amber-100">
          Complete Ilm-ul-Adad (Numbers 1 to 9) Asma-ul-Husna Reference Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {report.allNineAsmaRemedies.map((item) => {
            const isPersonal =
              item.number === report.mulank ||
              item.number === report.bhagyank ||
              item.number === report.namank;
            return (
              <div
                key={item.number}
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  isPersonal
                    ? 'bg-amber-500/15 border-amber-400 text-amber-100'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-300">
                    Number {item.number} — {item.planetarySphere.split('(')[0]}
                  </span>
                  {isPersonal && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400/50 text-emerald-300 text-[10px]">
                      Your Active Number
                    </span>
                  )}
                </div>
                <div className="font-serif text-sm text-amber-200">{item.arabicName}</div>
                <div className="font-bold text-emerald-300">{item.transliteration}</div>
                <div className="text-[11px] opacity-90">{item.recommendedDailyCount}</div>
                <p className="text-[11px] text-slate-400 leading-snug">{item.spiritualBenefit}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
