// src/modules/stream-advisor/rubric.ts
// Documented, 100% deterministic scoring engine for Class 10 Stream Selection.
// THE AI MODEL NEVER SCORES. All logic is strictly pure functions in TypeScript.

export type StreamId =
  | 'pcm'
  | 'pcb'
  | 'commerce_math'
  | 'commerce_nomath'
  | 'humanities';

export interface StreamInfo {
  id: StreamId;
  name: string;
  shortLabel: string;
  description: string;
  subjects: string[];
  careerPaths: Array<{ title: string; route: string }>;
}

export const STREAMS_CATALOG: Record<StreamId, StreamInfo> = {
  pcm: {
    id: 'pcm',
    name: 'Science (PCM — Physics, Chemistry, Mathematics)',
    shortLabel: 'Science PCM',
    description:
      'Ideal for students with strong analytical aptitude, interest in problem-solving, engineering, computer science, physical sciences, and technology.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science / IP / PE'],
    careerPaths: [
      { title: 'B.Tech / B.E. Engineering', route: 'JEE Main / Advanced / State CETs → 4-Year B.Tech Degree' },
      { title: 'Computer Science & AI', route: 'B.Tech CS / BCA / B.Sc Data Science → Software Engineering' },
      { title: 'Architecture (B.Arch)', route: 'NATA / JEE Main Paper 2 → 5-Year Architecture Degree' },
      { title: 'Commercial Pilot / Aviation', route: 'DGCA Class 1 Medical + Flying School + CPL Certification' },
      { title: 'Pure Science Research (B.Sc / BS-MS)', route: 'NEST / IAT / CUET → IISER / NISER / IISc' },
    ],
  },
  pcb: {
    id: 'pcb',
    name: 'Science (PCB — Physics, Chemistry, Biology)',
    shortLabel: 'Science PCB',
    description:
      'Ideal for students with strong interest in life sciences, human anatomy, medical care, biotechnology, pharmacy, and environmental research.',
    subjects: ['Physics', 'Chemistry', 'Biology', 'English', 'Psychology / Biotechnology / PE'],
    careerPaths: [
      { title: 'MBBS / BDS Medical Practitioner', route: 'NEET UG Entrance Exam → 5.5 Year Medical Degree' },
      { title: 'B.Pharm / Pharm.D', route: 'NEET / Pharmacy Entrance → Pharmaceutical R&D / Clinical Pharmacy' },
      { title: 'Biotechnology & Genetics (B.Sc)', route: 'CUET / University Entrance → Biotech / Molecular Bio' },
      { title: 'Veterinary Science (B.V.Sc)', route: 'NEET / State Vet Entrance → Veterinary Hospital Practice' },
      { title: 'BAMS / BHMS / Physiotherapy (BPT)', route: 'NEET UG → AYUSH Medical Colleges / Rehabilitation' },
    ],
  },
  commerce_math: {
    id: 'commerce_math',
    name: 'Commerce with Mathematics',
    shortLabel: 'Commerce + Math',
    description:
      'Ideal for students interested in finance, economics, corporate law, quantitative trading, actuarial science, and business management.',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
    careerPaths: [
      { title: 'Chartered Accountancy (CA)', route: 'ICAI CA Foundation → Intermediate → 3-Yr Articleship → CA Final' },
      { title: 'Actuarial Science', route: 'ACET Exam (IAI) → Actuarial Professional Exams → Risk / Insurance' },
      { title: 'Investment Banking & Finance (BBA/B.Com)', route: 'CUET / IPMAT → Top B-Schools (IIM Indore/Rohtak, DU SRCC)' },
      { title: 'Corporate Law (BA LLB / B.Com LLB)', route: 'CLAT / AILET Entrance Exam → 5-Year Integrated Law' },
      { title: 'Data Analytics & FinTech', route: 'B.Sc Economics & Statistics / B.Com (Hons) + Data Certifications' },
    ],
  },
  commerce_nomath: {
    id: 'commerce_nomath',
    name: 'Commerce without Mathematics',
    shortLabel: 'Commerce (Core)',
    description:
      'Ideal for students focusing on core business, entrepreneurship, marketing, retail management, human resources, and business communication without advanced calculus.',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'Informatics Practices / PE', 'English'],
    careerPaths: [
      { title: 'Company Secretary (CS)', route: 'ICSI CSEET Entrance → Executive → Professional Certification' },
      { title: 'Business Administration (BBA / BMS)', route: 'CUET / University Entrance → BBA Degree → MBA' },
      { title: 'Digital Marketing & E-Commerce', route: 'B.Com / BBA → Digital Media & Brand Management' },
      { title: 'Hotel & Hospitality Management', route: 'NCHMCT JEE → 3-Year B.Sc Hospitality Administration' },
      { title: 'Event Management & PR', route: 'Bachelor of Mass Media (BMM) / Mass Communication' },
    ],
  },
  humanities: {
    id: 'humanities',
    name: 'Humanities & Social Sciences (Arts)',
    shortLabel: 'Humanities / Arts',
    description:
      'Ideal for students with strong interest in history, political science, literature, psychology, civil services, international relations, design, and journalism.',
    subjects: ['History', 'Political Science', 'Psychology / Sociology', 'Economics / Fine Arts', 'English'],
    careerPaths: [
      { title: 'Civil Services (UPSC IAS / IPS / IFS)', route: 'Graduation in any stream → UPSC CSE Prelims, Mains & Interview' },
      { title: 'Law & Judiciary (BA LLB)', route: 'CLAT / AILET → 5-Year Integrated National Law Universities (NLUs)' },
      { title: 'Clinical Psychology & Counselling', route: 'BA / B.Sc Psychology → MA Psychology → M.Phil / RCI License' },
      { title: 'Journalism & Mass Communication', route: 'CUET / IIMC Entrance → BJMC / Media Houses & Publishing' },
      { title: 'Design & Fine Arts (B.Des)', route: 'NID DAT / UCEED / NIFT → Industrial / Graphic / UI Design' },
    ],
  },
};

