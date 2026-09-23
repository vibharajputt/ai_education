// src/modules/career-path/components/CareerRoadmapView.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Briefcase,
  TrendingUp,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Award,
  Wrench,
  ArrowLeft,
  Share2,
  Download,
  BookOpen,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  RoleRoadmap,
  DomainId,
} from '../services/roadmapData';

interface CareerRoadmapViewProps {
  roadmap: RoleRoadmap;
  userProfile: {
    domainId: DomainId;
    branchId: string;
    yearId: string;
    goalId: string;
    customGoalText?: string;
  };
  onReset: () => void;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({
  roadmap,
  userProfile,
  onReset,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'projects' | 'certifications' | 'insights'>('roadmap');
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({
    [roadmap.phases[0]?.milestones[0]?.id || '']: true,
  });

  const allMilestoneIds = roadmap.phases.flatMap((p) => p.milestones.map((m) => m.id));
  const completedCount = allMilestoneIds.filter((id) => completedMilestones[id]).length;
  const progressPercent = allMilestoneIds.length > 0 ? Math.round((completedCount / allMilestoneIds.length) * 100) : 0;

  const toggleMilestoneCompleted = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleMilestoneExpanded = (id: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExportText = () => {
    const textContent = `CAREER PATHWAY ROADMAP: ${roadmap.title}
Domain: ${roadmap.domainId} | Target: ${userProfile.customGoalText || userProfile.goalId}
Estimated Timeline: ${roadmap.estimatedMonths} Months | Salary: ${roadmap.salaryBands.entry} -> ${roadmap.salaryBands.senior}

PHASES & MILESTONES:
${roadmap.phases
  .map(
    (phase) => `\n--- Phase ${phase.phaseNumber}: ${phase.title} (${phase.durationEstimate}) ---\n` +
      phase.milestones
        .map(
          (m, idx) =>
            `${idx + 1}. ${m.title} [${m.duration}]\n   Skills: ${m.skills.join(', ')}\n   Deliverable: ${m.deliverable}\n   Pro Tip: ${m.proTip}`
        )
        .join('\n\n')
  )
  .join('\n')}

CAPSTONE PROJECTS:
${roadmap.capstoneProjects
  .map(
    (p, idx) =>
      `${idx + 1}. ${p.title} (${p.level})\n   Tech Stack: ${p.techStack.join(', ')}\n   Resume Bullet: ${p.resumeBulletExample}`
  )
  .join('\n\n')}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${roadmap.domainId}-career-roadmap.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Profile & Preferences</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export Roadmap</span>
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Switch Domain</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              Tailored Career Roadmap
            </div>

            {/* Quick Status Chips */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                Demand: {roadmap.marketDemand}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                Est: ~{roadmap.estimatedMonths} Months
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              {roadmap.title}
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
              {roadmap.tagline}
            </p>
          </div>

          {/* Salary Progression & Progress Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            {/* Entry Salary */}
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium uppercase">Entry-Level CTC</div>
              <div className="text-lg font-bold text-emerald-400">{roadmap.salaryBands.entry}</div>
              <div className="text-[10px] text-slate-400">Campus / 0-2 yrs</div>
            </div>

            {/* Mid Career */}
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium uppercase">Mid-Career CTC</div>
              <div className="text-lg font-bold text-cyan-300">{roadmap.salaryBands.mid}</div>
              <div className="text-[10px] text-slate-400">3-6 yrs Experience</div>
            </div>

            {/* Senior Career */}
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <div className="text-[11px] text-slate-400 font-medium uppercase">Senior / Staff CTC</div>
              <div className="text-lg font-bold text-purple-300">{roadmap.salaryBands.senior}</div>
              <div className="text-[10px] text-slate-400">7+ yrs / Leadership</div>
            </div>

            {/* Completion Progress Tracker */}
            <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium uppercase">Roadmap Progress</div>
                <div className="text-xs font-bold text-indigo-400">{progressPercent}%</div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 my-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                {completedCount} of {allMilestoneIds.length} milestones checked
              </div>
            </div>
          </div>

          {/* Popular Hiring Companies */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Top Hiring Companies:</span>
            {roadmap.popularCompanies.map((comp, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10 font-medium"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'roadmap'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Milestone Roadmap ({roadmap.phases.length} Phases)</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Capstone Project Ideas ({roadmap.capstoneProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'certifications'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certifications & Tech Stack</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Pro-Tips & Pitfalls</span>
        </button>
      </div>

      {/* Tab 1: Milestone Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-8 animate-fadeIn">
          {roadmap.phases.map((phase) => (
            <div
              key={phase.phaseNumber}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4"
            >
              {/* Phase Header */}
              <div className="p-5 md:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-r ${phase.gradient} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                  >
                    P{phase.phaseNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100">
                        {phase.title}
                      </h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {phase.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {phase.tagline}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Timeline: {phase.durationEstimate}</span>
                </div>
              </div>

              {/* Milestones inside Phase */}
              <div className="p-5 md:p-6 space-y-4">
                {phase.milestones.map((milestone, idx) => {
                  const isCompleted = !!completedMilestones[milestone.id];
                  const isExpanded = !!expandedMilestones[milestone.id];

                  return (
                    <div
                      key={milestone.id}
                      className={`rounded-xl border transition-all ${
                        isCompleted
                          ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      {/* Milestone Row Header */}
                      <div
                        onClick={() => toggleMilestoneExpanded(milestone.id)}
                        className="p-4 flex items-start justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={(e) => toggleMilestoneCompleted(milestone.id, e)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-sm font-bold ${
                                  isCompleted
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {idx + 1}. {milestone.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                {milestone.duration}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {milestone.description}
                            </p>
                          </div>
                        </div>

                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-fadeIn">
                          {/* Key Skills */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              Skills Mastered:
                            </span>
                            {milestone.skills.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Deliverable & Pro-Tip Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                                Hands-On Deliverable:
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {milestone.deliverable}
                              </p>
                            </div>

                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                Recruiter Pro-Tip:
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {milestone.proTip}
                              </p>
                            </div>
                          </div>

                          {/* Recommended Resources */}
                          {milestone.resources.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                                Recommended Learning Resources:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {milestone.resources.map((res, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                                  >
                                    <BookOpen className="w-3 h-3 text-indigo-500" />
                                    <span>{res.name}</span>
                                    <span className="text-[10px] opacity-70">({res.type})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Capstone Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <p className="text-xs md:text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
              Recruiters discard generic tutorial clones (like basic Todo apps). Building 1 or 2 of these high-complexity capstones will immediately differentiate your resume for Tier-1 placements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmap.capstoneProjects.map((project, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {project.level}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Project #{idx + 1}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Key Highlights & Complexity:
                    </span>
                    <ul className="space-y-1">
                      {project.keyFeatures.map((feat, fIdx) => (
                        <li
                          key={fIdx}
                          className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Tech Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ATS Resume Ready Bullet */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3" />
                    ATS Ready Resume Bullet:
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{project.resumeBulletExample}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Certifications & Tech Stack */}
      {activeTab === 'certifications' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Tools Cloud */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-500" />
              Core Industry Tools & Frameworks
            </h3>
            <div className="flex flex-wrap gap-2">
              {roadmap.keyTools.map((tool, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold"
                >
                  {tool}
                </div>
              ))}
            </div>
          </div>

          {/* Industry Certifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              High-ROI Industry Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmap.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Resume Value: {cert.valueScore}/100
                    </span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {cert.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Issued by: {cert.issuer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Insights & Pitfalls */}
      {activeTab === 'insights' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              Top 3 Critical Pitfalls to Avoid in This Pathway
            </h3>
            <div className="space-y-3">
              {roadmap.pitfallsToAvoid.map((pitfall, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{pitfall}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Steps: Direct Links to Other College Tools */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 md:p-8 text-white space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              Accelerate Your Placement Preparation
            </h3>
            <p className="text-xs md:text-sm text-indigo-200">
              Put this roadmap into action using our interactive AI assessment & resume tools:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {roadmap.nextModuleSuggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => navigate(sug.route)}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-white group-hover:text-indigo-200 flex items-center justify-between">
                  <span>{sug.title}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{sug.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
