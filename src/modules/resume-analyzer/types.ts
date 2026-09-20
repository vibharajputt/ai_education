export interface ResumeFinding {
  severity: 'high' | 'medium' | 'low' | 'info';
  location: string;
  issue: string;
  suggestion: string;
}

export interface ResumeRewrite {
  original: string;
  improved: string;
  why: string;
}

export interface ResumeSectionStructure {
  section: string;
  wordCount?: number;
  summary: string;
}

export interface ResumeFactorScore {
  name: string;
  score: number;
  description: string;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  scores: {
    parseability?: number;
    keywords?: number;
    structure?: number;
    quantification?: number;
    length?: number;
    impact?: number;
    technicalDepth?: number;
    ATSScore?: number;
    [key: string]: number | undefined;
  };
  factorBreakdown: ResumeFactorScore[];
  structure: ResumeSectionStructure[];
  findings: ResumeFinding[];
  rewrites: ResumeRewrite[];
  extractedEntities: string[];
  missingKeywords?: string[];
  suggestedProjects?: Array<{
    title: string;
    description: string;
    skillsTargeted: string[];
  }>;
  jobDescriptionMatched?: boolean;
}