export interface OptionAnswer {
  questionId: string;
  questionIndex: number;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
  weights: Record<StreamId, number>;
}

export interface StreamAdvisorResult {
  topStream: StreamInfo;
  runnerUpStream: StreamInfo;
  confidenceBand: 'High Fit (85%+)' | 'Strong Fit (70-84%)' | 'Moderate Fit (55-69%)' | 'Exploring Match';
  scores: Record<StreamId, { rawScore: number; percentage: number }>;
  drivingAnswers: Array<{
    questionIndex: number;
    category: string;
    answerText: string;
    impact: string;
  }>;
  disclaimer: string;
}

/**
 * Pure, deterministic calculation function.
 * Given 15 question answers, calculates stream scores and returns structured recommendation.
 */
export function calculateStreamRecommendation(
  answers: OptionAnswer[]
): StreamAdvisorResult {
  const rawScores: Record<StreamId, number> = {
    pcm: 0,
    pcb: 0,
    commerce_math: 0,
    commerce_nomath: 0,
    humanities: 0,
  };

  // Max possible score for normalization
  const maxPossiblePerStream = answers.length * 4;

  answers.forEach((ans) => {
    (Object.keys(rawScores) as StreamId[]).forEach((streamKey) => {
      rawScores[streamKey] += ans.weights[streamKey] || 0;
    });
  });

  const scores: Record<StreamId, { rawScore: number; percentage: number }> = {
    pcm: { rawScore: rawScores.pcm, percentage: Math.round((rawScores.pcm / maxPossiblePerStream) * 100) },
    pcb: { rawScore: rawScores.pcb, percentage: Math.round((rawScores.pcb / maxPossiblePerStream) * 100) },
    commerce_math: { rawScore: rawScores.commerce_math, percentage: Math.round((rawScores.commerce_math / maxPossiblePerStream) * 100) },
    commerce_nomath: { rawScore: rawScores.commerce_nomath, percentage: Math.round((rawScores.commerce_nomath / maxPossiblePerStream) * 100) },
    humanities: { rawScore: rawScores.humanities, percentage: Math.round((rawScores.humanities / maxPossiblePerStream) * 100) },
  };

  // Sort streams by percentage descending
  const sortedStreams = (Object.keys(scores) as StreamId[]).sort(
    (a, b) => scores[b].percentage - scores[a].percentage
  );

  const topStreamId = sortedStreams[0];
  const runnerUpStreamId = sortedStreams[1];

  const topPct = scores[topStreamId].percentage;

  let confidenceBand: StreamAdvisorResult['confidenceBand'] = 'Exploring Match';
  if (topPct >= 75) {
    confidenceBand = 'High Fit (85%+)';
  } else if (topPct >= 60) {
    confidenceBand = 'Strong Fit (70-84%)';
  } else if (topPct >= 45) {
    confidenceBand = 'Moderate Fit (55-69%)';
  }

  // Trace driving answers specifically contributing to top stream
  const drivingAnswers = answers
    .filter((ans) => (ans.weights[topStreamId] || 0) >= 3)
    .map((ans) => ({
      questionIndex: ans.questionIndex,
      category: ans.questionId.includes('apt') ? 'Aptitude' : ans.questionId.includes('int') ? 'Interest' : 'Work-Style',
      answerText: ans.selectedOptionText,
      impact: `Contributed +${ans.weights[topStreamId]} points to ${STREAMS_CATALOG[topStreamId].shortLabel}`,
    }));

  return {
    topStream: STREAMS_CATALOG[topStreamId],
    runnerUpStream: STREAMS_CATALOG[runnerUpStreamId],
    confidenceBand,
    scores,
    drivingAnswers,
    disclaimer:
      'This assessment is a guidance tool designed to highlight your preferences and strengths. It is not a final binding decision. Discuss these recommendations with your parents, teachers, and school counsellor.',
  };
}
