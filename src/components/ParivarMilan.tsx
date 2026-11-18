import React, { useState, useEffect, useMemo } from 'react';
import { BirthProfile } from '../types';
import {
  FAMILY_RELATION_OPTIONS,
  FamilyRelationType,
  ParivarMemberRecord,
  PARIVAR_MILAN_DISCLAIMER,
  calculateParivarMilanReport,
} from '../utils/parivarMilan';
import { CityAutocompleteInput } from './CityAutocompleteInput';
import { BirthTimeAmPmInput } from './BirthTimeAmPmInput';
import {
  Users,
  UserPlus,
  Save,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Trash2,
  Edit3,
  BarChart3,
  HeartHandshake,
  Compass,
  Gem,
  Volume2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Lock,
} from 'lucide-react';

interface ParivarMilanProps {
  profile: BirthProfile;
  onUpdateProfile?: (updated: BirthProfile) => Promise<void> | void;
}

const MAX_FAMILY_MEMBERS = 5;

function getLocalParivarKey(profileId: string): string {
  return `tathastu_parivar_members_v1_${profileId || 'default'}`;
}

export const ParivarMilan: React.FC<ParivarMilanProps> = ({ profile, onUpdateProfile }) => {
  // Load saved family members from profile or localStorage
  const [members, setMembers] = useState<ParivarMemberRecord[]>(() => {
    if (Array.isArray(profile.parivarMembers) && profile.parivarMembers.length > 0) {
      return profile.parivarMembers.slice(0, MAX_FAMILY_MEMBERS).map((m) => ({
        ...m,
        isSaved: true,
      }));
    }
    try {
      const raw = localStorage.getItem(getLocalParivarKey(profile.id));
      if (raw) {
        const parsed = JSON.parse(raw) as ParivarMemberRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, MAX_FAMILY_MEMBERS).map((m) => ({
            ...m,
            isSaved: true,
          }));
        }
      }
    } catch {
      // ignore storage error
    }
    return [];
  });

  // Sync when active profile changes
  useEffect(() => {
    if (Array.isArray(profile.parivarMembers) && profile.parivarMembers.length > 0) {
      setMembers(
        profile.parivarMembers.slice(0, MAX_FAMILY_MEMBERS).map((m) => ({
          ...m,
          isSaved: true,
        }))
      );
      return;
    }
    try {
      const raw = localStorage.getItem(getLocalParivarKey(profile.id));
      if (raw) {
        const parsed = JSON.parse(raw) as ParivarMemberRecord[];
        if (Array.isArray(parsed)) {
          setMembers(
            parsed.slice(0, MAX_FAMILY_MEMBERS).map((m) => ({
              ...m,
              isSaved: true,
            }))
          );
          return;
        }
      }
    } catch {
      // ignore
    }
    setMembers([]);
  }, [profile.id, profile.parivarMembers]);

  const [viewPage, setViewPage] = useState<'form' | 'results'>(() => {
    if (Array.isArray(profile.parivarMembers) && profile.parivarMembers.length > 0) {
      return 'results';
    }
    return 'form';
  });

  const [selectedMemberTabId, setSelectedMemberTabId] = useState<string>('all');
  const [formNotice, setFormNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);

  const isIncludeInReport = profile.includeParivarMilan !== false;

  const handleToggleIncludeParivarReport = async (checked: boolean) => {
    if (onUpdateProfile) {
      await onUpdateProfile({
        ...profile,
        includeParivarMilan: checked,
      });
    }
    setFormNotice({
      type: 'success',
      text: checked
        ? 'Parivar Milan INCLUDED in PDF Print, Download, Share & Direct WhatsApp PDF Report.'
        : 'Parivar Milan EXCLUDED from PDF Print, Download, Share & Direct WhatsApp PDF Report.',
    });
  };

  const savedMembers = useMemo(() => members.filter((m) => m.isSaved), [members]);
  const hasUnsavedMember = useMemo(() => members.some((m) => !m.isSaved), [members]);
  const canAddMoreMembers = members.length < MAX_FAMILY_MEMBERS && !hasUnsavedMember;

  // Persist helper to localStorage and parent profile
  const persistSavedMembers = async (nextList: ParivarMemberRecord[]) => {
    const cleanSaved = nextList
      .filter((m) => m.isSaved && m.name.trim() && m.dob.trim())
      .slice(0, MAX_FAMILY_MEMBERS);
    try {
      localStorage.setItem(getLocalParivarKey(profile.id), JSON.stringify(cleanSaved));
    } catch {
      // ignore storage error
    }
    if (onUpdateProfile) {
      await onUpdateProfile({
        ...profile,
        parivarMembers: cleanSaved,
      });
    }
  };

  // Open a new Family Member blank form (only allowed if no unsaved member is open and < 5 members)
  const handleAddFamilyMemberForm = () => {
    setFormNotice(null);
    if (hasUnsavedMember) {
      setFormNotice({
        type: 'error',
        text: 'Please fill and click "Save Family Member" on the currently open family member form before adding another family member.',
      });
      return;
    }
    if (members.length >= MAX_FAMILY_MEMBERS) {
      setFormNotice({
        type: 'error',
        text: `Maximum ${MAX_FAMILY_MEMBERS} family members can be added in Parivar Milan.`,
      });
      return;
    }

    const defaultRelations: FamilyRelationType[] = [
      'Father',
      'Mother',
      'Spouse / Partner',
      'Son',
      'Daughter',
    ];
    const suggestedRelation = defaultRelations[members.length] || 'Brother';

    const newMember: ParivarMemberRecord = {
      id: `fam_${Date.now()}_${members.length + 1}`,
      name: '',
      dob: '',
      tob: '09:30',
      pob: '',
      lat: 28.6139,
      lng: 77.209,
      relation: suggestedRelation,
      isSaved: false,
    };

    setMembers((prev) => [...prev, newMember]);
  };

  const handleFieldChange = (
    memberId: string,
    updates: Partial<ParivarMemberRecord>
  ) => {
    setFormNotice(null);
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m))
    );
  };

  const handleSaveSingleMember = async (memberId: string, index: number) => {
    setFormNotice(null);
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    if (!target.name.trim()) {
      setFormNotice({
        type: 'error',
        text: `Please enter the Full Name for Family Member #${index + 1}.`,
      });
      return;
    }
    if (!target.dob.trim()) {
      setFormNotice({
        type: 'error',
        text: `Please select the Date of Birth (D.O.B) for ${target.name.trim()}.`,
      });
      return;
    }

    const finalizedMember: ParivarMemberRecord = {
      ...target,
      name: target.name.trim(),
      dob: target.dob.trim(),
      tob: target.tob?.trim() || '09:30',
      pob: target.pob?.trim() || 'New Delhi, India',
      lat: Number.isFinite(target.lat) ? target.lat : 28.6139,
      lng: Number.isFinite(target.lng) ? target.lng : 77.209,
      isSaved: true,
    };

    const nextMembers = members.map((m) => (m.id === memberId ? finalizedMember : m));
    setMembers(nextMembers);
    await persistSavedMembers(nextMembers);

    setFormNotice({
      type: 'success',
      text: `Family Member #${index + 1} (${finalizedMember.name} — ${finalizedMember.relation}) saved! ${
        nextMembers.length < MAX_FAMILY_MEMBERS
          ? 'You can now tap "+ Add Family Member" to add the next member or click "SAVE & CALCULATE".'
          : 'Maximum 5 family members saved. Click "SAVE & CALCULATE" below to view full 9-Chakra Diagnostics.'
      }`,
    });
  };

  const handleEditMember = (memberId: string) => {
    setFormNotice(null);
    if (hasUnsavedMember) {
      setFormNotice({
        type: 'error',
        text: 'Please save the currently open family member form first.',
      });
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isSaved: false } : m))
    );
  };

  const handleDeleteMember = async (memberId: string) => {
    setFormNotice(null);
    const nextMembers = members.filter((m) => m.id !== memberId);
    setMembers(nextMembers);
    await persistSavedMembers(nextMembers);
  };

  const handleSaveAndCalculate = async () => {
    setFormNotice(null);

    // Check if there is an open form that has valid name & dob; if so, auto-save it
    let workingList = [...members];
    const openUnsaved = workingList.find((m) => !m.isSaved);
    if (openUnsaved) {
      if (openUnsaved.name.trim() && openUnsaved.dob.trim()) {
        workingList = workingList.map((m) =>
          m.id === openUnsaved.id
            ? {
                ...m,
                name: m.name.trim(),
                dob: m.dob.trim(),
                tob: m.tob?.trim() || '09:30',
                pob: m.pob?.trim() || 'New Delhi, India',
                isSaved: true,
              }
            : m
        );
        setMembers(workingList);
      } else if (workingList.filter((m) => m.isSaved).length === 0) {
        setFormNotice({
          type: 'error',
          text: 'Please fill the Family Member Name, Date of Birth, Time, Place, and Relation, then click Save before calculating.',
        });
        return;
      } else {
        setFormNotice({
          type: 'error',
          text: 'You have an unsaved Family Member form open. Please either click "Save Family Member" on it or remove it before clicking SAVE & CALCULATE.',
        });
        return;
      }
    }

    const validSaved = workingList.filter((m) => m.isSaved && m.name.trim() && m.dob.trim());
    if (validSaved.length === 0) {
      setFormNotice({
        type: 'error',
        text: 'Please tap "+ Add Family Member", fill at least 1 family member’s birth details, and click "Save" first.',
      });
      return;
    }

    setIsSavingGlobal(true);
    try {
      await persistSavedMembers(validSaved);
      setViewPage('results');
      setSelectedMemberTabId('all');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const report = useMemo(
    () =>
      calculateParivarMilanReport(
        {
          name: profile.name,
          dob: profile.dob,
          tob: profile.tob,
          pob: profile.pob,
          lat: profile.lat,
          lng: profile.lng,
        },
        savedMembers
      ),
    [profile, savedMembers]
  );

  const visibleMemberResults = useMemo(() => {
    if (selectedMemberTabId === 'all') return report.memberResults;
    return report.memberResults.filter((r) => r.member.id === selectedMemberTabId);
  }, [report.memberResults, selectedMemberTabId]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Hero Banner & Page Mode Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest">
              <Users className="w-3.5 h-3.5" />
              <span>PARIVAR MILAN • 9-CHAKRA FAMILY HARMONY DIAGNOSTICS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
              Parivar Milan & Complete 9-Chakra Family Diagnostics
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Calculate <strong className="text-amber-300">{profile.name}</strong>’s mutual energetic harmony, karmic issues, and Vedic remedies with up to{' '}
              <strong className="text-amber-300">5 Family Members</strong> across{' '}
              <strong className="text-emerald-300">All 9 Chakras</strong> — including{' '}
              <span className="text-amber-200 font-semibold">1. Earth Star Chakra (Vasundhara)</span> &{' '}
              <span className="text-violet-300 font-semibold">9. Soul Star Chakra (Atma-Tara)</span>.
            </p>
          </div>

          {/* Step Tabs: Step 1 (Add Family Members) & Step 2 (SAVE & CALCULATE / Results Page) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 no-print">
            <button
              type="button"
              onClick={() => setViewPage('form')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                viewPage === 'form'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20 font-black'
                  : 'bg-slate-900/90 text-amber-200 border-amber-500/30 hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>1. Family Members ({savedMembers.length}/{MAX_FAMILY_MEMBERS})</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndCalculate}
              disabled={isSavingGlobal}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                viewPage === 'results'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 hover:brightness-110 shadow-lg'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>2. SAVE & CALCULATE</span>
            </button>
          </div>
        </div>

        {/* Client Primary Anchor Strip */}
        <div className="mt-6 pt-5 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              Primary Client (Self Anchor)
            </div>
            <div className="text-sm font-serif font-bold text-white mt-0.5">{profile.name}</div>
            <div className="text-[11px] text-slate-400">
              DOB: {profile.dob} • Time: {profile.tob || '09:30'}
            </div>
          </div>
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              Client Birth Place
            </div>
            <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
              {profile.pob || 'New Delhi, India'}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              Mulank (Driver): {report.clientMulank} • Bhagyank (Conductor): {report.clientBhagyank}
            </div>
          </div>
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              9-Chakra Diagnostic Scope
            </div>
            <div className="text-xs font-bold text-amber-200 mt-1">
              Earth Star (1) + 7 Core Chakras + Soul Star (9)
            </div>
            <div className="text-[11px] text-slate-400">
              194.18 Hz — 1074 Hz Pranic Resonance
            </div>
          </div>
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
              Family Members Saved
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {savedMembers.length} / {MAX_FAMILY_MEMBERS}{' '}
              <span className="text-xs font-normal text-slate-400">Members</span>
            </div>
            <div className="text-[11px] text-emerald-300">
              {savedMembers.length > 0
                ? `Collective Harmony: ${report.averageFamilyHarmony}%`
                : 'Tap "+ Add Family Member" below'}
            </div>
          </div>
        </div>

        {/* Separate Module Opt-In Checkbox + Mandatory Disclaimer Strip */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all no-print ${
                isIncludeInReport
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-950 border-rose-400/50 text-rose-200 hover:border-amber-400'
              }`}
            >
              <input
                type="checkbox"
                checked={isIncludeInReport}
                onChange={(e) => handleToggleIncludeParivarReport(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>
                {isIncludeInReport
                  ? '✓ Included in Print, PDF Download, Share & Direct WhatsApp PDF Report'
                  : 'Include Parivar Milan in Print, PDF Download, Share & Direct WhatsApp PDF'}
              </span>
            </label>
            <span className="text-[11px] font-mono text-amber-300/80">
              Includes Vedic Astrology + Gemstone + Rudraksha + 9-Chakra Family Diagnostics
            </span>
          </div>

          <div className="rounded-xl bg-amber-950/60 border border-amber-400/60 p-3 flex items-start gap-2.5 text-[11px] font-bold text-amber-200 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{PARIVAR_MILAN_DISCLAIMER}</span>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* VIEW 1: PROGRESSIVE FAMILY MEMBER FORMS (MAX 5) + SAVE & CALCULATE TAB       */}
      {/* ============================================================================ */}
      {viewPage === 'form' && (
        <div className="space-y-6">
          {/* Instructions & Status Bar */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-serif font-bold text-amber-300 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Add Family Members for 9-Chakra Parivar Milan (Maximum 5 Members)</span>
              </h3>
              <p className="text-xs text-slate-300">
                Tap <strong className="text-amber-300">+ Add Family Member</strong> to open a family member form. Fill Name, Date of Birth, Birth Time, Birth Place, and Relation with Client, then click{' '}
                <strong className="text-emerald-300">Save Family Member</strong>. After saving, you can add the next family member (up to 5) or click{' '}
                <strong className="text-amber-300">SAVE & CALCULATE</strong>.
              </p>
            </div>

            {/* + Add Family Member Button (Top) */}
            <button
              type="button"
              onClick={handleAddFamilyMemberForm}
              disabled={!canAddMoreMembers}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shrink-0 ${
                canAddMoreMembers
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {canAddMoreMembers ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add Family Member ({members.length + 1}/{MAX_FAMILY_MEMBERS})</span>
                </>
              ) : members.length >= MAX_FAMILY_MEMBERS ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Max 5 Family Members Reached</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Save Current Form to Add Next</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback / Validation Notice */}
          {formNotice && (
            <div
              className={`rounded-2xl p-4 border flex items-start gap-3 text-xs sm:text-sm font-semibold ${
                formNotice.type === 'error'
                  ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                  : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              }`}
            >
              {formNotice.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span>{formNotice.text}</span>
            </div>
          )}

          {/* Empty State if 0 forms opened yet */}
          {members.length === 0 && (
            <div className="rounded-3xl bg-slate-900/70 border-2 border-dashed border-amber-500/35 p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <UserPlus className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-xl mx-auto">
                <h4 className="text-lg font-serif font-bold text-white">
                  No Family Members Added Yet
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  Click the <strong className="text-amber-300">+ Add Family Member</strong> button below to open the form for Family Member #1 (Father, Mother, Spouse, Son, Daughter, Brother, Sister, etc.).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFamilyMemberForm}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl shadow-amber-500/20 cursor-pointer"
              >
                <UserPlus className="w-5 h-5" />
                <span>+ Add Family Member #1</span>
              </button>
            </div>
          )}

          {/* Progressive Family Member Cards (1 to Max 5) */}
          <div className="space-y-5">
            {members.map((member, idx) => {
              const isSaved = Boolean(member.isSaved);
              return (
                <div
                  key={member.id}
                  className={`rounded-2xl border-2 transition-all p-5 sm:p-6 ${
                    isSaved
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg'
                      : 'bg-slate-900 border-amber-400 shadow-2xl shadow-amber-500/10'
                  }`}
                >
                  {/* Card Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                          isSaved
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-serif font-bold text-white">
                            Family Member #{idx + 1}{' '}
                            {member.name ? `— ${member.name}` : '(Fill Details Below)'}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-[11px] font-bold">
                            {member.relation}
                          </span>
                          {isSaved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              SAVED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black">
                              OPEN FORM — CLICK SAVE AFTER FILLING
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSaved && (
                        <button
                          type="button"
                          onClick={() => handleEditMember(member.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* If Saved: Compact Summary Row */}
                  {isSaved ? (
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Family Member Name
                        </span>
                        <span className="text-white font-bold text-sm mt-0.5 block">
                          {member.name}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Relation with {profile.name}
                        </span>
                        <span className="text-amber-300 font-bold text-sm mt-0.5 block">
                          {member.relation}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Date & Time of Birth
                        </span>
                        <span className="text-emerald-300 font-mono font-bold text-xs mt-0.5 block">
                          {member.dob} • {member.tob || '09:30'}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Birth Place
                        </span>
                        <span className="text-slate-200 font-semibold text-xs mt-0.5 block truncate">
                          {member.pob || 'New Delhi, India'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* If Unsaved: Full Editable Form + Save Button */
                    <div className="pt-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* 1. Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider mb-1.5">
                            1. Family Member Full Name *
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              handleFieldChange(member.id, { name: e.target.value })
                            }
                            placeholder="Enter Full Name (e.g. Rajesh Jain)"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* 2. Relation with Client */}
                        <div>
                          <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider mb-1.5">
                            2. Relation with Client ({profile.name}) *
                          </label>
                          <select
                            value={member.relation}
                            onChange={(e) =>
                              handleFieldChange(member.id, {
                                relation: e.target.value as FamilyRelationType,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            {FAMILY_RELATION_OPTIONS.map((rel) => (
                              <option key={rel} value={rel} className="bg-slate-950 text-white">
                                {rel}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Date of Birth */}
                        <div>
                          <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider mb-1.5">
                            <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                            3. Date of Birth (D.O.B) *
                          </label>
                          <input
                            type="date"
                            value={member.dob}
                            onChange={(e) =>
                              handleFieldChange(member.id, { dob: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* 4. Birth Time */}
                        <div>
                          <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider mb-1.5">
                            <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                            4. Birth Time (AM / PM)
                          </label>
                          <BirthTimeAmPmInput
                            value={member.tob || '09:30'}
                            onChange={(newTob) =>
                              handleFieldChange(member.id, { tob: newTob })
                            }
                          />
                        </div>

                        {/* 5. Birth Place */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider mb-1.5">
                            <MapPin className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                            5. Birth Place (City / State / Country)
                          </label>
                          <CityAutocompleteInput
                            value={member.pob}
                            lat={member.lat}
                            lng={member.lng}
                            onChangeText={(cityText) =>
                              handleFieldChange(member.id, { pob: cityText })
                            }
                            onSelectCity={(sel) =>
                              handleFieldChange(member.id, {
                                pob: sel.formattedPob,
                                lat: sel.lat,
                                lng: sel.lng,
                              })
                            }
                            placeholder="Search birth city (e.g. New Delhi, Mumbai, Jaipur)..."
                          />
                        </div>
                      </div>

                      {/* Save Family Member Button inside each open form */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                        <span className="text-xs text-amber-300/90">
                          Click <strong>Save Family Member #{idx + 1}</strong> to lock this member and unlock adding the next family member.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveSingleMember(member.id, idx)}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Family Member #{idx + 1}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Progressive Action Bar: + Add Next Family Member AND Final SAVE & CALCULATE Tab */}
          {members.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-500/50 p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {members.length < MAX_FAMILY_MEMBERS && (
                  <button
                    type="button"
                    onClick={handleAddFamilyMemberForm}
                    disabled={!canAddMoreMembers}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all ${
                      canAddMoreMembers
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {canAddMoreMembers
                        ? `+ Add Family Member #${members.length + 1} (Max ${MAX_FAMILY_MEMBERS})`
                        : 'Save Open Form First to Add Next Member'}
                    </span>
                  </button>
                )}
                <span className="text-xs text-slate-300">
                  <strong>{savedMembers.length}</strong> of <strong>{MAX_FAMILY_MEMBERS}</strong> family members saved.
                </span>
              </div>

              {/* Final Tab: SAVE & CALCULATE */}
              <button
                type="button"
                onClick={handleSaveAndCalculate}
                disabled={isSavingGlobal}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-2xl shadow-emerald-500/30 hover:brightness-110 cursor-pointer transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>SAVE & CALCULATE (9-CHAKRA RESULTS)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================================ */}
      {/* VIEW 2: RESULTS PAGE — CONCLUSIVE HARMONY GRAPH & 9-CHAKRA DIAGNOSTICS       */}
      {/* ============================================================================ */}
      {viewPage === 'results' && (
        <div className="space-y-8">
          {savedMembers.length === 0 ? (
            <div className="rounded-3xl bg-slate-900 border border-amber-500/40 p-8 text-center space-y-4">
              <p className="text-sm text-amber-200 font-semibold">
                No saved family members found yet. Please add and save at least 1 family member to calculate 9-Chakra Parivar Milan.
              </p>
              <button
                type="button"
                onClick={() => setViewPage('form')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Add Family Members</span>
              </button>
            </div>
          ) : (
            <>
              {/* Top Action Bar on Results Page */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 no-print">
                <button
                  type="button"
                  onClick={() => setViewPage('form')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    Add / Edit Family Members ({savedMembers.length}/{MAX_FAMILY_MEMBERS})
                  </span>
                </button>

                <div className="text-xs text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    9-Chakra Parivar Diagnostics Calculated for {savedMembers.length} Family Member
                    {savedMembers.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* ==================================================================== */}
              {/* FINAL CONCLUSIVE RESULT: CLIENT vs FAMILY MEMBERS HARMONY GRAPH      */}
              {/* ==================================================================== */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/90 border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-widest">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>FINAL CONCLUSIVE RESULT • PARIVAR HARMONY GRAPH</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                      {profile.name}’s Mutual Harmony Graph with Each Family Member
                    </h3>
                    <p className="text-xs text-slate-300">
                      Comparative 9-Chakra alignment percentage (Earth Star + 7 Vedic Chakras + Soul Star) showing how much harmony {profile.name} shares with every saved family member.
                    </p>
                  </div>

                  {/* Collective Summary KPI Badges */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="bg-slate-950 border border-amber-500/40 rounded-2xl px-4 py-3 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                        Overall Parivar Harmony
                      </div>
                      <div className="text-2xl font-black text-emerald-400">
                        {report.averageFamilyHarmony}%
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl px-4 py-3">
                      <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                        Strongest Harmony Bond
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {report.mostHarmoniousMember
                          ? `${report.mostHarmoniousMember.name} (${report.mostHarmoniousMember.relation} • ${report.mostHarmoniousMember.score}%)`
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-rose-500/40 rounded-2xl px-4 py-3">
                      <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                        Needs Priority Remedies
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {report.mostChallengingMember
                          ? `${report.mostChallengingMember.name} (${report.mostChallengingMember.relation} • ${report.mostChallengingMember.score}%)`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical Column Chart + Horizontal Detailed Progress Bars */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left: Visual Vertical Bar Chart */}
                  <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Conclusive Harmony % Graph
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Scale: 0% — 100%
                      </span>
                    </div>

                    <div className="h-56 flex items-end justify-around gap-3 pt-6 pb-2 px-2 border-b border-l border-slate-800 relative">
                      {/* Horizontal reference lines */}
                      <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-800/70 pointer-events-none" />
                      <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-800/70 pointer-events-none" />
                      <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-800/70 pointer-events-none" />

                      {report.memberResults.map((res) => {
                        const score = res.overallHarmonyScore;
                        const barColor =
                          score >= 78
                            ? 'from-emerald-500 to-teal-300 border-emerald-300'
                            : score >= 66
                            ? 'from-amber-500 to-yellow-300 border-amber-300'
                            : score >= 54
                            ? 'from-orange-500 to-amber-400 border-orange-300'
                            : 'from-rose-600 to-orange-500 border-rose-400';

                        return (
                          <div
                            key={res.member.id}
                            onClick={() => setSelectedMemberTabId(res.member.id)}
                            className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer max-w-[72px]"
                            title={`Click to view ${res.member.name}'s 9-Chakra Diagnostics`}
                          >
                            <div className="text-xs font-black text-white mb-1.5 group-hover:scale-110 transition-transform">
                              {score}%
                            </div>
                            <div
                              style={{ height: `${Math.max(15, score)}%` }}
                              className={`w-full rounded-t-xl bg-gradient-to-t ${barColor} border-t-2 shadow-lg transition-all group-hover:brightness-110`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="flex items-start justify-around gap-2 pt-2.5">
                      {report.memberResults.map((res) => (
                        <div
                          key={res.member.id}
                          className="flex-1 text-center max-w-[80px] truncate"
                        >
                          <div className="text-[11px] font-bold text-white truncate">
                            {res.member.name}
                          </div>
                          <div className="text-[10px] text-amber-300 truncate">
                            {res.member.relation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Detailed Conclusive Harmony Breakdown per Family Member */}
                  <div className="lg:col-span-7 space-y-3.5 flex flex-col justify-center">
                    {report.memberResults.map((res, index) => {
                      const score = res.overallHarmonyScore;
                      const harmoniousCount = res.nineChakraDiagnostics.filter(
                        (c) => c.status === 'Harmonious'
                      ).length;
                      const blockedCount = 9 - harmoniousCount;
                      const badgeStyle =
                        score >= 78
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                          : score >= 66
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                          : score >= 54
                          ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
                          : 'bg-rose-500/20 border-rose-400/50 text-rose-300';

                      const barFill =
                        score >= 78
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : score >= 66
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : score >= 54
                          ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                          : 'bg-gradient-to-r from-rose-600 to-orange-500';

                      return (
                        <div
                          key={res.member.id}
                          onClick={() => setSelectedMemberTabId(res.member.id)}
                          className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all cursor-pointer"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="font-serif font-bold text-white text-sm sm:text-base">
                                {profile.name} & {res.member.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold">
                                {res.member.relation}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${badgeStyle}`}
                              >
                                {res.harmonyVerdict}
                              </span>
                              <span className="text-base sm:text-lg font-black text-white font-mono">
                                {score}%
                              </span>
                            </div>
                          </div>

                          {/* Horizontal Progress Bar */}
                          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full ${barFill}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                            <span>
                              Mulank {res.memberMulank} • Bhagyank {res.memberBhagyank} •{' '}
                              {res.memberAstrology.rashi} ({res.memberAstrology.nakshatra})
                            </span>
                            <span>
                              <strong className="text-emerald-400">
                                {harmoniousCount}/9 Chakras Harmonious
                              </strong>{' '}
                              •{' '}
                              <strong className="text-rose-400">
                                {blockedCount} Need Remedies
                              </strong>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conclusive Family Verdict + Collective Gemstone & Rudraksha + Disclaimer */}
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs sm:text-sm text-amber-100 leading-relaxed space-y-2.5">
                  <div>
                    <strong className="text-amber-300 uppercase tracking-wider">
                      Final Conclusive Parivar Synthesis ({report.familyCollectiveVerdict}):
                    </strong>
                    <p className="mt-0.5">{report.collectiveHomeVastuAndParivarRemedy}</p>
                  </div>
                  <div className="pt-2 border-t border-amber-500/25">
                    <strong className="text-emerald-300 uppercase tracking-wider">
                      Complete Family Gemstone (Ratna) &amp; Rudraksha Shield:
                    </strong>
                    <p className="mt-0.5 text-emerald-100">{report.collectiveGemstoneAndRudrakshaRemedy}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-400/60 text-[11px] font-bold text-amber-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{report.importantDisclaimer}</span>
                  </div>
                </div>
              </div>

              {/* ==================================================================== */}
              {/* MEMBER SELECTOR TABS FOR 9-CHAKRA DIAGNOSTICS                        */}
              {/* ==================================================================== */}
              <div className="flex flex-wrap items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={() => setSelectedMemberTabId('all')}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer border transition-all ${
                    selectedMemberTabId === 'all'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  Show All Family Members ({report.memberResults.length})
                </button>
                {report.memberResults.map((res, idx) => (
                  <button
                    key={res.member.id}
                    type="button"
                    onClick={() => setSelectedMemberTabId(res.member.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer border transition-all ${
                      selectedMemberTabId === res.member.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-lg'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    #{idx + 1} {res.member.name} ({res.member.relation} — {res.overallHarmonyScore}%)
                  </button>
                ))}
              </div>

              {/* ==================================================================== */}
              {/* COMPLETE 9-CHAKRA DIAGNOSTICS & REMEDIES PER FAMILY MEMBER           */}
              {/* ==================================================================== */}
              <div className="space-y-10">
                {visibleMemberResults.map((res, mIdx) => (
                  <div
                    key={res.member.id}
                    className="rounded-3xl bg-slate-900/95 border-2 border-amber-500/40 p-5 sm:p-8 shadow-2xl space-y-6"
                  >
                    {/* Member Header & Overall Summary */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase">
                            FAMILY MEMBER #{mIdx + 1} • {res.member.relation.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-bold">
                            DOB: {res.member.dob} • {res.member.tob || '09:30'} •{' '}
                            {res.member.pob || 'New Delhi'}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                          COMPLETE 9-CHAKRA PARIVAR DIAGNOSTICS: {profile.name} & {res.member.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {res.executiveSummary}
                        </p>
                      </div>

                      <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 text-center shrink-0 min-w-[170px]">
                        <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                          9-Chakra Harmony Score
                        </div>
                        <div className="text-3xl font-black text-emerald-400 my-0.5">
                          {res.overallHarmonyScore}%
                        </div>
                        <div className="text-[11px] font-bold text-amber-200">
                          {res.harmonyVerdict}
                        </div>
                      </div>
                    </div>

                    {/* Key Strengths & Frictions Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/35 p-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-300 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Key Parivar Strengths ({profile.name} & {res.member.name})</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside">
                          {res.keyStrengths.map((str, i) => (
                            <li key={i}>{str}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl bg-rose-950/30 border border-rose-500/35 p-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-300 mb-2">
                          <HeartHandshake className="w-4 h-4 text-rose-400" />
                          <span>Key Karmic Frictions & Focus Areas</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside">
                          {res.keyFrictions.map((fr, i) => (
                            <li key={i}>{fr}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Vedic Astrology Family Harmony & Gemstone + Rudraksha Complete Remedy Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* 1. Vedic Astrology Family Harmony Card */}
                      <div className="rounded-2xl bg-indigo-950/40 border border-indigo-400/40 p-4 sm:p-5 space-y-2.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-400/25 pb-2">
                          <span className="font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Vedic Astrology Family Harmony (Janma Rashi &amp; Nakshatra)</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-amber-200 font-mono font-bold">
                            {res.vedicAstrologyHarmony.rashiHarmonyScore}% Vedic Sync
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Bhakoot Rashi Axis</span>
                            <strong className="text-amber-200">{res.vedicAstrologyHarmony.bhakootAxisLabel}</strong>
                          </div>
                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Nakshatra Tara Bala</span>
                            <strong className="text-emerald-300">{res.vedicAstrologyHarmony.taraBalaName} ({res.vedicAstrologyHarmony.taraBalaFavorability})</strong>
                          </div>
                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 sm:col-span-2">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Rashi Lord Maitri &amp; Sun Polarity</span>
                            <strong className="text-sky-200">{res.vedicAstrologyHarmony.rashiLordMaitri} • {res.vedicAstrologyHarmony.sunSignSynergy}</strong>
                          </div>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{res.vedicAstrologyHarmony.vedicSummary}</p>
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/35 text-emerald-200 leading-relaxed">
                          <strong className="text-emerald-300 uppercase">Vedic Jyotish Remedy:</strong> {res.vedicAstrologyHarmony.vedicRemedy}
                        </div>
                      </div>

                      {/* 2. Gemstone (Ratna) & Rudraksha Complete Family Harmony Remedies */}
                      <div className="rounded-2xl bg-amber-950/25 border border-amber-500/40 p-4 sm:p-5 space-y-2.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 pb-2">
                          <span className="font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                            <Gem className="w-4 h-4 text-amber-400" />
                            <span>Gemstone (Ratna) &amp; Rudraksha Remedies</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 font-bold text-[10px]">
                            COMPLETE FAMILY HARMONY
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-slate-200">
                          <div>
                            <strong className="text-amber-300">Primary Gemstones:</strong> {res.gemstoneAndRudrakshaRemedy.clientGemstone} | {res.gemstoneAndRudrakshaRemedy.memberGemstone}
                          </div>
                          <div>
                            <strong className="text-sky-300">Substitutes &amp; Weight:</strong> {res.gemstoneAndRudrakshaRemedy.gemstoneSubstitute} • {res.gemstoneAndRudrakshaRemedy.weightAndCarat}
                          </div>
                          <div>
                            <strong className="text-amber-200">Metal, Finger &amp; Muhurat:</strong> {res.gemstoneAndRudrakshaRemedy.metalAndFinger} • {res.gemstoneAndRudrakshaRemedy.wearingDayAndTime}
                          </div>
                          <div>
                            <strong className="text-emerald-300">Gem Beej Mantra:</strong> {res.gemstoneAndRudrakshaRemedy.gemMantra}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/85 border border-amber-500/30 space-y-1 text-[11px] text-amber-100">
                          <div>
                            <strong className="text-amber-300">Sacred Rudraksha:</strong> {res.gemstoneAndRudrakshaRemedy.familyUnityRudraksha} | Client: {res.gemstoneAndRudrakshaRemedy.clientRudraksha} | {res.member.name}: {res.gemstoneAndRudrakshaRemedy.memberRudraksha}
                          </div>
                          <div>
                            <strong className="text-emerald-300">Wearing Method &amp; Mantra:</strong> {res.gemstoneAndRudrakshaRemedy.rudrakshaWearingMethod} ({res.gemstoneAndRudrakshaRemedy.rudrakshaMantra})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* All 9 Chakras Cards (Including 1. Earth Star & 9. Soul Star) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm sm:text-base font-serif font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                          <Compass className="w-4 h-4 text-amber-400" />
                          <span>
                            All 9 Chakras Diagnostic Breakdown (Earth Star #1 to Soul Star #9)
                          </span>
                        </h4>
                        <span className="text-xs text-slate-400">
                          Includes Client Issue, {res.member.name}’s Pattern & 3-Fold Vedic Remedies
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {res.nineChakraDiagnostics.map((ch) => {
                          const isSpecialChakra =
                            ch.chakraNumber === 1 || ch.chakraNumber === 9;
                          const statusBadge =
                            ch.status === 'Harmonious'
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                              : ch.status === 'Moderate Blockage'
                              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                              : 'bg-rose-500/20 border-rose-400/50 text-rose-300';

                          return (
                            <div
                              key={ch.chakraNumber}
                              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                                isSpecialChakra
                                  ? 'bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 border-amber-400/50 shadow-lg'
                                  : 'bg-slate-950/90 border-slate-800'
                              }`}
                            >
                              {/* Chakra Top Header */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800/90">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs bg-amber-500 text-slate-950 shadow">
                                    #{ch.chakraNumber}
                                  </span>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5 className="font-serif font-bold text-white text-sm sm:text-base">
                                        {ch.chakraName} —{' '}
                                        <span className="text-amber-300">{ch.sanskritName}</span>
                                      </h5>
                                      {ch.chakraNumber === 1 && (
                                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase">
                                          EARTH STAR • ANCESTRAL GROUNDING
                                        </span>
                                      )}
                                      {ch.chakraNumber === 9 && (
                                        <span className="px-2 py-0.5 rounded bg-violet-500/20 border border-violet-400/40 text-violet-300 text-[10px] font-black uppercase">
                                          SOUL STAR • KARMIC LINEAGE CONTRACT
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                      Location: <strong>{ch.locationLabel}</strong> • Element:{' '}
                                      <strong>{ch.element}</strong> • Aura Color:{' '}
                                      <strong>{ch.color}</strong> • Bija Mantra:{' '}
                                      <strong className="text-amber-300">{ch.beejMantra}</strong>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-3 py-1 rounded-full border text-xs font-black ${statusBadge}`}
                                  >
                                    {ch.status === 'Harmonious' && (
                                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                                    )}
                                    {ch.status === 'Moderate Blockage' && (
                                      <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                                    )}
                                    {ch.status === 'Severe Karmic Challenge' && (
                                      <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />
                                    )}
                                    {ch.status} ({ch.alignmentScore}%)
                                  </span>
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 font-semibold">
                                    Carrier: <strong className="text-amber-300">{ch.affectedPerson}</strong>
                                  </span>
                                </div>
                              </div>

                              {/* Patterns & Mutual Issue Diagnosis */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3.5 text-xs">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                                  <div className="text-[10px] uppercase font-black text-amber-400 mb-1">
                                    Client Pattern ({profile.name})
                                  </div>
                                  <p className="text-slate-200 leading-relaxed">
                                    {ch.clientPatternDetail}
                                  </p>
                                </div>

                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                                  <div className="text-[10px] uppercase font-black text-indigo-300 mb-1">
                                    {res.member.relation} Pattern ({res.member.name})
                                  </div>
                                  <p className="text-slate-200 leading-relaxed">
                                    {ch.memberPatternDetail}
                                  </p>
                                </div>

                                <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-3">
                                  <div className="text-[10px] uppercase font-black text-rose-300 mb-1">
                                    Mutual Family Issue & Diagnosis
                                  </div>
                                  <p className="text-slate-200 leading-relaxed">
                                    {ch.mutualFamilyIssue} ({ch.astrologicalDiagnosis})
                                  </p>
                                </div>
                              </div>

                              {/* Pranic Aura, Crystal, Rudraksha & Sound Frequency Strip */}
                              <div className="mt-3 px-3.5 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-[11px] text-indigo-200">
                                <span className="flex items-center gap-1.5">
                                  <Gem className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <strong>Crystal & Rudraksha:</strong> {ch.healingCrystal} •{' '}
                                  {ch.rudrakshaMukhi}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  Sound Healing: {ch.soundFrequencyHz} • {ch.beejMantra}
                                </span>
                              </div>

                              {/* 3-Column Remedies: Client Remedy, Family Member Remedy, Joint Parivar Remedy */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
                                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3">
                                  <div className="text-[10px] uppercase font-black text-emerald-300 mb-1">
                                    1. Remedy for {profile.name} (Client)
                                  </div>
                                  <p className="text-slate-200 leading-relaxed">
                                    {ch.clientRemedy}
                                  </p>
                                </div>

                                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3">
                                  <div className="text-[10px] uppercase font-black text-amber-300 mb-1">
                                    2. Remedy for {res.member.name} ({res.member.relation})
                                  </div>
                                  <p className="text-slate-200 leading-relaxed">
                                    {ch.memberRemedy}
                                  </p>
                                </div>

                                <div className="bg-indigo-950/40 border border-indigo-400/40 rounded-xl p-3">
                                  <div className="text-[10px] uppercase font-black text-indigo-200 mb-1">
                                    3. Joint Parivar Remedy (Both Together)
                                  </div>
                                  <p className="text-slate-200 leading-relaxed">
                                    {ch.jointFamilyRemedy}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
