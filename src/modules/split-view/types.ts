export interface MarkingCriterion {
  criterion: string;
  marks: number;
  completed?: boolean;
}

export interface AnswerCoachData {
  markingBreakdown: MarkingCriterion[];
  requiredKeywords: string[];
  diagramNote?: string;
  commonMistakes: string[];
  examinerNote?: string;
}

export interface SplitViewExplanation {
  itemId: string;
  type: string;
  body: string;
  steps?: Array<{ label: string; body: string }>;
  keyPoints?: string[];
  markingBreakdown: MarkingCriterion[];
  diagramNote?: string;
  commonMistakes: string[];
  requiredKeywords: string[];
  examinerNote?: string;
  summary: string;
}
