// src/modules/career-path/components/CareerRoadmapDiagram.tsx
import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Zap,
  Lightbulb,
  ExternalLink,
  Target,
  Layers,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  RoleRoadmap,
  RoadmapPhase,
  MilestoneItem,
} from '../services/roadmapData';

interface CareerRoadmapDiagramProps {
  roadmap: RoleRoadmap;
  userProfile: {
    domainId: string;
    branchId: string;
    yearId: string;
    goalId: string;
    customGoalText?: string;
  };
  completedMilestones: Record<string, boolean>;
  onToggleCompleted: (id: string, e: React.MouseEvent) => void;
}

export const CareerRoadmapDiagram: React.FC<CareerRoadmapDiagramProps> = ({
  roadmap,
  userProfile,
  completedMilestones,
  onToggleCompleted,
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<RoadmapPhase | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleOpenInspector = (milestone: MilestoneItem, phase: RoadmapPhase) => {
    setSelectedMilestone(milestone);
    setSelectedPhase(phase);
  };

  const handleCloseInspector = () => {
    setSelectedMilestone(null);
    setSelectedPhase(null);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.8));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Diagram Canvas Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Interactive Visual Node Tree Diagram</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
            Click any node to inspect blueprint
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-500 w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Flowchart Diagram Board */}
      <div className="relative overflow-x-auto p-4 md:p-8 bg-slate-50/60 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner min-h-[600px] flex justify-center">
        <div
          className="transition-transform duration-200 origin-top flex flex-col items-center max-w-4xl w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* 1. START NODE */}
          <div className="flex flex-col items-center">
            <div className="relative z-10 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 border-2 border-white/20 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>START: {userProfile.branchId.toUpperCase()} Foundation Stage</span>
            </div>
            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-10 bg-gradient-to-b from-indigo-500 to-indigo-400 dark:from-indigo-400 dark:to-indigo-600 relative">
              <div className="absolute top-1/2 -left-1 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping opacity-75" />
            </div>
          </div>

          {/* 2. SEQUENTIAL PHASES & BRANCH NODES */}
          {roadmap.phases.map((phase, pIdx) => {
            const isLastPhase = pIdx === roadmap.phases.length - 1;

            return (
              <div key={phase.phaseNumber} className="w-full flex flex-col items-center">
                {/* Phase Trunk Box */}
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-500/30 shadow-md p-5 relative z-10 hover:border-indigo-500 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-r ${phase.gradient} text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0`}
                      >
                        P{phase.phaseNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                            {phase.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {phase.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-medium w-fit">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{phase.durationEstimate}</span>
                    </div>
                  </div>

                  {/* Branching Sub-Nodes Grid */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative">
                    {phase.milestones.map((milestone, mIdx) => {
                      const isCompleted = !!completedMilestones[milestone.id];

                      return (
                        <div
                          key={milestone.id}
                          onClick={() => handleOpenInspector(milestone, phase)}
                          className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                            isCompleted
                              ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 bg-slate-50/50 dark:bg-slate-850/40 hover:bg-white dark:hover:bg-slate-800/80 shadow-sm'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => onToggleCompleted(milestone.id, e)}
                                  className="text-slate-400 hover:text-emerald-500 transition-colors"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                  Node {phase.phaseNumber}.{mIdx + 1}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {milestone.duration}
                              </span>
                            </div>

                            <div
                              className={`text-xs font-bold ${
                                isCompleted
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                              }`}
                            >
                              {milestone.title}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {milestone.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {milestone.skills.slice(0, 2).map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {milestone.skills.length > 2 && (
                                <span className="text-[9px] text-slate-400">
                                  +{milestone.skills.length - 2}
                                </span>
                              )}
                            </div>

                            <div className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                              <span>Inspect</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Vertical Inter-Phase Connector */}
                <div className="w-0.5 h-12 bg-gradient-to-b from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-600 relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm ring-4 ring-white dark:ring-slate-900" />
                </div>
              </div>
            );
          })}

          {/* 3. FINAL DESTINATION TARGET NODE */}
          <div className="w-full max-w-xl">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-xl shadow-emerald-500/20 border-2 border-white/20 text-center space-y-3 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                <Target className="w-4 h-4 text-amber-300" />
                DESTINATION GOAL: {roadmap.title}
              </div>

              <h4 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {userProfile.customGoalText || 'Ready for Tier-1 Placements & High-Growth Roles'}
              </h4>

              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto pt-2">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                  <div className="text-[10px] text-emerald-200 uppercase font-semibold">
                    Expected Package
                  </div>
                  <div className="text-base font-bold text-amber-300">
                    {roadmap.salaryBands.entry}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                  <div className="text-[10px] text-teal-200 uppercase font-semibold">
                    Hiring Giants
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {roadmap.popularCompanies.slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NODE INSPECTOR MODAL / DRAWER */}
      {selectedMilestone && selectedPhase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Phase {selectedPhase.phaseNumber}: {selectedPhase.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedMilestone.duration}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {selectedMilestone.title}
                </h3>
              </div>

              <button
                onClick={handleCloseInspector}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedMilestone.description}
            </p>

            {/* Skills Mastered */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Core Competencies & Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedMilestone.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Deliverable Blueprint & Recruiter Tip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Tangible Deliverable:
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedMilestone.deliverable}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Recruiter Pro-Tip:
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedMilestone.proTip}
                </p>
              </div>
            </div>

            {/* Curated Resources */}
            {selectedMilestone.resources.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Recommended Resources & Guides:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedMilestone.resources.map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {res.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        {res.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={(e) => {
                  onToggleCompleted(selectedMilestone.id, e);
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  completedMilestones[selectedMilestone.id]
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200'
                }`}
              >
                {completedMilestones[selectedMilestone.id] ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Completed!</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCloseInspector}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
