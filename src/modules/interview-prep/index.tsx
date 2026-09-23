// src/modules/interview-prep/index.tsx
import React, { useState } from 'react';
import { RoleSetup } from './components/RoleSetup';
import { InterviewQuiz } from './components/InterviewQuiz';
import { InterviewResult } from './components/InterviewResult';
import {
  getRoleQuestions,
  ROLES,
  type TargetRole,
  type InterviewRound,
  type QuizQuestion,
} from './services/questionBank';

export function InterviewPrepModule() {
  const [step, setStep] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [selectedRole, setSelectedRole] = useState<TargetRole>('sde');
  const [customRoleTitle, setCustomRoleTitle] = useState<string | undefined>(undefined);
  const [selectedRound, setSelectedRound] = useState<InterviewRound>('full');
  const [candidateName, setCandidateName] = useState<string>('Engineering Candidate');

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<{
    answers: Record<string, number | string>;
    timeSpentSeconds: number;
  }>({ answers: {}, timeSpentSeconds: 0 });

  const roleObj = ROLES.find((r) => r.id === selectedRole);
  const roleDisplayTitle = customRoleTitle || roleObj?.title || 'Software Engineering Role';

  const roundDisplayTitle =
    selectedRound === 'full'
      ? 'Comprehensive Tech + HR Mock'
      : selectedRound === 'technical'
      ? 'Round 1: Technical Core'
      : selectedRound === 'scenario'
      ? 'Round 2: System Scenarios'
      : 'Round 3: Behavioral STAR';

  const handleStartSimulation = (config: {
    role: TargetRole;
    customRoleTitle?: string;
    round: InterviewRound;
    candidateName: string;
  }) => {
    setSelectedRole(config.role);
    setCustomRoleTitle(config.customRoleTitle);
    setSelectedRound(config.round);
    setCandidateName(config.candidateName);

    const questions = getRoleQuestions(config.role, config.round);
    setActiveQuestions(questions);
    setStep('quiz');
  };

  const handleFinishQuiz = (results: {
    answers: Record<string, number | string>;
    timeSpentSeconds: number;
  }) => {
    setQuizResults(results);
    setStep('results');
  };

  const handleRetake = () => {
    setStep('setup');
  };

  return (
    <div className="w-full min-h-full">
      {step === 'setup' && (
        <RoleSetup onStartSimulation={handleStartSimulation} />
      )}

      {step === 'quiz' && (
        <InterviewQuiz
          questions={activeQuestions}
          roleTitle={roleDisplayTitle}
          roundTitle={roundDisplayTitle}
          candidateName={candidateName}
          onFinish={handleFinishQuiz}
          onCancel={handleRetake}
        />
      )}

      {step === 'results' && (
        <InterviewResult
          questions={activeQuestions}
          answers={quizResults.answers}
          timeSpentSeconds={quizResults.timeSpentSeconds}
          roleTitle={roleDisplayTitle}
          candidateName={candidateName}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
}
