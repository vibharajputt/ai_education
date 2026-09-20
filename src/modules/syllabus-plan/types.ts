export interface SyllabusUnit {
  id: string;
  name: string;
  subject: string;
  weightageEstimated: number;
  currentMastery: number;
  estimatedHours: number;
}

export interface StudyBlock {
  id: string;
  topic: string;
  minutes: number;
  activity: string;
  completed?: boolean;
}

export interface StudyPlanDay {
  date: string;
  dayNumber: number;
  totalMinutes: number;
  blocks: StudyBlock[];
  completedCount?: number;
}

export interface DroppedUnit {
  unit: string;
  reason: string;
}

export interface SyllabusPlanResult {
  id: string;
  goal: string;
  deadline: string;
  hoursPerDay: number;
  units: SyllabusUnit[];
  days: StudyPlanDay[];
  dropped: DroppedUnit[];
  assumptions: string[];
  riskNotes: string[];
  createdAt: number;
}
