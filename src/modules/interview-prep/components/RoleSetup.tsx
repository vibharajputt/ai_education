// src/modules/interview-prep/components/RoleSetup.tsx
import React, { useState } from 'react';
import { ROLES, type TargetRole, type InterviewRound } from '../services/questionBank';
import {
  Code2,
  Brain,
  Cloud,
  Cpu,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface RoleSetupProps {
  onStartSimulation: (config: {
    role: TargetRole;
    customRoleTitle?: string;
    round: InterviewRound;
    candidateName: string;
  }) => void;
}

export function RoleSetup({ onStartSimulation }: RoleSetupProps) {
  const [selectedRole, setSelectedRole] = useState<TargetRole>('sde');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [selectedRound, setSelectedRound] = useState<InterviewRound>('full');
  const [candidateName, setCandidateName] = useState('');

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5 text-blue-500" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-cyan-500" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-amber-500" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-emerald-500" />;
      default:
        return <GraduationCap className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleLaunch = () => {
    onStartSimulation({
      role: selectedRole,
      customRoleTitle: selectedRole === 'custom' ? customRoleTitle : undefined,
      round: selectedRound,
      candidateName: candidateName.trim() || 'Engineering Candidate',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/30">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
            <span>AI Mock Placement Simulator & SWOT Feedback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Role-Based Tech & HR Interview Simulator
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
            Select your target engineering profile, take an authentic section-wise assessment (Technical Core, System Scenarios & HR STAR Round), and receive an instant readiness score with SWOT matrix recommendations.
          </p>
        </div>
      </div>

      {/* Step 1: Select Target Role */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
            1
          </span>
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">
            Choose Your Target Job Profile / Stream
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.id;

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-blue-500/40 hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] group-hover:scale-105 transition-transform">
                      {getRoleIcon(r.icon)}
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-600 text-white shadow-xs">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--color-text)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                    {r.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span>Top Hiring:</span>
                  <span className="font-semibold text-[var(--color-text)] truncate max-w-[180px]">
                    {r.popularCompanies.join(', ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose Interview Sections / Round */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black">
            2
          </span>
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">
            Select Interview Format & Sections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            {
              id: 'full',
              title: 'Full Simulation',
              badge: 'RECOMMENDED',
              desc: 'Technical Core + Problem Scenarios + HR STAR Round',
              icon: <Zap className="w-4 h-4 text-amber-500" />,
            },
            {
              id: 'technical',
              title: 'Tech Core Only',
              badge: 'ROUND 1',
              desc: 'DSA, Architecture, DB & Fundamental Concepts',
              icon: <Code2 className="w-4 h-4 text-blue-500" />,
            },
            {
              id: 'scenario',
              title: 'System Scenarios',
              badge: 'ROUND 2',
              desc: 'Live Scalability, Reliability & Architecture Trade-offs',
              icon: <Layers className="w-4 h-4 text-cyan-500" />,
            },
            {
              id: 'behavioral',
              title: 'HR & STAR Round',
              badge: 'ROUND 3',
              desc: 'Conflict Resolution, Leadership & STAR Responses',
              icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
            },
          ].map((round) => {
            const isSelected = selectedRound === round.id;

            return (
              <div
                key={round.id}
                onClick={() => setSelectedRound(round.id as InterviewRound)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-500/10 border-purple-500 shadow-md ring-2 ring-purple-500/30'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {round.icon}
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                      {round.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--color-text)]">{round.title}</h4>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-snug">
                    {round.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Name & Launch Action */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
              Candidate Full Name (For Scorecard & SWOT Profile)
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:self-end">
            <button
              type="button"
              onClick={handleLaunch}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <span>Generate Section-Wise Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
