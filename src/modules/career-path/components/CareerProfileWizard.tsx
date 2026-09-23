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
  ArrowLeft,
  CheckCircle2,
  Target,
  UserCheck,
  Calendar,
  Layers,
  Check,
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
  const [currentStep, setCurrentStep] = useState<number>(1);
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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = () => {
    onGenerate({
      domainId: selectedDomain,
      branchId: selectedBranch,
      yearId: selectedYear,
      goalId: selectedGoal,
      customGoalText: customGoalText.trim(),
    });
  };

  const selectedDomainObj = DOMAINS.find((d) => d.id === selectedDomain);
  const selectedBranchObj = BRANCHES.find((b) => b.id === selectedBranch);
  const selectedYearObj = YEARS.find((y) => y.id === selectedYear);
  const selectedGoalObj = GOALS.find((g) => g.id === selectedGoal);

  const stepsList = [
    { num: 1, title: 'Domain Choice', subtitle: 'Target Industry' },
    { num: 2, title: 'Branch', subtitle: 'Academic Background' },
    { num: 3, title: 'College Year', subtitle: 'Preparation Stage' },
    { num: 4, title: 'Career Goal', subtitle: 'Target Company' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase border border-white/20">
              <Compass className="w-3.5 h-3.5 text-blue-200" />
              Interactive Step-by-Step Navigator
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Career Pathways Roadmap Planner
            </h1>
            <p className="text-blue-100 text-xs md:text-sm max-w-2xl leading-relaxed">
              Answer 4 quick questions about your domain, branch, year, and choice to generate your personalized career milestone roadmap.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
            <div className="text-right">
              <div className="text-[11px] text-blue-200 font-medium">Wizard Progress</div>
              <div className="text-sm font-bold text-white">Step {currentStep} of 4</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm">
              {Math.round((currentStep / 4) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Step Navigator Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stepsList.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-3 ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-600 dark:border-indigo-500 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 hover:bg-slate-50'
                    : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-bold truncate ${
                      isCurrent
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : isCompleted
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{step.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content Containers */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {/* STEP 1: Select Domain */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Step 1: Choose Your Target Career Domain
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select the engineering & tech stream you want to master
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {DOMAINS.map((domain) => {
                const isSelected = selectedDomain === domain.id;
                return (
                  <button
                    type="button"
                    key={domain.id}
                    onClick={() => {
                      setSelectedDomain(domain.id);
                    }}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20'
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
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
        )}

        {/* STEP 2: Select Branch */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  Step 2: What is Your Academic Branch / Degree?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selected Domain: <strong className="text-indigo-600">{selectedDomainObj?.title}</strong>. This allows us to customize branch-to-target bridge strategies.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {BRANCHES.map((b) => (
                <label
                  key={b.id}
                  className={`flex items-center gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedBranch === b.id
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 font-semibold text-blue-800 dark:text-blue-200 shadow-sm'
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
                  <div className="text-sm">{b.label}</div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Select Year */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Step 3: What is Your Current College Year / Stage?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This sets the timeline pace (e.g. 1st year foundational vs 4th year urgent placement sprint).
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {YEARS.map((y) => (
                <label
                  key={y.id}
                  className={`flex items-center gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedYear === y.id
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 font-semibold text-purple-800 dark:text-purple-200 shadow-sm'
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
                  <div className="text-sm">{y.label}</div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Select Goal & Generate */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-teal-500" />
                  Step 4: Target Career Choice & Dream Companies
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your primary career ambition to tailor salary bands and capstone project blueprints
                </p>
              </div>
            </div>

            {/* Selected Profile Summary Chips */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Your Profile:</span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                Domain: {selectedDomainObj?.title}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                Branch: {selectedBranchObj?.label.split('/')[0]}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                Stage: {selectedYearObj?.label.split('(')[0]}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GOALS.map((g) => {
                const isSelected = selectedGoal === g.id;
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-teal-600 dark:border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 font-semibold text-teal-900 dark:text-teal-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">{getGoalIcon(g.icon)}</div>
                    <span className="text-xs md:text-sm leading-relaxed">{g.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional Custom Target Specification */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Specific Dream Company or Role (Optional):
              </label>
              <input
                type="text"
                value={customGoalText}
                onChange={(e) => setCustomGoalText(e.target.value)}
                placeholder="e.g. Google SDE-1, Ather Energy EV Powertrain, ISRO Scientist-SC..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-sm md:text-base shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <span>Generate Personalized Roadmap</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
