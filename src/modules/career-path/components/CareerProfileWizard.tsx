// src/modules/career-path/components/CareerProfileWizard.tsx
import React, { useState } from 'react';
import {
  Compass,
  Code,
  Brain,
  Cloud,
  Cpu,
  Wrench,
  Building2,
  Briefcase,
  GraduationCap,
  Palette,
  Sparkles,
  Rocket,
  Factory,
  Globe,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle2,
  Target,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  DOMAINS,
  BRANCHES,
  YEARS,
  GOALS,
  DomainId,
} from '../services/roadmapData';

interface CareerProfileWizardProps {
  onGenerate: (profile: {
    domainId: DomainId;
    branchId: string;
    yearId: string;
    goalId: string;
    customGoalText?: string;
  }) => void;
  initialValues?: {
    domainId: DomainId;
    branchId: string;
    yearId: string;
    goalId: string;
    customGoalText?: string;
  };
}

export const CareerProfileWizard: React.FC<CareerProfileWizardProps> = ({
  onGenerate,
  initialValues,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainId>(
    initialValues?.domainId || 'swe-fullstack'
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialValues?.branchId || 'cse-it'
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    initialValues?.yearId || '3rd-year'
  );
  const [selectedGoal, setSelectedGoal] = useState<string>(
    initialValues?.goalId || 'tier1-faang'
  );
  const [customGoalText, setCustomGoalText] = useState<string>(
    initialValues?.customGoalText || ''
  );

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5 text-blue-500" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-teal-500" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-amber-500" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-rose-500" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-emerald-500" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-violet-500" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-sky-500" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-pink-500" />;
      default:
        return <Compass className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getGoalIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'Rocket':
        return <Rocket className="w-4 h-4 text-indigo-500" />;
      case 'Factory':
        return <Factory className="w-4 h-4 text-emerald-500" />;
      case 'Globe':
        return <Globe className="w-4 h-4 text-cyan-500" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'Award':
        return <Award className="w-4 h-4 text-rose-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      domainId: selectedDomain,
      branchId: selectedBranch,
      yearId: selectedYear,
      goalId: selectedGoal,
      customGoalText: customGoalText.trim(),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase border border-white/20">
              <Compass className="w-3.5 h-3.5 text-blue-200" />
              Career Navigation & Milestone Architect
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Personalized Career Pathways
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              Tell us your current domain, engineering branch, college year, and target career choice. We will synthesize a tailored step-by-step milestone roadmap, capstone project ideas, and placement strategy.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
            <div className="p-3 bg-white/20 rounded-lg">
              <Sparkles className="w-7 h-7 text-amber-300" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-white text-sm">Targeted Guidance</div>
              <div className="text-blue-100">Tailored to your background</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Step 1: Domain Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Select Your Target Career Domain
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the industry stream you want to specialize in
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOMAINS.map((domain) => {
              const isSelected = selectedDomain === domain.id;
              return (
                <button
                  type="button"
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getDomainIcon(domain.iconName)}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {domain.title}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {domain.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1">
                    {domain.recommendedFor.slice(0, 2).map((rec, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {rec}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Academic Branch & Current Year */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branch */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  Your Academic Branch / Background
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allows tailoring branch-to-target bridging strategies
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {BRANCHES.map((b) => (
                <label
                  key={b.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedBranch === b.id
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 font-medium text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="branch"
                    value={b.id}
                    checked={selectedBranch === b.id}
                    onChange={() => setSelectedBranch(b.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs md:text-sm">{b.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Year / Stage */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Current College Year / Stage
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sets the roadmap speed, milestones, and urgency
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {YEARS.map((y) => (
                <label
                  key={y.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedYear === y.id
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 font-medium text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="year"
                    value={y.id}
                    checked={selectedYear === y.id}
                    onChange={() => setSelectedYear(y.id)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-slate-300"
                  />
                  <span className="text-xs md:text-sm">{y.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Career Choice / Target Ambition */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-500" />
                Target Career Goal & Aspirations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your primary career objective
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {GOALS.map((g) => {
              const isSelected = selectedGoal === g.id;
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'border-teal-600 dark:border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 font-medium text-teal-800 dark:text-teal-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="mt-0.5">{getGoalIcon(g.icon)}</div>
                  <span className="text-xs leading-relaxed">{g.label}</span>
                </button>
              );
            })}
          </div>

          {/* Optional Custom Target Specification */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Specific Target Role or Dream Company (Optional):
            </label>
            <input
              type="text"
              value={customGoalText}
              onChange={(e) => setCustomGoalText(e.target.value)}
              placeholder="e.g. SDE-1 at Google, Generative AI Startup Founder, Automotive EV R&D Lead..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Submit / Generate Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Generate Personalized Career Roadmap</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
