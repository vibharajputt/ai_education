// src/modules/career-path/index.tsx
import React, { useState } from 'react';
import { CareerProfileWizard } from './components/CareerProfileWizard';
import { CareerRoadmapView } from './components/CareerRoadmapView';
import {
  DomainId,
  RoleRoadmap,
  generateCustomizedRoadmap,
} from './services/roadmapData';

export interface UserCareerProfile {
  domainId: DomainId;
  branchId: string;
  yearId: string;
  goalId: string;
  customGoalText?: string;
}

export const CareerPathModule: React.FC = () => {
  const [profile, setProfile] = useState<UserCareerProfile | null>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<RoleRoadmap | null>(null);

  const handleGenerateRoadmap = (newProfile: UserCareerProfile) => {
    setProfile(newProfile);
    const customized = generateCustomizedRoadmap(
      newProfile.domainId,
      newProfile.branchId,
      newProfile.yearId,
      newProfile.goalId,
      newProfile.customGoalText
    );
    setActiveRoadmap(customized);
  };

  const handleReset = () => {
    setActiveRoadmap(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 py-6 px-4 sm:px-6 lg:px-8">
      {!activeRoadmap || !profile ? (
        <CareerProfileWizard
          onGenerate={handleGenerateRoadmap}
          initialValues={profile || undefined}
        />
      ) : (
        <CareerRoadmapView
          roadmap={activeRoadmap}
          userProfile={profile}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
